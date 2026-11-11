# Tuntasin - Platform Pelaporan Infrastruktur Terpadu

**Tuntasin** adalah aplikasi berbasis web yang memudahkan masyarakat untuk melaporkan kerusakan fasilitas umum secara transparan, serta membantu pemerintah merespons masalah secara objektif berdasarkan urutan prioritas dukungan warga (*sistem voting*).

---

### 🌐 Live Demo & Akses Pengujian
- **URL Frontend:** [https://tuntasin-web.epistura.web.id/login](https://tuntasin-web.epistura.web.id/login)
- **Akun Demo Admin:**
  - **Email:** `admin@tuntasin.id`
  - **Password:** `admin123`

---

### 🛠️ Tech Stack yang Digunakan
Proyek ini menggunakan struktur *Monorepo* yang memisahkan sisi Client dan Server:

- **Frontend:**
  - Framework & UI: React.js, Vite, CSS Modules
  - Icons & Styling: Lucide React, Lenis (Smooth Scroll)
  - Maps & Visualisasi: Leaflet / React-Leaflet (Interactive Heatmap)
  - HTTP Client: Axios (dengan `axios-retry`)

- **Backend:**
  - Framework: Laravel 11, PHP 8.x
  - Database: MySQL
  - PDF Generator: Barryvdh DomPDF Wrapper
  - Notification Gateway: **Fonnte.com (WhatsApp API)**

- **Deployment:**
  - Frontend: Vercel / VPS Hosting

---

### ⚙️ Cara Menjalankan Project (Local Development)

**1. Clone Repository**
```bash
git clone [https://github.com/FAJRI2378/tuntasin.git](https://github.com/FAJRI2378/tuntasin.git)
cd tuntasin
```

**2. Setup Backend (Laravel)**
```bash
cd backendmia
composer install
cp .env.example .env
php artisan key:generate
```
* Buka file `.env` dan sesuaikan konfigurasi database MySQL serta Token Fonnte:
```env
DB_DATABASE=mia
DB_USERNAME=root
DB_PASSWORD=

FONNTE_TOKEN=your_fonnte_token_here
```
* Jalankan migrasi dan server lokal:
```bash
php artisan migrate
php artisan storage:link
php artisan config:clear
php artisan serve
```
*(Backend berjalan di `http://127.0.0.1:8000`)*

**3. Setup Frontend (React/Vite)**
Buka tab terminal baru:
```bash
cd frontendmia
npm install
npm run dev
```
*(Frontend berjalan di `http://localhost:5173`)*

---

### 📌 Progress Saat Ini (First Draft Submission)

- **Frontend:**
  - UI Responsif untuk desktop, tablet, dan smartphone.
  - Halaman Landing Page dengan visualisasi statistik real-time dan peta sebaran masalah (*interactive map/heatmap*).
  - Fitur Warga: Pencarian laporan, filter status (Pending, Diproses, Selesai, Invalid), galeri foto (*lightbox*), fitur bagi tautan (*share*), dan sistem *upvote* laporan.
  - Fitur Admin: Dashboard manajemen laporan terintegrasi, kontrol perubahan status, modal *feedback* catatan tindak lanjut, dan unggah dokumen RAB/Proposal proyek (PDF).

- **Backend & Integration:**
  - RESTful API Laravel terintegrasi penuh dengan autentikasi Sanctum.
  - **Notifikasi WhatsApp Otomatis (Fonnte API):** Pengiriman pesan WA otomatis ke nomor HP pelapor setiap kali Admin mengubah status laporan atau memberikan catatan *feedback*.
  - Ekspor laporan infrastruktur ke format PDF (DomPDF).

---

### 🚀 Rencana Pengembangan Selanjutnya (Roadmap)
- [ ] Verifikasi identitas berbasis **NIK & Nama Lengkap**.
- [ ] Kode OTP WhatsApp untuk registrasi akun baru.
- [ ] Mode Pelaporan Anonim (*Sembunyikan Identitas Warga*).
- [ ] Penggabungan laporan duplikat berbasis titik koordinat lokasi.
- [ ] Pengukuran Service Level Agreement (SLA Countdown Timer).
