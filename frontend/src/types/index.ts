export type DeviceStatus = 'online' | 'offline' | 'unreachable' | 'maintenance';

export interface Device {
  id: number;
  hostname: string;
  ip: string;
  mac: string;
  category: 'router' | 'switch' | 'ap' | 'server' | 'cctv' | 'printer' | 'pc';
  subnet_vlan: string;
  parent_id?: number | null;
  parent_name?: string;
  location: string;
  rack: string;
  check_method: 'icmp' | 'tcp' | 'snmp';
  check_interval_sec: number;
  target_port: number;
  status: DeviceStatus;
  latency_ms: number;
  packet_loss: number;
  fail_count: number;
  maintenance_mode: boolean;
  details: string;
  last_check: string;
  last_status_change: string;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: number;
  device_id: number;
  device_hostname: string;
  device_ip: string;
  category: string;
  location: string;
  started_at: string;
  resolved_at?: string | null;
  duration_minutes: number;
  status: 'ongoing' | 'resolved';
  protocol_trigger: string;
  root_cause: string;
  escalation_level: string;
}

export interface DashboardSummary {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  unreachable_devices: number;
  maintenance_devices: number;
  average_latency_ms: number;
  overall_uptime_pct: number;
  active_incidents: number;
}

export interface TopologyNode {
  id: number;
  node_key: string;
  label: string;
  type: string;
  ip: string;
  ports: string;
  status: string;
  x_2d: number;
  y_2d: number;
  x_3d: number;
  y_3d: number;
  z_3d: number;
}

export interface TopologyLink {
  id: number;
  from_key: string;
  to_key: string;
  link_type: 'line_fo' | 'plan_baru' | 'line_lama';
  active: boolean;
}

export interface NotificationSetting {
  id: number;
  channel: string;
  name: string;
  enabled: boolean;
  config_json: string;
  active_hours: string;
  root_suppression: boolean;
}

