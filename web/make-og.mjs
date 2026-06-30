// Regenerate the Open Graph share image -> ../assets/og.png (1200x630).
// Run locally when the title/brand/logo changes: `node make-og.mjs`.
// Needs local Google Chrome (Vercel can't run it, so og.png is committed).
import { readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const logo = await readFile(join(ROOT, 'assets', 'tutor-caveman.png'));
const LOGO = `data:image/png;base64,${logo.toString('base64')}`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;700&family=Playfair+Display:wght@800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
.wrap{width:1200px;height:630px;background:#22303c;display:flex;align-items:center;gap:56px;padding:0 96px;position:relative}
.wrap:before{content:'';position:absolute;left:0;top:0;bottom:0;width:16px;background:#1abc9c}
.cave{width:340px;flex:none}
.r{flex:1}
.title{font-family:'Playfair Display',serif;font-weight:900;font-size:92px;line-height:1.02;color:#fff;letter-spacing:-.015em}
.title b{color:#1abc9c}
.brand{font:700 25px 'Inter',sans-serif;color:#8aa0b0;letter-spacing:.02em;margin-top:34px}
</style></head><body>
<div class="wrap">
  <img class="cave" src="${LOGO}">
  <div class="r">
    <div class="title">Professional<br>Agentic <b>Product</b><br>Engineering</div>
    <div class="brand">A field guide · krivitsky.com</div>
  </div>
</div></body></html>`;

const tmp = join(HERE, '.og-tmp.html');
const out = join(ROOT, 'assets', 'og.png');
await writeFile(tmp, html);
await run(CHROME, ['--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1',
  `--screenshot=${out}`, '--window-size=1200,630', '--virtual-time-budget=4000',
  `file://${tmp}`]);
await rm(tmp, { force: true });
console.log(`Wrote ${out}`);
