---
name: content.usecases
description: Extract use-cases and opportunities from URL content and copy to clipboard. Use for idea mining, product inspiration, or identifying applications of a tool/technology.
disable-model-invocation: true
---

# /clip:content.usecases

Extract content from a URL and identify use-cases or opportunities, then copy to clipboard.

## Usage

```
/clip:content.usecases <url>
```

## Instructions

Given a URL, extract the content and identify:

1. **Explicit use-cases** mentioned in the content
2. **Implied opportunities** that could be derived
3. **Problems solved** by the tool/technology/approach
4. **Target users** or beneficiaries
5. **Integration points** with other tools/workflows

## Process

1. **Navigate** to the URL using Playwright browser automation
2. **Extract** the main content
3. **Analyze** for use-cases, applications, and opportunities
4. **Categorize** by type (direct use, integration, derived opportunity)
5. **Format** as structured markdown
6. **Copy** to clipboard using `pbcopy`
7. **Confirm** to the user

## Output Format

```markdown
# Use-Cases: [Topic/Tool Name]

**Source:** [URL]

## Direct Use-Cases

1. **[Use-Case Name]**: Brief description of how it's used
2. **[Use-Case Name]**: Brief description

## Integration Opportunities

- Integrates with [Tool/System] for [benefit]
- Can be combined with [Approach] to achieve [outcome]

## Derived Opportunities

- Could be adapted for [different domain/purpose]
- Pattern could apply to [similar problem]

## Target Users

- [User type 1]: Why they would benefit
- [User type 2]: Why they would benefit
```

## Content Type Handling

| Content Type | Focus |
|--------------|-------|
| Product/Tool article | Features → Use-cases |
| Technical discussion | Problems discussed → Solutions mentioned |
| Tutorial/Guide | What it teaches → Where to apply it |
| Comparison article | When to use each option |

## Example

Input:
```
/clip:content.usecases https://news.ycombinator.com/item?id=12345
```

Output:
```
Done. Use-cases extracted from HN discussion on "Local LLMs" - 8 use-cases identified, copied to clipboard.
```
