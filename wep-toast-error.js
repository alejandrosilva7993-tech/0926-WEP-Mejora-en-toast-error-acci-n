/* Toast error con acción — prototipo WEP
   HU: incorporar "Copiar información de error" en toasts de error. */

(function () {
  'use strict';

  var ERROR_INFO = {
    screen: 'Surtido',
    title: 'Ocurrió un error',
    incident: 'No se encontraron surtidos para el almacén seleccionado.',
    code: 'WEP-ACC-4042',
    tenantId: 'tnt-mx-wep-04821',
    timestamp: '2026-09-17T15:42:18Z',
    user: 'a.silva'
  };

  /* Debe coincidir con --toast-duration de wep-toast-error.css */
  var TOAST_DURATION = 10000;

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildPayload(info) {
    return [
      '=== Información para ticket de soporte WEP ===',
      'Pantalla: ' + info.screen,
      'Código de error: ' + info.code,
      'Tenant ID: ' + info.tenantId,
      'Fecha/hora (UTC): ' + info.timestamp,
      'Usuario: ' + info.user,
      '============================================='
    ].join('\n');
  }

  /* ---------------------------------------------------------------------------
     Portapapeles
  --------------------------------------------------------------------------- */

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(legacyCopy);
    } else {
      legacyCopy();
    }

    function legacyCopy() {
      var area = document.createElement('textarea');

      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();

      try {
        document.execCommand('copy');
      } catch (err) {
        /* Sin portapapeles disponible en este entorno. */
      }

      document.body.removeChild(area);
    }
  }

  /* ---------------------------------------------------------------------------
     Toast
  --------------------------------------------------------------------------- */

  var toastTimer = null;

  function showErrorToast() {
    var region = $('toastRegion');

    region.innerHTML = '';
    window.clearTimeout(toastTimer);

    var toast = document.createElement('div');

    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    toast.innerHTML =
      '<div class="toast__top">' +
        '<span class="toast__icon" aria-hidden="true">' +
          '<svg class="toast__icon-x" viewBox="0 0 24 24" fill="none">' +
            '<path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>' +
          '</svg>' +
        '</span>' +
        '<div class="toast__content">' +
          '<p class="toast__title">' + escapeHtml(ERROR_INFO.title) + '</p>' +
          '<p class="toast__text">' + escapeHtml(ERROR_INFO.incident) + '</p>' +
        '</div>' +
        '<button type="button" class="toast__close" aria-label="Cerrar notificación">' +
          '<i class="pi pi-times" aria-hidden="true"></i>' +
        '</button>' +
      '</div>' +
      '<div class="toast__actions">' +
        '<button type="button" class="toast__action">' +
          '<i class="pi pi-copy" aria-hidden="true"></i>' +
          'Copiar información de error' +
        '</button>' +
      '</div>' +
      '<span class="toast__progress" aria-hidden="true"></span>';

    var progress = toast.querySelector('.toast__progress');
    var remaining = TOAST_DURATION;
    var startedAt = Date.now();

    function dismiss() {
      window.clearTimeout(toastTimer);
      toast.remove();
    }

    function pause() {
      window.clearTimeout(toastTimer);
      remaining -= Date.now() - startedAt;
      progress.style.animationPlayState = 'paused';
    }

    function resume() {
      if (remaining <= 0) return;
      startedAt = Date.now();
      progress.style.animationPlayState = 'running';
      toastTimer = window.setTimeout(dismiss, remaining);
    }

    toast.querySelector('.toast__close').addEventListener('click', dismiss);

    /* La acción copia de inmediato y el modal solo informa qué se copió;
       el toast ya cumplió su función, así que se retira. */
    toast.querySelector('.toast__action').addEventListener('click', function () {
      copyToClipboard(buildPayload(ERROR_INFO));
      dismiss();
      openErrorModal();
    });

    /* Mientras el usuario interactúa con el toast, la duración se detiene. */
    toast.addEventListener('mouseenter', pause);
    toast.addEventListener('mouseleave', resume);
    toast.addEventListener('focusin', pause);
    toast.addEventListener('focusout', resume);

    region.appendChild(toast);
    toastTimer = window.setTimeout(dismiss, remaining);
  }

  /* ---------------------------------------------------------------------------
     Modal
  --------------------------------------------------------------------------- */

  var lastFocus = null;

  function fillModal(info) {
    $('metaScreen').textContent = info.screen;
    $('metaCode').textContent = info.code;
    $('metaTenant').textContent = info.tenantId;
  }

  function openErrorModal() {
    lastFocus = document.activeElement;
    fillModal(ERROR_INFO);
    $('modalBackdrop').hidden = false;
    $('errorInfoModal').focus();
  }

  function closeErrorModal() {
    $('modalBackdrop').hidden = true;

    if (lastFocus && document.contains(lastFocus) && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }

  /* ---------------------------------------------------------------------------
     Inicio
  --------------------------------------------------------------------------- */

  function init() {
    fillModal(ERROR_INFO);
    showErrorToast();

    $('modalClose').addEventListener('click', closeErrorModal);
    $('modalCancel').addEventListener('click', closeErrorModal);

    $('modalBackdrop').addEventListener('click', function (event) {
      if (event.target === $('modalBackdrop')) closeErrorModal();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !$('modalBackdrop').hidden) {
        closeErrorModal();
      }
    });

    /* Ayuda de prototipo: clic en el área vacía de la pantalla vuelve a lanzar el toast. */
    document.querySelector('.generic-page').addEventListener('click', showErrorToast);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
