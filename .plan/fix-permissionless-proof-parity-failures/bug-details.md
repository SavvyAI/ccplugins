# Bug: Permissionless Proof Parity Failures

## Overview

The `/pro:permissionless-proof` command has three interconnected issues that prevent it from achieving its core value proposition.

## Issue 1: Excessive Human Intervention

**Severity:** Degraded experience

**Steps to Reproduce:**
1. Run `/pro:permissionless-proof https://www.gardensdentistrypb.com/`
2. Observe prompts at each phase transition

**Expected Behavior:**
- Command runs autonomously through all phases
- Only ask for confirmation when truly necessary (e.g., abort conditions)

**Actual Behavior:**
- Prompts "Proceed to PARITY phase? (y/n)" after ACQUIRE
- Prompts at AUTO-VERIFY exit conditions
- Too many human touchpoints for a volume-based outreach workflow

## Issue 2: CHECK Phase Not Finding Problems

**Severity:** Degraded experience

**Steps to Reproduce:**
1. Run `/pro:permissionless-proof https://www.gardensdentistrypb.com/`
2. Observe CHECK phase output

**Expected Behavior:**
- Should find 3-7 real issues on any production website
- Should cover copywriting/content issues, not just technical failures
- Should be aggressive enough to have talking points for sales outreach

**Actual Behavior:**
- Reports "Issues Detected: 0" (or very few)
- Misses obvious opportunities for improvement
- Doesn't provide operator with compelling evidence for outreach

**Missing Coverage:**
- Copywriting quality (weak headlines, generic CTAs)
- Content gaps (missing testimonials, weak social proof)
- Trust signal opportunities (certifications, awards, credentials)
- Conversion optimization (CTA placement, form friction)

## Issue 3: PARITY Phase Not Achieving True Parity

**Severity:** Blocks work (core functionality broken)

**Steps to Reproduce:**
1. Run `/pro:permissionless-proof https://www.gardensdentistrypb.com/`
2. Compare source screenshot to parity screenshot side-by-side

**Expected Behavior:**
- Clone should be 98%+ visually identical to source
- Colors, typography, spacing, imagery should match precisely
- Only proceed to ELEVATE after true parity achieved

**Actual Behavior (with visual evidence):**

| Area | Original | Clone |
|------|----------|-------|
| **Density** | Spacious, lots of whitespace | Cramped, compressed |
| **Colors** | Subtle navy/cream/white | Darker, more saturated |
| **Services cards** | Light backgrounds, airy | Dark backgrounds, dense |
| **Testimonials** | Navy background | Red/coral background (!!) |
| **Typography** | Refined, spa-like | More generic |
| **Overall vibe** | "Luxury spa dental" | "Generic dental template" |

**This is ~60-70% parity, not 98%.**

## Environment

- Platform: macOS Darwin 25.1.0
- Tool: Claude Code + ccplugins (main branch at af60642)
- Browser MCP: Playwright

## Root Cause Hypotheses

### Issue 1 (Intervention)
- Command spec explicitly includes `AskUserQuestion` at phase transitions
- Need to remove these gates and make them optional/configurable

### Issue 2 (CHECK)
- CHECK phase only tests technical interactions (clicks, scrolls, forms)
- Missing content/copywriting audit dimension
- Need to expand audit categories beyond UX failures

### Issue 3 (Parity)
- Vision scoring is too generous
- Gap identification is shallow (misses colors, typography, density)
- Iteration loop may exit too early
- Recommendations may be too vague to produce good fixes

## Definition of Done

- [ ] Command runs autonomously from start to ELEVATE phase
- [ ] CHECK phase finds 3-7+ issues on typical production websites
- [ ] CHECK includes content/copy audit, not just technical failures
- [ ] Parity verification is rigorous and accurate
- [ ] Clone achieves true 98%+ visual match before proceeding
- [ ] No regressions in existing functionality
