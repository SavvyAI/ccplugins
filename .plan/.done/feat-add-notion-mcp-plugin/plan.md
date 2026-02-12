# Add Notion MCP to Pro Plugin

## Summary

Add Notion MCP server to the Pro plugin's bundled MCP servers. Notion MCP is a hosted HTTP endpoint (like Figma) that enables Claude to read and write to Notion workspaces.

## Related ADRs

- **ADR-002**: Support HTTP Transport MCP Servers - Established pattern for HTTP transport that Notion will follow

## Requirements

1. Add Notion MCP to `pro/.mcp.json` as HTTP transport
2. Update `pro/readme.md` with:
   - Notion in MCP servers table
   - Brief note about OAuth (first invocation prompts authorization)
   - Note about upload limitations (images/files unsupported)

## Implementation Steps

### Step 1: Update `.mcp.json`

Add Notion entry using HTTP transport pattern (matches Figma):

```json
"notion": {
  "type": "http",
  "url": "https://mcp.notion.com/mcp"
}
```

### Step 2: Update `readme.md`

1. Add to "Bundled MCP Servers" table:
   | **Notion** | Read and write to Notion workspaces (OAuth required) |

2. Add minimal setup note in shell configuration section referencing OAuth flow

3. Add brief "Notion Setup" section noting:
   - First invocation triggers OAuth authorization
   - Image/file uploads not yet supported

## Verification

- [ ] `.mcp.json` is valid JSON
- [ ] readme table includes Notion
- [ ] No duplicate entries
- [ ] Consistent with existing HTTP server patterns (Figma)

## Out of Scope

- SSE endpoint support (`https://mcp.notion.com/sse`) - HTTP is recommended
- STDIO bridge via `mcp-remote` - not needed for Claude Code
