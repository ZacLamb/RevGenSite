/**
 * Revenue Generating Solutions — site server.
 * Serves the pre-generated /public directory (built by scripts/generate-site.js), plus first-party
 * visitor analytics: tracking, /dashboard, form capture at /api/lead and booking-intent events.
 */

const express = require('express');
const path = require('path');
const analytics = require('./lib/analytics');
const { render } = require('./lib/dashboard');
const siteCfg = require('./lib/site-config');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
app.set('trust proxy', true); // Railway terminates TLS; lets the cookie get the Secure flag

// Tracking comes before the page routes so every page view is seen.
analytics.mount(app, { ...siteCfg, render: (s, sent, storage) => render(siteCfg, s, sent, storage) });

// Contact form. Records the lead, ties this browser's visits to them, and forwards to GoHighLevel.
app.post('/api/lead', express.json({ limit: '16kb' }), async (req, res) => {
  const b = req.body || {};
  const clean = (v, n = 500) => String(v == null ? '' : v).trim().slice(0, n);
  if (b.website) return res.json({ ok: true }); // honeypot
  const lead = {
    name: clean(b.name, 120), business: clean(b.business, 160), email: clean(b.email, 254),
    phone: clean(b.phone, 40), message: clean(b.message, 2000), page: clean(b.page, 200),
    source: 'revenuegeneratingsolutions.com', submitted_at: new Date().toISOString(),
  };
  if (!lead.name || (!lead.email && !lead.phone)) return res.status(400).json({ ok: false, error: 'Name and an email or phone are required.' });
  let linked = null;
  try {
    linked = await analytics.linkLead(req, lead); // ties this browser to the lead for return alerts
    lead.traffic_source = linked ? linked.first_source : 'Direct';
  } catch (e) {
    console.error('[lead] analytics link failed', e.message);
    lead.traffic_source = 'Direct';
  }
  console.log('[lead]', JSON.stringify({ ...lead, message: lead.message.slice(0, 80) }));
  const jobs = [];
  if (process.env.LEAD_WEBHOOK_URL) {
    jobs.push(fetch(process.env.LEAD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); })
      .catch((e) => console.error('[lead] webhook failed', e.message)));
  }
  jobs.push(analytics.newLeadAlert(lead, lead.traffic_source).catch((e) => console.error('[lead] alert failed', e.message)));
  await Promise.all(jobs);
  res.json({ ok: true });
});

app.use(express.static(PUBLIC_DIR, {
  extensions: ['html'],
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      // private + revalidate: the tracker sets a per-visitor cookie, and every page view should reach the server.
      res.setHeader('Cache-Control', 'private, no-cache');
    } else if (filePath.includes(`${path.sep}images${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  },
}));

app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Revenue Generating Solutions site running on port ${PORT}`);
});
