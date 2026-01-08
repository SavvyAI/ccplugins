# Universal Content Retriever (UCR) Skill

## Overview

A Claude skill that reliably retrieves any public web content when given a URL and returns a normalized, structured representation for Claude to reason over.

## Design Decisions

### Confirmed with User

| Decision | Choice |
|----------|--------|
| Architecture | Skill only (model-invoked when URL detected) |
| Browser Fallback | Yes, use Playwright MCP as Tier 2 |
| Platform Scope | All 7 platforms (X, LinkedIn, YouTube, TikTok, Instagram, Pinterest, Blogs) |
| Authenticated Sources | Out of scope for v1 (public content only) |
| Caching | No caching (each retrieval is fresh) |
| Output Mode | Internal context (silent primitive, report only on deviation) |

### Design Principles

1. **Silent on success** - No output unless deviation occurs
2. **Report on deviation** - Compact, factual notification when fallback used or content partial
3. **Fail-soft** - Never dead-end; always provide actionable recovery path
4. **Platform-aware** - Recognize content types and extract platform-specific fields
5. **Deterministic** - Same URL should produce consistent results

## Relevant ADRs

| ADR | Summary |
|-----|---------|
| ADR-014 | Skills directory pattern (`pro/skills/{name}/SKILL.md`) |
| ADR-026 | Subagent-skill dual architecture (skill = HOW, subagent = WHEN) |
| ADR-032 | **Tiered extraction strategy** - WebFetch → Playwright → User paste |

**Note**: ADR-032 already establishes the fallback pattern. UCR formalizes and extends it.

## Normalized Output Schema

```typescript
interface ContentObject {
  // Source identification
  source_platform: 'x' | 'linkedin' | 'youtube' | 'tiktok' | 'instagram' | 'pinterest' | 'blog' | 'unknown';
  source_url: string;

  // Content metadata
  author?: string;
  author_handle?: string;
  publish_timestamp?: string; // ISO 8601

  // Primary content
  primary_text?: string;
  title?: string;
  description?: string;

  // Media assets
  media?: {
    images?: string[];      // URLs or base64
    video_url?: string;
    audio_url?: string;
    thumbnail?: string;
  };

  // Platform-specific
  transcript?: string;       // YouTube, TikTok
  thread_context?: string;   // X threads
  hashtags?: string[];       // Social platforms
  captions?: string;         // Instagram, TikTok

  // Engagement (optional)
  metadata?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    tags?: string[];
    links?: string[];
  };

  // Retrieval quality
  retrieval: {
    method: 'direct_fetch' | 'browser_render' | 'screenshot_ocr' | 'user_provided';
    confidence: 'high' | 'medium' | 'low';
    timestamp: string;
    missing_elements?: string[];
    deviation_reason?: string;
  };
}
```

## Retrieval Pipeline

### Tier 1: WebFetch (Fast, No Auth)

```
Attempt WebFetch with platform-aware extraction
├── Success → Return ContentObject (high confidence)
└── Failure (rate-limited, JS required, blocked)
    └── Escalate to Tier 2
```

### Tier 2: Playwright Browser Automation

```
Launch browser via Playwright MCP
├── Navigate to URL
├── Wait for content to render
├── Extract via DOM or screenshot+OCR
├── Success → Return ContentObject (medium confidence)
└── Failure (still blocked, CAPTCHA, login wall)
    └── Escalate to Tier 3
```

### Tier 3: User Paste Fallback

```
Request user paste content manually
├── Provide clear instructions
├── Parse pasted content
└── Return ContentObject (user_provided, low confidence)
```

## Platform Detection

| URL Pattern | Platform |
|-------------|----------|
| `x.com/*`, `twitter.com/*` | x |
| `linkedin.com/*` | linkedin |
| `youtube.com/*`, `youtu.be/*` | youtube |
| `tiktok.com/*` | tiktok |
| `instagram.com/*` | instagram |
| `pinterest.com/*` | pinterest |
| Default | blog |

## Deviation Reporting

When Claude must use fallback methods or content is partial:

```
⚠️ Source retrieved with partial fidelity.
Method: browser_render
Missing: thread_context, engagement_metrics
```

Deviations that trigger reporting:
- Tier 2 or Tier 3 fallback used
- Confidence < high
- Missing core elements (primary_text, author)
- Screenshot-only extraction (no text)

## File Structure

```
pro/
├── skills/
│   └── content-retriever/
│       └── SKILL.md          # Main skill definition
└── commands/
    └── (none - skill only, no explicit command)
```

## Implementation Steps

### Phase 1: Core Skill

1. Create `pro/skills/content-retriever/SKILL.md` with:
   - YAML frontmatter (name, description)
   - Platform detection logic
   - Tiered retrieval instructions
   - Output schema definition
   - Deviation reporting format

### Phase 2: Platform Extractors

1. Define extraction rules for each platform:
   - X/Twitter: post text, author, media, thread context
   - LinkedIn: post body, author, engagement
   - YouTube: title, description, transcript
   - TikTok: captions, hashtags, audio context
   - Instagram: captions, hashtags
   - Pinterest: pin description, board context
   - Blogs: article content, headings, code blocks

### Phase 3: Integration Testing

1. Test retrieval across all 7 platforms
2. Verify fallback escalation works
3. Confirm deviation reporting triggers correctly

### Phase 4: Documentation & ADR

1. Create ADR documenting the UCR architecture
2. Update pro/readme.md to mention the new skill

## Success Criteria

For any public URL, the skill must produce one of:
1. **Full extraction** - All platform-specific fields populated
2. **Partial extraction** - Primary text + explicit gap list
3. **Fallback artifact** - Screenshot/transcript + deviation report
4. **Actionable recovery** - Clear user instructions, no dead-end

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Deleted content | Attempt cached version, report unavailable |
| Thread/carousel | Extract all parts, note if incomplete |
| Age-restricted | Report as blocked, suggest user paste |
| Region-locked | Report blocked, user paste fallback |
| Shortened URLs | Follow redirects automatically |
| Redirect chains | Max 5 hops, then fail |

## Out of Scope (v1)

- Authenticated/login-required content
- Video/audio downloading (references only)
- Real-time content updates
- Caching/persistence
- Explicit command invocation

## Future Considerations (v2+)

- Optional verbose mode for debugging
- Configurable confidence thresholds
- Platform-specific authentication hooks
- Content caching with TTL
- Batch URL processing
