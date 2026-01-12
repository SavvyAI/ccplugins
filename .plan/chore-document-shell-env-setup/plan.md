# Chore: Document Shell Environment Setup for Optional MCP Servers

**Branch:** chore/document-shell-env-setup
**Created:** 2026-01-11

## Scope

Update pro/readme.md to document the correct shell configuration for optional MCP servers:

1. **GITHUB_TOKEN** - Required for shadcn-ui MCP (higher rate limits)
2. **SUPABASE_SERVICE_ROLE_KEY** - Dynamically extracted from running local Supabase

## Current State

README lines 149-167 have partial documentation with a simpler extraction that doesn't handle edge cases.

## Proposed Changes

### Section: Shell Configuration (new section after "Bundled MCP Servers")

Add instructions for adding to `.zshrc` or `.bashrc`:

```bash
# GitHub token for shadcn-ui MCP (optional, increases rate limit from 60 to 5000/hr)
export GITHUB_TOKEN='ghp_your_token_here'

# Supabase env vars from running local instance (auto-exports when supabase is running)
out="$(supabase status --output env 2>/dev/null)"; \
  echo "$out" | grep -q '^Stopped services:' && true || \
  eval "$(echo "$out" | grep -E '^[A-Z_][A-Z0-9_]*=' | sed 's/^SERVICE_ROLE_KEY=/SUPABASE_SERVICE_ROLE_KEY=/' | sed 's/^/export /')"
```

### Update Existing Sections

- Supabase Setup (line 149): Reference the shell config section instead of inline command
- shadcn-ui Setup (line 160): Reference the shell config section

## Implementation Steps

1. Create new "Shell Configuration" section after line 109 (after MCP server table)
2. Update Supabase Setup section to reference new section
3. Update shadcn-ui Setup section to reference new section
4. Bump version to 1.36.2

