---
title: "Website Speed and Local Rankings: Why Slow Sites Lose Leads"
description: "How page speed affects contractor rankings and calls, the Core Web Vitals thresholds to aim for, how to test your own site, and the fixes that matter most."
date: 2026-09-28
updated: 2026-10-18
category: "Web Design & SEO"
keyword: contractor website speed
image: blog-website-speed.jpg
relatedServices: [web-design, digital-marketing]
relatedIndustries: [masonry, glass-glazing, deck-building]
faq:
  - q: "Does website speed affect Google rankings?"
    a: "Yes, but it's not the biggest factor. Google says its ranking systems use Core Web Vitals, and also that it will show the most relevant content even when page experience is weaker. Speed helps most when you're competing with similar pages."
  - q: "What is a good load time for a contractor website?"
    a: "Use Google's Core Web Vitals as the target. As of 2026, a good Largest Contentful Paint is 2.5 seconds or less, measured at the 75th percentile of real visits."
  - q: "Why is my site fast on my office computer and slow on my phone?"
    a: "Your office computer is usually more powerful and on fast internet. Phones on cellular data have slower processors and connections, so heavy images and scripts hurt much more. Always test on a phone over cellular."
---

A contractor website built on a heavy template with a dozen plugins can look fine on a desktop monitor and still lose leads every day on a phone with weak signal. That describes a lot of people looking for a contractor, standing in a driveway or a job site. This post explains how speed affects rankings and calls, what Google actually measures, how to test your own site and which fixes make the biggest difference.

## Why speed matters twice

Speed affects you in two places.

**Rankings.** Google says its ranking systems use Core Web Vitals. It also says relevance comes first: Google will show the most relevant content even if page experience is sub-par, and good page experience matters most when many helpful pages compete for the same search ([Google Search Central](https://developers.google.com/search/docs/appearance/page-experience)). For local contractors, that's often exactly the situation. Five masons in your area all have a "patio installation" page. Speed and usability can be part of what separates them.

**Conversions.** This is the bigger effect for most trade businesses. A homeowner who searched "emergency glass repair" and stares at a blank screen will hit back and tap the next result. You never see that lost visit in your contact form. It just doesn't happen.

## What Google measures: Core Web Vitals

Google's Core Web Vitals are three measurements of real visitor experience. As of 2026, the "good" thresholds are ([web.dev](https://web.dev/articles/vitals)):

| Metric | What it measures | Good |
|---|---|---|
| Largest Contentful Paint (LCP) | How long until the main content (usually the hero image or headline) appears | 2.5 seconds or less |
| Interaction to Next Paint (INP) | How quickly the page responds when someone taps a button or menu | 200 milliseconds or less |
| Cumulative Layout Shift (CLS) | How much the layout jumps around while loading | 0.1 or less |

Google recommends judging these at the 75th percentile of page loads, separately for mobile and desktop. In plain terms, most of your real visitors should get a good experience, not just the ones on fast Wi-Fi. INP replaced the older First Input Delay metric in 2024, so older guides may mention a different metric.

Layout shift matters more than people think. If a click-to-call button jumps down as a photo loads, people tap the wrong thing.

## How to test your own site

You can check this yourself in about fifteen minutes.

1. **The phone test.** Turn off Wi-Fi. Search your business on your phone and tap through to your site. Count how long until you can read the headline and tap the phone number. Try a service page and a town page too, not just the homepage.
2. **PageSpeed Insights.** Enter your URL at Google's PageSpeed Insights. If your site has enough traffic, the top section shows field data from real Chrome users. The lower section shows a lab test with specific suggestions.
3. **Search Console.** If you have Google Search Console set up, the Core Web Vitals report groups your pages by status so you can see which templates have problems.
4. **Check your heaviest page.** For most contractors that's the project gallery. Masonry, deck and hardscape galleries are often the slowest pages on the site.

## The usual causes, and the fixes

| Cause | What it looks like | Fix |
|---|---|---|
| Oversized photos | 5 MB images straight from a phone camera | Resize to the display size, compress, and serve modern formats like WebP or AVIF |
| Gallery loads everything at once | Dozens of full-size images on page load | Lazy-load images below the first screen, use thumbnails that open larger versions |
| Page builder bloat | Heavy themes loading code for features you don't use | Remove unused plugins and features, or rebuild on a lighter setup |
| Autoplay video and sliders | Hero video or rotating slider on every visit | Use one strong still image; link to the video instead |
| Third-party scripts | Chat widgets, review widgets, several tracking pixels | Audit them yearly, remove what you don't use, load the rest after the page |
| Fonts | Several font families and weights | Use one or two, and load them efficiently |
| Hosting | Slow response even on simple pages | Move to hosting sized for your traffic, with a CDN |
| Layout shift | Buttons jump as images and ads load | Set image dimensions and reserve space for embeds |

Start with images. On contractor sites, they're the most common problem and the easiest to fix.

## Galleries: the special case

Trades that sell on photos (masonry, hardscaping, decks, glass and shower enclosures, remodeling) need galleries, and galleries are where speed usually breaks. You don't have to choose between showing your work and loading fast:

- Show a grid of compressed thumbnails, and load the full image only when tapped.
- Break large galleries into project pages: one page per project with five to ten photos and a short description. That's better for speed and for search, since each project page can target a service and town.
- Write a short caption and descriptive alt text for each photo ("Bluestone patio with granite steps, Plymouth MA").

Our post on [project gallery websites for hardscaping and masonry](/blog/hardscaping-masonry-project-gallery-website/) covers how to structure them.

## Speed is one piece of the page

A fast page still has to do its job. On mobile, the first screen should show what you do, where you do it, and a visible call button. Every page should have a clear next step. And the page has to be relevant to what someone searched, which is why service and town pages matter as much as speed. See [why trade businesses need local service pages](/blog/why-trade-businesses-need-local-service-pages/).

## When to fix vs. rebuild

If your site is fairly modern and the problems are images and a few scripts, fix them. If it's built on a heavy theme with years of plugins, has no separate service or town pages, and fails Core Web Vitals across every template, a rebuild is often the faster path. Ask any web designer how they'll measure speed before and after, and what Core Web Vitals they'll target. Our guide on [hiring a web designer for your trade business](/blog/hiring-a-web-designer-for-your-trade-business/) has more questions to ask.

## How RGS helps

We build custom, mobile-first sites with compressed images, clean code and no unnecessary plugins, structured with a page for each service and town you cover. We can also rebuild an existing site and keep what's working. See our [Web Design](/services/web-design/) service, or the trade pages for [glass and glazing web design](/industries/glass-glazing/web-design/) and [masonry web design](/industries/masonry/web-design/).
