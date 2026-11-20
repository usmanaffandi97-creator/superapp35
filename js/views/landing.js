/**
 * landing.js — Beranda Publik, Showcase Layanan & Pintu Masuk Terpadu
 * Super App Sekolah Terpadu — Fase 2
 *
 * Mendukung:
 * - Pintu masuk cerdas 2 kartu utama (Siswa & Guru) + akses Kepsek & Admin
 * - Fitur Uji Coba Cepat / Akun Demo (1-Click Quick Fill)
 * - Modal login interaktif dengan auto-detection tipe pengguna
 * - Countdown kelulusan kondisional & Ticker pengumuman sekolah
 * - Showcase 6 pilar layanan ekosistem sekolah
 */

const Landing = (() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Internal State                                                     */
  /* ------------------------------------------------------------------ */
  let _activeLoginTab = 'siswa'; // 'siswa' | 'guru' | 'kepsek' | 'admin'
  let _countdownTimer = null;

  /* ------------------------------------------------------------------ */
  /* Countdown Helpers                                                  */
  /* ------------------------------------------------------------------ */
  function _hariKelulusan() {
    const s = window.APP_STATE?.sekolah || {};
    if (!s.tanggalRilisKelulusan) return null;
    const now = new Date();
    const target = new Date(s.tanggalRilisKelulusan);
    const diff = target - now;
    return { target, diffMs: diff, days: Math.ceil(diff / 86400000) };
  }

  function _shouldShowCountdown() {
    const s = window.APP_STATE?.sekolah || {};
    if (s.statusRilisKelulusan && s.statusRilisKelulusan !== 'TERKUNCI') return true;
    const info = _hariKelulusan();
    return info && info.days <= 14 && info.diffMs > 0;
  }

  function _countdownHTML() {
    if (!_shouldShowCountdown()) return '';
    const info = _hariKelulusan();
    if (!info || info.diffMs <= 0) return '';

    const totalSec = Math.floor(info.diffMs / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    return `
      <div id="countdown-banner" class="w-full bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-600 text-white rounded-2xl p-4 shadow-md mb-6 border border-white/20">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-xl">
              🎓
            </div>
            <div>
              <p class="text-xs uppercase font-extrabold tracking-wider text-indigo-100">Hitung Mundur Rilis Kelulusan</p>
              <h4 class="text-sm sm:text-base font-bold">Pengumuman Kelulusan &amp; SKL Online</h4>
            </div>
          </div>
          <div class="flex items-center gap-2 font-mono font-black text-lg bg-black/20 px-3.5 py-1.5 rounded-xl border border-white/10" id="countdown-digits">
            <div class="text-center"><span class="block">${String(d).padStart(2,'0')}</span><span class="text-[9px] uppercase font-sans font-medium text-indigo-200">Hari</span></div>
            <span>:</span>
            <div class="text-center"><span class="block">${String(h).padStart(2,'0')}</span><span class="text-[9px] uppercase font-sans font-medium text-indigo-200">Jam</span></div>
            <span>:</span>
            <div class="text-center"><span class="block">${String(m).padStart(2,'0')}</span><span class="text-[9px] uppercase font-sans font-medium text-indigo-200">Mnt</span></div>
            <span>:</span>
            <div class="text-center"><span class="block text-amber-300">${String(s).padStart(2,'0')}</span><span class="text-[9px] uppercase font-sans font-medium text-indigo-200">Dtk</span></div>
          </div>
        </div>
      </div>
    `;
  }

  function _pengumumanHTML() {
    const isi = window.APP_STATE?.sekolah?.pengumuman;
    if (!isi || !isi.trim()) return '';
    return `
      <div class="w-full bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 flex items-start gap-3 text-amber-900 shadow-xs">
        <div class="w-7 h-7 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 text-sm">
          📢
        </div>
        <div class="text-xs sm:text-sm">
          <p class="font-bold mb-0.5">Pengumuman Sekolah Resmi</p>
          <p class="text-amber-800/90 leading-relaxed">${Utils ? Utils.sanitize(isi) : isi}</p>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Main HTML Template                                                 */
  /* ------------------------------------------------------------------ */
  function _buildHTML() {
    const sekolah = window.APP_STATE?.sekolah || {};
    const namaSekolah = sekolah.nama || 'SMP NEGERI INDONESIA HEBAT';
    const instansi = sekolah.instansiPembina || 'Dinas Pendidikan &amp; Kebudayaan';

    return `
      <div class="min-h-screen bg-slate-50/70 pb-16 page-transition">
        
        <!-- ── HERO HEADER ── -->
        <section class="bg-gradient-to-b from-brand-50 via-white to-slate-50/70 border-b border-slate-200/80 pt-8 pb-10 px-4 sm:px-6">
          <div class="max-w-4xl mx-auto text-center">
            
            <!-- School Emblem & Badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-brand-200 text-brand-700 text-xs font-bold shadow-xs mb-4">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>${Utils ? Utils.sanitize(instansi) : instansi}</span>
              <span class="text-slate-300">•</span>
              <span class="text-slate-500 font-medium">TA 2026/2027</span>
            </div>

            <!-- Title -->
            <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              ${Utils ? Utils.sanitize(namaSekolah) : namaSekolah}
            </h1>
            <p class="mt-2.5 text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Portal Sistem Informasi Sekolah Terpadu — Satu ekosistem digital terintegrasi untuk presensi, asesmen nilai, pembiasaan karakter, dan kedisiplinan siswa.
            </p>

            <!-- Quick Stats Pills -->
            <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-5 text-xs text-slate-600">
              <span class="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-2xs">
                <span>🎒</span> <b>Presensi Harian KBM</b>
              </span>
              <span class="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-2xs">
                <span>⚽</span> <b>Presensi Ekskul</b>
              </span>
              <span class="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-2xs">
                <span>📊</span> <b>Rapor Kurikulum Merdeka</b>
              </span>
              <span class="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-2xs">
                <span>⭐</span> <b>7 Kebiasaan Anak Hebat</b>
              </span>
            </div>

          </div>
        </section>

        <!-- ── MAIN CONTENT CONTAINER ── -->
        <main class="max-w-4xl mx-auto px-4 sm:px-6 pt-6">

          ${_countdownHTML()}
          ${_pengumumanHTML()}

          <!-- ── PINTU MASUK UTAMA (2 GATEWAY CARDS) ── -->
          <div class="mb-4">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center sm:text-left">
              PILIH PINTU MASUK ANDA
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              <!-- KARTU 1: SISWA (PESERTA DIDIK) -->
              <div id="card-siswa" role="button" tabindex="0" 
                   class="bg-white rounded-3xl p-6 border-2 border-brand-100 hover:border-brand-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group transform hover:-translate-y-0.5 active:scale-[0.99]">
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-2xl shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
                      🎒
                    </div>
                    <span class="text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
                      Akses Mandiri
                    </span>
                  </div>
                  <h3 class="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition">
                    Peserta Didik (Siswa)
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                    Cek rapor asesmen, riwayat kehadiran KBM &amp; ekskul, pengisian jurnal 7 kebiasaan anak hebat, dan buku saku kedisiplinan Anda.
                  </p>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-brand-600 font-bold text-xs sm:text-sm">
                  <span>Masuk dengan NISN &amp; PIN</span>
                  <div class="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition">
                    →
                  </div>
                </div>
              </div>

              <!-- KARTU 2: GURU & PELATIH -->
              <div id="card-guru" role="button" tabindex="0" 
                   class="bg-white rounded-3xl p-6 border-2 border-indigo-100 hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group transform hover:-translate-y-0.5 active:scale-[0.99]">
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 to-accent-600 text-white flex items-center justify-center text-2xl shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                      👔
                    </div>
                    <span class="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-wider">
                      Akses Tenaga Pendidik
                    </span>
                  </div>
                  <h3 class="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    Guru / Wali Kelas / Pelatih
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                    Presensi kelas kilat, input penilaian Kurikulum Merdeka via paste Excel, validasi karakter, jurnal mengajar, dan buku pelanggaran BK.
                  </p>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-bold text-xs sm:text-sm">
                  <span>Masuk dengan NIP &amp; PIN</span>
                  <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                    →
                  </div>
                </div>
              </div>

            </div>

            <!-- AKSES PINTU PIMPINAN & PENGELOLA (KEPSEK & ADMIN) -->
            <div class="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs font-semibold">
              <span class="text-slate-400">Akses Pimpinan &amp; Pengelola:</span>
              <button id="btn-portal-kepsek" type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50/50 shadow-2xs transition cursor-pointer">
                <span>🏫</span> <b>Portal Kepala Sekolah</b>
              </button>
              <button id="btn-portal-admin" type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-2xs transition cursor-pointer">
                <span>⚙️</span> <b>Administrator Sistem</b>
              </button>
            </div>

          </div>

          <!-- ── QUICK-DEMO BAR (1-CLICK TEST LOGIN) ── -->
          <div class="mt-8 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-2">
                <span class="flex h-2.5 w-2.5 relative">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  Mode Coba Cepat (Akun Demo)
                </h4>
              </div>
              <span class="text-[11px] text-slate-400">Klik salah satu akun untuk langsung masuk tanpa mengetik:</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button type="button" onclick="Landing.quickLogin('siswa')" class="p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100 text-blue-900 border border-blue-200/80 text-left transition flex flex-col cursor-pointer active:scale-95">
                <span class="text-[10px] uppercase font-bold text-blue-600">🎒 Siswa</span>
                <span class="text-xs font-bold truncate">Ahmad Fauzan</span>
                <span class="text-[10px] text-slate-500 font-mono">0081234567</span>
              </button>

              <button type="button" onclick="Landing.quickLogin('guru')" class="p-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 text-left transition flex flex-col cursor-pointer active:scale-95">
                <span class="text-[10px] uppercase font-bold text-indigo-600">👔 Wali Kelas</span>
                <span class="text-xs font-bold truncate">Budi Santoso, S.Pd.</span>
                <span class="text-[10px] text-slate-500 font-mono">19850101...</span>
              </button>

              <button type="button" onclick="Landing.quickLogin('kepsek')" class="p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-left transition flex flex-col cursor-pointer active:scale-95">
                <span class="text-[10px] uppercase font-bold text-amber-700">🏫 Kepala Sekolah</span>
                <span class="text-xs font-bold truncate">Dr. H. Ahmad Dahlan</span>
                <span class="text-[10px] text-slate-500 font-mono">19700101...</span>
              </button>

              <button type="button" onclick="Landing.quickLogin('admin')" class="p-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 text-left transition flex flex-col cursor-pointer active:scale-95">
                <span class="text-[10px] uppercase font-bold text-emerald-700">⚙️ Administrator</span>
                <span class="text-xs font-bold truncate">Admin IT</span>
                <span class="text-[10px] text-slate-500 font-mono">ID: ADMIN</span>
              </button>
            </div>
          </div>

          <!-- ── SHOWCASE 6 LAYANAN SEKOLAH ── -->
          <div class="mt-10">
            <div class="text-center mb-6">
              <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
                Ekosistem Digital Sekolah Terpadu
              </h3>
              <p class="text-xs text-slate-500 mt-1">
                Semua layanan operasional tersinkronisasi otomatis dalam 1 Google Spreadsheet terpusat.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              
              <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                  📅
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Presensi Harian KBM</h4>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Metode exception-based kilat. Semua hadir, hanya sentuh siswa S/I/A/T.</p>
                </div>
              </div>

              <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                  ⚽
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Presensi &amp; Rekap Ekskul</h4>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Pelatih mengisi sesi latihan, wali kelas menerima rekap otomatis untuk rapor.</p>
                </div>
              </div>

              <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                  📊
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Nilai &amp; Leger Kilat</h4>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Paste tabel sekelas dari Excel &lt; 10 detik. Cetak lembar capaian dinas A4.</p>
                </div>
              </div>

              <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                  🎓
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Kelulusan &amp; SKL Online</h4>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Amplop digital hitung mundur serentak + cetak SKL resmi ber-QR Code validasi.</p>
                </div>
              </div>

              <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base flex-shrink-0">
                  ⭐
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">7 Kebiasaan Anak Hebat</h4>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Checklist harian kilat, kamera anti-galeri watermark, dan pengingat WA ortu 1-klik.</p>
                </div>
              </div>

              <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                  ⚖️
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900">Buku Catatan Tata Tertib</h4>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Scan QR kartu pelajar, razia atribut serentak, dan akumulasi poin SP otomatis.</p>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer Minimalis -->
          <footer class="mt-12 text-center text-xs text-slate-400">
            <p>&copy; 2026 ${Utils ? Utils.sanitize(namaSekolah) : namaSekolah}. Ditenagai oleh Google Sheets &amp; Vercel PWA.</p>
          </footer>

        </main>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- MODAL LOGIN INTERAKTIF                                              -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div id="login-modal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm hidden page-transition" role="dialog" aria-modal="true">
        <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-7 relative border border-slate-100">

          <!-- Close Button -->
          <button id="modal-close" type="button" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer" aria-label="Tutup">
            ✕
          </button>

          <!-- Header Modal -->
          <div class="flex items-center gap-3 mb-4">
            <div id="modal-avatar" class="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl flex-shrink-0">
              🎒
            </div>
            <div>
              <h3 id="modal-title-text" class="text-lg font-extrabold text-slate-900">Masuk sebagai Siswa</h3>
              <p id="modal-subtitle" class="text-xs text-slate-500">Masukkan identitas resmi dan PIN Anda</p>
            </div>
          </div>

          <!-- Role Selector Tabs inside Modal -->
          <div class="flex items-center p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold text-slate-600">
            <button type="button" onclick="Landing.switchModalTab('siswa')" id="tab-btn-siswa" class="flex-1 py-1.5 rounded-lg transition text-center cursor-pointer">
              Siswa
            </button>
            <button type="button" onclick="Landing.switchModalTab('guru')" id="tab-btn-guru" class="flex-1 py-1.5 rounded-lg transition text-center cursor-pointer">
              Guru/Staff
            </button>
            <button type="button" onclick="Landing.switchModalTab('kepsek')" id="tab-btn-kepsek" class="flex-1 py-1.5 rounded-lg transition text-center cursor-pointer">
              Kepsek
            </button>
            <button type="button" onclick="Landing.switchModalTab('admin')" id="tab-btn-admin" class="flex-1 py-1.5 rounded-lg transition text-center cursor-pointer">
              Admin
            </button>
          </div>

          <!-- Form Login -->
          <form id="login-form" novalidate autocomplete="off" class="space-y-4">
            
            <!-- ID Input -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="input-id" id="label-id" class="input-label text-xs font-bold text-slate-700">
                  NISN Siswa (10 Digit)
                </label>
                <span id="type-badge" class="badge badge-info text-[10px] hidden">
                  Deteksi: Siswa
                </span>
              </div>
              <input
                id="input-id"
                type="text"
                maxlength="20"
                placeholder="Contoh: 0081234567"
                class="input-field text-sm font-semibold"
                autocomplete="username"
                required
              />
            </div>

            <!-- PIN Input -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="input-pin" class="input-label text-xs font-bold text-slate-700">
                  PIN Akses
                </label>
                <span class="text-[10px] text-slate-400">PIN Bawaan Demo: 1234</span>
              </div>
              <div class="relative">
                <input
                  id="input-pin"
                  type="password"
                  maxlength="10"
                  placeholder="••••"
                  class="input-field text-sm font-semibold pr-10"
                  autocomplete="current-password"
                  required
                />
                <button type="button" id="toggle-pin" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                  👁️
                </button>
              </div>
            </div>

            <!-- Error Banner -->
            <div id="login-error" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span id="login-error-msg">ID atau PIN salah.</span>
            </div>

            <!-- Submit Button -->
            <button type="submit" id="btn-login" class="btn-primary w-full py-3 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-200">
              <span id="btn-login-text">Masuk Sekarang</span>
              <span id="btn-login-spinner" class="hidden">⏳</span>
            </button>

          </form>

        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Countdown Timer Logic                                              */
  /* ------------------------------------------------------------------ */
  function _startCountdown() {
    if (!_shouldShowCountdown()) return;
    if (_countdownTimer) clearInterval(_countdownTimer);

    _countdownTimer = setInterval(() => {
      const info = _hariKelulusan();
      if (!info || info.diffMs <= 0) {
        clearInterval(_countdownTimer);
        const banner = document.getElementById('countdown-banner');
        if (banner) banner.remove();
        return;
      }
      const totalSec = Math.floor((new Date(info.target) - new Date()) / 1000);
      const d = Math.floor(totalSec / 86400);
      const h = Math.floor((totalSec % 86400) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      const el = document.getElementById('countdown-digits');
      if (el) {
        el.innerHTML = `
          <div class="text-center"><span class="block">${String(d).padStart(2,'0')}</span><span class="text-[9px] uppercase font-sans font-medium text-indigo-200">Hari</span></div>
          <span>:</span>
          <div class="text-center"><span class="block">${String(h).padStart(2,'0')}</span><span class="text-[9px] uppercase font-sans font-medium text-indigo-200">Jam</span></div>
          <span>:</span>
          <div class="text-center"><span class="block">${String(m).padStart(2,'0')}</span><span class="text-[9px] uppercase font-sans font-medium text-indigo-200">Mnt</span></div>
          <span>:</span>
          <div class="text-center"><span class="block text-amber-300">${String(s).padStart(2,'0')}</span><span class="text-[9px] uppercase font-sans font-medium text-indigo-200">Dtk</span></div>
        `;
      }
    }, 1000);
  }

  /* ------------------------------------------------------------------ */
  /* Modal Logic & Tabs                                                 */
  /* ------------------------------------------------------------------ */
  function openModal(tab = 'siswa') {
    switchModalTab(tab);
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.remove('hidden');
      _clearError();
      setTimeout(() => {
        document.getElementById('input-id')?.focus();
      }, 100);
    }
  }

  function closeModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.classList.add('hidden');
    _clearError();
  }

  function switchModalTab(tab) {
    _activeLoginTab = tab;
    const avatar = document.getElementById('modal-avatar');
    const titleText = document.getElementById('modal-title-text');
    const subtitle = document.getElementById('modal-subtitle');
    const labelId = document.getElementById('label-id');
    const inputId = document.getElementById('input-id');
    const inputPin = document.getElementById('input-pin');

    // Update Tab Styles
    ['siswa', 'guru', 'kepsek', 'admin'].forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      if (btn) {
        if (t === tab) {
          btn.className = 'flex-1 py-1.5 rounded-lg transition text-center cursor-pointer bg-white text-brand-600 shadow-xs font-bold';
        } else {
          btn.className = 'flex-1 py-1.5 rounded-lg transition text-center cursor-pointer text-slate-500 hover:text-slate-800';
        }
      }
    });

    if (tab === 'siswa') {
      if (avatar) avatar.textContent = '🎒';
      if (titleText) titleText.textContent = 'Masuk sebagai Siswa';
      if (subtitle) subtitle.textContent = 'Gunakan 10 digit NISN & PIN resmi kamu';
      if (labelId) labelId.textContent = 'NISN Siswa (10 Digit)';
      if (inputId) {
        inputId.placeholder = 'Contoh: 0081234567';
        inputId.maxLength = 10;
        inputId.value = '';
      }
      if (inputPin) inputPin.value = '';
    } else if (tab === 'guru') {
      if (avatar) avatar.textContent = '👔';
      if (titleText) titleText.textContent = 'Masuk Guru / Pelatih';
      if (subtitle) subtitle.textContent = 'Gunakan NIP atau ID Pelatih Anda';
      if (labelId) labelId.textContent = 'NIP Guru / Pelatih';
      if (inputId) {
        inputId.placeholder = 'Contoh: 198501012010011001';
        inputId.maxLength = 20;
        inputId.value = '';
      }
      if (inputPin) inputPin.value = '';
    } else if (tab === 'kepsek') {
      if (avatar) avatar.textContent = '🏫';
      if (titleText) titleText.textContent = 'Portal Kepala Sekolah';
      if (subtitle) subtitle.textContent = 'Akses monitoring & supervisi sekolah';
      if (labelId) labelId.textContent = 'NIP Kepala Sekolah';
      if (inputId) {
        inputId.placeholder = 'NIP Kepala Sekolah';
        inputId.maxLength = 20;
        inputId.value = '';
      }
      if (inputPin) inputPin.value = '';
    } else if (tab === 'admin') {
      if (avatar) avatar.textContent = '⚙️';
      if (titleText) titleText.textContent = 'Portal Administrator';
      if (subtitle) subtitle.textContent = 'Akses penuh konfigurasi database & master';
      if (labelId) labelId.textContent = 'ID Administrator';
      if (inputId) {
        inputId.placeholder = 'ADMIN';
        inputId.maxLength = 15;
        inputId.value = 'ADMIN';
      }
      if (inputPin) {
        inputPin.value = '123456';
      }
    }

    _clearError();
  }

  function _showError(msg) {
    const box = document.getElementById('login-error');
    const txt = document.getElementById('login-error-msg');
    if (txt) txt.textContent = msg;
    if (box) box.classList.remove('hidden');
  }

  function _clearError() {
    const box = document.getElementById('login-error');
    if (box) box.classList.add('hidden');
  }

  function _setLoading(loading) {
    const btn = document.getElementById('btn-login');
    const txt = document.getElementById('btn-login-text');
    const spinner = document.getElementById('btn-login-spinner');
    if (btn) btn.disabled = loading;
    if (txt) txt.textContent = loading ? 'Memverifikasi...' : 'Masuk Sekarang';
    if (spinner) spinner.classList.toggle('hidden', !loading);
  }

  /* ------------------------------------------------------------------ */
  /* Live User Type Detection                                           */
  /* ------------------------------------------------------------------ */
  function detectUserType(val) {
    const clean = String(val).trim();
    const badge = document.getElementById('type-badge');
    if (!badge) return;

    if (clean.toUpperCase() === 'ADMIN') {
      badge.textContent = '⚙️ Mode: Admin';
      badge.className = 'badge badge-warning text-[10px]';
      badge.classList.remove('hidden');
    } else if (/^\d{10}$/.test(clean)) {
      badge.textContent = '🎒 Terdeteksi: Siswa (NISN)';
      badge.className = 'badge badge-success text-[10px]';
      badge.classList.remove('hidden');
    } else if (/^\d{12,20}$/.test(clean)) {
      badge.textContent = '👔 Terdeteksi: Guru / Pegawai';
      badge.className = 'badge badge-info text-[10px]';
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  /* ------------------------------------------------------------------ */
  /* Quick Login Helper (1-Click Demo)                                  */
  /* ------------------------------------------------------------------ */
  async function quickLogin(role) {
    let id = '';
    let pin = '1234';

    if (role === 'siswa') {
      id = '0081234567';
      pin = '1234';
    } else if (role === 'guru') {
      id = '198501012010011001';
      pin = '1234';
    } else if (role === 'kepsek') {
      id = '197001011995031001';
      pin = '1234';
    } else if (role === 'admin') {
      id = 'ADMIN';
      pin = '123456';
    }

    if (window.Toast?.info) {
      window.Toast.info(`Mencoba masuk sebagai ${role.toUpperCase()}...`);
    }

    await handleLogin(id, pin);
  }

  /* ------------------------------------------------------------------ */
  /* Login Submission                                                   */
  /* ------------------------------------------------------------------ */
  async function handleLogin(id, pin) {
    _clearError();
    const cleanId = String(id).trim();
    const cleanPin = String(pin).trim();

    if (!cleanId) {
      _showError('ID / NISN / NIP tidak boleh kosong.');
      return;
    }
    if (!cleanPin) {
      _showError('PIN akses tidak boleh kosong.');
      return;
    }

    _setLoading(true);
    try {
      const res = await window.Auth?.login?.(cleanId, cleanPin);
      if (!res || !res.ok) {
        _showError(res?.error || 'Kredensial tidak cocok. Periksa ID & PIN Anda.');
        if (window.Toast?.error) {
          window.Toast.error(res?.error || 'Login gagal');
        }
        return;
      }

      closeModal();
      if (window.Toast?.success) {
        window.Toast.success(`Selamat datang, ${res.user.nama || 'Pengguna'}!`);
      }

      // Update State & Topbar
      window.APP_STATE.currentUser = res.user;
      if (window.App?.updateTopbar) window.App.updateTopbar();

      // Route to destination
      const dest = (res.role || 'landing').toLowerCase();
      window.Router?.go?.(dest);

    } catch (err) {
      console.error('[Landing] login exception:', err);
      _showError('Terjadi kesalahan sistem saat memproses login.');
    } finally {
      _setLoading(false);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Event Bindings                                                     */
  /* ------------------------------------------------------------------ */
  function _bindEvents() {
    // Gateway Cards
    document.getElementById('card-siswa')?.addEventListener('click', () => openModal('siswa'));
    document.getElementById('card-guru')?.addEventListener('click', () => openModal('guru'));
    document.getElementById('btn-portal-kepsek')?.addEventListener('click', () => openModal('kepsek'));
    document.getElementById('btn-portal-admin')?.addEventListener('click', () => openModal('admin'));

    // Modal Close
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
    document.getElementById('login-modal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    // ID Input live detection
    document.getElementById('input-id')?.addEventListener('input', (e) => {
      detectUserType(e.target.value);
      _clearError();
    });

    // PIN Toggle
    document.getElementById('toggle-pin')?.addEventListener('click', () => {
      const pin = document.getElementById('input-pin');
      if (!pin) return;
      pin.type = pin.type === 'password' ? 'text' : 'password';
    });

    // Form Submit
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('input-id')?.value;
      const pin = document.getElementById('input-pin')?.value;
      handleLogin(id, pin);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Public Render                                                      */
  /* ------------------------------------------------------------------ */
  function render() {
    if (_countdownTimer) {
      clearInterval(_countdownTimer);
      _countdownTimer = null;
    }

    const root = document.getElementById('app-root');
    if (!root) {
      console.error('[Landing] Elemen #app-root tidak ditemukan di DOM');
      return;
    }

    root.innerHTML = _buildHTML();
    _bindEvents();
    _startCountdown();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  return {
    render,
    openModal,
    closeModal,
    switchModalTab,
    quickLogin,
    handleLogin,
    detectUserType
  };
})();

window.Landing = Landing;
