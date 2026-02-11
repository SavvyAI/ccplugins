# Feature: App Icon Agent Skill

## Branch
`feat/grab-app-icon-agent-skills`

## Summary
Add the App Icon skill from `code-with-beto/skills` repository to enable AI-powered app icon generation for iOS, macOS, and Android apps. Also create a `/pro:app.icon` command for user-invocable icon generation.

**Key modifications from original:**
- Removed SnapAI/OpenAI dependency
- Added support for ComfyUI (local), Gemini, and Grok backends
- Extended to support native macOS apps (not just Expo)
- Added macOS iconset generation for legacy compatibility

## Requirements

### 1. Bundle the App Icon Skill
- Copy the `app-icon` skill from the external repo
- Add proper attribution (source repo lacks explicit license - will note MIT based on README)
- Place in `pro/skills/app-icon/SKILL.md`

### 2. Create `/pro:app.icon` Command
- User-invocable slash command at `pro/commands/app.icon.md`
- Invokes the bundled skill workflow
- Context: User wants to use this immediately for "PDF Pages (Finder)" app

## ADR Compliance

### ADR-014: Skills Directory for Bundled Agent Skills
- ✅ Skills stored in `skills/` directory at plugin root
- ✅ Each skill has `SKILL.md` with YAML frontmatter
- ✅ Third-party skills include attribution in SKILL.md
- ✅ Note: Source repo lacks explicit LICENSE file; README states MIT

## Implementation Steps

1. Create `pro/skills/app-icon/SKILL.md` with:
   - YAML frontmatter (name, description)
   - Attribution comment pointing to source repo
   - Full skill content from source

2. Create `pro/commands/app.icon.md` with:
   - User-invocable command to generate app icons
   - Delegates to the bundled skill workflow

3. Verify skill is discoverable via plugin.json (already has `"skills": "./skills/"`)

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `pro/skills/app-icon/SKILL.md` | Create | Bundled skill definition |
| `pro/commands/app.icon.md` | Create | User-invokable command |

## Testing
- Verify skill YAML frontmatter is valid
- Verify command is listed in plugin
- Use immediately on "PDF Pages (Finder)" app project

## Notes
- Source: https://github.com/code-with-beto/skills/tree/main/plugins/cwb-app-icon
- Author: Beto (codewithbeto.dev)
- License: MIT (per README)
- Requires: SnapAI CLI (npx snapai), OpenAI API key (~$0.04/icon)
