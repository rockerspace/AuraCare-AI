import React from 'react';

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="text-white font-outfit">
      <h2 className="text-3xl font-bold mb-4">Patient Profile: {params.id}</h2>
      <p className="text-neutral-200">This is a placeholder for the patient profile.</p>
    </div>
  );
}
