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
const blog = JSON.parse(fs.readFileSync(path.join(DATA, 'blog.json'), 'utf8'));

const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
const industryBySlug = Object.fromEntries(industries.map((i) => [i.slug, i]));

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

// ---------- layout ----------

function layout({ title, description, canonicalPath, bodyContent, ogImage }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} — ${site.tagline}`;
  const ogImg = `https://${site.domain}/images/${ogImage || 'og-image.jpg'}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="https://${site.domain}${canonicalPath}">
<meta property="og:type" content="website">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${ogImg}">
<meta property="og:url" content="https://${site.domain}${canonicalPath}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/images/favicon-64.png" type="image/png">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
${header()}
${bodyContent}
${footer()}
<script src="/js/main.js"></script>
</body>
</html>`;
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
      <a href="/contact/" class="btn btn-primary" style="padding:11px 20px;font-size:14px;">Get a Free Consult</a>
    </div>
  </div>
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
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/contact/">Contact</a></li>
          <li><a href="tel:${site.phone.replace(/[^\d+]/g, '')}">${site.phone}</a></li>
          <li><a href="mailto:${site.email}">${site.email}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${YEAR} ${site.name}. All rights reserved.</span>
      <span>${site.address.line1}, ${site.address.city}, ${site.address.state} ${site.address.zip}</span>
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
        <a href="${primaryHref || '/contact/'}" class="btn btn-primary">${primaryLabel || 'Book a Free Consult'}</a>
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
      <h3 style="margin-top:12px;">${p.title}</h3>
      <p>${p.description}</p>
      <span class="card-link">Read the article</span>
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
    <a href="/contact/" class="btn btn-primary">Get a Free Consult</a>
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
            <div class="feature-item"><span class="feature-icon">📍</span><p>${site.address.line1}<br>${site.address.city}, ${site.address.state} ${site.address.zip}</p></div>
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
${idealIndustries.length ? `<section>
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Great Fit For</div>
      <h2>Industries where this service pays off fastest</h2>
    </div>
    <div class="chip-grid">
      ${idealIndustries.map((i) => `<a href="/industries/${i.slug}/" class="chip">${i.name}</a>`).join('\n      ')}
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
${ctaBanner({ title: `Ready to talk ${s.shortName}?`, text: `Book a free consult and we'll show you exactly what ${s.shortName} would look like for your business.` })}
`;
  write(`services/${s.slug}/index.html`, layout({
    title: s.name,
    description: s.summary,
    canonicalPath: `/services/${s.slug}/`,
    bodyContent: body,
    ogImage: s.image,
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
      ${relServices.map(serviceCard).join('\n      ')}
    </div>
  </div>
</section>` : ''}
${ctaBanner({ title: `Run a ${i.name.toLowerCase()} business?`, text: `Book a free consult and we'll show you exactly how this applies to your business.` })}
`;
  write(`industries/${i.slug}/index.html`, layout({
    title: i.name,
    description: `${i.heroLine} ${site.name} builds websites, CRM systems, and automation for ${i.name.toLowerCase()} businesses.`,
    canonicalPath: `/industries/${i.slug}/`,
    bodyContent: body,
    ogImage: i.image,
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
  const body = `
${heroSection({
  eyebrow: `${t.region}`,
  title: `Growth systems for local service businesses in ${t.name}, ${t.state}`,
  lede: t.blurb,
  image: t.image,
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / <a href="/locations/">Locations</a> / ${t.name}`,
})}
<section>
  <div class="container">
    <div class="split">
      <div>
        <div class="eyebrow">Serving ${t.name} & Nearby</div>
        <h2>Also covering ${t.nearby.join(', ')}</h2>
        <p>Whether you're based in ${t.name} or one of the surrounding towns, we build the same full growth system — a website with dedicated local pages, a CRM that tracks every lead, and the automation and marketing to keep your calendar full.</p>
        <div class="cta-row">
          <a href="/contact/" class="btn btn-primary">Get a Free Consult</a>
          <a href="/services/" class="btn btn-outline-dark">See Our Services</a>
        </div>
      </div>
      <div class="media">${img(t.image, t.name)}</div>
    </div>
  </div>
</section>
<section class="bg-paper">
  <div class="container">
    <div class="section-head left">
      <div class="eyebrow">Popular in ${t.name}</div>
      <h2>Industries we work with in this area</h2>
    </div>
    <div class="chip-grid">
      ${industries.slice(0, 8).map((i) => `<a href="/industries/${i.slug}/" class="chip">${i.name}</a>`).join('\n      ')}
    </div>
  </div>
</section>
${ctaBanner({ title: `Based in ${t.name}?`, text: 'Book a free consult and let\'s talk about what growth looks like for your business.' })}
`;
  write(`locations/${t.slug}/index.html`, layout({
    title: `${t.name}, ${t.state}`,
    description: `${site.name} serves local service businesses in ${t.name}, ${t.state} and nearby ${t.nearby.slice(0, 2).join(' and ')} with websites, CRM systems, and marketing.`,
    canonicalPath: `/locations/${t.slug}/`,
    bodyContent: body,
    ogImage: t.image,
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
  const body = `
${heroSection({
  eyebrow: p.category,
  title: p.title,
  image,
  narrow: true,
  breadcrumb: `<a href="/">Home</a> / <a href="/blog/">Blog</a> / ${p.category}`,
})}
<section>
  <div class="container article-wrap">
    <div class="blog-meta">${fmtDate(p.date)} · ${p.category}</div>
    <div class="article-body">
      ${renderBlogBody(p.body)}
    </div>
    ${(relServices.length || relIndustries.length) ? `<hr class="divider">
    <div class="chip-grid">
      ${relServices.map((s) => `<a href="/services/${s.slug}/" class="chip">${s.shortName}</a>`).join('')}
      ${relIndustries.map((i) => `<a href="/industries/${i.slug}/" class="chip">${i.name}</a>`).join('')}
    </div>` : ''}
  </div>
</section>
${ctaBanner({ title: 'Want this working for your business?', text: 'Book a free consult and we\'ll show you where to start.' })}
`;
  write(`blog/${p.slug}/index.html`, layout({
    title: p.title,
    description: p.description,
    canonicalPath: `/blog/${p.slug}/`,
    bodyContent: body,
    ogImage: image,
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
  const urls = ['/', '/about/', '/contact/', '/services/', '/industries/', '/locations/', '/blog/'];
  services.forEach((s) => urls.push(`/services/${s.slug}/`));
  industries.forEach((i) => urls.push(`/industries/${i.slug}/`));
  towns.forEach((t) => urls.push(`/locations/${t.slug}/`));
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
})();
`;
  write('js/main.js', js);
}

function run() {
  buildHome();
  buildAbout();
  buildContact();
  buildServicesIndex();
  services.forEach(buildServiceDetail);
  buildIndustriesIndex();
  industries.forEach(buildIndustryDetail);
  buildLocationsIndex();
  towns.forEach(buildLocationDetail);
  buildBlogIndex();
  blog.forEach(buildBlogPost);
  build404();
  buildSitemap();
  buildJs();

  const pageCount = 7 + services.length + industries.length + towns.length + blog.length;
  console.log(`[generate-site] Built ${pageCount} pages into /public`);
}

run();
