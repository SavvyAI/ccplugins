# 056. Demo Command - Lightweight Project Walkthrough

Date: 2026-01-19

## Status

Accepted

## Context

The Pro plugin has several commands for understanding projects:

| Command | Purpose | Weight |
|---------|---------|--------|
| `/pro:onboarding` | Setup verification for new developers | Heavy - 5 phases, many prompts |
| `/pro:wtf` | Situational analysis, codebase health | Medium - generates comprehensive report |
| `/pro:handoff` | Documentation for team transitions | Heavy - comprehensive institutional knowledge |

Users expressed a need for something lighter: "I forgot what this project does. Just show me." The existing commands are too heavy for quick refreshers - they assume either new setup (`onboarding`), deep analysis (`wtf`), or documentation needs (`handoff`).

Key requirements:
1. Quick - under 2 minutes to understand a project
2. Interactive - user controls pace and depth
3. Action-oriented - start things, run things, not just describe
4. Non-destructive - read-only, clean up after itself

## Decision

We will implement `/pro:demo` as a lightweight, interactive project walkthrough command.

### Positioning in Command Spectrum

```
Lightweight ←————————————————————————→ Heavyweight

/pro:demo    /pro:wtf    /pro:onboarding    /pro:handoff
(interactive) (analysis)  (setup)            (documentation)
```

### Key Design Choices

1. **No file output** - Unlike `wtf`/`handoff`, produces no report files
2. **Menu-based navigation** - User chooses what to explore, not linear phases
3. **Action-first** - Offers to start dev servers, run CLIs, execute tests
4. **Automatic cleanup** - Tracks and stops any processes started during demo
5. **Project-type aware** - Different flows for web apps, CLIs, libraries, plugins

### Name Selection

Chose `/pro:demo` over alternatives:
- `tour` - More passive connotation
- `quickstart` - Overlaps with README content
- `explore` - Already used for codebase search
- `showme` - Too informal

`demo` is action-oriented ("demo this for me") and universally understood.

## Consequences

**Positive:**
- Fills gap in command spectrum for quick project understanding
- Lightweight alternative when full analysis not needed
- Interactive approach teaches by doing
- Menu-based navigation allows non-linear exploration
- No cleanup needed - command is self-contained

**Negative:**
- Another command to remember (mitigated by memorable name)
- Overlap with parts of onboarding (Phase 4: First Steps)
- Terminal-only for v1 (no browser automation)

**Future enhancements:**
- Browser integration for web apps
- Shareable demo recordings (GIF/video)
- Custom demo scripts via project config

## Alternatives Considered

### 1. Enhance `/pro:onboarding` with "quick mode"
Add a flag or option to skip setup phases.

**Rejected because:** Onboarding's core purpose is setup verification. Adding a quick mode would dilute its focus and create a confusing hybrid.

### 2. Add `/pro:wtf --quick`
Make wtf support a lightweight mode.

**Rejected because:** wtf is fundamentally about analysis and report generation. A quick mode would still want to produce output, which conflicts with the "no files" requirement.

### 3. Use `/pro:tour` instead
More suggestive of guided walkthrough.

**Rejected because:** `demo` is more memorable and action-oriented. "Demo this for me" is natural language.

## Related

- **ADR-007**: Interactive Phased Onboarding - inspiration for phase structure
- **Spike**: `.plan/spike-demo-command-design/` - design exploration
- **Backlog**: #74 (spike), #75 (feature)
