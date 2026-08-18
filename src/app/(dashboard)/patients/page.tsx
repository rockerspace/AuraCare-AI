"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Pusher from 'pusher-js';

interface Patient {
  id: string | number;
  name: string;
  age: string | number;
  status: string;
  room?: string;
  initials?: string;
  lastActive?: string;
  image?: string;
  vitals?: {
    hr: number | string;
    o2: number | string;
    temp: number | string;
  };
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('/api/patients');
        if (res.ok) {
          const data: any = await res.json();
          setPatients(data);
        }
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      }
    };

    fetchPatients();
    
    // Initialize Pusher for real-time updates
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    });

    const channel = pusher.subscribe('patients-channel');
    channel.bind('vitals-update', (data: unknown) => {
      setPatients(prevPatients => {
        return prevPatients.map(p => {
          if (p.id.toString() === data.patientId.toString()) {
            return {
              ...p,
              status: data.isCritical ? 'Critical' : p.status,
              vitals: { hr: data.heartRate, o2: data.spo2, temp: data.temp }
            };
          }
          return p;
        });
      });
    });

    return () => {
      pusher.unsubscribe('patients-channel');
    };
  }, []);

  // Form State
  const [newPatient, setNewPatient] = useState({ name: '', age: '', status: 'Stable' });

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name) return;
    
    const initials = newPatient.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const patientObj = {
      id: `p_${Date.now()}`,
      name: newPatient.name,
      age: parseInt(newPatient.age) || 0,
      status: newPatient.status,
      lastActive: 'Just now',
      image: initials,
      vitals: { hr: '--', o2: '--', temp: '--' }
    };
    
    setPatients([...patients, patientObj]);
    setIsModalOpen(false);
    setNewPatient({ name: '', age: '', status: 'Stable' });
  };

  const handleSmsDemo = async (patientName: string = "Demo Patient", status: string = "Stable") => {
    try {
      const targetPhone = window.prompt("Enter the phone number to text (e.g. +1234567890):", "+1");
      if (!targetPhone) return;
      
      alert(`Sending AI Summary SMS to ${targetPhone}...`);
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetPhone, patientName, status })
      });
      const data: any = await res.json();
      if(data.success) {
        alert("✅ AI SMS Sent successfully to " + targetPhone);
      } else {
        alert("❌ Failed to send SMS: " + data.error);
      }
    } catch (e) {
      alert("Error sending SMS");
    }
  };

  return (
    <div className="font-outfit relative">
      {/* Add Patient Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-4">Add New Patient</h3>
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-200 block mb-1">Full Name</label>
                  <input type="text" required value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="text-sm text-neutral-200 block mb-1">Age</label>
                  <input type="number" required value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. 78" />
                </div>
                <div>
                  <label className="text-sm text-neutral-200 block mb-1">Initial Status</label>
                  <select value={newPatient.status} onChange={e => setNewPatient({...newPatient, status: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500">
                    <option value="Stable">Stable</option>
                    <option value="Review">Needs Review</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition">Save Patient</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-center mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-4xl font-bold tracking-tight drop-shadow-lg text-white">Live Vitals</h2>
        </motion.div>
        <div className="flex gap-4">
          <button 
            onClick={() => handleSmsDemo("Facility Overview", "Stable")}
            className="px-5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 backdrop-blur-md rounded-full text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-300 flex items-center gap-2"
          >
            <span>💬</span> Trigger Demo SMS
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full text-sm font-semibold transition-all duration-300 shadow-lg text-white flex items-center gap-2"
          >
            <span>+</span> Add Patient
          </button>
        </div>
      </header>

      {patients.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center justify-center p-20 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl border-dashed"
        >
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Patients Monitored</h3>
          <p className="text-neutral-200 text-center max-w-md mb-8">
            Your facility workspace is empty. Add a patient and connect a wearable device to begin proactive AI monitoring.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            + Add First Patient
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {patients.map((patient) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={patient.id} 
                className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden group hover:border-white/30 hover:bg-black/50 transition-all shadow-xl flex flex-col"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${patient.status === 'Critical' ? 'from-red-500 to-rose-600' : patient.status === 'Review' ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500'} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-medium text-white border border-white/20">
                    {patient.image}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{patient.name}</h3>
                    <p className="text-sm text-neutral-200">Age: {patient.age}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-6 relative z-10 text-sm">
                  <span className="text-neutral-200">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${patient.status === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : patient.status === 'Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {patient.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-4 relative z-10 text-sm">
                  <span className="text-neutral-200">Last Active</span>
                  <span className="text-neutral-200">{patient.lastActive}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6 relative z-10 text-center bg-black/20 rounded-xl p-3 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-300 mb-1">Heart</span>
                    <span className="font-mono font-medium text-sm text-white">{patient.vitals?.hr} <span className="text-[10px] text-neutral-600">bpm</span></span>
                  </div>
                  <div className="flex flex-col border-l border-r border-white/5">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-300 mb-1">SpO2</span>
                    <span className="font-mono font-medium text-sm text-white">{patient.vitals?.o2}<span className="text-[10px] text-neutral-600">%</span></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-300 mb-1">Temp</span>
                    <span className="font-mono font-medium text-sm text-white">{patient.vitals?.temp}°<span className="text-[10px] text-neutral-600">F</span></span>
                  </div>
                </div>
                
                <div className="mt-auto relative z-10 flex gap-2">
                  <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors text-white">
                    Full Profile
                  </button>
                  <button onClick={() => handleSmsDemo(patient.name, patient.status)} className="w-12 flex items-center justify-center bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 rounded-xl transition-colors">
                    💬
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
