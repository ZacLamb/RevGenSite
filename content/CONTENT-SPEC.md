# Revenue Generating Solutions: content spec

Content for www.revenuegeneratingsolutions.com lives in this folder as Markdown with YAML front matter. `npm run build` (scripts/generate-site.js) turns it into pages:

- `content/blog/<slug>.md` → `/blog/<slug>/`
- `content/industry-services/<industry>--<service>.md` → `/industries/<industry>/<service>/`

## Who we write for

Owners and office managers of **local service businesses**: plumbers, electricians, HVAC, masonry, landscaping, deck builders, glass and glazing, painters, carpenters and remodelers, hardscaping and tree service, gutter and pressure washing, auto restoration and detailing, and healthcare and wellness practices. Most are in Massachusetts and New England, but don't make an article only about one place unless the topic needs it. They're busy, practical and skeptical of marketing agencies.

## Facts you may use (the only claims about RGS)

- Revenue Generating Solutions (RGS) is a marketing and technology company for local service businesses, founded by Zac Lamb, serving Massachusetts and New England. Phone (617) 877-5608.
- RGS offers five services. Read `data/services.json` for each one's features, process and FAQ, and don't claim anything beyond them:
  - AI Services & Automations: `/services/ai-services-automations/`
  - CRM Build & Management: `/services/crm-build-management/`
  - Custom Tool Building: `/services/custom-tool-building/`
  - Web Design: `/services/web-design/`
  - Digital Marketing: `/services/digital-marketing/`
- Industries are in `data/industries.json` (slug, pain points, how we help), and towns are in `data/towns.json`.
- RGS also makes RGS Tools, a set of GoHighLevel tools for agencies (`/software/`). Mention it only in pieces about CRMs or agency tooling, and only in passing.

**Never invent** client names, testimonials, case studies, results, percentages, statistics, survey findings, prices, guarantees, awards or years in business. Don't write "studies show" unless you name a real study you checked with web search and link to it. Hypothetical examples are fine when clearly framed ("say your average job is $400…"). Simple arithmetic on a stated hypothetical is fine too.

## Voice

- Talk plainly, like an operator who has seen inside a lot of trade businesses. Be specific and practical, using short paragraphs and concrete examples from the trade in question.
- Teach first. Every piece must be useful to someone who never hires us: give real steps, real settings, the actual questions to ask. The RGS pitch is one short closing section (2–4 sentences) linking to the relevant service page, plus at most one passing mention earlier.
- Use no hype words: "revolutionize", "game-changer", "unlock", "seamless", "supercharge", "skyrocket", "in today's fast-paced world", "elevate".
- Use em dashes sparingly (at most 2 per piece). Use American English.
- When you state current facts about third-party platforms (Google Business Profile, Google Local Services Ads, Meta ads, A2P 10DLC texting registration, review policies), check them with web search and phrase anything that may change as "as of 2026".

## Markdown you can use

`##` and `###` headings, paragraphs, `-` bullet lists, `1.` numbered lists, **bold**, simple tables, and links. No H1, because the page renders the title. No HTML and no images.

**Internal links are required, and you may only use paths that exist:**

- `/services/<service-slug>/` and `/industries/<industry-slug>/`
- `/industries/<industry>/<service>/`, only for the 49 pairs listed at the bottom
- `/blog/<slug>/`, only for slugs in the blog list at the bottom
- `/locations/<town-slug>/`, `/contact/`, `/software/`

## Blog post: `content/blog/<slug>.md` (1,100–1,700 words)

```yaml
---
title: "The Real Cost of a Missed Call for Plumbers and Electricians"   # ≤ 70 chars, keyword near the front
description: "140–160 characters, for the search snippet."
date: 2026-10-18            # keep the original date for rewrites
updated: 2026-10-18         # rewrites only
category: "AI & Automations" # one of: AI & Automations | CRM & Systems | Web Design & SEO | Digital Marketing | Custom Tools
keyword: missed calls plumbing business
image: blog-missed-call-cost.jpg   # from the image list below
relatedServices: [ai-services-automations, crm-build-management]   # 1–3
relatedIndustries: [plumbing, electrical]                          # 0–4
faq:                       # 3 real questions people search, with 1–3 sentence answers
  - q: "..."
    a: "..."
---
```

Start with a 2–3 sentence intro. Use at least 4 `##` sections, and include at least one list or table and at least 3 internal links (to a service, an industry or industry-service page, and another blog post). End with a `## ` section on how RGS helps, linking the service page.

## Industry × service page: `content/industry-services/<industry>--<service>.md` (600–900 words)

```yaml
---
industry: hvac
service: crm-build-management
title: "CRM for HVAC Companies: Pipelines, Renewals & Follow-Up"   # ≤ 65 chars
description: "140–160 characters."
keyword: crm for hvac companies
intro: "1–2 sentences shown under the page title."
faq:            # 3 questions specific to this trade and service
  - q: "..."
    a: "..."
---
```

Body sections (rename them to fit; keep the order):

1. `## The problem in <trade>`: the specific ways this trade loses money or time where this service applies. Use the industry's pain points in `data/industries.json`, expanded with real trade detail (seasonality, emergency vs. planned work, estimate cycles, crews, permits, materials).
2. `## What we build for <trade>`: 4–7 concrete deliverables from that service's features, adapted to the trade. Name the workflows, pipeline stages, page types, campaign types or tools.
3. `## How it works`: a short numbered process based on the service's `process`.
4. `## What to look for (even if you don't hire us)`: a practical checklist an owner can use with any vendor.
5. Close with one short paragraph linking `/services/<service>/`, `/industries/<industry>/` and one relevant blog post.

**Every one of these pages must read as unique.** Writing "CRM for painters" by swapping nouns into the HVAC version is a failure. Think about how the trade actually runs.

## Images (blog `image:` must be one of these)

blog-ai-automation-saves-hours.jpg, blog-crm-checklist.jpg, blog-local-service-pages.jpg, blog-google-ads-vs-meta.jpg, blog-missed-call-cost.jpg, blog-custom-business-tool.jpg, blog-seo-checklist-hvac.jpg, blog-google-reviews.jpg, blog-website-speed.jpg, blog-automating-followup.jpg, service-ai-automations.jpg, service-crm.jpg, service-custom-tools.jpg, service-web-design.jpg, service-digital-marketing.jpg, industry-plumbing.jpg, industry-electrical.jpg, industry-hvac.jpg, industry-masonry.jpg, industry-landscaping.jpg, industry-deck-building.jpg, industry-glass.jpg, industry-painting.jpg, industry-carpentry-remodeling.jpg, industry-hardscaping-tree.jpg, industry-gutter-pressure-washing.jpg, industry-auto-restoration.jpg, industry-healthcare.jpg

## Blog slugs (link only to these)

Rewrites of existing posts:

- ai-automation-saves-service-businesses-hours
- crm-checklist-for-contractors
- why-trade-businesses-need-local-service-pages
- google-ads-vs-meta-ads-home-services
- cost-of-a-missed-call
- what-is-a-custom-business-tool
- seo-checklist-hvac-companies
- turning-google-reviews-into-marketing
- website-speed-and-local-rankings
- automating-follow-up-lost-booked-jobs

New:

- google-business-profile-checklist-contractors
- local-seo-for-plumbers
- electrician-website-must-haves
- hvac-maintenance-plan-renewal-automation
- speed-to-lead-home-services
- missed-call-text-back-setup
- ai-receptionist-for-contractors
- estimate-follow-up-sequence-contractors
- landscaping-seasonal-marketing-calendar
- painting-contractor-lead-generation
- hardscaping-masonry-project-gallery-website
- hiring-a-web-designer-for-your-trade-business
- crm-pipeline-stages-service-business
- google-local-services-ads-vs-google-ads
- facebook-ads-for-remodelers
- track-where-your-leads-come-from
- reduce-no-shows-appointment-reminders
- instant-quote-calculator-for-your-website
- reactivate-past-customers-text-campaign
- a2p-10dlc-texting-registration-small-business

## The 49 industry × service pairs

- plumbing: ai-services-automations, crm-build-management, web-design, digital-marketing
- electrical: crm-build-management, digital-marketing, web-design, ai-services-automations
- hvac: crm-build-management, ai-services-automations, digital-marketing, web-design, custom-tool-building
- masonry: web-design, crm-build-management, digital-marketing
- landscaping: crm-build-management, web-design, ai-services-automations, digital-marketing
- deck-building: web-design, crm-build-management, digital-marketing
- glass-glazing: ai-services-automations, crm-build-management, web-design
- painting: crm-build-management, ai-services-automations, web-design, digital-marketing
- carpentry-remodeling: crm-build-management, custom-tool-building, web-design, digital-marketing
- hardscaping-tree-service: ai-services-automations, crm-build-management, web-design
- gutter-pressure-washing: ai-services-automations, digital-marketing, web-design, crm-build-management
- auto-restoration-detailing: web-design, custom-tool-building, crm-build-management, digital-marketing
- healthcare: ai-services-automations, custom-tool-building, crm-build-management, digital-marketing
