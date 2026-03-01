# 071. Clip Plugin - Content Capture Primitive

Date: 2026-02-28

## Status

Accepted

## Context

We needed a way to extract web content (articles, threads, discussions) and copy to clipboard for archiving. The primary workflow is saving articles to GitHub Gists as readme.md files. Manual copy-paste paragraph by paragraph is tedious and often results in lost formatting, broken links, and missing structure.

Key requirements:
1. Source-agnostic: Same command should work for articles, threads, images
2. Clipboard destination: Output always goes to clipboard
3. Hierarchical transformations: Base content + derived artifacts (summary, headline, etc.)
4. No arguments: Explicit skills only (harness-safe)

## Decision

We created a new `clip` plugin with a hierarchical skill structure:

```
clip/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── content/SKILL.md           → /clip:content
│   ├── content.headline/SKILL.md  → /clip:content.headline
│   ├── content.summary/SKILL.md   → /clip:content.summary
│   ├── content.usecases/SKILL.md  → /clip:content.usecases
│   ├── content.sentiment/SKILL.md → /clip:content.sentiment
│   └── content.screenshot/SKILL.md → /clip:content.screenshot
└── readme.md
```

### Naming Convention

Skills use dot notation to express hierarchy:
- `content` = canonical root object (normalized markdown)
- `content.{artifact}` = derived view of content

This creates a grammar: `/clip:{object}.{artifact}`

### Skill Responsibilities

| Skill | Output |
|-------|--------|
| `content` | Normalized markdown (source-agnostic) |
| `content.headline` | Single cohesive title |
| `content.summary` | Condensed abstraction |
| `content.usecases` | Opportunity extraction |
| `content.sentiment` | Tone analysis |
| `content.screenshot` | Visual capture (PNG) |

### Content Detection

`/clip:content` detects content type from URL patterns:
- `x.com/*`, `twitter.com/*` → Thread
- `medium.com/*`, `substack.com/*` → Article
- `news.ycombinator.com/item*` → Discussion
- Image URLs → Base64
- Fallback → Generic article extraction

## Consequences

### Positive

- **Source-agnostic**: Same skills work for any URL type
- **Artifact-oriented naming**: Skills describe output, not process
- **Extensible**: Easy to add `content.entities`, `content.audio` later
- **Harness-safe**: No argument flags, explicit skills only
- **Composable**: Derived artifacts build on canonical `content`

### Negative

- **Multiple skills to maintain**: 6 initial skills
- **Playwright dependency**: Requires browser automation MCP
- **macOS-only clipboard**: Uses `pbcopy`

## Alternatives Considered

### 1. Flat namespace (`/clip:extract`, `/clip:summary`)

Rejected because:
- `extract` doesn't differentiate (all skills extract)
- Loses the hierarchical relationship
- Harder to reason about derived artifacts

### 2. Argument-based (`/clip:content --mode=summary`)

Rejected because:
- Can't guarantee harness support for arguments
- Explicit skills are more discoverable
- Follows existing plugin patterns

### 3. Source-specific commands (`/clip:web`, `/clip:thread`)

Rejected because:
- URL already implies source
- Redundant naming
- Harder to maintain consistency

### 4. Hybrid plugin + personal skill

Rejected because:
- Splits logic across locations
- Creates maintenance drift
- Plugin-only is more portable

## Related

- ADR-014: Skills Directory for Bundled Agent Skills
- ADR-026: Subagent-Skill Dual Architecture (clip is skill-only)
- Planning: `.plan/feat-add-article-extraction-skill/`
- Backlog #106: Add clip plugin for content extraction
