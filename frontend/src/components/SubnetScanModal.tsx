'use client';

import React, { useState } from 'react';

interface DiscoveredHost {
  ip: string;
  alive: boolean;
  latency_ms: number;
  mac: string;
  suggest_name: string;
}

interface SubnetScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportHost: (host: DiscoveredHost) => Promise<void>;
}

export const SubnetScanModal: React.FC<SubnetScanModalProps> = ({
  isOpen,
  onClose,
  onImportHost,
}) => {
  const [cidr, setCidr] = useState('192.168.10.0/24');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<DiscoveredHost[]>([]);
  const [importedIps, setImportedIps] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleStartScan = async () => {
    setScanning(true);
    setResults([]);
    try {
      const res = await fetch(`/api/devices/subnet-scan?cidr=${encodeURIComponent(cidr)}`);
      const data = await res.json();
      if (data.addresses) {
        setResults(data.addresses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleImport = async (host: DiscoveredHost) => {
    try {
      await onImportHost(host);
      setImportedIps((prev) => [...prev, host.ip]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border-subtle">
        {/* Header */}
        <div className="p-6 bg-surface-card-subtle flex items-center justify-between border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-sm">
              <span className={`material-symbols-outlined text-[24px] ${scanning ? 'animate-spin' : ''}`}>
                radar
              </span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-text-primary">
                Subnet Discovery & Scanner (PRD F-06)
              </h3>
              <p className="text-xs text-text-muted">
                Pindai subnet IP lokal menggunakan multi-threaded ARP/ICMP probe.
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

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              Target CIDR Subnet Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cidr}
                onChange={(e) => setCidr(e.target.value)}
                placeholder="192.168.10.0/24"
                className="flex-1 px-3.5 py-2 rounded-lg bg-surface-canvas border border-border-subtle font-mono text-xs text-text-primary focus:outline-none focus:border-primary shadow-inner"
              />
              <button
                type="button"
                onClick={handleStartScan}
                disabled={scanning}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-headline text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {scanning ? 'sync' : 'play_arrow'}
                </span>
                <span>{scanning ? 'Memindai...' : 'Mulai Scan'}</span>
              </button>
            </div>
            <span className="font-mono text-[10px] text-text-muted">
              Perkiraan durasi: ~2-4 detik (254 host addresses probe)
            </span>
          </div>

          {/* Scan Results */}
          <div className="bg-surface-card-subtle p-4 rounded-xl border border-border-subtle flex flex-col gap-3 min-h-[160px] max-h-[280px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-bold text-text-muted">
                Hasil Scanner ({results.length} Node Aktif Terdeteksi)
              </span>
              <span className="font-mono text-[10px] font-bold text-status-online bg-status-online-surface px-2 py-0.5 rounded">
                ARP / ICMP LIVE
              </span>
            </div>

            {scanning ? (
              <div className="flex flex-col items-center justify-center py-8 text-text-muted gap-2">
                <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
                  sync
                </span>
                <span className="font-mono text-xs">Memindai rentang subnet {cidr}...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-text-muted font-mono text-xs">
                Klik &quot;Mulai Scan&quot; untuk mendeteksi perangkat baru yang belum terdaftar.
              </div>
            ) : (
              <div className="divide-y divide-border-subtle/50 font-mono text-xs">
                {results.map((host) => {
                  const isImported = importedIps.includes(host.ip);
                  return (
                    <div key={host.ip} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-status-online"></span>
                        <span className="font-semibold text-text-primary">{host.ip}</span>
                        <span className="text-text-muted text-[11px]">({host.suggest_name})</span>
                        <span className="text-text-secondary text-[11px]">MAC: {host.mac}</span>
                      </div>
                      {isImported ? (
                        <span className="text-status-online font-bold text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check</span> Terdaftar
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleImport(host)}
                          className="px-2.5 py-1 rounded bg-primary-container text-white text-[11px] font-bold hover:bg-primary transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">add</span> Import Node
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-card-subtle border-t border-border-subtle flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-container text-text-primary hover:bg-surface-container-high transition-colors text-xs font-semibold"
          >
            Tutup Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

