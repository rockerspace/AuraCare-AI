"use client";
import React, { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  return (
    <div 
      className="min-h-screen text-neutral-100 font-sans selection:bg-emerald-500/30 bg-cover bg-center bg-no-repeat fixed inset-0 overflow-y-auto"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 p-6 flex flex-col justify-between z-10 shadow-2xl">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.jpg" alt="AuraCare Logo" className="w-10 h-10 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">AuraCare</h1>
          </div>
          
          <div className="space-y-2">
            {['Dashboard', 'Patients', 'Alerts', 'Settings'].map((item) => (
              <button 
                key={item} 
                onClick={() => setActiveTab(item)}
                className={`w-full text-left block px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-neutral-800/50 rounded-2xl border border-neutral-700/50 backdrop-blur-sm">
          <div className="text-xs text-neutral-400 mb-1">HIPAA Compliant</div>
          <div className="text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> System Secure
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-64 p-8 relative z-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-semibold drop-shadow-md">{activeTab}</h2>
            {activeTab === 'Dashboard' && <p className="text-neutral-300 text-sm mt-1 drop-shadow-md">Monitoring Jane Doe (Age 82) • Last synced: Just now</p>}
          </div>
          <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full text-sm transition-all duration-300 shadow-lg">
            Export Report
          </button>
        </header>

        {activeTab === 'Dashboard' && (
          <>
            {/* Alerts Section (Mastra/Qdrant integration point) */}
            <div className="mb-8 p-6 bg-red-950/40 border border-red-500/30 rounded-3xl backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <h3 className="text-red-400 font-medium">Behavioral Anomaly Detected</h3>
              </div>
              <p className="text-neutral-300 text-sm">
                AI Agent (Mastra) has detected a 40% decrease in mobility compared to the historical baseline (Qdrant vector analysis) over the last 48 hours.
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: 'Heart Rate Avg', value: '72 bpm', trend: '+2%', color: 'from-rose-500 to-pink-500' },
                { label: 'Sleep Duration', value: '6h 45m', trend: '-15%', color: 'from-indigo-500 to-purple-500' },
                { label: 'Mobility Index', value: 'Low', trend: '-40%', color: 'from-amber-500 to-orange-500' },
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden group hover:border-white/20 hover:bg-black/50 transition-all shadow-xl">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-20 rounded-full blur-3xl group-hover:opacity-30 transition-opacity`}></div>
                  <div className="text-neutral-300 text-sm mb-2">{stat.label}</div>
                  <div className="text-3xl font-light mb-4 text-white drop-shadow-sm">{stat.value}</div>
                  <div className={`text-sm font-medium ${stat.trend.startsWith('-') ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {stat.trend} from last week
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'Patients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Jane Doe', age: 82, status: 'Critical', lastActive: '2 mins ago', image: 'JD' },
              { name: 'Robert Smith', age: 76, status: 'Stable', lastActive: '1 hr ago', image: 'RS' },
              { name: 'Mary Johnson', age: 88, status: 'Review', lastActive: '15 mins ago', image: 'MJ' },
              { name: 'William Brown', age: 91, status: 'Stable', lastActive: '3 hrs ago', image: 'WB' },
            ].map((patient, idx) => (
              <div key={idx} className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden group hover:border-white/30 hover:bg-black/50 transition-all shadow-xl flex flex-col">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${patient.status === 'Critical' ? 'from-red-500 to-rose-600' : patient.status === 'Review' ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500'} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`}></div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-medium text-white border border-white/20">
                    {patient.image}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{patient.name}</h3>
                    <p className="text-sm text-neutral-400">Age: {patient.age}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-6 relative z-10 text-sm">
                  <span className="text-neutral-400">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${patient.status === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : patient.status === 'Review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {patient.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-6 relative z-10 text-sm">
                  <span className="text-neutral-400">Last Active</span>
                  <span className="text-neutral-200">{patient.lastActive}</span>
                </div>
                
                <div className="mt-auto relative z-10">
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors">
                    View Full Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab !== 'Dashboard' && activeTab !== 'Patients' && (
          <div className="p-12 text-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl">
            <h3 className="text-xl font-medium text-neutral-300 mb-2">{activeTab} Module</h3>
            <p className="text-neutral-500">This module is currently under development.</p>
          </div>
        )}
      </main>
    </div>
  );
}
