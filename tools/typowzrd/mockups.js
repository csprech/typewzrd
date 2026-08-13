/* ============================================================
   TypoWzrd — mockup scenes ("Fonts In Use")
   Stylized SVG generators. Each builder receives:
     fonts — resolved pairing fonts (display/body stacks, weight)
     pal   — active palette object
     copy  — active content deck
   and returns { id, title, svg } with palette + typography applied.
   ============================================================ */
window.TW_MOCKUPS = (function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* font stacks carry double quotes; SVG attributes prefer singles */
  function fam(stack) { return esc(String(stack).replace(/"/g, "'")); }

  /* Fit text by computing a font-size that fits maxWidth.
     (textLength is deliberately avoided — vector editors support it
     poorly, and fitted sizes export faithfully everywhere.)
     Average advance ≈ 0.78em for all-caps serif/slab display faces,
     0.62em mixed case — generous so light-on-dark print areas
     (shirt torso, bottle label) never bleed past their shapes. */
  function fitSize(text, maxWidth, base, letterSpacing) {
    var t = String(text);
    var caps = t === t.toUpperCase();
    var factor = caps ? 0.78 : 0.62;
    var ls = letterSpacing || 0;
    var usable = maxWidth - ls * Math.max(0, t.length - 1);
    var size = usable / (Math.max(1, t.length) * factor);
    return Number(Math.min(base, Math.max(5, size)).toFixed(1));
  }

  function svgOpen(w, h) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" ' +
           'width="' + w + '" height="' + h + '" role="img">';
  }

  /* ---- 1 · wine bottle -------------------------------------------- */
  function wineBottle(fonts, pal, copy) {
    var name = copy.wine, sub = copy.wineSub;
    var s = svgOpen(320, 460);
    s += '<rect width="320" height="460" rx="16" fill="' + pal.bg + '"/>';
    // shadow + bottle
    s += '<ellipse cx="160" cy="432" rx="86" ry="12" fill="rgba(0,0,0,.28)"/>';
    s += '<path d="M138 44 h44 v58 c0 18 30 26 30 62 v240 c0 14 -10 24 -24 24 h-56 c-14 0 -24 -10 -24 -24 v-240 c0 -36 30 -44 30 -62 z" fill="#1c1a1f"/>';
    s += '<path d="M143 48 h10 v60 c-6 16 -22 24 -24 52 l-4 0 c0 -36 24 -50 18 -62 z" fill="rgba(255,255,255,.08)"/>';
    // foil cap
    s += '<rect x="136" y="30" width="48" height="34" rx="6" fill="' + pal.accent + '"/>';
    s += '<rect x="136" y="52" width="48" height="4" fill="rgba(0,0,0,.25)"/>';
    // label
    s += '<rect x="112" y="220" width="96" height="132" rx="4" fill="' + pal.paper + '"/>';
    s += '<rect x="112" y="220" width="96" height="132" rx="4" fill="none" stroke="rgba(0,0,0,.12)"/>';
    s += '<rect x="120" y="232" width="80" height="2.5" fill="' + pal.accent + '"/>';
    s += '<text x="160" y="270" text-anchor="middle" font-family="' + fam(fonts.display) + '" ' +
         'font-weight="' + fonts.weight + '"' + (fonts.italic ? ' font-style="italic"' : '') +
         ' font-size="' + fitSize(name, 80, 17, 0) + '" fill="' + pal.paperText + '">' + esc(name) + '</text>';
    s += '<text x="160" y="290" text-anchor="middle" font-family="' + fam(fonts.body) + '" ' +
         'font-size="' + fitSize(sub.toUpperCase(), 80, 8.5, 0.5) + '" ' +
         'letter-spacing="0.5" fill="' + pal.paperText + '" opacity=".72">' + esc(sub.toUpperCase()) + '</text>';
    s += '<circle cx="160" cy="316" r="10" fill="none" stroke="' + pal.accent + '" stroke-width="2"/>';
    s += '<text x="160" y="319.5" text-anchor="middle" font-family="' + fam(fonts.display) + '" font-size="9" font-weight="700" fill="' + pal.paperText + '">W</text>';
    s += '<text x="160" y="342" text-anchor="middle" font-family="' + fam(fonts.body) + '" font-size="6.5" ' +
         'fill="' + pal.paperText + '" opacity=".55">750 ML · 13% VOL</text>';
    return { id: 'wine', title: 'Wine Bottle · Label', svg: s + '</svg>' };
  }

  /* ---- 2 · t-shirt ------------------------------------------------- */
  function tShirt(fonts, pal, copy) {
    var word = copy.shirt;
    var s = svgOpen(360, 400);
    s += '<rect width="360" height="400" rx="16" fill="' + pal.paper + '"/>';
    s += '<circle cx="300" cy="60" r="110" fill="' + pal.accent + '" opacity=".14"/>';
    // shirt body + sleeves
    s += '<path d="M118 96 L74 128 L96 178 L124 164 V330 c0 8 6 14 14 14 h84 c8 0 14 -6 14 -14 V164 l28 14 L286 128 L242 96 c-12 -10 -26 -16 -36 -16 c-6 10 -16 16 -26 16 s-20 -6 -26 -16 c-10 0 -24 6 -36 16 z" ' +
         'fill="' + pal.bg + '" stroke="rgba(0,0,0,.18)" stroke-width="2"/>';
    s += '<path d="M154 82 c6 10 16 15 26 15 s20 -5 26 -15 c-4 -3 -9 -4 -13 -4 c-4 3 -8 5 -13 5 s-9 -2 -13 -5 c-4 0 -9 1 -13 4 z" fill="rgba(0,0,0,.22)"/>';
    // chest print
    s += '<text x="180" y="216" text-anchor="middle" font-family="' + fam(fonts.display) + '" ' +
         'font-weight="' + fonts.weight + '"' + (fonts.italic ? ' font-style="italic"' : '') +
         ' font-size="' + fitSize(word.toUpperCase(), 104, 26, 2) + '" letter-spacing="2" fill="' + pal.text + '">' +
         esc(word.toUpperCase()) + '</text>';
    s += '<rect x="140" y="228" width="80" height="3" fill="' + pal.accent + '"/>';
    s += '<text x="180" y="248" text-anchor="middle" font-family="' + fam(fonts.body) + '" ' +
         'font-size="' + fitSize(copy.brandTag.toUpperCase(), 98, 9, 2) + '" ' +
         'letter-spacing="2" fill="' + pal.text + '" opacity=".62">' + esc(copy.brandTag.toUpperCase()) + '</text>';
    s += '<text x="180" y="372" text-anchor="middle" font-family="' + fam(fonts.body) + '" font-size="9.5" fill="' + pal.paperText + '" opacity=".5">Heavyweight tee · screen print · one color</text>';
    return { id: 'shirt', title: 'T-Shirt · Apparel Print', svg: s + '</svg>' };
  }

  /* ---- 3 · magazine cover ------------------------------------------ */
  function magazineCover(fonts, pal, copy) {
    var mast = copy.mag;
    var s = svgOpen(320, 440);
    s += '<rect width="320" height="440" rx="10" fill="' + pal.paper + '"/>';
    // cover art: geometric composition
    s += '<circle cx="228" cy="238" r="92" fill="' + pal.accent + '"/>';
    s += '<circle cx="228" cy="238" r="92" fill="none" stroke="rgba(0,0,0,.1)"/>';
    s += '<rect x="0" y="300" width="320" height="10" fill="' + pal.bg + '" opacity=".9"/>';
    s += '<path d="M0 322 L320 258 v6 L0 328 z" fill="' + pal.paperText + '" opacity=".35"/>';
    // masthead
    s += '<text x="20" y="74" font-family="' + fam(fonts.display) + '" font-weight="' + fonts.weight + '"' +
         (fonts.italic ? ' font-style="italic"' : '') +
         ' font-size="' + fitSize(mast.toUpperCase(), 280, 62, 1) + '" letter-spacing="1" fill="' + pal.paperText + '">' +
         esc(mast.toUpperCase()) + '</text>';
    s += '<rect x="20" y="86" width="280" height="2" fill="' + pal.paperText + '" opacity=".8"/>';
    s += '<text x="20" y="103" font-family="' + fam(fonts.body) + '" font-size="10" letter-spacing="2" fill="' + pal.paperText + '" opacity=".75">' + esc(copy.magIssue.toUpperCase()) + '</text>';
    s += '<text x="300" y="103" text-anchor="end" font-family="' + fam(fonts.body) + '" font-size="10" fill="' + pal.paperText + '" opacity=".75">$14</text>';
    // cover lines
    s += '<text x="20" y="368" font-family="' + fam(fonts.display) + '" font-weight="700" ' +
         'font-size="' + fitSize(copy.edHead, 280, 19, 0) + '" fill="' + pal.paperText + '">' + esc(copy.edHead) + '</text>';
    s += '<text x="20" y="388" font-family="' + fam(fonts.body) + '" font-size="10.5" fill="' + pal.paperText + '" opacity=".7">' + esc(copy.edKicker) + ' — p. 44</text>';
    s += '<rect x="20" y="404" width="46" height="16" fill="' + pal.paperText + '"/>';
    s += '<rect x="24" y="407.5" width="2" height="9" fill="' + pal.paper + '"/><rect x="29" y="407.5" width="1.5" height="9" fill="' + pal.paper + '"/><rect x="34" y="407.5" width="3" height="9" fill="' + pal.paper + '"/><rect x="41" y="407.5" width="1.5" height="9" fill="' + pal.paper + '"/><rect x="46" y="407.5" width="2.5" height="9" fill="' + pal.paper + '"/><rect x="52" y="407.5" width="1.5" height="9" fill="' + pal.paper + '"/><rect x="57" y="407.5" width="3" height="9" fill="' + pal.paper + '"/>';
    return { id: 'magazine', title: 'Magazine · Masthead', svg: s + '</svg>' };
  }

  /* ---- 4 · poster pair --------------------------------------------- */
  function posterPair(fonts, pal, copy) {
    var title = copy.poster, sub = copy.posterSub;
    var words = title.toUpperCase().split(' ');
    var s = svgOpen(640, 440);
    s += '<rect width="640" height="440" rx="16" fill="#141216"/>';

    // left poster — accent field, stacked display words
    s += '<rect x="24" y="24" width="284" height="392" fill="' + pal.accent + '"/>';
    var base = words.length > 2 ? 44 : 56;
    var longest = words.reduce(function (a, b) { return b.length > a.length ? b : a; }, '');
    var size = fitSize(longest, 230, base, 0);
    var y = 70 + size;
    words.forEach(function (w) {
      s += '<text x="46" y="' + y + '" font-family="' + fam(fonts.display) + '" font-weight="' + fonts.weight + '"' +
           (fonts.italic ? ' font-style="italic"' : '') +
           ' font-size="' + size + '" fill="' + pal.bg + '">' + esc(w) + '</text>';
      y += size + 8;
    });
    s += '<rect x="46" y="' + (y - size + 22) + '" width="90" height="4" fill="' + pal.bg + '"/>';
    s += '<text x="46" y="' + (y - size + 48) + '" font-family="' + fam(fonts.body) + '" font-size="13" fill="' + pal.bg + '" opacity=".85">' + esc(sub) + '</text>';
    s += '<text x="46" y="392" font-family="' + fam(fonts.body) + '" font-size="9" letter-spacing="1.6" fill="' + pal.bg + '" opacity=".7">ROYALE THEATRE — OCT 12 THRU NOV 30</text>';

    // right poster — inverted, oversized single glyph + billing block
    s += '<rect x="332" y="24" width="284" height="392" fill="' + pal.bg + '"/>';
    s += '<text x="474" y="250" text-anchor="middle" font-family="' + fam(fonts.display) + '" font-weight="' + fonts.weight + '" font-size="230" fill="' + pal.accent + '" opacity=".92">' + esc(title.charAt(0)) + '</text>';
    s += '<text x="474" y="302" text-anchor="middle" font-family="' + fam(fonts.display) + '" font-weight="700" ' +
         'font-size="' + fitSize(title.toUpperCase(), 240, 21, 0) + '" fill="' + pal.text + '">' + esc(title.toUpperCase()) + '</text>';
    s += '<rect x="404" y="318" width="140" height="2" fill="' + pal.text + '" opacity=".55"/>';
    ['DIR. M. HOLLOWAY', 'WITH THE ORIGINAL CAST', 'TICKETS AT THE BOX OFFICE'].forEach(function (line, i) {
      s += '<text x="474" y="' + (340 + i * 15) + '" text-anchor="middle" font-family="' + fam(fonts.body) + '" ' +
           'font-size="8.5" letter-spacing="1.8" fill="' + pal.text + '" opacity=".68">' + line + '</text>';
    });
    return { id: 'poster', title: 'Poster Pair · Billboard', svg: s + '</svg>' };
  }

  function scenes(fonts, pal, copy) {
    return [
      wineBottle(fonts, pal, copy),
      tShirt(fonts, pal, copy),
      magazineCover(fonts, pal, copy),
      posterPair(fonts, pal, copy)
    ];
  }

  return { scenes: scenes };
})();
