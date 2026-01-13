---
description: "Ready to hunt? -> Full bounty execution pipeline -> Fork, implement, PR with human checkpoint"
allowed-tools: ["Bash", "Read", "Write", "Edit", "WebFetch", "Glob", "Grep", "AskUserQuestion", "Task"]
---

## Context

Execute a full bounty hunting pipeline: discover, select, claim, implement, and submit PR.

**Source**: https://algora.io/bounties (hard-coded for v1)

## Pre-flight Checks

### 1. GitHub Authentication (REQUIRED)

```bash
gh auth status
```

**If not authenticated**: STOP immediately and instruct:
```
GitHub CLI authentication is required for bounty hunting.

Run: gh auth login

Then retry /pro:bounty.hunter
```

### 2. Check for work in progress

Read `.plan/bounty-hunter/attempts.json` and warn if there's an in-progress attempt:
```
Warning: You have an in-progress bounty attempt:
- [Title] in owner/repo
- Started: [date]

Options:
1. Continue with that bounty
2. Abandon and start fresh
3. Cancel
```

## Phase 1: Discovery & Selection

### 3. Check for cached discovery

If `.plan/bounty-hunter/discovered.json` exists and is < 1 hour old:
- Ask user: "Recent scout results found. Use cached results or re-scan?"
- If use cached: Skip to selection
- If re-scan: Run discovery

### 4. Run discovery (if needed)

Same as `/pro:bounty.scout` Phase 2-3:
- Fetch bounties from Algora via Playwright MCP
- Filter by floor amount
- Triage and score each bounty

### 5. Select target bounty

Pick the highest-scoring bounty with TAKE recommendation.

If no TAKE bounties found:
```
No viable bounties found.

Top 3 candidates were all SKIP:
1. [Title] - $X,XXX - Reason: [...]
2. [Title] - $X,XXX - Reason: [...]
3. [Title] - $X,XXX - Reason: [...]

Run /pro:bounty.scout for detailed analysis.
```

## Phase 2: Competitive Recon (CRITICAL)

### 6. Run competitive intelligence check

Before claiming, run recon to assess competition:

```bash
# Check for bounty claim label on any competing PR
gh pr list --repo [owner/repo] --search "linked:issue:[issue-number]" --json number,labels,additions,deletions,author,state,updatedAt
```

**For each open PR**, check:
- Labels (look for `bounty claim`, `bounty-claim`, or similar)
- Scope (additions/deletions)
- Last activity

**Calculate state** using the 4-state model:

| State | Meaning | Action |
|-------|---------|--------|
| 🟢 **CLEAR** | No serious competition | Proceed normally |
| 🟡 **RACING** | Competitors exist, no Reward yet | Switch to aggressive mode |
| 🟠 **LEAPFROG** | 1 Reward PR, window still open | Leapfrog hard or abort |
| 🔴 **ABORT** | 2+ Reward PRs or window closed | Disengage immediately |

**🔴 ABORT** triggers:
- 2+ PRs have "Reward" in Algora bot Actions
- Any PR has `bounty claim` label
- Maintainer comment contains "close to winning"
- Competitor scope 5x+ ahead AND maintainer engaged

**🟠 LEAPFROG** (only if ALL true):
- Exactly 1 PR has "Reward" status
- That PR is <48 hours old
- Scope gap is ~2-3x (not 10x)
- No "close to winning" comment
- You can realistically exceed in 24-48h

Present recon findings:

```markdown
## Competitive Recon

### Algora Bot Status
| Attempts | WIP | Submitted | Reward |
|----------|-----|-----------|--------|
| 9 | 5 | 4 | 3 |

### State: [🔴 ABORT / 🟠 LEAPFROG / 🟡 RACING / 🟢 CLEAR]

**Why:**
• [Reason 1]
• [Reason 2]
• [Reason 3]

**If ABORT:** The race entered selection phase. Proceeding has <5% success probability.
**If LEAPFROG:** You have 24-48h to exceed competitor scope. Commit or abort.
**If RACING:** Switch to aggressive mode. Ship breadth, not elegance.

Continue? [Y/N/Abort]
```

### Hard Gates (Enforced)

**🔴 ABORT = BLOCKED**

If Recon returns ABORT, Hunter **cannot proceed** without explicit override:

```markdown
## Recon Gate: BLOCKED

Status: 🔴 ABORT
Reason: 3 PRs have "Reward" status. Selection phase active.

Proceeding is blocked. To override, you must:
1. Acknowledge <5% success probability
2. Provide justification

Override? [Provide reason / Abort]
```

If user provides override reason:
- Log to `.plan/bounty-hunter/overrides.json`:
  ```json
  {
    "timestamp": "ISO 8601",
    "bounty": "owner/repo#123",
    "reconState": "ABORT",
    "overrideReason": "User's justification",
    "outcome": "pending"
  }
  ```
- Proceed with explicit warning: "Override logged. Aggressive Mode forced."

If user chooses "Abort": Exit gracefully, run `/pro:bounty.scout` for next opportunity.

**🟡 RACING or 🟠 LEAPFROG = AGGRESSIVE MODE**

If Recon returns RACING or LEAPFROG, Hunter **automatically switches** to Aggressive Mode:

```markdown
## Mode: AGGRESSIVE (Auto-Enabled)

Recon detected active competition. Defaults changed:

✓ Breadth over polish
✓ All variants in issue are MANDATORY
✓ Tests prove coverage, not minimal correctness
✓ Defer refactors, never features
✓ This PR must close the issue permanently

Proceeding in Aggressive Mode. Continue? [Y/N]
```

## Phase 3: Claim

### 7. Confirm before claiming

Present the selected bounty and ask for confirmation:

```markdown
## Selected Bounty

| Field | Value |
|-------|-------|
| Title | [Issue title] |
| Amount | $X,XXX |
| Repository | owner/repo |
| Issue | #123 |
| URL | [link] |

**Recommendation**: TAKE
**Rationale**: [brief explanation]

Proceeding will:
1. Post an /attempt comment on the issue
2. Fork the repository
3. Begin implementation work

Continue? [Y/N]
```

### 8. Post /attempt comment

```bash
gh issue comment [issue-number] --repo [owner/repo] --body "/attempt"
```

Record the claim:
```json
// .plan/bounty-hunter/attempts.json
{
  "attempts": [{
    "bountyId": "...",
    "attemptedAt": "ISO 8601",
    "issueUrl": "...",
    "status": "claimed"
  }]
}
```

## Phase 4: Setup

### 9. Fork the repository

```bash
gh repo fork [owner/repo] --clone=false
```

### 10. Clone the fork

Ask user where to clone:
```
Where should I clone the forked repository?

1. Current directory (./[repo-name])
2. Parent directory (../[repo-name])
3. Custom path: [input]
```

```bash
gh repo clone [your-username/repo] [chosen-path]
cd [chosen-path]
```

### 11. Establish baseline

Run compile and tests to understand current state:

```bash
# Detect build system and run appropriate commands
# Look for: package.json, Cargo.toml, go.mod, pom.xml, Makefile, etc.
```

Document baseline in planning notes:
- Build system detected
- Test command used
- Current test status (passing/failing)
- Any existing issues

### 12. Create spike branch

```bash
git checkout -b bounty/[issue-number]-[short-slug]
```

## Phase 5: Planning

### 13. Generate planning artifacts

Create `.plan/bounty-[issue-number]/` with:

**scope.md**:
- What the bounty requires
- Acceptance criteria extracted from issue
- Maintainer preferences noted

**risks.md**:
- Technical risks
- Integration risks
- Timeline risks

**implementation-order.md**:
- Ordered list of changes to make
- Dependencies between changes
- Test strategy

**cheat-sheet.md** (if format/spec-driven):
- Format specifications
- API contracts
- Required patterns

### 14. Review plan with user

Present the implementation plan and ask for approval:
```
## Implementation Plan

**Scope**: [summary]

**Steps**:
1. [Step 1]
2. [Step 2]
...

**Estimated changes**:
- Files to modify: X
- New files: Y
- Tests to add: Z

**Risks**:
- [Risk 1]
- [Risk 2]

Proceed with implementation? [Y/N]
```

## Phase 6: Implementation

### 15. Implement the solution

**Standard Mode** (Recon = 🟢 CLEAR):
- Follow maintainer intent verbatim
- Prefer isolated modules
- Optimize for correctness over completeness
- Write tests first, then implementation
- Keep commits atomic

**Aggressive Mode** (Recon = 🟡 RACING, 🟠 LEAPFROG, or override):

| Standard | Aggressive |
|----------|------------|
| MVP scope | **All variants** mentioned in issue |
| Minimal tests | **Coverage tests** proving completeness |
| Correctness first | **Breadth first**, polish later |
| Single platform | **All platforms** if mentioned (JVM, JS, Native) |
| Defer config | **Config surface matters** - add it now |
| Clean commits | **Ship fast**, squash later if needed |

**Aggressive Mode Checklist** (must all be true before PR):
- [ ] Every format/variant in issue is implemented
- [ ] Cross-platform if mentioned in scope
- [ ] Test count comparable to or exceeding competitors
- [ ] Config options for all mentioned use cases
- [ ] No "TODO" or "future work" comments
- [ ] PR description says "closes" not "addresses"

### 16. Write acceptance tests

- Round-trip tests for data transformations
- Integration tests for new features
- Edge case coverage

### 17. Ensure all tests pass

```bash
# Run full test suite
# Ensure no regressions
# Fix any failures before proceeding
```

### 18. Commit changes

Use conventional commits:
```
feat(module): brief description of change

- Detail 1
- Detail 2

Fixes owner/repo#123
```

## Phase 7: Pre-Submission Recon (CRITICAL)

### 19. Final competitive check before PR

Before creating your PR, run a final recon to catch any changes since you started:

```bash
gh pr list --repo [owner/repo] --search "linked:issue:[issue-number]" --json number,labels,state,mergedAt
```

**STOP CONDITIONS** (do NOT submit if):
- A competing PR was **merged** while you were working
- A competing PR received the `bounty claim` label while you were working
- Maintainer commented "closing in favor of #NNN" on the issue

If any STOP condition is met:
```markdown
## Recon Alert: Bounty Status Changed

⚠️ **Competition status changed during your implementation**

| Event | Details |
|-------|---------|
| [What happened] | [PR #NNN merged / got bounty claim label / etc.] |

**Recommendation**: ABORT submission

Your work is not lost. Options:
1. **Abandon** - Move to next bounty
2. **Contribute** - Offer improvements to winning PR (no bounty)
3. **Review winning PR** - Learn from their approach

Continue with PR anyway? [Y/N/Abort]
```

## Phase 8: PR Creation

### 20. Push to fork

```bash
git push -u origin bounty/[issue-number]-[short-slug]
```

### 21. Create PR

```bash
gh pr create --repo [original-owner/repo] \
  --title "[Brief descriptive title]" \
  --body "$(cat <<'EOF'
## Summary

[1-2 sentence summary of the change]

## Changes

- [Change 1]
- [Change 2]
- [Change 3]

## Testing

- [How it was tested]
- [Test coverage added]

## Related

Fixes #[issue-number]

---

*Submitted via [Algora bounty](https://algora.io/bounties)*
EOF
)"
```

## Phase 9: Human Checkpoint (CRITICAL)

### 22. Present for review

```markdown
---

## Bounty Hunt Complete - Human Review Required

**PR Created**: [PR URL]

### Diff Summary
- Files changed: X
- Additions: +Y
- Deletions: -Z

### Key Changes
1. [Change 1]
2. [Change 2]
3. [Change 3]

### Risk Assessment
| Risk | Level | Mitigation |
|------|-------|------------|
| [Risk 1] | Low/Med/High | [How mitigated] |

### Mergeability Rationale
[Why this PR should be merged - maintainer perspective]

### Test Results
- All tests passing: Yes/No
- New tests added: X
- Coverage: [if available]

---

**Options**:
- **approve** - Mark as submitted, monitor for review
- **adjust** - Make changes before finalizing
- **abort** - Close PR and abandon attempt

---
```

### 23. Handle user decision

**If approve**:
- Update attempts.json with `status: "submitted"`
- Add PR URL to record
- Output: "Bounty submitted! Monitor [PR URL] for maintainer feedback."

**If adjust**:
- Ask what needs changing
- Make changes
- Push update
- Return to checkpoint

**If abort**:
- Close PR via `gh pr close`
- Update attempts.json with `status: "abandoned"`
- Output: "Bounty attempt abandoned."

## Post-Execution

### 24. Update backlog (if in ccplugins repo)

If working within ccplugins and bounty work started here:
- Create backlog item for the bounty work
- Set status to match PR status

### 25. Cleanup

Offer to clean up local clone:
```
Bounty work complete. Clean up local clone?
- Keep for future work on this bounty
- Remove clone (can re-clone if needed)
```

## Error Handling

- **Fork fails**: Check if fork already exists, offer to use existing
- **Clone fails**: Check disk space, permissions
- **Tests fail at baseline**: Document and ask if user wants to proceed
- **PR creation fails**: Check for required fields, branch protection
- **Rate limited**: Wait and retry with backoff

## Bail Conditions (Hard Stops)

At any point, STOP if:
- **Another PR receives `bounty claim` label** (maintainer chose winner)
- Maintainer explicitly approves another PR during our work
- **Maintainer comments "close to winning" on another PR**
- **Competing PR is merged** while you're working
- Issue is closed as "won't fix" or "duplicate"
- Security advisory is published for the target code
- Maintainer requests we stop

## Definition of Done

- [ ] Pre-claim recon completed (Phase 2)
- [ ] Recon gate passed (CLEAR/RACING/LEAPFROG or override logged)
- [ ] Mode set: Standard or Aggressive
- [ ] Bounty claimed with /attempt comment
- [ ] Repository forked and cloned
- [ ] Implementation complete per scope (+ Aggressive checklist if applicable)
- [ ] All tests passing
- [ ] Pre-submission recon completed (Phase 7)
- [ ] PR created and submitted
- [ ] Human checkpoint completed
- [ ] Attempt recorded in attempts.json
- [ ] If override was used: Update outcome in overrides.json after resolution

## Post-Mortem (After Resolution)

When a bounty resolves (win, loss, or abandoned), record the outcome:

**Update** `.plan/bounty-hunter/attempts.json`:
```json
{
  "attempts": [{
    "bountyId": "owner/repo#123",
    "attemptedAt": "ISO 8601",
    "reconState": "RACING",
    "modeUsed": "aggressive",
    "overrideUsed": false,
    "status": "submitted",
    "outcome": "loss",
    "outcomeReason": "scope_gap",
    "winningPR": 663,
    "winnerScope": 9932,
    "ourScope": 1628,
    "lessonsLearned": "Competitor shipped 10x scope in same timeframe"
  }]
}
```

**Outcome reasons** (standardized):
- `scope_gap` - Winner had more comprehensive implementation
- `timing` - Winner shipped first
- `maintainer_preference` - Maintainer chose different approach
- `abandoned` - We chose to abort
- `merged` - We won

**Over time, this answers:**
- How often does LEAPFROG succeed?
- Are overrides ever worth it?
- What's the typical scope gap when we lose?
- Which repos/maintainers favor breadth vs elegance?

This turns guardrails into a **learning engine**.
