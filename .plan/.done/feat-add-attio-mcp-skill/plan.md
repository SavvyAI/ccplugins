# Plan: Add Attio MCP and Skill

## Summary

Add Attio MCP server integration and create a comprehensive skill for MCP tool usage, direct API development, and ad-hoc CRM data capture workflows.

## Relevant ADRs

- **ADR-014**: Skills stored in `pro/skills/{name}/SKILL.md` with YAML frontmatter
- **ADR-002**: HTTP transport MCP servers use `"type": "http", "url": "..."`
- **ADR-026**: Skill-only (no subagent) is appropriate for user-triggered capabilities

## Implementation Steps

### Step 1: Add Attio MCP to `pro/.mcp.json`

Add HTTP transport entry after existing servers:
```json
"attio": {
  "type": "http",
  "url": "https://mcp.attio.com/mcp"
}
```

### Step 2: Create `pro/skills/attio/` directory

```bash
mkdir -p pro/skills/attio
```

### Step 3: Create `pro/skills/attio/SKILL.md`

The skill will include:

**YAML Frontmatter:**
- name: `attio`
- description: Trigger on CRM work, Attio MCP tools, Attio API development, or ad-hoc contact/company capture

**Sections:**

1. **When to Use This Skill**
   - CRM-related prompts (contacts, companies, deals)
   - Attio MCP tool calls detected
   - Attio API integration code
   - **Ad-hoc data capture** (user pastes email, screenshot, or text with contact info)

2. **Ad-Hoc Data Capture Workflows** ⬅️ NEW SECTION

   When user provides raw data (email source, screenshot, business card, LinkedIn profile, etc.):

   a. **Extract contact details:**
      - Name (from signature, header, or body)
      - Email address
      - Company (from domain, signature, or context)
      - Title/role (from signature)
      - Phone (if present)

   b. **Handle screenshots/images:**
      - Use vision capabilities to read text
      - Extract same fields as above

   c. **Add to Attio (Assert Pattern):**
      - Use **PUT** `/v2/objects/{object}/records` with `matching_attribute` query param
      - For people: match on `email_addresses`
      - For companies: match on `domains`
      - Behavior: Updates if match found, creates if not (true upsert)
      - Confirm with user before write operation

   d. **Minimal friction principle:**
      - Don't ask for fields that can be inferred
      - Use sensible defaults
      - Only ask clarifying questions when truly ambiguous

3. **MCP Tools Reference** (for Claude Code MCP integration)
   - Records & Objects: search-records, get-records-by-ids, create-record, upsert-record, list-attribute-definitions
   - Notes: create-note, search-notes-by-metadata, semantic-search-notes, get-note-body
   - Tasks: create-task, update-task
   - Meetings & Calls: search-meetings, search-call-recordings-by-metadata, semantic-search-call-recordings, get-call-recording
   - Emails: search-emails-by-metadata, semantic-search-emails, get-email-content
   - Workspace: list-workspace-members, list-workspace-teams, whoami

4. **Sample Prompts** (examples from Attio docs + ad-hoc scenarios)
   - "Add this person to CRM" + [pasted email]
   - "Log this as a new contact" + [screenshot]
   - "Create a company record from this email"

5. **REST API Reference** (for direct API development)
   - Base URL: `https://api.attio.com`
   - Authentication: OAuth 2.0 authorization code flow
   - Key endpoints with method/path
   - **Assert pattern**: PUT with `matching_attribute` for upsert operations
   - OAuth scopes reference table

6. **Rate Limits & Best Practices**
   - MCP rate limits
   - API best practices
   - Pagination patterns

7. **Security & Approval Flows**
   - OAuth flow (no API keys to manage)
   - Read operations auto-approved
   - Write operations request user confirmation

## Files Changed

1. `pro/.mcp.json` - Add attio server entry
2. `pro/skills/attio/SKILL.md` - New file (comprehensive skill)

## Definition of Done

- [x] Branch created: `feat/add-attio-mcp-skill`
- [x] Backlog item #104 added
- [x] `.mcp.json` includes Attio server entry
- [x] `pro/skills/attio/SKILL.md` created
- [x] Skill covers MCP usage patterns
- [x] Skill covers ad-hoc data capture workflows
- [x] Skill covers REST API development patterns
- [x] No lint/build errors
