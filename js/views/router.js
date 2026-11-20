/**
 * router.js — View Router & View Dispatcher
 * Super App Sekolah Terpadu — Fase 2
 *
 * Mengatur pergantian view secara reaktif:
 * - 'landing' : Beranda publik & login terpadu
 * - 'siswa'   : Portal Mandiri Peserta Didik (dengan BottomNav 5 Tab)
 * - 'guru'    : Command Center Tenaga Pendidik & Pelatih (dengan Sidebar)
 * - 'kepsek'  : Portal Khusus Kepala Sekolah (Statistik Eksekutif & Supervisi)
 * - 'admin'   : Master Panel Administrator Sistem
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Helper: Bersihkan Komponen Navigasi Per-Peran                      */
  /* ------------------------------------------------------------------ */
  function _cleanupNavs(currentView) {
    const bottomNav = document.getElementById('bottom-nav-container');
    const sidebarNav = document.getElementById('sidebar-nav');
    const sidebarHamburger = document.getElementById('sidebar-hamburger');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // Bottom Nav hanya untuk Siswa
    if (bottomNav) {
      if (currentView !== 'siswa' && !['home', 'karakter', 'ekskul', 'nilai', 'profil'].includes(currentView)) {
        bottomNav.innerHTML = '';
      }
    }

    // Sidebar hanya untuk Guru
    const isGuruView = currentView === 'guru' || ['presensi-kbm', 'jurnal', 'ekskul-rekap', 'ekskul-input', 'kebiasaan', 'pelanggaran'].includes(currentView) || (currentView === 'nilai' && window.APP_STATE?.currentUser?.role !== 'SISWA');
    if (!isGuruView) {
      if (sidebarNav) sidebarNav.style.display = 'none';
      if (sidebarHamburger) sidebarHamburger.style.display = 'none';
      if (sidebarOverlay) sidebarOverlay.style.display = 'none';
    } else {
      if (sidebarNav) sidebarNav.style.display = '';
      if (sidebarHamburger) sidebarHamburger.style.display = '';
      if (sidebarOverlay) sidebarOverlay.style.display = '';
    }
  }

  /* ------------------------------------------------------------------ */
  /* View Registry                                                      */
  /* ------------------------------------------------------------------ */
  const VIEW_REGISTRY = {
    
    /* ── LANDING PAGE ── */
    landing: {
      render() {
        _cleanupNavs('landing');
        if (window.Landing?.render) {
          window.Landing.render();
        } else {
          console.error('[Router] Modul Landing tidak ditemukan');
        }
      }
    },

    /* ── PORTAL SISWA ── */
    siswa: {
      render(params = {}) {
        _cleanupNavs('siswa');
        if (window.SiswaHome?.render) {
          window.SiswaHome.render(params);
        }
      }
    },

    home: {
      render(params = {}) {
        const u = window.APP_STATE.currentUser;
        if (u && u.role === 'SISWA') {
          _cleanupNavs('siswa');
          if (window.SiswaHome?.render) window.SiswaHome.render({ tab: 'home', ...params });
        } else if (u && (u.role === 'GURU' || u.role === 'PELATIH_EKSKUL')) {
          _cleanupNavs('guru');
          if (window.GuruHome?.render) window.GuruHome.render({ menu: 'home', ...params });
        } else {
          _cleanupNavs('landing');
          if (window.Landing?.render) window.Landing.render();
        }
      }
    },

    karakter: {
      render(params = {}) {
        _cleanupNavs('siswa');
        if (window.SiswaHome?.render) {
          window.SiswaHome.render({ tab: 'karakter', ...params });
        }
      }
    },

    ekskul: {
      render(params = {}) {
        _cleanupNavs('siswa');
        if (window.SiswaHome?.render) {
          window.SiswaHome.render({ tab: 'ekskul', ...params });
        }
      }
    },

    nilai: {
      render(params = {}) {
        const u = window.APP_STATE.currentUser;
        if (u && u.role === 'SISWA') {
          _cleanupNavs('siswa');
          if (window.SiswaHome?.render) window.SiswaHome.render({ tab: 'nilai', ...params });
        } else {
          _cleanupNavs('guru');
          if (window.GuruHome?.render) window.GuruHome.render({ menu: 'nilai', ...params });
        }
      }
    },

    profil: {
      render(params = {}) {
        _cleanupNavs('siswa');
        if (window.SiswaHome?.render) {
          window.SiswaHome.render({ tab: 'profil', ...params });
        }
      }
    },

    /* ── PORTAL GURU & PELATIH ── */
    guru: {
      render(params = {}) {
        _cleanupNavs('guru');
        if (window.GuruHome?.render) {
          window.GuruHome.render(params);
        }
      }
    },

    'presensi-kbm': {
      render(params = {}) {
        _cleanupNavs('guru');
        if (window.GuruHome?.render) {
          window.GuruHome.render({ menu: 'presensi-kbm', ...params });
        }
      }
    },

    jurnal: {
      render(params = {}) {
        _cleanupNavs('guru');
        if (window.GuruHome?.render) {
          window.GuruHome.render({ menu: 'jurnal', ...params });
        }
      }
    },

    kebiasaan: {
      render(params = {}) {
        _cleanupNavs('guru');
        if (window.GuruHome?.render) {
          window.GuruHome.render({ menu: 'kebiasaan', ...params });
        }
      }
    },

    'ekskul-input': {
      render(params = {}) {
        _cleanupNavs('guru');
        if (window.GuruHome?.render) {
          window.GuruHome.render({ menu: 'ekskul-input', ...params });
        }
      }
    },

    'ekskul-rekap': {
      render(params = {}) {
        _cleanupNavs('guru');
        if (window.GuruHome?.render) {
          window.GuruHome.render({ menu: 'ekskul-rekap', ...params });
        }
      }
    },

    pelanggaran: {
      render(params = {}) {
        _cleanupNavs('guru');
        if (window.GuruHome?.render) {
          window.GuruHome.render({ menu: 'pelanggaran', ...params });
        }
      }
    },

    /* ── PORTAL KHUSUS KEPALA SEKOLAH ── */
    kepsek: {
      render(params = {}) {
        _cleanupNavs('kepsek');
        if (window.KepsekHome?.render) {
          window.KepsekHome.render(params);
        } else {
          console.error('[Router] Modul KepsekHome tidak ditemukan');
        }
      }
    },

    /* ── PORTAL ADMINISTRATOR ── */
    admin: {
      render(params = {}) {
        _cleanupNavs('admin');
        if (window.AdminHome?.render) {
          window.AdminHome.render(params);
        } else {
          console.error('[Router] Modul AdminHome tidak ditemukan');
        }
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /* Route Dispatcher                                                   */
  /* ------------------------------------------------------------------ */
  function dispatch(viewName, params = {}) {
    const view = VIEW_REGISTRY[viewName];
    if (!view) {
      console.warn(`[Router] View '${viewName}' tidak terdaftar — dialihkan ke landing.`);
      VIEW_REGISTRY.landing.render(params);
      return;
    }

    try {
      view.render(params);
    } catch (err) {
      console.error(`[Router] Kesalahan render view '${viewName}':`, err);
    }
  }

  // Expose
  window._RouterDispatch = dispatch;
})();
