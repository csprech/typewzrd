/* ============================================================
   TypoWzrd — control surfaces
   Right sidebar (framework, mood, typography, palette, view mode),
   left sidebar (collections, recent tabs), canvas interactions.
   ============================================================ */
window.TW_CONTROLS = (function () {
  'use strict';

  var TW = window.TW, D = window.TW_DATA, V = window.TW_VIEWS;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var toast = window.WZRD.ui.toast;

  var rerender = window.WZRD.util.debounce(function () { V.renderAll(); }, 120);
  function commit() { TW.persist(); rerender(); }

  /* ══════════ right sidebar ══════════ */

  function buildSourceToggle() {
    var seg = $('#sourceToggle');
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-source]');
      if (!btn) { return; }
      TW.state.source = btn.getAttribute('data-source');
      seg.querySelectorAll('.wz-seg-btn').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      syncSourceNote();
      if (TW.state.source === 'web') {
        toast('Loading Google Fonts…');
        TW.ensureWebFonts(TW.requiredFamilies(TW.matches()), function (ok) {
          if (!ok) { toast('Web fonts unreachable — using closest system stacks', 'warn'); }
          syncSourceNote();
          rerender();
        });
      }
      commit();
    });
  }

  function syncSourceToggle() {
    document.querySelectorAll('#sourceToggle .wz-seg-btn').forEach(function (b) {
      var on = b.getAttribute('data-source') === TW.state.source;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function syncSourceNote() {
    var note = $('#fontSourceNote');
    if (TW.state.source === 'system') {
      note.textContent = 'Native system stacks · zero network';
    } else {
      var st = TW.webStatus();
      note.textContent = st === 'ok' ? 'Google Fonts · loaded'
        : st === 'fail' ? 'Google Fonts unreachable · system fallback active'
        : 'Google Fonts · loading…';
    }
  }

  function buildClassGrid() {
    var grid = $('#classGrid');
    grid.innerHTML = Object.keys(D.CLASSIFICATIONS).map(function (id) {
      var c = D.CLASSIFICATIONS[id];
      return '<button type="button" class="wz-class-btn" data-class="' + id + '" title="' + c.label + '">' +
        '<span class="wz-class-glyph" style="font-family:' + c.stack.replace(/"/g, '&quot;') + ';' + c.glyphStyle + '">' + c.glyph + '</span>' +
        '<span class="wz-class-name">' + c.label + '</span></button>';
    }).join('');
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-class]');
      if (!btn) { return; }
      var id = btn.getAttribute('data-class');
      TW.state.classFilter = (TW.state.classFilter === id) ? null : id;
      syncClassGrid();
      commit();
    });
  }

  function syncClassGrid() {
    document.querySelectorAll('.wz-class-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-class') === TW.state.classFilter);
    });
  }

  function buildTagGrid() {
    var grid = $('#tagGrid');
    grid.innerHTML = D.TAGS.map(function (t) {
      return '<button type="button" class="wz-tag" data-tag="' + t + '" aria-pressed="false">' + t + '</button>';
    }).join('');
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tag]');
      if (!btn) { return; }
      var tag = btn.getAttribute('data-tag');
      var idx = TW.state.tags.indexOf(tag);
      if (idx >= 0) { TW.state.tags.splice(idx, 1); } else { TW.state.tags.push(tag); }
      syncTagGrid();
      commit();
    });
  }

  function syncTagGrid() {
    document.querySelectorAll('.wz-tag').forEach(function (b) {
      var on = TW.state.tags.indexOf(b.getAttribute('data-tag')) >= 0;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function sliderRow(opts) {
    var row = document.createElement('div');
    row.className = 'wz-slider-row';
    row.innerHTML =
      '<div class="wz-slider-labels"><span>' + opts.label + '</span><span class="wz-slider-val"></span></div>' +
      '<input type="range" class="wz-range" min="' + opts.min + '" max="' + opts.max + '" step="' + opts.step + '">' +
      (opts.ends ? '<div class="wz-slider-ends"><span>' + opts.ends[0] + '</span><span>' + opts.ends[1] + '</span></div>' : '');
    var input = row.querySelector('input');
    var val = row.querySelector('.wz-slider-val');
    input.value = opts.get();
    val.textContent = opts.fmt(opts.get());
    input.addEventListener('input', function () {
      var v = parseFloat(input.value);
      opts.set(v);
      val.textContent = opts.fmt(v);
      opts.onInput();
    });
    return row;
  }

  function buildPersonalitySliders() {
    var host = $('#personalitySliders');
    host.innerHTML = '<span class="wz-label">Personality</span>';
    D.AXES.forEach(function (ax) {
      host.appendChild(sliderRow({
        label: ax.left + ' ⟷ ' + ax.right,
        min: -1, max: 1, step: 0.05,
        ends: [ax.left.toLowerCase(), ax.right.toLowerCase()],
        get: function () { return TW.state.personality[ax.id]; },
        set: function (v) { TW.state.personality[ax.id] = v; },
        fmt: function (v) { return (v > 0 ? '+' : '') + v.toFixed(2); },
        onInput: commit
      }));
    });
  }

  function buildTypoSliders() {
    var host = $('#typoParams');
    var anchor = host.firstElementChild; // custom text field stays last
    D.TYPO_PARAMS.forEach(function (p) {
      host.insertBefore(sliderRow({
        label: p.label,
        min: p.min, max: p.max, step: p.step,
        get: function () { return TW.state.typo[keyFor(p.id)]; },
        set: function (v) { TW.state.typo[keyFor(p.id)] = v; },
        fmt: p.fmt,
        onInput: function () {
          // pure CSS-var params: restyle without rebuilding (keeps caret in editables)
          var canvas = $('#canvas');
          canvas.style.setProperty('--tw-scale', String(TW.state.typo.scale));
          canvas.style.setProperty('--tw-lh', String(TW.state.typo.lineHeight));
          canvas.style.setProperty('--tw-track', TW.state.typo.tracking + 'em');
          if (TW.state.mode === 'mockups') { rerender(); } // SVG needs regeneration
          TW.persist();
        }
      }), anchor);
    });

    function keyFor(id) { return id === 'lineHeight' ? 'lineHeight' : id === 'scale' ? 'scale' : 'tracking'; }

    var input = $('#previewTextInput');
    input.value = TW.state.customText;
    input.addEventListener('input', function () {
      TW.state.customText = input.value.trim();
      TW.state.edits = {}; // global text supersedes per-column hand edits
      commit();
    });
  }

  function buildPaletteGrid() {
    var grid = $('#paletteGrid');
    grid.innerHTML = D.PALETTES.map(function (p) {
      return '<button type="button" class="wz-palette-btn" data-palette="' + p.id + '" role="option" aria-selected="false">' +
        '<span class="wz-palette-bar">' +
          '<span style="background:' + p.bg + '"></span>' +
          '<span style="background:' + p.text + '"></span>' +
          '<span style="background:' + p.accent + '"></span>' +
          '<span style="background:' + p.accent2 + '"></span>' +
        '</span>' +
        '<span class="wz-palette-name">' + p.name + '</span></button>';
    }).join('');
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-palette]');
      if (!btn) { return; }
      TW.state.paletteId = btn.getAttribute('data-palette');
      syncPaletteGrid();
      syncContrast();
      commit();
    });
  }

  function syncPaletteGrid() {
    document.querySelectorAll('.wz-palette-btn').forEach(function (b) {
      var on = b.getAttribute('data-palette') === TW.state.paletteId;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function syncContrast() {
    var r = TW.contrastReport();
    $('#contrastSwatches').innerHTML =
      '<i style="background:' + r.bg + '"></i><i style="background:' + r.fg + '"></i>';
    $('#contrastRatio').textContent = r.ratio + ':1';
    var v = $('#contrastVerdict');
    v.textContent = r.verdict;
    v.className = 'wz-contrast-verdict ' + r.cls;
  }

  function buildViewModeGrid() {
    var grid = $('#viewModeGrid');
    grid.innerHTML = D.VIEW_MODES.map(function (m) {
      var rects = m.icon.map(function (r) {
        return '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="1.5"/>';
      }).join('');
      return '<button type="button" class="wz-viewmode-btn" data-mode="' + m.id + '" role="radio" aria-checked="false">' +
        '<svg viewBox="0 0 33 26" aria-hidden="true">' + rects + '</svg><span>' + m.label + '</span></button>';
    }).join('');
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-mode]');
      if (!btn) { return; }
      V.setMode(btn.getAttribute('data-mode'));
    });
  }

  /* ══════════ left sidebar ══════════ */

  var COLLECTION_COLORS = ['#a88bfa', '#4dc9ff', '#ff6f5e', '#ffd166', '#7ce7a9', '#f49ac2'];

  function renderCollections() {
    var host = $('#collectionList');
    host.innerHTML = TW.state.collections.map(function (c) {
      return '<div class="wz-collection' + (TW.state.activeCollection === c.id ? ' is-active' : '') +
        '" data-collection="' + c.id + '" role="listitem" tabindex="0">' +
        '<span class="wz-collection-swatch" style="background:' + c.color + '"></span>' +
        '<span class="wz-collection-name">' + escText(c.name) + '</span>' +
        '<span class="wz-collection-count">' + c.items.length + '</span>' +
        '<button type="button" class="wz-collection-del" title="Delete collection" aria-label="Delete ' + escText(c.name) + '">×</button>' +
      '</div>';
    }).join('');
    $('#collectionsTotal').textContent = TW.state.collections.reduce(function (n, c) { return n + c.items.length; }, 0);
  }

  function escText(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function bindCollections() {
    $('#collectionList').addEventListener('click', function (e) {
      var row = e.target.closest('[data-collection]');
      if (!row) { return; }
      var id = row.getAttribute('data-collection');
      if (e.target.closest('.wz-collection-del')) {
        var col = TW.state.collections.filter(function (c) { return c.id === id; })[0];
        if (col && window.confirm('Delete collection “' + col.name + '”?')) {
          TW.state.collections = TW.state.collections.filter(function (c) { return c.id !== id; });
          if (TW.state.activeCollection === id) { TW.state.activeCollection = null; }
          renderCollections();
          commit();
        }
        return;
      }
      TW.state.activeCollection = (TW.state.activeCollection === id) ? null : id;
      renderCollections();
      commit();
    });

    $('#newCollectionBtn').addEventListener('click', function () {
      var name = window.prompt('Name the new collection:', 'Untitled Direction');
      if (!name || !name.trim()) { return; }
      var col = {
        id: window.WZRD.util.uid('col'),
        name: name.trim().slice(0, 40),
        color: COLLECTION_COLORS[TW.state.collections.length % COLLECTION_COLORS.length],
        items: []
      };
      TW.state.collections.push(col);
      TW.state.activeCollection = col.id;
      renderCollections();
      toast('Collection “' + col.name + '” created — save pairings into it');
      commit();
    });
  }

  function renderRecents() {
    var host = $('#recentList');
    if (!TW.state.recents.length) {
      host.innerHTML = '<li class="wz-recent-empty">Nothing yet — click a typeface name in a specimen header.</li>';
      return;
    }
    host.innerHTML = TW.state.recents.map(function (r, i) {
      return '<li class="wz-recent-item' + (r.done ? ' is-done' : '') + '" data-recent="' + i + '">' +
        '<input type="checkbox" id="rec' + i + '"' + (r.done ? ' checked' : '') + '>' +
        '<label class="wz-recent-name" for="rec' + i + '">' + escText(r.name) + '</label>' +
        '<span class="wz-recent-cat">' + escText(r.cat) + '</span></li>';
    }).join('');
  }

  function bindRecents() {
    $('#recentList').addEventListener('change', function (e) {
      var row = e.target.closest('[data-recent]');
      if (!row) { return; }
      var r = TW.state.recents[parseInt(row.getAttribute('data-recent'), 10)];
      if (r) { r.done = e.target.checked; renderRecents(); TW.persist(); }
    });
    $('#clearRecentsBtn').addEventListener('click', function () {
      TW.state.recents = [];
      renderRecents();
      TW.persist();
    });
  }

  /* ══════════ canvas interactions (delegated) ══════════ */

  function targetCollection() {
    var col = TW.activeCollection() || TW.state.collections[0];
    return col || null;
  }

  function bindCanvas() {
    var canvas = $('#canvas');

    canvas.addEventListener('input', function (e) {
      var ed = e.target.closest('[data-edit]');
      if (ed) {
        TW.state.edits[ed.getAttribute('data-edit')] = ed.textContent;
        TW.persist();
      }
    });

    canvas.addEventListener('click', function (e) {
      var chip = e.target.closest('.tw-weight-chip');
      if (chip) {
        var colEl = chip.closest('[data-pairing]');
        var p = TW.byId(colEl.getAttribute('data-pairing'));
        var style = TW.state.faceStyle[p.id] || { w: p.dw, i: false };
        if (chip.hasAttribute('data-italic')) { style.i = !style.i; }
        else { style.w = parseInt(chip.getAttribute('data-weight'), 10); }
        TW.state.faceStyle[p.id] = style;
        commit();
        return;
      }

      var save = e.target.closest('.tw-save-btn');
      if (save) {
        var pid = save.closest('[data-pairing]').getAttribute('data-pairing');
        var col = targetCollection();
        if (!col) { toast('Create a collection first', 'warn'); return; }
        var at = col.items.indexOf(pid);
        if (at >= 0) { col.items.splice(at, 1); toast('Removed from “' + col.name + '”'); }
        else { col.items.push(pid); toast('Saved to “' + col.name + '”'); }
        renderCollections();
        commit();
        return;
      }

      var face = e.target.closest('.tw-meta-typeface');
      if (face) {
        var pairEl = face.closest('[data-pairing]');
        var pairing = TW.byId(pairEl.getAttribute('data-pairing'));
        var fonts = TW.fontsFor(pairing);
        TW.pushRecent(fonts.meta.typeface.replace(' ⚠', ''), fonts.meta.category);
        renderRecents();
        TW.persist();
        toast(fonts.meta.typeface.replace(' ⚠', '') + ' pinned to Recent Tabs');
        return;
      }

      if (e.target.closest('.tw-cta') || e.target.closest('.tw-shop-btn')) {
        toast('CTA styled with ' + TW.palette().name);
      }
    });
  }

  /* ══════════ init ══════════ */
  function init() {
    buildSourceToggle();
    buildClassGrid();
    buildTagGrid();
    buildPersonalitySliders();
    buildTypoSliders();
    buildPaletteGrid();
    buildViewModeGrid();
    renderCollections();
    bindCollections();
    renderRecents();
    bindRecents();
    bindCanvas();
    // reflect restored state
    syncSourceToggle();
    syncClassGrid();
    syncTagGrid();
    syncPaletteGrid();
    syncContrast();
    syncSourceNote();
  }

  return { init: init, syncContrast: syncContrast, syncSourceNote: syncSourceNote, renderRecents: renderRecents };
})();
