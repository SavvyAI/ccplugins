# ADR-054: Author Publish Pipeline Architecture

**Status:** Accepted
**Date:** 2026-01-17
**Amends:** ADR-028

## Context

The Author plugin helps authors write books but lacked support for the traditional publishing path. Once a manuscript reaches the `pitch-ready` milestone, authors face a opaque, high-stakes process: writing query letters, preparing proposals, researching agents, and managing submissions.

ADR-028 explicitly rejected automatic pitch artifact generation, with the rationale:
> "Authors should create pitch materials intentionally... Premature generation could encourage premature pitching."

This was the right decision for *automated* generation during normal workflow. However, there's a distinct use case: when an author intentionally invokes a command to prepare publishing materials. This is not automation theater—it's an opt-in tool triggered at the author's discretion.

## Decision

### 1. Create `/author:publish` Command

A phased pipeline command that transforms a book project into a publisher-ready submission system:

```
/author:publish
    │
    ├── [SCAN] (optional) ──→ Go/No-Go concept validation
    │
    ├── [QUERY] ──→ Agent query letter
    │
    ├── [PROPOSAL] ──→ Full book proposal
    │
    ├── [TARGETS] ──→ Curated agent target map
    │
    └── [LAUNCH] ──→ Submission tracking + Advance framing
```

Each phase:
1. Generates its output artifact
2. Presents for author review
3. Allows refinement before proceeding
4. Can be paused and resumed

### 2. Store Artifacts in `book/publish/`

Publishing artifacts live alongside book content:

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

**Rationale:**
- Publishing artifacts are part of the book project, not ephemeral planning
- `book/publish/` is versioned with the book via git
- Natural sibling to `chapters/`, `front-matter/`, etc.

### 3. Dual State Management (JSON + Markdown)

Submission tracking uses both formats:
- `submissions.json` - Machine-readable for tooling and queries
- `submissions.md` - Human-readable table for at-a-glance status

### 4. Design Constraints

Per the original requirement:
- No exposed schemas in user-facing output
- No named fields or variable-shaped outputs
- No pseudo-forms or templates
- The command teaches how publishing works, not how to wire it

## Relationship to ADR-028

ADR-028's rejection of automatic artifact generation remains valid for its original context: automated pitch generation during normal writing workflow.

This ADR introduces a **different pattern**:
- **Opt-in invocation**: Author explicitly runs `/author:publish`
- **Checkpointed phases**: Each artifact is reviewed before proceeding
- **Author agency preserved**: The author chooses when to run this, not the system

The key distinction is *intent*. When an author runs `/author:publish`, they're signaling readiness to engage with the publishing process. This is fundamentally different from the system automatically generating a pitch deck when `pitch-ready` milestone is detected.

## Consequences

### Positive

- **Demystifies publishing**: Makes the opaque gatekeeping process navigable
- **Preserves author agency**: Opt-in command, not automated generation
- **Phased workflow**: Quality checkpoints between major outputs
- **Dual tracking**: JSON for tooling, Markdown for humans
- **Integrated storage**: Publishing artifacts live with the book

### Negative

- **Relies on WebSearch**: No integrated agent database; research quality varies
- **Manual submission**: No email integration; outputs are copy/paste
- **No external sync**: Doesn't connect to QueryManager or other tools

### Neutral

- ADR-028's stance on *automated* generation remains unchanged
- Future enhancements could add CRM/email integration

## Related ADRs

- **ADR-023** (Writer Plugin Multi-Plugin Architecture) - Plugin structure
- **ADR-028** (Writer Milestone Tracking) - Original artifact generation stance (amended)
- **ADR-029** (Author Plugin Rename) - Current naming convention
