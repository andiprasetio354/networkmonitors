package models

import (
	"time"
)

type DeviceStatus string

const (
	StatusOnline      DeviceStatus = "online"
	StatusOffline     DeviceStatus = "offline"
	StatusUnreachable DeviceStatus = "unreachable"
	StatusMaintenance DeviceStatus = "maintenance"
)

type Device struct {
	ID               uint         `gorm:"primaryKey" json:"id"`
	Hostname         string       `gorm:"size:100;not null;index" json:"hostname"`
	IP               string       `gorm:"size:45;not null;index" json:"ip"`
	MAC              string       `gorm:"size:50" json:"mac"`
	Category         string       `gorm:"size:50;not null;index" json:"category"` // router, switch, ap, server, cctv, printer, pc
	SubnetVlan       string       `gorm:"size:100" json:"subnet_vlan"`
	ParentID         *uint        `gorm:"index" json:"parent_id"`
	ParentName       string       `gorm:"size:100" json:"parent_name"`
	Location         string       `gorm:"size:100;index" json:"location"` // Data Center, Lantai 1, Lantai 2, Lantai 3, Perimeter
	Rack             string       `gorm:"size:100" json:"rack"`
	CheckMethod      string       `gorm:"size:20;default:'icmp'" json:"check_method"` // icmp, tcp, snmp
	CheckIntervalSec int          `gorm:"default:15" json:"check_interval_sec"`
	TargetPort       int          `gorm:"default:0" json:"target_port"`
	Status           DeviceStatus `gorm:"size:20;default:'online';index" json:"status"`
	LatencyMs        float64      `gorm:"default:0" json:"latency_ms"`
	PacketLoss       float64      `gorm:"default:0" json:"packet_loss"`
	FailCount        int          `gorm:"default:0" json:"fail_count"`
	MaintenanceMode  bool         `gorm:"default:false" json:"maintenance_mode"`
	Details          string       `gorm:"type:text" json:"details"`
	LastCheck        time.Time    `json:"last_check"`
	LastStatusChange time.Time    `json:"last_status_change"`
	CreatedAt        time.Time    `json:"created_at"`
	UpdatedAt        time.Time    `json:"updated_at"`
}

type CheckResult struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	DeviceID    uint      `gorm:"index" json:"device_id"`
	CheckedAt   time.Time `gorm:"index" json:"checked_at"`
	Success     bool      `json:"success"`
	LatencyMs   float64   `json:"latency_ms"`
	PacketLoss  float64   `json:"packet_loss"`
	CheckMethod string    `gorm:"size:20" json:"check_method"`
	Details     string    `gorm:"size:255" json:"details"`
}

type Incident struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	DeviceID        uint       `gorm:"index" json:"device_id"`
	DeviceHostname  string     `gorm:"size:100" json:"device_hostname"`
	DeviceIP        string     `gorm:"size:45" json:"device_ip"`
	Category        string     `gorm:"size:50" json:"category"`
	Location        string     `gorm:"size:100" json:"location"`
	StartedAt       time.Time  `gorm:"index" json:"started_at"`
	ResolvedAt      *time.Time `json:"resolved_at"`
	DurationMinutes int        `gorm:"default:0" json:"duration_minutes"`
	Status          string     `gorm:"size:20;default:'ongoing';index" json:"status"` // ongoing, resolved
	ProtocolTrigger string     `gorm:"size:100" json:"protocol_trigger"`
	RootCause       string     `gorm:"size:255" json:"root_cause"`
	EscalationLevel string     `gorm:"size:50;default:'Tier-1'" json:"escalation_level"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type NotificationSetting struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Channel         string    `gorm:"size:50;uniqueIndex;not null" json:"channel"` // telegram, whatsapp, email, webhook, browser
	Name            string    `gorm:"size:100" json:"name"`
	Enabled         bool      `gorm:"default:true" json:"enabled"`
	ConfigJSON      string    `gorm:"type:text" json:"config_json"`
	ActiveHours     string    `gorm:"size:50;default:'24x7'" json:"active_hours"`
	RootSuppression bool      `gorm:"default:true" json:"root_suppression"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type TopologyNode struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	NodeKey   string    `gorm:"size:50;uniqueIndex" json:"node_key"`
	Label     string    `gorm:"size:100" json:"label"`
	Type      string    `gorm:"size:50" json:"type"` // core_server, switch_fo, switch_poe, switch_std, switch_bundle, ap_wireless
	IP        string    `gorm:"size:45" json:"ip"`
	Ports     string    `gorm:"size:50" json:"ports"`
	Status    string    `gorm:"size:20;default:'online'" json:"status"`
	X2D       int       `json:"x_2d"`
	Y2D       int       `json:"y_2d"`
	X3D       float64   `json:"x_3d"`
	Y3D       float64   `json:"y_3d"`
	Z3D       float64   `json:"z_3d"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type TopologyLink struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	FromKey   string    `gorm:"size:50;index" json:"from_key"`
	ToKey     string    `gorm:"size:50;index" json:"to_key"`
	LinkType  string    `gorm:"size:50" json:"link_type"` // line_fo, plan_baru, line_lama
	Active    bool      `gorm:"default:true" json:"active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type DashboardSummary struct {
	TotalDevices       int64   `json:"total_devices"`
	OnlineDevices      int64   `json:"online_devices"`
	OfflineDevices     int64   `json:"offline_devices"`
	UnreachableDevices int64   `json:"unreachable_devices"`
	MaintenanceDevices int64   `json:"maintenance_devices"`
	AverageLatencyMs   float64 `json:"average_latency_ms"`
	OverallUptimePct   float64 `json:"overall_uptime_pct"`
	ActiveIncidents    int64   `json:"active_incidents"`
}

