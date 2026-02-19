---
description: "Ready for social sharing? → Audits metadata, generates OG image + favicons, adds JSON-LD → Complete setup for all platforms"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep"]
---

## Context

Configure complete social sharing setup for: $ARGUMENTS

This command handles comprehensive social sharing configuration across all major platforms (LinkedIn, Twitter/X, Facebook, Slack, Discord, iMessage). It audits existing metadata, generates missing assets, and ensures your site previews correctly everywhere.

## Your Task

Execute all phases sequentially. Run unattended where possible - only prompt when critical information is missing.

---

### Phase 1: Audit

Scan the project to understand existing state. Report findings before making changes.

#### 1.1 Detect Framework

Check for framework indicators:

| Check | Framework |
|-------|-----------|
| `app/layout.tsx` with `metadata` export | Next.js App Router |
| `pages/_app.tsx` or `pages/_document.tsx` | Next.js Pages Router |
| `vite.config.*` + `index.html` | Vite |
| `index.html` only | Plain HTML |

#### 1.2 Locate Metadata Configuration

| Framework | Primary Location |
|-----------|------------------|
| Next.js App Router | `app/layout.tsx` → `metadata` export |
| Next.js Pages Router | `pages/_app.tsx` or `pages/_document.tsx` |
| Vite | `index.html` `<head>` section |
| Plain HTML | `index.html` `<head>` section |

#### 1.3 Scan Existing Metadata

Check for presence of:

**OpenGraph:**
- `og:title`
- `og:description`
- `og:image` (with width, height, alt)
- `og:url` (REQUIRED for LinkedIn)
- `og:type`
- `og:site_name`
- `og:locale`

**Twitter/X:**
- `twitter:card`
- `twitter:title`
- `twitter:description`
- `twitter:image`
- `twitter:creator`

**Assets:**
- OG image (`public/og-image.png`, `public/social-sharing.png`, etc.)
- Favicon (framework-dependent):
  - Next.js App Router: `app/favicon.ico`, `app/icon.png`
  - All others: `public/favicon.ico`, `public/favicon.png`
- Apple touch icon (framework-dependent):
  - Next.js App Router: `app/apple-icon.png`
  - All others: `public/apple-touch-icon.png`
- Logo source (`logo.svg`, `logo.png`)

**Structured Data:**
- JSON-LD scripts in `<head>` or layout

#### 1.4 Report Audit Results

Output a summary:

```
Scanning social metadata...

Framework: Next.js App Router
Metadata Location: app/layout.tsx

OpenGraph:
  [✓|✗] og:title
  [✓|✗] og:description
  [✓|✗] og:image
  [✓|✗] og:url (REQUIRED for LinkedIn)
  [✓|✗] og:type
  [✓|✗] og:site_name
  [✓|✗] og:locale

Twitter/X:
  [✓|✗] twitter:card
  [✓|✗] twitter:title
  [✓|✗] twitter:description
  [✓|✗] twitter:image
  [✓|✗] twitter:creator

Assets:
  [✓|✗] OG image
  [✓|✗] favicon.ico (check app/ for Next.js App Router, public/ otherwise)
  [✓|✗] apple-touch-icon.png / apple-icon.png
  [✓|✗] Logo source found

Structured Data:
  [✓|✗] JSON-LD present

Score: X/17 requirements met
```

---

### Phase 2: OG Image Generation

**Skip if:** An acceptable OG image already exists (1200x630px, recent, branded).

#### 2.1 Discover Branding

Look for:
- `**/branding.md`, `**/brand-guide.md`, `**/brand*.md`
- Design tokens, CSS variables with brand colors
- Existing logos (`logo.svg`, `logo.png`)
- Site title/tagline from package.json, config, or HTML

#### 2.2 Check for ImageMagick

```bash
which magick || which convert
```

#### 2.3 Generate OG Image

**If ImageMagick available and branding found:**

Use sensible defaults without prompting:
- **Dimensions:** 1200 × 630px
- **Background:** Primary brand color (solid or gradient)
- **Text:** Site name + tagline/description
- **Layout:** Centered, respecting 1080 × 566px safe zone

Example generation (adapt based on discovered colors):

```bash
magick -size 1200x630 \
  -define gradient:direction=east \
  gradient:'#primary-#secondary' \
  -gravity center \
  -font "Helvetica-Bold" -pointsize 72 \
  -fill white -annotate +0-50 "Site Name" \
  -font "Helvetica" -pointsize 36 \
  -fill white -annotate +0+50 "Tagline goes here" \
  public/og-image.png
```

**If no ImageMagick or no branding:**

Report what's missing and provide specs for manual creation:
- Dimensions: 1200 × 630px
- Safe zone: Center 1080 × 566px
- Recommended tools: Figma, Canva, or similar

---

### Phase 3: Favicon & Touch Icon Generation

**Skip if:** favicon.ico AND apple-touch-icon.png already exist.

#### 3.1 Find Logo Source

Priority order:
1. `logo.svg` (vector, best quality)
2. `logo.png` (raster, acceptable)
3. `icon.svg` or `icon.png`

#### 3.2 Determine Icon Destination

Based on detected framework from Phase 1:

| Framework | Favicon Location | Apple Icon Location |
|-----------|------------------|---------------------|
| Next.js App Router | `app/favicon.ico` | `app/apple-icon.png` |
| Next.js Pages Router | `public/favicon.ico` | `public/apple-touch-icon.png` |
| Vite | `public/favicon.ico` | `public/apple-touch-icon.png` |
| Plain HTML | `public/favicon.ico` | `public/apple-touch-icon.png` |

**IMPORTANT for Next.js App Router:**
If `app/favicon.ico` already exists (e.g., default Vercel favicon from create-next-app), it **MUST be replaced**. The `public/favicon.ico` will NOT override `app/favicon.ico` - Next.js App Router gives `app/` precedence.

#### 3.3 Generate Icons

**If logo found and ImageMagick available:**

**For Next.js App Router:**
```bash
# Favicon - MUST go in app/ to override default
# -background none preserves transparency from SVG
magick logo.svg -background none -resize 32x32 app/favicon.ico

# Apple touch icon - use app/ naming convention
magick logo.svg -background none -resize 180x180 app/apple-icon.png
```

**For all other frameworks:**
```bash
# Favicon - -background none preserves transparency
magick logo.svg -background none -resize 32x32 public/favicon.ico

# Apple touch icon
magick logo.svg -background none -resize 180x180 public/apple-touch-icon.png
```

**PWA icons (if manifest.json exists, always in public/):**
```bash
magick logo.svg -background none -resize 192x192 public/icon-192.png
magick logo.svg -background none -resize 512x512 public/icon-512.png
```

For PNG source, replace `logo.svg` with `logo.png`.

**If no logo found:**

Warn user and skip:
```
No logo source found. Skipping favicon generation.
To generate icons, add logo.svg or logo.png to your project root or public/ directory.
```

---

### Phase 4: Metadata Configuration

Update the project's metadata based on detected framework.

#### 4.1 Gather Required Information

If not discoverable, prompt ONCE for all missing info:
- **Site name:** (from package.json `name` or ask)
- **Site description:** (from package.json `description` or ask)
- **Production URL:** (from env, config, or ask)
- **Twitter handle:** (optional, ask if not found)

#### 4.2 Apply Metadata

**Next.js App Router (`app/layout.tsx`):**

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://your-domain.com'),
  title: 'Site Name',
  description: 'Site description',
  openGraph: {
    title: 'Site Name',
    description: 'Site description',
    url: 'https://your-domain.com',
    siteName: 'Site Name',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Site Name - Site description',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Site Name',
    description: 'Site description',
    creator: '@handle',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',  // served from app/favicon.ico in App Router
    apple: '/apple-icon.png',  // served from app/apple-icon.png in App Router
  },
};
```

**Vite / Plain HTML (`index.html`):**

```html
<!-- Primary Meta Tags -->
<title>Site Name</title>
<meta name="title" content="Site Name">
<meta name="description" content="Site description">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://your-domain.com/">
<meta property="og:title" content="Site Name">
<meta property="og:description" content="Site description">
<meta property="og:image" content="https://your-domain.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Site Name - Site description">
<meta property="og:site_name" content="Site Name">
<meta property="og:locale" content="en_US">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://your-domain.com/">
<meta name="twitter:title" content="Site Name">
<meta name="twitter:description" content="Site description">
<meta name="twitter:image" content="https://your-domain.com/og-image.png">
<meta name="twitter:creator" content="@handle">

<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

**Important:** All image URLs must be ABSOLUTE (include full domain) for external platforms.

---

### Phase 5: Structured Data (JSON-LD)

Add schema.org structured data based on detected project type.

#### 5.1 Detect Project Type

| Signal | Schema Types |
|--------|--------------|
| E-commerce (cart, checkout, products) | Organization + Product |
| Blog (posts/, articles/, blog/) | Organization + Blog |
| SaaS/Web App (app-like dependencies) | Organization + SoftwareApplication |
| Portfolio/Agency | Organization + WebSite |
| Default | Organization + WebSite |

#### 5.2 Generate JSON-LD

**Base (always include):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Site Name",
  "url": "https://your-domain.com/",
  "description": "Site description"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Organization Name",
  "url": "https://your-domain.com/",
  "logo": "https://your-domain.com/logo.png"
}
</script>
```

**SoftwareApplication (for web apps):**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "App Name",
  "applicationCategory": "WebApplication",
  "operatingSystem": "Web Browser",
  "url": "https://your-domain.com/",
  "description": "App description"
}
</script>
```

**Placement:**
- Next.js: Add to `app/layout.tsx` inside `<head>` via `<Script>` component or metadata
- Vite/HTML: Add before `</head>` in `index.html`

---

### Phase 6: Validation & Guidance

Provide testing resources and cache-busting instructions.

#### 6.1 Summary Output

```
Social sharing setup complete!

Changes made:
  [✓] OG image generated: public/og-image.png
  [✓] Favicon generated: app/favicon.ico (Next.js App Router) or public/favicon.ico
  [✓] Apple touch icon: app/apple-icon.png (Next.js App Router) or public/apple-touch-icon.png
  [✓] OpenGraph meta tags configured
  [✓] Twitter card meta tags configured
  [✓] JSON-LD structured data added

Test your previews:
  - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
  - Twitter Card Validator: https://cards-dev.twitter.com/validator
  - Facebook Debugger: https://developers.facebook.com/tools/debug/
  - General Preview: https://opengraph.xyz

Cache-busting (if updating existing site):
  - LinkedIn: Paste URL in Post Inspector, click "Inspect" to force refresh
  - Twitter: Validator automatically refreshes cache
  - Facebook: Click "Scrape Again" button
  - Slack: Wait ~30 minutes or re-paste the URL
  - iMessage: May require clearing conversation or device restart
  - Discord: Usually refreshes within minutes

Local preview:
  open public/og-image.png
```

---

## Platform Requirements Reference

| Platform | Required Tags | Image Size | Notes |
|----------|--------------|------------|-------|
| Twitter/X | twitter:card, twitter:image | 1200x630 | Falls back to OG |
| LinkedIn | og:url, og:image, og:title | 1200x630 | STRICT about og:url |
| Facebook | og:* tags | 1200x630 | Supports fb:app_id |
| Slack | og:* tags | 1200x630 | Picky about og:url |
| Discord | og:* tags | 1200x630 | Shows site_name |
| iMessage | og:* tags + favicon | 1200x630 | Uses favicon for bubble |

---

## Definition of Done

- [ ] Audit accurately detected existing metadata
- [ ] OG image created/verified at 1200x630px
- [ ] Favicons generated from logo (if logo available)
- [ ] All OpenGraph tags configured (including og:url, og:site_name, og:locale)
- [ ] All Twitter card tags configured
- [ ] JSON-LD structured data added based on project type
- [ ] URLs are absolute (not relative paths)
- [ ] Testing links and cache-busting guidance provided
