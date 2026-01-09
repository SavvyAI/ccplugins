---
description: "Rebuild any website? → Parity-first extraction → Elevated proof with modern polish (plugin:pro@ccplugins)"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebFetch", "AskUserQuestion", "mcp__plugin_pro_playwright__browser_navigate", "mcp__plugin_pro_playwright__browser_snapshot", "mcp__plugin_pro_playwright__browser_take_screenshot", "mcp__plugin_pro_playwright__browser_evaluate", "mcp__plugin_pro_playwright__browser_wait_for", "mcp__plugin_pro_playwright__browser_close", "mcp__plugin_pro_playwright__browser_resize", "mcp__plugin_pro_playwright__browser_console_messages", "mcp__plugin_pro_playwright__browser_click", "mcp__plugin_pro_playwright__browser_hover", "mcp__plugin_pro_shadcn-ui__get_component", "mcp__plugin_pro_shadcn-ui__get_component_demo", "mcp__plugin_pro_shadcn-ui__list_components"]
---

# Permissionless Proof Pipeline

Run a complete website rebuild pipeline for cold outreach. Produces a high-fidelity parity version first, then an elevated version with modern polish.

**ultrathink:** This pipeline requires careful analysis of the source website's structure, content hierarchy, and visual design. Faithfully extract all elements before any transformation. The parity guarantee depends on complete understanding of the original.

## Core Guarantees

1. **Parity first** - Rebuild matches original structure before any elevation
2. **No content invention** - All copy comes from the source
3. **No tone shift** - Never convert to "agency" marketing speak
4. **SEO preservation** - Original meta tags, structured data intact
5. **Conversion path safety** - CTAs, forms, phone numbers unchanged

---

## PARITY MODE (Critical Constraint)

During PARITY and AUTO-VERIFY phases, operate under these **non-negotiable constraints**:

```
You are not allowed to design.
You are not allowed to interpret.
You are not allowed to improve.
You are not allowed to simplify.
You are only allowed to COPY until no structural or visual differences remain.
If any difference exists, you must continue.

You may not declare completion.
You may only stop when parity is absolute.
```

**What this means:**

| Forbidden | Required |
|-----------|----------|
| "Similar layout" | Identical section count and order |
| "Comparable styling" | Exact colors, exact fonts, exact spacing |
| "Placeholder image" | Actual image from source URL |
| "Simplified structure" | Every DOM element reproduced |
| "98% parity" | 100% structural match or continue iterating |
| "Good enough" | Identical or not done |

**The model behaves like:**
- A meticulous junior dev
- With zero taste
- Zero creativity
- Zero initiative

**Just:** Copy. Do not interpret. Do not improve. Do not simplify.

**Parity is not creative work. It's clerical work with teeth.**

---

## Input

```
/pro:permissionless-proof <url> [output-dir]
```

- `<url>` - The website to rebuild (required)
- `[output-dir]` - Where to create the project (optional, defaults to `proof-{domain-slug}`)

**Examples:**
```bash
# Create in auto-derived directory (recommended)
/pro:permissionless-proof https://www.gardensdentistrypb.com/
# → Creates: proof-gardens-dentistry-pb/

# Create in a specific subdirectory
/pro:permissionless-proof https://www.gardensdentistrypb.com/ ./my-proof

# Explicit current directory (not recommended)
/pro:permissionless-proof https://www.gardensdentistrypb.com/ .
```

---

## Pre-Execution Validation

### Validate URL

```bash
# Extract domain for directory naming
echo "$ARGUMENTS" | grep -oE '[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}' | head -1
```

If URL is invalid or unreachable: **ABORT** with clear message.

### Parse Arguments

```bash
# Extract URL (first argument)
URL=$(echo "$ARGUMENTS" | awk '{print $1}')

# Extract domain for naming/reference
DOMAIN=$(echo "$URL" | grep -oE '[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}' | head -1 | sed 's/www\.//')
```

### Derive Domain Slug

Generate a URL-safe, human-readable, GitHub Pages-friendly directory name:

```bash
# Extract domain, remove www and TLD
DOMAIN_RAW=$(echo "$URL" | sed -E 's|https?://||' | sed 's|/.*||' | sed 's/^www\.//')
DOMAIN_NO_TLD=$(echo "$DOMAIN_RAW" | sed -E 's/\.[a-z]{2,}$//')

# Convert camelCase and concatenated words to hyphenated
# Insert hyphens at word boundaries (lowercase-uppercase, letter-number)
DOMAIN_SLUG=$(echo "$DOMAIN_NO_TLD" | \
  sed -E 's/([a-z])([A-Z])/\1-\2/g' | \
  tr '[:upper:]' '[:lower:]' | \
  sed 's/[^a-z0-9]/-/g' | \
  sed 's/--*/-/g' | \
  sed 's/^-//' | \
  sed 's/-$//')

# Apply prefix for output directory default
OUTPUT_DIR_DEFAULT="proof-${DOMAIN_SLUG}"
```

**Examples:**
| Input URL | Derived Slug |
|-----------|--------------|
| `https://www.ramanidentistryfl.com` | `proof-ramani-dentistry-fl` |
| `https://gardensdentistrypb.com` | `proof-gardens-dentistry-pb` |
| `https://SmithLawFirm.com` | `proof-smith-law-firm` |

### Resolve Output Directory

```bash
# Extract user-specified output dir (second argument)
USER_OUTPUT_DIR=$(echo "$ARGUMENTS" | awk '{print $2}')

# Use user-specified or auto-derived default
if [ -z "$USER_OUTPUT_DIR" ]; then
  OUTPUT_DIR="$OUTPUT_DIR_DEFAULT"
elif [ "$USER_OUTPUT_DIR" = "." ]; then
  OUTPUT_DIR="."
else
  OUTPUT_DIR="$USER_OUTPUT_DIR"
fi
```

### Check Output Directory

```bash
if [ "$OUTPUT_DIR" != "." ] && [ -d "$OUTPUT_DIR" ]; then
  echo "exists"
elif [ "$OUTPUT_DIR" = "." ] && [ -f "package.json" ]; then
  echo "has-existing-project"
else
  echo "available"
fi
```

If exists: Use `AskUserQuestion` - "Output directory already exists. Overwrite?"
If has-existing-project: Use `AskUserQuestion` - "Current directory has an existing project. Continue anyway?"

### Check Prerequisites

```bash
# Node.js version
node --version 2>/dev/null || echo "node-missing"

# npm available
npm --version 2>/dev/null || echo "npm-missing"
```

If Node.js < 18 or missing: **ABORT** - "Node.js 18+ required. Install from https://nodejs.org/"

---

## Phase 1: ACQUIRE (Faithful Extraction)

> Purpose: Capture everything needed to rebuild the site faithfully.

### 1.1 Initial Fetch

**Tier 1: WebFetch**

Use `WebFetch` to get initial HTML and analyze structure:
- Page title and meta description
- Section headings and hierarchy
- Navigation structure
- Footer content
- Contact information

If WebFetch returns blocked/rate-limited content, proceed to Tier 2.

**Tier 2: Playwright Browser Automation**

Use Playwright MCP to capture JS-rendered content:

```
mcp__plugin_pro_playwright__browser_navigate: {url}
mcp__plugin_pro_playwright__browser_wait_for: {text: some visible text}
mcp__plugin_pro_playwright__browser_snapshot
```

**Tier 3: User Paste Fallback**

If both tiers fail, ask user to paste the page content manually.

### 1.1.5 HTML/DOM Extraction (Critical for Parity)

**This is the source of truth for PARITY phase.** Do not rely on screenshots for structure.

Using Playwright MCP, extract the actual HTML:

```
mcp__plugin_pro_playwright__browser_evaluate: {
  function: "(() => document.documentElement.outerHTML)()"
}
```

Save the raw HTML to `{OUTPUT_DIR}/source/index.html`.

Then extract structural metadata:

```
mcp__plugin_pro_playwright__browser_evaluate: {
  function: `(() => {
    const sections = Array.from(document.querySelectorAll('section, header, footer, main, main > div, [class*="section"], [class*="hero"], [class*="banner"]'))
      .filter(el => el.offsetHeight > 100)
      .map((el, i) => ({
        index: i,
        tagName: el.tagName,
        id: el.id || null,
        className: el.className || null,
        hasBackgroundImage: !!getComputedStyle(el).backgroundImage.match(/url\\(/),
        backgroundColor: getComputedStyle(el).backgroundColor,
        images: Array.from(el.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.naturalWidth,
          height: img.naturalHeight
        })),
        headings: Array.from(el.querySelectorAll('h1, h2, h3')).map(h => ({
          level: h.tagName,
          text: h.textContent.trim()
        })),
        ctas: Array.from(el.querySelectorAll('a[href], button')).filter(b =>
          b.textContent.trim().length > 0 && b.textContent.trim().length < 50
        ).map(b => ({
          text: b.textContent.trim(),
          href: b.href || null
        }))
      }));

    const designTokens = {
      bodyFont: getComputedStyle(document.body).fontFamily,
      bodyColor: getComputedStyle(document.body).color,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      linkColor: getComputedStyle(document.querySelector('a') || document.body).color
    };

    return { sections, designTokens, sectionCount: sections.length };
  })()`
}
```

Save to `{OUTPUT_DIR}/source/structure.json`.

**This structure.json is the PARITY CONTRACT:**
- Section count MUST match in rebuild
- Every image URL MUST be downloaded and used
- Every heading MUST appear verbatim
- Background treatments MUST match (image vs color)

### 1.2 Structure Analysis

From the captured content, identify and document:

**Navigation:**
- Logo (image or text)
- Menu items with links
- Mobile menu trigger (if visible)

**Sections (in order):**
For each major section, note:
- Section type (hero, services, about, testimonials, contact, etc.)
- Heading text
- Body content summary
- Images present
- CTAs (buttons, links)
- Forms (fields, action)

**Footer:**
- Contact info (phone, email, address)
- Social links
- Copyright text
- Additional nav links

**Meta Information:**
- Page title
- Meta description
- OG tags (title, description, image)
- Favicon reference
- Structured data (JSON-LD)

### 1.3 CHECK (Interaction Audit)

> Purpose: Surface real user-facing failures on the source site through read-only interaction simulation.

**ultrathink:** This phase requires careful interaction analysis. Attempt clicks, scrolls, and focus events systematically across viewports. Log failures with precise technical details and operator-friendly translations. Evidence captured here will appear in subsequent screenshots.

**Constraints:**
- No destructive actions
- No form submissions that transmit data
- No authentication bypass
- Read-only observation only

#### 1.3.1 Viewport Testing Matrix

Test across three viewports:

| Viewport | Width | Height | Purpose |
|----------|-------|--------|---------|
| Desktop | 1440 | 900 | Primary business view |
| Tablet | 768 | 1024 | iPad/tablet breakpoint |
| Mobile | 375 | 812 | iPhone 12/13 size |

#### 1.3.2 Navigation Testing

For each viewport:

1. Identify all visible top-level navigation links via snapshot
2. Attempt click on each link:
   - Record if navigation occurs (URL change)
   - Record if no-op (click produces no change)
   - Capture console errors immediately after click:
   ```
   mcp__plugin_pro_playwright__browser_console_messages: {level: "error"}
   ```
3. If mobile menu toggle visible:
   - Attempt toggle click
   - Record if menu opens/closes
   - Capture before/after screenshots of toggle

**Failure conditions:**
- Link click produces no navigation and no UI feedback
- Mobile menu toggle does not open menu
- Navigation link unreachable on mobile but works on desktop

#### 1.3.3 CTA Testing

For each viewport:

1. Identify all visible CTAs (buttons, links with action intent)
2. For each CTA:
   - Use snapshot to check if element is present and not obstructed
   - Estimate tap target size (should be minimum 44×44px for mobile)
   - Attempt hover (desktop) to verify state change exists
   - Capture before/after screenshots if failure detected

**Failure conditions:**
- CTA hidden, clipped, or obstructed at viewport
- CTA click produces no feedback
- CTA tap target below 44×44px on mobile

#### 1.3.4 Scroll Testing

For each viewport:

1. Scroll full page height using evaluate:
   ```
   mcp__plugin_pro_playwright__browser_evaluate: {function: "window.scrollTo(0, document.body.scrollHeight)"}
   ```
2. During scroll observation, detect:
   - Horizontal overflow (horizontal scrollbar on mobile)
   - Visible layout shifts
3. Check for sticky elements blocking content

**Failure conditions:**
- Horizontal scroll required on mobile
- Sticky header covers significant content when scrolled
- Visible layout shift during scroll

#### 1.3.5 Form Testing (Non-Destructive)

For visible forms:

1. Focus first available input field
2. On mobile: assess if keyboard would overlap submit button
3. Check for placeholder text and labels
4. **Do NOT submit or enter actual data**

**Failure conditions:**
- Input focus triggers no visual feedback
- Form lacks visible labels or placeholders
- Mobile keyboard would overlap submit button

#### 1.3.6 Interactive UI Testing

For menus, modals, accordions:

1. Identify interactive triggers via snapshot
2. Attempt open trigger (click/tap)
3. Record if UI element appears
4. Capture before/after screenshots

**Failure conditions:**
- Menu/modal/accordion fails to open
- Open state clips outside viewport

#### 1.3.7 Dead-End Detection

After interaction testing, identify:

1. Page states with no visible CTA, form, or onward link
2. Post-interaction states with no feedback or guidance

Log as: "User reaches this state with no clear next step"

#### 1.3.8 Trust Signal Detection

Lightweight checks only:

| Signal | Detection |
|--------|-----------|
| Copyright year | Compare footer year to current year (${new Date().getFullYear()}) |
| Privacy/Terms | Check if links exist and are not 404 |
| SSL | Confirm HTTPS (already known from URL) |
| Form feedback | Check if forms have visible confirmation patterns |

**Detection only when obvious.** Do not over-index on this section.

#### 1.3.9 Generate Interaction Artifacts

Save to `{OUTPUT_DIR}/screenshots/check/`:

```
check/
├── interaction-log.json       # Timestamped log of all interactions
├── issues.json                # Detected issues with translations
├── desktop/
│   ├── nav-001-before.png
│   ├── nav-001-after.png
│   └── ...
├── tablet/
│   └── ...
└── mobile/
    └── ...
```

**interaction-log.json structure:**

```json
{
  "timestamp": "ISO-8601",
  "source": "{url}",
  "viewports": ["desktop", "tablet", "mobile"],
  "interactions": [
    {
      "id": "nav-001",
      "viewport": "mobile",
      "action": "click",
      "target": "Mobile menu toggle",
      "result": "no_change",
      "consoleErrors": [],
      "screenshots": {
        "before": "mobile/nav-001-before.png",
        "after": "mobile/nav-001-after.png"
      }
    }
  ]
}
```

**issues.json structure:**

```json
{
  "issues": [
    {
      "id": "issue-001",
      "area": "Navigation",
      "viewport": "mobile",
      "technical": "Mobile menu toggle click produces no state change",
      "operator": "Mobile visitors cannot open the navigation menu",
      "severity": "high",
      "evidence": {
        "screenshot": "mobile/nav-001-after.png",
        "consoleError": null
      }
    }
  ]
}
```

**Operator Translation Examples:**

| Technical | Operator Translation |
|-----------|---------------------|
| CTA unreachable due to z-index overlap | Mobile visitors cannot tap your primary action |
| Mobile menu toggle produces no state change | Mobile visitors cannot open the navigation menu |
| Horizontal overflow detected at 375px viewport | Mobile visitors must scroll sideways to see content |
| Form input lacks focus feedback | Visitors may not know which field is active |
| Copyright year is 2023, current is 2026 | Footer shows outdated copyright year |

#### 1.3.10 Content & Copy Audit

> Purpose: Surface content opportunities for cold outreach talking points. These are NOT technical failures—they're sales ammunition.

**Be aggressive here.** Every real website has improvement opportunities. If you find zero issues, you're not looking hard enough.

| Check | What to Look For | Severity |
|-------|------------------|----------|
| **Headline Clarity** | Is the value proposition clear in <5 words? Generic ("Welcome to X") = issue | medium |
| **CTA Specificity** | Are CTAs action-oriented? "Submit" or "Click Here" = weak | medium |
| **Social Proof** | Are testimonials, reviews, or trust badges visible above the fold? | high |
| **Credibility Signals** | Are credentials, certifications, awards, years in business displayed? | medium |
| **Urgency/Scarcity** | Any time-limited offers or availability signals? (Often missing) | low |
| **Mobile Copy** | Is copy scannable? Long paragraphs on mobile = problem | medium |
| **Contact Visibility** | Is phone number visible without scrolling? (Critical for local business) | high |
| **Image Quality** | Are images professional? Stock photos vs real team/location? | medium |
| **Differentiation** | What makes this business different? Is it stated clearly? | high |

**Output format:**

```json
{
  "contentIssues": [
    {
      "area": "Hero",
      "issue": "Generic headline 'Welcome to Gardens Dentistry' doesn't communicate value",
      "opportunity": "Could highlight unique differentiator (aesthetic focus, specific technology, etc.)",
      "severity": "medium"
    },
    {
      "area": "Above the fold",
      "issue": "No testimonials or review count visible without scrolling",
      "opportunity": "Adding '5-star rating' badge or testimonial snippet would boost trust immediately",
      "severity": "high"
    }
  ]
}
```

**Operator-friendly summary:**

For each content issue, provide a one-sentence talking point the operator can use in outreach:

> "Your homepage headline could be doing more work—right now it says 'Welcome' but doesn't tell visitors what makes you different from the dentist down the street."

**Note:** Content audit findings inform the ELEVATE phase but do NOT block PARITY. These are opportunities, not requirements.

#### 1.3.11 CHECK Summary

Present findings:

```
CHECK Phase Complete
────────────────────────────────────────

Source: {url}

TECHNICAL ISSUES: {count}
────────────────────────────────────────
Desktop ({count}):
  • {operator description} [{severity}]

Tablet ({count}):
  • {operator description} [{severity}]

Mobile ({count}):
  • {operator description} [{severity}]

Dead Ends: {count}
Trust Signals: {count} issues

CONTENT OPPORTUNITIES: {count}
────────────────────────────────────────
  • {area}: {issue} [{severity}]
  • {area}: {issue} [{severity}]
  • {area}: {issue} [{severity}]

OUTREACH TALKING POINTS:
────────────────────────────────────────
  1. "{operator-friendly content opportunity}"
  2. "{operator-friendly content opportunity}"
  3. "{operator-friendly content opportunity}"

Evidence saved to: screenshots/check/

────────────────────────────────────────
```

**Note:** CHECK phase is informational. Proceed to screenshot capture regardless of findings.

**IMPORTANT:** If you found ZERO issues (technical + content), you did not look hard enough. Re-run the audit with more scrutiny. Every production website has room for improvement.

### 1.4 Screenshot Capture

Using Playwright MCP, capture screenshots across all viewports:

**Desktop Full Page (1440×900):**
```
mcp__plugin_pro_playwright__browser_resize: {width: 1440, height: 900}
mcp__plugin_pro_playwright__browser_take_screenshot: {fullPage: true, filename: "source-desktop-full.png"}
```

**Desktop Viewport (Hero):**
```
mcp__plugin_pro_playwright__browser_take_screenshot: {filename: "source-desktop-hero.png"}
```

**Tablet Full Page (768×1024):**
```
mcp__plugin_pro_playwright__browser_resize: {width: 768, height: 1024}
mcp__plugin_pro_playwright__browser_take_screenshot: {fullPage: true, filename: "source-tablet-full.png"}
```

**Mobile Full Page (375×812):**
```
mcp__plugin_pro_playwright__browser_resize: {width: 375, height: 812}
mcp__plugin_pro_playwright__browser_take_screenshot: {fullPage: true, filename: "source-mobile-full.png"}
```

Store in `{OUTPUT_DIR}/screenshots/source/`.

**Optional: WebKit Browser Pass**

If WebKit is available (graceful degradation if not):

```bash
# Check if WebKit is available via Playwright
# If available, repeat mobile screenshot capture with WebKit
# If unavailable, log warning and continue
echo "Note: WebKit browser pass skipped (not available)"
```

### 1.5 Asset Identification

List all assets to download:
- Hero images
- Section background images
- Logo files
- Icon images
- Team/staff photos

Note: Don't download at this phase. Document URLs for later.

### 1.6 Auth Wall Detection

Check for:
- Login forms blocking content
- Password-protected pages
- Age verification gates
- Cookie consent blocking content

If detected, use `AskUserQuestion`:
"This page has gated content. Should I proceed with visible content only, or do you have credentials to access more?"

### 1.7 Acquire Summary

Present findings to user:

```
ACQUIRE Phase Complete
════════════════════════════════════════

Source: {url}
Title: {page title}

Sections Detected: {count}
  1. Hero - "{headline text}"
  2. Services - {count} items
  3. About - "{heading}"
  4. Testimonials - {count} reviews
  5. Contact - Form + Map
  6. Footer

Assets Found:
  Images: {count}
  Forms: {count}
  Maps: {yes/no}

Screenshots captured: 4 (desktop, tablet, mobile, hero)

────────────────────────────────────────
CHECK Results: {issue_count} issues detected
────────────────────────────────────────

  Desktop: {count} issues
  Tablet:  {count} issues
  Mobile:  {count} issues

Top Issues:
  • {operator description} [{severity}]
  • {operator description} [{severity}]
  • {operator description} [{severity}]

Evidence saved to: screenshots/check/

DOM Structure: {sectionCount} sections extracted
Parity Contract: source/structure.json

════════════════════════════════════════
```

**Automatic transition to PARITY phase.** No confirmation required.

---

## Phase 2: PARITY (Strict Mode Rebuild)

> Purpose: Create a React rebuild that is **structurally identical** to the original.
>
> **REMEMBER PARITY MODE:** You are not allowed to design, interpret, improve, or simplify. Copy until identical.

### 2.1 Create Project Scaffold

```bash
# OUTPUT_DIR was set in Parse Arguments phase (defaults to "proof-{domain-slug}")

if [ "$OUTPUT_DIR" != "." ]; then
  mkdir -p "$OUTPUT_DIR"
fi
cd "$OUTPUT_DIR"

# Create Vite + React + TypeScript project
npm create vite@latest . -- --template react-ts --yes

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Write `vite.config.ts` with GitHub Pages base path:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages deploys to /{repo-name}/ subpath
// OUTPUT_DIR matches the repo name for consistent URLs
export default defineConfig({
  plugins: [react()],
  base: '/${OUTPUT_DIR}/',
})
```

**Note:** Replace `${OUTPUT_DIR}` with the actual directory name (e.g., `proof-gardens-dentistry`). This ensures assets load correctly on GitHub Pages.

### 2.2 Add Package Scripts

Update `package.json` to include all required scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && npx gh-pages -d dist",
    "deploy:init": "git init && git add . && git commit -m 'Initial commit' && gh repo create ${OUTPUT_DIR} --public --source=. --push && npm run deploy",
    "open": "PAGES_URL=\"https://$(gh api user -q .login).github.io/${OUTPUT_DIR}/\" && echo \"$PAGES_URL\" | pbcopy && echo \"Copied: $PAGES_URL\" && open \"$PAGES_URL\""
  }
}
```

**Note:** Replace `${OUTPUT_DIR}` with the actual directory name (e.g., `proof-gardens-dentistry`).

**Script behaviors:**

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start local development server |
| `npm run build` | Build production bundle |
| `npm run deploy` | Build + deploy to existing GitHub Pages |
| `npm run deploy:init` | Initialize git, create GitHub repo, push, deploy |
| `npm run open` | Copy GitHub Pages URL to clipboard + open in browser |

The user workflow is:
1. `npm run deploy:init` - First time: creates GitHub repo and deploys
2. `npm run open` - Opens deployed site, URL ready to paste in email
3. `npm run deploy` - Subsequent deploys after changes

### 2.3 Configure Tailwind

Write `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Extract from source site
        primary: '{primary color}',
        secondary: '{secondary color}',
      },
      fontFamily: {
        // Match source fonts or close equivalents
        display: ['{display font}', 'sans-serif'],
        body: ['{body font}', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base styles extracted from source */
```

### 2.4 Create Directory Structure

```bash
mkdir -p src/components
mkdir -p src/assets/images
mkdir -p public/evidence
mkdir -p screenshots/source
mkdir -p screenshots/check
```

Write `.gitignore`:

```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
.vite/
```

**Note:** Do not overwrite if `.gitignore` already exists.

### 2.5 Download Assets

For each identified asset:

```bash
# Download images to src/assets/images/
curl -o src/assets/images/{filename} "{url}"
```

Or use Bash with appropriate headers if needed.

### 2.6 Generate Components

For each section identified in ACQUIRE phase, create a component:

**Example: HeroSection.tsx**

```tsx
export function HeroSection() {
  return (
    <section className="relative">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content - EXACT copy from source */}
      <div className="relative container mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          {/* Exact headline from source */}
        </h1>
        <p className="mt-4 text-xl text-white/90 max-w-2xl">
          {/* Exact subheadline from source */}
        </p>
        <a
          href="{original CTA link}"
          className="mt-8 inline-block bg-primary text-white px-8 py-4 rounded"
        >
          {/* Exact button text */}
        </a>
      </div>
    </section>
  )
}
```

**CRITICAL RULES for component generation:**

1. **Copy verbatim** - All text must match the source exactly
2. **Preserve order** - Sections appear in same order as source
3. **Match density** - Same number of items, cards, testimonials
4. **Keep links** - Preserve original href values
5. **No additions** - Do not add sections, features, or content
6. **No simplification** - If source has 6 services, create 6 service cards

### 2.7 Create Navigation Component

```tsx
// src/components/Navigation.tsx
export function Navigation() {
  return (
    <nav className="...">
      {/* Logo - exact same as source */}
      {/* Menu items - exact same text and links */}
      {/* Mobile menu - if source has one */}
    </nav>
  )
}
```

### 2.8 Create Footer Component

```tsx
// src/components/Footer.tsx
export function Footer() {
  return (
    <footer className="...">
      {/* Contact info - exact */}
      {/* Social links - exact */}
      {/* Copyright - exact */}
    </footer>
  )
}
```

### 2.9 Create App.tsx

```tsx
import { Navigation } from './components/Navigation'
import { HeroSection } from './components/HeroSection'
// ... import all sections
import { Footer } from './components/Footer'

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        {/* All sections in exact order */}
      </main>
      <Footer />
    </div>
  )
}

export default App
```

### 2.10 Update index.html

Preserve original meta tags:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{Original title}</title>
    <meta name="description" content="{Original description}" />

    <!-- OG Tags from source -->
    <meta property="og:title" content="{...}" />
    <meta property="og:description" content="{...}" />
    <meta property="og:image" content="{...}" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 2.11 Build and Verify

```bash
npm run build
```

If build errors: Fix them before proceeding. Do not continue with broken build.

Report: `[PASS] Parity build complete`

### 2.12 Initialize Git Repository

```bash
cd "$OUTPUT_DIR"

# Check if git is available
if command -v git &> /dev/null; then
  # Initialize if not already a git repo
  if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit: proof scaffold for ${DOMAIN}

Generated by /pro:permissionless-proof
Source: ${URL}"
    echo "[PASS] Git repository initialized with initial commit"
  fi
else
  echo "Warning: git not available, skipping repository initialization"
fi
```

**Note:** Git initialization is automatic and requires no user input. The generated site is a versioned artifact by default.

---

## Phase 3: AUTO-VERIFY (Automated Visual Parity Loop)

> Purpose: Automatically verify and improve parity until 99%+ match or exit conditions met.

**ultrathink:** This phase requires careful visual analysis of screenshots. Compare source and parity systematically: layout structure, colors, typography, spacing, images, and content. Identify specific gaps with actionable fix recommendations.

### 3.1 Start Dev Server

```bash
cd "$OUTPUT_DIR"
npm run dev &
DEV_PID=$!
sleep 3  # Wait for server to start
```

### 3.2 Initialize Verification Loop

Set up iteration tracking:

```
ITERATION=0
MAX_ITERATIONS=10
SCORE_HISTORY=[]
CONSECUTIVE_LOW_IMPROVEMENT=0
LOW_IMPROVEMENT_THRESHOLD=1  # percent
```

Create iteration history directory:

```bash
mkdir -p "$OUTPUT_DIR/screenshots/verify-iterations"
```

### 3.3 Capture Parity Screenshot

**[LOOP START]**

Increment iteration and capture current state:

```bash
ITERATION=$((ITERATION + 1))
mkdir -p "$OUTPUT_DIR/screenshots/verify-iterations/iteration-$(printf '%03d' $ITERATION)"
```

Using Playwright MCP on the local dev server:

```
mcp__plugin_pro_playwright__browser_navigate: http://localhost:5173
mcp__plugin_pro_playwright__browser_resize: {width: 1440, height: 900}
mcp__plugin_pro_playwright__browser_take_screenshot: {fullPage: true, filename: "screenshots/verify-iterations/iteration-{NNN}/parity.png"}
```

### 3.4 Structural Verification (Not Vision Scoring)

**Do NOT use subjective percentage scoring.** Use structural verification against the PARITY CONTRACT (`source/structure.json`).

#### 3.4.1 Extract Rebuild Structure

Using Playwright on the dev server, extract the rebuild's structure:

```
mcp__plugin_pro_playwright__browser_evaluate: {
  function: `(() => {
    const sections = Array.from(document.querySelectorAll('section, header, footer, main, main > div, [class*="section"], [class*="hero"], [class*="banner"]'))
      .filter(el => el.offsetHeight > 100)
      .map((el, i) => ({
        index: i,
        tagName: el.tagName,
        hasBackgroundImage: !!getComputedStyle(el).backgroundImage.match(/url\\(/),
        backgroundColor: getComputedStyle(el).backgroundColor,
        imageCount: el.querySelectorAll('img').length,
        headingCount: el.querySelectorAll('h1, h2, h3').length,
        ctaCount: el.querySelectorAll('a[href], button').length
      }));
    return { sections, sectionCount: sections.length };
  })()`
}
```

#### 3.4.2 Compare Against Parity Contract

For each section in `source/structure.json`, verify the rebuild matches:

```
STRUCTURAL VERIFICATION CHECKLIST:
────────────────────────────────────────
For each section (source vs rebuild):

□ Section exists at same index
□ Background treatment matches:
  - If source has background IMAGE → rebuild MUST have background image
  - If source has solid color → rebuild MUST have same/similar color
□ Image count matches (±0)
□ Heading count matches (±0)
□ CTA count matches (±0)

Global checks:
□ Total section count matches EXACTLY
□ All source images are present (no placeholders)
□ Hero section has same layout type (full-bleed vs contained)
────────────────────────────────────────
```

Produce a PASS/FAIL report:

```json
{
  "allPassed": false,
  "totalSections": { "source": 12, "rebuild": 10, "pass": false },
  "failures": [
    {
      "section": 0,
      "name": "Hero",
      "check": "backgroundImage",
      "source": true,
      "rebuild": false,
      "fix": "Hero must have background image. Source has team photo at [URL]. Download and use as background-image."
    },
    {
      "section": 3,
      "name": "Services",
      "check": "missing",
      "source": "exists",
      "rebuild": "missing",
      "fix": "Section 3 (Services) is completely missing. Create ServicesSection component matching source structure."
    }
  ],
  "passes": [
    { "section": 1, "name": "About", "allChecks": true }
  ]
}
```

**CRITICAL:** If `allPassed` is false, you MUST continue iterating. You may NOT declare completion.

#### 3.4.3 Visual Cross-Check

After structural verification, also compare screenshots visually:

1. **Read the source screenshot**: `screenshots/source/source-desktop-full.png`
2. **Read the parity screenshot**: `screenshots/verify-iterations/iteration-{NNN}/parity.png`

Look for differences NOT caught by structural checks:
- Color mismatches (exact hex values)
- Spacing/padding differences
- Font mismatches
- Image positioning

Add any visual failures to the report.

Save the report:

```bash
echo '{report JSON}' > "$OUTPUT_DIR/screenshots/verify-iterations/iteration-{NNN}/report.json"
```

### 3.5 Check Exit Conditions

**Condition 1: SUCCESS (ALL checks pass)**

```
if report.allPassed == true AND report.failures.length == 0:
  LOG: "✓ PARITY ACHIEVED - All structural checks pass"
  GOTO 3.8 (Stop Dev Server)
```

**Condition 2: MAX ITERATIONS (safety cap)**

```
if ITERATION >= MAX_ITERATIONS:
  LOG: "⚠ Max iterations ({MAX_ITERATIONS}) reached"
  LOG: "Remaining failures: {failures.length}"
  GOTO 3.7 (User Decision)
```

**Otherwise: MUST continue iterating**

```
# You may NOT declare completion if failures exist
GOTO 3.6 (Apply Fixes)
```

**NOTE:** There is no "diminishing returns" exit. If failures exist, you continue. Parity is not creative work—it's clerical work with teeth.

### 3.6 Apply Fixes and Rebuild

For each failure identified in the structural verification (prioritized: missing sections first, then background mismatches, then counts):

1. **Identify the component file** from the failure's section description
2. **Apply the fix** specified in the failure report using Edit tool
3. **Track the fix** for the iteration report

After applying fixes:

```bash
# Rebuild the project
cd "$OUTPUT_DIR"
npm run build

# If build fails, revert last fix and try next failure
# If all fixes cause build failures, proceed to 3.7
```

Log iteration summary:

```
Iteration {N} Complete
────────────────────────────────────────
Failures remaining: {failures.length}
Passes: {passes.length}
Fixes applied: {count}
────────────────────────────────────────
```

**GOTO 3.3** (capture new screenshot and re-verify)

### 3.7 User Decision

Present the current state when max iterations reached (the ONLY non-success exit):

```
AUTO-VERIFY Complete (Max Iterations)
════════════════════════════════════════

Iterations: {ITERATION}
Exit Reason: Max iterations ({MAX_ITERATIONS}) reached

Structural Verification Status:
  Total Sections: {source} expected, {rebuild} built
  Passes: {passes.length}
  Failures: {failures.length}

Remaining Failures:
  • {section}: {check} - {fix}
  • {section}: {check} - {fix}
  ...

Iteration history saved to:
  screenshots/verify-iterations/

════════════════════════════════════════
```

Use `AskUserQuestion`:
- **"Proceed to ELEVATE anyway"** - Continue with incomplete parity (user accepts risk)
- **"Abort"** - Stop the pipeline, user will fix manually

If user chooses "Abort":
- Stop dev server
- Exit pipeline with summary of what was achieved
- Do NOT proceed to ELEVATE

### 3.8 Stop Dev Server

```bash
kill $DEV_PID 2>/dev/null
```

Save final verification summary:

```bash
cat > "$OUTPUT_DIR/screenshots/verify-iterations/summary.json" << EOF
{
  "allPassed": {report.allPassed},
  "iterations": {ITERATION},
  "exitReason": "{success | max_iterations | user_abort}",
  "failureCount": {failures.length},
  "passCount": {passes.length},
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
```

Report: `[PASS] Auto-verify complete: {passes.length}/{totalSections} sections verified in {N} iterations`

---

## Phase 4: ELEVATE (Modern Polish)

> Purpose: Apply tasteful improvements while preserving content and conversion paths.

### 4.1 Install Enhancement Dependencies

```bash
cd "$OUTPUT_DIR"

# Framer Motion for animations
npm install framer-motion

# shadcn/ui setup
npx shadcn@latest init -y
```

### 4.2 Add shadcn/ui Components

Based on what the site needs:

```bash
# Common components
npx shadcn@latest add button
npx shadcn@latest add card

# If forms present
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add label

# If maps present
npx shadcn@latest add https://mapcn.vercel.app/maps/map.json
```

### 4.3 Typography Upgrade

Update `tailwind.config.js` with refined fonts:

```javascript
fontFamily: {
  // Distinctive but professional choices
  display: ['Outfit', 'system-ui', 'sans-serif'],
  body: ['Inter', 'system-ui', 'sans-serif'],
}
```

Add Google Fonts to `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### 4.4 Add Framer Motion

Create a reusable animation wrapper:

```tsx
// src/components/AnimatedSection.tsx
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

Wrap section content with subtle animations:
- Fade in on scroll
- Staggered children in card grids
- Hover effects on buttons and cards

**RESTRAINT GUIDELINES:**
- Use `duration: 0.5` or less
- Use `delay` for stagger, not complex sequences
- No bouncing, spinning, or dramatic effects
- One animation per element, not chained

### 4.5 Replace Raw Elements with shadcn/ui

**Buttons:**
```tsx
// Before
<a href="..." className="bg-primary text-white px-8 py-4">
  Book Now
</a>

// After
import { Button } from '@/components/ui/button'

<Button asChild size="lg">
  <a href="...">Book Now</a>
</Button>
```

**Cards:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
</Card>
```

**Forms:**
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

<form>
  <div className="space-y-4">
    <div>
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Your name" />
    </div>
    {/* ... */}
    <Button type="submit">Submit</Button>
  </div>
</form>
```

### 4.6 Spacing Normalization

Apply consistent spacing scale:
- Section padding: `py-16 md:py-24`
- Container: `container mx-auto px-4`
- Stack spacing: `space-y-4`, `space-y-8`
- Grid gaps: `gap-6`, `gap-8`

### 4.7 Responsive Refinement

Ensure all sections work on mobile:
- Navigation collapses to mobile menu
- Hero text sizes down appropriately
- Grids stack on mobile (1 column)
- Touch targets are 44x44px minimum

### 4.8 Accessibility Audit

Quick passes:
- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<footer>`)
- Alt text on images
- ARIA labels on icons-only buttons
- Focus visible states
- Color contrast (use Tailwind's built-in accessible colors)

### 4.9 Final Build

```bash
npm run build
```

Verify no errors or warnings.

---

## Phase 5: OUTPUT

### 5.1 Generate README

Write `README.md`:

```markdown
# Permissionless Proof: {domain}

A modern rebuild of [{original URL}]({url}) demonstrating elevated design
while maintaining 100% content parity.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:5173

## What Changed

### Parity Phase (Structural Match)
- {X} sections extracted faithfully
- {X} images optimized
- {X} forms preserved
- All CTAs and conversion paths intact

### Elevate Phase (Polish)

**Typography**
- Display: Outfit (Google Fonts)
- Body: Inter (Google Fonts)
- Refined hierarchy and spacing

**Components**
- shadcn/ui Button, Card, Form components
- Consistent design system

**Motion**
- Framer Motion fade-in animations
- Subtle scroll-triggered reveals
- Hover states on interactive elements

**Accessibility**
- Semantic HTML structure
- ARIA labels on icons
- Keyboard navigation support

## Deployment

**First time (creates GitHub repo + deploys to GitHub Pages):**

\`\`\`bash
npm run deploy:init
\`\`\`

**Subsequent deploys (rebuilds + redeploys):**

\`\`\`bash
npm run deploy
\`\`\`

Live at: https://{username}.github.io/proof-{domain}/

## Credits

- Original design: {domain}
- Rebuilt with: Vite, React, Tailwind CSS, shadcn/ui, Framer Motion
- Generated by: /pro:permissionless-proof

---

*This proof was created for demonstration purposes. All content belongs to the original site owner.*
\`\`\`

### 5.2 Generate Evidence Index

Create a web-accessible evidence viewer at `public/evidence/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evidence - ${DOMAIN}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #111; color: #fff; padding: 1rem; }
    h1 { font-size: 1.25rem; margin-bottom: 1rem; }
    .section { margin-bottom: 2rem; }
    .section-title { font-size: 0.875rem; color: #888; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.5rem; }
    .thumb { aspect-ratio: 16/9; overflow: hidden; border-radius: 4px; cursor: pointer; background: #222; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
    .thumb:hover img { transform: scale(1.05); }
    .label { font-size: 0.75rem; color: #666; margin-top: 0.25rem; text-align: center; }
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 100; }
    .modal.active { display: flex; align-items: center; justify-content: center; flex-direction: column; }
    .modal img { max-width: 95vw; max-height: 85vh; object-fit: contain; }
    .modal-label { color: #888; margin-top: 1rem; font-size: 0.875rem; }
    .close { position: absolute; top: 1rem; right: 1rem; color: #fff; font-size: 2rem; cursor: pointer; z-index: 101; }
    .back { display: inline-block; margin-bottom: 1rem; color: #888; text-decoration: none; font-size: 0.875rem; }
    .back:hover { color: #fff; }
    .issues { margin-top: 2rem; padding: 1rem; background: #1a1a1a; border-radius: 8px; }
    .issue { padding: 0.75rem 0; border-bottom: 1px solid #333; }
    .issue:last-child { border-bottom: none; }
    .issue-severity { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-right: 0.5rem; }
    .issue-severity.high { background: #7f1d1d; color: #fca5a5; }
    .issue-severity.medium { background: #78350f; color: #fcd34d; }
    .issue-severity.low { background: #1e3a5f; color: #93c5fd; }
  </style>
</head>
<body>
  <a href="../" class="back">← Back to proof</a>
  <h1>Evidence: ${DOMAIN}</h1>

  <div class="section">
    <div class="section-title">Source Screenshots</div>
    <div class="grid" id="source-grid"></div>
  </div>

  <div class="section">
    <div class="section-title">Interaction Audit</div>
    <div class="grid" id="check-grid"></div>
  </div>

  <div class="section">
    <div class="section-title">Parity Iterations</div>
    <div class="grid" id="parity-grid"></div>
  </div>

  <div class="issues" id="issues-container"></div>

  <div class="modal" id="modal">
    <span class="close" onclick="closeModal()">×</span>
    <img id="modal-img" src="" alt="">
    <div class="modal-label" id="modal-label"></div>
  </div>

  <script>
    // Screenshot data is injected during generation
    const screenshots = ${SCREENSHOTS_JSON};
    const issues = ${ISSUES_JSON};

    function render(containerId, images) {
      const grid = document.getElementById(containerId);
      if (!images || images.length === 0) {
        grid.innerHTML = '<div style="color:#666;font-size:0.875rem;">No screenshots available</div>';
        return;
      }
      images.forEach(img => {
        const div = document.createElement('div');
        div.innerHTML = \`
          <div class="thumb" onclick="openModal('\${img.path}', '\${img.name}')">
            <img src="\${img.path}" alt="\${img.name}" loading="lazy">
          </div>
          <div class="label">\${img.name}</div>
        \`;
        grid.appendChild(div);
      });
    }

    function renderIssues() {
      const container = document.getElementById('issues-container');
      if (!issues || issues.length === 0) {
        container.style.display = 'none';
        return;
      }
      container.innerHTML = '<div class="section-title">Detected Issues</div>' +
        issues.map(i => \`
          <div class="issue">
            <span class="issue-severity \${i.severity}">\${i.severity}</span>
            <strong>\${i.area}</strong>: \${i.operator}
          </div>
        \`).join('');
    }

    function openModal(src, label) {
      document.getElementById('modal-img').src = src;
      document.getElementById('modal-label').textContent = label;
      document.getElementById('modal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('modal').classList.remove('active');
    }

    document.getElementById('modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };
    document.onkeydown = e => { if (e.key === 'Escape') closeModal(); };

    render('source-grid', screenshots.source || []);
    render('check-grid', screenshots.check || []);
    render('parity-grid', screenshots.parity || []);
    renderIssues();
  </script>
</body>
</html>
```

**Copy screenshots to public/evidence/:**

```bash
cp -r screenshots/source public/evidence/source 2>/dev/null || true
cp -r screenshots/check public/evidence/check 2>/dev/null || true
cp -r screenshots/verify-iterations public/evidence/parity 2>/dev/null || true
```

**Generate screenshots manifest (screenshots.json):**

Build a JSON manifest of all evidence files and inject into the HTML template, replacing `${SCREENSHOTS_JSON}` and `${ISSUES_JSON}` placeholders.

**Add quiet link in Footer component:**

In `src/components/Footer.tsx`, add a small, unobtrusive link at the bottom:

```tsx
<a
  href="/evidence/"
  className="text-xs text-gray-400 hover:text-gray-300 mt-4 block"
>
  View evidence
</a>
```

This link should be positioned after the copyright text, not prominently featured.

### 5.3 Final Verification

Start dev server and capture final screenshots:

```bash
npm run dev &
sleep 3
```

Capture elevated version screenshots for comparison.

---

## Phase 6: DEPLOY (GitHub Pages Automation)

> Purpose: Deploy the proof to GitHub Pages with zero manual steps.

This phase uses the `gh-pages` skill to fully automate deployment. See `pro/skills/gh-pages/SKILL.md` for implementation details.

### 6.1 Pre-Deployment Check

```bash
# Verify gh CLI is authenticated
gh auth status 2>&1 | grep -q "Logged in" || {
  echo "⚠️ gh CLI not authenticated. Skipping auto-deploy."
  echo "Run 'gh auth login' then 'npm run deploy:init' manually."
  # Continue to summary without deployment
}
```

If gh is not authenticated, skip deployment and show manual steps in summary.

### 6.2 Create Repository and Deploy

```bash
cd "$OUTPUT_DIR"

# Check if remote exists
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
  echo "[DEPLOY] Creating GitHub repository..."
  gh repo create "$OUTPUT_DIR" --public --source=. --push

  if [ $? -ne 0 ]; then
    echo "⚠️ Failed to create repository. Manual deployment required."
    # Continue to summary
  fi
fi

OWNER=$(gh repo view --json owner -q ".owner.login" 2>/dev/null || echo "")
REPO=$(gh repo view --json name -q ".name" 2>/dev/null || echo "")
```

### 6.3 Deploy Assets to gh-pages Branch

```bash
# Ensure gh-pages package is available
npm list gh-pages > /dev/null 2>&1 || npm install --save-dev gh-pages

# Deploy to gh-pages branch
echo "[DEPLOY] Pushing to gh-pages branch..."
npx gh-pages -d dist -m "Deploy proof: ${DOMAIN}"
```

### 6.4 Enable GitHub Pages via API

```bash
echo "[DEPLOY] Enabling GitHub Pages..."

# Check if already enabled
PAGES_STATUS=$(gh api "/repos/$OWNER/$REPO/pages" 2>&1 || echo "not-found")

if echo "$PAGES_STATUS" | grep -q '"html_url"'; then
  PAGES_URL=$(echo "$PAGES_STATUS" | jq -r '.html_url')
  echo "[DEPLOY] GitHub Pages already enabled"
else
  # Enable Pages with gh-pages branch
  ENABLE_RESULT=$(gh api --method POST "/repos/$OWNER/$REPO/pages" \
    -f source[branch]="gh-pages" \
    -f source[path]="/" 2>&1 || echo "")

  if echo "$ENABLE_RESULT" | grep -q '"html_url"'; then
    PAGES_URL=$(echo "$ENABLE_RESULT" | jq -r '.html_url')
    echo "[DEPLOY] GitHub Pages enabled"
  elif echo "$ENABLE_RESULT" | grep -q "409"; then
    # Already exists
    PAGES_URL=$(gh api "/repos/$OWNER/$REPO/pages" --jq '.html_url' 2>/dev/null)
    echo "[DEPLOY] GitHub Pages was already enabled"
  else
    # API failed - construct URL anyway
    PAGES_URL="https://$OWNER.github.io/$REPO/"
    echo "[DEPLOY] Could not verify Pages status. URL may take 1-2 minutes to become active."
  fi
fi
```

### 6.5 Wait for Propagation

```bash
echo "[DEPLOY] Waiting for site to build (up to 60s)..."

for i in $(seq 1 12); do
  STATUS=$(gh api "/repos/$OWNER/$REPO/pages" --jq '.status' 2>/dev/null || echo "unknown")
  case "$STATUS" in
    "built") echo "[DEPLOY] Site is live!"; break ;;
    "building") echo "[DEPLOY] Building... ($i/12)"; sleep 5 ;;
    "errored") echo "[DEPLOY] Build reported errors but may still work."; break ;;
    *) sleep 5 ;;
  esac
done
```

### 6.6 Copy URL to Clipboard

```bash
if command -v pbcopy > /dev/null 2>&1; then
  echo "$PAGES_URL" | pbcopy
  echo "[DEPLOY] URL copied to clipboard"
fi
```

### 6.7 Deployment Summary

Set `DEPLOYED=true` and `PAGES_URL` for use in completion summary.

If deployment failed at any step, set `DEPLOYED=false` and include manual steps in completion summary.

---

### 6.8 Completion Summary

**If DEPLOYED=true:**

```
/pro:permissionless-proof Complete
════════════════════════════════════════

Source: {url}
Output: {output_dir}

Pipeline Results:
  ✓ ACQUIRE    - {X} sections, {X} assets extracted
  ✓ CHECK      - {X} issues detected ({desktop}/{tablet}/{mobile})
  ✓ PARITY     - 100% structural match verified
  ✓ AUTO-VERIFY - {score}% parity in {N} iterations
  ✓ ELEVATE    - Typography, shadcn/ui, motion added
  ✓ DEPLOY     - GitHub Pages live

Files Created:
  src/components/           - {X} component files
  src/assets/               - {X} images
  screenshots/source/       - Original website captures (4 viewports)
  screenshots/check/        - Interaction audit evidence
  screenshots/verify-iterations/ - Parity iteration history
  public/evidence/          - Web-accessible evidence index

Deployment:
  Repository: https://github.com/{owner}/{repo}
  Live URL:   {pages_url}
  Evidence:   {pages_url}/evidence/

(URL copied to clipboard)

════════════════════════════════════════
```

**If DEPLOYED=false (gh not authenticated or API failed):**

```
/pro:permissionless-proof Complete
════════════════════════════════════════

Source: {url}
Output: {output_dir}

Pipeline Results:
  ✓ ACQUIRE    - {X} sections, {X} assets extracted
  ✓ CHECK      - {X} issues detected ({desktop}/{tablet}/{mobile})
  ✓ PARITY     - 100% structural match verified
  ✓ AUTO-VERIFY - {score}% parity in {N} iterations
  ✓ ELEVATE    - Typography, shadcn/ui, motion added
  ⚠ DEPLOY     - Manual steps required

Files Created:
  src/components/           - {X} component files
  src/assets/               - {X} images
  screenshots/source/       - Original website captures (4 viewports)
  screenshots/check/        - Interaction audit evidence
  screenshots/verify-iterations/ - Parity iteration history
  public/evidence/          - Web-accessible evidence index

Git Repository:
  ✓ Initialized with initial commit

Manual Deployment Steps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Authenticate: gh auth login
2. Deploy: npm run deploy:init
3. Open: npm run open
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

════════════════════════════════════════
```

---

## Error Handling

| Error | Action |
|-------|--------|
| URL unreachable | Abort with message, suggest checking URL |
| Playwright unavailable | Fallback to WebFetch only, warn about JS content |
| Auth wall detected | Ask user how to proceed |
| Build fails | Report errors, do not proceed |
| Vision analysis fails | Retry once; if still fails, fall back to user decision |
| Vision JSON invalid | Validate parityScore (0-100), gaps array, severity values; retry once if malformed, then user decision |
| Build fails during iteration | Revert last fix, try next gap; if all fail, proceed to user decision |
| Max iterations reached | Present current state, ask user to proceed or abort |
| Diminishing returns | Present current state, ask user to proceed or abort |
| User declines at gate | Stop pipeline, output what was achieved |
| WebKit unavailable | Log warning, continue with Chromium only |
| Git unavailable | Log warning, skip repository initialization |

---

## Guardrails

These rules are **non-negotiable**:

1. **Never skip PARITY** - The whole value is in proving you can match first
2. **Never invent content** - Every word comes from the source
3. **Never change tone** - No "Transform your smile!" if source says "Dental Services"
4. **Never break SEO** - Keep original titles, descriptions, structured data
5. **Never break CTAs** - Phone numbers, booking links, forms stay functional
6. **Keep improvements obvious but restrained** - Polish, not reinvention
7. **CHECK is observation, not opinion** - Log failures, don't editorialize

---

## Definition of Done

- [ ] Output directory created at `proof-{domain-slug}/`
- [ ] All source sections represented as components
- [ ] CHECK phase completed with issues.json generated
- [ ] AUTO-VERIFY achieved 99%+ parity OR user approved current state
- [ ] Iteration history saved to screenshots/verify-iterations/
- [ ] Elevate phase applied (typography, shadcn/ui, motion)
- [ ] Evidence index generated at public/evidence/
- [ ] Git repository initialized with initial commit
- [ ] Build passes without errors
- [ ] README documents all changes
- [ ] User can run `npm install && npm run dev` successfully
- [ ] DEPLOY phase: GitHub repo created, Pages enabled, site live (or clear manual steps if gh not authenticated)
