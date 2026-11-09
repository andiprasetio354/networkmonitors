'use client';

import React from 'react';
import { TopologyNode, TopologyLink } from '../types';

interface Topology2DProps {
  nodes: TopologyNode[];
  links: TopologyLink[];
  selectedNodeKey?: string | null;
  onSelectNode: (node: TopologyNode) => void;
}

export const Topology2D: React.FC<Topology2DProps> = ({
  nodes,
  links,
  selectedNodeKey,
  onSelectNode,
}) => {
  const nodeMap = new Map<string, TopologyNode>();
  nodes.forEach((n) => nodeMap.set(n.node_key, n));

  return (
    <div className="relative w-full h-[620px] rounded-xl bg-white border border-border-subtle blueprint-grid overflow-hidden shadow-inner flex flex-col">
      {/* Blueprint Legend Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-border-subtle shadow-sm text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-[#0062ff] rounded"></span>
          <span>Kabel FO (Fiber Optic)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-[#f97316] rounded"></span>
          <span>Plan Baru FO</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-[#64748b] rounded"></span>
          <span>Line Lama (UTP)</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg className="w-full h-full select-none" viewBox="0 0 900 900">
        <defs>
          <filter id="glowFo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Cable Links */}
        {links.map((link, idx) => {
          const from = nodeMap.get(link.from_key);
          const to = nodeMap.get(link.to_key);
          if (!from || !to) return null;

          let strokeColor = '#64748b';
          let strokeWidth = '1.5';
          let strokeDash = 'none';

          if (link.link_type === 'line_fo') {
            strokeColor = '#0062ff';
            strokeWidth = '2.5';
          } else if (link.link_type === 'plan_baru') {
            strokeColor = '#f97316';
            strokeWidth = '2.5';
            strokeDash = '4 3';
          }

          // Orthogonal path
          const midX = (from.x_2d + to.x_2d) / 2;
          const d = `M ${from.x_2d} ${from.y_2d} H ${midX} V ${to.y_2d} H ${to.x_2d}`;

          return (
            <path
              key={`link-${idx}`}
              d={d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDash}
              opacity="0.8"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNodeKey === node.node_key;
          const isOffline = node.status === 'offline';
          const isWarning = node.status === 'warning';

          let statusColor = '#10b981';
          if (isOffline) statusColor = '#ef4444';
          else if (isWarning) statusColor = '#f59e0b';

          return (
            <g
              key={node.node_key}
              transform={`translate(${node.x_2d}, ${node.y_2d})`}
              className="cursor-pointer"
              onClick={() => onSelectNode(node)}
            >
              {/* Box */}
              <rect
                x="-75"
                y="-25"
                width="150"
                height="50"
                rx="8"
                fill="#ffffff"
                stroke={isSelected ? '#0062ff' : isOffline ? '#ef4444' : '#cbd5e1'}
                strokeWidth={isSelected ? '3.5' : '1.5'}
                filter={isSelected ? 'drop-shadow(0 0 10px rgba(0,98,255,0.4))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))'}
              />

              {/* Status pill dot */}
              <circle cx="-60" cy="0" r="5" fill={statusColor} />

              {/* Node Title & IP */}
              <text
                x="-48"
                y="-4"
                fontSize="10"
                fontWeight="700"
                fontFamily="Space Grotesk, sans-serif"
                fill="#0f172a"
              >
                {node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label}
              </text>
              <text
                x="-48"
                y="12"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fill="#64748b"
              >
                {node.ip} • {node.ports}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

