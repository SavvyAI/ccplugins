# Spike: Client Author Plugin Workflow Analysis

> Branch: `spike/client-author-plugin-workflow-analysis`
> Date: 2026-01-25
> Client: Angee Costa (book production company)
> Referral: Business partner recommended the author plugin

## What Was Explored

Analyzed discovery call notes from Angee Costa against existing author plugin
tooling (9 commands) to identify fit, gaps, and a service offer.

## Key Learnings

### 1. The plugin already covers 60% of the visible book lifecycle

Init, chapter work, revision, compilation, progress tracking, and publishing
pipeline all exist and are mature. These don't need to be sold — they're table
stakes that validate the platform choice.

### 2. The real opportunity is in the invisible work

Angee's bottleneck isn't the writing lifecycle — it's the friction *around*
writing:
- **Before writing**: Raw ideas need compression into clear intent. Currently
  happens in Angee's head, which is the bottleneck.
- **Before editing**: Client AI drafts waste senior creative time. No filtering
  exists — every draft gets manual review regardless of quality.
- **Around publishing**: Credibility infrastructure (email, domains, KDP, ISBN,
  branding) is operational drag that slows momentum.

### 3. The strategic frame is "AI containment," not "AI writing"

Angee explicitly avoids AI-generated prose. The offer must respect this boundary.
AI value comes from:
- Compressing pre-writing work (intent, not prose)
- Filtering post-client work (triage, not rewriting)
- Systematizing operational work (checklists, not automation)

### 4. Two commands fill the highest-value gaps

| Command | Purpose | Value to Angee |
|---------|---------|---------------|
| `/author:intent` | Raw input → structured chapter intent (no prose) | Unblocks her writing bottleneck |
| `/author:filter` | Client draft → triage report (AI detection, tone, salvageability) | Eliminates unpriced cleanup tax |

## Decisions Made

- **Phase 1 scope**: `/author:intent` and `/author:filter` only
- **Phase 2 (if proven)**: `/author:ops` for credibility infrastructure
- **Phase 3 (deferred)**: Marketing guidance, client onboarding
- **Design principle**: AI as internal exoskeleton, never client-facing prose generation

## Existing Tooling Fit Map

| Angee's Workflow | Existing Command | Fit Level |
|-----------------|-----------------|-----------|
| Discovery/outlining | `/author:init` + `/author:weave` | Partial |
| Writing chapters | `/author:chapter` | Good (her domain) |
| Editing/revision | `/author:revise` | Partial (not for triage) |
| Progress tracking | `/author:status` + `/author:targets` | Good |
| Publishing pipeline | `/author:publish` | Good |
| Compilation/output | `/author:compile` | Good |
| Pre-writing compression | **MISSING** | — |
| AI draft filtering | **MISSING** | — |
| Author ops/credibility | **MISSING** | — |
| Marketing guidance | **MISSING** (deferred) | — |

## Proposed Command Specifications

### `/author:intent`

**Input**: Raw material (voice transcription, bullet points, client notes,
conversation dumps, existing outlines)

**Output**: `.intent.md` file per chapter containing:
- Chapter thesis (1-2 sentences)
- Key arguments or narrative beats
- Evidence/examples needed
- Emotional arc (opening state → closing state)
- Target reader takeaway
- Dependencies on other chapters

**What it does NOT do**: Generate prose, suggest wording, or write drafts.

**Integration**: Intent files live alongside chapter files in `book/chapters/`.
`/author:status` can track intent coverage as a milestone.

### `/author:filter`

**Input**: Client-submitted draft (markdown file, pasted text, or imported doc)

**Output**: Triage report containing:
- AI likelihood score (per section, not just overall)
- Flagged passages with reason codes:
  - `AI_GENERIC` — hedging language, filler, vague claims
  - `AI_HALLUCINATION` — unverifiable specifics, fabricated citations
  - `TONE_MISMATCH` — inconsistent voice, register shifts
  - `STRUCTURAL_WEAK` — missing transitions, logical gaps
- Salvageability assessment per section (keep / revise / rewrite)
- Estimated cleanup effort (light / moderate / heavy)
- Preserved gems (sections worth keeping as-is)

**What it does NOT do**: Automatically fix or rewrite content.

**Integration**: Filter reports saved to `book/reviews/` directory. Can feed
into `/author:revise` for sections marked "revise."

## Recommendations for Next Steps

1. **Build `/author:intent` first** — it directly unblocks Angee's primary
   bottleneck (her writing time) and has clearest value signal.
2. **Build `/author:filter` second** — it protects margin on existing client
   work and has immediate ROI.
3. **Validate with Angee** on 1-2 real projects before expanding to Phase 2.
4. **Price the tooling access, not the AI** — Angee's clients pay for her
   expertise. The tools accelerate her, they don't replace her.
