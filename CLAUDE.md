# Claude Instructions

See AGENTS.md for project-specific coding guidelines and style guide.

## OpenSpec Subagents (Explore Mode)

When in **Explore Mode** (planning, researching, analyzing before implementation), use OpenSpec subagents instead of direct tools.

### RULE: Subagent Delegation in Explore Mode

| Instead of...                                     | Use this subagent              |
| ------------------------------------------------- | ------------------------------ |
| codebase-retrieval, grep, glob, file search       | **openspec-codebase-analyzer** |
| web-search, web-fetch for docs/libraries/topics   | **openspec-researcher**        |
| Manual UI/UX planning for build/edit/fix UI tasks | **openspec-ui-ux-pro-max**     |
| Reading and analyzing log files                   | **openspec-log-analyzer**      |

### When to Use Each Subagent

**openspec-codebase-analyzer**

- User asks to understand existing code
- User asks to find where something is implemented
- User asks about code patterns, dependencies, or architecture
- Before implementing any feature (understand context first)

**openspec-researcher**

- User asks about a library, framework, or technology
- User needs documentation or best practices
- User wants to compare solutions or find alternatives
- User asks "how to do X" that requires external knowledge

**openspec-ui-ux-pro-max**

- User plans to build, edit, or fix UI components
- User needs design decisions (colors, layout, typography)
- User asks about UX improvements or accessibility
- Before implementing any UI-related task

**openspec-log-analyzer**

- User provides log files or error outputs
- User asks to debug or find root cause of issues
- User needs to understand what happened from logs

### Important Notes

1. All subagents are READ-ONLY - they analyze and recommend, never modify files
2. Output specs are stored in:
   - `<workspace>/openspec/specs/` - Approved specifications
   - `<workspace>/openspec/changes/` - Work in progress
3. After Explore Mode, switch to Implementation Mode to execute recommendations
