# Plan: Add Ollama MCP Server and Documentation

## Summary

Add `ollama-mcp` as a bundled MCP server in the Pro plugin, enabling Claude to delegate specific tasks to local Ollama models. This provides capabilities like embedding generation, token-saving delegation of simple tasks, and multi-model workflows.

## Requirements from User

Extract the "Ollama as MCP Tools" section from the provided README and:
1. Add Ollama MCP to the bundled servers in `.mcp.json`
2. Document the MCP server in `pro/readme.md` with practical use case examples

## Extracted Content (Source Material)

From the user's provided README, the relevant section is "Ollama as MCP Tools (Optional)":

### MCP Configuration
```json
{
  "mcpServers": {
    "ollama": {
      "command": "npx",
      "args": ["-y", "ollama-mcp"],
      "env": {
        "OLLAMA_HOST": "http://127.0.0.1:11434"
      }
    }
  }
}
```

### Available Tools
| Tool | Purpose |
|------|---------|
| `ollama_generate` | Text generation with a model |
| `ollama_chat` | Multi-turn conversation |
| `ollama_embed` | Generate vector embeddings |
| `ollama_list` | List available models |
| `ollama_ps` | Show running models |
| `ollama_pull` | Download a model |

### Practical Use Cases
1. **Generate Embeddings for Semantic Search** - Claude doesn't natively generate embeddings
2. **Delegate Simple Tasks to Save Tokens** - Offload routine work to smaller models
3. **Summarize Large Documents** - Process lengthy files locally
4. **Generate Boilerplate Code** - Delegate repetitive code generation
5. **Multi-Model Workflows** - Local models for volume, Claude for nuance

### Prerequisites
- Ollama running locally (`brew install ollama && brew services start ollama`)
- Recommended models: `nomic-embed-text`, `llama3.2:1b`, `qwen3-coder`
- Node.js v16+

## Implementation Plan

### Step 1: Update `.mcp.json`

Add the Ollama server configuration to `pro/.mcp.json`:

```json
"ollama": {
  "command": "npx",
  "args": ["-y", "ollama-mcp"],
  "env": {
    "OLLAMA_HOST": "http://127.0.0.1:11434"
  }
}
```

### Step 2: Update `pro/readme.md`

Add Ollama to the "Bundled MCP Servers" table and add a dedicated "Ollama Setup" section with:
- Prerequisites (Ollama running locally)
- Available tools table
- Practical use cases with prompt examples
- Recommended models for MCP tasks

### Step 3: Verification

- Validate JSON syntax in `.mcp.json`
- Ensure readme formatting is consistent with existing sections

## Files to Modify

1. `pro/.mcp.json` - Add Ollama server configuration
2. `pro/readme.md` - Add documentation section

## Definition of Done

- [ ] Ollama MCP server added to `.mcp.json`
- [ ] Bundled MCP Servers table updated in readme
- [ ] Dedicated Ollama Setup section with use cases
- [ ] JSON syntax validated
- [ ] Readme formatting consistent with existing sections

## Questions for User

None - the requirements are clear from the provided README content.

## Related ADRs

- ADR-002: Support HTTP Transport MCP Servers (establishes pattern for mixed MCP configs)
- ADR-034: Playwriter Alternative Browser MCP (establishes pattern for optional env-based config)

## Notes

- Unlike Supabase or shadcn-ui, Ollama doesn't require API keys but does require Ollama to be running locally
- The MCP server is distinct from using Ollama *as* the underlying model - this is about exposing Ollama tools to Claude
- Default host is `http://127.0.0.1:11434` (standard Ollama port)
