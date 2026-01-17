# Implementation Plan: /author:publish Command

## Summary

Create `/author:publish` command that transforms a book project into a traditional publishing submission pipeline with:
- Agent query letter generation
- Full book proposal
- Curated agent target map
- Submission tracking system
- Advance framing guidance

## Branch

`feat/author-publish-command`

## Related ADRs

- **ADR-028** (Writer Milestone Tracking) - Rejected auto-artifact generation; this command reverses that stance for opt-in use
- **ADR-023** (Writer Plugin Multi-Plugin Architecture) - Plugin structure patterns
- **ADR-029** (Author Plugin Rename) - Current naming convention

## Design Decisions

### 1. ADR Handling

Create **ADR-054** documenting the publish pipeline architecture and explicitly acknowledging the reversal of ADR-028's artifact generation stance.

**Key distinction:** ADR-028 rejected *automated* pitch generation during normal workflow. `/author:publish` is an *intentional, opt-in command* the author runs when ready. Author agency is preserved.

### 2. Pipeline Architecture

**Phased with Checkpoints**

Single command entry point with sequential phases:

```
/author:publish
    │
    ├── [SCAN] (optional) ──→ Go/No-Go recommendation
    │         │
    │         ↓
    ├── [QUERY] ──→ Agent query letter
    │         │
    │         ↓
    ├── [PROPOSAL] ──→ Full book proposal
    │         │
    │         ↓
    ├── [TARGETS] ──→ Agent target map
    │         │
    │         ↓
    └── [LAUNCH] ──→ Submission tracking + Advance framing
```

Each phase:
1. Generates its output
2. Presents for review
3. Allows refinement
4. Asks to proceed or pause

### 3. Storage Location

**`book/publish/`** - alongside other book content

```
book/
├── publish/
│   ├── query.md              # Agent query letter
│   ├── proposal.md           # Full book proposal
│   ├── targets.md            # Agent target map (human-readable)
│   ├── targets.json          # Agent targets (structured)
│   ├── submissions.md        # Submission tracking (human-readable)
│   ├── submissions.json      # Submission state (structured)
│   └── advance-framing.md    # Advance negotiation guidance
├── chapters/
├── front-matter/
└── ...
```

### 4. Submission State Management

Dual storage: JSON for tooling + Markdown for human readability.

**submissions.json schema:**
```json
{
  "submissions": [
    {
      "id": "sub-001",
      "agent": "Agent Name",
      "agency": "Agency Name",
      "status": "submitted|requested-full|rejected|offer|withdrawn",
      "submittedAt": "ISO 8601",
      "lastContactAt": "ISO 8601",
      "followUpDate": "ISO 8601",
      "notes": "...",
      "queryVersion": "query-v1.md",
      "proposalRequested": false
    }
  ],
  "pipeline": {
    "submitted": 3,
    "requestedFull": 1,
    "rejected": 2,
    "pending": 0,
    "offers": 0
  }
}
```

## Implementation Steps

### Step 1: Create ADR-054

File: `doc/decisions/054-author-publish-pipeline-architecture.md`

Contents:
- Context: ADR-028 rejected auto-generation; this is different
- Decision: Phased pipeline with checkpoints
- Storage in `book/publish/`
- Dual JSON+Markdown state management
- Consequences

### Step 2: Create publish.md Command

File: `author/commands/publish.md`

**Command Structure:**

```yaml
---
description: "Ready to pitch? → Generates query, proposal, targets → Submission pipeline"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
  - WebFetch
  - AskUserQuestion
---
```

**Phase Implementations:**

#### SCAN Phase (Optional)
- Analyze book content for readiness
- Check milestones (leverage `/author:status` logic)
- Research market timing
- Output: GO / CAUTION / NO-GO recommendation

#### QUERY Phase
- Read thesis, sample chapters, author bio
- Generate single-page narrative
- Structure: Hook → Thesis → Market → Why This Author Now
- Tuned for agent psychology
- Output: `book/publish/query.md`

#### PROPOSAL Phase
- Market framing section
- Reader promise
- Competitive landscape analysis (WebSearch)
- Structural outline from book.json
- Proof of authority
- Distribution and demand logic
- Output: `book/publish/proposal.md`

#### TARGETS Phase
- Research agents who represent similar books (WebSearch)
- Analyze recent deals in category
- Identify personalization signals
- Create submission sequencing strategy
- Output: `book/publish/targets.md` + `targets.json`

#### LAUNCH Phase
- Initialize submission tracking
- Create advance framing guidance
- Output: `book/publish/submissions.md` + `submissions.json` + `advance-framing.md`

### Step 3: Add Optional Sub-Commands

Consider adding for iterative refinement:
- `/author:publish.scan` - Run concept scan only
- `/author:publish.harden` - Pitch hardening (simulated objections)

### Step 4: Update CLAUDE.md

Add command to the Author plugin instructions table.

### Step 5: Update book.json Schema

Add optional `publish` section for tracking state:
```json
{
  "publish": {
    "lastRun": "ISO 8601",
    "phase": "query|proposal|targets|launch|complete",
    "queryVersion": 1,
    "proposalVersion": 1
  }
}
```

## Phase Details

### SCAN Phase - Concept Validation

**Inputs:**
- Book thesis/premise from `book.json` or front-matter
- Sample chapters
- Author platform information (if available)

**Analysis Dimensions:**
1. **Demand Clarity** - Is there a clear market need?
2. **Timing Risk** - Is this the right moment?
3. **Differentiation** - What makes this book unique?
4. **Platform Sufficiency** - Does author have reach?

**Output Format:**
```
╔══════════════════════════════════════════════════════════════╗
║  CONCEPT SCAN                                                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Recommendation: [GO | CAUTION | NO-GO]                       ║
║                                                               ║
║  Demand Clarity:     [Assessment]                             ║
║  Timing:             [Assessment]                             ║
║  Differentiation:    [Assessment]                             ║
║  Platform:           [Assessment]                             ║
║                                                               ║
║  Summary: [Blunt assessment]                                  ║
║                                                               ║
║  If CAUTION/NO-GO:                                            ║
║  → [Recommendation: pursue traditionally | build leverage     ║
║     first | ship independently]                               ║
║                                                               ║
╚══════════════════════════════════════════════════════════════╝
```

### QUERY Phase - Agent Query Letter

**Structure (single page narrative):**
1. **Hook** (1-2 sentences) - Grabs attention
2. **Book Summary** (1 paragraph) - What the book is
3. **Market Positioning** (1 paragraph) - Who reads this, comp titles
4. **Author Bio** (1 paragraph) - Why this author now
5. **Logistics** (1 line) - Word count, completion status

**Voice:**
- Confident, not desperate
- Specific, not vague
- Market-aware, not literary-pretentious
- Tuned for agent psychology

### PROPOSAL Phase - Full Book Proposal

**Sections:**
1. **Overview** - Expanded hook and premise
2. **Market Analysis** - Target readers, size, trends
3. **Competitive Analysis** - Comp titles with positioning
4. **Author Platform** - Reach, credentials, distribution assets
5. **Chapter Outline** - Section summaries with word counts
6. **Sample Chapter** - Reference to existing chapter(s)
7. **Timeline** - Completion schedule if not done
8. **Marketing & Promotion** - What author brings to launch

### TARGETS Phase - Agent Target Map

**Research Approach:**
1. Search for agents who represent comp titles
2. Look at recent deal announcements in category
3. Check agency websites for submission preferences
4. Identify personalization hooks (tweets, interviews, MSWL)

**Output Structure:**
- Tier 1: Dream agents (high fit, selective)
- Tier 2: Strong matches (good fit, accepting)
- Tier 3: Solid options (decent fit, accessible)

**Per-Agent Entry:**
```
### [Agent Name] - [Agency]
- Represents: [Notable comp titles]
- Looking for: [Current interests]
- Personalization: [Connection point]
- Submission: [Exclusive/simultaneous policy]
- Query method: [Email/QueryManager/etc]
```

### LAUNCH Phase - Submission Pipeline

**submissions.md Format:**
```markdown
# Submission Tracker

Last updated: [date]

## Pipeline Summary
- Submitted: N
- Requested Full: N
- Rejected: N
- Pending: N
- Offers: N

## Active Submissions

| Agent | Agency | Status | Submitted | Follow-up | Notes |
|-------|--------|--------|-----------|-----------|-------|
| ... | ... | ... | ... | ... | ... |

## Completed

| Agent | Agency | Outcome | Notes |
|-------|--------|---------|-------|
| ... | ... | ... | ... |
```

**advance-framing.md Contents:**
- Realistic advance bands for this category
- What justifies each tier (platform, track record, timing)
- What weakens leverage (debut author, small platform, crowded market)
- When to push vs accept
- Red flags in deals

## Testing Strategy

1. Create test book project with sample content
2. Run through each phase
3. Verify outputs are created in correct locations
4. Verify state tracking works

## Known Limitations (v1)

1. No automated agent database - relies on WebSearch
2. No CRM integration - manual tracking only
3. No email sending - outputs are for copy/paste
4. No deal tracking beyond offer status

## Future Enhancements (post-v1)

1. Integration with QueryManager
2. Automated follow-up reminders
3. Template library for different query approaches
4. Tracking historical submission data across books

## Definition of Done

- [ ] ADR-054 created
- [ ] publish.md command implemented
- [ ] All phases generate correct outputs
- [ ] CLAUDE.md updated with command
- [ ] Test run on sample book project
- [ ] No errors or warnings
