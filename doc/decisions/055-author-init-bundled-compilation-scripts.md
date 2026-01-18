# 055. Bundled Compilation Scripts for /author:init

Date: 2026-01-17

## Status

Accepted

## Context

The `/author:init` command creates the directory structure for book projects, but authors had no self-service way to compile their manuscripts to PDF. They had to either manually run LaTeX commands or rely on Claude Code to execute compilation for them every time they wanted to preview their work.

The Claude Code book project (`book-claude-code`) had working compilation scripts that handled Markdown → LaTeX → PDF conversion, but these were specific to that project rather than available to all author plugin users.

## Decision

Bundle compilation scripts directly with `/author:init` following the established "Bundled Bin Assets" pattern (ADR-010). When `/author:init` runs:

1. Create a `scripts/` directory in the book project
2. Copy `compile-latex.mjs` and `preview-pdf.mjs` from `_bins/init/`
3. Generate `package.json` from a template with title/author placeholders substituted
4. Add comprehensive `.gitignore` entries for LaTeX intermediates and Node.js artifacts

Authors can then run `npm run preview` to compile and view their book as PDF without invoking Claude Code.

## Consequences

**Positive:**
- Authors have immediate, self-service compilation without AI assistance
- Follows established bundled assets pattern from ADR-010
- Scripts are version-controlled with the plugin, ensuring consistency
- Template-based `package.json` allows for proper package naming based on book title
- Comprehensive `.gitignore` prevents build artifacts from polluting git history

**Negative:**
- Requires Node.js 18+ and pdflatex as external dependencies
- Scripts are copied (not symlinked), so updates require re-running init or manual copy
- Adds ~30KB of bundled assets to the plugin

## Alternatives Considered

1. **Symlink scripts instead of copying** - Rejected because book projects should be portable and not depend on the plugin location after initialization.

2. **Include compilation in the /author:publish command only** - Rejected because authors need frequent preview capability during writing, not just at publication time.

3. **Generate package.json dynamically via Claude** - Rejected in favor of template approach for consistency and to follow the bundled assets pattern.

## Related

- Planning: `.plan/.done/feat-author-init-compilation-tooling/`
- ADR-010: Bundled Bin Assets for Setup Commands
- Spike: #72 (extract-claude-book-niceties-to-author-plugin)
