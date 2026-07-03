// styles/eighties.js — synthwave: dark panels, glowing neon tube accents (bundled colors)
import { esc, normalizeKind, accentFor, clampRackSize } from './common.js';

const U = 34;
const INNER_W = 500;
const EAR_W = 30;
const SIDE_PAD = 48;
const TOP_PAD = 110;
const BOT_PAD = 78;
const INK = '#07070f';
const PANEL = '#14121f';
const PANEL_DARK = '#0c0a18';
const EDGE = '#2f2a4d';
const PINK = '#ff2d95';
const CYAN = '#00e5ff';
const FONT = "'Verdana','DejaVu Sans',sans-serif";
const GLOW = 'filter="url(#e8glow)"';

const W = SIDE_PAD * 2 + EAR_W * 2 + INNER_W; // 656
const X0 = SIDE_PAD + EAR_W;

const COLORS = {
  blank: { hex: '#454066', name: 'Dusk' },
  patch: { hex: '#b166ff', name: 'Ultraviolet' },
  brush: { hex: '#ffe14d', name: 'Laser Lemon' },
  switch: { hex: '#00e5ff', name: 'Cyan' },
  appliance: { hex: '#ff2d95', name: 'Hot Pink' },
  server: { hex: '#3bff9d', name: 'Neon Mint' },
  storage: { hex: '#4d9fff', name: 'Electric Blue' },
  power: { hex: '#ff8a2a', name: 'Sunset Orange' },
  shelf: { hex: '#8a84b8', name: 'Chrome Violet' },
  generic: { hex: '#ff6be6', name: 'Magenta' },
};

/** Left accent is a roughly square neon tube: width ≈ tube height, capped at 56px. */
function bandW(h) {
  return Math.min(h - 10, 56);
}

/** Dark faceplate with a glowing neon tube band on the left. */
function plate(x, y, w, h, acc) {
  const bw = bandW(h);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PANEL}" stroke="${EDGE}" stroke-width="2"/>` +
    `<rect x="${x + 5}" y="${y + 5}" width="${bw}" height="${h - 10}" rx="8" fill="${acc}" fill-opacity="0.12" stroke="${acc}" stroke-width="2.5" ${GLOW}/>`;
}

function rightLabel(x, y, w, h, label, acc) {
  if (!label) return '';
  return `<text x="${x + w - 12}" y="${y + h / 2 + 4.5}" text-anchor="end" font-family="${FONT}" font-size="12.5" font-weight="bold" fill="${acc}" ${GLOW}>${esc(label)}</text>`;
}

function centerLabel(x, y, w, h, label, acc) {
  if (!label) return '';
  const c0 = x + 5 + bandW(h) + 12;
  return `<text x="${(c0 + x + w) / 2}" y="${y + h / 2 + 4.5}" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="bold" fill="${acc}" ${GLOW}>${esc(label)}</text>`;
}

const DEVICES = {
  blank(x, y, w, h, acc, label) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PANEL}" stroke="${EDGE}" stroke-width="2"/>` +
      `<line x1="${x + 20}" y1="${y + h / 2}" x2="${x + w - 20}" y2="${y + h / 2}" stroke="${acc}" stroke-width="1.2" opacity="0.5"/>` +
      (label ? `<text x="${x + w / 2}" y="${y + h / 2 + 4.5}" text-anchor="middle" font-family="${FONT}" font-size="12.5" fill="#8f88c2">${esc(label)}</text>` : '');
  },

  patch(x, y, w, h, acc, label, u) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PANEL}" stroke="${acc}" stroke-width="2" ${GLOW}/>`;
    const n = 24, pw = 10;
    const gap = (w - n * pw) / (n + 1);
    for (let r = 0; r < u; r++) {
      const rowY = y + r * U;
      for (let i = 0; i < n; i++) {
        const px = x + gap + i * (pw + gap);
        s += `<circle cx="${px + pw / 2}" cy="${rowY + 8}" r="1.6" fill="${i % 2 ? PINK : CYAN}" ${GLOW}/>`;
        s += `<rect x="${px}" y="${rowY + 13}" width="${pw}" height="10" fill="${PANEL_DARK}" stroke="${acc}" stroke-width="1.2"/>`;
      }
    }
    if (label) s += `<text x="${x + w / 2}" y="${y + h - 4}" text-anchor="middle" font-family="${FONT}" font-size="9" font-weight="bold" fill="${acc}" ${GLOW}>${esc(label)}</text>`;
    return s;
  },

  brush(x, y, w, h, acc, label) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PANEL}" stroke="${acc}" stroke-width="2" ${GLOW}/>`;
    for (let lx = x + 12; lx <= x + w - 12; lx += 6) {
      s += `<line x1="${lx}" y1="${y + 6}" x2="${lx}" y2="${y + h - 13}" stroke="${acc}" stroke-width="1.2" opacity="0.45"/>`;
    }
    if (label) s += `<text x="${x + w / 2}" y="${y + h - 4}" text-anchor="middle" font-family="${FONT}" font-size="9" font-weight="bold" fill="${acc}" ${GLOW}>${esc(label)}</text>`;
    return s;
  },

  switch(x, y, w, h, acc, label, u) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + 5 + bandW(h) + 12;
    const n = 14, pw = 14, gap = 5;
    // one row of ports (+ LEDs) per U, like the patch panel
    for (let r = 0; r < u; r++) {
      const cy = y + r * U + U / 2;
      for (let i = 0; i < n; i++) {
        const px = c0 + i * (pw + gap);
        s += `<rect x="${px}" y="${cy - 6}" width="${pw}" height="12" fill="${PANEL_DARK}" stroke="${acc}" stroke-width="1.4"/>`;
      }
      s += `<circle cx="${c0 + 278}" cy="${cy}" r="3.5" fill="${PINK}" ${GLOW}/>`;
      s += `<circle cx="${c0 + 292}" cy="${cy}" r="3.5" fill="${CYAN}" ${GLOW}/>`;
    }
    return s + rightLabel(x, y, w, h, label, acc);
  },

  appliance(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + 5 + bandW(h) + 12;
    const sh = Math.max(16, h - 14);
    const sy = y + (h - sh) / 2;
    s += `<rect x="${c0 + 2}" y="${sy}" width="150" height="${sh}" rx="3" fill="#050510" stroke="${acc}" stroke-width="2" ${GLOW}/>`;
    for (let ly = sy + 4; ly < sy + sh - 3; ly += 4) {
      s += `<line x1="${c0 + 6}" y1="${ly}" x2="${c0 + 148}" y2="${ly}" stroke="${acc}" stroke-width="0.8" opacity="0.25"/>`;
    }
    s += `<circle cx="${c0 + 168}" cy="${y + h / 2}" r="3.5" fill="${acc}" ${GLOW}/>`;
    return s + rightLabel(x, y, w, h, label, acc);
  },

  server(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + 5 + bandW(h) + 12;
    const bh = Math.max(16, h - 14);
    const by = y + (h - bh) / 2;
    for (let i = 0; i < 4; i++) {
      const bx = c0 + i * 74;
      s += `<rect x="${bx}" y="${by}" width="66" height="${bh}" rx="2" fill="${PANEL_DARK}" stroke="#5a5480" stroke-width="1.6"/>`;
      s += `<line x1="${bx + 7}" y1="${by + bh / 2}" x2="${bx + 44}" y2="${by + bh / 2}" stroke="#5a5480" stroke-width="1.6"/>`;
      s += `<circle cx="${bx + 56}" cy="${by + bh / 2}" r="2.4" fill="${acc}" ${GLOW}/>`;
    }
    return s + rightLabel(x, y, w, h, label, acc);
  },

  storage(x, y, w, h, acc, label, u) {
    let s = plate(x, y, w, h, acc);
    // grid of 2.5" drives: 4 columns wide, 2 rows per U, alternating neon LEDs
    const c0 = x + 5 + bandW(h) + 12;
    const cols = 4, dw = 68, colGap = 6, dh = 12, rowStep = 15;
    for (let r = 0; r < u * 2; r++) {
      const dy = y + 4 + r * rowStep + (r >> 1) * (U - 2 * rowStep);
      for (let c = 0; c < cols; c++) {
        const dx = c0 + c * (dw + colGap);
        s += `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="1.5" fill="${PANEL_DARK}" stroke="#5a5480" stroke-width="1.3"/>`;
        s += `<circle cx="${dx + dw - 8}" cy="${dy + dh / 2}" r="1.8" fill="${(r + c) % 2 ? acc : PINK}" ${GLOW}/>`;
      }
    }
    return s + rightLabel(x, y, w, h, label, acc);
  },

  power(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + 5 + bandW(h) + 12;
    const mh = Math.max(16, h - 12);
    const my = y + (h - mh) / 2;
    for (let i = 0; i < 3; i++) {
      const mx = c0 + i * 98;
      s += `<rect x="${mx}" y="${my}" width="88" height="${mh}" rx="2" fill="${PANEL_DARK}" stroke="#5a5480" stroke-width="1.6"/>`;
      for (let v = 0; v < 4; v++) {
        s += `<line x1="${mx + 8 + v * 11}" y1="${my + 4}" x2="${mx + 8 + v * 11}" y2="${my + mh - 4}" stroke="#3a3560" stroke-width="1.4"/>`;
      }
      s += `<circle cx="${mx + 72}" cy="${my + mh / 2}" r="${Math.min(5, mh / 2 - 3)}" fill="none" stroke="${acc}" stroke-width="2" ${GLOW}/>`;
      s += `<line x1="${mx + 72}" y1="${my + mh / 2 - 3}" x2="${mx + 72}" y2="${my + mh / 2 + 1}" stroke="${acc}" stroke-width="1.6" ${GLOW}/>`;
    }
    return s + rightLabel(x, y, w, h, label, acc);
  },

  shelf(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + 5 + bandW(h) + 12;
    s += `<line x1="${c0}" y1="${y + h - 9}" x2="${x + w - 16}" y2="${y + h - 9}" stroke="${acc}" stroke-width="2.5" stroke-linecap="round" ${GLOW}/>`;
    return s + centerLabel(x, y - 2, w, h, label, acc);
  },

  generic(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const bw = bandW(h);
    s += `<rect x="${x + bw + 12}" y="${y + 5}" width="${w - bw - 22}" height="${h - 10}" rx="4" fill="${acc}" fill-opacity="0.08" stroke="${acc}" stroke-width="1.6" ${GLOW}/>`;
    return s + centerLabel(x, y, w, h, label, acc);
  },
};

function retroGrid(H) {
  const horizonY = H - 60;
  let s = `<g stroke="${PINK}" stroke-width="1" opacity="0.3">`;
  for (const dy of [8, 18, 31, 47]) {
    s += `<line x1="0" y1="${horizonY + dy}" x2="${W}" y2="${horizonY + dy}"/>`;
  }
  for (let k = -7; k <= 7; k++) {
    s += `<line x1="${W / 2 + k * 30}" y1="${horizonY + 6}" x2="${W / 2 + k * 90}" y2="${H}"/>`;
  }
  return s + '</g>';
}

function stars(H) {
  const pts = [[0.08, 0.06], [0.2, 0.1], [0.55, 0.045], [0.8, 0.09], [0.93, 0.05], [0.68, 0.02], [0.35, 0.03]];
  return pts.map(([fx, fy]) => `<circle cx="${(fx * W).toFixed(0)}" cy="${(fy * H).toFixed(0)}" r="1.3" fill="#ffffff" opacity="0.8"/>`).join('');
}

function render(items, options = {}) {
  const rackSize = clampRackSize(options.rackSize);
  const title = String(options.title || 'Rack Diagram').slice(0, 128);
  const innerH = rackSize * U;
  const H = TOP_PAD + innerH + BOT_PAD;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">`;
  s += `<defs>
<linearGradient id="e8Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c0b33"/><stop offset="1" stop-color="#08040f"/></linearGradient>
<filter id="e8glow" x="-60%" y="-60%" width="220%" height="220%">
<feGaussianBlur stdDeviation="2.2" result="b"/>
<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
</defs>`;

  // background: night gradient, stars, retro grid
  s += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#e8Bg)"/>`;
  s += stars(H);
  s += retroGrid(H);

  // neon sign title
  const pw = 350, ph = 54, px = (W - pw) / 2, py = 20;
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="12" fill="${PANEL}" stroke="${PINK}" stroke-width="2.5" ${GLOW}/>`;
  s += `<text x="${W / 2}" y="${py + 24}" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="bold" font-style="italic" fill="#ffd9ec" ${GLOW}>${esc(title)}</text>`;
  s += `<text x="${W / 2}" y="${py + 43}" text-anchor="middle" font-family="${FONT}" font-size="10" letter-spacing="4" fill="${CYAN}" ${GLOW}>${rackSize} UNITS</text>`;

  // frame: dark chassis with inner neon rail
  s += `<rect x="${SIDE_PAD - 10}" y="${TOP_PAD - 14}" width="${EAR_W * 2 + INNER_W + 20}" height="${innerH + 28}" rx="14" fill="#171528" stroke="#3b3560" stroke-width="2.5"/>`;
  s += `<rect x="${SIDE_PAD - 5}" y="${TOP_PAD - 9}" width="${EAR_W * 2 + INNER_W + 10}" height="${innerH + 18}" rx="10" fill="none" stroke="${PINK}" stroke-width="1.8" ${GLOW}/>`;
  s += `<rect x="${X0}" y="${TOP_PAD}" width="${INNER_W}" height="${innerH}" fill="${PANEL_DARK}" stroke="#3b3560" stroke-width="2"/>`;
  s += `<rect x="${SIDE_PAD}" y="${TOP_PAD}" width="${EAR_W}" height="${innerH}" fill="#1a1830" stroke="#3b3560" stroke-width="1.8"/>`;
  s += `<rect x="${X0 + INNER_W}" y="${TOP_PAD}" width="${EAR_W}" height="${innerH}" fill="#1a1830" stroke="#3b3560" stroke-width="1.8"/>`;
  for (let r = 0; r < rackSize; r++) {
    const cy = TOP_PAD + r * U + U / 2;
    const dot = r % 2 === 0 ? PINK : CYAN;
    s += `<circle cx="${SIDE_PAD + EAR_W / 2}" cy="${cy}" r="2.2" fill="${dot}" ${GLOW}/>`;
    s += `<circle cx="${X0 + INNER_W + EAR_W / 2}" cy="${cy}" r="2.2" fill="${dot}" ${GLOW}/>`;
    s += `<text x="${SIDE_PAD - 16}" y="${cy + 3.5}" text-anchor="end" font-family="${FONT}" font-size="10" fill="#7d76b3">${rackSize - r}</text>`;
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
  id: 'eighties',
  label: "'80s Neon",
  defaultPalette: 'eighties',
  colors: COLORS,
  render,
};
