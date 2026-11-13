// Visitor analytics storage (ported from dumpdogs, plus booking-intent events).
// Uses Postgres when DATABASE_URL is set (recommended — survives redeploys).
// Otherwise falls back to a JSON file (DATA_DIR, default ./.data) — fine for testing,
// but it resets on every Railway redeploy unless DATA_DIR points at a Railway volume.
const fs = require('fs');
const path = require('path');

const KEEP_DAYS = 180;

function pgStore() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: /railway\.internal|localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false },
    max: 5,
  });
  const q = (text, params) => pool.query(text, params);
  return {
    kind: 'postgres',
    async init() {
      await q(`CREATE TABLE IF NOT EXISTS sa_views (
        id BIGSERIAL PRIMARY KEY, vid TEXT NOT NULL, sid TEXT NOT NULL, path TEXT NOT NULL,
        source TEXT, device TEXT, ts TIMESTAMPTZ NOT NULL DEFAULT now())`);
      await q(`CREATE INDEX IF NOT EXISTS sa_views_ts ON sa_views (ts)`);
      await q(`CREATE INDEX IF NOT EXISTS sa_views_vid ON sa_views (vid, ts)`);
      await q(`CREATE TABLE IF NOT EXISTS sa_leads (
        vid TEXT PRIMARY KEY, name TEXT, phone TEXT, email TEXT, town TEXT, size TEXT, message TEXT,
        first_source TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_alert TIMESTAMPTZ)`);
      await q(`ALTER TABLE sa_leads ADD COLUMN IF NOT EXISTS business TEXT`);
      await q(`CREATE TABLE IF NOT EXISTS sa_events (
        id BIGSERIAL PRIMARY KEY, vid TEXT NOT NULL, sid TEXT, kind TEXT NOT NULL, path TEXT, ts TIMESTAMPTZ NOT NULL DEFAULT now())`);
      await q(`CREATE INDEX IF NOT EXISTS sa_events_ts ON sa_events (ts)`);
      await q(`CREATE TABLE IF NOT EXISTS sa_settings (k TEXT PRIMARY KEY, v TEXT)`);
      await q(`DELETE FROM sa_events WHERE ts < now() - interval '${KEEP_DAYS} days'`);
      await q(`DELETE FROM sa_views WHERE ts < now() - interval '${KEEP_DAYS} days'`);
    },
    async insertView(v) {
      await q(`INSERT INTO sa_views (vid, sid, path, source, device, ts) VALUES ($1,$2,$3,$4,$5,$6)`, [v.vid, v.sid, v.path, v.source, v.device, v.ts]);
    },
    async lastView(vid) {
      const r = await q(`SELECT * FROM sa_views WHERE vid=$1 ORDER BY ts DESC LIMIT 1`, [vid]);
      return r.rows[0] || null;
    },
    async firstView(vid) {
      const r = await q(`SELECT * FROM sa_views WHERE vid=$1 ORDER BY ts ASC LIMIT 1`, [vid]);
      return r.rows[0] || null;
    },
    async sessionViews(sid) {
      const r = await q(`SELECT * FROM sa_views WHERE sid=$1 ORDER BY ts ASC`, [sid]);
      return r.rows;
    },
    async viewsSince(date) {
      const r = await q(`SELECT vid, sid, path, source, device, ts FROM sa_views WHERE ts >= $1 ORDER BY ts DESC`, [date]);
      return r.rows;
    },
    async upsertLead(l) {
      await q(
        `INSERT INTO sa_leads (vid, name, phone, email, town, size, message, first_source, created_at, business)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (vid) DO UPDATE SET name=$2, phone=$3, email=$4, town=$5, size=$6, message=$7, business=$10`,
        [l.vid, l.name, l.phone, l.email, l.town, l.size, l.message, l.first_source, l.created_at, l.business || null]
      );
    },
    async leadByVid(vid) {
      const r = await q(`SELECT * FROM sa_leads WHERE vid=$1`, [vid]);
      return r.rows[0] || null;
    },
    async leads() {
      const r = await q(`SELECT * FROM sa_leads ORDER BY created_at DESC LIMIT 500`);
      return r.rows;
    },
    async markAlerted(vid, ts) {
      await q(`UPDATE sa_leads SET last_alert=$2 WHERE vid=$1`, [vid, ts]);
    },
    async insertEvent(e) {
      await q(`INSERT INTO sa_events (vid, sid, kind, path, ts) VALUES ($1,$2,$3,$4,$5)`, [e.vid, e.sid, e.kind, e.path, e.ts]);
    },
    async eventsSince(date) {
      const r = await q(`SELECT vid, sid, kind, path, ts FROM sa_events WHERE ts >= $1 ORDER BY ts DESC`, [date]);
      return r.rows;
    },
    async getSetting(k) {
      const r = await q(`SELECT v FROM sa_settings WHERE k=$1`, [k]);
      return r.rows[0] ? r.rows[0].v : null;
    },
    async setSetting(k, v) {
      await q(`INSERT INTO sa_settings (k, v) VALUES ($1,$2) ON CONFLICT (k) DO UPDATE SET v=$2`, [k, v]);
    },
  };
}

function fileStore() {
  const dir = process.env.DATA_DIR || path.join(__dirname, '..', '.data');
  const file = path.join(dir, 'analytics.json');
  let db = { views: [], leads: {}, events: [], settings: {} };
  let timer = null;
  const save = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(file + '.tmp', JSON.stringify(db));
        fs.renameSync(file + '.tmp', file);
      } catch (e) {
        console.error('[analytics] save failed', e.message);
      }
    }, 2000);
  };
  const asDate = (v) => ({ ...v, ts: new Date(v.ts) });
  return {
    kind: 'file',
    async init() {
      try {
        db = JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (e) {
        /* first run */
      }
      const cutoff = Date.now() - KEEP_DAYS * 864e5;
      db.views = (db.views || []).filter((v) => new Date(v.ts).getTime() >= cutoff);
      db.events = (db.events || []).filter((v) => new Date(v.ts).getTime() >= cutoff);
      db.leads = db.leads || {};
      db.settings = db.settings || {};
      console.warn('[analytics] using file storage — set DATABASE_URL (Railway Postgres) so data survives redeploys');
    },
    async insertView(v) {
      db.views.push({ ...v, ts: new Date(v.ts).toISOString() });
      save();
    },
    async lastView(vid) {
      for (let i = db.views.length - 1; i >= 0; i--) if (db.views[i].vid === vid) return asDate(db.views[i]);
      return null;
    },
    async firstView(vid) {
      const v = db.views.find((x) => x.vid === vid);
      return v ? asDate(v) : null;
    },
    async sessionViews(sid) {
      return db.views.filter((v) => v.sid === sid).map(asDate);
    },
    async viewsSince(date) {
      const t = new Date(date).getTime();
      return db.views.filter((v) => new Date(v.ts).getTime() >= t).map(asDate).reverse();
    },
    async upsertLead(l) {
      const prev = db.leads[l.vid] || {};
      db.leads[l.vid] = { ...prev, ...l, created_at: prev.created_at || new Date(l.created_at).toISOString() };
      save();
    },
    async leadByVid(vid) {
      const l = db.leads[vid];
      return l ? { ...l, created_at: new Date(l.created_at), last_alert: l.last_alert ? new Date(l.last_alert) : null } : null;
    },
    async leads() {
      return Object.values(db.leads)
        .map((l) => ({ ...l, created_at: new Date(l.created_at), last_alert: l.last_alert ? new Date(l.last_alert) : null }))
        .sort((a, b) => b.created_at - a.created_at);
    },
    async markAlerted(vid, ts) {
      if (db.leads[vid]) db.leads[vid].last_alert = new Date(ts).toISOString();
      save();
    },
    async insertEvent(e) {
      db.events.push({ ...e, ts: new Date(e.ts).toISOString() });
      save();
    },
    async eventsSince(date) {
      const t = new Date(date).getTime();
      return db.events.filter((v) => new Date(v.ts).getTime() >= t).map(asDate).reverse();
    },
    async getSetting(k) {
      return db.settings[k] ?? null;
    },
    async setSetting(k, v) {
      db.settings[k] = v;
      save();
    },
  };
}

module.exports = process.env.DATABASE_URL ? pgStore() : fileStore();
