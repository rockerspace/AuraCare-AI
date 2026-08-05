import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// HIPAA Audit Logger Middleware (now Proxy)
export function proxy(request: NextRequest) {
  // Phase 2: Security & Authentication Setup
  const url = request.nextUrl.pathname;
  
  // Example of capturing access to sensitive routes for HIPAA audit logging
  if (url.startsWith('/api/patients') || url.startsWith('/api/alerts')) {
    const timestamp = new Date().toISOString();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // In production, this goes to GCP Cloud Audit Logs
    console.log(`[HIPAA AUDIT] PHI Access Attempt: ${url} at ${timestamp} from IP: ${ip} Agent: ${userAgent}`);
    
    // Basic auth check simulation
    const authHeader = request.headers.get('authorization');
    if (!authHeader && process.env.NODE_ENV === 'production') {
      console.warn(`[HIPAA AUDIT] Unauthorized PHI access attempt blocked: ${url}`);
      return NextResponse.json({ error: 'Unauthorized. Enkrypt session required.' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
