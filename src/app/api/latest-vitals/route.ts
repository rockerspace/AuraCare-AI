import { NextResponse } from 'next/server';
import { globalCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (globalCache.latestPatientData) {
    return NextResponse.json({ success: true, data: globalCache.latestPatientData }, { status: 200 });
  } else {
    return NextResponse.json({ success: false, error: 'No data yet' }, { status: 404 });
  }
}
