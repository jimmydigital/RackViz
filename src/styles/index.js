// styles/index.js — style registry.
// To add a style: create src/styles/<id>.js with a default export of
//   { id, label, defaultPalette, colors, render(items, options) }
// (see any existing style module for the pattern), add a matching named
// palette to palette.js, then import it here and append it to STYLES.
import futurama from './futurama.js';
import jetsons from './jetsons.js';
import steampunk from './steampunk.js';
import eighties from './eighties.js';

export const STYLES = [futurama, jetsons, steampunk, eighties];

export const DEFAULT_STYLE_NAME = 'futurama';

/** Look up a style by id; unknown/missing names fall back to the default. */
export function getStyle(name) {
  const id = String(name || '').toLowerCase();
  return STYLES.find((s) => s.id === id)
    || STYLES.find((s) => s.id === DEFAULT_STYLE_NAME);
}
