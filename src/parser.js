// parser.js — rack definition parser and pretty-printer

const MAX_LABEL = 64;
const MAX_U = 60;
const HEX_RE = /^[0-9a-fA-F]{6}$/;

/**
 * Parse a pipe-separated items string.
 * Format per item: label:u_height:kind[:color]
 * Returns array of {label, u_height, kind, color?} or {error, message, index}.
 */
export function parse(itemsString) {
  if (typeof itemsString !== 'string' || itemsString.trim() === '') {
    return { error: true, message: 'Items string is empty.', index: -1 };
  }
  const parts = itemsString.split('|');
  const items = [];
  for (let i = 0; i < parts.length; i++) {
    const fields = parts[i].split(':');
    if (fields.length < 3 || fields.length > 4) {
      return { error: true, message: `Item ${i + 1}: expected label:u_height:kind[:color], got "${parts[i]}".`, index: i };
    }
    let label;
    try {
      label = decodeURIComponent(fields[0]);
    } catch (e) {
      return { error: true, message: `Item ${i + 1}: label has invalid percent-encoding.`, index: i };
    }
    if (label.length > MAX_LABEL) {
      return { error: true, message: `Item ${i + 1}: label exceeds ${MAX_LABEL} characters.`, index: i };
    }
    const u = Number(fields[1]);
    if (!Number.isInteger(u) || u < 1 || u > MAX_U) {
      return { error: true, message: `Item ${i + 1}: u_height must be an integer 1–${MAX_U}.`, index: i };
    }
    const kind = fields[2].trim().toLowerCase();
    if (!kind) {
      return { error: true, message: `Item ${i + 1}: kind must be non-empty.`, index: i };
    }
    const item = { label, u_height: u, kind };
    if (fields.length === 4) {
      if (!HEX_RE.test(fields[3])) {
        return { error: true, message: `Item ${i + 1}: color must be a 6-char hex (no #).`, index: i };
      }
      item.color = fields[3].toLowerCase();
    }
    items.push(item);
  }
  return items;
}

function encodeLabel(label) {
  return String(label).replace(/[%|:&]/g,
    (ch) => '%' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
}

/**
 * Convert an item array back to a URL-safe items string.
 * Round-trip guarantee: parse(prettyPrint(items)) ≡ items.
 */
export function prettyPrint(items) {
  return items.map((it) => {
    let s = `${encodeLabel(it.label || '')}:${it.u_height}:${it.kind}`;
    if (it.color) s += `:${it.color}`;
    return s;
  }).join('|');
}
