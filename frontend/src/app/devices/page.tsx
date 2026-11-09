'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { DeviceModal } from '../../components/DeviceModal';
import { SubnetScanModal } from '../../components/SubnetScanModal';
import { DeviceTable } from '../../components/DeviceTable';
import { Device } from '../../types';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('Semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
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

  const handleSaveDevice = async (deviceData: Partial<Device>) => {
    try {
      if (editingDevice) {
        await fetch(`/api/devices/${editingDevice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deviceData),
        });
      } else {
        await fetch('/api/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deviceData),
        });
      }
      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDevice = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus perangkat ini?')) return;
    try {
      await fetch(`/api/devices/${id}`, { method: 'DELETE' });
      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleToggleMaintenance = async (id: number) => {
    try {
      await fetch(`/api/devices/${id}/maintenance`, { method: 'POST' });
      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportScannedHost = async (host: any) => {
    await fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostname: host.suggest_name.replace(/\s+/g, '-').toUpperCase(),
        ip: host.ip,
        mac: host.mac,
        category: host.suggest_name.toLowerCase().includes('switch')
          ? 'switch'
          : host.suggest_name.toLowerCase().includes('printer')
          ? 'printer'
          : 'router',
        location: 'Kantor Pusat',
        check_method: 'icmp',
        check_interval_sec: 15,
        status: 'online',
        details: host.suggest_name,
      }),
    });
    fetchDevices();
  };

  // Locations tabs
  const locationTabs = [
    { label: 'Semua Lokasi', count: devices.length },
    { label: 'Data Center', count: devices.filter((d) => d.location.includes('Data Center')).length },
    { label: 'Lantai 1', count: devices.filter((d) => d.location.includes('Lantai 1')).length },
    { label: 'Lantai 2', count: devices.filter((d) => d.location.includes('Lantai 2')).length },
    { label: 'Lantai 3', count: devices.filter((d) => d.location.includes('Lantai 3')).length },
    { label: 'Perimeter', count: devices.filter((d) => d.location.includes('Perimeter')).length },
  ];

  const filteredDevices =
    selectedLocation === 'Semua'
      ? devices
      : devices.filter((d) => d.location.includes(selectedLocation));

  return (
    <div className="min-h-screen bg-surface-canvas font-body text-on-surface">
      <Sidebar
        stats={{
          avgLatency: 12.4,
          activeNodes: devices.filter((d) => d.status === 'online').length,
          totalNodes: devices.length,
        }}
      />

      <div className="pl-72">
        <Header incidentCount={devices.filter((d) => d.status === 'offline').length} />

        <main className="w-full pt-16 min-h-screen px-8 py-8 flex flex-col gap-6">
          {/* Top Command Overview Bar */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-surface-card p-6 rounded-xl shadow-sm border border-border-subtle">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold text-primary">
                  NOC Inventory • Module F-01 – F-07
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-online-surface text-status-online font-mono text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-online"></span> SYNC ACTIVE
                </span>
              </div>
              <h1 className="font-headline text-2xl font-bold text-text-primary tracking-tight">
                Inventaris Perangkat Jaringan (Device Management)
              </h1>
              <p className="text-xs text-text-secondary">
                Monitoring terintegrasi, pemetaan dependensi induk anti-false alarm, dan eksekusi diagnostik real-time.
              </p>
            </div>

            {/* Quick Actions CTA */}
            <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container text-text-primary hover:bg-surface-container-high transition-all shadow-sm text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[18px] text-telemetry-cyan">radar</span>
                <span>Subnet Scanner (F-06)</span>
              </button>

              <a
                href="/api/devices/export-csv"
                download="devices.csv"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-card-subtle text-text-secondary hover:text-text-primary hover:bg-surface-container-low transition-all shadow-sm text-xs border border-border-subtle"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export CSV (F-32)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setEditingDevice(null);
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-headline text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ Tambah Perangkat Baru (F-01)</span>
              </button>
            </div>
          </div>

          {/* Location Tabs Strip */}
          <div className="flex items-center justify-between overflow-x-auto bg-surface-card p-1.5 rounded-xl shadow-sm border border-border-subtle">
            <div className="flex items-center gap-1 min-w-max">
              {locationTabs.map((tab) => {
                const isActive = selectedLocation === tab.label || (selectedLocation === 'Semua' && tab.label === 'Semua Lokasi');
                return (
                  <button
                    key={tab.label}
                    onClick={() => setSelectedLocation(tab.label === 'Semua Lokasi' ? 'Semua' : tab.label)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">domain</span>
                    <span>
                      {tab.label} ({tab.count})
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden 2xl:flex items-center gap-1 text-text-muted px-3 font-mono text-[10px] font-bold">
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>CLUSTER AUTO-DISCOVERY ENABLED</span>
            </div>
          </div>

          {/* Device Table */}
          <DeviceTable
            devices={filteredDevices}
            onPing={handlePing}
            onToggleMaintenance={handleToggleMaintenance}
            onEdit={(dev) => {
              setEditingDevice(dev);
              setModalOpen(true);
            }}
            onDelete={handleDeleteDevice}
            pingingId={pingingId}
          />
        </main>
      </div>

      {/* Add / Edit Device Modal */}
      <DeviceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveDevice}
        editingDevice={editingDevice}
        devicesList={devices}
      />

      {/* Subnet Scanner Modal */}
      <SubnetScanModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onImportHost={handleImportScannedHost}
      />
    </div>
  );
}

