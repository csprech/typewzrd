/* ============================================================
   TypoWzrd — boot sequence
   Restore cloud user-state via the WZRD SDK, build controls,
   render, and wire cross-cutting listeners.
   ============================================================ */
(function () {
  'use strict';

  var TW = window.TW, V = window.TW_VIEWS, C = window.TW_CONTROLS;

  function syncPill() {
    var pill = document.getElementById('syncPill');
    var label = document.getElementById('syncLabel');
    window.WZRD.state.onStatus(function (status, detail) {
      if (status === 'saving') {
        pill.classList.add('is-saving');
        label.textContent = 'Saving…';
      } else if (status === 'saved') {
        pill.classList.remove('is-saving');
        pill.classList.toggle('is-local', !!(detail && detail.source === 'local'));
        label.textContent = detail && detail.source === 'local' ? 'Saved locally' : 'Synced';
      }
    });
  }

  function boot() {
    syncPill();
    TW.restore(function () {
      C.init();
      window.TW_EXPORT.init();
      V.setMode(TW.state.mode);

      // web-font status feeds the statusbar + fallback badges in headers
      TW.on('fontstatus', function (status) {
        C.syncSourceNote();
        if (status === 'ok' || status === 'fail') { V.renderAll(); }
      });

      if (TW.state.source === 'web') {
        TW.ensureWebFonts(TW.requiredFamilies(TW.matches()), function (ok) {
          if (!ok) {
            window.WZRD.ui.toast('Web fonts unreachable — using closest system stacks', 'warn');
          }
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
