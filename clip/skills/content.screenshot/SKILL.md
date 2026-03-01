---
name: content.screenshot
description: Take a screenshot of URL content and copy to clipboard. Use for visual capture, documentation, or sharing page appearance.
disable-model-invocation: true
---

# /clip:content.screenshot

Navigate to a URL, take a screenshot, and copy to clipboard.

## Usage

```
/clip:content.screenshot <url>
```

## Instructions

Given a URL, capture a visual screenshot that:

1. **Shows the main content** - not just the header
2. **Captures full width** - no horizontal clipping
3. **Handles dynamic content** - waits for page to load
4. **Produces clean output** - no cookie banners or popups if possible

## Process

1. **Navigate** to the URL using Playwright browser automation
2. **Wait** for the page to fully load
3. **Dismiss** cookie banners or popups if present (click dismiss/close)
4. **Scroll** to main content if needed
5. **Take screenshot** using `browser_take_screenshot`
6. **Copy** to clipboard
7. **Confirm** to the user

## Screenshot Options

| Option | Default | Description |
|--------|---------|-------------|
| Full page | No | Capture just the viewport |
| Format | PNG | High quality, supports transparency |

For full-page screenshots, use the `fullPage` option in Playwright.

## Handling Dynamic Content

- Wait for images to load
- Wait for lazy-loaded content
- Allow JavaScript rendering time
- Handle infinite scroll pages (capture initial viewport)

## Output

The screenshot is copied to clipboard as image data. User can:
- Paste directly into Preview, Figma, or other apps
- Paste into ChatGPT or other LLM interfaces
- Save via Raycast clipboard manager

## Example

Input:
```
/clip:content.screenshot https://example.com/page
```

Output:
```
Done. Screenshot of "Example Page" copied to clipboard (1920x1080 PNG).
```
