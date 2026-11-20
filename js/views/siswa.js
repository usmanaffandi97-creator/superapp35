/**
 * siswa.js — Portal Mandiri Peserta Didik (Dedicated Student Experience)
 * Super App Sekolah Terpadu — Fase 3
 *
 * Mengelola 5 Tab Utama Siswa:
 * 1. home     : Beranda Siswa (Today's Snapshot, Kehadiran KBM, Notifikasi Pembina)
 * 2. karakter : Jurnal 7 Kebiasaan Anak Hebat + Kamera Live Anti-Galeri Canvas Watermark
 * 3. ekskul   : Presensi Ekskul Mandiri, Jadwal Latihan & Pendaftaran Cabang
 * 4. nilai    : Rapor Capaian Kurikulum Merdeka, Cetak PDF Resmi & SKL Kelulusan
 * 5. profil   : Biodata Siswa, Edit WA Ortu, Ganti PIN & Buku Saku Disiplin
 */

const SiswaHome = (() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* State Internal Siswa                                               */
  /* ------------------------------------------------------------------ */
  let _activeTab = 'home';
  let _capturedWatermarkBase64 = null;
  let _isAmplopTerbuka = false;

  // Data demo bawaan jika belum terhubung backend
  const _demoData = {
    kehadiranKBM: {
      statusHariIni: 'HADIR',
      totalHadir: 38,
      totalSakit: 1,
      totalIzin: 1,
      totalAlpha: 0,
      persentase: '97.5%'
    },
    jurnal7K: [
      {
        tanggal: new Date().toISOString().split('T')[0],
        bangunPagi: '04:30',
        ibadah: '5 Waktu Lengkap (Subuh, Dzuhur, Ashar, Maghrib, Isya)',
        olahraga: 'Jogging Pagi 15 Menit',
        makanSehat: 'Ya (Sayur & Buah)',
        gemarBelajar: 'Membaca Modul Matematika',
        gotongRoyong: 'Membantu Membersihkan Rumah',
        tidurMalam: '21:30',
        status: 'PENDING', // PENDING | VALID | DITOLAK
        catatanGuru: 'Menunggu verifikasi Guru Wali'
      },
      {
        tanggal: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        bangunPagi: '04:30',
        ibadah: '5 Waktu Lengkap',
        olahraga: 'Senam Pagi',
        makanSehat: 'Ya',
        gemarBelajar: 'Mengerjakan Tugas IPA',
        gotongRoyong: 'Merapikan Tempat Tidur',
        tidurMalam: '21:00',
        status: 'VALID',
        catatanGuru: 'Hebat, pertahankan kebiasaan bangun pagi!'
      }
    ],
    ekskul: {
      nama: 'Futsal Prestasi',
      pelatih: 'Coach Hendra Gunawan',
      jadwal: 'Selasa & Jumat, 15:30 - 17:00 WIB',
      tempat: 'Lapangan Utama Sekolah',
      kehadiran: [
        { sesi: 'Latihan 1', tanggal: '2026-11-04', status: 'HADIR' },
        { sesi: 'Latihan 2', tanggal: '2026-11-07', status: 'HADIR' },
        { sesi: 'Latihan 3', tanggal: '2026-11-11', status: 'HADIR' },
        { sesi: 'Latihan 4', tanggal: '2026-11-14', status: 'IZIN' }
      ]
    },
    nilaiMapel: [
      { mapel: 'Pendidikan Agama & Budi Pekerti', nilai: 88, kktp: 75, status: 'Tuntas' },
      { mapel: 'Pendidikan Pancasila (PPKn)', nilai: 85, kktp: 75, status: 'Tuntas' },
      { mapel: 'Bahasa Indonesia', nilai: 90, kktp: 75, status: 'Tuntas' },
      { mapel: 'Matematika', nilai: 84, kktp: 75, status: 'Tuntas' },
      { mapel: 'Ilmu Pengetahuan Alam (IPA)', nilai: 87, kktp: 75, status: 'Tuntas' },
      { mapel: 'Ilmu Pengetahuan Sosial (IPS)', nilai: 86, kktp: 75, status: 'Tuntas' },
      { mapel: 'Bahasa Inggris', nilai: 89, kktp: 75, status: 'Tuntas' },
      { mapel: 'Pendidikan Jasmani & Olahraga (PJOK)', nilai: 92, kktp: 75, status: 'Tuntas' },
      { mapel: 'Informatika', nilai: 94, kktp: 75, status: 'Tuntas' },
      { mapel: 'Seni & Prakarya', nilai: 88, kktp: 75, status: 'Tuntas' }
    ],
    bukuDisiplin: {
      totalPoin: 0,
      status: 'Sangat Baik (Aman)',
      pelanggaran: []
    }
  };

  /* ------------------------------------------------------------------ */
  /* Helper: Ambil Data Siswa Aktif                                     */
  /* ------------------------------------------------------------------ */
  function _getStudent() {
    return window.APP_STATE?.currentUser || {
      nama: 'Ahmad Fauzan Pratama',
      nisn: '0081234567',
      nis: '242508001',
      kelas: '8-A',
      waliKelas: 'Budi Santoso, S.Pd.',
      guruWali: 'Siti Aminah, M.Pd.',
      noWa: '081234567890',
      role: 'SISWA'
    };
  }

  /* ------------------------------------------------------------------ */
  /* Header Profil Ringkas Siswa                                        */
  /* ------------------------------------------------------------------ */
  function _renderStudentHeader() {
    const s = _getStudent();
    return `
      <div class="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white pt-6 pb-10 px-4 sm:px-6 shadow-md border-b border-indigo-900">
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border border-white/30 shadow-inner flex-shrink-0">
              🎒
            </div>
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-400/30 text-blue-100 text-[10px] font-bold mb-1 border border-blue-400/30">
                <span>Portal Peserta Didik</span>
                <span>•</span>
                <span>Kelas ${Utils.sanitize(s.kelas || '8-A')}</span>
              </div>
              <h2 class="text-lg sm:text-2xl font-black tracking-tight leading-snug">${Utils.sanitize(s.nama)}</h2>
              <p class="text-xs text-blue-200 font-mono mt-0.5">
                NISN: <b class="text-white">${Utils.sanitize(s.nisn || '-')}</b>
                <span class="mx-1 text-blue-400">|</span>
                Walas: <span class="text-blue-100 font-sans">${Utils.sanitize(s.waliKelas || 'Budi Santoso, S.Pd.')}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button type="button" onclick="SiswaHome.switchTab('profil')" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer">
              <span>👤</span>
              <span>Profil &amp; PIN</span>
            </button>
            <button type="button" onclick="App.onLogout()" class="px-3 py-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer">
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* TAB 1: BERANDA SISWA (HOME SNAPSHOT)                                */
  /* ------------------------------------------------------------------ */
  function _renderHomeTab() {
    const s = _getStudent();
    const tglSekarang = Utils.formatTanggal(new Date());

    return `
      <div class="space-y-5">
        
        <!-- Snapshot Hari Ini -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Ringkasan Hari Ini</h3>
            </div>
            <span class="text-xs text-slate-500 font-medium">${tglSekarang}</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 flex flex-col justify-between">
              <div>
                <span class="text-[11px] font-bold text-emerald-700 block mb-1">📅 Presensi KBM</span>
                <span class="text-sm sm:text-base font-black text-emerald-800">🟢 Hadir</span>
              </div>
              <span class="text-[10px] text-emerald-600/80 mt-2">Kelas ${Utils.sanitize(s.kelas || '8-A')}</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 flex flex-col justify-between cursor-pointer hover:bg-amber-100/70 transition" onclick="SiswaHome.switchTab('karakter')">
              <div>
                <span class="text-[11px] font-bold text-amber-700 block mb-1">⭐ 7 Kebiasaan</span>
                <span class="text-sm sm:text-base font-black text-amber-800">⏳ Belum Lapor</span>
              </div>
              <span class="text-[10px] text-amber-700 font-bold underline mt-2">⚡ Isi Sekarang →</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900 flex flex-col justify-between cursor-pointer hover:bg-blue-100/70 transition" onclick="SiswaHome.switchTab('ekskul')">
              <div>
                <span class="text-[11px] font-bold text-blue-700 block mb-1">⚽ Ekskul Binaan</span>
                <span class="text-sm sm:text-base font-black text-blue-800 truncate">${_demoData.ekskul.nama}</span>
              </div>
              <span class="text-[10px] text-blue-600/80 mt-2">15.30 WIB Lapangan</span>
            </div>

            <div class="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900 flex flex-col justify-between cursor-pointer hover:bg-indigo-100/70 transition" onclick="SiswaHome.switchTab('profil')">
              <div>
                <span class="text-[11px] font-bold text-indigo-700 block mb-1">⚖️ Buku Disiplin</span>
                <span class="text-sm sm:text-base font-black text-indigo-800">0 Poin (Aman)</span>
              </div>
              <span class="text-[10px] text-emerald-600 font-bold mt-2">🟢 Status Sangat Baik</span>
            </div>

          </div>
        </div>

        <!-- Pesan & Motivasi Guru Wali -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-xs">
            💬
          </div>
          <div class="text-xs sm:text-sm">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-blue-900">Catatan Bimbingan Guru Wali</span>
              <span class="badge badge-info text-[9px]">${Utils.sanitize(s.guruWali || 'Siti Aminah, M.Pd.')}</span>
            </div>
            <p class="text-slate-600 leading-relaxed">
              "Tetap jaga kedisiplinan belajar ya, Ahmad! Jangan lupa lengkapi checklist 7 Kebiasaan Anak Hebat setiap hari bersama orang tua di rumah."
            </p>
          </div>
        </div>

        <!-- Rekap Kehadiran KBM Siswa -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Rekapitulasi Kehadiran Kelas (Semester Ini)
            </h4>
            <span class="text-xs font-black text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
              Tingkat Kehadiran: ${_demoData.kehadiranKBM.persentase}
            </span>
          </div>

          <div class="grid grid-cols-4 gap-2 text-center pt-1">
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-[10px] text-slate-500 font-bold block">HADIR</span>
              <span class="text-lg font-black text-emerald-600 font-mono">${_demoData.kehadiranKBM.totalHadir}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-[10px] text-slate-500 font-bold block">SAKIT</span>
              <span class="text-lg font-black text-blue-600 font-mono">${_demoData.kehadiranKBM.totalSakit}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-[10px] text-slate-500 font-bold block">IZIN</span>
              <span class="text-lg font-black text-amber-600 font-mono">${_demoData.kehadiranKBM.totalIzin}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-[10px] text-slate-500 font-bold block">ALPHA</span>
              <span class="text-lg font-black text-rose-600 font-mono">${_demoData.kehadiranKBM.totalAlpha}</span>
            </div>
          </div>
        </div>

        <!-- Pintasan Cepat 4 Layanan Utama -->
        <div>
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Akses Cepat Fitur Siswa
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            <div onclick="SiswaHome.switchTab('karakter')" class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition flex items-center justify-between cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl group-hover:scale-105 transition">
                  ⭐
                </div>
                <div>
                  <h5 class="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition">Jurnal 7 Kebiasaan</h5>
                  <p class="text-xs text-slate-500">Checklist 15 dtk &amp; foto kamera watermark</p>
                </div>
              </div>
              <span class="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>

            <div onclick="SiswaHome.switchTab('nilai')" class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition flex items-center justify-between cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl group-hover:scale-105 transition">
                  📊
                </div>
                <div>
                  <h5 class="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">Rapor Nilai &amp; Asesmen</h5>
                  <p class="text-xs text-slate-500">Cek capaian belajar &amp; cetak lembar nilai PDF</p>
                </div>
              </div>
              <span class="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>

            <div onclick="SiswaHome.switchTab('ekskul')" class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition flex items-center justify-between cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl group-hover:scale-105 transition">
                  ⚽
                </div>
                <div>
                  <h5 class="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition">Presensi Ekstrakurikuler</h5>
                  <p class="text-xs text-slate-500">Daftar cabang &amp; pantau log latihan pelatih</p>
                </div>
              </div>
              <span class="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>

            <div onclick="SiswaHome.switchTab('profil')" class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition flex items-center justify-between cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl group-hover:scale-105 transition">
                  🛡️
                </div>
                <div>
                  <h5 class="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition">Buku Saku Disiplin</h5>
                  <p class="text-xs text-slate-500">Cek poin kedisiplinan &amp; tata tertib siswa</p>
                </div>
              </div>
              <span class="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* TAB 2: JURNAL 7 KEBIASAAN ANAK HEBAT                               */
  /* ------------------------------------------------------------------ */
  function _renderKarakterTab() {
    return `
      <div class="space-y-6">
        
        <!-- Header 7 Kebiasaan -->
        <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-amber-400">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl flex-shrink-0">
              ⭐
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black tracking-tight">Jurnal 7 Kebiasaan Anak Indonesia Hebat</h3>
              <p class="text-xs text-amber-100 mt-0.5">Checklist kilat 10-15 detik + Foto bukti kamera langsung anti-galeri ber-watermark.</p>
            </div>
          </div>
        </div>

        <!-- Form Pengisian Jurnal Harian -->
        <form id="form-jurnal-7k" onsubmit="SiswaHome.handleKirimJurnal(event)" class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Formulir Pembiasaan Hari Ini
            </h4>
            <span class="badge badge-warning text-[10px]">Wajib Kamera Langsung</span>
          </div>

          <!-- 1. Bangun Pagi -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>🌅</span> <span>1. Bangun Pagi Tepat Waktu</span>
            </label>
            <div class="flex items-center gap-2">
              <button type="button" onclick="document.getElementById('input7k-bangun').value='04:15'" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-xs font-bold text-slate-700 transition">04:15</button>
              <button type="button" onclick="document.getElementById('input7k-bangun').value='04:30'" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-xs font-bold text-slate-700 transition">04:30</button>
              <button type="button" onclick="document.getElementById('input7k-bangun').value='05:00'" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-xs font-bold text-slate-700 transition">05:00</button>
              <input type="time" id="input7k-bangun" value="04:30" class="input-field text-xs font-bold w-32 py-1.5" required>
            </div>
          </div>

          <!-- 2. Beribadah -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>🕌</span> <span>2. Beribadah Tepat Waktu (5 Waktu)</span>
              </label>
              <button type="button" onclick="SiswaHome.pilihSemuaShalat()" class="text-[11px] text-brand-600 font-bold hover:underline cursor-pointer">
                ✓ Pilih Semua Waktu
              </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <label class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="checkbox" id="sh-subuh" class="rounded text-brand-600" checked>
                <span class="font-bold">Subuh</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="checkbox" id="sh-dzuhur" class="rounded text-brand-600" checked>
                <span class="font-bold">Dzuhur</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="checkbox" id="sh-ashar" class="rounded text-brand-600" checked>
                <span class="font-bold">Ashar</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input type="checkbox" id="sh-maghrib" class="rounded text-brand-600" checked>
                <span class="font-bold">Maghrib</span>
              </label>
              <label class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer col-span-2 sm:col-span-1">
                <input type="checkbox" id="sh-isya" class="rounded text-brand-600" checked>
                <span class="font-bold">Isya</span>
              </label>
            </div>
          </div>

          <!-- 3. Berolahraga -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>🏃</span> <span>3. Berolahraga Menjaga Kebugaran</span>
            </label>
            <div class="flex items-center gap-3">
              <select id="input7k-olahraga" class="input-field text-xs font-bold py-2">
                <option value="Ya - Senam Pagi (15 Menit)">Ya — Senam Pagi (15 Menit)</option>
                <option value="Ya - Lari / Jogging Pagi">Ya — Lari / Jogging Pagi</option>
                <option value="Ya - Bersepeda">Ya — Bersepeda Santai</option>
                <option value="Ya - Push-up & Sit-up">Ya — Push-up &amp; Sit-up Ringan</option>
                <option value="Tidak">Tidak berolahraga hari ini</option>
              </select>
            </div>
          </div>

          <!-- 4 & 5. Makan Sehat & Gemar Belajar -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>🥗</span> <span>4. Makan Sehat &amp; Bergizi</span>
              </label>
              <select id="input7k-makan" class="input-field text-xs font-bold py-2">
                <option value="Ya - Makanan 4 Sehat (Sayur & Lauk)">Ya — Nasi, Sayur &amp; Lauk Pauk</option>
                <option value="Ya - Ditambah Buah Segar">Ya — Makanan Sehat + Buah Segar</option>
                <option value="Kurang Sayur">Kurang Sayur / Buah</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>📚</span> <span>5. Gemar Belajar / Membaca</span>
              </label>
              <input type="text" id="input7k-belajar" placeholder="Materi yang dipelajari (misal: Modul IPA)" value="Membaca Modul Pelajaran &amp; Mengerjakan Tugas" class="input-field text-xs font-semibold py-2">
            </div>
          </div>

          <!-- 6 & 7. Gotong Royong & Tidur Tepat Waktu -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>🤝</span> <span>6. Bermasyarakat / Gotong Royong</span>
              </label>
              <select id="input7k-gotong" class="input-field text-xs font-bold py-2">
                <option value="Membantu Orang Tua di Rumah">Membantu Orang Tua di Rumah</option>
                <option value="Merapikan Tempat Tidur Sendiri">Merapikan Tempat Tidur Sendiri</option>
                <option value="Menyapu / Mengepel Lantai">Menyapu / Mengepel Lantai</option>
                <option value="Kerja Bakti Lingkungan">Kerja Bakti Lingkungan Sekitar</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-800 flex items-center gap-2">
                <span>😴</span> <span>7. Tidur Malam Tepat Waktu</span>
              </label>
              <div class="flex items-center gap-2">
                <button type="button" onclick="document.getElementById('input7k-tidur').value='21:00'" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-xs font-bold text-slate-700 transition">21:00</button>
                <button type="button" onclick="document.getElementById('input7k-tidur').value='21:30'" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-xs font-bold text-slate-700 transition">21:30</button>
                <input type="time" id="input7k-tidur" value="21:30" class="input-field text-xs font-bold w-28 py-1.5" required>
              </div>
            </div>
          </div>

          <!-- KAMERA LANGSUNG ANTI-GALERI & WATERMARK CANVAS -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-xs font-extrabold text-slate-800 block">
                  📸 Foto Bukti Pembiasaan (Wajib Kamera Langsung)
                </label>
                <p id="cameraStatusText" class="text-[11px] text-slate-500 mt-0.5">
                  Foto langsung dari HP. Sistem otomatis menempelkan watermark nama, NISN, jam WIB, dan tanggal.
                </p>
              </div>
              <button type="button" onclick="document.getElementById('cameraInput').click()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer">
                <span>📷</span> <span>Buka Kamera</span>
              </button>
            </div>

            <!-- Hidden File Input with capture="environment" -->
            <input type="file" id="cameraInput" accept="image/*" capture="environment" onchange="SiswaHome.handleCameraCapture(event)" class="hidden">

            <!-- Canvas Preview -->
            <div id="previewWatermarkArea" class="hidden flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200">
              <canvas id="watermarkCanvas" class="max-w-xs w-full rounded-xl border border-slate-300 shadow-sm"></canvas>
              <span class="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                ✓ Stempel watermark anti-manipulasi berhasil dibuat
              </span>
            </div>
          </div>

          <!-- Tombol Kirim Jurnal -->
          <div class="pt-2">
            <button type="submit" id="btn-submit-7k" class="btn-primary w-full py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-200">
              <span>🚀</span> <span>Kirim Jurnal 7 Kebiasaan Hari Ini</span>
            </button>
          </div>

        </form>

        <!-- Riwayat Jurnal 7 Hari Terakhir -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Riwayat Pembiasaan Karakter Saya
            </h4>
            <span class="text-xs text-slate-500 font-medium">Histori Terkini</span>
          </div>

          <div class="divide-y divide-slate-100 text-xs">
            ${_demoData.jurnal7K.map(j => `
              <div class="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900">${Utils.formatTanggal(j.tanggal)}</span>
                    <span class="badge ${j.status === 'VALID' ? 'badge-success' : 'badge-warning'} text-[10px]">
                      ${j.status === 'VALID' ? '🟢 Tervalidasi' : '⏳ Menunggu Validasi'}
                    </span>
                  </div>
                  <p class="text-slate-500 text-[11px] mt-0.5">
                    Bangun: <b>${j.bangunPagi}</b> • Ibadah: <b>${j.ibadah}</b> • Tidur: <b>${j.tidurMalam}</b>
                  </p>
                </div>
                <div class="text-left sm:text-right">
                  <span class="text-[10px] text-slate-400 block">${j.catatanGuru}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* TAB 3: PRESENSI & KEGIATAN EKSTRAKURIKULER                        */
  /* ------------------------------------------------------------------ */
  function _renderEkskulTab() {
    const e = _demoData.ekskul;

    return `
      <div class="space-y-6">
        
        <!-- Header Ekskul -->
        <div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-500">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl flex-shrink-0">
              ⚽
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black tracking-tight">Presensi Ekstrakurikuler Saya</h3>
              <p class="text-xs text-emerald-100 mt-0.5">Hanya Pelatih yang mengisi absensi sesi latihan. Siswa dapat memantau keaktifan untuk nilai rapor.</p>
            </div>
          </div>
        </div>

        <!-- Kartu Cabang Ekskul yang Diikuti -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span class="badge badge-success text-[10px]">Anggota Aktif</span>
              <h4 class="text-base font-extrabold text-slate-900 mt-1">${e.nama}</h4>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-400 block">Pelatih / Pembina:</span>
              <span class="text-xs font-bold text-slate-800">${e.pelatih}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span class="text-[10px] text-slate-400 font-bold block">JADWAL LATIHAN RUTIN</span>
              <span class="font-bold text-slate-800 mt-0.5 block">${e.jadwal}</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span class="text-[10px] text-slate-400 font-bold block">TEMPAT LATIHAN</span>
              <span class="font-bold text-slate-800 mt-0.5 block">${e.tempat}</span>
            </div>
          </div>
        </div>

        <!-- Log Rekap Kehadiran Latihan Ekskul -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Histori Kehadiran Sesi Latihan
              </h4>
              <p class="text-[11px] text-slate-500">Tercatat resmi oleh Pelatih Ekstrakurikuler</p>
            </div>
            <span class="badge badge-info font-mono">Keaktifan: 75% (3/4 Sesi)</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Sesi / Pertemuan</th>
                  <th class="py-2.5 px-3">Tanggal Latihan</th>
                  <th class="py-2.5 px-3 text-center">Status Kehadiran</th>
                  <th class="py-2.5 px-3 text-right">Dicatat Oleh</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${e.kehadiran.map(k => `
                  <tr>
                    <td class="py-3 px-3 font-bold text-slate-800">${k.sesi}</td>
                    <td class="py-3 px-3 font-mono text-slate-600">${Utils.formatTanggal(k.tanggal)}</td>
                    <td class="py-3 px-3 text-center">
                      <span class="badge ${k.status === 'HADIR' ? 'badge-success' : 'badge-warning'}">
                        ${k.status === 'HADIR' ? '🟢 Hadir' : '🟡 ' + k.status}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-right font-medium text-slate-500">${e.pelatih}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* TAB 4: NILAI ULANGAN, RAPOR ASESMEN & SKL KELULUSAN                */
  /* ------------------------------------------------------------------ */
  function _renderNilaiTab() {
    const s = _getStudent();
    const isKelasAkhir = String(s.kelas || '').includes('9');

    return `
      <div class="space-y-6">
        
        <!-- Header Nilai & Asesmen -->
        <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-blue-500">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl flex-shrink-0">
                📊
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-black tracking-tight">Lembar Capaian Asesmen &amp; Rapor Nilai</h3>
                <p class="text-xs text-blue-100 mt-0.5">Penilaian Kurikulum Merdeka (Formatif &amp; Sumatif Lingkup Materi).</p>
              </div>
            </div>
            <button type="button" onclick="SiswaHome.cetakRaporPDF()" class="px-4 py-2 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer">
              <span>🖨️</span> <span>Cetak Rapor (A4)</span>
            </button>
          </div>
        </div>

        <!-- Tabel Capaian Nilai Pembelajaran -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Rekap Nilai Mata Pelajaran
              </h4>
              <p class="text-[11px] text-slate-500">Standar Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)</p>
            </div>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              Rata-rata: 88.3
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">No</th>
                  <th class="py-2.5 px-3">Mata Pelajaran</th>
                  <th class="py-2.5 px-3 text-center">KKTP</th>
                  <th class="py-2.5 px-3 text-center">Nilai Akhir</th>
                  <th class="py-2.5 px-3 text-center">Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${_demoData.nilaiMapel.map((n, i) => `
                  <tr>
                    <td class="py-3 px-3 text-slate-400 font-mono">${i + 1}</td>
                    <td class="py-3 px-3 font-bold text-slate-800">${n.mapel}</td>
                    <td class="py-3 px-3 text-center font-mono text-slate-500">${n.kktp}</td>
                    <td class="py-3 px-3 text-center font-mono font-black text-sm text-brand-600">${n.nilai}</td>
                    <td class="py-3 px-3 text-center">
                      <span class="badge badge-success text-[10px]">
                        ✓ ${n.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- MODUL PENGUMUMAN KELULUSAN SKL ONLINE (AMPLOP DIGITAL) -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">🎓</span>
              <div>
                <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  Surat Keterangan Lulus (SKL) Resmi
                </h4>
                <p class="text-[11px] text-slate-500">Layanan pengumuman kelulusan digital peserta didik</p>
              </div>
            </div>
            <span class="badge badge-info text-[10px]">Standar Dinas A4</span>
          </div>

          <!-- Amplop Digital Interaktif -->
          <div class="bg-gradient-to-b from-slate-50 to-amber-50/40 p-6 rounded-2xl border border-amber-200/60 text-center space-y-3">
            
            <div id="area-amplop-tertutup" class="${_isAmplopTerbuka ? 'hidden' : 'block'} space-y-3">
              <div class="w-20 h-20 mx-auto rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-4xl shadow-md shadow-amber-200/50">
                ✉️
              </div>
              <h5 class="text-base font-bold text-slate-900">Amplop Digital Kelulusan</h5>
              <p class="text-xs text-slate-500 max-w-sm mx-auto">
                Silakan ketuk tombol di bawah untuk membuka amplop hasil pengumuman kelulusan resmi Anda.
              </p>
              <button type="button" onclick="SiswaHome.bukaAmplop()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-amber-300 transition cursor-pointer">
                Buka Amplop Kelulusan
              </button>
            </div>

            <div id="area-amplop-terbuka" class="${_isAmplopTerbuka ? 'block' : 'hidden'} space-y-3">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl shadow-sm">
                🎉
              </div>
              <span class="badge badge-success text-xs px-3 py-1 font-bold">STATUS: LULUS MEMUASKAN</span>
              <h5 class="text-lg font-black text-slate-900">Selamat! Anda Dinyatakan LULUS</h5>
              <p class="text-xs text-slate-500 font-mono">No. SKL: 421.3/SKL-SMPN35/2026/042</p>

              <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onclick="SiswaHome.cetakSklPDF()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition flex items-center gap-2 cursor-pointer">
                  <span>📄</span> <span>Cetak Surat Keterangan Lulus (A4)</span>
                </button>
                <button type="button" onclick="SiswaHome.tutupAmplop()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer">
                  Tutup Amplop
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* TAB 5: PROFIL PRIBADI, WA ORTU & BUKU SAKU DISIPLIN               */
  /* ------------------------------------------------------------------ */
  function _renderProfilTab() {
    const s = _getStudent();

    return `
      <div class="space-y-6">
        
        <!-- Header Profil -->
        <div class="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-700">
          <div class="flex items-center gap-3.5">
            <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold flex-shrink-0">
              👤
            </div>
            <div>
              <h3 class="text-lg font-black tracking-tight">${Utils.sanitize(s.nama)}</h3>
              <p class="text-xs text-slate-300 font-mono mt-0.5">
                NISN: ${Utils.sanitize(s.nisn)} • Kelas ${Utils.sanitize(s.kelas)}
              </p>
            </div>
          </div>
        </div>

        <!-- Form Edit Mandiri Nomor HP / WhatsApp Orang Tua -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Kontak WhatsApp Orang Tua / Wali
              </h4>
              <p class="text-[11px] text-slate-500">Digunakan untuk menerima notifikasi pengingat 7 Kebiasaan &amp; informasi sekolah</p>
            </div>
            <span class="badge badge-info text-[10px]">Update Mandiri</span>
          </div>

          <form onsubmit="SiswaHome.handleSimpanWa(event)" class="space-y-3">
            <div>
              <label class="input-label text-xs font-bold text-slate-700">Nomor WhatsApp Orang Tua</label>
              <div class="flex items-center gap-2 mt-1">
                <input type="tel" id="input-wa-ortu" value="${Utils.sanitize(s.noWa || '081234567890')}" placeholder="Contoh: 081234567890" class="input-field text-xs font-mono font-bold" required>
                <button type="submit" class="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition flex-shrink-0 shadow-xs cursor-pointer">
                  Simpan Kontak
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Buku Saku Catatan Disiplin & Tata Tertib Siswa -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Buku Saku Catatan Kedisiplinan Siswa
              </h4>
              <p class="text-[11px] text-slate-500">Transparansi poin tata tertib dan riwayat pembinaan</p>
            </div>
            <span class="badge badge-success text-[10px]">Status: Sangat Baik</span>
          </div>

          <!-- Indikator Ambang Poin SP -->
          <div class="grid grid-cols-4 gap-2 text-center text-xs">
            <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span class="text-[10px] text-emerald-600 font-bold block">POIN SAYA</span>
              <span class="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">0</span>
              <span class="text-[9px] text-emerald-600 font-bold block">🟢 Sangat Baik</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400">
              <span class="text-[10px] font-bold block">AMBANG SP-1</span>
              <span class="text-lg font-black font-mono mt-0.5 block">30</span>
              <span class="text-[9px] block">Peringatan 1</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400">
              <span class="text-[10px] font-bold block">AMBANG SP-2</span>
              <span class="text-lg font-black font-mono mt-0.5 block">60</span>
              <span class="text-[9px] block">Peringatan 2</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400">
              <span class="text-[10px] font-bold block">AMBANG SP-3</span>
              <span class="text-lg font-black font-mono mt-0.5 block">90</span>
              <span class="text-[9px] block">Panggilan BK</span>
            </div>
          </div>

          <!-- Riwayat Pelanggaran -->
          <div class="pt-2">
            <p class="text-xs text-slate-500 italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              🎉 Luar biasa! Tidak ada catatan pelanggaran tata tertib tercatat atas nama Anda.
            </p>
          </div>
        </div>

        <!-- Ganti PIN Akun Siswa -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
          <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Keamanan Akun &amp; Ganti PIN
          </h4>
          <form onsubmit="SiswaHome.handleGantiPin(event)" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="input-label text-xs font-bold text-slate-700">PIN Baru (4-6 Digit)</label>
                <input type="password" id="input-pin-baru" maxlength="6" placeholder="Contoh: 5678" class="input-field text-xs font-mono font-bold" required>
              </div>
              <div>
                <label class="input-label text-xs font-bold text-slate-700">Konfirmasi PIN Baru</label>
                <input type="password" id="input-pin-konfirmasi" maxlength="6" placeholder="Ulangi PIN baru" class="input-field text-xs font-mono font-bold" required>
              </div>
            </div>
            <button type="submit" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer">
              Perbarui PIN Login
            </button>
          </form>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Main Layout Render Siswa                                            */
  /* ------------------------------------------------------------------ */
  function render(params = {}) {
    if (params.tab) {
      _activeTab = params.tab;
    }

    const root = document.getElementById('app-root');
    if (!root) return;

    let tabContent = '';
    if (_activeTab === 'karakter') tabContent = _renderKarakterTab();
    else if (_activeTab === 'ekskul') tabContent = _renderEkskulTab();
    else if (_activeTab === 'nilai') tabContent = _renderNilaiTab();
    else if (_activeTab === 'profil') tabContent = _renderProfilTab();
    else tabContent = _renderHomeTab();

    root.innerHTML = `
      <div class="min-h-screen bg-slate-50/70 pb-24 page-transition">
        ${_renderStudentHeader()}
        <main class="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
          ${tabContent}
        </main>
      </div>
    `;

    // Render BottomNav
    if (window.BottomNav) {
      window.BottomNav.render(_activeTab);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------------ */
  /* Tab Switcher                                                       */
  /* ------------------------------------------------------------------ */
  function switchTab(tab) {
    _activeTab = tab;
    render({ tab });
  }

  /* ------------------------------------------------------------------ */
  /* Kamera Live & Canvas Watermark Logic                               */
  /* ------------------------------------------------------------------ */
  function handleCameraCapture(e) {
    const file = e.target.files[0];
    if (!file) return;

    const s = _getStudent();
    const reader = new FileReader();

    reader.onload = function (evt) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.getElementById('watermarkCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Kompresi skala proporsional (maks 400px lebar)
        const maxWidth = 400;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = Math.round(img.height * scale);

        // Gambar foto asli
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Waktu & Tanggal
        const now = new Date();
        const tglStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const jamStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

        // Background stempel banner hitam transparan di bawah foto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height - 48, canvas.width, 48);

        // Baris 1: Nama & NISN (Kuning Amber)
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
        ctx.fillText(`👤 ${s.nama} (${s.nisn})`, 10, canvas.height - 28);

        // Baris 2: Tanggal & Waktu (Putih)
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Plus Jakarta Sans, sans-serif';
        ctx.fillText(`📅 ${tglStr} • ⏰ ${jamStr} • LIVE CAMERA`, 10, canvas.height - 12);

        // Export compressed JPEG base64 (~20 KB)
        _capturedWatermarkBase64 = canvas.toDataURL('image/jpeg', 0.6);

        const previewArea = document.getElementById('previewWatermarkArea');
        if (previewArea) previewArea.classList.remove('hidden');

        const camText = document.getElementById('cameraStatusText');
        if (camText) {
          camText.innerText = "✓ Foto berhasil dicap watermark nama & waktu presisi.";
          camText.className = "text-[11px] text-emerald-600 font-bold mt-0.5";
        }

        if (window.Toast) {
          window.Toast.success('Foto berhasil dicap watermark otomatis!');
        }
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ------------------------------------------------------------------ */
  /* Quick Helper: Pilih Semua Shalat                                   */
  /* ------------------------------------------------------------------ */
  function pilihSemuaShalat() {
    ['sh-subuh', 'sh-dzuhur', 'sh-ashar', 'sh-maghrib', 'sh-isya'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = true;
    });
    if (window.Toast) window.Toast.info('5 Waktu Shalat telah dicentang.');
  }

  /* ------------------------------------------------------------------ */
  /* Submit Jurnal 7 Kebiasaan                                          */
  /* ------------------------------------------------------------------ */
  async function handleKirimJurnal(e) {
    e.preventDefault();
    if (!_capturedWatermarkBase64) {
      if (window.Modal?.show) {
        window.Modal.show({
          title: '📸 Foto Bukti Wajib',
          body: 'Mohon buka kamera HP untuk mengambil foto bukti pembiasaan hari ini dengan stempel watermark otomatis.',
          confirmText: 'Buka Kamera Sekarang',
          onConfirm: () => {
            document.getElementById('cameraInput')?.click();
          }
        });
      } else {
        alert('Mohon ambil foto bukti melalui kamera HP.');
      }
      return;
    }

    const payload = {
      action: 'simpanLogKebiasaan',
      nisn: _getStudent().nisn,
      nama: _getStudent().nama,
      kelas: _getStudent().kelas,
      tanggal: new Date().toISOString().split('T')[0],
      bangunPagi: document.getElementById('input7k-bangun')?.value || '04:30',
      olahraga: document.getElementById('input7k-olahraga')?.value || 'Ya',
      makanSehat: document.getElementById('input7k-makan')?.value || 'Ya',
      gemarBelajar: document.getElementById('input7k-belajar')?.value || 'Membaca',
      gotongRoyong: document.getElementById('input7k-gotong')?.value || 'Membantu Ortu',
      tidurMalam: document.getElementById('input7k-tidur')?.value || '21:30',
      fotoBase64: _capturedWatermarkBase64
    };

    if (window.App?.showLoading) window.App.showLoading('Mengirim jurnal pembiasaan ke Google Sheets...');
    try {
      if (window.API?.isConnected?.()) {
        await window.API.post('simpanLogKebiasaan', payload);
      }
      _demoData.jurnal7K.unshift({
        tanggal: payload.tanggal,
        bangunPagi: payload.bangunPagi,
        ibadah: '5 Waktu Lengkap',
        olahraga: payload.olahraga,
        makanSehat: payload.makanSehat,
        gemarBelajar: payload.gemarBelajar,
        gotongRoyong: payload.gotongRoyong,
        tidurMalam: payload.tidurMalam,
        status: 'PENDING',
        catatanGuru: 'Terkirim, menunggu verifikasi Guru Wali'
      });

      if (window.Toast) window.Toast.success('Jurnal 7 Kebiasaan berhasil dikirim!');
      switchTab('karakter');
    } catch (err) {
      console.warn('Simpan jurnal:', err);
    } finally {
      if (window.App?.hideLoading) window.App.hideLoading();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Amplop Kelulusan                                                   */
  /* ------------------------------------------------------------------ */
  function bukaAmplop() {
    _isAmplopTerbuka = true;
    const tertutup = document.getElementById('area-amplop-tertutup');
    const terbuka = document.getElementById('area-amplop-terbuka');
    if (tertutup) tertutup.classList.add('hidden');
    if (terbuka) terbuka.classList.remove('hidden');
    if (window.Toast) window.Toast.success('Amplop kelulusan berhasil dibuka!');
  }

  function tutupAmplop() {
    _isAmplopTerbuka = false;
    const tertutup = document.getElementById('area-amplop-tertutup');
    const terbuka = document.getElementById('area-amplop-terbuka');
    if (tertutup) tertutup.classList.remove('hidden');
    if (terbuka) terbuka.classList.add('hidden');
  }

  /* ------------------------------------------------------------------ */
  /* Cetak Rapor & SKL Resmi PDF A4                                     */
  /* ------------------------------------------------------------------ */
  function cetakRaporPDF() {
    const s = _getStudent();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lembar Capaian Asesmen - ${Utils.sanitize(s.nama)}</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; padding: 25px; color: #1e293b; }
          .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 20px; }
          .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
          .header p { margin: 3px 0; font-size: 12px; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #94a3b8; padding: 8px 10px; }
          th { background: #f1f5f9; text-transform: uppercase; }
          .sign-area { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PEMERINTAH KABUPATEN / DINAS PENDIDIKAN</h2>
          <h2>SMP NEGERI INDONESIA HEBAT</h2>
          <p>Jl. Pendidikan No. 35, Telp: (021) 12345678, Kode Pos: 12345</p>
        </div>
        <h3 style="text-align:center; font-size: 14px; margin-bottom: 15px;">LEMBAR LAPORAN CAPAIAN ASESMEN SISWA</h3>
        <p style="font-size: 12px;"><strong>Nama Siswa:</strong> ${Utils.sanitize(s.nama)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>NISN:</strong> ${Utils.sanitize(s.nisn)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Kelas:</strong> ${Utils.sanitize(s.kelas)}</p>
        <table>
          <thead>
            <tr><th>No</th><th>Mata Pelajaran</th><th style="text-align:center;">KKTP</th><th style="text-align:center;">Nilai</th><th style="text-align:center;">Keterangan</th></tr>
          </thead>
          <tbody>
            ${_demoData.nilaiMapel.map((m, i) => `
              <tr><td style="text-align:center;">${i + 1}</td><td>${m.mapel}</td><td style="text-align:center;">${m.kktp}</td><td style="text-align:center; font-weight:bold;">${m.nilai}</td><td style="text-align:center;">TUNTAS</td></tr>
            `).join('')}
          </tbody>
        </table>
        <div class="sign-area">
          <div><p>Orang Tua / Wali,</p><br><br><br><p>( .................................................... )</p></div>
          <div style="text-align:right;"><p>Wali Kelas,</p><br><br><br><p><b>${Utils.sanitize(s.waliKelas || 'Budi Santoso, S.Pd.')}</b><br>NIP. 198501012010011001</p></div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  function cetakSklPDF() {
    const s = _getStudent();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Keterangan Lulus (SKL) - ${Utils.sanitize(s.nama)}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 30px; color: #000; line-height: 1.6; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 25px; }
          .kop h2 { margin: 0; font-size: 18px; text-transform: uppercase; font-weight: bold; }
          .kop h3 { margin: 0; font-size: 16px; text-transform: uppercase; font-weight: bold; }
          .kop p { margin: 2px 0; font-size: 12px; }
          .judul { text-align: center; margin-bottom: 20px; }
          .judul h4 { margin: 0; text-decoration: underline; font-size: 16px; }
          table { width: 100%; margin: 15px 0; font-size: 13px; }
          .sign { margin-top: 40px; float: right; text-align: left; font-size: 13px; width: 250px; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>PEMERINTAH KABUPATEN / KOTA</h2>
          <h3>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
          <h2>SMP NEGERI INDONESIA HEBAT</h2>
          <p>Jl. Pendidikan No. 35, Telp: (021) 12345678, Website: smpn.sch.id</p>
        </div>
        <div class="judul">
          <h4>SURAT KETERANGAN LULUS (SKL)</h4>
          <p style="font-size:12px; margin-top:3px;">Nomor: 421.3/SKL-SMPN35/2026/042</p>
        </div>
        <p style="font-size: 13px;">Kepala SMP Negeri Indonesia Hebat menerangkan bahwa:</p>
        <table>
          <tr><td width="30%">Nama Peserta Didik</td><td>: <b>${Utils.sanitize(s.nama)}</b></td></tr>
          <tr><td>Nomor Induk Siswa Nasional</td><td>: <b>${Utils.sanitize(s.nisn)}</b></td></tr>
          <tr><td>Kelas / Rombongan Belajar</td><td>: <b>${Utils.sanitize(s.kelas)}</b></td></tr>
          <tr><td>Status Kelulusan</td><td>: <b style="color: #059669; font-size: 15px;">L U L U S</b></td></tr>
        </table>
        <p style="font-size: 13px;">Surat keterangan ini berlaku sah sebagai pengganti ijazah sementara sampai dengan diterbitkannya ijazah resmi.</p>
        <div class="sign">
          <p>Jakarta, 19 November 2026<br>Kepala Sekolah,</p>
          <br><br><br>
          <p><b>Dr. H. Ahmad Dahlan, M.Pd.</b><br>NIP. 19700101 199503 1 001</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  /* ------------------------------------------------------------------ */
  /* Simpan Mandiri Kontak & PIN                                        */
  /* ------------------------------------------------------------------ */
  function handleSimpanWa(e) {
    e.preventDefault();
    const val = document.getElementById('input-wa-ortu')?.value?.trim();
    if (!val) return;
    const s = _getStudent();
    s.noWa = val;
    if (window.Toast) window.Toast.success('Nomor WhatsApp orang tua berhasil diperbarui!');
  }

  function handleGantiPin(e) {
    e.preventDefault();
    const p1 = document.getElementById('input-pin-baru')?.value?.trim();
    const p2 = document.getElementById('input-pin-konfirmasi')?.value?.trim();
    if (p1 !== p2) {
      if (window.Toast) window.Toast.error('Konfirmasi PIN tidak cocok!');
      return;
    }
    const s = _getStudent();
    s.pin = p1;
    if (window.Toast) window.Toast.success('PIN login Anda berhasil diperbarui!');
    document.getElementById('input-pin-baru').value = '';
    document.getElementById('input-pin-konfirmasi').value = '';
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                         */
  /* ------------------------------------------------------------------ */
  return {
    render,
    switchTab,
    handleCameraCapture,
    pilihSemuaShalat,
    handleKirimJurnal,
    bukaAmplop,
    tutupAmplop,
    cetakRaporPDF,
    cetakSklPDF,
    handleSimpanWa,
    handleGantiPin
  };
})();

window.SiswaHome = SiswaHome;
