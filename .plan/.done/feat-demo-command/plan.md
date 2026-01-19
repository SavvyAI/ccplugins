# Spike: /pro:demo Command Design

**Branch:** `spike/demo-command-design`
**Backlog Item:** #74
**Date:** 2026-01-19

## Problem Statement

The existing commands for understanding a project are too heavy for quick refreshers:

| Command | Focus | Weight |
|---------|-------|--------|
| `/pro:onboarding` | Setup verification, tool installation | Heavy - 5 phases, many prompts |
| `/pro:wtf` | Codebase analysis, health report | Medium - generates comprehensive report |
| `/pro:handoff` | Documentation for team transitions | Heavy - comprehensive institutional knowledge |

**Gap:** No lightweight "just show me what this thing does" command that:
1. Starts runnable things (servers, CLIs)
2. Walks through features interactively
3. Points to relevant docs
4. Holds your hand without the overhead

## Design Decision: `/pro:demo`

**Name:** `/pro:demo` (over `/pro:tour`)
- More action-oriented ("demo this for me")
- Universally understood
- More memorable

**Tagline:** "Show me what this does."

## Positioning vs Existing Commands

```
/pro:demo     → "Show me what this does" (interactive walkthrough)
/pro:onboarding → "Help me set this up" (setup verification)
/pro:wtf      → "What's going on here?" (situational analysis)
/pro:handoff  → "Document this for others" (comprehensive docs)
```

## Design Principles

1. **Lightweight** - No reports, no files generated, just interaction
2. **Interactive** - Guided walkthrough, not passive documentation
3. **Action-first** - Start things, run things, show things
4. **Non-destructive** - Read-only exploration, stop servers when done
5. **Incremental** - User controls pace, can exit anytime

## Proposed Structure

### Phase 1: Quick Scan (5 seconds)
- What is this project? (from package.json name/description or README first paragraph)
- What can be run? (dev server, CLI, tests, etc.)

### Phase 2: Feature Discovery
Detect and categorize runnable entry points:

| Type | Detection | Action |
|------|-----------|--------|
| **Dev Server** | `dev`, `start`, `serve` scripts | Offer to start, show URL |
| **CLI Tool** | `bin` field in package.json | Offer to run `--help` |
| **API Server** | Express/Fastify/etc detection | Offer to start, show endpoints |
| **Tests** | `test` script | Offer to run test suite |
| **Build** | `build` script | Explain what it produces |

### Phase 3: Guided Walkthrough
For each detected feature, offer interactive exploration:

```
Found: Dev server (npm run dev)
→ Start it? [Y/n]

[Server starts]
→ Running at http://localhost:3000
→ Key routes detected:
  - / (home)
  - /api/users
  - /dashboard

→ Continue to next feature? [Y/n/stop server]
```

### Phase 4: Key Docs Pointer
Point to docs **only if they exist**:
- `README.md` - "Start here for overview"
- `docs/` or `documentation/` - "Detailed documentation"
- `CLAUDE.md` - "AI coding rules"
- `CONTRIBUTING.md` - "How to contribute"

No file listing if nothing exists.

### Phase 5: Cleanup
- Stop any servers started during demo
- Summary of what was explored

## Interaction Model

```
/pro:demo

┌────────────────────────────────────────────────────────┐
│ 📦 Project: ccplugins                                  │
│ 📝 Professional development workflows for Claude Code  │
└────────────────────────────────────────────────────────┘

This project has:
• 2 plugins (pro, author)
• 40+ slash commands
• 6 bundled MCP servers
• No dev server (it's a plugin, not an app)

Would you like to:
[1] See available commands
[2] Explore a specific plugin
[3] Read key documentation
[q] Exit demo

> 1

Pro Plugin Commands (top 5 by usage):
┌──────────────────┬────────────────────────────────────────┐
│ /pro:feature     │ Start a new feature with planning      │
│ /pro:pr          │ Create a pull request                  │
│ /pro:backlog     │ Pick items from backlog                │
│ /pro:audit       │ Run quality + security audit           │
│ /pro:demo        │ (you are here)                         │
└──────────────────┴────────────────────────────────────────┘

Full list: pro/readme.md

[Continue] [Back] [Exit]
```

## Special Cases

### 1. Plugin Projects (like ccplugins)
- No dev server to start
- Instead: list commands, show plugin structure
- Offer to run a command as demo

### 2. CLI Tools
- Run `--help` or `--version`
- Show example invocations from README

### 3. Library/Package
- Show exports
- Run test suite as "does it work?" check

### 4. Web Application
- Start dev server
- Open in browser (if Playwright available)
- Show key routes

### 5. API Only
- Start server
- List endpoints
- Offer to make test request (GET only)

## Tools Required

```yaml
allowed-tools:
  - Bash      # Start/stop servers, run commands
  - Read      # Check package.json, README, etc.
  - Glob      # Find docs, detect project structure
  - Grep      # Find specific patterns
  - AskUserQuestion  # Interactive prompts
```

No `Write` - this command is read-only and interactive.

## Success Criteria

1. User can run `/pro:demo` and understand what a project does in < 2 minutes
2. No files created or modified
3. Any started processes are cleaned up on exit
4. Works for: web apps, CLI tools, libraries, plugins, API servers

## Out of Scope (v1)

- Screenshot generation
- Browser automation (keep it terminal-only for v1)
- Detailed code exploration
- Performance metrics
- Dependency analysis

## Implementation Notes

### Server Management
- Use background process with timeout
- Track PIDs for cleanup
- Detect ready signals (port listening, "ready" in output)

### CLI Detection
```javascript
// From package.json
{
  "bin": {
    "my-cli": "./bin/cli.js"
  }
}
// → Offer to run: npx my-cli --help
```

### Route Detection (Web Apps)
- Check for Next.js pages/app directory
- Check for Express/Fastify route files
- Parse route patterns from code

## Related ADRs

- **ADR-007**: Interactive Phased Onboarding - inspiration for phase structure
- **ADR-017**: Branch Naming Invariant - N/A (no branch creation)

## Questions to Resolve

1. Should this command auto-open browser for web apps?
   - Lean: No for v1, keep it terminal-only

2. Should it remember previous demos?
   - Lean: No for v1, each run is fresh

3. Should it detect and highlight recent changes?
   - Lean: No, that's `/pro:wtf` territory

## Next Steps

If spike is approved for promotion:
1. Create feature branch `feat/demo-command`
2. Implement `pro/commands/demo.md`
3. Add to `pro/readme.md` command table
4. Create ADR documenting the design decision

---

*Generated from spike exploration on 2026-01-19*
