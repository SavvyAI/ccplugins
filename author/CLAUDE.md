# Author Plugin Instructions

> Markdown-native authoring and publishing for long-form writing workflows.

## Design Principles

1. **Markdown as single source of truth** - All content lives in `.md` files
2. **Write once, compile many** - Single source compiles to web, print, and more
3. **Low ceremony, repo-first** - Minimal overhead, Git-native workflows
4. **No runtime state** - All state persists in the repository

## Book Project Structure

```
book/
├── book.json              # Book manifest
├── chapters/              # Chapter Markdown files
│   ├── 01-introduction.md
│   └── ...
├── front-matter/          # Title, dedication, preface
├── back-matter/           # Appendix, bibliography
├── publish/               # Publishing pipeline artifacts
│   ├── query.md           # Agent query letter
│   ├── proposal.md        # Full book proposal
│   ├── targets.md         # Agent target map
│   └── submissions.md     # Submission tracker
└── dist/                  # Compiled outputs
```

## Commands

| Command | Purpose |
|---------|---------|
| `/author:init` | Initialize a new book project |
| `/author:weave` | Weave content into book (bulk import or external references) |
| `/author:chapter` | Create or edit chapters |
| `/author:revise` | Revision operations (clarity, tone) |
| `/author:compile` | Compile to publishing targets |
| `/author:status` | View progress dashboard with inferred milestones |
| `/author:targets` | View targets vs. current progress |
| `/author:targets.edit` | Modify chapter and word count targets |
| `/author:publish` | Traditional publishing pipeline (query, proposal, agents) |

## Anti-Features

- No WYSIWYG editor
- No CMS dashboards
- No proprietary file formats
- No direct publishing or uploading
- No shared runtime state with Pro plugin

## Working with Chapters

Chapters are numbered Markdown files in `chapters/`:
- Filename pattern: `{NN}-{slug}.md` (e.g., `01-introduction.md`)
- Title comes from first H1 heading in file
- Order determined by numeric prefix

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

Books have configurable targets stored in `book.json`:

```json
{
  "bookType": "business",
  "targets": {
    "chapters": { "min": 8, "max": 12 },
    "wordsPerChapter": { "min": 4000, "max": 6000 },
    "totalWords": { "min": 40000, "max": 60000 }
  }
}
```

Default targets are set based on book type during `/author:init`.

## Compilation Targets

| Target | Format | Use Case |
|--------|--------|----------|
| Web | Bundled Markdown (SpecMD) | Web publishing |
| PDF | LaTeX | Print publishing |
| Markdown | Linked files | Documentation sites |
