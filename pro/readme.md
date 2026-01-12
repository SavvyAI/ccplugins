# Pro Plugin

Professional development workflows with intelligent planning and automation.

## Installation

```bash
/plugin marketplace add SavvyAI/ccplugins
/plugin install pro@ccplugins
```

## What This Plugin Provides

Installing this plugin gives Claude Code:

- **Slash Commands** - Workflow commands (`/pro:feature`, `/pro:pr`, etc.) that guide you through planning, development, and PR workflows
- **MCP Servers** - Pre-configured servers: Playwright, Context7, Supabase, Chrome DevTools, Figma, and shadcn-ui
- **Skills** - Bundled agent skills that enhance Claude's capabilities
- **Subagents** - Background workers that run proactively during development

## Commands

| Command | Description |
|---------|-------------|
| `/pro:feature` | Start a new feature with guided planning |
| `/pro:bug` | Report and fix a bug with structured capture |
| `/pro:spike` | Time-boxed exploratory work with optional documentation |
| `/pro:chore` | Maintenance work (infra, docs, tests, deps, CI/config) |
| `/pro:refactor` | Create a branch for systematic refactoring |
| `/pro:spec.import` | Ingest and persist a PRD/spec, auto-parse to backlog |
| `/pro:spec` | View imported specifications (read-only) |
| `/pro:audit` | Full audit: runs quality + security, unified report |
| `/pro:audit.quality` | Analyze requirements, tests, docs, and production readiness |
| `/pro:audit.security` | Deep security scan: CVE, OWASP Top 10, secrets, framework analysis |
| `/pro:backlog` | Pick items from backlog to work on |
| `/pro:backlog.add` | Add an item to the backlog manually |
| `/pro:backlog.resume` | Resume in-progress OR start recommended next item |
| `/pro:roadmap` | Dashboard view of project status |
| `/pro:pr` | Archive planning docs and create a pull request |
| `/pro:pr.resolve` | Address PR review comments systematically |
| `/pro:pr.merged` | Clean up after a successful merge |
| `/pro:og` | Generate OG images and social sharing metadata |
| `/pro:handoff` | Generate comprehensive codebase handoff report |
| `/pro:wtf` | Quick situational report (alias for handoff) |
| `/pro:onboarding` | Interactive setup guide for new developers |
| `/pro:rules` | View bundled CLAUDE.md coding rules |
| `/pro:rules.install` | Install bundled CLAUDE.md via symlink |
| `/pro:supabase.local` | Setup and manage local Supabase with unique ports |
| `/pro:dev.setup` | Setup npx dev server management with auto port allocation |
| `/pro:copy.questions` | Copy recent clarifying questions to clipboard |
| `/pro:git.main` | Standardize default branch to `main` with explicit confirmation |
| `/pro:bip` | Review and manage your "build in public" content queue |
| `/pro:bip.setup` | Configure your voice/tone for build-in-public drafts |
| `/pro:product.brief` | Distill unstructured ideas into structured product brief |
| `/pro:product.validate` | Brutal market validation from a harsh co-founder persona |
| `/pro:product.pitch` | Generate investor-ready pitch deck outline from validation |

## Workflow

```
# Feature development
/pro:feature "add CSV export"   # Plan and start
/pro:backlog.resume             # Resume later
/pro:audit                      # Full audit (quality + security)
/pro:audit.quality              # Quick completeness check
/pro:audit.security             # Security-only scan
/pro:pr                         # Create PR
/pro:pr.resolve                 # Address feedback
/pro:pr.merged                  # Clean up

# Bug fixes
/pro:bug "login fails silently" # Capture, investigate, fix

# Exploratory work
/pro:spike "evaluate auth libs" # Time-boxed exploration

# Maintenance work
/pro:chore "update deps"        # Infra, docs, tests, deps, CI

# Spec ingestion (lossless PRD/spec handling)
/pro:spec.import <paste spec>   # Persist spec, auto-parse to backlog
/pro:spec                       # View imported specs
/pro:spec spec-001              # View specific spec details

# Backlog management
/pro:roadmap                    # See project status
/pro:backlog                    # Pick items (or resume in-progress)
/pro:backlog.add "add retry"    # Add item manually
/pro:backlog.resume             # Resume in-progress work

# Git utilities
/pro:git.main                   # Standardize default branch to 'main'

# Product validation (pre-repo, idea stage)
/pro:product.brief "idea here"  # Distill chaos into structured brief
/pro:product.validate           # Brutal market validation
/pro:product.pitch              # Generate pitch deck outline
```

## Bundled MCP Servers

| Server | Purpose |
|--------|---------|
| **Playwright** | Browser automation for visual verification |
| **Context7** | Up-to-date documentation for any library |
| **Supabase** | Local database operations (requires setup) |
| **Chrome DevTools** | Browser debugging, performance analysis, and automation |
| **Figma** | Figma design file access and integration |
| **shadcn-ui** | Access shadcn/ui v4 components, blocks, and implementations |

### Shell Configuration (Optional MCP Servers)

Some MCP servers require environment variables. Add these to your shell config (`.zshrc` or `.bashrc`):

```bash
# GitHub token for shadcn-ui MCP (optional, increases rate limit from 60 to 5000/hr)
export GITHUB_TOKEN='ghp_your_token_here'

# Supabase env vars from running local instance
# Handles edge cases: silent fail if not installed, skips if services stopped
out="$(supabase status --output env 2>/dev/null)"; \
  echo "$out" | grep -q '^Stopped services:' && true || \
  eval "$(echo "$out" | grep -E '^[A-Z_][A-Z0-9_]*=' | sed 's/^SERVICE_ROLE_KEY=/SUPABASE_SERVICE_ROLE_KEY=/' | sed 's/^/export /')"
```

After adding, restart your shell or run `source ~/.zshrc`.

**Note:** If these env vars are not set, you'll see warnings in `/plugin` UI. The plugin still works - only those specific MCP servers will be unavailable.

### Playwright Setup

By default, the plugin uses standard [@playwright/mcp](https://github.com/microsoft/playwright-mcp) which launches a standalone Chrome instance for browser automation.

**Alternative: playwriter (Chrome extension-based)**

[playwriter](https://github.com/remorses/playwriter) offers an alternative approach using a Chrome extension instead of launching a separate browser:

- Uses 90% less context window with a single `execute` tool
- Works in your existing browser session (preserves extensions, logins)
- Enables collaboration between user and AI on the same page
- Requires manual Chrome extension installation

To switch to playwriter:

```bash
# Set environment variable before starting Claude Code
export USE_PLAYWRITER=1
```

**playwriter setup:**
1. Install the [playwriter Chrome extension](https://chromewebstore.google.com/detail/playwriter) and pin it to your toolbar
2. Click the extension icon on tabs you want to automate (turns green when connected)
3. Set `USE_PLAYWRITER=1` in your environment
4. Restart Claude Code

The wrapper automatically enables `PLAYWRITER_AUTO_ENABLE` for automatic initial tab creation.

**Comparison:**

| Feature | Standard Playwright | playwriter |
|---------|-------------------|------------|
| Browser instance | Standalone Chrome | Your existing browser |
| Extensions | None | Your installed extensions |
| Context window | ~17 tools | Single `execute` tool |
| Setup | Works out of box | Requires extension install |
| Detection bypass | Limited | Can disconnect for login |

### Supabase Setup

Use `/pro:supabase.local` to initialize and manage local Supabase instances with unique ports per project.

The Supabase MCP requires `SUPABASE_SERVICE_ROLE_KEY` in your environment. See [Shell Configuration](#shell-configuration-optional-mcp-servers) for the recommended setup.

### shadcn-ui Setup

The shadcn-ui MCP works out of the box but benefits from a GitHub token for higher rate limits (5000 vs 60 requests/hour). See [Shell Configuration](#shell-configuration-optional-mcp-servers) for setup.

The server provides access to shadcn/ui v4 components across React, Vue, Svelte, and React Native frameworks.

## Product Validation Pipeline

A three-command pipeline for early-stage idea validation:

```
Raw Idea → /pro:product.brief → /pro:product.validate → /pro:product.pitch
```

### The Harsh Co-Founder

`/pro:product.validate` acts like a brutal but fair technical co-founder:
- Destroys weak ideas with evidence-based criticism
- Confirms strong ideas with clear GO signal
- Uses deep web research to back every claim
- Produces GO / CAUTION / NO-GO verdict

### Works Pre-Repo

These commands work in any directory, even before git init:
- Perfect for validating ideas before committing to a project
- Storage at `.plan/product/` with timestamped versioning
- Brief, validation reports, and pitch outlines all persist for reference

### Workflow

```bash
# 1. Dump your unstructured idea
/pro:product.brief "I want to build a TurboTax for energy rebates..."

# 2. Get brutal market validation
/pro:product.validate

# 3. Generate pitch deck outline (if validated)
/pro:product.pitch
```

## Bundled Skills

| Skill | Description |
|-------|-------------|
| **frontend-design** | Create distinctive, production-grade frontend interfaces with high design quality. Automatically used when building web components, pages, dashboards, or styling any web UI. |
| **build-in-public** | Automatically surface notable development moments and draft shareable content for X and LinkedIn. Proposes posts when features ship, bugs are solved, milestones are reached, design decisions are made, or learnings are discovered. |
| **content-retriever** | Reliably retrieve any public web content from URLs. Handles X, LinkedIn, YouTube, TikTok, Instagram, Pinterest, and blogs with platform-aware extraction. Uses tiered fallback (WebFetch → Playwright → user paste) for maximum reliability. Silent on success, reports only on deviation. |
| **product-brief** | Transform unstructured idea material into structured product briefs. Handles voice transcriptions, notes, or stream-of-consciousness input. Produces versioned briefs ready for validation. |

Skills are automatically available when the plugin is installed. Claude uses them when relevant to your task.

> The `frontend-design` skill is sourced from [Anthropic's skills repository](https://github.com/anthropics/skills) (Apache 2.0).

## Bundled Subagents

| Subagent | Description |
|----------|-------------|
| **build-in-public** | Runs proactively after feature completions, bug fixes, PRs, and milestones to surface shareable content. |

Subagents appear in `/agents` alongside your custom agents. They run automatically when Claude detects relevant moments.

### Build in Public

The `build-in-public` subagent + skill work together:

- **Subagent** runs proactively after completing features, fixing bugs, creating PRs, or reaching milestones
- **Skill** provides detailed instructions for drafting platform-specific content

When notable moments occur, content is proposed inline:
- Feature shipped
- Bug solved
- Milestone reached
- Design decision made
- Learning discovered

You can approve, edit, defer, or skip. Use `/pro:bip` to review your pending queue.

**Voice calibration:** Run `/pro:bip.setup` to configure your tone. Choose from presets (casual-technical, professional, minimal, storyteller, teacher) or provide example posts to match your style.

---

Part of [ccplugins](../readme.md)
