import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key');

export async function POST(req: Request) {
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
