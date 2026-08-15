"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertsPage() {
  const [filter, setFilter] = useState('active');
  const [alerts, setAlerts] = useState([
    { 
      id: 1, 
      patient: 'Robert Smith', 
      room: '102', 
      type: 'critical', 
      title: 'Sudden SpO2 Drop', 
      description: 'Blood oxygen dropped from 98% to 89% over a 2-minute window.', 
      time: 'Just now', 
      status: 'active' 
    },
    { 
      id: 2, 
      patient: 'Jane Doe', 
      room: '101', 
      type: 'warning', 
      title: 'Elevated Heart Rate', 
      description: 'Heart rate sustained above 110 bpm for 15 minutes.', 
      time: '43 mins ago', 
      status: 'active' 
    },
    { 
      id: 3, 
      patient: 'William Brown', 
      room: '106', 
      type: 'system', 
      title: 'Device Disconnected', 
      description: 'Apple Watch Series 8 lost Bluetooth connection.', 
      time: '2 hours ago', 
      status: 'acknowledged' 
    },
  ]);

  const handleAcknowledge = (id: number) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="font-outfit h-full flex flex-col max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-4xl font-bold tracking-tight drop-shadow-lg text-white flex items-center gap-4">
            Active Alerts 
            {alerts.filter(a => a.status === 'active').length > 0 && (
              <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                {alerts.filter(a => a.status === 'active').length}
              </span>
            )}
          </h2>
          <p className="text-neutral-200 mt-2">AI-detected anomalies requiring immediate triage.</p>
        </motion.div>
        
        <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 backdrop-blur-md">
          <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${filter === 'active' ? 'bg-red-500/20 text-red-400 shadow-lg' : 'text-neutral-300 hover:text-white'}`}>
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Action Required
          </button>
          <button onClick={() => setFilter('acknowledged')} className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${filter === 'acknowledged' ? 'bg-white/10 text-white shadow-lg' : 'text-neutral-300 hover:text-white'}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Resolved
          </button>
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-white/10 text-white shadow-lg' : 'text-neutral-300 hover:text-white'}`}>All</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 pb-10">
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-12 border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center bg-black/20"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Alerts</h3>
              <p className="text-neutral-200 text-center">All patients are stable. Excellent work.</p>
            </motion.div>
          ) : (
            filteredAlerts.map(alert => (
              <motion.div 
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 rounded-2xl border transition-all ${
                  alert.status === 'acknowledged' ? 'bg-black/40 border-white/5 opacity-60' :
                  alert.type === 'critical' ? 'bg-red-950/40 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]' :
                  alert.type === 'warning' ? 'bg-amber-950/40 border-amber-500/30' :
                  'bg-black/60 border-white/10'
                } backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6`}
              >
                <div className="flex gap-4">
                  <div className="mt-1">
                    {alert.type === 'critical' && <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>}
                    {alert.type === 'warning' && <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>}
                    {alert.type === 'system' && <div className="w-10 h-10 bg-neutral-500/20 text-neutral-200 rounded-full flex items-center justify-center"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"></path></svg></div>}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white">{alert.title}</h3>
                      <span className="text-xs text-neutral-300">{alert.time}</span>
                    </div>
                    <p className="text-sm text-neutral-300 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="text-white bg-white/10 px-2 py-1 rounded">Patient: {alert.patient}</span>
                      <span className="text-white bg-white/10 px-2 py-1 rounded">Room {alert.room}</span>
                    </div>
                  </div>
                </div>

                {alert.status === 'active' && (
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 border-t border-white/5 pt-4 md:pt-0 md:border-0 md:border-l md:pl-6">
                    <button 
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold transition text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      Acknowledge
                    </button>
                    <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition text-sm">
                      Dispatch Nurse
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
