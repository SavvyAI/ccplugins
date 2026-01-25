---
name: error-tracking
description: 3-Strike Protocol for structured error handling. Use when tool failures occur to prevent repetitive errors and guide resolution. Provides automatic error capture, strike counting, and escalation workflow.
---

# Error Tracking

Structured error handling with automatic capture and 3-strike escalation protocol.

## Core Principle

> Never repeat the same failing action. Each failure requires a different approach.

## 3-Strike Protocol

| Strike | Meaning | Required Action |
|--------|---------|-----------------|
| 1 | First failure | Diagnose root cause, attempt targeted fix |
| 2 | Same error twice | **MUST try fundamentally different approach** |
| 3+ | Repeated failure | **STOP** - escalate to user or complete rethink |

## How It Works

### Automatic Capture

The `PostToolUseFailure` hook automatically captures failures from `Bash`, `Write`, and `Edit` tools to `.plan/{branch}/errors.json`.

### Error File Schema

```json
{
  "attempts": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "tool": "Bash",
      "error": "npm test -- --run failed with exit code 1",
      "status": "unresolved"
    }
  ],
  "strikeCount": 2,
  "lastErrorHash": "abc12345"
}
```

### Strike Detection

Strikes are computed by comparing error hashes:
- Same error hash as previous → increment strike count
- Different error → reset to strike 1

## Resolution Workflow

### When You Hit Strike 2

1. **Stop** - do not repeat the previous action
2. **Read error context**: `.plan/{branch}/errors.json`
3. **Analyze differently**:
   - Check logs, not just error message
   - Verify assumptions about the codebase
   - Consider if the approach itself is wrong
4. **Try alternative approach**:
   - Different implementation strategy
   - Different tool or command
   - Gather more information first

### When You Hit Strike 3

1. **STOP immediately**
2. **Escalate to user** with:
   - Summary of what was attempted
   - The error being encountered
   - Analysis of why approaches failed
   - Questions to clarify path forward
3. **Do NOT attempt another fix** until user responds

### Marking Errors Resolved

After successfully fixing an issue, update the errors file:

```bash
# Mark all unresolved errors as resolved
jq '.attempts |= map(if .status == "unresolved" then .status = "resolved" else . end) | .strikeCount = 0 | .lastErrorHash = ""' \
  .plan/{branch}/errors.json > .plan/{branch}/errors.json.tmp && \
  mv .plan/{branch}/errors.json.tmp .plan/{branch}/errors.json
```

## Reading Error Context

On session resume, check for unresolved errors:

```bash
# Check if errors exist and show status
if [ -f ".plan/{branch}/errors.json" ]; then
  STRIKES=$(jq -r '.strikeCount' .plan/{branch}/errors.json)
  UNRESOLVED=$(jq '[.attempts[] | select(.status == "unresolved")] | length' .plan/{branch}/errors.json)
  echo "Strikes: $STRIKES, Unresolved: $UNRESOLVED"
fi
```

## What NOT To Do

### Strike 1

- Do NOT assume the fix worked without verification
- Do NOT make the same change with minor tweaks

### Strike 2

- Do NOT repeat the same command hoping for different results
- Do NOT make superficial changes (variable names, formatting)
- Do NOT skip the "different approach" requirement

### Strike 3

- Do NOT attempt another fix
- Do NOT dismiss the pattern as "bad luck"
- Do NOT continue without user input

## Integration with Resume

The `/pro:backlog.resume` command loads error context automatically:

1. Reads `.plan/{branch}/errors.json` if present
2. Shows strike count if > 0
3. Summarizes recent unresolved errors
4. Applies 3-strike rules to resumed work

## Examples

### Strike 1 Response

```
Test failed: TypeError: Cannot read property 'id' of undefined

Analyzing: The error suggests `user` is undefined when accessing `user.id`.
Let me check where `user` is populated...
```

### Strike 2 Response

```
[Strike 2] Same error twice. Trying different approach.

Previous: Added null check before user.id access
Current: Investigating why user is undefined at source - checking the data fetch logic.
```

### Strike 3 Response

```
[STRIKE 3] Escalating to user.

I've attempted to fix this test failure 3 times:
1. Added null check for user.id
2. Traced data flow and fixed the fetch call
3. Verified mock data setup

The same error persists. Possible causes:
- Test environment configuration issue
- Missing setup/teardown logic
- Race condition in async code

How would you like me to proceed?
```

## Reset Strike Count

When the error is genuinely resolved or context changes:

```bash
# Reset strikes while preserving history
jq '.strikeCount = 0 | .lastErrorHash = ""' \
  .plan/{branch}/errors.json > .plan/{branch}/errors.json.tmp && \
  mv .plan/{branch}/errors.json.tmp .plan/{branch}/errors.json
```
