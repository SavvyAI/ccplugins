# 059. Structured Error Logging with 3-Strike Protocol

Date: 2026-01-25

## Status

Accepted

## Context

When AI agents encounter errors during tool execution, they often:
1. Retry the same failing command without modification
2. Lose error context between session resumptions
3. Lack structured guidance on when to escalate vs. retry

The "planning-with-files" spike (evaluated earlier) highlighted structured error logging as a valuable pattern. The key insight: track consecutive failures of the same error to prevent infinite retry loops.

## Decision

Implement a 3-layer error tracking system:

### Layer 1: PostToolUseFailure Hook

A new hook `PostToolUseFailure` (confirmed in Claude Code hooks documentation) triggers on tool failures. The `error-capture.sh` script:
- Captures failed tool name and input
- Hashes errors for deduplication
- Computes strike count (consecutive same-error failures)
- Outputs warnings at Strike 2 and escalation message at Strike 3

### Layer 2: Persistent Error Storage

Errors are stored in `.plan/{branch}/errors.json`:
```json
{
  "attempts": [{"timestamp": "...", "tool": "Bash", "error": "...", "status": "unresolved"}],
  "strikeCount": 2,
  "lastErrorHash": "abc12345"
}
```

### Layer 3: Session Resume Integration

`/pro:backlog.resume` loads error context and applies 3-Strike Protocol rules:
- Strike 1: Normal operation
- Strike 2: MUST use different approach
- Strike 3+: STOP and escalate to user

## Consequences

### Positive

- **Prevents infinite retries** - Agent cannot repeat same failing action 3+ times
- **Preserves error context** - Errors survive session boundaries
- **Clear escalation path** - User is engaged at Strike 3 instead of watching repeated failures
- **Branch-scoped** - Errors are isolated to their work branch

### Negative

- **Hook latency** - PostToolUseFailure adds processing time on failures
- **Hash collisions** - 8-character hash could theoretically collide (acceptable for this use case)
- **Manual reset** - Strike count must be manually cleared after genuine resolution

## Alternatives Considered

### PreToolUse approach (from planning-with-files)
Reads error context before every tool call. Rejected because:
- Higher token cost (runs on every operation, not just failures)
- ccplugins already has PostToolUse pattern established

### In-memory tracking only
Track errors only within session. Rejected because:
- Context lost on session restart
- Resume workflow wouldn't know about prior failures

### Markdown error tables
Store errors in markdown files. Rejected because:
- Requires parsing; JSON is more reliable
- Consistent with checkpoint.json pattern

## Related

- ADR-038: TodoWrite Checkpoint Persistence (established the `.plan/{branch}/` pattern)
- Spike: planning-with-files evaluation (source of 3-Strike concept)
- Planning: `.plan/.done/spike-evaluate-planning-with-files-approach/`
