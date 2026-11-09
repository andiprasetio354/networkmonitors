'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { NotificationSettings } from '../../components/NotificationSettings';
import { Incident } from '../../types';

function IncidentsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'settings' ? 'settings' : 'incidents';

  const [activeTab, setActiveTab] = useState<'incidents' | 'settings'>(initialTab);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [slaStats, setSlaStats] = useState<any>(null);
  const [rangeFilter, setRangeFilter] = useState('30d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchIncidents = async () => {
    try {
      let url = `/api/incidents?range=${rangeFilter}&status=${statusFilter}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlaStats = async () => {
    try {
      const res = await fetch('/api/incidents/sla');
      const data = await res.json();
      setSlaStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchSlaStats();
  }, [rangeFilter, statusFilter, searchTerm]);

  const handleTestDispatch = async () => {
    const res = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'all' }),
    });
    return await res.json();
  };

  const ongoingCount = incidents.filter((i) => i.status === 'ongoing').length;

  return (
    <div className="min-h-screen bg-surface-canvas font-body text-on-surface">
      <Sidebar stats={{ avgLatency: 12.4, activeNodes: 16, totalNodes: 20 }} />

      <div className="pl-72">
        <Header incidentCount={ongoingCount} />

        <main className="w-full pt-16 min-h-screen px-8 py-8 flex flex-col gap-6">
          {/* Top Operational Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-card p-6 rounded-xl shadow-sm border border-border-subtle">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-primary bg-primary-fixed/50 px-2 py-0.5 rounded uppercase font-bold">
                  PRD Sec 7.3 & 7.4 Telemetry Core
                </span>
                <span className="font-mono text-xs text-text-muted">
                  NOC Incident Intelligence Engine
                </span>
              </div>
              <h1 className="font-headline text-2xl font-bold text-text-primary tracking-tight">
                Riwayat Log Insiden & Pengaturan Notifikasi
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Audit real-time ketercapaian SLA, audit trail MTTR, serta orkestrasi alarm multi-kanal.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-center">
              <a
                href="/api/incidents/export"
                download="sla_report.csv"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-container-low text-text-primary shadow-sm border border-border-subtle transition-all text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[18px] text-text-muted">download</span>
                <span>Ekspor CSV</span>
              </a>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-card hover:bg-surface-container-low text-text-primary shadow-sm border border-border-subtle transition-all text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[18px] text-error">picture_as_pdf</span>
                <span>Ekspor PDF SLA (F-32)</span>
              </button>
            </div>
          </div>

          {/* SLA & MTTR Telemetry Metric Cards (PRD F-31, F-33) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Overall SLA Uptime */}
            <div className="relative overflow-hidden rounded-xl bg-surface-card p-5 shadow-sm border border-border-subtle flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-status-online"></div>
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] uppercase font-bold text-text-muted">
                  Overall SLA Uptime
                </span>
                <span className="font-mono text-[10px] text-status-online bg-status-online-surface px-1.5 py-0.5 rounded font-bold">
                  +0.04% MoM
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-headline text-3xl font-bold text-text-primary">
                  {slaStats?.overall_sla_uptime || 99.82}%
                </span>
                <span className="text-xs text-text-muted">Bulan Berjalan</span>
              </div>
              <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-xs text-text-secondary">
                <span>Target SLA: ≥ 99.50%</span>
                <svg className="w-16 h-4 text-status-online" fill="none" viewBox="0 0 80 20">
                  <path
                    d="M0 16 L15 14 L30 15 L45 8 L60 9 L75 4 L80 3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            {/* Total Incidents & MTTR */}
            <div className="relative overflow-hidden rounded-xl bg-surface-card p-5 shadow-sm border border-border-subtle flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] uppercase font-bold text-text-muted">
                  Total Insiden & MTTR
                </span>
                <span className="font-mono text-[10px] text-primary bg-primary-fixed/50 px-1.5 py-0.5 rounded font-bold">
                  Optimal Speed
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-headline text-3xl font-bold text-text-primary">
                  {slaStats?.total_incidents || incidents.length}
                </span>
                <span className="font-mono text-xs text-text-secondary">Kejadian</span>
                <span className="text-text-muted text-xs">/ MTTR 12m</span>
              </div>
              <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-xs text-text-secondary">
                <span>Rata-rata Pulih Cepat</span>
                <span className="font-mono text-status-online font-bold">
                  {slaStats?.avg_mttr_formatted || '12m 44s'}
                </span>
              </div>
            </div>

            {/* Top Problematic Node 1 */}
            <div className="relative overflow-hidden rounded-xl bg-surface-card p-5 shadow-sm border border-border-subtle flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-status-offline"></div>
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] uppercase font-bold text-text-muted">
                  Top Problematic Node #1
                </span>
                <span className="font-mono text-[10px] text-status-offline bg-status-offline-surface px-1.5 py-0.5 rounded font-bold">
                  {slaStats?.top_problem_nodes?.[0]?.incident_count || 3}x Incident
                </span>
              </div>
              <div className="mt-2 flex flex-col">
                <span className="font-headline text-base font-bold text-text-primary truncate">
                  {slaStats?.top_problem_nodes?.[0]?.device_hostname || 'SW-CORE-FL03'}
                </span>
                <span className="font-mono text-xs text-text-muted truncate">
                  {slaStats?.top_problem_nodes?.[0]?.device_ip || '192.168.10.1'} • {slaStats?.top_problem_nodes?.[0]?.location || 'Lantai 3'}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-xs">
                <span className="text-text-muted">Total Downtime:</span>
                <span className="font-mono text-status-offline font-semibold">
                  {slaStats?.top_problem_nodes?.[0]?.total_downtime_minutes || 28}m 10s
                </span>
              </div>
            </div>

            {/* Top Problematic Node 2 */}
            <div className="relative overflow-hidden rounded-xl bg-surface-card p-5 shadow-sm border border-border-subtle flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1 bg-status-unreachable"></div>
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] uppercase font-bold text-text-muted">
                  Top Problematic Node #2
                </span>
                <span className="font-mono text-[10px] text-status-unreachable bg-status-unreachable-surface px-1.5 py-0.5 rounded font-bold">
                  {slaStats?.top_problem_nodes?.[1]?.incident_count || 2}x Incident
                </span>
              </div>
              <div className="mt-2 flex flex-col">
                <span className="font-headline text-base font-bold text-text-primary truncate">
                  {slaStats?.top_problem_nodes?.[1]?.device_hostname || 'AP-MEETING-VIP'}
                </span>
                <span className="font-mono text-xs text-text-muted truncate">
                  {slaStats?.top_problem_nodes?.[1]?.device_ip || '192.168.30.45'} • {slaStats?.top_problem_nodes?.[1]?.location || 'Lt 3 Boardroom'}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-xs">
                <span className="text-text-muted">Total Downtime:</span>
                <span className="font-mono text-status-unreachable font-semibold">
                  {slaStats?.top_problem_nodes?.[1]?.total_downtime_minutes || 14}m 50s
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-2 bg-surface-card p-1.5 rounded-xl shadow-sm border border-border-subtle w-full max-w-md">
            <button
              onClick={() => setActiveTab('incidents')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-headline text-xs font-semibold transition-all ${
                activeTab === 'incidents'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Log Insiden & Kejadian (F-30)</span>
              <span className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {incidents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-headline text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Konfigurasi Notifikasi (F-20 - F-24)</span>
            </button>
          </div>

          {/* TAB 1: INCIDENT LOG */}
          {activeTab === 'incidents' && (
            <div className="flex flex-col gap-4">
              {/* Filter Ribbon */}
              <div className="bg-surface-card rounded-xl p-4 shadow-sm border border-border-subtle flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[10px] uppercase font-bold text-text-muted mr-2">
                    Rentang Waktu:
                  </span>
                  <button
                    onClick={() => setRangeFilter('today')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rangeFilter === 'today'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-container-low'
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => setRangeFilter('7d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rangeFilter === '7d'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-container-low'
                    }`}
                  >
                    7 Hari Terakhir
                  </button>
                  <button
                    onClick={() => setRangeFilter('30d')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      rangeFilter === '30d'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-surface-container-low'
                    }`}
                  >
                    30 Hari Terakhir
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 sm:w-64">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari IP, node, lokasi..."
                      className="w-full pl-9 pr-3 py-1.5 bg-surface-canvas rounded-lg text-xs font-mono text-text-primary border border-border-subtle focus:outline-none focus:border-primary"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-surface-canvas rounded-lg text-xs text-text-primary border border-border-subtle focus:outline-none cursor-pointer"
                  >
                    <option value="all">Semua Status</option>
                    <option value="ongoing">Sedang Terjadi (Active)</option>
                    <option value="resolved">Selesai (Resolved)</option>
                  </select>
                </div>
              </div>

              {/* Incidents Table */}
              <div className="bg-surface-card rounded-xl shadow-sm border border-border-subtle overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-card-subtle text-text-muted font-mono text-[10px] uppercase border-b border-border-subtle">
                        <th className="py-3 px-4 w-32">Status & ID</th>
                        <th className="py-3 px-4 min-w-[200px]">Perangkat & Lokasi</th>
                        <th className="py-3 px-4 min-w-[150px]">Waktu Gangguan</th>
                        <th className="py-3 px-4 min-w-[150px]">Waktu Pulih</th>
                        <th className="py-3 px-4 min-w-[100px]">Durasi</th>
                        <th className="py-3 px-4 min-w-[220px]">Pemicu & Akar Masalah</th>
                        <th className="py-3 px-4 text-right w-36">Eskalasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/50 text-xs text-text-primary font-mono">
                      {incidents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-text-muted">
                            Tidak ada data insiden untuk filter yang dipilih.
                          </td>
                        </tr>
                      ) : (
                        incidents.map((inc) => {
                          const isOngoing = inc.status === 'ongoing';
                          return (
                            <tr
                              key={inc.id}
                              className={`hover:bg-surface-container-low/60 transition-colors ${
                                isOngoing ? 'bg-status-offline-surface/40' : ''
                              }`}
                            >
                              <td className="py-3 px-4">
                                {isOngoing ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-offline-surface text-status-offline text-[11px] font-bold border border-status-offline/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-status-offline animate-ping"></span>
                                    AKTIF #{inc.id}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-online-surface text-status-online text-[11px] font-bold border border-status-online/20">
                                    <span className="material-symbols-outlined text-[13px]">check</span>
                                    RESOLVED #{inc.id}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex flex-col font-sans">
                                  <span className="font-headline font-bold text-text-primary">
                                    {inc.device_hostname}
                                  </span>
                                  <span className="font-mono text-[11px] text-text-muted">
                                    {inc.device_ip} • {inc.location}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-text-secondary">
                                {new Date(inc.started_at).toLocaleString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>

                              <td className="py-3 px-4 text-text-secondary">
                                {inc.resolved_at
                                  ? new Date(inc.resolved_at).toLocaleString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '-'}
                              </td>

                              <td className="py-3 px-4">
                                <span
                                  className={`font-bold ${
                                    isOngoing ? 'text-status-offline' : 'text-text-primary'
                                  }`}
                                >
                                  {inc.duration_minutes} Menit
                                </span>
                              </td>

                              <td className="py-3 px-4 font-sans">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-text-primary">
                                    {inc.protocol_trigger}
                                  </span>
                                  <span className="text-[11px] text-text-muted">{inc.root_cause}</span>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container text-text-secondary text-[11px]">
                                  {inc.escalation_level}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATION SETTINGS */}
          {activeTab === 'settings' && (
            <NotificationSettings onDispatchTest={handleTestDispatch} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function IncidentsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Memuat data insiden...</div>}>
      <IncidentsContent />
    </Suspense>
  );
}
