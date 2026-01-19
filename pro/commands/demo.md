---
description: "Show me what this does? → Interactive project walkthrough → See features in action"
allowed-tools: ["Bash", "Read", "Glob", "Grep", "AskUserQuestion"]
---

# Project Demo

A lightweight, interactive command that walks you through a project's features. Unlike `/pro:onboarding` (setup verification), `/pro:wtf` (situational analysis), or `/pro:handoff` (documentation), this command focuses on "show me what this does."

## Design Principles

1. **Lightweight** - No reports, no files generated
2. **Interactive** - User controls the pace
3. **Action-first** - Start things, run things, show things
4. **Non-destructive** - Read-only exploration
5. **Clean exit** - Stop any processes started during demo

---

## Phase 1: Quick Scan

Gather project identity in under 5 seconds.

### 1.1 Project Identity

Extract from `package.json` (if exists):
- `name` - Project name
- `description` - One-line description
- `version` - Current version

Fallback to:
- Directory name
- First paragraph of README.md

### 1.2 Project Type Detection

Detect the primary project type:

| Type | Detection Method |
|------|-----------------|
| **Web App** | Has `dev`/`start` script + React/Vue/Next/Vite deps |
| **API Server** | Express/Fastify/Hono/Koa in deps |
| **CLI Tool** | Has `bin` field in package.json |
| **Library** | Has `main`/`module`/`exports` but no `bin` |
| **Plugin** | Has `.claude-plugin/` or `plugin.json` |
| **Monorepo** | Has `workspaces` or `pnpm-workspace.yaml` |

### 1.3 Display Summary

```
┌────────────────────────────────────────────────────────┐
│ Project: {name}                                        │
│ {description}                                          │
│ Type: {detected-type} | Version: {version}             │
└────────────────────────────────────────────────────────┘
```

---

## Phase 2: Feature Discovery

Detect what can be run or explored.

### 2.1 Runnable Entry Points

Check `package.json` scripts for:

| Script | Category | Action Offered |
|--------|----------|----------------|
| `dev`, `start`, `serve` | Dev Server | Start and show URL |
| `test`, `test:*` | Tests | Run test suite |
| `build` | Build | Explain what it produces |
| `lint`, `lint:*` | Quality | Run linter |
| `typecheck`, `tsc` | Types | Run type checker |

### 2.2 CLI Detection

If `package.json` has `bin` field:
```json
{
  "bin": {
    "my-cli": "./bin/cli.js"
  }
}
```

Offer to run: `npx {cli-name} --help`

### 2.3 Plugin Detection

For Claude Code plugins, detect:
- Commands in `commands/` directory
- Skills in `skills/` directory
- Agents in `agents/` directory
- MCP servers in `.mcp.json` or `plugin.json`

### 2.4 Documentation Detection

Check for key docs:
- `README.md` - Project overview
- `docs/` or `documentation/` - Detailed docs
- `CLAUDE.md` or `.claude/CLAUDE.md` - AI coding rules
- `CONTRIBUTING.md` - Contribution guide
- `CHANGELOG.md` - Version history

---

## Phase 3: Interactive Menu

Present discovered features as a menu.

### 3.1 Main Menu

Use AskUserQuestion to present options based on what was detected:

**For Web Apps:**
```
What would you like to explore?

[1] Start dev server (npm run dev)
[2] Run test suite
[3] View project structure
[4] Read documentation
[q] Exit demo
```

**For CLI Tools:**
```
What would you like to explore?

[1] See CLI help (npx {name} --help)
[2] View available commands
[3] Run test suite
[4] Read documentation
[q] Exit demo
```

**For Plugins:**
```
What would you like to explore?

[1] List available commands ({count} commands)
[2] List skills and agents
[3] View MCP server configuration
[4] Read documentation
[q] Exit demo
```

**For Libraries:**
```
What would you like to explore?

[1] View exports and API surface
[2] Run test suite
[3] Read documentation
[q] Exit demo
```

### 3.2 Menu Navigation

After each action, return to menu with options:
- Continue exploring
- Go back
- Exit demo

---

## Phase 4: Action Handlers

### 4.1 Start Dev Server

1. Detect the dev command (`dev`, `start`, or `serve`)
2. Ask for confirmation before starting
3. Run in background, capture output
4. Watch for ready indicators:
   - "ready"
   - "listening on"
   - "started"
   - "compiled"
   - URLs like "http://localhost:"
5. Display the URL when ready
6. Track PID for cleanup

**Output:**
```
Starting dev server...
✓ Server running at http://localhost:3000

Press any key to continue (server will keep running)
```

### 4.2 Run CLI Help

1. Detect CLI name from `bin` field
2. Run `npx {cli-name} --help`
3. Display output
4. If multiple CLI commands, list them

### 4.3 Run Tests

1. Detect test command
2. Ask for confirmation (tests may take time)
3. Run and stream output
4. Report pass/fail summary

### 4.4 List Plugin Commands

For Claude Code plugins:

1. Glob for `commands/*.md`
2. Extract command name and description from frontmatter
3. Display as table:

```
Available Commands:
┌──────────────────┬────────────────────────────────────────┐
│ /pro:feature     │ Start a new feature with planning      │
│ /pro:pr          │ Create a pull request                  │
│ /pro:demo        │ Interactive project walkthrough        │
│ ...              │ ...                                    │
└──────────────────┴────────────────────────────────────────┘
```

### 4.5 Show Documentation

List detected docs with one-line descriptions:

```
Documentation:
• README.md - Start here for project overview
• docs/getting-started.md - Setup instructions
• CLAUDE.md - AI coding rules for this project
```

Offer to display any specific file.

### 4.6 View Project Structure

Generate a brief tree of top-level directories:

```
Project Structure:
├── src/           - Source code
├── tests/         - Test files
├── docs/          - Documentation
├── scripts/       - Utility scripts
└── ...
```

Focus on key directories, skip node_modules, .git, etc.

---

## Phase 5: Cleanup

### 5.1 Track Started Processes

Maintain a list of any processes started during the demo:
- Dev servers
- Watch processes
- Background tasks

### 5.2 Exit Handler

When user exits demo:

1. If processes are running, ask:
   ```
   The following processes are still running:
   • Dev server (PID: 12345) at http://localhost:3000

   [K] Keep running
   [S] Stop all
   ```

2. If "Stop all", terminate each process gracefully (SIGTERM)
3. Confirm cleanup complete

### 5.3 Summary

Display brief summary of what was explored:

```
Demo complete!

Explored:
• Started dev server (stopped)
• Viewed 3 commands
• Read README.md

Tip: Run /pro:wtf for detailed codebase analysis
```

---

## Special Cases

### Monorepo Detection

If `workspaces` or `pnpm-workspace.yaml` detected:

1. List packages/apps in the monorepo
2. Offer to demo a specific package
3. Navigate into package and restart demo flow

### No package.json

If no `package.json` exists:

1. Check for other project indicators:
   - `Cargo.toml` (Rust)
   - `go.mod` (Go)
   - `pyproject.toml` / `setup.py` (Python)
   - `Makefile`

2. Adapt feature discovery accordingly
3. If nothing detected, show directory structure and docs only

### Empty/New Project

If project appears empty or just initialized:

```
This looks like a new or empty project.

Not much to demo yet! Here's what exists:
• README.md (12 lines)
• package.json (basic config)

Tip: Run /pro:feature to start building something
```

---

## Interaction Guidelines

1. **Be concise** - Quick descriptions, not essays
2. **Show, don't tell** - Run things rather than explain them
3. **Respect user time** - Each action should complete quickly
4. **Graceful degradation** - If something can't run, explain why and move on
5. **No dead ends** - Always offer a way forward or back

---

## Output Requirements

This command produces **no file output**. All interaction is through:
- Terminal display
- AskUserQuestion prompts
- Bash command execution

This keeps the command lightweight and non-destructive.
