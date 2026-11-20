/**
 * admin.js — Portal Master Administrator Sistem (Full Control Center)
 * Super App Sekolah Terpadu — Fase 5
 *
 * Mengelola Master Data & Konfigurasi Lembaga:
 * 1. dashboard  : Status Koneksi Database Google Sheets & Sync 1-Klik
 * 2. siswa      : Master Siswa, Pendaftaran & Manajemen Mutasi (Masuk/Keluar)
 * 3. guru       : Master Tenaga Pendidik, Penugasan Walas & Pelatih Ekskul
 * 4. ekskul     : Master Ekstrakurikuler & Buka/Tutup Pendaftaran
 * 5. pengaturan : Identitas Sekolah, Kop 2 Logo, Jadwal SKL & Ganti PIN
 */

const AdminHome = (() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Internal State                                                     */
  /* ------------------------------------------------------------------ */
  let _activeTab = 'dashboard';

  // Demo Master Data Siswa
  const _demoMasterSiswa = [
    { nisn: '0081234567', nis: '242508001', nama: 'Ahmad Fauzan Pratama', rombel: '8-A', gender: 'L', status: 'AKTIF', noWa: '081234567890' },
    { nisn: '0087654321', nis: '242508002', nama: 'Siti Nurhaliza', rombel: '8-A', gender: 'P', status: 'AKTIF', noWa: '081234567891' },
    { nisn: '0082345678', nis: '242508003', nama: 'Bima Arya Wibowo', rombel: '8-A', gender: 'L', status: 'AKTIF', noWa: '081234567892' },
    { nisn: '0083456789', nis: '242508004', nama: 'Cantika Dewi Lestari', rombel: '8-A', gender: 'P', status: 'AKTIF', noWa: '081234567893' },
    { nisn: '0071112222', nis: '232409015', nama: 'Rian Pratama', rombel: '9-B', gender: 'L', status: 'MUTASI_KELUAR', noWa: '081234567899' }
  ];

  // Demo Master Guru & Staf
  const _demoMasterGuru = [
    { nip: '197001011995031001', nama: 'Dr. H. Ahmad Dahlan, M.Pd.', role: 'KEPSEK', tugas: 'Kepala Sekolah', noWa: '081211223344' },
    { nip: '198501012010011001', nama: 'Budi Santoso, S.Pd.', role: 'GURU', tugas: 'Wali Kelas 8-A / Guru MTK', noWa: '081298765432' },
    { nip: '198803152015022002', nama: 'Siti Aminah, M.Pd.', role: 'GURU', tugas: 'Wali Kelas 9-A / Pembina 7K', noWa: '081277889900' },
    { nip: 'PELATIH-FUTSAL', nama: 'Coach Hendra Gunawan', role: 'PELATIH_EKSKUL', tugas: 'Pelatih Ekskul Futsal', noWa: '081344556677' }
  ];

  /* ------------------------------------------------------------------ */
  /* Header Administrator                                               */
  /* ------------------------------------------------------------------ */
  function _renderAdminHeader() {
    return `
      <div class="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold border border-white/30 flex-shrink-0">
            ⚙️
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-400/30 text-emerald-200 text-[11px] font-bold mb-1 border border-emerald-400/30">
              <span>Super Administrator Portal</span>
              <span>•</span>
              <span>Single Source of Truth</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black tracking-tight">Pusat Kendali Administrator</h2>
            <p class="text-xs text-emerald-200 font-mono mt-0.5">
              Kelola Master Database Siswa, Mutasi, Guru &amp; Pengaturan Sekolah
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button type="button" onclick="App.bukaModalDatabase()" class="px-3.5 py-1.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer">
            <span>🔌</span> <span>Koneksi Sheets</span>
          </button>
          <button type="button" onclick="App.onLogout()" class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer">
            Keluar
          </button>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Top Tabs Navigation Admin                                          */
  /* ------------------------------------------------------------------ */
  function _renderTabs() {
    const tabs = [
      { id: 'dashboard', label: '📊 Dashboard & DB' },
      { id: 'siswa', label: '🧑‍🎓 Master Siswa & Mutasi' },
      { id: 'guru', label: '👨‍🏫 Master Guru & Penugasan' },
      { id: 'ekskul', label: '⚽ Master Ekstrakurikuler' },
      { id: 'pengaturan', label: '🏫 Pengaturan Lembaga & SKL' }
    ];

    return `
      <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        ${tabs.map(t => {
          const isActive = t.id === _activeTab;
          return `
            <button
              type="button"
              onclick="AdminHome.switchTab('${t.id}')"
              class="px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
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
  /* TAB 1: DASHBOARD SISTEM & DATABASE                                 */
  /* ------------------------------------------------------------------ */
  function _renderDashboardTab() {
    const isConn = window.API?.isConnected?.() || false;
    const url = window.API?.getUrl?.() || '';

    return `
      <div class="space-y-6">
        
        <!-- Status Koneksi Google Sheets -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full ${isConn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}"></span>
              <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Status Koneksi Database Google Spreadsheet
              </h4>
            </div>
            <span class="badge ${isConn ? 'badge-success' : 'badge-warning'} text-[10px]">
              ${isConn ? '🟢 Terhubung Online' : '🟡 Mode Demo Offline'}
            </span>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-bold">URL Google Apps Script (GAS):</span>
              <button type="button" onclick="App.bukaModalDatabase()" class="text-brand-600 font-bold hover:underline cursor-pointer">
                Ubah URL Backend →
              </button>
            </div>
            <p class="font-mono text-[11px] text-slate-700 break-all bg-white p-2.5 rounded-xl border border-slate-200">
              ${url || 'Belum dikonfigurasi (Menggunakan data master lokal)'}
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span class="text-xs text-slate-500">12 Sheet Terpadu: PENGATURAN, DATA_SISWA, DATA_GURU, PRESENSI, DATA_NILAI, dll.</span>
            <button type="button" onclick="AdminHome.sinkronisasiData()" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer">
              <span>🔄</span> <span>Sinkronisasi Data Master (1-Klik)</span>
            </button>
          </div>
        </div>

        <!-- Ringkasan Master Data -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span class="text-slate-400 font-bold block uppercase">Total Siswa Terdaftar</span>
            <span class="text-2xl font-black text-slate-900 font-mono mt-1 block">896 Siswa</span>
            <span class="text-[11px] text-emerald-600 font-bold">28 Rombel Aktif</span>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span class="text-slate-400 font-bold block uppercase">Guru &amp; Tenaga Pendidik</span>
            <span class="text-2xl font-black text-slate-900 font-mono mt-1 block">54 Pegawai</span>
            <span class="text-[11px] text-slate-500">28 Walas, 14 Pelatih Ekskul</span>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span class="text-slate-400 font-bold block uppercase">Hitung Mundur SKL</span>
            <span class="text-2xl font-black text-amber-600 font-mono mt-1 block">Siap Rilis</span>
            <span class="text-[11px] text-slate-500">Kop 2 Logo Terkonfigurasi</span>
          </div>
        </div>

      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* TAB 2: MASTER SISWA & MANAJEMEN MUTASI                             */
  /* ------------------------------------------------------------------ */
  function _renderSiswaTab() {
    return `
      <div class="space-y-5">
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Master Database Peserta Didik &amp; Mutasi
              </h4>
              <p class="text-[11px] text-slate-500">Kelola identitas resmi, NISN 10 digit, dan administrasi mutasi masuk/keluar</p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" onclick="AdminHome.bukaModalTambahSiswa()" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer">
                <span>+</span> <span>Tambah Siswa</span>
              </button>
              <button type="button" onclick="AdminHome.cetakBukuIndukMutasi()" class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer">
                <span>🖨️</span> <span>Cetak Buku Induk Mutasi (A4)</span>
              </button>
            </div>
          </div>

          <!-- Tabel Master Siswa -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">NISN</th>
                  <th class="py-2.5 px-3">Nama Siswa</th>
                  <th class="py-2.5 px-3">Rombel</th>
                  <th class="py-2.5 px-3">Kontak WA Ortu</th>
                  <th class="py-2.5 px-3 text-center">Status</th>
                  <th class="py-2.5 px-3 text-right">Aksi Administrasi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${_demoMasterSiswa.map(s => `
                  <tr>
                    <td class="py-3 px-3 font-mono text-slate-700">${s.nisn}</td>
                    <td class="py-3 px-3 font-bold text-slate-900">${s.nama}</td>
                    <td class="py-3 px-3 font-mono font-bold">${s.rombel}</td>
                    <td class="py-3 px-3 font-mono text-slate-500">${s.noWa}</td>
                    <td class="py-3 px-3 text-center">
                      <span class="badge ${s.status === 'AKTIF' ? 'badge-success' : 'badge-danger'} text-[10px]">
                        ${s.status === 'AKTIF' ? 'Aktif' : 'Mutasi Keluar'}
                      </span>
                    </td>
                    <td class="py-3 px-3 text-right space-x-1">
                      ${s.status === 'AKTIF' ? `
                        <button type="button" onclick="AdminHome.prosesMutasiKeluar('${s.nisn}', '${s.nama}', '${s.rombel}')" class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 cursor-pointer">
                          Mutasi Keluar
                        </button>
                      ` : `
                        <button type="button" onclick="AdminHome.cetakSuratPindah('${s.nama}', '${s.nisn}', '${s.rombel}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer">
                          📄 Cetak Surat Pindah
                        </button>
                      `}
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
  /* TAB 3: MASTER GURU & PENUGASAN                                     */
  /* ------------------------------------------------------------------ */
  function _renderGuruTab() {
    return `
      <div class="space-y-5">
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              Master Guru, Tenaga Kependidikan &amp; Penugasan Peran
            </h4>
            <p class="text-[11px] text-slate-500">Tetapkan penugasan Wali Kelas rombel, Guru Wali pembina karakter, dan Pelatih ekstrakurikuler</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">NIP / ID</th>
                  <th class="py-2.5 px-3">Nama Pegawai</th>
                  <th class="py-2.5 px-3">Peran / Tugas Utama</th>
                  <th class="py-2.5 px-3">Nomor WhatsApp</th>
                  <th class="py-2.5 px-3 text-center">Fitur 4F</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${_demoMasterGuru.map(g => `
                  <tr>
                    <td class="py-3 px-3 font-mono text-slate-500">${g.nip}</td>
                    <td class="py-3 px-3 font-bold text-slate-800">${g.nama}</td>
                    <td class="py-3 px-3 font-medium text-brand-700">${g.tugas}</td>
                    <td class="py-3 px-3 font-mono text-slate-600">${g.noWa}</td>
                    <td class="py-3 px-3 text-center">
                      <span class="badge badge-success text-[10px]">Aktif</span>
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
  /* TAB 4: MASTER EKSTRAKURIKULER                                      */
  /* ------------------------------------------------------------------ */
  function _renderEkskulTab() {
    return `
      <div class="space-y-5">
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Master Ekstrakurikuler &amp; Kontrol Pendaftaran
              </h4>
              <p class="text-[11px] text-slate-500">Buka atau tutup periode pendaftaran mandiri cabang ekstra bagi siswa</p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" onclick="AdminHome.setSemuaEkskul('BUKA')" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer">
                🟢 Buka Semua Pendaftaran
              </button>
              <button type="button" onclick="AdminHome.setSemuaEkskul('TUTUP')" class="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer">
                🔴 Tutup Pendaftaran
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span class="font-bold text-slate-800 text-sm block">Futsal Prestasi</span>
              <span class="text-slate-500 text-[11px] block mt-0.5">Pelatih: Coach Hendra Gunawan</span>
              <span class="text-[11px] text-emerald-600 font-bold block mt-2">Status: 🟢 Dibuka (Kuota: 30)</span>
            </div>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span class="font-bold text-slate-800 text-sm block">PMR (Palang Merah Remaja)</span>
              <span class="text-slate-500 text-[11px] block mt-0.5">Pelatih: Pembina PMR</span>
              <span class="text-[11px] text-emerald-600 font-bold block mt-2">Status: 🟢 Dibuka (Kuota: 40)</span>
            </div>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span class="font-bold text-slate-800 text-sm block">Pramuka Inti</span>
              <span class="text-slate-500 text-[11px] block mt-0.5">Pelatih: Kakak Pembina</span>
              <span class="text-[11px] text-emerald-600 font-bold block mt-2">Status: 🟢 Dibuka (Wajib Kelas 7)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* TAB 5: PENGATURAN LEMBAGA, KOP & SKL                               */
  /* ------------------------------------------------------------------ */
  function _renderPengaturanTab() {
    const s = window.APP_STATE?.sekolah || {};

    return `
      <div class="space-y-5">
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h4 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              Pengaturan Identitas Satuan Pendidikan &amp; Kop Surat Resmi
            </h4>
            <p class="text-[11px] text-slate-500">Konfigurasi Kop 2 Logo, titimangsa tanda tangan dinas, dan pengumuman SKL kelulusan</p>
          </div>

          <form onsubmit="AdminHome.simpanPengaturan(event)" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="input-label font-bold text-slate-700">Nama Sekolah Resmi</label>
                <input type="text" id="cfg-nama-sekolah" value="${Utils.sanitize(s.nama || 'SMP NEGERI INDONESIA HEBAT')}" class="input-field text-xs font-bold py-2" required>
              </div>
              <div>
                <label class="input-label font-bold text-slate-700">Instansi Pembina (Baris Atas Kop)</label>
                <input type="text" id="cfg-instansi" value="${Utils.sanitize(s.instansiPembina || 'Pemerintah Kabupaten / Dinas Pendidikan')}" class="input-field text-xs font-bold py-2" required>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="input-label font-bold text-slate-700">Nama Kepala Sekolah</label>
                <input type="text" id="cfg-nama-kepsek" value="${Utils.sanitize(s.namaKepsek || 'Dr. H. Ahmad Dahlan, M.Pd.')}" class="input-field text-xs font-bold py-2" required>
              </div>
              <div>
                <label class="input-label font-bold text-slate-700">NIP Kepala Sekolah</label>
                <input type="text" id="cfg-nip-kepsek" value="${Utils.sanitize(s.nipKepsek || '19700101 199503 1 001')}" class="input-field text-xs font-bold py-2" required>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="input-label font-bold text-slate-700">Jadwal Hitung Mundur Rilis Kelulusan (SKL)</label>
                <input type="datetime-local" id="cfg-tgl-skl" value="2026-11-25T10:00" class="input-field text-xs font-bold py-2">
              </div>
              <div>
                <label class="input-label font-bold text-slate-700">PIN Administrator Sistem</label>
                <input type="password" id="cfg-pin-admin" value="123456" class="input-field text-xs font-mono font-bold py-2" required>
              </div>
            </div>

            <button type="submit" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm cursor-pointer">
              Simpan Perubahan Pengaturan
            </button>
          </form>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* Main Layout Render Admin                                           */
  /* ------------------------------------------------------------------ */
  function render(params = {}) {
    if (params.tab) {
      _activeTab = params.tab;
    }

    const root = document.getElementById('app-root');
    if (!root) return;

    let bodyHtml = '';
    if (_activeTab === 'siswa') bodyHtml = _renderSiswaTab();
    else if (_activeTab === 'guru') bodyHtml = _renderGuruTab();
    else if (_activeTab === 'ekskul') bodyHtml = _renderEkskulTab();
    else if (_activeTab === 'pengaturan') bodyHtml = _renderPengaturanTab();
    else bodyHtml = _renderDashboardTab();

    root.innerHTML = `
      <div class="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 page-transition">
        <div class="max-w-6xl mx-auto space-y-6">
          ${_renderAdminHeader()}
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
  /* Handlers Admin                                                     */
  /* ------------------------------------------------------------------ */
  async function sinkronisasiData() {
    if (window.App?.showLoading) window.App.showLoading('Sinkronisasi data master dari Google Sheets...');
    try {
      if (window.API?.isConnected?.()) {
        await window.API.getInitialData();
      }
      if (window.Toast) window.Toast.success('Sinkronisasi master data berhasil!');
    } catch (e) {
      console.warn('Sync:', e);
    } finally {
      if (window.App?.hideLoading) window.App.hideLoading();
    }
  }

  function setSemuaEkskul(status) {
    if (window.Toast) {
      window.Toast.success(`Pendaftaran seluruh ekskul disetel ke status: ${status}`);
    }
  }

  function prosesMutasiKeluar(nisn, nama, rombel) {
    if (confirm(`Proses mutasi keluar untuk siswa: ${nama} (${nisn}) dari kelas ${rombel}?`)) {
      const target = _demoMasterSiswa.find(s => s.nisn === nisn);
      if (target) target.status = 'MUTASI_KELUAR';
      if (window.Toast) window.Toast.success(`Siswa ${nama} berhasil dipindahkan ke status Mutasi Keluar.`);
      render({ tab: 'siswa' });
    }
  }

  function cetakSuratPindah(nama, nisn, rombel) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Keterangan Pindah Sekolah - ${nama}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; line-height: 1.6; font-size: 13px; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 25px; }
          .kop h2, .kop h3 { margin: 0; text-transform: uppercase; }
          .sign { margin-top: 50px; float: right; width: 250px; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h3>PEMERINTAH DAERAH / DINAS PENDIDIKAN</h3>
          <h2>SMP NEGERI INDONESIA HEBAT</h2>
          <p>Jl. Pendidikan No. 35, Telp: (021) 12345678</p>
        </div>
        <h3 style="text-align:center; text-decoration: underline;">SURAT KETERANGAN PINDAH SEKOLAH</h3>
        <p style="text-align:center; margin-top:-10px;">Nomor: 421.3/SK-Pindah/SMPN35/2026/007</p>
        <p>Menerangkan bahwa:</p>
        <table>
          <tr><td width="30%">Nama Siswa</td><td>: <b>${nama}</b></td></tr>
          <tr><td>NISN</td><td>: <b>${nisn}</b></td></tr>
          <tr><td>Kelas Terakhir</td><td>: <b>${rombel}</b></td></tr>
        </table>
        <p style="text-indent: 30px;">
          Telah resmi mengajukan pindah sekolah atas permohonan orang tua/wali siswa. Seluruh data raport dan arsip historis telah disahkan secara kedinasan.
        </p>
        <div class="sign">
          <p>Jakarta, 20 November 2026<br>Kepala Sekolah,</p>
          <br><br><br>
          <p><b>Dr. H. Ahmad Dahlan, M.Pd.</b><br>NIP. 19700101 199503 1 001</p>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  function cetakBukuIndukMutasi() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Buku Induk Registrasi Mutasi</title></head>
      <body style="font-family:sans-serif;padding:30px;">
        <h2 style="text-align:center;">BUKU INDUK REGISTRASI MUTASI SISWA</h2>
        <p style="text-align:center;">Tahun Ajaran 2026/2027 • SMP Negeri Indonesia Hebat</p>
        <hr><br><p>Rekapitulasi resmi siswa pindah masuk dan pindah keluar.</p>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  function bukaModalTambahSiswa() {
    if (window.Modal?.show) {
      window.Modal.show({
        title: 'Tambah Siswa Baru',
        body: `
          <div class="space-y-3 text-xs text-left">
            <div><label class="font-bold">NISN (10 Digit):</label><input type="text" id="m-nisn" placeholder="008..." class="input-field text-xs"></div>
            <div><label class="font-bold">Nama Lengkap:</label><input type="text" id="m-nama" placeholder="Nama..." class="input-field text-xs"></div>
            <div><label class="font-bold">Rombel:</label><input type="text" id="m-rombel" value="8-A" class="input-field text-xs"></div>
          </div>
        `,
        confirmText: 'Simpan',
        onConfirm: () => {
          const nisn = document.getElementById('m-nisn')?.value?.trim();
          const nama = document.getElementById('m-nama')?.value?.trim();
          const rombel = document.getElementById('m-rombel')?.value?.trim() || '8-A';
          if (nisn && nama) {
            _demoMasterSiswa.push({ nisn, nis: '242508999', nama, rombel, gender: 'L', status: 'AKTIF', noWa: '081234567899' });
            if (window.Toast) window.Toast.success('Siswa berhasil ditambahkan!');
            render({ tab: 'siswa' });
          }
        }
      });
    }
  }

  function simpanPengaturan(e) {
    e.preventDefault();
    const nama = document.getElementById('cfg-nama-sekolah')?.value?.trim();
    if (nama && window.APP_STATE?.sekolah) {
      window.APP_STATE.sekolah.nama = nama;
    }
    if (window.App?.updateTopbar) window.App.updateTopbar();
    if (window.Toast) window.Toast.success('Pengaturan lembaga berhasil diperbarui!');
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                         */
  /* ------------------------------------------------------------------ */
  return {
    render,
    switchTab,
    sinkronisasiData,
    setSemuaEkskul,
    prosesMutasiKeluar,
    cetakSuratPindah,
    cetakBukuIndukMutasi,
    bukaModalTambahSiswa,
    simpanPengaturan
  };
})();

window.AdminHome = AdminHome;
