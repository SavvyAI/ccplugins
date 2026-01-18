## Context

Initialize a new book project with standard structure.

## Purpose

Create the directory structure and manifest files needed for a long-form writing project.

**Given** no existing `book/` directory
**When** `/author:init` is invoked
**Then** the directory structure and manifest files are created

## Your Task

### Step 1: Check for Existing Project

```bash
ls book/book.json 2>/dev/null
```

If `book/book.json` exists, the project is already initialized. Check for missing tooling:

```bash
ls scripts/compile-latex.mjs 2>/dev/null
ls package.json 2>/dev/null
```

**If both scripts and package.json exist:**
- Display: "Book project is fully initialized. Use `/author:chapter` to add content."
- Exit

**If book exists but tooling is missing:**

Use `AskUserQuestion`:

```
question: "This book project is missing compilation tooling (scripts/package.json). Add it now?"
header: "Upgrade"
options:
  - "Yes, add tooling (Recommended)" (add scripts and package.json)
  - "No, skip" (continue without tooling)
```

If "Yes, add tooling":
- Read book title and author from `book/book.json`
- Skip to Step 5.5 (Create Compilation Scripts) and Step 5.6 (Create package.json)
- Skip to Step 8 (Update .gitignore) - append missing patterns only
- Display upgrade confirmation and exit

If "No, skip":
- Display: "Skipped. Use `/author:chapter` to add content."
- Exit

**If book/ does not exist:**
- Continue with Step 2 (fresh initialization)

### Step 2: Check for Existing Content

Use `AskUserQuestion`:

```
question: "Do you have existing content to import?"
header: "Import"
options:
  - "No, start fresh (Recommended)" (create empty project structure)
  - "Yes, I have a draft to import" (import existing markdown)
```

If "Yes, I have a draft to import":
- Display: "Great! Let's import your existing content."
- Delegate to `/author:weave` command (it will detect the empty book and use bulk scaffold mode)
- Exit this command (weave handles everything)

If "No, start fresh":
- Continue with Steps 3-9 below

### Step 3: Gather Book Metadata

Use `AskUserQuestion` to collect:

```
question: "What is the title of your book?"
header: "Title"
options:
  - "Untitled Book" (placeholder - I'll name it later)
```

```
question: "Who is the author?"
header: "Author"
options:
  - Use git config user.name
```

### Step 4: Select Book Type and Targets

Use `AskUserQuestion`:

```
question: "What type of book are you writing?"
header: "Book Type"
options:
  - "Business/Leadership" (40-60k words, 8-12 chapters)
  - "Technical Manual" (60-100k words, 15-25 chapters)
  - "Field Guide" (20-40k words, 5-10 chapters)
  - "Memoir" (60-80k words, 12-20 chapters)
  - "Academic" (80-100k words, 8-12 chapters)
  - "General" (50-75k words, 10-15 chapters)
multiSelect: false
```

Map selection to `bookType` and default targets:

| Selection | bookType | Chapters | Words/Chapter | Total Words |
|-----------|----------|----------|---------------|-------------|
| Business/Leadership | business | 8-12 | 4,000-6,000 | 40,000-60,000 |
| Technical Manual | technical | 15-25 | 3,000-5,000 | 60,000-100,000 |
| Field Guide | field-guide | 5-10 | 3,000-5,000 | 20,000-40,000 |
| Memoir | memoir | 12-20 | 4,000-6,000 | 60,000-80,000 |
| Academic | academic | 8-12 | 6,000-10,000 | 80,000-100,000 |
| General | general | 10-15 | 4,000-6,000 | 50,000-75,000 |

Then ask:

```
question: "Accept these targets or customize?"
header: "Targets"
options:
  - "Accept defaults (Recommended)" (use defaults for selected book type)
  - "Customize targets" (modify chapter count and word counts)
multiSelect: false
```

If "Customize targets":
- Ask for chapter count range (see `/author:targets.edit` for options)
- Ask for words per chapter range
- Ask for total word count range

### Step 5: Create Directory Structure

```bash
mkdir -p book/chapters
mkdir -p book/front-matter
mkdir -p book/back-matter
mkdir -p book/dist/specmd
mkdir -p book/dist/latex
mkdir -p book/dist/markdown
mkdir -p scripts
```

### Step 5.5: Create Compilation Scripts

Copy the bundled compilation scripts from `author/commands/_bins/init/` to the project's `scripts/` directory:

1. **Read** `author/commands/_bins/init/compile-latex.mjs`
2. **Write** to `scripts/compile-latex.mjs`
3. **Read** `author/commands/_bins/init/preview-pdf.mjs`
4. **Write** to `scripts/preview-pdf.mjs`

These scripts enable self-service book compilation without invoking Claude Code.

### Step 5.6: Create package.json

Read `author/commands/_bins/init/package.template.json` and substitute placeholders:

- `{{PACKAGE_NAME}}` → slugified book title (lowercase, hyphens, e.g., "my-awesome-book")
- `{{TITLE}}` → book title as provided
- `{{AUTHOR}}` → author name as provided

Write the result to `package.json` in the project root.

**Example output:**

```json
{
  "name": "the-leverage-gap",
  "version": "0.1.0",
  "description": "The Leverage Gap",
  "type": "module",
  "private": true,
  "scripts": {
    "compile:latex": "node scripts/compile-latex.mjs",
    "compile:pdf": "node scripts/preview-pdf.mjs --no-open",
    "preview": "node scripts/preview-pdf.mjs"
  },
  "author": "Wil Moore III",
  "license": "UNLICENSED"
}
```

### Step 6: Create Book Manifest

Write `book/book.json`:

```json
{
  "title": "<user-provided title>",
  "author": "<user-provided or git config author>",
  "version": "0.1.0",
  "created": "<ISO 8601 timestamp>",
  "bookType": "<selected book type>",
  "targets": {
    "chapters": { "min": <N>, "max": <N> },
    "wordsPerChapter": { "min": <N>, "max": <N> },
    "totalWords": { "min": <N>, "max": <N> }
  },
  "chapters": [],
  "frontMatter": [],
  "backMatter": [],
  "compilationTargets": ["specmd", "latex", "markdown"]
}
```

### Step 7: Create Starter Content

Write `book/front-matter/title.md`:

```markdown
# <Book Title>

By <Author Name>

---

*Draft version 0.1.0*
```

Write `book/chapters/00-preface.md`:

```markdown
# Preface

[Your preface goes here. This chapter explains the motivation behind the book, who it's for, and what readers will learn.]
```

### Step 8: Update .gitignore

If `.gitignore` exists, append (if not already present). If `.gitignore` does not exist, create it:

```
# Author plugin build outputs
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

### Step 9: Display Confirmation

```
╔════════════════════════════════════════════════════════════════╗
║  BOOK PROJECT INITIALIZED                                       ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  Title: <Book Title>                                            ║
║  Author: <Author Name>                                          ║
║  Type: <Book Type>                                              ║
║                                                                 ║
║  Targets:                                                       ║
║  - Chapters: <min>-<max>                                        ║
║  - Words/Chapter: <min>-<max>                                   ║
║  - Total Words: <min>-<max>                                     ║
║                                                                 ║
║  Structure created:                                             ║
║  ./                                                             ║
║  ├── package.json        (npm scripts)                          ║
║  ├── scripts/            (compilation tools)                    ║
║  │   ├── compile-latex.mjs                                      ║
║  │   └── preview-pdf.mjs                                        ║
║  └── book/                                                      ║
║      ├── book.json       (manifest)                             ║
║      ├── chapters/       (your content)                         ║
║      │   └── 00-preface.md                                      ║
║      ├── front-matter/   (title, dedication)                    ║
║      │   └── title.md                                           ║
║      ├── back-matter/    (appendix, bibliography)               ║
║      └── dist/           (compiled outputs)                     ║
║                                                                 ║
║  Next steps:                                                    ║
║  - Add chapters: /author:chapter "Chapter Title"                ║
║  - View progress: /author:status                                ║
║  - Preview as PDF: npm run preview                              ║
║  - Compile book: /author:compile                                ║
║                                                                 ║
║  Requirements for PDF: Node.js 18+ and pdflatex                 ║
║  (brew install texlive)                                         ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
```

## Edge Cases

- **Existing project:** Inform user, do not overwrite
- **No git config:** Prompt for author name explicitly
- **Special characters in title:** Sanitize for filesystem when creating slugs
