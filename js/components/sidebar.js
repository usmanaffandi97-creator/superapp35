/**
 * Sidebar Component — Super App Sekolah Terpadu
 * KHUSUS portal GURU — sidebar kiri desktop + hamburger mobile
 * IIFE pattern, export ke window.Sidebar
 * - Desktop: fixed 240px kiri
 * - Mobile: tersembunyi, slide-in dari kiri via toggle()
 */
const Sidebar = (() => {

  // Definisi semua menu yang tersedia
  const ALL_MENUS = [
    {
      id: 'home',
      label: 'Beranda',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    },
    {
      id: 'presensi-kbm',
      label: 'Presensi KBM',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    },
    {
      id: 'nilai',
      label: 'Input Nilai',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    },
    {
      id: 'jurnal',
      label: 'Jurnal Mengajar',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
    },
    {
      id: 'ekskul-rekap',
      label: 'Rekap Ekskul',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    },
    {
      id: 'ekskul-input',
      label: 'Input Ekskul',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`,
    },
    {
      id: 'kebiasaan',
      label: 'Kebiasaan Baik',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    },
    {
      id: 'pelanggaran',
      label: 'Pelanggaran',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    },
    {
      id: 'profil',
      label: 'Profil Saya',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    },
  ];

  // Pemetaan role → daftar menu ID yang diizinkan
  const ROLE_MENUS = {
    WALI_KELAS:    ['home', 'presensi-kbm', 'nilai', 'ekskul-rekap', 'profil'],
    PELATIH_EKSKUL:['home', 'ekskul-input', 'profil'],
    GURU_WALI:     ['home', 'kebiasaan', 'profil'],
    GURU_BK:       ['home', 'pelanggaran', 'profil'],
    GURU_MAPEL:    ['home', 'nilai', 'jurnal', 'profil'],
    GURU_PIKET:    ['home', 'pelanggaran', 'profil'],
  };

  let _activeMenu = 'home';
  let _isOpen     = false; // state mobile sidebar

  // ─── DOM helpers ─────────────────────────────────────────────────────────────

  function _ensureSidebarDOM() {
    if (!document.getElementById('sidebar-nav')) {
      // Sidebar panel
      const sidebar = document.createElement('aside');
      sidebar.id = 'sidebar-nav';
      sidebar.className = 'sidebar-nav';
      sidebar.setAttribute('aria-label', 'Menu Navigasi');
      document.body.prepend(sidebar);
    }
    if (!document.getElementById('sidebar-overlay')) {
      // Overlay backdrop (mobile)
      const overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.className = 'sidebar-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.addEventListener('click', () => toggle(false));
      document.body.appendChild(overlay);
    }
    if (!document.getElementById('sidebar-hamburger')) {
      // Hamburger button — di-inject ke topbar jika ada, atau ke body
      const btn = document.createElement('button');
      btn.id = 'sidebar-hamburger';
      btn.className = 'sidebar-hamburger';
      btn.setAttribute('aria-label', 'Buka menu');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>`;
      btn.addEventListener('click', () => toggle());

      // Coba taruh di dalam #topbar-left, fallback ke body
      const topbarLeft = document.getElementById('topbar-left') || document.getElementById('topbar');
      if (topbarLeft) topbarLeft.prepend(btn);
      else document.body.appendChild(btn);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  function render(activeMenu, userRole) {
    _activeMenu = activeMenu || 'home';
    _ensureSidebarDOM();

    const sidebar = document.getElementById('sidebar-nav');
    const allowedIds = ROLE_MENUS[userRole] || Object.keys(ROLE_MENUS).reduce((acc, k) => {
      ROLE_MENUS[k].forEach(m => { if (!acc.includes(m)) acc.push(m); });
      return acc;
    }, []);

    const menus = ALL_MENUS.filter(m => allowedIds.includes(m.id));

    const menuHtml = menus.map(m => {
      const isActive = m.id === _activeMenu;
      return `
        <button
          class="sidebar-item${isActive ? ' active' : ''}"
          data-menu="${m.id}"
          aria-current="${isActive ? 'page' : 'false'}"
          type="button"
        >
          <span class="sidebar-item-icon">${m.icon}</span>
          <span class="sidebar-item-label">${m.label}</span>
        </button>`;
    }).join('');

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <span class="sidebar-brand-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </span>
        <span class="sidebar-brand-name">Super App</span>
        <button class="sidebar-close-btn" aria-label="Tutup menu" type="button">&times;</button>
      </div>
      <nav class="sidebar-menu" role="navigation" aria-label="Menu Guru">
        ${menuHtml}
      </nav>
    `;

    // Event: menu item click
    sidebar.querySelector('.sidebar-menu').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-menu]');
      if (!btn) return;
      const menu = btn.dataset.menu;
      setActive(menu);
      // Tutup mobile sidebar setelah navigasi
      toggle(false);
      if (window.Router && typeof window.Router.go === 'function') {
        window.Router.go(menu);
      }
    });

    // Tombol close di dalam sidebar (untuk mobile)
    sidebar.querySelector('.sidebar-close-btn').addEventListener('click', () => toggle(false));
  }

  // ─── setActive ───────────────────────────────────────────────────────────────

  function setActive(menu) {
    _activeMenu = menu;
    const sidebar = document.getElementById('sidebar-nav');
    if (!sidebar) return;

    sidebar.querySelectorAll('.sidebar-item').forEach(el => {
      const isActive = el.dataset.menu === menu;
      el.classList.toggle('active', isActive);
      el.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  // ─── toggle mobile ───────────────────────────────────────────────────────────

  /**
   * toggle(force?: boolean)
   * Jika force=true → buka, false → tutup, tanpa arg → flip
   */
  function toggle(force) {
    _isOpen = (force !== undefined) ? !!force : !_isOpen;

    const sidebar = document.getElementById('sidebar-nav');
    const overlay = document.getElementById('sidebar-overlay');
    const hamburger = document.getElementById('sidebar-hamburger');

    if (sidebar)   sidebar.classList.toggle('sidebar-open', _isOpen);
    if (overlay)   overlay.classList.toggle('sidebar-overlay-visible', _isOpen);
    if (hamburger) hamburger.setAttribute('aria-expanded', String(_isOpen));

    // Cegah scroll body saat sidebar terbuka (mobile)
    document.body.classList.toggle('sidebar-body-lock', _isOpen);
  }

  return { render, setActive, toggle };
})();

window.Sidebar = Sidebar;
