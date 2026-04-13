---
description: "Compare external framework? → Clone, analyze, generate comparison matrix → doc/frameworks/{name}.md with recommendations"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebFetch", "AskUserQuestion"]
---

## Context

Evaluate external framework: $ARGUMENTS

This command systematically evaluates external frameworks, skill packs, or plugins against ccplugins.

## Your Task

**CRITICAL: Branch creation is MANDATORY and must happen FIRST. Never perform any
investigation, code reading, or changes until the branch exists. This is a non-negotiable
safety invariant per ADR-017.**

### Phase 0: Branch Creation

0. **IMMEDIATELY create branch** - Generate a `spike/evaluate-{name}` branch from the repo name:
   - Extract repo name from URL or argument
   - Example: `https://github.com/obra/superpowers` → `spike/evaluate-superpowers`
   - Example: `cursor-rules` → `spike/evaluate-cursor-rules`
   - Do NOT proceed to any other step until branch exists

### Phase 1: Clone & Metadata

1. **Clone to temporary directory**:
   ```bash
   REPO_URL="$ARGUMENTS"  # or construct from owner/repo
   REPO_NAME=$(basename "$REPO_URL" .git)
   TARGET_DIR="$TMPDIR/$REPO_NAME"

   # Clone if not exists
   [ -d "$TARGET_DIR" ] || git clone --depth=100 "$REPO_URL" "$TARGET_DIR"
   ```

2. **Gather metadata** using `gh` and git:

   | Metadata | Command |
   |----------|---------|
   | Stars | `gh repo view {owner}/{repo} --json stargazerCount -q '.stargazerCount'` |
   | First commit | `git -C "$TARGET_DIR" log --reverse --format="%ci" \| head -1` |
   | License | `gh repo view {owner}/{repo} --json licenseInfo -q '.licenseInfo.name'` |
   | Languages | `gh repo view {owner}/{repo} --json languages -q '.languages[].name'` |
   | Description | `gh repo view {owner}/{repo} --json description -q '.description'` |

3. **Immediately report age comparison**:
   ```
   ## Age Comparison

   | Project | First Commit |
   |---------|--------------|
   | {repo} | {their_date} |
   | ccplugins | 2025-10-26 |

   {repo} is {older/newer} by {X months/years}
   ```

### Phase 2: Project Type Detection

4. **Detect project type** by checking for these patterns:

   | Pattern | Type | ccplugins Equivalent |
   |---------|------|----------------------|
   | `marketplace.json` or `.claude-plugin/marketplace.json` | Marketplace | `.claude-plugin/marketplace.json` |
   | Has `commands/` AND `skills/` directories | Plugin | `pro/commands/`, `pro/skills/` |
   | Has `skills/` only | Skill Pack | `pro/skills/` |
   | Has `.mcp.json` or `mcp/` directory | MCP Config | `pro/.mcp.json` |
   | Has `CLAUDE.md` or `**/CLAUDE.md` patterns | Rules Pack | `pro/bundled-rules/` |
   | Has `agents/` or `subagents/` | Agent Config | `pro/subagents/` |

5. **Report detected type**:
   ```
   ## Project Type

   Detected: {type}
   Comparing against: {ccplugins equivalent path}
   ```

### Phase 3: Architecture Analysis

6. **Generate directory tree** (depth 3, excluding common noise):
   ```bash
   tree -L 3 -I 'node_modules|.git|__pycache__|*.pyc|.DS_Store' "$TARGET_DIR"
   ```

7. **Count capabilities**:

   | Capability | Command |
   |------------|---------|
   | Commands | `find "$TARGET_DIR" -type f -name "*.md" -path "*/commands/*" \| wc -l` |
   | Skills | `find "$TARGET_DIR" -type d -path "*/skills/*" -mindepth 1 -maxdepth 1 \| wc -l` |
   | Agents | `find "$TARGET_DIR" -type f -path "*/agents/*" \| wc -l` |
   | MCP servers | Count entries in `.mcp.json` if exists |

### Phase 4: Capability Mapping

8. **List their capabilities**:
   - For commands: Read each `.md` file in commands/, extract description
   - For skills: Read each SKILL.md or README.md in skills/*/
   - For MCP: Parse `.mcp.json` for server names

9. **Map to ccplugins equivalents**:
   - Read ccplugins command list from `pro/readme.md`
   - Check for matching functionality (by name or purpose)
   - Categorize each capability:
     - **✓ FULL** - ccplugins has equivalent or better
     - **◐ PARTIAL** - ccplugins has related but different approach
     - **✗ MISSING** - ccplugins lacks this capability

10. **Build comparison matrix**:
    ```markdown
    ## Comparison Matrix

    Legend: ✓ FULL  ◐ PARTIAL  ✗ MISSING

    | Capability | {repo} | ccplugins | Notes |
    |------------|--------|-----------|-------|
    | {cap1} | ✓ | ◐ | ccplugins uses different approach |
    | {cap2} | ✓ | ✗ | MISSING - no equivalent |
    ```

### Phase 5: Manifest Comparison (if applicable)

11. **Compare manifests** based on detected type:

    **For Marketplace:**
    ```bash
    # Their manifest
    cat "$TARGET_DIR/marketplace.json" 2>/dev/null || cat "$TARGET_DIR/.claude-plugin/marketplace.json"

    # Our manifest
    cat .claude-plugin/marketplace.json
    ```

    **For MCP config:**
    ```bash
    # Their config
    cat "$TARGET_DIR/.mcp.json"

    # Our config
    cat pro/.mcp.json
    ```

    Report differences in structure, naming conventions, features.

### Phase 6: Deep Analysis

12. **Analyze each unique capability** (theirs that we lack):
    - Read the full implementation
    - Understand the approach
    - Assess complexity and value
    - Note dependencies or assumptions

13. **Identify philosophy/approach differences**:
    - Naming conventions
    - Directory structure choices
    - Tool preferences
    - Integration patterns

### Phase 7: Recommendations

14. **Categorize findings**:

    **High Priority (Worth Porting)**
    - Completely missing capability that fills a gap
    - High value, low effort
    - Aligns with ccplugins philosophy

    **Medium Priority (Consider)**
    - Interesting approach we could learn from
    - Partial overlap with existing features
    - May require adaptation

    **Low Priority (Skip)**
    - Architectural mismatch
    - Already covered differently
    - Low value or high complexity

15. **Suggest ADRs** (do NOT create, just list):
    ```markdown
    ## Suggested ADRs

    - **ADR-XXX: Port {capability} from {repo}** - {one-line rationale}
    - **ADR-XXX: Adopt {pattern} approach** - {one-line rationale}
    ```

16. **Suggest backlog items** (do NOT create, just list):
    ```markdown
    ## Suggested Backlog Items

    - **{title}** - {description including source reference}
    ```

### Phase 8: Generate Report

17. **Write to doc/frameworks/{name}.md**:

    ```markdown
    # {Repo Name} Analysis

    > Evaluation of [{owner}/{repo}]({url}) against ccplugins.
    > Date: {YYYY-MM-DD}

    ## Overview

    | Property | Value |
    |----------|-------|
    | Repository | {url} |
    | Stars | {count} |
    | First Commit | {date} (ccplugins: 2025-10-26) |
    | License | {license} |
    | Languages | {list} |
    | Philosophy | {summary from README or analysis} |

    ## Architecture

    ```
    {tree output}
    ```

    ---

    ## Capability-by-Capability Analysis

    ### {Capability 1}

    {detailed analysis}

    ---

    ## Comparison Matrix

    {matrix from Phase 4}

    ---

    ## Recommendations

    ### High Priority (Worth Porting)

    #### 1. {Capability}
    **Value:** {High/Medium} - {rationale}
    **Effort:** {High/Medium/Low}
    **Design Decision:** {what needs to be decided}

    ### Medium Priority (Consider)

    {items}

    ### Low Priority (Skip)

    #### {Capability}
    **Reason:** {why skip}
    ```

18. **Report completion**:
    ```
    ## Evaluation Complete

    Report saved to: doc/frameworks/{name}.md

    ### Summary
    - {X} capabilities analyzed
    - {Y} recommended for porting (high priority)
    - {Z} for consideration (medium priority)
    - {W} skipped

    ### Next Steps

    To act on recommendations:
    1. Review suggested ADRs above
    2. Use `/pro:feature` to implement high-priority items
    3. Use `/pro:backlog.add` to capture items for later
    ```

---

## Spike Lifecycle

After evaluation, this spike can:
1. **Be merged** - The analysis document is valuable regardless of porting decisions
2. **Lead to features** - Use `/pro:feature` to implement recommended capabilities
3. **Create ADRs** - Document significant decisions via `/pro:feature` with ADR creation

---

## Error Handling

- **Repo not found**: Report error, do not create empty analysis
- **Private repo**: Check if `gh` auth allows access, report if not
- **No commands/skills found**: Still analyze what IS there (rules, configs, etc.)
- **Clone fails**: Report and suggest checking URL format

---

## Definition of Done

- [ ] Spike branch created (`spike/evaluate-{name}`)
- [ ] Repo cloned to `$TMPDIR`
- [ ] Age comparison reported immediately
- [ ] Project type detected
- [ ] Architecture analyzed
- [ ] Comparison matrix generated
- [ ] Recommendations categorized (High/Medium/Low)
- [ ] Report written to `doc/frameworks/{name}.md`
- [ ] Suggested ADRs listed (not created)
- [ ] Suggested backlog items listed (not created)
