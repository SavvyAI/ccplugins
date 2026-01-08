# 042. npx dev port Command for Manual Port Management

Date: 2026-01-08

## Status

Accepted

## Context

After running `/pro:dev.setup` or `npx dev init`, the port in `.dev/servers.json` sometimes gets set to undesired values like 8080, 3000, or other common/conflicting ports. Users needed a way to:

1. View the current port configuration
2. Manually set a specific port
3. Auto-scan for the best available port

Previously, the only way to change ports was to manually edit `.dev/servers.json`.

## Decision

Add `npx dev port [server] [port|auto]` command with three modes:

1. **Show mode** (`npx dev port` or `npx dev port web`): Display current port configuration and running status
2. **Set mode** (`npx dev port web 4050`): Explicitly set a specific port
3. **Auto mode** (`npx dev port web auto`): Scan and assign the best available port

Port validation enforces the safe ranges established in ADR-012:
- Allowed: 4000-4099, 6000-6099, 7000-7099
- Rejected: Ports < 1024, and common ports (3000, 5000, 8000, 8080)

If the server is currently running when the port is changed, it will automatically restart on the new port.

## Consequences

**Positive:**
- Users can fix port issues without editing JSON files
- Port validation prevents common conflicts
- Auto-scan provides hands-off best-port selection
- Follows existing command-first CLI pattern from ADR-011

**Negative:**
- Adds another command to the CLI surface
- Port restrictions may frustrate users who want ports outside safe ranges

## Alternatives Considered

1. **Slash command only (`/pro:dev.portrange`)**: Rejected because this is a CLI tool operation, not a Claude Code workflow. Users should be able to run it directly from terminal.

2. **Interactive port selector**: Rejected as over-engineered for this use case. Direct command is faster.

3. **Modify init to always auto-scan**: Rejected because init already has its own logic, and some users may want specific ports.

## Related

- ADR-011: Command-First CLI Pattern for npx dev
- ADR-012: Dynamic Port Allocation at Setup Time
- Planning: `.plan/.done/feat-npx-dev-port-command/`
