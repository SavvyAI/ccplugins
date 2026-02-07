# 066. Scaffold Command Namespace Pattern

Date: 2026-02-06

## Status

Accepted

## Context

We wanted to create a command that scaffolds new Chrome extension projects from a production-proven exemplar (browser-extension-conversation-titles-chatgpt). This exemplar includes Vite+CRXJS build tooling, Chrome Web Store publishing automation, and testing infrastructure.

Key questions:
1. How should scaffold commands be organized?
2. Where should templates be stored?
3. How should templates handle variable substitution?
4. How should the command behave on existing vs. new projects?

## Decision

We will use a `/pro:scaffold.*` namespace for scaffolding commands, starting with `/pro:scaffold.chrome-extension`.

### Namespace Pattern

- Format: `/pro:scaffold.{target}`
- Each scaffold command has its own template directory
- Future examples: `/pro:scaffold.cli`, `/pro:scaffold.mcp-server`

### Template Storage

Templates are stored in `pro/commands/_templates/{target}/` following ADR-006 (subdirectory pattern):

```
pro/commands/_templates/chrome-extension/
├── package.json.hbs      (Handlebars template)
├── public/manifest.json.hbs
├── Makefile.hbs
├── e2e/extension-loading.spec.ts.hbs
├── vite.config.ts        (static file)
├── tsconfig.json
└── ...
```

### Template Processing

- Use Handlebars (`{{variableName}}`) for variable substitution
- Files ending in `.hbs` are processed; others are copied as-is
- Variables: `extensionName`, `extensionDisplayName`, `extensionDescription`, `githubUsername`

### Dual Mode Operation

1. **Greenfield Mode** (no existing extension detected):
   - Interactive prompts gather required values
   - All template files copied and processed
   - `npm install` runs automatically
   - Git initialized if needed

2. **Delta Mode** (existing extension detected):
   - Compare project against template structure
   - Show missing files with descriptions
   - Interactive per-file addition: Add / Skip / Add All / Quit
   - Never overwrites without confirmation

### Detection Logic

Existing extension detected when:
- `public/manifest.json` or `manifest.json` contains `manifest_version`
- `package.json` has `@crxjs/vite-plugin` as dependency

## Consequences

**Positive:**
- Production-tested patterns available instantly for new projects
- CWS publishing automation included from day one
- Delta mode helps retrofit existing projects
- Namespace allows future scaffolds without command bloat

**Negative:**
- Templates may become outdated (mitigated by using exemplar as source of truth)
- Handlebars adds a dev dependency when processing templates

**Neutral:**
- Separate from backlog #90 (pattern-aware scaffold) which focuses on in-project pattern following rather than project initialization

## Alternatives Considered

### 1. Clone exemplar repo directly

Rejected because:
- Includes app-specific code
- Requires manual cleanup
- No templatization

### 2. Use `npm create` pattern

Rejected because:
- Requires publishing a separate npm package
- More infrastructure to maintain
- Less integrated with plugin system

### 3. Simple string replacement instead of Handlebars

Rejected because:
- Custom implementation would have edge case bugs
- Handlebars is battle-tested and well-documented
- Minimal dependency cost

## Related

- ADR-006: Subdirectory Pattern for Shared Templates
- ADR-010: Bundled Bin Assets for Setup Commands
- ADR-044: Chrome Extension Developer Skill
- Backlog #90: Pattern-aware scaffold command (deferred unification)
- Planning: `.plan/.done/feat-add-scaffold-chrome-extension-commands/`
