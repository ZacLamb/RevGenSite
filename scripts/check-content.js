/**
 * check-content.js: lints content/*.md against content/CONTENT-SPEC.md.
 * Run after `npm run build`: node scripts/check-content.js
 * Exits 1 when it finds errors. Warnings are printed but don't fail.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const errors = []; const warns = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warns.push(`${f}: ${m}`);

const images = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/images-manifest.json'), 'utf8'))));
const services = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/services.json'), 'utf8')).map((s) => s.slug));
const industries = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/industries.json'), 'utf8'));
const CATS = ['AI & Automations', 'CRM & Systems', 'Web Design & SEO', 'Digital Marketing', 'Custom Tools'];
const BANNED = /\b(revolutioni[sz]e|game[- ]changer|unlock|seamless(ly)?|supercharge|skyrocket|fast-paced world|elevate)\b/i;

function read(dir) {
  const d = path.join(ROOT, 'content', dir);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter((f) => f.endsWith('.md')).map((f) => {
    const raw = fs.readFileSync(path.join(d, f), 'utf8');
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!m) { err(`${dir}/${f}`, 'missing front matter'); return null; }
    let front;
    try { front = yaml.load(m[1], { schema: yaml.JSON_SCHEMA }) || {}; } catch (e) { err(`${dir}/${f}`, `bad YAML: ${e.message.split('\n')[0]}`); return null; }
    return { f: `${dir}/${f}`, slug: f.replace(/\.md$/, ''), front, body: m[2] };
  }).filter(Boolean);
}

function common(x, { min, max, titleMax }) {
  const { f, front, body } = x;
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < min) err(f, `only ${words} words (min ${min})`);
  if (words > max * 1.15) warn(f, `${words} words (target max ${max})`);
  if (!front.title) err(f, 'no title');
  else if (front.title.length > titleMax) warn(f, `title ${front.title.length} chars (max ${titleMax})`);
  const d = String(front.description || '');
  if (d.length < 110 || d.length > 175) warn(f, `description ${d.length} chars`);
  if (!Array.isArray(front.faq) || front.faq.length < 2) err(f, 'needs 2+ FAQ entries');
  (front.faq || []).forEach((q, i) => { if (!q || !q.q || !q.a) err(f, `faq[${i}] needs q and a`); });
  if (/^#\s/m.test(body)) err(f, 'has an H1');
  if (/<[a-z][^>]*>/i.test(body)) warn(f, 'contains raw HTML (shown as text)');
  const all = `${front.title} ${front.description} ${body} ${JSON.stringify(front.faq || [])}`;
  const b = all.match(BANNED); if (b) err(f, `banned word "${b[0]}"`);
  if (/studies (show|consistently|have shown|find)|research shows|according to (a |one )?(recent )?(study|survey)/i.test(all) && !/\]\(https?:/.test(body)) err(f, 'cites studies without a linked source');
  const pct = all.match(/\b\d{1,3}(\.\d)?%/g);
  if (pct && !/\]\(https?:/.test(body)) warn(f, `percentages with no linked source: ${[...new Set(pct)].join(' ')}`);
  const dashes = (body.match(/—/g) || []).length; if (dashes > 3) warn(f, `${dashes} em dashes`);
  const internal = (body.match(/\]\(\/[^)]*\)/g) || []).length;
  if (internal < 3) err(f, `only ${internal} internal links (min 3)`);
}

const posts = read('blog');
posts.forEach((x) => {
  common(x, { min: 1000, max: 1700, titleMax: 70 });
  const { f, front } = x;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(front.date))) err(f, `bad date "${front.date}"`);
  if (!CATS.includes(front.category)) err(f, `bad category "${front.category}"`);
  if (!images.has(front.image)) err(f, `image "${front.image}" not in manifest`);
  (front.relatedServices || []).forEach((s) => services.has(s) || err(f, `unknown service ${s}`));
  (front.relatedIndustries || []).forEach((s) => industries.some((i) => i.slug === s) || err(f, `unknown industry ${s}`));
  if (!(front.relatedServices || []).length) err(f, 'no relatedServices');
});

const combos = read('industry-services');
combos.forEach((x) => {
  common(x, { min: 550, max: 900, titleMax: 65 });
  const [ind, svc] = x.slug.split('--');
  const i = industries.find((y) => y.slug === ind);
  if (!i) err(x.f, `unknown industry ${ind}`);
  else if (!i.relevantServices.includes(svc)) err(x.f, `${svc} isn't a relevant service for ${ind}`);
  if (x.front.industry && x.front.industry !== ind) err(x.f, 'front matter industry does not match file name');
  if (x.front.service && x.front.service !== svc) err(x.f, 'front matter service does not match file name');
  if (!x.front.intro) warn(x.f, 'no intro');
});

// Near-duplicate check between industry × service pages: shared 12-word runs.
const shingles = (t) => { const w = t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean); const s = new Set(); for (let k = 0; k + 12 <= w.length; k++) s.add(w.slice(k, k + 12).join(' ')); return s; };
const sh = combos.map((c) => ({ f: c.f, s: shingles(c.body) }));
for (let a = 0; a < sh.length; a++) for (let b = a + 1; b < sh.length; b++) {
  let n = 0; for (const x of sh[a].s) if (sh[b].s.has(x)) n++;
  if (n >= 3) warn(sh[a].f, `shares ${n} 12-word phrases with ${sh[b].f}`);
}

// Link check over the built site: every internal href must resolve to a file.
const missing = new Map();
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) {
      const html = fs.readFileSync(p, 'utf8');
      for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
        const u = m[1];
        if (/^\/(css|js|images)\//.test(u)) continue;
        const target = u.endsWith('/') ? path.join(PUBLIC, u, 'index.html') : path.join(PUBLIC, u);
        if (!fs.existsSync(target) && !fs.existsSync(target + '.html')) {
          const from = path.relative(PUBLIC, p);
          if (!missing.has(u)) missing.set(u, new Set());
          missing.get(u).add(from);
        }
      }
    }
  }
})(PUBLIC);
for (const [u, from] of missing) err('link', `${u} is missing (linked from ${[...from].slice(0, 3).join(', ')}${from.size > 3 ? ` +${from.size - 3}` : ''})`);

console.log(`Checked ${posts.length} posts and ${combos.length} industry × service pages.`);
if (warns.length) console.log(`\nWarnings (${warns.length}):\n- ${warns.join('\n- ')}`);
if (errors.length) { console.log(`\nErrors (${errors.length}):\n- ${errors.join('\n- ')}`); process.exit(1); }
console.log('\nNo errors.');
