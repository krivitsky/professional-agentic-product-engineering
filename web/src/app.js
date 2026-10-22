// Client behaviour: the menu (docked or drawer), the color-scheme switcher,
// copy buttons, syntax highlighting, mermaid, and the homepage self-audit.
// highlight.js and mermaid load on demand, so the menu and the switcher keep
// working even if a CDN is down.

const root = document.documentElement;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};

// --- menu -------------------------------------------------------------------
// Inner pages dock the menu on wide screens (remembered); home and narrow
// screens slide it in as a drawer that always starts closed.
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const navToggle = document.querySelector('[data-nav-toggle]');
const isHome = root.hasAttribute('data-home');
const wide = window.matchMedia('(min-width: 1024px)');
const docked = () => !isHome && wide.matches;

function setNav(open, remember) {
  root.dataset.nav = open ? 'open' : 'closed';
  navToggle?.setAttribute('aria-expanded', String(open));
  if (remember && docked()) store.set('pape.nav', open ? 'open' : 'closed');
  if (open && !docked()) (sidebar?.querySelector('a.active') || sidebar?.querySelector('a'))?.focus({ preventScroll: true });
}
setNav(root.dataset.nav === 'open', false);
navToggle?.addEventListener('click', () => setNav(root.dataset.nav !== 'open', true));
overlay?.addEventListener('click', () => setNav(false, false));
wide.addEventListener?.('change', () => setNav(docked() && store.get('pape.nav') !== 'closed', false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && root.dataset.nav === 'open' && !docked()) {
    setNav(false, false);
    navToggle?.focus();
  }
});
// keep the current page in view inside a long docked menu
sidebar?.querySelector('a.active')?.scrollIntoView({ block: 'nearest' });

// --- color scheme -------------------------------------------------------------
const schemeBtn = document.querySelector('.scheme-btn');
const panel = document.getElementById('scheme-panel');
const radios = panel ? [...panel.querySelectorAll('input[name="scheme"]')] : [];
const range = document.getElementById('intensity');
const out = document.getElementById('intensity-out');
const reset = panel?.querySelector('.scheme-reset');
const MIN = Number(range?.min || 0.3), MAX = Number(range?.max || 1.3), DEF = 1;

const current = () => root.dataset.scheme || radios[0]?.value;
const nameOf = (id) => radios.find((r) => r.value === id)?.parentElement.textContent.trim() || id;
function intensityFor(id) {
  const v = parseFloat(store.get('pape.intensity.' + id));
  return v >= MIN && v <= MAX ? v : DEF;
}
function setIntensity(v, remember) {
  root.style.setProperty('--intensity', String(v));
  if (range) range.value = String(v);
  if (out) out.value = Number(v).toFixed(2);
  if (remember) store.set('pape.intensity.' + current(), String(v));
}
function setScheme(id, remember) {
  root.dataset.scheme = id;
  radios.forEach((r) => { r.checked = r.value === id; });
  setIntensity(intensityFor(id), false);
  schemeBtn?.setAttribute('aria-label', `Color scheme: ${nameOf(id)}`);
  if (remember) store.set('pape.scheme', id);
}
function openPanel(open) {
  if (!panel) return;
  panel.hidden = !open;
  schemeBtn?.setAttribute('aria-expanded', String(open));
  if (open) (radios.find((r) => r.checked) || radios[0])?.focus();
}
setScheme(current(), false);
radios.forEach((r) => r.addEventListener('change', () => setScheme(r.value, true)));
range?.addEventListener('input', () => setIntensity(parseFloat(range.value), true));
reset?.addEventListener('click', () => setIntensity(DEF, true));
schemeBtn?.addEventListener('click', () => openPanel(panel.hidden));
panel?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.stopPropagation(); openPanel(false); schemeBtn?.focus(); }
});
document.addEventListener('click', (e) => {
  if (panel && !panel.hidden && !panel.contains(e.target) && !schemeBtn?.contains(e.target)) openPanel(false);
});

// --- copy buttons ----------------------------------------------------------
for (const box of document.querySelectorAll('.codebox')) {
  const btn = box.querySelector('.copy');
  const code = box.querySelector('code');
  if (!btn || !code) continue;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.innerText);
      btn.classList.add('copied');
      const label = btn.querySelector('span');
      const prev = label.textContent;
      label.textContent = 'Copied';
      setTimeout(() => { btn.classList.remove('copied'); label.textContent = prev; }, 1400);
    } catch (e) {}
  });
}

// --- syntax highlighting (colors come from the scheme's tokens) ---------------
const codeEls = [...document.querySelectorAll('.codebox code')].filter((el) => {
  const lang = (el.className.match(/language-(\w+)/) || [])[1];
  return lang && lang !== 'prompt' && lang !== 'text';   // prose-like blocks stay plain
});
if (codeEls.length) {
  import('https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/highlight.min.js')
    .then(({ default: hljs }) => codeEls.forEach((el) => { try { hljs.highlightElement(el); } catch (e) {} }))
    .catch(() => {});
}

// --- mermaid (recolored by CSS from the tokens, so no re-render on a switch) ---
const mermaidNodes = document.querySelectorAll('pre.mermaid');
if (mermaidNodes.length) {
  import('https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.esm.min.mjs')
    .then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: { fontFamily: 'Geist, system-ui, sans-serif', fontSize: '15px' },
      });
      return mermaid.run({ nodes: mermaidNodes });
    })
    .catch(() => {});
}
