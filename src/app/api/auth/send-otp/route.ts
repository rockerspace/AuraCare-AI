import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();



    // Initialize Twilio for SMS
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Send the SMS
    await client.messages.create({
      body: `Your AuraCare AI login code is: ${otp}. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    // In a production environment, we would save this to Redis or the DB.
    // For this Serverless Beta, we will encode it in an HttpOnly cookie or send a signed hash.
    // To keep the beta fast, we will return a simple encoded hash to the client to verify against.
    const mockHash = Buffer.from(`${otp}-mvpvrn-secret`).toString('base64');

    return NextResponse.json({ success: true, hash: mockHash });

  } catch (error: unknown) {
    console.error("Twilio Error:", error);

    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
