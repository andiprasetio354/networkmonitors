'use client';

import React, { useState, useEffect } from 'react';
import { NotificationSetting } from '../types';

interface NotificationSettingsProps {
  onDispatchTest: () => Promise<any>;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onDispatchTest }) => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingChannel, setSavingChannel] = useState<string | null>(null);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item: NotificationSetting) => {
    setSavingChannel(item.channel);
    try {
      const updated = { ...item, enabled: !item.enabled };
      await fetch(`/api/notifications/${item.channel}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setSettings((prev) => prev.map((s) => (s.channel === item.channel ? updated : s)));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingChannel(null);
    }
  };

  const handleTestDispatch = async () => {
    try {
      const result = await onDispatchTest();
      setDispatchResult(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-lg font-bold text-text-primary">
            Orkestrasi Alarm Multi-Kanal (PRD Sec 7.3 F-20 – F-24)
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Pengaturan rute notifikasi otomatis saat perangkat down dan pulih. Dilengkapi fitur penekan badai alarm (alarm storm suppression).
          </p>
        </div>
        <button
          onClick={handleTestDispatch}
          className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-headline text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">bolt</span>
          <span>Kirim Alarm Uji Coba</span>
        </button>
      </div>

      {/* Test Dispatch Result Alert if triggered */}
      {dispatchResult && (
        <div className="p-4 rounded-xl bg-status-online-surface border border-status-online/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-status-online flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              ALARM UJI COBA BERHASIL DIORKESTRASIKAN
            </span>
            <span className="font-mono text-[11px] text-text-muted">{dispatchResult.timestamp}</span>
          </div>
          <p className="text-xs text-text-primary">{dispatchResult.message}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            {dispatchResult.channels_delivered?.map((ch: any, idx: number) => (
              <div key={idx} className="p-2 rounded bg-white border border-border-subtle text-[11px]">
                <span className="font-bold block text-text-primary">{ch.channel}</span>
                <span className="font-mono text-status-online text-[10px] block">{ch.status}</span>
                <span className="text-text-muted text-[10px] truncate block">{ch.target}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {settings.map((item) => {
          let icon = 'notifications';
          let subtitle = '';

          if (item.channel === 'telegram') {
            icon = 'send';
            subtitle = 'Notifikasi instan via Bot Telegram ke group NOC/Helpdesk';
          } else if (item.channel === 'whatsapp') {
            icon = 'chat';
            subtitle = 'Gateway WhatsApp Webhook untuk pesan darurat ke staf on-call';
          } else if (item.channel === 'email') {
            icon = 'mail';
            subtitle = 'Laporan insiden resmi via SMTP Office365 / Gmail';
          } else if (item.channel === 'browser') {
            icon = 'volume_up';
            subtitle = 'Notifikasi suara sirine dan desktop push langsung di browser';
          }

          return (
            <div
              key={item.channel}
              className="bg-surface-card rounded-xl p-5 border border-border-subtle shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">{icon}</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-sm font-bold text-text-primary">{item.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => handleToggle(item)}
                    disabled={savingChannel === item.channel}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-card after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Config Details */}
              <div className="p-3 bg-surface-canvas rounded-lg font-mono text-xs text-text-secondary border border-border-subtle/50 flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-text-muted">Status:</span>
                  <span className={`font-bold ${item.enabled ? 'text-status-online' : 'text-text-muted'}`}>
                    {item.enabled ? 'AKTIF (ON)' : 'NONAKTIF (OFF)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Jam Aktif:</span>
                  <span className="text-text-primary">{item.active_hours}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Anti-Badai Alarm:</span>
                  <span className="text-primary font-semibold">
                    {item.root_suppression ? 'Enabled (Parent Mute)' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

