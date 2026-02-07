# Chore: Document Supabase Key Shell Configuration

**Branch:** chore/document-supabase-key-configuration
**Created:** 2026-02-07

## Summary

Update the pro/readme.md documentation to better explain SUPABASE_SERVICE_ROLE_KEY configuration. The current documentation shows a complex one-liner. The user has a cleaner, more maintainable approach using a dedicated zsh function with caching.

## Current State

### What the README says (lines 121-136):

```bash
# Supabase env vars from running local instance
out="$(supabase status --output env 2>/dev/null)"; \
  echo "$out" | grep -q '^Stopped services:' && true || \
  eval "$(echo "$out" | grep -E '^[A-Z_][A-Z0-9_]*=' | sed 's/^SERVICE_ROLE_KEY=/SUPABASE_SERVICE_ROLE_KEY=/' | sed 's/^/export /')"
```

**Issues with current approach:**
1. Runs `supabase status` on every shell startup (slow)
2. Complex one-liner that's hard to understand/modify
3. No caching mechanism
4. Doesn't explain what users should do if they have a different shell setup

### User's Approach (`~/.config/zsh/functions/supabase_key.zsh`):

```zsh
# Supabase service role key helper
_SUPABASE_KEY_CACHE="$HOME/.cache/supabase_service_role_key"

ensure_cache_dir() {
  mkdir -p "$(dirname "$_SUPABASE_KEY_CACHE")"
}

get_supabase_service_role_key() {
  ensure_cache_dir
  if [[ -f "$_SUPABASE_KEY_CACHE" ]]; then
    local age=$(( $(date +%s) - $(stat -f %m "$_SUPABASE_KEY_CACHE") ))
    if (( age < 3600 )); then
      export SUPABASE_SERVICE_ROLE_KEY="$(cat "$_SUPABASE_KEY_CACHE")"
      return
    fi
  fi
  local key
  key="$(supabase status --output json 2>/dev/null | jq -r '.SERVICE_ROLE_KEY // "EMPTY"')"
  echo "$key" > "$_SUPABASE_KEY_CACHE"
  export SUPABASE_SERVICE_ROLE_KEY="$key"
}

alias load_supabase_key="get_supabase_service_role_key"

autoload_supabase_key() {
  ensure_cache_dir
  if [[ -f "$_SUPABASE_KEY_CACHE" ]]; then
    export SUPABASE_SERVICE_ROLE_KEY="$(cat "$_SUPABASE_KEY_CACHE")"
  else
    export SUPABASE_SERVICE_ROLE_KEY=""
  fi
}
autoload_supabase_key
```

**Benefits:**
1. Caches the key to `~/.cache/supabase_service_role_key`
2. Only refreshes if cache is >1 hour old
3. Fast shell startup (just reads cache file)
4. Provides `load_supabase_key` alias to manually refresh
5. Clean separation of concerns (function file vs inline in .zshrc)

## Proposed Changes

### Update Shell Configuration Section

Replace the complex one-liner with:
1. A simple explanation of what's needed
2. Two options: quick (one-liner) and robust (function-based)
3. Clear guidance on adapting to other shells

### Proposed Structure

```markdown
### Shell Configuration (Optional MCP Servers)

Some MCP servers require environment variables. Add these to your shell config (`.zshrc` or `.bashrc`):

#### GitHub Token (for shadcn-ui MCP)

```bash
# Optional: increases rate limit from 60 to 5000/hr
export GITHUB_TOKEN='ghp_your_token_here'
```

#### Supabase Service Role Key

The Supabase MCP requires `SUPABASE_SERVICE_ROLE_KEY`. Choose one approach:

**Option A: Quick (runs on every shell startup)**

```bash
# Add to .zshrc or .bashrc
_set_supabase_key() {
  local out
  out="$(supabase status --output json 2>/dev/null)"
  [[ -n "$out" ]] && export SUPABASE_SERVICE_ROLE_KEY="$(echo "$out" | jq -r '.SERVICE_ROLE_KEY // empty')"
}
_set_supabase_key
```

**Option B: Cached (faster startup, refreshes hourly)**

Create a function file (e.g., `~/.config/zsh/functions/supabase_key.zsh`):

```bash
# Supabase service role key with caching
_SUPABASE_KEY_CACHE="$HOME/.cache/supabase_service_role_key"

load_supabase_key() {
  mkdir -p "$(dirname "$_SUPABASE_KEY_CACHE")"

  # Use cache if fresh (<1 hour)
  if [[ -f "$_SUPABASE_KEY_CACHE" ]]; then
    local age=$(( $(date +%s) - $(stat -f %m "$_SUPABASE_KEY_CACHE" 2>/dev/null || stat -c %Y "$_SUPABASE_KEY_CACHE" 2>/dev/null) ))
    if (( age < 3600 )); then
      export SUPABASE_SERVICE_ROLE_KEY="$(cat "$_SUPABASE_KEY_CACHE")"
      return
    fi
  fi

  # Refresh from supabase status
  local key
  key="$(supabase status --output json 2>/dev/null | jq -r '.SERVICE_ROLE_KEY // empty')"
  [[ -n "$key" ]] && echo "$key" > "$_SUPABASE_KEY_CACHE"
  export SUPABASE_SERVICE_ROLE_KEY="$key"
}

# Fast load from cache at startup
[[ -f "$_SUPABASE_KEY_CACHE" ]] && export SUPABASE_SERVICE_ROLE_KEY="$(cat "$_SUPABASE_KEY_CACHE")"
```

Then source it in your `.zshrc`:

```bash
source ~/.config/zsh/functions/supabase_key.zsh
```

Run `load_supabase_key` manually to refresh after starting a local Supabase instance.
```

## Implementation Steps

1. Update `pro/readme.md` lines 119-136 with the new structure
2. Keep both options (quick and cached) so users can choose
3. Make the cached version portable (handle both BSD and GNU stat)
4. Add note about running `load_supabase_key` after `supabase start`

## Decisions

- **Docs scope:** Single file approach (simpler for most users)
- **Default option:** Quick (Option A) first - simpler and works immediately

## Completed

- Updated `pro/readme.md` lines 119-186 with new shell configuration documentation
- Added two options for Supabase key setup: Quick (recommended) and Cached
- Made cached version portable (handles both BSD and GNU stat)
- Updated Supabase Setup section to reference `load_supabase_key` function
- Documentation is clear and users can adapt to their own shell configs
