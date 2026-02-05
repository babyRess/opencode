## Why

The Web UI editor (packages/ui) currently uses CodeMirror with basic syntax highlighting but lacks code intelligence features. Users editing code in the browser don't get autocomplete, diagnostics, or formatting - features they expect from modern editors. OpenCode already has a robust LSP infrastructure on the server side that supports 20+ language servers, but this isn't exposed to the Web UI.

## What Changes

- Add CodeMirror extensions for client-side code intelligence (autocomplete, linting UI, bracket matching)
- Extend the LSP client to support `completion`, `formatting`, and `codeAction` operations
- Create new API endpoints to expose LSP features to the Web UI
- Connect CodeMirror to the LSP server via HTTP/WebSocket for type-aware completions and real diagnostics

## Capabilities

### New Capabilities

- `editor-autocomplete`: Client-side and LSP-powered code completion in the Web UI editor
- `editor-diagnostics`: Display LSP diagnostics (errors, warnings) inline in the editor
- `editor-formatting`: Format code on save or on-demand via LSP

### Modified Capabilities

<!-- No existing specs are being modified - this is new functionality -->

## Impact

- **packages/ui**: Add CodeMirror extensions (@codemirror/autocomplete, @codemirror/lint), modify Editor component
- **packages/opencode/src/lsp**: Extend LSP client capabilities and index.ts to support completion, formatting, codeAction
- **packages/opencode/src/server**: Add new API endpoints for LSP operations
- **Dependencies**: New npm packages for CodeMirror extensions
- **Performance**: LSP calls add network latency; mitigate with client-side fallbacks and debouncing
