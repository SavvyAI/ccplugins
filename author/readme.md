# Author Plugin

Markdown-native authoring and publishing for long-form writing workflows.

## Installation

```bash
/plugin marketplace add SavvyAI/ccplugins
/plugin install author@ccplugins
```

## Overview

Author is a Claude Code plugin for writers who want to create books, essays, and guides using Markdown as their single source of truth. It prioritizes incremental drafting and Git-based version control.

## Design Principles

1. **Markdown as single source of truth** - No proprietary formats
2. **Write once, compile many** - Web, print, and documentation targets
3. **Low ceremony, repo-first** - Git-native workflows
4. **No runtime state** - Everything persists in the repository

## Commands

| Command | Purpose |
|---------|---------|
| `/author:init` | Initialize a new book project |
| `/author:weave` | Weave content into book (bulk import or external references) |
| `/author:intent` | Compress raw input into structured chapter intent brief |
| `/author:chapter` | Create or edit chapters |
| `/author:revise` | Revision operations (clarity, tone) |
| `/author:compile` | Compile to publishing targets |
| `/author:status` | View progress dashboard with inferred milestones |
| `/author:targets` | View targets vs. current progress |
| `/author:targets.edit` | Modify chapter and word count targets |

## Quick Start

### Starting Fresh

```bash
# Initialize a book project
/author:init

# Add a chapter
/author:chapter "Introduction"

# Revise for clarity
/author:revise 01 --clarity

# Compile to all targets
/author:compile all
```

### Importing Existing Content

```bash
# Weave from a markdown file (auto-detects bulk mode for empty book)
/author:weave draft.md

# Weave from a directory of markdown files
/author:weave ./drafts/

# Interactive weave (paste content)
/author:weave
```

The weave command detects context:
- **Empty book**: Uses "Bulk Scaffold Mode" - auto-detects chapter boundaries from H1 headings
- **Existing book**: Uses "Integration Mode" - collaborative dialogue to place content strategically

### Weaving External References

When you have an existing book and want to incorporate research or reference material:

```bash
# Weave from a URL
/author:weave https://example.com/article

# Weave from a screenshot
/author:weave screenshot.png

# Interactive weave (paste content)
/author:weave
```

The weave command will:
- Analyze themes in the reference
- Propose placements in existing chapters
- Match your book's voice
- Add proper citations

## Book Project Structure

```
book/
├── book.json              # Book manifest
├── chapters/              # Chapter Markdown files
│   ├── 00-preface.md
│   ├── 01-introduction.md
│   └── ...
├── front-matter/          # Title, dedication, preface
├── back-matter/           # Appendix, bibliography
├── references/            # Archived reference material
└── dist/                  # Compiled outputs
    ├── specmd/            # Bundled Markdown
    ├── latex/             # LaTeX/PDF
    └── markdown/          # Linked files
```

## Progress Tracking

The Author plugin tracks progress through **inferred milestones**, not explicit declarations.

### Milestones

| Milestone | What It Means |
|-----------|---------------|
| thesis-locked | Central argument and scope are settled |
| frame-locked | Book identity and tone established |
| outline-locked | Chapter structure is stable |
| how-to-read-locked | Reader expectations are set |
| sample-chapters-exist | 2-3 chapters at target depth |
| pitch-ready | Sufficient for publisher outreach |
| manuscript-complete | All chapters drafted |
| production-ready | Ready for distribution |

### Targets

Books have configurable targets (chapter count, words per chapter, total words) based on book type:

| Book Type | Chapters | Words/Chapter | Total Words |
|-----------|----------|---------------|-------------|
| Business/Leadership | 8-12 | 4,000-6,000 | 40,000-60,000 |
| Technical Manual | 15-25 | 3,000-5,000 | 60,000-100,000 |
| Field Guide | 5-10 | 3,000-5,000 | 20,000-40,000 |
| Memoir | 12-20 | 4,000-6,000 | 60,000-80,000 |
| Academic | 8-12 | 6,000-10,000 | 80,000-100,000 |
| General | 10-15 | 4,000-6,000 | 50,000-75,000 |

## Compilation Targets

| Target | Format | Use Case |
|--------|--------|----------|
| SpecMD | Bundled Markdown | Web publishing |
| LaTeX | PDF | Print publishing |
| Markdown | Linked files | Documentation sites |

## Anti-Features

Author intentionally does NOT include:

- WYSIWYG editor
- CMS dashboards
- Proprietary file formats
- Direct publishing or uploading
- Account management or cloud sync

## Requirements

- Claude Code CLI
- Git (for version control)
- pdflatex (optional, for PDF output)

## Version

2.0.0

## Author

Wil Moore III
