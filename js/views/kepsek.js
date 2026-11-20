/**
 * kepsek.js — Portal Khusus Kepala Sekolah (Executive Command Center)
 * Super App Sekolah Terpadu — Fase 5
 *
 * Mengelola 4 Tab Utama Pimpinan:
 * 1. statistik  : Dashboard Eksekutif Makro, Indikator Kunci & Ringkasan Sekolah
 * 2. kehadiran  : Monitoring Presensi KBM Seluruh Rombel & Rekap Absensi Walas
 * 3. karakter   : Monitoring Kepatuhan 7 Kebiasaan Siswa & Kinerja Guru Wali
 * 4. ketertiban : Monitoring Ketertiban Sekolah, Kasus SP & Tindak Lanjut BK
 */

const KepsekHome = (() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* State Internal Kepsek                                              */
  /* ------------------------------------------------------------------ */
  let _activeTab = 'statistik';

  // Demo Rekapitulasi Rombel Sekolah (Kelas 7, 8, 9)
  const _demoRekapRombel = [
    { rombel: '7-A', walas: 'Dra. Sri Wahyuni', total: 32, hadir: 31, sakit: 1, izin: 0, alpha: 0, persen: '96.9%', statusAbsen: 'Sudah Absen' },
    { rombel: '7-B', walas: 'Ahmad Fauzi, S.Pd.', total: 32, hadir: 32, sakit: 0, izin: 0, alpha: 0, persen: '100%', statusAbsen: 'Sudah Absen' },
    { rombel: '7-C', walas: 'Dewi Lestari, S.Pd.', total: 32, hadir: 30, sakit: 1, izin: 1, alpha: 0, persen: '93.8%', statusAbsen: 'Sudah Absen' },
    { rombel: '8-A', walas: 'Budi Santoso, S.Pd.', total: 32, hadir: 31, sakit: 1, izin: 0, alpha: 0, persen: '96.8%', statusAbsen: 'Sudah Absen' },
    { rombel: '8-B', walas: 'Nur Hidayah, S.Pd.', total: 32, hadir: 32, sakit: 0, izin: 0, alpha: 0, persen: '100%', statusAbsen: 'Sudah Absen' },
    { rombel: '8-C', walas: 'Rahmat Hidayat, M.Pd.', total: 32, hadir: 29, sakit: 2, izin: 1, alpha: 0, persen: '90.6%', statusAbsen: 'Sudah Absen' },
    { rombel: '9-A', walas: 'Siti Aminah, M.Pd.', total: 32, hadir: 32, sakit: 0, izin: 0, alpha: 0, persen: '100%', statusAbsen: 'Sudah Absen' },
    { rombel: '9-B', walas: 'Bambang Irawan, S.Pd.', total: 32, hadir: 31, sakit: 0, izin: 1, alpha: 0, persen: '96.9%', statusAbsen: 'Sudah Absen' }
  ];

  // Demo Kasus Ketertiban & Peringatan
  const _demoKasusTibum = [
    { nama: 'Bima Arya Wibowo', nisn: '0082345678', kelas: '8-A', poin: 15, statusSp: '🟢 Aman', kasusTerakhir: 'Atribut Dasi (5 Poin)', walas: 'Budi Santoso, S.Pd.' },
    { nama: 'Rian Pratama', nisn: '0071239999', kelas: '9-B', poin: 35, statusSp: '🟡 SP-1 (Tercapai)', kasusTerakhir: 'Terlambat Berulang (10 Poin)', walas: 'Bambang Irawan, S.Pd.' },
    { nama: 'Deni Kurniawan', nisn: '0089991111', kelas: '8-C', poin: 65, statusSp: '🟠 SP-2 (Proses BK)', kasusTerakhir: 'Meninggalkan Kelas (15 Poin)', walas: 'Rahmat Hidayat, M.Pd.' }
  ];

  /* ------------------------------------------------------------------ */
  /* Helper: Ambil Data Kepala Sekolah                                  */
  /* ------------------------------------------------------------------ */
  function _getKepsek() {
    return window.APP_STATE?.currentUser || {
      nama: 'Dr. H. Ahmad Dahlan, M.Pd.',
      nip: '197001011995031001',
      role: 'KEPSEK'
    };
  }

  /* ------------------------------------------------------------------ */
  /* Header Eksekutif Kepala Sekolah                                    */
  /* ------------------------------------------------------------------ */
  function _renderKepsekHeader() {
    const k = _getKepsek();
    return `
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl font-bold shadow-lg shadow-amber-400/20 flex-shrink-0">
            🏫
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold mb-1 border border-amber-400/30">
              <span>Pusat Kendali Eksekutif Sekolah</span>
              <span>•</span>
              <span>Supervisi Pimpinan</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black tracking-tight">${Utils.sanitize(k.nama)}</h2>
            <p class="text-xs text-slate-400 font-mono mt-0.5">
              Kepala SMP Negeri Indonesia Hebat • NIP: ${Utils.sanitize(k.nip || '-')}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button type="button" onclick="KepsekHome.cetakLaporanEksekutif()" class="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer">
            <span>🖨️</span> <span>Cetak Laporan Manajerial</span>
          </button>
          <button type="button" onclick="App.onLogout()" class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer">
            Keluar Sesi
          </button>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Top Tabs Navigation Kepsek                                         */
  /* ------------------------------------------------------------------ */
  function _renderTabs() {
    const tabs = [
      { id: 'statistik', label: '📊 Statistik Eksekutif' },
      { id: 'kehadiran', label: '👥 Monitoring Kehadiran KBM' },
      { id: 'karakter', label: '⭐ Kepatuhan 7 Kebiasaan' },
      { id: 'ketertiban', label: '⚖️ Monitoring Ketertiban & SP' }
    ];

    return `
      <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        ${tabs.map(t => {
          const isActive = t.id === _activeTab;
          return `
            <button
              type="button"
              onclick="KepsekHome.switchTab('${t.id}')"
              class="px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }"
            >
              ${t.label}
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* TAB 1: STATISTIK EKSEKUTIF MAKRO                                   */
  /* ------------------------------------------------------------------ */
  function _renderStatistikTab() {
    return `
      <div class="space-y-6">
        
        <!-- 4 KPI Eksekutif Kunci -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span class="text-xs font-bold text-slate-400 uppercase">Peserta Didik Aktif</span>
            <div class="text-3xl font-black text-slate-900 font-mono mt-1">896</div>
            <span class="text-[11px] text-emerald-600 font-bold">28 Rombel Terdaftar</span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span class="text-xs font-bold text-slate-400 uppercase">Kehadiran KBM Hari Ini</span>
            <div class="text-3xl font-black text-brand-600 font-mono mt-1">97.4%</div>
            <span class="text-[11px] text-slate-500">873 Hadir dari 896 Siswa</span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span class="text-xs font-bold text-slate-400 uppercase">Kepatuhan 7 Kebiasaan</span>
            <div class="text-3xl font-black text-amber-600 font-mono mt-1">84.2%</div>
            <span class="text-[11px] text-amber-700 font-bold">754 Laporan Tervalidasi</span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span class="text-xs font-bold text-slate-400 uppercase">Kondisi Ketertiban</span>
            <div class="text-3xl font-black text-emerald-600 font-mono mt-1">🟢 Sangat Baik</div>
            <span class="text-[11px] text-slate-500">0 Kasus SP-3 (Panggilan Dinas)</span>
          </div>

        </div>

        <!-- Ringkasan Supervisi Akademik & KBM -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              Sebaran Kehadiran KBM Per Jenjang
            </h4>
            <div class="space-y-2 text-xs">
              <div>
                <div class="flex items-center justify-between font-bold mb-1">
                  <span>Kelas 7 (9 Rombel)</span>
                  <span class="text-brand-600">97.8% (282/288 Hadir)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                  <div class="bg-brand-600 h-2 rounded-full" style="width: 97.8%"></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between font-bold mb-1">
                  <span>Kelas 8 (10 Rombel)</span>
                  <span class="text-brand-600">96.5% (309/320 Hadir)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                  <div class="bg-brand-600 h-2 rounded-full" style="width: 96.5%"></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between font-bold mb-1">
                  <span>Kelas 9 (9 Rombel - Tingkat Akhir)</span>
                  <span class="text-emerald-600">98.2% (282/288 Hadir)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                  <div class="bg-emerald-600 h-2 rounded-full" style="width: 98.2%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              Status Ekstrakurikuler &amp; Partisipasi Siswa
            </h4>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="text-slate-400 block text-[10px] font-bold">CABANG EKSKUL AKTIF</span>
                <span class="text-xl font-black text-slate-900 mt-0.5 block">14 Cabang</span>
                <span class="text-[10px] text-emerald-600 font-bold">Semua Didampingi Pelatih</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="text-slate-400 block text-[10px] font-bold">PARTISIPASI SISWA</span>
                <span class="text-xl font-black text-brand-600 mt-0.5 block">87.2%</span>
                <span class="text-[10px] text-slate-500">782 Siswa Terdaftar</span>
              </div>
            </div>
            <p class="text-[11px] text-slate-500 leading-relaxed">
              *Evaluasi: Cabang Futsal, Pramuka, PMR, dan Paskibra memiliki keaktifan kehadiran latihan tertinggi di atas 90%.
            </p>
          </div>

        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* TAB 2: MONITORING KEHADIRAN KBM PER ROMBEL                         */
  /* ------------------------------------------------------------------ */
  function _renderKehadiranTab() {
    return `
      <div class="space-y-5">
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Rekapitulasi Presensi KBM Seluruh Rombel
              </h4>
              <p class="text-[11px] text-slate-500">Pemantauan real-time kedisiplinan pengisian absensi kelas oleh Wali Kelas</p>
            </div>
            <button type="button" onclick="KepsekHome.cetakRekapKehadiranBulanan()" class="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer">
              <span>🖨️</span> <span>Cetak Rekap Bulanan (A4)</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Rombel</th>
                  <th class="py-2.5 px-3">Wali Kelas</th>
                  <th class="py-2.5 px-3 text-center">Total Siswa</th>
                  <th class="py-2.5 px-3 text-center">Hadir</th>
                  <th class="py-2.5 px-3 text-center">Sakit</th>
                  <th class="py-2.5 px-3 text-center">Izin</th>
                  <th class="py-2.5 px-3 text-center">% Hadir</th>
                  <th class="py-2.5 px-3 text-right">Status Absen</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${_demoRekapRombel.map(r => `
                  <tr>
                    <td class="py-3 px-3 font-mono font-bold text-slate-900">${r.rombel}</td>
                    <td class="py-3 px-3 font-medium text-slate-800">${r.walas}</td>
                    <td class="py-3 px-3 text-center font-mono">${r.total}</td>
                    <td class="py-3 px-3 text-center font-mono font-bold text-emerald-600">${r.hadir}</td>
                    <td class="py-3 px-3 text-center font-mono text-blue-600">${r.sakit}</td>
                    <td class="py-3 px-3 text-center font-mono text-amber-600">${r.izin}</td>
                    <td class="py-3 px-3 text-center font-mono font-black text-brand-600">${r.persen}</td>
                    <td class="py-3 px-3 text-right">
                      <span class="badge badge-success text-[10px]">✓ ${r.statusAbsen}</span>
                    </td>
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
  /* TAB 3: KEPATUHAN 7 KEBIASAAN KARAKTER                               */
  /* ------------------------------------------------------------------ */
  function _renderKarakterTab() {
    return `
      <div class="space-y-5">
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              Monitoring Kepatuhan Pembiasaan Karakter Siswa (7 Kebiasaan)
            </h4>
            <p class="text-[11px] text-slate-500">Evaluasi pelaksanaan program 7 Kebiasaan Anak Indonesia Hebat tingkat sekolah</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span class="text-amber-800 font-bold block">1. Bangun Pagi (&le; 05:00)</span>
              <div class="text-2xl font-black text-amber-900 font-mono mt-1">91.4%</div>
              <span class="text-[10px] text-amber-700">819 Siswa Konsisten</span>
            </div>

            <div class="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <span class="text-blue-800 font-bold block">2. Ibadah 5 Waktu</span>
              <div class="text-2xl font-black text-blue-900 font-mono mt-1">88.6%</div>
              <span class="text-[10px] text-blue-700">794 Siswa Lengkap</span>
            </div>

            <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span class="text-emerald-800 font-bold block">3. Olahraga &amp; Kebugaran</span>
              <div class="text-2xl font-black text-emerald-900 font-mono mt-1">79.2%</div>
              <span class="text-[10px] text-emerald-700">709 Siswa Berolahraga</span>
            </div>
          </div>

          <div class="pt-2">
            <h5 class="text-xs font-bold text-slate-700 mb-2">Rombel Paling Tertib Pelaporan Karakter:</h5>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span class="font-bold">🥇 Kelas 8-A</span>
                <span class="badge badge-success text-[10px]">96.8% Lapor</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span class="font-bold">🥈 Kelas 9-A</span>
                <span class="badge badge-success text-[10px]">94.2% Lapor</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span class="font-bold">🥉 Kelas 7-B</span>
                <span class="badge badge-success text-[10px]">92.5% Lapor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* TAB 4: MONITORING KETERTIBAN & KASUS SP                             */
  /* ------------------------------------------------------------------ */
  function _renderKetertibanTab() {
    return `
      <div class="space-y-5">
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Buku Kasus Kedisiplinan &amp; Siswa Mendekati Ambang SP
              </h4>
              <p class="text-[11px] text-slate-500">Supervisi tindak lanjut bimbingan konseling dan pemanggilan orang tua</p>
            </div>
            <button type="button" onclick="KepsekHome.cetakLaporanKetertiban()" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer">
              <span>🖨️</span> <span>Cetak Laporan Disiplin (A4)</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Nama Siswa</th>
                  <th class="py-2.5 px-3">Kelas</th>
                  <th class="py-2.5 px-3">Wali Kelas</th>
                  <th class="py-2.5 px-3 text-center">Akumulasi Poin</th>
                  <th class="py-2.5 px-3 text-center">Status Pembinaan</th>
                  <th class="py-2.5 px-3">Catatan Kasus Terakhir</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${_demoKasusTibum.map(k => `
                  <tr>
                    <td class="py-3 px-3 font-bold text-slate-800">${k.nama}</td>
                    <td class="py-3 px-3 font-mono">${k.kelas}</td>
                    <td class="py-3 px-3 text-slate-600">${k.walas}</td>
                    <td class="py-3 px-3 text-center font-mono font-black ${k.poin >= 30 ? 'text-rose-600' : 'text-slate-800'}">${k.poin} Poin</td>
                    <td class="py-3 px-3 text-center">
                      <span class="badge ${k.poin >= 60 ? 'badge-danger' : k.poin >= 30 ? 'badge-warning' : 'badge-success'} text-[10px]">
                        ${k.statusSp}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-slate-500">${k.kasusTerakhir}</td>
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
  /* Main Layout Render Kepsek                                          */
  /* ------------------------------------------------------------------ */
  function render(params = {}) {
    if (params.tab) {
      _activeTab = params.tab;
    }

    const root = document.getElementById('app-root');
    if (!root) return;

    let bodyHtml = '';
    if (_activeTab === 'kehadiran') bodyHtml = _renderKehadiranTab();
    else if (_activeTab === 'karakter') bodyHtml = _renderKarakterTab();
    else if (_activeTab === 'ketertiban') bodyHtml = _renderKetertibanTab();
    else bodyHtml = _renderStatistikTab();

    root.innerHTML = `
      <div class="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 page-transition">
        <div class="max-w-6xl mx-auto space-y-6">
          ${_renderKepsekHeader()}
          ${_renderTabs()}
          ${bodyHtml}
        </div>
      </div>
    `;

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
  /* Cetak Dokumen Kedinasan Kepala Sekolah                             */
  /* ------------------------------------------------------------------ */
  function cetakLaporanEksekutif() {
    const k = _getKepsek();
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Manajerial Kepala Sekolah</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 30px; color: #000; line-height: 1.5; font-size: 13px; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
          .kop h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
          .kop p { margin: 2px 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
          th { background: #eee; }
          .sign { margin-top: 40px; float: right; width: 250px; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>PEMERINTAH KABUPATEN / KOTA</h2>
          <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
          <h2>SMP NEGERI INDONESIA HEBAT</h2>
          <p>Jl. Pendidikan No. 35, Telp: (021) 12345678</p>
        </div>
        <h3 style="text-align:center; margin-bottom: 5px;">LAPORAN MANAJERIAL &amp; SUPERVISI MUTU SEKOLAH</h3>
        <p style="text-align:center; margin-top:0;">Periode: Semester Ganjil TA 2026/2027</p>
        <p>Ringkasan Indikator Kunci:</p>
        <ul>
          <li>Total Siswa: 896 Peserta Didik (28 Rombel)</li>
          <li>Rata-rata Kehadiran KBM: 97.4%</li>
          <li>Kepatuhan 7 Kebiasaan Anak Hebat: 84.2%</li>
          <li>Ketertiban &amp; Disiplin: Kategori Sangat Baik (0 Kasus SP-3)</li>
        </ul>
        <div class="sign">
          <p>Jakarta, 20 November 2026<br>Kepala Sekolah,</p>
          <br><br><br>
          <p><b>${k.nama}</b><br>NIP. ${k.nip}</p>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  function cetakRekapKehadiranBulanan() {
    cetakLaporanEksekutif();
  }

  function cetakLaporanKetertiban() {
    cetakLaporanEksekutif();
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                         */
  /* ------------------------------------------------------------------ */
  return {
    render,
    switchTab,
    cetakLaporanEksekutif,
    cetakRekapKehadiranBulanan,
    cetakLaporanKetertiban
  };
})();

window.KepsekHome = KepsekHome;
