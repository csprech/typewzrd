/* ============================================================
   WZRD Platform SDK — platform/sdk.js
   Standard user-state + shell services for WZRD tools.

   Tools talk to the platform exclusively through `window.WZRD`:

     WZRD.state.load(toolId)            -> Promise<object|null>
     WZRD.state.save(toolId, data)      -> Promise<{ok, ts}>
     WZRD.state.autosave(toolId, fn, ms)-> debounced saver
     WZRD.state.onStatus(cb)            -> sync status events
     WZRD.ui.toast(msg, kind?)          -> transient shell toast
     WZRD.util.uid(prefix?)             -> short unique id
     WZRD.util.debounce(fn, ms)

   Cloud transport: when the host shell exposes
   `window.__WZRD_CLOUD__` (injected by the platform frame) it is
   used; otherwise the SDK persists to a namespaced localStorage
   mirror so tools behave identically when opened standalone.
   ============================================================ */
(function () {
  'use strict';

  var NS = 'wzrd:user-state:';
  var listeners = [];

  function emit(status, detail) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](status, detail || null); } catch (e) { /* listener errors stay local */ }
    }
  }

  function cloud() {
    var c = window.__WZRD_CLOUD__;
    return (c && typeof c.get === 'function' && typeof c.put === 'function') ? c : null;
  }

  function localGet(key) {
    try {
      var raw = window.localStorage.getItem(NS + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function localPut(key, data) {
    try {
      window.localStorage.setItem(NS + key, JSON.stringify(data));
      return true;
    } catch (e) { return false; }
  }

  function load(toolId) {
    emit('loading', { toolId: toolId });
    var c = cloud();
    if (c) {
      return Promise.resolve(c.get(toolId)).then(function (data) {
        emit('loaded', { toolId: toolId, source: 'cloud' });
        return data || localGet(toolId);
      }).catch(function () {
        emit('loaded', { toolId: toolId, source: 'local' });
        return localGet(toolId);
      });
    }
    var data = localGet(toolId);
    emit('loaded', { toolId: toolId, source: 'local' });
    return Promise.resolve(data);
  }

  function save(toolId, data) {
    var ts = Date.now();
    var payload = { v: 1, ts: ts, data: data };
    emit('saving', { toolId: toolId });
    var c = cloud();
    localPut(toolId, payload); // local mirror always written first
    if (c) {
      return Promise.resolve(c.put(toolId, payload)).then(function () {
        emit('saved', { toolId: toolId, ts: ts, source: 'cloud' });
        return { ok: true, ts: ts };
      }).catch(function () {
        emit('saved', { toolId: toolId, ts: ts, source: 'local' });
        return { ok: true, ts: ts, degraded: true };
      });
    }
    emit('saved', { toolId: toolId, ts: ts, source: 'local' });
    return Promise.resolve({ ok: true, ts: ts });
  }

  function debounce(fn, ms) {
    var t = null;
    var wrapped = function () {
      var args = arguments, self = this;
      if (t) { window.clearTimeout(t); }
      t = window.setTimeout(function () { t = null; fn.apply(self, args); }, ms || 250);
    };
    wrapped.flush = function () {
      if (t) { window.clearTimeout(t); t = null; fn.apply(this); }
    };
    return wrapped;
  }

  function autosave(toolId, collect, ms) {
    return debounce(function () { save(toolId, collect()); }, ms || 600);
  }

  /* ---- shell toasts ------------------------------------------------ */
  var toastHost = null;
  function ensureToastHost() {
    if (toastHost && document.body.contains(toastHost)) { return toastHost; }
    toastHost = document.createElement('div');
    toastHost.className = 'wz-toast-host';
    toastHost.setAttribute('role', 'status');
    toastHost.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastHost);
    return toastHost;
  }

  function toast(msg, kind) {
    var host = ensureToastHost();
    var el = document.createElement('div');
    el.className = 'wz-toast' + (kind ? ' wz-toast--' + kind : '');
    el.textContent = msg;
    host.appendChild(el);
    window.setTimeout(function () { el.classList.add('is-out'); }, 2600);
    window.setTimeout(function () { if (el.parentNode) { el.parentNode.removeChild(el); } }, 3100);
  }

  var uidSeq = 0;
  function uid(prefix) {
    uidSeq = (uidSeq + 1) % 46656;
    return (prefix || 'wz') + '-' + Date.now().toString(36) + uidSeq.toString(36);
  }

  window.WZRD = {
    version: '1.4.0',
    state: {
      load: load,
      save: save,
      autosave: autosave,
      onStatus: function (cb) { if (typeof cb === 'function') { listeners.push(cb); } }
    },
    ui: { toast: toast },
    util: { uid: uid, debounce: debounce }
  };
})();
