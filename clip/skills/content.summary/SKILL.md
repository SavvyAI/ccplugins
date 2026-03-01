---
name: content.summary
description: Summarize URL content into a condensed abstraction and copy to clipboard. Use for quick content scanning, sharing summaries, or creating compact notes.
disable-model-invocation: true
---

# /clip:content.summary

Extract content from a URL and generate a condensed summary, then copy to clipboard.

## Usage

```
/clip:content.summary <url>
```

## Instructions

Given a URL, extract the content and create a summary that:

1. **Captures key points** without losing important details
2. **Maintains structure** - use bullet points for multiple key ideas
3. **Preserves context** - include who, what, when where relevant
4. **Is self-contained** - reader should understand without visiting the source

## Process

1. **Navigate** to the URL using Playwright browser automation
2. **Extract** the main content (article, thread, image)
3. **Analyze** the content to identify key points
4. **Generate** a structured summary
5. **Format** as clean markdown
6. **Copy** to clipboard using `pbcopy`
7. **Confirm** to the user

## Output Format

```markdown
# Summary: [Brief Title]

**Source:** [URL]

## Key Points

- Point 1
- Point 2
- Point 3

## Context

Brief context or background if relevant.

## Takeaway

One sentence capturing the main insight or conclusion.
```

For threads/discussions, include:

```markdown
## Main Perspectives

- **Perspective A**: Summary of this viewpoint
- **Perspective B**: Summary of opposing/alternative view
```

## Length Guidelines

| Content Type | Summary Length |
|--------------|----------------|
| Short article (<500 words) | 3-5 bullet points |
| Long article (>1000 words) | 5-8 bullet points + context |
| Thread/Discussion | Main points + key perspectives |
| Image | Description + notable elements |

## Example

Input:
```
/clip:content.summary https://example.com/blog/ai-agents
```

Output:
```
Done. Summary of "AI Agent Best Practices" copied to clipboard (5 key points).
```
