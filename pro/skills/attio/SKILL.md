---
name: attio
description: CRM operations with Attio. Use when working with contacts, companies, deals, notes, tasks, or meetings in Attio. Covers MCP tool usage, ad-hoc data capture from emails/screenshots, and REST API development. Provides assert pattern for duplicate-free record creation.
---

# Attio CRM

Expert guidance for Attio CRM operations via MCP tools and REST API.

## When to Use This Skill

Invoke when:
- Working with CRM data (contacts, companies, deals, pipelines)
- Attio MCP tools are available (`mcp__attio__*`)
- User provides email/screenshot/text to capture as a contact
- Developing integrations with Attio REST API
- Managing notes, tasks, or meetings in Attio

## Ad-Hoc Data Capture

When user provides raw data (email source, screenshot, business card, LinkedIn profile):

### 1. Extract Contact Details

From email headers, signature blocks, or image text:

| Field | Source |
|-------|--------|
| Name | From/signature line |
| Email | From header or body |
| Company | Email domain or signature |
| Title | Signature block |
| Phone | Signature block (optional) |

### 2. Handle Screenshots/Images

Use vision capabilities to extract text, then parse the same fields above.

### 3. Add to Attio (Assert Pattern)

**Always use the assert pattern to prevent duplicates:**

```
PUT /v2/objects/{object}/records?matching_attribute={attribute}
```

| Object | Matching Attribute |
|--------|-------------------|
| `people` | `email_addresses` |
| `companies` | `domains` |

**Behavior:** Updates existing record if match found, creates new if not.

### 4. Minimal Friction Principle

- Infer fields from context - don't ask for what can be derived
- Use sensible defaults for optional fields
- Only ask clarifying questions when truly ambiguous
- Confirm before write operations (per MCP safety annotations)

## MCP Tools Reference

### Records & Objects

| Tool | Description |
|------|-------------|
| `search-records` | Full-text search by name, email, domain |
| `get-records-by-ids` | Retrieve full details for specific records |
| `create-record` | Create a new record (person, company, deal) |
| `upsert-record` | Create or update using matching attribute |
| `list-attribute-definitions` | List available attributes and options |

### Notes

| Tool | Description |
|------|-------------|
| `create-note` | Create note attached to a record |
| `search-notes-by-metadata` | Search by parent record, author, time |
| `semantic-search-notes` | AI-powered topic search |
| `get-note-body` | Retrieve full note content |

### Tasks

| Tool | Description |
|------|-------------|
| `create-task` | Create task with deadline, assignee, linked record |
| `update-task` | Update deadline, status, assignee |

### Meetings & Calls

| Tool | Description |
|------|-------------|
| `search-meetings` | Search by participants, records, time range |
| `search-call-recordings-by-metadata` | Search recordings by participants, title |
| `semantic-search-call-recordings` | AI-powered topic search in recordings |
| `get-call-recording` | Retrieve full details and transcript |

### Emails

| Tool | Description |
|------|-------------|
| `search-emails-by-metadata` | Search by participants, domain, time |
| `semantic-search-emails` | AI-powered topic search |
| `get-email-content` | Retrieve full email body |

### Workspace

| Tool | Description |
|------|-------------|
| `list-workspace-members` | List members and team memberships |
| `list-workspace-teams` | List all teams |
| `whoami` | Current user identity and access |

## Sample Prompts

### Ad-Hoc Capture

| Prompt | Action |
|--------|--------|
| "Add this person to CRM" + [email] | Extract contact, assert to `people` |
| "Log this as a new contact" + [screenshot] | Vision extract, assert to `people` |
| "Create a company record from this" | Extract domain/name, assert to `companies` |

### Lookup & Search

| Prompt | Action |
|--------|--------|
| "Find all contacts at Stripe" | `search-records` for people at Stripe |
| "What's the email for Sarah Chen?" | `search-records` by name |
| "Show me everything we know about Acme" | `search-records` + `get-records-by-ids` |

### Activity Logging

| Prompt | Action |
|--------|--------|
| "Log a note: had great demo call" | `create-note` on relevant record |
| "Add a task to follow up in 3 days" | `create-task` with deadline |
| "What was our last interaction with Linear?" | `search-notes-by-metadata` + `search-emails-by-metadata` |

### Search & Discovery

| Prompt | Action |
|--------|--------|
| "Find notes about pricing objections" | `semantic-search-notes` |
| "Show calls where we discussed enterprise" | `semantic-search-call-recordings` |
| "Find emails about contract renewal" | `semantic-search-emails` |

## REST API Reference

### Base Configuration

| Property | Value |
|----------|-------|
| Base URL | `https://api.attio.com` |
| Auth | OAuth 2.0 Authorization Code |
| Auth URL | `https://app.attio.com/authorize` |
| Token URL | `https://app.attio.com/oauth/token` |

### Key Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v2/objects` | List all objects |
| GET | `/v2/objects/{object}/records` | List records |
| POST | `/v2/objects/{object}/records` | Create record |
| **PUT** | `/v2/objects/{object}/records?matching_attribute={attr}` | **Assert (upsert)** |
| POST | `/v2/objects/{object}/records/query` | Query with filters |
| POST | `/v2/objects/records/search` | Full-text search |
| GET | `/v2/notes` | List notes |
| POST | `/v2/notes` | Create note |
| GET | `/v2/tasks` | List tasks |
| POST | `/v2/tasks` | Create task |
| GET | `/v2/meetings` | List meetings |
| GET | `/v2/lists` | List all lists |
| POST | `/v2/lists/{list}/entries` | Add list entry |

### OAuth Scopes

| Scope | Access |
|-------|--------|
| `record_permission:read` | View records |
| `record_permission:read-write` | View and modify records |
| `object_configuration:read` | View object/attribute config |
| `note:read-write` | View and create notes |
| `task:read-write` | View and create tasks |
| `meeting:read` | View meetings |
| `call_recording:read` | View call recordings/transcripts |
| `webhook:read-write` | Manage webhooks |

## Rate Limits

### MCP Usage

- Standard API limits apply across all MCP tool calls
- Semantic searches may take longer (AI processing)
- Large result sets are paginated automatically
- Write operations have built-in backoff

### If Rate Limited

1. Reduce parallel operations
2. Space out sequential requests
3. Wait briefly and retry

Normal conversational use stays within limits.

## Security & Approval Flows

### Authentication

- **OAuth 2.0**: Log in with Attio credentials
- **No API keys**: Access tied to user permissions
- **Revocable**: Sessions managed in Attio settings

### MCP Safety Annotations

| Operation | Approval |
|-----------|----------|
| Read (search, get) | Auto-approved |
| Write (create, update) | Request user confirmation |

### Data Access

- Operations scoped to your workspace
- Same permissions as your Attio user account
- All operations logged and auditable
