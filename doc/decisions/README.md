# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) documenting significant technical decisions.

## What is an ADR?

An ADR captures the context, decision, and consequences of an architecturally significant choice.

## Format

We use the [Michael Nygard format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Naming Convention

- Filename: `NNN-kebab-case-title.md` (e.g., `001-use-localStorage-for-tracking.md`)
- NNN = zero-padded sequence number (001, 002, 003...)
- Title in heading must match: `# NNN. Title` (e.g., `# 001. Use localStorage for Tracking`)

## Index

- [001. Integrate ADRs into PR Workflow](001-integrate-adrs-into-pr-workflow.md)
- [002. Support HTTP Transport MCP Servers](002-support-http-transport-mcp-servers.md)
- [003. Symlink Approach for Plugin Instructions](003-symlink-approach-for-plugin-instructions.md)
- [004. Forensic Capture Workflow for Bug Command](004-forensic-workflow-for-bug-command.md)
- [005. Runtime Inference for Version Check](005-runtime-inference-for-version-check.md)
- [006. Subdirectory Pattern for Shared Templates](006-subdirectory-pattern-for-shared-templates.md)
- [007. Interactive Phased Onboarding with Partial Detection](007-interactive-phased-onboarding-with-partial-detection.md)
- [008. Explicit Mode Selection for README Beautification](008-explicit-mode-selection-for-readme-beautification.md)
- [009. Supabase Port Range Allocation Strategy](009-supabase-port-range-allocation-strategy.md)
- [010. Bundled Bin Assets for Setup Commands](010-bundled-bin-assets-for-setup-commands.md)
- [011. Command-First CLI Pattern for npx dev](011-command-first-cli-pattern-for-npx-dev.md)
- [012. Dynamic Port Allocation at Setup Time](012-dynamic-port-allocation-at-setup-time.md)
- [013. Centralized JSON Index for Known Issues](013-centralized-json-index-for-known-issues.md)
- [014. Skills Directory for Bundled Agent Skills](014-skills-directory-for-bundled-agent-skills.md)
- [015. Audit, Backlog, and Roadmap Command Architecture](015-audit-backlog-roadmap-command-architecture.md)
- [016. ADR Check and Backlog Integration for Work Commands](016-adr-check-and-backlog-integration-for-work-commands.md)
- [017. Branch Naming Invariant and Work-Type Taxonomy](017-branch-naming-invariant-and-work-type-taxonomy.md)
- [018. MVP Cut Line with MoSCoW Prioritization](018-mvp-cut-line-moscow-phases.md)
- [019. React to Next.js Migration Design](019-react-to-next-migration-design.md)
- [020. Audit Command Namespace Hierarchy](020-audit-command-namespace-hierarchy.md)
- [021. Build in Public Skill Architecture](021-build-in-public-skill-architecture.md)
- [022. Ultrathink Integration for Complex Commands](022-ultrathink-integration-for-complex-commands.md)
- [023. Writer Plugin Multi-Plugin Architecture](023-writer-plugin-multi-plugin-architecture.md)
- [024. Writer Import Command for Existing Content](024-writer-import-command-for-existing-content.md)
- [025. Writer Weave Command for Reference Integration](025-writer-weave-command-for-reference-integration.md)
- [026. Subagent-Skill Dual Architecture for Proactive Features](026-subagent-skill-dual-architecture-for-proactive-features.md)
- [027. Documentation User-Centric Refactor](027-documentation-user-centric-refactor.md)
- [028. Writer Milestone Tracking Design](028-writer-milestone-tracking-design.md)
- [029. Author Plugin Rename and Weave Consolidation](029-author-plugin-rename-and-weave-consolidation.md)
- [030. Audit Repo Command and Secrets Consolidation](030-audit-repo-secrets-consolidation.md)
- [031. Product Validation Pipeline Architecture](031-product-validation-pipeline-architecture.md)
- [032. Tiered Extraction Strategy and Image Intelligence](032-tiered-extraction-and-image-intelligence.md)
- [033. Social Sharing Meta-Command Architecture](033-social-sharing-meta-command.md)
- [034. Playwriter Alternative Browser MCP](034-playwriter-alternative-browser-mcp.md)
- [035. Permissionless Proof Pipeline Architecture](035-permissionless-proof-pipeline-architecture.md)
- [036. Auto Visual Parity Verification](036-auto-visual-parity-verification.md)
- [037. GitHub Pages Deployment for Proofs](037-github-pages-deployment-for-proofs.md)
- [038. TodoWrite Checkpoint Persistence](038-todowrite-checkpoint-persistence.md)
- [039. Permissionless Proof CHECK Extension](039-permissionless-proof-check-extension.md)
- [040. Product Brief Versioned Storage](040-product-brief-versioned-storage.md)
- [041. Universal Content Retriever Skill](041-universal-content-retriever-skill.md)
- [042. npx dev Port Command](042-npx-dev-port-command.md)
- [043. DOM-Based Structural Parity Verification](043-dom-based-structural-parity-verification.md)
- [044. Chrome Extension Developer Skill](044-chrome-extension-developer-skill.md)
- [045. GitHub Pages Full Automation](045-github-pages-full-automation.md)
- [046. Multi-Proof Marketplace Architecture](046-multi-proof-marketplace-architecture.md)
- [047. Content Fighter Adversarial Refinement Loop](047-content-fighter-adversarial-refinement-loop.md)
- [048. Bounty Hunter Command Architecture](048-bounty-hunter-command-architecture.md)
- [049. Code Quality Skill Architecture](049-code-quality-skill-architecture.md)
- [050. Bounty Competitive Intelligence System](050-bounty-competitive-intelligence-system.md)
- [051. Bounty Scout Multi-Source Expansion](051-bounty-scout-multi-source-expansion.md)
- [052. Branch-First Enforcement for Work Commands](052-branch-first-enforcement-for-work-commands.md)
- [053. Claude-Free Website Audit Architecture](053-claude-free-website-audit-architecture.md)
- [054. Author Publish Pipeline Architecture](054-author-publish-pipeline-architecture.md)
- [055. Bundled Compilation Scripts for /author:init](055-author-init-bundled-compilation-scripts.md)
- [056. Demo Command Lightweight Project Walkthrough](056-demo-command-lightweight-project-walkthrough.md)
- [057. Random High Port Allocation and Tight Inclusion Rules](057-random-high-port-allocation-tight-inclusion.md)
- [058. Backlog Token Conservation Strategy](058-backlog-token-conservation-strategy.md)
- [059. Structured Error Logging with 3-Strike Protocol](059-structured-error-logging-with-strike-protocol.md)
- [060. Author Intent — Pre-Writing Compression Command](060-author-intent-pre-writing-compression.md)
- [061. Composition Over Inheritance for Behavioral Constraints](061-composition-over-inheritance-for-behavioral-constraints.md)
- [062. Default to Local Supabase Skill](062-default-local-supabase-skill.md)
- [063. Logging Convention: stdout/stderr Only](063-logging-convention-stdout-only.md)
- [064. Version Bump File for Automated Tagging](064-version-bump-file-for-automated-tagging.md)
- [065. Branch Lifecycle Park and RMRF Commands](065-branch-lifecycle-park-and-rmrf-commands.md)
- [066. Scaffold Command Namespace Pattern](066-scaffold-command-namespace-pattern.md)
- [067. App Icon Multi-Backend Architecture](067-app-icon-multi-backend-architecture.md)
