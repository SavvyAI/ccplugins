# 044. Chrome Extension Developer Skill

Date: 2026-01-08

## Status

Accepted

## Context

While building and releasing the "Conversation Titles for ChatGPT" Chrome extension, we accumulated hard-won knowledge about Chrome Web Store publishing, extension lifecycle states, and common gotchas. This knowledge was at risk of being lost or forgotten for future extension projects.

Key learnings included:
- The public Chrome Web Store listing URL only works **after** an extension is published (not during draft or pending review states)
- The Chrome Web Store API v2 is the current standard (v1.1 deprecated, sunset October 2026)
- Publisher ID is now required in API calls
- Common confusion between `crxVersion` (live) and draft versions

We needed a way to codify this knowledge so it would be automatically available during future Chrome extension work.

## Decision

We will create a **Chrome Extension Developer skill** following the dual architecture pattern from ADR-026:

1. **Skill** (`pro/skills/chrome-extension/SKILL.md`) - Contains the detailed knowledge:
   - Chrome Web Store lifecycle states
   - URL patterns (developer console vs public listing)
   - API status checking workflow (V2 API)
   - Common gotchas
   - Manifest V3 patterns
   - Testing and debugging workflows

2. **Subagent** (`pro/agents/chrome-extension.md`) - Proactive detection:
   - Triggers when `manifest.json` with extension fields is detected
   - Triggers when Chrome Web Store URLs appear
   - Triggers when `chrome.*` API usage is detected

### Design Principles Applied

- **No hardcoded templates** - Only patterns and decision frameworks
- **No rot risk** - Avoid version-specific code; reference Context7 for current APIs
- **V2 API** - Updated to current Chrome Web Store API (not deprecated v1.1)

## Consequences

**Positive:**
- Extension development knowledge is preserved and automatically applied
- Common mistakes (like debugging URL format before checking publish status) are prevented
- Follows established skill/subagent architecture from ADR-026
- Knowledge is version-controlled and can be updated

**Negative:**
- Adds another skill/agent pair to maintain
- API examples may still become outdated (though we mitigated with deprecation notes and links to official docs)

**Neutral:**
- Pattern follows ADR-014 (skills directory) and ADR-026 (dual architecture)

## Alternatives Considered

### 1. CLAUDE.md rules only

Rejected because:
- Rules are global to the repo, not project-specific
- Would bloat CLAUDE.md with extension-specific content
- No proactive detection capability

### 2. Standalone command (`/pro:extension.publish`)

Rejected because:
- This is knowledge/expertise, not a workflow
- Skills are the correct pattern for "expert knowledge that Claude applies"
- Commands are for user-invoked workflows

### 3. Skill only (no subagent)

Rejected because:
- Per ADR-026, proactive behavior requires a subagent
- Without subagent, user would need to explicitly ask for extension help
- Detection of extension projects should be automatic

## Related

- ADR-014: Skills Directory for Bundled Agent Skills
- ADR-026: Subagent-Skill Dual Architecture for Proactive Features
- Planning: `.plan/.done/feat-chrome-extension-developer-skill/`
