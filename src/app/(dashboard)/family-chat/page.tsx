"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function FamilyChatPage() {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  // Starting empty for real SaaS look
  const [contacts, setContacts] = useState<any[]>([]);

  return (
    <div className="font-outfit h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-4xl font-bold tracking-tight drop-shadow-lg text-white">Family Communication</h2>
          <p className="text-neutral-400 mt-2">Manage AI automated SMS updates and reply directly to family members.</p>
        </motion.div>
        
        <button 
          onClick={() => alert("Syncing with Twilio Webhook...")}
          className="px-5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 backdrop-blur-md rounded-full text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-300 flex items-center gap-2"
        >
          <span>🔄</span> Sync Real-Time SMS
        </button>
      </header>

      <div className="flex-1 flex bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {contacts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full flex flex-col items-center justify-center p-20 border-dashed border border-white/5 m-4 rounded-2xl bg-black/20"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Family Contacts Linked</h3>
            <p className="text-neutral-400 text-center max-w-md mb-8">
              Your communications inbox is empty. Once you add a patient and assign an emergency contact phone number, real-time SMS messages will ingest here.
            </p>
            <button 
              onClick={() => alert("Twilio Webhook Configurator Coming Soon")}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              Configure Twilio Webhook
            </button>
          </motion.div>
        ) : (
          <>
            {/* Sidebar and Chat UI will go here once populated */}
          </>
        )}
      </div>
    </div>
  );
}
