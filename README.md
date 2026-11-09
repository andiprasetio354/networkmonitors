# Wifitics – NOC Commander v4.2
## Website Monitoring Jaringan Kantor Real-Time

Website monitoring jaringan kantor yang dibangun berdasarkan **PRD (Product Requirement Document)** dan rancangan desain pada folder `stitch_website_prd_implementation`. Sistem ini mengotomatiskan pemeriksaan status seluruh perangkat jaringan (switch, router, access point, printer, PC workstation, server, CCTV) tanpa memerlukan ping manual satu per satu oleh tim IT.

---

### Tech Stack
- **Frontend**: Next.js 14 (App Router, React 18, TypeScript, Tailwind CSS, Three.js untuk topologi 3D, Material Symbols Outlined).
- **Backend API & Poller**: Golang (Go 1.22, Gin Gonic, GORM ORM, Gorilla WebSocket, multi-threaded concurrent ICMP/TCP ping poller).
- **Database**: PostgreSQL 17 (`network_monitoring` database).

---

### Fitur Utama Berdasarkan PRD & Desain

#### 1. Dashboard Utama Real-Time (`/`)
- **WebSocket Live Stream (2s refresh)**: Indikator pulsasi koneksi real-time tanpa refresh halaman (PRD F-13).
- **4 KPI Metric Cards**:
  - Total Perangkat Terdaftar (Nodes)
  - Online / Sehat (95.9% SLA)
  - Kritis: Terputus / Down (Pulsing Red Alert)
  - Unreachable (Parent Down Dependency Isolation)
- **Priority Triage Panel (PRD F-15)**: Perangkat offline otomatis disematkan di posisi teratas dengan tombol aksi *Cek Sekarang*, *Terminal*, dan *Set Maintenance*.
- **24H Latency Telemetry Waveform**: Grafik vektor SVG performa latensi 24 jam dengan penanda lonjakan anomali paket loss.
- **Distribusi Perangkat**: Diagram progress bar 6 kategori (Switches, Access Points, CCTV, Printers, Servers, Workstations).
- **Quick Scan / Ping All** dan **TV Wall Mode** layar penuh untuk display ruang NOC.

#### 2. Manajemen Perangkat & Inventaris (`/devices`)
- **CRUD Lengkap (PRD F-01)**: Hostname, Alamat IP / FQDN, Kategori, Subnet / VLAN, Lokasi & Rak.
- **Logika Dependensi Induk Anti-False Alarm (PRD F-05)**: Jika switch induk mati, perangkat di bawahnya ditandai `Unreachable` (bukan Offline) dan notifikasi disupresi agar tidak membanjiri alarm (alarm storm suppression).
- **Subnet Scanner & Discovery (PRD F-06)**: Pindai subnet CIDR (contoh `192.168.10.0/24`) secara multi-threaded dan impor node baru dengan 1-klik.
- **Mode Pemeliharaan / Maintenance (PRD F-07)**: Mute notifikasi sementara selama pekerjaan terjadwal.
- **Ekspor & Impor CSV (PRD F-02, F-32)**.

#### 3. Monitoring LAN Kantor: Switch Aruba, PC & Printer (`/lan`)
- **Switch Aruba**: Aruba 2530 24G, Aruba 2540 48G PoE+ (budget daya 184W/370W), Aruba Instant On 600 Core.
- **Workstation PC Staf**: Pemantauan port koneksi LAN dan kesiapan RDP TCP Port 3389.
- **Network Printer**: Verifikasi kesiapan Raw TCP Port 9100, status paper tray, dan level toner.

#### 4. Topologi Jaringan Split-Screen: 2D Blueprint vs 3D Perspective (`/topology`)
- **2D Schematic Blueprint**: Diagram skematik SVG interaktif yang memetakan jalur kabel Fiber Optic (`line_fo`), Plan Baru FO (`plan_baru`), dan Line Lama UTP (`line_lama`).
- **3D Interactive Perspective Space (Three.js)**: Model visual 3D isometrik jaringan Minsel (Server Room, Pos Security, Area DC, Genset, Labs, Offices, Nanostation M2, switches) dengan pencahayaan, grid lantai, dan rotasi kamera orbit.
- **Sinkronisasi Node & Inspector Drawer**: Klik node pada tampilan 2D atau 3D untuk melihat spesifikasi, status, kapasitas port, dan pengujian latensi instan.

#### 5. Riwayat Log Insiden & Pengaturan Notifikasi (`/incidents`)
- **SLA & MTTR Cards (PRD F-31, F-33)**: Overall SLA Uptime (99.82%), Total Insiden, MTTR (12m 44s), dan Top Problematic Nodes (#1 SW-CORE-FL03, #2 AP-MEETING-VIP).
- **Log Insiden (PRD F-30)**: Riwayat lengkap waktu offline, durasi putus, waktu pulih, pemicu protokol, dan akar masalah dengan filter rentang tanggal (Hari Ini, 7 Hari, 30 Hari).
- **Orkestrasi Notifikasi Multi-Kanal (PRD F-20 – F-24)**:
  - Bot Telegram
  - WhatsApp Gateway Webhook
  - Email SMTP
  - Audio Sirine Browser Push
  - Tombol **Kirim Alarm Uji Coba** langsung.

---

### Struktur Direktori

```text
network/
├── backend/
│   ├── config/             # Konfigurasi database & port
│   ├── database/           # Inisialisasi PostgreSQL & Data Seeding
│   ├── handlers/           # REST Handlers & WebSocket Hub
│   ├── models/             # GORM Structs (Device, Incident, Topology, etc.)
│   ├── poller/             # Background ICMP/TCP Poller & Anti-False Alarm Engine
│   ├── main.go             # Entrypoint server Go (:8080)
│   └── wifitics-server.exe # Binary hasil kompilasi
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js 14 App Router (/ , /devices, /lan, /topology, /incidents)
│   │   ├── components/     # UI Components (Sidebar, Header, Table, Topologies, Modals)
│   │   └── types/          # TypeScript Type Definitions
│   ├── tailwind.config.js  # Cybernetic Telemetry design tokens
│   └── package.json
└── stitch_website_prd_implementation/  # Referensi PRD, Mockups & Code HTML
```

---

### Cara Menjalankan

#### 1. Backend (Golang)
```powershell
cd backend
.\wifitics-server.exe
# Atau jalankan via source:
go run main.go
```
*Backend berjalan di `http://localhost:8080` dan terhubung otomatis ke PostgreSQL.*

#### 2. Frontend (Next.js)
```powershell
cd frontend
npm start
# Atau mode development:
npm run dev
```
*Frontend berjalan di `http://localhost:3000`.*

