# 049. Code Quality Skill Architecture

Date: 2026-01-12

## Status

Accepted (Experimental)

## Context

Claude Code exhibits naive default behaviors when writing code:
- Creates logger abstractions but uses `console.log` inside them
- Uses class inheritance for error hierarchies
- Hardcodes configuration values
- Treats code like a prototype instead of production-ready

The user wanted to enforce production-ready coding standards during development—not as a refactoring pass afterward.

Several approaches were considered:
1. **Skill only** - Claude sees description, applies when relevant
2. **Subagent only** - Background worker runs proactively after code changes
3. **Dual architecture** (Skill + Subagent) - Per ADR-026 pattern
4. **Enhanced CLAUDE.md** - Add explicit rules to global rules file
5. **CLAUDE.md + Skill hybrid** - Rules reference skill for detailed patterns
6. **Bundled rules file** - `/pro:rules`-style symlink

## Decision

We chose a **skill-only architecture** with a deliberately broad description designed to trigger on ANY coding work:

```yaml
name: code-quality
description: Apply production-grade coding standards to all code. Use when writing any application code, creating abstractions, implementing features, or fixing bugs. Ensures proper logging, error handling, configuration management, and testing patterns. This skill applies to ALL coding work, not just specific frameworks.
```

The skill contains explicit, non-ambiguous patterns for:
- **Logging**: Specific libraries per language (pino, winston, structlog, slog, scala-logging)
- **Error handling**: Discriminated unions and Result types, NOT class hierarchies
- **Configuration**: Validated on startup with zod/pureconfig, fail-fast
- **Database**: Connection pooling, parameterized queries, transactions
- **API clients**: Timeouts, retries, typed responses
- **Scala idioms**: Either/Option/IO, immutability, Resource management

### Philosophy Baked In

- Composition over inheritance
- Return errors, don't throw them
- No "prototype mode"—all code is production code

## Consequences

### Positive

- **Single source of truth**: Patterns live in one skill file, not duplicated in CLAUDE.md
- **Explicit patterns**: No ambiguity about what "proper logging" means
- **Language-specific**: TypeScript, Python, Go, Rust, and Scala idioms included
- **Testable hypothesis**: We can validate whether the broad description triggers reliably

### Negative

- **Unproven trigger mechanism**: Skills are "soft-invoked"—Claude must recognize when to apply
- **May require fallback**: If skill doesn't trigger reliably, may need CLAUDE.md reference or subagent

### Experimental

This is a spike. The success criteria are:
- [ ] Claude uses production loggers without being told
- [ ] Claude uses discriminated unions for errors without being told
- [ ] Claude validates config on startup without being told

If the skill doesn't auto-invoke reliably, fallback options include:
1. Add to global CLAUDE.md: "Always apply the code-quality skill"
2. Create a subagent that validates code quality post-edit (per ADR-026)

## Alternatives Considered

### 1. CLAUDE.md + Skill hybrid

Rejected because duplicating rules in CLAUDE.md defeats the purpose of having a skill as the single source of truth.

### 2. Subagent for proactive validation

Rejected for initial implementation because:
- Subagents are designed for discrete tasks, not continuous coding
- Running after every edit would be noisy/slow
- Doesn't prevent the problem, only catches it after

May revisit if skill-only approach doesn't trigger reliably.

### 3. Class-based error hierarchies

Rejected in favor of discriminated unions because:
- Composition over inheritance
- Better type inference and exhaustiveness checking
- Aligns with functional programming paradigms
- Works better across TypeScript and Scala

## Related

- ADR-014: Skills Directory for Bundled Agent Skills
- ADR-026: Subagent-Skill Dual Architecture for Proactive Features
- Planning: `.plan/.done/spike-production-ready-skill/`
