/**
 * auto-article.js: writes one new blog post with Claude, following content/CONTENT-SPEC.md.
 *
 * Run by .github/workflows/daily-article.yml every morning. It picks a topic the blog
 * hasn't covered (rotating across industries), has Claude research and write it with web
 * search, and saves content/blog/<slug>.md. The workflow then runs `npm run check` and
 * either commits the post to main (Railway redeploys the site) or opens a PR for review.
 *
 * Needs ANTHROPIC_API_KEY. Optional: ANTHROPIC_MODEL (default claude-sonnet-5-5), TOPIC
 * (skip the topic step and write about this instead).
 * Prints `slug=...` and `title=...` to $GITHUB_OUTPUT when it runs in Actions.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname, '..');
const BLOG = path.join(ROOT, 'content', 'blog');
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const BASE = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const spec = read('content/CONTENT-SPEC.md');
const industries = JSON.parse(read('data/industries.json'));
const services = JSON.parse(read('data/services.json'));
const combos = fs.readdirSync(path.join(ROOT, 'content', 'industry-services')).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '').split('--'));

function posts() {
  return fs.readdirSync(BLOG).filter((f) => f.endsWith('.md')).map((f) => {
    const m = fs.readFileSync(path.join(BLOG, f), 'utf8').match(/^---\s*\n([\s\S]*?)\n---/);
    const front = m ? yaml.load(m[1], { schema: yaml.JSON_SCHEMA }) || {} : {};
    return { slug: f.replace(/\.md$/, ''), ...front };
  });
}

async function claude(system, prompt, { maxTokens = 8000, search = true } = {}) {
  if (!KEY) throw new Error('ANTHROPIC_API_KEY is not set');
  const messages = [{ role: 'user', content: prompt }];
  const body = { model: MODEL, max_tokens: maxTokens, system, messages };
  if (search) body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 8 }];
  for (let round = 0; round < 5; round++) {
    const r = await fetch(`${BASE}/v1/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(300_000),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      if (body.tools && r.status === 400 && round === 0) return claude(system, prompt, { maxTokens, search: false });
      throw new Error(`Claude API ${r.status}: ${d.error?.message || 'request failed'}`);
    }
    const blocks = d.content || [];
    let last = -1; blocks.forEach((b, i) => { if (b.type !== 'text') last = i; });
    const text = blocks.slice(last + 1).filter((b) => b.type === 'text').map((b) => b.text).join('');
    if (d.stop_reason !== 'pause_turn') return text;
    messages.push({ role: 'assistant', content: blocks });
  }
  throw new Error('The model kept pausing; giving up for today');
}

function firstJsonArray(text) {
  const s = String(text || '');
  for (let i = s.indexOf('['); i !== -1; i = s.indexOf('[', i + 1)) {
    for (let j = s.lastIndexOf(']'); j > i; j = s.lastIndexOf(']', j - 1)) {
      try { const v = JSON.parse(s.slice(i, j + 1)); if (Array.isArray(v) && v.length && typeof v[0] === 'object') return v; } catch { /* keep looking */ }
    }
  }
  return [];
}

const STOP = new Set(['how', 'the', 'and', 'for', 'your', 'with', 'from', 'what', 'into', 'business', 'businesses', 'service', 'services', 'local', 'contractors', 'contractor', 'guide']);
const words = (t) => new Set(String(t || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w)));
const overlap = (a, b) => { const A = words(a), B = words(b); if (!A.size || !B.size) return 0; let n = 0; A.forEach((w) => B.has(w) && n++); return n / Math.min(A.size, B.size); };
const slugify = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

const system = () => `You write articles for the Revenue Generating Solutions website. Follow this specification exactly. Where it lists blog slugs, use the CURRENT list below instead (it has grown since).

${spec}

## Current blog slugs (the only /blog/ links allowed)
${posts().map((p) => `- ${p.slug}`).join('\n')}

## Industry × service pages that exist (the only /industries/<industry>/<service>/ links allowed)
${combos.map(([i, s]) => `- /industries/${i}/${s}/`).join('\n')}`;

async function pickTopic() {
  if (process.env.TOPIC) return { topic: process.env.TOPIC, keyword: '', industries: [] };
  const all = posts();
  // Favor the industry with the fewest articles so coverage stays balanced.
  const count = Object.fromEntries(industries.map((i) => [i.slug, 0]));
  all.forEach((p) => (p.relatedIndustries || []).forEach((i) => { if (count[i] != null) count[i]++; }));
  const focus = industries.slice().sort((a, b) => count[a.slug] - count[b.slug]).slice(0, 3);
  const text = await claude(system(), `Suggest 8 new article topics that owners of local service businesses actually search for, that this blog has NOT covered yet. Existing titles and keywords: ${all.map((p) => `${p.title} (${p.keyword || ''})`).join('; ')}.
Prefer topics for these less-covered trades: ${focus.map((i) => i.name).join(', ')}. Each topic must be genuinely useful even to someone who never hires us, and must connect naturally to one of our services: ${services.map((s) => s.slug).join(', ')}.
Answer with only a JSON array, no prose: [{"topic": "...", "keyword": "...", "industries": ["<industry slug>"], "service": "<service slug>"}]`, { maxTokens: 3000, search: false });
  const ideas = firstJsonArray(text);
  const seen = all.map((p) => `${p.title} ${p.keyword || ''} ${p.slug}`);
  const fresh = ideas.filter((x) => x && x.topic && !seen.some((s) => overlap(`${x.topic} ${x.keyword}`, s) >= 0.7));
  if (!fresh.length) throw new Error('No new topic found that the blog has not already covered');
  return fresh.find((x) => (x.industries || []).some((i) => focus.some((f) => f.slug === i))) || fresh[0];
}

async function main() {
  const idea = await pickTopic();
  console.log(`Topic: ${idea.topic}`);
  const text = await claude(system(), `Write one new blog post in the spec's blog format about: ${idea.topic}
${idea.keyword ? `Primary keyword: ${idea.keyword}\n` : ''}${idea.industries?.length ? `Trades to focus on: ${idea.industries.join(', ')}\n` : ''}${idea.service ? `Main related service: ${idea.service}\n` : ''}Use date: ${today}. Add a short keyword-rich \`slug:\` to the front matter. Check any platform or legal facts with web search and link your sources.
Output only the Markdown file, starting with the --- front matter line. No commentary before or after.`);
  const md = text.trim().replace(/^```(?:markdown|md)?\s*/i, '').replace(/```\s*$/, '').trim();
  const m = md.slice(md.indexOf('---')).match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) throw new Error('The article came back without front matter');
  const front = yaml.load(m[1], { schema: yaml.JSON_SCHEMA }) || {};
  let slug = slugify(front.slug || front.title || idea.topic);
  const taken = new Set(posts().map((p) => p.slug));
  for (let i = 2; taken.has(slug); i++) slug = `${slug.replace(/-\d+$/, '')}-${i}`;
  delete front.slug;
  delete front.updated;
  front.date = today;
  const out = `---\n${yaml.dump(front, { lineWidth: -1, quotingType: '"' }).trim()}\n---\n\n${m[2].trim()}\n`;
  fs.writeFileSync(path.join(BLOG, `${slug}.md`), out);
  console.log(`Wrote content/blog/${slug}.md (${m[2].split(/\s+/).length} words)`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `slug=${slug}\ntitle=${String(front.title || slug).replace(/\n/g, ' ')}\n`);
}

main().catch((e) => { console.error(`auto-article: ${e.message}`); process.exit(1); });
