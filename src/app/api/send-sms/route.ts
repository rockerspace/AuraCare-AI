import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: Request) {
  try {
    const { phone, patientName, status } = await request.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioNumber) {
      // For pitch mode, if Twilio isn't set up yet, return a mock success
      console.log(`[PITCH DEMO MODE] Would have sent SMS to ${phone} about ${patientName}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Mock SMS sent successfully (Add Twilio credentials to .env to send real SMS)',
        demoMode: true
      });
    }

    const client = twilio(accountSid, authToken);
    
    let messageBody = `MVP VRN Update: ${patientName} is currently ${status}. Vitals are being monitored.`;
    if (status === 'Critical') {
      messageBody = `URGENT MVP VRN Alert: ${patientName}'s vitals have dropped to Critical status. Caregivers have been notified.`;
    }

    const message = await client.messages.create({
      body: messageBody,
      from: twilioNumber,
      to: phone
    });

    return NextResponse.json({ success: true, messageId: message.sid });

  } catch (error: unknown) {
    console.error('Error sending SMS:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
