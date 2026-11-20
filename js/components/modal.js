/**
 * Modal Component — Super App Sekolah Terpadu
 * IIFE pattern, export ke window.Modal
 * Backdrop blur, animate scale in, mobile full-width, desktop max-w-md
 */
const Modal = (() => {
  let _overlay = null;
  let _currentOnConfirm = null;
  let _currentOnCancel  = null;

  function _ensureOverlay() {
    if (!_overlay || !document.body.contains(_overlay)) {
      _overlay = document.getElementById('modal-overlay');
      if (!_overlay) {
        _overlay = document.createElement('div');
        _overlay.id = 'modal-overlay';
        _overlay.className = 'modal-overlay';
        _overlay.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title"></div>`;
        document.body.appendChild(_overlay);

        // Klik backdrop → cancel
        _overlay.addEventListener('click', (e) => {
          if (e.target === _overlay) _handleCancel();
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && _overlay.classList.contains('modal-open')) _handleCancel();
        });
      }
    }
    return _overlay;
  }

  function _getBox() {
    return _ensureOverlay().querySelector('.modal-box');
  }

  function _handleConfirm() {
    if (typeof _currentOnConfirm === 'function') _currentOnConfirm();
    hide();
  }

  function _handleCancel() {
    if (typeof _currentOnCancel === 'function') _currentOnCancel();
    hide();
  }

  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Modal.show({ title, body, confirmText, cancelText, onConfirm, onCancel, type })
   * type: 'confirm' | 'alert' | 'form'
   */
  function show({ title = '', body = '', confirmText = 'OK', cancelText = 'Batal',
                  onConfirm = null, onCancel = null, type = 'alert', dangerous = false } = {}) {
    _currentOnConfirm = onConfirm;
    _currentOnCancel  = onCancel;

    const overlay = _ensureOverlay();
    const box = _getBox();

    const confirmBtnClass = dangerous
      ? 'btn-danger'
      : (type === 'confirm' ? 'btn-primary' : 'btn-primary');

    const cancelBtnHtml = (type === 'confirm' || type === 'form')
      ? `<button class="btn-ghost modal-cancel-btn">${_escape(cancelText)}</button>`
      : '';

    box.innerHTML = `
      <div class="modal-header">
        <h2 id="modal-title" class="modal-title">${_escape(title)}</h2>
        <button class="modal-close-x" aria-label="Tutup">&times;</button>
      </div>
      <div class="modal-body">${body}</div>
      <div class="modal-footer">
        ${cancelBtnHtml}
        <button class="${confirmBtnClass} modal-confirm-btn">${_escape(confirmText)}</button>
      </div>
    `;

    box.querySelector('.modal-confirm-btn').addEventListener('click', _handleConfirm);
    box.querySelector('.modal-close-x').addEventListener('click', _handleCancel);
    if (type !== 'alert') {
      const cancelEl = box.querySelector('.modal-cancel-btn');
      if (cancelEl) cancelEl.addEventListener('click', _handleCancel);
    }

    overlay.classList.add('modal-open');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => box.classList.add('modal-scale-in'));
    });
  }

  function hide() {
    if (!_overlay) return;
    const box = _getBox();
    box.classList.remove('modal-scale-in');
    _overlay.classList.remove('modal-open');
    _currentOnConfirm = null;
    _currentOnCancel  = null;
  }

  /**
   * Modal.form({ title, fields[], onSubmit })
   * fields: [{ name, label, type, placeholder, required }]
   */
  function form({ title = 'Form', fields = [], onSubmit = null, confirmText = 'Simpan', cancelText = 'Batal' } = {}) {
    const fieldsHtml = fields.map(f => {
      const reqAttr    = f.required ? 'required' : '';
      const reqMark    = f.required ? '<span class="text-red-500 ml-1">*</span>' : '';
      const isTextarea = f.type === 'textarea';
      const isSelect   = f.type === 'select';

      let inputHtml;
      if (isTextarea) {
        inputHtml = `<textarea id="mf-${_escape(f.name)}" name="${_escape(f.name)}"
          class="modal-form-input" placeholder="${_escape(f.placeholder || '')}"
          rows="3" ${reqAttr}></textarea>`;
      } else if (isSelect && Array.isArray(f.options)) {
        const opts = f.options.map(o =>
          typeof o === 'object'
            ? `<option value="${_escape(o.value)}">${_escape(o.label)}</option>`
            : `<option value="${_escape(o)}">${_escape(o)}</option>`
        ).join('');
        inputHtml = `<select id="mf-${_escape(f.name)}" name="${_escape(f.name)}"
          class="modal-form-input" ${reqAttr}>${opts}</select>`;
      } else {
        inputHtml = `<input id="mf-${_escape(f.name)}" name="${_escape(f.name)}"
          type="${_escape(f.type || 'text')}" class="modal-form-input"
          placeholder="${_escape(f.placeholder || '')}" ${reqAttr} />`;
      }

      return `
        <div class="modal-form-group">
          <label for="mf-${_escape(f.name)}" class="modal-form-label">${_escape(f.label)}${reqMark}</label>
          ${inputHtml}
        </div>
      `;
    }).join('');

    const bodyHtml = `<form id="modal-dynamic-form" novalidate>${fieldsHtml}</form>`;

    show({
      title,
      body: bodyHtml,
      confirmText,
      cancelText,
      type: 'form',
      onConfirm: () => {
        const formEl = document.getElementById('modal-dynamic-form');
        if (!formEl) return;
        // Native validation
        if (!formEl.checkValidity()) {
          formEl.reportValidity();
          return; // jangan tutup modal jika invalid
        }
        const data = {};
        fields.forEach(f => {
          const el = formEl.elements[f.name];
          if (el) data[f.name] = el.value;
        });
        if (typeof onSubmit === 'function') onSubmit(data);
        hide();
      },
    });

    // Prevent form submit default
    requestAnimationFrame(() => {
      const formEl = document.getElementById('modal-dynamic-form');
      if (formEl) formEl.addEventListener('submit', e => e.preventDefault());
    });
  }

  /** Shorthand: konfirmasi berbahaya (tombol merah) */
  function confirm({ title, body, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal',
                     onConfirm, onCancel } = {}) {
    show({ title, body, confirmText, cancelText, onConfirm, onCancel, type: 'confirm', dangerous: true });
  }

  /** Shorthand: alert informasi */
  function alert({ title, body, confirmText = 'OK' } = {}) {
    show({ title, body, confirmText, type: 'alert' });
  }

  return { show, hide, form, confirm, alert };
})();

window.Modal = Modal;
