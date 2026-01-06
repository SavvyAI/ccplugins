# 038. TodoWrite Checkpoint Persistence

Date: 2025-01-06

## Status

Accepted

## Context

When Claude Code sessions end due to context compaction or manual restart, the in-progress work state tracked by `TodoWrite` is lost. Users running `/pro:backlog.resume` can see that work is in-progress from the backlog, but Claude has no knowledge of where within that work it stopped - which todos were completed, which were pending, what the current task was.

This creates a poor experience where:
1. Work must be re-understood from scratch
2. Completed subtasks may be repeated
3. Context about "what was I doing?" is lost

## Decision

Use Claude Code's PostToolUse hook system to automatically persist TodoWrite state to a checkpoint file whenever todos are updated.

**Implementation:**
1. `hooks/hooks.json` - Registers a PostToolUse hook matching `TodoWrite`
2. `hooks/checkpoint.sh` - Writes `tool_input` to `.plan/{branch}/checkpoint.json`
3. `backlog.resume.md` - Reads checkpoint and restores todos via TodoWrite

**Checkpoint format:** Raw TodoWrite input (minimal, just `{todos: [...]}`)

**Trigger:** Event-driven via hooks, no polling or manual saves needed

## Consequences

**Positive:**
- Work state automatically preserved across sessions
- `/pro:backlog.resume` can restore exact todo state
- Zero user effort required - hooks fire automatically
- Minimal storage - only current branch's checkpoint persisted

**Negative:**
- Requires plugin hooks support in Claude Code (verified working)
- Checkpoint only written when `.plan/{branch}/` directory exists
- Hook must be published with plugin - local changes don't take effect

## Alternatives Considered

1. **Periodic auto-save** - Timer-based writes. Rejected: unnecessary complexity, may miss final state
2. **Manual `/checkpoint` command** - User-triggered. Rejected: relies on user discipline
3. **Store in backlog.json** - Embed state in backlog item. Rejected: couples two concerns, bloats backlog
4. **Session transcript parsing** - Read from Claude Code transcripts. Rejected: fragile, format may change

## Related

- PostToolUse hooks documentation
- `commands/backlog.resume.md` - consumes checkpoint
