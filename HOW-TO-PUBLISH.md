# Dexits.com — How to publish a blog post (2 steps)

The blog is built for SEO: every post is its own static HTML page with full
meta tags, keywords, and Article schema — exactly what search engines want.

## The 2-step publish flow

**Step 1 — Create the post file.**
Duplicate `blog/_TEMPLATE.html`, rename it to your slug
(e.g. `blog/best-time-to-sell-shopify-store.html`), and replace every
`{{PLACEHOLDER}}`. Put your main keyword in the title, the description,
the first paragraph, and at least one `<h2>`.

**Step 2 — Register it in the manifest.**
Open `blog/posts.js` and add one entry to the **top** of the list:

```js
{
  slug: "best-time-to-sell-shopify-store",       // must match the filename
  title: "The Best Time to Sell a Shopify Store",
  description: "One or two sentences — this shows on the blog index and homepage.",
  tag: "Exit Strategy",
  date: "2026-07-15",
  minutes: 6
},
```

That's it. The blog index page AND the homepage "From the Blog" section
update automatically from `posts.js`.

**Even easier:** ask Claude — *"write and publish a Dexits blog post about
[topic] targeting [keyword]"* — and both steps get done for you.

## SEO checklist per post

- [ ] Main keyword in: `<title>`, meta description, `<h1>`, first paragraph, one `<h2>`
- [ ] Meta description 150–160 characters
- [ ] 2+ internal links to other posts or homepage sections
- [ ] The CTA box kept in (it's the conversion point)
- [ ] Slug is short, lowercase, hyphenated, keyword-bearing

## Editing site stats

All trust metrics on the homepage live in one block — search `STAT:` in
`index.html` (the hero badge + the four "Dexits in Numbers" cards).

## Structure

```
dexits-website/
├── index.html                  ← full landing page
├── HOW-TO-PUBLISH.md           ← this file
└── blog/
    ├── index.html              ← blog listing (auto-builds from posts.js)
    ├── posts.js                ← THE manifest — one entry per post
    ├── blog.css                ← shared blog styling
    ├── _TEMPLATE.html          ← copy me for each new post
    └── *.html                  ← the posts
```

## Deploying (current setup — live since Jul 12, 2026)

dexits.com is served by **Cloudflare Pages** (project `dexits-com`,
direct-upload mode). DNS is on Cloudflare; domain registered at GoDaddy.
Source of truth: this folder + GitHub `sanjeeveo/dexits-website`.
Staging mirror: https://dexits-website.onrender.com (Render, DEXITS project).

**To publish changes (after editing files here):**
1. Commit + push: `cd ~/DEXITS/DEXITS/dexits-website && git add -A && git commit -m "update" && git push`
2. Re-upload to Cloudflare Pages: dash.cloudflare.com → Workers & Pages →
   dexits-com → Create deployment → upload this folder (or the zip).

**Easiest:** just ask Claude — "publish the site changes" — and both steps
happen for you.
