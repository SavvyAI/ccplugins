---
description: "Competition check? -> Analyze competing PRs for active bounty -> CLEAR/CAUTION/ABORT recommendation"
allowed-tools: ["Bash", "Read", "Write", "WebFetch", "Glob", "Grep"]
---

## Context

Reconnaissance command for bounty competitive intelligence. Analyzes competing PRs to determine if you should proceed, pivot, or abort.

**When to use**:
- Before claiming a bounty (after scout, before hunter)
- During implementation (periodic sanity check)
- Before submitting your PR (final verification)

## Your Task

### Phase 1: Target Identification

1. **Determine the target bounty**:

   a. If argument provided (issue URL or `owner/repo#123`):
      - Use that as the target

   b. If no argument, check for in-progress work:
      - Read `.plan/bounty-hunter/attempts.json`
      - If active attempt exists, use that bounty
      - If no active attempt, check `.plan/bounty-hunter/discovered.json` for top candidate

   c. If still no target:
      - Report: "No target bounty specified. Run /pro:bounty.scout first or provide an issue URL."
      - Exit

2. **Extract bounty details**:
   ```bash
   gh issue view [issue-number] --repo [owner/repo] --json title,body,labels,comments,state
   ```

### Phase 2: Competitor Discovery (Algora Bot Comment)

3. **Find the Algora bot comment** (PRIMARY INTELLIGENCE SOURCE):

   The Algora bot posts a structured comment on bounty issues with:
   - Bounty amount and guidelines
   - **Attempts table** with all competitors

   ```bash
   gh api repos/[owner]/[repo]/issues/[number]/comments \
     --jq '.[] | select(.user.login == "algora-pbc") | .body'
   ```

   **Parse the attempts table** from the bot comment:
   ```
   | Attempt | Started (UTC) | Solution | Actions |
   |---------|---------------|----------|---------|
   | @user1  | Jan 10, 09:08 | WIP      |         |
   | @user2  | Jan 11, 01:01 | #661     | Reward  |
   ```

   Extract for each row:
   - **Attempt**: Competitor username
   - **Started (UTC)**: When they claimed (time advantage)
   - **Solution**: `WIP` = no PR yet, `#NNN` = linked PR number
   - **Actions**: `Reward` = maintainer is actively considering this PR (CRITICAL SIGNAL)

4. **Calculate competition metrics** from the table:
   - **Total attempts**: Row count
   - **Active competitors**: Rows with Solution = `WIP` (still racing)
   - **Submitted PRs**: Rows with Solution = `#NNN`
   - **Reward candidates**: Rows with `Reward` in Actions (HIGH THREAT)

   **CRITICAL**: If ANY row has `Reward` in Actions column:
   - That PR is being actively considered for payout
   - This is equivalent to "bounty claim" status
   - Should trigger CAUTION or ABORT recommendation

5. **Find all linked PRs** for deeper analysis:
   ```bash
   gh pr list --repo [owner/repo] --search "linked:issue:[issue-number]" --json number,author,state,labels,createdAt,updatedAt,additions,deletions,changedFiles
   ```

   Also search for PRs mentioning the issue:
   ```bash
   gh pr list --repo [owner/repo] --search "[issue-number] in:body" --state all --json number,author,state,labels,createdAt,updatedAt,additions,deletions,changedFiles
   ```

### Phase 3: PR Deep Analysis

6. **For each competing PR**, gather metrics:

   a. **Basic metrics** (from list query):
      - Files changed
      - Additions / deletions
      - Created date
      - Last update date
      - Current state (open/closed/merged)

   b. **Labels check** (CRITICAL):
      ```bash
      gh pr view [pr-number] --repo [owner/repo] --json labels --jq '.labels[].name'
      ```

      **CRITICAL SIGNALS** (any of these = immediate threat):
      - `bounty claim`
      - `bounty-claim`
      - `algora-claim`
      - Any label containing "claim" + "bounty"

   c. **Review status**:
      ```bash
      gh pr view [pr-number] --repo [owner/repo] --json reviews,reviewRequests
      ```

      Check for:
      - Maintainer approvals
      - Requested changes (and if addressed)
      - Review requests pending

   d. **CI status**:
      ```bash
      gh pr view [pr-number] --repo [owner/repo] --json statusCheckRollup
      ```

   e. **Maintainer engagement** (check comments):
      ```bash
      gh api repos/[owner]/[repo]/pulls/[pr-number]/comments
      gh api repos/[owner]/[repo]/issues/[pr-number]/comments
      ```

      Look for maintainer comments indicating:
      - "Close to winning"
      - "Almost there"
      - "Just need X"
      - Explicit approval language

### Phase 4: Threat Assessment

7. **Calculate threat level** using state model:

   | State | Meaning | Action |
   |-------|---------|--------|
   | 🟢 **CLEAR** | No serious competition | Proceed normally |
   | 🟡 **RACING** | Competitors exist, no Reward yet | Switch to aggressive mode |
   | 🟠 **LEAPFROG** | 1 Reward PR exists, window still open | Leapfrog hard or abort |
   | 🔴 **ABORT** | 2+ Reward PRs or window closed | Disengage immediately |

   **🔴 ABORT** (Disengage immediately):
   - **2+ PRs have "Reward" status** (selection phase, too late)
   - PR has `bounty claim` label
   - Maintainer explicitly approved another PR
   - Another PR is merged
   - Maintainer comment contains "close to winning", "almost ready to merge"
   - Competitor scope 5x+ ahead AND maintainer actively engaged

   **🟠 LEAPFROG** (Go aggressive NOW or abort):
   Only if ALL conditions are true:
   - Exactly **1** PR has "Reward" status
   - That PR is **<48 hours old**
   - Scope gap is **clearly identifiable** (not 10x, more like 2-3x)
   - Maintainer has **NOT** commented "close to winning"
   - You can realistically exceed their scope within 24-48h

   If ANY condition fails: Downgrade to **ABORT**

   **🟡 RACING** (Aggressive mode):
   - Multiple competitors exist (WIP or submitted)
   - No "Reward" status on any PR yet
   - Maintainer engaged but not committed
   - You have time to ship before selection phase

   **🟢 CLEAR** (Proceed normally):
   - No competing PRs with submitted solutions
   - All competing PRs closed/rejected
   - Only WIP attempts, no one has shipped yet
   - You have first-mover advantage

8. **Calculate overall recommendation**:
   - If 2+ Reward PRs: **ABORT**
   - If 1 Reward PR + leapfrog conditions met: **LEAPFROG**
   - If 1 Reward PR + leapfrog conditions NOT met: **ABORT**
   - If competitors exist but no Reward: **RACING**
   - If no serious competition: **CLEAR**

### Phase 5: Report

9. **Generate recon report**:

```markdown
---

## Bounty Recon Report

**Target**: [owner/repo#issue] - [title]
**Bounty**: $X,XXX
**Generated**: [timestamp]

---

### Competition Overview (from Algora Bot)

| Metric | Value |
|--------|-------|
| Total attempts | X |
| Active (WIP) | Y still racing |
| Submitted PRs | Z linked solutions |
| **Reward candidates** | N PRs (CRITICAL if > 0) |
| Bounty claim holder | PR #NNN / None |

---

### Attempts Table (from Algora Bot)

| Attempt | Started | Solution | Actions | Threat |
|---------|---------|----------|---------|--------|
| @user1 | Jan 10 | WIP | | 🟡 Racing |
| @user2 | Jan 11 | #661 | Reward | 🔴 CRITICAL |
| @you | Jan 11 | WIP | | — |

---

### PR Analysis

| PR | Author | State | Scope | Last Activity | CI | Threat |
|----|--------|-------|-------|---------------|-----|--------|
| #NNN | @user | open | +X,XXX | Xd ago | ✅/❌ | 🔴/🟠/🟡/🟢 |

---

### Threat Analysis

#### PR #NNN (THREAT LEVEL)

**Why this threat level**:
- [Reason 1]
- [Reason 2]

**Maintainer signals**:
- [Quote or observation]

**Scope comparison** (if you have active work):
- Competitor: +X,XXX lines, Y files, Z tests
- You: +A,BBB lines, B files, C tests
- Delta: Competitor is Nx ahead

---

### Recommendation

[🔴 ABORT / 🟠 LEAPFROG / 🟡 RACING / 🟢 CLEAR]

---

### Why This Recommendation

**If 🔴 ABORT:**
```
Why aborting:
• [X] PRs already marked "Reward" (selection phase active)
• Maintainer actively evaluating: #661, #657, #663
• Your attempt status: WIP (no submitted PR)
• Time since first Reward PR: [N] days
• Probability of success: <5%

This is not a failure of your work.
The race entered selection phase before you shipped.
```

**If 🟠 LEAPFROG:**
```
Leapfrog window detected:
• 1 PR has "Reward" status: #663
• PR age: [N] hours (<48h threshold)
• Estimated scope gap: ~3x (fillable)
• No "close to winning" comment yet

You have 24-48 hours to exceed their scope.
If you cannot commit to aggressive shipping, ABORT instead.
```

**If 🟡 RACING:**
```
Competition active but no winner yet:
• [N] attempts registered
• [M] PRs submitted (none with Reward)
• Maintainer reviewing but not committed

Switch to aggressive mode:
• Go wide, not minimal
• Ship breadth before depth
• Check recon again before PR submission
```

**If 🟢 CLEAR:**
```
No serious competition detected:
• [N] WIP attempts (no one has shipped)
• Clear path to first submission

Proceed, but remember:
• Someone could ship any moment
• Go wide from the start
• Don't optimize for elegance
```

---

### Next Actions

**🔴 ABORT**:
1. Disengage now (recommended)
2. Run `/pro:bounty.scout` for next opportunity
3. Optionally: Review winning PR to learn their approach

**🟠 LEAPFROG**:
1. Commit to 24-48h aggressive sprint
2. Identify exact gaps to fill (list them now)
3. Ship breadth, not polish
4. If you can't commit: Choose ABORT instead

**🟡 RACING**:
1. Continue with aggressive mode
2. Re-run recon before PR submission
3. Watch for first "Reward" tag (race changes)

**🟢 CLEAR**:
1. Proceed with implementation
2. Ship fast, go wide
3. Claim early with `/attempt`

---
```

### Phase 6: Persist Results

10. **Write recon results** to `.plan/bounty-hunter/recon/[issue-number].json`:

```json
{
  "target": {
    "owner": "org",
    "repo": "project",
    "issueNumber": 123,
    "title": "...",
    "bountyAmount": 2000
  },
  "reconAt": "ISO 8601 timestamp",
  "algoraBot": {
    "totalAttempts": 9,
    "activeWIP": 5,
    "submittedPRs": 4,
    "rewardCandidates": 3,
    "attempts": [
      {
        "username": "user1",
        "startedAt": "Jan 10, 2026, 09:08:36 PM",
        "solution": "WIP",
        "hasReward": false
      },
      {
        "username": "user2",
        "startedAt": "Jan 11, 2026, 01:01:22 AM",
        "solution": "#661",
        "hasReward": true
      }
    ]
  },
  "competition": {
    "totalPRs": 3,
    "openPRs": 2,
    "bountyClaimHolder": 663,
    "rewardPRs": [661, 657, 663]
  },
  "competingPRs": [
    {
      "number": 663,
      "author": "competitor",
      "state": "open",
      "createdAt": "...",
      "updatedAt": "...",
      "metrics": {
        "filesChanged": 27,
        "additions": 9932,
        "deletions": 0
      },
      "labels": ["bounty claim"],
      "hasBountyClaimLabel": true,
      "ciStatus": "passing",
      "maintainerEngaged": true,
      "maintainerApproved": false,
      "threatLevel": "critical",
      "threatReasons": [
        "Has bounty claim label",
        "10x scope advantage",
        "Maintainer said 'close to winning'"
      ]
    }
  ],
  "state": "ABORT",
  "stateReason": {
    "rewardPRCount": 3,
    "rewardPRs": [661, 657, 663],
    "yourStatus": "WIP",
    "daysSinceFirstReward": 2,
    "leapfrogPossible": false,
    "leapfrogBlockers": [
      "Multiple Reward PRs (selection phase)",
      "Scope gap too large (10x)",
      "Maintainer commented 'close to winning'"
    ],
    "probabilityOfSuccess": "<5%"
  },
  "explanation": "The race entered selection phase before you shipped. 3 PRs already marked Reward. This is not a failure of your work."
}
```

11. **Update discovered.json** if this bounty is the current top candidate:
    - Add `lastReconAt` timestamp
    - Add `competitiveStatus` field
    - Downgrade recommendation if threat is CRITICAL

## Integration Points

### With bounty.scout

When scout runs Phase 3 (Triage), it should:
1. Run lightweight recon (just PR list + bounty claim check)
2. If `bounty claim` label found on any PR: Auto-SKIP with reason
3. Add competition summary to discovered.json

### With bounty.hunter

Hunter should check recon at these points:

1. **Before claiming** (after Phase 1 selection):
   - Run full recon
   - If CRITICAL: Present abort option prominently
   - If CAUTION: Warn but allow proceed

2. **Before PR submission** (Phase 6):
   - Run recon refresh
   - If competitor merged while you worked: STOP, report, don't submit
   - If competitor got bounty claim: Warn, ask if proceed

## What This Command Does NOT Do

- Post comments on GitHub
- Create or modify PRs
- Fork repositories
- Make any external changes

This command is purely for intelligence gathering.

## Error Handling

- **Rate limited**: Report which data couldn't be fetched, use cached if available
- **PR not found**: Report and continue with available data
- **No competing PRs**: Report as CLEAR, but remind to go wide not minimal

## Definition of Done

- [ ] Target bounty identified
- [ ] All linked/related PRs discovered
- [ ] Each PR analyzed for threat signals
- [ ] Bounty claim label specifically checked
- [ ] Overall recommendation generated
- [ ] Results persisted to recon JSON
- [ ] Report displayed to user
