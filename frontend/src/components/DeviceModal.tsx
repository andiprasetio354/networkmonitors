'use client';

import React, { useState, useEffect } from 'react';
import { Device } from '../types';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Device>) => Promise<void>;
  editingDevice?: Device | null;
  devicesList?: Device[];
}

export const DeviceModal: React.FC<DeviceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDevice,
  devicesList = [],
}) => {
  const [hostname, setHostname] = useState('');
  const [ip, setIp] = useState('');
  const [mac, setMac] = useState('');
  const [category, setCategory] = useState<'router' | 'switch' | 'ap' | 'server' | 'cctv' | 'printer' | 'pc'>('switch');
  const [subnetVlan, setSubnetVlan] = useState('');
  const [parentName, setParentName] = useState('');
  const [location, setLocation] = useState('Lantai 1');
  const [rack, setRack] = useState('');
  const [checkMethod, setCheckMethod] = useState<'icmp' | 'tcp' | 'snmp'>('icmp');
  const [checkIntervalSec, setCheckIntervalSec] = useState(15);
  const [targetPort, setTargetPort] = useState(0);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingDevice) {
      setHostname(editingDevice.hostname || '');
      setIp(editingDevice.ip || '');
      setMac(editingDevice.mac || '');
      setCategory(editingDevice.category || 'switch');
      setSubnetVlan(editingDevice.subnet_vlan || '');
      setParentName(editingDevice.parent_name || '');
      setLocation(editingDevice.location || 'Lantai 1');
      setRack(editingDevice.rack || '');
      setCheckMethod(editingDevice.check_method || 'icmp');
      setCheckIntervalSec(editingDevice.check_interval_sec || 15);
      setTargetPort(editingDevice.target_port || 0);
      setMaintenanceMode(editingDevice.maintenance_mode || false);
      setDetails(editingDevice.details || '');
    } else {
      setHostname('');
      setIp('');
      setMac('');
      setCategory('switch');
      setSubnetVlan('VLAN 10 • /24');
      setParentName('');
      setLocation('Lantai 1');
      setRack('');
      setCheckMethod('icmp');
      setCheckIntervalSec(15);
      setTargetPort(0);
      setMaintenanceMode(false);
      setDetails('');
    }
  }, [editingDevice, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        hostname,
        ip,
        mac,
        category,
        subnet_vlan: subnetVlan,
        parent_name: parentName,
        location,
        rack,
        check_method: checkMethod,
        check_interval_sec: Number(checkIntervalSec),
        target_port: Number(targetPort),
        maintenance_mode: maintenanceMode,
        details,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 border border-border-subtle">
        {/* Header */}
        <div className="px-6 py-4 bg-surface-card-subtle border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">
                {editingDevice ? 'edit_note' : 'add_circle'}
              </span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-text-primary">
                {editingDevice ? 'Edit Perangkat Jaringan' : 'Tambah Perangkat Jaringan Baru (F-01)'}
              </h3>
              <p className="text-xs text-text-muted">
                Konfigurasi IP, metode polling, dan dependensi induk anti-false alarm.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-text-muted hover:text-text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: Parameter Dasar */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
              1. Parameter Utama Perangkat
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Hostname / Label Perangkat *
                </label>
                <input
                  type="text"
                  required
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="contoh: SW-ACCESS-FL2-01"
                  className="w-full px-3 py-2 rounded-lg bg-surface-canvas border border-border-subtle font-mono text-xs text-text-primary focus:outline-none focus:border-primary shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Alamat IP / FQDN Host *
                </label>
                <input
                  type="text"
                  required
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="contoh: 192.168.20.15"
                  className="w-full px-3 py-2 rounded-lg bg-surface-canvas border border-border-subtle font-mono text-xs text-text-primary focus:outline-none focus:border-primary shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Kategori Perangkat *
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-canvas border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="switch">Switch (L2 / L3 Access/Distribution / Aruba)</option>
                  <option value="router">Router / Gateway Edge</option>
                  <option value="ap">Access Point (WiFi AP)</option>
                  <option value="server">Physical / VM Server</option>
                  <option value="cctv">IP Camera Surveillance (CCTV)</option>
                  <option value="printer">Network Printer (Raw Port 9100)</option>
                  <option value="pc">Workstation PC Staf</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Subnet Mask • Tagging VLAN
                </label>
                <input
                  type="text"
                  value={subnetVlan}
                  onChange={(e) => setSubnetVlan(e.target.value)}
                  placeholder="contoh: VLAN 20 (Finance) • /24"
                  className="w-full px-3 py-2 rounded-lg bg-surface-canvas border border-border-subtle font-mono text-xs text-text-primary focus:outline-none focus:border-primary shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Topologi Dependensi Induk */}
          <div className="flex flex-col gap-2.5 bg-surface-card-subtle p-4 rounded-xl border border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
                2. Logika Dependensi Induk (F-05 Root Parent)
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-telemetry-cyan bg-surface-container px-2 py-0.5 rounded">
                <span className="material-symbols-outlined text-[13px]">shield</span>
                ANTI-FALSE ALARM
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Jika switch induk down, notifikasi alert pada perangkat ini otomatis ditunda agar tidak terjadi badai pesan alarm (alarm storm suppression).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Perangkat Induk (Parent Node)
                </label>
                <select
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer shadow-sm"
                >
                  <option value="">-- Tidak Ada Induk (Root Master Node) --</option>
                  {devicesList
                    .filter((d) => d.hostname !== hostname)
                    .map((d) => (
                      <option key={d.id} value={d.hostname}>
                        {d.hostname} ({d.ip} - {d.category})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Lokasi Fisik / Gedung / Rak
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="contoh: Lantai 2 • Rak B"
                  className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Metode Pemeriksaan */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
              3. Metode Pemeriksaan Telemetri
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Protokol Cek
                </label>
                <select
                  value={checkMethod}
                  onChange={(e: any) => setCheckMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-canvas border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="icmp">ICMP Ping Polling</option>
                  <option value="tcp">TCP Socket Port Specific</option>
                  <option value="snmp">SNMP Polling (v2c / v3)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Interval Polling
                </label>
                <select
                  value={checkIntervalSec}
                  onChange={(e) => setCheckIntervalSec(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-surface-canvas border border-border-subtle font-mono text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value={5}>5 Detik (Ultra Kritis)</option>
                  <option value={15}>15 Detik (Standar Rekomendasi)</option>
                  <option value={30}>30 Detik</option>
                  <option value={60}>60 Detik</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Port Target (Khusus TCP)
                </label>
                <input
                  type="number"
                  value={targetPort || ''}
                  onChange={(e) => setTargetPort(Number(e.target.value))}
                  placeholder="80, 443, 9100, 3389..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-canvas border border-border-subtle font-mono text-xs text-text-primary focus:outline-none focus:border-primary shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Toggle Maintenance Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-status-maintenance-surface border border-status-maintenance/20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-status-maintenance">build</span>
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Mode Pemeliharaan (F-07 Maintenance)
                </span>
                <span className="text-[11px] text-text-muted">
                  Mute notifikasi alarm saat dilakukan pergantian kabel atau konfigurasi.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-card after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-status-maintenance"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container text-text-primary hover:bg-surface-container-high transition-colors text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-headline text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>{saving ? 'Menyimpan...' : 'Simpan Perangkat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

