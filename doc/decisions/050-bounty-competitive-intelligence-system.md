# 050. Bounty Competitive Intelligence System

Date: 2026-01-13

## Status

Accepted

## Context

After losing a $2,000 ZIO bounty despite having correct, reviewable code, we identified the root cause: **decision timing under competition**. The bounty was lost not on code quality, but on scope timing—a competitor shipped a 10x more comprehensive solution while we optimized for minimal, merge-safe MVP.

The existing bounty.scout and bounty.hunter commands lacked:
1. Real-time competitive intelligence
2. Decision authority (they advised but didn't gate)
3. Mode switching based on competition level
4. Learning from outcomes

## Decision

We implemented a 3-tier bounty intelligence system:

### 1. Four-State Threat Model

| State | Meaning | Action |
|-------|---------|--------|
| CLEAR | No serious competition | Proceed normally |
| RACING | Competitors exist, no Reward yet | Switch to aggressive mode |
| LEAPFROG | 1 Reward PR, window still open | Go hard in 24-48h or abort |
| ABORT | 2+ Reward PRs or window closed | Disengage immediately |

### 2. Algora Bot as Primary Intelligence Source

Instead of parsing human comments, we extract structured data from Algora's bot comment which contains:
- Attempts table with all competitors
- Solution column (WIP vs PR#)
- **Actions column with "Reward" status** (critical signal)

### 3. Hard Gates with Override Logging

- ABORT state **blocks** Hunter from proceeding
- Override requires explicit justification
- All overrides logged for outcome analysis
- Creates dataset: "I ignored Recon" → outcome

### 4. Automatic Aggressive Mode

When competition exists (RACING/LEAPFROG), defaults flip:
- Breadth over polish
- All variants mandatory
- Coverage tests, not minimal
- "Closes" not "addresses"

## Consequences

### Positive

- Prevents sunk-cost escalation on unwinnable bounties
- Forces conscious risk-taking (override with reason)
- Encodes maintainer psychology (Reward = selection phase)
- Creates learning dataset from override outcomes
- Makes discipline non-optional

### Negative

- May abort too early on edge cases (strict leapfrog criteria)
- Requires Algora bot format stability
- Override friction may frustrate experienced users

### Neutral

- Adds complexity to bounty workflow
- Requires post-mortem discipline to update outcomes

## Alternatives Considered

### 1. Advisory-only system

Recon advises but doesn't block. Rejected because:
- Doesn't prevent sunk-cost bias
- Users ignore advice under pressure
- No override dataset for learning

### 2. Enhance scout only

Add competition check to scout, skip recon command. Rejected because:
- Scout is point-in-time; competition changes during execution
- Need pre-submit recon check
- Separate command allows standalone use

### 3. Simpler 2-state model (GO/NO-GO)

Binary decision without RACING/LEAPFROG gradients. Rejected because:
- Loses nuance of "aggressive but possible" scenarios
- Doesn't trigger mode switching early enough

## Related

- ADR 048: Bounty Hunter Command Architecture
- Planning: `.plan/bounty-hunter/`
