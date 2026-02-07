# Refactor: Document CRXJS Hot Reload Limitations

## Problem Statement

The `/pro:scaffold.chrome-extension` scaffold generates a Chrome extension project with Vite+CRXJS hot reload, but the documentation doesn't explain:

1. **What actually happens in practice** - Hot reload is not as seamless as advertised
2. **When you need to reload what** - Different change types require different reload strategies
3. **When to completely remove/re-add the extension** - Some changes require a full reinstall

This causes developers to chase their tails debugging code when the real issue is stale extension state.

## Related ADRs

- **ADR-044**: Chrome Extension Developer Skill - Contains expertise for extension development but focuses on CWS publishing, not local dev workflow
- **ADR-066**: Scaffold Command Namespace Pattern - Defines how `/pro:scaffold.chrome-extension` works

## Scope

Add a new documentation file to the scaffold template that explicitly documents the hot reload limitations. Also update the chrome-extension skill with this knowledge.

## Implementation Plan

### 1. Create `docs/DEVELOPMENT.md` in scaffold template

New file at `pro/commands/_templates/chrome-extension/docs/DEVELOPMENT.md` containing:

- **Hot Reload Reality Check** - What Vite+CRXJS actually provides vs expectations
- **Reload Matrix** - What changed → What to reload
- **Workflow Recommendations** - Practical tips for efficient development

### 2. Update scaffold command step 6 (Next Steps)

Add reference to `docs/DEVELOPMENT.md` in the success message shown to users.

### 3. Update chrome-extension skill

Add a "Local Development" section to `pro/skills/chrome-extension/SKILL.md` with the reload matrix and debugging tips.

## Reload Matrix (Content)

| What Changed | Required Action |
|--------------|-----------------|
| Content script CSS | Page refresh |
| Content script JS (logic only) | Page refresh |
| Content script (new file added) | Extension reload |
| Popup HTML/CSS/JS | Close and reopen popup |
| Service worker (event listeners) | Extension reload |
| Service worker (code paths that are cached) | Extension reload |
| manifest.json (permissions) | Extension remove + re-add |
| manifest.json (content_scripts patterns) | Extension remove + re-add |
| manifest.json (service_worker path) | Extension remove + re-add |
| New file references in manifest | Extension remove + re-add |

### Why Some Changes Require Full Reinstall

Chrome caches certain manifest properties at install time. These include:
- Permission grants
- Content script match patterns
- Service worker registration

Reloading the extension re-reads the manifest but doesn't re-register these properties. Only a full remove/re-add does.

## Testing

- Verify the new docs file is included when running `/pro:scaffold.chrome-extension` in greenfield mode
- Verify the skill provides correct guidance when asked about reload issues

## Files to Change

1. `pro/commands/_templates/chrome-extension/docs/DEVELOPMENT.md` (new)
2. `pro/commands/scaffold.chrome-extension.md` (update step 6)
3. `pro/skills/chrome-extension/SKILL.md` (add local dev section)
