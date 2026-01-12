# 048. Bounty Hunter Command Architecture

Date: 2026-01-12

## Status

Accepted

## Context

OSS bounties represent a potential revenue stream ($1-2k/month) but the discovery-to-execution pipeline is manual and time-consuming:

1. **Discovery overhead** - Manually browsing bounty platforms, filtering by amount/language
2. **Triage fatigue** - Reading issues, assessing competition, evaluating maintainer signals
3. **Decision paralysis** - Uncertainty about whether a bounty is worth pursuing
4. **Execution friction** - Multiple steps from claim to PR

We needed a system that compresses this loop from hours/days to minutes while preserving human judgment at the merge-critical moment.

## Decision

### Two-Command Architecture

We split bounty hunting into two distinct commands:

**`/pro:bounty.scout`** - Research-only command
- Fetches bounties from Algora.io
- Applies scoring heuristics
- Returns TAKE/SKIP recommendation with rationale
- Zero side effects (no forks, no comments, no branches)
- Safe to run repeatedly for market scanning

**`/pro:bounty.hunter`** - Full execution command
- Requires `gh auth login` (fail fast)
- Posts `/attempt` comment to claim bounty
- Forks repository, creates spike branch
- Generates planning artifacts
- Implements minimal MVP
- Opens PR with human checkpoint

### Separation Rationale

| Concern | Scout | Hunter |
|---------|-------|--------|
| Side effects | None | Many (fork, comment, PR) |
| Authentication | Not required | Required |
| Use case | Research, scanning | Commitment, execution |
| Reversibility | Fully reversible | Partially reversible |
| Human oversight | Report only | Checkpoint before PR |

This separation follows the principle of **progressive commitment**: users can research freely, then explicitly opt into irreversible actions.

### Scoring Heuristics

Bounties are evaluated for **mergeability**, not just difficulty:

**Positive signals**:
- Higher payout (>$1500 = strong signal)
- Clear maintainer guidance
- Isolated module / optional feature
- Existing PRs incomplete or misaligned
- Well-defined acceptance criteria
- "good first issue" / "help wanted" labels

**Negative signals**:
- Strong PR already near merge
- Maintainer endorsing another solution
- Core/security/crypto/consensus code
- High ambiguity with no clarification
- Broad refactors required

**Bail conditions** (automatic SKIP):
- PR already merged/approved
- Maintainer actively working on it
- Security-sensitive domain
- Would require invasive core changes

### State Persistence

Location: `.plan/bounty-hunter/`

```
.plan/bounty-hunter/
  config.json       # User preferences (floor, languages)
  discovered.json   # Cached bounty listings (1hr TTL)
  attempts.json     # Record of claimed bounties
```

This follows the existing `.plan/` convention for plugin state.

### Hard-Coded Source (v1)

For v1, we hard-code Algora.io as the only bounty source:
- Simplifies implementation
- Focused on proving the pipeline works
- Extensible to other sources later (GitHub Sponsors, Gitcoin, etc.)

### Human Checkpoint Design

The hunter command implements a mandatory pause before or after PR creation:

```
## Bounty Hunt Complete - Human Review Required

**PR Created**: [URL]

### Diff Summary
- Files changed: X
- Additions: +Y
- Deletions: -Z

### Risk Assessment
[Table of risks with mitigation]

### Mergeability Rationale
[Why this PR should be merged - maintainer perspective]

**Options**: approve | adjust | abort
```

This preserves human judgment while handling the mechanical work autonomously.

## Consequences

### Positive

- **Decision compression** - Hours of triage reduced to minutes
- **Consistent evaluation** - Same heuristics applied to every bounty
- **Zero-risk research** - Scout mode has no side effects
- **Human-in-the-loop** - Final decision remains with human
- **Resumable** - State persistence enables `/pro:backlog.resume`

### Negative

- **Single source** - v1 only supports Algora.io
- **Scraping fragility** - Algora.io structure changes may break discovery
- **No learning** - Heuristics are static, no feedback loop

### Neutral

- Command-only architecture (no skill or subagent needed for v1)
- Follows existing branch naming conventions
- Integrates with backlog for tracking

## Alternatives Considered

### 1. Single command with modes

```bash
/pro:bounty --scout
/pro:bounty --hunt
```

Rejected because:
- Mode flags increase cognitive load
- Accidental execution risk (wrong flag)
- Harder to document distinct behaviors

### 2. Skill-based architecture

Rejected because:
- Skills are model-invoked, not user-invoked
- User needs explicit control over when to hunt
- No proactive behavior needed

### 3. Full automation (no human checkpoint)

Rejected because:
- PRs represent the user's reputation
- Maintainer psychology requires human judgment
- Errors are costly (burned reputation, wasted time)

## Related

- ADR-016: ADR Check and Backlog Integration for Work Commands
- ADR-017: Branch Naming Invariant and Work-Type Taxonomy
- ADR-026: Subagent-Skill Dual Architecture (not used here)
- Planning: `.plan/feat-bounty-hunter-command/`
