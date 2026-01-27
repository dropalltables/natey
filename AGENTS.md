# AGENTS.md

Guide for AI agents working in the viruus.zip repository - a personal website and blog built with Hugo.

## Project Overview

This is a static website built with [Hugo](https://gohugo.io/) using the [hugo-bearblog](https://github.com/janraasch/hugo-bearblog/) theme. The site features:

- Personal blog with automated email distribution via Resend
- Minimal JavaScript philosophy (only used for Cloudflare Turnstile spam protection on contact form)
- Custom Berkeley Mono font
- Custom emoji rendering system
- Deployed to Cloudflare Pages with server-side analytics via Pages Functions
- GitHub Actions for email automation

**Base URL**: https://viruus.zip  
**Author**: dropalltables

## Essential Commands

### Development

```bash
# Start development server with drafts
hugo server -D

# Start development server (published posts only)
hugo server
```

Development server runs at `http://localhost:1313` with live reload.

### Build

```bash
# Build production site
hugo

# Output directory: public/
```

### Content Creation

```bash
# Create new blog post (uses archetypes/blog.md)
hugo new content/blog/post-name.md

# Create new page (uses archetypes/default.md)
hugo new content/page-name.md
```

### Timestamp Management

```bash
# Update blog post timestamp to current time
./datedooter.sh post-name

# Example:
./datedooter.sh email-is-hard
```

The `datedooter.sh` script updates the `date` field in a blog post's frontmatter to the current timestamp. It handles macOS and Linux sed differences automatically.

## Project Structure

```
.
├── archetypes/          # Content templates
│   ├── blog.md          # Blog post template (with draft=true)
│   └── default.md       # Default page template
├── content/             # Site content (markdown)
│   ├── blog/            # Blog posts
│   ├── _index.md        # Homepage content
│   ├── contact.md       # Contact form (with Cloudflare Turnstile)
│   ├── javascript.md    # JavaScript warning page for contact form
│   ├── projects.md      # Projects page
│   └── stuff.md         # Stuff page
├── layouts/             # Custom layout overrides
│   ├── _default/
│   │   ├── baseof.html  # Base template
│   │   └── single.html  # Single page/post template
│   ├── partials/
│   │   ├── custom_head.html      # Custom CSS link
│   │   └── process-emojis.html   # Emoji rendering partial
│   ├── index.html       # Homepage template
│   └── 404.html         # 404 page
├── static/              # Static assets (served as-is)
│   ├── custom.css       # Custom styles
│   ├── fonts/           # Berkeley Mono font files
│   ├── images/          # Site images
│   └── favicon.ico
├── assets/              # Assets to be processed by Hugo
│   └── images/
│       └── emojis/      # Custom emoji images
├── themes/
│   └── hugo-bearblog/   # Theme submodule
├── functions/           # Cloudflare Pages Functions
│   ├── _middleware.ts   # Server-side analytics (runs on every request)
│   └── tsconfig.json    # TypeScript config for functions
├── .github/
│   └── workflows/
│       └── send-email.yml  # Email automation
├── hugo.toml            # Site configuration
├── wrangler.toml        # Cloudflare Pages config
└── datedooter.sh        # Timestamp update utility
```

## Configuration (hugo.toml)

Key configuration settings:

- **Theme**: `hugo-bearblog` (git submodule)
- **Base URL**: `https://viruus.zip`
- **Permalinks**: Blog posts use `/:slug/` format (Bearblog-style)
- **Taxonomies**: Disabled (`disableKinds = ["taxonomy"]`)
- **Menu**: Defined in `[[menu.main]]` blocks and page frontmatter
- **Post navigator**: Enabled (`enablePostNavigator = true`)
- **Syntax highlighting**: `friendly` style with line numbers
- **Unsafe HTML**: Enabled in goldmark renderer

## Content Guidelines

### Blog Post Frontmatter

```toml
+++
title = "Post Title"
date = "2025-11-12T16:47:25-08:00"
description = "Optional SEO description"
draft = "false"  # or "true"
tags = ["tag1", "tag2", "tag3"]
+++
```

**Important**: 
- Draft posts are created with `draft = "true"` by default (from archetypes/blog.md)
- Date format is ISO 8601 with timezone: `YYYY-MM-DDTHH:MM:SS±HH:MM`
- Use `./datedooter.sh post-name` to update timestamps

### Content Conventions

1. **Minimal JavaScript**: Site philosophy is to avoid JavaScript except where necessary for spam protection
   - Contact form uses Cloudflare Turnstile (requires JavaScript)
   - Warning page (`/javascript`) redirects users before they encounter JavaScript
2. **Custom emojis**: Use `:emoji-name.gif:` syntax (e.g., `:wave.gif:`)
   - Emoji files must be in `assets/images/emojis/`
   - Rendered via `process-emojis.html` partial
   - Automatically converted to inline images with proper styling
3. **Images**: Use `/images/` paths (absolute from site root)
4. **Markdown**: Supports standard markdown + Hugo shortcodes
5. **Footnotes**: Supported in markdown (pandoc-style)

### Page Frontmatter

```toml
+++
title = "Page Title"
menu = "main"     # Optional: add to main menu
weight = 10       # Menu ordering (lower = earlier)
+++
```

## Styling and Design

### Custom CSS

- File: `static/custom.css`
- Loaded via `layouts/partials/custom_head.html`
- Defines Berkeley Mono font faces (Regular, Bold, Oblique, Bold-Oblique)
- Custom link hover behavior (inverts colors - background becomes link color)
- Applied to `time`, `code`, and `pre` elements
- Form layout styles (display: block for inputs, textarea, button, Turnstile widget)

### Font Setup

Berkeley Mono font files in `static/fonts/`:
- `BerkeleyMono-Regular.woff2`
- `BerkeleyMono-Bold.woff2`
- `BerkeleyMono-Oblique.woff2`
- `BerkeleyMono-Bold-Oblique.woff2`

Font is loaded with `font-display: swap` for performance.

### Theme Customization

The site uses hugo-bearblog theme as a base but overrides:
- `layouts/index.html` - Custom homepage (uses process-emojis partial)
- `layouts/_default/single.html` - Custom single post layout with emoji support
- `layouts/_default/baseof.html` - Custom base template
- Custom CSS for typography and link styling

## Server-Side Analytics

### Overview

Privacy-respecting, server-side analytics using Cloudflare Pages Functions. **No client-side JavaScript** - works even with JS disabled.

### How It Works

The `functions/_middleware.ts` runs on every request and:
1. Filters to only track HTML page views (not assets, bots, etc.)
2. Extracts referrer and categorizes source (search, social, dev, direct, other)
3. Captures page path, from-path (for internal navigation), country
4. Logs to Cloudflare Analytics Engine

### Data Captured

- **path**: Current page URL path
- **source**: Categorized referrer (google, github, twitter, direct, etc.)
- **refHost**: Referring hostname
- **fromPath**: Previous page path (internal navigation only)
- **country**: Visitor country from CF geo
- **UTM params**: utm_source, utm_medium, utm_campaign if present

### Referrer Categories

- **search**: Google, Bing, DuckDuckGo, Brave, Kagi, etc.
- **social**: Twitter/X, Facebook, LinkedIn, Instagram, Threads, Bluesky, Mastodon
- **dev**: GitHub, Hacker News, Lobsters, Reddit, Dev.to, Stack Overflow
- **direct**: No referrer
- **internal**: Navigation within viruus.zip
- **other**: Any other referrer

### Querying Stats

Access via Cloudflare Analytics Engine dashboard or GraphQL API. Example queries:

```sql
-- Top sources
SELECT blob1 AS source, SUM(double1) AS views 
FROM viruus_analytics GROUP BY source ORDER BY views DESC

-- Top pages  
SELECT index1 AS path, SUM(double1) AS views
FROM viruus_analytics GROUP BY path ORDER BY views DESC

-- Top external referrers
SELECT blob2 AS referrer, SUM(double1) AS views
FROM viruus_analytics WHERE blob2 != '' GROUP BY referrer ORDER BY views DESC

-- Internal navigation patterns
SELECT blob3 AS from_path, index1 AS to_path, SUM(double1) AS count
FROM viruus_analytics WHERE blob3 != '' GROUP BY from_path, to_path ORDER BY count DESC
```

### Viewing Stats

All data is accessible via Cloudflare's native tools:

1. **Real-time logs**: CF Dashboard → Pages → Your Project → Functions → Logs
2. **Analytics Engine queries**: CF Dashboard → Analytics & Logs → Analytics Engine
3. **GraphQL API**: Query `viruus_analytics` dataset programmatically

## Email Automation System

### Overview

Automated email distribution using Resend API via GitHub Actions. Emails are sent when blog posts are pushed to the `main` branch.

**Custom solution**: [resender](https://github.com/dropalltables/resender) - Open source Resend + Cloudflare Workers setup

### GitHub Action Workflow

**File**: `.github/workflows/send-email.yml`

**Triggers**: Push to `main` branch with changes in `content/blog/**`

**Secrets required**:
- `RESEND_API_KEY` - Resend API key
- `RESEND_SEGMENT_ID` - Production audience segment ID
- `RESEND_TEST_SEGMENT_ID` - Test audience segment ID

### Email Logic

The workflow intelligently handles different scenarios:

1. **New draft post** (`draft = "true"`):
   - Sends to test segment with `[DRAFT]` prefix in subject
   
2. **New published post** (`draft = "false"`):
   - Sends to production segment
   
3. **Draft updated** (was draft, still draft):
   - Sends to test segment with `[DRAFT]` prefix
   
4. **Draft published** (was draft, now `draft = "false"`):
   - Sends to production segment (publication email)
   
5. **Published post updated** (was published, still published):
   - **Skipped** - No email for updates to published posts

### Email Processing

1. Detects changed files in `content/blog/` (ignores `_index.md`)
2. Extracts frontmatter (title, draft status)
3. Converts markdown content to HTML using pandoc
4. Processes HTML:
   - Converts relative image paths to absolute URLs (`https://viruus.zip/images/`)
   - Removes footnote anchor links (email clients don't handle them well)
   - Strips `id` and `role` attributes from footnote elements
5. Creates Resend broadcast via API
6. Sends broadcast to appropriate segment

**Email format**:
- **From**: `dropalltables <blog@system.viruus.zip>`
- **Subject**: Post title (or `[DRAFT] Post title` for test emails)
- **HTML**: Converted markdown content

### Important Notes

- **No emails for updates**: Once a post is published (draft = "false"), subsequent updates won't trigger emails
- **Test segment**: Used for draft posts to test email formatting before publishing
- **Pandoc required**: GitHub Action installs pandoc for markdown-to-HTML conversion
- **Rate limits**: Resend free tier allows 3000 emails/month, 100/day, 1000 subscribers

## Deployment

Deployed to **Cloudflare Pages** (not Vercel).

- **Build command**: `hugo`
- **Output directory**: `public/`
- **Domain**: viruus.zip
- **Functions**: `functions/` directory contains Pages Functions

### Cloudflare Pages Setup

1. Connect repo to Cloudflare Pages
2. Set build command: `hugo`
3. Set output directory: `public/`
4. Add Analytics Engine binding in Pages settings:
   - Variable name: `ANALYTICS`
   - Dataset: `viruus_analytics`

### Git Workflow

```bash
# Clone with submodules (theme)
git clone --recurse-submodules https://github.com/dropalltables/viruus

# Update theme submodule
git submodule update --remote themes/hugo-bearblog
```

**Important**: The theme is a git submodule. Don't edit theme files directly.

## Common Tasks

### Adding a New Blog Post

1. Create post: `hugo new content/blog/my-post.md`
2. Edit content (post starts as draft)
3. Preview: `hugo server -D`
4. When ready to publish:
   - Change `draft = "true"` to `draft = "false"`
   - Update timestamp: `./datedooter.sh my-post`
5. Commit and push to `main`
6. GitHub Action will send email to production segment
7. Vercel will deploy updated site

### Testing Email Before Publishing

1. Create/edit post with `draft = "true"`
2. Commit and push to `main`
3. GitHub Action sends to test segment with `[DRAFT]` prefix
4. Review email
5. Make changes, push again (still sends to test segment)
6. When satisfied, change `draft = "false"` and push
7. Email sent to production segment

### Adding Custom Emoji

1. Add emoji image to `assets/images/emojis/` (e.g., `wave.gif`)
2. Use in content: `:wave.gif:`
3. Hugo will render as: `<img src="/images/emojis/wave.gif" alt="wave.gif" class="emoji">` (styling via `.emoji` class in `custom.css`)

### Updating Styles

1. Edit `static/custom.css`
2. Changes apply immediately (static file)
3. No build step needed for CSS

### Modifying Layouts

1. Override theme layouts in `layouts/` directory
2. Hugo will use local layouts over theme layouts
3. Test with `hugo server -D`
4. Common overrides:
   - `layouts/_default/single.html` - Single post template
   - `layouts/index.html` - Homepage
   - `layouts/partials/` - Partial templates

## Important Patterns and Gotchas

### Hugo-Specific

1. **Partial usage for emoji processing**:
   - Both `layouts/index.html` and `layouts/_default/single.html` use `{{- partial "process-emojis.html" .Content -}}`
   - Don't output `.Content` directly or emojis won't render

2. **Frontmatter format**: 
   - Uses TOML (`+++` delimiters)
   - String values can be quoted or unquoted
   - Draft posts use `draft = "true"` (string, not boolean)

3. **Asset paths**:
   - Static files: `/static/` → served as `/` (e.g., `/static/images/` → `/images/`)
   - Assets: `/assets/` → processed by Hugo, available via `resources.Get`
   - Emojis must be in `assets/images/emojis/` for processing

4. **Theme submodule**:
   - Don't edit files in `themes/hugo-bearblog/`
   - Override in local `layouts/` instead
   - Update theme: `git submodule update --remote`

5. **Taxonomies disabled**:
   - Tags are in frontmatter but taxonomy pages don't generate
   - Permalinks configured as "Bearblog-style": `/:slug/`

### Email System

1. **Draft vs. published logic**:
   - Workflow compares current and previous commit to detect draft→published transitions
   - Only sends production email on first publish or draft→published transition
   - Updates to published posts are silently skipped

2. **Image paths in emails**:
   - Relative paths (`/images/`) converted to absolute (`https://viruus.zip/images/`)
   - Ensure images are in `static/images/` not `assets/images/`

3. **Footnotes in emails**:
   - Anchor links removed automatically
   - Keep footnote content inline at bottom of post
   - Email clients don't support anchor navigation

4. **Email secrets**:
   - Production and test segments are separate
   - Test emails have `[DRAFT]` prefix in subject
   - Never commit API keys (use GitHub secrets)

### Content

1. **Minimal JavaScript philosophy**:
   - Avoid JavaScript where possible
   - Exception: Contact form uses Cloudflare Turnstile for spam protection
   - `/javascript` page warns users before they encounter JavaScript-enabled pages
   - Homepage links to `/javascript` which redirects to `/contact`
   - Cloudflare Workers handle form submissions (external to this repo)

2. **Contact form**:
   - Uses Cloudflare Turnstile widget (`data-sitekey="0x4AAAAAACCIH6LE-pwfc-u6"`)
   - Loads Turnstile script: `https://challenges.cloudflare.com/turnstile/v0/api.js`
   - Submits to `https://resender.viruus.zip/contact`
   - Hidden iframe prevents redirect after submission
   - Form fields: name, email, message
   - CSS ensures form elements display as block

3. **Emoji syntax**:
   - Must include file extension: `:wave.gif:` not `:wave:`
   - File must exist in `assets/images/emojis/`
   - Case-sensitive

4. **URL structure**:
   - Blog posts: `https://viruus.zip/post-slug/`
   - Pages: `https://viruus.zip/page-name/`
   - No `/blog/` prefix in URLs (Bearblog style)

### Deployment

1. **Build artifacts**:
   - `public/` directory is gitignored
   - Generated fresh on each deployment
   - Don't commit built files

2. **Submodules**:
   - Cloudflare Pages automatically fetches submodules
   - Ensure `.gitmodules` is committed and correct

## Dependencies

- **Hugo**: Static site generator (extended version)
- **hugo-bearblog**: Theme (git submodule)
- **Pandoc**: Markdown to HTML conversion (GitHub Actions only)
- **Resend**: Email service provider (external API)
- **Cloudflare Turnstile**: Spam protection for contact form (JavaScript widget)

## File Patterns to Recognize

- **Blog posts**: `content/blog/*.md` (excluding `_index.md`)
- **Pages**: `content/*.md` (including `contact.md` and `javascript.md`)
- **Images**: `static/images/**` (served as-is)
- **Emojis**: `assets/images/emojis/**` (processed)
- **Fonts**: `static/fonts/*.woff2`
- **Generated**: `public/`, `resources/`, `.hugo_build.lock` (gitignored)

## Testing Checklist

Before committing changes:

- [ ] Run `hugo server -D` and verify site builds without errors
- [ ] Check that all images load correctly
- [ ] Verify emoji rendering if content uses custom emojis
- [ ] Test responsive design (theme is responsive by default)
- [ ] If modifying email workflow:
  - [ ] Test with draft post first (sends to test segment)
  - [ ] Verify HTML rendering in email client
  - [ ] Check image paths are absolute in email
- [ ] If modifying layouts:
  - [ ] Ensure emoji processing is preserved
  - [ ] Check that theme overrides work as expected

## License

Copyright © 2025, dropalltables  
Licensed under GNU Affero General Public License v3.0

## Additional Context

- **Username reference**: "dropalltables" is a reference to [XKCD #327](https://xkcd.com/327/) (Bobby Tables SQL injection comic)
- **Resender project**: Email system is open-sourced at https://github.com/dropalltables/resender
- **Related services**: Uses Cloudflare Workers for form handling (not in this repo)
- **Blog post about email**: See `content/blog/email-is-hard.md` for detailed explanation of the email system architecture
