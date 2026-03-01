# Feature: Add Clip Plugin for Content Extraction

**Branch:** `feat/add-article-extraction-skill`
**Created:** 2026-02-28

## Summary

Create a new `clip` plugin for extracting and transforming web content to clipboard. The plugin provides source-agnostic content capture with a hierarchical skill structure.

## Related ADRs

- **ADR-014**: Skills Directory for Bundled Agent Skills - establishes `skills/` directory pattern
- **ADR-026**: Subagent-Skill Dual Architecture - clarifies skill vs subagent distinction (this feature is skill-only, no proactive behavior needed)
- **ADR-066**: Scaffold Command Namespace Pattern - informs namespace design decisions

## Design Decisions

### Plugin Namespace: `clip`

The `clip` namespace represents a content capture primitive. All skills return output to clipboard.

### Skill Hierarchy: `content.*`

| Skill | Purpose | Output |
|-------|---------|--------|
| `/clip:content` | Canonical normalized representation | Markdown (articles, threads) or base64 (images) |
| `/clip:content.headline` | Single cohesive headline | Text |
| `/clip:content.summary` | Condensed abstraction | Markdown |
| `/clip:content.usecases` | Opportunity extraction | Markdown |
| `/clip:content.sentiment` | Tone analysis | Markdown |
| `/clip:content.screenshot` | Visual capture | Image data |

### Key Design Principles

1. **Source-agnostic**: Same command works for articles, threads, images
2. **Artifact-oriented**: Skills named by output, not process
3. **No arguments**: Explicit skills only (harness-safe)
4. **Clipboard destination**: Universal output target
5. **Runtime detection**: Skill detects content type from URL

### Rejected Alternatives

| Rejected | Reason |
|----------|--------|
| `/clip:extract` | All skills extract; not differentiating |
| `/clip:web` | URL implies web; redundant |
| `/clip:markdown` | All return markdown (except screenshot) |
| `/clip:audio` | No anchored use-case |
| Hybrid (personal + plugin) | Splits logic across locations |

## File Structure

```
clip/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── content/
│   │   └── SKILL.md
│   ├── content.headline/
│   │   └── SKILL.md
│   ├── content.summary/
│   │   └── SKILL.md
│   ├── content.usecases/
│   │   └── SKILL.md
│   ├── content.sentiment/
│   │   └── SKILL.md
│   └── content.screenshot/
│       └── SKILL.md
└── readme.md
```

## Implementation Steps

1. [ ] Create plugin directory structure
2. [ ] Create `plugin.json` manifest
3. [ ] Implement `/clip:content` skill (base extraction)
4. [ ] Implement `/clip:content.headline` skill
5. [ ] Implement `/clip:content.summary` skill
6. [ ] Implement `/clip:content.usecases` skill
7. [ ] Implement `/clip:content.sentiment` skill
8. [ ] Implement `/clip:content.screenshot` skill
9. [ ] Create `readme.md` documentation
10. [ ] Test locally with `claude --plugin-dir ./clip`
11. [ ] Create ADR documenting the clip plugin architecture

## Content Detection Strategy

The `/clip:content` skill should detect content type from URL patterns:

| URL Pattern | Detection | Extraction Strategy |
|-------------|-----------|---------------------|
| `x.com/*`, `twitter.com/*` | Thread/post | Wait for dynamic content, extract conversation |
| `medium.com/*`, `substack.com/*` | Article | Look for `.post-content`, `article` |
| `news.ycombinator.com/*` | Discussion | Extract comments hierarchy |
| `github.com/*/gist/*` | Gist | Extract raw markdown |
| `wikipedia.org/*` | Wiki article | Use `#mw-content-text` |
| Image URLs (`.png`, `.jpg`, etc.) | Image | Return base64 |
| `*` (fallback) | Article | Generic `<article>` or `<main>` extraction |

## Output Format

All skills output to clipboard via `pbcopy`. Format:

```markdown
# Article Title

**Published:** Date
**By:** [Author Name](author-url)

---

[Content with all formatting preserved]

---

*Tags/Categories if present*
```

## Dependencies

- Playwright MCP for browser automation
- `pbcopy` for clipboard (macOS)
