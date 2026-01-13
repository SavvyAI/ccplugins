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

   b. **Parse Algora bot comment** (PRIMARY INTELLIGENCE SOURCE):
      ```bash
      gh api repos/[owner]/[repo]/issues/[number]/comments \
        --jq '.[] | select(.user.login == "algora-pbc") | .body'
      ```

      Extract from the attempts table:
      - **Total attempts**: Number of `/attempt` claims
      - **Active (WIP)**: Competitors still working (no PR linked)
      - **Submitted PRs**: PRs linked in Solution column
      - **Reward candidates**: PRs with "Reward" in Actions column (CRITICAL)

      **CRITICAL**: If ANY row has "Reward" in Actions:
      - Maintainer is actively considering that PR for payout
      - This is a strong negative signal
      - Should heavily weight toward SKIP

   c. **Check existing PRs** (for scope analysis):
      - List all linked PRs via `gh pr list --repo [owner/repo] --search "linked:issue:[issue-number]"`
      - For each PR, gather:
        - Status (open/closed/merged)
        - Size (additions/deletions/files changed)
        - Last activity date
        - Author
        - **Labels** (especially `bounty claim`, `bounty-claim`, or any "claim" variant)
      - Identify if any PR is close to merge

   d. **Check for bounty claim label** (CRITICAL SIGNAL):
      ```bash
      gh pr view [pr-number] --repo [owner/repo] --json labels --jq '.labels[].name'
      ```
      If ANY competing PR has a label containing "bounty" AND "claim":
      - This is a **CRITICAL negative signal**
      - Likely indicates maintainer has chosen a winner trajectory
      - Should trigger automatic SKIP unless scope is clearly incomplete

   e. **Assess competition level**:
      - **HIGH**: 3+ PRs with "Reward" status, or any PR 5x+ scope ahead
      - **MEDIUM**: 2+ submitted PRs, active maintainer engagement
      - **LOW**: No submitted PRs, only WIP attempts
      - **Quantify scope delta**: If competitor has 3x+ your estimated effort, flag as HIGH risk

   f. **Detect constraints**:
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
   - **Competing PR has `bounty claim` label** (CRITICAL - almost always SKIP)
   - **Competing PR has "Reward" in Algora bot Actions** (maintainer considering for payout)
   - **Competing PR is 3x+ scope ahead with active maintainer engagement**
   - **3+ competitors with submitted PRs** (crowded field)
   - Changes touch core, security, crypto, or consensus code
   - High ambiguity with no maintainer clarification
   - Broad refactors or cross-cutting changes required
   - Stale issue (> 30 days no activity)
   - Multiple failed attempts

   **Bail conditions** (automatic SKIP):
   - PR already merged or explicitly approved
   - **Another PR has `bounty claim` label** (maintainer chose winner trajectory)
   - **Multiple PRs have "Reward" status** (maintainer actively evaluating others)
   - **Maintainer comment says "close to winning" or "almost ready to merge" on another PR**
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

---

### Competitive Intelligence

| Metric | Value |
|--------|-------|
| Competing PRs | X open, Y closed |
| `/attempt` claims | Z authors |
| Bounty claim holder | PR #NNN / None |
| Competition level | 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low |

**Scope Leader** (if any):
- PR #NNN by @author: +X,XXX lines, Y files

**Key Threats**:
- [Threat 1 - e.g., "PR #663 has bounty claim label"]
- [Threat 2 - e.g., "Maintainer actively reviewing #663"]

---

### Scoring Breakdown

- Positive: [list signals found]
- Negative: [list signals found]
- Net Score: +N / -N

**Rationale**:
[2-3 sentences explaining why this bounty is or isn't worth pursuing]

**Risks**:
- [Risk 1]
- [Risk 2]

---

### Next Steps

**If TAKE**:
1. Run `/pro:bounty.recon [issue-url]` for detailed competitive analysis
2. Run `/pro:bounty.hunter` to execute

**If SKIP due to competition**:
- Consider next candidate from `allBounties` list
- Or wait for competition to resolve (PR merged/rejected)

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
       "risks": ["..."],
       "competitiveIntelligence": {
         "algoraBot": {
           "totalAttempts": 9,
           "activeWIP": 5,
           "submittedPRs": 4,
           "rewardCandidates": 3,
           "rewardPRs": [661, 657, 663]
         },
         "competingPRs": [
           {
             "number": 456,
             "author": "competitor",
             "state": "open",
             "additions": 5000,
             "deletions": 100,
             "filesChanged": 15,
             "hasBountyClaimLabel": false,
             "hasRewardStatus": true,
             "lastActivityDays": 3,
             "maintainerEngaged": true
           }
         ],
         "bountyClaimHolder": null,
         "competitionLevel": "high",
         "scopeLeader": {
           "prNumber": 456,
           "additions": 5000
         }
       }
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
