# ADR 070: Abandon Dual CLI Support in Favor of Separate Repositories

## Status

Accepted

## Supersedes

- ADR 069 (never merged): Dual Support for Claude Code and Gemini CLI

## Context

In the `feat/setup-gemini-manifests` branch, we attempted to make ccplugins function as both a Claude Code plugin and a Gemini CLI extension simultaneously. The approach involved:

1. Adding `gemini-extension.json` manifests alongside existing Claude Code configs
2. Creating `.toml` wrapper files for each `.md` command file
3. Sharing `CLAUDE.md` context via `contextFileName` setting
4. Attempting to share MCP server configurations

### What Worked

- MCP server configurations ported successfully
- Skills loaded in both environments
- The `.toml` wrapper pattern for commands functioned

### What Diverged

1. **Commands**: Schema expectations differ between Claude Code and Gemini CLI. Agent validation errors occurred during extension linking, requiring suppression (`2>/dev/null`) to proceed.

2. **Hooks**: The `hooks/hooks.json` schema is incompatible between the two CLIs. No safe way to share hooks without risking breakage in Claude Code.

3. **Skills**: Certain skills exhibit behavioral differences due to underlying model and tool availability differences.

4. **Maintenance burden**: Every change required updating two manifest files and potentially two command files, with constant vigilance to avoid regressions.

## Decision

Abandon the dual-support approach. Maintain ccplugins exclusively for Claude Code. Port functionality to a separate repository for Gemini CLI extensions.

### Rationale

1. **Risk mitigation**: The primary user base is on Claude Code. Introducing Gemini support into the same codebase creates regression risk for the primary audience.

2. **Clean separation**: Each CLI has its own idioms, schemas, and capabilities. Fighting those differences adds friction without clear benefit.

3. **Easy porting**: The command logic lives in `.md` files. Porting to a new repo with Gemini-native structure is straightforward and can be done incrementally.

4. **Independent evolution**: Separate repos allow each to evolve with its respective CLI's conventions without coordination overhead.

## Consequences

- **Maintenance**: Changes must be manually ported between repos. This is acceptable given the low frequency of breaking changes.
- **Discoverability**: Users must find the appropriate repo for their CLI.
- **Consistency**: Command behavior may drift over time. This is acceptable as each CLI may warrant different approaches.

## Implementation

1. Delete the `feat/setup-gemini-manifests` branch (local and remote)
2. Create separate Gemini CLI extension repository
3. Port commands and skills to Gemini-native format
4. Maintain parallel codebases with manual sync as needed
