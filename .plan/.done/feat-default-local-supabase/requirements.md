# Default to Local Supabase

## Problem Statement

When Claude encounters Supabase-related work in a project with `supabase/config.toml`, it defaults to listing remote Supabase projects via MCP tools and asks "which project should I use?" This is the wrong behavior for local Supabase projects, adding unnecessary friction and risking operations against the wrong (remote) database.

## Solution

A behavioral skill that auto-activates on Supabase-related work and enforces a local-first decision tree. The skill detects `supabase/config.toml`, checks local instance state, and uses it directly. Remote MCP tools are only used when no local configuration exists.

## Decision Tree

```
Supabase-related work detected
        |
        v
+---------------------+
| config.toml exists? |
+----------+----------+
           |
    +------+------+
    | YES         | NO
    v             v
+--------+    +----------------+
| LOCAL  |    | REMOTE         |
| path   |    | Fall through   |
+---+----+    | to MCP tools   |
    |         +----------------+
    v
+-----------------+
| Is it running?  |
| (supabase       |
|  status)        |
+--------+--------+
         |
  +------+------+
  | YES         | NO
  v             v
+--------+  +------------------+
| USE IT |  | Ask permission   |
| Read   |  | to start         |
| ports/ |  | (supabase start) |
| keys   |  +------------------+
+--------+
```

## Key Behaviors

1. **Detection**: Check `supabase/config.toml` before any Supabase MCP tool call
2. **Port discovery**: Read actual ports from `supabase status` or `config.toml`, never assume defaults
3. **Environment extraction**: Use `supabase status --output env` for keys and URLs
4. **No remote fallback when local exists**: Never call `list_projects` when `config.toml` is present
5. **Permission required to start**: If configured but not running, ask before starting

## Acceptance Criteria

- [ ] Skill activates on Supabase-related triggers (DB queries, migrations, edge functions, env vars)
- [ ] Detects `supabase/config.toml` before reaching for remote MCP tools
- [ ] Reads actual ports from running instance (respects ADR-009 project-scoped ranges)
- [ ] Extracts environment variables from local instance
- [ ] Never asks "which remote project?" when local config exists
- [ ] Falls through to remote MCP tools when no local config exists (no regression)
- [ ] Asks permission before starting a stopped local instance
- [ ] Diagnoses startup failures (Docker not running, port conflicts)
- [ ] ADR-062 documents the decision

## Related ADRs

- [ADR-062: Default to Local Supabase Skill](../../doc/decisions/062-default-local-supabase-skill.md)
