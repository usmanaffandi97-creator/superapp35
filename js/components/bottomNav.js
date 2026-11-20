/**
 * BottomNav Component — Super App Sekolah Terpadu
 * KHUSUS portal SISWA — bottom nav 5 tab
 * IIFE pattern, export ke window.BottomNav
 * Inject ke #bottom-nav-container
 */
const BottomNav = (() => {
  const TABS = [
    {
      id: 'home',
      label: 'Beranda',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    },
    {
      id: 'karakter',
      label: 'Karakter',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    },
    {
      id: 'ekskul',
      label: 'Ekskul',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`,
    },
    {
      id: 'nilai',
      label: 'Nilai',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    },
    {
      id: 'profil',
      label: 'Profil',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    },
  ];

  let _activeTab = 'home';

  function render(activeTab) {
    _activeTab = activeTab || 'home';
    const container = document.getElementById('bottom-nav-container');
    if (!container) {
      console.warn('BottomNav: #bottom-nav-container tidak ditemukan.');
      return;
    }

    const tabsHtml = TABS.map(tab => {
      const isActive = tab.id === _activeTab;
      const activeClass = isActive ? 'bottom-nav-item active' : 'bottom-nav-item';
      const dotHtml = isActive
        ? `<span class="bottom-nav-dot" aria-hidden="true"></span>`
        : '';

      return `
        <button
          class="${activeClass}"
          data-tab="${tab.id}"
          aria-label="${tab.label}"
          aria-current="${isActive ? 'page' : 'false'}"
          type="button"
        >
          <span class="bottom-nav-icon">${tab.icon}</span>
          <span class="bottom-nav-label">${tab.label}</span>
          ${dotHtml}
        </button>
      `;
    }).join('');

    container.innerHTML = `<nav class="bottom-nav" aria-label="Navigasi Utama">${tabsHtml}</nav>`;

    // Event delegation
    container.querySelector('.bottom-nav').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      const tab = btn.dataset.tab;
      if (tab === _activeTab) return;
      setActive(tab);
      if (window.Router && typeof window.Router.go === 'function') {
        window.Router.go(tab);
      }
    });
  }

  function setActive(tab) {
    _activeTab = tab;
    // Re-render jika container ada
    const container = document.getElementById('bottom-nav-container');
    if (container) render(tab);
  }

  return { render, setActive };
})();

window.BottomNav = BottomNav;
