---
description: "Raw ideas to compress? → Structured chapter intent brief → No prose, just clarity"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
---

## Context

Compress raw, unstructured input into a structured chapter intent brief: $ARGUMENTS

## Purpose

Transform messy upstream inputs (voice transcriptions, meeting transcripts, bullet notes, email threads, conversation dumps) into a chapter-level intent brief that defines what the chapter must accomplish and why — without generating prose.

**Given** raw unstructured input (text, file, or pasted content)
**When** `/author:intent` is invoked
**Then** a structured `.intent.md` file is produced alongside the target chapter

**Critical constraint**: This command produces ONLY structural intent. It does NOT generate prose, imitate the author's voice, or fill gaps with invented content.

## Arguments

- `<input>` - Raw text (pasted), file path to text/transcript, or omit for interactive mode
- `--chapter=<name or number>` - Target chapter (optional; inferred if omitted)
- `--audience=<reader profile>` - Reader persona for takeaway calibration (optional)
- `--goal=<objective>` - Specific chapter objective override (optional)
- `--tone=<emotional target>` - Emotional arc target, not style (optional)

## Examples

```
/author:intent                                       # Interactive mode (paste or provide input)
/author:intent transcript.txt                        # Process a voice transcription file
/author:intent --chapter=03                          # Create intent for chapter 03 interactively
/author:intent notes.md --chapter="Getting Started"  # File input mapped to named chapter
/author:intent "The key insight is that..."          # Inline pasted content
/author:intent transcript.txt --chapter=05 --audience="first-time founders"
/author:intent --chapter=03 --tone="urgency to clarity"
/author:intent --chapter=new                         # Create floating/unassigned intent
```

## Your Task

### Step 1: Verify Book Project Exists

```bash
test -f book/book.json && echo "exists" || echo "missing"
```

If missing:
- Display: "No book project found. Run `/author:init` first."
- Exit

### Step 2: Collect Raw Input

Parse the argument to detect input type:

| Input | Detection | Handler |
|-------|-----------|---------|
| Ends with `.md`, `.txt`, `.rtf` | File path | Read file contents |
| Starts with `"` or is multi-word without file extension | Pasted content | Use directly |
| `--chapter=new` with no other input | Interactive | Prompt for input |
| No argument | Interactive | Prompt for input |

**If interactive**, use `AskUserQuestion`:

```
question: "How would you like to provide your raw material?"
header: "Input"
options:
  - "Paste it here" (I'll paste text directly)
  - "File path" (I'll provide a path to a text or transcript file)
```

If "Paste it here", use `AskUserQuestion` with freeform:

```
question: "Paste your raw material (voice notes, bullets, transcripts, conversation dumps — anything):"
header: "Raw Input"
freeform: true
```

If "File path", use `AskUserQuestion` with freeform to get the path, then `Read` the file.

Display intake confirmation:

```
[ author:intent ]
-----------------
Input received: [source description]
Length: ~[N] words
```

### Step 3: Determine Target Chapter

**If `--chapter` provided:**
- Parse the argument (number, slug, or "new")
- If number or slug: find matching chapter file in `book/chapters/`
- If "new": go to Step 3B (floating intent)

**If `--chapter` not provided:**
1. Load `book/book.json` chapter list
2. Read first ~50 lines of each chapter to understand content themes
3. Analyze raw input for topic/theme signals
4. Present best-match recommendation:

```
[ author:intent | chapter match ]
----------------------------------
Raw input themes detected:
  - [Theme 1]
  - [Theme 2]

Best match: Chapter [NN] - [Title]
Confidence: [High/Medium/Low]
Reason: [Brief rationale]

Other candidates:
  - Chapter [NN] - [Title] ([fit level])
```

Use `AskUserQuestion`:

```
question: "Which chapter should this intent map to?"
header: "Chapter"
options:
  - "Chapter [NN] - [Title] (Recommended)"
  - "Chapter [NN] - [Title]"
  - [... other chapters]
  - "Create floating intent (assign later)"
```

**Step 3B: Floating Intent**

If "Create floating intent" or `--chapter=new`:

Use `AskUserQuestion`:
```
question: "What's a working title for this intent?"
header: "Title"
freeform: true
```

Generate filename: `00-{slugified-title}.intent.md`

### Step 4: Check for Existing Intent

```bash
ls book/chapters/{NN}-*.intent.md 2>/dev/null
```

If an intent file already exists for this chapter:

Use `AskUserQuestion`:
```
question: "An intent brief already exists for this chapter. How should I proceed?"
header: "Existing"
options:
  - "Replace entirely" (overwrite with new intent from this input)
  - "Merge inputs" (combine new material with existing intent)
  - "View existing first" (show current intent before deciding)
  - "Abort" (keep existing intent unchanged)
```

If "View existing first": read and display the file, then re-ask replace/merge/abort.

If "Merge inputs": read existing intent, hold in context for Step 5 to synthesize alongside new input.

### Step 5: Analyze and Compress

Process the raw input against these 9 extraction targets. For each section, extract what the input provides and flag what it does not.

**5.1 — Core Thesis**
Extract or infer the central argument/claim of this chapter. 1-2 sentences maximum.
If the input does not contain a clear thesis: `[NEEDS INPUT] What is the central claim or assertion of this chapter?`

**5.2 — Why This Chapter Exists**
Determine the chapter's role in the overall book arc by reading `book/book.json` chapter list and any available chapter content. What does this chapter advance? What breaks if it's weak or missing?

**5.3 — Key Arguments / Moves**
Extract distinct logical moves, narrative beats, or teaching points. Bullet list only. Each bullet is a claim, transition, or structural move. No prose expansion.

**5.4 — Evidence / Inputs Needed**
Identify what proof, data, stories, examples, or research the chapter needs. Tag each item:
- `[PRESENT]` — explicitly mentioned in the raw input
- `[MISSING]` — implied or necessary but absent from input

**5.5 — Emotional Arc**
Where the reader enters (emotional/intellectual state) and where they exit.
Format: `[entering state] → [exiting state]`
Use `--tone` override if provided.

**5.6 — Reader Takeaway**
What the reader should be able to do, believe, or understand after this chapter.
Use `--audience` to calibrate if provided.

**5.7 — Exclusions / Guardrails**
What this chapter should NOT cover. Derived from adjacent chapter scope and any explicit exclusions in the input.

**5.8 — Confidence Rating**
Based on **input completeness**, not model certainty:
- **High** — thesis, arguments, AND evidence are present in the input
- **Medium** — thesis is present but some structural gaps remain
- **Low** — thesis is fuzzy or missing; intent brief is speculative

**5.9 — Open Questions**
Specific questions the author needs to answer before writing cleanly. These are gaps in the input, NOT invented content to fill those gaps. Format each as:
```
[NEEDS INPUT] Question text here
```

### Step 6: Present Intent Brief for Review

Display the complete brief before writing:

```
[ author:intent | draft brief ]
--------------------------------
Chapter: [NN] - [Title]
Source: [input description]
Confidence: [High/Medium/Low]

═══════════════════════════════════════════════════

## Core Thesis
[thesis or [NEEDS INPUT] question]

## Why This Chapter Exists
[role in book arc]

## Key Arguments / Moves
- [bullet]
- [bullet]

## Evidence / Inputs Needed
- [item] [PRESENT]
- [item] [MISSING]

## Emotional Arc
[entering] → [exiting]

## Reader Takeaway
[what the reader gains]

## Exclusions / Guardrails
- [exclusion]

## Confidence Rating
[Rating] — [rationale citing input completeness]

## Open Questions
- [NEEDS INPUT] [question]

═══════════════════════════════════════════════════
```

Use `AskUserQuestion`:
```
question: "How does this intent brief look?"
header: "Review"
options:
  - "Approve" (save this intent brief)
  - "Needs adjustment" (I'll tell you what to change)
  - "Start over" (reanalyze from scratch)
  - "Abort" (don't save anything)
```

### Step 7: Refinement Loop

If "Needs adjustment":

Use `AskUserQuestion`:
```
question: "What would you like me to adjust?"
header: "Adjust"
freeform: true
```

Apply changes and re-present (return to Step 6). Repeat until approved or aborted.

### Step 8: Write Intent File

Write to `book/chapters/{NN}-{slug}.intent.md`:

```markdown
---
chapter: [NN or null if floating]
chapterTitle: "[Chapter Title or Working Title]"
chapterFile: "[NN]-[slug].md" or null
created: "[ISO 8601]"
lastModified: "[ISO 8601]"
confidence: "[High/Medium/Low]"
status: "[draft/unassigned]"
---

# Intent: [Chapter Title]

## Core Thesis

[thesis content or [NEEDS INPUT] question]

## Why This Chapter Exists

[role in book arc]

## Key Arguments / Moves

- [bullet]
- [bullet]

## Evidence / Inputs Needed

- [item] [PRESENT]
- [item] [MISSING]

## Emotional Arc

[entering state] → [exiting state]

## Reader Takeaway

[takeaway content]

## Exclusions / Guardrails

- [exclusion]

## Confidence Rating

[Rating] — [rationale based on input completeness]

## Open Questions

- [NEEDS INPUT] [question]
```

### Step 9: Display Confirmation

```
[ author:intent ]
-----------------
Saved: book/chapters/[NN]-[slug].intent.md

Chapter:    [NN] - [Title]
Confidence: [Rating]
Open:       [N] questions
Status:     [draft/unassigned]

Next steps:
  Start writing → /author:chapter [NN]
  View progress → /author:status
  Revise intent → /author:intent --chapter=[NN]
```

## Compression Rules

The system **must not**:

| Rule | Rationale |
|------|-----------|
| Generate prose or paragraphs | Intent is structural, not stylistic |
| Imitate the author's voice | The author's voice is their domain |
| Fill gaps with invented content | Gaps are information signals, not problems to solve |
| Suggest example sentences or wording | Implies phrasing the author may not want |
| Fabricate evidence, stories, or data | Flag `[MISSING]` instead of inventing |
| Assume agreement when input is ambiguous | Ask via `[NEEDS INPUT]` instead of guessing |

If inputs are weak, the system **flags gaps instead of guessing**. Every unfilled section uses the `[NEEDS INPUT]` prefix with a specific, actionable question.

## Confidence Rating Rules

Confidence is derived from **input completeness**, not model certainty:

| Rating | Criteria |
|--------|----------|
| **High** | Thesis + arguments + evidence all present in input |
| **Medium** | Thesis present, some structural gaps remain |
| **Low** | Thesis fuzzy or missing; brief is speculative |

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Input too short (< 50 words) | Warn: "This input may be too brief for meaningful compression. Consider adding more raw material." Allow proceeding. |
| Input covers multiple chapters | Recommend strongest single-chapter match. Suggest running `/author:intent` again for other chapters. |
| No chapters exist yet | Allow floating intent. Suggest `/author:init` or `/author:chapter` first. |
| Chapter has content but no intent | Normal case — create intent retroactively from chapter content + user input. |
| Raw input contradicts existing chapter | Flag the contradiction in Open Questions. Do not resolve it. |
| Merge mode with conflicting theses | Present both side-by-side. Ask user to choose or synthesize. |
| All 9 sections are `[NEEDS INPUT]` | Set confidence to Low. Warn: "Input lacks sufficient structure. Consider adding more detail." |
| Input is non-English | Process in detected language. Flag if language differs from existing chapter content. |

## Relationship to Other Commands

| Command | Relationship |
|---------|-------------|
| `/author:init` | Must run first to create `book/book.json` |
| `/author:weave` | Weave imports content; intent compresses raw ideas. Weave brings material in, intent makes sense of it. |
| `/author:chapter` | Intent feeds into chapter writing. The intent brief is what the author writes *from*. |
| `/author:revise` | Operates after writing. Intent operates before writing. |
| `/author:status` | Can track intent coverage (N of M chapters have `.intent.md` files) |
