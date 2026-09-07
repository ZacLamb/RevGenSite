/**
 * Revenue Generating Solutions — static site server.
 * Serves the pre-generated /public directory. Pages are built ahead of
 * time by scripts/generate-site.js (run automatically before start).
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

app.use(express.static(PUBLIC_DIR, {
  extensions: ['html'],
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=300');
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
