'use client';

import React, { useState, useEffect } from 'react';
import { Device, DashboardSummary } from '../types';

interface TvWallModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  summary?: DashboardSummary | null;
}

export const TvWallModal: React.FC<TvWallModalProps> = ({
  isOpen,
  onClose,
  devices,
  summary,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const offlineDevices = devices.filter((d) => d.status === 'offline');
  const unreachableDevices = devices.filter((d) => d.status === 'unreachable');

  return (
    <div className="fixed inset-0 z-50 bg-[#090D16] text-white p-8 flex flex-col justify-between overflow-hidden">
      {/* Top TV Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-headline font-bold text-2xl shadow-[0_0_20px_rgba(0,98,255,0.6)]">
            W
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline text-2xl font-bold tracking-tight flex items-center gap-3">
              WIFITICS NOC COMMAND WALL
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-status-online/20 text-status-online border border-status-online/30 animate-pulse">
                LIVE STREAM
              </span>
            </h1>
            <span className="font-mono text-xs text-telemetry-cyan tracking-widest uppercase">
              Enterprise Multi-Floor Infrastructure Operations
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col text-right">
            <span className="font-mono text-3xl font-bold text-slate-100">{currentTime}</span>
            <span className="font-mono text-xs text-slate-400">HQ TOWER COMMAND CENTER</span>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Keluar TV Wall Mode"
          >
            <span className="material-symbols-outlined text-[24px]">fullscreen_exit</span>
          </button>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-4 gap-6 my-6">
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
          <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">Total Monitored</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-headline text-5xl font-bold text-white">{devices.length}</span>
            <span className="font-mono text-sm text-slate-400">Nodes</span>
          </div>
          <span className="font-mono text-xs text-primary font-semibold">100% Discovered Subnets</span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-6 border border-emerald-950/60 shadow-xl flex flex-col justify-between">
          <span className="font-mono text-xs text-emerald-400 uppercase tracking-wider">Online / Sehat</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-headline text-5xl font-bold text-status-online">
              {devices.filter((d) => d.status === 'online').length}
            </span>
            <span className="font-mono text-sm text-status-online font-bold">
              {devices.length > 0
                ? Math.round((devices.filter((d) => d.status === 'online').length / devices.length) * 100)
                : 95}
              %
            </span>
          </div>
          <span className="font-mono text-xs text-emerald-400/80">Avg Latency: 12.4 ms</span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-6 border border-rose-950/80 shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-between">
          <span className="font-mono text-xs text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-offline animate-ping"></span>
            Critical Offline
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-headline text-5xl font-bold text-status-offline">
              {offlineDevices.length}
            </span>
            <span className="font-mono text-sm text-rose-400 font-bold">Perlu Intervensi</span>
          </div>
          <span className="font-mono text-xs text-rose-300 font-semibold">Auto Escalation: Active</span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-6 border border-amber-950/60 shadow-xl flex flex-col justify-between">
          <span className="font-mono text-xs text-amber-400 uppercase tracking-wider">Unreachable (Parent)</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-headline text-5xl font-bold text-status-unreachable">
              {unreachableDevices.length}
            </span>
            <span className="font-mono text-sm text-amber-400 font-bold">Suppressed</span>
          </div>
          <span className="font-mono text-xs text-amber-400/80">Root Failure Isolation</span>
        </div>
      </div>

      {/* Triage Alert Grid */}
      <div className="flex-1 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-status-offline animate-pulse"></span>
            <h2 className="font-headline text-lg font-bold text-white tracking-wide">
              DAFTAR INSIDEN DAN GANGGUAN AKTIF
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Auto Refreshing every 2 seconds via WebSocket
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 overflow-y-auto">
          {offlineDevices.concat(unreachableDevices).map((dev) => (
            <div
              key={dev.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                dev.status === 'offline'
                  ? 'bg-rose-950/20 border-rose-800/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                  : 'bg-amber-950/20 border-amber-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    dev.status === 'offline' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {dev.status}
                </span>
                <span className="font-mono text-xs text-slate-400">{dev.location}</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-white mt-2">{dev.hostname}</h3>
              <span className="font-mono text-sm text-telemetry-cyan font-semibold">{dev.ip}</span>
              <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-2 rounded">
                {dev.details || 'Gangguan koneksi telemetri terdeteksi'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

