import { NextResponse } from 'next/server';
import { db } from '@/db';
import { messages, patients } from '@/db/schema';
import { eq } from 'drizzle-orm';
import twilio from 'twilio';

// Twilio hits this URL as form-urlencoded data, not JSON.
export async function POST(req: Request) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const twilioSignature = req.headers.get('x-twilio-signature');
    const url = req.url;

    // Convert URLSearchParams to a plain object
    const paramsObject = Object.fromEntries(params.entries());

    // Validate the request
    if (!twilioSignature || !twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN || '', twilioSignature, url, paramsObject)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fromPhone = params.get('From'); // e.g. +1234567890
    const body = params.get('Body'); // The actual text message

    if (!fromPhone || !body) {
      return NextResponse.json({ error: "Missing Twilio parameters" }, { status: 400 });
    }

    // 1. Identify the Patient based on the incoming phone number
    // (This requires the DB to be active. For now we mock the subagent logic)
    console.log(`[COMMUNICATIONS SUBAGENT] Received incoming SMS from ${fromPhone}: "${body}"`);

    /*
    const patientMatch = await db.query.patients.findFirst({
      where: eq(patients.emergencyContactPhone, fromPhone)
    });

    if (patientMatch) {
      await db.insert(messages).values({
        patientId: patientMatch.id,
        senderName: patientMatch.emergencyContactName || 'Family Member',
        senderPhone: fromPhone,
        direction: 'inbound',
        content: body,
      });
      console.log(`[COMMUNICATIONS SUBAGENT] Logged message to database for patient ${patientMatch.id}.`);
    } else {
      console.log(`[COMMUNICATIONS SUBAGENT] Unrecognized phone number ${fromPhone}. Message ignored.`);
    }
    */

    // 2. Return empty TwiML so Twilio doesn't reply with an error to the sender
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error("Twilio Webhook Error:", error);
    return NextResponse.json({ error: "Webhook parsing failed" }, { status: 500 });
  }
}
