/**
 * generate-site.js
 *
 * Programmatic static site generator for Revenue Generating Solutions.
 * Reads structured content from /data and writes a full set of static
 * HTML pages into /public — home, about, contact, services, industries,
 * locations, and the blog. Re-run any time with `npm run build` after
 * editing a data file to regenerate every page from the new content.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const PUBLIC = path.join(ROOT, 'public');

const site = JSON.parse(fs.readFileSync(path.join(DATA, 'site.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(DATA, 'services.json'), 'utf8'));
const industries = JSON.parse(fs.readFileSync(path.join(DATA, 'industries.json'), 'utf8'));
const towns = JSON.parse(fs.readFileSync(path.join(DATA, 'towns.json'), 'utf8'));
const { marked } = require('marked');
const yaml = require('js-yaml');

// ---------- Markdown content (content/*.md) ----------
// Blog posts live in content/blog/<slug>.md and industry × service pages in
// content/industry-services/<industry>--<service>.md. See content/CONTENT-SPEC.md.
const CONTENT = path.join(ROOT, 'content');
function readMdDir(dir) {
  const d = path.join(CONTENT, dir);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter((f) => f.endsWith('.md')).sort().map((f) => {
    const raw = fs.readFileSync(path.join(d, f), 'utf8').replace(/\r\n/g, '\n');
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!m) throw new Error(`content/${dir}/${f}: missing front matter`);
    // JSON schema keeps dates as plain "YYYY-MM-DD" strings.
    const front = yaml.load(m[1], { schema: yaml.JSON_SCHEMA }) || {};
    return { ...front, file: f, md: m[2].trim() };
  });
}
const legacyBlog = fs.existsSync(path.join(DATA, 'blog.json')) ? JSON.parse(fs.readFileSync(path.join(DATA, 'blog.json'), 'utf8')) : [];
const mdBlog = readMdDir('blog').map((p) => ({ ...p, slug: p.file.replace(/\.md$/, '') }));
const blog = [...mdBlog, ...legacyBlog.filter((p) => !mdBlog.some((m) => m.slug === p.slug))]
  .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.title.localeCompare(b.title));
const software = JSON.parse(fs.readFileSync(path.join(DATA, 'software.json'), 'utf8'));

const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
const industryBySlug = Object.fromEntries(industries.map((i) => [i.slug, i]));

const combos = readMdDir('industry-services').map((c) => {
  const [ind, svc] = c.file.replace(/\.md$/, '').split('--');
  const industry = industryBySlug[c.industry || ind];
  const service = serviceBySlug[c.service || svc];
  if (!industry || !service) throw new Error(`content/industry-services/${c.file}: unknown industry or service`);
  return { ...c, industry, service, path: `/industries/${industry.slug}/${service.slug}/` };
});
const comboFor = (iSlug, sSlug) => combos.find((c) => c.industry.slug === iSlug && c.service.slug === sSlug);

const YEAR = new Date().getFullYear();

// ---------- helpers ----------

function write(relPath, html) {
  const full = path.join(PUBLIC, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function img(src, alt, cls) {
  return `<img src="/images/${src}" alt="${alt}"${cls ? ` class="${cls}"` : ''} loading="lazy">`;
}

const escAttr = (v) => String(v ?? '').replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escHtml = (v) => String(v ?? '').replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const slugify = (t) => String(t).toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
marked.use({
  renderer: {
    // Content files are Markdown only: any raw HTML is shown as text, never run.
    html(token) { return escHtml(token.text); },
  },
});
function renderMd(md) {
  let html = marked.parse(md, { gfm: true });
  const seen = new Set();
  html = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
    let id = slugify(inner) || 'section';
    while (seen.has(id)) id += '-2';
    seen.add(id);
    return `<h2 id="${id}">${inner}</h2>`;
  });
  html = html.replace(/<a href="(javascript|data|vbscript):[^"]*"/gi, '<a href="#"');
  html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, (m, href) => {
    try { if (new URL(href).hostname.endsWith(site.domain)) return m; } catch { /* external */ }
    return `<a href="${href}" target="_blank" rel="noopener"`;
  });
  return html.replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, '</table></div>');
}

function faqSection(faq, heading = 'Common questions') {
  if (!faq || !faq.length) return '';
  return `<section class="bg-paper">
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">FAQ</div>
      <h2>${heading}</h2>
    </div>
    <div style="max-width:760px;">
      ${faq.map((f) => `<details class="faq-item"><summary>${escHtml(f.q)}</summary><p>${escHtml(f.a)}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>`;
}
function faqSchemaFor(faq) {
  if (!faq || !faq.length) return null;
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

// Posts that share the most services and industries with the given sets.
function relatedPosts({ services: sv = [], industries: ind = [], exclude, limit = 3 }) {
  return blog.filter((p) => p.slug !== exclude).map((p) => ({
    p,
    score: (p.relatedIndustries || []).filter((x) => ind.includes(x)).length * 2 + (p.relatedServices || []).filter((x) => sv.includes(x)).length,
  })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score || String(b.p.date).localeCompare(String(a.p.date))).slice(0, limit).map((x) => x.p);
}

// byIndustry: show the trade's photo (for lists that mix trades); otherwise the service's.
function comboCard(c, byIndustry) {
  const pic = byIndustry === true ? [c.industry.image, c.industry.name] : [c.service.image, c.service.name];
  return `<a href="${c.path}" class="card">
    <div class="card-media">${img(pic[0], pic[1])}</div>
    <div class="card-body">
      <span class="tag">${c.service.shortName}</span>
      <h3 style="margin-top:12px;">${escHtml(c.title)}</h3>
      <p>${escHtml(c.intro || c.description)}</p>
      <span class="card-link">See the playbook</span>
    </div>
  </a>`;
}

// ---------- layout ----------

function ldJson(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

function orgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `https://${site.domain}/#organization`,
    name: site.name,
    url: `https://${site.domain}/`,
    logo: `https://${site.domain}/images/logo-square-512.png`,
    image: `https://${site.domain}/images/logo-square-512.png`,
    telephone: site.phone,
    email: site.email,
    areaServed: site.region,
    founder: { '@type': 'Person', name: site.founder },
    sameAs: Object.values(site.social || {}),
    description: site.subTagline,
  };
}

function breadcrumbSchema(items) {
  // items: [{name, path}] in order, path relative (e.g. '/', '/services/')
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: `https://${site.domain}${it.path}`,
    })),
  };
}

function layout({ title, description, canonicalPath, bodyContent, ogImage, schemas, ogType, bare }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} — ${site.tagline}`;
  const ogImg = /^https?:/.test(ogImage || '') ? ogImage : `https://${site.domain}/images/${ogImage || 'og-image.jpg'}`;
  const allSchemas = [orgSchema(), ...(schemas || [])];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(fullTitle)}</title>
<meta name="description" content="${escAttr(description)}">
<link rel="canonical" href="https://${site.domain}${canonicalPath}">
<meta property="og:type" content="${ogType || 'website'}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${escAttr(fullTitle)}">
<meta property="og:description" content="${escAttr(description)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:url" content="https://${site.domain}${canonicalPath}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/images/favicon-64.png" type="image/png">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
${allSchemas.map(ldJson).join('\n')}
</head>
<body>
${bare ? bareHeader(bare) : header()}
${bodyContent}
${bare ? bareFooter() : footer()}
<script src="/js/main.js"></script>
</body>
</html>`;
}

// Landing-page header/footer: logo, phone and one CTA, no navigation to leak clicks away from the offer.
function bareHeader({ ctaHref = '#book', ctaLabel = 'Book My Free Consult' } = {}) {
  return `<header class="site-header">
  <div class="container">
    <a href="/" class="brand">
      <img src="/images/logo-mark.png" alt="${site.name}" class="brand-mark">
      <span>${site.name}<small>${site.tagline}</small></span>
    </a>
    <div class="header-actions">
      <a href="tel:${site.phone.replace(/[^\d+]/g, '')}" class="header-phone">${site.phone}</a>
      <a href="${ctaHref}" class="btn btn-primary" style="padding:11px 20px;font-size:14px;">${ctaLabel}</a>
    </div>
  </div>
</header>`;
}
function bareFooter() {
  return `<footer class="site-footer" style="padding:32px 0;">
  <div class="container" style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px;opacity:.8;">
    <span>&copy; ${new Date().getFullYear()} ${site.name}. All rights reserved.</span>
    <span><a href="tel:${site.phone.replace(/[^\d+]/g, '')}">${site.phone}</a> &middot; <a href="mailto:${site.email}">${site.email}</a></span>
  </div>
</footer>`;
}

function header() {
  return `<header class="site-header">
  <div class="container">
    <a href="/" class="brand">
      <img src="/images/logo-mark.png" alt="${site.name}" class="brand-mark">
      <span>${site.name}<small>${site.tagline}</small></span>
    </a>
    <nav class="main-nav">
      ${site.nav.map((n) => `<a href="${n.href}">${n.label}</a>`).join('\n      ')}
    </nav>
    <div class="header-actions">
      <a href="tel:${site.phone.replace(/[^\d+]/g, '')}" class="header-phone">${site.phone}</a>
      <a href="/book/" class="btn btn-primary" style="padding:11px 20px;font-size:14px;">Book a Free Consult</a>
      <button type="button" class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
  <nav id="mobile-nav" class="mobile-nav">
    ${site.nav.map((n) => `<a href="${n.href}">${n.label}</a>`).join('\n    ')}
    <a href="tel:${site.phone.replace(/[^\d+]/g, '')}">${site.phone}</a>
    <a href="/book/" class="btn btn-primary">Book a Free Consult</a>
  </nav>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="brand" style="color:#fff;margin-bottom:14px;display:inline-flex;">
          <img src="/images/logo-mark.png" alt="${site.name}" class="brand-mark">
          <span>${site.name}</span>
        </a>
        <p>${site.subTagline}</p>
      </div>
      <div>
        <h4>Services</h4>
        <ul>${services.map((s) => `<li><a href="/services/${s.slug}/">${s.shortName}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h4>Industries</h4>
        <ul>${industries.slice(0, 8).map((i) => `<li><a href="/industries/${i.slug}/">${i.name}</a></li>`).join('')}
        <li><a href="/industries/">View all industries →</a></li></ul>
      </div>
      <div>
        <h4>Locations</h4>
        <ul>${towns.slice(0, 6).map((t) => `<li><a href="/locations/${t.slug}/">${t.name}, ${t.state}</a></li>`).join('')}
        <li><a href="/locations/">View all locations →</a></li></ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="/about/">About</a></li>
          <li><a href="/software/">RGS Tools for agencies</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/contact/">Contact</a></li>
          <li><a href="tel:${site.phone.replace(/[^\d+]/g, '')}">${site.phone}</a></li>
          <li><a href="mailto:${site.email}">${site.email}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${YEAR} ${site.name}. All rights reserved.</span>
      <span>Serving ${site.region}</span>
    </div>
  </div>
</footer>`;
}

function heroSection({ eyebrow, title, lede, image, stats, breadcrumb, narrow }) {
  return `<section class="hero">
  <div class="hero-bg" style="background-image:url('/images/${image}')"></div>
  <div class="hero-overlay"></div>
  <div class="container">
    <div class="hero-content${narrow ? ' narrow' : ''}">
      ${breadcrumb ? `<div class="breadcrumb">${breadcrumb}</div>` : ''}
      ${eyebrow ? `<div class="eyebrow" style="color:#7DB2FF;">${eyebrow}</div>` : ''}
      <h1>${title}</h1>
      ${lede ? `<p class="lede">${lede}</p>` : ''}
      ${stats ? `<div class="hero-stats">${stats.map((s) => `<div class="hero-stat"><div class="value">${s.value}</div><div class="label">${s.label}</div></div>`).join('')}</div>` : ''}
    </div>
  </div>
</section>`;
}

function ctaBanner({ title, text, primaryLabel, primaryHref }) {
  return `<section>
  <div class="container">
    <div class="cta-banner">
      <h2>${title}</h2>
      <p>${text}</p>
      <div class="cta-row">
        <a href="${primaryHref || '/book/'}" class="btn btn-primary">${primaryLabel || 'Book a Free Consult'}</a>
        <a href="tel:${site.phone.replace(/[^\d+]/g, '')}" class="btn btn-outline">Call ${site.phone}</a>
      </div>
    </div>
  </div>
</section>`;
}

function serviceCard(s) {
  return `<a href="/services/${s.slug}/" class="card">
    <div class="card-media">${img(s.image, s.name)}</div>
    <div class="card-body">
      <h3>${s.shortName}</h3>
      <p>${s.tagline}</p>
      <span class="card-link">Explore this service</span>
    </div>
  </a>`;
}

function industryCard(i) {
  return `<a href="/industries/${i.slug}/" class="card">
    <div class="card-media">${img(i.image, i.name)}</div>
    <div class="card-body">
      <h3>${i.name}</h3>
      <p>${i.heroLine}</p>
      <span class="card-link">See how we help</span>
    </div>
  </a>`;
}

function townCard(t) {
  return `<a href="/locations/${t.slug}/" class="card">
    <div class="card-media">${img(t.image, t.name + ', ' + t.state)}</div>
    <div class="card-body">
      <h3>${t.name}, ${t.state}</h3>
      <p>${t.region}</p>
      <span class="card-link">View local page</span>
    </div>
  </a>`;
}

function blogCard(p) {
  return `<a href="/blog/${p.slug}/" class="card">
    <div class="card-media">${img(p.image || `blog-${p.slug}.jpg`, p.title)}</div>
    <div class="card-body">
      <span class="tag">${p.category}</span>
      <h3 style="margin-top:12px;">${escHtml(p.title)}</h3>
      <p>${escHtml(p.description)}</p>
      <span class="card-link">Read the article</span>
    </div>
  </a>`;
}


// ---------- RGS Tools (software for GoHighLevel agencies) ----------
const TOOL_ICON = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  sparkles: '<path d="M12 3 13.9 8.1 19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
};
const toolsUrl = (p = '') => site.toolsUrl.replace(/\/$/, '') + p;
const toolHref = (t) => (/^https?:/.test(t.url) ? t.url : toolsUrl(t.url));
const toolGlyph = (t, cls = '') => `<span class="tool-gl ${cls}" style="background:${t.grad}"><svg viewBox="0 0 24 24" aria-hidden="true">${TOOL_ICON[t.icon]}</svg></span>`;
const softwareTotals = () => ({ tools: software.tools.length, features: software.tools.reduce((n, t) => n + t.features, 0), sum: software.tools.reduce((n, t) => n + t.monthly, 0) });
function toolCard(t) {
  return `<a href="${toolHref(t)}" class="card tool-card">
    <div class="card-body">
      ${toolGlyph(t)}
      <h3>${t.name}</h3>
      <span class="tool-meta">${t.features} features · $${t.monthly}/month</span>
      <p>${t.tagline}</p>
      <span class="card-link">See ${t.name}</span>
    </div>
  </a>`;
}

// ---------- pages ----------

function buildHome() {
  const body = `
${heroSection({
  eyebrow: 'RGS — GROWTH SYSTEMS FOR LOCAL SERVICE BUSINESSES',
  title: site.tagline,
  lede: site.subTagline,
  image: 'hero-home.jpg',
  stats: site.stats.map((s) => ({ value: s.value, label: s.label })),
})}
<div class="container">
  <div class="cta-row" style="margin-top:-48px;position:relative;z-index:2;background:#fff;padding:20px 24px;border-radius:16px;box-shadow:0 20px 50px -20px rgba(10,26,47,.2);">
    <a href="/book/" class="btn btn-primary">Book a Free Consult</a>
    <a href="/services/" class="btn btn-outline-dark">See All Services</a>
  </div>
</div>

<section>
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">What We Do</div>
      <h2>Five services. One team. Zero handoffs.</h2>
      <p>Most agencies specialize in one piece of your marketing stack and hand you off for the rest. We build the website, the CRM, the automations, the ad campaigns, and the custom tools — all under one roof, all talking to each other.</p>
    </div>
    <div class="grid grid-3">
      ${services.map(serviceCard).join('\n      ')}
    </div>
  </div>
</section>

${(() => { const T = softwareTotals(); return `<section class="software-band">
  <div class="container">
    <div class="software-band-inner">
      <div>
        <div class="eyebrow" style="color:#7DB2FF;">For GoHighLevel agencies · RGS Tools</div>
        <h2>We built our own tools to run our agency. Now you can use them.</h2>
        <p>${T.tools} tools and ${T.features} features for agencies on GoHighLevel: custom field lookup, bulk sub-account setup, SMS blast follow-up, conversation exports, backups and in-app upgrades. Priced per agency, with unlimited sub-accounts.</p>
        <div class="cta-row"><a href="/software/" class="btn btn-primary">Explore RGS Tools</a><a href="${toolsUrl('/signup?tool=bundle')}" class="btn btn-outline">Start a ${software.bundle.trialDays}-day free trial</a></div>
      </div>
      <div class="software-icons">${software.tools.map((t) => `<a href="${toolHref(t)}" title="${t.name}">${toolGlyph(t, 'lg')}<span>${t.name}</span></a>`).join('')}</div>
    </div>
  </div>
</section>`; })()}

<section class="bg-paper">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Industries We Serve</div>
      <h2>Built for the trades, not generic small business</h2>
      <p>We've built systems for plumbers, electricians, HVAC companies, masons, landscapers, and a dozen other trades — each with its own pipeline, pain points, and playbook.</p>
    </div>
    <div class="chip-grid" style="justify-content:center;">
      ${industries.map((i) => `<a href="/industries/${i.slug}/" class="chip">${i.name}</a>`).join('\n      ')}
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="split">
      <div>
        <div class="eyebrow">Why RGS</div>
        <h2>We build the whole growth system, not just one piece of it</h2>
        <p>A website with no CRM behind it just collects names nobody follows up on. A CRM with no automation just becomes another thing to log into. Ads without tracking are a guess. We build all of it together — website, CRM, automations, custom tools, and the campaigns that feed them — so every lead lands somewhere real and gets followed up on automatically.</p>
        <div class="feature-list" style="margin-top:24px;">
          <div class="feature-item"><span class="feature-icon">✓</span><p>One team building your site, CRM, and campaigns — nothing gets lost in a handoff</p></div>
          <div class="feature-item"><span class="feature-icon">✓</span><p>Dedicated pages for every service and every town you serve, built for local search</p></div>
          <div class="feature-item"><span class="feature-icon">✓</span><p>Automation and AI tools that catch the leads a busy office can't get to</p></div>
        </div>
      </div>
      <div class="media">${img('about-team.jpg', 'The Revenue Generating Solutions team')}</div>
    </div>
  </div>
</section>

<section class="bg-paper">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Service Area</div>
      <h2>Rooted in Massachusetts & New England</h2>
      <p>We're based in the region we serve — here are a few of the towns and markets we know well.</p>
    </div>
    <div class="grid grid-4">
      ${towns.slice(0, 4).map(townCard).join('\n      ')}
    </div>
    <div style="text-align:center;margin-top:32px;">
      <a href="/locations/" class="btn btn-outline-dark">View All Locations</a>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">From the Blog</div>
      <h2>Straight talk on growth, automation, and local marketing</h2>
    </div>
    <div class="grid grid-3">
      ${blog.slice(0, 3).map(blogCard).join('\n      ')}
    </div>
  </div>
</section>

${ctaBanner({
  title: 'Ready to make more revenue?',
  text: "Tell us about your business and we'll show you exactly where the leads, follow-up, and time are slipping through the cracks — and what it'd take to fix it.",
})}
`;
  write('index.html', layout({
    title: null,
    description: `${site.name} builds websites, CRM systems, AI automations, and marketing for local service businesses across ${site.region}. ${site.tagline}`,
    canonicalPath: '/',
    bodyContent: body,
  }));
}

function buildAbout() {
  const body = `
${heroSection({
  eyebrow: 'About Us',
  title: `The team behind ${site.name}`,
  lede: `We're a small, hands-on team that builds the full growth stack for local service businesses — websites, CRM systems, automation, custom software, and the marketing campaigns that feed them.`,
  image: 'about-team.jpg',
  narrow: true,
})}
<section>
  <div class="container">
    <div class="split">
      <div>
        <div class="eyebrow">How We Got Here</div>
        <h2>Built by people who've actually run the systems we sell</h2>
        <p>${site.name} was founded by ${site.founder} after years spent building and managing GoHighLevel CRM systems, custom software, and marketing campaigns for businesses of every size — from single-truck contractors to multi-location franchises. We started RGS because too many local service businesses were stuck buying a website from one company, a CRM from another, and ads from a third, with none of it talking to each other.</p>
        <p>Today we build all of it under one roof: the website that gets found, the CRM that keeps every lead tracked, the AI automation that catches what a busy office can't, the custom tools that close the gaps off-the-shelf software leaves open, and the ad campaigns that keep the calendar full — all connected, all reporting back to the same system.</p>
      </div>
      <div class="media">${img('hero-home.jpg', 'RGS team on a client job site')}</div>
    </div>
  </div>
</section>
<section class="bg-paper">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">What We Believe</div>
      <h2>A few things we won't compromise on</h2>
    </div>
    <div class="grid grid-3">
      <div class="card"><div class="card-body">
        <h3>No cookie-cutter templates</h3>
        <p>Every website, CRM pipeline, and campaign is built around how your specific business actually works — not a generic template with your logo swapped in.</p>
      </div></div>
      <div class="card"><div class="card-body">
        <h3>Systems that talk to each other</h3>
        <p>Your website, CRM, automations, and ad campaigns should share data, not live in separate silos you have to manually reconcile.</p>
      </div></div>
      <div class="card"><div class="card-body">
        <h3>Straight answers on what works</h3>
        <p>If a bigger project isn't the right first move for your business, we'll tell you — and recommend the smaller thing that actually is.</p>
      </div></div>
    </div>
  </div>
</section>
${ctaBanner({
  title: 'Want to see how this looks for your business?',
  text: 'Book a free consult and we\'ll walk through your current website, CRM, and marketing — and show you exactly where the opportunity is.',
})}
`;
  write('about/index.html', layout({
    title: 'About',
    description: `Meet the team behind ${site.name} — builders of websites, CRM systems, AI automation, and marketing for local service businesses in ${site.region}.`,
    canonicalPath: '/about/',
    bodyContent: body,
    ogImage: 'about-team.jpg',
  }));
}

function buildContact() {
  const body = `
${heroSection({
  eyebrow: 'Contact',
  title: "Let's talk about your business",
  lede: "Tell us a bit about what you do and where you're looking to grow — we'll follow up within one business day.",
  image: 'hero-home.jpg',
  narrow: true,
})}
<section>
  <div class="container">
    <div class="split">
      <div>
        <h2>Get a free consult</h2>
        <p>Fill out the form and we'll reach out to schedule a short call — no pressure, no generic sales pitch, just a real look at your website, CRM, and marketing and where the fastest wins are.</p>
        <p style="margin-top:12px;"><strong>Rather skip the back-and-forth?</strong> <a href="/book/">Pick a time on our calendar</a> and you're booked instantly.</p>
        <form id="contact-form" style="display:grid;gap:16px;margin-top:24px;">
          <div>
            <label style="font-weight:600;font-size:14px;display:block;margin-bottom:6px;">Name</label>
            <input required name="name" type="text" style="width:100%;padding:13px 16px;border:1px solid var(--gray-light);border-radius:10px;font-family:inherit;font-size:15px;">
          </div>
          <div>
            <label style="font-weight:600;font-size:14px;display:block;margin-bottom:6px;">Business Name</label>
            <input required name="business" type="text" style="width:100%;padding:13px 16px;border:1px solid var(--gray-light);border-radius:10px;font-family:inherit;font-size:15px;">
          </div>
          <div>
            <label style="font-weight:600;font-size:14px;display:block;margin-bottom:6px;">Email</label>
            <input required name="email" type="email" style="width:100%;padding:13px 16px;border:1px solid var(--gray-light);border-radius:10px;font-family:inherit;font-size:15px;">
          </div>
          <div>
            <label style="font-weight:600;font-size:14px;display:block;margin-bottom:6px;">Phone</label>
            <input name="phone" type="tel" style="width:100%;padding:13px 16px;border:1px solid var(--gray-light);border-radius:10px;font-family:inherit;font-size:15px;">
          </div>
          <div>
            <label style="font-weight:600;font-size:14px;display:block;margin-bottom:6px;">What are you looking for help with?</label>
            <textarea name="message" rows="4" style="width:100%;padding:13px 16px;border:1px solid var(--gray-light);border-radius:10px;font-family:inherit;font-size:15px;resize:vertical;"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:fit-content;">Send It</button>
          <p id="contact-form-note" style="font-size:13px;color:var(--gray);"></p>
        </form>
      </div>
      <div>
        <div class="card" style="padding:32px;">
          <h3 style="margin-bottom:20px;">Reach us directly</h3>
          <div class="feature-list">
            <div class="feature-item"><span class="feature-icon">📞</span><p><a href="tel:${site.phone.replace(/[^\d+]/g, '')}">${site.phone}</a></p></div>
            <div class="feature-item"><span class="feature-icon">✉️</span><p><a href="mailto:${site.email}">${site.email}</a></p></div>
            <div class="feature-item"><span class="feature-icon">📍</span><p>Proudly serving ${site.region}</p></div>
          </div>
          <hr class="divider">
          <p style="font-size:14px;">Serving businesses across ${site.region} and beyond — most of our work is done remotely, with on-site visits available for local clients.</p>
        </div>
      </div>
    </div>
  </div>
</section>
`;
  write('contact/index.html', layout({
    title: 'Contact',
    description: `Get in touch with ${site.name} — call ${site.phone}, email ${site.email}, or send us a message to book a free consult.`,
    canonicalPath: '/contact/',
    bodyContent: body,
  }));
}

// Booking page: the GoHighLevel calendar embedded on our own domain (data/site.json -> booking.calendarId).
// Bookings land straight in the RGS sub-account's "RGS Booking Calendar".
function buildBook() {
  const b = site.booking || {};
  const src = `https://api.leadconnectorhq.com/widget/booking/${b.calendarId}`;
  const body = `
${heroSection({
  eyebrow: 'Book a Free Consult',
  title: 'Pick a time that works for you',
  lede: `A ${b.minutes || 15}-minute call with ${site.founder}. We'll look at your website, CRM and marketing and tell you where the fastest wins are. No pressure, no generic pitch.`,
  image: 'hero-home.jpg',
  narrow: true,
})}
<section>
  <div class="container">
    <div class="split" style="align-items:start;">
      <div class="card" style="padding:8px;min-height:640px;">
        <iframe src="${src}" title="Book a free consult with ${site.name}" style="width:100%;border:none;overflow:hidden;min-height:640px;" scrolling="no" id="${b.calendarId}_booking" allow="payment"></iframe>
        <noscript><p style="padding:24px;">Open the calendar here: <a href="${src}">${src}</a></p></noscript>
      </div>
      <div>
        <div class="card" style="padding:32px;">
          <h3 style="margin-bottom:20px;">What happens on the call</h3>
          <div class="feature-list">
            <div class="feature-item"><span class="feature-icon">🔍</span><p>A quick look at how leads find you, and where they fall through the cracks</p></div>
            <div class="feature-item"><span class="feature-icon">⚡</span><p>The two or three fixes that would bring in more revenue fastest</p></div>
            <div class="feature-item"><span class="feature-icon">🧾</span><p>A straight answer on cost and timing if you want our help, and no follow-up pressure if you don't</p></div>
          </div>
          <hr class="divider">
          <p style="font-size:14px;">No time that works? Call or text <a href="tel:${site.phone.replace(/[^\d+]/g, '')}">${site.phone}</a>, or <a href="/contact/">send us a message</a>.</p>
        </div>
      </div>
    </div>
  </div>
</section>
<script src="https://link.msgsndr.com/js/form_embed.js" type="text/javascript"></script>
`;
  write('book/index.html', layout({
    title: 'Book a Free Consult',
    description: `Book a free ${b.minutes || 15}-minute consult with ${site.name}. Pick a time online and we'll look at your website, CRM and marketing together.`,
    canonicalPath: '/book/',
    bodyContent: body,
  }));
}

// /book-1: webinar-style sales page for the free AI consult offer (Hormozi layout: one promise, one video,
// one CTA repeated, objection handling, a straight-talk guarantee, then the calendar).
// Video + poster come from data/site.json -> book1.video / book1.poster.
function buildBook1() {
  const b = site.booking || {};
  const v = site.book1 || {};
  const cal = `https://api.leadconnectorhq.com/widget/booking/${b.calendarId}`;
  const mmss = (s) => `${Math.floor((s || 0) / 60)}:${String(Math.round(s || 0) % 60).padStart(2, '0')}`;
  const cta = (label = 'Book My Free AI Consult') => `<a href="#book" class="btn btn-primary w1-cta">${label} &rarr;</a>`;
  const ticks = `<div class="w1-ticks"><span>&#10003; 100% free</span><span>&#10003; ${b.minutes || 15} minutes, on Zoom or phone</span><span>&#10003; No pitch, no obligation</span></div>`;
  const faq = [
    { q: 'Is it actually free?', a: "Yes. No card, no catch. It's free this month because we want to show owners where AI actually pays off, before they spend a dollar on it. If you want help putting it in place afterwards, we can talk about that. If not, you still leave with the answer." },
    { q: "I'm not technical. Is this for me?", a: "Especially for you. You don't need to know what ChatGPT, agents or automations are. Tell us how your business runs and we'll show you, in plain English, where AI fits and where it doesn't." },
    { q: 'What do I need to bring?', a: 'Nothing but 15 minutes. If you can, think about the one task that eats most of your week, or the leads you lose. That is usually where the money is.' },
    { q: 'What if AI is not a fit for my business?', a: "Then we'll tell you. Straight up. You'll still leave knowing the one thing worth fixing first, AI or not." },
    { q: 'Why only this month?', a: "Because every call is one-on-one, and we can only do so many. When the month's over, the free calls are over." },
  ];
  const body = `
<style>
  .w1-bar { background: var(--ink); color: #fff; text-align: center; font-size: 14px; font-weight: 600; padding: 10px 16px; }
  .w1-bar b { color: #FFD43B; }
  .w1-hero { background: radial-gradient(1200px 500px at 50% -10%, #12305e 0%, var(--ink) 60%); color: #fff; padding: 56px 0 72px; text-align: center; }
  .w1-hero .eyebrow-pill { display: inline-block; background: rgba(255,212,59,.14); color: #FFD43B; border: 1px solid rgba(255,212,59,.4); font-weight: 800; font-size: 12.5px; letter-spacing: .08em; text-transform: uppercase; padding: 7px 14px; border-radius: 999px; margin-bottom: 18px; }
  .w1-hero h1 { font-size: clamp(32px, 5.2vw, 58px); line-height: 1.05; letter-spacing: -.03em; max-width: 980px; margin: 0 auto 18px; color: #fff; }
  .w1-hero h1 .hl { background: linear-gradient(transparent 60%, rgba(255,212,59,.55) 60%); padding: 0 4px; }
  .w1-hero .sub { color: #C9D6EE; font-size: clamp(16px, 2vw, 20px); max-width: 760px; margin: 0 auto 32px; }
  .w1-video { position: relative; max-width: 900px; margin: 0 auto; border-radius: 18px; overflow: hidden; box-shadow: 0 30px 80px -20px rgba(0,0,0,.6); border: 3px solid rgba(255,255,255,.12); background: #000; aspect-ratio: 16/9; }
  .w1-video video { width: 100%; height: 100%; display: block; object-fit: cover; }
  .w1-play { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; background: rgba(5,12,24,.35); border: 0; cursor: pointer; color: #fff; font: inherit; }
  .w1-play .disc { width: 92px; height: 92px; border-radius: 50%; background: #FFD43B; display: grid; place-items: center; box-shadow: 0 0 0 12px rgba(255,212,59,.25); }
  .w1-play .disc::after { content: ''; border-left: 28px solid var(--ink); border-top: 17px solid transparent; border-bottom: 17px solid transparent; margin-left: 7px; }
  .w1-play span { font-weight: 800; font-size: 18px; text-shadow: 0 2px 10px rgba(0,0,0,.6); }
  .w1-cta { font-size: 19px; padding: 20px 34px; margin-top: 30px; box-shadow: 0 18px 40px -10px rgba(11,95,255,.7); }
  .w1-proof { max-width: 900px; margin: 34px auto 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.12); border-radius: 16px; overflow: hidden; }
  .w1-proof > div { background: rgba(10,26,47,.92); padding: 18px 14px; }
  .w1-proof b { display: block; font-size: 30px; color: #FFD43B; letter-spacing: -.02em; }
  .w1-proof span { font-size: 13.5px; color: #C9D6EE; }
  @media (max-width: 640px) { .w1-proof { grid-template-columns: 1fr; } }
  .w1-ticks { display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; margin-top: 16px; font-size: 14px; font-weight: 600; color: #C9D6EE; }
  .w1-sec { padding: 72px 0; }
  .w1-sec.alt { background: var(--paper); }
  .w1-narrow { max-width: 820px; margin: 0 auto; }
  .w1-sec h2 { font-size: clamp(28px, 3.6vw, 40px); text-align: center; margin-bottom: 28px; }
  .w1-pains { display: grid; gap: 14px; }
  .w1-pains li { background: #fff; border: 1px solid var(--gray-light); border-left: 5px solid #ef4444; border-radius: 12px; padding: 16px 20px; font-weight: 600; color: var(--ink); }
  .w1-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .w1-step { background: #fff; border: 1px solid var(--gray-light); border-radius: var(--radius); padding: 26px; box-shadow: var(--shadow-sm); }
  .w1-step .n { width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: #fff; display: grid; place-items: center; font-weight: 800; margin-bottom: 14px; }
  .w1-step h3 { font-size: 19px; }
  .w1-fit { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .w1-fit > div { border-radius: var(--radius); padding: 26px; }
  .w1-fit .yes { background: #ecfdf3; border: 1px solid #abefc6; }
  .w1-fit .no { background: #fef3f2; border: 1px solid #fecdca; }
  .w1-fit li { padding: 6px 0; font-weight: 500; color: var(--ink); }
  .w1-promise { background: var(--ink); color: #fff; border-radius: 20px; padding: 40px; text-align: center; border: 3px dashed #FFD43B; }
  .w1-promise h2 { color: #fff; margin-bottom: 12px; }
  .w1-promise p { color: #C9D6EE; font-size: 18px; max-width: 640px; margin: 0 auto; }
  .w1-book { display: grid; grid-template-columns: 1.1fr .9fr; gap: 28px; align-items: start; }
  .w1-cal { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); padding: 8px; min-height: 640px; }
  .w1-count { display: inline-flex; gap: 10px; margin: 6px 0 22px; }
  .w1-count div { background: var(--ink); color: #fff; border-radius: 10px; padding: 8px 12px; text-align: center; min-width: 64px; }
  .w1-count b { display: block; font-size: 24px; line-height: 1; } .w1-count small { font-size: 11px; opacity: .7; text-transform: uppercase; letter-spacing: .06em; }
  .w1-faq details { border-bottom: 1px solid var(--gray-light); padding: 16px 0; }
  .w1-faq summary { font-weight: 700; cursor: pointer; color: var(--ink); }
  .w1-faq p { margin: 10px 0 0; }
  .w1-chap { max-width: 900px; margin: 14px auto 0; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  .w1-chap button { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.16); color: #C9D6EE; border-radius: 999px; padding: 7px 13px; font: inherit; font-size: 13.5px; cursor: pointer; }
  .w1-chap button b { color: #FFD43B; margin-right: 7px; }
  .w1-chap button:hover { border-color: #FFD43B; color: #fff; }
  .w1-leaks { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
  .w1-leaks > div { background: #fff; border: 1px solid var(--gray-light); border-top: 5px solid #FFD43B; border-radius: var(--radius); padding: 22px; box-shadow: var(--shadow-sm); }
  .w1-leaks small { font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--gray); font-size: 12px; }
  .w1-leaks h3 { font-size: 20px; margin: 6px 0 8px; }
  .w1-leaks p { font-size: 15px; margin: 0; }
  .w1-rule { margin: 30px auto 0; max-width: 900px; background: var(--ink); color: #C9D6EE; border-radius: 20px; padding: 32px; text-align: center; }
  .w1-rule h3 { color: #fff; font-size: clamp(20px, 2.6vw, 28px); margin-bottom: 12px; }
  .w1-rule h3 span { color: #FFD43B; }
  .w1-rule b { color: #fff; }
  .w1-sticky { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; background: var(--ink); color: #fff; padding: 12px 16px; display: flex; gap: 14px; align-items: center; justify-content: center; box-shadow: 0 -10px 30px rgba(0,0,0,.3); transform: translateY(110%); visibility: hidden; transition: transform .35s ease, visibility .35s; }
  .w1-sticky.on { transform: none; visibility: visible; }
  .w1-sticky span { font-weight: 700; font-size: 15px; }
  .w1-sticky .btn { padding: 12px 20px; font-size: 15px; white-space: nowrap; }
  @media (max-width: 860px) { .w1-leaks { grid-template-columns: 1fr 1fr; } .w1-sticky span { display: none; } .w1-sticky .btn { width: 100%; justify-content: center; } }
  @media (max-width: 520px) { .w1-leaks { grid-template-columns: 1fr; } .w1-rule { padding: 24px 18px; } }
  @media (max-width: 860px) { .w1-steps, .w1-fit, .w1-book { grid-template-columns: 1fr; } .w1-promise { padding: 28px 20px; } .w1-cta { width: 100%; justify-content: center; } }
</style>
<div class="w1-bar">&#128293; <b>Free training + free 1-on-1 AI consult</b> &middot; <span data-w1-left>this month only</span></div>
<section class="w1-hero">
  <div class="container">
    <span class="eyebrow-pill">&#9654; Free ${Math.round((v.seconds||0)/60)}-Minute Training &middot; For Business Owners</span>
    <h1>The 4 money leaks in every small business, and how to find the <span class="hl">ONE place</span> AI pays you back</h1>
    <p class="sub">Feel like you're falling behind on AI, or have no clue where to start? Watch this short training, then book a free one-on-one call and we'll find yours together.</p>
    <div class="w1-video">
      <video id="w1v" playsinline preload="metadata" ${v.poster ? `poster="${v.poster}"` : ''} src="${v.video || ''}"></video>
      <button class="w1-play" id="w1p" type="button" aria-label="Play the training"><span class="disc"></span><span>Watch the free training (${mmss(v.seconds)})</span></button>
    </div>
    ${(v.chapters || []).length ? `<div class="w1-chap">${v.chapters.map((c) => `<button type="button" data-t="${c.t}"><b>${mmss(c.t)}</b>${c.title}</button>`).join('')}</div>` : ''}
    ${cta()}
    ${ticks}
    <div class="w1-proof">
      <div><b>240+</b><span>businesses run on our systems</span></div>
      <div><b>$10Ks</b><span>in added revenue from our AI agents</span></div>
      <div><b>Custom</b><span>invoicing, management &amp; local SEO builds</span></div>
    </div>
  </div>
</section>

<section class="w1-sec">
  <div class="container">
    <span class="eyebrow" style="display:block;text-align:center;">In the training</span>
    <h2>The 4 places AI actually pays a small business back</h2>
    <div class="w1-leaks">
      <div><small>Leak #1</small><h3>Speed to lead</h3><p>Leads wait hours for a reply and call your competitor. AI answers, texts back in seconds and books the job while you're working.</p></div>
      <div><small>Leak #2</small><h3>Follow-up</h3><p>Most sales take several follow-ups. Most businesses stop after one. AI follows up on every quote and no-show, in your voice.</p></div>
      <div><small>Leak #3</small><h3>Past customers</h3><p>They already trust you. AI wakes that list back up, asks for reviews and brings in repeat work.</p></div>
      <div><small>Leak #4</small><h3>Admin time</h3><p>Quotes, invoices, scheduling, data entry. AI takes a big chunk off your plate so you get your nights back.</p></div>
    </div>
    <div class="w1-rule">
      <h3>The rule: don't fix all four. Fix <span>ONE</span>. The biggest one. First.</h3>
      <p>To find it, ask: <b>Where do my leads go cold?</b> &middot; <b>What do I do over and over every week?</b> &middot; <b>What would I pay to never do again?</b></p>
      <p style="margin-top:10px;">Not sure? That's exactly what the free call is for.</p>
      ${cta('Find My ONE Place, Free')}
    </div>
  </div>
</section>

<section class="w1-sec alt">
  <div class="container">
    <h2>What happens on your free call</h2>
    <div class="w1-steps">
      <div class="w1-step"><div class="n">1</div><h3>We map your week</h3><p>Where leads come in, where they leak out, and the jobs that eat your hours.</p></div>
      <div class="w1-step"><div class="n">2</div><h3>We find the ONE thing</h3><p>The single place AI would make you the most money or give you back the most time. Just one.</p></div>
      <div class="w1-step"><div class="n">3</div><h3>You leave with a plan</h3><p>What to set up, roughly what it costs and how long it takes. Do it yourself, or have us do it. Your call.</p></div>
    </div>
  </div>
</section>

<section class="w1-sec">
  <div class="container w1-narrow">
    <h2>Is this for you?</h2>
    <div class="w1-fit">
      <div class="yes"><h3>&#9989; This is for you if&hellip;</h3><ul>
        <li>You own or run a service business</li>
        <li>You're busy, and want more revenue or more time back</li>
        <li>You want a straight answer, not a 40-slide AI pitch</li>
      </ul></div>
      <div class="no"><h3>&#10060; Not for you if&hellip;</h3><ul>
        <li>You want a magic button that runs the business for you</li>
        <li>You're not willing to change anything you do today</li>
        <li>You just want to talk about AI, not use it</li>
      </ul></div>
    </div>
  </div>
</section>

<section class="w1-sec alt">
  <div class="container w1-narrow">
    <div class="w1-promise">
      <h2>Our "Straight Answer" promise</h2>
      <p>If AI isn't a fit for your business, we'll tell you. No upsell, no follow-up spam. You'll still walk away knowing the one thing worth fixing first.</p>
      <p style="margin-top:14px;color:#FFD43B;font-weight:700;">&mdash; ${site.name}</p>
    </div>
  </div>
</section>

<section class="w1-sec" id="book">
  <div class="container">
    <div class="w1-book">
      <div class="w1-cal">
        <iframe src="${cal}" title="Book your free AI consult" style="width:100%;border:none;overflow:hidden;min-height:640px;" scrolling="no" id="${b.calendarId}_book1" allow="payment"></iframe>
      </div>
      <div>
        <span class="eyebrow">Book your call</span>
        <h2 style="text-align:left;margin-bottom:12px;">Grab a time before this month's calls are gone</h2>
        <p>Free consults end when the month does:</p>
        <div class="w1-count" data-w1-count><div><b data-d>0</b><small>days</small></div><div><b data-h>0</b><small>hours</small></div><div><b data-m>0</b><small>min</small></div></div>
        <ul class="w1-pains" style="margin-bottom:20px;">
          <li style="border-left-color:var(--accent);">${b.minutes || 15} minutes, one-on-one, Zoom or phone</li>
          <li style="border-left-color:var(--accent);">Your ONE highest-value AI opportunity</li>
          <li style="border-left-color:var(--accent);">A plain-English plan you can act on</li>
        </ul>
        <p style="font-size:14px;">Rather message first? Text <a href="sms:${site.phone.replace(/[^\d+]/g, '')}">${site.phone}</a> and say "AI".</p>
      </div>
    </div>
  </div>
</section>

<section class="w1-sec alt">
  <div class="container w1-narrow w1-faq">
    <h2>Questions</h2>
    ${faq.map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join('\n    ')}
    <div style="text-align:center;">${cta()}</div>
  </div>
</section>
<div class="w1-sticky" id="w1s"><span>Free 1-on-1 AI consult &middot; this month only</span><a href="#book" class="btn btn-primary">Book My Free Consult &rarr;</a></div>
<script src="https://link.msgsndr.com/js/form_embed.js" type="text/javascript"></script>
<script>
(function () {
  var v = document.getElementById('w1v'), p = document.getElementById('w1p'), st = document.getElementById('w1s'), book = document.getElementById('book');
  var offerAt = ${Number(v.offerAt) || 0};
  function start(t) { if (!v) return; v.controls = true; if (p) p.style.display = 'none'; if (typeof t === 'number') v.currentTime = t; v.play(); }
  if (v && p) {
    p.addEventListener('click', function () { start(); });
    v.addEventListener('ended', function () { if (book) book.scrollIntoView({ behavior: 'smooth' }); });
  }
  document.querySelectorAll('.w1-chap [data-t]').forEach(function (b) { b.addEventListener('click', function () { start(Number(b.dataset.t)); }); });
  // Sticky "book" bar: shows once the training reaches the offer, or once the visitor scrolls past the video; hides at the calendar.
  var reached = false, inBook = false;
  function sync() { if (st) st.classList.toggle('on', reached && !inBook); }
  if (v) v.addEventListener('timeupdate', function () { if (!reached && offerAt && v.currentTime >= offerAt) { reached = true; sync(); } });
  if ('IntersectionObserver' in window) {
    var hero = document.querySelector('.w1-video');
    if (hero) new IntersectionObserver(function (e) { if (!e[0].isIntersecting && e[0].boundingClientRect.top < 0) { reached = true; sync(); } }).observe(hero);
    if (book) new IntersectionObserver(function (e) { inBook = e[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(book);
  }
  // Countdown to the end of this month (the offer runs "this month").
  var now = new Date(), end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  var box = document.querySelector('[data-w1-count]'), left = document.querySelector('[data-w1-left]');
  function tick() {
    var ms = Math.max(0, end - new Date()), d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
    if (box) { box.querySelector('[data-d]').textContent = d; box.querySelector('[data-h]').textContent = h; box.querySelector('[data-m]').textContent = m; }
    if (left) left.textContent = d + ' day' + (d === 1 ? '' : 's') + ' left this month';
  }
  tick(); setInterval(tick, 30000);
})();
</script>
`;
  write('book-1/index.html', layout({
    title: 'Free Training: The 4 Money Leaks AI Fixes (+ Free 1-on-1 Consult)',
    description: `Free ${mmss(v.seconds)} training: the 4 money leaks in every small business and how to find the ONE place AI pays you back. Then book a free one-on-one AI consult. This month only.`,
    canonicalPath: '/book-1/',
    bodyContent: body,
    ogImage: v.poster,
    bare: { ctaHref: '#book', ctaLabel: 'Book My Free Consult' },
  }));
}

function buildServicesIndex() {
  const body = `
${heroSection({
  eyebrow: 'Services',
  title: 'Everything it takes to grow a local service business',
  lede: 'Five services, built to work together — website, CRM, automation, custom tools, and marketing.',
  image: 'hero-home.jpg',
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / Services`,
})}
<section>
  <div class="container">
    <div class="grid grid-3">
      ${services.map(serviceCard).join('\n      ')}
    </div>
  </div>
</section>
${ctaBanner({ title: 'Not sure which service you need?', text: 'Book a free consult and we\'ll help you figure out the right starting point for your business.' })}
`;
  write('services/index.html', layout({
    title: 'Services',
    description: `AI automations, CRM build & management, custom tool building, web design, and digital marketing for local service businesses — all from ${site.name}.`,
    canonicalPath: '/services/',
    bodyContent: body,
  }));
}

function buildServiceDetail(s) {
  const idealIndustries = (s.idealFor || []).map((slug) => industryBySlug[slug]).filter(Boolean);
  const body = `
${heroSection({
  eyebrow: 'Service',
  title: s.name,
  lede: s.summary,
  image: s.image,
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / <a href="/services/">Services</a> / ${s.shortName}`,
})}
<section>
  <div class="container">
    <div class="split">
      <div>
        <h2>What's included</h2>
        <div class="feature-list">
          ${s.features.map((f) => `<div class="feature-item"><span class="feature-icon">✓</span><p>${f}</p></div>`).join('\n          ')}
        </div>
      </div>
      <div class="media">${img(s.image, s.name)}</div>
    </div>
  </div>
</section>
<section class="bg-paper">
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">How It Works</div>
      <h2>Our process</h2>
    </div>
    <div class="process-grid">
      ${s.process.map((p) => `<div class="process-step"><h4>${p.title}</h4><p>${p.detail}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>
${(idealIndustries.length || combos.some((c) => c.service.slug === s.slug)) ? `<section>
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">By Trade</div>
      <h2>${s.shortName} for your industry</h2>
    </div>
    <div class="chip-grid">
      ${(() => { const list = combos.filter((c) => c.service.slug === s.slug); return list.length
        ? list.map((c) => `<a href="${c.path}" class="chip">${c.industry.name}</a>`).join('\n      ')
        : idealIndustries.map((i) => `<a href="/industries/${i.slug}/" class="chip">${i.name}</a>`).join('\n      '); })()}
    </div>
  </div>
</section>` : ''}
<section class="bg-paper">
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">FAQ</div>
      <h2>Common questions</h2>
    </div>
    <div style="max-width:760px;">
      ${s.faq.map((f) => `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>
${s.slug === 'custom-tool-building' ? `<section>
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Proof, not promises</div>
      <h2>See what we build: RGS Tools</h2>
      <p>The same team that builds custom tools for clients built a ${softwareTotals().tools}-tool suite for running GoHighLevel agencies, and uses it every day. If you'd rather start from something that already exists, it's available on its own.</p>
    </div>
    <div class="grid grid-3">${software.tools.slice(0, 3).map(toolCard).join('')}</div>
    <div style="margin-top:28px;"><a href="/software/" class="btn btn-outline-dark">See all ${softwareTotals().tools} tools</a></div>
    <p style="margin-top:28px;"><strong>Agencies on GoHighLevel:</strong> request a custom HighLevel tool. Tell us what it should do and you get a fixed quote after a free scoping call.</p>
    <div style="margin-top:14px;"><a href="https://app.revenuegeneratingsolutions.com/custom-tools" class="btn btn-primary">Request a custom HighLevel tool</a></div>
  </div>
</section>` : ''}
${ctaBanner({ title: `Ready to talk ${s.shortName}?`, text: `Book a free consult and we'll show you exactly what ${s.shortName} would look like for your business.` })}
`;
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: s.name,
    name: `${s.name} | ${site.name}`,
    description: s.summary,
    provider: { '@type': 'ProfessionalService', name: site.name, telephone: site.phone, url: `https://${site.domain}/` },
    areaServed: site.region,
    url: `https://${site.domain}/services/${s.slug}/`,
  };
  const faqSchema = (s.faq || []).length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: s.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;
  const crumbs = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services/' },
    { name: s.shortName, path: `/services/${s.slug}/` },
  ]);
  write(`services/${s.slug}/index.html`, layout({
    title: `${s.name} for Local Service Businesses`,
    description: s.summary,
    canonicalPath: `/services/${s.slug}/`,
    bodyContent: body,
    ogImage: s.image,
    schemas: [serviceSchema, crumbs, ...(faqSchema ? [faqSchema] : [])],
  }));
}

function buildIndustriesIndex() {
  const body = `
${heroSection({
  eyebrow: 'Industries',
  title: 'Built for the trades you actually run',
  lede: "We've built websites, CRM systems, and automation for these industries — each with its own playbook for what actually moves revenue.",
  image: 'industry-masonry.jpg',
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / Industries`,
})}
<section>
  <div class="container">
    <div class="grid grid-3">
      ${industries.map(industryCard).join('\n      ')}
    </div>
  </div>
</section>
${ctaBanner({ title: "Don't see your trade listed?", text: "We work with local service businesses beyond this list too — reach out and tell us what you do." })}
`;
  write('industries/index.html', layout({
    title: 'Industries',
    description: `${site.name} builds websites, CRM systems, and automation for plumbing, electrical, HVAC, masonry, landscaping, and other local service industries.`,
    canonicalPath: '/industries/',
    bodyContent: body,
  }));
}

function buildIndustryDetail(i) {
  const relServices = (i.relevantServices || []).map((slug) => serviceBySlug[slug]).filter(Boolean);
  const body = `
${heroSection({
  eyebrow: i.name,
  title: i.heroLine,
  image: i.image,
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / <a href="/industries/">Industries</a> / ${i.name}`,
})}
<section>
  <div class="container">
    <div class="split">
      <div>
        <div class="eyebrow">The Challenge</div>
        <h2>What's costing ${i.name.toLowerCase()} businesses revenue</h2>
        <div class="pain-list">
          ${i.painPoints.map((p) => `<div class="pain-item"><span class="mark">—</span><p>${p}</p></div>`).join('\n          ')}
        </div>
      </div>
      <div class="media">${img(i.image, i.name)}</div>
    </div>
  </div>
</section>
<section class="bg-paper">
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">How We Help</div>
      <h2>Our approach for ${i.name.toLowerCase()}</h2>
    </div>
    <p style="max-width:760px;font-size:17px;color:var(--ink);">${i.howWeHelp}</p>
  </div>
</section>
${relServices.length ? `<section>
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Recommended Services</div>
      <h2>What we'd typically start with</h2>
    </div>
    <div class="grid grid-3">
      ${relServices.map((s) => { const c = comboFor(i.slug, s.slug); return c ? comboCard(c) : serviceCard(s); }).join('\n      ')}
    </div>
  </div>
</section>` : ''}
${(() => { const posts = relatedPosts({ services: i.relevantServices, industries: [i.slug] }); return posts.length ? `<section class="bg-paper">
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Guides</div>
      <h2>Articles for ${i.name.toLowerCase()} businesses</h2>
    </div>
    <div class="grid grid-3">${posts.map(blogCard).join('')}</div>
  </div>
</section>` : ''; })()}
${ctaBanner({ title: `Run a ${i.name.toLowerCase()} business?`, text: `Book a free consult and we'll show you exactly how this applies to your business.` })}
`;
  write(`industries/${i.slug}/index.html`, layout({
    title: `${i.name} Websites, CRM & Marketing`,
    description: `${i.heroLine} ${site.name} builds websites, CRM systems, and automation for ${i.name.toLowerCase()} businesses.`,
    canonicalPath: `/industries/${i.slug}/`,
    bodyContent: body,
    ogImage: i.image,
    schemas: [breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Industries', path: '/industries/' },
      { name: i.name, path: `/industries/${i.slug}/` },
    ])],
  }));
}

function buildLocationsIndex() {
  const body = `
${heroSection({
  eyebrow: 'Locations',
  title: `Serving local service businesses across ${site.region}`,
  lede: "Here's a look at some of the towns and markets we know best — with more added as our client base grows.",
  image: 'town-coastal.jpg',
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / Locations`,
})}
<section>
  <div class="container">
    <div class="grid grid-3">
      ${towns.map(townCard).join('\n      ')}
    </div>
  </div>
</section>
${ctaBanner({ title: "Outside these towns?", text: "Most of our work is done remotely — reach out and tell us where you're located." })}
`;
  write('locations/index.html', layout({
    title: 'Locations',
    description: `${site.name} serves local service businesses across ${site.region}, including ${towns.slice(0, 5).map((t) => t.name).join(', ')}, and more.`,
    canonicalPath: '/locations/',
    bodyContent: body,
  }));
}

function buildLocationDetail(t) {
  const focusIndustries = (t.focusIndustries || []).map((slug) => industryBySlug[slug]).filter(Boolean);
  const otherIndustries = industries.filter((i) => !(t.focusIndustries || []).includes(i.slug));
  const displayIndustries = [...focusIndustries, ...otherIndustries].slice(0, 8);
  const body = `
${heroSection({
  eyebrow: `${t.region}`,
  title: `Growth systems for local service businesses in ${t.name}, ${t.state}`,
  lede: t.blurb,
  image: t.image,
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / <a href="/locations/">Locations</a> / ${t.name}`,
})}
${t.featuredWork ? `<section>
  <div class="container">
    <div class="split">
      <div>
        <div class="eyebrow">What We Build in ${t.name}</div>
        <h2>The kind of work that actually moves the needle here</h2>
        <p>${t.featuredWork}</p>
        <div class="cta-row">
          <a href="/book/" class="btn btn-primary">Book a Free Consult</a>
          <a href="/services/" class="btn btn-outline-dark">See Our Services</a>
        </div>
      </div>
      <div class="media">${img(t.image, `${t.name} ${t.state} local service business project`)}</div>
    </div>
  </div>
</section>` : ''}
<section class="bg-paper">
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Serving ${t.name} & Nearby</div>
      <h2>Also covering ${t.nearby.join(', ')}</h2>
    </div>
    <p style="max-width:760px;font-size:17px;color:var(--ink);">Whether you're based in ${t.name} or one of the surrounding towns, we build the same full growth system — a website with dedicated local pages, a CRM that tracks every lead, and the automation and marketing to keep your calendar full.</p>
  </div>
</section>
<section>
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Popular in ${t.name}</div>
      <h2>Industries we work with in this area</h2>
    </div>
    <div class="chip-grid">
      ${displayIndustries.map((i) => `<a href="/industries/${i.slug}/" class="chip">${i.name}</a>`).join('\n      ')}
    </div>
  </div>
</section>
<section class="bg-paper">
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Services in ${t.name}</div>
      <h2>Pick a service to see how it works locally</h2>
    </div>
    <div class="chip-grid">
      ${services.map((s) => `<a href="/locations/${t.slug}/${s.slug}/" class="chip">${s.shortName} in ${t.name}</a>`).join('\n      ')}
    </div>
  </div>
</section>
${ctaBanner({ title: `Based in ${t.name}?`, text: 'Book a free consult and let\'s talk about what growth looks like for your business.' })}
`;
  write(`locations/${t.slug}/index.html`, layout({
    title: `Website, CRM & Marketing in ${t.name}, ${t.state}`,
    description: `${site.name} serves local service businesses in ${t.name}, ${t.state} and nearby ${t.nearby.slice(0, 2).join(' and ')} with websites, CRM systems, and marketing.`,
    canonicalPath: `/locations/${t.slug}/`,
    bodyContent: body,
    ogImage: t.image,
    schemas: [breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Locations', path: '/locations/' },
      { name: `${t.name}, ${t.state}`, path: `/locations/${t.slug}/` },
    ])],
  }));
}

function buildLocationServiceDetail(t, s) {
  const focusIndustries = (t.focusIndustries || []).map((slug) => industryBySlug[slug]).filter(Boolean);
  const overlap = focusIndustries.filter((i) => (s.idealFor || []).includes(i.slug));
  const matchedIndustries = overlap.length ? overlap : focusIndustries;
  const industryNames = matchedIndustries.map((i) => i.name.toLowerCase());
  const localAngle = matchedIndustries.length
    ? `Around ${t.name}, that most often means ${industryNames.slice(0, 3).join(', ')} businesses using it to ${s.shortName === 'AI & Automations' ? 'stop losing jobs to missed calls and slow follow-up' : s.shortName === 'CRM Build & Management' ? 'keep every lead and job tracked instead of scattered across texts and sticky notes' : s.shortName === 'Custom Tool Building' ? 'close the gaps their off-the-shelf software leaves open' : s.shortName === 'Web Design' ? 'show up first when someone searches for their trade nearby' : 'turn ad spend into booked jobs instead of just clicks'}.`
    : `We build it the same way for local service businesses throughout ${t.region} — no generic template, just the pieces your business actually needs.`;
  const otherTowns = towns.filter((ot) => ot.slug !== t.slug).slice(0, 4);
  const body = `
${heroSection({
  eyebrow: `${s.name} · ${t.name}, ${t.state}`,
  title: `${s.name} in ${t.name}, ${t.state}`,
  lede: `${s.summary} ${localAngle}`,
  image: t.image,
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / <a href="/locations/">Locations</a> / <a href="/locations/${t.slug}/">${t.name}</a> / ${s.shortName}`,
})}
<section>
  <div class="container">
    <div class="split">
      <div>
        <h2>What's included</h2>
        <div class="feature-list">
          ${s.features.map((f) => `<div class="feature-item"><span class="feature-icon">✓</span><p>${f}</p></div>`).join('\n          ')}
        </div>
      </div>
      <div class="media">${img(s.image, `${s.name} for local service businesses in ${t.name}, ${t.state}`)}</div>
    </div>
  </div>
</section>
${t.featuredWork ? `<section class="bg-paper">
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Local Context</div>
      <h2>Why this matters in ${t.name}</h2>
    </div>
    <p style="max-width:760px;font-size:17px;color:var(--ink);">${t.featuredWork}</p>
  </div>
</section>` : ''}
<section>
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Also Serving</div>
      <h2>${s.shortName} in nearby towns</h2>
    </div>
    <div class="chip-grid">
      ${otherTowns.map((ot) => `<a href="/locations/${ot.slug}/${s.slug}/" class="chip">${s.shortName} in ${ot.name}</a>`).join('\n      ')}
      <a href="/services/${s.slug}/" class="chip">${s.shortName} — full overview</a>
    </div>
  </div>
</section>
${ctaBanner({ title: `Ready for ${s.shortName} in ${t.name}?`, text: `Book a free consult and we'll show you exactly what it looks like for your business.` })}
`;
  const crumbs = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations/' },
    { name: t.name, path: `/locations/${t.slug}/` },
    { name: s.shortName, path: `/locations/${t.slug}/${s.slug}/` },
  ]);
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: s.name,
    name: `${s.name} in ${t.name}, ${t.state}`,
    description: s.summary,
    provider: { '@type': 'ProfessionalService', name: site.name, telephone: site.phone, url: `https://${site.domain}/` },
    areaServed: { '@type': 'City', name: `${t.name}, ${t.state}` },
    url: `https://${site.domain}/locations/${t.slug}/${s.slug}/`,
  };
  write(`locations/${t.slug}/${s.slug}/index.html`, layout({
    title: `${s.name} in ${t.name}, ${t.state}`,
    description: `${s.shortName} for local service businesses in ${t.name}, ${t.state}. ${s.tagline}`,
    canonicalPath: `/locations/${t.slug}/${s.slug}/`,
    bodyContent: body,
    ogImage: t.image,
    schemas: [serviceSchema, crumbs],
  }));
}

function renderBlogBody(blocks) {
  return blocks.map((b) => {
    if (b.type === 'h2') return `<h2>${b.text}</h2>`;
    if (b.type === 'p') return `<p>${b.text}</p>`;
    if (b.type === 'ul') return `<ul>${b.items.map((it) => `<li>${it}</li>`).join('')}</ul>`;
    return '';
  }).join('\n');
}

function buildBlogIndex() {
  const body = `
${heroSection({
  eyebrow: 'Blog',
  title: 'Growth, automation, and local marketing — no fluff',
  lede: 'Practical, no-hype articles on what actually moves revenue for local service businesses.',
  image: 'blog-ai-automation-saves-hours.jpg',
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / Blog`,
})}
<section>
  <div class="container">
    <div class="grid grid-3">
      ${blog.map(blogCard).join('\n      ')}
    </div>
  </div>
</section>
`;
  write('blog/index.html', layout({
    title: 'Blog',
    description: `Practical articles on AI automation, CRM systems, web design, and digital marketing for local service businesses from ${site.name}.`,
    canonicalPath: '/blog/',
    bodyContent: body,
  }));
}

function buildBlogPost(p) {
  const image = p.image || `blog-${p.slug}.jpg`;
  const relServices = (p.relatedServices || []).map((slug) => serviceBySlug[slug]).filter(Boolean);
  const relIndustries = (p.relatedIndustries || []).map((slug) => industryBySlug[slug]).filter(Boolean);
  const playbooks = [];
  relIndustries.forEach((i) => relServices.forEach((sv) => { const c = comboFor(i.slug, sv.slug); if (c) playbooks.push(c); }));
  const more = relatedPosts({ services: p.relatedServices, industries: p.relatedIndustries, exclude: p.slug });
  const dateLine = p.updated && p.updated !== p.date ? `Updated ${fmtDate(p.updated)}` : fmtDate(p.date);
  const body = `
${heroSection({
  eyebrow: p.category,
  title: escHtml(p.title),
  image,
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / <a href="/blog/">Blog</a> / ${p.category}`,
})}
<section>
  <div class="container article-wrap">
    <div class="blog-meta">${dateLine} · ${p.category}</div>
    <div class="article-body">
      ${p.md != null ? renderMd(p.md) : renderBlogBody(p.body)}
    </div>
    ${(relServices.length || relIndustries.length) ? `<hr class="divider">
    <div class="chip-grid">
      ${relServices.map((s) => `<a href="/services/${s.slug}/" class="chip">${s.shortName}</a>`).join('')}
      ${relIndustries.map((i) => `<a href="/industries/${i.slug}/" class="chip">${i.name}</a>`).join('')}
    </div>` : ''}
  </div>
</section>
${faqSection(p.faq)}
${playbooks.length ? `<section>
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Playbooks</div>
      <h2>How this works in your trade</h2>
    </div>
    <div class="grid grid-3">${playbooks.slice(0, 3).map((c) => comboCard(c, true)).join('')}</div>
  </div>
</section>` : ''}
${more.length ? `<section${playbooks.length ? ' class="bg-paper"' : ''}>
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Keep reading</div>
      <h2>Related articles</h2>
    </div>
    <div class="grid grid-3">${more.map(blogCard).join('')}</div>
  </div>
</section>` : ''}
${ctaBanner({ title: 'Want this working for your business?', text: 'Book a free consult and we\'ll show you where to start.' })}
`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    dateModified: p.updated || p.date,
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `https://${site.domain}/images/logo-square-512.png` } },
    image: `https://${site.domain}/images/${image}`,
    mainEntityOfPage: `https://${site.domain}/blog/${p.slug}/`,
  };
  const crumbs = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog/' },
    { name: p.title, path: `/blog/${p.slug}/` },
  ]);
  write(`blog/${p.slug}/index.html`, layout({
    title: p.title,
    description: p.description,
    canonicalPath: `/blog/${p.slug}/`,
    bodyContent: body,
    ogImage: image,
    ogType: 'article',
    schemas: [articleSchema, crumbs, faqSchemaFor(p.faq)].filter(Boolean),
  }));
}

function buildIndustryService(c) {
  const i = c.industry; const sv = c.service;
  const siblings = combos.filter((x) => x.industry.slug === i.slug && x !== c);
  const sameService = combos.filter((x) => x.service.slug === sv.slug && x !== c);
  const posts = relatedPosts({ services: [sv.slug], industries: [i.slug] });
  const body = `
${heroSection({
  eyebrow: `${i.name} · ${sv.shortName}`,
  title: escHtml(c.title),
  lede: escHtml(c.intro || c.description),
  image: i.image,
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / <a href="/industries/">Industries</a> / <a href="/industries/${i.slug}/">${i.name}</a> / ${sv.shortName}`,
})}
<section>
  <div class="container article-wrap">
    <div class="article-body">
      ${renderMd(c.md)}
    </div>
    <div class="cta-row" style="margin-top:28px;">
      <a href="/book/" class="btn btn-primary">Book a Free Consult</a>
      <a href="/services/${sv.slug}/" class="btn btn-outline-dark">About ${sv.shortName}</a>
    </div>
  </div>
</section>
${faqSection(c.faq)}
${siblings.length ? `<section>
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">More for ${i.name.toLowerCase()}</div>
      <h2>Other ways we help ${i.name.toLowerCase()} businesses</h2>
    </div>
    <div class="grid grid-3">${siblings.map(comboCard).join('')}</div>
  </div>
</section>` : ''}
${posts.length ? `<section class="bg-paper">
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Guides</div>
      <h2>Related articles</h2>
    </div>
    <div class="grid grid-3">${posts.map(blogCard).join('')}</div>
  </div>
</section>` : ''}
${sameService.length ? `<section>
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">${sv.shortName}</div>
      <h2>${sv.shortName} for other trades</h2>
    </div>
    <div class="chip-grid">${sameService.map((x) => `<a href="${x.path}" class="chip">${x.industry.name}</a>`).join('')}</div>
  </div>
</section>` : ''}
${ctaBanner({ title: `Run a ${i.name.toLowerCase()} business?`, text: `Book a free consult and we'll map out what ${sv.shortName} would look like for you.` })}
`;
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: sv.name,
    name: c.title,
    description: c.description,
    audience: { '@type': 'BusinessAudience', name: `${i.name} businesses` },
    provider: { '@type': 'ProfessionalService', name: site.name, telephone: site.phone, url: `https://${site.domain}/` },
    areaServed: site.region,
    url: `https://${site.domain}${c.path}`,
  };
  write(`industries/${i.slug}/${sv.slug}/index.html`, layout({
    title: c.title,
    description: c.description,
    canonicalPath: c.path,
    bodyContent: body,
    ogImage: i.image,
    schemas: [serviceSchema, breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Industries', path: '/industries/' },
      { name: i.name, path: `/industries/${i.slug}/` },
      { name: sv.shortName, path: c.path },
    ]), faqSchemaFor(c.faq)].filter(Boolean),
  }));
}


function buildSoftware() {
  const T = softwareTotals();
  const body = `
${heroSection({
  eyebrow: 'RGS Tools · Software for GoHighLevel agencies',
  title: 'Software we built for our own agency. Now it runs yours.',
  lede: `${T.tools} tools and ${T.features} features for agencies running GoHighLevel. Each tool stands alone, one login covers all of them, and pricing is per agency with unlimited sub-accounts.`,
  image: 'service-custom-tools.jpg',
  narrow: true,
  breadcrumb: '<a href="/">Home</a> / For Agencies',
})}
<div class="container">
  <div class="cta-row" style="margin-top:-48px;position:relative;z-index:2;background:#fff;padding:20px 24px;border-radius:16px;box-shadow:0 20px 50px -20px rgba(10,26,47,.2);">
    <a href="${toolsUrl('/signup?tool=bundle')}" class="btn btn-primary">Start a ${software.bundle.trialDays}-day free trial</a>
    <a href="${toolsUrl('/features')}" class="btn btn-outline-dark">See all ${T.features} features</a>
  </div>
</div>
<section>
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">The tools</div>
      <h2>${T.tools} tools. ${T.features} features. One login.</h2>
      <p>Buy only the one you need, or get every tool with the bundle. Everything connects to your whole agency in one step.</p>
    </div>
    <div class="grid grid-3">
      ${software.tools.map(toolCard).join('\n      ')}
    </div>
  </div>
</section>
<section class="bg-paper">
  <div class="container">
    <div class="split">
      <div>
        <div class="eyebrow">Why we built them</div>
        <h2>Every tool started as a problem in our own sub-accounts</h2>
        <p>We run GoHighLevel for our clients every day. The same jobs kept eating hours: hunting for field keys, building sub-accounts by hand, chasing people who never replied to a text blast, exporting call recordings, and backing up the files GHL's export leaves behind. So we built tools for each one, used them in production, and then made them available to other agencies.</p>
        <div class="feature-list" style="margin-top:24px;">
          <div class="feature-item"><span class="feature-icon">✓</span><p>One account for every tool, with one connection for your whole agency</p></div>
          <div class="feature-item"><span class="feature-icon">✓</span><p>Per-agency pricing: the price doesn't change at 3 sub-accounts or 300</p></div>
          <div class="feature-item"><span class="feature-icon">✓</span><p>${software.bundle.trialDays}-day free trial and cancel any time</p></div>
        </div>
      </div>
      <div class="software-icons light">${software.tools.map((t) => `<a href="${toolHref(t)}" title="${t.name}">${toolGlyph(t, 'lg')}<span>${t.name}</span></a>`).join('')}</div>
    </div>
  </div>
</section>
<section>
  <div class="container">
    <div class="cta-banner">
      <h2>Every tool for $${software.bundle.monthly}/month</h2>
      <p>All ${T.tools} tools and everything we release next, instead of $${T.sum}/month bought one by one. ${software.bundle.trialDays} days free.</p>
      <div class="cta-row">
        <a href="${toolsUrl('/signup?tool=bundle')}" class="btn btn-primary">Start the bundle free</a>
        <a href="${toolsUrl('/blog')}" class="btn btn-outline">Read the GoHighLevel guides</a>
      </div>
    </div>
  </div>
</section>
<section class="bg-paper">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Need something these don't do?</div>
      <h2>We build custom tools too</h2>
      <p>RGS Tools came out of our <a href="/services/custom-tool-building/">custom tool building</a> work. If your agency or business needs something specific, we can build it.</p>
    </div>
    <div style="text-align:center;"><a href="/services/custom-tool-building/" class="btn btn-outline-dark">Custom Tool Building</a></div>
  </div>
</section>
`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'RGS Tools for GoHighLevel agencies',
    itemListElement: software.tools.map((t, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'SoftwareApplication', name: `RGS ${t.name}`, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: t.tagline, url: toolHref(t), offers: { '@type': 'Offer', price: String(t.monthly), priceCurrency: 'USD' } },
    })),
  };
  write('software/index.html', layout({
    title: 'RGS Tools: Software for GoHighLevel Agencies',
    description: `${T.tools} tools and ${T.features} features for GoHighLevel agencies, built and used by Revenue Generating Solutions. Per agency, unlimited sub-accounts, ${software.bundle.trialDays}-day free trial.`,
    canonicalPath: '/software/',
    bodyContent: body,
    ogImage: 'service-custom-tools.jpg',
    schemas: [schema, breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'For Agencies', path: '/software/' }])],
  }));
}

function build404() {
  const body = `
<section style="padding:140px 0;text-align:center;">
  <div class="container">
    <div class="eyebrow" style="justify-content:center;">404</div>
    <h1>Page not found</h1>
    <p style="max-width:480px;margin:0 auto 28px;">The page you're looking for doesn't exist or may have moved.</p>
    <a href="/" class="btn btn-primary">Back to Home</a>
  </div>
</section>`;
  write('404.html', layout({
    title: 'Page Not Found',
    description: 'Page not found.',
    canonicalPath: '/404.html',
    bodyContent: body,
  }));
}

function buildSitemap() {
  const urls = ['/', '/about/', '/book/', '/contact/', '/services/', '/industries/', '/locations/', '/blog/', '/software/'];
  services.forEach((s) => urls.push(`/services/${s.slug}/`));
  industries.forEach((i) => urls.push(`/industries/${i.slug}/`));
  towns.forEach((t) => urls.push(`/locations/${t.slug}/`));
  towns.forEach((t) => services.forEach((s) => urls.push(`/locations/${t.slug}/${s.slug}/`)));
  combos.forEach((c) => urls.push(c.path));
  blog.forEach((p) => urls.push(`/blog/${p.slug}/`));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>https://${site.domain}${u}</loc></url>`).join('\n')}
</urlset>`;
  write('sitemap.xml', xml);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: https://${site.domain}/sitemap.xml\n`);
}

// Favicon and touch-icon are static files (public/images/favicon-64.png,
// apple-touch-icon.png) generated from the real logo — see branding/ for
// the source-processing script. Nothing to build here.

function buildJs() {
  const js = `// Minimal, dependency-free site JS
(function () {
  // Contact form: no backend wired up yet, so hand off to email with a prefilled message.
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var subject = encodeURIComponent('New inquiry from ' + (data.get('business') || data.get('name')));
      var body = encodeURIComponent(
        'Name: ' + data.get('name') + '\\n' +
        'Business: ' + data.get('business') + '\\n' +
        'Email: ' + data.get('email') + '\\n' +
        'Phone: ' + (data.get('phone') || '') + '\\n\\n' +
        (data.get('message') || '')
      );
      window.location.href = 'mailto:${site.email}?subject=' + subject + '&body=' + body;
      var note = document.getElementById('contact-form-note');
      if (note) note.textContent = "Opening your email app to send this — or call/text us directly at ${site.phone}.";
    });
  }

  // Mobile nav toggle
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    document.querySelectorAll('.mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
`;
  write('js/main.js', js);
}

function run() {
  buildHome();
  buildAbout();
  buildContact();
  buildBook();
  buildBook1();
  buildServicesIndex();
  services.forEach(buildServiceDetail);
  buildIndustriesIndex();
  industries.forEach(buildIndustryDetail);
  combos.forEach(buildIndustryService);
  buildLocationsIndex();
  towns.forEach(buildLocationDetail);
  towns.forEach((t) => services.forEach((s) => buildLocationServiceDetail(t, s)));
  buildBlogIndex();
  blog.forEach(buildBlogPost);
  buildSoftware();
  build404();
  buildSitemap();
  buildJs();

  const pageCount = 10 + services.length + industries.length + towns.length + blog.length + combos.length + (towns.length * services.length);
  console.log(`[generate-site] Built ${pageCount} pages into /public`);
}

run();
