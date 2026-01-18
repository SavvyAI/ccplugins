# Feature: Self-Service Compilation Tooling for /author:init

## Summary

Enhance `/author:init` to generate `package.json` with npm scripts and bundled compilation scripts. Authors can then run `npm run preview` to compile and view their book as PDF without invoking Claude Code.

## Related

- **Spike:** #72 (extract-claude-book-niceties-to-author-plugin) - PROMOTED
- **ADR-010:** Bundled Bin Assets for Setup Commands
- **Source:** Claude Code book (`book-claude-code/scripts/`)

## Implementation Complete

### Files Created

```
author/commands/_bins/init/
├── compile-latex.mjs      # Markdown → LaTeX converter (copied from book-claude-code)
├── preview-pdf.mjs        # PDF generation + preview (copied from book-claude-code)
└── package.template.json  # npm package template with {{PLACEHOLDERS}}
```

### Files Modified

- **`author/commands/init.md`** - Added:
  - Step 5: Now creates `scripts/` directory
  - Step 5.5: Copies compilation scripts from `_bins/init/`
  - Step 5.6: Creates `package.json` from template with title/author substitution
  - Step 8: Expanded `.gitignore` with LaTeX intermediates, node_modules, .DS_Store
  - Step 9: Updated confirmation to show `scripts/` structure and `npm run preview`

### How It Works

1. User runs `/author:init`
2. After gathering metadata, init creates `scripts/` directory
3. Copies `compile-latex.mjs` and `preview-pdf.mjs` from bundled assets
4. Creates `package.json` with slugified title as package name
5. Expands `.gitignore` with full LaTeX + Node.js patterns
6. Displays confirmation with `npm run preview` in next steps

### Testing

To test:
1. Create a new directory: `mkdir test-book && cd test-book && git init`
2. Run `/author:init`
3. Verify `package.json`, `scripts/compile-latex.mjs`, `scripts/preview-pdf.mjs` exist
4. Add some content via `/author:chapter`
5. Run `npm run preview` → should compile and open PDF

### Requirements

- Node.js 18+ (for ESM support)
- pdflatex (for PDF generation): `brew install texlive`

## Related ADRs

- [055. Bundled Compilation Scripts for /author:init](../../doc/decisions/055-author-init-bundled-compilation-scripts.md)
