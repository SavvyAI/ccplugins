# 060. Author Intent — Pre-Writing Compression Command

Date: 2026-01-25

## Status

Accepted

## Context

Professional authors and ghostwriters lose significant senior creative time *before* writing begins, untangling raw material (voice transcriptions, meeting notes, client conversations, bullet points) into something coherent enough to write from. The author plugin covers the visible book lifecycle (init, import, chapter work, revision, compilation, publishing) but has no tool for the pre-writing compression step.

A client discovery call revealed this gap: the primary bottleneck is not writing itself but the cognitive load of converting fuzzy inputs into clear chapter intent. The client manages a full-service book production company and explicitly avoids AI-generated prose, making "AI writing assistance" off the table.

## Decision

Add `/author:intent` — a command that compresses raw, unstructured input into a structured 9-section chapter intent brief without generating prose.

Key design choices:

1. **Intent files co-located with chapters**: `{NN}-{slug}.intent.md` alongside `{NN}-{slug}.md` in `book/chapters/`. Makes the relationship obvious and simplifies glob patterns for status tracking.

2. **One chapter per invocation**: Forces single-chapter focus. Multi-chapter material gets the best-match recommendation with a suggestion to re-run for others.

3. **Gap flagging over gap filling**: When input is incomplete, the system writes `[NEEDS INPUT] <specific question>` rather than inventing content. Confidence rating is derived from input completeness (thesis + arguments + evidence = High), not model certainty.

4. **Floating intents**: `--chapter=new` creates unassigned intent files (`00-{slug}.intent.md`) for material that doesn't map to an existing chapter yet.

5. **YAML frontmatter on intent files**: Includes chapter reference, timestamps, confidence, and status. Enables programmatic discovery by `/author:status`.

6. **No prose generation constraint is enforced structurally**: The output schema uses bullets, tags, and structured fields. There is no "summary paragraph" or "draft opening" section.

## Consequences

**Positive:**
- Unblocks the pre-writing bottleneck without touching the author's creative domain
- Zero political risk — no AI writing, no voice imitation
- Creates trust foundation for future defensive tools (`/author:filter`)
- Intent files become reusable artifacts (briefing documents, editor handoffs)
- New `intent-covered` milestone in `/author:status` adds visibility to pre-writing progress

**Negative:**
- Intent files add to the repository's file count (mitigated: they're small and optional)
- Authors must learn a new step in the workflow (mitigated: the command is interactive and self-explanatory)
- The 9-section schema may be more structure than some authors need (mitigated: all sections accept terse input)

## Alternatives Considered

1. **Extend `/author:weave` with an intent mode**: Rejected. Weave imports external content into the book; intent compresses fuzzy ideas into structure. Different verbs, different mental models.

2. **Add intent generation to `/author:chapter`**: Rejected. Chapter is for creating/editing prose. Coupling intent creation to chapter creation conflates pre-writing and writing.

3. **Store intents in a separate `book/intents/` directory**: Rejected. Co-location with chapter files makes the relationship explicit and simplifies tooling.

4. **Generate draft prose alongside intent**: Rejected. Violates the core design principle that this is a "thinking compressor, not a writing tool." Would undermine trust with authors who explicitly avoid AI prose.

## Related

- Planning: `.plan/.done/spike-client-author-plugin-workflow-analysis/`
- Spike findings: `.plan/.done/spike-client-author-plugin-workflow-analysis/findings.md`
- ADR-029: Author plugin rename and weave consolidation
- ADR-054: Author publish pipeline architecture
