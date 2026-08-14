/* ============================================================
   TypoWzrd — exporter
   Serializes the active canvas view to SVG, and rasterizes to
   high-resolution PNG via an offscreen <canvas>.

   Mockup mode composes the live scene SVGs directly (pure
   vectors). Specimen/moodboard modes serialize the DOM inside a
   <foreignObject> with the tool's stylesheet text embedded.
   Rasterization draws with locally-resolvable fonts only, so PNGs
   fall back to the classification system stacks when Google Fonts
   are active — structure and layout are always preserved.
   ============================================================ */
window.TW_EXPORT = (function () {
  'use strict';

  var TW = window.TW;
  var toast = window.WZRD.ui.toast;
  var SCALE = 2; // hi-res raster factor

  /* stylesheet text cache for foreignObject embedding */
  var cssCache = null;
  function collectCss(done) {
    if (cssCache !== null) { done(cssCache); return; }
    var out = [];
    for (var i = 0; i < document.styleSheets.length; i++) {
      var sheet = document.styleSheets[i];
      try {
        var rules = sheet.cssRules;
        for (var j = 0; j < rules.length; j++) { out.push(rules[j].cssText); }
      } catch (e) { /* cross-origin (e.g. injected Google Fonts css) — skip */ }
    }
    if (out.length) { cssCache = out.join('\n'); done(cssCache); return; }
    // file:// fallback: pull the two local sheets over fetch
    Promise.all(['wz-shell.css', 'studio.css'].map(function (href) {
      return window.fetch(href).then(function (r) { return r.text(); }).catch(function () { return ''; });
    })).then(function (texts) {
      cssCache = texts.join('\n');
      done(cssCache);
    });
  }

  function inlineVars(el) {
    var canvas = document.getElementById('canvas');
    var cs = window.getComputedStyle(canvas);
    ['--primary-bg', '--primary-text', '--accent-color', '--accent-soft', '--paper', '--paper-text',
     '--tw-scale', '--tw-lh', '--tw-track'].forEach(function (v) {
      var val = cs.getPropertyValue(v);
      if (val) { el.style.setProperty(v, val.trim()); }
    });
  }

  /* ---- active view -> standalone SVG string ------------------------ */
  function buildSvg(done) {
    if (TW.state.mode === 'mockups') { done(mockupComposite()); return; }

    var viewId = TW.state.mode === 'specimens' ? 'viewSpecimens' : 'viewMoodboard';
    var view = document.getElementById(viewId);
    var w = Math.max(view.scrollWidth, view.clientWidth);
    var h = Math.max(view.scrollHeight, view.clientHeight);

    collectCss(function (css) {
      var clone = view.cloneNode(true);
      clone.removeAttribute('hidden');
      clone.style.position = 'static';
      clone.style.width = w + 'px';
      clone.style.height = h + 'px';
      clone.style.overflow = 'visible';
      clone.querySelectorAll('[contenteditable]').forEach(function (n) { n.removeAttribute('contenteditable'); });

      var wrap = document.createElement('div');
      wrap.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      wrap.className = 'wz-canvas';
      wrap.style.width = w + 'px';
      wrap.style.height = h + 'px';
      wrap.style.background = getComputedStyle(document.getElementById('canvas')).backgroundColor;
      inlineVars(wrap);
      wrap.appendChild(clone);

      var xhtml = new XMLSerializer().serializeToString(wrap);
      var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
        '<style><![CDATA[\n' + css + '\n]]></style>' +
        '<foreignObject width="100%" height="100%">' + xhtml + '</foreignObject></svg>';
      done(svg);
    });
  }

  /* compose the four live mockup SVGs onto one sheet */
  function mockupComposite() {
    var nodes = document.querySelectorAll('#viewMockups .tw-scene-body svg');
    if (!nodes.length) { return null; }
    var GAP = 24, PAD = 24;
    var layout = [ // x, y anchors matching scenes' intrinsic sizes
      { x: PAD, y: PAD },                       // wine 320x460
      { x: PAD + 320 + GAP, y: PAD },           // shirt 360x400
      { x: PAD + 320 + GAP + 360 + GAP, y: PAD },// magazine 320x440
      { x: PAD + 192, y: PAD + 460 + GAP }      // poster 640x440, centered-ish
    ];
    var W = PAD * 2 + 320 + GAP + 360 + GAP + 320;
    var H = PAD * 2 + 460 + GAP + 440;
    var parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">',
                 '<rect width="' + W + '" height="' + H + '" fill="#101016"/>'];
    nodes.forEach(function (node, i) {
      var pos = layout[i] || { x: PAD, y: PAD };
      var s = node.outerHTML.replace('<svg ', '<svg x="' + pos.x + '" y="' + pos.y + '" ');
      parts.push(s);
    });
    parts.push('</svg>');
    return parts.join('');
  }

  /* ---- downloads --------------------------------------------------- */
  function stamp() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }

  function download(blob, ext) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'typowzrd-' + TW.state.mode + '-' + stamp() + '.' + ext;
    document.body.appendChild(a);
    a.click();
    window.setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  }

  function flash() {
    var c = document.getElementById('canvas');
    c.classList.remove('is-exporting');
    void c.offsetWidth; // restart animation
    c.classList.add('is-exporting');
  }

  function exportSvg() {
    buildSvg(function (svg) {
      if (!svg) { toast('Nothing to export yet', 'warn'); return; }
      flash();
      download(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'svg');
      toast('SVG exported — vectors + font references preserved');
    });
  }

  function exportPng() {
    buildSvg(function (svg) {
      if (!svg) { toast('Nothing to export yet', 'warn'); return; }
      var img = new Image();
      var src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      img.onload = function () {
        try {
          var cv = document.createElement('canvas');
          cv.width = img.width * SCALE;
          cv.height = img.height * SCALE;
          var ctx = cv.getContext('2d');
          ctx.scale(SCALE, SCALE);
          ctx.drawImage(img, 0, 0);
          cv.toBlob(function (blob) {
            if (!blob) { toast('PNG encode failed — try Export SVG', 'error'); return; }
            flash();
            download(blob, 'png');
            toast(TW.state.source === 'web'
              ? 'PNG exported at ' + SCALE + '× (rasterized with system-stack fallbacks)'
              : 'PNG exported at ' + SCALE + '× resolution');
          }, 'image/png');
        } catch (e) {
          toast('PNG export blocked by the browser — SVG export still works', 'error');
        }
      };
      img.onerror = function () { toast('Rasterizer could not parse the layout — use Export SVG', 'error'); };
      img.src = src;
    });
  }

  function init() {
    document.getElementById('exportSvgBtn').addEventListener('click', exportSvg);
    document.getElementById('exportPngBtn').addEventListener('click', exportPng);
  }

  return { init: init };
})();
