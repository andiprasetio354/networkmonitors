package database

import (
	"fmt"
	"log"
	"time"

	"wifitics-backend/config"
	"wifitics-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(cfg config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established successfully")

	// Auto migrate all tables
	err = DB.AutoMigrate(
		&models.Device{},
		&models.CheckResult{},
		&models.Incident{},
		&models.NotificationSetting{},
		&models.TopologyNode{},
		&models.TopologyLink{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to auto migrate tables: %w", err)
	}

	// Seed default data if empty
	seedData(DB)

	return DB, nil
}

func seedData(db *gorm.DB) {
	var count int64
	db.Model(&models.Device{}).Count(&count)
	if count > 0 {
		return
	}

	log.Println("Seeding initial network monitoring data...")

	// 1. Root & Core Switches
	now := time.Now()
	devices := []models.Device{
		{
			Hostname: "RT-GATEWAY-01", IP: "192.168.1.1", MAC: "48:8F:5A:11:22:33",
			Category: "router", SubnetVlan: "VLAN 1 (Management) • /24",
			Location: "Data Center", Rack: "Rack A1",
			CheckMethod: "icmp", CheckIntervalSec: 5, TargetPort: 80,
			Status: models.StatusOnline, LatencyMs: 0.8, PacketLoss: 0,
			Details: "MikroTik CCR1036-8G-2S+ • Master BGP Router",
			LastCheck: now, LastStatusChange: now.Add(-72 * time.Hour),
		},
		{
			Hostname: "SW-CORE-L3", IP: "192.168.1.2", MAC: "CC:D5:39:44:55:66",
			Category: "switch", SubnetVlan: "VLAN 1 (Backbone Core) • /24",
			Location: "Data Center", Rack: "Rack A1",
			CheckMethod: "icmp", CheckIntervalSec: 5, TargetPort: 22,
			Status: models.StatusOnline, LatencyMs: 1.1, PacketLoss: 0,
			Details: "Cisco Catalyst 3850 48-Port 10G SFP+ Uplink",
			LastCheck: now, LastStatusChange: now.Add(-48 * time.Hour),
		},
		{
			Hostname: "SW-CORE-FL03", IP: "192.168.10.1", MAC: "70:B3:D5:12:34:56",
			Category: "switch", SubnetVlan: "VLAN 10 (Office Floor 3) • /24",
			Location: "Lantai 3", Rack: "Rack-C",
			CheckMethod: "icmp", CheckIntervalSec: 10, TargetPort: 22,
			Status: models.StatusOffline, LatencyMs: 0, PacketLoss: 100, FailCount: 4,
			Details: "SNMP trap linkDown port Gi0/1 • Core Switch Lantai 3",
			LastCheck: now, LastStatusChange: now.Add(-15 * time.Minute),
		},
		{
			Hostname: "SW-ARUBA-600-CORE", IP: "192.168.1.10", MAC: "AC:4A:FE:99:88:77",
			Category: "switch", SubnetVlan: "Gateway LAN Default • /24",
			Location: "Data Center", Rack: "Server Room • U20",
			CheckMethod: "icmp", CheckIntervalSec: 5, TargetPort: 22,
			Status: models.StatusOnline, LatencyMs: 0.5, PacketLoss: 0,
			Details: "Aruba Instant On 600 / 1930 24G 4SFP/SFP+ Switch",
			LastCheck: now, LastStatusChange: now.Add(-96 * time.Hour),
		},
		{
			Hostname: "SW-ARUBA-2530-LT1", IP: "192.168.1.11", MAC: "70:3A:0E:55:66:77",
			Category: "switch", SubnetVlan: "VLAN 10 (Office LAN) • /24",
			Location: "Lantai 1", Rack: "Lt.1 • Rak Network A1",
			CheckMethod: "icmp", CheckIntervalSec: 10, TargetPort: 22,
			Status: models.StatusOnline, LatencyMs: 1.2, PacketLoss: 0,
			Details: "Aruba 2530 24G Switch • Uplink G24 Active",
			LastCheck: now, LastStatusChange: now.Add(-24 * time.Hour),
		},
		{
			Hostname: "SW-ARUBA-2540-LT2", IP: "192.168.1.12", MAC: "98:F2:B3:22:11:00",
			Category: "switch", SubnetVlan: "VLAN 20 (Workstation) • /24",
			Location: "Lantai 2", Rack: "Lt.2 • Rak Distribusi B",
			CheckMethod: "icmp", CheckIntervalSec: 10, TargetPort: 22,
			Status: models.StatusOnline, LatencyMs: 0.8, PacketLoss: 0,
			Details: "Aruba 2540 48G PoE+ Switch • Budget 184W / 370W",
			LastCheck: now, LastStatusChange: now.Add(-24 * time.Hour),
		},
		// Unreachable nodes due to SW-CORE-FL03 being down
		{
			Hostname: "AP-MEETING-VIP", IP: "192.168.30.45", MAC: "B4:FB:E4:11:22:99",
			Category: "ap", SubnetVlan: "VLAN 30 (Executive WiFi)",
			Location: "Lantai 3", Rack: "Lt 3 Boardroom", ParentName: "SW-CORE-FL03",
			CheckMethod: "icmp", CheckIntervalSec: 15, TargetPort: 80,
			Status: models.StatusUnreachable, LatencyMs: 0, PacketLoss: 100,
			Details: "ICMP 3x failed • Parent SW-CORE-FL03 Unreachable (PoE Loss)",
			LastCheck: now, LastStatusChange: now.Add(-14 * time.Minute),
		},
		{
			Hostname: "PC-EXEC-DIR", IP: "192.168.30.12", MAC: "3C:52:82:11:00:44",
			Category: "pc", SubnetVlan: "VLAN 30 (Executive VIP)",
			Location: "Lantai 3", Rack: "Ruang Direktur", ParentName: "SW-CORE-FL03",
			CheckMethod: "icmp", CheckIntervalSec: 15, TargetPort: 3389,
			Status: models.StatusUnreachable, LatencyMs: 0, PacketLoss: 100,
			Details: "Dell Latitude Desk Dock • Parent SW-CORE-FL03 Down",
			LastCheck: now, LastStatusChange: now.Add(-14 * time.Minute),
		},
		// Offline end-devices
		{
			Hostname: "PRN-FINANCE-02", IP: "192.168.20.88", MAC: "00:1E:68:88:99:AA",
			Category: "printer", SubnetVlan: "VLAN 20 • Raw Port 9100",
			Location: "Lantai 2", Rack: "Lantai 2 Finance Wing",
			CheckMethod: "tcp", CheckIntervalSec: 15, TargetPort: 9100,
			Status: models.StatusOffline, LatencyMs: 18.0, PacketLoss: 0, FailCount: 3,
			Details: "TCP Port 9100 RAW Unreachable • Paper Jam / Queue Stalled",
			LastCheck: now, LastStatusChange: now.Add(-11 * time.Minute),
		},
		{
			Hostname: "CCTV-GATE-NORTH", IP: "192.168.40.12", MAC: "A4:14:37:44:33:22",
			Category: "cctv", SubnetVlan: "VLAN 40 (Surveillance)",
			Location: "Perimeter", Rack: "Gerbang Utama Depan",
			CheckMethod: "tcp", CheckIntervalSec: 15, TargetPort: 554,
			Status: models.StatusOffline, LatencyMs: 0, PacketLoss: 100, FailCount: 4,
			Details: "RTSP TCP 554 Closed • Hikvision 4K IP Bullet",
			LastCheck: now, LastStatusChange: now.Add(-14 * time.Minute),
		},
		{
			Hostname: "PC-HR-STAFF", IP: "192.168.1.118", MAC: "18:66:DA:55:44:33",
			Category: "pc", SubnetVlan: "VLAN 10 (Office LAN)",
			Location: "Lantai 1", Rack: "Lt.1 • R. HRD Meja 3",
			CheckMethod: "icmp", CheckIntervalSec: 15, TargetPort: 3389,
			Status: models.StatusOffline, LatencyMs: 0, PacketLoss: 100, FailCount: 3,
			Details: "Dell OptiPlex • Win11 • Port Link Down (Port 18 SW-Aruba-2530)",
			LastCheck: now, LastStatusChange: now.Add(-25 * time.Minute),
		},
		// Online Workstations & End Devices
		{
			Hostname: "PC-FINANCE-01", IP: "192.168.1.105", MAC: "B0:4E:26:77:88:99",
			Category: "pc", SubnetVlan: "VLAN 10 • DHCP Binding",
			Location: "Lantai 1", Rack: "Lt.1 • R. Akuntansi",
			CheckMethod: "icmp", CheckIntervalSec: 15, TargetPort: 3389,
			Status: models.StatusOnline, LatencyMs: 1.8, PacketLoss: 0,
			Details: "HP ProDesk • Win11 (Akuntansi) • RDP 3389 OK",
			LastCheck: now, LastStatusChange: now.Add(-12 * time.Hour),
		},
		{
			Hostname: "PRN-OFFICE-L1", IP: "192.168.1.50", MAC: "3C:D9:2B:12:34:56",
			Category: "printer", SubnetVlan: "TCP Port 9100 RAW",
			Location: "Lantai 1", Rack: "Lt.1 • Koridor Office",
			CheckMethod: "tcp", CheckIntervalSec: 15, TargetPort: 9100,
			Status: models.StatusOnline, LatencyMs: 1.1, PacketLoss: 0,
			Details: "HP LaserJet Enterprise Shared • Toner 82% • Paper OK",
			LastCheck: now, LastStatusChange: now.Add(-12 * time.Hour),
		},
		{
			Hostname: "AP-LOBBY-WIFI6", IP: "192.168.1.80", MAC: "D8:B3:70:99:11:22",
			Category: "ap", SubnetVlan: "VLAN 15 (Guest/Corp WiFi)",
			Location: "Lantai 1", Rack: "Lobby Utama",
			CheckMethod: "icmp", CheckIntervalSec: 10, TargetPort: 80,
			Status: models.StatusOnline, LatencyMs: 2.4, PacketLoss: 0,
			Details: "Aruba AP-505 Wi-Fi 6 Campus AP • 38 Klien Terhubung",
			LastCheck: now, LastStatusChange: now.Add(-48 * time.Hour),
		},
		{
			Hostname: "AP-DEV-FL2", IP: "192.168.20.10", MAC: "D8:B3:70:99:44:55",
			Category: "ap", SubnetVlan: "VLAN 20 (Engineering WiFi)",
			Location: "Lantai 2", Rack: "Lt.2 Engineering Wing",
			CheckMethod: "icmp", CheckIntervalSec: 10, TargetPort: 80,
			Status: models.StatusOnline, LatencyMs: 2.1, PacketLoss: 0,
			Details: "Aruba AP-515 High-Density Wi-Fi 6 • 52 Klien Terhubung",
			LastCheck: now, LastStatusChange: now.Add(-48 * time.Hour),
		},
		{
			Hostname: "SRV-DC-DB01", IP: "192.168.1.200", MAC: "00:50:56:B2:12:34",
			Category: "server", SubnetVlan: "VLAN 5 (Production Server)",
			Location: "Data Center", Rack: "Rack A2 • U14",
			CheckMethod: "tcp", CheckIntervalSec: 10, TargetPort: 5432,
			Status: models.StatusOnline, LatencyMs: 0.4, PacketLoss: 0,
			Details: "PostgreSQL 17 Primary Database Cluster",
			LastCheck: now, LastStatusChange: now.Add(-120 * time.Hour),
		},
		{
			Hostname: "SRV-DC-APP01", IP: "192.168.1.201", MAC: "00:50:56:B2:56:78",
			Category: "server", SubnetVlan: "VLAN 5 (Production Server)",
			Location: "Data Center", Rack: "Rack A2 • U16",
			CheckMethod: "tcp", CheckIntervalSec: 10, TargetPort: 8080,
			Status: models.StatusOnline, LatencyMs: 0.6, PacketLoss: 0,
			Details: "Go Backend Application Gateway Cluster",
			LastCheck: now, LastStatusChange: now.Add(-120 * time.Hour),
		},
		{
			Hostname: "NANOSTATION-M2-PERIMETER", IP: "10.10.9.1", MAC: "DC:9F:DB:77:66:55",
			Category: "ap", SubnetVlan: "VLAN 50 (Point-to-Point Wireless)",
			Location: "Perimeter", Rack: "Tiang Pos Security 2",
			CheckMethod: "icmp", CheckIntervalSec: 15, TargetPort: 80,
			Status: models.StatusOnline, LatencyMs: 3.5, PacketLoss: 0,
			Details: "Ubiquiti NanoStation M2 AirMax 2.4GHz Link (-58 dBm)",
			LastCheck: now, LastStatusChange: now.Add(-72 * time.Hour),
		},
		{
			Hostname: "CCTV-SERVER-ROOM", IP: "192.168.40.10", MAC: "A4:14:37:11:22:33",
			Category: "cctv", SubnetVlan: "VLAN 40 (Surveillance)",
			Location: "Data Center", Rack: "Plafon Server Room",
			CheckMethod: "tcp", CheckIntervalSec: 15, TargetPort: 554,
			Status: models.StatusOnline, LatencyMs: 1.4, PacketLoss: 0,
			Details: "Hikvision 4K Dome IR Camera • RTSP Live Stream OK",
			LastCheck: now, LastStatusChange: now.Add(-48 * time.Hour),
		},
		{
			Hostname: "SW-MAINT-TEST", IP: "192.168.1.99", MAC: "70:B3:D5:99:99:99",
			Category: "switch", SubnetVlan: "VLAN 99 (Lab Testing)",
			Location: "Data Center", Rack: "Lab Rack Test",
			CheckMethod: "icmp", CheckIntervalSec: 30, TargetPort: 22,
			Status: models.StatusMaintenance, LatencyMs: 0, PacketLoss: 0,
			MaintenanceMode: true,
			Details: "Sedang upgrade firmware OS • Notifikasi di-mute",
			LastCheck: now, LastStatusChange: now.Add(-2 * time.Hour),
		},
	}

	for _, d := range devices {
		db.Create(&d)
	}

	// 2. Seed Incidents History (matching PRD & Design)
	incidents := []models.Incident{
		{
			DeviceID: 3, DeviceHostname: "SW-CORE-FL03", DeviceIP: "192.168.10.1",
			Category: "switch", Location: "Lantai 3",
			StartedAt: now.Add(-15 * time.Minute), ResolvedAt: nil, DurationMinutes: 15,
			Status: "ongoing", ProtocolTrigger: "SNMP Trap linkDown Gi0/1",
			RootCause: "Power supply surge / PSU fail on distribution rack C",
			EscalationLevel: "Tier-2 Network On-site",
		},
		{
			DeviceID: 7, DeviceHostname: "AP-MEETING-VIP", DeviceIP: "192.168.30.45",
			Category: "ap", Location: "Lantai 3",
			StartedAt: now.Add(-14 * time.Minute), ResolvedAt: nil, DurationMinutes: 14,
			Status: "ongoing", ProtocolTrigger: "ICMP 3x Fail (PoE Loss)",
			RootCause: "Parent SW-CORE-FL03 unreachable (Alarm suppressed)",
			EscalationLevel: "Auto-Suppressed",
		},
		{
			DeviceID: 9, DeviceHostname: "PRN-FINANCE-02", DeviceIP: "192.168.20.88",
			Category: "printer", Location: "Lantai 2",
			StartedAt: now.Add(-11 * time.Minute), ResolvedAt: nil, DurationMinutes: 11,
			Status: "ongoing", ProtocolTrigger: "TCP Port 9100 Timeout",
			RootCause: "Paper tray jammed, internal print daemon unresponsive",
			EscalationLevel: "Tier-1 Helpdesk",
		},
		{
			DeviceID: 10, DeviceHostname: "CCTV-GATE-NORTH", DeviceIP: "192.168.40.12",
			Category: "cctv", Location: "Perimeter",
			StartedAt: now.Add(-14 * time.Minute), ResolvedAt: nil, DurationMinutes: 14,
			Status: "ongoing", ProtocolTrigger: "RTSP TCP 554 Closed",
			RootCause: "Outdoor fiber patch cord snapped at gate conduit",
			EscalationLevel: "Security & Facility Team",
		},
		{
			DeviceID: 11, DeviceHostname: "PC-HR-STAFF", DeviceIP: "192.168.1.118",
			Category: "pc", Location: "Lantai 1",
			StartedAt: now.Add(-25 * time.Minute), ResolvedAt: nil, DurationMinutes: 25,
			Status: "ongoing", ProtocolTrigger: "ICMP 3x Fail",
			RootCause: "LAN cable unplugged from wall faceplate",
			EscalationLevel: "Tier-1 Helpdesk",
		},
		// Resolved historical incidents
		{
			DeviceID: 2, DeviceHostname: "SW-CORE-L3", DeviceIP: "192.168.1.2",
			Category: "switch", Location: "Data Center",
			StartedAt: now.Add(-26 * time.Hour), ResolvedAt: timePtr(now.Add(-25*time.Hour - 48*time.Minute)),
			DurationMinutes: 12, Status: "resolved", ProtocolTrigger: "ICMP Timeout",
			RootCause: "Switch stack reboot after scheduled config reload",
			EscalationLevel: "Resolved by Admin",
		},
		{
			DeviceID: 5, DeviceHostname: "SW-ARUBA-2530-LT1", DeviceIP: "192.168.1.11",
			Category: "switch", Location: "Lantai 1",
			StartedAt: now.Add(-48 * time.Hour), ResolvedAt: timePtr(now.Add(-48*time.Hour + 8*time.Minute)),
			DurationMinutes: 8, Status: "resolved", ProtocolTrigger: "SNMP Link Flap",
			RootCause: "Loose SFP transceiver module reseated by NOC technician",
			EscalationLevel: "Resolved by Admin",
		},
	}

	for _, inc := range incidents {
		db.Create(&inc)
	}

	// 3. Seed Notification Channels (PRD F-20, F-21, F-22, F-24)
	notifications := []models.NotificationSetting{
		{
			Channel: "telegram", Name: "Telegram NOC Bot Alert", Enabled: true,
			ConfigJSON: `{"bot_token":"6821948123:AAFe89kdNsl9x8_SAMPLE","chat_id":"-10023456789","thread_id":"","target_group":"Tim IT & NOC All"}`,
			ActiveHours: "24x7", RootSuppression: true,
		},
		{
			Channel: "whatsapp", Name: "WhatsApp IT Gateway", Enabled: true,
			ConfigJSON: `{"api_url":"https://api.fonnte.com/send","token":"SECRET_WHATSAPP_TOKEN","target_numbers":"081234567890,081987654321"}`,
			ActiveHours: "work_hours", RootSuppression: true,
		},
		{
			Channel: "email", Name: "Email SMTP Server Alerts", Enabled: true,
			ConfigJSON: `{"smtp_host":"smtp.office365.com","smtp_port":587,"smtp_user":"noc-alerts@kantor.co.id","recipients":"it-support@kantor.co.id,manager-it@kantor.co.id"}`,
			ActiveHours: "24x7", RootSuppression: true,
		},
		{
			Channel: "browser", Name: "Web Browser Push & Audio Alarm", Enabled: true,
			ConfigJSON: `{"sound_enabled":true,"desktop_notification":true,"sound_theme":"cyber_beep"}`,
			ActiveHours: "24x7", RootSuppression: true,
		},
	}

	for _, n := range notifications {
		db.Create(&n)
	}

	// 4. Seed Topology Nodes and Links from Diagram Minsel (PRD & Three.js design)
	topoNodes := []models.TopologyNode{
		{NodeKey: "server", Label: "R. SERVER (PUSAT)", Type: "core_server", IP: "10.10.0.1", Ports: "48 Port FO", Status: "online", X2D: 100, Y2D: 250, X3D: -60, Y3D: 0, Z3D: -40},
		{NodeKey: "pos_sec_1", Label: "SWITCH 24 PORT FO - POS SEC 1", Type: "switch_fo", IP: "10.10.1.1", Ports: "24 Port FO", Status: "online", X2D: 300, Y2D: 120, X3D: -280, Y3D: 0, Z3D: -140},
		{NodeKey: "area_dc", Label: "SWITCH 24 PORT POE - AREA DC", Type: "switch_poe", IP: "10.10.1.2", Ports: "24 Port PoE", Status: "online", X2D: 450, Y2D: 80, X3D: -280, Y3D: 0, Z3D: -40},
		{NodeKey: "aseptic_lama", Label: "SWITCH 8 PORT - ASEPTIC LAMA", Type: "switch_std", IP: "10.10.1.3", Ports: "8 Port", Status: "online", X2D: 600, Y2D: 80, X3D: -280, Y3D: 0, Z3D: 60},
		{NodeKey: "genset", Label: "SWITCH 24 PORT POE - GENSET", Type: "switch_poe", IP: "10.10.2.1", Ports: "24 Port PoE", Status: "online", X2D: 450, Y2D: 160, X3D: -130, Y3D: 0, Z3D: -140},
		{NodeKey: "r_meeting", Label: "SWITCH 24 PORT POE - R. MEETING", Type: "switch_poe", IP: "10.10.2.2", Ports: "24 Port PoE", Status: "online", X2D: 300, Y2D: 250, X3D: -100, Y3D: 0, Z3D: 60},
		{NodeKey: "r_server_gh", Label: "SWITCH 8 PORT POE - R. SERVER GH", Type: "switch_poe", IP: "10.10.3.1", Ports: "8 Port PoE", Status: "online", X2D: 300, Y2D: 380, X3D: 20, Y3D: 0, Z3D: -140},
		{NodeKey: "gh_lt2", Label: "SWITCH 16 PORT POE - GH LT.2", Type: "switch_poe", IP: "10.10.3.2", Ports: "16 Port PoE", Status: "online", X2D: 450, Y2D: 340, X3D: 120, Y3D: 0, Z3D: -210},
		{NodeKey: "gh_lt1", Label: "SWITCH 8 PORT POE - GH LT.1", Type: "switch_poe", IP: "10.10.3.3", Ports: "8 Port PoE", Status: "online", X2D: 450, Y2D: 420, X3D: 120, Y3D: 0, Z3D: -140},
		{NodeKey: "office", Label: "3 SWITCH 16 PORT - OFFICE", Type: "switch_bundle", IP: "10.10.4.1", Ports: "3x 16 Port", Status: "online", X2D: 300, Y2D: 500, X3D: -20, Y3D: 0, Z3D: 20},
		{NodeKey: "qa_qc", Label: "SWITCH 8 PORT - QA QC", Type: "switch_std", IP: "10.10.4.2", Ports: "8 Port", Status: "online", X2D: 450, Y2D: 480, X3D: 110, Y3D: 0, Z3D: 20},
		{NodeKey: "admin_qa_qc", Label: "SWITCH 8 PORT POE - ADMIN QA QC", Type: "switch_poe", IP: "10.10.4.3", Ports: "8 Port PoE", Status: "online", X2D: 550, Y2D: 480, X3D: 210, Y3D: 0, Z3D: 20},
		{NodeKey: "lab_kimia", Label: "SWITCH 8 PORT - LAB KIMIA", Type: "switch_std", IP: "10.10.4.4", Ports: "8 Port", Status: "online", X2D: 650, Y2D: 480, X3D: 300, Y3D: 0, Z3D: 20},
		{NodeKey: "lab_mikro", Label: "SWITCH 8 PORT - LAB MIKRO", Type: "switch_std", IP: "10.10.4.5", Ports: "8 Port", Status: "online", X2D: 750, Y2D: 480, X3D: 390, Y3D: 0, Z3D: 20},
		{NodeKey: "decon_tca", Label: "SWITCH 24 PORT FO - DECON TCA", Type: "switch_fo", IP: "10.10.5.1", Ports: "24 Port FO", Status: "warning", X2D: 300, Y2D: 600, X3D: 130, Y3D: 0, Z3D: 100},
		{NodeKey: "adm_prd", Label: "SWITCH 16 PORT POE - ADM PRD", Type: "switch_poe", IP: "10.10.5.2", Ports: "16 Port PoE", Status: "online", X2D: 450, Y2D: 600, X3D: 230, Y3D: 0, Z3D: 100},
		{NodeKey: "sparepart_tca", Label: "SWITCH 8 PORT - SPAREPART TCA", Type: "switch_std", IP: "10.10.5.3", Ports: "8 Port", Status: "online", X2D: 550, Y2D: 600, X3D: 230, Y3D: 0, Z3D: 180},
		{NodeKey: "r_meeting_whs", Label: "SWITCH 24 PORT FO - R. MEETING WHS FG", Type: "switch_fo", IP: "10.10.6.1", Ports: "24 Port FO", Status: "online", X2D: 300, Y2D: 700, X3D: -20, Y3D: 0, Z3D: 160},
		{NodeKey: "whs_sparepart", Label: "SWITCH 24 PORT FO - WHS SPAREPART", Type: "switch_fo", IP: "10.10.7.1", Ports: "24 Port FO", Status: "online", X2D: 300, Y2D: 800, X3D: -280, Y3D: 0, Z3D: 240},
		{NodeKey: "pos_sec_2", Label: "SWITCH 8 PORT POE - POS SEC 2", Type: "switch_poe", IP: "10.10.7.2", Ports: "8 Port PoE", Status: "online", X2D: 450, Y2D: 800, X3D: -430, Y3D: 0, Z3D: 240},
		{NodeKey: "wwtp", Label: "SWITCH 24 PORT FO - WWTP", Type: "switch_fo", IP: "10.10.8.1", Ports: "24 Port FO", Status: "offline", X2D: 450, Y2D: 700, X3D: 230, Y3D: 0, Z3D: 260},
		{NodeKey: "nanostation_m2", Label: "NANOSTATION M2 - WIRELESS LINK", Type: "ap_wireless", IP: "10.10.9.1", Ports: "AirMax 2.4GHz", Status: "online", X2D: 450, Y2D: 750, X3D: -120, Y3D: 0, Z3D: 240},
	}

	for _, n := range topoNodes {
		db.Create(&n)
	}

	topoLinks := []models.TopologyLink{
		{FromKey: "server", ToKey: "pos_sec_1", LinkType: "line_fo", Active: true},
		{FromKey: "pos_sec_1", ToKey: "genset", LinkType: "plan_baru", Active: true},
		{FromKey: "pos_sec_1", ToKey: "area_dc", LinkType: "line_lama", Active: true},
		{FromKey: "server", ToKey: "r_server_gh", LinkType: "line_lama", Active: true},
		{FromKey: "r_server_gh", ToKey: "gh_lt2", LinkType: "line_lama", Active: true},
		{FromKey: "r_server_gh", ToKey: "gh_lt1", LinkType: "line_lama", Active: true},
		{FromKey: "server", ToKey: "office", LinkType: "line_fo", Active: true},
		{FromKey: "office", ToKey: "qa_qc", LinkType: "line_lama", Active: true},
		{FromKey: "office", ToKey: "admin_qa_qc", LinkType: "line_lama", Active: true},
		{FromKey: "office", ToKey: "lab_kimia", LinkType: "line_lama", Active: true},
		{FromKey: "office", ToKey: "lab_mikro", LinkType: "line_lama", Active: true},
		{FromKey: "server", ToKey: "decon_tca", LinkType: "line_fo", Active: true},
		{FromKey: "decon_tca", ToKey: "adm_prd", LinkType: "plan_baru", Active: true},
		{FromKey: "adm_prd", ToKey: "sparepart_tca", LinkType: "line_lama", Active: true},
		{FromKey: "server", ToKey: "r_meeting", LinkType: "line_fo", Active: true},
		{FromKey: "server", ToKey: "r_meeting_whs", LinkType: "line_fo", Active: true},
		{FromKey: "r_meeting_whs", ToKey: "wwtp", LinkType: "line_fo", Active: true},
		{FromKey: "r_meeting_whs", ToKey: "nanostation_m2", LinkType: "plan_baru", Active: true},
		{FromKey: "server", ToKey: "whs_sparepart", LinkType: "line_fo", Active: true},
		{FromKey: "whs_sparepart", ToKey: "pos_sec_2", LinkType: "line_fo", Active: true},
		{FromKey: "whs_sparepart", ToKey: "aseptic_lama", LinkType: "line_lama", Active: true},
	}

	for _, l := range topoLinks {
		db.Create(&l)
	}

	log.Println("Database seeded successfully with initial devices, topologies, and incidents!")
}

func timePtr(t time.Time) *time.Time {
	return &t
}

