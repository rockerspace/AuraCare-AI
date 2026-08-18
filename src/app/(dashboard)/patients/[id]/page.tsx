import React from 'react';

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="text-white font-outfit">
      <h2 className="text-3xl font-bold mb-4">Patient Profile: {(await params).id}</h2>
      <p className="text-neutral-200">This is a placeholder for the patient profile.</p>
    </div>
  );
}
