// renderer.js — thin dispatcher to the active style's render().
import { getStyle, DEFAULT_STYLE_NAME, STYLES } from './styles/index.js';

export { getStyle, DEFAULT_STYLE_NAME, STYLES };

/**
 * Render a rack diagram.
 * options: { rackSize, title, style, palette }
 * Returns { svg, width, height }.
 */
export function render(items, options = {}) {
  return getStyle(options.style).render(items, options);
}
