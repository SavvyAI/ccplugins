---
description: "Validated idea? → Generate investor-ready pitch deck outline → 10 slides from your research"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep"]
---

## Context

Let's create a pitch deck outline.

## Purpose

Generate a structured pitch deck outline from your validated product. Uses the product brief and validation report to create an investor-ready 10-slide structure.

**Prerequisites:**
1. Product brief exists (in `.plan/product/briefs/*.md` or legacy `brief.md`)
2. Validation report exists (`.plan/product/validation-*.md`)

**This command produces:**
- 10-slide pitch deck outline at `.plan/product/pitch-{timestamp}.md`
- Content derived from validation research
- Placeholder sections for user-specific info (team, ask)

## Your Task

### Step 1: Resolve Inputs

Find required documents:

1. **Brief:** Find most recent brief
   - Check for `.plan/product/briefs/*.md` files
   - If found: use the most recent (by filename date)
   - If empty: check for legacy `.plan/product/brief.md` (non-index format)
2. **Validation:** Find most recent `.plan/product/validation-*.md`

If either is missing:
```
Error: Cannot generate pitch without validation.

Required files:
- Product brief in .plan/product/briefs/ (run /pro:product.brief)
- .plan/product/validation-*.md (run /pro:product.validate)
```

### Step 2: Check Validation Verdict

Read the validation report's verdict:

- **GO:** Proceed with enthusiastic pitch framing
- **CAUTION:** Proceed but acknowledge risks clearly
- **NO-GO:** Warn user before proceeding

For NO-GO:
```
Warning: The validation verdict was NO-GO.

Creating a pitch deck for an invalidated idea is risky. The validation identified these critical issues:
1. [Issue 1]
2. [Issue 2]
3. [Issue 3]

Do you want to proceed anyway? This pitch will need to address these concerns directly.
```

Use `AskUserQuestion` to confirm if NO-GO.

### Step 3: Extract Key Content

From the brief and validation, extract:

| Slide | Source |
|-------|--------|
| Hook | Core Insight from validation |
| Problem | Problem Statement + Market Signal |
| Solution | Proposed Solution from brief |
| Market | Market Signal + Buyer Analysis |
| Business Model | Business Model section |
| Traction | Evidence from validation research |
| Competition | Competitive Reality section |
| Team | [User fills in] |
| Ask | [User fills in] |
| Vision | Core Insight + Defensibility |

### Step 4: Generate Pitch Deck Outline

```markdown
# Pitch Deck Outline

**Product:** [name from brief]
**Generated:** [ISO 8601 timestamp]
**Based on:** Validation from [validation timestamp]
**Validation Verdict:** [GO / CAUTION / NO-GO]

---

## Slide 1: The Hook

**Goal:** One sentence that makes investors lean in.

> [Generated from Core Insight - the durable value proposition]

**Talking points:**
- [Key tension or opportunity]
- [Why this matters now]

---

## Slide 2: The Problem

**Goal:** Make the pain visceral and quantified.

### The Pain Point
[From Problem Statement - specific, emotional]

### Who Has This Problem
[From Target Customer - be specific]

### Why It Matters Now
[From Market Timing - urgency]

### Supporting Data
- [Stat 1 from research]
- [Stat 2 from research]

---

## Slide 3: The Solution

**Goal:** Show your answer clearly and memorably.

### What We're Building
[From Proposed Solution]

### How It Works
1. [Step/Feature 1]
2. [Step/Feature 2]
3. [Step/Feature 3]

### Key Differentiator
[What makes this different from alternatives]

### Demo Moment
[What would you show in a live demo?]

---

## Slide 4: Market Opportunity

**Goal:** Show the size and trajectory.

### Market Size
| Metric | Value | Source |
|--------|-------|--------|
| TAM | [estimate] | [source] |
| SAM | [estimate] | [source] |
| SOM | [estimate] | [source] |

### Growth Trajectory
[From Market Signal research - trends, drivers]

### Why This Market, Why Now
[From Market Timing section]

---

## Slide 5: Business Model

**Goal:** Show how money flows.

### Revenue Model
[From Business Model section]

### Pricing
| Tier | Price | Value |
|------|-------|-------|
| [Tier 1] | $ | [what they get] |
| [Tier 2] | $ | [what they get] |

### Unit Economics (if known)
- CAC: [estimate or "TBD"]
- LTV: [estimate or "TBD"]
- Payback: [estimate or "TBD"]

---

## Slide 6: Traction / Validation

**Goal:** Show evidence of demand.

### Market Signals
[From validation research - demand evidence]

### Early Validation
- [Signal 1]
- [Signal 2]
- [Signal 3]

### What We've Learned
[Key insights from validation process]

---

## Slide 7: Competition

**Goal:** Show you understand the landscape and why you win.

### Competitive Landscape
| Competitor | Strength | Our Advantage |
|------------|----------|---------------|
| [Comp 1] | [what they do well] | [why we're better] |
| [Comp 2] | [what they do well] | [why we're better] |
| [Comp 3] | [what they do well] | [why we're better] |

### Why We Win
[From Competitive Reality - differentiation]

### Defensibility
[Long-term moat from validation]

---

## Slide 8: Team

**Goal:** Show you're the right team to build this.

> [USER: Fill in your team details]

### Founders
| Name | Role | Background |
|------|------|------------|
| [Name] | [Role] | [Relevant experience] |
| [Name] | [Role] | [Relevant experience] |

### Why This Team
[What makes you uniquely suited to solve this problem?]

### Key Hires Needed
[If applicable - what roles are you hiring for?]

---

## Slide 9: The Ask

**Goal:** Be specific about what you need.

> [USER: Fill in your ask details]

### Funding
- **Amount:** $[X]
- **Type:** [Seed / Series A / etc.]

### Use of Funds
| Category | % | Purpose |
|----------|---|---------|
| [Engineering] | X% | [what you'll build] |
| [Growth] | X% | [how you'll grow] |
| [Operations] | X% | [infrastructure] |

### Milestones
With this funding, we will:
1. [Milestone 1 - X months]
2. [Milestone 2 - X months]
3. [Milestone 3 - X months]

---

## Slide 10: Vision

**Goal:** Show where this goes and why it matters.

### The Big Picture
[From Core Insight - expanded vision]

### Long-term Play
[From Defensibility - sustainable advantage]

### Why This Matters
[Impact, mission, meaning]

### Closing Statement
> [One memorable sentence to end on]

---

## Appendix: Supporting Data

### Key Statistics
| Metric | Value | Source |
|--------|-------|--------|
| [Stat 1] | [value] | [source] |
| [Stat 2] | [value] | [source] |
| [Stat 3] | [value] | [source] |

### Research Sources
- [Source 1]
- [Source 2]
- [Source 3]

### Validation Score Breakdown
[From validation Bottom Line - dimension scores]

---

*Generated by /pro:product.pitch*
*Based on validation from [timestamp]*
```

### Step 5: Write Pitch to File

```bash
mkdir -p .plan/product
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
# Write to: .plan/product/pitch-{TIMESTAMP}.md
```

### Step 6: Copy to Clipboard

Copy pitch to clipboard (platform-aware).

### Step 7: Display Summary

```
## Pitch Deck Outline Created

**Product:** [name]
**Slides:** 10 (8 generated, 2 require your input)

### Generated Slides
1. The Hook
2. The Problem
3. The Solution
4. Market Opportunity
5. Business Model
6. Traction / Validation
7. Competition
10. Vision

### Requires Your Input
8. Team - Add your team details
9. The Ask - Specify funding and milestones

Saved to: `.plan/product/pitch-2026-01-01-220000.md`
Copied to clipboard.

**Next steps:**
1. Fill in Team and Ask sections
2. Create slides in your preferred tool (Keynote, Google Slides, Figma)
3. Practice your delivery
```

## Slide Design Notes

The outline is content-focused, not design-focused. When creating actual slides:

- **One idea per slide**
- **Minimal text** - these are talking points, not scripts
- **Visual hierarchy** - most important info largest
- **Data visualization** - charts > tables > text
- **Consistent branding** - but that's for the user to add

## Non-Git Directory Support

Works in any directory without git.

## Definition of Done

- Brief and validation files found
- Validation verdict checked (warn if NO-GO)
- Key content extracted from both documents
- 10-slide outline generated
- User-input sections clearly marked
- Pitch written with timestamp
- Pitch copied to clipboard
- Summary displayed with next steps
