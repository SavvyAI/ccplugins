---
name: supabase-local
description: Default to local Supabase when a project has supabase/config.toml. Use when encountering Supabase-related work to detect local configuration and prefer it over remote MCP tools. Provides local-first decision tree with port discovery and environment variable extraction.
---

# Default to Local Supabase

Automatically detect and prefer local Supabase instances over remote MCP tools when a project has local Supabase configuration.

## Core Principle

> When `supabase/config.toml` exists, this is a local Supabase project. Use `supabase` CLI, not remote MCP tools.

## When This Skill Activates

This skill applies whenever you encounter Supabase-related work:

| Trigger | Example |
|---------|---------|
| Deploying edge functions | `supabase functions deploy` |
| Querying the database | SQL operations, migrations |
| Managing migrations | `supabase migration`, schema changes |
| Checking Supabase status | Service health, URL discovery |
| Referencing Supabase URLs/keys in source | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `.env` files |
| Using Supabase MCP tools | Before calling `list_projects`, `execute_sql`, etc. |
| Setting up environment variables | `.env.local`, `.env.development` |

## Local-First Decision Tree

### Step 1: Check for Local Configuration

```bash
test -f supabase/config.toml && echo "LOCAL" || echo "REMOTE"
```

### Step 2a: LOCAL - Use Local Supabase

When `supabase/config.toml` exists:

1. **Check if running:**

   ```bash
   supabase status 2>/dev/null
   ```

2. **If running** - use it directly:
   - Read ports, keys, and URLs from `supabase status` output
   - Use `supabase` CLI for all operations
   - **NEVER** call `mcp__plugin_pro_supabase__list_projects` or ask "which remote project?"

3. **If NOT running** - tell the user and ask permission:
   - Say: "Local Supabase is configured but not running."
   - Ask: "Should I start it with `supabase start`?"
   - **Do NOT start without permission** (requires Docker, may take time)

4. **If start fails** - diagnose:
   - Check Docker: `docker info > /dev/null 2>&1`
   - Check port conflicts: `docker ps --format "{{.Names}}\t{{.Ports}}" | grep supabase`
   - Suggest remediation (start Docker, resolve port conflict, run `/pro:supabase.local`)

### Step 2b: REMOTE - Fall Through to MCP Tools

When `supabase/config.toml` does NOT exist:

- Use remote Supabase MCP tools as normal (`list_projects`, `execute_sql`, etc.)
- This skill does not apply

## Port Discovery

**Never assume default ports.** Projects use project-scoped port ranges per ADR-009.

Read ports from `supabase status` output:

```bash
supabase status
```

The output includes lines like:

```
API URL: http://127.0.0.1:56321
GraphQL URL: http://127.0.0.1:56321/graphql/v1
S3 Storage URL: http://127.0.0.1:56321/storage/v1/s3
DB URL: postgresql://postgres:postgres@127.0.0.1:56322/postgres
Studio URL: http://127.0.0.1:56323
Inbucket URL: http://127.0.0.1:56324
```

Parse the actual ports from this output. Do not hardcode `54321`, `54322`, etc.

Alternatively, read from `supabase/config.toml`:

```bash
grep -E '^\s*port\s*=' supabase/config.toml
```

## Environment Variable Extraction

When source code references Supabase environment variables, extract them from the running instance:

```bash
supabase status --output env
```

This outputs variables like:

```
ANON_KEY=eyJ...
SERVICE_ROLE_KEY=eyJ...
API_URL=http://127.0.0.1:56321
```

Use these values to populate `.env.local` or provide to the user. Never use remote project keys when a local instance is running.

## What NOT To Do

### When Local Config Exists

- Do NOT call `mcp__plugin_pro_supabase__list_projects`
- Do NOT ask "Which Supabase project should I use?"
- Do NOT use remote project URLs or keys
- Do NOT assume default ports (543xx) - read actual ports from status/config

### When Local Config Does NOT Exist

- Do NOT suggest running `supabase init` unprompted
- Do NOT block on local detection - fall through to remote tools immediately

## Integration Points

- **`/pro:supabase.local` command**: For setup, initialization, and port configuration of new local instances
- **ADR-009**: Port range allocation strategy (543xx → 553xx → 563xx per project)
