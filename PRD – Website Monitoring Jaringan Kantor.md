# PRD – Website Monitoring Jaringan Kantor

Versi 1.0 · 9 November 2026 · Status: Draft untuk review

## 1. Ringkasan

Saat ini, untuk mengetahui apakah sebuah perangkat jaringan (switch, access point, printer, server, CCTV, dll.) offline, tim IT harus melakukan ping manual ke alamat IP satu per satu. Proses ini lambat, tidak konsisten, dan baru dilakukan setelah ada keluhan.

Produk ini adalah **website dashboard monitoring jaringan** yang secara otomatis memeriksa status semua perangkat kantor, menampilkannya **secara real time** dalam satu layar, dan mengirim notifikasi saat ada perangkat yang offline, sehingga IT tidak perlu lagi mengetik ping secara manual.

**Catatan penting tentang konsep tanpa ping:** pengecekan tetap harus dilakukan oleh sistem, tetapi dilakukan *otomatis oleh server monitoring*, bukan oleh manusia. Selain itu, perangkat yang mendukung SNMP/syslog dapat *melapor sendiri* saat putus (metode pasif), sehingga status offline terdeteksi hampir seketika tanpa polling. Kedua pendekatan dipakai bersama (lihat bagian 5).

## 2. Latar Belakang dan Masalah

| Masalah saat ini | Dampak |
| --- | --- |
| Cek status harus ping IP satu per satu | Memakan waktu, terutama jika perangkat puluhan sampai ratusan |
| Pengecekan reaktif (setelah ada komplain user) | Downtime lebih lama, produktivitas turun |
| Tidak ada riwayat gangguan | Sulit mencari perangkat yang sering bermasalah |
| Tidak ada gambaran keseluruhan jaringan | Sulit menentukan akar masalah (misalnya switch induk mati) |
| Tidak ada notifikasi otomatis | Gangguan di luar jam kerja tidak terpantau |

## 3. Tujuan dan Metrik Keberhasilan

### Tujuan

1. Menampilkan status seluruh perangkat (Online/Offline) secara real time dalam satu dashboard.
2. Menghilangkan kebutuhan ping manual oleh tim IT.
3. Memberi notifikasi otomatis saat perangkat offline dan saat pulih.
4. Menyimpan riwayat status untuk analisis dan pelaporan.

### Metrik keberhasilan

| Metrik | Target |
| --- | --- |
| Waktu deteksi perangkat offline (metode aktif) | ≤ 30 detik |
| Waktu deteksi untuk perangkat SNMP trap/syslog | ≤ 5 detik |
| Update status di dashboard setelah terdeteksi | ≤ 2 detik (tanpa refresh halaman) |
| Penurunan waktu pengecekan manual oleh IT | ≥ 90% |
| Akurasi status (false positive/negative) | ≤ 2% |
| Ketersediaan dashboard | ≥ 99% |

## 4. Pengguna dan Persona

| Peran | Kebutuhan utama |
| --- | --- |
| **Staf IT / Network Admin** (pengguna utama) | Melihat perangkat offline secara instan, menerima alert, melihat riwayat |
| **Kepala IT / Manajer** | Ringkasan uptime, laporan berkala |
| **Helpdesk** (read-only) | Mengecek cepat apakah keluhan user disebabkan perangkat offline |

## 5. Pendekatan Deteksi Status

Sistem menggabungkan metode aktif dan pasif agar cepat dan akurat.

| Metode | Cara kerja | Cocok untuk | Kecepatan |
| --- | --- | --- | --- |
| **ICMP check otomatis** | Server monitoring melakukan ping terjadwal ke semua IP (interval 10–30 detik) | Semua perangkat ber-IP | Sedang |
| **TCP/HTTP port check** | Cek port layanan (misal 80, 443, 9100 printer) | Server, printer, CCTV, aplikasi | Sedang |
| **SNMP Trap (pasif)** | Switch/router mengirim notifikasi linkDown/linkUp ke server | Managed switch, router, UPS | Hampir instan |
| **SNMP Polling** | Membaca status interface port dan uptime perangkat | Managed switch, router, AP | Sedang |
| **Syslog (pasif)** | Menerima log dari perangkat | Router, firewall, switch | Hampir instan |
| **Sumber data pelengkap** | Tabel ARP/MAC switch dan DHCP lease | Perangkat unmanaged (PC, printer sederhana) | Sedang |

**Logika anti false alarm:** perangkat ditandai Offline hanya setelah N kali gagal berturut-turut (default 3 kali), atau saat dikonfirmasi oleh sumber pasif. Status pulih ditandai Online setelah 1 kali berhasil.

**Logika dependensi:** jika sebuah switch induk offline, perangkat di bawahnya ditandai *Unreachable* (bukan Offline), dan alert hanya dikirim untuk switch induk agar tidak terjadi banjir notifikasi.

## 6. Ruang Lingkup

### Dalam lingkup (MVP)

- Inventaris perangkat (tambah, ubah, hapus, import CSV)
- Pengecekan otomatis ICMP dan TCP
- Dashboard real time
- Notifikasi offline dan pulih
- Riwayat status dan log kejadian
- Autentikasi dan peran pengguna

### Fase berikutnya

- SNMP polling, trap, dan syslog
- Auto-discovery perangkat via scan subnet
- Peta topologi jaringan
- Grafik latensi dan packet loss
- Laporan uptime otomatis (PDF/Excel)
- Integrasi tiket helpdesk

### Di luar lingkup

- Manajemen konfigurasi perangkat (push config)
- Monitoring trafik mendalam (NetFlow/deep packet inspection)
- Monitoring jaringan di luar kantor atau cloud publik

## 7. Kebutuhan Fungsional

Prioritas: **P0** wajib MVP, **P1** penting, **P2** nice to have.

### 7.1 Manajemen Perangkat

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F-01 | CRUD perangkat: nama, IP, tipe, lokasi/lantai, grup, deskripsi, pemilik | P0 |
| F-02 | Import perangkat massal via CSV | P0 |
| F-03 | Pengelompokan berdasarkan lokasi, tipe, dan tag | P0 |
| F-04 | Pengaturan metode dan interval cek per perangkat | P1 |
| F-05 | Penentuan perangkat induk (dependensi) | P1 |
| F-06 | Scan subnet untuk menemukan perangkat baru | P2 |
| F-07 | Mode maintenance (pause alert sementara) | P1 |

### 7.2 Monitoring dan Dashboard

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F-10 | Pengecekan otomatis terjadwal tanpa aksi manual | P0 |
| F-11 | Dashboard ringkasan: total perangkat, Online, Offline, Unreachable | P0 |
| F-12 | Daftar perangkat dengan status berwarna (hijau, merah, abu-abu) dan waktu terakhir berubah | P0 |
| F-13 | Update status real time via WebSocket tanpa refresh | P0 |
| F-14 | Pencarian, filter (status, lokasi, tipe), dan sorting | P0 |
| F-15 | Perangkat Offline otomatis tampil di bagian paling atas | P0 |
| F-16 | Halaman detail perangkat: status, uptime 24 jam/7 hari/30 hari, riwayat kejadian | P1 |
| F-17 | Grafik latensi dan packet loss | P1 |
| F-18 | Peta topologi atau denah lantai | P2 |
| F-19 | Penerimaan SNMP trap dan syslog | P1 |

### 7.3 Notifikasi

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F-20 | Notifikasi saat perangkat Offline dan saat Online kembali | P0 |
| F-21 | Kanal: Telegram, WhatsApp (via gateway), email | P0 (Telegram/email), P1 (WhatsApp) |
| F-22 | Aturan notifikasi per grup/perangkat dan jam kerja | P1 |
| F-23 | Eskalasi jika belum pulih setelah X menit | P2 |
| F-24 | Notifikasi suara dan browser push di dashboard | P1 |

### 7.4 Riwayat dan Laporan

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F-30 | Log kejadian (waktu offline, durasi, waktu pulih) | P0 |
| F-31 | Persentase uptime per perangkat dan per periode | P1 |
| F-32 | Ekspor laporan CSV/PDF | P1 |
| F-33 | Daftar perangkat paling sering bermasalah | P2 |

### 7.5 Pengguna dan Keamanan

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F-40 | Login dengan peran Admin, Operator, Viewer | P0 |
| F-41 | Audit log perubahan konfigurasi | P1 |
| F-42 | Login terpusat (LDAP/Active Directory/SSO) | P2 |

## 8. User Stories Utama

1. Sebagai staf IT, saya ingin membuka satu halaman dan langsung melihat perangkat mana yang offline, agar saya tidak perlu ping satu per satu.
2. Sebagai staf IT, saya ingin dapat pesan Telegram saat perangkat penting mati, agar saya bisa bertindak sebelum user komplain.
3. Sebagai helpdesk, saya ingin mencari nama atau IP perangkat dan melihat statusnya, agar bisa menjawab keluhan user dengan cepat.
4. Sebagai manajer IT, saya ingin laporan uptime bulanan, agar bisa mengevaluasi kualitas jaringan.
5. Sebagai admin, saya ingin menandai perangkat dalam mode maintenance, agar tidak ada alert palsu saat pekerjaan terjadwal.

## 9. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
| --- | --- |
| Performa | Mendukung minimal 500 perangkat dengan interval 15 detik; dashboard tetap responsif |
| Real time | Perubahan status sampai ke browser ≤ 2 detik via WebSocket |
| Keandalan | Server monitoring harus berada di jaringan yang stabil; ada health check untuk monitor itu sendiri (dead man switch) |
| Keamanan | HTTPS, password di-hash, rate limit login, kredensial SNMP dienkripsi, akses hanya dari jaringan internal/VPN |
| Penyimpanan | Data mentah disimpan 30 hari, agregat harian disimpan 12 bulan |
| Kompatibilitas | Chrome, Edge, Firefox terbaru; tampilan responsif untuk HP |
| Kemudahan deploy | Dapat dijalankan dengan Docker Compose pada satu server |
| Bahasa | Antarmuka Bahasa Indonesia (opsional Inggris) |

## 10. Arsitektur yang Diusulkan

**Alur data:**

Perangkat jaringan → Poller/Collector (ICMP, TCP, SNMP) dan Receiver (SNMP trap, syslog) → Antrian/Event bus → Backend API → Database → WebSocket → Browser dashboard. Backend juga memicu Notification Service (Telegram, email, WhatsApp).

| Komponen | Saran teknologi |
| --- | --- |
| Frontend | React atau Vue, Tailwind CSS, koneksi WebSocket |
| Backend API | Node.js (NestJS/Express) atau Python (FastAPI) |
| Poller | Worker terpisah (Go, Python asyncio, atau Node worker) dengan concurrency tinggi |
| Real time | WebSocket atau Server-Sent Events |
| Database | PostgreSQL; TimescaleDB untuk data time series |
| Cache/Queue | Redis |
| Deploy | Docker Compose di satu server/VM di jaringan kantor |

**Alternatif build vs buy:** sebelum membangun dari nol, pertimbangkan alat open source seperti Uptime Kuma, Zabbix, LibreNMS, atau Netdata. PRD ini berlaku jika kebutuhan kantor tidak terpenuhi oleh alat tersebut (misalnya tampilan khusus, integrasi internal, atau kontrol penuh).

**Catatan teknis:** ping ICMP dari kontainer memerlukan hak akses khusus (capability NET\_RAW). Server monitoring harus dapat menjangkau semua VLAN/subnet yang dipantau.

## 11. Model Data (Ringkas)

| Entitas | Atribut utama |
| --- | --- |
| Device | id, nama, ip, tipe, lokasi, grup, parent\_id, metode\_cek, interval, status, last\_change |
| Check\_Result | id, device\_id, waktu, sukses, latensi\_ms, metode |
| Event | id, device\_id, jenis (down/up), mulai, selesai, durasi |
| Notification\_Rule | id, grup/device, kanal, penerima, jam\_aktif |
| User | id, nama, email, peran |
| Audit\_Log | id, user\_id, aksi, waktu |

## 12. Rancangan Antarmuka (Garis Besar)

1. **Dashboard utama:** kartu ringkasan (Total, Online, Offline, Unreachable), daftar perangkat Offline di atas, tabel semua perangkat dengan filter, indikator koneksi real time.
2. **Detail perangkat:** status saat ini, grafik latensi, riwayat kejadian, tombol Cek Sekarang dan Maintenance.
3. **Manajemen perangkat:** tabel CRUD, import CSV, pengaturan grup.
4. **Pengaturan notifikasi:** kanal, aturan, jadwal.
5. **Laporan:** uptime per periode, ekspor.
6. **Mode layar TV (opsional):** tampilan penuh untuk ditampilkan di ruang IT.

## 13. Rencana Rilis

| Fase | Durasi | Isi |
| --- | --- | --- |
| **Fase 0 – Persiapan** | 1 minggu | Inventarisasi perangkat dan IP, kebutuhan akses jaringan, pilih stack |
| **Fase 1 – MVP** | 3–4 minggu | CRUD perangkat, poller ICMP/TCP, dashboard real time, notifikasi Telegram/email, log kejadian, login |
| **Fase 2 – Peningkatan** | 3 minggu | SNMP polling/trap, syslog, dependensi, grafik latensi, laporan uptime, mode maintenance |
| **Fase 3 – Lanjutan** | 3 minggu | Auto-discovery, topologi, WhatsApp, eskalasi, SSO |

## 14. Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Perangkat memblokir ICMP sehingga terlihat offline | Gunakan TCP check atau SNMP sebagai alternatif per perangkat |
| Banyak false alarm akibat paket hilang sesaat | Ambang gagal berturut-turut dan konfirmasi ganda |
| Banjir notifikasi saat switch induk mati | Logika dependensi dan status Unreachable |
| Server monitoring sendiri mati tanpa diketahui | Health check eksternal atau heartbeat ke layanan lain |
| Server tidak bisa menjangkau semua VLAN | Pemetaan jaringan di Fase 0, tambah collector di tiap segmen bila perlu |
| Kebocoran kredensial SNMP | Enkripsi, akses terbatas, SNMPv3 |

## 15. Asumsi dan Ketergantungan

- Tersedia server atau VM di jaringan kantor yang selalu menyala.
- Daftar IP dan tipe perangkat dapat disediakan oleh tim IT.
- Sebagian switch/router mendukung SNMP dan dapat dikonfigurasi untuk mengirim trap dan syslog.
- Tersedia bot Telegram dan/atau SMTP untuk notifikasi.

## 16. Pertanyaan Terbuka

1. Berapa jumlah perangkat yang akan dipantau saat ini dan perkiraan 1 tahun ke depan?
2. Berapa banyak segmen jaringan/VLAN dan lokasi (gedung/lantai/cabang)?
3. Merek dan tipe switch/router apa yang digunakan, dan apakah mendukung SNMP?
4. Kanal notifikasi mana yang paling dipakai tim (Telegram, WhatsApp, email)?
5. Apakah ada kebutuhan akses dari luar kantor (via VPN)?
6. Apakah alat siap pakai seperti Uptime Kuma atau Zabbix sudah pernah dievaluasi?
7. Siapa saja yang membutuhkan akses dan dengan peran apa?
