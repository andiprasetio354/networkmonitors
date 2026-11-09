'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TopologyNode, TopologyLink } from '../types';

interface Topology3DProps {
  nodes: TopologyNode[];
  links: TopologyLink[];
  selectedNodeKey?: string | null;
  onSelectNode: (node: TopologyNode) => void;
}

export const Topology3D: React.FC<Topology3DProps> = ({
  nodes,
  links,
  selectedNodeKey,
  onSelectNode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 620;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
    camera.position.set(0, 480, 520);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(200, 400, 200);
    scene.add(dirLight);

    const bluePointLight = new THREE.PointLight(0x0062ff, 2.5, 800);
    bluePointLight.position.set(0, 150, 0);
    scene.add(bluePointLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(1200, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Groups
    const nodesGroup = new THREE.Group();
    const cablesGroup = new THREE.Group();
    scene.add(cablesGroup);
    scene.add(nodesGroup);

    const nodeMeshMap = new Map<string, THREE.Mesh>();
    const nodeObjMap = new Map<string, TopologyNode>();

    // Geometries
    const boxGeo = new THREE.BoxGeometry(40, 14, 25);
    const serverGeo = new THREE.BoxGeometry(55, 30, 40);

    nodes.forEach((n) => {
      nodeObjMap.set(n.node_key, n);
      const isServer = n.type === 'core_server';
      const geo = isServer ? serverGeo : boxGeo;

      let color = 0x0062ff;
      if (n.status === 'offline') color = 0xef4444;
      else if (n.status === 'warning') color = 0xf59e0b;

      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.5,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(n.x_3d, isServer ? 15 : 7, n.z_3d);
      mesh.userData = { nodeKey: n.node_key };

      // Status indicator LED sphere on top
      const ledGeo = new THREE.SphereGeometry(3, 16, 16);
      const ledMat = new THREE.MeshBasicMaterial({
        color: n.status === 'offline' ? 0xef4444 : n.status === 'warning' ? 0xf59e0b : 0x10b981,
      });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0, isServer ? 18 : 10, 0);
      mesh.add(led);

      nodesGroup.add(mesh);
      nodeMeshMap.set(n.node_key, mesh);
    });

    // 3D Cables
    links.forEach((link) => {
      const fromMesh = nodeMeshMap.get(link.from_key);
      const toMesh = nodeMeshMap.get(link.to_key);
      if (!fromMesh || !toMesh) return;

      const points = [
        new THREE.Vector3(fromMesh.position.x, fromMesh.position.y, fromMesh.position.z),
        new THREE.Vector3(toMesh.position.x, toMesh.position.y, toMesh.position.z),
      ];
      const curve = new THREE.LineCurve3(points[0], points[1]);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 1.8, 8, false);

      let cableColor = 0x64748b;
      if (link.link_type === 'line_fo') cableColor = 0x00c2ff;
      else if (link.link_type === 'plan_baru') cableColor = 0xf97316;

      const cableMat = new THREE.MeshStandardMaterial({
        color: cableColor,
        roughness: 0.2,
        metalness: 0.8,
        emissive: cableColor,
        emissiveIntensity: 0.2,
      });

      const cableMesh = new THREE.Mesh(tubeGeo, cableMat);
      cablesGroup.add(cableMesh);
    });

    // Raycaster for click interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodesGroup.children, true);

      if (intersects.length > 0) {
        let hit: any = intersects[0].object;
        while (hit && !hit.userData.nodeKey && hit.parent) {
          hit = hit.parent;
        }
        if (hit && hit.userData.nodeKey) {
          const matched = nodeObjMap.get(hit.userData.nodeKey);
          if (matched) {
            onSelectNode(matched);
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handlePointerDown);

    // Subtle gentle camera rotation animation
    let reqId: number;
    let angle = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      angle += 0.0015;
      camera.position.x = 650 * Math.sin(angle);
      camera.position.z = 650 * Math.cos(angle);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.domElement.removeEventListener('click', handlePointerDown);
      renderer.dispose();
    };
  }, [nodes, links, onSelectNode]);

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden shadow-inner border border-slate-800">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-300">
        Klik node 3D untuk inspeksi • Rotasi orbit otomatis
      </div>
    </div>
  );
};

