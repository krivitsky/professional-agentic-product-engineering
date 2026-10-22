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

// Cyanotype, always — the share card is the brand, whatever scheme a reader picks.
const TIERS = [['Direct', [['T1', 'Prompt'], ['T2', 'Plan']]], ['Trust', [['T3', 'Verify'], ['T4', 'Enforce']]], ['Scale', [['T5', 'Orchestrate'], ['T6', 'Supervise']]]];
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:#0B3A8C;background-image:linear-gradient(rgba(230,240,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(230,240,255,.08) 1px,transparent 1px);background-size:40px 40px;padding:24px;font-family:'Geist',sans-serif;color:#E6F0FF}
.sheet{height:582px;border:2px solid #E6F0FF;background:rgba(11,58,140,.55);display:flex;flex-direction:column}
.top{display:flex;align-items:center;gap:18px;padding:16px 30px;border-bottom:1px solid #9DBBF0}
.mark{font-size:24px;font-weight:700;letter-spacing:-.02em;color:#fff}
.name{font-size:18px;color:#C9DAF8}
.dom{margin-left:auto;font-size:18px;font-weight:500;color:#E6F0FF}
.body{flex:1;padding:0 30px;display:flex;flex-direction:column;justify-content:center}
h1{font-size:70px;line-height:.98;letter-spacing:-.045em;font-weight:700;color:#fff;max-width:1000px}
.ruler{display:flex;align-items:center;gap:12px;margin:22px 0 0;max-width:820px}
.tick{flex:0 0 2px;height:18px;background:#9DBBF0}.line{flex:1 1 20px;height:2px;background:#9DBBF0}
.rt{font-size:21px;font-weight:600;color:#fff;white-space:nowrap}
.tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:0 30px 26px}
.stage p{font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#FFD23F;margin:0 0 8px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.t{border:2px solid #E6F0FF;padding:10px 12px;display:flex;align-items:baseline;gap:9px}
.t b{font-size:17px;color:#FFD23F}.t span{font-size:22px;font-weight:700;letter-spacing:-.025em;color:#fff}
</style></head><body><div class="sheet">
<div class="top"><span class="mark">PAPE</span><span class="name">Professional Agentic Product Engineering</span><span class="dom">agenticengineering.guide</span></div>
<div class="body">
<h1>Free the human.<br>Elevate human intelligence.</h1>
<div class="ruler"><span class="tick"></span><span class="line"></span><span class="rt">From operating the model to deciding the outcome, tier by tier.</span><span class="line"></span><span class="tick"></span></div>
</div>
<div class="tiers">${TIERS.map(([stage, ts]) => `<div class="stage"><p>${stage}</p><div class="pair">${ts.map(([n, nm]) => `<div class="t"><b>${n}</b><span>${nm}</span></div>`).join('')}</div></div>`).join('')}</div>
</div></body></html>`;

const tmp = join(HERE, '.og-tmp.html');
await writeFile(tmp, html);
// 1x (1200x630) for the OG meta tag; 2x (2400x1260) for a crisp on-page hero.
for (const [scale, name] of [[1, 'og.png'], [2, 'og-2x.png']]) {
  const out = join(ROOT, 'assets', name);
  await run(CHROME, ['--headless=new', '--hide-scrollbars', `--force-device-scale-factor=${scale}`,
    `--screenshot=${out}`, '--window-size=1200,630', '--virtual-time-budget=6000',
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
