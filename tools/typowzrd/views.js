/* ============================================================
   TypoWzrd — canvas views
   Renderers for Specimen Columns, Visual Directions moodboard,
   and Fonts In Use mockups; plus mode switching.
   ============================================================ */
window.TW_VIEWS = (function () {
  'use strict';

  var TW = window.TW, D = window.TW_DATA;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function applyFontVars(el, fonts) {
    el.style.setProperty('--tw-display', fonts.display);
    el.style.setProperty('--tw-body', fonts.body);
    el.style.setProperty('--tw-display-weight', String(fonts.weight));
  }

  function applyTypoVars(el) {
    var t = TW.state.typo;
    el.style.setProperty('--tw-scale', String(t.scale));
    el.style.setProperty('--tw-lh', String(t.lineHeight));
    el.style.setProperty('--tw-track', t.tracking + 'em');
  }

  /* ════════ Specimen Columns ════════ */
  function metaHeader(fonts) {
    var m = fonts.meta;
    return '<dl class="tw-col-meta">' +
      '<div class="tw-meta-typeface"><dt>Typeface</dt><dd title="Open in Recent Tabs">' + esc(m.typeface) + '</dd></div>' +
      '<div><dt>Name</dt><dd>' + esc(m.name) + '</dd></div>' +
      '<div><dt>Category</dt><dd>' + esc(m.category) + '</dd></div>' +
      '<div><dt>Creator</dt><dd>' + esc(m.creator) + '</dd></div>' +
      '<div><dt>Year</dt><dd>' + esc(m.year) + '</dd></div>' +
      '</dl>';
  }

  function weightChips(pairing, fonts) {
    var cur = TW.state.faceStyle[pairing.id] || { w: pairing.dw, i: false };
    var names = { 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'X-Bold', 900: 'Black' };
    var html = fonts.weights.map(function (w) {
      return '<button type="button" class="tw-weight-chip' + (cur.w === w ? ' is-on' : '') +
             '" data-weight="' + w + '" style="font-weight:' + w + '">' + (names[w] || w) + '</button>';
    }).join('');
    if (fonts.ital) {
      html += '<button type="button" class="tw-weight-chip is-italic' + (cur.i ? ' is-on' : '') +
              '" data-italic="1">Italic</button>';
    }
    return html;
  }

  function renderSpecimens() {
    var root = $('#viewSpecimens');
    var copy = TW.activeCopy();
    var list = TW.matches().slice(0, 8);
    var col = TW.activeCollection();

    root.innerHTML = list.map(function (p) {
      var fonts = TW.fontsFor(p);
      var saved = col && col.items.indexOf(p.id) >= 0;
      return '<article class="tw-col" data-pairing="' + p.id + '">' +
        metaHeader(fonts) +
        '<div class="tw-col-body">' +
          '<p class="tw-kicker">' + esc(copy.kicker) + '</p>' +
          '<h3 class="tw-display" contenteditable="true" spellcheck="false" data-edit="' + p.id + '"' +
            (fonts.italic ? ' style="font-style:italic"' : '') + '>' + esc(TW.displayPhrase(p)) + '</h3>' +
          '<div class="tw-weights" role="group" aria-label="Weights and styles">' + weightChips(p, fonts) + '</div>' +
          '<h4 class="tw-sub">' + esc(copy.sub) + '</h4>' +
          '<p class="tw-copy" contenteditable="true" spellcheck="false">' + esc(copy.body) + '</p>' +
          '<button type="button" class="tw-cta">' + esc(copy.cta) + '</button>' +
        '</div>' +
        '<div class="tw-col-foot">' +
          '<span class="tw-stackline" title="' + esc(fonts.stackLine) + '">' + esc(fonts.stackLine) + '</span>' +
          '<button type="button" class="tw-save-btn' + (saved ? ' is-saved' : '') + '">' + (saved ? '♥ Saved' : '♡ Save') + '</button>' +
        '</div>' +
      '</article>';
    }).join('');

    list.forEach(function (p) {
      var el = root.querySelector('[data-pairing="' + p.id + '"]');
      applyFontVars(el, TW.fontsFor(p));
    });
  }

  /* ════════ Visual Directions moodboard ════════ */
  function card(cls, label, inner) {
    return '<section class="tw-card ' + cls + '"><p class="tw-card-label">' + esc(label) + '</p>' + inner + '</section>';
  }

  function renderMoodboard() {
    var root = $('#viewMoodboard');
    var copy = TW.activeCopy();
    var list = TW.matches();
    var pick = function (i) { return list[i % list.length]; };

    var cards = [];

    // Brand header
    var p0 = pick(0);
    cards.push({ p: p0, html: card('tw-card--brand', 'Brand Header — ' + p0.name,
      '<h3 class="tw-brand-name" contenteditable="true" spellcheck="false">' + esc(copy.brand) + '</h3>' +
      '<p class="tw-brand-tag">' + esc(copy.brandTag) + '</p>' +
      '<div class="tw-brand-rule"></div>') });

    // E-commerce
    var p1 = pick(1);
    cards.push({ p: p1, html: card('tw-card--shop', 'E-Commerce — ' + p1.name,
      '<div class="tw-shop-visual"></div>' +
      '<div class="tw-shop-body">' +
        '<div class="tw-shop-row"><h4 class="tw-shop-name">' + esc(copy.product) + '</h4>' +
        '<span class="tw-shop-price">' + esc(copy.price) + '</span></div>' +
        '<p class="tw-shop-desc">' + esc(copy.productDesc) + '</p>' +
        '<button type="button" class="tw-shop-btn"><span>' + esc(copy.buy) + '</span><em>' + esc(copy.stock) + '</em></button>' +
      '</div>') });

    // Data visualization
    var p2 = pick(2);
    var bars = copy.bars.map(function (b) {
      return '<div class="tw-bar-row"><div class="tw-bar-head"><span>' + esc(b[0]) + '</span><b>' + b[1] + '%</b></div>' +
             '<div class="tw-bar"><i style="width:' + b[1] + '%"></i></div></div>';
    }).join('');
    cards.push({ p: p2, html: card('tw-card--data', 'Data Visualization — ' + p2.name,
      '<div class="tw-data-body">' +
        '<div class="tw-data-metric">' + copy.metric + '%<small>' + esc(copy.metricLabel) + '</small></div>' +
        '<p class="tw-data-sub">Updated 4 min ago · trending steady</p>' + bars +
      '</div>') });

    // Promo split
    var p3 = pick(3);
    cards.push({ p: p3, html: card('tw-card--promo', 'Promo — ' + p3.name,
      '<div class="tw-promo-copy">' +
        '<h4 class="tw-promo-head">' + esc(copy.promoHead) + '</h4>' +
        '<p class="tw-promo-body">' + esc(copy.promoBody) + '</p>' +
        '<span class="tw-promo-link">' + esc(copy.promoLink) + '</span>' +
      '</div><div class="tw-promo-art"></div>') });

    // Editorial overlay
    var p4 = pick(4);
    cards.push({ p: p4, html: card('tw-card--editorial', 'Editorial — ' + p4.name,
      '<div class="tw-edit-bg"></div>' +
      '<div class="tw-edit-text">' +
        '<p class="tw-edit-kicker">' + esc(copy.edKicker) + '</p>' +
        '<h4 class="tw-edit-head" contenteditable="true" spellcheck="false">' + esc(copy.edHead) + '</h4>' +
        '<p class="tw-edit-dek">' + esc(copy.edDek) + '</p>' +
      '</div>') });

    // Second brand + data for masonry richness
    var p5 = pick(5);
    cards.push({ p: p5, html: card('tw-card--brand', 'Alt Direction — ' + p5.name,
      '<h3 class="tw-brand-name" contenteditable="true" spellcheck="false">' + esc(TW.displayPhrase(p5)) + '</h3>' +
      '<p class="tw-brand-tag">' + esc(p5.tags.join(' · ')) + '</p>' +
      '<div class="tw-brand-rule"></div>') });

    var p6 = pick(6);
    cards.push({ p: p6, html: card('tw-card--promo', 'Promo B — ' + p6.name,
      '<div class="tw-promo-copy">' +
        '<h4 class="tw-promo-head">' + esc(TW.displayPhrase(p6)) + '</h4>' +
        '<p class="tw-promo-body">' + esc(copy.edDek) + '</p>' +
        '<span class="tw-promo-link">' + esc(copy.promoLink) + '</span>' +
      '</div><div class="tw-promo-art"></div>') });

    root.innerHTML = '<div class="tw-board">' + cards.map(function (c) { return c.html; }).join('') + '</div>';

    var els = root.querySelectorAll('.tw-card');
    cards.forEach(function (c, i) {
      applyFontVars(els[i], TW.fontsFor(c.p));
      els[i].setAttribute('data-pairing', c.p.id);
    });
  }

  /* ════════ Fonts In Use mockups ════════ */
  function renderMockups() {
    var root = $('#viewMockups');
    var copy = TW.activeCopy();
    var top = TW.matches()[0];
    var fonts = TW.fontsFor(top);
    if (TW.state.customText) {
      copy = Object.assign({}, copy, {
        wine: TW.state.customText, shirt: TW.state.customText,
        mag: TW.state.customText.split(' ')[0], poster: TW.state.customText
      });
    }
    var scenes = window.TW_MOCKUPS.scenes(fonts, TW.palette(), copy);
    root.innerHTML = '<div class="tw-scenes">' + scenes.map(function (sc) {
      return '<figure class="tw-scene" data-scene="' + sc.id + '">' +
        '<figcaption class="tw-scene-head"><span>' + esc(sc.title) + '</span><span>' + esc(fonts.meta.typeface) + '</span></figcaption>' +
        '<div class="tw-scene-body">' + sc.svg + '</div>' +
      '</figure>';
    }).join('') + '</div>';
  }

  /* ════════ mode switching + top-level render ════════ */
  function setMode(mode) {
    TW.state.mode = mode;
    ['specimens', 'moodboard', 'mockups'].forEach(function (m) {
      var el = $('#view' + m.charAt(0).toUpperCase() + m.slice(1));
      if (el) { el.hidden = (m !== mode); }
    });
    $('#canvas').setAttribute('data-mode', mode);
    var def = D.VIEW_MODES.filter(function (v) { return v.id === mode; })[0];
    $('#modeIndicator').textContent = def ? def.title : mode;
    document.querySelectorAll('.wz-viewmode-btn').forEach(function (b) {
      var on = b.getAttribute('data-mode') === mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function renderAll() {
    var canvas = $('#canvas');
    TW.applyPalette(canvas);
    applyTypoVars(canvas);
    if (TW.state.mode === 'specimens') { renderSpecimens(); }
    else if (TW.state.mode === 'moodboard') { renderMoodboard(); }
    else { renderMockups(); }

    var list = TW.matches();
    var top = list[0];
    $('#matchSummary').textContent = list.length + ' pairings ranked · top match: ' + (top ? top.name : '–') +
      (TW.state.tags.length ? ' · tags: ' + TW.state.tags.join(', ') : ' · no tags active');
  }

  return {
    renderAll: renderAll,
    setMode: function (m) { setMode(m); renderAll(); TW.persist(); }
  };
})();
