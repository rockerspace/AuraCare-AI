"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  return (
    <div className="font-outfit h-full flex flex-col max-w-5xl mx-auto pb-12">
      <header className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-4xl font-bold tracking-tight drop-shadow-lg text-white">Platform Settings</h2>
          <p className="text-neutral-400 mt-2">Configure integrations, webhooks, and facility preferences.</p>
        </motion.div>
        <button 
          onClick={() => alert("Settings Saved Successfully.")}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          Save Changes
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* API & Webhooks Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Twilio SMS Integration</h3>
              <p className="text-sm text-neutral-400">Configure Webhooks for Family Chat</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-400 mb-1 block">Twilio Account SID</label>
              <input type="password" value="AC******************************" readOnly className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-400 mb-1 block">Twilio Auth Token</label>
              <input type="password" value="********************************" readOnly className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-400 mb-1 block">Webhook URL (For incoming replies)</label>
              <div className="flex gap-2">
                <input type="text" value="https://api.mvpvrn.com/webhooks/twilio" readOnly className="flex-1 bg-black/50 border border-emerald-500/50 rounded-xl p-3 text-emerald-400 font-mono text-sm focus:outline-none" />
                <button className="px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition">Copy</button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hardware Integrations Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Hardware & Devices</h3>
              <p className="text-sm text-neutral-400">Manage wearable connections</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-white/10 rounded-2xl bg-white/5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⌚️</span>
                <div>
                  <h4 className="font-bold text-white">Apple HealthKit</h4>
                  <p className="text-xs text-neutral-400">Active (Real-time polling)</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-white/10 rounded-2xl bg-white/5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💍</span>
                <div>
                  <h4 className="font-bold text-white">Oura Ring API</h4>
                  <p className="text-xs text-neutral-400">Disconnected</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-neutral-700 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-white/10 rounded-2xl bg-white/5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛏️</span>
                <div>
                  <h4 className="font-bold text-white">Smart Bed Sensors</h4>
                  <p className="text-xs text-neutral-400">Awaiting IP Configuration</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-neutral-700 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI & Automation Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl md:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center border border-pink-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Automation Preferences</h3>
              <p className="text-sm text-neutral-400">Configure how the AI agent acts on your behalf</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border border-emerald-500 rounded bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Auto-generate Morning Reports</h4>
                  <p className="text-xs text-neutral-400">Compile vitals at 8:00 AM daily.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border border-emerald-500 rounded bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Draft SMS Replies</h4>
                  <p className="text-xs text-neutral-400">AI proposes replies to family messages before sending.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border border-white/20 rounded bg-white/5 flex items-center justify-center"></div>
                <div>
                  <h4 className="text-sm font-bold text-white">Fully Autonomous SMS</h4>
                  <p className="text-xs text-neutral-400">WARNING: AI sends SMS without caregiver review.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 border border-emerald-500 rounded bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Escalate Critical Anomalies</h4>
                  <p className="text-xs text-neutral-400">Automatically ping on-call doctor for SpO2 drops.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
