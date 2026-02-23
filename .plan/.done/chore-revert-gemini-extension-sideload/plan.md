# Plan: Revert Gemini Extension Sideload Attempt

## Context

The `feat/setup-gemini-manifests` branch attempted to make ccplugins work as both Claude Code plugins and Gemini CLI extensions. The approach was abandoned due to schema divergences in commands, hooks, and skills.

## Tasks

- [x] Create chore branch from main
- [x] Write ADR 070 documenting the decision to abandon dual-support
- [x] Add backlog item (in-progress)
- [x] Delete local feature branch
- [x] Delete remote feature branch (was never pushed)
- [x] Drop obsolete stash
- [x] Mark backlog item complete

## Lessons Learned (from feat/setup-gemini-manifests)

1. **Schema validation errors**: Gemini CLI agent validation differs from Claude Code. Extensions linked with validation errors suppressed (`2>/dev/null`).

2. **Hooks incompatibility**: `hooks/hooks.json` has different schemas between CLIs. Cannot safely share.

3. **TOML wrappers work but add overhead**: Every `.md` command needed a `.toml` sidecar. Maintenance burden grows linearly.

4. **MCP configs port cleanly**: The `mcpServers` block in `gemini-extension.json` mirrors Claude Code's `.mcp.json` well.

5. **Context sharing works**: Setting `contextFileName: "CLAUDE.md"` allows reuse of existing context files.

## Decision

Maintain separate repositories. Port manually. Accept the tradeoff of parallel maintenance for the safety of not breaking Claude Code users.
