'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { MetricCard } from '../../components/MetricCard';
import { Device } from '../../types';

export default function LanMonitoringPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'switch' | 'pc' | 'printer' | 'offline'>('all');
  const [pingingId, setPingingId] = useState<number | null>(null);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handlePing = async (id: number) => {
    setPingingId(id);
    try {
      await fetch(`/api/devices/${id}/ping`, { method: 'POST' });
      fetchDevices();
    } catch (err) {
      console.error(err);
    } finally {
      setPingingId(null);
    }
  };

  // Filter for LAN nodes: Switches (Aruba/Core), PC, Printer
  const lanDevices = devices.filter(
    (d) =>
      d.category === 'switch' ||
      d.category === 'pc' ||
      d.category === 'printer' ||
      d.hostname.toLowerCase().includes('aruba')
  );

  const filteredLan = lanDevices.filter((d) => {
    if (activeFilter === 'switch') return d.category === 'switch' || d.hostname.includes('ARUBA');
    if (activeFilter === 'pc') return d.category === 'pc';
    if (activeFilter === 'printer') return d.category === 'printer';
    if (activeFilter === 'offline') return d.status === 'offline';
    return true;
  });

  const switchCount = lanDevices.filter((d) => d.category === 'switch' || d.hostname.includes('ARUBA')).length;
  const pcCount = lanDevices.filter((d) => d.category === 'pc').length;
  const printerCount = lanDevices.filter((d) => d.category === 'printer').length;
  const offlineCount = lanDevices.filter((d) => d.status === 'offline').length;

  return (
    <div className="min-h-screen bg-surface-canvas font-body text-on-surface">
      <Sidebar
        stats={{
          avgLatency: 1.1,
          activeNodes: lanDevices.filter((d) => d.status === 'online').length,
          totalNodes: lanDevices.length,
        }}
      />

      <div className="pl-72">
        <Header incidentCount={offlineCount} />

        <main className="w-full pt-16 min-h-screen px-8 py-8 flex flex-col gap-6">
          {/* Top Command Overview Bar */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-surface-card p-6 rounded-xl shadow-sm border border-border-subtle">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-primary">
                  Office LAN Monitoring • Aruba Switches & End-Devices
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-online-surface text-status-online font-mono text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-online"></span> LAN POLLING ACTIVE
                </span>
              </div>
              <h1 className="font-headline text-2xl font-bold text-text-primary tracking-tight">
                Monitoring LAN Kantor: Switch Aruba & End-Devices (PC & Printer)
              </h1>
              <p className="text-xs text-text-secondary">
                Monitoring port switch access Aruba (600 / 2530 / 2540 Series), status workstation staf kantor, dan kesiapan network printer (Raw Port 9100).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchDevices()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-headline text-xs font-semibold shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                <span>Ping Semua LAN</span>
              </button>
            </div>
          </div>

          {/* 5 LAN Bento Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Total Terhubung LAN"
              value={lanDevices.length}
              subtext="100% Up-link"
              badgeText="CONNECTED"
              accentColor="primary"
              icon="lan"
            />
            <MetricCard
              title="Switch Aruba Aktif"
              value={switchCount}
              subtext="2530/2540 & 600"
              badgeText="MANAGED"
              accentColor="primary"
              icon="switch"
            />
            <MetricCard
              title="Komputer Staf (PC)"
              value={pcCount}
              subtext={`${pcCount - 1} Online`}
              badgeText="WORKSTATIONS"
              accentColor="online"
              icon="desktop_windows"
            />
            <MetricCard
              title="Network Printer"
              value={printerCount}
              subtext="Port 9100 RAW"
              badgeText="PRINT SERVERS"
              accentColor="maintenance"
              icon="print"
            />
            <MetricCard
              title="Kritis • Offline"
              value={offlineCount}
              subtext="1 PC & 1 Printer"
              badgeText="ACTION REQ"
              accentColor="offline"
              icon="error"
              pulsing={offlineCount > 0}
            />
          </div>

          {/* LAN Filter Pills Strip */}
          <div className="flex items-center justify-between overflow-x-auto bg-surface-card p-1.5 rounded-xl shadow-sm border border-border-subtle">
            <div className="flex items-center gap-1 min-w-max">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">lan</span>
                <span>Semua LAN ({lanDevices.length})</span>
              </button>
              <button
                onClick={() => setActiveFilter('switch')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'switch'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">switch</span>
                <span>Switch Aruba ({switchCount})</span>
              </button>
              <button
                onClick={() => setActiveFilter('pc')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'pc'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                <span>Komputer Staf ({pcCount})</span>
              </button>
              <button
                onClick={() => setActiveFilter('printer')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'printer'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Network Printer ({printerCount})</span>
              </button>
              <button
                onClick={() => setActiveFilter('offline')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === 'offline'
                    ? 'bg-status-offline text-white shadow-sm'
                    : 'text-status-offline hover:bg-status-offline-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>Offline / Alert ({offlineCount})</span>
              </button>
            </div>

            <div className="hidden 2xl:flex items-center gap-1 text-text-muted px-3 font-mono text-[10px] font-bold">
              <span className="material-symbols-outlined text-[14px]">wifi_tethering</span>
              <span>ARUBA AIRWAVE / INSTANT ON ACTIVE</span>
            </div>
          </div>

          {/* Master Table of Aruba Switches & LAN Nodes */}
          <div className="bg-surface-card rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-card-subtle font-mono text-[10px] text-text-muted uppercase border-b border-border-subtle">
                    <th className="py-3 px-4 w-32">Status Real-Time</th>
                    <th className="py-3 px-4 min-w-[220px]">Hostname • Tipe Perangkat</th>
                    <th className="py-3 px-4 min-w-[180px]">IP LAN • Subnet / VLAN</th>
                    <th className="py-3 px-4 min-w-[140px]">Kategori LAN</th>
                    <th className="py-3 px-4 min-w-[170px]">Port Switch Aruba / Lokasi</th>
                    <th className="py-3 px-4 min-w-[170px]">Status Port / Protokol Cek</th>
                    <th className="py-3 px-4 min-w-[110px]">Latency / Health</th>
                    <th className="py-3 px-4 text-right w-36">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-xs text-text-primary">
                  {filteredLan.map((dev) => {
                    const isOffline = dev.status === 'offline';
                    const isPinging = pingingId === dev.id;

                    return (
                      <tr
                        key={dev.id}
                        className={`hover:bg-surface-container-low/60 transition-colors ${
                          isOffline ? 'bg-status-offline-surface/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          {isOffline ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-offline-surface text-status-offline font-mono text-[11px] font-bold border border-status-offline/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-offline animate-ping"></span>
                              OFFLINE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-online-surface text-status-online font-mono text-[11px] font-bold border border-status-online/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-status-online animate-pulse"></span>
                              ONLINE
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isOffline
                                  ? 'bg-status-offline-surface text-status-offline'
                                  : 'bg-surface-container-high text-primary'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {dev.category === 'switch' || dev.hostname.includes('ARUBA')
                                  ? 'switch'
                                  : dev.category === 'pc'
                                  ? 'desktop_windows'
                                  : 'print'}
                              </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span
                                className={`font-headline text-xs font-bold truncate ${
                                  isOffline ? 'text-status-offline' : 'text-text-primary'
                                }`}
                              >
                                {dev.hostname}
                              </span>
                              <span className="font-mono text-[10px] text-text-muted truncate max-w-[200px]">
                                {dev.details || dev.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary">{dev.ip}</span>
                            <span className="text-[10px] text-text-muted truncate max-w-[160px]">
                              {dev.subnet_vlan || 'VLAN 10 • /24'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-text-secondary text-[11px] font-medium capitalize">
                            {dev.category === 'switch' || dev.hostname.includes('ARUBA')
                              ? 'Switch Aruba'
                              : dev.category === 'pc'
                              ? 'Host PC'
                              : 'Network Printer'}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-1 text-text-secondary">
                            <span className="material-symbols-outlined text-[16px] text-text-muted">
                              meeting_room
                            </span>
                            <span>{dev.location}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {isOffline ? (
                            <span className="text-status-offline font-bold">Port Link Down</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-low text-primary text-[11px] font-semibold">
                              <span className="material-symbols-outlined text-[13px]">lan</span>
                              {dev.check_method === 'tcp' ? `TCP ${dev.target_port} OK` : 'Uplink Active'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {isOffline ? (
                            <span className="text-status-offline font-bold">3x Fail</span>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-status-online font-bold">{dev.latency_ms} ms</span>
                              <span className="text-[10px] text-text-muted">SNMP / ICMP</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handlePing(dev.id)}
                              disabled={isPinging}
                              className="p-1.5 rounded hover:bg-surface-container text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
                              title="Ping ICMP Instan"
                            >
                              <span
                                className={`material-symbols-outlined text-[18px] ${
                                  isPinging ? 'animate-spin text-primary' : ''
                                }`}
                              >
                                network_ping
                              </span>
                            </button>
                            <button
                              className="p-1.5 rounded hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors"
                              title="Lihat Port Aruba"
                            >
                              <span className="material-symbols-outlined text-[18px]">terminal</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

