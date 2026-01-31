# 062. Default to Local Supabase Skill

Date: 2026-01-27

## Status

Accepted

## Context

When Claude encounters a project that uses Supabase, it defaults to listing remote Supabase projects via MCP tools (`list_projects`) and asking the user which one to use. This is wrong for projects that have a local Supabase instance configured via `supabase/config.toml`. The correct behavior is: detect local configuration, check if local Supabase is running, and use it. Only fall back to remote projects when no local configuration exists.

The existing `/pro:supabase.local` command handles setup and management (init, port config, start). What was missing is a behavioral skill that teaches Claude to always check local first before reaching for remote MCP tools. Per ADR-061, cross-cutting behavioral constraints belong in skills (composition), not CLAUDE.md (inheritance).

## Decision

Create a `supabase-local` skill in `pro/skills/supabase-local/SKILL.md` that auto-activates when Claude encounters Supabase-related work and enforces a local-first decision tree:

1. Check: does `supabase/config.toml` exist?
2. If YES: this is a local Supabase project - use `supabase` CLI, read ports from `supabase status`, never ask about remote projects
3. If NO: fall through to remote MCP tools as normal

The skill is detection-and-preference, not setup-and-management. It complements rather than replaces the `/pro:supabase.local` command.

## Consequences

**Positive:**
- Projects with local Supabase no longer get the "which remote project?" prompt
- Port discovery reads actual ports from running instance, respecting ADR-009 project-scoped ranges
- Environment variables (`ANON_KEY`, `SERVICE_ROLE_KEY`, `API_URL`) extracted from local instance
- Remote MCP tools remain fully functional when no local config exists
- Follows ADR-061 composition pattern: behavioral constraint is a skill, not a CLAUDE.md rule

**Negative:**
- Adds a detection step before every Supabase-related operation (lightweight: single file existence check)
- If local Supabase is configured but Docker is not available, user gets a diagnostic message instead of silent fallback to remote

## Alternatives Considered

1. **Add rule to CLAUDE.md**: Rejected per ADR-061. Creates action-at-a-distance; the constraint wouldn't be visible at the point of use.

2. **Modify the `/pro:supabase.local` command**: Rejected. The command is for setup/management. Detection-and-preference is a cross-cutting behavioral concern that applies across all contexts, not just when the user explicitly invokes a command.

3. **Patch individual MCP tool calls**: Rejected. Would require modifying behavior for each Supabase MCP tool independently, leading to duplication and drift.

## Related

- ADR-009: Supabase Port Range Allocation Strategy
- ADR-061: Composition Over Inheritance for Behavioral Constraints
- Command: `pro/commands/supabase.local.md`
- Skill: `pro/skills/supabase-local/SKILL.md`
