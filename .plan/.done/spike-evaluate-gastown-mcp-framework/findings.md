# Spike: Evaluate Gastown MCP Framework

**Branch:** spike/evaluate-gastown-mcp-framework
**Date:** 2026-01-19
**Status:** Complete

## What Was Explored

Evaluated Steve Yegge's [Gastown](https://github.com/steveyegge/gastown) project - a multi-agent orchestration system built on top of Beads (which was evaluated in backlog #77). Gastown provides workspace management for coordinating multiple Claude Code agents working on different tasks simultaneously.

## Gastown Feature Summary

| Feature | Description |
|---------|-------------|
| **Mayor Pattern** | Primary AI coordinator with full workspace context, orchestrates agent work |
| **Hooks System** | Git worktree-based persistent storage that survives agent crashes |
| **Convoys** | Work tracking units that bundle beads (issues) assigned to agents |
| **Polecats** | Ephemeral worker agents spawned for specific tasks |
| **Crew Members** | Persistent personal workspaces for hands-on work |
| **Rigs** | Project containers wrapping git repositories |
| **Beads Ledger** | Git-backed issue tracking with hash-based IDs |
| **Formulas** | TOML-defined repeatable workflows |
| **Mailboxes** | Built-in agent coordination via hooks injection |

## Key Architectural Patterns

### 1. The Propulsion Principle
> "If you find something on your hook, YOU RUN IT."

Agents execute immediately upon assignment without waiting for confirmation. This treats the system like "a steam engine—agents are pistons."

### 2. Attribution as Mandatory Practice
Every action receives full attribution through Git commits, beads issues, and events. This enables:
- Objective model evaluation
- Quality signal tracking
- Data-driven deployment decisions

### 3. Convoy-Based Work Batching
Work is bundled into convoys for unified tracking across rigs (repositories). Even single issues get convoy tracking for historical records and cross-rig visibility.

### 4. Role Taxonomy
- **Infrastructure roles**: Mayor, Deacon, Witness, Refinery
- **Worker roles**: Polecat (ephemeral), Crew (persistent), Dog (infrastructure helpers)

## Relationship to Beads (Evaluated in Spike #77)

| Layer | Tool | Purpose |
|-------|------|---------|
| **Data storage** | Beads (`bd`) | Git-backed issue tracking with hash IDs, dependency graphs |
| **Orchestration** | Gastown (`gt`) | Multi-agent coordination, workspace management, convoys |

Gastown *requires* Beads as its underlying work tracking system. The prior decision not to adopt Beads (ADR-058) effectively precludes Gastown adoption.

## Comparative Analysis

### Problems Gastown Solves (That ccplugins Doesn't Have)

1. **Multi-Agent Coordination** - Gastown manages 20-30 agents working in parallel. ccplugins is single-agent, single-developer.

2. **Cross-Repository Orchestration** - "50 tasks across 8 repos involving 4 teams." ccplugins operates within a single repository context.

3. **Agent Attribution** - Answering "which agent wrote this buggy code?" when multiple agents contribute. ccplugins has one agent.

4. **Capability Routing** - Determining "which agent should handle this Go refactor." Not applicable to single-agent setup.

5. **Work Persistence Across Crashes** - Gastown hooks survive agent restarts. Claude Code already has session resumption via `/pro:backlog.resume` and checkpoint files.

### Patterns Potentially Useful

| Pattern | Gastown Implementation | ccplugins Applicability |
|---------|----------------------|-------------------------|
| **Git worktrees for isolation** | Hooks system | Already documented in `/pro:spike` tip |
| **Persistent state files** | `.gt/` directory with config | Already have `.plan/` directory |
| **Work batching** | Convoys | MVP workflow already batches items |
| **Formulas** | TOML workflow definitions | Could inspire command presets (low value) |

### What ccplugins Already Has

1. **Session Persistence** - Checkpoint files + `/pro:backlog.resume`
2. **Work Tracking** - `backlog.json` with status, severity, phases
3. **Branch Isolation** - Work commands create isolated branches
4. **Workflow Commands** - `/pro:feature`, `/pro:bug`, `/pro:spike`, etc.
5. **Planning Integration** - `.plan/{branch}/` directories with notes

## Key Questions Answered

### 1. Is Gastown useful for ccplugins?

**No.** Gastown solves multi-agent orchestration problems that don't exist in a single-agent, single-developer workflow.

### 2. Are any patterns worth extracting?

**Minimal value.**

- **Git worktrees**: Already documented in `/pro:spike`
- **TOML formulas**: Could inspire command presets, but current command structure is sufficient
- **Persistent hooks**: Already achieved via checkpoint files

### 3. Would Gastown become useful if workflow changes?

**Potentially, if:**
- Multi-agent Claude Code becomes standard
- Projects span multiple repositories
- Team-based agent deployment emerges

But these scenarios are speculative. Current workflow is single-agent within ccplugins repo.

## Recommendation

**Do not adopt Gastown.**

| Factor | Assessment |
|--------|------------|
| **Prerequisite** | Requires Beads adoption (already rejected in ADR-058) |
| **Problem fit** | Solves multi-agent problems; ccplugins is single-agent |
| **Operational complexity** | Go binary + tmux + SQLite + Beads stack |
| **Value for current workflow** | Near-zero |
| **Future relevance** | Only if multi-agent workflows become standard |

### If Needs Change

Consider revisiting if:
- Claude Code supports native multi-agent orchestration
- Multi-repository work becomes common
- Agent attribution becomes a requirement

## Decisions Made

1. **Do not adopt Gastown** - Wrong tool for single-agent workflow
2. **No extractable patterns** - Existing systems cover use cases
3. **Monitor for future relevance** - Multi-agent Claude Code could change calculus

## Related

- ADR-058: Backlog Token Conservation Strategy (Beads evaluation)
- Backlog #77: Evaluate Beads AI context framework (resolved)
- Spike: Git worktree agent sandboxing (already documented worktree patterns)
