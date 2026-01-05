# /pro:permissionless-proof Implementation Plan

## Summary

A utility command that runs a complete permissionless proof pipeline for any live website:
1. **ACQUIRE** - Faithful extraction of content, assets, and screenshots
2. **PARITY** - Strict-mode React rebuild matching original structure
3. **VERIFY** - Dual verification (screenshots + structural checklist)
4. **ELEVATE** - Modern polish with shadcn/ui, Framer Motion, typography upgrades

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Output location | User-specified, defaults to `.` | Full control - can `mkdir foo && cd foo` then run with `.` |
| Framework | Vite + React | Speed, simplicity, static hosting anywhere |
| Verification | Both (visual + structural) | Belt and suspenders for parity guarantee |
| Git workflow | Utility command | Speed over ceremony; speculative proofs shouldn't clutter backlog |

## ADR Alignment

- **ADR-019** - Phased pipeline pattern with user confirmations
- **ADR-032** - Tiered extraction fallback (WebFetch → Playwright → user paste)
- **ADR-017** - This is a utility command, NOT work-initiating (no branch creation when run)

## Command Specification

### Input
```
/pro:permissionless-proof <url>
```

### Output Structure
```
{output-dir}/  # defaults to ./
├── src/                    # Deployable React codebase
│   ├── components/         # Extracted sections as components
│   ├── assets/            # Downloaded images, fonts
│   ├── App.tsx            # Main app with routing
│   └── main.tsx           # Entry point
├── screenshots/           # Before/after comparisons
│   ├── source/           # Original site screenshots
│   └── parity/           # Rebuilt site screenshots
├── diff/                  # Verification reports
│   ├── structural.md     # Section-by-section checklist
│   └── summary.md        # Overall parity score
├── public/               # Static assets
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md             # Changes summary + run instructions
```

## Implementation Phases

### Phase 1: ACQUIRE (Faithful Extraction)

#### 1.1 URL Validation
- Parse and validate input URL
- Extract domain for directory naming
- Check for robots.txt restrictions (warn but proceed)

#### 1.2 Full Page Capture
Use tiered extraction (per ADR-032):
1. **WebFetch** - Get initial HTML
2. **Playwright MCP** - Handle JS-rendered content, SPAs
3. **Fallback** - Ask user for manual paste if blocked

#### 1.3 Content Analysis
Extract:
- HTML structure with section hierarchy
- Navigation patterns
- Forms (contact, newsletter, booking)
- Maps (Google Maps, embedded iframes)
- Meta/OG tags, favicon, structured data
- Font families, color palette

#### 1.4 Asset Download
- Images (optimize: WebP, lazy loading placeholders)
- Fonts (or identify Google Fonts equivalents)
- Videos (store as placeholder or embed reference)

#### 1.5 Screenshots
Using Playwright MCP:
- Hero section (viewport)
- Full page scroll capture
- Mobile viewport (375px)
- Key sections individually

#### 1.6 Auth Wall Detection
- Check for login forms, gated content
- Document what couldn't be accessed
- User acknowledgment before proceeding

### Phase 2: PARITY (Strict Mode)

#### 2.1 Project Scaffold
```bash
npm create vite@latest {domain} -- --template react-ts
cd {domain}
npm install tailwindcss postcss autoprefixer
npm install framer-motion
npx tailwindcss init -p
```

Plus shadcn/ui setup:
```bash
npx shadcn@latest init
```

#### 2.2 Section Mapping
For each detected section in order:
1. Create component file
2. Match content density exactly
3. Match layout intent (grid, flex patterns)
4. Use original copy verbatim
5. Link to downloaded assets

#### 2.3 Structural Rules
- **DO**: Match section order, heading hierarchy, CTA placement
- **DO NOT**: Redesign, simplify, add sections, change copy
- **Target**: ≥99% visual + structural parity

#### 2.4 Generate Components
Each section becomes a component:
```tsx
// src/components/HeroSection.tsx
export function HeroSection() {
  return (
    <section className="...">
      {/* Exact structure from original */}
    </section>
  )
}
```

### Phase 3: VERIFY (Dual Approach)

#### 3.1 Visual Comparison
Using Playwright MCP:
1. Start dev server (`npm run dev`)
2. Capture screenshots at same viewports as source
3. Present side-by-side comparison
4. User confirms: "Does parity look correct? (y/n)"

#### 3.2 Structural Checklist
Generate `diff/structural.md`:
```markdown
## Parity Checklist

### Navigation
- [ ] Logo present and linked to home
- [ ] All nav items present
- [ ] Mobile menu implemented

### Hero Section
- [ ] Headline matches: "{exact text}"
- [ ] CTA button present: "{button text}"
- [ ] Background image/treatment matches

### Services Section
- [ ] {count} service cards present
- [ ] Each has title, description, icon

### Contact Section
- [ ] Form fields match: {list}
- [ ] Map embed present (if applicable)
- [ ] Phone/email displayed

### Footer
- [ ] Social links present
- [ ] Copyright text matches
```

#### 3.3 Gate to ELEVATE
```
Parity verification complete.

Visual match confirmed: Yes
Structural checklist: 12/12 items verified

Proceed to ELEVATE phase? (y/n)
```

Only proceed if user explicitly approves.

### Phase 4: ELEVATE (Polish)

#### 4.1 Typography Upgrade
- Replace generic fonts with distinctive choices
- Use Google Fonts or system font stacks
- Establish clear hierarchy (display + body fonts)
- Apply calm, professional, local feel

#### 4.2 Spacing & Rhythm
- Normalize padding/margins to consistent scale
- Add breathing room between sections
- Ensure responsive behavior works correctly

#### 4.3 shadcn/ui Components
Replace raw elements with polished components:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add input
```

If map present:
```bash
npx shadcn@latest add https://mapcn.vercel.app/maps/map.json
```

#### 4.4 Framer Motion
Add subtle, restrained animations:
- Fade-in on scroll (IntersectionObserver pattern)
- Stagger children on section entry
- Hover states on cards/buttons
- No aggressive animations

#### 4.5 Accessibility
- Semantic HTML (nav, main, section, article)
- ARIA labels where needed
- Focus states on interactive elements
- Color contrast verification

#### 4.6 SEO/Meta Preservation
- Keep original title, description
- Preserve OG tags
- Maintain structured data (JSON-LD)
- Don't break existing SEO

### Phase 5: OUTPUT

#### 5.1 Generate README
```markdown
# Permissionless Proof: {domain}

Rebuilt from: {original URL}
Generated: {timestamp}

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Changes Summary

### Parity Phase
- {count} sections extracted
- {count} images downloaded
- {count} forms preserved

### Elevate Phase
- Typography: {font choices}
- Components: shadcn/ui button, card, form
- Motion: Framer Motion fade-in, stagger
- Accessibility: Semantic HTML, ARIA labels

## Deployment

\`\`\`bash
npm run build
# Deploy dist/ to any static host
\`\`\`

## Notes
- Original source: {url}
- Proof generated with /pro:permissionless-proof
\`\`\`
```

#### 5.2 Final Summary
```
/pro:permissionless-proof Complete
────────────────────────────────────────

Source: {url}
Output: {output-dir}/  # defaults to ./

Phases:
  ✓ ACQUIRE - {count} sections, {count} assets
  ✓ PARITY  - 100% structural match
  ✓ VERIFY  - User approved
  ✓ ELEVATE - Typography, shadcn/ui, motion

Next Steps:
  1. (already in output directory)
  2. npm install && npm run dev
  3. Review at http://localhost:5173
  4. Deploy: npm run build

────────────────────────────────────────
```

## Guardrails

Built into the command:
- Never skip parity phase
- Never invent content
- Never change tone to "agency"
- Never break existing SEO, CTAs, or conversion paths
- Improvements must feel obvious but restrained

## Error Handling

| Error | Action |
|-------|--------|
| URL unreachable | Abort with clear message |
| JS-rendered content not captured | Fallback to Playwright, then user paste |
| Parity verification fails | Do not proceed to ELEVATE |
| Build fails | Report errors, suggest fixes |

## Dependencies

The command requires:
- Node.js 18+
- Playwright MCP (for screenshots and JS-rendered content)
- npm/pnpm

Will install in generated project:
- Vite
- React + TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- mapcn (if maps detected)

## Allowed Tools

```yaml
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebFetch
  - AskUserQuestion
  - mcp__plugin_pro_playwright__*  # Full Playwright suite
  - mcp__plugin_pro_shadcn-ui__*   # shadcn component fetching
```

## Implementation Steps

1. [ ] Create `pro/commands/permissionless-proof.md`
2. [ ] Implement ACQUIRE phase logic
3. [ ] Implement PARITY phase with Vite scaffold
4. [ ] Implement VERIFY phase with dual verification
5. [ ] Implement ELEVATE phase with shadcn/ui integration
6. [ ] Test with example URL (gardensdentistrypb.com from spec)
7. [ ] Create ADR for permissionless proof architecture
