# Tuntasin - Platform Pelaporan Infrastruktur Terpadu

**Tuntasin** adalah aplikasi berbasis web yang memudahkan masyarakat untuk melaporkan kerusakan fasilitas umum secara transparan, serta membantu pemerintah merespons masalah dengan urutan prioritas berbasis dukungan warga (sistem *voting*).

### Tech Stack yang Digunakan
Proyek ini menggunakan struktur *Monorepo* yang memisahkan sisi Client dan Server:
* **Frontend:** React.js, Vite, Axios, CSS Modules, Lucide React (Icons).
* **Backend:** Laravel 11, PHP, MySQL, RESTful API.
* **Deployment:** Vercel (Frontend).

### Cara Menjalankan Project (Local Development)
Karena project ini terdiri dari Frontend dan Backend, ikuti langkah berikut untuk menjalankannya di komputer lokal:

**1. Clone Repository**
```bash
git clone https://github.com/FAJRI2378/tuntasin.git
cd tuntasin
```

**2. Setup Backend (Laravel)**
```bash
cd backendmia
composer install
cp .env.example .env
php artisan key:generate
# Atur konfigurasi database MySQL di file .env, lalu jalankan:
php artisan migrate
php artisan storage:link
php artisan serve
```
*(Backend akan berjalan di `http://127.0.0.1:8000`)*

**3. Setup Frontend (React/Vite)**
Buka tab terminal baru, lalu masuk ke folder frontend:
```bash
cd frontendmia
npm install
npm run dev
```
*(Frontend akan berjalan di `http://localhost:5173`)*

### Progress Saat Ini (First Draft Submission)
* **Frontend:** Sudah di-deploy ke Vercel (tampilan UI responsif).
* **Fitur Warga:** Landing page, halaman utama (grid laporan), fitur pencarian, filter status, galeri foto (*lightbox*), fitur bagi tautan (*share*), dan sistem *upvote* laporan telah berfungsi secara UI.
* **Fitur Admin:** Dashboard manajemen laporan dengan UI terintegrasi untuk mengubah status (Pending, Diproses, Selesai, Invalid), modal pop-up untuk memberikan *feedback* tertulis, dan fitur unggah dokumen proyek (PDF) sudah terpasang.
* **Backend:** REST API dengan Laravel sudah dibangun dan terhubung dengan Frontend di *localhost* (Persiapan migrasi database dan backend hosting untuk finalisasi integrasi).