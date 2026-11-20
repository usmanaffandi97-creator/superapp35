/**
 * app.js — Main Application State, Router, and Bootstrapper
 * Super App Sekolah Terpadu — Phase 1
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* 1. Global Application State (Single Source of Truth)              */
  /* ------------------------------------------------------------------ */
  window.APP_STATE = window.APP_STATE || {
    sekolah: {
      nama: 'SMP NEGERI INDONESIA HEBAT',
      instansiPembina: 'Pemerintah Kabupaten / Dinas Pendidikan',
      alamat: 'Jl. Pendidikan No. 35, Kota Pendidikan',
      kota: 'Jakarta',
      namaKepsek: 'Dr. H. Ahmad Dahlan, M.Pd.',
      nipKepsek: '19700101 199503 1 001',
      statusRilisKelulusan: 'TERKUNCI',
      tanggalRilisKelulusan: '',
      logoKiri: '',
      logoKanan: ''
    },
    // Demo Master Siswa bawaan untuk simulasi offline / sebelum sheet terkoneksi
    masterSiswa: [
      {
        nisn: '0081234567',
        nama: 'Ahmad Fauzan Pratama',
        kelas: '8-A',
        jurusan: '',
        pin: '1234',
        noWa: '081234567890'
      },
      {
        nisn: '0087654321',
        nama: 'Siti Nurhaliza',
        kelas: '8-A',
        jurusan: '',
        pin: '1234',
        noWa: '081234567891'
      }
    ],
    // Demo Master Guru & Staf
    masterGuru: [
      {
        nip: '198501012010011001',
        nama: 'Budi Santoso, S.Pd.',
        jabatan: 'Wali Kelas 8-A',
        role: 'GURU',
        mapel: ['Matematika'],
        pin: '1234',
        noWa: '081298765432'
      },
      {
        nip: '197001011995031001',
        nama: 'Dr. H. Ahmad Dahlan, M.Pd.',
        jabatan: 'Kepala Sekolah',
        role: 'KEPSEK',
        pin: '1234',
        noWa: '081211223344'
      },
      {
        nip: 'ADMIN',
        nama: 'Administrator Sekolah',
        jabatan: 'Administrator IT',
        role: 'ADMIN',
        pin: '123456',
        noWa: '081200001111'
      }
    ],
    masterEkskul: [],
    masterTibum: [],
    pengaturan: {},
    currentUser: null,
    isConnected: false,
    basePath: ''
  };

  /* ------------------------------------------------------------------ */
  /* 2. Client-side Router                                             */
  /* ------------------------------------------------------------------ */
  window.Router = {
    current: null,
    params: {},
    history: [],

    /**
     * Navigate to a view
     * @param {string} viewName - 'landing' | 'siswa' | 'guru' | 'kepsek' | 'admin'
     * @param {Object} params
     */
    go(viewName, params = {}) {
      this.current = viewName;
      this.params = params;
      this.history.push({ view: viewName, params });

      // Dispatch view render
      if (typeof window._RouterDispatch === 'function') {
        window._RouterDispatch(viewName, params);
      } else {
        console.warn('[Router] _RouterDispatch belum siap.');
      }

      // Update Topbar context
      if (window.App && typeof window.App.updateTopbar === 'function') {
        window.App.updateTopbar();
      }

      // Refresh icons with Lucide
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        setTimeout(() => window.lucide.createIcons(), 50);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    back() {
      if (this.history.length > 1) {
        this.history.pop(); // buang view saat ini
        const prev = this.history.pop();
        this.go(prev.view, prev.params);
      } else {
        this.go('landing');
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /* 3. Main Application Controller (App)                              */
  /* ------------------------------------------------------------------ */
  window.App = {
    async init() {
      console.info('[App] Inisialisasi Super App Sekolah Terpadu...');
      this.bindTopbarEvents();

      // Cek koneksi backend GAS
      const isConn = window.API?.isConnected?.() || false;
      window.APP_STATE.isConnected = isConn;
      this.updateTopbar();

      // Jika URL backend sudah ada, coba load initial data dari spreadsheet
      if (isConn) {
        this.showLoading('Menghubungkan ke Google Sheets...');
        try {
          const res = await window.API.getInitialData();
          if (res?.ok) {
            console.info('[App] Data awal berhasil dimuat dari Sheets.');
          } else {
            console.warn('[App] Gagal memuat data awal, menggunakan data lokal/demo:', res?.error);
          }
        } catch (err) {
          console.warn('[App] Exception memuat data awal:', err);
        } finally {
          this.hideLoading();
        }
      }

      // Cek apakah ada session user aktif
      const sessionUser = window.Auth?.getCurrentUser?.();
      if (sessionUser) {
        window.APP_STATE.currentUser = sessionUser;
        console.info('[App] Sesi ditemukan:', sessionUser.nama, `(${sessionUser.role})`);
        const targetView = (sessionUser.role || 'landing').toLowerCase();
        window.Router.go(targetView);
      } else {
        window.Router.go('landing');
      }

      this.updateTopbar();
      if (window.lucide) {
        window.lucide.createIcons();
      }
    },

    bindTopbarEvents() {
      // Tombol Logout
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) {
        btnLogout.addEventListener('click', () => {
          if (window.Modal?.show) {
            window.Modal.show({
              title: 'Konfirmasi Keluar',
              body: 'Apakah Anda yakin ingin keluar dari sesi ini?',
              confirmText: 'Ya, Keluar',
              cancelText: 'Batal',
              type: 'danger',
              onConfirm: () => {
                this.onLogout();
              }
            });
          } else {
            if (confirm('Keluar dari sesi ini?')) {
              this.onLogout();
            }
          }
        });
      }

      // Tombol Database Connect
      const btnDb = document.getElementById('btn-db-connect');
      if (btnDb) {
        btnDb.addEventListener('click', () => this.bukaModalDatabase());
      }

      // User Pill
      const userPill = document.getElementById('user-pill');
      if (userPill) {
        userPill.addEventListener('click', () => {
          const u = window.APP_STATE.currentUser;
          if (!u) return;
          if (window.Modal?.show) {
            window.Modal.show({
              title: 'Profil Pengguna',
              body: `
                <div class="text-left space-y-2 text-sm text-slate-700">
                  <p><strong>Nama:</strong> ${Utils.sanitize(u.nama || '-')}</p>
                  <p><strong>Peran:</strong> <span class="badge badge-info">${Utils.sanitize(u.role || '-')}</span></p>
                  ${u.nisn ? `<p><strong>NISN:</strong> ${Utils.sanitize(u.nisn)}</p>` : ''}
                  ${u.nip ? `<p><strong>NIP:</strong> ${Utils.sanitize(u.nip)}</p>` : ''}
                  ${u.kelas ? `<p><strong>Kelas:</strong> ${Utils.sanitize(u.kelas)}</p>` : ''}
                  ${u.jabatan ? `<p><strong>Jabatan:</strong> ${Utils.sanitize(u.jabatan)}</p>` : ''}
                </div>
              `,
              confirmText: 'Tutup',
              onConfirm: () => {}
            });
          }
        });
      }
    },

    updateTopbar() {
      // Update Nama Sekolah
      const schoolEl = document.getElementById('topbar-school-name');
      if (schoolEl) {
        schoolEl.textContent = window.APP_STATE.sekolah?.nama || 'Super App Sekolah';
      }

      const user = window.APP_STATE.currentUser || window.Auth?.getCurrentUser?.();
      const userPill = document.getElementById('user-pill');
      const pillName = document.getElementById('user-pill-name');
      const btnLogout = document.getElementById('btn-logout');

      if (user) {
        if (userPill) userPill.classList.remove('hidden');
        if (userPill) userPill.classList.add('flex');
        if (pillName) pillName.textContent = user.nama || user.nisn || user.nip || 'Pengguna';
        if (btnLogout) btnLogout.classList.remove('hidden');
      } else {
        if (userPill) userPill.classList.add('hidden');
        if (userPill) userPill.classList.remove('flex');
        if (btnLogout) btnLogout.classList.add('hidden');
      }

      // Status Koneksi DB
      const dot = document.getElementById('db-status-dot');
      const isConn = window.API?.isConnected?.() || false;
      if (dot) {
        dot.className = `w-2 h-2 rounded-full ${isConn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`;
      }
    },

    showLoading(text = 'Memuat...') {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.classList.remove('pointer-events-none', 'opacity-0');
        overlay.classList.add('opacity-100');
        const span = overlay.querySelector('span');
        if (span) span.textContent = text;
      }
    },

    hideLoading() {
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.classList.add('opacity-0', 'pointer-events-none');
        overlay.classList.remove('opacity-100');
      }
    },

    onLogout() {
      window.Auth?.clearSession?.();
      window.APP_STATE.currentUser = null;
      this.updateTopbar();
      window.Router.go('landing');
      if (window.Toast?.info) {
        window.Toast.info('Anda telah keluar.');
      }
    },

    bukaModalDatabase() {
      const currentUrl = window.API?.getUrl?.() || '';
      const bodyHtml = `
        <div class="space-y-4 text-left">
          <p class="text-xs text-slate-500">
            Hubungkan web aplikasi ini ke Google Spreadsheet melalui Web App Google Apps Script (GAS).
          </p>
          <div>
            <label class="input-label">URL Web App Google Apps Script</label>
            <input type="url" id="modal-gas-url-input" class="input-field text-xs font-mono" 
                   placeholder="https://script.google.com/macros/s/.../exec" 
                   value="${Utils.sanitize(currentUrl)}">
          </div>
          <div id="modal-db-status" class="text-xs font-medium"></div>
        </div>
      `;

      if (window.Modal?.show) {
        window.Modal.show({
          title: '⚙️ Koneksi Database Google Sheets',
          body: bodyHtml,
          confirmText: 'Simpan & Tes Koneksi',
          cancelText: 'Batal',
          onConfirm: async () => {
            const input = document.getElementById('modal-gas-url-input');
            const val = input ? input.value.trim() : '';
            if (!val) {
              window.API?.clearUrl?.();
              window.APP_STATE.isConnected = false;
              this.updateTopbar();
              window.Toast?.warning?.('URL database dikosongkan (Mode Demo Offline)');
              return;
            }

            window.API?.setUrl?.(val);
            this.showLoading('Menguji koneksi ke Google Sheets...');
            const pingRes = await window.API?.ping?.();
            this.hideLoading();

            if (pingRes?.ok) {
              window.APP_STATE.isConnected = true;
              this.updateTopbar();
              window.Toast?.success?.(`Terhubung ke database (${pingRes.latencyMs || 0}ms)`);
              // Reload data awal
              this.showLoading('Sinkronisasi data master...');
              await window.API?.getInitialData?.();
              this.hideLoading();
              window.Router.go(window.Router.current || 'landing');
            } else {
              window.Toast?.error?.('Koneksi gagal: ' + (pingRes?.error || 'Periksa URL Web App Anda'));
            }
          }
        });
      } else {
        const newUrl = prompt('Masukkan URL Web App Google Apps Script:', currentUrl);
        if (newUrl !== null) {
          window.API?.setUrl?.(newUrl);
          this.updateTopbar();
        }
      }
    }
  };

  // Expose
  window.APP_STATE = window.APP_STATE;
})();
