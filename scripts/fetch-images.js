/**
 * fetch-images.js
 *
 * Downloads the site's AI-generated imagery (created with Higgsfield) from
 * their hosted URLs into /public/images on first install/deploy, so the
 * Express server always has real image files to serve.
 *
 * Runs automatically via the "postinstall" npm script — Railway (and any
 * normal `npm install`) will trigger this with no extra steps needed.
 *
 * Safe to re-run: it skips any file that already exists locally, so once
 * you've downloaded and committed the images as static files (recommended
 * for long-term permanence — see README), this script becomes a no-op.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const manifestPath = path.join(__dirname, '..', 'data', 'images-manifest.json');
const outDir = path.join(__dirname, '..', 'public', 'images');

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, destPath).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => fileStream.close(resolve));
      fileStream.on('error', reject);
    });
    request.on('error', reject);
    request.setTimeout(30000, () => request.destroy(new Error('timeout')));
  });
}

async function main() {
  if (!fs.existsSync(manifestPath)) {
    console.log('[fetch-images] No manifest found, skipping.');
    return;
  }
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const [filename, url] of Object.entries(manifest)) {
    const destPath = path.join(outDir, filename);
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      skipped++;
      continue;
    }
    try {
      await download(url, destPath);
      downloaded++;
      console.log(`[fetch-images] Downloaded ${filename}`);
    } catch (err) {
      failed++;
      console.warn(`[fetch-images] FAILED ${filename}: ${err.message}`);
    }
  }

  console.log(`[fetch-images] Done. downloaded=${downloaded} skipped=${skipped} failed=${failed}`);
  if (failed > 0) {
    console.warn('[fetch-images] Some images failed to download. The site will still run — missing images will 404. Re-deploy to retry, or download them manually from your Higgsfield library into public/images/.');
  }
}

main().catch((err) => {
  console.error('[fetch-images] Unexpected error:', err);
  // Never fail the install/deploy over images — the site should still boot.
  process.exit(0);
});
