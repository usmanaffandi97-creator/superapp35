/**
 * utils.js — Helper functions global
 * Ekspor: window.Utils
 * Pattern: IIFE, tanpa bundler
 */
const Utils = (() => {
  'use strict';

  // ─── Tanggal & Waktu ──────────────────────────────────────────────────────

  /**
   * formatTanggal(dateStr, format)
   * @param {string|Date} dateStr
   * @param {'long'|'short'|'numeric'} format
   *   long    → "Senin, 18 November 2026"
   *   short   → "18 Nov 2026"
   *   numeric → "18/11/2026"
   */
  function formatTanggal(dateStr, format = 'long') {
    if (!dateStr) return '-';
    try {
      const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
      if (isNaN(date.getTime())) return String(dateStr);

      if (format === 'numeric') {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
      }

      const opts = format === 'short'
        ? { day: 'numeric', month: 'short', year: 'numeric' }
        : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

      return date.toLocaleDateString('id-ID', opts);
    } catch (e) {
      console.error('[Utils] formatTanggal error:', e);
      return String(dateStr);
    }
  }

  /**
   * formatJam(timeStr)
   * Input: "14:05" atau "2026-11-18T14:05:00" atau Date
   * Output: "14.05" (gaya Indonesia)
   */
  function formatJam(timeStr) {
    if (!timeStr) return '-';
    try {
      // kalau cuma "HH:MM" atau "HH:MM:SS"
      if (typeof timeStr === 'string' && /^\d{1,2}:\d{2}/.test(timeStr)) {
        const [h, m] = timeStr.split(':');
        return `${String(h).padStart(2, '0')}.${m}`;
      }
      const date = timeStr instanceof Date ? timeStr : new Date(timeStr);
      if (isNaN(date.getTime())) return String(timeStr);
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      return `${h}.${m}`;
    } catch (e) {
      return String(timeStr);
    }
  }

  /**
   * isToday(dateStr) — apakah tanggal adalah hari ini
   */
  function isToday(dateStr) {
    if (!dateStr) return false;
    try {
      const d    = new Date(dateStr);
      const now  = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth()    === now.getMonth() &&
        d.getDate()     === now.getDate()
      );
    } catch {
      return false;
    }
  }

  // ─── Avatar / Inisial ─────────────────────────────────────────────────────

  /**
   * getInitials(nama) — 2 huruf inisial dari nama
   * "Budi Santoso" → "BS", "Siti" → "SI"
   */
  function getInitials(nama) {
    if (!nama) return '??';
    const words = String(nama).trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  /**
   * getAvatarColor(nama) — gradient konsisten berdasar hash nama
   * Returns string CSS gradient, misal: "linear-gradient(135deg, #3b82f6, #7c3aed)"
   */
  function getAvatarColor(nama) {
    const GRADIENTS = [
      ['#3b82f6', '#7c3aed'],  // blue-purple
      ['#06b6d4', '#3b82f6'],  // cyan-blue
      ['#10b981', '#06b6d4'],  // emerald-cyan
      ['#f59e0b', '#ef4444'],  // amber-red
      ['#8b5cf6', '#ec4899'],  // violet-pink
      ['#14b8a6', '#8b5cf6'],  // teal-violet
      ['#f97316', '#ef4444'],  // orange-red
      ['#6366f1', '#3b82f6'],  // indigo-blue
    ];
    if (!nama) return `linear-gradient(135deg, ${GRADIENTS[0][0]}, ${GRADIENTS[0][1]})`;

    // Simple djb2 hash
    let hash = 5381;
    for (let i = 0; i < nama.length; i++) {
      hash = ((hash << 5) + hash) ^ nama.charCodeAt(i);
    }
    const idx = Math.abs(hash) % GRADIENTS.length;
    return `linear-gradient(135deg, ${GRADIENTS[idx][0]}, ${GRADIENTS[idx][1]})`;
  }

  // ─── String ───────────────────────────────────────────────────────────────

  /**
   * sanitize(str) — escape karakter HTML berbahaya
   */
  function sanitize(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

  // ─── Function helpers ─────────────────────────────────────────────────────

  /**
   * debounce(fn, ms) — tunda eksekusi fn sampai tidak dipanggil selama ms ms
   */
  function debounce(fn, ms = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // ─── Clipboard ────────────────────────────────────────────────────────────

  /**
   * copyToClipboard(text) — copy teks ke clipboard
   * @returns Promise<boolean>
   */
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback untuk browser lama / HTTP
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch (e) {
      console.error('[Utils] copyToClipboard error:', e);
      return false;
    }
  }

  // ─── WhatsApp / Telepon ───────────────────────────────────────────────────

  /**
   * formatPhone(phone) — ubah nomor lokal ke format internasional 628xx
   * "08123456789" → "628123456789"
   * "628123456789" → "628123456789"
   */
  function formatPhone(phone) {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('628')) return digits;
    if (digits.startsWith('08'))  return '62' + digits.slice(1);
    if (digits.startsWith('8'))   return '62' + digits;
    return digits;
  }

  /**
   * openWhatsApp(phone, message) — buka wa.me link di tab baru
   */
  function openWhatsApp(phone, message = '') {
    const formatted = formatPhone(phone);
    if (!formatted) {
      console.warn('[Utils] openWhatsApp: nomor telepon tidak valid', phone);
      return;
    }
    const url = `https://wa.me/${formatted}` + (message
      ? `?text=${encodeURIComponent(message)}`
      : '');
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // ─── File / Print ─────────────────────────────────────────────────────────

  /**
   * downloadBlob(blob, filename) — trigger download file dari Blob
   */
  function downloadBlob(blob, filename = 'download') {
    if (!(blob instanceof Blob)) {
      console.error('[Utils] downloadBlob: argumen bukan Blob');
      return;
    }
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Bersihkan URL object setelah sedikit delay
    setTimeout(() => URL.revokeObjectURL(url), 5_000);
  }

  /**
   * printElement(selector) — print elemen spesifik ke PDF via print dialog
   * Menyembunyikan semua elemen lain sementara
   */
  function printElement(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      console.error('[Utils] printElement: elemen tidak ditemukan:', selector);
      return;
    }

    // Buat style sementara
    const style     = document.createElement('style');
    const printId   = `print-target-${Date.now()}`;
    el.dataset.printId = printId;
    style.textContent = `
      @media print {
        body > *:not([data-print-id="${printId}"]) { display: none !important; }
        [data-print-id="${printId}"] { display: block !important; }
      }
    `;
    document.head.appendChild(style);

    window.print();

    // Cleanup setelah dialog ditutup (kira-kira)
    setTimeout(() => {
      document.head.removeChild(style);
      delete el.dataset.printId;
    }, 1_000);
  }

  // ─── Expose ───────────────────────────────────────────────────────────────

  return {
    formatTanggal,
    formatJam,
    isToday,
    getInitials,
    getAvatarColor,
    sanitize,
    debounce,
    copyToClipboard,
    formatPhone,
    openWhatsApp,
    downloadBlob,
    printElement,
  };
})();

window.Utils = Utils;
