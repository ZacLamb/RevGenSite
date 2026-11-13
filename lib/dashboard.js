// Owner dashboard page (ported from dumpdogs views/dashboard.ejs, rendered with template strings so the site needs no template engine).
const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = `
  :root { --bg:#F6F9FF; --panel:#fff; --ink:#0A1A2F; --txt:#0A1A2F; --mute:#5A6B85; --line:#E4EAF6; --brand:#0B5FFF; --brand-2:#00C2B8; --good:#12805C; --bar:#0B5FFF; --head:#0A1A2F; }
  @media (prefers-color-scheme: dark) { :root { --bg:#07111F; --panel:#0E1D33; --txt:#E8EEF9; --mute:#93A3BD; --line:#1C2E4A; --bar:#4D8DFF; --head:#050D18; } }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--txt); font:15px/1.5 'Inter',system-ui,-apple-system,'Segoe UI',sans-serif; -webkit-font-smoothing:antialiased; }
  a { color:var(--brand); }
  header { background:var(--head); color:#fff; border-bottom:3px solid var(--brand-2); }
  .wrap { max-width:1240px; margin:0 auto; padding:0 16px; }
  .top { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:14px 16px; }
  .brand { font-weight:800; font-size:1.15rem; letter-spacing:-.01em; }
  .brand small { display:block; font-weight:600; font-size:.72rem; letter-spacing:.14em; text-transform:uppercase; color:var(--brand-2); }
  .range { display:flex; gap:6px; flex-wrap:wrap; }
  .range a, .range button { font:600 .82rem/1 'Inter',sans-serif; padding:10px 14px; border:1px solid #3A4D6B; color:#fff; text-decoration:none; background:transparent; border-radius:999px; cursor:pointer; }
  .range a.on { background:var(--brand); border-color:var(--brand); }
  .range a:hover, .range button:hover { border-color:#fff; }
  main { padding:22px 0 60px; }
  .note { padding:10px 14px; border-left:4px solid var(--brand); background:var(--panel); margin-bottom:18px; font-size:.92rem; border-radius:6px; }
  .note.ok { border-color:var(--good); }
  .kpis { display:grid; grid-template-columns:repeat(7,1fr); gap:12px; margin-bottom:18px; }
  .kpi { background:var(--panel); border:1px solid var(--line); border-top:4px solid var(--head); padding:14px 16px; border-radius:12px; }
  .kpi.hot { border-top-color:var(--brand-2); }
  .kpi b { display:block; font-weight:800; font-size:2rem; line-height:1.05; letter-spacing:-.02em; }
  .kpi span { font-weight:600; font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:var(--mute); }
  .grid { display:grid; grid-template-columns:1.4fr 1fr; gap:14px; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:16px 18px; min-width:0; }
  .card h2 { margin:0 0 12px; font-weight:700; font-size:.78rem; letter-spacing:.12em; text-transform:uppercase; color:var(--mute); }
  .span2 { grid-column:1 / -1; }
  .chart { display:flex; align-items:flex-end; gap:3px; height:170px; border-bottom:2px solid var(--txt); padding-top:18px; }
  .col { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; min-width:0; position:relative; }
  .bar { width:100%; max-width:34px; background:var(--bar); border-radius:4px 4px 0 0; min-height:2px; }
  .col em { position:absolute; top:-16px; font:600 .7rem/1 'Inter',sans-serif; font-style:normal; color:var(--mute); }
  .xl { display:flex; gap:3px; margin-top:6px; }
  .xl span { flex:1; text-align:center; font-size:.68rem; color:var(--mute); white-space:nowrap; overflow:hidden; }
  .rows { list-style:none; margin:0; padding:0; }
  .rows li { display:grid; grid-template-columns:1fr auto; gap:10px; padding:7px 0; border-bottom:1px solid var(--line); position:relative; }
  .rows li:last-child { border-bottom:0; }
  .rows .fill { position:absolute; left:0; bottom:-1px; height:3px; background:var(--brand-2); opacity:.7; border-radius:2px; }
  .rows b { font-variant-numeric:tabular-nums; }
  .empty { color:var(--mute); font-size:.92rem; margin:0; }
  .feed { list-style:none; margin:0; padding:0; max-height:560px; overflow:auto; }
  .feed li { padding:10px 0; border-bottom:1px solid var(--line); }
  .feed .who { font-weight:700; }
  .feed .lead { color:var(--brand); }
  .tag { display:inline-block; font:700 .65rem/1 'Inter',sans-serif; letter-spacing:.08em; text-transform:uppercase; padding:4px 7px; border-radius:999px; background:var(--brand); color:#fff; margin-left:6px; vertical-align:2px; }
  .tag.book { background:var(--brand-2); color:#04302D; }
  .meta { color:var(--mute); font-size:.82rem; }
  .pages { font-size:.88rem; margin-top:3px; overflow-wrap:anywhere; }
  .tbl { width:100%; border-collapse:collapse; font-size:.9rem; }
  .tbl th { text-align:left; font-weight:700; font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:var(--mute); padding:8px 10px 8px 0; border-bottom:2px solid var(--txt); white-space:nowrap; }
  .tbl td { padding:9px 10px 9px 0; border-bottom:1px solid var(--line); vertical-align:top; }
  .tblwrap { overflow-x:auto; }
  .num { text-align:right; font-variant-numeric:tabular-nums; }
  footer { color:var(--mute); font-size:.8rem; margin-top:24px; }
  @media (max-width:1100px) { .kpis { grid-template-columns:repeat(4,1fr); } }
  @media (max-width:980px) { .grid { grid-template-columns:1fr; } }
  @media (max-width:560px) { .kpis { grid-template-columns:repeat(2,1fr); } .kpi b { font-size:1.7rem; } .xl span:nth-child(even) { visibility:hidden; } }
`;

function render(brand, s, sent, storage) {
  const list = (title, arr, empty) => {
    const m = Math.max(1, ...arr.map((x) => x[1]));
    return `<section class="card"><h2>${esc(title)}</h2>${arr.length
      ? `<ul class="rows">${arr.map(([k, n]) => `<li><span>${esc(k)}</span><b>${n}</b><i class="fill" style="width:${(n / m) * 100}%"></i></li>`).join('')}</ul>`
      : `<p class="empty">${esc(empty)}</p>`}</section>`;
  };
  const max = Math.max(1, ...s.daily.map((d) => d.visits));
  const step = s.days > 30 ? 7 : s.days > 7 ? 3 : 1;
  const k = (n, label, hot) => `<div class="kpi${hot ? ' hot' : ''}"><b>${esc(n)}</b><span>${esc(label)}</span></div>`;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><meta http-equiv="refresh" content="120">
<title>Dashboard | ${esc(brand.short)}</title>
<link rel="icon" href="${esc(brand.icon || '/favicon.svg')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body>
<header><div class="wrap top">
  <div class="brand">${esc(brand.name)}<small>Website dashboard</small></div>
  <div class="range">${[7, 30, 90].map((d) => `<a href="/dashboard?days=${d}" class="${s.days === d ? 'on' : ''}">${d} days</a>`).join('')}
    <form method="post" action="/dashboard/send-digest" style="margin:0"><button type="submit" title="Send yesterday's summary now">Send digest now</button></form></div>
</div></header>
<main class="wrap">
  ${sent === '1' ? '<div class="note ok">Digest sent to the alert webhook.</div>' : sent === '0' ? "<div class=\"note\">Digest couldn't be sent. Check that ALERT_WEBHOOK_URL is set in Railway.</div>" : ''}
  ${storage === 'file' ? '<div class="note">Visits are stored temporarily and reset when the site redeploys. Add a Postgres database to this Railway project (it sets <code>DATABASE_URL</code>) to keep history.</div>' : ''}
  <section class="kpis">
    ${k(s.totals.visits, 'Visits')}${k(s.totals.visitors, 'Unique visitors')}${k(s.totals.views, 'Page views')}
    ${k(s.totals.leads, 'Leads', true)}${k(s.totals.conversion + '%', 'Visitor → lead')}${k(s.totals.returning, 'Leads came back', true)}${k(s.totals.booking, 'Booking intent', true)}
  </section>
  <div class="grid">
    <section class="card span2"><h2>Visits per day</h2>
      <div class="chart" role="img" aria-label="Visits per day over the last ${s.days} days">${s.daily.map((d) => `<div class="col" title="${esc(d.day)}: ${d.visits} visits, ${d.views} page views">${s.days <= 30 && d.visits ? `<em style="bottom:${(d.visits / max) * 100}%">${d.visits}</em>` : ''}<div class="bar" style="height:${(d.visits / max) * 100}%"></div></div>`).join('')}</div>
      <div class="xl">${s.daily.map((d, i) => { const dt = new Date(d.day + 'T12:00:00'); return `<span>${i % step === 0 || i === s.daily.length - 1 ? (dt.getMonth() + 1) + '/' + dt.getDate() : ''}</span>`; }).join('')}</div>
    </section>
    <section class="card"><h2>Live visitor feed</h2>
      ${s.feed.length ? '' : '<p class="empty">No visits yet in this range.</p>'}
      <ul class="feed">${s.feed.map((f) => `<li><span class="who ${f.isLead ? 'lead' : ''}">${esc(f.who)}</span>${f.isLead ? '<span class="tag">Lead</span>' : ''}${f.intent ? '<span class="tag book">Clicked Book</span>' : ''}
        <div class="meta">${esc(f.when)} · ${esc(f.source)} · ${esc(f.device)} · ${f.pages.length} page${f.pages.length === 1 ? '' : 's'}</div>
        <div class="pages">${f.pages.map(esc).join(' → ')}</div></li>`).join('')}</ul>
    </section>
    <div style="display:grid;gap:14px;align-content:start;min-width:0">
      ${list('Where visitors come from', s.sources, 'No visits yet.')}
      ${list('Top pages', s.pages, 'No visits yet.')}
      ${list('Page groups', s.groups, 'No visits yet.')}
      ${list('Towns people look at', s.towns, 'No town pages viewed yet.')}
      ${list('Devices', s.devices, 'No visits yet.')}
    </div>
    <section class="card span2"><h2>Leads from the website</h2>
      ${s.leads.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>Name</th><th>Business</th><th>Phone</th><th>Found us via</th><th>Submitted</th><th class="num">Visits</th><th>Last seen</th></tr></thead><tbody>
      ${s.leads.map((l) => `<tr><td><b>${esc(l.name || '—')}</b>${l.intent ? '<span class="tag book">Clicked Book</span>' : ''}${l.email ? `<div class="meta"><a href="mailto:${esc(l.email)}">${esc(l.email)}</a></div>` : ''}</td>
        <td>${esc(l.business || '—')}</td><td>${l.phone ? `<a href="tel:${esc(l.phone)}">${esc(l.phone)}</a>` : '—'}</td><td>${esc(l.source || '—')}</td><td>${esc(l.created)}</td><td class="num">${l.visits}</td><td>${esc(l.lastSeen)}</td></tr>`).join('')}
      </tbody></table></div>` : '<p class="empty">No leads yet. When someone submits the contact form they show up here, and you get an alert each time they come back.</p>'}
    </section>
  </div>
  <footer>Times shown in ${esc(s.tz.replace('_', ' '))}. Your own visits aren't counted once you've logged in here. Refreshes every 2 minutes.</footer>
</main></body></html>`;
}

module.exports = { render };
