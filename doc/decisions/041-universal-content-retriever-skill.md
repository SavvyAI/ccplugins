# 041. Universal Content Retriever Skill

Date: 2026-01-07

## Status

Accepted

## Context

Claude's ability to retrieve external content is non-deterministic:

- Sometimes a URL resolves fully
- Sometimes partial metadata is inferred
- Sometimes access is blocked (JS required, auth walls, bot detection)
- Behavior varies across platforms (X, LinkedIn, YouTube, TikTok, Instagram, Pinterest, blogs)
- Same URL, different outcome depending on timing, context, or internal tool selection

This unpredictability breaks workflows, interrupts reasoning chains, and forces manual copy-paste fallbacks.

We needed a **reusable Claude Skill** that:
1. Reliably retrieves any public web content from a URL
2. Returns a normalized, structured representation
3. Is deterministic and cross-platform
4. Fails soft (never dead-ends)

## Decision

### Skill-Based Architecture

Implement as a **skill** (not a command) that Claude auto-invokes when URLs are detected in conversation. The skill follows ADR-014 (Skills Directory) and extends ADR-032 (Tiered Extraction Strategy).

### Three-Tier Retrieval Pipeline

Extends the pattern established in ADR-032:

```
Tier 1: WebFetch (fast, no auth)
  ↓ if blocked/rate-limited/JS-required
Tier 2: Playwright Browser Automation
  ↓ if still blocked (CAPTCHA, login wall)
Tier 3: User Paste Fallback
```

### Normalized Output Schema

Every retrieval produces a consistent `ContentObject` structure:

- `source_platform`: x | linkedin | youtube | tiktok | instagram | pinterest | blog
- `source_url`: original URL
- `author`, `author_handle`: content creator
- `primary_text`: main content body
- `media`: images, video, audio references
- `metadata`: engagement counts, tags, links
- `retrieval`: method used, confidence level, missing elements

### Silent by Default, Report on Deviation

**Design principle**: No news is good news.

- **Silent on success**: When Tier 1 works with high confidence, no output
- **Report on deviation**: Compact, factual notice when fallback used or content partial
- **Never dead-end**: Always provide actionable recovery path

### Platform-Aware Extraction

The skill recognizes platform-specific content types:

| Platform | Key Fields |
|----------|------------|
| X/Twitter | post text, author, thread context (full reply chain), media |
| LinkedIn | post body, author, engagement counts (likes, comments) |
| YouTube | title, description, **transcript** (via Playwright, graceful fallback) |
| TikTok | caption, hashtags, audio context |
| Instagram | caption, hashtags, media type |
| Pinterest | pin description, board context |
| Blog | article content, headings, author |

**Platform scope justification**: These 7 platforms cover the majority of content retrieval use cases. Reddit, GitHub, Medium, Substack are excluded from v1 to limit scope but can be added as needed.

**Confidence levels**:
- **high**: Tier 1 success + primary_text + author
- **medium**: Tier 2 success OR primary_text without author
- **low**: Screenshot OCR or user-provided

## Consequences

### Positive

- **Deterministic retrieval**: Consistent behavior regardless of URL or timing
- **Fail-soft**: Every retrieval produces usable output or actionable recovery
- **Platform-aware**: Extracts platform-specific fields, not generic page scraping
- **Zero friction**: Auto-invoked when URLs detected, no explicit command needed
- **Normalized output**: Claude reasons over consistent schema, not raw HTML

### Negative

- **Playwright dependency**: Tier 2 requires Playwright MCP to be available
- **Platform maintenance**: Extraction rules may need updates as platforms change
- **No authentication**: v1 only handles public content

### Neutral

- Follows established patterns (ADR-014 skills, ADR-032 tiered extraction)
- No command created (skill-only architecture)
- No caching (each retrieval is fresh)

## Alternatives Considered

### 1. Command-based approach (`/pro:retrieve`)

Rejected because:
- Requires explicit invocation, breaking flow
- URLs should be handled seamlessly
- Skills are auto-invoked, commands require user action

### 2. Single-method retrieval (WebFetch only)

Rejected because:
- Many platforms require JS rendering
- Would force user paste too frequently
- ADR-032 already established tiered fallback

### 3. Always-verbose output

Rejected because:
- Pollutes reasoning chains with retrieval narration
- Trains users to ignore system messages
- Silence on success is how high-trust infrastructure behaves

### 4. Caching retrieved content

Rejected for v1 because:
- Adds complexity
- Stale data concerns
- Fresh retrieval ensures current content

## Related

- ADR-014: Skills Directory for Bundled Agent Skills
- ADR-032: Tiered Extraction Strategy and Image Intelligence
- ADR-026: Subagent-Skill Dual Architecture
- Planning: `.plan/feat-universal-content-retriever-skill/`
