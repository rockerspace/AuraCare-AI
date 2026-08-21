const fs = require('fs');

const verifyOtpCode = `import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key');

export async function POST(req) {
  try {
    const { code, hash, phone } = await req.json();

    if (!code || !hash) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Decode the hash to verify (In production, use JWT or bcrypt against DB)
    const expectedCode = Buffer.from(hash, 'base64').toString('ascii').split('-')[0];

    if (code === expectedCode) {
      // Issue a secure JWT session
      const token = await new SignJWT({ phone, facilityId: 1 })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

      const response = NextResponse.json({ success: true, message: "Authentication successful" });
      response.cookies.set('mvp_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      return response;
    } else {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 401 });
    }

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
`;

fs.writeFileSync('src/app/api/auth/verify-otp/route.ts', verifyOtpCode);

const proxyCode = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key');

// HIPAA Audit Logger Middleware (now Proxy)
export async function proxy(request: NextRequest) {
  // Phase 2: Security & Authentication Setup
  const url = request.nextUrl.pathname;
  
  // Example of capturing access to sensitive routes for HIPAA audit logging
  if (url.startsWith('/api/patients') || url.startsWith('/api/alerts')) {
    const timestamp = new Date().toISOString();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // In production, this goes to GCP Cloud Audit Logs
    console.log(\`[HIPAA AUDIT] PHI Access Attempt: \${url} at \${timestamp} from IP: \${ip} Agent: \${userAgent}\`);
    
    // Secure JWT auth check
    const sessionToken = request.cookies.get('mvp_session')?.value;
    
    if (!sessionToken && process.env.NODE_ENV === 'production') {
      console.warn(\`[HIPAA AUDIT] Unauthorized PHI access attempt blocked (No Token): \${url}\`);
      return NextResponse.json({ error: 'Unauthorized. Secure session required.' }, { status: 401 });
    }

    if (sessionToken) {
      try {
        const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
        
        // Pass the decoded facilityId to the downstream API routes
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-facility-id', payload.facilityId.toString());

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } catch (err) {
        console.warn(\`[HIPAA AUDIT] Unauthorized PHI access attempt blocked (Invalid Token): \${url}\`);
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
`;
fs.writeFileSync('src/proxy.ts', proxyCode);

const patientsApiCode = `import { NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, vitalsLog } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const facilityIdHeader = req.headers.get('x-facility-id');
    const userFacilityId = facilityIdHeader ? parseInt(facilityIdHeader, 10) : 1; // Default to 1 if missing for local dev

    // Filter patients by facilityId to enforce multi-tenancy
    const allPatients = await db.select().from(patients).where(eq(patients.facilityId, userFacilityId));

    const patientsWithVitals = await Promise.all(
      allPatients.map(async (patient) => {
        const latestVitals = await db
          .select()
          .from(vitalsLog)
          .where(eq(vitalsLog.patientId, patient.id))
          .orderBy(desc(vitalsLog.timestamp))
          .limit(1);

        const initials = patient.encryptedName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
        
        let lastActive = 'Unknown';
        if (latestVitals.length > 0 && latestVitals[0].timestamp) {
           const diff = Date.now() - new Date(latestVitals[0].timestamp).getTime();
           const mins = Math.floor(diff / 60000);
           if (mins < 1) lastActive = 'Just now';
           else if (mins < 60) lastActive = \`\${mins}m ago\`;
           else lastActive = \`\${Math.floor(mins/60)}h ago\`;
        } else {
           lastActive = 'Just now'; // Default for new patients without vitals
        }
        
        let status = patient.status;
        if (status === 'stable') status = 'Stable';
        else if (status === 'review') status = 'Review';
        else if (status === 'critical') status = 'Critical';
        else status = status.charAt(0).toUpperCase() + status.slice(1);

        return {
          id: patient.id.toString(),
          name: patient.encryptedName,
          age: patient.age.toString(),
          status,
          room: patient.room || undefined,
          initials,
          image: initials,
          lastActive,
          vitals: latestVitals.length > 0 ? {
            hr: latestVitals[0].heartRate || '--',
            o2: latestVitals[0].spo2 || '--',
            temp: latestVitals[0].temp || '--'
          } : {
            hr: '--',
            o2: '--',
            temp: '--'
          }
        };
      })
    );

    return NextResponse.json(patientsWithVitals);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
`;
fs.writeFileSync('src/app/api/patients/route.ts', patientsApiCode);

console.log("Patched successfully!");
