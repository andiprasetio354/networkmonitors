'use client';

import React, { useState } from 'react';
import { Device, DeviceStatus } from '../types';

interface DeviceTableProps {
  devices: Device[];
  onPing: (id: number) => void;
  onToggleMaintenance: (id: number) => void;
  onEdit?: (device: Device) => void;
  onDelete?: (id: number) => void;
  pingingId?: number | null;
}

export const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  onPing,
  onToggleMaintenance,
  onEdit,
  onDelete,
  pingingId,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'offline' | 'unreachable' | 'online'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Counts for pills
  const totalCount = devices.length;
  const offlineCount = devices.filter((d) => d.status === 'offline').length;
  const unreachableCount = devices.filter((d) => d.status === 'unreachable').length;
  const onlineCount = devices.filter((d) => d.status === 'online').length;

  const filteredDevices = devices.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (categoryFilter && d.category !== categoryFilter) return false;
    if (locationFilter && d.location !== locationFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        d.hostname.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.mac?.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.details?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-online-surface text-status-online font-mono text-[11px] font-bold border border-status-online/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-status-online animate-pulse"></span>
            ONLINE
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-offline-surface text-status-offline font-mono text-[11px] font-bold border border-status-offline/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-offline opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-offline"></span>
            </span>
            OFFLINE
          </span>
        );
      case 'unreachable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-unreachable-surface text-status-unreachable font-mono text-[11px] font-bold border border-status-unreachable/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-unreachable"></span>
            UNREACHABLE
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-maintenance-surface text-status-maintenance font-mono text-[11px] font-bold border border-status-maintenance/30">
            <span className="material-symbols-outlined text-[12px]">build</span>
            MAINTENANCE
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'router':
        return 'alt_route';
      case 'switch':
        return 'hub';
      case 'ap':
        return 'wifi';
      case 'server':
        return 'dns';
      case 'cctv':
        return 'videocam';
      case 'printer':
        return 'print';
      case 'pc':
        return 'desktop_windows';
      default:
        return 'devices';
    }
  };

  return (
    <div className="rounded-xl bg-surface-card p-6 shadow-sm flex flex-col gap-4">
      {/* Table Toolbar Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="font-headline text-lg font-bold text-text-primary">
            Daftar Telemetri Seluruh Perangkat
          </h2>
          <span className="text-xs text-text-secondary">
            Sinkronisasi status ICMP Ping, SNMP Polling, dan TCP Handshake tiap 2 detik.
          </span>
        </div>

        {/* Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-low text-text-secondary hover:bg-surface-container'
            }`}
          >
            SEMUA ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('offline')}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all ${
              statusFilter === 'offline'
                ? 'bg-status-offline text-white shadow-sm'
                : 'bg-surface-container-low text-status-offline hover:bg-status-offline-surface'
            }`}
          >
            OFFLINE ({offlineCount})
          </button>
          <button
            onClick={() => setStatusFilter('unreachable')}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all ${
              statusFilter === 'unreachable'
                ? 'bg-status-unreachable text-white shadow-sm'
                : 'bg-surface-container-low text-status-unreachable hover:bg-status-unreachable-surface'
            }`}
          >
            UNREACHABLE ({unreachableCount})
          </button>
          <button
            onClick={() => setStatusFilter('online')}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all ${
              statusFilter === 'online'
                ? 'bg-status-online text-white shadow-sm'
                : 'bg-surface-container-low text-status-online hover:bg-status-online-surface'
            }`}
          >
            ONLINE ({onlineCount})
          </button>
        </div>
      </div>

      {/* Filter Dropdowns & Live Search Input Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-surface-card-subtle p-3.5 rounded-xl border border-border-subtle/50">
        <div className="md:col-span-6 relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Hostname, IP, MAC, Subnet, atau Lokasi..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-card border border-border-subtle font-mono text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            <option value="router">Router / Gateway</option>
            <option value="switch">Switch (Aruba & Core)</option>
            <option value="ap">Access Point (WiFi)</option>
            <option value="server">Server & Database</option>
            <option value="cctv">CCTV Surveillance</option>
            <option value="printer">Network Printer</option>
            <option value="pc">Workstation PC</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">Semua Lokasi</option>
            <option value="Data Center">Data Center / Server Room</option>
            <option value="Lantai 1">Lantai 1</option>
            <option value="Lantai 2">Lantai 2</option>
            <option value="Lantai 3">Lantai 3</option>
            <option value="Perimeter">Perimeter & Luar</option>
          </select>
        </div>
      </div>

      {/* Master Data Table */}
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-card-subtle font-mono text-[10px] text-text-muted uppercase border-b border-border-subtle">
              <th className="py-3 px-4 w-32">Status Real-Time</th>
              <th className="py-3 px-4 min-w-[200px]">Hostname • Tipe</th>
              <th className="py-3 px-4 min-w-[170px]">IP • Subnet/VLAN</th>
              <th className="py-3 px-4 min-w-[130px]">Kategori</th>
              <th className="py-3 px-4 min-w-[160px]">Lokasi • Rak</th>
              <th className="py-3 px-4 min-w-[110px]">Latency</th>
              <th className="py-3 px-4 text-right w-36">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50 text-xs text-text-primary">
            {filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-text-muted font-mono">
                  Tidak ada perangkat yang cocok dengan kriteria filter.
                </td>
              </tr>
            ) : (
              filteredDevices.map((dev) => {
                const isOffline = dev.status === 'offline';
                const isUnreachable = dev.status === 'unreachable';
                const isPinging = pingingId === dev.id;

                return (
                  <tr
                    key={dev.id}
                    className={`transition-colors hover:bg-surface-container-low/60 ${
                      isOffline ? 'bg-status-offline-surface/40' : isUnreachable ? 'bg-status-unreachable-surface/30' : ''
                    }`}
                  >
                    {/* Status */}
                    <td className="py-3 px-4">{getStatusBadge(dev.status)}</td>

                    {/* Hostname & Tipe */}
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
                            {getCategoryIcon(dev.category)}
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
                          <span className="font-mono text-[10px] text-text-muted truncate max-w-[180px]">
                            {dev.details || dev.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* IP & Subnet */}
                    <td className="py-3 px-4 font-mono">
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary">{dev.ip}</span>
                        <span className="text-[10px] text-text-muted truncate max-w-[160px]">
                          {dev.subnet_vlan || 'LAN'}
                        </span>
                      </div>
                    </td>

                    {/* Kategori Badge */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-text-secondary text-[11px] font-medium capitalize">
                        {dev.category}
                      </span>
                    </td>

                    {/* Lokasi & Rak */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">{dev.location}</span>
                        <span className="font-mono text-[10px] text-text-muted">{dev.rack || '-'}</span>
                      </div>
                    </td>

                    {/* Latency */}
                    <td className="py-3 px-4 font-mono">
                      {dev.status === 'offline' ? (
                        <span className="text-status-offline font-bold">DOWN</span>
                      ) : dev.status === 'unreachable' ? (
                        <span className="text-status-unreachable font-semibold">BLOCKED</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-status-online font-bold">{dev.latency_ms} ms</span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-online"></span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onPing(dev.id)}
                          disabled={isPinging}
                          className="p-1.5 rounded hover:bg-surface-container text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
                          title="Cek Ping Sekarang"
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isPinging ? 'animate-spin text-primary' : ''
                            }`}
                          >
                            sync
                          </span>
                        </button>
                        <button
                          onClick={() => onToggleMaintenance(dev.id)}
                          className={`p-1.5 rounded hover:bg-surface-container transition-colors ${
                            dev.maintenance_mode ? 'text-status-maintenance' : 'text-text-muted hover:text-text-primary'
                          }`}
                          title={dev.maintenance_mode ? 'Nonaktifkan Maintenance' : 'Set Maintenance'}
                        >
                          <span className="material-symbols-outlined text-[18px]">build</span>
                        </button>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(dev)}
                            className="p-1.5 rounded hover:bg-surface-container text-text-muted hover:text-primary transition-colors"
                            title="Edit Perangkat"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(dev.id)}
                            className="p-1.5 rounded hover:bg-status-offline-surface text-text-muted hover:text-status-offline transition-colors"
                            title="Hapus Perangkat"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

