/* ============================================================
   TypoWzrd — data layer
   System stacks, Google font metadata, curated pairings,
   thematic tags, palettes, and content decks.
   ============================================================ */
window.TW_DATA = (function () {
  'use strict';

  /* ---- visual classifications + native system stacks -------------- */
  var CLASSIFICATIONS = {
    'neo-grotesque': {
      label: 'Neo-Grotesque', glyph: 'a', glyphStyle: 'font-weight:600',
      stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      sys: { face: 'SF Pro · Segoe UI · Roboto', creator: 'Apple · Microsoft · Google', year: '2015–17' },
      google: ['Inter', 'Work Sans', 'Archivo', 'Libre Franklin', 'Space Grotesk']
    },
    'humanist-sans': {
      label: 'Humanist Sans', glyph: 'a', glyphStyle: 'font-weight:500',
      stack: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif',
      sys: { face: 'Seravek · Gill Sans · Ubuntu', creator: 'E. Olson · Monotype · Canonical', year: '2007–10' },
      google: ['Source Sans 3', 'PT Sans', 'Cabin']
    },
    'transitional-serif': {
      label: 'Transitional Serif', glyph: 'g', glyphStyle: 'font-weight:500',
      stack: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif',
      sys: { face: 'Charter · Sitka · Cambria', creator: 'Matthew Carter · Microsoft', year: '1987' },
      google: ['Source Serif 4', 'Lora', 'PT Serif']
    },
    'slab-serif': {
      label: 'Slab Serif', glyph: 'R', glyphStyle: 'font-weight:700',
      stack: 'Rockwell, "Rockwell Nova", "Roboto Slab", "DejaVu Serif", "Sitka Small", serif',
      sys: { face: 'Rockwell · Roboto Slab', creator: 'Monotype (F. Pierpont)', year: '1934' },
      google: ['Roboto Slab', 'Zilla Slab', 'Bitter']
    },
    'monospace': {
      label: 'Monospace', glyph: '0', glyphStyle: 'font-weight:500',
      stack: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace',
      sys: { face: 'SF Mono · Cascadia · Menlo', creator: 'Apple · Microsoft', year: '2019' },
      google: ['JetBrains Mono', 'Space Mono', 'IBM Plex Mono']
    },
    'geometric-sans': {
      label: 'Geometric Sans', glyph: 'O', glyphStyle: 'font-weight:600',
      stack: 'Futura, "Avenir Next", Avenir, "Century Gothic", "URW Gothic", Corbel, sans-serif',
      sys: { face: 'Futura · Avenir · Century Gothic', creator: 'P. Renner · A. Frutiger', year: '1927' },
      google: ['Poppins', 'DM Sans', 'Manrope']
    },
    'display-classique': {
      label: 'Display Classique', glyph: 'Q', glyphStyle: 'font-weight:600;font-style:italic',
      stack: 'Didot, "Bodoni MT", "Bodoni 72", "URW Palladio L", P052, Sylfaen, Georgia, serif',
      sys: { face: 'Didot · Bodoni', creator: 'F. Didot · G. Bodoni', year: '1799' },
      google: ['Playfair Display', 'Fraunces', 'DM Serif Display', 'Abril Fatface', 'Cormorant Garamond']
    }
  };

  /* Serif glyph previews should render in that class's own stack. */
  Object.keys(CLASSIFICATIONS).forEach(function (k) {
    CLASSIFICATIONS[k].id = k;
  });

  /* ---- Google Fonts metadata (creator / year / weights) ----------- */
  var GOOGLE_FONTS = {
    'Inter':              { cat: 'neo-grotesque', creator: 'Rasmus Andersson', year: 2017, weights: [300, 400, 500, 700, 900], ital: false },
    'Work Sans':          { cat: 'neo-grotesque', creator: 'Wei Huang', year: 2015, weights: [300, 400, 500, 700, 900], ital: true },
    'Archivo':            { cat: 'neo-grotesque', creator: 'Omnibus-Type', year: 2017, weights: [400, 500, 700, 900], ital: true },
    'Libre Franklin':     { cat: 'neo-grotesque', creator: 'Impallari Type', year: 2015, weights: [300, 400, 500, 700, 900], ital: true },
    'Space Grotesk':      { cat: 'neo-grotesque', creator: 'Florian Karsten', year: 2018, weights: [300, 400, 500, 700], ital: false },
    'Source Sans 3':      { cat: 'humanist-sans', creator: 'Paul D. Hunt / Adobe', year: 2012, weights: [300, 400, 600, 700, 900], ital: true },
    'PT Sans':            { cat: 'humanist-sans', creator: 'ParaType', year: 2010, weights: [400, 700], ital: true },
    'Cabin':              { cat: 'humanist-sans', creator: 'Pablo Impallari', year: 2011, weights: [400, 500, 600, 700], ital: true },
    'Source Serif 4':     { cat: 'transitional-serif', creator: 'F. Grießhammer / Adobe', year: 2014, weights: [300, 400, 600, 700, 900], ital: true },
    'Lora':               { cat: 'transitional-serif', creator: 'Cyreal', year: 2011, weights: [400, 500, 600, 700], ital: true },
    'PT Serif':           { cat: 'transitional-serif', creator: 'ParaType', year: 2010, weights: [400, 700], ital: true },
    'Roboto Slab':        { cat: 'slab-serif', creator: 'Christian Robertson', year: 2013, weights: [300, 400, 500, 700, 900], ital: false },
    'Zilla Slab':         { cat: 'slab-serif', creator: 'Typotheque / P. Biľak', year: 2017, weights: [300, 400, 500, 600, 700], ital: true },
    'Bitter':             { cat: 'slab-serif', creator: 'Sol Matas / Huerta Tip.', year: 2011, weights: [300, 400, 500, 700, 900], ital: true },
    'JetBrains Mono':     { cat: 'monospace', creator: 'JetBrains / P. Nurullin', year: 2020, weights: [300, 400, 500, 700, 800], ital: true },
    'Space Mono':         { cat: 'monospace', creator: 'Colophon Foundry', year: 2016, weights: [400, 700], ital: true },
    'IBM Plex Mono':      { cat: 'monospace', creator: 'M. Abbink / Bold Monday', year: 2017, weights: [300, 400, 500, 600, 700], ital: true },
    'Poppins':            { cat: 'geometric-sans', creator: 'Indian Type Foundry', year: 2014, weights: [300, 400, 500, 700, 900], ital: true },
    'DM Sans':            { cat: 'geometric-sans', creator: 'Colophon Foundry', year: 2019, weights: [300, 400, 500, 700, 900], ital: true },
    'Manrope':            { cat: 'geometric-sans', creator: 'Mikhail Sharanda', year: 2018, weights: [300, 400, 500, 700, 800], ital: false },
    'Playfair Display':   { cat: 'display-classique', creator: 'C. Eggers Sørensen', year: 2011, weights: [400, 500, 700, 900], ital: true },
    'Fraunces':           { cat: 'display-classique', creator: 'Undercase Type', year: 2020, weights: [300, 400, 500, 700, 900], ital: true },
    'DM Serif Display':   { cat: 'display-classique', creator: 'Colophon Foundry', year: 2019, weights: [400], ital: true },
    'Abril Fatface':      { cat: 'display-classique', creator: 'TypeTogether', year: 2011, weights: [400], ital: false },
    'Cormorant Garamond': { cat: 'display-classique', creator: 'Christian Thalmann', year: 2015, weights: [300, 400, 500, 600, 700], ital: true },
    'Bebas Neue':         { cat: 'neo-grotesque', creator: 'Ryoichi Tsunekawa', year: 2010, weights: [400], ital: false },
    'Syne':               { cat: 'geometric-sans', creator: 'Bonjour Monde', year: 2017, weights: [400, 500, 600, 700, 800], ital: false },
    'Unbounded':          { cat: 'geometric-sans', creator: 'NaN Foundry', year: 2022, weights: [300, 400, 500, 700, 900], ital: false }
  };

  /* ---- thematic tags ---------------------------------------------- */
  var TAGS = ['Tech', 'Brutalism', 'Feminism', 'Cooking', 'Editorial', 'Youth', 'Elegant', 'Futuristic'];

  /* ---- personality axes (-1 … +1) --------------------------------- */
  var AXES = [
    { id: 'cc', left: 'Classical', right: 'Contemporary' },
    { id: 'ne', left: 'Neutral', right: 'Expressive' },
    { id: 'ps', left: 'Playful', right: 'Serious' }
  ];

  /* ---- curated pairings -------------------------------------------
     p = personality vector on the three axes above.
     dc/bc = display/body classification, gd/gb = Google faces.   */
  var PAIRINGS = [
    { id: 'helvetic-standard', name: 'Helvetic Standard', dc: 'neo-grotesque', bc: 'neo-grotesque',
      gd: 'Inter', gb: 'Inter', dw: 700, tags: ['Tech', 'Editorial'],
      p: { cc: 0.3, ne: -0.8, ps: 0.3 }, phrase: 'Form follows function.' },
    { id: 'terminal-poetry', name: 'Terminal Poetry', dc: 'monospace', bc: 'neo-grotesque',
      gd: 'JetBrains Mono', gb: 'Inter', dw: 700, tags: ['Tech', 'Brutalism', 'Futuristic'],
      p: { cc: 0.7, ne: -0.1, ps: 0.2 }, phrase: 'while(alive){ create() }' },
    { id: 'editorial-contrast', name: 'Editorial Contrast', dc: 'display-classique', bc: 'transitional-serif',
      gd: 'Playfair Display', gb: 'Source Serif 4', dw: 900, tags: ['Editorial', 'Elegant'],
      p: { cc: -0.7, ne: 0.3, ps: 0.4 }, phrase: 'The Sunday Essay' },
    { id: 'modern-romance', name: 'Modern Romance', dc: 'display-classique', bc: 'humanist-sans',
      gd: 'Fraunces', gb: 'Source Sans 3', dw: 700, tags: ['Feminism', 'Elegant', 'Editorial'],
      p: { cc: -0.3, ne: 0.6, ps: -0.1 }, phrase: 'Soft power, loud ideas' },
    { id: 'concrete-voice', name: 'Concrete Voice', dc: 'neo-grotesque', bc: 'monospace',
      gd: 'Archivo', gb: 'Space Mono', dw: 900, tags: ['Brutalism', 'Youth'],
      p: { cc: 0.6, ne: 0.7, ps: 0.1 }, phrase: 'RAW CONCRETE' },
    { id: 'farmhouse-table', name: 'Farmhouse Table', dc: 'slab-serif', bc: 'humanist-sans',
      gd: 'Bitter', gb: 'Cabin', dw: 700, tags: ['Cooking', 'Editorial'],
      p: { cc: -0.2, ne: 0.1, ps: -0.2 }, phrase: 'Butter, browned slowly' },
    { id: 'orbital-grotesk', name: 'Orbital Grotesk', dc: 'neo-grotesque', bc: 'geometric-sans',
      gd: 'Space Grotesk', gb: 'Manrope', dw: 700, tags: ['Futuristic', 'Tech'],
      p: { cc: 0.8, ne: 0.3, ps: 0.1 }, phrase: 'Low orbit, high fidelity' },
    { id: 'riot-zine', name: 'Riot Zine', dc: 'neo-grotesque', bc: 'humanist-sans',
      gd: 'Bebas Neue', gb: 'Work Sans', dw: 400, tags: ['Feminism', 'Youth', 'Brutalism'],
      p: { cc: 0.4, ne: 0.8, ps: -0.5 }, phrase: 'GIRLS TO THE FRONT' },
    { id: 'slab-authority', name: 'Slab Authority', dc: 'slab-serif', bc: 'neo-grotesque',
      gd: 'Roboto Slab', gb: 'Inter', dw: 700, tags: ['Editorial', 'Tech'],
      p: { cc: 0.0, ne: -0.3, ps: 0.6 }, phrase: 'Facts, set in slab.' },
    { id: 'palais-menu', name: 'Palais Menu', dc: 'display-classique', bc: 'transitional-serif',
      gd: 'Cormorant Garamond', gb: 'Lora', dw: 600, tags: ['Cooking', 'Elegant'],
      p: { cc: -0.9, ne: 0.2, ps: 0.5 }, phrase: 'Truffle & thyme, à la carte' },
    { id: 'neon-syntax', name: 'Neon Syntax', dc: 'geometric-sans', bc: 'neo-grotesque',
      gd: 'Syne', gb: 'Space Grotesk', dw: 800, tags: ['Youth', 'Futuristic', 'Tech'],
      p: { cc: 0.9, ne: 0.8, ps: -0.4 }, phrase: 'New defaults, who dis' },
    { id: 'civic-ledger', name: 'Civic Ledger', dc: 'transitional-serif', bc: 'humanist-sans',
      gd: 'Source Serif 4', gb: 'PT Sans', dw: 700, tags: ['Editorial'],
      p: { cc: -0.4, ne: -0.6, ps: 0.7 }, phrase: 'The record, kept plainly' },
    { id: 'bubble-pop', name: 'Bubble Pop', dc: 'geometric-sans', bc: 'geometric-sans',
      gd: 'Poppins', gb: 'DM Sans', dw: 700, tags: ['Youth', 'Feminism'],
      p: { cc: 0.5, ne: 0.4, ps: -0.8 }, phrase: 'Round edges only' },
    { id: 'grand-masthead', name: 'Grand Masthead', dc: 'display-classique', bc: 'neo-grotesque',
      gd: 'Abril Fatface', gb: 'Libre Franklin', dw: 400, tags: ['Editorial', 'Elegant', 'Brutalism'],
      p: { cc: -0.5, ne: 0.5, ps: 0.2 }, phrase: 'Front page energy' },
    { id: 'unbounded-futures', name: 'Unbounded Futures', dc: 'geometric-sans', bc: 'monospace',
      gd: 'Unbounded', gb: 'IBM Plex Mono', dw: 700, tags: ['Futuristic', 'Tech', 'Youth'],
      p: { cc: 1.0, ne: 0.6, ps: -0.1 }, phrase: 'Beyond the vanishing point' },
    { id: 'atelier-monochrome', name: 'Atelier Monochrome', dc: 'display-classique', bc: 'monospace',
      gd: 'DM Serif Display', gb: 'IBM Plex Mono', dw: 400, tags: ['Elegant', 'Brutalism', 'Editorial'],
      p: { cc: 0.1, ne: 0.5, ps: 0.3 }, phrase: 'Ink on the studio floor' }
  ];

  /* ---- palette presets --------------------------------------------
     bg/text drive the primary canvas surface, paper/paperText drive
     light cards, accent(+2) drives CTAs / bars / graphics.        */
  var PALETTES = [
    { id: 'plum-coral',  name: 'Plum · Coral · Charcoal', bg: '#38203E', text: '#F6E8F1', accent: '#FF6F5E', accent2: '#2C2C33', paper: '#F6E8F1', paperText: '#2C1830' },
    { id: 'peach-rust',  name: 'Peach · Rust · Forest',   bg: '#FFE4CF', text: '#20422F', accent: '#BF4D28', accent2: '#20422F', paper: '#FFF4E9', paperText: '#26433A' },
    { id: 'yellow-ink',  name: 'Yellow · Ink Blue · Grey',bg: '#F5C400', text: '#14213D', accent: '#1D2F6F', accent2: '#6B7280', paper: '#F6F5F0', paperText: '#14213D' },
    { id: 'monochrome',  name: 'Monochrome',              bg: '#F4F4F1', text: '#141414', accent: '#141414', accent2: '#8A8A85', paper: '#FFFFFF', paperText: '#111111' },
    { id: 'neon-noir',   name: 'Neon Noir',               bg: '#101014', text: '#F1F1EE', accent: '#C6FF4D', accent2: '#3A3A44', paper: '#17171C', paperText: '#EDEDEA' },
    { id: 'botanical',   name: 'Botanical · Cream',       bg: '#EFE9DB', text: '#2F3B2F', accent: '#4D6B45', accent2: '#A5B79B', paper: '#F9F5EA', paperText: '#303C30' },
    { id: 'cobalt-pop',  name: 'Cobalt Pop',              bg: '#1F3DBE', text: '#F4F6FF', accent: '#FFCF00', accent2: '#8FA2E8', paper: '#EEF1FF', paperText: '#14237A' },
    { id: 'sand-char',   name: 'Sand · Charcoal',         bg: '#E8DDCB', text: '#2B2B28', accent: '#B3543A', accent2: '#6E6E66', paper: '#F4ECDD', paperText: '#2B2B28' }
  ];

  /* ---- content decks keyed by dominant tag ------------------------ */
  var COPY = {
    _default: {
      kicker: 'Specimen № 04 — Field Notes',
      sub: 'The quick brown fox studies letterforms',
      body: 'Typography is the craft of endowing human language with a durable visual form. Choose two voices — one to shout, one to explain — and let the space between them do the talking.',
      cta: 'Start pairing',
      brand: 'Capital Crush', brandTag: 'Design Bureau',
      product: 'Studio Grotesk Tote', price: '$48', productDesc: 'Heavyweight canvas, single-color print, typeset in-house.',
      buy: 'Add to cart', stock: '12 in stock',
      metric: 64, metricLabel: 'Used from budget', bars: [['Display', 82], ['Body copy', 64], ['Captions', 37]],
      promoHead: 'Half the fonts. Twice the voice.', promoBody: 'A disciplined system beats a crowded one. Two families, five weights, endless range.', promoLink: 'See the system →',
      edKicker: 'The Annual Type Issue', edHead: 'Letters That Built the City', edDek: 'From subway signage to supermarket flyers — the invisible fonts of daily life.',
      wine: 'Domaine Verso', wineSub: 'Vin de Table · 2021', shirt: 'EFFIGIES',
      mag: 'AVANT', magIssue: 'Issue 27 — The Grid Issue', poster: 'THE GREAT BELOW', posterSub: 'A play in three acts'
    },
    Tech:      { brand: 'Kernel & Co', brandTag: 'Systems Studio', sub: 'Ship interfaces people can read', product: 'Mechanical Keycap Set', price: '$96', metricLabel: 'Uptime this quarter', metric: 99, promoHead: 'Readable at every breakpoint.', wine: 'Binary Blanc', shirt: 'NULLPOINTER', mag: 'STACK', poster: 'SIGNAL / NOISE' },
    Brutalism: { brand: 'Raw Slab', brandTag: 'Concrete Press', sub: 'Unpolished, deliberate, honest', promoHead: 'No rounded corners. No apologies.', product: 'Poster Tube, Bare Steel', price: '$32', wine: 'Béton Rouge', shirt: 'MONOLITH', mag: 'BRUT', poster: 'CAST IN PLACE' },
    Feminism:  { brand: 'Herstory Press', brandTag: 'Radical Publishing', sub: 'Print the future you want', promoHead: 'Margins are for growing.', product: 'Zine Bundle Vol. 1–4', price: '$28', wine: 'Clara Rosé', shirt: 'FUTURE IS SOFT', mag: 'SIREN', poster: 'HER TURN NOW' },
    Cooking:   { brand: 'Salt & Slab', brandTag: 'Test Kitchen', sub: 'Recipes set at a readable size', promoHead: 'Mise en place for your menus.', product: 'Cast Iron No. 8', price: '$54', metricLabel: 'Sourdough hydration', metric: 72, wine: 'Domaine Verso', shirt: 'BUTTER FIRST', mag: 'CRUMB', poster: 'DINNER AT EIGHT' },
    Editorial: { brand: 'The Ledger', brandTag: 'Independent Journal', sub: 'Long reads deserve long ascenders', promoHead: 'Every issue, a masthead moment.', product: 'Annual Print Edition', price: '$18', wine: 'Press Reserve', shirt: 'BYLINE', mag: 'AVANT', poster: 'THE LATE EDITION' },
    Youth:     { brand: 'Static Club', brandTag: 'After-School Label', sub: 'Loud type for quiet kids', promoHead: 'Turn the kerning up to eleven.', product: 'Sticker Pack XL', price: '$12', wine: 'Fizz Society', shirt: 'NO GROWN-UPS', mag: 'HYPE', poster: 'ALL AGES SHOW' },
    Elegant:   { brand: 'Maison Lettre', brandTag: 'Atelier de Type', sub: 'Grace in every counterform', promoHead: 'Quiet luxury, loud legibility.', product: 'Letterpressed Cards', price: '$64', wine: 'Château Ligature', shirt: 'SERIF SOCIETY', mag: 'VOGUEISH', poster: 'AN EVENING OF ARIAS' },
    Futuristic:{ brand: 'Hyperform', brandTag: 'Speculative Lab', sub: 'Typefaces for the year 3000', promoHead: 'Set your dials past the baseline.', product: 'Chrome Specimen Deck', price: '$40', metricLabel: 'Thruster output', metric: 88, wine: 'Ion Vintage', shirt: 'POSTHUMAN', mag: 'FLUX', poster: 'ARRIVALS FROM ORBIT' }
  };

  /* ---- misc UI defs ----------------------------------------------- */
  var TYPO_PARAMS = [
    { id: 'scale', label: 'Scale Factor', min: 1.125, max: 1.618, step: 0.001, def: 1.25, fmt: function (v) { return v.toFixed(3); } },
    { id: 'lineHeight', label: 'Base Line-Height', min: 1.1, max: 1.8, step: 0.01, def: 1.4, fmt: function (v) { return v.toFixed(2); } },
    { id: 'tracking', label: 'Letter-Spacing', min: -0.05, max: 0.25, step: 0.005, def: 0, fmt: function (v) { return v.toFixed(3) + 'em'; } }
  ];

  var VIEW_MODES = [
    { id: 'specimens', label: 'Specimens', title: 'Specimen Columns',
      icon: [[1, 1, 9, 24], [12, 1, 9, 24], [23, 1, 9, 24]] },
    { id: 'moodboard', label: 'Moodboard', title: 'Visual Directions',
      icon: [[1, 1, 14, 11], [17, 1, 15, 7], [1, 14, 14, 11], [17, 10, 15, 15]] },
    { id: 'mockups', label: 'Mockups', title: 'Fonts In Use',
      icon: [[1, 1, 15, 24], [18, 1, 14, 11], [18, 14, 14, 11]] }
  ];

  var SEED_COLLECTIONS = [
    { id: 'col-weekly', name: 'Weekly Faves', color: '#a88bfa', items: ['editorial-contrast', 'orbital-grotesk', 'modern-romance', 'bubble-pop'] },
    { id: 'col-tech', name: 'Tech Rebrand', color: '#4dc9ff', items: ['helvetic-standard', 'terminal-poetry', 'unbounded-futures'] },
    { id: 'col-swiss', name: 'Swiss Editorial', color: '#ff6f5e', items: ['slab-authority', 'civic-ledger'] }
  ];

  return {
    CLASSIFICATIONS: CLASSIFICATIONS,
    GOOGLE_FONTS: GOOGLE_FONTS,
    TAGS: TAGS,
    AXES: AXES,
    PAIRINGS: PAIRINGS,
    PALETTES: PALETTES,
    COPY: COPY,
    TYPO_PARAMS: TYPO_PARAMS,
    VIEW_MODES: VIEW_MODES,
    SEED_COLLECTIONS: SEED_COLLECTIONS
  };
})();
