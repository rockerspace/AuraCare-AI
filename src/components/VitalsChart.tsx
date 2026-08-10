"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const data = [
  { day: 'Mon', heartRate: 72, spO2: 98 },
  { day: 'Tue', heartRate: 75, spO2: 97 },
  { day: 'Wed', heartRate: 85, spO2: 95 },
  { day: 'Thu', heartRate: 78, spO2: 96 },
  { day: 'Fri', heartRate: 90, spO2: 94 },
  { day: 'Sat', heartRate: 88, spO2: 95 },
  { day: 'Sun', heartRate: 72, spO2: 98 },
];

export default function VitalsChart() {
  return (
    <div className="w-full h-72 bg-black/40 border border-white/10 rounded-xl p-4 mt-6">
      <h3 className="text-emerald-400 font-semibold mb-4 text-sm uppercase tracking-wider">7-Day Historical Vitals (BigQuery)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 10', 'dataMax + 10']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="spO2" name="SpO2 (%)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
