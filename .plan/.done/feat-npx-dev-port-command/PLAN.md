# Plan: npx dev port command

## Problem Statement

After running `/pro:dev.setup` or `npx dev init`, the port in `.dev/servers.json` sometimes gets set to undesired values like 8080, 3000, or other common/conflicting ports. Users need a way to manually force a port change without editing JSON by hand.

## Relevant ADRs

- **ADR-012: Dynamic Port Allocation at Setup Time** - Establishes the port scan strategy (4000-4099, 6000-6099, 7000-7099)
- **ADR-011: Command-First CLI Pattern for npx dev** - Commands follow `npx dev <command> [name]` pattern

## Requirements

### Command Syntax

```bash
npx dev port [server] [port|auto]
```

### Behavior

1. **Show current port**: `npx dev port` or `npx dev port web`
   - Displays configured port for the server
   - Shows if running port differs from config
   - Uses first server if no name specified

2. **Set specific port**: `npx dev port web 4500`
   - Validates port is in safe range (4000-4099, 6000-6099, 7000-7099)
   - Rejects low/common ports (< 4000, 3000, 5000, 8000, 8080)
   - Checks port availability via `lsof`
   - Updates `preferredPort` in `.dev/servers.json`
   - If server is running, auto-restarts on new port

3. **Auto-scan**: `npx dev port web auto`
   - Scans for best available port using ADR-012 ranges
   - Uses priority: 4000-4099 → 6000-6099 → 7000-7099
   - Updates config and reports the assigned port

### Port Validation Rules

**Allowed ranges:**
- 4000-4099 (primary, clean range)
- 6000-6099 (fallback 1)
- 7000-7099 (fallback 2)

**Rejected ports:**
- All ports < 4000 (system/well-known)
- 5000 (Flask, macOS AirPlay)
- 8080 (common proxy/alt HTTP)
- 8000 (Django, Python HTTP)
- 3000 (React, Rails, Express)

### Example Usage

```bash
# Show current port (first server)
npx dev port
# → web:
# →   Configured port: 4000
# →   Status: not running

# Show current port for specific server
npx dev port web

# Auto-allocate best port for web server
npx dev port web auto
# → 🔍 Scanning for available port in safe ranges...
# → ✅ web port changed: 8080 → 4000

# Explicitly set port (must be in safe range)
npx dev port web 4050
# → ✅ web port changed: 4000 → 4050

# Error: port 3000 rejected (common port)
npx dev port web 3000
# → ❌ Port 3000 is a common/conflicting port.
# →    Use ports 4000-4099, 6000-6099, or 7000-7099.

# Error: port 80 rejected (low port)
npx dev port web 80
# → ❌ Port 80 requires elevated privileges.
# →    Use ports 4000-4099, 6000-6099, or 7000-7099.
```

## Implementation Steps

1. **Add `port` to COMMANDS array** (dev.ts:1010)
2. **Create `setPort()` function** with:
   - Server validation
   - Port validation (safe ranges only)
   - Port availability check via `lsof`
   - Auto-scan fallback when no port specified
   - Config file update
   - Auto-restart if server is running
3. **Update help text** to document new command
4. **Add case handler** in main switch statement

## Files Modified

| File | Change |
|------|--------|
| `pro/commands/_bins/dev/dev.ts` | Add `port` command implementation |
| `pro/commands/_bins/dev/README.template.md` | Document new command |

## Definition of Done

- [x] `npx dev port` shows current port for first server
- [x] `npx dev port web` shows current port for named server
- [x] `npx dev port web 4050` sets port and restarts if running
- [x] `npx dev port web auto` auto-scans and assigns best port
- [x] Low/common ports (< 4000, 3000, 5000, 8000, 8080) are rejected with clear error
- [x] Port availability is checked before assignment
- [x] Help text documents the command
- [x] Server auto-restarts on new port when already running

## Implementation Summary

Added `npx dev port [server] [port|auto]` command to dev.ts:

1. **Port validation constants** (lines 13-26):
   - `SAFE_PORT_RANGES`: 4000-4099, 6000-6099, 7000-7099
   - `REJECTED_PORTS`: 3000, 5000, 8000, 8080

2. **Helper functions** (lines 28-53):
   - `isPortInSafeRange()`: Validates port is in allowed ranges
   - `isPortAvailable()`: Checks port via lsof
   - `findSafePort()`: Auto-scans for next available port

3. **showPort() function** (lines 964-990):
   - Displays configured port for server
   - Shows running status and actual port if different

4. **setPort() function** (lines 992-1061):
   - Accepts number or 'auto' keyword
   - Validates range, rejects common ports, checks availability
   - 'auto' triggers scanning for best available
   - Updates servers.json
   - Auto-restarts if server is running

5. **CLI integration**:
   - Added `port` to COMMANDS array
   - Added `extraArg` to parseArguments for port/auto
   - Case handler: no arg → show, 'auto' → scan, number → set
   - Uses first server if no server name given
   - Updated help text with examples
