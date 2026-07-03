// styles/common.js — helpers shared by all style modules

/** Escape text for safe inclusion in SVG markup. */
export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const KNOWN = new Set([
  'blank', 'patch', 'brush', 'switch', 'appliance',
  'server', 'storage', 'power', 'shelf', 'generic',
]);

const ALIASES = {
  switch_grn: 'switch',
  switch_cyn: 'switch',
  router: 'switch',
  compute: 'server',
  gpu: 'server',
  jbod: 'storage',
  disk_shelf: 'storage',
  firewall: 'generic',
  load_balancer: 'generic',
  console: 'generic',
  pdu: 'generic',
  ups: 'generic',
  fiber_panel: 'generic',
  kvm: 'generic',
};

/** Map any kind string to one of the 9 normalized layout kinds. */
export function normalizeKind(kind) {
  const k = String(kind || '').toLowerCase();
  if (KNOWN.has(k)) return k;
  return ALIASES[k] || 'generic';
}

/**
 * Accent color for an item: per-item hex override wins,
 * else the style/palette color for the normalized kind, else fallback.
 */
export function accentFor(item, colors, fallback = '#d9cdb0') {
  if (item.color) return '#' + item.color;
  const k = normalizeKind(item.kind);
  return (colors[k] && colors[k].hex) || fallback;
}

/** Clamp rack size into the supported range. */
export function clampRackSize(n, dflt = 42) {
  const v = Number(n);
  if (!Number.isInteger(v)) return dflt;
  return Math.min(60, Math.max(1, v));
}
