/* eslint-disable */

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AgentChatPage() {
  const [message, setMessage] = useState('');
  
  const [chatLog, setChatLog] = useState([
    { role: 'ai', content: "Hello! I am your MVP VRN AI Assistant. I have analyzed the real-time vitals for all patients currently in your facility workspace. How can I help you today?" }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    
    // Add user message
    const newLog = [...chatLog, { role: 'user', content: message }];
    setChatLog(newLog);
    setMessage('');
    
    // Fake AI Response for the demo
    setTimeout(() => {
      setChatLog([...newLog, { 
        role: 'ai', 
        content: "Based on the recent telemetry, Jane Doe's SpO2 dropped to 89% approximately 43 minutes ago. I recommend a manual wellness check. Would you like me to draft an SMS update to her emergency contact?" 
      }]);
    }, 1500);
  };

  return (
    <div className="font-outfit h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-4xl font-bold tracking-tight drop-shadow-lg text-white">AI Agent Chat</h2>
          <p className="text-neutral-200 mt-2">Ask questions about patient trends, generate handover reports, and analyze vitals.</p>
        </motion.div>
      </header>

      <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {chatLog.map((msg, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-2xl ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}>
                  {msg.role === 'user' ? 'US' : 'AI'}
                </div>
                
                {/* Bubble */}
                <div className={`p-5 rounded-2xl ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-sm' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-50 rounded-tl-sm'}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="px-8 pb-4 flex gap-3 overflow-x-auto">
          <button onClick={() => setMessage("Generate shift handover report.")} className="px-4 py-2 bg-black/50 hover:bg-white/10 border border-white/10 rounded-full text-xs text-neutral-300 whitespace-nowrap transition">
            ✨ Generate shift handover report
          </button>
          <button onClick={() => setMessage("Analyze Robert Smith's vitals.")} className="px-4 py-2 bg-black/50 hover:bg-white/10 border border-white/10 rounded-full text-xs text-neutral-300 whitespace-nowrap transition">
            📊 Analyze Robert Smith's vitals
          </button>
          <button onClick={() => setMessage("Are there any critical patients?")} className="px-4 py-2 bg-black/50 hover:bg-white/10 border border-white/10 rounded-full text-xs text-neutral-300 whitespace-nowrap transition">
            🚨 Are there any critical patients?
          </button>
        </div>

        {/* Input Box */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ask the AI Agent to analyze vitals..." 
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pr-16 text-sm text-white focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center text-white transition shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
