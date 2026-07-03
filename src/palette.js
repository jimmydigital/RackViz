// palette.js — color palettes and device type definitions
// Palettes are orthogonal to styles: any palette works with any style.
// Each style declares a defaultPalette that matches its theme; the editor
// switches to it when the style changes.

export const DEVICE_TYPES = [
  { kind: 'blank', label: 'Blank Panel' },
  { kind: 'patch', label: 'Patch Panel' },
  { kind: 'brush', label: 'Brush/Cable Mgmt' },
  { kind: 'switch', label: 'Switch/Router' },
  { kind: 'appliance', label: 'Appliance' },
  { kind: 'server', label: 'Server/Compute' },
  { kind: 'storage', label: 'Storage Array' },
  { kind: 'power', label: 'Power Shelf' },
  { kind: 'shelf', label: 'Shelf' },
  { kind: 'generic', label: 'Generic Device' },
];

export const DEFAULT_COLOR = '#d9cdb0';
export const DEFAULT_PALETTE_NAME = 'futurama';

// kind → [hex, colorName]
export const PALETTES = {
  futurama: {
    label: 'Futurama',
    colors: {
      blank: ['#d9cdb0', 'Beige'],
      patch: ['#8e6fc7', 'Purple'],
      brush: ['#b3a37e', 'Khaki'],
      switch: ['#3fa9e0', 'Blue'],
      appliance: ['#e2679e', 'Pink'],
      server: ['#2fb5a3', 'Teal'],
      storage: ['#4f6fd8', 'Indigo'],
      power: ['#f28c28', 'Orange'],
      shelf: ['#c9bd9e', 'Sand'],
      generic: ['#94a7b8', 'Slate'],
    },
  },
  jetsons: {
    label: 'Jetsons',
    colors: {
      blank: ['#f2ecd9', 'Cream'],
      patch: ['#b79fe0', 'Lavender'],
      brush: ['#f4c542', 'Mustard'],
      switch: ['#57cfe0', 'Aqua'],
      appliance: ['#ff8f70', 'Coral'],
      server: ['#8fd6a2', 'Mint'],
      storage: ['#7fd6c2', 'Seafoam'],
      power: ['#ffb454', 'Tangerine'],
      shelf: ['#e6dcc2', 'Sand'],
      generic: ['#92bff0', 'Sky'],
    },
  },
  steampunk: {
    label: 'Steampunk',
    colors: {
      blank: ['#d8c49a', 'Parchment'],
      patch: ['#5e8f7a', 'Verdigris'],
      brush: ['#8a5a33', 'Leather'],
      switch: ['#c97b4a', 'Copper'],
      appliance: ['#93413d', 'Burgundy'],
      server: ['#b98a3d', 'Brass'],
      storage: ['#6e7f8f', 'Gunmetal'],
      power: ['#a3541f', 'Rust'],
      shelf: ['#7a5230', 'Walnut'],
      generic: ['#857b6c', 'Pewter'],
    },
  },
  eighties: {
    label: "'80s Neon",
    colors: {
      blank: ['#454066', 'Dusk'],
      patch: ['#b166ff', 'Ultraviolet'],
      brush: ['#ffe14d', 'Laser Lemon'],
      switch: ['#00e5ff', 'Cyan'],
      appliance: ['#ff2d95', 'Hot Pink'],
      server: ['#3bff9d', 'Neon Mint'],
      storage: ['#4d9fff', 'Electric Blue'],
      power: ['#ff8a2a', 'Sunset Orange'],
      shelf: ['#8a84b8', 'Chrome Violet'],
      generic: ['#ff6be6', 'Magenta'],
    },
  },
  mono: {
    label: 'Monochrome',
    colors: {
      blank: ['#d8d8d8', 'Light Gray'],
      patch: ['#9a9a9a', 'Gray'],
      brush: ['#b8b8b8', 'Silver'],
      switch: ['#8a8a8a', 'Steel'],
      appliance: ['#a6a6a6', 'Ash'],
      server: ['#7a7a7a', 'Graphite'],
      storage: ['#848c94', 'Gunmetal'],
      power: ['#6a6a6a', 'Charcoal'],
      shelf: ['#c6c6c6', 'Pale Gray'],
      generic: ['#909090', 'Slate Gray'],
    },
  },
  pastel: {
    label: 'Pastel',
    colors: {
      blank: ['#efe8da', 'Cream'],
      patch: ['#cdb8e8', 'Lilac'],
      brush: ['#d9cfae', 'Oat'],
      switch: ['#a9d3ef', 'Baby Blue'],
      appliance: ['#f2b8cf', 'Rose'],
      server: ['#aadfd4', 'Mint'],
      storage: ['#b9c4ee', 'Periwinkle'],
      power: ['#f7cf9e', 'Peach'],
      shelf: ['#e3dcc6', 'Bone'],
      generic: ['#c2cdd8', 'Mist'],
    },
  },
  highcontrast: {
    label: 'High Contrast',
    colors: {
      blank: ['#ffffff', 'White'],
      patch: ['#9900ff', 'Violet'],
      brush: ['#996600', 'Brown'],
      switch: ['#0055ff', 'Blue'],
      appliance: ['#ff0099', 'Magenta'],
      server: ['#00aa55', 'Green'],
      storage: ['#00ccff', 'Cyan'],
      power: ['#ff6600', 'Orange'],
      shelf: ['#cccccc', 'Gray'],
      generic: ['#ffcc00', 'Yellow'],
    },
  },
};

/** Resolved palette: kind → { hex, name }. Unknown name falls back to default. */
export function getPalette(name) {
  const p = PALETTES[name] || PALETTES[DEFAULT_PALETTE_NAME];
  const out = {};
  for (const [kind, [hex, colorName]] of Object.entries(p.colors)) {
    out[kind] = { hex, name: colorName };
  }
  return out;
}

/**
 * Merge comma-separated "kind=hexcolor" overrides into a named palette.
 * Returns { palette, errors }.
 */
export function resolveColors(colorOverrides, paletteName) {
  const palette = getPalette(paletteName);
  const errors = [];
  if (colorOverrides) {
    for (const pair of String(colorOverrides).split(',')) {
      const trimmed = pair.trim();
      if (!trimmed) continue;
      const eq = trimmed.indexOf('=');
      const kind = eq > 0 ? trimmed.slice(0, eq).trim().toLowerCase() : '';
      const hex = eq > 0 ? trimmed.slice(eq + 1).trim() : '';
      if (!kind || !/^[0-9a-fA-F]{6}$/.test(hex)) {
        errors.push(`Invalid color override "${trimmed}" (expected kind=hexcolor).`);
        continue;
      }
      palette[kind] = { hex: '#' + hex.toLowerCase(), name: 'Custom' };
    }
  }
  return { palette, errors };
}
