import { NextResponse } from 'next/server';
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
    console.log(`[HIPAA AUDIT] PHI Access Attempt: ${url} at ${timestamp} from IP: ${ip} Agent: ${userAgent}`);
    
    // Secure JWT auth check
    const sessionToken = request.cookies.get('mvp_session')?.value;
    
    if (!sessionToken && process.env.NODE_ENV === 'production') {
      console.warn(`[HIPAA AUDIT] Unauthorized PHI access attempt blocked (No Token): ${url}`);
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
        console.warn(`[HIPAA AUDIT] Unauthorized PHI access attempt blocked (Invalid Token): ${url}`);
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
