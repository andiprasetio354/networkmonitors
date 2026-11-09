'use client';

import React from 'react';

interface LatencyWaveformProps {
  avgLatency?: number;
}

export const LatencyWaveform: React.FC<LatencyWaveformProps> = ({ avgLatency = 12.4 }) => {
  return (
    <div className="rounded-xl bg-surface-card p-6 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase font-bold text-text-muted">
            Network Performance Telemetry
          </span>
          <h2 className="font-headline text-lg font-bold text-text-primary">
            Rata-Rata Latensi Jaringan 24 Jam
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-primary"></span>
            <span className="text-xs text-text-secondary">Latency (ms)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-status-offline"></span>
            <span className="text-xs text-text-secondary">Spikes / Loss</span>
          </div>
          <span className="font-mono text-xs bg-surface-container-low px-2 py-1 rounded text-primary font-bold">
            AVG: {avgLatency} ms
          </span>
        </div>
      </div>

      {/* Vector Telemetry SVG Chart */}
      <div className="relative w-full h-44 my-2">
        <svg className="w-full h-full text-primary" preserveAspectRatio="none" viewBox="0 0 700 160">
          <defs>
            <linearGradient id="latencyGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0062FF" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line opacity="0.3" stroke="#CBD5E1" strokeDasharray="3 3" x1="0" x2="700" y1="30" y2="30" />
          <line opacity="0.3" stroke="#CBD5E1" strokeDasharray="3 3" x1="0" x2="700" y1="75" y2="75" />
          <line opacity="0.3" stroke="#CBD5E1" strokeDasharray="3 3" x1="0" x2="700" y1="120" y2="120" />

          {/* Area fill */}
          <polygon
            fill="url(#latencyGradient)"
            points="0,150 0,110 50,115 100,105 150,118 200,98 250,102 300,85 350,92 400,110 450,105 500,70 540,28 560,40 580,110 630,108 700,104 700,150"
          />
          {/* Smooth Line */}
          <polyline
            fill="none"
            points="0,110 50,115 100,105 150,118 200,98 250,102 300,85 350,92 400,110 450,105 500,70 540,28 560,40 580,110 630,108 700,104"
            stroke="#0062FF"
            strokeLinecap="round"
            strokeWidth="2.5"
          />

          {/* Incident Anomaly Pulse Marker */}
          <circle cx="540" cy="28" fill="#EF4444" r="5" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="540" cy="28" fill="none" opacity="0.6" r="10" stroke="#EF4444" strokeWidth="1.5">
            <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Tooltip callout on the spike */}
        <div className="absolute left-[74%] top-2 -translate-x-1/2 bg-surface-card rounded px-2.5 py-1 shadow-md border border-border-subtle text-left flex flex-col pointer-events-none z-10">
          <span className="font-mono text-[10px] text-status-offline font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-offline"></span>
            CORE-FL03 DISCONNECT
          </span>
          <span className="font-mono text-[11px] text-text-primary">128ms / 4.8% Packet Loss</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted pt-2 font-mono">
        <span>00:00 (H-24)</span>
        <span>06:00 WIB</span>
        <span>12:00 WIB</span>
        <span>18:00 WIB</span>
        <span className="text-primary font-bold">Sekarang (LIVE)</span>
      </div>
    </div>
  );
};

