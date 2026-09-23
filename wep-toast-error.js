/* Toast error con acción — un solo error: copiar al portapapeles (sin modal). */

(function () {
  'use strict';

  var ERROR_INFO = {
    screen: 'Surtido',
    title: 'Ocurrió un error',
    incident: 'No se encontraron surtidos para el almacén seleccionado.',
    code: 'WEP-ACC-4042',
    tenantId: 'tnt-mx-wep-04821',
    requestId: 'req-7f3a9c2e-4b1d-48e0-9a55-c8d2e1f0a6b4',
    version: '3.12.4',
    timestamp: '2026-09-17T15:42:18Z'
  };

  /* Debe coincidir con --toast-duration de wep-toast-error.css */
  var TOAST_DURATION = 14000;

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
      'Error: ' + info.incident,
      'Tenant ID: ' + info.tenantId,
      'Request ID: ' + info.requestId,
      'Pantalla: ' + info.screen,
      'Código de error: ' + info.code,
      'Versión (de WEP): ' + info.version,
      'Fecha y Hora (UTC): ' + info.timestamp
    ].join('\n');
  }

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

    toast.querySelector('.toast__action').addEventListener('click', function () {
      copyToClipboard(buildPayload(ERROR_INFO));
      dismiss();
    });

    toast.addEventListener('mouseenter', pause);
    toast.addEventListener('mouseleave', resume);
    toast.addEventListener('focusin', pause);
    toast.addEventListener('focusout', resume);

    region.appendChild(toast);
    toastTimer = window.setTimeout(dismiss, remaining);
  }

  function init() {
    showErrorToast();
    document.querySelector('.generic-page').addEventListener('click', showErrorToast);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
