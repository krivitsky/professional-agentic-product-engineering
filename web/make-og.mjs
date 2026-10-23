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

// Paper, always: the share card is black ink on off-white, whatever scheme a reader picks.
const TIERS = [['Direct', [['T1', 'Prompt'], ['T2', 'Plan']]], ['Trust', [['T3', 'Verify'], ['T4', 'Enforce']]], ['Scale', [['T5', 'Orchestrate'], ['T6', 'Supervise']]]];
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:#FAFAF7;background-image:linear-gradient(rgba(26,26,26,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,26,.06) 1px,transparent 1px);background-size:40px 40px;padding:24px;font-family:'Geist',sans-serif;color:#2B2B2B}
.sheet{height:582px;border:2px solid #1A1A1A;background:rgba(250,250,247,.6);display:flex;flex-direction:column}
.top{display:flex;align-items:center;gap:18px;padding:16px 30px;border-bottom:1px solid #C8C8C4}
.mark{display:inline-flex;align-items:center;gap:12px;font-size:24px;font-weight:700;letter-spacing:-.02em;color:#0A0A0A}
.name{font-size:18px;color:#6B6B6B}
.dom{margin-left:auto;font-size:18px;font-weight:500;color:#2B2B2B}
.body{flex:1;padding:0 30px;display:flex;flex-direction:column;justify-content:center}
h1{font-size:70px;line-height:.98;letter-spacing:-.045em;font-weight:700;color:#0A0A0A;max-width:1000px}
.rt{font-size:21px;font-weight:600;color:#2B2B2B;margin:22px 0 0}
.tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:0 30px 26px}
.stage p{font-size:14px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6B6B6B;margin:0 0 8px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.t{border:2px solid #1A1A1A;padding:10px 12px;display:flex;align-items:baseline;gap:9px}
.t b{font-size:17px;color:#6B6B6B}.t span{font-size:22px;font-weight:700;letter-spacing:-.025em;color:#0A0A0A}
</style></head><body><div class="sheet">
<div class="top"><span class="mark"><svg viewBox="0 0 100 100" width="30" height="30"><rect x="4" y="4" width="92" height="92" rx="20" fill="#0A0A0A"/><circle cx="64" cy="36" r="13" fill="#FAFAF7"/></svg>PAPE</span><span class="name">Professional Agentic Product Engineering</span><span class="dom">agenticengineering.guide</span></div>
<div class="body">
<h1>Free the human<br>to judge and innovate.</h1>
<p class="rt">From commanding the model to supervising the outcomes, a tier-by-tier guide.</p>
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

// Square favicon: the logo in black and white, the harness as a solid white
// square with the agent as a black dot, on a transparent background.
const favHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0}html,body{width:512px;height:512px;background:transparent}
svg{display:block;width:512px;height:512px}
</style></head><body><svg viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="20" fill="#FFFFFF"/><circle cx="64" cy="36" r="13" fill="#0A0A0A"/></svg></body></html>`;
const favTmp = join(HERE, '.fav-tmp.html');
const favOut = join(ROOT, 'assets', 'favicon.png');
await writeFile(favTmp, favHtml);
await run(CHROME, ['--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--default-background-color=00000000', `--screenshot=${favOut}`, '--window-size=512,512', '--virtual-time-budget=6000',
  `file://${favTmp}`]);
await rm(favTmp, { force: true });
console.log(`Wrote ${favOut}`);
