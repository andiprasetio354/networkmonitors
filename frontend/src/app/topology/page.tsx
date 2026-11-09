'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Topology2D } from '../../components/Topology2D';
import { Topology3D } from '../../components/Topology3D';
import { TopologyNode, TopologyLink } from '../../types';

export default function TopologyPage() {
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [links, setLinks] = useState<TopologyLink[]>([]);
  const [viewMode, setViewMode] = useState<'split' | '2d' | '3d'>('split');
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    fetchTopology();
  }, []);

  const fetchTopology = async () => {
    try {
      const res = await fetch('/api/topology');
      const data = await res.json();
      setNodes(data.nodes || []);
      setLinks(data.links || []);
      if (data.nodes && data.nodes.length > 0 && !selectedNode) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualPingNode = async () => {
    if (!selectedNode) return;
    setPinging(true);
    try {
      // Find matching device by IP
      const devRes = await fetch('/api/devices');
      const devs = await devRes.json();
      const match = devs.find((d: any) => d.ip === selectedNode.ip);
      if (match) {
        await fetch(`/api/devices/${match.id}/ping`, { method: 'POST' });
      }
      setTimeout(() => {
        fetchTopology();
        setPinging(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setPinging(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas font-body text-on-surface">
      <Sidebar
        stats={{
          avgLatency: 12.4,
          activeNodes: nodes.filter((n) => n.status === 'online').length,
          totalNodes: nodes.length,
        }}
      />

      <div className="pl-72">
        <Header incidentCount={nodes.filter((n) => n.status === 'offline').length} />

        <main className="w-full pt-16 min-h-screen px-8 py-8 flex flex-col gap-6">
          {/* Title & Mode Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-card p-6 rounded-xl shadow-sm border border-border-subtle">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono mb-1">
                <span>Telemetri & Operasional</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-primary font-semibold">Dual-View Topologi Minsel</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="font-headline text-2xl font-bold text-text-primary tracking-tight">
                  Topologi Split-Screen: 2D Schematic vs 3D Perspective
                </h1>

                {/* Segmented View Mode Tabs */}
                <div className="inline-flex items-center p-1 rounded-xl bg-surface-card-subtle border border-border-subtle shadow-sm">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
                      viewMode === 'split'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">vertical_split</span>
                    <span>Split View: 2D + 3D</span>
                  </button>
                  <button
                    onClick={() => setViewMode('2d')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition-all ${
                      viewMode === '2d'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">schema</span>
                    <span>2D Schematic Only</span>
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition-all ${
                      viewMode === '3d'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
                    <span>3D Perspective Only</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchTopology()}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-card border border-border-subtle text-text-primary text-xs font-semibold hover:bg-surface-container-low shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Refresh Link</span>
              </button>
            </div>
          </div>

          {/* Main Visualizer Body */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Visualizer Container */}
            <div className={`flex flex-col gap-6 ${selectedNode ? 'xl:col-span-8 2xl:col-span-9' : 'xl:col-span-12'}`}>
              {viewMode === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-xs font-bold text-text-secondary uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">schema</span>
                      2D Blueprint Schematic (Diagram Switch Hub Minsel)
                    </span>
                    <Topology2D
                      nodes={nodes}
                      links={links}
                      selectedNodeKey={selectedNode?.node_key}
                      onSelectNode={(node) => setSelectedNode(node)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-xs font-bold text-text-secondary uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
                      3D Perspective Isometric Space
                    </span>
                    <Topology3D
                      nodes={nodes}
                      links={links}
                      selectedNodeKey={selectedNode?.node_key}
                      onSelectNode={(node) => setSelectedNode(node)}
                    />
                  </div>
                </div>
              )}

              {viewMode === '2d' && (
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs font-bold text-text-secondary uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">schema</span>
                    2D Blueprint Schematic Fullscreen View
                  </span>
                  <Topology2D
                    nodes={nodes}
                    links={links}
                    selectedNodeKey={selectedNode?.node_key}
                    onSelectNode={(node) => setSelectedNode(node)}
                  />
                </div>
              )}

              {viewMode === '3d' && (
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs font-bold text-text-secondary uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
                    3D Perspective Space Fullscreen View
                  </span>
                  <Topology3D
                    nodes={nodes}
                    links={links}
                    selectedNodeKey={selectedNode?.node_key}
                    onSelectNode={(node) => setSelectedNode(node)}
                  />
                </div>
              )}
            </div>

            {/* Inspector Drawer */}
            {selectedNode && (
              <div className="xl:col-span-4 2xl:col-span-3 bg-surface-card rounded-xl p-5 border border-border-subtle shadow-sm flex flex-col justify-between gap-5 h-fit sticky top-24">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <span className="font-mono text-[10px] uppercase font-bold text-primary">
                      Node Inspector Telemetry
                    </span>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[20px]">hub</span>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-headline text-sm font-bold text-text-primary leading-tight">
                        {selectedNode.label}
                      </h3>
                      <span className="font-mono text-xs text-primary font-semibold">
                        {selectedNode.ip}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="p-3 bg-surface-canvas rounded-lg flex items-center justify-between font-mono text-xs border border-border-subtle/50">
                    <span className="text-text-muted">Kondisi Link:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded uppercase ${
                        selectedNode.status === 'offline'
                          ? 'bg-status-offline text-white'
                          : selectedNode.status === 'warning'
                          ? 'bg-status-unreachable text-white'
                          : 'bg-status-online text-white'
                      }`}
                    >
                      {selectedNode.status}
                    </span>
                  </div>

                  {/* Node Specs */}
                  <div className="flex flex-col gap-2 font-mono text-xs text-text-secondary">
                    <div className="flex justify-between py-1 border-b border-border-subtle/40">
                      <span className="text-text-muted">Kapasitas Port:</span>
                      <span className="text-text-primary font-semibold">{selectedNode.ports}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle/40">
                      <span className="text-text-muted">Tipe Transmisi:</span>
                      <span className="text-text-primary font-semibold capitalize">
                        {selectedNode.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle/40">
                      <span className="text-text-muted">Koordinat 2D:</span>
                      <span className="text-text-primary">
                        X: {selectedNode.x_2d}, Y: {selectedNode.y_2d}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-text-muted">Koordinat 3D:</span>
                      <span className="text-text-primary">
                        [{selectedNode.x_3d}, {selectedNode.z_3d}]
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-border-subtle">
                  <button
                    onClick={handleManualPingNode}
                    disabled={pinging}
                    className="w-full py-2 px-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-headline text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${pinging ? 'animate-spin' : ''}`}>
                      sync
                    </span>
                    <span>{pinging ? 'Menguji Latensi...' : 'Tes Latensi Node Ini'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

