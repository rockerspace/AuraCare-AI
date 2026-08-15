"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoomViewPage() {
  const [filter, setFilter] = useState('all');

  const rooms = [
    { id: '101', type: 'Private', status: 'occupied', patient: 'Jane Doe', condition: 'stable', temp: '72°F' },
    { id: '102', type: 'Private', status: 'occupied', patient: 'Robert Smith', condition: 'critical', temp: '73°F' },
    { id: '103', type: 'Semi-Private', status: 'empty', patient: null, condition: null, temp: '68°F' },
    { id: '104', type: 'Private', status: 'occupied', patient: 'Mary Johnson', condition: 'review', temp: '71°F' },
    { id: '105', type: 'Semi-Private', status: 'cleaning', patient: null, condition: null, temp: '70°F' },
    { id: '106', type: 'Private', status: 'occupied', patient: 'William Brown', condition: 'stable', temp: '72°F' },
    { id: '107', type: 'Private', status: 'occupied', patient: 'Elizabeth Taylor', condition: 'stable', temp: '74°F' },
    { id: '108', type: 'Private', status: 'empty', patient: null, condition: null, temp: '69°F' },
  ];

  const filteredRooms = rooms.filter(room => {
    if (filter === 'all') return true;
    if (filter === 'alerts' && (room.condition === 'critical' || room.condition === 'review')) return true;
    if (filter === 'empty' && room.status === 'empty') return true;
    return false;
  });

  return (
    <div className="font-outfit h-full flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-4xl font-bold tracking-tight drop-shadow-lg text-white">Facility Floor Plan</h2>
          <p className="text-neutral-200 mt-2">Nurses Station Command Center: Monitor physical room occupancy and environmental conditions.</p>
        </motion.div>
        
        <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 backdrop-blur-md">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-white/10 text-white shadow-lg' : 'text-neutral-300 hover:text-white'}`}>All Rooms</button>
          <button onClick={() => setFilter('alerts')} className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${filter === 'alerts' ? 'bg-red-500/20 text-red-400 shadow-lg' : 'text-neutral-300 hover:text-white'}`}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Alerts
          </button>
          <button onClick={() => setFilter('empty')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'empty' ? 'bg-white/10 text-white shadow-lg' : 'text-neutral-300 hover:text-white'}`}>Empty</button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredRooms.map((room) => (
            <motion.div 
              key={room.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden rounded-3xl p-6 border transition-all ${
                room.status === 'empty' ? 'bg-black/20 border-white/5 border-dashed' :
                room.condition === 'critical' ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' :
                room.condition === 'review' ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' :
                'bg-black/40 border-white/10 hover:bg-black/50 hover:border-white/20'
              } backdrop-blur-xl group flex flex-col`}
            >
              {room.condition === 'critical' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
              )}

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Room {room.id}</h3>
                  <span className="text-xs text-neutral-300 uppercase tracking-wider">{room.type}</span>
                </div>
                {room.status === 'occupied' ? (
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${
                    room.condition === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                    room.condition === 'review' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  }`}>
                    {room.condition}
                  </span>
                ) : (
                  <span className="px-2 py-1 text-[10px] font-bold uppercase rounded border bg-neutral-800 text-neutral-200 border-neutral-700">
                    {room.status}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-center relative z-10 my-4">
                {room.status === 'occupied' ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-white border border-white/20">
                      {room.patient?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm text-neutral-200">Patient</div>
                      <div className="font-bold text-white text-lg">{room.patient}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 opacity-50">
                    <svg className="w-8 h-8 text-neutral-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    <span className="text-sm font-medium text-neutral-300">Ready for Admission</span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2 text-xs text-neutral-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                  Temp: {room.temp}
                </div>
                <button className={`text-xs font-bold transition ${room.status === 'occupied' ? 'text-emerald-400 hover:text-emerald-300' : 'text-neutral-300 hover:text-white'}`}>
                  {room.status === 'occupied' ? 'View Camera' : 'Assign Room'}
                </button>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
