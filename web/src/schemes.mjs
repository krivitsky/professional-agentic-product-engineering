// The site's color schemes — one source for everything color.
//
// Each scheme is the hex values below. The build derives OKLCH from them and
// emits: the scheme CSS (chroma scaled live by --intensity), the fallback hex
// for browsers without OKLCH, the switcher's chips, and a WCAG contrast check
// that fails the build if any text pair drops below AA anywhere on the slider.
//
// Color schemes scale chroma: oklch(L  C × intensity  H), L fixed, so text
// keeps its lightness. Chroma is capped per token at the sRGB gamut edge, so
// the browser never gamut-maps and the checker's maths is what renders.
// Graphite and Paper have no hue: their slider moves line and grid strength.

export const INTENSITY = { min: 0.3, max: 1.3, def: 1 };
const ACCENT_FLOOR = 0.6;    // the accent keeps ≥60% of its chroma at the low end
const AA = 4.5;

export const SCHEMES = [
  { id: 'signal', name: 'Signal', grid: ['line', 0.06], panel: 0.07,
    t: { bg: '#111214', line: '#F2F0EA', line2: '#4A4B50', heading: '#FFFFFF', body: '#D6D4CE',
         muted: '#9C9A93', accent: '#FF5A1F', accentInk: '#111214', codeBg: '#1C1D21' } },
  { id: 'cyanotype', name: 'Cyanotype', grid: ['line', 0.08], panel: 0.08,
    t: { bg: '#0B3A8C', line: '#E6F0FF', line2: '#9DBBF0', heading: '#FFFFFF', body: '#DCE7FB',
         muted: '#A9C1EE', accent: '#FFD23F', accentInk: '#0B3A8C', codeBg: '#072C6E' } },
  { id: 'acid', name: 'Acid', grid: ['line', 0.07], panel: 0.08,
    t: { bg: '#0E2A1F', line: '#E8F5EC', line2: '#5E8A73', heading: '#FFFFFF', body: '#D3E6DA',
         muted: '#93BBA3', accent: '#C6FF3D', accentInk: '#0E2A1F', codeBg: '#091F17' } },
  { id: 'klein', name: 'Klein', light: true, grid: ['line', 0.07], panel: 0.05,
    t: { bg: '#F4F1EA', line: '#14161A', line2: '#B9B4A8', heading: '#0B0D10', body: '#2A2D33',
         muted: '#5C5E65', accent: '#1F3BFF', accentInk: '#FFFFFF', codeBg: '#EAE6DC' } },
  { id: 'ultraviolet', name: 'Ultraviolet', grid: ['line', 0.08], panel: 0.08,
    t: { bg: '#1A0B2E', line: '#F3E9FF', line2: '#7E5CA8', heading: '#FFFFFF', body: '#E2D6F2',
         muted: '#B39ED0', accent: '#FF3D9A', accentInk: '#1A0B2E', codeBg: '#12061F' } },
  { id: 'graphite', name: 'Graphite', mono: true, grid: ['line2', 0.5], panel: 0.06,
    t: { bg: '#1C1C1E', line: '#E5E5E7', line2: '#48484C', heading: '#FFFFFF', body: '#D1D1D6',
         muted: '#8E8E93', accent: '#FFFFFF', accentInk: '#1C1C1E', codeBg: '#141416' } },
  { id: 'paper', name: 'Paper', mono: true, light: true, grid: ['line', 0.059], panel: 0.035,
    t: { bg: '#FAFAF7', line: '#1A1A1A', line2: '#C8C8C4', heading: '#0A0A0A', body: '#2B2B2B',
         muted: '#6B6B6B', accent: '#0A0A0A', accentInk: '#FAFAF7', codeBg: '#F0F0EB' } },
];
export const DEFAULT_SCHEME = SCHEMES[0].id;

const CSS_NAME = { accentInk: 'accent-ink', codeBg: 'code-bg' };
const cssName = (k) => `--${CSS_NAME[k] || k}`;

// ---------------------------------------------------------------- color maths
const dec = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const enc = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToLin(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => dec(v / 255));
}
function linToOklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
          1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
          0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function oklabToLin([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
          -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
          -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const lchToLab = ([L, C, H]) => [L, C * Math.cos((H * Math.PI) / 180), C * Math.sin((H * Math.PI) / 180)];
export function hexToOklch(hex) {
  const [L, a, b] = linToOklab(hexToLin(hex));
  const C = Math.hypot(a, b);
  const H = C < 1e-4 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return [L, C, H];
}
const inGamut = (lin) => lin.every((v) => v >= -1e-6 && v <= 1 + 1e-6);
function maxChroma(L, H) {
  let lo = 0, hi = 0.5;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklabToLin(lchToLab([L, mid, H])))) lo = mid; else hi = mid;
  }
  return lo * 0.995;
}
const luminance = (lin) => 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
const clampLin = (lin) => lin.map((v) => Math.min(1, Math.max(0, v)));
export function contrast(a, b) {
  const [x, y] = [luminance(clampLin(oklabToLin(a))), luminance(clampLin(oklabToLin(b)))];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function oklabToHex(lab) {
  return '#' + clampLin(oklabToLin(lab)).map((v) => Math.round(enc(v) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}
const mix = (p, q, t) => p.map((v, i) => v * (1 - t) + q[i] * t);   // = color-mix(in oklab, p (1-t), q t)

// ----------------------------------------------------- token model per scheme
// Returns { token: (intensity) => oklab } and the CSS that renders the same.
const f4 = (n) => +n.toFixed(4);
const f2 = (n) => +n.toFixed(2);
function model(s) {
  const base = Object.fromEntries(Object.entries(s.t).map(([k, hex]) => [k, hexToOklch(hex)]));
  const at = {}, css = {};
  const Lbg = base.bg[0];
  for (const [k, [L, C, H]] of Object.entries(base)) {
    if (s.mono && (k === 'line' || k === 'line2')) {
      // no hue to scale: intensity pushes the line away from (or toward) the paper
      const span = (L - Lbg) * (k === 'line' ? 1 : 1);
      const fac = k === 'line' ? (i) => 0.75 + 0.25 * i : (i) => i;
      at[k] = (i) => lchToLab([Math.min(1, Math.max(0, Lbg + span * fac(i))), C, H]);
      const facCss = k === 'line' ? '(0.75 + 0.25 * var(--intensity))' : 'var(--intensity)';
      css[k] = `oklch(clamp(0, calc(${f4(Lbg)} + ${f4(span)} * ${facCss}), 1) ${f4(C)} ${f2(H)})`;
    } else if (s.mono || C < 0.002) {
      at[k] = () => lchToLab([L, C, H]);
      css[k] = `oklch(${f4(L)} ${f4(C)} ${f2(H)})`;
    } else {
      const cap = maxChroma(L, H);
      const accent = k === 'accent';
      const g = accent ? (i) => Math.max(ACCENT_FLOOR, i) : (i) => i;
      at[k] = (i) => lchToLab([L, Math.min(cap, C * g(i)), H]);
      const gCss = accent ? `max(${ACCENT_FLOOR}, var(--intensity))` : 'var(--intensity)';
      css[k] = `oklch(${f4(L)} min(${f4(cap)}, calc(${f4(C)} * ${gCss})) ${f2(H)})`;
    }
  }
  // grid: a line color at low alpha (mono schemes also scale the alpha)
  const [gTok, gAlpha] = s.grid;
  const [gL, gC, gH] = base[gTok];
  const gScaled = !s.mono && gC >= 0.002;
  const gChroma = gScaled ? `min(${f4(maxChroma(gL, gH))}, calc(${f4(gC)} * var(--intensity)))` : `${f4(gC)}`;
  const gA = s.mono ? `calc(${gAlpha} * var(--intensity))` : `${gAlpha}`;
  css.grid = `oklch(${f4(gL)} ${gChroma} ${f2(gH)} / ${gA})`;
  // derived surfaces: CSS mixes in oklab, and so does the checker
  at.panel = (i) => mix(at.bg(i), at.line(i), s.panel);
  at.synString = (i) => mix(at.accent(i), at.heading(i), 0.55);
  return { base, at, css };
}

// --------------------------------------------------------------------- CSS out
export function schemeCSS() {
  let out = '/* Color schemes — generated by web/src/schemes.mjs. Edit the hex there, not here. */\n';
  out += `:root { --intensity: ${INTENSITY.def}; }\n`;
  for (const s of SCHEMES) {
    const { css } = model(s);
    const sel = s.id === DEFAULT_SCHEME ? `:root, [data-scheme="${s.id}"]` : `[data-scheme="${s.id}"]`;
    out += `${sel} {\n  color-scheme: ${s.light ? 'light' : 'dark'};\n`;
    for (const k of Object.keys(s.t)) out += `  ${cssName(k)}: ${css[k]};\n`;
    out += `  --grid: ${css.grid};\n`;
    out += `  --panel: color-mix(in oklab, var(--bg) ${Math.round((1 - s.panel) * 1000) / 10}%, var(--line));\n`;
    out += `  --syn-string: color-mix(in oklab, var(--accent) 45%, var(--heading));\n`;
    out += `  --frame-bg: color-mix(in oklab, var(--bg) 55%, transparent);\n`;
    out += `  --accent-soft: color-mix(in oklab, var(--accent) 18%, transparent);\n`;
    out += '}\n';
  }
  // Fallback: the exact default hex. The guard tests the forms emitted above
  // (min/max/clamp/calc inside oklch, color-mix), not just oklch() itself —
  // a browser that parses oklch() but not the maths would otherwise drop
  // every token at computed-value time and render a transparent page.
  out += '@supports not ((color: oklch(0 0 0)) and (color: oklch(0.5 min(0.1, calc(0.1 * max(0.6, 1))) 200)) and (color: oklch(clamp(0, calc(0.5 + 0.1 * 1), 1) 0 0 / calc(0.1 * 1))) and (color: color-mix(in oklab, red 50%, blue))) {\n';
  for (const s of SCHEMES) {
    const { at } = model(s);
    const sel = s.id === DEFAULT_SCHEME ? `:root, [data-scheme="${s.id}"]` : `[data-scheme="${s.id}"]`;
    const [gTok, gAlpha] = s.grid;
    const g = s.t[gTok];
    const n = parseInt(g.slice(1), 16);
    out += `  ${sel} {`;
    for (const [k, hex] of Object.entries(s.t)) out += ` ${cssName(k)}: ${hex};`;
    out += ` --grid: rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${gAlpha});`;
    const rgba = (hex, a) => { const v = parseInt(hex.slice(1), 16); return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${a})`; };
    out += ` --panel: ${oklabToHex(at.panel(1))}; --syn-string: ${oklabToHex(at.synString(1))};`;
    out += ` --frame-bg: ${rgba(s.t.bg, 0.55)}; --accent-soft: ${rgba(s.t.accent, 0.18)}; }\n`;
  }
  out += '  .scheme-intensity { display: none; }\n}\n';
  return out;
}

// Chips for the switcher, drawn from each scheme's fixed default hex.
export const schemeChips = () => SCHEMES.map((s) => ({ id: s.id, name: s.name, bg: s.t.bg, line: s.t.line, accent: s.t.accent }));

// ------------------------------------------------------------ contrast gate
// Every text pair the site uses, at both ends of the slider and the default.
const PAIRS = [
  ['body', 'bg'], ['heading', 'bg'], ['muted', 'bg'], ['line', 'bg', 'links'], ['accent', 'bg'],
  ['accentInk', 'accent', 'button text'], ['body', 'panel', 'quote text'],
  ['heading', 'codeBg', 'code'], ['body', 'codeBg', 'code attr'], ['muted', 'codeBg', 'comment'], ['accent', 'codeBg', 'keyword'],
  ['synString', 'codeBg', 'string'],
];
export function contrastReport() {
  const rows = [], fails = [];
  for (const s of SCHEMES) {
    const { at } = model(s);
    for (const [fg, bg, label] of PAIRS) {
      const r = [INTENSITY.min, INTENSITY.def, INTENSITY.max].map((i) => contrast(at[fg](i), at[bg](i)));
      rows.push({ scheme: s.id, pair: label || `${fg}/${bg}`, low: r[0], def: r[1], high: r[2] });
      if (Math.min(...r) < AA) fails.push(`${s.name}: ${label || fg + ' on ' + bg} ${Math.min(...r).toFixed(2)}:1`);
    }
    // line2 is for rules and borders only — reported, never gated
    const l2 = [INTENSITY.min, INTENSITY.max].map((i) => contrast(at.line2(i), at.bg(i)));
    rows.push({ scheme: s.id, pair: 'line2 (rules, info)', low: l2[0], def: contrast(at.line2(1), at.bg(1)), high: l2[1] });
  }
  return { rows, fails };
}
// Predicted sRGB for a token — used to prove the checker against real pixels.
export function predictHex(id, token, intensity) {
  return oklabToHex(model(SCHEMES.find((s) => s.id === id)).at[token](intensity));
}
