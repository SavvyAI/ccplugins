---
description: "Bounty research? -> Discover and evaluate high-ROI bounties -> TAKE/SKIP recommendation with rationale"
allowed-tools: ["Bash", "Read", "Write", "Edit", "WebFetch", "Glob", "Grep"]
---

## Context

Discover and evaluate open-source bounties without taking execution actions.

**Source**: https://algora.io/bounties (hard-coded for v1)

## Your Task

### Phase 1: Pre-flight

1. **Check configuration** - Read `.plan/bounty-hunter/config.json` if it exists:
   ```json
   {
     "floorAmount": 1000,
     "preferredLanguages": [],
     "excludeRepos": []
   }
   ```
   If missing, use defaults: floor = $1000, no language filter, no exclusions.

### Phase 2: Discovery

2. **Fetch bounty listings** - Navigate to https://algora.io/bounties using Playwright MCP (browser automation):
   - Use headless mode to avoid interrupting user workflow
   - Take a snapshot of the bounty listings
   - Extract all visible bounties with: title, amount, organization, issue URL
   - If Playwright is unavailable, try WebFetch as fallback

   **Note**: Playwright MCP runs headlessly by default. If a visible browser appears, check the MCP server configuration.

3. **Parse and filter bounties**:
   - Sort by bounty amount (descending)
   - Filter out bounties below the floor amount
   - Filter by preferred languages if configured
   - Exclude repos in the exclusion list

### Phase 3: Triage (for each bounty, highest first)

4. **For each bounty**, fetch the GitHub issue and analyze:

   a. **Read the issue**:
      - Full description
      - All maintainer comments
      - Labels and milestones

   b. **Check existing PRs**:
      - List all linked PRs
      - For each PR: status, size, last activity, author
      - Identify if any PR is close to merge

   c. **Assess competition**:
      - Count active attempts
      - Check for recent `/attempt` comments
      - Note maintainer responses to attempts

   d. **Detect constraints**:
      - Architectural requirements mentioned
      - Specific technologies required
      - Test coverage expectations
      - Style/formatting requirements

5. **Apply scoring heuristics**:

   **Positive signals** (each adds to score):
   - Higher payout (>$1500 = strong)
   - Clear maintainer guidance in comments
   - Isolated module or optional feature
   - Existing PRs are incomplete, misaligned, or over-scoped
   - Well-defined acceptance criteria
   - "good first issue" or "help wanted" labels
   - Recent maintainer activity (< 7 days)

   **Negative signals** (each reduces score):
   - Strong PR already near merge
   - Maintainer explicitly endorsing another solution
   - Changes touch core, security, crypto, or consensus code
   - High ambiguity with no maintainer clarification
   - Broad refactors or cross-cutting changes required
   - Stale issue (> 30 days no activity)
   - Multiple failed attempts

   **Bail conditions** (automatic SKIP):
   - PR already merged or explicitly approved
   - Maintainer states they are actively working on it
   - Security-sensitive or correctness-critical domain
   - Would require invasive core changes

6. **Generate TAKE/SKIP decision**:
   - Net positive signals >= 3 with no bail conditions: **TAKE**
   - Any bail condition present: **SKIP**
   - Otherwise: **SKIP** (conservative by default)

### Phase 4: Report

7. **Surface the top candidate** with this format:

```markdown
---

## Bounty Scout Report

**Scanned**: X bounties from Algora.io
**Filtered**: Y bounties above $[floor] threshold
**Analyzed**: Z bounties in detail

---

### Top Candidate

| Field | Value |
|-------|-------|
| Title | [Issue title] |
| Amount | $X,XXX |
| Repository | owner/repo |
| Issue | #123 |
| URL | [link] |

**Recommendation**: TAKE / SKIP

**Scoring Breakdown**:
- Positive: [list signals found]
- Negative: [list signals found]
- Net Score: +N / -N

**Rationale**:
[2-3 sentences explaining why this bounty is or isn't worth pursuing]

**Risks**:
- [Risk 1]
- [Risk 2]

**If TAKE - Next Steps**:
Run `/pro:bounty.hunter` to execute on this bounty.

---
```

### Phase 5: Persist Results

8. **Write discovery results** to `.plan/bounty-hunter/discovered.json`:
   ```json
   {
     "fetchedAt": "ISO 8601 timestamp",
     "source": "algora.io",
     "floorApplied": 1000,
     "totalScanned": 10,
     "totalFiltered": 5,
     "topCandidate": {
       "title": "...",
       "amount": 2000,
       "currency": "USD",
       "repoOwner": "org",
       "repoName": "project",
       "issueNumber": 123,
       "issueUrl": "https://github.com/...",
       "recommendation": "TAKE",
       "positiveSignals": ["..."],
       "negativeSignals": ["..."],
       "risks": ["..."]
     },
     "allBounties": [...]
   }
   ```

9. **Create directory if needed**: Ensure `.plan/bounty-hunter/` exists before writing.

## What This Command Does NOT Do

- Post `/attempt` comments
- Fork repositories
- Generate code or create branches
- Create PRs
- Modify any external state (GitHub, Algora)

This command is purely for research and decision-making.

## Error Handling

- If Algora is unreachable: Report error, suggest retry later
- If GitHub rate limited: Report which bounties couldn't be analyzed
- If no bounties found: Report "No bounties found above $X threshold"
- If all bounties are SKIP: Report top 3 with reasons why each was skipped

## Definition of Done

- Bounty listings successfully fetched
- At least one bounty fully analyzed
- TAKE/SKIP recommendation provided with rationale
- Results persisted to discovered.json
