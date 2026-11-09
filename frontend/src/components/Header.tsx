'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  wsConnected?: boolean;
  onSearch?: (term: string) => void;
  incidentCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  wsConnected = true,
  onSearch,
  incidentCount = 4,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface-card/90 backdrop-blur-xl border-b border-border-subtle z-40 flex items-center justify-between px-8">
      {/* Left: WebSocket Live Status & Quick Search */}
      <div className="flex items-center gap-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-online-surface border border-status-online/30 text-status-online font-mono text-xs shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                wsConnected ? 'bg-status-online' : 'bg-status-offline'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                wsConnected ? 'bg-status-online' : 'bg-status-offline'
              }`}
            ></span>
          </span>
          <span className="font-semibold">
            {wsConnected ? 'WebSocket Connected • 2s refresh' : 'Connecting to Stream...'}
          </span>
        </div>

        <div className="relative hidden lg:flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-text-muted text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Quick IP, MAC, Subnet (e.g. 192.168.1.0/24)..."
            className="pl-9 pr-4 py-1.5 w-80 rounded-lg bg-surface-canvas border border-border-subtle font-mono text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-telemetry-cyan/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-5">
        <Link
          href="/incidents"
          className="relative p-2 rounded-lg hover:bg-surface-container-low text-text-secondary hover:text-text-primary transition-colors"
          title="Lihat Insiden Aktif"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {incidentCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-status-offline px-1 font-mono text-[10px] font-bold text-white ring-2 ring-surface-card">
              {incidentCount}
            </span>
          )}
        </Link>

        <div className="h-6 w-px bg-border-subtle"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-text-primary leading-tight">IT Admin Ops</span>
            <span className="font-mono text-[10px] text-text-muted uppercase font-bold">
              Root Access • NOC-1
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-headline font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-primary/20">
            OP
          </div>
        </div>
      </div>
    </header>
  );
};

