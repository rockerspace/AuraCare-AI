import { NextResponse } from 'next/server';
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
           else if (mins < 60) lastActive = `${mins}m ago`;
           else lastActive = `${Math.floor(mins/60)}h ago`;
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


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, age, status, room } = body;
    
    if (!name || !age) {
      return NextResponse.json({ error: 'Name and age are required' }, { status: 400 });
    }

    const facilityIdHeader = req.headers.get('x-facility-id');
    const facilityId = facilityIdHeader ? parseInt(facilityIdHeader, 10) : 1;

    // Insert into Drizzle DB
    const newPatient = await db.insert(patients).values({
      facilityId,
      encryptedName: name,
      age: parseInt(age, 10),
      status: status.toLowerCase(),
      room: room || null,
      createdAt: new Date(),
    }).returning();

    return NextResponse.json(newPatient[0], { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
