'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { LatencyWaveform } from '../components/LatencyWaveform';
import { DeviceTable } from '../components/DeviceTable';
import { TvWallModal } from '../components/TvWallModal';
import { Device, DashboardSummary } from '../types';

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [pingingId, setPingingId] = useState<number | null>(null);
  const [tvModeOpen, setTvModeOpen] = useState(false);
  const [globalScanning, setGlobalScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch initial devices
  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      console.error(err);
    }
  };

  // WebSocket connection for live telemetry stream
  useEffect(() => {
    fetchDevices();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWs = () => {
      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setWsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.event === 'telemetry_tick' && msg.data) {
              setSummary(msg.data);
              // Refresh devices data smoothly
              fetchDevices();
            } else if (msg.event === 'device_status_changed') {
              fetchDevices();
            }
          } catch (e) {
            console.error(e);
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          // Auto reconnect after 3 seconds
          setTimeout(connectWs, 3000);
        };

        socket.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        setWsConnected(false);
        setTimeout(connectWs, 3000);
      }
    };

    connectWs();

    // Fallback polling every 5s
    const pollInterval = setInterval(fetchDevices, 5000);

    return () => {
      clearInterval(pollInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handlePing = async (id: number) => {
    setPingingId(id);
    try {
      await fetch(`/api/devices/${id}/ping`, { method: 'POST' });
      await fetchDevices();
    } catch (err) {
      console.error(err);
    } finally {
      setPingingId(null);
    }
  };

  const handleToggleMaintenance = async (id: number) => {
    try {
      await fetch(`/api/devices/${id}/maintenance`, { method: 'POST' });
      await fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGlobalPing = async () => {
    setGlobalScanning(true);
    try {
      await fetch('/api/devices/ping-all', { method: 'POST' });
      setTimeout(async () => {
        await fetchDevices();
        setGlobalScanning(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setGlobalScanning(false);
    }
  };

  // Derive counts
  const totalCount = devices.length;
  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const offlineCount = devices.filter((d) => d.status === 'offline').length;
  const unreachableCount = devices.filter((d) => d.status === 'unreachable').length;
  const onlinePct = totalCount > 0 ? ((onlineCount / totalCount) * 100).toFixed(1) : '95.0';

  // Offline devices for priority triage banner
  const priorityIncidents = devices.filter(
    (d) => d.status === 'offline' || d.status === 'unreachable'
  );

  return (
    <div className="min-h-screen bg-surface-canvas font-body text-on-surface">
      <Sidebar
        stats={{
          avgLatency: summary?.average_latency_ms || 12.4,
          activeNodes: onlineCount,
          totalNodes: totalCount,
        }}
      />

      <div className="pl-72">
        <Header
          wsConnected={wsConnected}
          onSearch={(term) => setSearchTerm(term)}
          incidentCount={offlineCount}
        />

        <main className="w-full pt-16 min-h-screen px-8 py-8 flex flex-col gap-6">
          {/* Top Operational Alert Banner & NOC Quick Control Bar */}
          <div className="relative overflow-hidden rounded-xl bg-surface-card p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-border-subtle">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-telemetry-cyan/10 blur-3xl pointer-events-none"></div>

            <div className="flex flex-col gap-1 z-10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-primary">
                  NOC Enterprise Control • HQ Tower
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-online-surface text-status-online font-mono text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-online animate-ping"></span>
                  Telemetry Synced (1.4s)
                </span>
              </div>
              <h1 className="font-headline text-2xl font-bold text-text-primary tracking-tight">
                Office Network Operations Center
              </h1>
              <p className="text-xs text-text-secondary max-w-2xl">
                Pemantauan terpusat multi-lantai real-time. {offlineCount} insiden terdeteksi membutuhkan penanganan proaktif oleh tim infrastruktur.
              </p>
            </div>

            {/* NOC Action Controls */}
            <div className="flex flex-wrap items-center gap-3 z-10">
              <button
                onClick={handleGlobalPing}
                disabled={globalScanning}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-headline font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[18px] ${globalScanning ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{globalScanning ? 'Scanning Cluster...' : 'Quick Scan / Ping All'}</span>
              </button>

              <button
                onClick={() => setTvModeOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary text-xs font-medium transition-colors border border-border-subtle"
              >
                <span className="material-symbols-outlined text-[18px] text-text-secondary">tv</span>
                <span>TV Wall Mode</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 bg-surface-container-low/60 rounded-lg p-1 border border-border-subtle/40">
                <button className="px-2.5 py-1 rounded bg-surface-card text-primary font-mono text-[10px] font-bold shadow-sm">
                  HQ NOC-1
                </button>
                <button className="px-2.5 py-1 rounded text-text-muted hover:text-text-primary font-mono text-[10px] transition-colors">
                  DC BEKASI
                </button>
              </div>
            </div>
          </div>

          {/* KPI 4 Summary Grid (PRD F-10, F-11) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <MetricCard
              title="Total Perangkat Monitored"
              value={totalCount}
              unit="Nodes"
              subtext="5 Lantai + Data Center"
              badgeText="100% DISCOVERED"
              accentColor="primary"
              icon="developer_board"
            />
            <MetricCard
              title="Online / Sehat"
              value={onlineCount}
              unit={`${onlinePct}%`}
              subtext="Latency stabil 12.4ms"
              badgeText="HEALTHY CLUSTER"
              accentColor="online"
              icon="verified"
            />
            <MetricCard
              title="Kritis: Terputus / Down"
              value={offlineCount}
              unit="Nodes Tumbang"
              subtext="Perlu Intervensi Segera"
              badgeText="TRAP LINKDOWN"
              accentColor="offline"
              icon="fmd_bad"
              pulsing={offlineCount > 0}
            />
            <MetricCard
              title="Unreachable (Parent Down)"
              value={unreachableCount}
              unit="Isolasi Jalur"
              subtext="Switch Transit Terputus"
              badgeText="DEPENDENCY BLOCK"
              accentColor="unreachable"
              icon="alt_route"
            />
          </div>

          {/* Priority Triage Panel (PRD F-15: Perangkat Offline di Bagian Atas) */}
          {priorityIncidents.length > 0 && (
            <div className="rounded-xl bg-surface-card p-6 shadow-sm border border-border-subtle flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-status-offline-surface text-status-offline">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline text-base font-bold text-text-primary">
                        Insiden Aktif • Prioritas Penanganan NOC
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-status-offline text-white font-mono text-[10px] font-bold">
                        {priorityIncidents.length} ALERTS
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary">
                      Perangkat offline diurutkan berdasarkan dampak topologi dan durasi putus.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-text-muted">Auto-escalation SLA:</span>
                  <span className="text-status-offline font-semibold">16 Menit Tersisa</span>
                </div>
              </div>

              {/* Alert Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {priorityIncidents.slice(0, 4).map((inc) => (
                  <div
                    key={inc.id}
                    className="rounded-xl bg-surface-card-subtle p-4 border border-border-subtle flex flex-col justify-between gap-3 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-status-offline bg-status-offline-surface px-2 py-0.5 rounded uppercase">
                          DOWN • Aktif
                        </span>
                        <span className="font-mono text-[9px] uppercase font-bold text-text-muted">
                          {inc.category}
                        </span>
                      </div>
                      <span className="font-headline text-sm font-bold text-text-primary mt-1 truncate">
                        {inc.hostname}
                      </span>
                      <div className="flex items-center justify-between font-mono text-xs text-text-secondary">
                        <span>{inc.ip}</span>
                        <span className="text-text-muted text-[11px] truncate">{inc.location}</span>
                      </div>
                      <div className="p-2 rounded bg-surface-card text-[11px] text-text-secondary border border-border-subtle/50 mt-1">
                        <span className="text-status-offline font-semibold block truncate">
                          {inc.details || 'SNMP trap linkDown'}
                        </span>
                        <span className="text-text-muted block text-[10px]">PIC: Tier-2 Network Team</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-border-subtle/50">
                      <button
                        onClick={() => handlePing(inc.id)}
                        disabled={pingingId === inc.id}
                        className="flex-1 py-1.5 px-2 rounded bg-primary hover:bg-primary-dark text-white font-headline text-xs font-semibold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[14px]">troubleshoot</span>
                        <span>Cek Sekarang</span>
                      </button>
                      <button
                        onClick={() => handleToggleMaintenance(inc.id)}
                        className="p-1.5 rounded bg-surface-container-low hover:bg-surface-container text-text-secondary"
                        title="Set Maintenance Mode"
                      >
                        <span className="material-symbols-outlined text-[16px]">build</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bento Grid: 24H Latency Telemetry + Device Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <LatencyWaveform avgLatency={summary?.average_latency_ms || 12.4} />
            </div>

            <div className="lg:col-span-4 rounded-xl bg-surface-card p-6 shadow-sm border border-border-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase font-bold text-text-muted">
                    Topologi Inventaris
                  </span>
                  <h2 className="font-headline text-base font-bold text-text-primary">
                    Distribusi Perangkat
                  </h2>
                </div>
                <span className="font-mono text-[10px] text-text-muted font-bold">6 KATEGORI</span>
              </div>

              <div className="flex flex-col gap-3 my-2">
                {/* Switches */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">hub</span>
                      Switches (Core / Aruba)
                    </span>
                    <span className="font-mono text-text-primary">5 / 6 Aktif</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '83%' }}></div>
                  </div>
                </div>

                {/* Access Points */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-telemetry-cyan">wifi</span>
                      Access Points Wi-Fi 6
                    </span>
                    <span className="font-mono text-text-primary">3 / 4 Aktif</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div className="h-full bg-telemetry-cyan rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                {/* Surveillance CCTV */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-text-secondary">videocam</span>
                      CCTV Surveillance
                    </span>
                    <span className="font-mono text-text-primary">1 / 2 Aktif</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div className="h-full bg-text-secondary rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>

                {/* Network Printers */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">print</span>
                      Network Printers (Raw 9100)
                    </span>
                    <span className="font-mono text-text-primary">1 / 2 Aktif</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>

                {/* Servers */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-status-online">dns</span>
                      Server Cluster & Database
                    </span>
                    <span className="font-mono text-text-primary">3 / 3 Sehat</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div className="h-full bg-status-online rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                <span className="font-mono">Subnet: /24 Active</span>
                <a href="/topology" className="text-primary hover:underline font-semibold flex items-center gap-1">
                  Topologi Lengkap <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>

          {/* Full Device Telemetry Table */}
          <DeviceTable
            devices={devices}
            onPing={handlePing}
            onToggleMaintenance={handleToggleMaintenance}
            pingingId={pingingId}
          />
        </main>
      </div>

      {/* TV Wall Modal */}
      <TvWallModal
        isOpen={tvModeOpen}
        onClose={() => setTvModeOpen(false)}
        devices={devices}
        summary={summary}
      />
    </div>
  );
}

