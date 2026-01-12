# Spike: Code Quality Skill

## Uncertainty to Reduce

**Core question**: Can a skill with a broad enough description reliably trigger during ANY coding work without requiring CLAUDE.md duplication?

## What We Built

Created `pro/skills/code-quality/SKILL.md` with:

**Description** (the key to auto-triggering):
```yaml
description: Apply production-grade coding standards to all code. Use when writing any application code, creating abstractions, implementing features, or fixing bugs. Ensures proper logging, error handling, configuration management, and testing patterns. This skill applies to ALL coding work, not just specific frameworks.
```

**Explicit patterns for:**
- Logging: pino/winston (Node), structlog (Python), slog/zap (Go), tracing (Rust), scala-logging/log4cats (Scala)
- Error handling: Discriminated unions, Result types, ADTs - NO class hierarchies
- Configuration: zod (TS), pureconfig (Scala) - fail fast on startup
- Database: Connection pooling, parameterized queries, transactions
- API clients: Timeouts, retries, typed responses
- Scala idioms: Either/Option/IO, immutability, Resource management
- Constants: Named values, no magic numbers

**Philosophy:**
- Composition over inheritance
- Return errors, don't throw them
- No "prototype mode" - all code is production code

## Test Plan

1. Start a fresh Claude Code session in a different project
2. Ask Claude to create a simple service with logging
3. Observe: Does it use pino/winston or console.log?
4. Ask Claude to add error handling
5. Observe: Does it use Result types/discriminated unions or class hierarchies?

## Success Criteria

- [ ] Claude uses production loggers without being told
- [ ] Claude uses discriminated unions for errors without being told
- [ ] Claude validates config on startup without being told
- [ ] No explicit skill reference needed in prompts

## If It Doesn't Trigger

Fallback options to explore:
1. Add to global CLAUDE.md: "Always apply the code-quality skill"
2. Create a subagent that runs after code edits (per ADR-026)
3. Create a hook that validates code quality post-edit

## Related ADRs

- ADR-049: Code Quality Skill Architecture

## Status

- [x] Skill created with broad description
- [ ] Testing skill auto-invocation
- [ ] Document findings
