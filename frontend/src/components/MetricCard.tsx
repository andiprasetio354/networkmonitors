'use client';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  badgeText?: string;
  accentColor: 'primary' | 'online' | 'offline' | 'unreachable' | 'maintenance';
  icon: string;
  pulsing?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtext,
  badgeText,
  accentColor,
  icon,
  pulsing = false,
}) => {
  const colorMap = {
    primary: {
      strip: 'bg-primary',
      text: 'text-text-primary',
      iconBg: 'bg-surface-container-low text-primary',
      badge: 'text-text-muted bg-surface-container-low',
    },
    online: {
      strip: 'bg-status-online',
      text: 'text-status-online',
      iconBg: 'bg-status-online-surface text-status-online',
      badge: 'text-status-online bg-status-online-surface',
    },
    offline: {
      strip: 'bg-status-offline',
      text: 'text-status-offline',
      iconBg: 'bg-status-offline-surface text-status-offline',
      badge: 'text-status-offline bg-status-offline-surface',
    },
    unreachable: {
      strip: 'bg-status-unreachable',
      text: 'text-status-unreachable',
      iconBg: 'bg-status-unreachable-surface text-status-unreachable',
      badge: 'text-status-unreachable bg-status-unreachable-surface',
    },
    maintenance: {
      strip: 'bg-status-maintenance',
      text: 'text-status-maintenance',
      iconBg: 'bg-status-maintenance-surface text-status-maintenance',
      badge: 'text-status-maintenance bg-status-maintenance-surface',
    },
  };

  const currentTheme = colorMap[accentColor] || colorMap.primary;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-surface-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
        accentColor === 'offline' && Number(value) > 0 ? 'ring-1 ring-status-offline/30' : ''
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${currentTheme.strip}`}></div>

      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase font-bold text-text-muted flex items-center gap-1.5">
            {pulsing && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-offline opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-offline"></span>
              </span>
            )}
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`font-headline text-3xl font-bold ${currentTheme.text}`}>{value}</span>
            {unit && <span className="font-mono text-xs text-text-secondary">{unit}</span>}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentTheme.iconBg}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-xs text-text-secondary">
        <span className="font-mono text-[11px] truncate">{subtext}</span>
        {badgeText && (
          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${currentTheme.badge}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};

