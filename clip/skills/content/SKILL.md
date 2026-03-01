---
name: content
description: Extract article, thread, or image content from a URL and copy clean markdown to clipboard. Use when archiving web content, saving articles to Gists, or capturing content for later reference.
disable-model-invocation: true
---

# /clip:content

Extract content from a URL with full formatting, links, and structure intact, then copy to clipboard.

## Usage

```
/clip:content <url>
```

## Instructions

You are a content extraction specialist. Given a URL, extract the complete content preserving:

1. **Headlines and headings** (H1, H2, H3, etc.) formatted as markdown headers
2. **Bylines and dates** with author links preserved
3. **Body text** with all paragraphs intact
4. **Inline links** converted to markdown format `[text](url)`
5. **Code blocks** with proper fencing and language hints
6. **Lists** (ordered and unordered)
7. **Blockquotes**
8. **Tables** in markdown format
9. **Image captions** (but not the images themselves)
10. **Footnotes** and references

## Process

1. **Navigate** to the URL using Playwright browser automation
2. **Wait** for the page to fully load (use `browser_wait_for` if needed)
3. **Detect** content type from URL and page structure
4. **Extract** content via `browser_snapshot` or `browser_evaluate` with JavaScript to parse the DOM
5. **Handle large pages** by using JavaScript evaluation to extract just the article content
6. **Format** the extracted content as clean, well-structured markdown
7. **Write** to a temporary file if the content is large or contains special characters
8. **Copy** the final markdown to the clipboard using `pbcopy`
9. **Close** the browser when done
10. **Confirm** to the user with a brief summary of what was extracted

## Content Detection Strategy

Detect content type from URL patterns and page structure:

| URL Pattern | Type | Extraction Strategy |
|-------------|------|---------------------|
| `x.com/*`, `twitter.com/*` | Thread/post | Wait for dynamic content, extract conversation in order |
| `medium.com/*`, `substack.com/*` | Article | Look for `.post-content`, `article` elements |
| `news.ycombinator.com/item*` | Discussion | Extract post + comments hierarchy |
| `reddit.com/*/comments/*` | Thread | Extract post + comment tree |
| `github.com/*/gist/*` | Gist | Extract raw markdown content |
| `wikipedia.org/*` | Wiki | Use `#mw-content-text .mw-parser-output` selector |
| Image URLs (`.png`, `.jpg`, `.gif`, `.webp`) | Image | Return base64 encoded content |
| `*` (fallback) | Article | Generic `<article>` or `<main>` extraction |

## Site-Specific Extraction

### News sites (CNBC, NYT, BBC, etc.)
- Look for `<article>` tags or `.article-body` classes
- Extract headline from `<h1>`
- Get byline from author links
- Get publish date from `<time>` elements

### Blog posts (Medium, Substack, personal blogs)
- Look for `.post-content`, `article`, or `main` elements
- Preserve code blocks with syntax highlighting hints

### X/Twitter threads
- Wait for dynamic content to load
- Extract from the conversation/article region
- Preserve thread order
- Handle code blocks in tweets specially

### Documentation sites
- Preserve heading hierarchy
- Keep code examples with language tags
- Maintain internal anchor links

### Wikipedia
- Use `#mw-content-text .mw-parser-output` selector
- Convert wiki links to full Wikipedia URLs
- Skip reference numbers or convert to footnotes

### Hacker News discussions
- Extract the original post/link
- Preserve comment hierarchy with indentation
- Include usernames and timestamps

## Output Format

```markdown
# Article Title

**Published:** Date
**By:** [Author Name](author-url)

---

[Article content with all formatting preserved]

---

*Tags/Categories if present*
```

For threads, preserve conversation structure:

```markdown
# Thread Title

**@username** - timestamp

First post content...

---

**@reply_user** replying to @username

Reply content...
```

## Error Handling

- If the page requires authentication, inform the user
- If content is behind a paywall, extract what's visible
- If the page uses heavy JavaScript rendering, wait appropriately
- If extraction fails, try alternative selectors or fall back to `get_page_text`

## Example

Input:
```
/clip:content https://example.com/blog/my-article
```

Output:
```
Done. The article "My Article Title" is now on your clipboard, formatted in markdown with all links preserved.
```
