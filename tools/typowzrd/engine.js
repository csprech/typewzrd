/* ============================================================
   TypoWzrd — engine
   Central state, pairing matcher, web-font loader with graceful
   fallback, palette injection, WCAG contrast, SDK persistence.
   ============================================================ */
window.TW = (function () {
  'use strict';

  var D = window.TW_DATA;
  var TOOL_ID = 'typowzrd';

  /* ---- state ------------------------------------------------------ */
  var state = {
    source: 'system',            // 'system' | 'web'
    classFilter: null,           // classification id or null = all
    tags: [],                    // active tags, in activation order
    personality: { cc: 0, ne: 0, ps: 0 },
    typo: { scale: 1.25, lineHeight: 1.4, tracking: 0 },
    paletteId: 'plum-coral',
    mode: 'specimens',
    customText: '',
    collections: JSON.parse(JSON.stringify(D.SEED_COLLECTIONS)),
    activeCollection: null,
    recents: [],                 // {name, cat, done}
    faceStyle: {},               // pairingId -> {w:700, i:false}
    edits: {}                    // pairingId -> edited display phrase
  };

  /* ---- tiny event bus --------------------------------------------- */
  var handlers = {};
  function on(evt, cb) { (handlers[evt] = handlers[evt] || []).push(cb); }
  function emit(evt, detail) {
    (handlers[evt] || []).forEach(function (cb) {
      try { cb(detail); } catch (e) { console.error('[TypoWzrd]', evt, e); }
    });
  }

  /* ---- pairing matcher -------------------------------------------- */
  var MAX_DIST = Math.sqrt(12); // personality space diagonal

  function scorePairing(p) {
    var s = 0;
    for (var i = 0; i < state.tags.length; i++) {
      s += (p.tags.indexOf(state.tags[i]) >= 0) ? 2.5 : -0.6;
    }
    var dx = p.p.cc - state.personality.cc;
    var dy = p.p.ne - state.personality.ne;
    var dz = p.p.ps - state.personality.ps;
    s += (1 - Math.sqrt(dx * dx + dy * dy + dz * dz) / MAX_DIST) * 3;
    return s;
  }

  /* Ranked pairings for the canvas. Active collection pins first;
     classification filter narrows, backfilling if too few match. */
  function matches() {
    var ranked = D.PAIRINGS.map(function (p, i) {
      return { p: p, s: scorePairing(p), i: i };
    }).sort(function (a, b) { return (b.s - a.s) || (a.i - b.i); });

    if (state.classFilter) {
      var hit = [], miss = [];
      ranked.forEach(function (r) {
        ((r.p.dc === state.classFilter || r.p.bc === state.classFilter) ? hit : miss).push(r);
      });
      ranked = hit.length >= 3 ? hit : hit.concat(miss.slice(0, 3 - hit.length));
    }

    var list = ranked.map(function (r) { return r.p; });

    var col = activeCollection();
    if (col) {
      var pinned = col.items
        .map(function (id) { return byId(id); })
        .filter(Boolean);
      var rest = list.filter(function (p) { return col.items.indexOf(p.id) < 0; });
      list = pinned.concat(rest);
    }
    return list;
  }

  function byId(id) {
    for (var i = 0; i < D.PAIRINGS.length; i++) {
      if (D.PAIRINGS[i].id === id) { return D.PAIRINGS[i]; }
    }
    return null;
  }

  function activeCollection() {
    if (!state.activeCollection) { return null; }
    for (var i = 0; i < state.collections.length; i++) {
      if (state.collections[i].id === state.activeCollection) { return state.collections[i]; }
    }
    return null;
  }

  /* ---- font resolution -------------------------------------------- */
  var webStatus = 'idle'; // idle | loading | ok | fail

  function fontsFor(pairing) {
    var dCls = D.CLASSIFICATIONS[pairing.dc];
    var bCls = D.CLASSIFICATIONS[pairing.bc];
    var style = state.faceStyle[pairing.id] || { w: pairing.dw, i: false };
    if (state.source === 'web') {
      var gd = D.GOOGLE_FONTS[pairing.gd];
      var fell = (webStatus === 'fail');
      return {
        display: '"' + pairing.gd + '", ' + dCls.stack,
        body: '"' + pairing.gb + '", ' + bCls.stack,
        weight: style.w, italic: style.i && gd.ital,
        weights: gd.weights, ital: gd.ital,
        meta: {
          typeface: pairing.gd + (fell ? ' ⚠' : ''),
          name: pairing.name,
          category: dCls.label,
          creator: fell ? dCls.sys.creator : gd.creator,
          year: fell ? dCls.sys.year : String(gd.year)
        },
        stackLine: fell ? 'fallback → ' + dCls.stack : pairing.gd + ' + ' + pairing.gb + ' · Google Fonts'
      };
    }
    return {
      display: dCls.stack,
      body: bCls.stack,
      weight: style.w, italic: style.i,
      weights: [300, 400, 500, 700, 900], ital: true, // native stacks resolve variable/system faces
      meta: {
        typeface: dCls.sys.face,
        name: pairing.name,
        category: dCls.label,
        creator: dCls.sys.creator,
        year: dCls.sys.year
      },
      stackLine: dCls.stack
    };
  }

  /* ---- Google Fonts loader ---------------------------------------- */
  var injectedFamilies = {};

  function googleUrl(families) {
    var parts = families.map(function (fam) {
      var meta = D.GOOGLE_FONTS[fam];
      var spec;
      if (meta.ital) {
        spec = 'ital,wght@' +
          meta.weights.map(function (w) { return '0,' + w; })
            .concat(meta.weights.map(function (w) { return '1,' + w; }))
            .join(';');
      } else {
        spec = 'wght@' + meta.weights.join(';');
      }
      return 'family=' + encodeURIComponent(fam).replace(/%20/g, '+') + ':' + spec;
    });
    return 'https://fonts.googleapis.com/css2?' + parts.join('&') + '&display=swap';
  }

  /* Inject <link> tags for any families not yet requested, then verify
     via the FontFaceSet API with a timeout. On failure the UI keeps its
     structure: every web font-family declaration already carries the
     closest classification system stack as its fallback chain. */
  function ensureWebFonts(families, done) {
    var fresh = families.filter(function (f) { return !injectedFamilies[f] && D.GOOGLE_FONTS[f]; });
    if (fresh.length) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = googleUrl(fresh);
      link.setAttribute('data-tw-fonts', fresh.join(','));
      document.head.appendChild(link);
      fresh.forEach(function (f) { injectedFamilies[f] = true; });
    }

    webStatus = 'loading';
    emit('fontstatus', webStatus);

    var probes = families.map(function (f) {
      var w = D.GOOGLE_FONTS[f] ? D.GOOGLE_FONTS[f].weights[0] : 400;
      return document.fonts.load(w + ' 16px "' + f + '"');
    });

    var settled = false;
    function finish(ok) {
      if (settled) { return; }
      settled = true;
      webStatus = ok ? 'ok' : 'fail';
      emit('fontstatus', webStatus);
      if (done) { done(ok); }
    }

    Promise.all(probes).then(function (results) {
      var loaded = results.some(function (faces) { return faces.length > 0; });
      finish(loaded);
    }).catch(function () { finish(false); });

    window.setTimeout(function () {
      var anyLoaded = families.some(function (f) {
        try { return document.fonts.check('16px "' + f + '"'); } catch (e) { return false; }
      });
      finish(anyLoaded);
    }, 4500);
  }

  function requiredFamilies(list) {
    var fams = {};
    list.slice(0, 8).forEach(function (p) { fams[p.gd] = 1; fams[p.gb] = 1; });
    return Object.keys(fams);
  }

  /* ---- palette + contrast ----------------------------------------- */
  function palette() {
    for (var i = 0; i < D.PALETTES.length; i++) {
      if (D.PALETTES[i].id === state.paletteId) { return D.PALETTES[i]; }
    }
    return D.PALETTES[0];
  }

  function applyPalette(el) {
    var pal = palette();
    el.style.setProperty('--primary-bg', pal.bg);
    el.style.setProperty('--primary-text', pal.text);
    el.style.setProperty('--accent-color', pal.accent);
    el.style.setProperty('--accent-soft', pal.accent2);
    el.style.setProperty('--paper', pal.paper);
    el.style.setProperty('--paper-text', pal.paperText);
  }

  function channelLum(c) {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function hexRgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) { h = h.replace(/./g, function (ch) { return ch + ch; }); }
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }

  function luminance(hex) {
    var rgb = hexRgb(hex);
    return 0.2126 * channelLum(rgb[0]) + 0.7152 * channelLum(rgb[1]) + 0.0722 * channelLum(rgb[2]);
  }

  function contrastRatio(bgHex, fgHex) {
    var l1 = luminance(bgHex), l2 = luminance(fgHex);
    var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  function contrastReport() {
    var pal = palette();
    var r = contrastRatio(pal.bg, pal.text);
    var verdict, cls;
    if (r >= 7)        { verdict = 'AAA Pass'; cls = 'is-pass'; }
    else if (r >= 4.5) { verdict = 'AA Pass'; cls = 'is-pass'; }
    else if (r >= 3)   { verdict = 'AA Large Only'; cls = 'is-large'; }
    else               { verdict = 'Fail'; cls = 'is-fail'; }
    return { ratio: Math.round(r * 10) / 10, verdict: verdict, cls: cls, bg: pal.bg, fg: pal.text };
  }

  /* ---- copy decks -------------------------------------------------- */
  function activeCopy() {
    var deck = Object.assign({}, D.COPY._default);
    for (var i = state.tags.length - 1; i >= 0; i--) {
      if (D.COPY[state.tags[i]]) {
        Object.assign(deck, D.COPY[state.tags[i]]);
        break;
      }
    }
    return deck;
  }

  /* Per-column hand edits win; the global custom preview text (which
     clears edits when changed) covers every viewport; else the deck. */
  function displayPhrase(pairing) {
    if (state.edits[pairing.id]) { return state.edits[pairing.id]; }
    if (state.customText) { return state.customText; }
    return pairing.phrase;
  }

  /* ---- recents ----------------------------------------------------- */
  function pushRecent(name, cat) {
    state.recents = state.recents.filter(function (r) { return r.name !== name; });
    state.recents.unshift({ name: name, cat: cat, done: false });
    state.recents = state.recents.slice(0, 9);
  }

  /* ---- persistence (WZRD platform SDK) ----------------------------- */
  var PERSISTED = ['source', 'classFilter', 'tags', 'personality', 'typo', 'paletteId',
                   'mode', 'customText', 'collections', 'activeCollection', 'recents',
                   'faceStyle', 'edits'];

  var saver = window.WZRD.state.autosave(TOOL_ID, function () {
    var out = {};
    PERSISTED.forEach(function (k) { out[k] = state[k]; });
    return out;
  }, 700);

  function persist() { saver(); }

  function restore(done) {
    window.WZRD.state.load(TOOL_ID).then(function (payload) {
      var data = payload && payload.data;
      if (data) {
        PERSISTED.forEach(function (k) {
          if (data[k] !== undefined && data[k] !== null) { state[k] = data[k]; }
        });
        // guard against removed ids surviving in saved state
        if (state.classFilter && !D.CLASSIFICATIONS[state.classFilter]) { state.classFilter = null; }
        if (!D.PALETTES.some(function (p) { return p.id === state.paletteId; })) { state.paletteId = D.PALETTES[0].id; }
        state.tags = state.tags.filter(function (t) { return D.TAGS.indexOf(t) >= 0; });
      }
      done();
    }).catch(function () { done(); });
  }

  return {
    state: state,
    on: on,
    emit: emit,
    matches: matches,
    byId: byId,
    activeCollection: activeCollection,
    fontsFor: fontsFor,
    ensureWebFonts: ensureWebFonts,
    requiredFamilies: requiredFamilies,
    webStatus: function () { return webStatus; },
    palette: palette,
    applyPalette: applyPalette,
    contrastReport: contrastReport,
    activeCopy: activeCopy,
    displayPhrase: displayPhrase,
    pushRecent: pushRecent,
    persist: persist,
    restore: restore
  };
})();
