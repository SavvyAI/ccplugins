# 039. Permissionless Proof CHECK Extension

Date: 2026-01-07

## Status

Accepted

## Context

The permissionless proof pipeline (ADR-035) generates visual parity proofs for cold outreach. While effective at demonstrating rebuild capability, the current system only captures static screenshots. This misses a significant class of user-observable issues:

1. **Interaction failures** - Broken mobile menus, non-functional CTAs, dead clicks
2. **Viewport-specific bugs** - Elements that work on desktop but fail on mobile
3. **Trust erosion** - Outdated copyright years, missing privacy links, dead forms

These issues are often more compelling to prospects than visual imperfections because they directly impact conversion. A mobile menu that doesn't open loses real customers every day.

Additionally, operator friction in the deployment workflow creates barriers:

1. Output directory defaults to `.`, cluttering the filesystem
2. GitHub Pages base path must be manually configured for subpath deployment
3. No automated git initialization
4. Operators must remember GitHub Pages URL conventions

## Decision

### D1: Interaction Audit Timing - Before Screenshots

The interaction audit (CHECK phase) runs **before** screenshot capture.

**Rationale:**
- Issues discovered during CHECK are visible in the screenshots that follow
- A broken mobile menu captured mid-failure provides undeniable evidence
- Non-destructive read-only audit has low crash risk
- Additional 30-60s per proof is acceptable for evidence density

**Alternative considered:** After screenshots
- Would require separate evidence management
- Screenshots wouldn't reflect discovered issues
- Harder to correlate findings with visual evidence

### D2: Three-Tier Viewport Testing

Extend viewport coverage to three tiers:

| Viewport | Dimensions | Purpose |
|----------|------------|---------|
| Desktop | 1440×900 | Primary business user |
| Tablet | 768×1024 | Overlooked middle-ground |
| Mobile | 375×812 | Majority of real-world traffic |

**Rationale:**
- Tablet viewport often reveals unique issues (neither desktop nor mobile)
- Many sites have tablet-specific breakpoint bugs
- Three viewports still complete in reasonable time

### D3: Optional WebKit Pass with Graceful Degradation

Include an optional WebKit browser pass that:
- Runs if WebKit is available
- Logs a warning and continues if unavailable
- Does not block proof generation

**Rationale:**
- Safari/WebKit rendering differs from Chromium
- Many developers don't have WebKit locally
- Partial coverage is better than blocking on unavailable browsers

### D4: Domain-Scoped Output Directory

Default output directory changes from `.` to `proof-{domain-slug}`.

**Algorithm:**
```
Input:  https://www.ramanidentistryfl.com
Step 1: Extract domain → ramanidentistryfl.com
Step 2: Remove TLD → ramanidentistryfl
Step 3: Insert hyphens at camelCase boundaries → ramani-dentistry-fl
Step 4: Apply prefix → proof-ramani-dentistry-fl
```

**Rationale:**
- Zero operator input required
- GitHub Pages URLs read cleanly (username.github.io/proof-example-corp)
- Directory listings group naturally when running multiple proofs
- Explicit `proof-` prefix signals intent

### D5: Web-Accessible Evidence Index

Generate a static evidence viewer at `/evidence/` in the deployed proof:

- Thumbnail grid of all screenshots (source, check, parity iterations)
- Click-to-expand lightbox
- Works on mobile for mid-conversation review
- Inline CSS/JS for zero dependencies

**Rationale:**
- Operators can review evidence from their phone during prospect calls
- Single URL provides full audit trail
- No separate evidence hosting required

### D6: Enhanced Package Scripts

Add convenience scripts to generated `package.json`:

| Script | Purpose |
|--------|---------|
| `npm run build` | Standard Vite build |
| `npm run deploy` | Build + push to gh-pages |
| `npm run deploy:init` | Create repo + first deploy |
| `npm run open` | Copy URL + open in browser |

**Rationale:**
- Single command deployment
- URL auto-copied for immediate paste into email/message
- No need to remember GitHub Pages URL format

### D7: Operator Translation Layer

Each technical issue includes a plain-language translation:

```json
{
  "technical": "Mobile menu toggle click produces no state change",
  "operator": "Mobile visitors cannot open the navigation menu"
}
```

**Rationale:**
- Operators can paste directly into outreach messages
- Technical details available for follow-up questions
- Dual output serves both audiences

## Consequences

### Positive

- **Denser evidence**: Each proof surfaces 3-7 user-observable issues
- **Mobile-first findings**: Issues affecting real traffic are prioritized
- **One-command deployment**: Reduced operator friction
- **Phone-accessible review**: Evidence viewable during prospect calls
- **Clear communication**: Operator translations eliminate jargon barriers

### Negative

- **Longer execution time**: CHECK phase adds 30-60s per proof
- **Context consumption**: Interaction testing consumes additional context
- **False positives**: Some detected issues may be intentional design choices
- **WebKit dependency**: Full coverage requires WebKit installation

### Mitigations

- CHECK phase is informational only; proof proceeds regardless of findings
- Severity rating helps prioritize real issues over noise
- WebKit graceful degradation prevents blocking on unavailable browsers
- Operator translations can be edited before sending

## Interaction Audit Coverage

The CHECK phase tests the following interactions:

| Category | Tests | Failure Conditions |
|----------|-------|-------------------|
| Navigation | Link clicks, mobile menu toggle | No-op clicks, unreachable on mobile |
| CTA | Click reachability, tap target size | Obstructed, undersized, no feedback |
| Scroll | Sticky elements, horizontal overflow | Content blocked, horizontal scroll on mobile |
| Form | Focus, keyboard overlap | No visual feedback, keyboard covers submit |
| Interactive UI | Modals, accordions, menus | Fail to open, clip outside viewport |
| Dead Ends | States with no next action | No CTA, form, or onward link |
| Trust Signals | Copyright year, privacy links, SSL | Outdated, broken, missing |

## Artifacts Generated

```
{OUTPUT_DIR}/
├── screenshots/
│   └── check/
│       ├── interaction-log.json    # Timestamped interaction log
│       ├── issues.json             # Issues with translations
│       ├── desktop/                # Desktop viewport evidence
│       ├── tablet/                 # Tablet viewport evidence
│       └── mobile/                 # Mobile viewport evidence
└── public/
    └── evidence/
        ├── index.html              # Evidence viewer
        └── screenshots.json        # Screenshot manifest
```

## Alternatives Considered

### 1. Full-Site Crawler with Issue Detection

Crawl entire site and detect all issues across all pages.

**Rejected because:**
- Dramatically increases execution time
- Out of scope for landing page proofs
- Lighthouse/SEO tools already exist for this

### 2. Pixel-Perfect Screenshot Comparison for Issue Detection

Use image diff to detect issues by comparing screenshots.

**Rejected because:**
- Doesn't detect interaction failures
- Can't identify functional issues like broken menus
- Already using vision-based parity scoring

### 3. Headless-Only Testing (No Visual Evidence)

Run interaction tests without capturing screenshots.

**Rejected because:**
- Loses the visual proof component
- Harder to communicate issues to prospects
- Screenshots are the compelling evidence

### 4. Separate CHECK Command

Create `/pro:check` as a standalone command separate from permissionless-proof.

**Deferred:**
- Could be extracted later if useful independently
- For now, CHECK is integral to the proof pipeline
- Single command is simpler for operators

## Related

- ADR-035: Permissionless Proof Pipeline Architecture (parent feature)
- ADR-036: Auto Visual Parity Verification (unchanged by this ADR)
- ADR-037: GitHub Pages Deployment (enhanced with deploy scripts)
