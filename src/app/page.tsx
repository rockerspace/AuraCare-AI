import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-[0_0_15px_rgba(52,211,153,0.4)]"></div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">AuraCare</h1>
          </div>
          
          <div className="space-y-2">
            {['Dashboard', 'Patients', 'Alerts', 'Settings'].map((item, i) => (
              <a key={item} href="#" className={`block px-4 py-3 rounded-xl transition-all duration-300 ${i === 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}>
                {item}
              </a>
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
      <main className="ml-64 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-semibold">Overview</h2>
            <p className="text-neutral-400 text-sm mt-1">Monitoring Jane Doe (Age 82) • Last synced: Just now</p>
          </div>
          <button className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-full text-sm transition-all duration-300">
            Export Report
          </button>
        </header>

        {/* Alerts Section (Mastra/Qdrant integration point) */}
        <div className="mb-8 p-6 bg-red-950/20 border border-red-500/20 rounded-3xl backdrop-blur-md">
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
            <div key={i} className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl relative overflow-hidden group hover:border-neutral-700 transition-colors">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`}></div>
              <div className="text-neutral-400 text-sm mb-2">{stat.label}</div>
              <div className="text-3xl font-light mb-4">{stat.value}</div>
              <div className={`text-sm ${stat.trend.startsWith('-') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stat.trend} from last week
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
