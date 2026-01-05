---
description: "Rebuild any website? → Parity-first extraction → Elevated proof with modern polish (plugin:pro@ccplugins)"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebFetch", "AskUserQuestion", "mcp__plugin_pro_playwright__browser_navigate", "mcp__plugin_pro_playwright__browser_snapshot", "mcp__plugin_pro_playwright__browser_take_screenshot", "mcp__plugin_pro_playwright__browser_evaluate", "mcp__plugin_pro_playwright__browser_wait_for", "mcp__plugin_pro_playwright__browser_close", "mcp__plugin_pro_playwright__browser_resize", "mcp__plugin_pro_shadcn-ui__get_component", "mcp__plugin_pro_shadcn-ui__get_component_demo", "mcp__plugin_pro_shadcn-ui__list_components"]
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

## Input

```
/pro:permissionless-proof <url> [output-dir]
```

- `<url>` - The website to rebuild (required)
- `[output-dir]` - Where to create the project (optional, defaults to `.`)

**Examples:**
```bash
# Create in current directory (user already cd'd to target folder)
/pro:permissionless-proof https://www.gardensdentistrypb.com/

# Create in a specific subdirectory
/pro:permissionless-proof https://www.gardensdentistrypb.com/ ./gardens-dentistry

# Explicit current directory
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

# Extract output dir (second argument, defaults to ".")
OUTPUT_DIR=$(echo "$ARGUMENTS" | awk '{print $2}')
if [ -z "$OUTPUT_DIR" ]; then
  OUTPUT_DIR="."
fi

# Extract domain for naming/reference
DOMAIN=$(echo "$URL" | grep -oE '[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}' | head -1 | sed 's/www\.//')
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

### 1.3 Screenshot Capture

Using Playwright MCP, capture screenshots:

**Desktop Full Page:**
```
mcp__plugin_pro_playwright__browser_resize: {width: 1440, height: 900}
mcp__plugin_pro_playwright__browser_take_screenshot: {fullPage: true, filename: "source-desktop-full.png"}
```

**Desktop Viewport (Hero):**
```
mcp__plugin_pro_playwright__browser_take_screenshot: {filename: "source-desktop-hero.png"}
```

**Mobile:**
```
mcp__plugin_pro_playwright__browser_resize: {width: 375, height: 812}
mcp__plugin_pro_playwright__browser_take_screenshot: {fullPage: true, filename: "source-mobile-full.png"}
```

Store in `{OUTPUT_DIR}/screenshots/source/`.

### 1.4 Asset Identification

List all assets to download:
- Hero images
- Section background images
- Logo files
- Icon images
- Team/staff photos

Note: Don't download at this phase. Document URLs for later.

### 1.5 Auth Wall Detection

Check for:
- Login forms blocking content
- Password-protected pages
- Age verification gates
- Cookie consent blocking content

If detected, use `AskUserQuestion`:
"This page has gated content. Should I proceed with visible content only, or do you have credentials to access more?"

### 1.6 Acquire Summary

Present findings to user:

```
ACQUIRE Phase Complete
────────────────────────────────────────

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

Screenshots captured: 3

Proceed to PARITY phase? (y/n)
────────────────────────────────────────
```

Wait for explicit user confirmation before proceeding.

---

## Phase 2: PARITY (Strict Mode Rebuild)

> Purpose: Create a React rebuild that matches the original structure exactly.

### 2.1 Create Project Scaffold

```bash
# OUTPUT_DIR was set in Parse Arguments phase (defaults to ".")

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

### 2.2 Configure Tailwind

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

### 2.3 Create Directory Structure

```bash
mkdir -p src/components
mkdir -p src/assets/images
mkdir -p public
```

### 2.4 Download Assets

For each identified asset:

```bash
# Download images to src/assets/images/
curl -o src/assets/images/{filename} "{url}"
```

Or use Bash with appropriate headers if needed.

### 2.5 Generate Components

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

### 2.6 Create Navigation Component

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

### 2.7 Create Footer Component

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

### 2.8 Create App.tsx

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

### 2.9 Update index.html

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

### 2.10 Build and Verify

```bash
npm run build
```

If build errors: Fix them before proceeding. Do not continue with broken build.

Report: `[PASS] Parity build complete`

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

### 3.4 Vision Analysis

Read both screenshots and analyze for parity:

1. **Read the source screenshot**: `screenshots/source/source-desktop-full.png`
2. **Read the parity screenshot**: `screenshots/verify-iterations/iteration-{NNN}/parity.png`

Analyze both images and produce a structured parity report:

```
VISION ANALYSIS PROMPT:
────────────────────────────────────────
You are comparing two website screenshots for visual parity.

**Image 1 (Source):** The original website we are trying to match.
**Image 2 (Parity):** Our React rebuild attempt.

Analyze both screenshots systematically:

1. **Layout Structure** - Does the overall layout match? (header, sections, footer positions)
2. **Colors** - Do background colors, text colors, and accent colors match?
3. **Typography** - Do font sizes, weights, and styles appear similar?
4. **Spacing** - Is the padding and margin between elements comparable?
5. **Images** - Are all images present and sized correctly?
6. **Content** - Is all text content present and in the correct locations?

Produce a JSON report:

{
  "parityScore": <0-100>,
  "gaps": [
    {
      "area": "<section name>",
      "issue": "<specific visual difference>",
      "severity": "<high|medium|low>",
      "fix": "<suggested code change>"
    }
  ],
  "summary": "<one sentence overall assessment>"
}

Scoring guide:
- 95-100%: Near-perfect match, only minor pixel differences
- 85-94%: Good match with noticeable but minor differences
- 70-84%: Moderate match, some layout or styling issues
- 50-69%: Significant differences, major elements misaligned or missing
- <50%: Poor match, fundamental structure differs
────────────────────────────────────────
```

**JSON Validation:**

Before proceeding, validate the vision analysis output:
- `parityScore` must be a number between 0-100
- `gaps` must be an array (can be empty if score is 100%)
- Each gap must have: `area` (string), `issue` (string), `severity` (one of: high, medium, low)
- `summary` must be a string

If JSON is malformed or missing required fields:
1. Retry vision analysis once with the same screenshots
2. If still invalid, log the validation error and proceed to section 3.7 (User Decision)

Save the report:

```bash
# Save report to iteration directory
echo '{report JSON}' > "$OUTPUT_DIR/screenshots/verify-iterations/iteration-{NNN}/report.json"
```

### 3.5 Check Exit Conditions

**Condition 1: SUCCESS (parity >= 99%)**

```
if parityScore >= 99:
  LOG: "✓ Parity achieved: {score}%"
  GOTO 3.8 (Stop Dev Server)
```

**Condition 2: DIMINISHING RETURNS**

```
if ITERATION > 1:
  improvement = parityScore - SCORE_HISTORY[-1]
  if improvement < LOW_IMPROVEMENT_THRESHOLD:
    CONSECUTIVE_LOW_IMPROVEMENT += 1
  else:
    CONSECUTIVE_LOW_IMPROVEMENT = 0

  if CONSECUTIVE_LOW_IMPROVEMENT >= 3:
    LOG: "⚠ Diminishing returns detected after {ITERATION} iterations"
    GOTO 3.7 (User Decision)
```

**Condition 3: MAX ITERATIONS**

```
if ITERATION >= MAX_ITERATIONS:
  LOG: "⚠ Max iterations ({MAX_ITERATIONS}) reached"
  GOTO 3.7 (User Decision)
```

**Otherwise: Continue to fixes**

```
SCORE_HISTORY.append(parityScore)
GOTO 3.6 (Apply Fixes)
```

### 3.6 Apply Fixes and Rebuild

For each gap identified in the vision analysis (prioritized by severity):

1. **Identify the component file** from the gap's area description
2. **Apply the suggested fix** using Edit tool
3. **Track the fix** for the iteration report

After applying fixes:

```bash
# Rebuild the project
cd "$OUTPUT_DIR"
npm run build

# If build fails, revert last fix and try next gap
# If all fixes cause build failures, proceed to 3.7
```

Log iteration summary:

```
Iteration {N} Complete
────────────────────────────────────────
Score: {parityScore}% (Δ {improvement}%)
Gaps fixed: {count}
Gaps remaining: {count}
────────────────────────────────────────
```

**GOTO 3.3** (capture new screenshot and re-analyze)

### 3.7 User Decision

Present the current state when exiting without achieving 99% parity:

```
AUTO-VERIFY Complete (Non-Success Exit)
════════════════════════════════════════

Final Parity Score: {parityScore}%
Iterations: {ITERATION}
Exit Reason: {diminishing returns | max iterations}

Score History:
  Iteration 1: {score}%
  Iteration 2: {score}% (+{delta}%)
  ...

Remaining Gaps ({count}):
  • {area}: {issue} [{severity}]
  • {area}: {issue} [{severity}]
  ...

Iteration history saved to:
  screenshots/verify-iterations/

════════════════════════════════════════
```

Use `AskUserQuestion`:
- **"Proceed to ELEVATE"** - Continue with current parity level
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
  "finalScore": {parityScore},
  "iterations": {ITERATION},
  "exitReason": "{success | diminishing_returns | max_iterations | user_abort}",
  "scoreHistory": [{scores}],
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
```

Report: `[PASS] Auto-verify complete: {score}% parity in {N} iterations`

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

\`\`\`bash
npm run build
\`\`\`

Deploy the \`dist/\` folder to any static host:
- Vercel: \`vercel deploy\`
- Netlify: Drag and drop dist/
- GitHub Pages: Push to gh-pages branch

## Credits

- Original design: {domain}
- Rebuilt with: Vite, React, Tailwind CSS, shadcn/ui, Framer Motion
- Generated by: /pro:permissionless-proof

---

*This proof was created for demonstration purposes. All content belongs to the original site owner.*
\`\`\`

### 5.2 Final Verification

Start dev server and capture final screenshots:

```bash
npm run dev &
sleep 3
```

Capture elevated version screenshots for comparison.

### 5.3 Completion Summary

```
/pro:permissionless-proof Complete
════════════════════════════════════════

Source: {url}
Output: {output_dir}

Pipeline Results:
  ✓ ACQUIRE    - {X} sections, {X} assets extracted
  ✓ PARITY     - 100% structural match verified
  ✓ AUTO-VERIFY - {score}% parity in {N} iterations
  ✓ ELEVATE    - Typography, shadcn/ui, motion added

Files Created:
  src/components/           - {X} component files
  src/assets/               - {X} images
  screenshots/source/       - Original website captures
  screenshots/verify-iterations/ - Parity iteration history

Next Steps:
  1. npm run dev
  2. Review at http://localhost:5173
  3. Deploy: npm run build && [upload dist/]

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

---

## Guardrails

These rules are **non-negotiable**:

1. **Never skip PARITY** - The whole value is in proving you can match first
2. **Never invent content** - Every word comes from the source
3. **Never change tone** - No "Transform your smile!" if source says "Dental Services"
4. **Never break SEO** - Keep original titles, descriptions, structured data
5. **Never break CTAs** - Phone numbers, booking links, forms stay functional
6. **Keep improvements obvious but restrained** - Polish, not reinvention

---

## Definition of Done

- [ ] Output directory created with full Vite + React project
- [ ] All source sections represented as components
- [ ] AUTO-VERIFY achieved 99%+ parity OR user approved current state
- [ ] Iteration history saved to screenshots/verify-iterations/
- [ ] Elevate phase applied (typography, shadcn/ui, motion)
- [ ] Build passes without errors
- [ ] README documents all changes
- [ ] User can run `npm install && npm run dev` successfully
