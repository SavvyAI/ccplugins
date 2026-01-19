# Root Cause Analysis: dev.setup Port Defaults and Naming

## Bug Report Summary

When running `/pro:dev.setup`, three issues occur:

1. **Server naming**: Default server named `dev` causing `npx dev dev` confusion
2. **Port allocation**: Uses common ports (3000, 4000) causing conflicts
3. **Dependencies**: Not always installed, causing first-run failures

## Root Causes

### Issue 1: Hardcoded "dev" Server Name

**Location:** `pro/commands/dev.setup.md:354`

```json
{
  "dev": {
    "command": "npm run dev -- -p {PORT}",
    ...
  }
}
```

**Problem:** When no server scripts are detected, the fallback template uses `"dev"` as the server name. This creates a confusing UX where users must run `npx dev dev`.

**Fix:** Implement smart server naming based on detected script content:
- If script contains "next", "react", "vue", "web" → name it `web`
- If script contains "api", "server", "express", "fastify" → name it `api`
- If script contains "worker", "job", "queue" → name it `worker`
- If script contains "studio", "admin", "dashboard" → name it `admin`
- Fallback to `app` (not `dev`)

### Issue 2: Predictable Port Ranges

**Location:** `pro/commands/dev.setup.md:143-184`

Current algorithm:
```bash
# Sequential scan of commonly-used ranges
for port in $(seq 4000 4099); do ...
for port in $(seq 6000 6099); do ...
for port in $(seq 7000 7099); do ...
```

**Problem:**
1. Ranges 4000, 6000, 7000 are commonly used by dev tools
2. Sequential allocation means all projects cluster at the start of each range
3. With 20-40 projects, conflicts are inevitable

**Fix:** Use random selection from high port ranges:
1. **Primary ranges:** 50000-59999 (ephemeral-adjacent, rarely used)
2. **Secondary ranges:** 9000-9999 (above common dev ports)
3. **Random selection:** Pick a random starting point within the range, not sequential first-free
4. **Unique per-project:** Use project name hash to seed randomness for consistency

Algorithm:
```bash
# Generate random base from high ranges
range1_start=$((50000 + RANDOM % 9000))  # 50000-58999
range2_start=$((9000 + RANDOM % 900))    # 9000-9899

# Verify range is free (check base and base+10, base+20)
# Use first range that passes
```

### Issue 3: Optional Dependency Installation

**Location:** `pro/commands/dev.setup.md:299-308`

```markdown
### 7.1 Prompt to Install

Ask user if they want to run `npm install` now:
- Option 1: "Yes, install dependencies now"
- Option 2: "No, I'll install later"
```

**Problem:** If user declines or installation is skipped, `npx dev` fails because `tsx` isn't available.

**Fix:** Make dependency installation mandatory:
1. Remove the option to skip
2. Detect package manager (npm/pnpm/yarn/bun) and run appropriate install
3. Verify installation succeeded before completing setup

## Affected ADRs

- **ADR-012**: Dynamic Port Allocation at Setup Time - needs update for random high-range allocation
- **ADR-011**: Command-First CLI Pattern - confirms `npx dev dev` is bad UX

## Implementation Plan

1. Update `pro/commands/dev.setup.md`:
   - Phase 4.1: New random port allocation algorithm
   - Phase 4.3: Smart server naming based on script content
   - Phase 7: Make dependency installation mandatory

2. Create new ADR documenting the port range change

3. Update ADR-012 to reference the new approach

## Implementation Complete

### Changes Made to `pro/commands/dev.setup.md`

#### 1. Port Allocation (Phase 4.1) - Lines 137-213
- **Before:** Sequential scan of 4000-4099, 6000-6099, 7000-7099
- **After:** Random selection from high ranges:
  - Primary: 50000-58999 (ephemeral-adjacent)
  - Secondary: 9000-9899 (above common dev ports)
- Uses `/dev/urandom` for randomness
- Checks that base, base+10, base+20 are all free

#### 2. Smart Server Naming (Phase 4.3) - Lines 222-273
- **Before:** Used script name directly (e.g., `dev`)
- **After:** Detects server type from script content:
  | Content | Server Name |
  |---------|-------------|
  | next, react, vue | `web` |
  | api, express, fastify | `api` |
  | worker, job, queue | `worker` |
  | studio, drizzle-kit | `studio` |
  | fallback | `app` (never `dev`) |

#### 3. Fallback Naming (Error Handling) - Lines 445-471
- **Before:** Fallback template used `"dev"` as server name
- **After:** Analyzes project files and uses `app` as worst-case fallback

#### 4. Tight Inclusion Rules (Phase 4.2) - Lines 215-230
- **Before:** Broad inclusion (anything with `dev`, `start`, etc.) + long exclusion list
- **After:** Tight inclusion - only match these exact patterns:
  - `dev` (exact match)
  - `start` (only if it's a dev server command)
  - `serve`, `preview` (exact match)
  - Monorepo dev scripts (`dev:web`, `dev:api` with filters)
- No exclusion list needed - scripts like `db:studio` simply don't match

#### 5. Mandatory Dependencies (Phase 7) - Lines 355-404
- **Before:** Optional prompt to install deps
- **After:**
  - Detects package manager (bun/pnpm/yarn/npm)
  - Mandatory installation
  - Verifies tsx installed with `npx tsx --version`
  - Only node-notifier is optional (asked separately)
