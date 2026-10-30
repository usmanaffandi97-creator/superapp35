# 📖 PANDUAN LENGKAP SETUP & DEPLOYMENT SUPER APP SEKOLAH TERPADU
*Presensi Harian • Presensi Ekstra • Nilai Ulangan • Pengumuman Kelulusan • 7 Kebiasaan • Buku Pelanggaran*
**Database: 1 Google Sheet Terpadu | Hosting: Vercel & GitHub | Platform: Android PWA & Responsive Web**

---

## 🧭 Daftar Isi
1. [Langkah 1: Setup 1 Google Sheet Database & Apps Script](#langkah-1-setup-1-google-sheet-database--apps-script)
2. [Langkah 2: Menghubungkan Web App ke Frontend](#langkah-2-menghubungkan-web-app-ke-frontend)
3. [Langkah 3: Deploy Frontend ke Vercel via GitHub](#langkah-3-deploy-frontend-ke-vercel-via-github)
4. [Langkah 4: Cara Pasang Aplikasi di Android (PWA)](#langkah-4-cara-pasang-aplikasi-di-android-pwa)
5. [Panduan Penggunaan Berdasarkan Peran Pengguna](#panduan-penggunaan-berdasarkan-peran-pengguna)

---

## 🗄️ Langkah 1: Setup 1 Google Sheet Database & Apps Script

Seluruh sistem Super App berjalan di atas **1 file Google Spreadsheet tunggal**.

1. Buka [Google Drive](https://drive.google.com).
2. Buat Spreadsheet Baru dengan nama: **`DATABASE_SUPER_APP_SEKOLAH`**.
3. Di dalam spreadsheet, buka menu bilah atas: **Ekstensi** $\rightarrow$ **Apps Script**.
4. Hapus seluruh kode bawaan pada editor `Code.gs`.
5. Buka file [**`Code.gs`**](file:///F:/super-app-sekolah/Code.gs) dari folder proyek ini, lalu salin dan tempelkan seluruh kodenya ke editor Apps Script.
6. Klik ikon **Simpan (Disket)** atau tekan `Ctrl + S`.
7. **Jalankan Inisialisasi Otomatis Database:**
   - Pada dropdown fungsi di samping tombol "Debug", pilih fungsi **`setupDatabase`**.
   - Klik **Jalankan (Run)**.
   - Google akan meminta persetujuan izin keamanan:
     - Klik **Tinjau izin (*Review permissions*)**.
     - Pilih akun Google Anda.
     - Klik **Lanjutan (*Advanced*)** $\rightarrow$ **Buka Proyek (tidak aman)**.
     - Klik **Izinkan (*Allow*)**.
   - Tunggu beberapa detik hingga proses selesai.
   - Buka kembali tab Google Spreadsheet Anda: **12 Tab Database lengkap dengan format dan proteksi angka nol (@) telah siap otomatis!**
8. **Deploy Sebagai Web App:**
   - Klik tombol biru **Deploy** di pojok kanan atas $\rightarrow$ **New deployment**.
   - Klik ikon roda gigi $\rightarrow$ pilih jenis **Web app**.
   - Isi formulir:
     - **Description:** `Super App Sekolah v1.0`
     - **Execute as:** `Me (email Anda)`
     - **Who has access:** `Anyone` *(Wajib dipilih agar siswa, guru, dan Vercel dapat berkomunikasi)*
   - Klik **Deploy**.
   - Salin **Web App URL** yang berakhiran `/exec`.  
     *(Contoh: `https://script.google.com/macros/s/AKfycbx.../exec`)*.

---

## 🔗 Langkah 2: Menghubungkan Web App ke Frontend

1. Buka aplikasi web Super App di browser Anda (buka file `index.html` atau link hosting Vercel Anda).
2. Klik tombol **Gembok (Kunci)** di pojok kanan atas header untuk membuka akses Administrator.
3. Masukkan PIN Admin default: **`123456`**.
4. Pada Panel Kendali Admin, temukan kartu **Koneksi Google Apps Script**.
5. Tempelkan URL Web App `/exec` yang telah Anda salin pada Langkah 1.
6. Klik tombol **"Uji & Simpan Endpoint"**.
7. Lencana di bilah atas akan otomatis berubah menjadi hijau: **`Tersambung`**.  
   *Seluruh transaksi (presensi, 7 kebiasaan, nilai, kelulusan, dan pelanggaran) kini tersinkronisasi online secara real-time ke Google Spreadsheet sekolah Anda!*

---

## 🔺 Langkah 3: Deploy Frontend ke Vercel via GitHub

Aplikasi ini telah dilengkapi konfigurasi Vercel murni (`vercel.json`, `package.json`, `manifest.json`, dan `sw.js`).

1. Buka terminal (PowerShell / Command Prompt) di folder `F:\super-app-sekolah`:
   ```powershell
   cd F:\super-app-sekolah
   git init
   git add .
   git commit -m "Initial commit Super App Sekolah Terpadu"
   ```
2. Buat repositori baru di [GitHub](https://github.com/new) dengan nama misalnya `super-app-sekolah`.
3. Hubungkan repositori lokal Anda ke GitHub dan lakukan push:
   ```powershell
   git remote add origin https://github.com/USERNAME/super-app-sekolah.git
   git branch -M main
   git push -u origin main
   ```
4. Buka dasbor [Vercel](https://vercel.com):
   - Klik **Add New...** $\rightarrow$ **Project**.
   - Pilih repositori `super-app-sekolah` dari GitHub Anda.
   - Klik **Deploy**.
5. Selesai! Dalam 30 detik website Anda telah aktif di seluruh dunia dengan domain cepat dan SSL gratis, misalnya:  
   `https://super-app-sekolah.vercel.app`

---

## 📲 Langkah 4: Cara Pasang Aplikasi di Android (PWA)

Aplikasi telah memenuhi standar **Progressive Web App (PWA)** sehingga pengguna tidak perlu mencari di Play Store:

1. Buka tautan website Super App (dari Vercel) di browser **Google Chrome** pada smartphone Android.
2. Di layar utama, ketuk tombol **`📲 Pasang di HP`** yang muncul di bilah atas aplikasi.
3. Atau ketuk menu **titik tiga (⋮)** di pojok kanan atas Google Chrome $\rightarrow$ pilih **"Tambahkan ke Layar Utama" (*Add to Home screen*)** atau **"Pasang Aplikasi"**.
4. Ikon resmi Super App akan muncul di layar utama Android.
5. Saat dibuka, aplikasi akan berjalan secara mandiri (*standalone fullscreen*) tanpa bilah alamat browser, dengan performa instan dan kemampuan offline cache.

---

## 👥 Panduan Penggunaan Berdasarkan Peran Pengguna

### 1. 👦 Siswa (Peserta Didik)
- **Login:** Ketik **10 Digit NISN** resmi. PIN default: 4 digit terakhir NISN (contoh NISN: `0081234567` $\rightarrow$ PIN: `4567`).
- **Beranda Siswa:** Memantau ringkasan kehadiran hari ini, status Jurnal 7 Kebiasaan, jadwal ekskul hari ini, dan buku saku disiplin.
- **7 Kebiasaan:** Mengisi checklist kilat 15 detik, wajib memotret dengan kamera langsung HP ber-watermark otomatis (nama, jam WIB, tanggal), dan mengunduh lembar rekap mingguan PDF (2 logo & 2 tanda tangan).
- **Presensi Harian:** Melihat rekapitulasi kehadiran bulanan KBM kelas (% Hadir).
- **Ekskul Saya:** Memantau kehadiran latihan dan mendaftar mandiri ke cabang ekstra selama periode pendaftaran dibuka.
- **Nilai Ulangan:** Memeriksa capaian asesmen per mata pelajaran dan mencetak Lembar Capaian Asesmen Resmi A4.
- **Kelulusan (Kelas 9):** Menikmati hitung mundur dan membuka amplop digital kelulusan serta mencetak **Surat Keterangan Lulus (SKL)** resmi ber-QR Code validasi.
- **Buku Saku Disiplin:** Memantau akumulasi poin pelanggaran dan status pembinaan secara transparan (hanya lihat).

### 2. 👨‍🏫 Wali Kelas (Walas)
- **Login:** Masukkan NIP resmi. PIN default: `1234`.
- **Presensi KBM Kelas:** Form absensi cepat *Exception-based* (semua siswa otomatis Hadir, Walas hanya perlu menandai siswa yang Sakit, Izin, Alpha, atau Terlambat).
- **Rekapitulasi Ekskul Rombel:** Walas **tidak mengabsen latihan ekskul**, melainkan memantau rekapitulasi keaktifan siswa kelas binaannya di semua cabang ekskul, dilengkapi kartu peringatan dini (*Early Warning*) untuk siswa yang sering bolos ekstra, serta ekspor CSV/Excel untuk nilai rapor.

### 3. ⚽ Pelatih Ekstrakurikuler
- **Login:** Masukkan Username Pelatih (contoh: `PELATIH-FUTSAL`, `PELATIH-PRAMUKA`). PIN default: `1234`.
- **Input Presensi Sesi Latihan:** Sistem otomatis menyaring **HANYA siswa yang sah terdaftar** di cabang binaannya. Menggunakan prinsip *Exception-based* (seluruh peserta otomatis Hadir, pelatih hanya menandai yang Sakit/Izin/Alpha).

### 4. 🌟 Guru Wali (Pembina Karakter)
- **Login:** Masukkan NIP guru pembina. PIN default: `1234`.
- **Validasi 7 Kebiasaan:** Memeriksa foto bukti ter-watermark layar penuh dan memberikan catatan motivasi pembinaan.
- **Tab Siswa Belum Lapor:** Melihat siswa binaan yang belum mengirim laporan hari ini dan menyapa orang tua secara instan lewat tombol **`📲 Ingatkan WA`** dengan pesan sopan otomatis.
- **Cetak Lembar Rekap Mingguan A4:** Mencetak lembar evaluasi pembiasaan mingguan untuk siswa binaannya.

### 5. ⚖️ Guru Piket / Bimbingan Konseling (BK)
- **Login:** Masukkan NIP Guru BK / Petugas Piket. PIN default: `1234`.
- **Scan QR Kartu Pelajar:** Kamera membaca barcode/QR kartu pelajar secara instan disertai bunyi audio *bip*, langsung memilih data siswa dalam < 1 detik.
- **Mode Razia Pagi Multi-Atribut:** Mencatat beberapa atribut yang melanggar sekaligus (sabuk + dasi + kaos kaki + topi).
- **Anti-Duplikasi Harian:** Pelanggaran tunggal otomatis dicegah agar tidak dicatat dua kali oleh guru lain pada hari yang sama.
- **Panggilan Orang Tua:** Memantau akumulasi poin siswa (Ambang SP-1, SP-2, SP-3) dan mencetak Surat Panggilan Orang Tua resmi standar dinas A4.

### 6. 👑 Administrator Sekolah
- **Akses:** Ketuk ikon gembok di bilah atas, masukkan PIN Admin (default `123456`).
- **Pengaturan Terpusat Kop 2 Logo:** Ganti logo daerah dan logo sekolah, otomatis diterapkan ke seluruh dokumen cetak dinas: SKL, Lembar 7 Kebiasaan, Rapor Nilai, dan Surat Panggilan BK.
- **Master Data:** Menambah, mengubah, dan mengimpor data Siswa, Guru, Ekstrakurikuler, dan Master Tata Tertib.
- **Pengumuman Kelulusan:** Menentukan tanggal & jam rilis serentak serta tombol buka/kunci darurat.
- **Kontrol Pendaftaran Ekskul:** Membuka atau menutup pendaftaran secara global (*Buka Semua / Tutup Semua*) atau parsial per cabang.

---

## ⚡ Sinkronisasi Real-Time & Update Versi Apps Script

Aplikasi kini telah dilengkapi arsitektur **Sinkronisasi Dua Arah Real-Time**:
1. **Perubahan Langsung di Google Sheet Muncul Seketika:**
   - Jika admin atau guru mengubah nilai di `DATA_NILAI`, mengubah status di `DATA_LULUS`, presensi di `PRESENSI_HARI`, atau poin di `LOG_TIBUM`, aplikasi akan otomatis memperbarui tampilan:
     - Setiap **60 detik** secara berkala di latar belakang (*Auto-polling ramah kuota GAS*).
     - Otomatis saat HP dibuka kembali / layar menyala (*visibilitychange*).
     - Tombol manual **`🔄`** di header dapat diklik kapan saja untuk penyegaran data instan.
     - Didukung **Offline Stale-While-Revalidate Cache**: Aplikasi langsung terbuka dalam 0 detik tanpa layar putih.
2. **PENTING Saat Memperbarui Kode Apps Script (`Code.gs`):**
   - Setiap kali Anda menyalin kode terbaru `Code.gs` ke editor Google Apps Script:
     1. Klik **Deploy** $\rightarrow$ **Manage deployments** (*Kelola deployment*).
     2. Klik ikon **Pensil (Edit)** pada deployment aktif Anda.
     3. Pada dropdown **Version**, pilih **New version** (*Versi baru*).
     4. Klik **Deploy**.
     *(Langkah ini wajib agar Google Apps Script menggunakan kode versi terbaru dan menyajikan seluruh 12 tab data secara real-time).*
