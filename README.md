# Revenue Generating Solutions — Website

A full rebuild of revenuegeneratingsolutions.com: a static, programmatically-generated
site (Node + Express) covering every service, industry, and service-area page, plus a
10-post SEO blog — all built from structured data files so it's easy to expand later.

## What's here

- **5 service pages** — AI Services & Automations, CRM Build & Management, Custom Tool
  Building, Web Design, Digital Marketing
- **13 industry pages** — Plumbing, Electrical, HVAC, Masonry, Landscaping, Deck
  Building, Glass & Glazing, Painting, Carpentry & Remodeling, Hardscaping & Tree
  Service, Gutter & Pressure Washing, Auto Restoration & Detailing, Healthcare
- **10 location pages** — Raynham, Lynn, Rehoboth, South Yarmouth, Plymouth,
  Northborough, Harwich, Rockland, Beverly (MA), and Derry (NH)
- **10 cornerstone blog posts** for programmatic SEO, cross-linked to the relevant
  service and industry pages
- Home, About, and Contact pages
- AI-generated imagery (via Higgsfield) for every hero, service, industry, and blog post
- `sitemap.xml` and `robots.txt` generated automatically

## How it's built

Everything lives as data first:

```
data/
  site.json        — brand info, nav, contact details
  services.json     — the 5 services
  industries.json   — the 13 industries
  towns.json        — the 10 location pages
  blog.json         — the 10 blog posts
  images-manifest.json — filename → image URL map
scripts/
  generate-site.js  — reads /data, writes every HTML page into /public
  fetch-images.js   — downloads the Higgsfield images into /public/images
```

Run `npm run build` any time after editing a data file to regenerate the whole site.
Want an 11th town, a 14th industry, or a new blog post? Add an entry to the relevant
JSON file and rebuild — you don't need to touch any HTML.

## Images

The site's imagery was generated with Higgsfield and is referenced by URL in
`data/images-manifest.json`. On `npm install`, `scripts/fetch-images.js` runs
automatically (via `postinstall`) and downloads every image into `public/images/` so
the site serves them locally instead of hotlinking a third party.

**For long-term permanence**, it's worth downloading the images from your Higgsfield
media library once and committing them directly into `public/images/` with the exact
filenames listed in `images-manifest.json` — then the fetch step becomes a no-op and
the site never depends on that URL still being alive.

## Deploying (GitHub + Railway, browser-only)

1. Create a new GitHub repo (or use an existing one) and upload this entire folder
   through the GitHub web UI — drag-and-drop or "Add file → Upload files" works fine.
2. In Railway, create a new project from that GitHub repo. Railway will detect
   `package.json` automatically.
3. Railway runs `npm install` (which also builds the site and fetches the images) and
   then `npm start`. No environment variables are required.
4. Once deployed, point `revenuegeneratingsolutions.com` at the Railway service the
   same way your other sites are set up.

## Editing content later

- **Add a town:** add an entry to `data/towns.json` (slug, name, state, region, blurb,
  nearby towns, image filename), then rebuild.
- **Add a blog post:** add an entry to `data/blog.json` — `body` is an array of
  `{type: "p"|"h2"|"ul", ...}` blocks, so no HTML needed.
- **Change contact info, phone, or brand colors:** edit `data/site.json`.
- **Contact form:** currently opens the visitor's email client with a prefilled
  message (no backend wired up). If you want it to post into a GHL CRM webhook the
  way your client sites do, that's a small change to `public/js/main.js` — happy to
  wire that up.

## Blog posts and industry playbooks (content/)

Articles and industry × service pages are Markdown files with YAML front matter:

- `content/blog/<slug>.md` → `/blog/<slug>/`
- `content/industry-services/<industry>--<service>.md` → `/industries/<industry>/<service>/`

The rules for writing them (facts you may use, voice, front matter, allowed links) are in `content/CONTENT-SPEC.md`. To add one, add a file through GitHub. Railway rebuilds the site on deploy. Before opening a PR, run `npm run check`: it builds the site and flags missing fields, broken internal links, banned hype words and unsourced statistics.

Related articles, "playbook" cards on industry and service pages, FAQ schema and the sitemap are all generated automatically from the front matter.
