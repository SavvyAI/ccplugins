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

## Phase 2: Claim

### 6. Confirm before claiming

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

### 7. Post /attempt comment

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

## Phase 3: Setup

### 8. Fork the repository

```bash
gh repo fork [owner/repo] --clone=false
```

### 9. Clone the fork

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

### 10. Establish baseline

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

### 11. Create spike branch

```bash
git checkout -b bounty/[issue-number]-[short-slug]
```

## Phase 4: Planning

### 12. Generate planning artifacts

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

### 13. Review plan with user

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

## Phase 5: Implementation

### 14. Implement the solution

Follow these principles:
- **Follow maintainer intent verbatim** - Don't improve beyond scope
- **Prefer isolated modules** - Minimize core changes
- **Optimize for correctness** - Not completeness
- **Write tests first** - Then implementation
- **Keep commits atomic** - One logical change per commit

### 15. Write acceptance tests

- Round-trip tests for data transformations
- Integration tests for new features
- Edge case coverage

### 16. Ensure all tests pass

```bash
# Run full test suite
# Ensure no regressions
# Fix any failures before proceeding
```

### 17. Commit changes

Use conventional commits:
```
feat(module): brief description of change

- Detail 1
- Detail 2

Fixes owner/repo#123
```

## Phase 6: PR Creation

### 18. Push to fork

```bash
git push -u origin bounty/[issue-number]-[short-slug]
```

### 19. Create PR

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

## Phase 7: Human Checkpoint (CRITICAL)

### 20. Present for review

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

### 21. Handle user decision

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

### 22. Update backlog (if in ccplugins repo)

If working within ccplugins and bounty work started here:
- Create backlog item for the bounty work
- Set status to match PR status

### 23. Cleanup

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
- Maintainer explicitly approves another PR during our work
- Issue is closed as "won't fix" or "duplicate"
- Security advisory is published for the target code
- Maintainer requests we stop

## Definition of Done

- [ ] Bounty claimed with /attempt comment
- [ ] Repository forked and cloned
- [ ] Implementation complete per scope
- [ ] All tests passing
- [ ] PR created and submitted
- [ ] Human checkpoint completed
- [ ] Attempt recorded in attempts.json
