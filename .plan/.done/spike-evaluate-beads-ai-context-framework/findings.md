# Spike: Evaluate Beads (bd) AI Context Framework

**Branch:** spike/evaluate-beads-ai-context-framework
**Date:** 2026-01-19
**Status:** Complete

## What Was Explored

Evaluated Steve Yegge's [Beads](https://github.com/steveyegge/beads) project for potential adoption into ccplugins. Beads is a Git-backed graph issue tracker specifically designed for AI coding agents.

## Beads Feature Summary

| Feature | Description |
|---------|-------------|
| **Git as Database** | Issues stored as JSONL in `.beads/` directory |
| **Hash-based IDs** | Format like `bd-a1b2`, `bd-a3f8.1` prevents merge collisions |
| **Dependency Graph** | Explicit `bd dep add` for blocking/related/parent-child relationships |
| **Ready Detection** | `bd ready` surfaces tasks with no open blockers |
| **Semantic Decay** | Summarizes old closed tasks to conserve context window |
| **MCP Support** | Available as Python MCP module |
| **Multi-platform** | Go binary with npm, Homebrew, pip distribution |

## ccplugins Current Architecture (ADR-015, ADR-016)

| Feature | ccplugins Implementation |
|---------|--------------------------|
| **Storage** | Single JSON file `.plan/backlog.json` |
| **IDs** | Monotonic sequence (`lastSequence` counter) |
| **Dependencies** | None - flat list with manual grouping |
| **Ready Detection** | Status filter (`open`, `in-progress`, etc.) |
| **Context Preservation** | Checkpoint files + planning directories |
| **Resumption** | `/pro:backlog.resume` reads planning notes |
| **Categories** | Explicit taxonomies (security, bug, spike, feature, etc.) |
| **Phases** | MoSCoW (must/should/could/wont) with severity inference |

## Comparative Analysis

### What Beads Does Better

1. **Dependency Tracking** - Explicit graph relationships. ccplugins has no blockers/dependencies concept.
2. **Merge Collision Prevention** - Hash-based IDs vs sequential integers that could conflict in parallel branches.
3. **Token Conservation** - Semantic summarization ("memory decay") for old items. ccplugins keeps full history.
4. **Agent-Optimized Output** - JSON output designed for machine consumption. ccplugins uses human-readable displays.

### What ccplugins Does Better

1. **MoSCoW Phases** - Built-in MVP workflow with must/should/could prioritization. Beads has only priorities.
2. **Planning Integration** - Deep integration with `.plan/` directories, checkpoint restoration, planning notes.
3. **Command Ecosystem** - `/pro:backlog`, `/pro:backlog.mvp`, `/pro:backlog.resume`, `/pro:backlog.add` form cohesive workflow.
4. **Source Tracing** - `source`, `sourceBranch`, `fingerprint` fields track item provenance.
5. **Category Taxonomy** - Explicit category types drive branch naming conventions.
6. **Single-File Simplicity** - One JSON file vs JSONL + SQLite cache. Lower operational complexity.

### Feature Overlap

| Capability | Beads | ccplugins |
|------------|-------|-----------|
| Task tracking | Yes | Yes |
| Git integration | Primary storage | Branch tracking, not storage |
| Status tracking | Yes | Yes |
| Priority/severity | P0-Pn levels | critical/high/medium/low |
| Session persistence | Via git | Via checkpoint.json |
| CLI interface | `bd` command | `/pro:*` commands |

## Key Questions Answered

### 1. Does Beads solve problems our backlog.json doesn't?

**Partially.** The main gaps Beads addresses:
- **Dependency blocking** - We have no way to say "task X blocks task Y"
- **Merge-safe IDs** - Our sequential IDs could theoretically conflict

However, in practice:
- We rarely need dependency tracking (work is typically serial within branches)
- Our backlog rarely sees parallel modifications (single developer workflow)
- Our MoSCoW + severity system handles prioritization without explicit blocking

### 2. What's the migration cost?

**High.**
- Different data model (flat JSON vs JSONL graph)
- New CLI tool to install and maintain
- All existing commands reference `backlog.json` schema
- Planning directory integration would need rewriting
- Checkpoint/restore functionality would need adaptation

### 3. Partial adoption options?

**Limited value.**
- **Just dependency tracking**: Could add `blockedBy: [id]` field to our schema. Simple JSON addition, no external tool needed.
- **Hash-based IDs**: Could switch from sequential to UUID/hash. Breaking change for existing items.
- **Token summarization**: Could add decay logic to `/pro:backlog` display. Independent of storage format.

### 4. Does the dependency graph add value for our workflow?

**Minimal for current use case.**
- ccplugins is a single-developer plugin system
- Work items are typically independent features/bugs
- MVP workflow handles sequencing via phase ordering
- No multi-agent parallel execution scenarios

## Recommendation

**Do not adopt Beads.**

The cost/benefit analysis is unfavorable:

| Factor | Assessment |
|--------|------------|
| **Migration effort** | High - schema change, command rewrites |
| **Dependency value** | Low - rarely blocked tasks in practice |
| **Merge collision risk** | Low - single developer, serial workflow |
| **Token savings** | Medium - but achievable without Beads |
| **Operational complexity** | Higher - Go binary + SQLite vs JSON file |

### If Needs Change

Consider Beads if:
- Multi-agent parallel workflows become common
- Complex dependency chains emerge
- Merge conflicts in backlog.json become frequent
- Token conservation becomes critical (very large backlogs)

### Low-Cost Alternatives

If specific features are desired:

1. **Dependency tracking** - Add `blockedBy: number[]` to schema, filter in `/pro:backlog`
2. **Token conservation** - Archive resolved items to `.plan/backlog-archive.json`
3. **Hash IDs** - Generate UUIDs instead of sequential (migration required)

## Decisions Made

1. **Do not adopt Beads** - Complexity doesn't justify benefits for current workflow
2. **Consider `blockedBy` field** - If dependency needs emerge, add simple schema field
3. **Document finding** - This spike provides reference for future re-evaluation

## Next Steps

- [ ] Mark spike as resolved
- [ ] Consider future backlog item for `blockedBy` field if needed
- [ ] Re-evaluate if workflow expands to multi-agent scenarios
