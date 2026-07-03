// editor.js — visual WYSIWYG rack editor
import { parse, prettyPrint } from './parser.js';
import { DEVICE_TYPES, PALETTES, DEFAULT_PALETTE_NAME, getPalette } from './palette.js';
import { render, STYLES, getStyle, DEFAULT_STYLE_NAME } from './renderer.js';

const $ = (sel) => document.querySelector(sel);

const els = {
  size: $('#rackSize'),
  title: $('#rackTitle'),
  style: $('#styleSel'),
  palette: $('#paletteSel'),
  paletteWrap: $('#paletteWrap'),
  list: $('#itemList'),
  addBtn: $('#addItemBtn'),
  itemsOut: $('#itemsOut'),
  urlOut: $('#urlOut'),
  preview: $('#preview'),
  download: $('#downloadBtn'),
  warn: $('#overflowWarn'),
};

const state = {
  size: 42,
  title: 'Rack Diagram',
  styleId: DEFAULT_STYLE_NAME,
  paletteName: DEFAULT_PALETTE_NAME,
  items: [],
};

let lastSvg = '';
let dragIdx = null;
let debounceTimer = null;

// ---------- helpers ----------

function clampInt(v, min, max, dflt) {
  const n = Number(v);
  if (!Number.isInteger(n)) return dflt;
  return Math.min(max, Math.max(min, n));
}

function totalU() {
  return state.items.reduce((a, i) => a + i.u_height, 0);
}

function blankItem() {
  return { label: '', u_height: 1, kind: 'blank' };
}

/** Remove unlabeled 1U blanks from the bottom until items fit the rack. */
function removeBlanksToFit() {
  let removed = 0;
  while (totalU() > state.size) {
    let idx = -1;
    for (let i = state.items.length - 1; i >= 0; i--) {
      const it = state.items[i];
      if (it.kind === 'blank' && it.u_height === 1 && !it.label) { idx = i; break; }
    }
    if (idx === -1) break;
    state.items.splice(idx, 1);
    removed++;
  }
  return removed;
}

/**
 * Keep editor rows covering the full rack exactly: trim overflow blanks from
 * the bottom, then pad with blanks while short. Ensures every U (including U1)
 * always has an editable row, matching the preview's auto-padding.
 * Returns the number of structural changes (rows added or removed).
 */
function normalizeToRack() {
  let changes = removeBlanksToFit();
  while (totalU() < state.size) {
    state.items.push(blankItem());
    changes++;
  }
  return changes;
}

function activeStyle() {
  return getStyle(state.styleId);
}

/** Color choices for the current palette: [{hex(no #), name}], deduped. */
function colorChoices() {
  const map = getPalette(state.paletteName);
  const seen = new Set();
  const out = [];
  for (const { hex, name } of Object.values(map)) {
    const bare = hex.replace('#', '').toLowerCase();
    if (seen.has(bare)) continue;
    seen.add(bare);
    out.push({ hex: bare, name });
  }
  return out;
}

// ---------- row DOM ----------

function buildRow(item, idx) {
  const row = document.createElement('div');
  row.className = 'item-row';
  row.dataset.idx = String(idx);
  // scale row height to match the device's U height (see editor.css)
  row.style.setProperty('--u', String(item.u_height));

  const uLabel = document.createElement('span');
  uLabel.className = 'u-label';
  row.appendChild(uLabel);

  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'drag-handle';
  handle.title = 'Drag to reorder';
  handle.textContent = '☰';
  row.appendChild(handle);

  const label = document.createElement('input');
  label.type = 'text';
  label.className = 'label-input';
  label.maxLength = 64;
  label.placeholder = '(no label)';
  label.value = item.label;
  label.addEventListener('input', () => { item.label = label.value; scheduleUpdate(); });
  row.appendChild(label);

  const kind = document.createElement('select');
  kind.className = 'kind-select';
  for (const t of DEVICE_TYPES) {
    const o = document.createElement('option');
    o.value = t.kind;
    o.textContent = t.label;
    kind.appendChild(o);
  }
  kind.value = DEVICE_TYPES.some((t) => t.kind === item.kind) ? item.kind : 'generic';
  kind.addEventListener('change', () => { item.kind = kind.value; scheduleUpdate(); });
  row.appendChild(kind);

  const color = document.createElement('select');
  color.className = 'color-select';
  fillColorSelect(color, item);
  color.addEventListener('change', () => {
    if (color.value) item.color = color.value;
    else delete item.color;
    scheduleUpdate();
  });
  row.appendChild(color);

  const u = document.createElement('input');
  u.type = 'number';
  u.className = 'u-input';
  u.min = '1';
  u.max = String(state.size);
  u.value = String(item.u_height);
  u.title = 'Height in rack units';
  u.addEventListener('change', () => {
    item.u_height = clampInt(u.value, 1, state.size, item.u_height);
    u.value = String(item.u_height);
    row.style.setProperty('--u', String(item.u_height));
    if (normalizeToRack() > 0) renderList();
    else refreshULabels();
    scheduleUpdate();
  });
  row.appendChild(u);

  const dup = document.createElement('button');
  dup.type = 'button';
  dup.className = 'row-btn';
  dup.title = 'Duplicate';
  dup.textContent = '⧉';
  dup.addEventListener('click', () => {
    const copy = { ...item };
    state.items.splice(idx + 1, 0, copy);
    normalizeToRack();
    renderList();
    scheduleUpdate();
  });
  row.appendChild(dup);

  const rm = document.createElement('button');
  rm.type = 'button';
  rm.className = 'row-btn remove';
  rm.title = 'Remove';
  rm.textContent = '✕';
  rm.addEventListener('click', () => {
    state.items.splice(idx, 1);
    normalizeToRack();
    renderList();
    scheduleUpdate();
  });
  row.appendChild(rm);

  // drag & drop (handle-initiated)
  handle.addEventListener('mousedown', () => { row.draggable = true; });
  row.addEventListener('dragstart', (e) => {
    dragIdx = idx;
    row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  });
  row.addEventListener('dragend', () => {
    row.draggable = false;
    row.classList.remove('dragging');
    dragIdx = null;
    scheduleUpdate();
  });
  row.addEventListener('dragover', (e) => {
    if (dragIdx === null || dragIdx === idx) return;
    e.preventDefault();
    row.classList.add('drag-over');
  });
  row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
  row.addEventListener('drop', (e) => {
    e.preventDefault();
    row.classList.remove('drag-over');
    if (dragIdx === null || dragIdx === idx) return;
    const [moved] = state.items.splice(dragIdx, 1);
    state.items.splice(idx, 0, moved);
    dragIdx = null;
    renderList();
    scheduleUpdate();
  });

  return row;
}

function fillColorSelect(sel, item) {
  sel.innerHTML = '';
  const dflt = document.createElement('option');
  dflt.value = '';
  dflt.textContent = 'Default';
  sel.appendChild(dflt);
  const choices = colorChoices();
  for (const c of choices) {
    const o = document.createElement('option');
    o.value = c.hex;
    o.textContent = c.name;
    sel.appendChild(o);
  }
  if (item.color && !choices.some((c) => c.hex === item.color)) {
    const o = document.createElement('option');
    o.value = item.color;
    o.textContent = `Custom (#${item.color})`;
    sel.appendChild(o);
  }
  sel.value = item.color || '';
}

function renderList() {
  els.list.innerHTML = '';
  state.items.forEach((item, idx) => els.list.appendChild(buildRow(item, idx)));
  refreshULabels();
}

function refreshULabels() {
  let cum = 0;
  const rows = els.list.children;
  state.items.forEach((item, idx) => {
    const row = rows[idx];
    if (row) {
      const top = state.size - cum;
      const bottom = top - item.u_height + 1;
      row.querySelector('.u-label').textContent =
        item.u_height > 1 ? `U${top}–${bottom}` : `U${top}`;
    }
    cum += item.u_height;
  });
}

function refreshColorSelects() {
  const rows = els.list.children;
  state.items.forEach((item, idx) => {
    const sel = rows[idx] && rows[idx].querySelector('.color-select');
    if (sel) fillColorSelect(sel, item);
  });
}

// ---------- outputs & preview ----------

function scheduleUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(update, 300);
}

function buildShareURL(itemsString) {
  const url = new URL('render.html', location.href);
  const p = url.searchParams;
  p.set('items', itemsString);
  p.set('size', String(state.size));
  p.set('title', state.title);
  if (state.styleId !== DEFAULT_STYLE_NAME) p.set('style', state.styleId);
  // include palette only when it differs from the style's matching default
  if (state.paletteName !== activeStyle().defaultPalette) {
    p.set('palette', state.paletteName);
  }
  return url.toString();
}

function update() {
  refreshULabels();
  const itemsString = prettyPrint(state.items);
  els.itemsOut.value = itemsString;
  els.urlOut.value = buildShareURL(itemsString);

  const total = totalU();
  if (total > state.size) {
    els.warn.textContent = `Items total ${total}U, which exceeds the rack size of ${state.size}U. Remove or shrink devices.`;
    els.warn.hidden = false;
    els.preview.innerHTML = `<div class="preview-error">Cannot render: items exceed rack size (${total}U &gt; ${state.size}U).</div>`;
    lastSvg = '';
    return;
  }
  els.warn.hidden = true;

  const items = state.items.slice();
  for (let i = total; i < state.size; i++) items.push(blankItem());

  const out = render(items, {
    rackSize: state.size,
    title: state.title,
    style: state.styleId,
    palette: getPalette(state.paletteName),
  });
  lastSvg = out.svg;
  els.preview.innerHTML = out.svg;
}

// ---------- top controls ----------

function initControls() {
  for (const s of STYLES) {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = s.label;
    els.style.appendChild(o);
  }
  for (const [name, p] of Object.entries(PALETTES)) {
    const o = document.createElement('option');
    o.value = name;
    o.textContent = p.label;
    els.palette.appendChild(o);
  }

  els.style.value = state.styleId;
  els.palette.value = state.paletteName;
  els.size.value = String(state.size);
  els.title.value = state.title;

  els.style.addEventListener('change', () => {
    state.styleId = els.style.value;
    // switch the palette to the new style's matching default
    state.paletteName = activeStyle().defaultPalette;
    els.palette.value = state.paletteName;
    refreshColorSelects();
    scheduleUpdate();
  });

  els.palette.addEventListener('change', () => {
    state.paletteName = els.palette.value;
    refreshColorSelects();
    scheduleUpdate();
  });

  els.size.addEventListener('change', () => {
    state.size = clampInt(els.size.value, 1, 60, state.size);
    els.size.value = String(state.size);
    normalizeToRack();
    renderList();
    scheduleUpdate();
  });

  els.title.addEventListener('input', () => {
    state.title = els.title.value;
    scheduleUpdate();
  });

  els.addBtn.addEventListener('click', () => {
    state.items.push({ label: '', u_height: 1, kind: 'generic' });
    normalizeToRack();
    renderList();
    scheduleUpdate();
  });

  els.download.addEventListener('click', () => {
    if (!lastSvg) return;
    const blob = new Blob([lastSvg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(state.title || 'rack').replace(/[^\w\- ]+/g, '').trim() || 'rack'}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  });

  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ta = document.getElementById(btn.dataset.copy);
      try {
        await navigator.clipboard.writeText(ta.value);
      } catch (e) {
        ta.select();
        document.execCommand('copy');
      }
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1200);
    });
  });
}

// ---------- init from URL ----------

function initFromURL() {
  const q = new URLSearchParams(location.search);
  state.size = clampInt(q.get('size'), 1, 60, 42);
  state.title = (q.get('title') || 'Rack Diagram').slice(0, 128);
  state.styleId = getStyle(q.get('style')).id;
  // palette defaults to the style's matching palette; explicit param wins
  state.paletteName = PALETTES[q.get('palette')]
    ? q.get('palette')
    : getStyle(state.styleId).defaultPalette;

  const itemsParam = q.get('items');
  if (itemsParam) {
    const parsed = parse(itemsParam);
    if (!parsed.error) state.items = parsed;
  }
  normalizeToRack();
}

initFromURL();
initControls();
renderList();
update();
