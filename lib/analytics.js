// First-party visitor tracking, owner dashboard, returning-lead alerts and daily digest.
// No third-party scripts, no IP addresses stored. A visitor is an anonymous random ID
// (first-party cookie) until they submit the form — then their visits are tied to their name.
const crypto = require('crypto');
const store = require('./store');

const TZ = process.env.SITE_TZ || 'America/New_York';
const SESSION_GAP_MS = 30 * 60 * 1000; // 30 min of inactivity = new visit
const ALERT_COOLDOWN_MS = Number(process.env.ALERT_COOLDOWN_HOURS || 6) * 3600 * 1000;
const ALERT_DELAY_MS = Number(process.env.ALERT_DELAY_MINUTES || 3) * 60 * 1000; // gather pages before alerting
const DIGEST_HOUR = Number(process.env.DIGEST_HOUR || 7); // local hour for the daily email
const COOKIE = 'sa_vid';
const OWNER_COOKIE = 'sa_owner';

const BOT_RE = /bot|crawl|spider|slurp|preview|monitor|uptime|curl|wget|python|node-fetch|axios|go-http|java\/|headless|lighthouse|pagespeed|facebookexternalhit|whatsapp|semrush|ahrefs|bingpreview|google-inspectiontool/i;
const SKIP_RE = /^\/(dashboard|api\/|healthz|robots\.txt|sitemap\.xml|favicon|apple-touch|css\/|js\/|img\/|images\/|fonts\/|ui\/)/;

let site = null; // set by mount(): { name, short, url, labelFor(path), groupOf(path), townOf(path), render(stats, sent) }

// ---------- helpers ----------
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function setCookie(res, req, name, value, maxAgeSec) {
  const secure = req.secure ? '; Secure' : '';
  res.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSec}; Path=/; SameSite=Lax; HttpOnly${secure}`);
}
function deviceOf(ua) {
  if (/ipad|tablet/i.test(ua)) return 'Tablet';
  if (/mobi|iphone|android/i.test(ua)) return 'Mobile';
  return 'Desktop';
}
function sourceOf(req) {
  const u = new URL(req.originalUrl, 'http://x');
  const p = u.searchParams;
  if (p.get('gclid') || p.get('gbraid') || p.get('wbraid')) return 'Google Ads';
  if (p.get('fbclid')) return 'Facebook';
  if (p.get('utm_source')) {
    const s = p.get('utm_source');
    if (/chatgpt|openai|perplexity|claude|gemini|copilot/i.test(s)) return 'AI assistants';
    const m = p.get('utm_medium');
    return m ? `${s} / ${m}` : s;
  }
  const ref = req.get('referer');
  if (!ref) return 'Direct';
  let host;
  try {
    host = new URL(ref).hostname.replace(/^www\./, '');
  } catch (e) {
    return 'Direct';
  }
  if (host === (req.hostname || '').replace(/^www\./, '')) return null; // internal click
  if (/google\./.test(host)) return 'Google';
  if (/bing\.com/.test(host)) return 'Bing';
  if (/yahoo\./.test(host)) return 'Yahoo';
  if (/duckduckgo/.test(host)) return 'DuckDuckGo';
  if (/facebook|fb\.com|instagram|l\.messenger/.test(host)) return 'Facebook';
  if (/linkedin|lnkd\.in/.test(host)) return 'LinkedIn';
  if (/chatgpt|openai|perplexity|claude\.ai|gemini|copilot\.microsoft|you\.com/.test(host)) return 'AI assistants';
  return host;
}
function fmtTime(d) {
  return new Date(d).toLocaleString('en-US', { timeZone: TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function dayKey(d) {
  return new Date(d).toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
}
function startOfLocalDay(daysAgo = 0) {
  // midnight in TZ, daysAgo days back, as a Date
  const now = new Date();
  const local = new Date(now.toLocaleString('en-US', { timeZone: TZ }));
  const offset = now.getTime() - local.getTime();
  local.setHours(0, 0, 0, 0);
  local.setDate(local.getDate() - daysAgo);
  return new Date(local.getTime() + offset);
}

const labelFor = (p) => (site && site.labelFor ? site.labelFor(p) : p);
const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- alerts ----------
async function sendAlert(payload) {
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) {
    console.log('[analytics] alert (no ALERT_WEBHOOK_URL set):', payload.subject);
    return false;
  }
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return true;
  } catch (e) {
    console.error('[analytics] alert failed', e.message);
    return false;
  }
}

const pendingAlerts = new Map(); // vid -> timeout
async function scheduleReturnAlert(lead, sid) {
  if (pendingAlerts.has(lead.vid)) return;
  if (lead.last_alert && Date.now() - new Date(lead.last_alert).getTime() < ALERT_COOLDOWN_MS) return;
  await store.markAlerted(lead.vid, new Date()); // claim it now so we never double-alert
  const t = setTimeout(async () => {
    pendingAlerts.delete(lead.vid);
    try {
      const views = await store.sessionViews(sid);
      const pages = [...new Set(views.map((v) => labelFor(v.path)))];
      const since = Math.round((Date.now() - new Date(lead.created_at).getTime()) / 864e5);
      const name = lead.name || 'A past lead';
      const booked = (await store.eventsSince(new Date(Date.now() - 36e5))).some((e) => e.vid === lead.vid && e.kind === 'booking_intent');
      const subject = `${name} is back on the website`;
      const lines = [
        `${name} just came back to the ${site.short} website.`,
        '',
        `Pages viewed this visit: ${pages.join(', ')}`,
        ...(booked ? ['They clicked to book a call.'] : []),
        `Phone: ${lead.phone || '-'}`,
        `Email: ${lead.email || '-'}`,
        `Business: ${lead.business || '-'}${lead.town ? '  |  Town: ' + lead.town : ''}`,
        `Found us via: ${lead.first_source || 'Direct'}`,
        `First reached out ${since === 0 ? 'today' : since + ' day(s) ago'}.`,
        '',
        'Good time to call or text them.',
      ];
      await sendAlert({
        type: 'returning_lead',
        subject,
        body: lines.join('\n'),
        body_html: lines.map((l) => (l ? esc(l) : '&nbsp;')).join('<br>'),
        lead_name: name,
        lead_phone: lead.phone || '',
        lead_email: lead.email || '',
        pages: pages.join(', '),
      });
    } catch (e) {
      console.error('[analytics] return alert error', e.message);
    }
  }, ALERT_DELAY_MS);
  pendingAlerts.set(lead.vid, t);
}

// ---------- tracking middleware ----------
function track() {
  return async (req, res, next) => {
    try {
      if (req.method !== 'GET' || SKIP_RE.test(req.path) || /\.[a-z0-9]{2,5}$/i.test(req.path)) return next();
      const ua = req.get('user-agent') || '';
      if (!ua || BOT_RE.test(ua)) return next();
      const cookies = parseCookies(req);
      if (cookies[OWNER_COOKIE]) return next(); // owner's own browsing isn't counted
      let vid = cookies[COOKIE];
      if (!vid || !/^[a-f0-9]{24}$/.test(vid)) {
        vid = crypto.randomBytes(12).toString('hex');
      }
      setCookie(res, req, COOKIE, vid, 365 * 86400);
      req.visitorId = vid;

      // record after the response so pages are never slowed down
      res.on('finish', async () => {
        if (res.statusCode >= 400) return;
        try {
          const now = new Date();
          const last = await store.lastView(vid);
          const newSession = !last || now - new Date(last.ts) > SESSION_GAP_MS;
          const sid = newSession ? crypto.randomBytes(8).toString('hex') : last.sid;
          const src = sourceOf(req);
          const source = newSession ? src || 'Direct' : src || last.source;
          await store.insertView({ vid, sid, path: req.path, source, device: deviceOf(ua), ts: now });
          if (newSession && last) {
            const lead = await store.leadByVid(vid);
            if (lead) scheduleReturnAlert(lead, sid);
          }
        } catch (e) {
          console.error('[analytics] track error', e.message);
        }
      });
    } catch (e) {
      console.error('[analytics] middleware error', e.message);
    }
    next();
  };
}

// Called from the lead form handler: ties this browser to the person who submitted
async function linkLead(req, lead) {
  const vid = req.visitorId || parseCookies(req)[COOKIE];
  if (!vid) return null;
  const first = await store.firstView(vid);
  const record = {
    vid,
    name: lead.name || [lead.first_name, lead.last_name].filter(Boolean).join(' '),
    phone: lead.phone,
    email: lead.email,
    business: lead.business,
    town: lead.town,
    size: lead.service,
    message: lead.message,
    first_source: first ? first.source : 'Direct',
    created_at: new Date(),
  };
  await store.upsertLead(record);
  return record;
}

// ---------- stats ----------
async function stats(days) {
  const since = startOfLocalDay(days - 1);
  const views = await store.viewsSince(since);
  const leads = await store.leads();
  const events = (await store.eventsSince(since)).filter((e) => e.kind === 'booking_intent');
  const intentVids = new Set(events.map((e) => e.vid));
  const leadByVid = Object.fromEntries(leads.map((l) => [l.vid, l]));
  const count = (arr, key) => {
    const m = new Map();
    arr.forEach((x) => {
      const k = key(x);
      if (k != null) m.set(k, (m.get(k) || 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const sessions = new Map();
  views.forEach((v) => {
    if (!sessions.has(v.sid)) sessions.set(v.sid, v); // views are newest-first; overwritten below
  });
  // entry view (oldest) per session for source attribution
  const entry = new Map();
  for (let i = views.length - 1; i >= 0; i--) if (!entry.has(views[i].sid)) entry.set(views[i].sid, views[i]);

  const byDay = new Map();
  for (let i = days - 1; i >= 0; i--) byDay.set(dayKey(startOfLocalDay(i).getTime() + 12 * 3600e3), { visits: new Set(), views: 0 });
  views.forEach((v) => {
    const d = byDay.get(dayKey(v.ts));
    if (d) {
      d.views++;
      d.visits.add(v.sid);
    }
  });

  const leadsInRange = leads.filter((l) => new Date(l.created_at) >= since);
  const returningLeadVisits = [...entry.values()].filter((e) => {
    const l = leadByVid[e.vid];
    return l && new Date(e.ts) > new Date(l.created_at);
  });
  const uniq = new Set(views.map((v) => v.vid)).size;

  // per-lead visit counts (all time within the window)
  const leadVisits = {};
  [...entry.values()].forEach((e) => {
    if (leadByVid[e.vid]) leadVisits[e.vid] = (leadVisits[e.vid] || 0) + 1;
  });
  const lastSeen = {};
  views.forEach((v) => {
    if (!lastSeen[v.vid]) lastSeen[v.vid] = v.ts;
  });

  // recent feed: group by session
  const feed = [];
  const seen = new Set();
  for (const v of views) {
    if (seen.has(v.sid)) continue;
    seen.add(v.sid);
    const sv = views.filter((x) => x.sid === v.sid).reverse();
    const lead = leadByVid[v.vid];
    feed.push({
      who: lead ? lead.name || 'Lead' : 'Visitor ' + v.vid.slice(0, 5).toUpperCase(),
      isLead: !!lead,
      when: fmtTime(sv[0].ts),
      source: entry.get(v.sid).source,
      device: v.device,
      pages: sv.map((x) => labelFor(x.path)),
      intent: events.some((e) => e.sid === v.sid),
    });
    if (feed.length >= 40) break;
  }

  return {
    days,
    tz: TZ,
    storage: store.kind,
    totals: {
      visits: sessions.size,
      visitors: uniq,
      views: views.length,
      leads: leadsInRange.length,
      conversion: uniq ? ((leadsInRange.length / uniq) * 100).toFixed(1) : '0.0',
      returning: returningLeadVisits.length,
      booking: intentVids.size,
    },
    daily: [...byDay.entries()].map(([d, o]) => ({ day: d, visits: o.visits.size, views: o.views })),
    pages: count(views, (v) => labelFor(v.path)).slice(0, 12),
    groups: count(views, (v) => (site.groupOf ? site.groupOf(v.path) : 'Pages')),
    towns: count(views, (v) => (site.townOf ? site.townOf(v.path) : null)).slice(0, 12),
    sources: count([...entry.values()], (v) => v.source || 'Direct').slice(0, 10),
    devices: count([...entry.values()], (v) => v.device),
    feed,
    leads: leads.slice(0, 50).map((l) => ({
      name: l.name,
      phone: l.phone,
      email: l.email,
      business: l.business,
      intent: intentVids.has(l.vid),
      source: l.first_source,
      created: fmtTime(l.created_at),
      visits: leadVisits[l.vid] || 0,
      lastSeen: lastSeen[l.vid] ? fmtTime(lastSeen[l.vid]) : '—',
    })),
  };
}

// ---------- daily digest ----------
async function sendDigest(force) {
  const today = dayKey(new Date());
  if (!force && (await store.getSetting('last_digest')) === today) return false;
  const from = startOfLocalDay(1);
  const to = startOfLocalDay(0);
  const views = (await store.viewsSince(from)).filter((v) => new Date(v.ts) < to);
  const leads = await store.leads();
  const leadByVid = Object.fromEntries(leads.map((l) => [l.vid, l]));
  const newLeads = leads.filter((l) => new Date(l.created_at) >= from && new Date(l.created_at) < to);
  const sessions = new Map();
  for (let i = views.length - 1; i >= 0; i--) if (!sessions.has(views[i].sid)) sessions.set(views[i].sid, views[i]);
  const returning = [...new Set([...sessions.values()].filter((e) => leadByVid[e.vid] && new Date(e.ts) > new Date(leadByVid[e.vid].created_at)).map((e) => leadByVid[e.vid].name || 'Lead'))];
  const tally = (arr, key) => {
    const m = new Map();
    arr.forEach((x) => m.set(key(x), (m.get(key(x)) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  };
  const topPages = tally(views, (v) => labelFor(v.path));
  const topSources = tally([...sessions.values()], (v) => v.source || 'Direct');
  const dayLabel = from.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long', month: 'short', day: 'numeric' });
  const base = (site && site.url) || '';
  const lines = [
    `${site.short} website — ${dayLabel}`,
    '',
    `Visits: ${sessions.size}   |   Unique visitors: ${new Set(views.map((v) => v.vid)).size}   |   Page views: ${views.length}`,
    `New leads from the website: ${newLeads.length}${newLeads.length ? ' — ' + newLeads.map((l) => `${l.name}${l.business ? ' (' + l.business + ')' : ''}`).join(', ') : ''}`,
    `Past leads who came back: ${returning.length ? returning.join(', ') : 'none'}`,
    '',
    'Top pages:',
    ...(topPages.length ? topPages.map(([k, n]) => `  • ${k} — ${n}`) : ['  • no visits']),
    '',
    'Where visitors came from:',
    ...(topSources.length ? topSources.map(([k, n]) => `  • ${k} — ${n}`) : ['  • no visits']),
    '',
    `Full dashboard: ${base}/dashboard`,
  ];
  const ok = await sendAlert({
    type: 'daily_digest',
    subject: `${site.short} website: ${sessions.size} visits, ${newLeads.length} new lead${newLeads.length === 1 ? '' : 's'} yesterday`,
    lead_name: '', lead_phone: '', lead_email: '', pages: topPages.map(([k]) => k).join(', '),
    body: lines.join('\n'),
    body_html: lines.map((l) => (l ? esc(l).replace(/^ {2}/, '&nbsp;&nbsp;') : '&nbsp;')).join('<br>'),
  });
  if (ok || !process.env.ALERT_WEBHOOK_URL) await store.setSetting('last_digest', today);
  return ok;
}

function startDigestScheduler() {
  if (process.env.DIGEST_ENABLED === 'false') return;
  const tick = async () => {
    try {
      const hour = Number(new Date().toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hour12: false }));
      if (hour >= DIGEST_HOUR) await sendDigest(false);
    } catch (e) {
      console.error('[analytics] digest error', e.message);
    }
  };
  setTimeout(tick, 60 * 1000);
  setInterval(tick, 10 * 60 * 1000);
}

// ---------- dashboard auth ----------
function requireOwner(req, res, next) {
  const pass = process.env.DASHBOARD_PASSWORD;
  if (!pass) return res.status(503).type('text').send('Dashboard is off: set DASHBOARD_PASSWORD in Railway variables.');
  const [type, cred] = (req.get('authorization') || '').split(' ');
  if (type === 'Basic' && cred) {
    const [u, p] = Buffer.from(cred, 'base64').toString().split(':');
    const user = process.env.DASHBOARD_USER || 'owner';
    const ok =
      u === user &&
      p.length === pass.length &&
      crypto.timingSafeEqual(Buffer.from(p), Buffer.from(pass));
    if (ok) {
      setCookie(res, req, OWNER_COOKIE, '1', 365 * 86400); // stop counting the owner's own visits
      return next();
    }
  }
  res.set('WWW-Authenticate', 'Basic realm="Website dashboard"').status(401).send('Login required');
}

// ---------- mount ----------
function mount(app, siteData) {
  site = siteData;
  const json = require('express').json({ limit: '4kb' });
  const ready = store.init().catch((e) => console.error('[analytics] store init failed', e.message));
  app.use(async (req, res, next) => {
    await ready;
    next();
  });
  app.use(track());
  app.get('/dashboard', requireOwner, async (req, res) => {
    const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 7;
    res.set('Cache-Control', 'no-store').set('X-Robots-Tag', 'noindex');
    res.type('html').send(site.render(await stats(days), req.query.sent, store.kind));
  });
  app.get('/dashboard/data.json', requireOwner, async (req, res) => {
    res.set('Cache-Control', 'no-store').json(await stats(Number(req.query.days) || 7));
  });
  app.post('/dashboard/send-digest', requireOwner, async (req, res) => {
    const ok = await sendDigest(true);
    res.redirect('/dashboard?sent=' + (ok ? '1' : '0'));
  });
  // Booking CTA clicks. The GHL calendar is an embedded widget we can't see into, so the click is the signal.
  app.post('/api/event', json, async (req, res) => {
    res.status(204).end();
    try {
      const vid = parseCookies(req)[COOKIE];
      if (!vid || !/^[a-f0-9]{24}$/.test(vid) || parseCookies(req)[OWNER_COOKIE]) return;
      const kind = req.body && req.body.kind === 'booking_intent' ? 'booking_intent' : null;
      if (!kind) return;
      const p = String((req.body && req.body.path) || '/').split('?')[0].slice(0, 200);
      const last = await store.lastView(vid);
      const recent = (await store.eventsSince(new Date(Date.now() - 10 * 60 * 1000))).some((e) => e.vid === vid && e.kind === kind && e.path === p);
      if (recent) return;
      await store.insertEvent({ vid, sid: last ? last.sid : null, kind, path: p, ts: new Date() });
    } catch (e) {
      console.error('[analytics] event error', e.message);
    }
  });
  ready.then(() => {
    startDigestScheduler();
    console.log(`[analytics] ready (${store.kind} storage)`);
  });
}

// Instant heads-up when someone submits the form (the form used to only open the visitor's email app).
async function newLeadAlert(lead, source) {
  const lines = [`New website lead: ${lead.name || '-'}`, `Business: ${lead.business || '-'}`, `Phone: ${lead.phone || '-'}`, `Email: ${lead.email || '-'}`, `Found us via: ${source || 'Direct'}`, '', lead.message || ''];
  return sendAlert({ type: 'new_lead', subject: `New lead: ${lead.name || 'website visitor'}${lead.business ? ' (' + lead.business + ')' : ''}`, body: lines.join('\n'), body_html: lines.map((l) => (l ? esc(l) : '&nbsp;')).join('<br>'), lead_name: lead.name || '', lead_phone: lead.phone || '', lead_email: lead.email || '', pages: '' });
}

module.exports = { mount, linkLead, newLeadAlert, esc };
