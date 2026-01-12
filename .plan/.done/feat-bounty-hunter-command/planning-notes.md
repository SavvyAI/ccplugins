# Planning Notes: Bounty Hunter Commands

## Overview

Two commands for automated OSS bounty discovery and execution:
- `/pro:bounty.scout` - Discovery and triage only (no side effects)
- `/pro:bounty.hunter` - Full execution pipeline with human checkpoint

## Relevant ADRs

| ADR | Impact |
|-----|--------|
| ADR-014 | Skills directory pattern - may need skill for scoring heuristics |
| ADR-016 | Backlog integration - hunter creates in-progress item when work starts |
| ADR-017 | Branch naming - uses `feat/` prefix for bounty work branches |
| ADR-026 | Subagent-Skill dual architecture - not needed for v1 (user-invoked) |

## Architecture Decision

**Command-only architecture** for v1:
- Both commands are user-invoked (not proactive)
- No skill needed initially - scoring heuristics embedded in commands
- No subagent needed - user explicitly invokes when ready

Future: Could extract scoring heuristics into a skill if they become reusable.

## State Persistence

Location: `.plan/bounty-hunter/`

```
.plan/bounty-hunter/
  discovered.json      # Last discovery results (cache)
  attempts.json        # Record of attempted bounties
  config.json          # User preferences (floor amount, etc.)
```

### discovered.json schema
```json
{
  "fetchedAt": "ISO 8601",
  "source": "algora.io",
  "bounties": [
    {
      "id": "unique-id",
      "title": "Issue title",
      "url": "https://github.com/...",
      "amount": 1500,
      "currency": "USD",
      "repoOwner": "org",
      "repoName": "project",
      "issueNumber": 123,
      "labels": ["good first issue"],
      "status": "open",
      "createdAt": "ISO 8601"
    }
  ]
}
```

### attempts.json schema
```json
{
  "attempts": [
    {
      "bountyId": "unique-id",
      "attemptedAt": "ISO 8601",
      "decision": "TAKE",
      "prUrl": "https://github.com/.../pull/456",
      "status": "submitted|merged|rejected|abandoned",
      "notes": "Optional notes"
    }
  ]
}
```

## Command: /pro:bounty.scout

### Frontmatter
```yaml
---
description: "Bounty research? -> Discover and evaluate bounties -> TAKE/SKIP recommendation"
allowed-tools: ["Bash", "Read", "Write", "WebFetch", "Glob", "Grep"]
---
```

### Flow
1. Pre-flight: Check network connectivity
2. Fetch Algora home page via WebFetch/Playwright
3. Parse bounties, sort by amount descending
4. Filter by floor (default $1000, configurable in config.json)
5. For each bounty (highest first):
   - Fetch GitHub issue
   - Read maintainer comments
   - Check existing PRs
   - Assess competition
   - Apply scoring heuristics
   - Generate TAKE/SKIP decision
6. Surface top candidate with full analysis
7. Write results to `.plan/bounty-hunter/discovered.json`

### Output Format
```markdown
## Bounty Scout Report

**Top Candidate:**
- Title: [Issue title]
- Amount: $X,XXX
- Repository: owner/repo
- Issue: #123

**Recommendation:** TAKE / SKIP

**Scoring Rationale:**
- [Positive signals]
- [Negative signals]

**Risks:**
- [Identified risks]

**Why this bounty:** [Brief explanation]
```

## Command: /pro:bounty.hunter

### Frontmatter
```yaml
---
description: "Ready to hunt? -> Full bounty execution with human checkpoint -> PR submitted"
allowed-tools: ["Bash", "Read", "Write", "Edit", "WebFetch", "Glob", "Grep", "AskUserQuestion"]
---
```

### Pre-flight Checks
1. `gh auth status` - abort if not authenticated
2. Check for existing work in progress (warn if found)

### Flow
1. **Discovery** (same as scout, or use cached results)
2. **Selection** - Pick highest-scoring TAKE bounty
3. **Claim** - Post `/attempt` comment on issue
4. **Setup**:
   - Fork repository via `gh repo fork`
   - Clone fork locally
   - Run baseline compile/tests
   - Create spike branch
5. **Planning**:
   - Generate scope document
   - Identify risks
   - Define implementation order
   - Create cheat sheet if format-driven
6. **Implementation**:
   - Follow maintainer intent verbatim
   - Prefer isolated modules
   - Write acceptance tests
   - Ensure all tests pass
7. **PR Creation**:
   - Push to fork
   - Create PR via `gh pr create`
   - Use maintainer-friendly description
8. **Human Checkpoint**:
   - Display PR URL
   - Show diff summary
   - Present risk assessment
   - Ask: Proceed / Adjust / Abort
9. **Post-PR** (if approved):
   - Record attempt in attempts.json
   - Update backlog item status

### Bail Conditions (Hard Stops)
- Strong PR already merged/approved
- Maintainer actively working on it
- Security/crypto/consensus domains
- Requires invasive core changes

## Scoring Heuristics

### Positive Signals (increase score)
- Higher payout
- Clear maintainer guidance
- Isolated module / optional feature
- Existing PRs incomplete, misaligned, or over-scoped
- Well-defined acceptance criteria
- Good first issue label
- Recent maintainer activity

### Negative Signals (decrease score)
- Strong PR near merge
- Maintainer endorsing another solution
- Core/security/crypto/consensus touches
- High spec ambiguity, no clarification
- Broad refactors required
- Stale issue (no recent activity)
- Many failed attempts

### Decision Threshold
- Net positive signals >= 3: TAKE
- Any hard bail condition: SKIP
- Otherwise: SKIP (conservative)

## Implementation Steps

### Phase 1: Foundation
1. Create `.plan/bounty-hunter/` directory structure
2. Create config.json with defaults
3. Implement Algora.io scraping logic (WebFetch + parsing)

### Phase 2: Scout Command
4. Create `pro/commands/bounty.scout.md`
5. Implement discovery flow
6. Implement triage and scoring
7. Implement output formatting
8. Test with live Algora data

### Phase 3: Hunter Command
9. Create `pro/commands/bounty.hunter.md`
10. Implement pre-flight checks
11. Implement claim flow (/attempt comment)
12. Implement fork/clone/setup
13. Implement planning artifact generation
14. Implement human checkpoint
15. Implement PR creation flow
16. Test full pipeline

### Phase 4: Polish
17. Add error handling and recovery
18. Add progress indicators
19. Document in readme.md
20. Create ADR for architecture decisions

## Design Principles (from spec)

1. Naive beats clever
2. Mergeability beats feature completeness
3. Isolation beats integration
4. Tests beat specs
5. Silence beats over-communication

## Algora.io Structure (Confirmed)

**URL**: https://algora.io/bounties

**Bounty Listing Format**:
- Organization/Owner with logo
- Issue Reference (e.g., "#654")
- Bounty Amount (e.g., "$2,000")
- Title/Description
- Direct GitHub issue URL

**Filtering**: Language-based tabs (Scala, JavaScript, CSS, etc.)

**Note**: Content appears to be dynamically loaded. May need Playwright MCP for reliable extraction.

## Open Questions

1. **Rate limiting**: Should we cache discovery results to avoid hitting Algora repeatedly? (Answer: Yes, use discovered.json cache)
2. **Multi-repo handling**: Where to clone forked repos? (Answer: User's choice, prompt if unclear)

## Success Criteria

- [ ] One mergeable bounty PR produced with minimal human time
- [ ] Clear, defensible TAKE/SKIP decisions
- [ ] Reduced time-to-attempt from hours to minutes
- [ ] Path to repeatable monthly bounty revenue
