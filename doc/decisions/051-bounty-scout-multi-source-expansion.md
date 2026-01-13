# 051. Bounty Scout Multi-Source Expansion with ROI-Based Evaluation

Date: 2026-01-13

## Status

Accepted

## Context

After implementing the bounty hunting pipeline (ADR 048) and competitive intelligence system (ADR 050), we observed that Algora.io bounties are frequently overcrowded with high competition and low probability of success. The system correctly identifies these as SKIP, but lacks alternative discovery channels with better ROI.

Additionally, the original scoring model weighted dollar amounts too heavily, leading to pursuit of high-headline bounties that were structurally negative ROI due to:
- Context switching overhead
- Setup and teardown cost
- Review and payout latency
- High competition on visible platforms

## Decision

We implemented two major changes:

### 1. Multi-Source Discovery

Expand `/pro:bounty.scout` to discover opportunities beyond Algora:

**GitHub-Native Sources:**
- **Paid Issue Signals** - Search issues with keywords like "bounty", "paid", "would pay" and labels like `help-wanted`, `good-first-issue`
- **Sponsors-Enabled Repositories** - Detect repos with GitHub Sponsors and flag monetizable issues (migration-related, long-standing, complex)
- **Urgency Signals** - Detect issues with keywords like "regression", "release blocker", "urgent"

**Unified Output:**
- All sources merged into single `allBounties[]` array
- Source tracked as metadata field (`source: "algora" | "github-native"`)
- Value tier classification: `explicit_bounty`, `high_likelihood_paid`, `monetizable_candidate`

### 2. ROI-Based Evaluation Model

Replace dollar-centric scoring with probability-weighted ROI:

**Hard Floor ($100):**
- System-enforced minimum
- No analysis, no override, no exceptions
- Below $100, ROI is structurally negative

**ROI Score Calculation:**
```
ROI Score = (amount × winProbability) / timeEstimateHours × modifiers

Modifiers:
- scopeClarity: clear=1.0, moderate=0.8, ambiguous=0.5
- resolutionSpeed: fast=1.2, moderate=1.0, slow=0.7
- sourceBonus: github-native=1.1, algora=1.0
```

**Decision Thresholds:**
| ROI Score | Recommendation |
|-----------|----------------|
| 70-100 | Strong TAKE |
| 50-69 | Conditional TAKE |
| 30-49 | Weak - likely SKIP |
| 0-29 | SKIP |

**Dollar amount does NOT override these thresholds.**

### 3. Confidence Tiers for Non-Priced Opportunities

For GitHub-native discoveries without explicit dollar amounts:
- Tag as `high_likelihood_paid` or `monetizable_candidate`
- No fake dollar estimates
- Signal likelihood instead of inventing money

## Consequences

### Positive

- **Larger discovery surface** - GitHub-native opportunities are under-contested
- **Early-entry advantage** - Discover opportunities before they appear on bounty platforms
- **Probability-weighted decisions** - ROI score encodes win probability, not just headline amount
- **Zero time on noise** - Hard $100 floor eliminates structurally negative opportunities
- **Cross-source comparison** - ROI score enables comparing Algora bounties with GitHub-native opportunities

### Negative

- **More complex scoring** - ROI calculation requires time estimation and probability assessment
- **GitHub API rate limits** - Multiple search queries may hit limits on heavy use
- **Non-priced uncertainty** - GitHub-native opportunities may not convert to payment

### Neutral

- Preserves Scout → Recon → Hunter pipeline compatibility
- Algora competitive intelligence (bot parsing) still works for Algora-sourced bounties
- Config-driven source enablement allows users to disable GitHub-native if desired

## Alternatives Considered

### 1. Separate discovery commands per source

```bash
/pro:bounty.scout.algora
/pro:bounty.scout.github
```

Rejected because:
- Fragments decision surface
- Forces manual cross-source comparison
- Increases cognitive load

### 2. Dollar estimates for non-priced opportunities

Use heuristics to estimate potential value (e.g., urgency + sponsor status = $500-1500).

Rejected because:
- Introduces false precision
- Maintainers pay for urgency, not heuristics
- System is about probability, not hope

### 3. Lower hard floor ($50)

Allow smaller bounties with stronger ROI signals.

Rejected because:
- Even optimal $50 bounties have negative expected value after overhead
- Creates distraction from higher-value opportunities
- $100 is already generous given context-switching costs

## Related

- ADR 048: Bounty Hunter Command Architecture
- ADR 050: Bounty Competitive Intelligence System
- Planning: `.plan/feat-bounty-scout-github-native-sources/`
