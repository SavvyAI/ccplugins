# Spike: Evaluate planning-with-files Approach

**Branch:** `spike/evaluate-planning-with-files-approach`
**Date:** 2026-01-25
**Status:** Complete

## What Was Explored

Evaluated [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files) - a "Manus-style" persistent markdown planning methodology for AI coding agents.

### The Approach

**Core Concept:** Treat filesystem as "persistent working memory on disk" to overcome LLM context window limitations.

**3-File Pattern:**
| File | Purpose | Update Frequency |
|------|---------|------------------|
| `task_plan.md` | Phases, progress, decisions, errors | After each phase |
| `findings.md` | Research, discoveries | After ANY discovery |
| `progress.md` | Session log, test results | Throughout session |

**Hook System:**
- **PreToolUse** (Write/Edit/Bash/Read/Glob/Grep): Reads first 30 lines of task_plan.md before operations
- **PostToolUse** (Write/Edit): Reminds to update task_plan.md status
- **Stop**: Validates all phases complete before terminating

**Key Principles:**
1. Create plan FIRST before any complex task
2. "2-Action Rule" - save findings after every 2 view/browser operations
3. Read before decide (refreshes goals in attention window)
4. Update after act
5. Log ALL errors in structured table
6. Never repeat failures (track attempts, mutate approach)
7. Session recovery via catchup script

## Key Learnings

### Comparison: planning-with-files vs ccplugins .plan/

| Aspect | planning-with-files | ccplugins .plan/ |
|--------|---------------------|------------------|
| **File structure** | 3 fixed files in project root | Branch-scoped directories under `.plan/` |
| **State persistence** | Explicit markdown files | TodoWrite + checkpoint.json |
| **Hook pattern** | PreToolUse reads plan (attention manipulation) | PostToolUse writes checkpoint (state capture) |
| **Recovery** | session-catchup.py + manual file reading | `/pro:backlog.resume` + checkpoint restoration |
| **Error tracking** | Explicit table in task_plan.md | Ad-hoc in planning docs |
| **IDE support** | Multi-IDE (Claude Code, Cursor, Gemini, etc.) | Claude Code only |
| **Plan re-reading** | Automatic via PreToolUse hook | Manual (user invokes resume) |
| **Separation of concerns** | Strict 3-file split | Flexible per-branch artifacts |

### What planning-with-files Does Better

1. **Proactive attention manipulation** - PreToolUse hook ensures the plan is in context before major operations. Our checkpoint approach is reactive (saves state after changes) rather than proactive (loads state before decisions).

2. **Structured error tracking** - Explicit error table prevents repeating failures:
   ```markdown
   | Error | Attempt | Resolution |
   |-------|---------|------------|
   | FileNotFoundError | 1 | Created default config |
   | API timeout | 2 | Added retry logic |
   ```

3. **Multi-IDE portability** - Works across Claude Code, Cursor, Gemini CLI, Kilocode, etc.

4. **The "2-Action Rule"** - Concrete heuristic for when to persist findings, especially for multimodal (visual/browser) data that gets lost.

### What ccplugins Does Better

1. **Branch isolation** - `.plan/{branch}/` keeps planning artifacts scoped to the work unit. planning-with-files clutters project root.

2. **Backlog integration** - Spikes, features, bugs flow through backlog.json with fingerprints, status tracking, and branch linking.

3. **Checkpoint precision** - TodoWrite state preserved exactly as JSON. Markdown requires parsing.

4. **Archival pattern** - `.plan/.done/` preserves completed work history.

5. **Less cognitive overhead** - No need to remember 3-file pattern; backlog.resume handles recovery automatically.

## Decisions Made

### Don't Adopt (with selective extraction)

**Rationale:**
1. **Solves a different problem** - planning-with-files targets stateless LLM interactions and multi-IDE portability. ccplugins is Claude Code-native with hooks, backlog integration, and branch-scoped workflows.

2. **We already have persistence** - ADR-038's checkpoint approach + backlog.resume provides state recovery without maintaining 3 separate files.

3. **Branch isolation is superior** - Project root pollution with task_plan.md, findings.md, progress.md isn't desirable.

4. **Hook cost concern** - PreToolUse on every Write/Edit/Bash/Read/Glob/Grep adds latency and tokens.

### Patterns Worth Extracting

1. **The 2-Action Rule** - Extracted via PostToolUse hook (more reliable than CLAUDE.md)
2. **Structured error logging** - Consider for planning templates (optional, not extracted)

## Recommendations for Next Steps

1. ~~Extract 2-Action Rule~~ **DONE** - Added PostToolUse hook in `pro/hooks/hooks.json`
2. **Consider PreToolUse experiment** - If goal drift becomes a problem, could add lightweight plan-refresh hook
3. **Monitor hook effectiveness** - If 2-Action Rule hook isn't followed, escalate to CLAUDE.md as backup

## Related

- ADR-038: TodoWrite Checkpoint Persistence
- ADR-014: Skills Directory for Bundled Agent Skills
- **ADR-059: Structured Error Logging with 3-Strike Protocol** (created from this spike)
- Previous spike: Beads AI context framework (rejected, #77)
- Previous spike: Gastown multi-agent orchestration (rejected, #80)
