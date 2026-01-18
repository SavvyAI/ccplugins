# Spike: Extract Claude Code Book Niceties to Author Plugin

## What Was Explored

Compared the "Claude Code: The Omakase Field Manual" book project (`book-claude-code`) with a freshly initiated book (`book-the-leverage-gap`) created by `/author:init` to identify features and tooling that exist in the mature book but are missing from what the Author plugin generates.

## Key Findings

### 1. Missing: npm Scripts for Compilation

**Claude Code Book has:**
```json
{
  "scripts": {
    "compile:latex": "node scripts/compile-latex.mjs",
    "compile:pdf": "node scripts/preview-pdf.mjs --no-open",
    "preview": "node scripts/preview-pdf.mjs"
  }
}
```

**Leverage Gap book has:** No `package.json` at all.

**Gap:** The Author plugin's `/author:compile` command describes the compilation process but doesn't create any tooling for the user to run compilation directly. Users must re-invoke Claude Code each time.

### 2. Missing: Compilation Scripts

**Claude Code Book has:**
- `scripts/compile-latex.mjs` - 300+ line markdown-to-LaTeX converter
- `scripts/preview-pdf.mjs` - PDF generation + preview opener

**Leverage Gap book has:** Empty `book/dist/` directories waiting for output.

**Gap:** The `/author:compile` command's instructions say "compile to LaTeX" but don't provide reusable scripts. Each compilation is a one-shot execution.

### 3. Missing: `.claude/` Directory with Book Rules

**Claude Code Book has:**
- `.claude/book-rules.md` - 205 lines of detailed canonical rules including:
  - Core philosophy (build-first, showing-not-narrating)
  - What NOT to include
  - How tools enter the book
  - Writing rules
  - Appendix rules

**Leverage Gap book has:** No `.claude/` directory.

**Gap:** The Author plugin doesn't scaffold book-specific CLAUDE.md rules. Authors lose the institutional memory of their book's principles across sessions.

### 4. Missing: README.md

**Claude Code Book has:** Polished README with:
- Badge row (version, status, license)
- Table of Contents matching book structure
- Quick Start section with `npm run preview`
- Link to project documentation

**Leverage Gap book has:** No README.

**Gap:** Author plugin doesn't create a README for the book project repository.

### 5. Missing: doc/README.md (Project Documentation)

**Claude Code Book has:** `doc/README.md` with:
- Quick start commands
- Requirements (Node.js, TeX Live)
- Full project structure diagram
- Compilation targets table
- ADR index
- Development workflow

**Leverage Gap book has:** `doc/decisions/` with ADRs only, no README.

**Gap:** No developer documentation for the book project itself.

### 6. Different .gitignore

**Claude Code Book has:**
```gitignore
# Generated output
book/dist/

# LaTeX intermediate files
*.aux
*.log
*.toc
*.out
*.synctex.gz
*.fls
*.fdb_latexmk

# Node.js
node_modules/

# OS files
.DS_Store
```

**Leverage Gap book has:**
```gitignore
# Author plugin build outputs
book/dist/
```

**Gap:** Missing LaTeX intermediate file patterns and node_modules (since no package.json).

### 7. Missing: ADRs for Book-Specific Decisions

**Claude Code Book has:** 5 ADRs documenting book-specific architecture:
1. Compilation targets (SpecMD, LaTeX, Markdown)
2. Front matter structure
3. Chapter consolidation decisions
4. SOP format for procedures
5. Omakase book structure

**Leverage Gap book has:** 2 generic ADRs (from `/author:init`):
1. Use JSON manifest for book metadata
2. Separate content by purpose

**Gap:** The Claude Code book ADRs represent *learned* decisions from actually writing the book. These could inform defaults or be prompted for.

## Recommendations

### High Priority (Meaningful DX Impact)

1. **Add `scripts/` directory with npm tooling**
   - Modify `/author:init` to create `package.json` with compile/preview scripts
   - Bundle compile scripts or generate them during init
   - This enables `npm run preview` instead of `/author:compile` each time

2. **Create `.claude/book-rules.md` template**
   - Add a rules template during `/author:init`
   - Prompt for book philosophy (e.g., "build-first narrative" vs "reference manual")
   - Preserve author's canonical rules across sessions

3. **Expand `.gitignore` for LaTeX workflows**
   - Add LaTeX intermediate files pattern
   - Add node_modules if scripts are created

### Medium Priority (Nice to Have)

4. **Generate README.md**
   - Template based on book type
   - Include badges, TOC placeholder, quick start

5. **Add doc/README.md**
   - Project documentation with structure diagram
   - Compilation requirements
   - Development workflow

### Lower Priority (Consider)

6. **Book-specific ADR seeding**
   - Ask if the author wants to document their book's philosophy as an ADR
   - Could be interactive during init

## Success Criteria

The spike is successful if we have a clear list of enhancements for the Author plugin that would give newly-initialized book projects the same DX as hand-crafted ones like the Claude Code book.

**Status: COMPLETE**

## Next Steps

Options:
1. **Discard spike** - Learnings documented, no further action needed
2. **Promote to feature** - Use `/pro:feature` to implement the high-priority items
3. **Merge findings** - Just merge this findings.md for future reference

Recommended: **Promote to feature** - the `scripts/` + `package.json` gap is significant enough to warrant implementation. Authors shouldn't need to invoke Claude Code just to preview their book as PDF.
