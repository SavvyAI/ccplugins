# Bug: Plugin Manifest Config Errors

**Branch:** fix/plugin-manifest-config-errors
**Created:** 2026-01-10
**Severity:** High (degraded experience)

## Bug Details

| Field | Value |
|-------|-------|
| **Steps to Reproduce** | Open `/plugin` → Installed → select "pro" |
| **Expected** | Plugin loads without errors |
| **Actual** | 4 errors displayed |
| **Environment** | Darwin 25.1.0, plugin v1.36.0, main branch |

## Errors

### Error 1: Missing SUPABASE_SERVICE_ROLE_KEY
- **Location:** `.mcp.json` line 17
- **Type:** Configuration - optional MCP server
- **Assessment:** NOT a bug - user doesn't have env var set

### Error 2: Missing GITHUB_TOKEN
- **Location:** `.mcp.json` line 31
- **Type:** Configuration - optional MCP server
- **Assessment:** NOT a bug - user doesn't have env var set

### Error 3: Agents path not found
- **Location:** `plugin.json` line 13: `"agents": "./agents/*.md"`
- **Type:** Possible manifest bug OR Claude Code loader issue
- **Evidence:** Files DO exist at path in cache
- **Status:** NEEDS INVESTIGATION

### Error 4: Duplicate hooks file
- **Location:** `plugin.json` line 15: `"hooks": "./hooks/hooks.json"`
- **Error message:** "standard hooks/hooks.json is loaded automatically, so manifest.hooks should only reference additional hook files"
- **Type:** Manifest bug
- **Root cause:** Claude Code auto-loads `hooks/hooks.json` by convention; explicit declaration causes duplicate
- **Fix:** Remove `hooks` field from plugin.json

## Related ADRs

- ADR-038: TodoWrite Checkpoint Persistence - defines the hooks implementation
- ADR-026: Subagent-Skill Dual Architecture - defines agents directory usage

## Root Cause Analysis

### Error 3 Investigation
The error claims the path is not found, but files exist. Possible causes:
1. Glob pattern `*.md` not being resolved correctly
2. Path resolution issue in Claude Code plugin loader
3. Timing issue (checked before files were copied to cache)

### Error 4 Investigation
Claude Code has a convention to auto-load `hooks/hooks.json` when it exists. The manifest should NOT declare this path explicitly - only additional hook files should be listed.

## Fix Plan

### Fix 1: Remove `hooks` field from plugin.json (Error 4)
Claude Code auto-loads `hooks/hooks.json` by convention when that file exists. The explicit declaration in the manifest causes a duplicate load error.

**Change:**
```diff
- "hooks": "./hooks/hooks.json"
```
(Remove line entirely)

### Fix 2: Change agents path format (Error 3)
Per ADR-026, the agents field should be a directory path, not a glob pattern.

**Change:**
```diff
- "agents": "./agents/*.md"
+ "agents": "./agents/"
```

### Fix 3: Document optional MCP servers (Errors 1-2)
The supabase and shadcn-ui MCP servers require env vars that users may not have configured. This is expected behavior, not a bug. The README could document this, but the errors are informational - the plugin still works without these MCP servers.

**Status:** No code change needed. The errors are informative, not blocking.

## Verification Steps

After fixes:
1. Reinstall plugin from local source
2. Open `/plugin` → Installed → pro
3. Verify Error 3 (agents path) is gone
4. Verify Error 4 (duplicate hooks) is gone
5. Errors 1-2 (env vars) will remain if user hasn't set them - this is expected

## Changes Made

### pro/.claude-plugin/plugin.json
1. Changed `"agents": "./agents/*.md"` → `"agents": "./agents/"` (directory path per ADR-026)
2. Removed `"hooks": "./hooks/hooks.json"` (auto-loaded by convention)
3. Bumped version `1.36.0` → `1.36.1`

### Resolution for Errors 1-2 (env vars)
These are not bugs. The supabase and shadcn-ui MCP servers are optional and require env vars:
- `SUPABASE_SERVICE_ROLE_KEY` for Supabase MCP
- `GITHUB_TOKEN` for shadcn-ui MCP

Users who want to use these servers need to set the env vars. The plugin works without them.

