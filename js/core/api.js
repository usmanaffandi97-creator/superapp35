/**
 * api.js — Semua komunikasi ke Google Apps Script backend
 * Ekspor: window.API
 * Pattern: IIFE, tanpa bundler
 */
const API = (() => {
  'use strict';

  const GAS_KEY     = 'SUPERAPP_BACKEND_URL';
  const TIMEOUT_MS  = 15_000;
  const MAX_RETRY   = 1;

  // ─── URL Management ───────────────────────────────────────────────────────

  function getUrl() {
    return localStorage.getItem(GAS_KEY) || window.DEFAULT_GAS_API_URL || null;
  }

  function isConnected() {
    return Boolean(getUrl());
  }

  function setUrl(url) {
    if (!url || typeof url !== 'string') {
      console.error('[API] setUrl: URL tidak valid', url);
      return false;
    }
    localStorage.setItem(GAS_KEY, url.trim());
    return true;
  }

  function clearUrl() {
    localStorage.removeItem(GAS_KEY);
  }

  // ─── Internal fetch helper ─────────────────────────────────────────────────

  /**
   * _fetchWithTimeout — fetch + AbortController untuk timeout
   */
  async function _fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timerId    = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timerId);
      return response;
    } catch (err) {
      clearTimeout(timerId);
      throw err;
    }
  }

  /**
   * _request — inti pengiriman, with 1 retry
   * @param {Function} attemptFn — fungsi yang mengembalikan Promise<Response>
   * @returns {{ ok: boolean, data?: any, error?: string }}
   */
  async function _request(attemptFn) {
    let lastErr;
    for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
      try {
        const response = await attemptFn();
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const json = await response.json();
        // GAS kadang wrap di { status:'success', data:... } — normalkan
        if (json && typeof json === 'object' && 'data' in json) {
          return { ok: true, data: json.data };
        }
        return { ok: true, data: json };
      } catch (err) {
        lastErr = err;
        if (attempt < MAX_RETRY) {
          console.warn(`[API] Gagal (percobaan ${attempt + 1}), retry...`, err.message);
          await _sleep(500);
        }
      }
    }
    console.error('[API] Request gagal setelah retry:', lastErr);
    return { ok: false, error: lastErr?.message || 'Unknown error' };
  }

  function _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ─── Public: GET ──────────────────────────────────────────────────────────

  /**
   * get(action, params) — GET ke GAS
   * URL: BASE?action=ACTION&data=JSON_ENCODED_PARAMS&...extra
   * @returns Promise<{ ok, data?, error? }>
   */
  async function get(action, params = {}) {
    const base = getUrl();
    if (!base) {
      console.error('[API] get: Backend URL belum dikonfigurasi');
      return { ok: false, error: 'Backend URL belum dikonfigurasi' };
    }

    const url = new URL(base);
    url.searchParams.set('action', action);
    if (Object.keys(params).length) {
      url.searchParams.set('data', JSON.stringify(params));
    }

    return _request(() => _fetchWithTimeout(url.toString(), {
      method: 'GET',
      cache:  'no-store',
    }));
  }

  // ─── Public: POST ─────────────────────────────────────────────────────────

  /**
   * post(action, data) — POST ke GAS dengan JSON body
   * @returns Promise<{ ok, data?, error? }>
   */
  async function post(action, data = {}) {
    const base = getUrl();
    if (!base) {
      console.error('[API] post: Backend URL belum dikonfigurasi');
      return { ok: false, error: 'Backend URL belum dikonfigurasi' };
    }

    const body = JSON.stringify({ action, data });

    return _request(() => _fetchWithTimeout(base, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      cache:   'no-store',
    }));
  }

  // ─── Public: ping ─────────────────────────────────────────────────────────

  /**
   * ping() — test koneksi ke GAS backend
   * @returns Promise<{ ok, latencyMs?, error? }>
   */
  async function ping() {
    const t0     = Date.now();
    const result = await get('ping');
    if (result.ok) {
      return { ok: true, latencyMs: Date.now() - t0 };
    }
    return result;
  }

  // ─── Public: getInitialData ───────────────────────────────────────────────

  /**
   * getInitialData() — load semua data master saat app start
   * Mengisi window.APP_STATE.master.*
   * @returns Promise<{ ok, data?, error? }>
   */
  async function getInitialData() {
    const result = await get('getInitialData');
    if (result.ok && result.data) {
      // Simpan ke APP_STATE agar modul lain bisa akses synchronously
      if (!window.APP_STATE) window.APP_STATE = {};
      const d = result.data;
      window.APP_STATE.masterSiswa  = d.masterSiswa  || [];
      window.APP_STATE.masterGuru   = d.masterGuru   || [];
      window.APP_STATE.pengaturan   = d.pengaturan   || {};
      window.APP_STATE.sekolah      = d.sekolah      || {};
      window.APP_STATE.tahunAjaran  = d.tahunAjaran  || '';
      window.APP_STATE.semester     = d.semester      || '';
      // Data tambahan bebas dari GAS
      Object.keys(d).forEach(key => {
        if (!(key in window.APP_STATE)) {
          window.APP_STATE[key] = d[key];
        }
      });
    }
    return result;
  }

  // ─── Expose ───────────────────────────────────────────────────────────────

  return {
    getUrl,
    isConnected,
    setUrl,
    clearUrl,
    get,
    post,
    ping,
    getInitialData,
  };
})();

window.API = API;
