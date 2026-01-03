# 035. Permissionless Proof Pipeline Architecture

Date: 2026-01-03

## Status

Accepted

## Context

Agencies and freelancers often need to demonstrate value to prospective clients before any contract is signed. "Permissionless proofs" are speculative rebuilds of client websites that show what an improved version could look like. These proofs must:

1. Demonstrate skill without misrepresenting the original
2. Be produced quickly (outreach is volume-dependent)
3. Be portable and shareable (zip and send, deploy anywhere)
4. Show both fidelity (can match what exists) and elevation (can improve it)

The key insight is that parity must come first. Showing you can faithfully reproduce the original proves competence; only then does elevation have credibility.

## Decision

### Utility Command (Not Work-Initiating)

The command does NOT create git branches or backlog entries.

**Rationale:**
- "Permissionless" implies speed and minimal ceremony
- Most proofs are speculative—they won't convert
- Cluttering the backlog with speculative work reduces signal
- Users can `git init` manually if they want to keep a proof

### Four-Phase Pipeline

```
ACQUIRE → PARITY → VERIFY → ELEVATE
```

Each phase has explicit purpose and gates:

| Phase | Purpose | Gate |
|-------|---------|------|
| ACQUIRE | Faithful extraction of content and assets | User confirms sections detected |
| PARITY | Strict-mode rebuild matching original | Build must pass |
| VERIFY | Dual verification (visual + structural) | User must explicitly approve |
| ELEVATE | Modern polish (typography, components, motion) | Only after VERIFY passes |

**Rationale:**
- Phased approach ensures no shortcuts
- User gates prevent garbage-in-garbage-out
- Parity verification is the credibility checkpoint

### Tiered Extraction (from ADR-032)

Content extraction uses three-tier fallback:
1. WebFetch (fast, no auth)
2. Playwright MCP (handles JS-rendered content)
3. User paste (fallback for blocked sites)

**Rationale:**
- Modern sites often require JS execution
- Some sites block automated access
- User paste ensures the pipeline never completely fails

### Output Directory Pattern

User specifies output directory explicitly:
```
/pro:permissionless-proof <url> [output-dir]
```

Defaults to `.` (current directory) if not specified.

**Rationale:**
- Users organize their own way (`proofs/dental/`, `proofs/law/`)
- Can create directory first, `cd` into it, then run with `.`
- Full control, no assumptions
- No redundant nesting

### Vite + React Default

Uses Vite + React + TypeScript, not Next.js.

**Rationale:**
- Speed matters for outreach demos
- Static hosting anywhere (no SSR complexity)
- Client's production site gets its own framework choice if they convert

### Dual Verification Strategy

VERIFY phase uses both:
1. **Visual comparison** - Screenshots of source vs parity
2. **Structural checklist** - Section-by-section content verification

**Rationale:**
- Screenshots catch visual drift
- Checklists catch missing CTAs, forms, phone numbers
- Belt and suspenders for the parity guarantee

### Restrained Elevation

ELEVATE phase applies polish but not reinvention:
- Typography upgrade (distinctive but professional fonts)
- shadcn/ui components (buttons, cards, forms)
- Framer Motion (subtle fade-in, no dramatic effects)
- Accessibility improvements (semantic HTML, ARIA)
- SEO preservation (keep original meta tags)

**Forbidden:**
- Inventing content
- Changing tone to "agency speak"
- Breaking CTAs or conversion paths
- Adding sections or features

**Rationale:**
- The proof should feel obviously better, not different
- Credibility comes from restraint, not showing off
- Client should recognize their site, just elevated

## Consequences

### Positive

- **Speed** - Utility command means minimal ceremony
- **Credibility** - Parity-first proves competence before creativity
- **Portability** - Self-contained output deploys anywhere
- **Scalability** - Can produce multiple proofs without backlog noise

### Negative

- **No history** - Without git integration, no automatic version control
- **Manual deployment** - User must deploy themselves (no `/pro:deploy`)
- **Platform limitations** - JS-heavy SPAs may not extract perfectly

### Mitigations

- README includes deployment instructions
- Playwright fallback handles most JS rendering
- User can `git init` if they want to track a valuable proof

## Alternatives Considered

### Work-Initiating Command

Create branch and backlog entry like `/pro:feature`.

**Rejected because:**
- Most proofs are speculative and won't convert
- Speed matters more than ceremony for outreach
- Backlog would fill with abandoned proofs

### Next.js Default

Use Next.js App Router for SSR benefits.

**Rejected because:**
- Adds deployment complexity (needs Node runtime)
- Speed matters more than SSR for demo sites
- Production site gets its own framework choice anyway

### Single Verification Method

Just screenshots OR just checklist.

**Rejected because:**
- Screenshots miss content changes (phone number typos)
- Checklists miss visual drift (wrong colors, spacing)
- Both together catch more issues

### Elevation-Only Mode

Skip parity, go straight to redesign.

**Rejected because:**
- Loses the credibility advantage
- Can't prove you understood the original
- Client can't compare like-for-like

## Related

- ADR-019: React to Next.js Migration Design (phased pipeline pattern)
- ADR-032: Tiered Extraction and Image Intelligence (fallback strategy)
- ADR-017: Branch Naming Invariant (why this is NOT work-initiating)
- Planning: `.plan/feat-permissionless-proof-command/`
