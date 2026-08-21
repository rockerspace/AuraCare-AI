/* eslint-disable */

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const [dataSources, setDataSources] = useState<{name: string, url: string}[]>([]);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);

  const addDataSource = () => {
    const url = window.prompt("Enter your Embed URL (Looker Studio, Google Sheets, PDF, etc):", "");
    if (!url) return;
    const name = window.prompt("Enter a name for this data source (e.g. 'Weekly Trends'):", "New Report");
    if (!name) return;
    
    setDataSources([...dataSources, { name, url }]);
    setActiveSourceIndex(dataSources.length); // switch to the new one
  };

  const removeDataSource = (indexToRemove: number) => {
    const newSources = dataSources.filter((_, idx) => idx !== indexToRemove);
    setDataSources(newSources);
    if (activeSourceIndex >= newSources.length) {
      setActiveSourceIndex(Math.max(0, newSources.length - 1));
    }
  };

  return (
    <div className="font-outfit h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-4xl font-bold tracking-tight drop-shadow-lg text-white">Analytics & Trends</h2>
          <p className="text-neutral-200 mt-2">Enterprise intelligence powered by Looker Studio</p>
        </motion.div>
        <button 
          onClick={addDataSource}
          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-full text-sm transition-all duration-300 shadow-lg text-white flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Data Source
        </button>
      </header>

      <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        {/* Decorative Top Bar to make it look native */}
        <div className="h-12 bg-black/60 border-b border-white/5 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
          <span className="ml-4 text-xs font-mono text-neutral-300 uppercase tracking-widest">Data Sources Integration</span>
          
          {/* Tabs for Multiple Data Sources */}
          {dataSources.length > 0 && (
            <div className="ml-auto flex items-center gap-2 overflow-x-auto">
              {dataSources.map((source, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-1 text-xs rounded-md cursor-pointer transition-all ${
                    activeSourceIndex === idx 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-white/5 text-neutral-400 hover:bg-white/10 border border-transparent'
                  }`}
                  onClick={() => setActiveSourceIndex(idx)}
                >
                  <span className="truncate max-w-[150px]">{source.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeDataSource(idx); }}
                    className="hover:text-red-400 transition-colors"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* The Actual Looker Embed or Empty State */}
        <div className="flex-1 bg-black/20 flex flex-col items-center justify-center relative">
          {dataSources.length > 0 && dataSources[activeSourceIndex] ? (
            <iframe 
              key={dataSources[activeSourceIndex].url}
              src={dataSources[activeSourceIndex].url}
              className="absolute inset-0 w-full h-full border-0 bg-white"
              allowFullScreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl flex flex-col items-center justify-center p-12 border-dashed border border-white/10 rounded-3xl bg-black/40"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Data Source Connected</h3>
              <p className="text-neutral-200 text-center mb-8">
                Connect your BigQuery data warehouse, or paste an embed link (Looker Studio, Google Sheets, PDF) to visualize your facility's historical trends.
              </p>
              <button 
                onClick={addDataSource}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                Connect Data Source
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
