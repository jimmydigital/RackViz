// styles/steampunk.js — brass, copper, wood & gears (bundled colors)
import { esc, normalizeKind, accentFor, clampRackSize } from './common.js';

const U = 34;
const INNER_W = 500;
const EAR_W = 36;
const SIDE_PAD = 46;
const TOP_PAD = 110;
const BOT_PAD = 64;
const INK = '#241407';
const SW = 3;
const PLATE_TOP = '#dcc08e';
const FONT = "'Georgia','Times New Roman',serif";

const W = SIDE_PAD * 2 + EAR_W * 2 + INNER_W; // 664
const X0 = SIDE_PAD + EAR_W;

const COLORS = {
  blank: { hex: '#d8c49a', name: 'Parchment' },
  patch: { hex: '#5e8f7a', name: 'Verdigris' },
  brush: { hex: '#8a5a33', name: 'Leather' },
  switch: { hex: '#c97b4a', name: 'Copper' },
  appliance: { hex: '#93413d', name: 'Burgundy' },
  server: { hex: '#b98a3d', name: 'Brass' },
  storage: { hex: '#6e7f8f', name: 'Gunmetal' },
  power: { hex: '#a3541f', name: 'Rust' },
  shelf: { hex: '#7a5230', name: 'Walnut' },
  generic: { hex: '#857b6c', name: 'Pewter' },
};

/** Left color band is roughly square: width ≈ device height, capped at 64px. */
function bandW(h) {
  return Math.min(h, 64);
}

function hexBolt(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="#d9b45f" stroke="${INK}" stroke-width="1.2"/>`;
}

function gear(cx, cy, r) {
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += `<rect x="${cx - 2.6}" y="${cy - r - 4.5}" width="5.2" height="9" fill="#a3782f" stroke="${INK}" stroke-width="1.2" transform="rotate(${45 * i} ${cx} ${cy})"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#spBrass)" stroke="${INK}" stroke-width="2"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.34}" fill="#3c2716" stroke="${INK}" stroke-width="1.4"/>`;
  return s;
}

function gauge(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#efe3c2" stroke="${INK}" stroke-width="2"/>` +
    `<line x1="${cx - r * 0.55}" y1="${cy + r * 0.4}" x2="${cx}" y2="${cy}" stroke="#8e2f22" stroke-width="1.6"/>` +
    `<line x1="${cx}" y1="${cy}" x2="${cx + r * 0.35}" y2="${cy - r * 0.55}" stroke="${INK}" stroke-width="1.4"/>` +
    `<circle cx="${cx}" cy="${cy}" r="1.6" fill="${INK}"/>`;
}

function rivets(x, y, w, h) {
  const p = 7;
  return [[x + p, y + p], [x + w - p, y + p], [x + p, y + h - p], [x + w - p, y + h - p]]
    .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="2.2" fill="#d9b45f" stroke="${INK}" stroke-width="1.2"/>`)
    .join('');
}

function plate(x, y, w, h, acc) {
  const bw = bandW(h);
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#spPlate)" stroke="${INK}" stroke-width="${SW}"/>`;
  s += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>`;
  s += `<circle cx="${x + bw / 2}" cy="${y + h / 2}" r="2.4" fill="#d9b45f" stroke="${INK}" stroke-width="1.1"/>`;
  s += rivets(x, y, w, h);
  return s;
}

function rightLabel(x, y, w, h, label) {
  if (!label) return '';
  return `<text x="${x + w - 12}" y="${y + h / 2 + 5}" text-anchor="end" font-family="${FONT}" font-size="13" font-weight="bold" fill="${INK}">${esc(label)}</text>`;
}

const DEVICES = {
  blank(x, y, w, h, acc, label) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>` +
      `<line x1="${x + 18}" y1="${y + h / 2}" x2="${x + w - 18}" y2="${y + h / 2}" stroke="rgba(36,20,7,.28)" stroke-width="2"/>` +
      rivets(x, y, w, h) +
      (label ? `<text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-family="${FONT}" font-size="14" font-style="italic" fill="${INK}">${esc(label)}</text>` : '');
  },

  patch(x, y, w, h, acc, label, u) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>`;
    const n = 20;
    const step = (w - 40) / (n - 1);
    for (let r = 0; r < u; r++) {
      const cy = y + r * U + 15;
      for (let i = 0; i < n; i++) {
        const cx = x + 20 + i * step;
        s += `<circle cx="${cx}" cy="${cy}" r="5.6" fill="none" stroke="#d9b45f" stroke-width="2"/>`;
        s += `<circle cx="${cx}" cy="${cy}" r="3.4" fill="#1a120a" stroke="${INK}" stroke-width="1"/>`;
      }
    }
    if (label) s += `<text x="${x + w / 2}" y="${y + h - 4}" text-anchor="middle" font-family="${FONT}" font-size="9.5" font-weight="bold" fill="#f0e2bd">${esc(label)}</text>`;
    return s;
  },

  brush(x, y, w, h, acc, label) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>`;
    for (let lx = x + 10; lx <= x + w - 10; lx += 5) {
      s += `<line x1="${lx}" y1="${y + 6}" x2="${lx}" y2="${y + h - 14}" stroke="#241407" stroke-width="1.5" opacity="0.6"/>`;
    }
    if (label) s += `<text x="${x + w / 2}" y="${y + h - 4}" text-anchor="middle" font-family="${FONT}" font-size="9.5" font-weight="bold" fill="#f0e2bd">${esc(label)}</text>`;
    return s;
  },

  switch(x, y, w, h, acc, label, u) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + bandW(h) + 14;
    const n = 12, step = 22;
    // one row of valve ports (+ gauge) per U, like the patch panel
    for (let r = 0; r < u; r++) {
      const cy = y + r * U + U / 2;
      for (let i = 0; i < n; i++) {
        const cx = c0 + 6 + i * step;
        s += `<circle cx="${cx}" cy="${cy}" r="5.5" fill="#1a120a" stroke="#d9b45f" stroke-width="1.8"/>`;
        s += `<line x1="${cx - 3}" y1="${cy}" x2="${cx + 3}" y2="${cy}" stroke="#d9b45f" stroke-width="1"/>`;
        s += `<line x1="${cx}" y1="${cy - 3}" x2="${cx}" y2="${cy + 3}" stroke="#d9b45f" stroke-width="1"/>`;
      }
      s += gauge(c0 + 6 + n * step + 8, cy, 8);
    }
    return s + rightLabel(x, y, w, h, label);
  },

  appliance(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + bandW(h) + 14;
    const cy = y + h / 2;
    const r = Math.min(h / 2 - 4, 13);
    // porthole screen
    s += `<circle cx="${c0 + r + 4}" cy="${cy}" r="${r + 3}" fill="url(#spCopper)" stroke="${INK}" stroke-width="2"/>`;
    s += `<circle cx="${c0 + r + 4}" cy="${cy}" r="${r - 1}" fill="#10202a" stroke="${INK}" stroke-width="1.4"/>`;
    s += `<ellipse cx="${c0 + r}" cy="${cy - r * 0.4}" rx="${r * 0.45}" ry="${r * 0.22}" fill="rgba(255,255,255,.3)"/>`;
    s += `<circle cx="${c0 + 2 * r + 24}" cy="${cy}" r="3.6" fill="#ffb84d" stroke="${INK}" stroke-width="1.4"/>`;
    return s + rightLabel(x, y, w, h, label);
  },

  server(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + bandW(h) + 14;
    const bh = Math.max(16, h - 14);
    const by = y + (h - bh) / 2;
    for (let i = 0; i < 4; i++) {
      const bx = c0 + i * 74;
      s += `<rect x="${bx}" y="${by}" width="66" height="${bh}" rx="2" fill="url(#spCopper)" stroke="${INK}" stroke-width="1.8"/>`;
      s += `<circle cx="${bx + 6}" cy="${by + 5}" r="1.6" fill="#d9b45f" stroke="${INK}" stroke-width="0.8"/>`;
      s += `<circle cx="${bx + 60}" cy="${by + bh - 5}" r="1.6" fill="#d9b45f" stroke="${INK}" stroke-width="0.8"/>`;
      s += `<circle cx="${bx + 56}" cy="${by + bh / 2}" r="2.4" fill="#ffb84d" stroke="${INK}" stroke-width="1"/>`;
    }
    return s + rightLabel(x, y, w, h, label);
  },

  storage(x, y, w, h, acc, label, u) {
    let s = plate(x, y, w, h, acc);
    // grid of brass drive drawers: 4 columns wide, 2 rows per U
    const c0 = x + bandW(h) + 14;
    const cols = 4, dw = 68, colGap = 6, dh = 12, rowStep = 15;
    for (let r = 0; r < u * 2; r++) {
      const dy = y + 4 + r * rowStep + (r >> 1) * (U - 2 * rowStep);
      for (let c = 0; c < cols; c++) {
        const dx = c0 + c * (dw + colGap);
        s += `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="1.5" fill="url(#spPlate)" stroke="${INK}" stroke-width="1.4"/>`;
        s += `<circle cx="${dx + dw / 2}" cy="${dy + dh / 2}" r="1.8" fill="#3c2716" stroke="${INK}" stroke-width="0.8"/>`;
        s += `<circle cx="${dx + dw - 8}" cy="${dy + dh / 2}" r="1.6" fill="${(r + c) % 3 ? '#ffb84d' : '#8e2f22'}" stroke="${INK}" stroke-width="0.8"/>`;
      }
    }
    return s + rightLabel(x, y, w, h, label);
  },

  power(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + bandW(h) + 14;
    const cy = y + h / 2;
    const r = Math.min(11, h / 2 - 4);
    for (let i = 0; i < 3; i++) {
      s += gauge(c0 + r + 4 + i * (2 * r + 18), cy, r);
    }
    return s + rightLabel(x, y, w, h, label);
  },

  shelf(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const bw = bandW(h);
    const c0 = x + bw + 14;
    const pipeW = w - bw - 30;
    s += `<rect x="${c0}" y="${y + h - 13}" width="${pipeW}" height="7" rx="3.5" fill="url(#spCopper)" stroke="${INK}" stroke-width="1.6"/>`;
    s += `<rect x="${c0 + pipeW * 0.32}" y="${y + h - 15}" width="8" height="11" rx="2" fill="#d9b45f" stroke="${INK}" stroke-width="1.2"/>`;
    s += `<rect x="${c0 + pipeW * 0.66}" y="${y + h - 15}" width="8" height="11" rx="2" fill="#d9b45f" stroke="${INK}" stroke-width="1.2"/>`;
    if (label) s += `<text x="${(c0 + x + w) / 2}" y="${y + h / 2 + 1}" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="bold" fill="${INK}">${esc(label)}</text>`;
    return s;
  },

  generic(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const bw = bandW(h);
    s += `<rect x="${x + bw + 5}" y="${y + 4}" width="${w - bw - 11}" height="${h - 8}" rx="2" fill="${acc}" opacity="0.3"/>`;
    if (h >= U) s += gear(x + w - 26, y + h / 2, Math.min(9, h / 2 - 8));
    if (label) s += `<text x="${(x + bw + x + w) / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="bold" fill="${INK}">${esc(label)}</text>`;
    return s;
  },
};

function render(items, options = {}) {
  const rackSize = clampRackSize(options.rackSize);
  const title = String(options.title || 'Rack Diagram').slice(0, 128);
  const innerH = rackSize * U;
  const H = TOP_PAD + innerH + BOT_PAD;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">`;
  s += `<defs>
<linearGradient id="spBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a1c"/><stop offset="1" stop-color="#1f1409"/></linearGradient>
<linearGradient id="spWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a2c"/><stop offset="1" stop-color="#4a3018"/></linearGradient>
<linearGradient id="spBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b45f"/><stop offset="1" stop-color="#a3782f"/></linearGradient>
<linearGradient id="spPlate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${PLATE_TOP}"/><stop offset="1" stop-color="#bfa065"/></linearGradient>
<linearGradient id="spCopper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d08a55"/><stop offset="1" stop-color="#a25f33"/></linearGradient>
</defs>`;

  // background
  s += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#spBg)"/>`;

  // title plaque with gears
  const pw = 360, ph = 56, px = (W - pw) / 2, py = 18;
  s += gear(px - 26, py + 40, 14);
  s += gear(px + pw + 26, py + 22, 11);
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="8" fill="url(#spBrass)" stroke="${INK}" stroke-width="${SW}"/>`;
  s += `<rect x="${px + 5}" y="${py + 5}" width="${pw - 10}" height="${ph - 10}" rx="5" fill="none" stroke="rgba(36,20,7,.4)" stroke-width="1.6"/>`;
  s += hexBolt(px + 14, py + 14, 4) + hexBolt(px + pw - 14, py + 14, 4) + hexBolt(px + 14, py + ph - 14, 4) + hexBolt(px + pw - 14, py + ph - 14, 4);
  s += `<text x="${W / 2}" y="${py + 26}" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="bold" fill="${INK}">${esc(title)}</text>`;
  s += `<text x="${W / 2}" y="${py + 44}" text-anchor="middle" font-family="${FONT}" font-size="10.5" letter-spacing="3" fill="#4a3018">${rackSize} UNITS</text>`;

  // wooden frame, leather opening, brass ears with hex bolts
  s += `<rect x="${SIDE_PAD - 10}" y="${TOP_PAD - 14}" width="${EAR_W * 2 + INNER_W + 20}" height="${innerH + 28}" rx="10" fill="url(#spWood)" stroke="${INK}" stroke-width="${SW}"/>`;
  s += `<rect x="${X0}" y="${TOP_PAD}" width="${INNER_W}" height="${innerH}" fill="#1a120a" stroke="${INK}" stroke-width="${SW}"/>`;
  s += `<rect x="${SIDE_PAD}" y="${TOP_PAD}" width="${EAR_W}" height="${innerH}" fill="url(#spBrass)" stroke="${INK}" stroke-width="2.2"/>`;
  s += `<rect x="${X0 + INNER_W}" y="${TOP_PAD}" width="${EAR_W}" height="${innerH}" fill="url(#spBrass)" stroke="${INK}" stroke-width="2.2"/>`;
  for (let r = 0; r < rackSize; r++) {
    const cy = TOP_PAD + r * U + U / 2;
    s += hexBolt(SIDE_PAD + EAR_W / 2, cy, 4);
    s += hexBolt(X0 + INNER_W + EAR_W / 2, cy, 4);
    s += `<text x="${SIDE_PAD - 15}" y="${cy + 3.5}" text-anchor="end" font-family="${FONT}" font-size="10" fill="#c9a86a">${rackSize - r}</text>`;
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
  id: 'steampunk',
  label: 'Steampunk',
  defaultPalette: 'steampunk',
  colors: COLORS,
  render,
};
