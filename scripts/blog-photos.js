/**
 * blog-photos.js: gives blog posts their own real photo from Pexels (free, no attribution required,
 * credited anyway) instead of reusing the same handful of site images.
 *
 * - The daily article bot calls photoFor(post) for each new post.
 * - Run it directly to backfill: `PEXELS_API_KEY=... node scripts/blog-photos.js`
 *   gives every post that shares its image with another post (or uses a generic site image) its own
 *   photo. Add --all to redo every post.
 *
 * Writes: the post's front matter (image: blog-<slug>.jpg, photo: {credit, source, id}) and
 * data/images-manifest.json (blog-<slug>.jpg -> Pexels URL), which scripts/fetch-images.js downloads at
 * deploy. A photo already used by another post is never picked again.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname, '..');
const BLOG = path.join(ROOT, 'content', 'blog');
const MANIFEST = path.join(ROOT, 'data', 'images-manifest.json');
const KEY = process.env.PEXELS_API_KEY;

const FRONT = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
function readPost(slug) {
  const text = fs.readFileSync(path.join(BLOG, `${slug}.md`), 'utf8');
  const m = text.match(FRONT);
  if (!m) throw new Error(`content/blog/${slug}.md: missing front matter`);
  return { slug, front: yaml.load(m[1], { schema: yaml.JSON_SCHEMA }) || {}, body: m[2] };
}
function writePost(p) {
  fs.writeFileSync(path.join(BLOG, `${p.slug}.md`), `---\n${yaml.dump(p.front, { lineWidth: -1, quotingType: '"' }).trim()}\n---\n\n${p.body.trim()}\n`);
}
const allSlugs = () => fs.readdirSync(BLOG).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
const usedPhotoIds = () => new Set(allSlugs().map((s) => { try { return readPost(s).front.photo?.id; } catch { return null; } }).filter(Boolean).map(String));

async function search(query, page = 1) {
  const u = `https://api.pexels.com/v1/search?${new URLSearchParams({ query, orientation: 'landscape', per_page: '30', page: String(page) })}`;
  const r = await fetch(u, { headers: { Authorization: KEY }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`Pexels ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return (await r.json()).photos || [];
}

// A few searches from most to least specific; first photo nobody else uses wins.
function queriesFor(front) {
  const ind = (front.relatedIndustries || [])[0];
  const INDUSTRY = { plumbing: 'plumber', electrical: 'electrician', hvac: 'hvac technician', masonry: 'stone mason', landscaping: 'landscaper', 'deck-building': 'deck builder', 'glass-glazing': 'glass installer', painting: 'house painter', 'carpentry-remodeling': 'carpenter', 'hardscaping-tree-service': 'tree service', 'gutter-pressure-washing': 'pressure washing', 'auto-restoration-detailing': 'car detailing', healthcare: 'medical clinic' };
  const topic = String(front.keyword || front.title || '').replace(/\b(how|to|for|your|the|a|an|and|of|in|on|with|small|business|businesses|guide|2026)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  const CAT = { 'AI & Automations': 'small business owner laptop', 'CRM & Systems': 'office team computer', 'Web Design & SEO': 'website design laptop', 'Digital Marketing': 'marketing small business', 'Custom Tools': 'tablet small business' };
  return [topic, ind && INDUSTRY[ind] ? `${INDUSTRY[ind]} at work` : null, ind && INDUSTRY[ind], CAT[front.category], 'small business owner'].filter(Boolean);
}

async function photoFor(post, used = usedPhotoIds()) {
  if (!KEY) return null;
  for (const q of queriesFor(post.front)) {
    for (const page of [1, 2]) {
      const photos = await search(q, page);
      const pick = photos.find((ph) => !used.has(String(ph.id)) && ph.width >= 1600);
      if (pick) return { id: String(pick.id), url: pick.src.large2x || pick.src.large, credit: pick.photographer, source: pick.url, query: q };
      if (photos.length < 30) break;
    }
  }
  return null;
}

function apply(post, ph) {
  const file = `blog-${post.slug}.jpg`;
  post.front.image = file;
  post.front.photo = { id: ph.id, credit: ph.credit, source: ph.source };
  writePost(post);
  const man = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  man[file] = ph.url;
  fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 2) + '\n');
  // A stale local copy (an old shared image) would be served instead of the new photo.
  const local = path.join(ROOT, 'public', 'images', file);
  if (fs.existsSync(local)) fs.unlinkSync(local);
}

async function backfill(all) {
  if (!KEY) throw new Error('Set PEXELS_API_KEY');
  const posts = allSlugs().map(readPost);
  const count = {};
  posts.forEach((p) => { count[p.front.image] = (count[p.front.image] || 0) + 1; });
  const todo = posts.filter((p) => all || !p.front.photo || count[p.front.image] > 1 || !String(p.front.image || '').startsWith(`blog-${p.slug}`));
  const used = usedPhotoIds();
  let done = 0;
  for (const p of todo) {
    const ph = await photoFor(p, used);
    if (!ph) { console.warn(`no photo found: ${p.slug}`); continue; }
    used.add(ph.id); apply(p, ph); done++;
    console.log(`${p.slug} <- ${ph.query} (${ph.credit})`);
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`Done: ${done} of ${todo.length} posts got their own photo.`);
}

module.exports = { photoFor, apply, readPost };
if (require.main === module) backfill(process.argv.includes('--all')).catch((e) => { console.error(e.message); process.exit(1); });
