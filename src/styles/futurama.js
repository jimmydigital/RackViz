// styles/futurama.js — default style: thick-ink retro cartoon (palette-aware)
import { esc, normalizeKind, accentFor, clampRackSize } from './common.js';
import { getPalette, DEFAULT_PALETTE_NAME, DEFAULT_COLOR } from '../palette.js';

const U = 34;           // px per rack unit
const INNER_W = 500;    // rack opening width
const EAR_W = 34;       // chrome post width
const TOP_PAD = 96;
const BOT_PAD = 56;
const SIDE_PAD = 40;
const INK = '#1b1b22';
const SW = 3.2;
const CREAM = '#efe6cf';
const FONT = "'Verdana','DejaVu Sans',sans-serif";

const W = SIDE_PAD * 2 + EAR_W * 2 + INNER_W; // 648
const X0 = SIDE_PAD + EAR_W;                  // opening left edge

function rivets(x, y, w, h) {
  const p = 8;
  return [[x + p, y + p], [x + w - p, y + p], [x + p, y + h - p], [x + w - p, y + h - p]]
    .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="2.6" fill="#a99c7c" stroke="${INK}" stroke-width="1.4"/>`)
    .join('');
}

/** Left color band is roughly square: width ≈ device height, capped at 64px. */
function bandW(h) {
  return Math.min(h, 64);
}

function plate(x, y, w, h, acc) {
  const bw = bandW(h);
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${CREAM}" stroke="${INK}" stroke-width="${SW}"/>` +
    `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>`;
  if (bw >= 26) {
    s += `<line x1="${x + 8}" y1="${y + h / 2 - 4}" x2="${x + bw - 8}" y2="${y + h / 2 - 4}" stroke="rgba(0,0,0,.28)" stroke-width="2"/>` +
      `<line x1="${x + 8}" y1="${y + h / 2 + 4}" x2="${x + bw - 8}" y2="${y + h / 2 + 4}" stroke="rgba(0,0,0,.28)" stroke-width="2"/>`;
  }
  return s;
}

function rightLabel(x, y, w, h, label, endX) {
  if (!label) return '';
  return `<text x="${endX}" y="${y + h / 2 + 5}" text-anchor="end" font-family="${FONT}" font-size="13" font-weight="bold" fill="${INK}">${esc(label)}</text>`;
}

const DEVICES = {
  blank(x, y, w, h, acc, label) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>` +
      `<line x1="${x + 18}" y1="${y + h / 2}" x2="${x + w - 18}" y2="${y + h / 2}" stroke="rgba(0,0,0,.22)" stroke-width="2.6"/>` +
      `<line x1="${x + 18}" y1="${y + h / 2 + 2.4}" x2="${x + w - 18}" y2="${y + h / 2 + 2.4}" stroke="rgba(255,255,255,.35)" stroke-width="1.6"/>` +
      rivets(x, y, w, h) +
      (label ? `<text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-family="${FONT}" font-size="14" fill="${INK}">${esc(label)}</text>` : '');
  },

  patch(x, y, w, h, acc, label, u) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>`;
    const n = 24, pw = 12, ph = 11;
    const gap = (w - n * pw) / (n + 1);
    for (let r = 0; r < u; r++) {
      const rowY = y + r * U;
      for (let i = 0; i < n; i++) {
        const px = x + gap + i * (pw + gap);
        s += `<circle cx="${px + pw / 2}" cy="${rowY + 8.5}" r="1.8" fill="#ffd24a" stroke="${INK}" stroke-width="0.9"/>`;
        s += `<rect x="${px}" y="${rowY + 13}" width="${pw}" height="${ph}" rx="1.5" fill="#14181c" stroke="${INK}" stroke-width="1.2"/>`;
      }
    }
    if (label) s += `<text x="${x + w / 2}" y="${y + h - 4}" text-anchor="middle" font-family="${FONT}" font-size="9" font-weight="bold" fill="rgba(0,0,0,.75)">${esc(label)}</text>`;
    return s;
  },

  brush(x, y, w, h, acc, label) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${acc}" stroke="${INK}" stroke-width="${SW}"/>`;
    for (let lx = x + 10; lx <= x + w - 10; lx += 5) {
      s += `<line x1="${lx}" y1="${y + 6}" x2="${lx}" y2="${y + h - 14}" stroke="#2a2a30" stroke-width="1.6" opacity="0.75"/>`;
    }
    if (label) s += `<text x="${x + w / 2}" y="${y + h - 4}" text-anchor="middle" font-family="${FONT}" font-size="9" font-weight="bold" fill="rgba(0,0,0,.75)">${esc(label)}</text>`;
    return s;
  },

  switch(x, y, w, h, acc, label, u) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + bandW(h) + 12;
    const n = 14, pw = 16, gap = 4;
    // one row of ports (+ LEDs) per U, like the patch panel
    for (let r = 0; r < u; r++) {
      const cy = y + r * U + U / 2;
      for (let i = 0; i < n; i++) {
        const px = c0 + i * (pw + gap);
        s += `<rect x="${px}" y="${cy - 6}" width="${pw}" height="12" rx="1.5" fill="#14181c" stroke="${INK}" stroke-width="1.4"/>`;
      }
      s += `<circle cx="${c0 + 288}" cy="${cy}" r="4" fill="#7cf06f" stroke="${INK}" stroke-width="1.6"/>`;
      s += `<circle cx="${c0 + 304}" cy="${cy}" r="4" fill="#ffd24a" stroke="${INK}" stroke-width="1.6"/>`;
    }
    return s + rightLabel(x, y, w, h, label, x + w - 12);
  },

  appliance(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + bandW(h) + 12;
    const sh = Math.max(16, h - 14);
    const sy = y + (h - sh) / 2;
    s += `<rect x="${c0 + 4}" y="${sy}" width="150" height="${sh}" rx="3" fill="#0e1418" stroke="${INK}" stroke-width="2.4"/>`;
    s += `<rect x="${c0 + 10}" y="${sy + 3}" width="60" height="${Math.max(3, sh * 0.28)}" rx="2" fill="rgba(255,255,255,.14)"/>`;
    s += `<circle cx="${c0 + 172}" cy="${y + h / 2}" r="4.5" fill="#7cf06f" stroke="${INK}" stroke-width="1.6"/>`;
    return s + rightLabel(x, y, w, h, label, x + w - 12);
  },

  server(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + bandW(h) + 12;
    const bh = Math.max(16, h - 14);
    const by = y + (h - bh) / 2;
    for (let i = 0; i < 4; i++) {
      const bx = c0 + i * 76;
      s += `<rect x="${bx}" y="${by}" width="68" height="${bh}" rx="2.5" fill="url(#fzBay)" stroke="${INK}" stroke-width="2"/>`;
      s += `<line x1="${bx + 8}" y1="${by + bh / 2}" x2="${bx + 44}" y2="${by + bh / 2}" stroke="rgba(0,0,0,.35)" stroke-width="2"/>`;
      s += `<circle cx="${bx + 58}" cy="${by + bh / 2}" r="2.4" fill="#6ff06f" stroke="${INK}" stroke-width="1.1"/>`;
    }
    return s + rightLabel(x, y, w, h, label, x + w - 12);
  },

  storage(x, y, w, h, acc, label, u) {
    let s = plate(x, y, w, h, acc);
    // grid of 2.5" drive sleds: 4 columns wide, 2 rows per U
    const c0 = x + bandW(h) + 12;
    const cols = 4, dw = 70, colGap = 6, dh = 12, rowStep = 15;
    for (let r = 0; r < u * 2; r++) {
      const dy = y + 4 + r * rowStep + (r >> 1) * (U - 2 * rowStep);
      for (let c = 0; c < cols; c++) {
        const dx = c0 + c * (dw + colGap);
        s += `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="1.5" fill="url(#fzBay)" stroke="${INK}" stroke-width="1.6"/>`;
        s += `<line x1="${dx + 6}" y1="${dy + dh / 2}" x2="${dx + 48}" y2="${dy + dh / 2}" stroke="rgba(0,0,0,.35)" stroke-width="1.6"/>`;
        s += `<circle cx="${dx + 60}" cy="${dy + dh / 2}" r="1.8" fill="${(r + c) % 3 ? '#6ff06f' : '#ffd24a'}" stroke="${INK}" stroke-width="0.9"/>`;
      }
    }
    return s + rightLabel(x, y, w, h, label, x + w - 12);
  },

  power(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const c0 = x + bandW(h) + 12;
    const mh = Math.max(16, h - 12);
    const my = y + (h - mh) / 2;
    for (let i = 0; i < 3; i++) {
      const mx = c0 + i * 102;
      s += `<rect x="${mx}" y="${my}" width="92" height="${mh}" rx="2.5" fill="#cfd6da" stroke="${INK}" stroke-width="2"/>`;
      for (let v = 0; v < 4; v++) {
        s += `<line x1="${mx + 8 + v * 12}" y1="${my + 4}" x2="${mx + 8 + v * 12}" y2="${my + mh - 4}" stroke="rgba(0,0,0,.3)" stroke-width="1.6"/>`;
      }
      s += `<circle cx="${mx + 80}" cy="${my + mh / 2}" r="3.2" fill="#ffd24a" stroke="${INK}" stroke-width="1.4"/>`;
    }
    return s + rightLabel(x, y, w, h, label, x + w - 12);
  },

  shelf(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const bw = bandW(h);
    const c0 = x + bw + 12;
    s += `<rect x="${c0}" y="${y + h - 13}" width="${w - bw - 28}" height="8" rx="3" fill="url(#fzBay)" stroke="${INK}" stroke-width="1.8"/>`;
    if (label) s += `<text x="${(c0 + x + w) / 2}" y="${y + h / 2 + 2}" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="bold" fill="${INK}">${esc(label)}</text>`;
    return s;
  },

  generic(x, y, w, h, acc, label) {
    let s = plate(x, y, w, h, acc);
    const bw = bandW(h);
    s += `<rect x="${x + bw + 4}" y="${y + 4}" width="${w - bw - 10}" height="${h - 8}" rx="2" fill="${acc}" opacity="0.28"/>`;
    if (label) s += `<text x="${(x + bw + x + w) / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="bold" fill="${INK}">${esc(label)}</text>`;
    return s;
  },
};

function render(items, options = {}) {
  const rackSize = clampRackSize(options.rackSize);
  const title = String(options.title || 'Rack Diagram').slice(0, 128);
  const palette = options.palette || getPalette(DEFAULT_PALETTE_NAME);
  const innerH = rackSize * U;
  const H = TOP_PAD + innerH + BOT_PAD;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">`;
  s += `<defs>
<linearGradient id="fzBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16313a"/><stop offset="1" stop-color="#0c1a20"/></linearGradient>
<linearGradient id="fzChrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8ecef"/><stop offset="0.5" stop-color="#aeb8bf"/><stop offset="1" stop-color="#dde3e7"/></linearGradient>
<linearGradient id="fzBay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f5f7"/><stop offset="0.55" stop-color="#b5bfc6"/><stop offset="1" stop-color="#e2e7ea"/></linearGradient>
</defs>`;

  // background
  s += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#fzBg)"/>`;

  // title plaque
  const pw = 360, ph = 54, px = (W - pw) / 2, py = 16;
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="14" fill="#2fb5a3" stroke="${INK}" stroke-width="${SW}"/>`;
  s += `<text x="${W / 2}" y="${py + 24}" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="bold" fill="#f4fbf9">${esc(title)}</text>`;
  s += `<text x="${W / 2}" y="${py + 43}" text-anchor="middle" font-family="${FONT}" font-size="10.5" letter-spacing="2.5" fill="#d6f2ec">${rackSize} UNITS</text>`;

  // frame
  s += `<rect x="${SIDE_PAD - 8}" y="${TOP_PAD - 14}" width="${EAR_W * 2 + INNER_W + 16}" height="${innerH + 28}" rx="12" fill="#d9cdb0" stroke="${INK}" stroke-width="${SW}"/>`;
  // opening
  s += `<rect x="${X0}" y="${TOP_PAD}" width="${INNER_W}" height="${innerH}" fill="#101c22" stroke="${INK}" stroke-width="${SW}"/>`;
  // chrome ears with bolts + U labels
  s += `<rect x="${SIDE_PAD}" y="${TOP_PAD}" width="${EAR_W}" height="${innerH}" fill="url(#fzChrome)" stroke="${INK}" stroke-width="2.4"/>`;
  s += `<rect x="${X0 + INNER_W}" y="${TOP_PAD}" width="${EAR_W}" height="${innerH}" fill="url(#fzChrome)" stroke="${INK}" stroke-width="2.4"/>`;
  for (let r = 0; r < rackSize; r++) {
    const cy = TOP_PAD + r * U + U / 2;
    s += `<circle cx="${SIDE_PAD + EAR_W / 2}" cy="${cy}" r="3" fill="#8f979e" stroke="${INK}" stroke-width="1.4"/>`;
    s += `<circle cx="${X0 + INNER_W + EAR_W / 2}" cy="${cy}" r="3" fill="#8f979e" stroke="${INK}" stroke-width="1.4"/>`;
    s += `<text x="${SIDE_PAD - 13}" y="${cy + 3.5}" text-anchor="end" font-family="${FONT}" font-size="10" fill="#7fa3ad">${rackSize - r}</text>`;
  }

  // devices, top-down
  let yCur = TOP_PAD;
  for (const item of items) {
    const h = item.u_height * U;
    const kind = normalizeKind(item.kind);
    const acc = accentFor(item, palette, DEFAULT_COLOR);
    const draw = DEVICES[kind] || DEVICES.generic;
    s += draw(X0, yCur, INNER_W, h, acc, item.label, item.u_height);
    yCur += h;
  }

  s += '</svg>';
  return { svg: s, width: W, height: H };
}

export default {
  id: 'futurama',
  label: 'Futurama',
  defaultPalette: 'futurama',
  colors: getPalette(DEFAULT_PALETTE_NAME),
  render,
};
