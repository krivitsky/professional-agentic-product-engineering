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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
.wrap{width:1200px;height:630px;background:#22303c;display:flex;flex-direction:column;padding:44px 70px 36px;position:relative}
.wrap:before{content:'';position:absolute;left:0;top:0;bottom:0;width:16px;background:#1abc9c}
.row{flex:1;display:flex;align-items:center;gap:50px}
.cave-wrap{width:320px;flex:none;display:flex;flex-direction:column;align-items:center;gap:18px}
.cave{width:300px}
.cave-label{font:600 23px 'Inter',sans-serif;color:#1abc9c;letter-spacing:.01em}
.title{flex:1;font-family:'Playfair Display',serif;font-weight:900;font-size:84px;line-height:1.03;color:#fff;letter-spacing:-.015em}
.title b{color:#1abc9c}
.brand{font:400 26px 'Inter',sans-serif;color:#8aa0b0;letter-spacing:.01em;margin-left:370px}
</style></head><body>
<div class="wrap">
  <div class="row">
    <div class="cave-wrap">
      <img class="cave" src="${LOGO}">
      <div class="cave-label">Learn with agents</div>
    </div>
    <div class="title"><b>Professional</b><br><b>Agentic</b><br>Product<br>Engineering</div>
  </div>
  <div class="brand">From Prompts to Systems: Master The 8 Tiers</div>
</div></body></html>`;

const tmp = join(HERE, '.og-tmp.html');
await writeFile(tmp, html);
// 1x (1200x630) for the OG meta tag; 2x (2400x1260) for a crisp on-page hero.
for (const [scale, name] of [[1, 'og.png'], [2, 'og-2x.png']]) {
  const out = join(ROOT, 'assets', name);
  await run(CHROME, ['--headless=new', '--hide-scrollbars', `--force-device-scale-factor=${scale}`,
    `--screenshot=${out}`, '--window-size=1200,630', '--virtual-time-budget=4000',
    `file://${tmp}`]);
  console.log(`Wrote ${out}`);
}
await rm(tmp, { force: true });

// Square favicon — caveman centred on a navy tile (the 2:1 logo squished into
// a square looks bad; this gives it room and a branded backdrop).
const favHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0}html,body{width:512px;height:512px}
.tile{width:512px;height:512px;background:#22303c;display:grid;place-items:center;position:relative}
.tile:before{content:'';position:absolute;left:0;top:0;bottom:0;width:34px;background:#1abc9c}
img{width:400px}
</style></head><body><div class="tile"><img src="${LOGO}"></div></body></html>`;
const favTmp = join(HERE, '.fav-tmp.html');
const favOut = join(ROOT, 'assets', 'favicon.png');
await writeFile(favTmp, favHtml);
await run(CHROME, ['--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1',
  `--screenshot=${favOut}`, '--window-size=512,512', '--virtual-time-budget=2000',
  `file://${favTmp}`]);
await rm(favTmp, { force: true });
console.log(`Wrote ${favOut}`);
