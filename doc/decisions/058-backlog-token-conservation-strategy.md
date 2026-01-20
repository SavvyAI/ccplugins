# 058. Backlog Token Conservation Strategy

Date: 2026-01-19

## Status

Accepted

## Context

Evaluated Steve Yegge's [Beads](https://github.com/steveyegge/beads) project, a Git-backed graph issue tracker designed for AI coding agents. Beads offers:

- JSONL storage in `.beads/` directory
- Hash-based task IDs (`bd-a1b2`) preventing merge collisions
- Dependency graph with blocking relationships
- Semantic summarization ("memory decay") for token conservation
- SQLite caching for performance

The evaluation was prompted by growing `backlog.json` (~1000 lines with many resolved items) causing unnecessary token consumption during backlog operations.

## Decision

**Do not adopt Beads.** Instead, implement two targeted improvements:

### 1. Archive Resolved Items (Chore #78)

Move resolved items older than 7 days to `.plan/backlog-archive.json`:
- Reduces active backlog from ~1000 to ~200-300 lines
- `/pro:roadmap` reads from both files for "Recently Completed" section
- `lastSequence` stays in main file (IDs never reused)

### 2. Migrate to Hash-Based IDs (Chore #79)

Convert sequential integer IDs to short hashes (`b-{4-char-hex}`):
- Future-proofs against multi-branch backlog edits
- Human-referenceable (unlike full UUIDs)
- Collision-resistant across parallel branches
- Migration after #78 minimizes items to convert

## Consequences

### Positive

- Token consumption reduced ~70% for backlog operations
- No external tool dependency (Beads requires Go binary + SQLite)
- Git diffs remain meaningful (vs SQLite binary blobs)
- Existing command ecosystem unchanged
- Lower operational complexity

### Negative

- No dependency graph (if blocking relationships become needed, add `blockedBy` field)
- Two-file management for backlog + archive
- One-time migration effort for hash IDs

## Alternatives Considered

### Full Beads Adoption

**Rejected.** Migration cost high (different data model, command rewrites), dependency tracking rarely needed in single-developer workflow, merge collision risk low.

### SQLite Storage

**Rejected.** Would solve token problem via selective queries, but git diffs become meaningless binary blobs. Loses "backlog as code" auditability.

### JSONL Format

**Rejected.** Append-only writes don't help (commands read entire file anyway). Metadata (`lastSequence`) requires separate file. Tooling friction without benefit.

### UUID IDs

**Rejected in favor of short hashes.** Full UUIDs are not human-referenceable. Short hashes (`b-a1f3`) provide collision resistance while remaining readable.

## Related

- Planning: `.plan/.done/spike-evaluate-beads-ai-context-framework/`
- Beads project: https://github.com/steveyegge/beads
- ADR-015: Audit, Backlog, and Roadmap Command Architecture
- ADR-016: ADR Check and Backlog Integration for Work Commands
