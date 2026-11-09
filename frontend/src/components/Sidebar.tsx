'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  stats?: {
    avgLatency?: number;
    activeNodes?: number;
    totalNodes?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ stats }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard Utama', href: '/', icon: 'monitoring' },
    { label: 'Manajemen Perangkat', href: '/devices', icon: 'router' },
    { label: 'Topologi Jaringan', href: '/topology', icon: 'hub' },
    { label: 'Monitoring LAN Aruba', href: '/lan', icon: 'lan' },
    { label: 'Riwayat & Log Insiden', href: '/incidents', icon: 'receipt_long' },
  ];

  const configItems = [
    { label: 'Pengaturan Notifikasi', href: '/incidents?tab=settings', icon: 'notifications_active' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-card border-r border-border-subtle z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-border-subtle">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-headline font-bold text-lg shadow-sm">
            W
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold text-text-primary tracking-tight">Wifitics</span>
            <span className="font-mono text-[9px] uppercase text-telemetry-cyan font-bold tracking-widest leading-[10px]">
              NOC Commander v4.2
            </span>
          </div>
        </div>

        {/* Section 1 */}
        <div className="px-6 py-3">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-text-muted">
            Telemetri & Operasional
          </span>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-[0_2px_8px_rgba(0,98,255,0.3)]'
                    : 'text-text-secondary hover:bg-surface-container-low hover:text-text-primary'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] transition-colors ${
                    isActive ? 'text-white' : 'text-text-muted group-hover:text-primary'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Section 2 */}
        <div className="px-6 pt-5 pb-2">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-text-muted">
            Konfigurasi Sistem
          </span>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {configItems.map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-container-low hover:text-text-primary transition-all group"
              >
                <span className="material-symbols-outlined text-[20px] text-text-muted group-hover:text-primary transition-colors">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Cluster Status Box */}
      <div className="p-4 m-4 rounded-xl bg-surface-card-subtle border border-border-subtle flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase font-bold text-text-muted">Cluster Status</span>
          <span className="font-mono text-[10px] font-bold text-status-online bg-status-online-surface px-2 py-0.5 rounded border border-status-online/20">
            OPTIMAL
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-text-secondary mt-1">
          <span>Avg Latency</span>
          <span className="font-mono font-semibold text-text-primary">
            {stats?.avgLatency ? `${stats.avgLatency} ms` : '12.4 ms'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Active Nodes</span>
          <span className="font-mono font-semibold text-primary">
            {stats?.activeNodes !== undefined && stats?.totalNodes !== undefined
              ? `${stats.activeNodes} / ${stats.totalNodes}`
              : '16 / 20'}
          </span>
        </div>
      </div>
    </aside>
  );
};

