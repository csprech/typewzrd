### Identity
* **Name**: TypoWzrd
* **Platform**: Web Application (Standalone HTML/CSS/JS tool inside WZRD platform)
* **Function**: A comprehensive typographic discovery, styling, and mockup-testing studio. It combines the rapid performance-first native font styling of modern system font stacks, the editorial inspiration and tag-driven layout synthesis of Inspotype, the curation and specimen-testing workflows of Type.lol, and real-world media previewing from Fonts In Use.

---

### Complete Feature Inventory

#### 1. Discovery & Selection Engines
* **System Font Stack Engine**: Access and preview optimized native CSS font stacks classified by historical and technical styles (Neo-Grotesque, Humanist, Transitional, Classical Serif, Slab Serif, Rounded, Monospace).
* **Curated Web Font Pairings**: High-contrast, hand-picked pairs from Google Fonts that load dynamically on the fly based on style and layout choices.
* **Semantic Tag Filtering & Personality Sliders**: Search and filter styles using thematic tags (e.g., "Feminism", "Brutalism", "Cooking", "Tech", "Editorial") coupled with personality sliders (e.g., Expressive ⟷ Neutral, Classical ⟷ Contemporary, Playful ⟷ Serious).

#### 2. Layout & Specimen Playground
* **Specimen Grid Mode (Type.lol inspired)**: A horizontal scrolling multi-column grid showing detailed typeface specimens, adjustable font size displays, weight selections, and real-time editable preview strings.
* **Dynamic Design Moodboard (Inspotype inspired)**: Dynamically rendered design cards (e-commerce catalog item, data viz tracker, brand header, editorial block, orange promotional split layout) styled instantly with selected colors, fonts, and layout variables.
* **Real-World "In Use" Canvas Mocks (Fonts In Use inspired)**: An interactive scene previewer that superimposes chosen fonts onto mock visual assets:
  * A wine/beverage bottle with geometric labels.
  * An editorial/magazine cover page.
  * A graphic apparel T-shirt template.
  * A theatre billboard poster.

#### 3. Curation & Workspace Management
* **Collections Sidebar**: Organize favorites, pairings, and system stacks into customizable folders (e.g., "Weekly Faves", "Tech Rebrand", "Swiss Editorial") with live counts and quick-recall states.
* **Theme & Palette Generator**: Dynamically updates text and UI blocks based on preset aesthetic palettes (e.g., Coral & Plum, Neon High Contrast, Botanical & Cream, Sand & Charcoal).

---

### UI Architecture

#### Left Sidebar: Curation & Workspace (Persistence)
* **Header**: App Logo (`TypoWzrd`) and collection metrics.
* **Search Workspace**: Text input for finding saved pairings or active font families.
* **Collections Panel**: Interactive lists of user-created folders, displaying specimen counts (e.g., *Sacra (11)*, *Weekly Faves (12)*). Selecting a folder loads the curated items directly into the canvas.
* **Tabs Panel**: Workspace cache tracking recent individual font profiles and layouts for rapid switching.

#### Right Sidebar: Control Panel (Styling & Configuration)
* **Section 1: Typography System Selector**: Toggle between native "System Font Stacks" (zero-load speed) and "Google Web Fonts" (creative variety). Visual picker representing classification styles (Neo-Grotesque, Editorial Serif, Geometric Sans, Slab, Monospace).
* **Section 2: Mood & Personality Filters**: Dynamic tag grid selector (pills that light up when active) alongside horizontal personality sliders to refine font recommendation weights.
* **Section 3: Typographic Fine-Tuning**: Sliders for Scale factor, Base Line-Height, Letter-Spacing, and Base Font Size.
* **Section 4: Aesthetic & Palettes**: Visual palette grid picker featuring background-foreground swatches. Contrast indicator showing AA/AAA accessibility status.
* **Section 5: Mockup & Scene Selectors**: Visual grid picker displaying canvas layout modes (Horizontal Specimen Columns, Inspotype Moodboard, Fonts-in-Use Real Mockups).

#### Center Panel: Canvas Workspace
* A responsive container that switches view layouts dynamically based on selected mode:
  1. *Horizontal Multi-Column Specimen Grid*: Utilizing CSS-snap for horizontal browsing of specimen cards with live weight/size pickers.
  2. *Adaptive Moodboard*: A responsive masonry grid showcasing functional e-commerce, data viz, and brand identity cards.
  3. *Mockup Scene Canvas*: A high-fidelity CSS and `<canvas>` hybrid rendering real-world items (apparel, bottles, covers) in vector layouts.

---

### Core Algorithms & Systems

#### 1. Font Classification & Pairing Matcher
* An internal database maps thematic tags and personality slider values (scale -1 to +1) to corresponding font stacks.
* *Example Algorithm*: When `Classical ⟷ Contemporary` leans heavily classical and `Warm ⟷ Cool` leans warm, the tool prioritized Transitional or Old Style Editorial Serif combinations. If tags include `Tech` and `Neutral`, it serves neo-grotesque or geometric system stacks.

#### 2. Accessibility-Checked Color Harmonizer
* Generates accent, background, and text colors dynamically from color palettes. If custom values are set, it calculates relative luminance to ensure text remains readable, outputting a live WCAG ratio score directly onto preview cards.

#### 3. Responsive HTML-to-Canvas Exporter
* While specimens are rendered using flexible CSS layouts for rich interaction, the tool generates instant vector and PNG design assets. To export mockups, the DOM elements are serialized to an SVG container wrapped in a `<foreignObject>` tag and drawn to a hidden `<canvas>` for download.

---

### Key Decisions & Open Questions
1. **Dynamic Web Font Management**: Should Google Fonts be imported globally or inject `<link>` nodes on demand? *Decision*: Inject stylesheet links on demand to prevent UI latency.
2. **Text Editing Scenarios**: Should specimen previews be purely editable via contentEditable fields or static custom text inputs? *Decision*: Use `contenteditable="true"` directly on preview cards for an organic, natural workflow.
3. **Mockup Complexity**: How customizable are the mock layout components? *Decision*: Maintain fixed, beautiful layout templates whose structures stay intact, but colors, font family, typography weights, letter-spacing, and text values adapt programmatically.
