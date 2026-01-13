# Plan: Expand Bounty Scout to GitHub-Native Sources

## Problem Statement

Algora.io bounties are overcrowded with high competition and low probability of success. The system correctly identifies these as SKIP, but lacks alternative discovery channels with better ROI.

## Goal

Expand `/pro:bounty.scout` to discover paid/monetizable opportunities outside Algora while preserving:
- Low competition
- Early-entry advantage
- Machine-discoverable signals
- Compatibility with existing Scout → Recon → Hunter pipeline

## Key Decisions (User-Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Source merge strategy | Unified list | Recon assumes single decision surface; source is metadata, not divider |
| Value display | Confidence tiers | No fake dollar amounts; signal likelihood instead |
| Phase 2 aggregators | Deferred | Prove GitHub-native first; expand only after wins |
| **Evaluation model** | **ROI-based** | Dollar amount is metadata; ROI score is primary decision variable |
| **Hard floor** | **$100 minimum** | System-enforced, no analysis, no override, no exceptions |

## Canonical Rule (System-Level)

> Below $100: ignore.
> At or above $100: do the math.

This rule is enforced by the system, not left to human judgment.

## Architecture

### Config Schema Extension

```json
{
  "floorAmount": 100,           // HARD MINIMUM - system-enforced, cannot be lowered
  "softFloorAmount": 1000,      // User preference for triage prioritization
  "preferredLanguages": [],
  "excludeRepos": [],
  "sources": {
    "algora": { "enabled": true },
    "githubNative": {
      "enabled": true,
      "paidIssueSignals": true,
      "sponsorsEnabled": true,
      "urgencySignals": true
    }
  }
}
```

**Floor Semantics:**
- `floorAmount` ($100) is the hard minimum - bounties below are discarded without analysis
- `softFloorAmount` ($1000) is the user's preferred minimum for prioritization
- Bounties between $100-$999 are analyzed but ranked lower unless ROI signals are strong

### Discovery Output Schema

```json
{
  "source": "algora | github-native",
  "valueTier": "explicit_bounty | high_likelihood_paid | monetizable_candidate | discarded_below_floor",
  "amount": 2000,           // null for non-priced
  "currency": "USD",        // null for non-priced
  "roiScore": 85,           // 0-100, PRIMARY DECISION VARIABLE
  "roiFactors": {
    "timeEstimateHours": 4,
    "competitionLevel": "low",    // none | low | medium | high | critical
    "winProbability": 0.75,       // 0.0-1.0
    "scopeClarity": "clear",      // clear | moderate | ambiguous
    "resolutionSpeed": "fast"     // fast | moderate | slow
  },
  "discardReason": null     // "below_floor" if < $100
}
```

**ROI Score is the Universal Currency:**
- All opportunities (Algora + GitHub-native) ranked by ROI score
- Dollar amount shown as metadata only
- ROI score enables cross-source comparison

### Value Tier Definitions

| Tier | Criteria | Confidence |
|------|----------|------------|
| `explicit_bounty` | Dollar amount mentioned in issue/comment | 90-100 |
| `high_likelihood_paid` | Urgency signals + sponsor-enabled + maintainer engagement | 70-89 |
| `monetizable_candidate` | Sponsor-enabled OR help-wanted + long-standing | 50-69 |

## Phase 1: GitHub-Native Discovery

### 1. Paid Issue Signals

**Search Query:**
```bash
gh search issues "bounty OR paid OR \"would pay\" OR \"happy to pay\" OR sponsor" \
  --label="help wanted,good first issue" \
  --state=open \
  --limit=50 \
  --json repository,title,number,url,labels,createdAt,updatedAt
```

**Scoring:**
- Explicit bounty amount mentioned: +3
- "would pay" or "happy to pay" keywords: +2
- `help wanted` label: +1
- `good first issue` label: +1

### 2. Sponsors-Enabled Repositories

**Detection:**
```bash
gh api repos/{owner}/{repo} --jq '.has_sponsor_listing // false'
```

**Within sponsor-enabled repos, flag issues that are:**
- Migration-related (keywords: migrate, migration, upgrade, v2, v3)
- Long-standing (>90 days old)
- Marked as complex or blocked (labels: blocked, help-wanted, complex)

**Scoring:**
- Sponsors-enabled repo: +2
- Migration-related: +1
- Long-standing (>90 days): +1

### 3. Urgency Signals

**Search Query:**
```bash
gh search issues "regression OR \"release blocker\" OR urgent OR production OR blocking" \
  --state=open \
  --limit=50 \
  --json repository,title,number,url,labels,createdAt,updatedAt
```

**Scoring:**
- Urgency keyword present: +2
- Recent maintainer activity (<7 days): +1
- No existing PRs: +1

## ROI-Based Evaluation Model

### Hard Floor Enforcement

```
IF amount < $100:
  DISCARD immediately
  SET valueTier = "discarded_below_floor"
  SET discardReason = "below_floor"
  NO further analysis
```

### ROI Score Calculation (≥ $100)

```
ROI Score = (amount × winProbability) / timeEstimateHours × modifiers

Where modifiers:
  - scopeClarity: clear=1.0, moderate=0.8, ambiguous=0.5
  - resolutionSpeed: fast=1.2, moderate=1.0, slow=0.7
  - sourceBonus: github-native=1.1, algora=1.0 (lower competition surface)

Normalized to 0-100 scale.
```

### ROI Factor Estimation

| Factor | How Estimated |
|--------|---------------|
| `timeEstimateHours` | Scope analysis: LOC estimate, test requirements, review cycles |
| `competitionLevel` | Algora bot attempts + PR count + maintainer engagement |
| `winProbability` | Based on competition: none=0.9, low=0.7, medium=0.4, high=0.2, critical=0.05 |
| `scopeClarity` | Acceptance criteria presence, maintainer guidance, issue specificity |
| `resolutionSpeed` | Maintainer responsiveness, repo activity, payout history |

### Sort Order

1. Primary: ROI Score (descending)
2. Secondary: Win probability (descending)
3. Tertiary: Recent activity (descending)

### Decision Thresholds

| ROI Score | Recommendation |
|-----------|----------------|
| 70-100 | Strong TAKE candidate |
| 50-69 | Conditional TAKE (verify with Recon) |
| 30-49 | Weak - likely SKIP unless strategic |
| 0-29 | SKIP |

**Dollar amount does NOT override these thresholds.**

## Implementation Steps

1. **Implement hard $100 floor** - System-enforced rejection, no analysis below floor
2. **Extend config schema** - Add `sources` block, distinguish hard vs soft floor
3. **Implement ROI score calculation** - Time estimate, win probability, modifiers
4. **Add Phase 2b: GitHub-Native Discovery** - New discovery phase after Algora
5. **Implement paid issue signal detection** - Keyword + label search via `gh search`
6. **Implement sponsors-enabled detection** - Repository metadata check
7. **Implement urgency signal detection** - Keyword search with scoring
8. **Add value tier tagging** - Logic for `valueTier` including `discarded_below_floor`
9. **Merge discovery results** - Unified `allBounties[]` sorted by ROI score
10. **Update report format** - Show ROI score, factors, value tier (dollar as metadata)
11. **Update discovered.json schema** - Persist ROI factors and new fields
12. **Create ADR 051** - Document multi-source expansion + ROI model decision

## Files to Modify

| File | Changes |
|------|---------|
| `pro/commands/bounty.scout.md` | Add Phase 2b, extend scoring, update output schema |
| `doc/decisions/051-bounty-scout-multi-source-expansion.md` | New ADR |

## Files NOT Modified

- `bounty.recon.md` - PR analysis works identically for any source
- `bounty.hunter.md` - Execution pipeline unchanged

## Explicit Out of Scope

- Discord/Slack ingestion
- Outbound bounty creation
- Maintainer negotiation flows
- Phase 2 aggregators (Open Collective, Gitcoin)

## Success Criteria

- **Zero execution time on sub-$100 bounties** - Hard floor enforced
- **Fewer bounties pursued overall** - ROI-based selection, not volume
- **Higher win rate on pursued bounties** - Probability-weighted decisions
- **Clear, explainable decisions** - ROI score and factors visible
- Scout surfaces opportunities with:
  - ≤1 active competitor
  - No existing PRs
  - Clear maintainer responsiveness
- Recon frequently returns CLEAR or RACING
- Hunter engages fewer bounties with higher win probability

## Testing Strategy

1. **Hard floor enforcement** - Verify bounties < $100 are discarded without analysis
2. **ROI score calculation** - Verify scores reflect time/probability/modifiers correctly
3. **Decision thresholds** - Verify TAKE/SKIP recommendations align with ROI scores
4. Run Scout with `sources.githubNative.enabled: true`
5. Verify GitHub-native results appear in unified list
6. Verify value tiers assigned correctly (including `discarded_below_floor`)
7. Verify ROI scoring produces sensible ordering (not just dollar amount)
8. Verify Recon works on GitHub-native discoveries
9. Verify dollar amount does NOT override ROI-based decisions

## Related ADRs

- ADR 048: Bounty Hunter Command Architecture
- ADR 050: Bounty Competitive Intelligence System
- ADR 051: Bounty Scout Multi-Source Expansion (to be created)
