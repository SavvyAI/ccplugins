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

## Context

Traditional publishing pipeline: $ARGUMENTS

## Purpose

Transform a book project into a publisher-ready submission system. This command runs a phased pipeline:

1. **SCAN** (optional) - Concept validation with go/no-go recommendation
2. **QUERY** - Agent query letter generation
3. **PROPOSAL** - Full book proposal
4. **TARGETS** - Curated agent target map
5. **LAUNCH** - Submission tracking and advance framing

Each phase generates artifacts, presents them for review, and allows refinement before proceeding.

**Given** a book project at or near pitch-ready state
**When** `/author:publish` is invoked
**Then** publishing artifacts are generated in `book/publish/`

## Arguments

- `scan` - Run concept scan only (go/no-go validation)
- `resume` - Resume from last completed phase
- (no argument) - Run full pipeline from beginning

## Examples

```
/author:publish              # Full pipeline
/author:publish scan         # Concept validation only
/author:publish resume       # Continue from last phase
```

## Your Task

### Step 0: Verify Book Project Exists

```bash
test -f book/book.json && echo "exists" || echo "missing"
```

If `book.json` is missing:
```
No book project found. Use `/author:init` to create one first.
```
Exit.

### Step 1: Load Book Context

Read essential book data:
```bash
cat book/book.json
```

Extract:
- `title`
- `author`
- `bookType`
- `thesis` (if present)
- Chapter count and word counts
- Any existing `publish` state

Read thesis content if exists:
```bash
cat book/front-matter/thesis.md 2>/dev/null || echo "no thesis file"
```

Read sample chapters (first 2-3 chapters):
```bash
head -100 book/chapters/*.md 2>/dev/null
```

### Step 2: Check Existing Publish State

```bash
ls book/publish/ 2>/dev/null
```

If `book/publish/` exists with content:

Use `AskUserQuestion`:
```
question: "Publishing artifacts already exist. What would you like to do?"
header: "Existing"
options:
  - "Continue from where I left off" (Resume the pipeline)
  - "Start fresh" (Regenerate all artifacts)
  - "Review what I have" (Show current state without changes)
```

### Step 3: Display Pipeline Header

```
╔══════════════════════════════════════════════════════════════╗
║  AUTHOR:PUBLISH                                               ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Book: "<title>"                                              ║
║  Author: <author>                                             ║
║  Type: <bookType>                                             ║
║                                                               ║
║  Pipeline phases:                                             ║
║  ○ SCAN     - Concept validation (optional)                   ║
║  ○ QUERY    - Agent query letter                              ║
║  ○ PROPOSAL - Full book proposal                              ║
║  ○ TARGETS  - Agent target map                                ║
║  ○ LAUNCH   - Submission tracking                             ║
║                                                               ║
╚══════════════════════════════════════════════════════════════╝
```

### Step 4: Offer SCAN Phase

Use `AskUserQuestion`:
```
question: "Would you like to run a concept scan first?"
header: "Scan"
options:
  - "Yes, validate concept (Recommended)" (Check if book is ready for traditional publishing)
  - "Skip to query" (I'm confident in my concept)
```

---

## PHASE: SCAN (Concept Validation)

### Scan Step 1: Gather Context

Analyze:
1. **Thesis clarity** - Is there a clear, compelling argument?
2. **Sample chapters** - Do they deliver on the thesis?
3. **Author platform** - What reach does the author have?
4. **Market timing** - Is this the right moment?

Use `WebSearch` to research:
- Recent books in the same category
- Market trends for the topic
- Author's existing platform (if name provided)

### Scan Step 2: Assess Each Dimension

**Demand Clarity** (Is there a clear market need?)
- Strong: Addresses identified pain point, growing interest
- Moderate: Niche interest, steady demand
- Weak: Unclear audience, declining interest

**Timing Risk** (Is this the right moment?)
- Low: Topic trending, no recent saturation
- Moderate: Steady interest, some competition
- High: Oversaturated, trend declining

**Differentiation** (What makes this unique?)
- Strong: Clear angle not covered by competitors
- Moderate: Fresh perspective on known topic
- Weak: Similar to existing books without distinction

**Platform Sufficiency** (Does author have reach?)
- Strong: Established audience, proven distribution
- Moderate: Growing platform, some reach
- Weak: No existing audience

### Scan Step 3: Generate Recommendation

Based on assessment, determine:
- **GO** - All dimensions are moderate or better, at least one strong
- **CAUTION** - Mixed signals, some dimensions weak
- **NO-GO** - Multiple weak dimensions or critical gaps

### Scan Step 4: Display Results

```
╔══════════════════════════════════════════════════════════════╗
║  CONCEPT SCAN                                                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Recommendation: [GO | CAUTION | NO-GO]                       ║
║                                                               ║
║  Demand Clarity     [Strong|Moderate|Weak]                    ║
║  [Assessment details]                                         ║
║                                                               ║
║  Timing             [Low|Moderate|High] risk                  ║
║  [Assessment details]                                         ║
║                                                               ║
║  Differentiation    [Strong|Moderate|Weak]                    ║
║  [Assessment details]                                         ║
║                                                               ║
║  Platform           [Strong|Moderate|Weak]                    ║
║  [Assessment details]                                         ║
║                                                               ║
║  Summary:                                                     ║
║  [Blunt, honest assessment paragraph]                         ║
║                                                               ║
╚══════════════════════════════════════════════════════════════╝
```

If CAUTION or NO-GO, add:
```
║  Recommendation:                                              ║
║  → [pursue traditionally | build leverage first |             ║
║     ship independently]                                       ║
║                                                               ║
║  [Specific guidance on what to do next]                       ║
```

### Scan Step 5: Confirm Proceed

Use `AskUserQuestion`:
```
question: "Would you like to proceed with query generation?"
header: "Next"
options:
  - "Proceed to QUERY" (Continue with publishing pipeline)
  - "Stop here" (I'll address the concerns first)
```

If "Stop here", exit with encouragement to return when ready.

---

## PHASE: QUERY (Agent Query Letter)

### Query Step 1: Analyze Book for Query Content

Extract from book project:
- **Hook material** - Most compelling aspect of the thesis
- **Book summary** - Core argument and structure
- **Market positioning** - Who reads this, why now
- **Author credentials** - Platform, expertise, unique angle
- **Logistics** - Word count, completion status

### Query Step 2: Research Comp Titles

Use `WebSearch` to find:
- 2-3 successful books in the same space
- Their positioning and reception
- What gap this book fills

### Query Step 3: Draft Query Letter

Generate a single-page query letter with this structure:

1. **Hook** (1-2 sentences)
   - Grabs attention immediately
   - States the core promise or insight
   - Creates urgency or curiosity

2. **Book Summary** (1 paragraph)
   - What the book argues or reveals
   - Key themes or frameworks
   - Why it matters

3. **Market Positioning** (1 paragraph)
   - Target reader profile
   - Comparable titles with positioning
   - Market size or trend signals

4. **Author Bio** (1 paragraph)
   - Why this author
   - Relevant credentials
   - Platform or distribution assets
   - Previous publications if any

5. **Logistics** (1-2 lines)
   - Word count (or estimated)
   - Completion status
   - Exclusive vs simultaneous submission note

**Voice guidance:**
- Confident, not desperate
- Specific, not vague
- Market-aware, not literary-pretentious
- Agent psychology: they're looking for books they can sell

### Query Step 4: Present Draft

```
╔══════════════════════════════════════════════════════════════╗
║  QUERY LETTER DRAFT                                           ║
╠══════════════════════════════════════════════════════════════╣

[Full query letter text]

╚══════════════════════════════════════════════════════════════╝
```

### Query Step 5: Refinement Loop

Use `AskUserQuestion`:
```
question: "How does this query letter look?"
header: "Review"
options:
  - "Approve" (Save and proceed to PROPOSAL)
  - "Adjust hook" (The opening needs work)
  - "Adjust positioning" (The market angle needs refinement)
  - "Adjust bio" (My credentials need different emphasis)
  - "Rewrite completely" (Start over with different approach)
```

If adjustment requested, ask what specifically to change, revise, and re-present.

Repeat until approved.

### Query Step 6: Save Query

Create `book/publish/` if needed:
```bash
mkdir -p book/publish
```

Write query letter:
```markdown
# Query Letter

*Generated: [date]*
*Book: [title]*

---

[Query letter content]

---

## Notes

- Version: 1
- Target: General (customize per agent)
- Last updated: [date]
```

Save to `book/publish/query.md`.

---

## PHASE: PROPOSAL (Book Proposal)

### Proposal Step 1: Gather All Materials

Read:
- Query letter (just created)
- Full book.json manifest
- All front matter
- Chapter summaries (first ~50 lines each)
- Any back matter

### Proposal Step 2: Research Market Context

Use `WebSearch` for:
- Competitive titles and their reception
- Market size for category
- Recent publishing trends
- Author's online presence

### Proposal Step 3: Generate Proposal Sections

**1. Overview** (1-2 pages)
- Expanded hook and premise
- The core argument or insight
- Why this book, why now
- The reader transformation

**2. Market Analysis** (1 page)
- Target reader profile with specifics
- Market size and growth
- Buying behavior and channels
- Trends supporting the book

**3. Competitive Analysis** (1-2 pages)
- 5-7 comparable titles
- For each: title, author, publisher, year, positioning
- How this book differs
- Market gap being filled

**4. Author Platform** (1 page)
- Professional credentials
- Speaking/teaching experience
- Media presence
- Newsletter/social following
- Previous publications
- Distribution assets (corporate training, course sales, etc.)

**5. Chapter Outline** (2-4 pages)
- For each chapter:
  - Title
  - Summary (2-3 sentences)
  - Key takeaways or frameworks
  - Estimated word count

**6. Sample Chapter Reference**
- Point to 2-3 strongest chapters
- Brief note on why these were selected

**7. Marketing & Promotion** (1 page)
- Author's promotional capabilities
- Speaking opportunities
- Corporate/bulk sales potential
- Pre-launch and launch strategy
- Ongoing promotion plan

**8. Timeline**
- If manuscript incomplete: completion schedule
- If complete: readiness for editing

### Proposal Step 4: Present Draft

```
╔══════════════════════════════════════════════════════════════╗
║  BOOK PROPOSAL DRAFT                                          ║
╠══════════════════════════════════════════════════════════════╣

[Full proposal content, section by section]

╚══════════════════════════════════════════════════════════════╝
```

### Proposal Step 5: Section-by-Section Review

For each major section, use `AskUserQuestion`:
```
question: "How does the [Section Name] look?"
header: "[Section]"
options:
  - "Approve" (Move to next section)
  - "Needs adjustment" (I'll provide feedback)
```

Iterate until all sections approved.

### Proposal Step 6: Save Proposal

Write to `book/publish/proposal.md`:
```markdown
# Book Proposal

*Generated: [date]*
*Book: [title] by [author]*

---

## Overview

[Content]

## Market Analysis

[Content]

## Competitive Analysis

[Content]

## Author Platform

[Content]

## Chapter Outline

[Content]

## Sample Chapter Reference

[Content]

## Marketing & Promotion

[Content]

## Timeline

[Content]

---

## Proposal Metadata

- Version: 1
- Last updated: [date]
```

---

## PHASE: TARGETS (Agent Target Map)

### Targets Step 1: Research Agents

Use `WebSearch` for:
- "literary agents [category] books"
- "agents who represent [comp title author]"
- "[genre] agent wishlist MSWL"
- "recent [category] book deals Publishers Marketplace"

For each promising agent, gather:
- Name and agency
- Recent sales in category
- Submission preferences
- Personalization hooks (tweets, interviews, stated interests)

### Targets Step 2: Tier Agents

Organize into three tiers:

**Tier 1: Dream Agents** (3-5 agents)
- Perfect fit for this book
- Highly selective, strong track record
- Worth the exclusive/first look

**Tier 2: Strong Matches** (5-8 agents)
- Good fit, actively building list
- Solid sales history
- Accepts simultaneous submissions

**Tier 3: Solid Options** (5-10 agents)
- Decent fit, accessible
- Growing agency or newer agent
- Good fallback options

### Targets Step 3: Build Target Map

For each agent:
```markdown
### [Agent Name] - [Agency]

**Represents:** [Notable titles in category]
**Looking for:** [Current interests, MSWL themes]
**Recent sales:** [If known]

**Personalization hook:**
[Specific connection point - tweet they made, interview quote, book they represented that connects]

**Submission details:**
- Method: [QueryManager / Email / Agency form]
- Exclusive: [Yes/No/Preferred]
- Response time: [X weeks stated]
- Query only / Query + pages

**Notes:**
[Any additional relevant context]
```

### Targets Step 4: Create Submission Strategy

Recommend sequencing:
1. Start with 1-2 Tier 1 agents (if they accept exclusive)
2. Simultaneous batch to Tier 2 (5-6 at once)
3. Tier 3 as follow-up or if rejections accumulate

### Targets Step 5: Present Target Map

```
╔══════════════════════════════════════════════════════════════╗
║  AGENT TARGET MAP                                             ║
╠══════════════════════════════════════════════════════════════╣

[Summary: X agents across 3 tiers]

## Submission Strategy

[Sequencing recommendation]

## Tier 1: Dream Agents

[Agent entries]

## Tier 2: Strong Matches

[Agent entries]

## Tier 3: Solid Options

[Agent entries]

╚══════════════════════════════════════════════════════════════╝
```

### Targets Step 6: Review and Save

Use `AskUserQuestion`:
```
question: "How does the target map look?"
header: "Agents"
options:
  - "Approve" (Save and proceed to LAUNCH)
  - "Add more agents" (I know some agents to include)
  - "Remove some agents" (Some don't fit)
  - "Adjust strategy" (Change the submission sequencing)
```

Save to `book/publish/targets.md`.

Also save structured data to `book/publish/targets.json`:
```json
{
  "generated": "[ISO date]",
  "book": "[title]",
  "tiers": {
    "tier1": [
      {
        "name": "Agent Name",
        "agency": "Agency Name",
        "represents": ["Title 1", "Title 2"],
        "submissionMethod": "QueryManager",
        "exclusive": false,
        "personalization": "Connection hook"
      }
    ],
    "tier2": [...],
    "tier3": [...]
  },
  "strategy": {
    "sequence": "Tier 1 exclusive first, then Tier 2 batch",
    "batchSize": 5
  }
}
```

---

## PHASE: LAUNCH (Submission Tracking + Advance Framing)

### Launch Step 1: Initialize Submission Tracker

Create `book/publish/submissions.md`:
```markdown
# Submission Tracker

*Book: [title]*
*Last updated: [date]*

## Pipeline Summary

| Status | Count |
|--------|-------|
| Submitted | 0 |
| Requested Full | 0 |
| Rejected | 0 |
| Pending Response | 0 |
| Offers | 0 |

## Active Submissions

| Agent | Agency | Submitted | Status | Follow-up | Notes |
|-------|--------|-----------|--------|-----------|-------|
| — | — | — | — | — | — |

## Completed

| Agent | Agency | Submitted | Outcome | Notes |
|-------|--------|-----------|---------|-------|
| — | — | — | — | — |

---

## Usage

Update this tracker as you submit and receive responses:
- When you submit: Add row to Active Submissions
- When agent responds: Update status or move to Completed
- Set follow-up dates based on stated response times

Typical status progression:
`submitted` → `no response` → `nudged` → `rejected` OR `requested-full` → `offer`
```

Create `book/publish/submissions.json`:
```json
{
  "book": "[title]",
  "created": "[ISO date]",
  "lastUpdated": "[ISO date]",
  "submissions": [],
  "pipeline": {
    "submitted": 0,
    "requestedFull": 0,
    "rejected": 0,
    "pendingResponse": 0,
    "offers": 0
  }
}
```

### Launch Step 2: Generate Advance Framing

Research typical advances for this category:
- Use `WebSearch` for "[category] book advance typical"
- Look for Publishers Marketplace deal announcements

Create `book/publish/advance-framing.md`:
```markdown
# Advance Framing

*Book: [title]*
*Category: [bookType]*

## Realistic Advance Bands

| Tier | Range | What It Means |
|------|-------|---------------|
| Modest | $5K - $25K | Debut author, limited platform, single book deal |
| Mid-list | $25K - $75K | Some platform, proven topic, multi-book potential |
| Strong | $75K - $150K | Significant platform, high-demand topic |
| Major | $150K+ | Celebrity author, massive platform, auction situation |

## What Justifies Higher Advances

- **Platform size**: Large newsletter, social following, speaking circuit
- **Corporate/bulk potential**: Training companies, universities as buyers
- **Pre-existing audience**: Proven ability to sell to readers
- **Timeliness**: Hot topic with narrow window
- **Competitive interest**: Multiple publishers bidding

## What Weakens Leverage

- **Debut status**: First-time author with no track record
- **Small platform**: Limited distribution reach
- **Narrow topic**: Small potential readership
- **Crowded market**: Many recent books on same topic
- **Simultaneous projects**: Author spreading thin

## Negotiation Guidance

### When to Push
- Multiple offers (auction leverage)
- Publisher initiated contact
- Significant platform growth during negotiation
- Time-sensitive topic they need to move on

### When to Accept
- Good terms beyond advance (marketing commitment, format, timing)
- Strong editor relationship
- Strategic publisher fit
- First book establishing track record

### Red Flags
- Publisher wants rights you don't want to give
- Unrealistic timeline expectations
- Low marketing commitment signals
- Vague on subsidiary rights splits
- Push for options on future unrelated work

## Decision Framework

The advance is not the whole deal. Consider:
1. **Earn-out reality**: Will royalties exceed advance?
2. **Career arc**: Is this book a stepping stone?
3. **Control**: What creative/marketing control do you retain?
4. **Speed**: How fast can they publish?
5. **Fit**: Is this the right home for this book?
```

### Launch Step 3: Display Launch Summary

```
╔══════════════════════════════════════════════════════════════╗
║  PUBLISH PIPELINE COMPLETE                                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ✓ QUERY      book/publish/query.md                           ║
║  ✓ PROPOSAL   book/publish/proposal.md                        ║
║  ✓ TARGETS    book/publish/targets.md                         ║
║  ✓ TRACKER    book/publish/submissions.md                     ║
║  ✓ FRAMING    book/publish/advance-framing.md                 ║
║                                                               ║
║  Next steps:                                                  ║
║  1. Customize query letter for each agent's interests         ║
║  2. Start with Tier 1 agents per strategy                     ║
║  3. Track submissions in submissions.md                       ║
║  4. Set calendar reminders for follow-ups                     ║
║  5. Prepare for full manuscript requests                      ║
║                                                               ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Update Book Manifest

After any phase completes, update `book/book.json`:

```json
{
  "publish": {
    "lastRun": "[ISO date]",
    "phase": "[current phase]",
    "queryVersion": 1,
    "proposalVersion": 1,
    "targetsVersion": 1
  }
}
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No thesis defined | Ask for thesis input before SCAN |
| Very early stage book | SCAN will likely return CAUTION/NO-GO; guide accordingly |
| No sample chapters | Cannot proceed past SCAN; minimum 2 chapters needed |
| Author declines SCAN | Proceed directly to QUERY |
| Pipeline already complete | Offer to regenerate or add more agents |
| Partial pipeline (resumed) | Start from next incomplete phase |
| Category hard to research | Ask author for comp titles and agent names |
| No platform | Be honest in SCAN; suggest building before submitting |
| International author | Note potential complications in proposal |

## Relationship to Other Commands

- `/author:status` - Check if `pitch-ready` milestone reached before running
- `/author:compile` - Ensure sample chapters are polished before publishing pipeline
- `/author:weave` - Can be used to incorporate research into proposal

## Output Summary

| File | Purpose |
|------|---------|
| `book/publish/query.md` | Agent query letter |
| `book/publish/proposal.md` | Full book proposal |
| `book/publish/targets.md` | Agent target map (human-readable) |
| `book/publish/targets.json` | Agent targets (structured) |
| `book/publish/submissions.md` | Submission tracking (human-readable) |
| `book/publish/submissions.json` | Submission state (structured) |
| `book/publish/advance-framing.md` | Advance negotiation guidance |
