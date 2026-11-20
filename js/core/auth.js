/**
 * auth.js — Session management & login logic
 * Ekspor: window.Auth
 * Pattern: IIFE, tanpa bundler
 *
 * Roles   : SISWA | GURU | ADMIN | KEPSEK
 * Session : sessionStorage key SUPERAPP_SESSION
 * Login   : validasi lokal dari APP_STATE.masterSiswa / masterGuru
 *           10 digit numerik → NISN Siswa, lainnya → NIP Guru
 */
const Auth = (() => {
  'use strict';

  const SESSION_KEY    = 'SUPERAPP_SESSION';
  const LANDING_PATH   = '/index.html';   // halaman awal (sebelum login)

  // ─── Role constants ────────────────────────────────────────────────────────

  const ROLE = {
    SISWA  : 'SISWA',
    GURU   : 'GURU',
    ADMIN  : 'ADMIN',
    KEPSEK : 'KEPSEK',
  };

  // ─── Session helpers ───────────────────────────────────────────────────────

  /** Baca currentUser dari sessionStorage */
  function getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[Auth] getCurrentUser error:', e);
      return null;
    }
  }

  /** Simpan user ke sessionStorage */
  function setCurrentUser(user) {
    if (!user || typeof user !== 'object') {
      console.error('[Auth] setCurrentUser: objek user tidak valid', user);
      return false;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      if (window.APP_STATE) {
        window.APP_STATE.currentUser = user;
      }
      return true;
    } catch (e) {
      console.error('[Auth] setCurrentUser error:', e);
      return false;
    }
  }

  /** Hapus session */
  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    if (window.APP_STATE) {
      window.APP_STATE.currentUser = null;
    }
  }

  /** Apakah ada user yang sedang login? */
  function isLoggedIn() {
    return getCurrentUser() !== null;
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  /**
   * _isSiswa(id) — 10 karakter numerik = NISN siswa
   */
  function _isSiswa(id) {
    return /^\d{10}$/.test(String(id).trim());
  }

  /**
   * _normalizePin(pin) — pastikan string
   */
  function _normalizePin(pin) {
    return String(pin).trim();
  }

  /**
   * _buildSiswaUser(siswa) — bangun objek user untuk role SISWA
   * Data master siswa biasanya: { nisn, nama, kelas, jurusan, pin, ... }
   */
  function _buildSiswaUser(siswa) {
    return {
      role      : ROLE.SISWA,
      nisn      : siswa.nisn,
      nama      : siswa.nama,
      kelas     : siswa.kelas     || '',
      jurusan   : siswa.jurusan   || '',
      foto      : siswa.foto      || null,
      noWa      : siswa.noWa      || siswa.no_wa || '',
      loginTime : new Date().toISOString(),
    };
  }

  /**
   * _buildGuruUser(guru) — bangun objek user untuk role GURU / ADMIN / KEPSEK
   * Data master guru biasanya: { nip, nama, jabatan, mapel, pin, role, ... }
   */
  function _buildGuruUser(guru) {
    // Tentukan role: kalau guru punya field 'role' pakai itu, default GURU
    const role = (() => {
      const r = String(guru.role || guru.jabatan || '').toUpperCase();
      if (r.includes('ADMIN'))          return ROLE.ADMIN;
      if (r.includes('KEPALA SEKOLAH') || r.includes('KEPSEK')) return ROLE.KEPSEK;
      return ROLE.GURU;
    })();

    return {
      role      : role,
      nip       : guru.nip,
      nama      : guru.nama,
      jabatan   : guru.jabatan   || '',
      mapel     : guru.mapel     || [],
      foto      : guru.foto      || null,
      noWa      : guru.noWa      || guru.no_wa || '',
      loginTime : new Date().toISOString(),
    };
  }

  /**
   * login(id, pin)
   * @param {string|number} id  — NISN (10 digit) atau NIP
   * @param {string|number} pin
   * @returns {{ ok: boolean, role?: string, user?: object, error?: string }}
   */
  function login(id, pin) {
    const idStr  = String(id).trim();
    const pinStr = _normalizePin(pin);

    if (!idStr || !pinStr) {
      return { ok: false, error: 'ID dan PIN tidak boleh kosong' };
    }

    const appState = window.APP_STATE;
    if (!appState) {
      console.error('[Auth] login: APP_STATE belum dimuat');
      return { ok: false, error: 'Data master belum dimuat. Silakan refresh.' };
    }

    if (_isSiswa(idStr)) {
      // ── Cari di masterSiswa ──────────────────────────────────────────────
      const list = appState.masterSiswa || [];
      const found = list.find(s =>
        String(s.nisn).trim() === idStr &&
        _normalizePin(s.pin)  === pinStr
      );
      if (!found) {
        return { ok: false, error: 'NISN atau PIN salah' };
      }
      const user = _buildSiswaUser(found);
      setCurrentUser(user);
      console.info('[Auth] Login siswa:', user.nama, '/', user.kelas);
      return { ok: true, role: ROLE.SISWA, user };

    } else {
      // ── Cari di masterGuru ───────────────────────────────────────────────
      const list = appState.masterGuru || [];
      const found = list.find(g =>
        String(g.nip).trim() === idStr &&
        _normalizePin(g.pin)  === pinStr
      );
      if (!found) {
        return { ok: false, error: 'NIP atau PIN salah' };
      }
      const user = _buildGuruUser(found);
      setCurrentUser(user);
      console.info('[Auth] Login guru:', user.nama, '/', user.role);
      return { ok: true, role: user.role, user };
    }
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  /**
   * logout() — hapus session, redirect ke landing page
   */
  function logout() {
    clearSession();
    // Beri kesempatan App lain bersih-bersih dulu
    if (window.App && typeof window.App.onLogout === 'function') {
      window.App.onLogout();
      return;
    }
    if (window.Router && typeof window.Router.go === 'function') {
      window.Router.go('landing');
      return;
    }
    const landing = (window.APP_STATE?.basePath || '') + LANDING_PATH;
    try {
      window.location.replace(landing);
    } catch (e) {
      window.location.reload();
    }
  }

  // ─── Expose ───────────────────────────────────────────────────────────────

  return {
    ROLE,
    getCurrentUser,
    setCurrentUser,
    clearSession,
    isLoggedIn,
    login,
    logout,
  };
})();

window.Auth = Auth;
