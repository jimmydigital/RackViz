// styles/jetsons.js — Hanna-Barbera atomic-age / Googie style (bundled colors)
import { esc, normalizeKind, accentFor, clampRackSize } from './common.js';

const U = 34;
const INNER_W = 500;
const EAR_W = 30;
const SIDE_PAD = 64;
const TOP_PAD = 128;
const BOT_PAD = 96;
const INK = '#264e58';
const SW = 2.4;
const CREAM = '#fdf6e3';
const PLATE = '#ffffff';
const FONT = "'Trebuchet MS','Verdana',sans-serif";

const W = SIDE_PAD * 2 + EAR_W * 2 + INNER_W; // 688
const X0 = SIDE_PAD + EAR_W;

const COLORS = {
  blank: { hex: '#f2ecd9', name: 'Cream' },
  patch: { hex: '#b79fe0', name: 'Lavender' },
  brush: { hex: '#f4c542', name: 'Mustard' },
  switch: { hex: '#57cfe0', name: 'Aqua' },
  appliance: { hex: '#ff8f70', name: 'Coral' },
  server: { hex: '#8fd6a2', name: 'Mint' },
  storage: { hex: '#7fd6c2', name: 'Seafoam' },
  power: { hex: '#ffb454', name: 'Tangerine' },
  shelf: { hex: '#e6dcc2', name: 'Sand' },
  generic: { hex: '#92bff0', name: 'Sky' },
};

function sparkle(cx, cy, r, fill = '#ffffff', op = 0.9) {
  const q = r * 0.18;
  return `<path d="M ${cx} ${cy - r} Q ${cx + q} ${cy - q} ${cx + r} ${cy} Q ${cx + q} ${cy + q} ${cx} ${cy + r} Q ${cx - q} ${cy + q} ${cx - r} ${cy} Q ${cx - q} ${cy - q} ${cx} ${cy - r} Z" fill="${fill}" opacity="${op}"/>`;
}

function cloud(cx, cy, sc) {
  return `<g fill="#ffffff" opacity="0.88">` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${34 * sc}" ry="${13 * sc}"/>` +
    `<ellipse cx="${cx - 18 * sc}" cy="${cy - 7 * sc}" rx="${18 * sc}" ry="${10 * sc}"/>` +
    `<ellipse cx="${cx + 14 * sc}" cy="${cy - 8 * sc}" rx="${20 * sc}" ry="${11 * sc}"/>` +
    `</g>`;
}

/** Left color band is a roughly square pill: width ≈ band height, capped at 56px. */
function bandW(h) {
  return Math.min(h - 10, 56);
}

function plate(x, y, w, h, acc) {
  const bw = bandW(h);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${PLATE}" stroke="${INK}" stroke-width="${SW}"/>` +
    `<rect x="${x + 6}" y="${y + 5}" width="${bw}" height="${h - 10}" rx="${Math.min(10, bw / 2)}" fill="${acc}" stroke="${INK}" stroke-width="1.8"/>` +
    `<circle cx="${x + 6 + bw / 2}" cy="${y + h / 2}" r="${Math.min(3, bw / 6)}" fill="rgba(255,255,255,.55)"/>`;
}

function rightLabel(x, y, w, h, label) {
  if (!label) return '';
  return `<text x="${x + w - 12}" y="${y + h / 2 + 4.5}" text-anchor="end" font-family="${FONT}" font-size="12.5" font-weight="bold" font-style="italic" fill="${INK}">${esc(label)}</text>`;
}

function centerLabel(x, y, w, h, label, size = 13) {
  if (!label) return '';
  const c0 = x + 6 + bandW(h) + 12;
  return `<text x="${(c0 + x + w) / 2}" y="${y + h / 2 + 4.5}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="bold" font-style="italic" fill="${INK}">${esc(label)}</text>`;
}

const DEVICES = {
  blank(x, y, w, h, acc, label) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>` +
      `<circle cx="${x + 14}" cy="${y + h / 2}" r="2.2" fill="rgba(38,78,88,.35)"/>` +
      `<circle cx="${x + w - 14}" cy="${y + h / 2}" r="2.2" fill="rgba(38,78,88,.35)"/>` +
      (label ? `<text x="${x + w / 2}" y="${y + h / 2 + 4.5}" text-anchor="middle" font-family="${FONT}" font-size="13" font-style="italic" fill="${INK}">${esc(label)}</text>` : '');
  },

  patch(x, y, w, h, acc, label, u) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>`;
    const n = 24;
    const step = (w - 36) / (n - 1);
    for (let r = 0; r < u; r++) {
      const cy = y + r * U + 15;
      for (let i = 0; i < n; i++) {
        s += `<circle cx="${x + 18 + i * step}" cy="${cy}" r="4.2" fill="#ffffff" stroke="${INK}" stroke-width="1.4"/>`;
      }
    }
    if (label) s += `<text x="${x + w / 2}" y="${y + h - 4}" text-anchor="middle" font-family="${FONT}" font-size="9" font-weight="bold" fill="${INK}">${esc(label)}</text>`;
    return s;
  },

  brush(x, y, w, h, acc, label) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>`;
    for (let lx = x + 12; lx <= x + w - 12; lx += 6) {
      s += `<line x1="${lx}" y1="${y + 6}" x2="${lx}" y2="${y + h - 13}" stroke="${INK}" stroke-width="1.4" opacity="0.45" stroke-linecap="round"/>`;
    }
    if (label) s += `<text x="${x + w / 2}" y="${y + h - 4}" text-anchor="middle" font-family="${FONT}" font-size="9" font-weight="bold" fill="${INK}">${esc(label)}</text>`;
    return s;
  },

  switch(x, y, w, h, acc, label, u) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + 6 + bandW(h) + 12;
    const n = 14, step = 19.5;
    // one row of ports (+ LEDs) per U, like the patch panel
    for (let r = 0; r < u; r++) {
      const cy = y + r * U + U / 2;
      for (let i = 0; i < n; i++) {
        s += `<circle cx="${c0 + 6 + i * step}" cy="${cy}" r="5" fill="#eef8fa" stroke="${INK}" stroke-width="1.6"/>`;
      }
      s += `<circle cx="${c0 + 280}" cy="${cy}" r="4" fill="#ffffff" stroke="${acc}" stroke-width="2.6"/>`;
      s += `<circle cx="${c0 + 296}" cy="${cy}" r="4" fill="${acc}" stroke="${INK}" stroke-width="1.4"/>`;
    }
    return s + rightLabel(x, y, w, h, label);
  },

  appliance(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + 6 + bandW(h) + 12;
    const sh = Math.max(18, h - 12);
    const sy = y + (h - sh) / 2;
    s += `<rect x="${c0 + 2}" y="${sy}" width="150" height="${sh}" rx="${Math.min(sh / 2, 14)}" fill="#123c46" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<ellipse cx="${c0 + 26}" cy="${sy + sh * 0.32}" rx="14" ry="${Math.max(2.5, sh * 0.16)}" fill="rgba(255,255,255,.45)"/>`;
    s += `<circle cx="${c0 + 170}" cy="${y + h / 2}" r="4" fill="#ffd24a" stroke="${INK}" stroke-width="1.4"/>`;
    return s + rightLabel(x, y, w, h, label);
  },

  server(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + 6 + bandW(h) + 12;
    const bh = Math.max(16, h - 12);
    const by = y + (h - bh) / 2;
    for (let i = 0; i < 4; i++) {
      const bx = c0 + i * 76;
      s += `<rect x="${bx}" y="${by}" width="66" height="${bh}" rx="${Math.min(bh / 2, 11)}" fill="#f4f9fa" stroke="${INK}" stroke-width="1.8"/>`;
      s += `<circle cx="${bx + 52}" cy="${by + bh / 2}" r="2.6" fill="${acc}" stroke="${INK}" stroke-width="1"/>`;
    }
    return s + rightLabel(x, y, w, h, label);
  },

  storage(x, y, w, h, acc, label, u) {
    let s = plate(x, y, w, h, acc);
    // grid of 2.5" drive pills: 4 columns wide, 2 rows per U
    const c0 = x + 6 + bandW(h) + 12;
    const cols = 4, dw = 68, colGap = 8, dh = 12, rowStep = 15;
    for (let r = 0; r < u * 2; r++) {
      const dy = y + 4 + r * rowStep + (r >> 1) * (U - 2 * rowStep);
      for (let c = 0; c < cols; c++) {
        const dx = c0 + c * (dw + colGap);
        s += `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="${dh / 2}" fill="#f4f9fa" stroke="${INK}" stroke-width="1.5"/>`;
        s += `<circle cx="${dx + dw - 10}" cy="${dy + dh / 2}" r="2.2" fill="${(r + c) % 2 ? acc : '#ffd24a'}" stroke="${INK}" stroke-width="0.9"/>`;
      }
    }
    return s + rightLabel(x, y, w, h, label);
  },

  power(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + 6 + bandW(h) + 12;
    const mh = Math.max(16, h - 12);
    const my = y + (h - mh) / 2;
    for (let i = 0; i < 3; i++) {
      const mx = c0 + i * 100;
      s += `<rect x="${mx}" y="${my}" width="88" height="${mh}" rx="8" fill="#f4f9fa" stroke="${INK}" stroke-width="1.8"/>`;
      const r = Math.min(7, mh / 2 - 3);
      s += `<circle cx="${mx + 44}" cy="${my + mh / 2}" r="${r}" fill="${acc}" stroke="${INK}" stroke-width="1.6"/>`;
      s += `<line x1="${mx + 44}" y1="${my + mh / 2}" x2="${mx + 44 + r * 0.7}" y2="${my + mh / 2 - r * 0.5}" stroke="${INK}" stroke-width="1.4"/>`;
    }
    return s + rightLabel(x, y, w, h, label);
  },

  shelf(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + 6 + bandW(h) + 12;
    s += `<rect x="${c0}" y="${y + h - 12}" width="${w - (c0 - x) - 16}" height="7" rx="3.5" fill="#dff2f6" stroke="${INK}" stroke-width="1.6"/>`;
    return s + centerLabel(x, y - 3, w, h, label);
  },

  generic(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const bw = bandW(h);
    s += `<rect x="${x + bw + 12}" y="${y + 4}" width="${w - bw - 20}" height="${h - 8}" rx="8" fill="${acc}" opacity="0.3"/>`;
    if (h >= U) s += sparkle(x + w - 26, y + 12, 6, '#ffffff', 0.95);
    return s + centerLabel(x, y, w, h, label);
  },
};

function render(items, options = {}) {
  const rackSize = clampRackSize(options.rackSize);
  const title = String(options.title || 'Rack Diagram').slice(0, 128);
  const innerH = rackSize * U;
  const H = TOP_PAD + innerH + BOT_PAD;
  const fy = TOP_PAD - 14;
  const fh = innerH + 28;
  const fb = fy + fh;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">`;
  s += `<defs><linearGradient id="jtSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3ecf6"/><stop offset="1" stop-color="#68c1dc"/></linearGradient></defs>`;

  // sky, clouds, sparkles
  s += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#jtSky)"/>`;
  s += cloud(W * 0.14, 78, 1);
  s += cloud(W * 0.87, 118, 0.8);
  s += cloud(W * 0.12, H - 70, 0.9);
  s += cloud(W * 0.9, H - 130, 0.7);
  s += sparkle(W * 0.3, 40, 7) + sparkle(W * 0.72, 66, 5) + sparkle(W * 0.94, H * 0.45, 6) + sparkle(W * 0.05, H * 0.55, 5);

  // antenna + title pill
  const pw = 320, ph = 48, px = (W - pw) / 2, py = 58;
  s += `<line x1="${W / 2}" y1="${py}" x2="${W / 2}" y2="36" stroke="${INK}" stroke-width="2.4"/>`;
  s += `<circle cx="${W / 2}" cy="30" r="6.5" fill="#ff8f70" stroke="${INK}" stroke-width="2"/>`;
  s += sparkle(W / 2 + 16, 22, 5);
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="#ff8f70" stroke="${INK}" stroke-width="${SW}"/>`;
  s += `<text x="${W / 2}" y="${py + 21}" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="bold" font-style="italic" fill="#fff8ec">${esc(title)}</text>`;
  s += `<text x="${W / 2}" y="${py + 38}" text-anchor="middle" font-family="${FONT}" font-size="9.5" letter-spacing="3" fill="#fff2e2">${rackSize} UNITS</text>`;

  // pedestal: tapered stilt + saucer disc
  s += `<polygon points="${W / 2 - 9},${fb} ${W / 2 + 9},${fb} ${W / 2 + 4},${fb + 52} ${W / 2 - 4},${fb + 52}" fill="${CREAM}" stroke="${INK}" stroke-width="${SW}"/>`;
  s += `<ellipse cx="${W / 2}" cy="${fb + 58}" rx="92" ry="13" fill="${CREAM}" stroke="${INK}" stroke-width="${SW}"/>`;

  // frame + opening + pill posts
  s += `<rect x="${SIDE_PAD - 10}" y="${fy}" width="${EAR_W * 2 + INNER_W + 20}" height="${fh}" rx="24" fill="${CREAM}" stroke="${INK}" stroke-width="${SW}"/>`;
  s += `<rect x="${X0}" y="${TOP_PAD}" width="${INNER_W}" height="${innerH}" fill="#eaf7fa" stroke="${INK}" stroke-width="2"/>`;
  s += `<rect x="${SIDE_PAD}" y="${TOP_PAD}" width="${EAR_W}" height="${innerH}" rx="15" fill="#dff2f6" stroke="${INK}" stroke-width="1.8"/>`;
  s += `<rect x="${X0 + INNER_W}" y="${TOP_PAD}" width="${EAR_W}" height="${innerH}" rx="15" fill="#dff2f6" stroke="${INK}" stroke-width="1.8"/>`;
  for (let r = 0; r < rackSize; r++) {
    const cy = TOP_PAD + r * U + U / 2;
    const dot = r % 2 === 0 ? '#ff8f70' : '#57cfe0';
    s += `<circle cx="${SIDE_PAD + EAR_W / 2}" cy="${cy}" r="2.6" fill="${dot}" stroke="${INK}" stroke-width="1"/>`;
    s += `<circle cx="${X0 + INNER_W + EAR_W / 2}" cy="${cy}" r="2.6" fill="${dot}" stroke="${INK}" stroke-width="1"/>`;
    // U label in a little circle
    s += `<circle cx="${SIDE_PAD - 26}" cy="${cy}" r="9" fill="rgba(255,255,255,.85)" stroke="${INK}" stroke-width="1.4"/>`;
    s += `<text x="${SIDE_PAD - 26}" y="${cy + 3}" text-anchor="middle" font-family="${FONT}" font-size="8.5" font-weight="bold" fill="${INK}">${rackSize - r}</text>`;
  }

  // devices, top-down
  const palette = options.palette || COLORS;
  let yCur = TOP_PAD;
  for (const item of items) {
    const h = item.u_height * U;
    const kind = normalizeKind(item.kind);
    const acc = accentFor(item, palette, COLORS.generic.hex);
    const draw = DEVICES[kind] || DEVICES.generic;
    s += draw(X0, yCur, INNER_W, h, acc, item.label, item.u_height);
    yCur += h;
  }

  s += '</svg>';
  return { svg: s, width: W, height: H };
}

export default {
  id: 'jetsons',
  label: 'Jetsons',
  defaultPalette: 'jetsons',
  colors: COLORS,
  render,
};
