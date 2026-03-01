---
name: content.sentiment
description: Analyze sentiment and tone of URL content and copy analysis to clipboard. Use for understanding community reception, gauging opinions, or tone detection.
disable-model-invocation: true
---

# /clip:content.sentiment

Extract content from a URL and analyze its sentiment/tone, then copy to clipboard.

## Usage

```
/clip:content.sentiment <url>
```

## Instructions

Given a URL, extract the content and analyze:

1. **Overall sentiment** - positive, negative, neutral, mixed
2. **Tone** - technical, casual, promotional, critical, enthusiastic, etc.
3. **Key themes** - what emotions or opinions dominate
4. **Notable quotes** - representative examples of the sentiment
5. **Audience reception** (for discussions) - how the community responded

## Process

1. **Navigate** to the URL using Playwright browser automation
2. **Extract** the main content
3. **Analyze** sentiment across the content
4. **Identify** dominant themes and tones
5. **Select** representative quotes
6. **Format** as structured analysis
7. **Copy** to clipboard using `pbcopy`
8. **Confirm** to the user

## Output Format

```markdown
# Sentiment Analysis: [Topic/Title]

**Source:** [URL]

## Overall Sentiment

**Rating:** [Positive/Negative/Neutral/Mixed]
**Confidence:** [High/Medium/Low]

## Tone Characteristics

- Primary tone: [e.g., Technical, Enthusiastic, Critical]
- Secondary tone: [e.g., Cautious, Optimistic]

## Key Themes

1. **[Theme]**: Brief description
2. **[Theme]**: Brief description

## Representative Quotes

> "[Quote that exemplifies the sentiment]"

> "[Another representative quote]"

## Audience Reception (if applicable)

- **Supporters**: [What they appreciate]
- **Critics**: [What they question/dislike]
- **Neutral**: [Common observations]
```

## Content Type Handling

| Content Type | Sentiment Focus |
|--------------|-----------------|
| Article | Author's tone and perspective |
| Thread/Discussion | Community sentiment distribution |
| Review | Rating alignment and nuance |
| Social post | Engagement tone |

## Sentiment Scale

| Rating | Description |
|--------|-------------|
| Very Positive | Enthusiastic, celebratory, highly favorable |
| Positive | Favorable, supportive, optimistic |
| Neutral | Factual, balanced, no strong opinion |
| Mixed | Contains both positive and negative elements |
| Negative | Critical, skeptical, unfavorable |
| Very Negative | Hostile, dismissive, strongly opposed |

## Example

Input:
```
/clip:content.sentiment https://news.ycombinator.com/item?id=12345
```

Output:
```
Done. Sentiment analysis of HN discussion copied to clipboard: Mixed sentiment (60% positive, 30% critical, 10% neutral).
```
