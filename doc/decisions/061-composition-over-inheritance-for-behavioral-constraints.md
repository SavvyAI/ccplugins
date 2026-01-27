# 061. Composition Over Inheritance for Behavioral Constraints

Date: 2026-01-27

## Status

Accepted

## Context

While building `/author:intent`, a cross-cutting behavioral constraint emerged: "never generate prose, flag gaps with `[NEEDS INPUT]` instead of inventing content." The question arose of where to codify this so it applies to future commands like `/author:filter`.

The obvious location was `author/CLAUDE.md` (the plugin-level instruction file). However, CLAUDE.md operates like nested inheritance in OOP — rules defined in a parent context silently affect child behavior. When you read a command file, you see its steps and constraints. You don't see the additional rules inherited from CLAUDE.md unless you know to look. This makes the system harder to reason about and creates invisible coupling.

Skills, by contrast, operate like composition. A command explicitly references a skill, and the behavioral constraints are visible at the point of use. You can trace what's composed into a command by reading the command itself.

## Decision

Prefer skills (composition) over CLAUDE.md rules (inheritance) for cross-cutting behavioral constraints.

Specific guidelines:

1. **Command files are self-contained.** A command's behavioral constraints should be readable in the command file itself, not hidden in a parent CLAUDE.md.

2. **CLAUDE.md is for structural/architectural principles.** Things like "markdown as single source of truth" or "no runtime state" describe the system's architecture. They don't change how individual commands behave at runtime.

3. **When a behavioral rule appears in 2+ command files, extract it into a skill.** This prevents drift between commands that should enforce the same constraints.

4. **Skills are explicit composition.** A command that references a skill makes its dependencies visible. No action at a distance.

## Consequences

**Positive:**
- Command files are self-documenting — you can reason about a command's behavior by reading one file
- Cross-cutting constraints are enforced consistently via shared skills rather than duplicated text that can drift
- Clear separation: CLAUDE.md = architecture, skills = behavioral composition, commands = execution

**Negative:**
- Some duplication exists until the extraction threshold (2+ commands) is reached
- Requires discipline to recognize when duplication warrants extraction

## Alternatives Considered

1. **Add behavioral rules to CLAUDE.md**: Rejected. Creates "action at a distance" — you can't see the full picture by reading a command file. Same problem as deep class inheritance.

2. **Only keep rules in command files, never extract**: Rejected. Leads to drift when multiple commands should enforce identical constraints. Copy-paste behavioral rules diverge over time.

3. **Repo-root CLAUDE.md for development conventions**: Rejected for behavioral constraints. Acceptable for meta-level development practices (like this ADR itself), but not for rules that change how commands execute.

## Related

- ADR-060: Author Intent — Pre-Writing Compression Command (first instance of the behavioral constraints)
- ADR-014: Skills Directory for Bundled Agent Skills
