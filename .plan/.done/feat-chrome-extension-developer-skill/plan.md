# Chrome Extension Developer Skill

## Summary

Create a skill (+ subagent for proactive invocation) that codifies Chrome extension development knowledge. Based on learnings from building "Conversation Titles for ChatGPT" extension.

## Requirements

### Scope

| Category | Included |
|----------|----------|
| Manifest V3 patterns | Service workers, permissions model, content scripts |
| Chrome Web Store publishing | Lifecycle states, URLs, API status checking |
| Testing & debugging | DevTools, common pitfalls, verification strategies |
| Project structure | File organization, TypeScript setup guidance |

### Architecture

Per ADR-026 (Subagent-Skill Dual Architecture):
- **Skill** (`pro/skills/chrome-extension/SKILL.md`) - Detailed knowledge
- **Subagent** (`pro/agents/chrome-extension.md`) - Proactive detection

### Design Principles

1. **No hardcoded templates** - Focus on patterns and decision frameworks
2. **No rot risk** - Avoid version-specific code that will become outdated
3. **Context7 for docs** - Reference official docs for current APIs

## Implementation Steps

### Phase 1: Skill Definition

1. Create `pro/skills/chrome-extension/SKILL.md` with:
   - YAML frontmatter (name, description)
   - Chrome Web Store lifecycle documentation (your provided notes)
   - URL patterns (developer console vs public listing)
   - API status checking workflow with OAuth flow
   - Common gotchas section
   - Pre-flight checks before publishing
   - Required credentials reference

### Phase 2: Subagent Definition

2. Create `pro/agents/chrome-extension.md` with:
   - Proactive trigger conditions (manifest.json detection, Chrome Web Store URLs)
   - Reference to skill via `skills:` frontmatter
   - Detection patterns for extension projects
   - Lightweight prompt focused on when to invoke

### Phase 3: Manifest V3 Patterns

3. Add to skill (patterns only, no templates):
   - Service worker vs background page decision framework
   - Content script injection strategies (when to use each)
   - Permission declaration principles (minimal permissions philosophy)
   - Message passing patterns (service worker ↔ content script ↔ popup)

### Phase 4: Testing & Debugging

4. Add to skill:
   - DevTools debugging workflow (extension page, service worker panel)
   - Common error patterns and solutions
   - Testing strategies (load unpacked, refresh workflow)
   - Service worker lifecycle gotchas (sleep/wake, event page vs persistent)

## Files to Create

```
pro/
├── skills/
│   └── chrome-extension/
│       └── SKILL.md       # Main skill definition (~300 lines)
└── agents/
    └── chrome-extension.md # Proactive subagent (~50 lines)
```

## Skill Content Outline

### 1. Trigger Section
- When to use: Chrome Web Store publishing, extension status, manifest.json work

### 2. Chrome Web Store Extension Lifecycle
- State table: Draft → Pending review → Published → Rejected
- State transitions and what each means

### 3. Chrome Web Store URLs
- Developer Console URL (always works for owner)
- Extension Edit Page URL (always works for owner)
- Public Store Listing URL (ONLY when published)
- **Critical gotcha**: Public URL returns "Item not available" if not published

### 4. Pre-flight Checks
- OAuth token acquisition
- Status API query
- Response field interpretation (`crxVersion`, `uploadState`, `itemError`)

### 5. Common Gotchas (from your notes)
- "Public listing URL doesn't work" → Check status first
- "Says published but listing still fails" → Propagation delay
- Version confusion (crxVersion vs draft)
- Review rejection troubleshooting

### 6. Required Credentials
- EXTENSION_ID, PUBLISHER_ID, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN
- Where to find each

### 7. Tools Reference
- chrome-webstore-upload-cli
- Developer Console web UI

### 8. Manifest V3 Patterns
- Service worker decision framework
- Permissions philosophy (request minimal)
- Content script patterns

### 9. Testing & Debugging
- Load unpacked workflow
- Service worker debugging in DevTools
- Common runtime errors

## Success Criteria

- [ ] Skill auto-invoked when working with Chrome extension code
- [ ] Subagent detects extension projects proactively
- [ ] Chrome Web Store status API workflow documented
- [ ] Common gotchas prevent repeated mistakes
- [ ] No hardcoded version-specific content that can rot

## Related

- ADR-014: Skills Directory for Bundled Agent Skills
- ADR-026: Subagent-Skill Dual Architecture for Proactive Features
- ADR-044: Chrome Extension Developer Skill
- User notes: Chrome extension learnings from "Conversation Titles for ChatGPT"
