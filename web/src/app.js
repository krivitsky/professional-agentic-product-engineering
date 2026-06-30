// Client behaviour: theme toggle, mobile drawer, copy buttons, syntax + mermaid.
import hljs from 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/es/highlight.min.js';
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.esm.min.mjs';

const root = document.documentElement;

// --- theme -----------------------------------------------------------------
function setTheme(t) {
  root.dataset.theme = t;
  try { localStorage.setItem('theme', t); } catch (e) {}
  renderMermaid(t);
}
for (const btn of document.querySelectorAll('[data-theme-toggle]')) {
  btn.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });
}

// --- mobile drawer ---------------------------------------------------------
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuBtn = document.getElementById('menuBtn');
function closeMenu() {
  sidebar?.classList.remove('open');
  overlay?.classList.remove('show');
  menuBtn?.setAttribute('aria-expanded', 'false');
}
menuBtn?.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  overlay.classList.toggle('show', open);
  menuBtn.setAttribute('aria-expanded', String(open));
});
overlay?.addEventListener('click', closeMenu);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

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

// --- syntax highlighting ---------------------------------------------------
for (const el of document.querySelectorAll('.codebox code')) {
  const lang = (el.className.match(/language-(\w+)/) || [])[1];
  // "prompt" / "text" blocks stay plain — they read as prose, not code
  if (!lang || lang === 'prompt' || lang === 'text') continue;
  try { hljs.highlightElement(el); } catch (e) {}
}

// --- mermaid ---------------------------------------------------------------
const mermaidSrc = [...document.querySelectorAll('pre.mermaid')].map((n) => n.textContent);
function renderMermaid(theme) {
  const nodes = document.querySelectorAll('pre.mermaid');
  if (!nodes.length) return;
  nodes.forEach((n, i) => { n.removeAttribute('data-processed'); n.textContent = mermaidSrc[i]; });
  const dark = theme === 'dark';
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      fontFamily: 'Inter, sans-serif',
      primaryColor: dark ? '#2a3a47' : '#eef7f4',
      primaryTextColor: dark ? '#e7edf2' : '#2c3e50',
      primaryBorderColor: '#1abc9c',
      lineColor: dark ? '#7c8b99' : '#8a99a8',
      clusterBkg: dark ? 'rgba(26,188,156,0.06)' : 'rgba(26,188,156,0.06)',
      clusterBorder: dark ? '#2f6f63' : '#7fd3c3',
      fontSize: '15px',
    },
  });
  try { mermaid.run({ nodes }); } catch (e) {}
}
renderMermaid(root.dataset.theme);
