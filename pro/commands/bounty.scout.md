---
description: "Bounty research? -> Discover and evaluate high-ROI bounties -> TAKE/SKIP recommendation with rationale"
allowed-tools: ["Bash", "Read", "Write", "Edit", "WebFetch", "Glob", "Grep"]
---

## Context

Discover and evaluate open-source bounties without taking execution actions.

**Sources**:
- Algora.io (explicit bounties)
- GitHub-native (paid issue signals, sponsors-enabled repos, urgency signals)

**Decision Model**: ROI-based evaluation. Dollar amount is metadata; ROI score is the primary decision variable.

## Canonical Rules

> Below $100: ignore.
> At or above $100: do the math.

These rules are enforced by the system, not left to human judgment.

## Your Task

### Phase 1: Pre-flight

1. **Check configuration** - Read `.plan/bounty-hunter/config.json` if it exists:
   ```json
   {
     "floorAmount": 100,
     "softFloorAmount": 1000,
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

   **Floor semantics**:
   - `floorAmount` ($100) = HARD MINIMUM. System-enforced. Cannot be lowered. No analysis below this.
   - `softFloorAmount` ($1000) = User's preferred minimum for prioritization. Bounties $100-$999 analyzed but ranked lower unless ROI signals are strong.

   If config missing, use defaults: hard floor = $100, soft floor = $1000, all sources enabled.

### Phase 2a: Algora Discovery

2. **Fetch Algora bounty listings** - Navigate to https://algora.io/bounties using Playwright MCP (browser automation):
   - Use headless mode to avoid interrupting user workflow
   - Take a snapshot of the bounty listings
   - Extract all visible bounties with: title, amount, organization, issue URL
   - If Playwright is unavailable, try WebFetch as fallback

   **Note**: Playwright MCP runs headlessly by default. If a visible browser appears, check the MCP server configuration.

3. **Apply hard floor filter**:
   - **DISCARD immediately** any bounty with amount < $100
   - Tag discarded bounties as `valueTier: "discarded_below_floor"`, `discardReason: "below_floor"`
   - **NO further analysis** on discarded bounties
   - Continue with bounties >= $100

4. **Parse remaining bounties**:
   - Filter by preferred languages if configured
   - Exclude repos in the exclusion list
   - Tag as `source: "algora"`, `valueTier: "explicit_bounty"`

### Phase 2b: GitHub-Native Discovery

5. **Paid Issue Signals** (if `sources.githubNative.paidIssueSignals` enabled):
   ```bash
   gh search issues "bounty OR paid OR \"would pay\" OR \"happy to pay\" OR sponsor" \
     --label="help wanted,good first issue" \
     --state=open \
     --limit=50 \
     --json repository,title,number,url,labels,createdAt,updatedAt
   ```
   - Tag matching issues as `source: "github-native"`, `valueTier: "high_likelihood_paid"`
   - Extract explicit amounts if mentioned in title/body (e.g., "$500 bounty")
   - If no explicit amount, set `amount: null`

6. **Sponsors-Enabled Repositories** (if `sources.githubNative.sponsorsEnabled` enabled):
   - For repos discovered via paid issue signals, check:
     ```bash
     gh api repos/{owner}/{repo} --jq '.has_sponsor_listing // false'
     ```
   - Within sponsor-enabled repos, search for monetizable issues:
     ```bash
     gh search issues "migrate OR migration OR upgrade OR v2 OR v3" \
       --repo={owner}/{repo} \
       --state=open \
       --json title,number,url,labels,createdAt
     ```
   - Also flag issues > 90 days old with `help-wanted` or `blocked` labels
   - Tag as `source: "github-native"`, `valueTier: "monetizable_candidate"`

7. **Urgency Signals** (if `sources.githubNative.urgencySignals` enabled):
   ```bash
   gh search issues "regression OR \"release blocker\" OR urgent OR production OR blocking" \
     --state=open \
     --limit=50 \
     --json repository,title,number,url,labels,createdAt,updatedAt
   ```
   - Tag matching issues as `source: "github-native"`, `valueTier: "high_likelihood_paid"`

8. **Deduplicate** - Merge GitHub-native results, removing duplicates by issue URL.

### Phase 3: Triage (for each opportunity >= $100)

9. **For each opportunity**, fetch the GitHub issue and analyze:

   a. **Read the issue**:
      - Full description
      - All maintainer comments
      - Labels and milestones

   b. **Parse Algora bot comment** (for Algora-sourced bounties):
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

   c. **Check existing PRs** (for scope and competition analysis):
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
      - **CRITICAL**: 3+ PRs with "Reward" status, or any PR with `bounty claim` label
      - **HIGH**: 2+ submitted PRs with maintainer engagement, or 5x+ scope gap
      - **MEDIUM**: 2+ submitted PRs, some maintainer engagement
      - **LOW**: 1 submitted PR or only WIP attempts
      - **NONE**: No existing PRs, no `/attempt` claims

   f. **Estimate time to complete**:
      - Analyze issue scope (LOC estimate, test requirements, review cycles)
      - Factor in setup/teardown overhead
      - Account for review latency based on repo activity

   g. **Detect constraints**:
      - Architectural requirements mentioned
      - Specific technologies required
      - Test coverage expectations
      - Style/formatting requirements

### Phase 4: ROI Calculation

10. **Calculate ROI factors** for each opportunity:

    | Factor | How Estimated |
    |--------|---------------|
    | `timeEstimateHours` | Scope analysis: LOC estimate, test requirements, review cycles |
    | `competitionLevel` | Algora bot attempts + PR count + maintainer engagement |
    | `winProbability` | Based on competition: none=0.9, low=0.7, medium=0.4, high=0.2, critical=0.05 |
    | `scopeClarity` | Acceptance criteria presence, maintainer guidance, issue specificity |
    | `resolutionSpeed` | Maintainer responsiveness, repo activity, payout history |

11. **Calculate ROI Score** (0-100 scale):

    ```
    For explicit bounties (amount known):
      rawROI = (amount × winProbability) / timeEstimateHours

    For non-priced opportunities:
      rawROI = (estimatedValue × winProbability) / timeEstimateHours
      where estimatedValue = signal_score × 100 (range $100-$1000 based on signals)

    Apply modifiers:
      - scopeClarity: clear=1.0, moderate=0.8, ambiguous=0.5
      - resolutionSpeed: fast=1.2, moderate=1.0, slow=0.7
      - sourceBonus: github-native=1.1, algora=1.0

    ROI Score = normalize(rawROI × modifiers) to 0-100 scale
    ```

12. **Apply decision thresholds**:

    | ROI Score | Recommendation |
    |-----------|----------------|
    | 70-100 | Strong TAKE candidate |
    | 50-69 | Conditional TAKE (verify with Recon) |
    | 30-49 | Weak - likely SKIP unless strategic |
    | 0-29 | SKIP |

    **Bail conditions** (automatic SKIP regardless of ROI):
    - PR already merged or explicitly approved
    - **Another PR has `bounty claim` label** (maintainer chose winner trajectory)
    - **Multiple PRs have "Reward" status** (maintainer actively evaluating others)
    - **Maintainer comment says "close to winning" or "almost ready to merge" on another PR**
    - Maintainer states they are actively working on it
    - Security-sensitive or correctness-critical domain
    - Would require invasive core changes

13. **Generate TAKE/SKIP decision**:
    - ROI Score >= 70 with no bail conditions: **TAKE**
    - ROI Score 50-69 with no bail conditions: **CONDITIONAL TAKE** (recommend Recon first)
    - Any bail condition present: **SKIP**
    - ROI Score < 50: **SKIP**

### Phase 5: Report

14. **Surface opportunities sorted by ROI Score** with this format:

```markdown
---

## Bounty Scout Report

**Sources**: Algora.io, GitHub-native
**Scanned**: X total opportunities
**Discarded**: Y below $100 floor (no analysis)
**Analyzed**: Z opportunities in detail

---

### Top Candidate

| Field | Value |
|-------|-------|
| Title | [Issue title] |
| Source | algora / github-native |
| Value Tier | explicit_bounty / high_likelihood_paid / monetizable_candidate |
| Amount | $X,XXX (or "Non-priced") |
| Repository | owner/repo |
| Issue | #123 |
| URL | [link] |

**ROI Score**: XX/100

| ROI Factor | Value |
|------------|-------|
| Time Estimate | X hours |
| Win Probability | X% |
| Competition Level | none / low / medium / high / critical |
| Scope Clarity | clear / moderate / ambiguous |
| Resolution Speed | fast / moderate / slow |

**Recommendation**: TAKE / CONDITIONAL TAKE / SKIP

---

### Competitive Intelligence

| Metric | Value |
|--------|-------|
| Competing PRs | X open, Y closed |
| `/attempt` claims | Z authors |
| Bounty claim holder | PR #NNN / None |
| Competition level | 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low / ⚪ None |

**Scope Leader** (if any):
- PR #NNN by @author: +X,XXX lines, Y files

**Key Threats**:
- [Threat 1 - e.g., "PR #663 has bounty claim label"]
- [Threat 2 - e.g., "Maintainer actively reviewing #663"]

---

### ROI Rationale

[2-3 sentences explaining why this opportunity scores high/low on ROI. Focus on probability-weighted return, not headline dollar amount.]

**Risks**:
- [Risk 1]
- [Risk 2]

---

### Other Candidates (by ROI Score)

| Rank | Title | Source | Amount | ROI Score | Recommendation |
|------|-------|--------|--------|-----------|----------------|
| 2 | ... | algora | $1,500 | 65 | CONDITIONAL TAKE |
| 3 | ... | github-native | Non-priced | 58 | CONDITIONAL TAKE |
| 4 | ... | algora | $4,000 | 25 | SKIP (high competition) |

---

### Next Steps

**If TAKE**:
1. Run `/pro:bounty.recon [issue-url]` for detailed competitive analysis
2. Run `/pro:bounty.hunter` to execute

**If CONDITIONAL TAKE**:
1. Run `/pro:bounty.recon [issue-url]` to verify competition state
2. Proceed to Hunter only if Recon returns CLEAR or RACING

**If SKIP**:
- Consider next candidate from list
- Or wait for competition to resolve

---
```

### Phase 6: Persist Results

15. **Write discovery results** to `.plan/bounty-hunter/discovered.json`:
    ```json
    {
      "fetchedAt": "ISO 8601 timestamp",
      "sources": ["algora", "github-native"],
      "hardFloorApplied": 100,
      "softFloorApplied": 1000,
      "totalScanned": 50,
      "totalDiscarded": 10,
      "discardedBounties": [
        {
          "title": "...",
          "amount": 50,
          "valueTier": "discarded_below_floor",
          "discardReason": "below_floor"
        }
      ],
      "totalAnalyzed": 40,
      "topCandidate": {
        "title": "...",
        "source": "algora",
        "valueTier": "explicit_bounty",
        "amount": 2000,
        "currency": "USD",
        "repoOwner": "org",
        "repoName": "project",
        "issueNumber": 123,
        "issueUrl": "https://github.com/...",
        "roiScore": 78,
        "roiFactors": {
          "timeEstimateHours": 8,
          "competitionLevel": "low",
          "winProbability": 0.7,
          "scopeClarity": "clear",
          "resolutionSpeed": "fast"
        },
        "recommendation": "TAKE",
        "positiveSignals": ["..."],
        "negativeSignals": ["..."],
        "risks": ["..."],
        "competitiveIntelligence": {
          "algoraBot": {
            "totalAttempts": 2,
            "activeWIP": 1,
            "submittedPRs": 1,
            "rewardCandidates": 0,
            "rewardPRs": []
          },
          "competingPRs": [
            {
              "number": 456,
              "author": "competitor",
              "state": "open",
              "additions": 500,
              "deletions": 50,
              "filesChanged": 5,
              "hasBountyClaimLabel": false,
              "hasRewardStatus": false,
              "lastActivityDays": 3,
              "maintainerEngaged": false
            }
          ],
          "bountyClaimHolder": null,
          "competitionLevel": "low",
          "scopeLeader": null
        }
      },
      "allBounties": [
        {
          "title": "...",
          "source": "algora | github-native",
          "valueTier": "explicit_bounty | high_likelihood_paid | monetizable_candidate",
          "amount": 2000,
          "roiScore": 78,
          "recommendation": "TAKE | CONDITIONAL_TAKE | SKIP"
        }
      ]
    }
    ```

16. **Create directory if needed**: Ensure `.plan/bounty-hunter/` exists before writing.

## What This Command Does NOT Do

- Post `/attempt` comments
- Fork repositories
- Generate code or create branches
- Create PRs
- Modify any external state (GitHub, Algora)

This command is purely for research and decision-making.

## Error Handling

- If Algora is unreachable: Report error, continue with GitHub-native sources
- If GitHub rate limited: Report which opportunities couldn't be analyzed
- If no opportunities found >= $100: Report "No opportunities found above $100 floor"
- If all opportunities are SKIP: Report top 3 with ROI scores and reasons why each was skipped

## Definition of Done

- All enabled sources successfully queried
- Hard floor ($100) enforced - zero analysis on sub-$100 bounties
- At least one opportunity fully analyzed with ROI score
- TAKE/SKIP recommendation provided with ROI rationale
- Results persisted to discovered.json
