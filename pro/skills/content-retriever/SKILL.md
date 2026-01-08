---
name: content-retriever
description: Reliably retrieve any public web content from URLs. Use when encountering URLs for X/Twitter, LinkedIn, YouTube, TikTok, Instagram, Pinterest, or blogs. Returns normalized structured content for consistent reasoning. Silent on success, reports only on deviation.
---

# Universal Content Retriever

Deterministic, fail-soft content retrieval for any public URL.

## Core Principle

**Silent on success. Report only on deviation.**

When content is retrieved successfully with high confidence, Claude simply uses the data. No narration, no annotation. Only when fallback methods are used or content is partial does a deviation notice appear.

## When to Use This Skill

Invoke when any URL appears in conversation that requires content extraction:

| Platform | URL Patterns |
|----------|--------------|
| X/Twitter | `x.com/*`, `twitter.com/*` |
| LinkedIn | `linkedin.com/*` |
| YouTube | `youtube.com/*`, `youtu.be/*` |
| TikTok | `tiktok.com/*` |
| Instagram | `instagram.com/*` |
| Pinterest | `pinterest.com/*` |
| Blog/Generic | Any other URL |

## Retrieval Pipeline

Execute tiers in order. Escalate only on failure.

### Tier 1: WebFetch (Fast, No Auth)

```
1. Use WebFetch tool with the URL
2. Parse response for platform-specific content
3. If successful → Return ContentObject (high confidence)
4. If blocked/rate-limited/JS-required → Escalate to Tier 2
```

**WebFetch prompt by platform:**

| Platform | Extraction Prompt |
|----------|-------------------|
| X/Twitter | "Extract: post text, author name, @handle, timestamp, media URLs, thread context if reply, engagement counts" |
| LinkedIn | "Extract: post body, author name and title, company, timestamp, engagement counts" |
| YouTube | "Extract: video title, channel name, description, published date, view count, transcript if available" |
| TikTok | "Extract: video description, creator name, @handle, hashtags, sound/audio info, view count" |
| Instagram | "Extract: post caption, author @handle, hashtags, post type (image/reel/carousel), engagement" |
| Pinterest | "Extract: pin description, board name, pinner name, source URL if linked" |
| Blog | "Extract: article title, author, published date, main content, headings structure" |

### Tier 2: Playwright Browser Automation

**Prerequisites:** Playwright MCP tools available.

```
1. Use browser_navigate to load the URL
2. Use browser_snapshot to capture rendered content
3. Parse accessibility tree for content
4. If text extraction works → Return ContentObject (medium confidence)
5. If still blocked → Take screenshot, attempt OCR via vision
6. If screenshot yields content → Return ContentObject (low confidence)
7. If CAPTCHA/login wall → Escalate to Tier 3
```

**Browser extraction steps:**

1. `browser_navigate` to URL
2. Wait 2-3 seconds for JS rendering
3. `browser_snapshot` for accessibility tree
4. Extract text content from snapshot
5. If minimal text found, `browser_take_screenshot` and use vision to extract

### Tier 3: User Paste Fallback

When automated methods fail:

```
⚠️ Unable to retrieve content automatically.

**URL:** [the URL]
**Reason:** [specific reason: login required, CAPTCHA, rate limited, etc.]

**Options:**
1. Paste the content directly and I'll continue
2. Upload a screenshot of the content
3. Proceed with URL reference only (limited analysis)
```

**Terminal failure conditions:**
- User explicitly declines all options ("skip", "cancel", "none")
- Screenshot uploaded but OCR yields no usable text after 2 attempts
- Repeated errors (3+ attempts across all tiers)

**When retrieval is declared impossible:**

```
⚠️ Content retrieval failed.

**URL:** [the URL]
**Attempted:** WebFetch (blocked), Playwright (CAPTCHA), User paste (declined)
**Status:** Unable to retrieve - proceeding with URL reference only

I can still reference the URL in context, but cannot analyze its content.
```

Never a dead-end. Always provide actionable next steps or clear status.

## ContentObject Schema

Every retrieval produces this normalized structure (internally):

```
ContentObject:
  source_platform: x | linkedin | youtube | tiktok | instagram | pinterest | blog | unknown
  source_url: string

  # Core content
  author: string (display name)
  author_handle: string (@handle or profile URL)
  publish_timestamp: ISO 8601 string
  primary_text: string (main content body)
  title: string (for videos, articles)
  description: string (supplementary text)

  # Media
  media:
    images: [URLs or descriptions]
    video_url: string
    thumbnail: string
    audio_context: string (TikTok sounds, etc.)

  # Platform-specific
  transcript: string (YouTube, TikTok)
  thread_context: string (X threads, quoted posts)
  hashtags: [strings]
  captions: string

  # Metadata
  metadata:
    likes: number
    comments: number
    shares: number
    views: number
    tags: [strings]
    links: [URLs]

  # Retrieval quality
  retrieval:
    method: direct_fetch | browser_render | screenshot_ocr | user_provided
    confidence: high | medium | low
    timestamp: ISO 8601
    missing_elements: [what couldn't be extracted]
    deviation_reason: string (why fallback was used)
```

### Field Requirements

| Field | Required | Notes |
|-------|----------|-------|
| `source_platform` | Always | Detected from URL pattern |
| `source_url` | Always | Original input URL |
| `primary_text` | Expected | Core content; if missing, retrieval is partial |
| `author` | Expected | Platform-dependent; blogs may lack byline |
| `retrieval.*` | Always | Quality metadata always populated |
| `media.*` | Optional | Present when content has media |
| `metadata.*` | Optional | Engagement counts; often blocked |
| `transcript` | Optional | YouTube/TikTok only |
| `thread_context` | Optional | X/Twitter only |

### Confidence Thresholds

| Level | Criteria |
|-------|----------|
| **high** | Tier 1 success + primary_text + author extracted |
| **medium** | Tier 2 success OR primary_text without author |
| **low** | Screenshot OCR only OR user-provided content |

## Platform-Specific Extraction

### X / Twitter

**Target fields:**
- `primary_text`: Tweet/post text
- `author`: Display name
- `author_handle`: @username
- `publish_timestamp`: Posted date/time
- `media.images`: Attached images
- `media.video_url`: Video if present
- `thread_context`: Parent tweet if reply, quoted tweet if quote-tweet
- `metadata.likes`, `metadata.retweets`, `metadata.replies`

**Thread handling:**
If URL points to a thread, extract all connected tweets in order.

### LinkedIn

**Target fields:**
- `primary_text`: Post body
- `author`: Full name
- `author_handle`: Profile URL or headline
- `publish_timestamp`: "X days ago" converted to date
- `media.images`: Attached images or document previews
- `metadata.likes`, `metadata.comments`

**Note:** LinkedIn heavily blocks scraping. Expect Tier 2/3 escalation frequently.

### YouTube

**Target fields:**
- `title`: Video title
- `description`: Video description
- `author`: Channel name
- `author_handle`: Channel URL or @handle
- `publish_timestamp`: Upload date
- `transcript`: Auto-generated or manual captions (full text)
- `media.thumbnail`: Video thumbnail URL
- `metadata.views`, `metadata.likes`

**Transcript extraction:**
- Attempt via Tier 2 (Playwright) by navigating to video and checking for caption availability
- YouTube often requires browser rendering; WebFetch rarely works
- If transcript unavailable (disabled, not generated), set `transcript: null` and add "transcript" to `missing_elements`
- Fallback: Use `description` as primary content when transcript unavailable
- Do not error on missing transcript; video title + description is acceptable partial retrieval

**Transcript priority:** Always attempt transcript extraction. This is often the most valuable content. But graceful degradation to description is acceptable.

### TikTok

**Target fields:**
- `primary_text`: Video description/caption
- `author`: Creator name
- `author_handle`: @username
- `hashtags`: Extracted from description
- `media.audio_context`: Sound name and original creator
- `metadata.views`, `metadata.likes`, `metadata.comments`

**Note:** TikTok requires browser rendering. WebFetch rarely works.

### Instagram

**Target fields:**
- `primary_text`: Post caption
- `author_handle`: @username
- `hashtags`: Extracted from caption
- `media.images`: Post images (describe if can't extract URLs)
- `metadata.likes`, `metadata.comments`

**Note:** Instagram blocks most automated access. Prepare for Tier 2/3.

### Pinterest

**Target fields:**
- `primary_text`: Pin description
- `author`: Pinner name
- `title`: Pin title if present
- `media.images`: Pin image
- `metadata.saves`: Save count

### Blog / Generic

**Target fields:**
- `title`: Article title (h1 or meta title)
- `primary_text`: Main article content
- `author`: Byline author
- `publish_timestamp`: Published date
- `description`: Meta description or excerpt
- `metadata.links`: Internal/external links in article

**Structure preservation:** Maintain heading hierarchy (h2, h3) in content.

## Deviation Reporting

Report to user ONLY when:
1. Tier 2 or Tier 3 fallback was used
2. Core fields missing (primary_text, author)
3. Confidence is low
4. Screenshot-only extraction (no structured text)

**Deviation format (compact, inline):**

```
⚠️ Source retrieved with partial fidelity.
Method: browser_render
Missing: thread_context, engagement_metrics
```

**DO NOT report when:**
- Tier 1 succeeds with high confidence
- Only optional metadata is missing (engagement counts, exact timestamps)
- Content is complete for the platform type

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Deleted content | Report unavailable, check for cached version via search |
| Thread/carousel | Extract all parts, note if incomplete in missing_elements |
| Age-restricted | Report as blocked, offer user paste |
| Region-locked | Report blocked, user paste fallback |
| Shortened URLs | Follow redirects (max 5 hops) |
| Private/login-required | Report immediately, user paste |
| Rate limited | Attempt Tier 2 before failing |

## Behavioral Notes

1. **Auto-invoke on URL detection** - When a URL appears in conversation, apply this skill automatically
2. **No user prompts on success** - Silent operation when everything works
3. **Minimal deviation reports** - One line, factual, no drama
4. **Preserve user flow** - Extraction happens in background, user sees final analysis
5. **Thread awareness** - For social media, always check for thread/reply context

## What This Skill Does NOT Do

- Download videos or audio files (references only)
- Access authenticated/login-required content
- Cache or persist retrieved content
- Handle batch URL processing (one URL at a time)
- Make value judgments about content

## Integration Points

This skill works alongside:
- `/author:weave` - Content ingestion for books
- `/pro:product.brief` - Research and reference gathering
- `/pro:bip` - Context for build-in-public posts
- Any workflow requiring external content analysis
