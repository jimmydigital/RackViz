// render-app.js — standalone render page: reads URL params, displays SVG.
import { parse } from './parser.js';
import { resolveColors, PALETTES } from './palette.js';
import { render, getStyle } from './renderer.js';

const errEl = document.getElementById('error');
const diagramEl = document.getElementById('diagram');

function fail(msg) {
  errEl.textContent = msg;
  errEl.hidden = false;
}

function clampInt(v, min, max, dflt) {
  const n = Number(v);
  if (!Number.isInteger(n)) return dflt;
  return Math.min(max, Math.max(min, n));
}

const q = new URLSearchParams(location.search);
const itemsParam = q.get('items');

if (!itemsParam) {
  fail('Missing required "items" parameter. See the landing page for usage.');
} else {
  const size = clampInt(q.get('size'), 1, 60, 42);
  const title = (q.get('title') || 'Rack Diagram').slice(0, 128);
  const style = getStyle(q.get('style'));

  const parsed = parse(itemsParam);
  if (parsed.error) {
    fail(parsed.message);
  } else {
    // palette defaults to the active style's matching palette
    const paletteName = PALETTES[q.get('palette')] ? q.get('palette') : style.defaultPalette;
    const resolved = resolveColors(q.get('colors') || '', paletteName);
    const palette = resolved.palette;
    if (resolved.errors.length) fail(resolved.errors.join(' '));

    const total = parsed.reduce((a, i) => a + i.u_height, 0);
    if (total > size) {
      fail(`Items total ${total}U, which exceeds the rack size of ${size}U.`);
    } else {
      const items = parsed.slice();
      for (let i = total; i < size; i++) items.push({ label: '', u_height: 1, kind: 'blank' });
      const out = render(items, { rackSize: size, title, style: style.id, palette });
      diagramEl.innerHTML = out.svg;
      document.title = `${title} — RackfaceViz`;
    }
  }
}
