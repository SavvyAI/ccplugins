---
name: content.headline
description: Generate a single cohesive headline from URL content and copy to clipboard. Use for creating titles, bookmark names, or quick content identification.
disable-model-invocation: true
---

# /clip:content.headline

Extract content from a URL and generate a single cohesive headline, then copy to clipboard.

## Usage

```
/clip:content.headline <url>
```

## Instructions

Given a URL, extract the content and synthesize a single headline that:

1. **Captures the essence** of the content in one line
2. **Works as a title** for bookmarks, notes, or file names
3. **Is concise** - aim for under 80 characters
4. **Avoids clickbait** - be accurate, not sensational

## Process

1. **Navigate** to the URL using Playwright browser automation
2. **Extract** the main content (article, thread, image)
3. **Analyze** the content to identify the core topic/message
4. **Generate** a single headline that captures the essence
5. **Copy** the headline to clipboard using `pbcopy`
6. **Confirm** to the user with the generated headline

## Content Type Handling

| Content Type | Headline Strategy |
|--------------|-------------------|
| Article | Synthesize from title + key points |
| Thread | Summarize the main topic/debate |
| Discussion (HN/Reddit) | Capture the core question/topic |
| Image | Describe the visual content |
| Documentation | Name the feature/concept covered |

## Output Format

Plain text, single line, no markdown formatting.

Example outputs:
- `Effective harnesses for long-running AI agents`
- `React hooks explained with practical examples`
- `Debate: TypeScript vs JavaScript for new projects`
- `Mountain landscape at sunset with fog`

## Example

Input:
```
/clip:content.headline https://example.com/blog/long-article-title
```

Output:
```
Done. Headline copied to clipboard: "Effective harnesses for long-running AI agents"
```
