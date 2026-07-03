# RackfaceViz — Comprehensive Recreation Prompt

Build a fully static, client-side web application called **RackfaceViz** that generates stylized server rack face diagrams as SVG. The app runs entirely in the browser with no server-side rendering — just HTML, CSS, and JavaScript (ES modules) served from static hosting.

---

## Architecture

- **Fully static** — no Node.js runtime, no Express, no server-side logic in production
- **ES Modules** — all JavaScript uses `import`/`export` syntax with `<script type="module">`
- **No inline scripts** — all JS must be in external `.js` files (CSP compliance)
- **No inline styles** in HTML — use external `.css` files (CSP compliance)
- **No build step** — raw source files are served directly

## File Structure

```
src/
├── index.html        ← Landing page with usage guide and embedding docs
├── index.css         ← Styles for landing page
├── editor.html       ← Visual WYSIWYG rack editor
├── editor.css        ← Styles for editor (dark theme)
├── editor.js         ← Editor logic (ES module)
├── render.html       ← Standalone render page (reads URL params, displays SVG)
├── render.css        ← Styles for render page
├── render-app.js     ← Render page logic (ES module)
├── renderer.js       ← Thin dispatcher → active style's render() (ES module)
├── palette.js        ← Color palettes and device type definitions (ES module)
├── parser.js         ← Rack definition parser and pretty-printer (ES module)
└── styles/
    ├── index.js      ← STYLES registry, getStyle(), DEFAULT_STYLE_NAME
    ├── common.js     ← Shared helpers: esc, normalizeKind, accentFor
    ├── futurama.js   ← Default style (palette-aware) — visuals described below
    ├── jetsons.js    ← Jetsons style — see Style System section
    ├── steampunk.js  ← Steampunk style — see Style System section
    └── eighties.js   ← '80s neon style — see Style System section
```

> **Styles:** the app supports multiple visual styles (`style=` URL param, editor
> dropdown). Styles control shapes/geometry; palettes control colors and are
> orthogonal — each style has a matching default palette that is used when the
> style changes or no palette is given. See the Style System section below.

---

## Core Modules

### palette.js

Exports:
- `DEVICE_TYPES` — array of normalized device layout types:
  - `blank` (Blank Panel), `patch` (Patch Panel), `brush` (Brush/Cable Mgmt), `switch` (Switch/Router), `appliance` (Appliance), `server` (Server/Compute), `storage` (Storage Array), `power` (Power Shelf), `shelf` (Shelf), `generic` (Generic Device)
- `PALETTES` — named color palette objects, each mapping device kinds to hex colors:
  - `futurama` (default) — bold retro colors: blue switches, teal servers, orange power, purple compute, pink appliances
  - `jetsons` — atomic-age pastels matching the jetsons style (aqua, coral, mint, mustard)
  - `steampunk` — brass, copper, verdigris, rust matching the steampunk style
  - `eighties` — neon colors (hot pink, cyan, ultraviolet) matching the '80s style
  - `mono` — grayscale
  - `pastel` — soft muted tones
  - `highcontrast` — pure saturated colors for accessibility

  Palettes are orthogonal to styles: any palette can be combined with any style. Each style declares a `defaultPalette` matching its theme.
- `DEFAULT_COLOR` — fallback beige (`#d9cdb0`)
- `DEFAULT_PALETTE_NAME` — `'futurama'`
- `getPalette(name)` — returns a resolved palette object (kind → {hex, name})
- `resolveColors(colorOverrides, paletteName)` — validates and merges comma-separated `kind=hexcolor` overrides with a named palette. Returns `{palette, errors}`.

### parser.js

Exports:
- `parse(itemsString)` — parses a pipe-separated items string into an array of item objects
  - Format: `label:u_height:kind[:color]` separated by `|`
  - Labels can be empty (0–64 chars)
  - u_height: positive integer 1–60
  - kind: non-empty string
  - color: optional 4th field, 6-char hex (no #)
  - Percent-decodes labels per RFC 3986
  - Returns array of `{label, u_height, kind, color?}` or `{error: true, message, index}`
- `prettyPrint(items)` — converts item array back to URL-safe string
  - Encodes `%`, `|`, `:`, `&` in labels
  - Includes `:color` suffix when item has a color property
  - Round-trip guarantee: `parse(prettyPrint(items))` ≡ `items`

### renderer.js

Exports:
- `render(items, options)` — dispatches to the active style's `render()`, returns SVG markup string
  - `options.rackSize` — integer 1–60
  - `options.title` — string for header plaque
  - `options.style` — style id (default `futurama`); see the Style System section below
  - `options.palette` — resolved palette object from `getPalette()`; defaults to the style's matching palette

**Default Visual Style — Futurama Cartoon Aesthetic (`styles/futurama.js`):**
- Thick dark ink outlines (3.2px, color #1b1b22)
- Dark space gradient background (#16313a → #0c1a20)
- Teal title plaque with rack name and "N UNITS" subtitle
- Beige rack frame with rounded corners, chrome ear posts with mounting bolts
- U-number labels on the left side (numbered top-down, highest at top)
- Per-device color from palette or per-item color override

**Geometry:**
- U_HEIGHT = 34px per rack unit
- INNER_W = 500px rack opening
- EAR_W = 34px chrome posts
- TOP_PAD = 96px, BOT_PAD = 56px, SIDE_PAD = 40px

**Device Layouts by Kind:**

| Kind | Layout |
|------|--------|
| `blank` | Beige panel, horizontal groove, corner rivets, centered label (font-size 14, dark) |
| `patch` | Full-width colored background, 24 ports per row (one row per U), LED dots above ports, small label at bottom |
| `brush` | Full-width colored background, vertical brush lines across full width, small label at bottom |
| `switch` | Cream faceplate + left color band, 14 port rectangles + 2 LED bulbs per U row (one row per U, like patch), right-aligned label |
| `appliance` | Cream faceplate + left color band, black screen rectangle, LED bulb next to screen, right-aligned label |
| `server` | Cream faceplate + left color band, 4 chrome drive bays with activity LEDs, right-aligned label |
| `storage` | Cream faceplate + left color band, grid of 2.5" drive sleds — 4 columns wide, 2 rows per U — each with activity LED, right-aligned label |
| `power` | Cream faceplate + left color band, 3 PSU module rectangles with bulbs, right-aligned label |
| `shelf` | Cream faceplate + left color band, chrome rail, centered label |
| `generic` | Cream faceplate + left color band, translucent colored overlay, centered label |

**Kind Normalization:**
- `switch_grn`, `switch_cyn`, `router` → renders as `switch`
- `compute`, `gpu` → renders as `server`
- `jbod`, `disk_shelf` → renders as `storage`
- `firewall`, `load_balancer`, `console`, `pdu`, `ups`, `fiber_panel`, `kvm` → renders as `generic`

**Per-device color:** If an item has a `color` property (6-char hex), use `#color` as the accent instead of the palette color.

**Returns:** `{ svg: string, width: number, height: number }`

---

## Style System

A **style** is a visual theme: geometry, shapes, line treatment, background, and typography. **Palettes are orthogonal** — any named palette (`futurama`, `jetsons`, `steampunk`, `eighties`, `mono`, `pastel`, `highcontrast`) can be combined with any style. Each style declares a `defaultPalette` matching its theme; when no `palette` is specified (URL) or when the style changes (editor), the style's matching palette is used.

Per-device color overrides (the optional 4th item field, `label:u:kind:hexcolor`) are honored by **every** style and always win over the palette color.

### Style module interface

Each style is one ES module in `src/styles/` with a default export:

```js
export default {
  id: 'jetsons',              // URL value and registry key, lowercase
  label: 'Jetsons',           // shown in editor dropdown
  defaultPalette: 'jetsons',  // palette used when none is specified
  colors: { kind: { hex, name }, ... }, // theme colors; also defined as a named palette in palette.js
  render(items, { rackSize, title, palette }) // → { svg, width, height }
};
```

- `render` uses `options.palette` (a resolved palette from `getPalette()`) for
  device accents, falling back to its own `colors` when absent.
- A new style should also add a matching named palette to `PALETTES` in
  `palette.js` (same colors as its `colors` map) and set `defaultPalette` to it.
- Styles own their full geometry (paddings, frame, decorations) but must keep
  `U_HEIGHT`-proportional device rows and honor kind normalization from
  `styles/common.js` (shared: `esc`, `normalizeKind`, `accentFor`).
- **Left color bands are roughly square**: band width ≈ device height, capped
  (~56–64px), so 1U devices get a square swatch and labels keep maximum room.

### Registry — `src/styles/index.js`

```js
export const STYLES = [futurama, jetsons];      // order = dropdown order
export const DEFAULT_STYLE_NAME = 'futurama';
export function getStyle(name)                  // unknown/missing → default
```

**Adding a style = create `src/styles/<id>.js` + add one import/entry to `STYLES`.**
Editor dropdown, render page, and color dropdowns pick it up automatically.
`renderer.js` is a thin dispatcher: `render(items, opts)` → `getStyle(opts.style).render(...)`.

### URL parameter

`style=<id>` on both `render.html` and `editor.html`. Default `futurama`; invalid values fall back to default. `palette=` works with every style and defaults to the active style's `defaultPalette`; invalid values fall back to that default. `colors=` overrides apply on top of whichever palette is active.

### Editor behavior

- Style dropdown (populated from `STYLES`) next to the palette dropdown.
- **Changing the style resets the palette dropdown to the new style's matching
  palette** (`defaultPalette`); the user can then pick any other palette.
- Per-device color dropdown lists the active palette's colors plus "Default".
- Shareable URL includes `style=` (omitted when default) and `palette=` only
  when it differs from the active style's default palette.

### Built-in styles

#### `futurama` (default)
As specified in the renderer section above: thick ink outlines (3.2px, #1b1b22),
dark space gradient, teal plaque, beige frame, chrome ears/bolts. Palette-aware.

#### `jetsons`
Hanna-Barbera atomic-age / Googie look:

- **Background**: bright sky gradient (light aqua → deeper aqua), puffy white
  cloud clusters, 4-point white sparkle stars.
- **Frame**: cream, heavily rounded corners; pill-shaped light-aqua posts with
  alternating coral/aqua dots; thin antenna with coral ball atop the title
  plaque; below the frame a tapered stilt onto a flying-saucer disc base.
- **Plaque**: coral pill with cream italic title and letter-spaced "N UNITS".
- **Lines**: thinner (≈2.2–2.4px), deep-teal ink (#264e58).
- **U labels**: numbers inside small white circles.
- **Devices**: white faceplates with rounded pill accent bands; circular ports
  (patch/switch); bubble screens with glass highlight (appliance); pill-shaped
  drive bays (server); pill-drive grid 4×2-per-U (storage); dial modules
  (power); sparkle accents (generic).
- **Theme colors**: blank cream `#f2ecd9`, patch lavender `#b79fe0`, brush
  mustard `#f4c542`, switch aqua `#57cfe0`, appliance coral `#ff8f70`, server
  mint `#8fd6a2`, storage seafoam `#7fd6c2`, power tangerine `#ffb454`, shelf
  sand `#e6dcc2`, generic sky `#92bff0`.

#### `steampunk`
Brass, copper, wood, and gears:

- **Background**: dark aged-wood gradient. **Frame**: walnut wood with brass
  ear rails and hexagonal bolts. **Plaque**: engraved brass with corner rivets
  and beveled border, flanked by toothed gears. Serif (Georgia) typography.
- **Devices**: aged-brass faceplates with corner rivets; portholes for patch
  ports and appliance screens; valve-wheel switch ports with a pressure gauge;
  riveted copper drive bays (server); brass drawer grid with pull knobs
  (storage); pressure-gauge dials with needles (power); copper pipe rail
  (shelf); gear accent (generic). Amber lamp LEDs throughout.
- **Theme colors**: blank parchment `#d8c49a`, patch verdigris `#5e8f7a`,
  brush leather `#8a5a33`, switch copper `#c97b4a`, appliance burgundy
  `#93413d`, server brass `#b98a3d`, storage gunmetal `#6e7f8f`, power rust
  `#a3541f`, shelf walnut `#7a5230`, generic pewter `#857b6c`.

#### `eighties`
'80s synthwave with neon tubing:

- **Background**: night-purple gradient, white stars, pink retrowave
  perspective grid below the rack. **Frame**: dark chassis with a glowing pink
  neon rail; alternating pink/cyan glowing dots on the posts. **Plaque**: neon
  sign — dark panel, pink tube border, glowing italic title, cyan letter-spaced
  subtitle.
- **Devices**: dark faceplates whose left band is a glowing neon tube outline
  (square, per the band rule) with a faint fill; ports/bays are dark cutouts
  with neon-stroked edges; glowing accent LEDs (alternating pink/cyan on patch
  and storage); scanlined CRT screen (appliance); neon dial (power); neon rail
  (shelf). Labels render in the device's neon color with glow. Uses an SVG
  gaussian-blur glow filter (`#e8glow`).
- **Theme colors**: blank dusk `#454066`, patch ultraviolet `#b166ff`, brush
  laser lemon `#ffe14d`, switch cyan `#00e5ff`, appliance hot pink `#ff2d95`,
  server neon mint `#3bff9d`, storage electric blue `#4d9fff`, power sunset
  orange `#ff8a2a`, shelf chrome violet `#8a84b8`, generic magenta `#ff6be6`.

---

## Pages

### index.html — Landing Page

- Links to editor.html (prominent styled button)
- Links to render.html
- Parameters table: items (required), size (default 42), title, palette, colors
- Item format docs: `label:u_height:kind[:color]` pipe-separated
- Device kinds reference
- Embedding instructions for wikis (iframe-based since CSP prevents img→JS execution)
- SVG→PNG conversion instructions with example commands for macOS/Linux (`rsvg-convert`, with Inkscape as alternative)
- Example link to render.html with a full 32U demo rack (eighties style: blanks, patch, brush, switches, servers, storage, appliance, power, shelf, with per-item color overrides)

### editor.html — Visual Editor

**Top controls row:**
- Rack Size (numeric input, 1–60, default 42)
- Title (text input, max 128 chars, default "Rack Diagram")
- Style selector (dropdown from STYLES registry: Futurama, Jetsons, Steampunk, '80s Neon, …)
- Palette selector (dropdown from PALETTES) — resets to the style's matching palette when the style changes; any palette can then be chosen for any style

**Item list (scrollable):**
Rows scale vertically with the device's U height (48px per U via a `--u` CSS variable), so the edit list mirrors the proportions of the rendered rack — multi-U devices are proportionally taller and easier to grab for drag-and-drop.

Each row has:
- U-range label (auto-calculated, e.g., "U42" for 1U or "U42–41" for multi-U; updates on reorder/resize)
- Drag handle (☰) for reordering via HTML5 drag-and-drop
- Label text input (max 64 chars, can be empty)
- Device type dropdown (10 normalized types)
- Color dropdown (per-device, options from active palette + "Default")
- U-height numeric input (1–rackSize)
- Duplicate button (⧉) — copies row, removes blanks from bottom to fit
- Remove button (✕)

**Behaviors:**
- Invariant: after every structural change (add, remove, duplicate, U-height change, rack-size change, URL load), the editor normalizes rows to cover the rack exactly — overflow blanks are trimmed from the bottom, shortfall is padded with 1U blanks — so every U (including U1) always has an editable row
- When rack size increases beyond total U, auto-add 1U blank rows at bottom
- When U-height increases on a device, auto-remove blank rows from bottom to fit
- Debounced updates (300ms) regenerate items string, shareable URL, and live preview
- Drag-and-drop triggers update on drop/dragend
- Accepts `?items=...&size=...&title=...&palette=...` URL params to pre-populate (same format as render page)

**Output section:**
- Read-only textarea with generated items string + Copy button
- Read-only textarea with shareable render.html URL + Copy button

**Preview panel:**
- "Live Preview" heading with "⬇ Download SVG" button (creates blob URL for download)
- SVG rendered client-side directly (no fetch calls) using renderer.js
- Auto-pads with blanks if total U < rack size before rendering

**Dark theme CSS:** Deep navy/purple background, teal accents, high-contrast inputs.

### render.html — Standalone Render Page

- Reads URL query params: items, size, title, style, palette, colors
- Parses items, resolves colors, pads with blanks if needed
- Renders SVG full-viewport on dark background
- Shows error messages for invalid input
- No download button (that's in the editor)
- External script: `render-app.js`

---

## URL Format Examples

```
render.html?items=QFX5200:1:switch|Patch%20Panel:2:patch|Server:3:server&size=6&title=My%20Rack
render.html?items=Switch:1:switch:ff0000|Blank:5:blank&size=6&palette=mono
render.html?items=Server:2:server|Switch:1:switch&size=6&style=jetsons
editor.html?items=QFX5200:1:switch|Server:2:server&size=3&title=Demo
```

---

## Key Design Decisions

1. **No PNG support** — requires server-side rasterization; SVG-only for static hosting
2. **No inline scripts/styles** — strict CSP environments block them; all external files
3. **ES Modules** — clean dependency graph, no bundler needed
4. **Labels are optional** — empty labels render the device without text
5. **Per-device color override** — 4th field in item format (kind=hexcolor), dropdown in editor
6. **Auto-blank-fill** — if items total fewer U than rack size, pad with blanks (don't error)
7. **Overflow errors** — if items exceed rack size, show error
8. **Wiki embedding** — use iframes to render.html (img tags can't execute JS)
9. **SVG download** — blob URL download button in editor for saving as .svg file
10. **Pluggable styles** — style modules in `src/styles/` behind a registry; adding a style is one new file + one registry entry + a matching palette (see Style System section). Palettes are orthogonal to styles; each style's `defaultPalette` applies when none is chosen.
