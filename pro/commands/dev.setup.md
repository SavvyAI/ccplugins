---
description: "Need npx dev? → Sets up server management with auto port allocation → Copies bin files, configures package.json"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

# Setup npx dev Server Management

Sets up the `npx dev` infrastructure for managing local development servers with automatic port allocation.

## What Gets Installed

| Item | Location | Purpose |
|------|----------|---------|
| `dev.ts` | `bin/dev.ts` | Main CLI script |
| `notify.ts` | `bin/notify.ts` | Native OS notifications |
| `servers.json` | `.dev/servers.json` | Server configuration |
| `README.md` | `.dev/README.md` | Usage documentation |

## Status Indicators

- `[PASS]` - Check passed or step completed
- `[FAIL]` - Check failed (includes remediation)
- `[SKIP]` - Already exists or not needed
- `[WARN]` - Optional but recommended

---

## Phase 1: Prerequisites Check

### 1.1 Verify package.json Exists

```bash
test -f package.json && echo "exists" || echo "missing"
```

- If exists: `[PASS] package.json found`
- If missing: `[FAIL] No package.json - run npm init first`

### 1.2 Check for Existing Installation

Check if `bin/dev.ts` already exists:

```bash
test -f bin/dev.ts && echo "exists" || echo "missing"
```

If exists, use AskUserQuestion:
- Option 1: "Overwrite existing installation"
- Option 2: "Abort setup"

### 1.3 Check Node.js Version

```bash
node --version
```

Verify Node.js >= 18 (required for native fetch).

---

## Phase 2: Copy Bin Files

### 2.1 Create bin Directory

```bash
mkdir -p bin
```

### 2.2 Copy dev.ts

Read the bundled `dev.ts` from the plugin assets directory and write it to `bin/dev.ts`:

**Source:** `${PluginRoot}/commands/_bins/dev/dev.ts`
**Destination:** `${ProjectRoot}/bin/dev.ts`

Use the Read tool to get the content, then Write tool to create the file.

### 2.3 Copy notify.ts

**Source:** `${PluginRoot}/commands/_bins/dev/notify.ts`
**Destination:** `${ProjectRoot}/bin/notify.ts`

### 2.4 Set Executable Permission

```bash
chmod +x bin/dev.ts
```

Report: `[PASS] Copied bin/dev.ts and bin/notify.ts`

---

## Phase 3: Configure package.json

### 3.1 Read Current package.json

Use Read tool to get current `package.json` content.

### 3.2 Add bin Entry

Add or update the `bin` field:

```json
{
  "bin": {
    "dev": "./bin/dev.ts"
  }
}
```

If `bin` already exists, merge the `dev` entry.

### 3.3 Add Dependencies

Add to `dependencies`:
```json
{
  "node-notifier": "^10.0.1"
}
```

Add to `devDependencies`:
```json
{
  "tsx": "^4.20.6"
}
```

Use the Edit tool to make these updates to package.json.

Report: `[PASS] Updated package.json with bin entry and dependencies`

---

## Phase 4: Auto-Detect Servers

### 4.1 Find Available Port Range

Before assigning ports, select a **random** port from **high port ranges** to minimize conflicts. This is critical for users running multiple projects (20-40+) simultaneously.

> **Note:** The port scan uses `lsof` which is available on macOS and Linux. For Windows users with WSL, this works natively. Native Windows support would require an alternative approach using `netstat -ano`.

**Port Range Strategy:**

Use **random selection** from high port ranges that are unlikely to conflict:

| Range | Description |
|-------|-------------|
| 50000-58999 | Primary - ephemeral-adjacent, very rarely used by dev tools |
| 9000-9899 | Secondary - above common dev ports (3000, 4000, 5000, 8080) |

**CRITICAL:** Never use these commonly-conflicting ranges:
- 3000-3999 (React, Next.js, Express, Rails defaults)
- 4000-4999 (many dev tools)
- 5000-5999 (Flask, Docker, many tools)
- 8000-8099 (Django, many web servers)
- 8080 (common proxy port)

**Port Scan Algorithm:**

```bash
# Generate random starting points in high ranges
# Use /dev/urandom for better randomness
rand1=$(od -An -N2 -tu2 /dev/urandom | tr -d ' ')
rand2=$(od -An -N2 -tu2 /dev/urandom | tr -d ' ')

# Calculate random starting points within ranges
range1_start=$((50000 + (rand1 % 8900)))  # 50000-58899
range2_start=$((9000 + (rand2 % 800)))    # 9000-9799

# Function to check if a port range is free (base, base+10, base+20)
check_range_free() {
  local base=$1
  for offset in 0 10 20; do
    if lsof -i :$((base + offset)) >/dev/null 2>&1; then
      return 1
    fi
  done
  return 0
}

# Try primary range (50000+) first
basePort=""
for attempt in $(seq 0 10); do
  testPort=$((range1_start + attempt * 100))
  if check_range_free $testPort; then
    basePort=$testPort
    break
  fi
done

# If primary range unavailable, try secondary (9000+)
if [ -z "$basePort" ]; then
  for attempt in $(seq 0 10); do
    testPort=$((range2_start + attempt * 100))
    if check_range_free $testPort; then
      basePort=$testPort
      break
    fi
  done
fi

# Last resort: use a random high port
if [ -z "$basePort" ]; then
  basePort=$range1_start
fi
```

Store `basePort` for use in server configuration.

Report: `[PASS] Allocated port range starting at $basePort`

If using last resort: `[WARN] Could not verify port availability - allocated $basePort (verify with npx dev status)`

### 4.2 Parse package.json Scripts

Read the `scripts` field from package.json and detect development servers using **tight inclusion rules**.

**Include ONLY these specific patterns:**

| Script Name | Condition | Example |
|-------------|-----------|---------|
| `dev` | Exact match only | `"dev": "next dev"` |
| `start` | Only if command runs a dev server | `"start": "vite"` |
| `serve` | Exact match only | `"serve": "vite preview"` |
| `preview` | Exact match only | `"preview": "vite preview"` |
| Monorepo dev | Filter targeting app's dev script | `"dev:web": "pnpm --filter @org/web dev"` |

**Everything else is ignored.** No exclusion list needed.

Scripts like `db:studio`, `build`, `test`, `lint`, `migrate` are simply not matched by the inclusion rules above - they don't need explicit exclusion.

### 4.3 Generate servers.json with Smart Naming

**CRITICAL:** Never name a server `dev` - this creates confusing `npx dev dev` commands.

Create `.dev/servers.json` with detected servers using **smart naming** based on script content:

**Server Name Detection Rules:**

| Script Content Contains | Server Name |
|------------------------|-------------|
| `next`, `react`, `vue`, `nuxt`, `vite`, `webpack` | `web` |
| `api`, `express`, `fastify`, `hono`, `server` | `api` |
| `worker`, `job`, `queue`, `bull`, `agenda` | `worker` |
| `admin`, `dashboard` | `admin` |
| `docs`, `docusaurus`, `vitepress` | `docs` |
| `storybook` | `storybook` |
| Monorepo filter (e.g., `--filter @org/web`) | Use package name suffix (`web`) |
| Turborepo/nx with specific app | Use app name |
| None of the above | `app` (NOT `dev`) |

**Server Name Collision Handling:**

If multiple scripts resolve to the same name (e.g., two `web` servers):
1. Append numeric suffix: `web`, `web2`, `web3`
2. Or use the script name if it's not `dev`: e.g., `preview` stays as `preview`

**Example Transformations:**

| Script Name | Script Command | Server Name |
|-------------|----------------|-------------|
| `dev` | `next dev` | `web` |
| `dev` | `express ./server.js` | `api` |
| `start` | `vite` | `web` |
| `dev:web` | `pnpm --filter @app/web dev` | `web` |
| `dev:api` | `pnpm --filter @app/api dev` | `api` |
| `preview` | `vite preview` | `preview` |

Scripts like `db:studio`, `build`, `test`, `lint` simply don't match the inclusion rules - no special handling needed.

```json
{
  "<smart-name>": {
    "command": "<detected-package-manager> run <script-name> -- -p {PORT}",
    "preferredPort": <calculated>,
    "healthCheck": "http://localhost:{PORT}",
    "readyPattern": "<framework-specific-pattern>"
  }
}
```

**Port Assignment (using basePort from 4.1):**
- First server: `basePort` (random high port, e.g., 52847)
- Subsequent servers: increment by 10 (`basePort + 10`, `basePort + 20`, etc.)

### 4.4 Create .dev Directory Structure

```bash
mkdir -p .dev/log
```

### 4.5 Write servers.json

Use Write tool to create `.dev/servers.json`.

### 4.6 User Review

Display the generated configuration and ask if adjustments are needed:
- Show detected servers
- Show assigned ports
- Option to customize before proceeding

Report: `[PASS] Created .dev/servers.json with N server(s)`

---

## Phase 5: Update .gitignore

### 5.1 Check Current .gitignore

Read `.gitignore` if it exists.

### 5.2 Add Entries

**CRITICAL:** Add ONLY these specific patterns. Do NOT add `.dev/` as a catch-all.

The `.dev/` directory contains both:
- **Runtime files** (should be gitignored): `pid.json`, `log/`
- **Configuration files** (must be tracked): `servers.json`, `README.md`

Append these **exact entries** if not already present:

```
# npx dev runtime files (config files are tracked)
.dev/pid.json
.dev/log/
```

⚠️ **DO NOT add `.dev/` to .gitignore** - this would ignore the entire directory including `servers.json` which must be version controlled for team sharing.

Use Edit tool to append to `.gitignore`, or Write if it doesn't exist.

Report: `[PASS] Updated .gitignore (tracking .dev/servers.json, ignoring .dev/pid.json and .dev/log/)`

---

## Phase 6: Add Documentation

### 6.1 Create .dev/README.md

**Source:** `${PluginRoot}/commands/_bins/dev/README.template.md`
**Destination:** `${ProjectRoot}/.dev/README.md`

### 6.2 Update Project README.md

If `README.md` exists, append a "Development Servers" section:

```markdown
## Development Servers

This project uses `npx dev` for local server management. See [.dev/README.md](.dev/README.md) for details.

```bash
npx dev              # Start first server
npx dev status       # Show running servers
npx dev stop         # Stop all servers
```
```

Ask user before modifying the main README.

Report: `[PASS] Added documentation`

---

## Phase 7: Install Dependencies (Mandatory)

### 7.1 Detect Package Manager

Detect the project's package manager in this order of precedence:
1. `bun.lockb` exists → use `bun`
2. `pnpm-lock.yaml` exists → use `pnpm`
3. `yarn.lock` exists → use `yarn`
4. `package-lock.json` exists or default → use `npm`

### 7.2 Install Dependencies

**CRITICAL:** This step is **mandatory**, not optional. Without `tsx`, `npx dev` will fail on first run.

```bash
# Using detected package manager
<package-manager> install
```

Examples:
- `pnpm install`
- `npm install`
- `yarn install`
- `bun install`

### 7.3 Verify Installation

After installation, verify the critical dependency is available:

```bash
# Check that tsx is installed
npx tsx --version
```

If verification fails:
1. Report: `[FAIL] tsx not installed - attempting manual install`
2. Try explicit install: `<package-manager> add -D tsx`
3. If still fails: `[FAIL] Could not install tsx - run '<package-manager> add -D tsx' manually`

If verification succeeds:
- Report: `[PASS] Dependencies installed (tsx <version>)`

### 7.4 Ask About Optional Dependencies

After mandatory install, ask if user wants notifications:

Use AskUserQuestion:
- "Do you want native OS notifications when servers start/stop?"
  - Option 1: "Yes, install node-notifier" → run `<package-manager> add node-notifier`
  - Option 2: "No, skip notifications" → continue without

---

## Phase 8: Summary

Display final summary:

```
/pro:dev.setup Complete
────────────────────────────────────────

Created:
  bin/dev.ts          Main CLI script
  bin/notify.ts       Notification helper
  .dev/servers.json   Server configuration
  .dev/README.md      Usage documentation

Updated:
  package.json        Added bin entry and dependencies
  .gitignore          Ignoring .dev/pid.json and .dev/log/ (config tracked)
  README.md           Added development section

Detected Servers:
  web                 :52847  Next.js frontend
  api                 :52857  Express backend

Quick Start:
  npx dev             Start first server (web)
  npx dev api         Start API server
  npx dev status      Check running servers
  npx dev stop        Stop all servers

────────────────────────────────────────
```

**Note:** Port numbers shown are examples - actual ports are randomly allocated from high ranges (50000-58999 or 9000-9899) to minimize conflicts across projects.

---

## Error Handling

### No Server Scripts Detected

If no server-like scripts are found in package.json:

1. Analyze the project to determine the most likely server type:
   - Check for `next.config.*` → `web`
   - Check for `vite.config.*` → `web`
   - Check for `server.*` or `api/*` directories → `api`
   - Check for `worker.*` files → `worker`
   - Default fallback: `app` (**never** use `dev`)

2. Create a minimal `servers.json` template (using `basePort` from port scan):
```json
{
  "app": {
    "command": "<detected-package-manager> run dev -- -p {PORT}",
    "preferredPort": <basePort>,
    "healthCheck": "http://localhost:{PORT}"
  }
}
```

**CRITICAL:** The server name must NEVER be `dev` - use `app`, `web`, `api`, or another descriptive name based on project analysis.

3. Inform user: "No server scripts detected. Created template configuration with server name 'app' - customize `.dev/servers.json` as needed"

### Permission Errors

If file operations fail due to permissions:
1. Report specific error
2. Suggest: `chmod -R u+w .` or check file ownership
