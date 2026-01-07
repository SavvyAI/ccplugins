---
description: "Raw idea? → Distill chaos into structured product brief → Foundation for validation"
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion"]
---

## Context

Let's create a product brief from: $ARGUMENTS

## Skill Reference

This command uses the **product-brief** skill. See `pro/skills/product-brief/SKILL.md` for detailed guidance on:

- Element extraction (problem, solution, customer, timing, business signals)
- Brief template structure
- Clarifying questions (when to ask, what to avoid)
- Tone guidelines

## Your Task

### Step 1: Accept Input

Resolve input in this order:
1. If `$ARGUMENTS` is a file path: read the file
2. If `$ARGUMENTS` contains idea content directly: use it as-is
3. If no arguments: ask user to describe their idea (voice-friendly prompt)

When asking for input, use this prompt:
> "Tell me about your idea. You can ramble - I'll distill it. What problem are you solving? Who has this problem? What's your solution?"

### Step 2: Apply Product Brief Skill

Follow the **product-brief** skill to:
1. Extract key elements from unstructured input
2. Ask clarifying questions if critical elements are missing
3. Generate structured brief using the skill's template

### Step 3: Write Brief to File

1. Create directories:
   ```bash
   mkdir -p .plan/product/briefs
   ```

2. Generate filename from Working Title (per skill guidance):
   - Slugify: lowercase, replace spaces with hyphens, remove special characters
   - Format: `YYYY-MM-DD-{slug}.md`

3. Write the brief to `.plan/product/briefs/{filename}`

4. Update index at `.plan/product/brief.md` (per skill's index format)

### Step 3a: Migration (If Legacy File Exists)

If `.plan/product/brief.md` exists and is NOT an index (doesn't start with `# Product Briefs`):
- Follow the skill's legacy migration instructions
- Inform user: "Migrated existing brief to versioned format."

### Step 4: Display Summary

Show the user:
1. Brief summary (problem + solution in 2-3 sentences)
2. File location
3. Next step suggestion

```
## Brief Created

**Problem:** [one sentence]
**Solution:** [one sentence]

Saved to: `.plan/product/briefs/YYYY-MM-DD-{slug}.md`
Index updated: `.plan/product/brief.md`

**Next step:** Run `/pro:product.validate` to get harsh market validation.
```

## Non-Git Directory Support

This command works in any directory, even without git initialized:
- Create `.plan/product/briefs/` directory if it doesn't exist
- Do not require or assume git
- Works as first step before any repo setup

## Definition of Done

- Input accepted (argument, file, or interactive)
- Key elements extracted from unstructured input
- Clarifying questions asked if needed (minimal)
- Structured brief generated
- Brief written to `.plan/product/briefs/{timestamped-file}.md`
- Index updated at `.plan/product/brief.md`
- Legacy single-file brief migrated (if present)
- Summary displayed with next steps
