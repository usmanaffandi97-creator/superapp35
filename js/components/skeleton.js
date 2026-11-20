/**
 * Skeleton Component — Super App Sekolah Terpadu
 * IIFE pattern, export ke window.Skeleton
 * Return HTML string — gunakan CSS class .skeleton dari app.css (shimmer animation)
 */
const Skeleton = (() => {

  /**
   * Kartu skeleton (mirip .card dengan gambar + teks)
   * @param {number} count
   * @returns {string} HTML
   */
  function card(count = 1) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="card skeleton-card" aria-hidden="true">
          <div class="skeleton skeleton-card-img"></div>
          <div class="skeleton-card-body">
            <div class="skeleton skeleton-line" style="width:60%;height:16px;margin-bottom:8px;"></div>
            <div class="skeleton skeleton-line" style="width:85%;height:12px;margin-bottom:6px;"></div>
            <div class="skeleton skeleton-line" style="width:70%;height:12px;margin-bottom:6px;"></div>
            <div class="skeleton skeleton-line" style="width:40%;height:12px;"></div>
          </div>
        </div>`;
    }
    return html;
  }

  /**
   * Tabel skeleton
   * @param {number} rows
   * @param {number} cols
   * @returns {string} HTML
   */
  function table(rows = 5, cols = 4) {
    // Header
    let headerCols = '';
    for (let c = 0; c < cols; c++) {
      headerCols += `<th><div class="skeleton skeleton-line" style="width:70%;height:14px;"></div></th>`;
    }

    // Body rows
    let bodyRows = '';
    for (let r = 0; r < rows; r++) {
      let rowCols = '';
      for (let c = 0; c < cols; c++) {
        // Variasi lebar agar terlihat natural
        const widths = ['55%', '75%', '65%', '80%', '50%', '90%'];
        const w = widths[(r + c) % widths.length];
        rowCols += `<td><div class="skeleton skeleton-line" style="width:${w};height:13px;"></div></td>`;
      }
      bodyRows += `<tr>${rowCols}</tr>`;
    }

    return `
      <div class="skeleton-table-wrapper" aria-hidden="true">
        <table class="skeleton-table">
          <thead><tr>${headerCols}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
  }

  /**
   * List item skeleton (avatar bulat + dua baris teks)
   * @param {number} count
   * @returns {string} HTML
   */
  function list(count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-list-item" aria-hidden="true">
          <div class="skeleton skeleton-avatar"></div>
          <div class="skeleton-list-content">
            <div class="skeleton skeleton-line" style="width:55%;height:14px;margin-bottom:6px;"></div>
            <div class="skeleton skeleton-line" style="width:80%;height:12px;"></div>
          </div>
        </div>`;
    }
    return html;
  }

  /**
   * Paragraf teks skeleton
   * @param {number} lines
   * @returns {string} HTML
   */
  function text(lines = 3) {
    const widths = ['100%', '90%', '95%', '85%', '75%', '100%', '88%'];
    let html = '<div class="skeleton-text-block" aria-hidden="true">';
    for (let i = 0; i < lines; i++) {
      const isLast = i === lines - 1;
      const w = isLast ? '60%' : widths[i % widths.length];
      html += `<div class="skeleton skeleton-line" style="width:${w};height:14px;margin-bottom:${isLast ? 0 : 8}px;"></div>`;
    }
    html += '</div>';
    return html;
  }

  return { card, table, list, text };
})();

window.Skeleton = Skeleton;
