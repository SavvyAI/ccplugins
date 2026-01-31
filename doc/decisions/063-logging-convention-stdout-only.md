# 063. Logging Convention: stdout/stderr Only

Date: 2026-01-31

## Status

Accepted

## Context

When AI agents debug applications, a common failure mode emerges:

1. A bug is reported
2. The agent asks: "Do you want me to run the program?"
3. The correct response is almost always: **No. Read the logs.**

This breaks down when:

- Logs are stored in ad-hoc, app-specific locations
- Paths vary per project
- Agents have no stable assumption about log placement
- Each session requires re-teaching where logs live
- Agents re-run programs just to observe output

The goal is to make logs first-class artifacts for both humans and agents, separating execution from diagnosis.

## Decision

**Applications write to stdout/stderr only. The shell or runtime owns persistence, rotation, and retention.**

No application-level file logging by default.

### Contract

**Application responsibilities:**
- Write only to stdout/stderr
- Do not know where logs are stored
- Do not persist, rotate, or retain logs
- Do not introduce logging libraries by default

**Runtime/Operator responsibilities:**
- Own persistence
- Own rotation and retention
- Decide storage backend
- May use tee, systemd, journald, containers, or equivalent

### Canonical Log Location (XDG-compliant)

When persistence is required, the runtime writes logs to:

```
${XDG_STATE_HOME:-$HOME/.local/state}/<app-name>/<app-name>.log
```

**Explicitly disallowed:**
- `~/.<app-name>/`
- Hardcoded log paths in application code
- Application-created dot directories

### Canonical Dev/Operator Pattern

```bash
mkdir -p ${XDG_STATE_HOME:-$HOME/.local/state}/<app-name>

stdbuf -oL -eL <command> 2>&1 \
  | tee -a ${XDG_STATE_HOME:-$HOME/.local/state}/<app-name>/<app-name>.log
```

*macOS note: GNU coreutils required (`brew install coreutils`).*

### Exit Criteria (When This Rule May Be Broken)

Application-level file logging is permitted only if ALL are true:
- Structured logs are required for ingestion **now**
- Logs must survive environments without runtime control
- The storage backend is explicitly documented

Until then: stdout and stderr only.

## Consequences

### Positive

- **Agents debug without executing code** — Logs are artifacts, not live output
- **Agents know where to look** — Single canonical XDG location eliminates per-session teaching
- **Execution remains under user control** — Agents inspect artifacts while users control execution
- **Logs become durable debugging artifacts** — Survive crashes, restarts, and async analysis

### Negative

- **Requires runtime cooperation** — Applications alone cannot ensure persistence
- **macOS friction** — GNU coreutils needed for `stdbuf`
- **Breaking change for some patterns** — Existing file-logging code must be migrated

## Agent Expectations (Normative)

When debugging or responding to bug reports:

1. **Do not ask to run the program** if logs are available
2. **Assume logs exist** at the canonical XDG location
3. **Request log excerpts or files**, not execution permission
4. **Treat logs as authoritative artifacts**

Agents reason from logs first. Execution is a last resort.

## Violations (What Must Not Be Generated)

The following are incorrect:
- Writing logs directly to files in application code
- Creating `~/.<app-name>/` directories
- Hardcoding log paths
- Asking the user to rerun a program solely to inspect output
- Introducing logging libraries "just in case"

## Related Decisions

- **ADR-011: Command-First CLI Pattern for npx dev** — Prior art: `npx dev` already uses `.dev/log/` for server logs, demonstrating this pattern in practice
- **ADR-059: Structured Error Logging with 3-Strike Protocol** — Complementary: handles error *storage* for session resumption, while this ADR handles log *output* convention

## Enforcement

Pro plugin commands (`/pro:bug`, `/pro:feature`, and related) reference this ADR. When generating or modifying code:
- Default to stdout/stderr-only logging
- Reject hardcoded paths
- Reject dot-directory logging
- Escalate only if exit criteria are explicitly met
