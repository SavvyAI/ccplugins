# Clip Plugin

Content capture primitive - extract and transform web content to clipboard.

## Installation

```bash
/plugin marketplace add SavvyAI/ccplugins
/plugin install clip@ccplugins
```

## What This Plugin Provides

The `clip` plugin is a content capture primitive. Every skill:
- Takes a URL as input
- Processes the content (extraction, transformation, or capture)
- Copies the result to clipboard

## Skills

| Skill | Description |
|-------|-------------|
| `/clip:content` | Extract full content as normalized markdown |
| `/clip:content.headline` | Generate a single cohesive headline |
| `/clip:content.summary` | Create a condensed summary |
| `/clip:content.usecases` | Extract use-cases and opportunities |
| `/clip:content.sentiment` | Analyze tone and sentiment |
| `/clip:content.screenshot` | Capture visual screenshot |

## Usage

```bash
# Extract full article/thread to clipboard
/clip:content https://example.com/article

# Generate a headline
/clip:content.headline https://news.ycombinator.com/item?id=12345

# Summarize content
/clip:content.summary https://medium.com/@author/long-article

# Extract use-cases from a discussion
/clip:content.usecases https://news.ycombinator.com/item?id=12345

# Analyze sentiment
/clip:content.sentiment https://x.com/user/status/123

# Take a screenshot
/clip:content.screenshot https://example.com/page
```

## Design Principles

### Source-Agnostic

The same skill works for any content type:
- Articles (Medium, Substack, news sites)
- Threads (X/Twitter, Reddit, HN discussions)
- Images (returns base64)
- Documentation pages
- Gists

### Artifact-Oriented

Skills are named by what they produce, not how they work:
- `content` = the canonical normalized representation
- `headline` = a single title
- `summary` = a condensed abstraction
- `usecases` = opportunity extraction
- `sentiment` = tone analysis
- `screenshot` = visual capture

### Clipboard Destination

All skills output to clipboard via `pbcopy`. This enables workflows like:
- Paste into GitHub Gist as readme.md
- Paste into ChatGPT for further analysis
- Paste into notes app
- Save via Raycast clipboard manager

## Content Detection

`/clip:content` automatically detects content type from URL:

| URL Pattern | Detection |
|-------------|-----------|
| `x.com/*`, `twitter.com/*` | Thread/post |
| `medium.com/*`, `substack.com/*` | Article |
| `news.ycombinator.com/item*` | Discussion |
| `reddit.com/*/comments/*` | Thread |
| `github.com/*/gist/*` | Gist |
| `wikipedia.org/*` | Wiki article |
| Image URLs | Returns base64 |
| Fallback | Generic article extraction |

## Requirements

- Playwright MCP for browser automation (bundled with `pro` plugin)
- macOS (uses `pbcopy` for clipboard)

---

Part of [ccplugins](../readme.md)
