/**
 * guru.js — Portal Tenaga Pendidik, Wali Kelas, Guru Wali & Pelatih
 * Super App Sekolah Terpadu — Fase 4
 *
 * Mengelola Menu Command Center Guru:
 * 1. home          : Dashboard KPI, Status Rombel, Pintasan Cepat
 * 2. presensi-kbm  : Presensi KBM Kelas (Exception-based kilat)
 * 3. nilai         : Input Nilai & Paste Leger Excel (< 10 Detik)
 * 4. jurnal        : Jurnal Mengajar & Generate Refleksi 4F Otomatis (< 40 kata)
 * 5. kebiasaan     : Validasi 7 Kebiasaan, Cek Watermark & 1-Klik WA Reminder Ortu
 * 6. ekskul-input  : Presensi Sesi Latihan Cabang (Khusus Pelatih)
 * 7. ekskul-rekap  : Rekapitulasi Keaktifan Ekskul Rombel (Wali Kelas)
 * 8. pelanggaran   : Buku Tata Tertib, Razia Multi-Atribut & Cetak Surat Panggilan
 */

const GuruHome = (() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Internal State                                                     */
  /* ------------------------------------------------------------------ */
  let _activeMenu = 'home';

  // Demo Siswa Kelas 8-A untuk simulasi presensi & nilai
  const _demoSiswaRombel = [
    { nisn: '0081234567', nama: 'Ahmad Fauzan Pratama', gender: 'L', statusKbm: 'HADIR', ket: '', noWa: '081234567890', poinTibum: 0 },
    { nisn: '0087654321', nama: 'Siti Nurhaliza', gender: 'P', statusKbm: 'HADIR', ket: '', noWa: '081234567891', poinTibum: 0 },
    { nisn: '0082345678', nama: 'Bima Arya Wibowo', gender: 'L', statusKbm: 'HADIR', ket: '', noWa: '081234567892', poinTibum: 15 },
    { nisn: '0083456789', nama: 'Cantika Dewi Lestari', gender: 'P', statusKbm: 'SAKIT', ket: 'Demam (Surat Dokter)', noWa: '081234567893', poinTibum: 0 },
    { nisn: '0084567890', nama: 'Dimas Satria Nugraha', gender: 'L', statusKbm: 'HADIR', ket: '', noWa: '081234567894', poinTibum: 0 },
    { nisn: '0085678901', nama: 'Farah Salsabila', gender: 'P', statusKbm: 'HADIR', ket: '', noWa: '081234567895', poinTibum: 0 },
    { nisn: '0086789012', nama: 'Genta Pratama Putra', gender: 'L', statusKbm: 'HADIR', ket: '', noWa: '081234567896', poinTibum: 0 },
    { nisn: '0087890123', nama: 'Hana Fitria Zahra', gender: 'P', statusKbm: 'HADIR', ket: '', noWa: '081234567897', poinTibum: 0 }
  ];

  // Master Tata Tertib
  const _demoTataTertib = [
    { kode: 'ATT-01', nama: 'Tidak Memakai Dasi / Topi Upacara', poin: 5, kat: 'Atribut' },
    { kode: 'ATT-02', nama: 'Tidak Memakai Sabuk / Kaos Kaki Sesuai Ketentuan', poin: 5, kat: 'Atribut' },
    { kode: 'DIS-01', nama: 'Terlambat Masuk Sekolah (> 07:00 WIB)', poin: 5, kat: 'Disiplin' },
    { kode: 'DIS-02', nama: 'Meninggalkan Kelas Tanpa Izin Guru', poin: 10, kat: 'Disiplin' },
    { kode: 'ETK-01', nama: 'Menggunakan HP Saat KBM Tanpa Izin', poin: 15, kat: 'Etika' },
    { kode: 'BRT-01', nama: 'Merokok / Membawa Rokok di Lingkungan Sekolah', poin: 35, kat: 'Berat' }
  ];

  /* ------------------------------------------------------------------ */
  /* Helper: Ambil Data Guru Aktif                                      */
  /* ------------------------------------------------------------------ */
  function _getTeacher() {
    return window.APP_STATE?.currentUser || {
      nama: 'Budi Santoso, S.Pd.',
      nip: '198501012010011001',
      jabatan: 'Wali Kelas 8-A',
      mapel: ['Matematika'],
      role: 'GURU'
    };
  }

  /* ------------------------------------------------------------------ */
  /* Header Command Center Guru                                         */
  /* ------------------------------------------------------------------ */
  function _renderGuruHeader(title, subtitle) {
    const g = _getTeacher();
    return `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">👔</span>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">${title}</h2>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">${subtitle}</p>
        </div>

        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold rounded-xl shadow-2xs">
            <span>👤</span>
            <span>${Utils.sanitize(g.nama)}</span>
          </span>
          <button type="button" onclick="App.onLogout()" class="px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs">
            Keluar
          </button>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* MENU 1: BERANDA COMMAND CENTER                                     */
  /* ------------------------------------------------------------------ */
  function _renderHomeMenu() {
    const g = _getTeacher();

    return `
      <div class="space-y-6">
        ${_renderGuruHeader(
          `Selamat Datang, ${Utils.sanitize(g.nama)}`,
          `NIP: ${Utils.sanitize(g.nip || '-')} • Peran: ${Utils.sanitize(g.jabatan || 'Tenaga Pendidik')}`
        )}

        <!-- KPI Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span class="text-xs font-bold text-slate-400 uppercase">Siswa Rombel 8-A</span>
            <div class="text-3xl font-black text-slate-900 font-mono mt-1">32</div>
            <span class="text-[11px] text-emerald-600 font-bold">100% Aktif Terdaftar</span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span class="text-xs font-bold text-slate-400 uppercase">Presensi KBM Hari Ini</span>
            <div class="text-3xl font-black text-brand-600 font-mono mt-1">96.8%</div>
            <span class="text-[11px] text-slate-500">31 Hadir, 1 Sakit</span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span class="text-xs font-bold text-slate-400 uppercase">Jurnal 7 Kebiasaan</span>
            <div class="text-3xl font-black text-amber-600 font-mono mt-1">24/32</div>
            <span class="text-[11px] text-amber-700 font-bold">8 Siswa Belum Lapor</span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span class="text-xs font-bold text-slate-400 uppercase">Ketertiban Rombel</span>
            <div class="text-3xl font-black text-emerald-600 font-mono mt-1">🟢 Aman</div>
            <span class="text-[11px] text-slate-500">0 Siswa Mencapai SP</span>
          </div>
        </div>

        <!-- Panel Pintasan Aksi Cepat 1-Ketukan -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              ⚡ Pintasan Aksi Cepat Guru &amp; Walas
            </h3>
            <span class="text-[11px] text-slate-400">Pilih modul tugas harian</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <button type="button" onclick="GuruHome.switchMenu('presensi-kbm')" class="p-4 rounded-2xl bg-brand-50 hover:bg-brand-100/80 text-brand-900 border border-brand-200 text-left transition flex flex-col justify-between cursor-pointer group">
              <div>
                <span class="text-2xl mb-2 block group-hover:scale-110 transition-transform">📋</span>
                <span class="text-xs font-black block">Ambil Absen KBM</span>
                <span class="text-[11px] text-brand-600 mt-1 block">Metode Exception Cepat</span>
              </div>
              <span class="text-[10px] text-brand-700 font-bold mt-3">Buka Absensi →</span>
            </button>

            <button type="button" onclick="GuruHome.switchMenu('nilai')" class="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200 text-left transition flex flex-col justify-between cursor-pointer group">
              <div>
                <span class="text-2xl mb-2 block group-hover:scale-110 transition-transform">📊</span>
                <span class="text-xs font-black block">Paste Nilai Excel</span>
                <span class="text-[11px] text-indigo-600 mt-1 block">Ctrl+V Sekelas &lt; 10 Detik</span>
              </div>
              <span class="text-[10px] text-indigo-700 font-bold mt-3">Buka Nilai →</span>
            </button>

            <button type="button" onclick="GuruHome.switchMenu('kebiasaan')" class="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 text-left transition flex flex-col justify-between cursor-pointer group">
              <div>
                <span class="text-2xl mb-2 block group-hover:scale-110 transition-transform">⭐</span>
                <span class="text-xs font-black block">Validasi 7 Kebiasaan</span>
                <span class="text-[11px] text-amber-700 mt-1 block">1-Klik WA Reminder Ortu</span>
              </div>
              <span class="text-[10px] text-amber-800 font-bold mt-3">Buka Jurnal 7K →</span>
            </button>

            <button type="button" onclick="GuruHome.switchMenu('jurnal')" class="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100/80 text-purple-900 border border-purple-200 text-left transition flex flex-col justify-between cursor-pointer group">
              <div>
                <span class="text-2xl mb-2 block group-hover:scale-110 transition-transform">📓</span>
                <span class="text-xs font-black block">Jurnal Mengajar &amp; 4F</span>
                <span class="text-[11px] text-purple-600 mt-1 block">Refleksi Otomatis &lt; 40 Kata</span>
              </div>
              <span class="text-[10px] text-purple-700 font-bold mt-3">Tulis Jurnal →</span>
            </button>

          </div>
        </div>

        <!-- Feed Aktivitas Terkini -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Aktivitas Terkini Kelas 8-A
          </h4>
          <div class="divide-y divide-slate-100 text-xs">
            <div class="py-2.5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>📝</span>
                <span class="text-slate-800 font-medium">Presensi KBM hari ini telah disimpan (31 Hadir, 1 Sakit)</span>
              </div>
              <span class="text-[11px] text-slate-400">07:15 WIB</span>
            </div>
            <div class="py-2.5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>⭐</span>
                <span class="text-slate-800 font-medium">Ahmad Fauzan Pratama mengirim jurnal 7 Kebiasaan (Live Camera)</span>
              </div>
              <span class="text-[11px] text-slate-400">06:45 WIB</span>
            </div>
            <div class="py-2.5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span>⚽</span>
                <span class="text-slate-800 font-medium">Pelatih Futsal merekap kehadiran sesi latihan ke-4</span>
              </div>
              <span class="text-[11px] text-slate-400">Kemarin</span>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* MENU 2: PRESENSI KBM KELAS (EXCEPTION-BASED KILAT)                 */
  /* ------------------------------------------------------------------ */
  function _renderPresensiKbmMenu() {
    return `
      <div class="space-y-6">
        ${_renderGuruHeader(
          'Presensi Harian KBM Kelas (Wali Kelas)',
          'Metode Exception: Semua siswa default HADIR. Cukup ubah siswa yang Sakit, Izin, Alpha, atau Terlambat.'
        )}

        <!-- Toolbar Kelas & Tanggal -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <div>
              <label class="font-bold text-slate-600 block mb-1">Rombel:</label>
              <select class="input-field text-xs font-bold py-1.5 px-3">
                <option value="8-A">Kelas 8-A (Binaan Anda)</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-600 block mb-1">Tanggal Absensi:</label>
              <input type="date" value="${new Date().toISOString().split('T')[0]}" class="input-field text-xs font-bold py-1.5 px-3">
            </div>
          </div>

          <div class="flex items-center gap-2" id="kbm-counters">
            <span class="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              🟢 Hadir: <b id="count-hadir">7</b>
            </span>
            <span class="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              🔵 Sakit: <b id="count-sakit">1</b>
            </span>
            <span class="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold">
              🟡 Izin: <b id="count-izin">0</b>
            </span>
            <span class="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold">
              🔴 Alpha: <b id="count-alpha">0</b>
            </span>
          </div>
        </div>

        <!-- Tabel Siswa Presensi -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3 w-10">No</th>
                  <th class="py-2.5 px-3">NISN</th>
                  <th class="py-2.5 px-3">Nama Siswa</th>
                  <th class="py-2.5 px-3 text-center">Status Kehadiran</th>
                  <th class="py-2.5 px-3">Keterangan Khusus</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${_demoSiswaRombel.map((s, i) => `
                  <tr id="row-siswa-${s.nisn}">
                    <td class="py-3 px-3 text-slate-400 font-mono">${i + 1}</td>
                    <td class="py-3 px-3 font-mono text-slate-500">${s.nisn}</td>
                    <td class="py-3 px-3 font-bold text-slate-800">${s.nama}</td>
                    <td class="py-3 px-3 text-center">
                      <div class="inline-flex rounded-xl bg-slate-100 p-0.5 text-[11px] font-bold">
                        <button type="button" onclick="GuruHome.ubahStatusKbm('${s.nisn}', 'HADIR')" class="btn-stat-${s.nisn} px-2.5 py-1 rounded-lg transition ${s.statusKbm === 'HADIR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'}">H</button>
                        <button type="button" onclick="GuruHome.ubahStatusKbm('${s.nisn}', 'SAKIT')" class="btn-stat-${s.nisn} px-2.5 py-1 rounded-lg transition ${s.statusKbm === 'SAKIT' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'}">S</button>
                        <button type="button" onclick="GuruHome.ubahStatusKbm('${s.nisn}', 'IZIN')" class="btn-stat-${s.nisn} px-2.5 py-1 rounded-lg transition ${s.statusKbm === 'IZIN' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600'}">I</button>
                        <button type="button" onclick="GuruHome.ubahStatusKbm('${s.nisn}', 'ALPHA')" class="btn-stat-${s.nisn} px-2.5 py-1 rounded-lg transition ${s.statusKbm === 'ALPHA' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'}">A</button>
                      </div>
                    </td>
                    <td class="py-3 px-3">
                      <input type="text" id="ket-${s.nisn}" value="${s.ket}" placeholder="Keterangan..." class="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Sticky Save Button -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500">Total Siswa Terdaftar: <b>${_demoSiswaRombel.length} Peserta Didik</b></span>
            <button type="button" onclick="GuruHome.simpanPresensiKbm()" class="btn-primary px-6 py-2.5 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-200 cursor-pointer">
              <span>💾</span> <span>Simpan Presensi KBM</span>
            </button>
          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* MENU 3: INPUT NILAI & PASTE LEGER EXCEL (< 10 DETIK)               */
  /* ------------------------------------------------------------------ */
  function _renderNilaiMenu() {
    return `
      <div class="space-y-6">
        ${_renderGuruHeader(
          'Input Nilai Cepat (Paste Leger Excel < 10 Detik)',
          'Salin nilai satu kelas dari spreadsheet Excel Anda, lalu tekan Ctrl + V di area bawah. Sistem memetakan otomatis dalam hitungan detik!'
        )}

        <!-- Form Filter Nilai -->
        <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Kelas:</label>
            <select id="nilai-kelas" class="input-field text-xs font-bold py-1.5">
              <option value="8-A">Kelas 8-A</option>
            </select>
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Mata Pelajaran:</label>
            <select id="nilai-mapel" class="input-field text-xs font-bold py-1.5">
              <option value="Matematika">Matematika</option>
              <option value="Informatika">Informatika</option>
              <option value="IPA">IPA</option>
            </select>
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Jenis Asesmen:</label>
            <select id="nilai-jenis" class="input-field text-xs font-bold py-1.5">
              <option value="Sumatif Lingkup Materi 1">Sumatif Lingkup Materi 1</option>
              <option value="Sumatif Tengah Semester (STS)">Sumatif Tengah Semester (STS)</option>
              <option value="Sumatif Akhir Semester (SAS)">Sumatif Akhir Semester (SAS)</option>
            </select>
          </div>
        </div>

        <!-- Area Paste Excel -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              📋 Tempel Data Excel (Format: NISN [Tab] Nilai [Tab] Catatan)
            </label>
            <button type="button" onclick="GuruHome.isiContohPasteExcel()" class="text-[11px] text-brand-600 font-bold hover:underline cursor-pointer">
              ⚡ Isi Contoh Data Excel
            </button>
          </div>

          <textarea id="paste-excel-area" rows="4" oninput="GuruHome.parsePastedExcel()" placeholder="0081234567\t88\tSangat Aktif&#10;0087654321\t92\tMemuaskan&#10;0082345678\t85\tCukup Baik" class="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"></textarea>

          <p class="text-[11px] text-slate-400">
            *Tips: Blok tabel nilai di Microsoft Excel (kolom NISN dan Nilai), tekan <b>Ctrl + C</b>, lalu klik di kotak atas dan tekan <b>Ctrl + V</b>.
          </p>

          <!-- Pratinjau Parsing Nilai -->
          <div id="area-preview-nilai" class="pt-3 border-t border-slate-100 hidden space-y-3">
            <div class="flex items-center justify-between">
              <h5 class="text-xs font-bold text-slate-800 uppercase">Hasil Pemetaan Matriks Nilai</h5>
              <span id="stat-rata-nilai" class="badge badge-success font-mono font-bold text-xs">Rata-rata: 88.3</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th class="py-2 px-3">NISN</th>
                    <th class="py-2 px-3">Nama Siswa</th>
                    <th class="py-2 px-3 text-center">Nilai Angka</th>
                    <th class="py-2 px-3 text-center">Status KKTP (75)</th>
                    <th class="py-2 px-3">Deskripsi Capaian</th>
                  </tr>
                </thead>
                <tbody id="tbody-preview-nilai" class="divide-y divide-slate-100">
                  <!-- Diisi dinamis oleh parsePastedExcel() -->
                </tbody>
              </table>
            </div>

            <button type="button" onclick="GuruHome.simpanNilaiPasted()" class="btn-primary w-full py-3 text-xs font-black shadow-md shadow-brand-200 cursor-pointer">
              Simpan Penilaian ke Database
            </button>
          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* MENU 4: JURNAL MENGAJAR & GENERATE REFLEKSI 4F OTOMATIS            */
  /* ------------------------------------------------------------------ */
  function _renderJurnalMenu() {
    return `
      <div class="space-y-6">
        ${_renderGuruHeader(
          'Jurnal Mengajar Guru & Refleksi 4F Otomatis',
          'Catat topik pembelajaran, garis besar kegiatan, dan susun refleksi 4F (Facts, Feelings, Findings, Future) berbatas kata ketat (< 40 kata).'
        )}

        <!-- Form Jurnal Mengajar -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="input-label text-xs font-bold text-slate-700">Mata Pelajaran &amp; Kelas</label>
              <input type="text" id="jurnal-mapel-kelas" value="Matematika — Kelas 8-A" class="input-field text-xs font-bold py-2" readonly>
            </div>
            <div>
              <label class="input-label text-xs font-bold text-slate-700">Tanggal Pelaksanaan</label>
              <input type="date" id="jurnal-tanggal" value="${new Date().toISOString().split('T')[0]}" class="input-field text-xs font-bold py-2">
            </div>
          </div>

          <div>
            <label class="input-label text-xs font-bold text-slate-700">Topik / Materi Pembelajaran</label>
            <input type="text" id="jurnal-topik" value="Teorema Pythagoras &amp; Penerapannya dalam Kehidupan Sehari-hari" placeholder="Contoh: Teorema Pythagoras" class="input-field text-xs font-bold py-2">
          </div>

          <div>
            <label class="input-label text-xs font-bold text-slate-700">Garis Besar Aktivitas Belajar Siswa</label>
            <textarea id="jurnal-aktivitas" rows="2" class="input-field text-xs leading-relaxed" placeholder="Garis besar kegiatan KBM...">Diskusi kelompok memecahkan soal cerita kontekstual, presentasi perwakilan kelompok, dan penarikan kesimpulan rumus.</textarea>
          </div>

          <!-- Tombol Generate Refleksi 4F Otomatis -->
          <div class="pt-2">
            <button type="button" onclick="GuruHome.generateRefleksi4F()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-200 transition flex items-center gap-2 cursor-pointer">
              <span>✨</span> <span>Generate Refleksi 4F Otomatis (&lt; 40 Kata)</span>
            </button>
          </div>

          <!-- Card Kotak Refleksi 4F Hasil Generate -->
          <div id="card-refleksi-4f" class="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/50 border border-purple-200/80 space-y-3.5">
            <div class="flex items-center justify-between border-b border-purple-100 pb-2">
              <span class="text-xs font-extrabold text-purple-900 uppercase tracking-wide">
                Draf Refleksi Pembelajaran 4F
              </span>
              <span class="badge badge-info text-[10px]">Tersusun Padat &lt; 40 Kata</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <div class="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                <span class="font-bold text-brand-600 block mb-1">1. Facts (Peristiwa)</span>
                <textarea id="refleksi-facts" rows="2" class="w-full text-xs text-slate-700 border-0 focus:ring-0 p-0 resize-none">Pembelajaran Pythagoras berjalan antusias. Diskusi kelompok aktif menyelesaikan 4 studi kasus kontekstual.</textarea>
              </div>

              <div class="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                <span class="font-bold text-amber-600 block mb-1">2. Feelings (Perasaan)</span>
                <textarea id="refleksi-feelings" rows="2" class="w-full text-xs text-slate-700 border-0 focus:ring-0 p-0 resize-none">Merasa senang melihat siswa yang awalnya ragu rumus mulai percaya diri mempresentasikan jawaban.</textarea>
              </div>

              <div class="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                <span class="font-bold text-emerald-600 block mb-1">3. Findings (Pembelajaran)</span>
                <textarea id="refleksi-findings" rows="2" class="w-full text-xs text-slate-700 border-0 focus:ring-0 p-0 resize-none">Visualisasi segitiga siku-siku konkret sangat membantu pemahaman konsep abstrak dibanding hafalan rumus.</textarea>
              </div>

              <div class="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                <span class="font-bold text-purple-600 block mb-1">4. Future (Penerapan)</span>
                <textarea id="refleksi-future" rows="2" class="w-full text-xs text-slate-700 border-0 focus:ring-0 p-0 resize-none">Menyiapkan lembar kerja gamifikasi untuk materi tripel Pythagoras pada pertemuan berikutnya.</textarea>
              </div>

            </div>

            <button type="button" onclick="GuruHome.simpanJurnal()" class="btn-primary w-full py-2.5 text-xs font-bold cursor-pointer">
              Simpan Jurnal &amp; Refleksi 4F
            </button>
          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* MENU 5: VALIDASI 7 KEBIASAAN & 1-KLIK WA REMINDER                 */
  /* ------------------------------------------------------------------ */
  function _renderKebiasaanMenu() {
    return `
      <div class="space-y-6">
        ${_renderGuruHeader(
          'Portal Guru Wali (7 Kebiasaan & WA Ortu)',
          'Dampingi siswa binaan karakter, periksa foto watermark asli dari kamera HP, dan kirim pengingat 1-klik ke nomor WhatsApp orang tua.'
        )}

        <!-- Banner Pengingat WhatsApp Siswa Belum Lapor -->
        <div class="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🔔</span>
              <div>
                <h4 class="text-xs font-extrabold text-rose-900 uppercase tracking-wide">
                  Pengingat WA 1-Klik: Siswa Binaan Belum Melapor Hari Ini
                </h4>
                <p class="text-[11px] text-rose-700">Kirim pesan sopan otomatis ke WhatsApp orang tua dengan satu ketukan.</p>
              </div>
            </div>
            <span class="badge badge-danger">2 Siswa Belum Lapor</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div class="bg-white p-3 rounded-2xl border border-rose-200 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 text-xs block">Bima Arya Wibowo</span>
                <span class="text-[11px] text-slate-400 font-mono">WA Ortu: 081234567892</span>
              </div>
              <button type="button" onclick="GuruHome.kirimWaOrtu('Bima Arya Wibowo', '081234567892')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer">
                <span>📲</span> <span>Ingatkan WA</span>
              </button>
            </div>

            <div class="bg-white p-3 rounded-2xl border border-rose-200 flex items-center justify-between">
              <div>
                <span class="font-bold text-slate-800 text-xs block">Genta Pratama Putra</span>
                <span class="text-[11px] text-slate-400 font-mono">WA Ortu: 081234567896</span>
              </div>
              <button type="button" onclick="GuruHome.kirimWaOrtu('Genta Pratama Putra', '081234567896')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer">
                <span>📲</span> <span>Ingatkan WA</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tabel Validasi Jurnal Masuk -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Verifikasi Jurnal Karakter &amp; Foto Watermark Asli
              </h4>
              <p class="text-[11px] text-slate-500">Bukti foto wajib berstempel nama, jam WIB, dan tanggal.</p>
            </div>
            <button type="button" onclick="GuruHome.cetakRekap7KMingguan()" class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer">
              <span>🖨️</span> <span>Cetak Rekap Mingguan (A4)</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Nama Siswa</th>
                  <th class="py-2.5 px-3">Bangun</th>
                  <th class="py-2.5 px-3">Ibadah</th>
                  <th class="py-2.5 px-3 text-center">Foto Watermark</th>
                  <th class="py-2.5 px-3 text-center">Status</th>
                  <th class="py-2.5 px-3 text-center">Aksi Guru</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr id="row-val-ahmad">
                  <td class="py-3 px-3 font-bold text-slate-800">Ahmad Fauzan Pratama</td>
                  <td class="py-3 px-3 font-mono">04:30 WIB</td>
                  <td class="py-3 px-3">5 Waktu Lengkap</td>
                  <td class="py-3 px-3 text-center">
                    <span class="badge badge-success text-[10px] cursor-pointer" onclick="alert('Watermark Terverifikasi: Ahmad Fauzan Pratama (0081234567) - LIVE CAMERA')">
                      📷 Stempel Asli
                    </span>
                  </td>
                  <td class="py-3 px-3 text-center" id="status-val-ahmad">
                    <span class="badge badge-warning text-[10px]">Menunggu</span>
                  </td>
                  <td class="py-3 px-3 text-center">
                    <button type="button" onclick="GuruHome.setujuiJurnal('ahmad')" class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer">
                      ✓ Setujui
                    </button>
                  </td>
                </tr>
                <tr>
                  <td class="py-3 px-3 font-bold text-slate-800">Siti Nurhaliza</td>
                  <td class="py-3 px-3 font-mono">04:30 WIB</td>
                  <td class="py-3 px-3">5 Waktu Lengkap</td>
                  <td class="py-3 px-3 text-center">
                    <span class="badge badge-success text-[10px]">📷 Stempel Asli</span>
                  </td>
                  <td class="py-3 px-3 text-center">
                    <span class="badge badge-success text-[10px]">Disetujui</span>
                  </td>
                  <td class="py-3 px-3 text-center text-slate-400 font-bold">
                    ✓ Selesai
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* MENU 6: PRESENSI EKSKUL (PELATIH & REKAP WALAS)                   */
  /* ------------------------------------------------------------------ */
  function _renderEkskulInputMenu() {
    return `
      <div class="space-y-6">
        ${_renderGuruHeader(
          'Presensi Latihan Cabang Ekstrakurikuler (Pelatih)',
          'Hanya Pelatih yang mengisi absensi sesi latihan cabang binaannya.'
        )}

        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs">
            <div>
              <span class="badge badge-info text-[10px]">Cabang Binaan:</span>
              <h4 class="text-base font-extrabold text-slate-900 mt-1">Futsal Prestasi</h4>
            </div>
            <div class="flex items-center gap-2">
              <label class="font-bold text-slate-600">Sesi Ke:</label>
              <input type="number" value="5" class="w-16 input-field text-xs font-bold py-1 px-2">
              <input type="date" value="${new Date().toISOString().split('T')[0]}" class="input-field text-xs font-bold py-1 px-3">
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Nama Anggota</th>
                  <th class="py-2.5 px-3">Kelas</th>
                  <th class="py-2.5 px-3 text-center">Kehadiran Latihan</th>
                  <th class="py-2.5 px-3">Catatan Pelatih</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr>
                  <td class="py-3 px-3 font-bold text-slate-800">Ahmad Fauzan Pratama</td>
                  <td class="py-3 px-3 font-mono">8-A</td>
                  <td class="py-3 px-3 text-center">
                    <span class="badge badge-success">🟢 Hadir</span>
                  </td>
                  <td class="py-3 px-3"><input type="text" placeholder="Catatan fisik/taktik..." class="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"></td>
                </tr>
                <tr>
                  <td class="py-3 px-3 font-bold text-slate-800">Bima Arya Wibowo</td>
                  <td class="py-3 px-3 font-mono">8-A</td>
                  <td class="py-3 px-3 text-center">
                    <span class="badge badge-success">🟢 Hadir</span>
                  </td>
                  <td class="py-3 px-3"><input type="text" placeholder="Catatan fisik/taktik..." class="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <button type="button" onclick="GuruHome.simpanEkskulPelatih()" class="btn-primary w-full py-2.5 text-xs font-bold cursor-pointer">
            Simpan Absensi Latihan ke Database
          </button>
        </div>
      </div>
    `;
  }

  function _renderEkskulRekapMenu() {
    return `
      <div class="space-y-6">
        ${_renderGuruHeader(
          'Rekapitulasi Keaktifan Ekskul Rombel (Wali Kelas)',
          'Wali Kelas HANYA menerima dan memantau rekap keaktifan siswa kelas binaannya untuk acuan penilaian rapor.'
        )}

        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Nama Siswa</th>
                  <th class="py-2.5 px-3">Cabang Ekstrakurikuler</th>
                  <th class="py-2.5 px-3 text-center">Keaktifan Latihan</th>
                  <th class="py-2.5 px-3 text-center">Predikat Rapor</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr>
                  <td class="py-3 px-3 font-bold text-slate-800">Ahmad Fauzan Pratama</td>
                  <td class="py-3 px-3 font-medium text-slate-600">Futsal Prestasi</td>
                  <td class="py-3 px-3 text-center font-mono font-bold text-brand-600">85% (Hadir 4/5)</td>
                  <td class="py-3 px-3 text-center"><span class="badge badge-success">Sangat Baik (A)</span></td>
                </tr>
                <tr>
                  <td class="py-3 px-3 font-bold text-slate-800">Siti Nurhaliza</td>
                  <td class="py-3 px-3 font-medium text-slate-600">PMR (Palang Merah Remaja)</td>
                  <td class="py-3 px-3 text-center font-mono font-bold text-brand-600">92% (Hadir 5/5)</td>
                  <td class="py-3 px-3 text-center"><span class="badge badge-success">Sangat Baik (A)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* MENU 7: BUKU TATA TERTIB, RAZIA PAGI & SURAT PANGGILAN             */
  /* ------------------------------------------------------------------ */
  function _renderPelanggaranMenu() {
    return `
      <div class="space-y-6">
        ${_renderGuruHeader(
          'Buku Catatan Tata Tertib & Razia Pagi Siswa',
          'Catat pelanggaran atribut serentak, akumulasi poin SP otomatis, dan penerbitan Surat Panggilan Orang Tua resmi.'
        )}

        <!-- Form Razia Pagi Multi-Atribut -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Mode Razia Multi-Atribut Pagi (Sekali Klik)
            </h4>
            <span class="badge badge-warning text-[10px]">Anti-Duplikasi Harian Aktif</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="input-label text-xs font-bold text-slate-700">Pilih Siswa Terjaring:</label>
              <select id="pilih-siswa-razia" class="input-field text-xs font-bold py-2">
                ${_demoSiswaRombel.map(s => `
                  <option value="${s.nisn}">${s.nama} (${s.nisn}) — Rombel 8-A</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="input-label text-xs font-bold text-slate-700">Guru Pencatat / Piket:</label>
              <input type="text" value="${Utils.sanitize(_getTeacher().nama)}" class="input-field text-xs font-bold py-2" readonly>
            </div>
          </div>

          <div>
            <label class="input-label text-xs font-bold text-slate-700 mb-2 block">Centang Atribut yang Melanggar:</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              ${_demoTataTertib.map(t => `
                <label class="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                  <input type="checkbox" name="razia-item" value="${t.poin}" data-nama="${t.nama}" class="mt-0.5 rounded text-rose-600">
                  <div>
                    <span class="font-bold text-slate-800 block">${t.nama}</span>
                    <span class="text-[10px] text-rose-600 font-bold">+${t.poin} Poin (${t.kat})</span>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <div class="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onclick="GuruHome.simpanRazia()" class="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 transition cursor-pointer">
              Simpan Catatan Pelanggaran
            </button>
            <button type="button" onclick="GuruHome.cetakSuratPanggilan('Bima Arya Wibowo', '0082345678', '8-A', 35)" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer">
              🖨️ Cetak Surat Panggilan Ortu (A4)
            </button>
          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Main Layout Render Guru                                            */
  /* ------------------------------------------------------------------ */
  function render(params = {}) {
    if (params.menu) {
      _activeMenu = params.menu;
    }

    const g = _getTeacher();

    // Render Sidebar Guru
    if (window.Sidebar) {
      window.Sidebar.render(_activeMenu, g.role || 'GURU');
    }

    const root = document.getElementById('app-root');
    if (!root) return;

    let contentHtml = '';
    if (_activeMenu === 'presensi-kbm') contentHtml = _renderPresensiKbmMenu();
    else if (_activeMenu === 'nilai') contentHtml = _renderNilaiMenu();
    else if (_activeMenu === 'jurnal') contentHtml = _renderJurnalMenu();
    else if (_activeMenu === 'kebiasaan') contentHtml = _renderKebiasaanMenu();
    else if (_activeMenu === 'ekskul-input') contentHtml = _renderEkskulInputMenu();
    else if (_activeMenu === 'ekskul-rekap') contentHtml = _renderEkskulRekapMenu();
    else if (_activeMenu === 'pelanggaran') contentHtml = _renderPelanggaranMenu();
    else contentHtml = _renderHomeMenu();

    root.innerHTML = `
      <div class="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 md:ml-60 page-transition">
        <main class="max-w-6xl mx-auto">
          ${contentHtml}
        </main>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------------ */
  /* Switch Menu                                                        */
  /* ------------------------------------------------------------------ */
  function switchMenu(menu) {
    _activeMenu = menu;
    if (window.Sidebar) {
      window.Sidebar.setActive(menu);
    }
    render({ menu });
  }

  /* ------------------------------------------------------------------ */
  /* Handlers Presensi KBM                                              */
  /* ------------------------------------------------------------------ */
  function ubahStatusKbm(nisn, status) {
    const s = _demoSiswaRombel.find(x => x.nisn === nisn);
    if (!s) return;
    s.statusKbm = status;

    // Update buttons style
    document.querySelectorAll(`.btn-stat-${nisn}`).forEach(b => {
      b.className = `btn-stat-${nisn} px-2.5 py-1 rounded-lg transition text-slate-600`;
    });

    const targetRow = document.getElementById(`row-siswa-${nisn}`);
    if (targetRow) {
      const btns = targetRow.querySelectorAll(`.btn-stat-${nisn}`);
      if (status === 'HADIR' && btns[0]) btns[0].className = `btn-stat-${nisn} px-2.5 py-1 rounded-lg transition bg-emerald-600 text-white shadow-2xs`;
      if (status === 'SAKIT' && btns[1]) btns[1].className = `btn-stat-${nisn} px-2.5 py-1 rounded-lg transition bg-blue-600 text-white shadow-2xs`;
      if (status === 'IZIN' && btns[2]) btns[2].className = `btn-stat-${nisn} px-2.5 py-1 rounded-lg transition bg-amber-600 text-white shadow-2xs`;
      if (status === 'ALPHA' && btns[3]) btns[3].className = `btn-stat-${nisn} px-2.5 py-1 rounded-lg transition bg-rose-600 text-white shadow-2xs`;
    }

    // Recalculate counters
    let h = 0, sk = 0, iz = 0, al = 0;
    _demoSiswaRombel.forEach(x => {
      if (x.statusKbm === 'HADIR') h++;
      if (x.statusKbm === 'SAKIT') sk++;
      if (x.statusKbm === 'IZIN') iz++;
      if (x.statusKbm === 'ALPHA') al++;
    });

    const elH = document.getElementById('count-hadir');
    const elS = document.getElementById('count-sakit');
    const elI = document.getElementById('count-izin');
    const elA = document.getElementById('count-alpha');
    if (elH) elH.innerText = h;
    if (elS) elS.innerText = sk;
    if (elI) elI.innerText = iz;
    if (elA) elA.innerText = al;
  }

  function simpanPresensiKbm() {
    if (window.Toast) {
      window.Toast.success('Presensi KBM berhasil disimpan ke Google Sheets!');
    }
  }

  /* ------------------------------------------------------------------ */
  /* Handlers Paste Excel                                               */
  /* ------------------------------------------------------------------ */
  function isiContohPasteExcel() {
    const area = document.getElementById('paste-excel-area');
    if (!area) return;
    area.value = "0081234567\t88\tSangat Aktif dalam Diskusi\n0087654321\t92\tPemahaman Konsep Sangat Baik\n0082345678\t85\tTuntas Memuaskan\n0083456789\t84\tTuntas\n0084567890\t90\tSangat Baik";
    parsePastedExcel();
  }

  function parsePastedExcel() {
    const raw = document.getElementById('paste-excel-area')?.value?.trim();
    const preview = document.getElementById('area-preview-nilai');
    const tbody = document.getElementById('tbody-preview-nilai');
    if (!raw || !preview || !tbody) {
      if (preview) preview.classList.add('hidden');
      return;
    }

    const lines = raw.split(/\r?\n/).filter(Boolean);
    let html = '';
    let total = 0;
    let count = 0;

    lines.forEach(l => {
      const parts = l.split(/\t|,|;/).map(x => x.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const nisn = parts[0].replace(/\D/g, '').padStart(10, '0');
        const nilai = parseInt(parts[1], 10) || 0;
        const ket = parts[2] || (nilai >= 75 ? 'Tuntas' : 'Perlu Bimbingan');
        const match = _demoSiswaRombel.find(s => s.nisn === nisn);
        const nama = match ? match.nama : 'Peserta Didik';

        total += nilai;
        count++;

        html += `
          <tr>
            <td class="py-2.5 px-3 font-mono text-slate-500">${nisn}</td>
            <td class="py-2.5 px-3 font-bold text-slate-800">${nama}</td>
            <td class="py-2.5 px-3 text-center font-mono font-black text-brand-600">${nilai}</td>
            <td class="py-2.5 px-3 text-center">
              <span class="badge ${nilai >= 75 ? 'badge-success' : 'badge-danger'}">
                ${nilai >= 75 ? '✓ Tuntas' : '⚠ Bimbingan'}
              </span>
            </td>
            <td class="py-2.5 px-3 text-slate-600">${ket}</td>
          </tr>
        `;
      }
    });

    if (count > 0) {
      tbody.innerHTML = html;
      preview.classList.remove('hidden');
      const stat = document.getElementById('stat-rata-nilai');
      if (stat) stat.innerText = `Rata-rata: ${(total / count).toFixed(1)}`;
    }
  }

  function simpanNilaiPasted() {
    if (window.Toast) {
      window.Toast.success('Nilai sekelas berhasil disimpan ke Google Sheets!');
    }
  }

  /* ------------------------------------------------------------------ */
  /* Handlers 4F Reflection & Jurnal                                    */
  /* ------------------------------------------------------------------ */
  function generateRefleksi4F() {
    const f1 = document.getElementById('refleksi-facts');
    const f2 = document.getElementById('refleksi-feelings');
    const f3 = document.getElementById('refleksi-findings');
    const f4 = document.getElementById('refleksi-future');

    if (f1) f1.value = "Siswa aktif memecahkan studi kasus Pythagoras. 31 siswa terlibat penuh dalam penarikan rumus kelompok.";
    if (f2) f2.value = "Merasa sangat bersemangat melihat antusiasme anak-anak yang menemukan solusi tanpa rasa takut salah.";
    if (f3) f3.value = "Penggunaan peraga visual segitiga terbukti meningkatkan pemahaman logika jauh lebih cepat.";
    if (f4) f4.value = "Melanjutkan tantangan latihan gamifikasi kontekstual untuk memperkuat retensi konsep rumus.";

    if (window.Toast) {
      window.Toast.success('Refleksi 4F otomatis berhasil disusun (< 40 kata)!');
    }
  }

  function simpanJurnal() {
    if (window.Toast) {
      window.Toast.success('Jurnal Mengajar dan Refleksi 4F berhasil disimpan!');
    }
  }

  /* ------------------------------------------------------------------ */
  /* Handlers 7 Kebiasaan & WA Ortu                                     */
  /* ------------------------------------------------------------------ */
  function kirimWaOrtu(nama, noWa) {
    const sapaan = `Assalamu'alaikum Wr. Wb. Selamat pagi Bapak/Ibu wali dari ananda *${nama}*. Mengingatkan dengan hormat untuk mendampingi ananda mengisi Jurnal 7 Kebiasaan Anak Hebat hari ini di aplikasi sekolah. Terima kasih atas kerja samanya.`;
    const cleanPhone = Utils.formatPhone ? Utils.formatPhone(noWa) : noWa.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(sapaan)}`;
    window.open(url, '_blank');
    if (window.Toast) {
      window.Toast.info(`Membuka WhatsApp untuk orang tua ananda ${nama}...`);
    }
  }

  function setujuiJurnal(id) {
    const el = document.getElementById(`status-val-${id}`);
    if (el) el.innerHTML = `<span class="badge badge-success text-[10px]">Disetujui</span>`;
    if (window.Toast) {
      window.Toast.success('Jurnal pembiasaan berhasil divalidasi!');
    }
  }

  function cetakRekap7KMingguan() {
    window.open('', '_blank')?.document.write(`
      <html><head><title>Rekap 7 Kebiasaan Mingguan</title></head>
      <body style="font-family:sans-serif;padding:30px;">
        <h2 style="text-align:center;">LEMBAR MONITORING 7 KEBIASAAN MINGGUAN</h2>
        <p style="text-align:center;">Kelas 8-A • SMP Negeri Indonesia Hebat</p>
        <hr><br><p>Rekapitulasi pembiasaan karakter peserta didik tervalidasi lengkap.</p>
      </body></html>
    `);
    if (window.Toast) window.Toast.info('Mencetak rekapitulasi 7 kebiasaan...');
  }

  /* ------------------------------------------------------------------ */
  /* Handlers Ekskul & Pelanggaran                                      */
  /* ------------------------------------------------------------------ */
  function simpanEkskulPelatih() {
    if (window.Toast) window.Toast.success('Presensi latihan ekskul berhasil disimpan!');
  }

  function simpanRazia() {
    if (window.Toast) window.Toast.success('Catatan razia tata tertib berhasil dicatat!');
  }

  function cetakSuratPanggilan(nama, nisn, kelas, poin) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Panggilan Orang Tua - ${nama}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; line-height: 1.6; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 25px; }
          .kop h2, .kop h3 { margin: 0; text-transform: uppercase; }
          .kop p { margin: 3px 0; font-size: 12px; }
          .sign { margin-top: 50px; float: right; width: 250px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h3>PEMERINTAH DAERAH / DINAS PENDIDIKAN</h3>
          <h2>SMP NEGERI INDONESIA HEBAT</h2>
          <p>Jl. Pendidikan No. 35, Telp: (021) 12345678</p>
        </div>
        <p style="text-align:right;">Jakarta, 20 November 2026</p>
        <p>Nomor: 421.3/SP-BK/SMPN35/2026/012<br>Perihal: <b>Panggilan Orang Tua / Wali Peserta Didik</b></p>
        <p>Kepada Yth.<br>Orang Tua / Wali dari:<br><b>${nama}</b> (NISN: ${nisn})<br>Kelas: ${kelas}</p>
        <p style="text-indent: 30px;">
          Sehubungan dengan pembinaan kedisiplinan dan tata tertib peserta didik yang telah mencapai akumulasi poin <b>${poin} poin</b>, kami mengharap kehadiran Bapak/Ibu di ruang Bimbingan Konseling (BK) sekolah untuk koordinasi pendampingan belajar ananda.
        </p>
        <div class="sign">
          <p>Guru BK / Wali Kelas,</p>
          <br><br><br>
          <p><b>Budi Santoso, S.Pd.</b><br>NIP. 198501012010011001</p>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                         */
  /* ------------------------------------------------------------------ */
  return {
    render,
    switchMenu,
    ubahStatusKbm,
    simpanPresensiKbm,
    isiContohPasteExcel,
    parsePastedExcel,
    simpanNilaiPasted,
    generateRefleksi4F,
    simpanJurnal,
    kirimWaOrtu,
    setujuiJurnal,
    cetakRekap7KMingguan,
    simpanEkskulPelatih,
    simpanRazia,
    cetakSuratPanggilan
  };
})();

window.GuruHome = GuruHome;
