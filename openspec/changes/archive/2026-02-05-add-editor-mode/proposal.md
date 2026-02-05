## Why

OpenCode's GUI can open and view files, but lacks the ability to edit them or preview agent-proposed changes. Users must switch to external editors or the terminal to make edits, breaking the workflow. Adding edit mode enables a complete agent-assisted coding experience within the GUI.

## What Changes

- Add View/Edit mode toggle to the existing file viewer (no new UI required)
- Integrate CodeMirror 6 as the editor engine (replacing or enhancing current viewer)
- Add inline diff visualization for agent-proposed changes using `@codemirror/merge`
- Add accept/reject workflow for agent edits (per-hunk and per-file)
- Add visual mode indicators (status bar, subtle background changes)
- Add keyboard shortcuts (Cmd+E toggle, Tab/Escape for accept/reject)

## Capabilities

### New Capabilities

- `editor-mode`: Core edit mode functionality - readonly toggle, CodeMirror integration, mode switching via keyboard shortcut
- `agent-diff-preview`: Inline diff visualization for agent-proposed changes with accept/reject workflow

### Modified Capabilities

None - this is new functionality, no existing specs to modify.

## Impact

- **Packages affected**: `packages/app/` (web app), `packages/desktop/` (Tauri app), `packages/ui/` (shared components)
- **New dependencies**: `solid-codemirror`, `@codemirror/view`, `@codemirror/state`, `@codemirror/merge`, `@codemirror/language`
- **Bundle size**: ~150-300KB additional (CodeMirror is modular)
- **Existing file viewer**: Will be enhanced/replaced with CodeMirror-based component
- **Future extensibility**: Architecture supports adding LSP, formatting, and vim/emacs modes later
