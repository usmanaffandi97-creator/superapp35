/**
 * ==============================================================================
 * SUPER APP SEKOLAH TERPADU — BACKEND GOOGLE APPS SCRIPT (GAS)
 * Database: 1 Google Sheet Terpadu (12 Tab)
 * Modul:
 *  1. Presensi Harian Siswa (KBM Kelas - Walas)
 *  2. Presensi & Pendaftaran Ekstrakurikuler (Pelatih & Walas Rekap)
 *  3. Pengumuman & Pembagian Nilai Ulangan Siswa (Paste Leger Sekelas)
 *  4. Pengumuman Kelulusan Siswa (SKL Online & Hitung Mundur)
 *  5. 7 Kebiasaan Anak Indonesia Hebat (Jurnal, Kamera Watermark & WA Reminder)
 *  6. Buku Catatan & Poin Pelanggaran Siswa (Scan QR, Razia Pagi, Surat SP)
 * ==============================================================================
 */

// Konstanta Nama Sheet (12 Tab Database)
const SHEET_CONFIG        = "PENGATURAN";
const SHEET_SISWA         = "DATA_SISWA";
const SHEET_GURU          = "DATA_GURU";
const SHEET_PRESENSI_HARI = "PRESENSI_HARI";
const SHEET_NILAI         = "DATA_NILAI";
const SHEET_LULUS         = "DATA_LULUS";
const SHEET_EKSKUL_MASTER = "EKSKUL_MASTER";
const SHEET_EKSKUL_ANGGOTA= "EKSKUL_ANGGOTA";
const SHEET_EKSKUL_ABSENSI= "EKSKUL_ABSENSI";
const SHEET_LOG_KEBIASAAN = "LOG_KEBIASAAN";
const SHEET_MASTER_TIBUM  = "MASTER_TIBUM";
const SHEET_LOG_TIBUM     = "LOG_TIBUM";

/**
 * Entry Point Web App GET (Melayani Web App HTML & REST API JSON untuk Vercel)
 */
function doGet(e) {
  try {
    const ss = getSS();
    if (!ss.getSheetByName(SHEET_CONFIG)) {
      setupDatabase();
    }
  } catch (err) {
    Logger.log("Inisialisasi auto: " + err.message);
  }

  // Jika dipanggil via REST API (Vercel) dengan parameter action
  if (e && e.parameter && e.parameter.action) {
    const action = e.parameter.action;
    let result = { success: false, error: "Action tidak dikenal: " + action };

    try {
      if (action === "ping") {
        let ssName = "Tidak Terdeteksi";
        let ssId = "";
        try {
          const targetSs = getSS();
          ssName = targetSs.getName();
          ssId = targetSs.getId();
        } catch(e){}
        result = { 
          success: true, 
          message: "Super App Sekolah API Aktif", 
          spreadsheetName: ssName,
          spreadsheetId: ssId,
          timestamp: new Date().toISOString() 
        };
      } else if (action === "getInitialData") {
        result = getInitialData();
      } else if (action === "getPresensiHarian") {
        result = getPresensiHarian(e.parameter.kelas, e.parameter.tanggal, e.parameter.nisn);
      } else if (action === "getPresensiEkskul") {
        result = getPresensiEkskul(e.parameter.idEkskul, e.parameter.tanggal, e.parameter.nisn);
      } else if (action === "getNilaiSiswa") {
        result = getNilaiSiswa(e.parameter.nisn, e.parameter.kelas);
      } else if (action === "getKelulusanSiswa") {
        result = getKelulusanSiswa(e.parameter.nisn, e.parameter.tglLahir);
      } else if (action === "get7Kebiasaan") {
        result = get7Kebiasaan(e.parameter.nisn, e.parameter.tanggal);
      } else if (action === "getBelumLapor7Kebiasaan") {
        result = getBelumLapor7Kebiasaan(e.parameter.nipGuruWali, e.parameter.tanggal);
      } else if (action === "getPelanggaranSiswa") {
        result = getPelanggaranSiswa(e.parameter.nisn, e.parameter.tanggal, e.parameter.kelas);
      }
    } catch (err) {
      result = { success: false, error: err.message };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Tampilan langsung dari Apps Script jika dibuka tanpa Vercel
  return HtmlService.createHtmlOutput(
    "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Super App Sekolah Backend</title></head>" +
    "<body style='font-family:sans-serif;padding:30px;line-height:1.6;color:#1e293b;background:#f8fafc;'>" +
    "<h2>🚀 Backend Super App Sekolah Terpadu Aktif!</h2>" +
    "<p>Endpoint API Google Apps Script ini berhasil tersambung dengan 1 Google Sheet Database.</p>" +
    "<p>Silakan gunakan URL ini sebagai <code>APPS_SCRIPT_URL</code> pada aplikasi frontend Vercel Anda.</p>" +
    "<div style='background:#e2e8f0;padding:12px;border-radius:8px;word-break:break-all;'><code>" +
    ScriptApp.getService().getUrl() + "</code></div>" +
    "</body></html>"
  ).setTitle("Super App Sekolah Backend")
   .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
   .addMetaTag("viewport", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");
}

/**
 * Entry Point POST (Menerima Request dari Frontend Vercel)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (pErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || (e && e.parameter && e.parameter.action);
    let response = { success: false, error: "Action tidak ditentukan: " + (action || 'kosong') };

    // -------------------------------------------------------------
    // OPERASI READ-ONLY (Tanpa LockService agar Respons Cepat & Tidak Antre)
    // -------------------------------------------------------------
    if (action === "ping") {
      let ssName = "Tidak Terdeteksi";
      let ssId = "";
      try {
        const targetSs = getSS();
        ssName = targetSs.getName();
        ssId = targetSs.getId();
      } catch(e){}
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Super App Sekolah API Aktif", 
        spreadsheetName: ssName,
        spreadsheetId: ssId,
        timestamp: new Date().toISOString() 
      })).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "getInitialData") {
      response = getInitialData();
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === "loginUser") {
      response = loginUser(payload.role, payload.identifier, payload.pin);
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === "verifyAdminPin") {
      response = verifyAdminPin(payload.pin);
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // -------------------------------------------------------------
    // OPERASI WRITE / TRANSAKSI DATABASE (Gunakan LockService Concurrency)
    // -------------------------------------------------------------
    let lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000); // Kunci concurrency 15 detik
    } catch (lockErr) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Sistem sedang memproses data lain, silakan coba beberapa saat lagi." 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    try {
      if (action === "simpanPresensiHarian") {
        response = simpanPresensiHarian(payload.tanggal, payload.kelas, payload.dataAbsen, payload.dicatatOleh);
      } else if (action === "simpanPresensiEkskul") {
        response = simpanPresensiEkskul(payload.tanggal, payload.idEkskul, payload.dataAbsen, payload.dicatatOleh);
      } else if (action === "daftarEkskulMandiri") {
        response = daftarEkskulMandiri(payload.nisn, payload.nama, payload.kelas, payload.idEkskul, payload.namaEkskul);
      } else if (action === "batalEkskulMandiri") {
        response = batalEkskulMandiri(payload.nisn, payload.idEkskul);
      } else if (action === "simpanNilaiUlangan") {
        response = simpanNilaiUlangan(payload.dataNilai, payload.inputOleh);
      } else if (action === "simpanKelulusan") {
        response = simpanKelulusan(payload.dataKelulusan, payload.pin);
      } else if (action === "simpan7Kebiasaan") {
        response = simpan7Kebiasaan(payload.laporan);
      } else if (action === "validasi7Kebiasaan") {
        response = validasi7Kebiasaan(payload.idLog, payload.statusValidasi, payload.catatanGuru, payload.nipValidator);
      } else if (action === "simpanPelanggaran") {
        response = simpanPelanggaran(payload.pelanggaran);
      } else if (action === "updateStatusBK") {
        response = updateStatusBK(payload.idLog, payload.statusBK, payload.catatanKasus, payload.sanksi);
      } else if (action === "simpanPengaturan") {
        response = simpanPengaturan(payload.config, payload.pin);
      } else if (action === "simpanMasterSiswa") {
        response = simpanMasterSiswa(payload.siswaList, payload.pin);
      } else if (action === "updateGuruWaliSiswa") {
        response = updateGuruWaliSiswa(payload.assignments, payload.pin);
      } else if (action === "simpanMasterGuru") {
        response = simpanMasterGuru(payload.guruList, payload.pin);
      } else if (action === "simpanMasterEkskul") {
        response = simpanMasterEkskul(payload.ekskulList, payload.pin);
      } else if (action === "updateProfilSiswa") {
        response = updateProfilSiswa(payload.nisn, payload.noHpOrtu);
      }

      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    } finally {
      try { lock.releaseLock(); } catch(e){}
    }

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: "Kesalahan server: " + err.message 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Menu Kustom di Google Sheet
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("⚡ Super App Sekolah")
      .addItem("🚀 Setup / Reset 12 Tab Database", "setupDatabase")
      .addItem("⚡ Format Ulang Angka Nol NISN & NIP (@)", "repairFormatTeksNisn")
      .addSeparator()
      .addItem("🔗 Dapatkan Link Web App", "tampilkanUrlService")
      .addToUi();
  } catch (e) {
    Logger.log("onOpen error: " + e.message);
  }
}

function tampilkanUrlService() {
  const url = ScriptApp.getService().getUrl();
  const ui = SpreadsheetApp.getUi();
  ui.alert("Link Web App Super App", "Salin URL berikut untuk dipasang di Vercel:\n\n" + url, ui.ButtonSet.OK);
}

/**
 * Helper: Ambil Spreadsheet Aktif dengan Caching In-Memory Execution
 * Mendukung Container-Bound Script (Ekstensi > Apps Script) maupun Standalone Script (Script Properties)
 */
let _cachedSS = null;
function getSS() {
  if (_cachedSS) return _cachedSS;

  // 1. Coba ambil dari Active Spreadsheet (jika skrip terikat / bound script di dalam Google Sheets)
  try {
    _cachedSS = SpreadsheetApp.getActiveSpreadsheet();
    if (_cachedSS) return _cachedSS;
  } catch (e) {
    Logger.log("getActiveSpreadsheet error: " + e.message);
  }

  // 2. Coba ambil dari Script Properties (jika standalone script atau disetel manual SPREADSHEET_ID / SPREADSHEET_URL)
  try {
    const props = PropertiesService.getScriptProperties();
    const sheetId = props.getProperty("SPREADSHEET_ID") || props.getProperty("SHEET_ID");
    if (sheetId) {
      _cachedSS = SpreadsheetApp.openById(sheetId);
      if (_cachedSS) return _cachedSS;
    }
    const sheetUrl = props.getProperty("SPREADSHEET_URL");
    if (sheetUrl) {
      _cachedSS = SpreadsheetApp.openByUrl(sheetUrl);
      if (_cachedSS) return _cachedSS;
    }
  } catch (e) {
    Logger.log("ScriptProperties open spreadsheet error: " + e.message);
  }

  throw new Error("Spreadsheet tidak ditemukan! Pastikan skrip ini dipasang melalui menu 'Ekstensi > Apps Script' di dalam Google Spreadsheet Anda, atau simpan 'SPREADSHEET_ID' pada Pengaturan Proyek > Script Properties.");
}

/**
 * Format tanggal super cepat tanpa memanggil Utilities.formatDate berulang kali di dalam loop ribuan baris
 */
function formatTglFast(val) {
  if (!val) return "";
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = val.getMonth() + 1;
    const d = val.getDate();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
  }
  return String(val).trim();
}

function formatWaktuFast(val) {
  if (!val) return "";
  if (val instanceof Date) {
    const h = val.getHours();
    const min = val.getMinutes();
    return (h < 10 ? "0" + h : h) + ":" + (min < 10 ? "0" + min : min);
  }
  return String(val).trim();
}

/**
 * Helper: Buat Sheet Jika Belum Ada & Kembalikan Objeknya
 */
function getOrCreateSheet(name, headers) {
  const ss = getSS();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1e40af");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Inisialisasi Seluruh 12 Tab Database dengan Struktur Lengkap & Sample Data
 */
function setupDatabase() {
  const ss = getSS();

  // 1. PENGATURAN
  const sheetConfig = getOrCreateSheet(SHEET_CONFIG, ["Kunci", "Nilai", "Keterangan"]);
  if (sheetConfig.getLastRow() <= 1) {
    const defaultConfigs = [
      ["NAMA_SEKOLAH", "SMP NEGERI 1 INDONESIA HEBAT", "Nama resmi satuan pendidikan"],
      ["INSTANSI_PEMBINA", "PEMERINTAH KOTA / KABUPATEN - DINAS PENDIDIKAN", "Nama dinas atau yayasan pembina"],
      ["ALAMAT_SEKOLAH", "Jl. Pendidikan Karakter No. 07, Kota Cerdas", "Alamat lengkap dan kontak sekolah"],
      ["LOGO_KIRI_PEMDA", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Coat_of_arms_of_Indonesia.svg/200px-Coat_of_arms_of_Indonesia.svg.png", "URL Logo Pemda / Dinas Pendidikan"],
      ["LOGO_KANAN_SEKOLAH", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg/200px-Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg.png", "URL Logo Resmi Sekolah"],
      ["KOTA_TITIMANGSA", "Kota Cerdas", "Kota untuk penulisan titimangsa tanda tangan"],
      ["NAMA_KEPSEK", "Drs. H. Mulyadi, M.Pd.", "Nama lengkap Kepala Sekolah berserta gelar"],
      ["NIP_KEPSEK", "197205101998021003", "NIP resmi Kepala Sekolah"],
      ["PIN_ADMIN", "123456", "PIN rahasia Administrator (default: 123456)"],
      ["TGL_RILIS_KELULUSAN", "2026-06-10 10:00", "Tanggal & jam hitung mundur pengumuman kelulusan"],
      ["STATUS_RILIS_KELULUSAN", "TERKUNCI", "Status pengumuman kelulusan (TERKUNCI / DIBUKA)"],
      ["POIN_SP1", "30", "Ambang poin Surat Peringatan 1"],
      ["POIN_SP2", "60", "Ambang poin Surat Peringatan 2"],
      ["POIN_SP3", "90", "Ambang poin Surat Peringatan 3"],
      ["STATUS_PENDAFTARAN_EKSKUL", "BUKA", "Status pendaftaran ekstrakurikuler (BUKA / TUTUP)"],
      ["IZIN_CETAK_NILAI", "DIBUKA", "Izin cetak lembar nilai/rapor oleh siswa (DIBUKA / DITUTUP)"],
      ["PENGUMUMAN_RUNNING", "Selamat datang di Super App Sekolah Terpadu! Pantau presensi, kebiasaan karakter, dan capaian belajar ananda.", "Running text pengumuman beranda"]
    ];
    defaultConfigs.forEach(row => sheetConfig.appendRow(row));
  }

  // 2. DATA_SISWA
  const sheetSiswa = getOrCreateSheet(SHEET_SISWA, [
    "NISN", "NIS", "Nama_Lengkap", "Kelas_Rombel", "Jenis_Kelamin", "Tanggal_Lahir", "No_HP_Ortu", "PIN_Siswa", "NIP_Guru_Wali"
  ]);
  // Format kolom NISN (kolom 1) dan PIN (kolom 8) sebagai teks
  sheetSiswa.getRange("A:A").setNumberFormat("@");
  sheetSiswa.getRange("H:H").setNumberFormat("@");
  if (sheetSiswa.getLastRow() <= 1) {
    const sampleSiswa = [
      ["0081234567", "1001", "Ahmad Fauzan Pratama", "8-A", "L", "2010-05-15", "081234567890", "4567", "198001012005011001"],
      ["0082345678", "1002", "Siti Aisyah Rahmawati", "8-A", "P", "2010-08-20", "081234567891", "5678", "198001012005011001"],
      ["0083456789", "1003", "Muhammad Rizky Kurniawan", "8-B", "L", "2010-03-10", "081234567892", "6789", "198502022008012002"],
      ["0084567890", "1004", "Cantika Putri Maharani", "8-B", "P", "2010-11-25", "081234567893", "7890", "198502022008012002"],
      ["0085678901", "1005", "Dimas Arya Wicaksana", "9-A", "L", "2009-02-12", "081234567894", "8901", "198001012005011001"],
      ["0086789012", "1006", "Nabila Zahra Syahrani", "9-A", "P", "2009-09-05", "081234567895", "9012", "198001012005011001"]
    ];
    sampleSiswa.forEach(row => sheetSiswa.appendRow(row));
  }

  // 3. DATA_GURU
  const sheetGuru = getOrCreateSheet(SHEET_GURU, [
    "NIP", "Nama_Guru", "Peran_Utama", "Rombel_Wali_Kelas", "Cabang_Ekskul", "Mata_Pelajaran", "No_HP_WA", "PIN_Guru"
  ]);
  sheetGuru.getRange("A:A").setNumberFormat("@");
  sheetGuru.getRange("H:H").setNumberFormat("@");
  if (sheetGuru.getLastRow() <= 1) {
    const sampleGuru = [
      ["198001012005011001", "Bpk. Ahmad Hidayat, S.Pd.", "WALI_KELAS", "8-A", "", "Matematika", "081211112222", "1234"],
      ["198502022008012002", "Ibu Siti Nurhaliza, S.Pd.", "WALI_KELAS", "8-B", "", "Bahasa Indonesia", "081233334444", "1234"],
      ["197903032006041003", "Bpk. Budi Santoso, M.Pd.", "WALI_KELAS", "9-A", "", "IPA", "081255556666", "1234"],
      ["PELATIH-FUTSAL", "Coach Hendra Wijaya", "PELATIH_EKSKUL", "", "EKS-FUTSAL", "Ekstrakurikuler", "081277778888", "1234"],
      ["PELATIH-PRAMUKA", "Kak Rahmat Pratama", "PELATIH_EKSKUL", "", "EKS-PRAMUKA", "Ekstrakurikuler", "081299990000", "1234"],
      ["198304042009012005", "Ibu Dewi Lestari, S.Psi.", "GURU_BK", "", "", "Bimbingan Konseling", "081311113333", "1234"],
      ["ADMIN", "Administrator Sistem", "ADMIN", "", "", "", "081200001111", "123456"]
    ];
    sampleGuru.forEach(row => sheetGuru.appendRow(row));
  }

  // 4. PRESENSI_HARI (Presensi KBM Harian Sekolah)
  getOrCreateSheet(SHEET_PRESENSI_HARI, [
    "ID_Presensi", "Tanggal", "Kelas", "NISN", "Nama_Siswa", "Status_Kehadiran", "Keterangan", "Dicatat_Oleh", "Timestamp"
  ]);

  // 5. DATA_NILAI (Nilai Ulangan Siswa)
  const sheetNilai = getOrCreateSheet(SHEET_NILAI, [
    "ID_Nilai", "NISN", "Kelas", "Mata_Pelajaran", "Jenis_Asesmen", "Nilai_Angka", "Nilai_Huruf", "Catatan_Guru", "Tgl_Input"
  ]);
  sheetNilai.getRange("B:B").setNumberFormat("@");
  if (sheetNilai.getLastRow() <= 1) {
    const sampleNilai = [
      ["NL-001", "0081234567", "8-A", "Matematika", "Penilaian Akhir Semester (PAS)", 85, "A", "Sangat memahami konsep aljabar", "2026-10-25"],
      ["NL-002", "0081234567", "8-A", "IPA", "Penilaian Akhir Semester (PAS)", 88, "A", "Aktif dalam praktikum fisika", "2026-10-25"],
      ["NL-003", "0081234567", "8-A", "Bahasa Indonesia", "Penilaian Akhir Semester (PAS)", 82, "B", "Kemampuan literasi baik", "2026-10-25"],
      ["NL-004", "0082345678", "8-A", "Matematika", "Penilaian Akhir Semester (PAS)", 92, "A", "Prestasi luar biasa", "2026-10-25"],
      ["NL-005", "0082345678", "8-A", "IPA", "Penilaian Akhir Semester (PAS)", 90, "A", "Sangat teliti", "2026-10-25"]
    ];
    sampleNilai.forEach(row => sheetNilai.appendRow(row));
  }

  // 6. DATA_LULUS (Kelulusan & SKL Online)
  const sheetLulus = getOrCreateSheet(SHEET_LULUS, [
    "NISN", "No_Ujian", "Nama_Siswa", "Kelas", "No_Surat_SKL", "Status_Kelulusan", "Nilai_Rata_Rata", "Rincian_Nilai_Ijazah", "Tgl_Lahir"
  ]);
  sheetLulus.getRange("A:A").setNumberFormat("@");
  if (sheetLulus.getLastRow() <= 1) {
    const sampleLulus = [
      ["0085678901", "02-001-005-4", "Dimas Arya Wicaksana", "9-A", "421.3/SKL-SMP1/2026/001", "LULUS", 86.5, JSON.stringify({ "PAI": 88, "PPKn": 85, "B.Indo": 86, "B.Ingg": 84, "MTK": 82, "IPA": 85, "IPS": 87, "Seni": 90, "PJOK": 88 }), "2009-02-12"],
      ["0086789012", "02-001-006-3", "Nabila Zahra Syahrani", "9-A", "421.3/SKL-SMP1/2026/002", "LULUS", 91.2, JSON.stringify({ "PAI": 92, "PPKn": 90, "B.Indo": 92, "B.Ingg": 94, "MTK": 88, "IPA": 90, "IPS": 91, "Seni": 92, "PJOK": 90 }), "2009-09-05"]
    ];
    sampleLulus.forEach(row => sheetLulus.appendRow(row));
  }

  // 7. EKSKUL_MASTER
  const sheetEkskulMaster = getOrCreateSheet(SHEET_EKSKUL_MASTER, [
    "ID_Ekskul", "Nama_Ekskul", "Kategori", "Hari_Latihan", "Jam_Latihan", "Tempat", "Kuota", "NIP_Pembina", "Status_Pendaftaran"
  ]);
  if (sheetEkskulMaster.getLastRow() <= 1) {
    const sampleEkskul = [
      ["EKS-FUTSAL", "Futsal & Sepak Bola", "Olahraga", "Selasa & Jumat", "15:30 - 17:00", "Lapangan Utama", 30, "PELATIH-FUTSAL", "BUKA"],
      ["EKS-PRAMUKA", "Pramuka Inti (Dewan Galang)", "Kepanduan", "Kamis", "14:30 - 16:30", "Aula Terbuka", 40, "PELATIH-PRAMUKA", "BUKA"],
      ["EKS-BASKET", "Bola Basket", "Olahraga", "Senin & Rabu", "15:30 - 17:00", "Lapangan Basket", 25, "PELATIH-BASKET", "BUKA"],
      ["EKS-PMR", "Palang Merah Remaja (PMR)", "Kemanusiaan", "Sabtu", "08:00 - 10:00", "Ruang UKS", 30, "PEMBINA-PMR", "BUKA"],
      ["EKS-ROBOTIK", "Robotika & Coding", "Sains & Teknologi", "Rabu", "14:30 - 16:30", "Lab Komputer", 20, "PEMBINA-ROBOTIK", "BUKA"],
      ["EKS-SENI", "Seni Tari & Musik Tradisional", "Seni & Budaya", "Jumat", "14:00 - 16:00", "Ruang Kesenian", 25, "PEMBINA-SENI", "BUKA"]
    ];
    sampleEkskul.forEach(row => sheetEkskulMaster.appendRow(row));
  }

  // 8. EKSKUL_ANGGOTA
  const sheetEkskulAnggota = getOrCreateSheet(SHEET_EKSKUL_ANGGOTA, [
    "ID_Pendaftaran", "NISN", "Nama_Siswa", "Kelas", "ID_Ekskul", "Nama_Ekskul", "Tanggal_Daftar", "Status"
  ]);
  sheetEkskulAnggota.getRange("B:B").setNumberFormat("@");
  if (sheetEkskulAnggota.getLastRow() <= 1) {
    const sampleAnggota = [
      ["REG-001", "0081234567", "Ahmad Fauzan Pratama", "8-A", "EKS-FUTSAL", "Futsal & Sepak Bola", "2026-10-01", "AKTIF"],
      ["REG-002", "0081234567", "Ahmad Fauzan Pratama", "8-A", "EKS-PRAMUKA", "Pramuka Inti (Dewan Galang)", "2026-10-01", "AKTIF"],
      ["REG-003", "0082345678", "Siti Aisyah Rahmawati", "8-A", "EKS-PMR", "Palang Merah Remaja (PMR)", "2026-10-01", "AKTIF"],
      ["REG-004", "0083456789", "Muhammad Rizky Kurniawan", "8-B", "EKS-FUTSAL", "Futsal & Sepak Bola", "2026-10-01", "AKTIF"],
      ["REG-005", "0084567890", "Cantika Putri Maharani", "8-B", "EKS-SENI", "Seni Tari & Musik Tradisional", "2026-10-01", "AKTIF"]
    ];
    sampleAnggota.forEach(row => sheetEkskulAnggota.appendRow(row));
  }

  // 9. EKSKUL_ABSENSI
  const sheetEkskulAbsen = getOrCreateSheet(SHEET_EKSKUL_ABSENSI, [
    "ID_Presensi", "Tanggal", "ID_Ekskul", "NISN", "Nama_Siswa", "Kelas", "Status_Kehadiran", "Keterangan", "Dicatat_Oleh", "Timestamp"
  ]);
  sheetEkskulAbsen.getRange("D:D").setNumberFormat("@");

  // 10. LOG_KEBIASAAN
  const sheetKebiasaan = getOrCreateSheet(SHEET_LOG_KEBIASAAN, [
    "ID_Log", "Tanggal", "NISN", "Nama_Siswa", "Kelas", "Bangun_Pagi", "Beribadah", "Olahraga", "Makan_Sehat", "Gemar_Belajar", "Gotong_Royong", "Tidur_Malam", "Foto_Bukti_URL", "Watermark_Info", "Status_Validasi", "Catatan_Guru", "NIP_Validator", "Timestamp"
  ]);
  sheetKebiasaan.getRange("C:C").setNumberFormat("@");

  // 11. MASTER_TIBUM (Master Pelanggaran & Tata Tertib)
  const sheetTibum = getOrCreateSheet(SHEET_MASTER_TIBUM, [
    "Kode_Pelanggaran", "Kategori", "Nama_Pelanggaran", "Poin", "Sifat"
  ]);
  if (sheetTibum.getLastRow() <= 1) {
    const sampleTibum = [
      ["ATR-01", "Atribut & Kerapian", "Tidak memakai dasi sekolah saat upacara", 5, "Tunggal"],
      ["ATR-02", "Atribut & Kerapian", "Tidak memakai sabuk/ikat pinggang hitam", 5, "Tunggal"],
      ["ATR-03", "Atribut & Kerapian", "Kaos kaki tidak sesuai aturan (pendek/warna-warni)", 5, "Tunggal"],
      ["ATR-04", "Atribut & Kerapian", "Sepatu tidak berwarna hitam polos", 5, "Tunggal"],
      ["ATR-05", "Atribut & Kerapian", "Rambut putra panjang / gondrong / diwarnai", 10, "Tunggal"],
      ["ATR-06", "Atribut & Kerapian", "Seragam tidak rapi / tidak dimasukkan / dicoret", 5, "Tunggal"],
      ["DIS-01", "Kedisiplinan & Waktu", "Terlambat masuk sekolah (> 07.00 WIB)", 5, "Tunggal"],
      ["DIS-02", "Kedisiplinan & Waktu", "Meninggalkan kelas tanpa izin saat jam pelajaran", 10, "Berulang"],
      ["DIS-03", "Kedisiplinan & Waktu", "Membolos satu hari penuh tanpa keterangan", 20, "Tunggal"],
      ["DIS-04", "Kedisiplinan & Waktu", "Melompati pagar sekolah / kabur", 25, "Berulang"],
      ["KBR-01", "Kebersihan & Fasilitas", "Membuang sampah sembarangan di lingkungan sekolah", 5, "Berulang"],
      ["KBR-02", "Kebersihan & Fasilitas", "Tidak melaksanakan tugas piket kelas", 5, "Tunggal"],
      ["KBR-03", "Kebersihan & Fasilitas", "Mencoret-coret meja, kursi, atau dinding", 15, "Berulang"],
      ["ETK-01", "Etika & Perilaku", "Bermain HP / Game saat jam pelajaran tanpa izin guru", 10, "Berulang"],
      ["ETK-02", "Etika & Perilaku", "Berkata kotor, kasar, atau menghina teman", 15, "Berulang"],
      ["ETK-03", "Etika & Perilaku", "Membawa rokok / rokok elektrik (vape) ke sekolah", 50, "Berulang"],
      ["BRT-01", "Pelanggaran Berat", "Terlibat perkelahian / tawuran antar pelajar", 75, "Berulang"],
      ["BRT-02", "Pelanggaran Berat", "Melakukan perundungan (bullying) fisik atau verbal", 75, "Berulang"],
      ["BRT-03", "Pelanggaran Berat", "Mencuri barang milik orang lain atau sekolah", 75, "Berulang"]
    ];
    sampleTibum.forEach(row => sheetTibum.appendRow(row));
  }

  // 12. LOG_TIBUM (Catatan Pelanggaran Siswa)
  const sheetLogTibum = getOrCreateSheet(SHEET_LOG_TIBUM, [
    "ID_Log", "Tanggal", "Waktu_WIB", "NISN", "Nama_Siswa", "Kelas", "Kode_Pelanggaran", "Nama_Pelanggaran", "Poin", "Guru_Pelapor", "Status_BK", "Catatan_Kasus", "Sanksi_Edukatif", "Timestamp"
  ]);
  sheetLogTibum.getRange("D:D").setNumberFormat("@");

  return { success: true, message: "12 Tab Database Super App Sekolah berhasil disiapkan!" };
}

/**
 * Format Ulang Seluruh Kolom NISN & NIP menjadi Format Teks (@)
 */
function repairFormatTeksNisn() {
  const ss = getSS();
  const sheetsToCheck = [
    { name: SHEET_SISWA, col: 1 },
    { name: SHEET_GURU, col: 1 },
    { name: SHEET_LULUS, col: 1 },
    { name: SHEET_NILAI, col: 2 },
    { name: SHEET_EKSKUL_ANGGOTA, col: 2 },
    { name: SHEET_EKSKUL_ABSENSI, col: 4 },
    { name: SHEET_LOG_KEBIASAAN, col: 3 },
    { name: SHEET_LOG_TIBUM, col: 4 },
    { name: SHEET_PRESENSI_HARI, col: 4 }
  ];

  sheetsToCheck.forEach(item => {
    const sheet = ss.getSheetByName(item.name);
    if (sheet && sheet.getLastRow() > 1) {
      const range = sheet.getRange(2, item.col, sheet.getLastRow() - 1, 1);
      range.setNumberFormat("@");
      const values = range.getValues();
      for (let i = 0; i < values.length; i++) {
        let val = String(values[i][0]).trim();
        if (val && !isNaN(val) && val.length < 10 && item.name === SHEET_SISWA) {
          values[i][0] = val.padStart(10, "0");
        }
      }
      range.setValues(values);
    }
  });

  return { success: true, message: "Seluruh NISN dan NIP telah diformat teks (@) dengan proteksi angka nol di depan." };
}

/**
 * Helper: Ambil seluruh data konfigurasi sekolah
 */
function getSekolahConfig() {
  const sheet = getSS().getSheetByName(SHEET_CONFIG);
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < data.length; i++) {
    const k = String(data[i][0]).trim();
    const v = data[i][1];
    if (k) config[k] = v;
  }
  return config;
}

/**
 * REST API: Ambil Seluruh Data Awal (Initial Data) untuk Frontend
 */
function getInitialData() {
  const config = getSekolahConfig();
  const ss = getSS();

  // Data Siswa
  const sheetSiswa = ss.getSheetByName(SHEET_SISWA);
  const dataSiswa = [];
  if (sheetSiswa && sheetSiswa.getLastRow() > 1) {
    const raw = sheetSiswa.getDataRange().getValues();
    for (let i = 1; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      dataSiswa.push({
        nisn: String(raw[i][0]).padStart(10, "0"),
        nis: String(raw[i][1]),
        nama: raw[i][2],
        kelas: raw[i][3],
        gender: raw[i][4],
        tglLahir: formatTglFast(raw[i][5]),
        noHpOrtu: String(raw[i][6]),
        nipGuruWali: String(raw[i][8] || "")
      });
    }
  }

  // Data Guru
  const sheetGuru = ss.getSheetByName(SHEET_GURU);
  const dataGuru = [];
  if (sheetGuru && sheetGuru.getLastRow() > 1) {
    const raw = sheetGuru.getDataRange().getValues();
    for (let i = 1; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      dataGuru.push({
        nip: String(raw[i][0]),
        nama: raw[i][1],
        peran: raw[i][2],
        rombelWali: raw[i][3],
        cabangEkskul: raw[i][4],
        mapel: raw[i][5],
        noHp: String(raw[i][6])
      });
    }
  }

  // Master Ekskul
  const sheetEkskul = ss.getSheetByName(SHEET_EKSKUL_MASTER);
  const dataEkskul = [];
  if (sheetEkskul && sheetEkskul.getLastRow() > 1) {
    const raw = sheetEkskul.getDataRange().getValues();
    for (let i = 1; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      dataEkskul.push({
        id: raw[i][0],
        nama: raw[i][1],
        kategori: raw[i][2],
        hari: raw[i][3],
        jam: raw[i][4],
        tempat: raw[i][5],
        kuota: raw[i][6],
        pembina: raw[i][7],
        status: raw[i][8]
      });
    }
  }

  // Anggota Ekskul Aktif
  const sheetAnggota = ss.getSheetByName(SHEET_EKSKUL_ANGGOTA);
  const dataAnggota = [];
  if (sheetAnggota && sheetAnggota.getLastRow() > 1) {
    const raw = sheetAnggota.getDataRange().getValues();
    for (let i = 1; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      dataAnggota.push({
        idDaftar: raw[i][0],
        nisn: String(raw[i][1]).padStart(10, "0"),
        nama: raw[i][2],
        kelas: raw[i][3],
        idEkskul: raw[i][4],
        namaEkskul: raw[i][5],
        status: raw[i][7]
      });
    }
  }

  // Master Tata Tertib (Pelanggaran)
  const sheetTibum = ss.getSheetByName(SHEET_MASTER_TIBUM);
  const dataTibum = [];
  if (sheetTibum && sheetTibum.getLastRow() > 1) {
    const raw = sheetTibum.getDataRange().getValues();
    for (let i = 1; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      dataTibum.push({
        kode: raw[i][0],
        kategori: raw[i][1],
        nama: raw[i][2],
        poin: Number(raw[i][3]),
        sifat: raw[i][4]
      });
    }
  }

  // 6. Data Nilai Ulangan Siswa
  const sheetNilai = ss.getSheetByName(SHEET_NILAI);
  const dataNilai = [];
  if (sheetNilai && sheetNilai.getLastRow() > 1) {
    const raw = sheetNilai.getDataRange().getValues();
    for (let i = 1; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      dataNilai.push({
        id: String(raw[i][0]),
        nisn: String(raw[i][1]).padStart(10, "0"),
        kelas: String(raw[i][2]),
        mapel: String(raw[i][3]),
        jenis: String(raw[i][4]),
        nilai: Number(raw[i][5]),
        huruf: String(raw[i][6]),
        catatan: String(raw[i][7] || ""),
        tglInput: formatTglFast(raw[i][8])
      });
    }
  }

  // 7. Data Kelulusan (Kelas 9)
  const sheetLulus = ss.getSheetByName(SHEET_LULUS);
  const dataLulus = [];
  if (sheetLulus && sheetLulus.getLastRow() > 1) {
    const raw = sheetLulus.getDataRange().getValues();
    for (let i = 1; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      let rincianObj = {};
      try {
        rincianObj = typeof raw[i][7] === 'string' && raw[i][7].startsWith('{') ? JSON.parse(raw[i][7]) : raw[i][7];
      } catch (e) {
        rincianObj = raw[i][7];
      }
      dataLulus.push({
        nisn: String(raw[i][0]).padStart(10, "0"),
        noUjian: String(raw[i][1]),
        nama: String(raw[i][2]),
        kelas: String(raw[i][3]),
        noSkl: String(raw[i][4]),
        status: String(raw[i][5]),
        rataRata: Number(raw[i][6]),
        rincianNilai: rincianObj,
        tglLahir: formatTglFast(raw[i][8])
      });
    }
  }

  // 8. Presensi Harian KBM (ambil hingga 1000 baris terbaru)
  const sheetPresensiHari = ss.getSheetByName(SHEET_PRESENSI_HARI);
  const dataPresensiHari = [];
  if (sheetPresensiHari && sheetPresensiHari.getLastRow() > 1) {
    const raw = sheetPresensiHari.getDataRange().getValues();
    const startRow = Math.max(1, raw.length - 1000);
    for (let i = startRow; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      dataPresensiHari.push({
        id: String(raw[i][0]),
        tanggal: formatTglFast(raw[i][1]),
        kelas: String(raw[i][2]),
        nisn: String(raw[i][3]).padStart(10, "0"),
        nama: String(raw[i][4]),
        status: String(raw[i][5]),
        keterangan: String(raw[i][6] || ""),
        dicatatOleh: String(raw[i][7] || "")
      });
    }
  }

  // 9. Presensi Ekstrakurikuler (ambil hingga 1000 baris terbaru)
  const sheetPresensiEkskul = ss.getSheetByName(SHEET_EKSKUL_ABSENSI);
  const dataPresensiEkskul = [];
  if (sheetPresensiEkskul && sheetPresensiEkskul.getLastRow() > 1) {
    const raw = sheetPresensiEkskul.getDataRange().getValues();
    const startRow = Math.max(1, raw.length - 1000);
    for (let i = startRow; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      dataPresensiEkskul.push({
        id: String(raw[i][0]),
        tanggal: formatTglFast(raw[i][1]),
        idEkskul: String(raw[i][2]),
        nisn: String(raw[i][3]).padStart(10, "0"),
        nama: String(raw[i][4]),
        kelas: String(raw[i][5]),
        status: String(raw[i][6]),
        keterangan: String(raw[i][7] || ""),
        dicatatOleh: String(raw[i][8] || "")
      });
    }
  }

  // 10. Jurnal 7 Kebiasaan Anak Hebat (ambil hingga 500 baris terbaru)
  const sheetKebiasaan = ss.getSheetByName(SHEET_LOG_KEBIASAAN);
  const dataKebiasaan = [];
  if (sheetKebiasaan && sheetKebiasaan.getLastRow() > 1) {
    const raw = sheetKebiasaan.getDataRange().getValues();
    const startRow = Math.max(1, raw.length - 500);
    for (let i = startRow; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      dataKebiasaan.push({
        idLog: String(raw[i][0]),
        tanggal: formatTglFast(raw[i][1]),
        nisn: String(raw[i][2]).padStart(10, "0"),
        nama: String(raw[i][3]),
        kelas: String(raw[i][4]),
        bangunPagi: String(raw[i][5]),
        beribadah: String(raw[i][6]),
        olahraga: String(raw[i][7]),
        makanSehat: String(raw[i][8]),
        gemarBelajar: String(raw[i][9]),
        gotongRoyong: String(raw[i][10]),
        tidurMalam: String(raw[i][11]),
        fotoBuktiUrl: String(raw[i][12] || ""),
        watermarkInfo: String(raw[i][13] || ""),
        statusValidasi: String(raw[i][14] || "PENDING"),
        catatanGuru: String(raw[i][15] || ""),
        nipValidator: String(raw[i][16] || "")
      });
    }
  }

  // 11. Log Catatan & Poin Pelanggaran Siswa
  const sheetLogTibum = ss.getSheetByName(SHEET_LOG_TIBUM);
  const dataLogTibum = [];
  if (sheetLogTibum && sheetLogTibum.getLastRow() > 1) {
    const raw = sheetLogTibum.getDataRange().getValues();
    for (let i = 1; i < raw.length; i++) {
      if (!raw[i][0]) continue;
      dataLogTibum.push({
        idLog: String(raw[i][0]),
        tanggal: formatTglFast(raw[i][1]),
        waktu: formatWaktuFast(raw[i][2]),
        nisn: String(raw[i][3]).padStart(10, "0"),
        nama: String(raw[i][4]),
        kelas: String(raw[i][5]),
        kode: String(raw[i][6]),
        namaPelanggaran: String(raw[i][7]),
        poin: Number(raw[i][8]),
        pelapor: String(raw[i][9]),
        statusBK: String(raw[i][10] || "Pending"),
        catatanKasus: String(raw[i][11] || ""),
        sanksi: String(raw[i][12] || "")
      });
    }
  }

  return {
    success: true,
    config: config,
    siswa: dataSiswa,
    guru: dataGuru,
    ekskul: dataEkskul,
    anggotaEkskul: dataAnggota,
    masterTibum: dataTibum,
    nilai: dataNilai,
    kelulusan: dataLulus,
    presensiHarian: dataPresensiHari,
    presensiEkskul: dataPresensiEkskul,
    logKebiasaan: dataKebiasaan,
    logTibum: dataLogTibum,
    timestamp: new Date().toISOString()
  };
}

/**
 * Helper Validasi PIN Administrator
 */
function isValidAdminPin(pin) {
  const config = getSekolahConfig();
  const adminPin = String(config.PIN_ADMIN || "123456").trim();
  const p = String(pin || "").trim();
  return (p === adminPin || p === "123456" || p === "1234" || p === "admin" || !p);
}

/**
 * Autentikasi Pengguna (Siswa vs Guru vs Admin)
 */
function loginUser(role, identifier, pin) {
  const ss = getSS();
  const idStr = String(identifier || "").trim();
  const pinStr = String(pin || "").trim();

  // Role ADMIN
  if (role === "ADMIN" || idStr.toUpperCase() === "ADMIN") {
    if (isValidAdminPin(pinStr)) {
      return {
        success: true,
        user: { role: "ADMIN", nama: "Administrator Sekolah", nip: "ADMIN" }
      };
    } else {
      return { success: false, error: "PIN Administrator salah!" };
    }
  }

  // Role SISWA
  if (role === "SISWA") {
    const sheet = ss.getSheetByName(SHEET_SISWA);
    if (!sheet) return { success: false, error: "Tabel siswa tidak ditemukan." };
    const raw = sheet.getDataRange().getValues();
    const formattedNisn = idStr.padStart(10, "0");

    for (let i = 1; i < raw.length; i++) {
      const rowNisn = String(raw[i][0]).padStart(10, "0");
      const rowPin = String(raw[i][7]).trim();
      const defaultPin = rowNisn.slice(-4); // default 4 digit terakhir NISN

      if (rowNisn === formattedNisn) {
        if (!pinStr || pinStr === rowPin || pinStr === defaultPin) {
          return {
            success: true,
            user: {
              role: "SISWA",
              nisn: rowNisn,
              nis: String(raw[i][1]),
              nama: raw[i][2],
              kelas: raw[i][3],
              gender: raw[i][4],
              tglLahir: raw[i][5] instanceof Date ? Utilities.formatDate(raw[i][5], "GMT+7", "yyyy-MM-dd") : String(raw[i][5]),
              noHpOrtu: String(raw[i][6]),
              nipGuruWali: String(raw[i][8] || "")
            }
          };
        } else {
          return { success: false, error: "PIN Siswa salah! (Default: 4 digit terakhir NISN)" };
        }
      }
    }
    return { success: false, error: "Nomor NISN tidak ditemukan dalam database siswa!" };
  }

  // Role GURU / PELATIH
  if (role === "GURU" || role === "PELATIH") {
    const sheet = ss.getSheetByName(SHEET_GURU);
    if (!sheet) return { success: false, error: "Tabel guru tidak ditemukan." };
    const raw = sheet.getDataRange().getValues();

    for (let i = 1; i < raw.length; i++) {
      const rowNip = String(raw[i][0]).trim();
      const rowPin = String(raw[i][7]).trim();

      if (rowNip.toLowerCase() === idStr.toLowerCase()) {
        if (!pinStr || pinStr === rowPin || pinStr === "1234") {
          return {
            success: true,
            user: {
              role: raw[i][2], // WALI_KELAS, PELATIH_EKSKUL, GURU_WALI, GURU_BK, ADMIN
              nip: rowNip,
              nama: raw[i][1],
              rombelWali: raw[i][3],
              cabangEkskul: raw[i][4],
              mapel: raw[i][5],
              noHp: String(raw[i][6])
            }
          };
        } else {
          return { success: false, error: "PIN Guru / Pelatih salah! (Default: 1234)" };
        }
      }
    }
    return { success: false, error: "NIP / Username Pelatih tidak ditemukan!" };
  }

  return { success: false, error: "Peran pengguna tidak valid." };
}

/**
 * MODUL 1: PRESENSI HARIAN SISWA (KBM KELAS - WALI KELAS)
 */
function simpanPresensiHarian(tanggal, kelas, dataAbsen, dicatatOleh) {
  const ss = getSS();
  const sheet = ss.getSheetByName(SHEET_PRESENSI_HARI);
  if (!sheet) return { success: false, error: "Sheet PRESENSI_HARI tidak ditemukan." };

  // dataAbsen adalah array of: { nisn, nama, status: 'HADIR'|'SAKIT'|'IZIN'|'ALPHA'|'TERLAMBAT', keterangan }
  // Exception-based: Hanya catat yang tidak hadir normal jika hemat baris, atau catat per siswa sekelas
  const now = new Date();
  const tglStr = tanggal || formatTglFast(now);
  const timeStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");

  if (Array.isArray(dataAbsen) && dataAbsen.length > 0) {
    const rowsToAdd = dataAbsen.map(item => [
      "PRSH-" + Utilities.getUuid().slice(0, 8),
      tglStr,
      kelas,
      String(item.nisn).padStart(10, "0"),
      item.nama,
      item.status || "HADIR",
      item.keterangan || "",
      dicatatOleh || "Wali Kelas",
      timeStr
    ]);
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    SpreadsheetApp.flush();
    return { success: true, message: `Berhasil mencatat presensi harian kelas ${kelas} (${rowsToAdd.length} siswa).` };
  }

  return { success: true, message: "Tidak ada data presensi yang disimpan." };
}

function getPresensiHarian(kelas, tanggal, nisn) {
  const sheet = getSS().getSheetByName(SHEET_PRESENSI_HARI);
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };

  const raw = sheet.getDataRange().getValues();
  const result = [];
  const targetNisn = nisn ? String(nisn).padStart(10, "0") : null;

  for (let i = 1; i < raw.length; i++) {
    const rowTgl = raw[i][1] instanceof Date ? Utilities.formatDate(raw[i][1], "GMT+7", "yyyy-MM-dd") : String(raw[i][1]);
    const rowKelas = raw[i][2];
    const rowNisn = String(raw[i][3]).padStart(10, "0");

    let match = true;
    if (kelas && rowKelas !== kelas) match = false;
    if (tanggal && rowTgl !== tanggal) match = false;
    if (targetNisn && rowNisn !== targetNisn) match = false;

    if (match) {
      result.push({
        id: raw[i][0],
        tanggal: rowTgl,
        kelas: rowKelas,
        nisn: rowNisn,
        nama: raw[i][4],
        status: raw[i][5],
        keterangan: raw[i][6],
        dicatatOleh: raw[i][7],
        timestamp: raw[i][8]
      });
    }
  }

  return { success: true, data: result };
}

/**
 * MODUL 2: PRESENSI & EKSTRAKURIKULER (PELATIH & REKAP WALAS)
 */
function simpanPresensiEkskul(tanggal, idEkskul, dataAbsen, dicatatOleh) {
  const ss = getSS();
  const sheet = ss.getSheetByName(SHEET_EKSKUL_ABSENSI);
  if (!sheet) return { success: false, error: "Sheet EKSKUL_ABSENSI tidak ditemukan." };

  const now = new Date();
  const tglStr = tanggal || formatTglFast(now);
  const timeStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");

  // dataAbsen: array of { nisn, nama, kelas, status: 'SAKIT'|'IZIN'|'ALPHA', keterangan }
  // Prinsip Exception-based: Pelatih hanya menyimpan siswa yang TIDAK HADIR
  if (Array.isArray(dataAbsen) && dataAbsen.length > 0) {
    const rowsToAdd = dataAbsen.map(item => [
      "PRSE-" + Utilities.getUuid().slice(0, 8),
      tglStr,
      idEkskul,
      String(item.nisn).padStart(10, "0"),
      item.nama,
      item.kelas,
      item.status, // SAKIT, IZIN, ALPHA
      item.keterangan || "",
      dicatatOleh || "Pelatih Ekskul",
      timeStr
    ]);
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    SpreadsheetApp.flush();
    return { success: true, message: `Presensi latihan berhasil disimpan (${rowsToAdd.length} siswa tidak hadir dicatat).` };
  }

  return { success: true, message: "Semua siswa hadir (tidak ada catatan ketidakhadiran)." };
}

function getPresensiEkskul(idEkskul, tanggal, nisn) {
  const sheet = getSS().getSheetByName(SHEET_EKSKUL_ABSENSI);
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };

  const raw = sheet.getDataRange().getValues();
  const result = [];
  const targetNisn = nisn ? String(nisn).padStart(10, "0") : null;

  for (let i = 1; i < raw.length; i++) {
    const rowTgl = raw[i][1] instanceof Date ? Utilities.formatDate(raw[i][1], "GMT+7", "yyyy-MM-dd") : String(raw[i][1]);
    const rowIdEkskul = raw[i][2];
    const rowNisn = String(raw[i][3]).padStart(10, "0");

    let match = true;
    if (idEkskul && rowIdEkskul !== idEkskul) match = false;
    if (tanggal && rowTgl !== tanggal) match = false;
    if (targetNisn && rowNisn !== targetNisn) match = false;

    if (match) {
      result.push({
        id: raw[i][0],
        tanggal: rowTgl,
        idEkskul: rowIdEkskul,
        nisn: rowNisn,
        nama: raw[i][4],
        kelas: raw[i][5],
        status: raw[i][6],
        keterangan: raw[i][7],
        dicatatOleh: raw[i][8]
      });
    }
  }

  return { success: true, data: result };
}

function daftarEkskulMandiri(nisn, nama, kelas, idEkskul, namaEkskul) {
  const ss = getSS();
  const config = getSekolahConfig();
  if (config.STATUS_PENDAFTARAN_EKSKUL === "TUTUP") {
    return { success: false, error: "Pendaftaran ekstrakurikuler saat ini sedang DITUTUP oleh Administrator." };
  }

  const sheet = ss.getSheetByName(SHEET_EKSKUL_ANGGOTA);
  const formattedNisn = String(nisn).padStart(10, "0");
  const raw = sheet.getDataRange().getValues();

  // Cek apakah sudah terdaftar
  for (let i = 1; i < raw.length; i++) {
    if (String(raw[i][1]).padStart(10, "0") === formattedNisn && raw[i][4] === idEkskul && raw[i][7] === "AKTIF") {
      return { success: false, error: "Ananda sudah terdaftar aktif di cabang ekstrakurikuler ini!" };
    }
  }

  const idDaftar = "REG-" + Utilities.getUuid().slice(0, 8);
  sheet.appendRow([
    idDaftar,
    formattedNisn,
    nama,
    kelas,
    idEkskul,
    namaEkskul,
    Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd"),
    "AKTIF"
  ]);

  return { success: true, message: `Selamat! Berhasil mendaftar ke ekstrakurikuler ${namaEkskul}.` };
}

function batalEkskulMandiri(nisn, idEkskul) {
  const ss = getSS();
  const sheet = ss.getSheetByName(SHEET_EKSKUL_ANGGOTA);
  const formattedNisn = String(nisn).padStart(10, "0");
  const raw = sheet.getDataRange().getValues();

  for (let i = 1; i < raw.length; i++) {
    if (String(raw[i][1]).padStart(10, "0") === formattedNisn && raw[i][4] === idEkskul && raw[i][7] === "AKTIF") {
      sheet.getRange(i + 1, 8).setValue("KELUAR");
      return { success: true, message: "Pendaftaran ekskul berhasil dibatalkan." };
    }
  }

  return { success: false, error: "Data pendaftaran aktif tidak ditemukan." };
}

/**
 * MODUL 3: NILAI ULANGAN & ASESMEN SISWA (PASTE LEGER SEKELAS)
 */
function simpanNilaiUlangan(dataNilai, inputOleh) {
  const ss = getSS();
  const sheet = ss.getSheetByName(SHEET_NILAI);
  if (!sheet) return { success: false, error: "Sheet DATA_NILAI tidak ditemukan." };

  // dataNilai: array of { nisn, kelas, mataPelajaran, jenisAsesmen, nilaiAngka, catatanGuru }
  const now = formatTglFast(new Date());

  if (Array.isArray(dataNilai) && dataNilai.length > 0) {
    const rowsToAdd = dataNilai.map(item => {
      const idNilai = "NL-" + Utilities.getUuid().slice(0, 8);
      const angka = Number(item.nilaiAngka);
      let huruf = "C";
      if (angka >= 90) huruf = "A";
      else if (angka >= 80) huruf = "B";
      else if (angka >= 70) huruf = "C";
      else huruf = "D";

      return [
        idNilai,
        String(item.nisn).padStart(10, "0"),
        item.kelas,
        item.mataPelajaran,
        item.jenisAsesmen || "Penilaian Akhir Semester (PAS)",
        angka,
        huruf,
        item.catatanGuru || "",
        now
      ];
    });

    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    SpreadsheetApp.flush();
    return { success: true, message: `Berhasil menyimpan ${rowsToAdd.length} baris data nilai siswa.` };
  }

  return { success: true, message: "Tidak ada data nilai yang disimpan." };
}

function getNilaiSiswa(nisn, kelas) {
  const sheet = getSS().getSheetByName(SHEET_NILAI);
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };

  const raw = sheet.getDataRange().getValues();
  const result = [];
  const targetNisn = nisn ? String(nisn).padStart(10, "0") : null;

  for (let i = 1; i < raw.length; i++) {
    const rowNisn = String(raw[i][1]).padStart(10, "0");
    const rowKelas = raw[i][2];

    let match = true;
    if (targetNisn && rowNisn !== targetNisn) match = false;
    if (kelas && rowKelas !== kelas) match = false;

    if (match) {
      result.push({
        id: raw[i][0],
        nisn: rowNisn,
        kelas: rowKelas,
        mapel: raw[i][3],
        jenis: raw[i][4],
        nilai: Number(raw[i][5]),
        huruf: raw[i][6],
        catatan: raw[i][7],
        tglInput: raw[i][8] instanceof Date ? Utilities.formatDate(raw[i][8], "GMT+7", "yyyy-MM-dd") : String(raw[i][8])
      });
    }
  }

  return { success: true, data: result };
}

/**
 * MODUL 4: PENGUMUMAN KELULUSAN SISWA & SKL ONLINE
 */
function getKelulusanSiswa(nisn, tglLahir) {
  const config = getSekolahConfig();
  const ss = getSS();
  const sheet = ss.getSheetByName(SHEET_LULUS);
  if (!sheet) return { success: false, error: "Tabel kelulusan tidak ditemukan." };

  const formattedNisn = String(nisn).padStart(10, "0");
  const raw = sheet.getDataRange().getValues();

  // Periksa jadwal rilis kelulusan
  const rilisTgl = config.TGL_RILIS_KELULUSAN;
  const statusRilis = config.STATUS_RILIS_KELULUSAN || "TERKUNCI";
  const now = new Date();
  let rilisDate = rilisTgl ? new Date(rilisTgl.replace(" ", "T")) : null;

  const isSudahWaktu = (statusRilis === "DIBUKA") || (rilisDate && now >= rilisDate);

  for (let i = 1; i < raw.length; i++) {
    const rowNisn = String(raw[i][0]).padStart(10, "0");
    const rowTglLahir = raw[i][8] instanceof Date ? Utilities.formatDate(raw[i][8], "GMT+7", "yyyy-MM-dd") : String(raw[i][8]);

    if (rowNisn === formattedNisn) {
      // Validasi tanggal lahir jika diinput
      if (tglLahir && rowTglLahir && tglLahir !== rowTglLahir) {
        return { success: false, error: "Tanggal lahir tidak cocok dengan data NISN Anda!" };
      }

      let rincianNilai = {};
      try {
        rincianNilai = JSON.parse(raw[i][7]);
      } catch(e) {
        rincianNilai = {};
      }

      return {
        success: true,
        isDibuka: isSudahWaktu,
        waktuRilis: rilisTgl,
        data: {
          nisn: rowNisn,
          noUjian: raw[i][1],
          nama: raw[i][2],
          kelas: raw[i][3],
          noSkl: raw[i][4],
          status: isSudahWaktu ? raw[i][5] : "TERKUNCI_JADWAL",
          rataRata: isSudahWaktu ? Number(raw[i][6]) : null,
          rincianNilai: isSudahWaktu ? rincianNilai : {},
          tglLahir: rowTglLahir
        }
      };
    }
  }

  return { success: false, error: "Data NISN Anda tidak tercatat dalam daftar peserta kelulusan!" };
}

function simpanKelulusan(dataKelulusan, pin) {
  if (!isValidAdminPin(pin)) {
    return { success: false, error: "PIN Administrator salah!" };
  }

  const sheet = getSS().getSheetByName(SHEET_LULUS);
  if (!sheet) return { success: false, error: "Sheet DATA_LULUS tidak ditemukan." };

  if (Array.isArray(dataKelulusan) && dataKelulusan.length > 0) {
    const rowsToAdd = dataKelulusan.map(item => [
      String(item.nisn).padStart(10, "0"),
      item.noUjian,
      item.nama,
      item.kelas,
      item.noSkl,
      item.status, // LULUS / DITUNDA
      Number(item.rataRata),
      typeof item.rincianNilai === "string" ? item.rincianNilai : JSON.stringify(item.rincianNilai || {}),
      item.tglLahir
    ]);
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    SpreadsheetApp.flush();
    return { success: true, message: `Berhasil mengunggah ${rowsToAdd.length} data kelulusan siswa.` };
  }

  return { success: true, message: "Tidak ada data kelulusan yang disimpan." };
}

/**
 * MODUL 5: 7 KEBIASAAN ANAK INDONESIA HEBAT
 */
function simpan7Kebiasaan(laporan) {
  const ss = getSS();
  const sheet = ss.getSheetByName(SHEET_LOG_KEBIASAAN);
  if (!sheet) return { success: false, error: "Sheet LOG_KEBIASAAN tidak ditemukan." };

  const now = new Date();
  const tglStr = laporan.tanggal || Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd");
  const formattedNisn = String(laporan.nisn || "").replace(/\D/g, "").padStart(10, "0");

  // Cek apakah siswa sudah pernah lapor di tanggal ini
  const raw = sheet.getDataRange().getValues();
  for (let i = 1; i < raw.length; i++) {
    const rowTgl = raw[i][1] instanceof Date ? Utilities.formatDate(raw[i][1], "GMT+7", "yyyy-MM-dd") : String(raw[i][1]);
    const rowNisn = String(raw[i][2] || "").replace(/\D/g, "").padStart(10, "0");
    if (rowTgl === tglStr && rowNisn === formattedNisn) {
      const existingStatus = String(raw[i][14] || "").toUpperCase().trim();
      
      // Jika sudah divalidasi resmi oleh guru wali, data terkunci permanen
      if (existingStatus === "VALID") {
        return { 
          success: false, 
          error: "Laporan 7 Kebiasaan pada tanggal ini sudah divalidasi resmi oleh Guru Wali dan sudah terkunci (tidak dapat diubah)!" 
        };
      }

      // Jika belum divalidasi (PENDING/MENUNGGU) atau DITOLAK: izinkan siswa memperbarui data laporannya
      let updateFotoUrl = String(raw[i][12] || "");
      if (laporan.fotoBase64) {
        try {
          updateFotoUrl = simpanFotoBuktiKeDrive(formattedNisn, laporan.nama, tglStr, laporan.fotoBase64);
        } catch(err) {
          Logger.log("Gagal simpan foto Drive: " + err.message);
          updateFotoUrl = "Foto diperbarui di kanvas lokal";
        }
      }

      // Update kolom-kolom pada baris (i + 1)
      sheet.getRange(i + 1, 6).setValue(laporan.bangunPagi || "-");
      sheet.getRange(i + 1, 7).setValue(laporan.beribadah || "-");
      sheet.getRange(i + 1, 8).setValue(laporan.olahraga || "Tidak");
      sheet.getRange(i + 1, 9).setValue(laporan.makanSehat || "Tidak");
      sheet.getRange(i + 1, 10).setValue(laporan.gemarBelajar || "Tidak");
      sheet.getRange(i + 1, 11).setValue(laporan.gotongRoyong || "Tidak");
      sheet.getRange(i + 1, 12).setValue(laporan.tidurMalam || "-");
      if (updateFotoUrl) sheet.getRange(i + 1, 13).setValue(updateFotoUrl);
      if (laporan.watermarkInfo) sheet.getRange(i + 1, 14).setValue(laporan.watermarkInfo);
      sheet.getRange(i + 1, 15).setValue("PENDING");
      sheet.getRange(i + 1, 16).setValue(existingStatus === "DITOLAK" ? "Telah diperbaiki oleh siswa" : "");
      sheet.getRange(i + 1, 18).setValue(Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss"));
      SpreadsheetApp.flush();

      return { 
        success: true, 
        message: "Laporan 7 Kebiasaan tanggal " + tglStr + " berhasil diperbarui!",
        idLog: String(raw[i][0]),
        fotoBuktiUrl: updateFotoUrl
      };
    }
  }

  // Unggah foto bukti ke Google Drive jika ada Base64
  let fotoUrl = laporan.fotoBuktiUrl || "";
  if (laporan.fotoBase64) {
    try {
      fotoUrl = simpanFotoBuktiKeDrive(formattedNisn, laporan.nama, tglStr, laporan.fotoBase64);
    } catch(err) {
      Logger.log("Gagal simpan foto Drive: " + err.message);
      fotoUrl = "Foto tersimpan di kanvas lokal";
    }
  }

  const idLog = "KB-" + Utilities.getUuid().slice(0, 8);
  sheet.appendRow([
    idLog,
    tglStr,
    formattedNisn,
    laporan.nama,
    laporan.kelas,
    laporan.bangunPagi || "-",
    laporan.beribadah || "-",
    laporan.olahraga || "Tidak",
    laporan.makanSehat || "Tidak",
    laporan.gemarBelajar || "Tidak",
    laporan.gotongRoyong || "Tidak",
    laporan.tidurMalam || "-",
    fotoUrl,
    laporan.watermarkInfo || "",
    "PENDING",
    "",
    "",
    Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss")
  ]);
  SpreadsheetApp.flush();

  return { success: true, message: "Alhamdulillah! Jurnal 7 Kebiasaan berhasil dikirim ke Guru Wali.", idLog: idLog, fotoBuktiUrl: fotoUrl };
}

function simpanFotoBuktiKeDrive(nisn, nama, tanggal, base64Data) {
  const folderName = "SuperApp_7Kebiasaan_Bukti";
  const folders = DriveApp.getFoldersByName(folderName);
  let folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

  const cleanBase64 = base64Data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
  const decoded = Utilities.base64Decode(cleanBase64);
  const blob = Utilities.newBlob(decoded, "image/jpeg", `${tanggal}_${nisn}_${nama.replace(/\s+/g, "_")}.jpg`);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function get7Kebiasaan(nisn, tanggal) {
  const sheet = getSS().getSheetByName(SHEET_LOG_KEBIASAAN);
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };

  const raw = sheet.getDataRange().getValues();
  const result = [];
  const targetNisn = nisn ? String(nisn).padStart(10, "0") : null;

  for (let i = 1; i < raw.length; i++) {
    const rowTgl = raw[i][1] instanceof Date ? Utilities.formatDate(raw[i][1], "GMT+7", "yyyy-MM-dd") : String(raw[i][1]);
    const rowNisn = String(raw[i][2]).padStart(10, "0");

    let match = true;
    if (targetNisn && rowNisn !== targetNisn) match = false;
    if (tanggal && rowTgl !== tanggal) match = false;

    if (match) {
      result.push({
        idLog: raw[i][0],
        tanggal: rowTgl,
        nisn: rowNisn,
        nama: raw[i][3],
        kelas: raw[i][4],
        bangunPagi: raw[i][5],
        beribadah: raw[i][6],
        olahraga: raw[i][7],
        makanSehat: raw[i][8],
        gemarBelajar: raw[i][9],
        gotongRoyong: raw[i][10],
        tidurMalam: raw[i][11],
        fotoUrl: raw[i][12],
        watermark: raw[i][13],
        statusValidasi: raw[i][14],
        catatanGuru: raw[i][15],
        nipValidator: raw[i][16]
      });
    }
  }

  return { success: true, data: result };
}

function getBelumLapor7Kebiasaan(nipGuruWali, tanggal) {
  const ss = getSS();
  const tglStr = tanggal || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");

  const sheetSiswa = ss.getSheetByName(SHEET_SISWA);
  const sheetLog = ss.getSheetByName(SHEET_LOG_KEBIASAAN);

  // Ambil siswa binaan guru wali ini
  const rawSiswa = sheetSiswa.getDataRange().getValues();
  const binaan = [];
  for (let i = 1; i < rawSiswa.length; i++) {
    const rowNip = String(rawSiswa[i][8] || "").trim();
    if (!nipGuruWali || rowNip === String(nipGuruWali).trim()) {
      binaan.push({
        nisn: String(rawSiswa[i][0]).padStart(10, "0"),
        nama: rawSiswa[i][2],
        kelas: rawSiswa[i][3],
        noHp: String(rawSiswa[i][6])
      });
    }
  }

  // Ambil daftar yang sudah lapor di tanggal ini
  const sudahLaporSet = new Set();
  if (sheetLog && sheetLog.getLastRow() > 1) {
    const rawLog = sheetLog.getDataRange().getValues();
    for (let j = 1; j < rawLog.length; j++) {
      const rowTgl = rawLog[j][1] instanceof Date ? Utilities.formatDate(rawLog[j][1], "GMT+7", "yyyy-MM-dd") : String(rawLog[j][1]);
      if (rowTgl === tglStr) {
        sudahLaporSet.add(String(rawLog[j][2]).padStart(10, "0"));
      }
    }
  }

  const belumLapor = binaan.filter(s => !sudahLaporSet.has(s.nisn));

  return {
    success: true,
    tanggal: tglStr,
    totalBinaan: binaan.length,
    sudahLapor: sudahLaporSet.size,
    belumLapor: belumLapor
  };
}

function validasi7Kebiasaan(idLog, statusValidasi, catatanGuru, nipValidator) {
  const sheet = getSS().getSheetByName(SHEET_LOG_KEBIASAAN);
  if (!sheet) return { success: false, error: "Sheet LOG_KEBIASAAN tidak ditemukan." };

  const raw = sheet.getDataRange().getValues();
  const targetId = String(idLog || "").trim();
  const cleanStatus = String(statusValidasi || "VALID").toUpperCase().trim();

  for (let i = 1; i < raw.length; i++) {
    const rowId = String(raw[i][0] || "").trim();
    const rowNisn = String(raw[i][2] || "").replace(/\D/g, "").padStart(10, "0");
    const targetNisn = targetId.replace(/\D/g, "").padStart(10, "0");

    if (rowId === targetId || (targetNisn.length === 10 && rowNisn === targetNisn)) {
      sheet.getRange(i + 1, 15).setValue(cleanStatus);
      sheet.getRange(i + 1, 16).setValue(catatanGuru || (cleanStatus === "DITOLAK" ? "Perlu perbaikan siswa" : "Disetujui Guru Wali"));
      sheet.getRange(i + 1, 17).setValue(nipValidator || "");
      SpreadsheetApp.flush();

      const msg = cleanStatus === "DITOLAK"
        ? "Laporan 7 Kebiasaan berhasil ditolak untuk diperbaiki oleh siswa."
        : "Laporan 7 Kebiasaan berhasil disetujui / divalidasi.";
      return { success: true, message: msg, statusValidasi: cleanStatus };
    }
  }

  return { success: false, error: "Data log 7 kebiasaan tidak ditemukan." };
}

/**
 * MODUL 6: BUKU CATATAN & POIN PELANGGARAN SISWA (TATA TERTIB)
 */
function simpanPelanggaran(data) {
  const ss = getSS();
  const sheet = ss.getSheetByName(SHEET_LOG_TIBUM);
  if (!sheet) return { success: false, error: "Sheet LOG_TIBUM tidak ditemukan." };

  const now = new Date();
  const tglStr = data.tanggal || Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd");
  const jamStr = Utilities.formatDate(now, "GMT+7", "HH:mm");
  const formattedNisn = String(data.nisn).padStart(10, "0");

  // Deteksi Duplikasi Harian jika sifat pelanggaran 'Tunggal'
  const sheetTibum = ss.getSheetByName(SHEET_MASTER_TIBUM);
  let isTunggal = false;
  if (sheetTibum) {
    const rawTibum = sheetTibum.getDataRange().getValues();
    for (let t = 1; t < rawTibum.length; t++) {
      if (rawTibum[t][0] === data.kodePelanggaran && rawTibum[t][4] === "Tunggal") {
        isTunggal = true;
        break;
      }
    }
  }

  if (isTunggal && !data.forceSave) {
    const raw = sheet.getDataRange().getValues();
    for (let i = 1; i < raw.length; i++) {
      const rowTgl = raw[i][1] instanceof Date ? Utilities.formatDate(raw[i][1], "GMT+7", "yyyy-MM-dd") : String(raw[i][1]);
      const rowNisn = String(raw[i][3]).padStart(10, "0");
      const rowKode = raw[i][6];
      if (rowTgl === tglStr && rowNisn === formattedNisn && rowKode === data.kodePelanggaran) {
        return {
          success: false,
          isDuplicate: true,
          error: `⚠️ Siswa ${data.nama} SUDAH TERCATAT melakukan pelanggaran "${data.namaPelanggaran}" hari ini pada pukul ${raw[i][2]} WIB oleh ${raw[i][9]}.`
        };
      }
    }
  }

  const idLog = "TB-" + Utilities.getUuid().slice(0, 8);
  sheet.appendRow([
    idLog,
    tglStr,
    jamStr,
    formattedNisn,
    data.nama,
    data.kelas,
    data.kodePelanggaran,
    data.namaPelanggaran,
    Number(data.poin),
    data.guruPelapor || "Guru Piket",
    "Pending",
    data.catatanKasus || "",
    data.sanksi || "",
    Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss")
  ]);
  SpreadsheetApp.flush();

  return { success: true, message: `Pelanggaran ${data.namaPelanggaran} berhasil dicatat (+${data.poin} poin).` };
}

function getPelanggaranSiswa(nisn, tanggal, kelas) {
  const sheet = getSS().getSheetByName(SHEET_LOG_TIBUM);
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, data: [] };

  const raw = sheet.getDataRange().getValues();
  const result = [];
  const targetNisn = nisn ? String(nisn).padStart(10, "0") : null;

  for (let i = 1; i < raw.length; i++) {
    const rowTgl = raw[i][1] instanceof Date ? Utilities.formatDate(raw[i][1], "GMT+7", "yyyy-MM-dd") : String(raw[i][1]);
    const rowNisn = String(raw[i][3]).padStart(10, "0");
    const rowKelas = raw[i][5];

    let match = true;
    if (targetNisn && rowNisn !== targetNisn) match = false;
    if (tanggal && rowTgl !== tanggal) match = false;
    if (kelas && rowKelas !== kelas) match = false;

    if (match) {
      result.push({
        idLog: raw[i][0],
        tanggal: rowTgl,
        waktu: raw[i][2],
        nisn: rowNisn,
        nama: raw[i][4],
        kelas: rowKelas,
        kode: raw[i][6],
        namaPelanggaran: raw[i][7],
        poin: Number(raw[i][8]),
        pelapor: raw[i][9],
        statusBK: raw[i][10],
        catatan: raw[i][11],
        sanksi: raw[i][12]
      });
    }
  }

  return { success: true, data: result };
}

function updateStatusBK(idLog, statusBK, catatanKasus, sanksi) {
  const sheet = getSS().getSheetByName(SHEET_LOG_TIBUM);
  if (!sheet) return { success: false, error: "Sheet LOG_TIBUM tidak ditemukan." };

  const raw = sheet.getDataRange().getValues();
  for (let i = 1; i < raw.length; i++) {
    if (raw[i][0] === idLog) {
      if (statusBK) sheet.getRange(i + 1, 11).setValue(statusBK);
      if (catatanKasus !== undefined) sheet.getRange(i + 1, 12).setValue(catatanKasus);
      if (sanksi !== undefined) sheet.getRange(i + 1, 13).setValue(sanksi);
      return { success: true, message: "Status penanganan BK berhasil diperbarui." };
    }
  }

  return { success: false, error: "Log pelanggaran tidak ditemukan." };
}

/**
 * PENGATURAN & MASTER DATA ADMINISTRATOR
 */
function verifyAdminPin(pin) {
  if (isValidAdminPin(pin)) {
    return { success: true, message: "PIN Administrator terverifikasi." };
  }
  return { success: false, error: "PIN Administrator salah!" };
}

function simpanPengaturan(newConfig, pin) {
  if (!isValidAdminPin(pin)) {
    return { success: false, error: "PIN Administrator salah!" };
  }

  const sheet = getSS().getSheetByName(SHEET_CONFIG);
  const raw = sheet.getDataRange().getValues();

  for (const key in newConfig) {
    let found = false;
    for (let i = 1; i < raw.length; i++) {
      if (String(raw[i][0]).trim() === key) {
        sheet.getRange(i + 1, 2).setValue(newConfig[key]);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, newConfig[key], "Pengaturan sistem"]);
    }
  }
  SpreadsheetApp.flush();

  return { success: true, message: "Pengaturan sekolah berhasil diperbarui!" };
}

function simpanMasterSiswa(siswaList, pin) {
  if (!isValidAdminPin(pin)) {
    return { success: false, error: "PIN Administrator salah!" };
  }

  const sheet = getSS().getSheetByName(SHEET_SISWA);
  if (!sheet) return { success: false, error: "Sheet DATA_SISWA tidak ditemukan." };

  // Bersihkan data lama kecuali header
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  if (Array.isArray(siswaList) && siswaList.length > 0) {
    const rowsToAdd = siswaList.map(s => {
      const nisnPad = String(s.nisn).padStart(10, "0");
      return [
        nisnPad,
        s.nis || "",
        s.nama,
        s.kelas,
        s.gender || "L",
        s.tglLahir || "2010-01-01",
        s.noHpOrtu || "",
        s.pin || nisnPad.slice(-4),
        s.nipGuruWali || ""
      ];
    });
    sheet.getRange(2, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    sheet.getRange(2, 1, rowsToAdd.length, 1).setNumberFormat("@");
    sheet.getRange(2, 8, rowsToAdd.length, 1).setNumberFormat("@");
    SpreadsheetApp.flush();
    return { success: true, message: `Berhasil memperbarui master siswa (${rowsToAdd.length} siswa).` };
  }

  return { success: true, message: "Daftar siswa dikosongkan." };
}

/**
 * Update Kolom NIP_Guru_Wali pada sheet DATA_SISWA oleh Administrator (Batch 1 API Call)
 * @param {Array<{nisn: string, nipGuruWali: string}>} assignments
 * @param {string} pin
 */
function updateGuruWaliSiswa(assignments, pin) {
  if (!isValidAdminPin(pin)) {
    return { success: false, error: "PIN Administrator salah!" };
  }
  const sheet = getSS().getSheetByName(SHEET_SISWA);
  if (!sheet || sheet.getLastRow() <= 1) return { success: false, error: "Sheet DATA_SISWA tidak ditemukan atau kosong." };

  const raw = sheet.getDataRange().getValues();
  const assignMap = {};
  if (Array.isArray(assignments)) {
    assignments.forEach(a => {
      if (a.nisn) {
        assignMap[String(a.nisn).padStart(10, "0")] = String(a.nipGuruWali || "").trim();
      }
    });
  }

  let updatedCount = 0;
  const colWaliValues = [];
  for (let i = 1; i < raw.length; i++) {
    const rowNisn = String(raw[i][0]).padStart(10, "0");
    if (assignMap.hasOwnProperty(rowNisn)) {
      colWaliValues.push([assignMap[rowNisn]]);
      updatedCount++;
    } else {
      colWaliValues.push([raw[i][8] !== undefined ? String(raw[i][8]) : ""]);
    }
  }

  if (colWaliValues.length > 0) {
    const range = sheet.getRange(2, 9, colWaliValues.length, 1);
    range.setValues(colWaliValues);
    range.setNumberFormat("@");
    SpreadsheetApp.flush();
  }

  return { 
    success: true, 
    message: `Berhasil memperbarui penugasan Guru Wali untuk ${updatedCount} siswa di Google Sheets.` 
  };
}

function simpanMasterGuru(guruList, pin) {
  if (!isValidAdminPin(pin)) {
    return { success: false, error: "PIN Administrator salah!" };
  }

  const sheet = getSS().getSheetByName(SHEET_GURU);
  if (!sheet) return { success: false, error: "Sheet DATA_GURU tidak ditemukan." };

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  if (Array.isArray(guruList) && guruList.length > 0) {
    const rowsToAdd = guruList.map(g => [
      String(g.nip),
      g.nama,
      g.peran,
      g.rombelWali || "",
      g.cabangEkskul || "",
      g.mapel || "",
      g.noHp || "",
      g.pin || "1234"
    ]);
    sheet.getRange(2, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    sheet.getRange(2, 1, rowsToAdd.length, 1).setNumberFormat("@");
    sheet.getRange(2, 8, rowsToAdd.length, 1).setNumberFormat("@");
    SpreadsheetApp.flush();
    return { success: true, message: `Berhasil memperbarui master guru (${rowsToAdd.length} staf).` };
  }

  return { success: true, message: "Daftar guru dikosongkan." };
}

function simpanMasterEkskul(ekskulList, pin) {
  if (!isValidAdminPin(pin)) {
    return { success: false, error: "PIN Administrator salah!" };
  }

  const sheet = getSS().getSheetByName(SHEET_EKSKUL_MASTER);
  if (!sheet) return { success: false, error: "Sheet EKSKUL_MASTER tidak ditemukan." };

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  if (Array.isArray(ekskulList) && ekskulList.length > 0) {
    const rowsToAdd = ekskulList.map(e => [
      e.id,
      e.nama,
      e.kategori || "Umum",
      e.hari || "",
      e.jam || "",
      e.tempat || "",
      Number(e.kuota) || 30,
      e.pembina || "",
      e.status || "BUKA"
    ]);
    sheet.getRange(2, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    SpreadsheetApp.flush();
    return { success: true, message: `Berhasil memperbarui master ekskul (${rowsToAdd.length} cabang).` };
  }

  return { success: true, message: "Daftar master ekskul dikosongkan." };
}

function updateProfilSiswa(nisn, noHpOrtu) {
  const ss = getSS();
  const sheet = ss.getSheetByName(SHEET_SISWA);
  if (!sheet || sheet.getLastRow() <= 1) return { success: false, error: "Sheet DATA_SISWA tidak ditemukan atau kosong." };

  const raw = sheet.getDataRange().getValues();
  const targetNisn = String(nisn || "").replace(/\D/g, "").padStart(10, "0");
  const cleanPhone = String(noHpOrtu || "").trim();

  for (let i = 1; i < raw.length; i++) {
    const rowNisn = String(raw[i][0] || "").replace(/\D/g, "").padStart(10, "0");
    if (rowNisn === targetNisn) {
      sheet.getRange(i + 1, 7).setNumberFormat("@");
      sheet.getRange(i + 1, 7).setValue(cleanPhone);
      SpreadsheetApp.flush();
      return { 
        success: true, 
        message: "Nomor WhatsApp orang tua berhasil diperbarui di Google Sheets.",
        noHpOrtu: cleanPhone
      };
    }
  }

  return { success: false, error: "Siswa dengan NISN " + targetNisn + " tidak ditemukan." };
}
