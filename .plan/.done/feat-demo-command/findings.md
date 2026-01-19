# Spike Findings: /pro:demo Command

**Branch:** `spike/demo-command-design`
**Date:** 2026-01-19
**Status:** Complete - Ready for promotion

## What Was Explored

### Problem Space
Investigated the gap between existing project understanding commands:

| Command | Purpose | Why It's Not Right for Quick Demos |
|---------|---------|-----------------------------------|
| `/pro:onboarding` | Setup verification | Too heavy - 5 phases, assumes new developer |
| `/pro:wtf` | Situational analysis | Generates reports, passive not interactive |
| `/pro:handoff` | Team documentation | Comprehensive docs, not quick exploration |

**User need:** "I forgot what this project does. Just show me."

### Competitive Analysis
Reviewed existing command patterns in ccplugins:
- **ADR-007** defines the 5-phase onboarding structure
- Commands fall into: utility (no git), workflow (git-based), analysis (reports)
- No existing command fills the "quick interactive demo" niche

### Naming Exploration

| Candidate | Pros | Cons | Verdict |
|-----------|------|------|---------|
| `/pro:demo` | Action-oriented, memorable, universal | Could imply canned presentation | **Selected** |
| `/pro:tour` | Guided walkthrough feel | Passive connotation | Runner-up |
| `/pro:quickstart` | Common in docs | Overlaps with README content | Rejected |
| `/pro:explore` | Learning intent | Already used for codebase search | Rejected |
| `/pro:showme` | Captures intent | Too informal | Rejected |

## Key Learnings

### 1. The Commands Spectrum
Discovered a clear spectrum of project understanding commands:

```
Lightweight ←————————————————————————→ Heavyweight

/pro:demo    /pro:wtf    /pro:onboarding    /pro:handoff
(interactive) (analysis)  (setup)            (documentation)
```

`/pro:demo` fills the leftmost position that was previously empty.

### 2. Project Type Matters
Different project types need different demo approaches:

| Project Type | Demo Focus |
|--------------|------------|
| Web App | Start dev server, show routes, open browser |
| CLI Tool | Run `--help`, show example invocations |
| Library | Show exports, run test suite |
| Plugin | List commands, show structure |
| API Server | Start server, list endpoints |

### 3. Read-Only is Key
Unlike other commands, `/pro:demo` should:
- Create no files
- Modify nothing
- Clean up any processes it starts
- Be completely non-destructive

This differentiates it from `/pro:wtf` (creates report file) and `/pro:onboarding` (runs setup commands).

### 4. Interactive Control
User should control the pace:
- Choose what to explore
- Skip sections
- Exit anytime
- Decide whether to start servers

Not a linear walkthrough like onboarding.

## Decisions Made

### Decision 1: Name is `/pro:demo`
**Rationale:** More action-oriented and memorable than alternatives. "Demo this for me" is natural language.

### Decision 2: No File Output
**Rationale:** Keeps it lightweight. If user wants documentation, they use `/pro:wtf` or `/pro:handoff`.

### Decision 3: Terminal-Only for v1
**Rationale:** Browser automation adds complexity. Can add Playwright integration later if needed.

### Decision 4: Menu-Based Navigation
**Rationale:** Allows user to explore non-linearly, unlike onboarding's sequential phases.

### Decision 5: Utility Command (No Branch)
**Rationale:** This is exploratory, not a workflow command. No git operations needed.

## Recommendations

### Immediate: Promote to Feature
This spike has produced a clear, implementable design. Recommend:
1. Create `feat/demo-command` branch
2. Implement `pro/commands/demo.md`
3. Update `pro/readme.md` with new command
4. Create ADR documenting the design

### Future Enhancements (Post-v1)
1. **Browser integration** - Auto-open web apps in browser
2. **Demo history** - Remember what was shown before
3. **Shareable demos** - Generate GIF/video of walkthrough
4. **Custom demo scripts** - Project-specific demo flows via config

### Integration Points
- Could be called from `/pro:onboarding` as "preview before setup"
- Could link to `/pro:wtf` for "want more details?"

## Artifacts

| File | Purpose |
|------|---------|
| `plan.md` | Detailed design specification |
| `findings.md` | This document - spike learnings |

## Next Steps

1. **Create feature branch:** `feat/demo-command`
2. **Implement command:** `pro/commands/demo.md`
3. **Create ADR:** Document the lightweight demo command design decision
4. **Update readme:** Add to command table in `pro/readme.md`

---

*Spike completed 2026-01-19. Ready for promotion to feature.*
