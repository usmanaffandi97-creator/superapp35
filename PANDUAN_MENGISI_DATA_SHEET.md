# 📊 Panduan Lengkap Mengisi Data Google Sheet Super App Sekolah
*1 Spreadsheet Terpadu (12 Tab Database)*

Dokumen ini adalah panduan resmi bagi **Administrator Sekolah, Tata Usaha (TU), dan Guru** untuk mengisi atau mengedit data secara langsung di file Google Spreadsheet **`DATABASE_SUPER_APP_SEKOLAH`**.

---

## ⚠️ Aturan Emas (Wajib Diperhatikan!)

1. **JANGAN Mengubah atau Menghapus Baris Header (Baris 1)**:  
   Nama kolom di baris 1 digunakan langsung oleh sistem kode program. Mengubah nama kolom akan menyebabkan sistem gagal membaca data.
2. **Format Teks Angka Nol di Awal (NISN & NIP)**:  
   Pastikan kolom NISN dan NIP diformat sebagai **Teks Biasa (Plain Text)**. Jika diformat sebagai angka, Google Sheet otomatis membuang angka nol di depan (misal `0081234567` menjadi `81234567`).  
   > **Tips Kilat:** Pada Google Sheet, pilih menu bilah atas **⚡ Super App Sekolah** $\rightarrow$ **⚡ Format Ulang Angka Nol NISN & NIP (@)** untuk memulihkan dan mengunci format teks secara otomatis!
3. **Format Tanggal**:  
   Gunakan format standar internasional: `YYYY-MM-DD` (contoh: `2010-05-15` atau `2026-10-29`).
4. **Konsistensi Nama Kelas/Rombel**:  
   Pastikan penulisan rombel konsisten persis sama di semua tab (contoh: gunakan `8-A`, jangan di satu tab `8-A` dan di tab lain `VIII A` atau `8A`).

---

## 📑 Rincian 12 Tab Database & Cara Mengisinya

---

### 1. Tab `PENGATURAN` (Identitas Sekolah & Konfigurasi Global)
Tab ini mengatur identitas sekolah yang otomatis tampil di website, kop surat resmi 2 logo simetris, dan jadwal kelulusan.

| Kolom A: `Kunci` | Kolom B: `Nilai` (Isi Data Anda) | Kolom C: `Keterangan` |
| :--- | :--- | :--- |
| `NAMA_SEKOLAH` | `SMP NEGERI 1 INDONESIA HEBAT` | Nama resmi sekolah berserta jenjang |
| `INSTANSI_PEMBINA` | `PEMERINTAH KOTA / KABUPATEN - DINAS PENDIDIKAN` | Nama dinas pendidikan atau yayasan pembina |
| `ALAMAT_SEKOLAH` | `Jl. Pendidikan Karakter No. 07, Kota Cerdas` | Alamat jalan, nomor telepon, dan email sekolah |
| `LOGO_KIRI_PEMDA` | `https://upload.wikimedia.org/.../Coat_of_arms_of_Indonesia.svg.png` | URL link gambar logo Pemda / Kemdikbud (posisi kiri kop surat) |
| `LOGO_KANAN_SEKOLAH` | `https://upload.wikimedia.org/.../Logo_Sekolah.png` | URL link gambar logo resmi sekolah (posisi kanan kop surat) |
| `KOTA_TITIMANGSA` | `Kota Cerdas` | Nama kota untuk tanggal surat resmi dinas (misal: *Kota Cerdas, 10 Juni 2026*) |
| `NAMA_KEPSEK` | `Drs. H. Mulyadi, M.Pd.` | Nama lengkap Kepala Sekolah berserta gelar akademik |
| `NIP_KEPSEK` | `197205101998021003` | NIP resmi Kepala Sekolah |
| `PIN_ADMIN` | `123456` | 6 digit PIN rahasia untuk membuka menu Admin di web |
| `TGL_RILIS_KELULUSAN` | `2026-06-10 10:00` | Format: `YYYY-MM-DD HH:mm`. Hitung mundur kelulusan mengacu pada jam ini |
| `STATUS_RILIS_KELULUSAN` | `TERKUNCI` atau `DIBUKA` | Jika `DIBUKA`, siswa dapat membuka amplop kelulusan meski waktu rilis belum tiba |
| `POIN_SP1` | `30` | Ambang poin pelanggaran untuk terbitnya Surat Peringatan 1 (SP-1) |
| `POIN_SP2` | `60` | Ambang poin pelanggaran untuk terbitnya Surat Peringatan 2 (SP-2) |
| `POIN_SP3` | `90` | Ambang poin pelanggaran untuk terbitnya Surat Peringatan 3 (Panggilan Orang Tua) |
| `STATUS_PENDAFTARAN_EKSKUL` | `BUKA` atau `TUTUP` | Sakelar pembuka/penutup pendaftaran mandiri ekstra oleh siswa |
| `PENGUMUMAN_RUNNING` | `Selamat datang di Super App Sekolah Terpadu...` | Teks berjalan (*running text ticker*) di beranda utama |

---

### 2. Tab `DATA_SISWA` (Master Data Peserta Didik)
Master data siswa yang digunakan untuk login siswa, absensi harian KBM, jurnal 7 kebiasaan, nilai, dan buku disiplin.

| No | Nama Kolom | Tipe / Format | Contoh Isi | Penjelasan |
| :---: | :--- | :--- | :--- | :--- |
| **A** | `NISN` | **Teks (@)**, 10 digit | `0081234567` | **Username login siswa**. Awalan nol wajib dipertahankan |
| **B** | `NIS` | Teks | `1001` | Nomor Induk Siswa lokal sekolah |
| **C** | `Nama_Lengkap` | Teks | `Ahmad Fauzan Pratama` | Nama resmi siswa sesuai akta kelahiran/ijazah |
| **D** | `Kelas_Rombel` | Teks | `8-A` | Kelas siswa saat ini (contoh: `7-A`, `8-B`, `9-A`) |
| **E** | `Jenis_Kelamin` | Teks (1 huruf) | `L` atau `P` | `L` = Laki-laki, `P` = Perempuan |
| **F** | `Tanggal_Lahir` | Tanggal (`YYYY-MM-DD`) | `2010-05-15` | Digunakan untuk verifikasi dokumen SKL kelulusan |
| **G** | `No_HP_Ortu` | Teks angka | `081234567890` | Nomor WhatsApp orang tua (untuk tombol kirim WA pengingat) |
| **H** | `PIN_Siswa` | **Teks (@)**, 4 digit | `4567` | PIN login siswa (default: 4 digit terakhir NISN) |
| **I** | `NIP_Guru_Wali` | Teks | `198001012005011001` | **NIP Guru Wali / Pembina Karakter Siswa**. Menghubungkan siswa dengan Guru Walinya untuk mentoring 7 Kebiasaan, notifikasi WA ke orang tua, dan cetak Rekap Mingguan A4 (harus sama dengan NIP di `DATA_GURU`) |

> 💡 **Fitur Plotting Langsung di Dashboard Admin:**  
> Administrator tidak perlu mengedit kolom `NIP_Guru_Wali` secara manual satu per satu di Google Sheet! Cukup login sebagai Admin di aplikasi, buka tab **🌟 Plotting Guru Wali (Siswa Binaan)**. Admin dapat melakukan penugasan per-siswa, per-kelas, maupun menggunakan tombol **⚡ Auto-Assign Wali Kelas (1-Klik)** yang otomatis tersimpan permanen ke Google Sheets.

---

### 3. Tab `DATA_GURU` (Master Data Guru, Wali Kelas & Pelatih)
Master data akun pendidik, wali kelas, pelatih ekstrakurikuler, dan guru BK.

| No | Nama Kolom | Tipe / Format | Contoh Isi | Penjelasan |
| :---: | :--- | :--- | :--- | :--- |
| **A** | `NIP` | **Teks (@)** | `198001012005011001` atau `PELATIH-FUTSAL` | **Username login guru/pelatih**. Gunakan ID unik |
| **B** | `Nama_Guru` | Teks | `Bpk. Ahmad Hidayat, S.Pd.` | Nama lengkap guru beserta gelar |
| **C** | `Peran_Utama` | Pilihan baku | `WALI_KELAS` / `PELATIH_EKSKUL` / `GURU_BK` / `ADMIN` | Menentukan menu portal yang terbuka di aplikasi |
| **D** | `Rombel_Wali_Kelas` | Teks | `8-A` | Diisi rombel binaan jika perannya `WALI_KELAS`. Kosongkan jika bukan walas |
| **E** | `Cabang_Ekskul` | Teks | `EKS-FUTSAL` | Diisi ID Ekskul jika perannya `PELATIH_EKSKUL`. Kosongkan jika guru kelas |
| **F** | `Mata_Pelajaran` | Teks | `Matematika` | Mata pelajaran yang diampu |
| **G** | `No_HP_WA` | Teks angka | `081211112222` | Nomor WhatsApp aktif guru |
| **H** | `PIN_Guru` | Teks | `1234` | PIN login ke aplikasi guru (default: `1234`, untuk admin `123456`) |

> 📌 **Aturan Peran Pendidik:**
> - `GURU WALI`: Pembimbing kelompok siswa binaan (7 Kebiasaan Anak Indonesia Hebat). Dapat dipegang oleh semua guru (Wali Kelas, Guru Mapel, BK). Membuka tab **🌟 Guru Wali (7 Kebiasaan & WA)** untuk memantau siswa binaan, mengirim pengingat WA ke orang tua, memvalidasi bukti kamera watermark, dan mencetak Lembar Rekap Mingguan resmi (A4).
> - `WALI_KELAS`: Mengisi presensi harian KBM rombel kelasnya, merekap presensi, dan menerima **rekapitulasi ekskul** rombelnya.
> - `PELATIH_EKSKUL`: Khusus mengisi presensi sesi latihan ekstrakurikuler cabang yang dilatih.
> - `GURU_BK`: Memegang Buku Saku Disiplin, Scan QR kartu pelajar, dan cetak surat panggilan orang tua.

---

### 4. Tab `EKSKUL_MASTER` (Katalog Cabang Ekstrakurikuler)
Daftar seluruh cabang kegiatan ekstrakurikuler yang diselenggarakan oleh sekolah.

| No | Nama Kolom | Tipe / Format | Contoh Isi | Penjelasan |
| :---: | :--- | :--- | :--- | :--- |
| **A** | `ID_Ekskul` | Teks Unik | `EKS-FUTSAL` | Kode unik cabang (misal: `EKS-PRAMUKA`, `EKS-BASKET`, `EKS-PMR`) |
| **B** | `Nama_Ekskul` | Teks | `Futsal & Sepak Bola` | Nama resmi cabang ekstrakurikuler |
| **C** | `Kategori` | Teks | `Olahraga` | Kelompok ekskul: `Olahraga`, `Kepanduan`, `Kemanusiaan`, `Sains & Teknologi`, `Seni & Budaya` |
| **D** | `Hari_Latihan` | Teks | `Selasa & Jumat` | Hari pelaksanaan latihan rutin |
| **E** | `Jam_Latihan` | Teks | `15:30 - 17:00` | Waktu sesi latihan |
| **F** | `Tempat` | Teks | `Lapangan Utama` | Lokasi kegiatan latihan di sekolah |
| **G** | `Kuota` | Angka | `30` | Jumlah maksimal siswa yang dapat mendaftar |
| **H** | `NIP_Pembina` | Teks | `PELATIH-FUTSAL` | NIP / Username pelatih penanggung jawab (harus sama dengan NIP di `DATA_GURU`) |
| **I** | `Status_Pendaftaran`| Pilihan | `BUKA` atau `TUTUP` | Status pendaftaran khusus cabang ini |

---

### 5. Tab `EKSKUL_ANGGOTA` (Daftar Siswa Peserta Ekstrakurikuler)
Mencatat siswa yang terdaftar sebagai anggota sah suatu cabang ekskul. Tab ini **otomatis terisi** saat siswa mendaftar mandiri di aplikasi, namun juga dapat diisi/diimpor manual oleh admin sekolah.

| Kolom | Nama Kolom | Contoh Isi | Keterangan |
| :---: | :--- | :--- | :--- |
| **A** | `ID_Pendaftaran` | `REG-001` | Nomor registrasi pendaftaran unik |
| **B** | `NISN` | `0081234567` | 10 digit NISN siswa |
| **C** | `Nama_Siswa` | `Ahmad Fauzan Pratama` | Nama siswa |
| **D** | `Kelas` | `8-A` | Kelas siswa |
| **E** | `ID_Ekskul` | `EKS-FUTSAL` | ID cabang ekskul yang diikuti |
| **F** | `Nama_Ekskul` | `Futsal & Sepak Bola` | Nama cabang ekskul |
| **G** | `Tanggal_Daftar` | `2026-10-01` | Tanggal siswa terdaftar |
| **H** | `Status` | `AKTIF` atau `KELUAR` | Hanya siswa berstatus `AKTIF` yang masuk daftar absensi pelatih |

---

### 6. Tab `DATA_NILAI` (Pengumuman & Capaian Asesmen Siswa)
Berisi nilai ulangan harian, Penilaian Tengah Semester (PTS), atau Penilaian Akhir Semester (PAS).  
> 💡 **Cara Termudah Input Nilai:** Guru tidak perlu mengetik satu-satu di Sheet! Gunakan fitur **"Paste Leger Nilai Excel Sekelas"** di aplikasi Guru. Cukup copy 1 tabel nilai dari Excel dan paste ke web, dalam < 10 detik seluruh nilai sekelas otomatis tersimpan ke Sheet ini!

Jika ingin menginput manual langsung di Spreadsheet:
| Kolom | Nama Kolom | Format | Contoh Isi |
| :---: | :--- | :--- | :--- |
| **A** | `ID_Nilai` | Teks | `NL-001` (atau unik: `NL-` + nomor) |
| **B** | `NISN` | **Teks (@)** | `0081234567` |
| **C** | `Kelas` | Teks | `8-A` |
| **D** | `Mata_Pelajaran` | Teks | `Matematika` |
| **E** | `Jenis_Asesmen` | Teks | `Penilaian Akhir Semester (PAS)` / `Ulangan Harian 1` |
| **F** | `Nilai_Angka` | Angka | `88` (skala 0 - 100) |
| **G** | `Nilai_Huruf` | Teks | `A` (>=90), `B` (>=80), `C` (>=70), `D` (<70) |
| **H** | `Catatan_Guru` | Teks | `Sangat memahami materi aljabar` |
| **I** | `Tgl_Input` | Tanggal | `2026-10-25` |

---

### 7. Tab `DATA_LULUS` (Pengumuman Kelulusan & SKL Online - Kelas 9)
Khusus untuk siswa tingkat akhir (Kelas 9) yang akan lulus. Digunakan untuk pencetakan dokumen resmi **Surat Keterangan Lulus (SKL) A4** ber-QR Code validasi.

| Kolom | Nama Kolom | Contoh Isi | Penjelasan |
| :---: | :--- | :--- | :--- |
| **A** | `NISN` | `0085678901` | 10 digit NISN siswa kelas 9 |
| **B** | `No_Ujian` | `02-001-005-4` | Nomor peserta ujian sekolah |
| **C** | `Nama_Siswa` | `Dimas Arya Wicaksana` | Nama lengkap siswa |
| **D** | `Kelas` | `9-A` | Kelas |
| **E** | `No_Surat_SKL` | `421.3/SKL-SMP1/2026/001` | Nomor resmi SKL yang tercetak di surat dinas |
| **F** | `Status_Kelulusan` | `LULUS` atau `DITUNDA` | Ditampilkan di amplop digital dan surat kelulusan |
| **G** | `Nilai_Rata_Rata` | `86.5` | Nilai rata-rata ijazah/kelulusan |
| **H** | `Rincian_Nilai_Ijazah` | `{"PAI":88,"PPKn":85,"B.Indo":86,"MTK":82,"IPA":85}` | Format JSON rincian nilai per mapel (opsional) |
| **I** | `Tgl_Lahir` | `2009-02-12` | Tanggal lahir siswa untuk cetak di SKL |

---

### 8. Tab `MASTER_TIBUM` (Daftar Aturan Pelanggaran & Poin Disiplin)
Berisi katalog tata tertib sekolah, poin sanksi, dan sifat pelanggaran.

| Kolom | Nama Kolom | Contoh Isi | Penjelasan |
| :---: | :--- | :--- | :--- |
| **A** | `Kode_Pelanggaran` | `ATR-01`, `DIS-01`, `ETK-01`, `BRT-01` | Kode unik aturan |
| **B** | `Kategori` | `Atribut & Kerapian`, `Kedisiplinan & Waktu`, `Etika & Perilaku`, `Pelanggaran Berat` | Kategori pelanggaran |
| **C** | `Nama_Pelanggaran` | `Tidak memakai dasi sekolah saat upacara` | Bunyi aturan tata tertib |
| **D** | `Poin` | `5`, `10`, `25`, `75` | Bobot poin kumulatif pelanggaran |
| **E** | `Sifat` | `Tunggal` atau `Berulang` | `Tunggal` = Hanya dapat dicatat 1x sehari (anti razia ganda). `Berulang` = Bisa dicatat berulang kali |

---

### 9. Tab Transaksi yang Otomatis Terisi oleh Aplikasi (Tidak Perlu Input Manual)

Empat tab di bawah ini dirancang untuk **menerima data otomatis** dari smartphone guru, siswa, dan pelatih saat aplikasi digunakan:

1. **`PRESENSI_HARI`**  
   Otomatis terisi saat **Wali Kelas** menekan tombol *"Simpan Presensi Kelas"* di portal guru.
   *Kolom: ID_Presensi, Tanggal, Kelas, NISN, Nama_Siswa, Status_Kehadiran (HADIR/SAKIT/IZIN/ALPHA/TERLAMBAT), Keterangan, Dicatat_Oleh, Timestamp.*
2. **`EKSKUL_ABSENSI`**  
   Otomatis terisi saat **Pelatih Ekstrakurikuler** mencatat kehadiran sesi latihan.
   *Hanya mencatat siswa yang tidak hadir (Exception-based: Sakit/Izin/Alpha) untuk efisiensi baris.*
3. **`LOG_KEBIASAAN`**  
   Otomatis terisi saat **Siswa** mengirim Jurnal 7 Kebiasaan Anak Hebat setiap hari beserta tautan foto bukti kamera ber-watermark.
4. **`LOG_TIBUM`**  
   Otomatis terisi saat **Guru BK / Guru Piket** mencatat pelanggaran siswa, baik melalui Scan QR Kartu Pelajar maupun centang razia atribut pagi.

---

## 🛠️ Tips Pintar Mempercepat Pengisian Data

1. **Impor dari Dapodik / Emis / Excel Lama:**
   - Cukup salin kolom NISN, NIS, Nama, Kelas, JK, Tanggal Lahir, dan No HP dari file Excel Dapodik Anda.
   - Tempelkan (*Paste Special* $\rightarrow$ *Values only*) ke tab `DATA_SISWA`.
2. **Jalankan Menu Perbaikan Otomatis:**
   - Setelah selesai paste data banyak, buka menu di Google Sheet:  
     **⚡ Super App Sekolah** $\rightarrow$ **⚡ Format Ulang Angka Nol NISN & NIP (@)**.
   - Script akan otomatis menyeleksi dan memulihkan seluruh angka nol yang hilang di depan NISN siswa dan NIP guru!
3. **Langsung Cek di Aplikasi:**
   - Setelah mengedit data di spreadsheet, buka aplikasi web/PWA di HP atau laptop Anda.
   - Tekan tombol **`🔄` (Segarkan)** di pojok kanan atas, atau berpindah antar tab. Seluruh data yang baru Anda ubah di Sheet akan langsung tampil seketika!
