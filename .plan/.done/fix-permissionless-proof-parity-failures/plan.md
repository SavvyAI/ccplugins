# Fix Plan: Permissionless Proof Parity Failures

## Status: IMPLEMENTED

**Branch:** `fix/permissionless-proof-parity-failures`
**Changes:** 277 lines added, 73 lines removed in `pro/commands/permissionless-proof.md`

---

## Changes Made

### 1. PARITY MODE System Instruction (New Section)

Added critical constraint at the top of the command:

```
You are not allowed to design.
You are not allowed to interpret.
You are not allowed to improve.
You are not allowed to simplify.
You are only allowed to COPY until no structural or visual differences remain.

You may not declare completion.
You may only stop when parity is absolute.
```

### 2. DOM/HTML Extraction (Section 1.1.5)

Added Playwright-based extraction of actual HTML structure:
- Extracts full HTML source to `source/index.html`
- Extracts structural metadata to `source/structure.json`
- Creates PARITY CONTRACT with section count, images, headings, CTAs

### 3. Removed Human Intervention Gate

Changed "Proceed to PARITY phase? (y/n)" to automatic transition.

### 4. Structural Verification (Replaced Section 3.4)

Replaced subjective % scoring with PASS/FAIL structural verification:
- Compares rebuild against `source/structure.json`
- Checks: section count, background treatments, image count, heading count, CTA count
- No more "98%" claims - either all checks pass or continue iterating
- Removed "diminishing returns" exit - if failures exist, you continue

### 5. Content & Copy Audit (Section 1.3.10)

Added aggressive content audit to CHECK phase:
- Headline clarity, CTA specificity, social proof, credibility signals
- Generates operator-friendly talking points for outreach
- "If you found ZERO issues, you did not look hard enough"

---

## Root Cause Analysis

### The Fundamental Problem

The current pipeline uses **screenshot-based semantic inference** to rebuild websites:

```
Screenshot → Vision Analysis → "Understanding" → Creative Rebuild → Screenshot Comparison
```

This approach is architecturally flawed because:

1. **Screenshots lose structural information** - DOM hierarchy, CSS rules, exact values
2. **Vision inference introduces creative interpretation** - "similar to" not "identical to"
3. **No DOM truth anchor** - nothing to verify against except visual appearance
4. **Optimizes for "looks similar"** not "IS the same structure"

### Evidence of Failure (gardensdentistrypb.com)

| Section | Original | Rebuild | Verdict |
|---------|----------|---------|---------|
| Hero | Full-bleed team photo, emotional | Flat navy block, typography-only | **FATAL** |
| "Where Dentistry Meets Aesthetics" | Rich imagery, multi-column | Minimal placeholder layout | **MISMATCH** |
| Services | Multiple stacked sections, lifestyle photos | Compressed card grid | **2-3 SECTIONS MISSING** |
| Visual Rhythm | Tall, premium, image breaks | Sparse, flat, short | **DIFFERENT EXPERIENCE** |
| Testimonials | Review widgets, high trust | Absent or simplified | **WEAKENED** |
| Footer | Rich, background imagery | Flat, simplified | **DIFFERENT** |

**Claimed:** 98% parity
**Reality:** ~40-50% structural parity

---

## Fix Architecture

### Phase 1: DOM-First Extraction (Replace Current ACQUIRE)

Instead of screenshot-based inference, extract **actual DOM and CSS**:

```typescript
// Using Playwright's page object
const html = await page.content();
const sections = await page.evaluate(() => {
  // Extract each major section with its computed styles
  return Array.from(document.querySelectorAll('section, [class*="section"], main > div'))
    .map(el => ({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      innerHTML: el.innerHTML,
      computedStyles: getComputedStyle(el),
      boundingRect: el.getBoundingClientRect(),
      children: el.children.length
    }));
});
```

**New ACQUIRE outputs:**
- `source-dom.html` - Full HTML source
- `source-sections.json` - Section manifest with exact structure
- `source-tokens.json` - Design tokens (colors, fonts, spacing)
- `source-assets.json` - All images with exact URLs and dimensions
- Screenshots (for reference, not primary truth)

### Phase 2: Section Manifest (New Step)

Before any code generation, create a **1:1 section map**:

```json
{
  "sections": [
    {
      "id": "hero",
      "order": 1,
      "type": "hero",
      "hasBackgroundImage": true,
      "backgroundImageUrl": "...",
      "hasPeoplePhotography": true,
      "headline": "Aesthetic Dentist in Palm Beach Gardens",
      "ctas": [
        {"text": "Schedule Now", "href": "..."},
        {"text": "Call (561) 782-2378", "href": "tel:..."}
      ],
      "layout": "full-bleed-image-overlay",
      "cssTokens": {
        "backgroundColor": "#1a365d",
        "textColor": "#ffffff",
        "padding": "120px 0"
      }
    },
    {
      "id": "where-dentistry-meets-aesthetics",
      "order": 2,
      "type": "content-with-media",
      "layout": "two-column-text-media",
      "hasVideo": true,
      "videoEmbed": "youtube:...",
      "hasImage": true,
      "imageUrl": "...",
      "headline": "Where Dentistry Meets Aesthetics",
      "bodyText": "...",
      "cssTokens": {...}
    }
    // ... every section enumerated
  ],
  "totalSections": 12,
  "designTokens": {
    "colors": {
      "primary": "#1a365d",
      "secondary": "#c4a962",
      "background": "#f8f6f3",
      "text": "#1a1a1a"
    },
    "fonts": {
      "display": "Playfair Display, serif",
      "body": "Lato, sans-serif"
    },
    "spacing": {
      "sectionPadding": "80px",
      "containerMaxWidth": "1200px"
    }
  }
}
```

### Phase 3: Structural Verification (Replace Vision Scoring)

**Before code generation**, verify the manifest is complete:

1. **Section count matches** - If source has 12 sections, manifest has 12
2. **Every image URL captured** - No placeholders
3. **Every piece of text captured** - Verbatim
4. **Every CTA captured** - With exact href

**During code generation**, enforce constraints:

```
HARD CONSTRAINTS (non-negotiable):
- Section count MUST match manifest exactly
- No section may be "combined" or "simplified"
- No image may be substituted with placeholder
- No text may be paraphrased
- Background treatment MUST match (image vs color)
- Layout pattern MUST match (full-bleed vs contained, columns, etc.)
```

### Phase 4: Parity Verification (Enhanced)

Replace vague vision scoring with **structural verification**:

```json
{
  "parityReport": {
    "sectionCount": { "source": 12, "rebuild": 12, "pass": true },
    "imageCount": { "source": 18, "rebuild": 18, "pass": true },
    "ctaCount": { "source": 8, "rebuild": 8, "pass": true },
    "sections": [
      {
        "id": "hero",
        "checks": {
          "hasBackgroundImage": { "source": true, "rebuild": true, "pass": true },
          "backgroundType": { "source": "photo-team", "rebuild": "solid-color", "pass": false },
          "headline": { "source": "Aesthetic...", "rebuild": "Aesthetic...", "pass": true },
          "ctaCount": { "source": 2, "rebuild": 2, "pass": true }
        },
        "pass": false,
        "failureReason": "Background type mismatch: photo-team vs solid-color"
      }
    ],
    "overallPass": false,
    "blockers": [
      "Hero: Background must be team photo, not solid color",
      "Section 4: Missing entirely"
    ]
  }
}
```

**Exit condition:** ALL structural checks pass, not a vague percentage.

---

## Changes to Command Spec

### 1. Remove Human Intervention Gates

**Current (lines 540-543):**
```
Proceed to PARITY phase? (y/n)
Wait for explicit user confirmation before proceeding.
```

**New:**
```
[ACQUIRE → PARITY automatic transition]
No confirmation required. Pipeline continues autonomously.
```

Only ask for confirmation on:
- Abort conditions (max iterations, diminishing returns)
- Missing credentials for gated content

### 2. Add DOM Extraction to ACQUIRE Phase

**New Section 1.1.5: DOM Extraction**

```markdown
### 1.1.5 DOM Extraction

Using Playwright MCP, extract the actual HTML structure:

```javascript
mcp__plugin_pro_playwright__browser_evaluate: {
  function: `(() => {
    // Get full HTML
    const html = document.documentElement.outerHTML;

    // Get all major sections
    const sections = Array.from(document.querySelectorAll('section, header, footer, main > div, [class*="section"]'))
      .map((el, i) => ({
        index: i,
        tagName: el.tagName,
        id: el.id || null,
        className: el.className || null,
        textContent: el.textContent.substring(0, 500),
        hasBackgroundImage: !!getComputedStyle(el).backgroundImage.match(/url/),
        childCount: el.children.length,
        images: Array.from(el.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height
        }))
      }));

    return { html, sections };
  })()`
}
```

Save to `{OUTPUT_DIR}/source/dom.json`.
```

### 3. Add Section Manifest Generation

**New Section 1.8: Generate Section Manifest**

Before PARITY phase, generate a structural manifest that will be the **source of truth** for code generation.

### 4. Replace Vision-Based Parity Scoring

**Current (Section 3.4):**
```
Analyze both images and produce a structured parity report...
Scoring guide: 95-100%: Near-perfect match...
```

**New:**
```
Structural verification against section manifest.
PASS/FAIL per section.
All sections must PASS before proceeding to ELEVATE.
```

### 5. Expand CHECK Phase

**Add Section 1.3.11: Content Audit**

Current CHECK only tests technical interactions. Add content/copy audit:

```markdown
#### 1.3.11 Content Audit

Evaluate content effectiveness (informational, not blocking):

| Check | Criteria | Severity |
|-------|----------|----------|
| Headline clarity | Does the headline communicate value in <5 words? | medium |
| CTA specificity | Are CTAs action-oriented and specific? | medium |
| Social proof presence | Are testimonials, reviews, or trust badges visible? | high |
| Trust signals | Are credentials, certifications, awards displayed? | medium |
| Mobile copy | Is copy scannable on mobile (short paragraphs)? | low |
| Value proposition | Is the core benefit clear within 5 seconds? | high |

Note: These are opportunities, not bugs. They inform ELEVATE phase.
```

---

## Implementation Steps

1. **Edit `permissionless-proof.md`:**
   - Add DOM extraction to ACQUIRE (new 1.1.5)
   - Add section manifest generation (new 1.8)
   - Remove "Proceed to PARITY?" gate (line 540)
   - Replace vision scoring with structural verification (section 3.4)
   - Add content audit to CHECK (new 1.3.11)

2. **Update hard constraints in PARITY section:**
   - Section count must match
   - No creative substitution allowed
   - Background treatments must match exactly

3. **Add structural verification JSON schema**

4. **Test against gardensdentistrypb.com** to verify fix

---

## Success Criteria

- [ ] Pipeline runs autonomously (no mid-pipeline confirmations)
- [ ] DOM extraction captures actual HTML/CSS
- [ ] Section manifest has 1:1 mapping
- [ ] Structural verification catches hero mismatch
- [ ] Structural verification catches missing sections
- [ ] CHECK phase finds 3-7+ issues (including content opportunities)
- [ ] Rebuild matches section count exactly
- [ ] Rebuild uses actual images (not placeholders)
- [ ] Rebuild matches layout patterns (full-bleed vs contained)

## Related ADRs

- [043. DOM-Based Structural Parity Verification](../../../doc/decisions/043-dom-based-structural-parity-verification.md)
