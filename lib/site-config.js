// RGS-specific labels and groupings for the visitor dashboard.
// data/page-labels.json is written by scripts/generate-site.js (path -> page title) so every page, including
// blog posts and industry x service pages, gets a readable name.
const fs = require('fs');
const path = require('path');

const site = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'site.json'), 'utf8'));
const towns = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'towns.json'), 'utf8'));
let LABELS = {};
try { LABELS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'page-labels.json'), 'utf8')); } catch (_) { /* built on first generate */ }
const townName = Object.fromEntries(towns.map((t) => [t.slug, `${t.name}, ${t.state}`]));

const norm = (p) => (p.endsWith('/') ? p : p + '/');

function labelFor(p) {
  const n = norm(p);
  if (n === '/') return 'Home page';
  return LABELS[n] || p;
}
function groupOf(p) {
  const n = norm(p);
  if (n === '/') return 'Home';
  if (n.startsWith('/services/')) return 'Services';
  if (n.startsWith('/industries/')) return 'Industries';
  if (n.startsWith('/locations/')) return 'Town pages';
  if (n.startsWith('/blog/')) return 'Blog';
  if (n.startsWith('/book')) return 'Booking';
  if (n.startsWith('/software/')) return 'RGS Tools';
  return 'Other';
}
function townOf(p) {
  const m = norm(p).match(/^\/locations\/([^/]+)\//);
  return m ? townName[m[1]] || null : null;
}

module.exports = { name: site.name, short: site.shortName || 'RGS', url: `https://${site.domain}`, labelFor, groupOf, townOf };
