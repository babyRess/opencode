## Context

The Web UI (`packages/ui`) uses CodeMirror 6 with `solid-codemirror` wrapper. Currently it provides:

- Syntax highlighting via `@codemirror/lang-*` packages
- Basic editing features (line numbers, history, keymaps)
- No code intelligence (autocomplete, diagnostics, formatting)

The server (`packages/opencode`) has a mature LSP infrastructure:

- `src/lsp/server.ts`: Spawns and manages 20+ language servers (TypeScript, ESLint, Python, Go, etc.)
- `src/lsp/client.ts`: LSP client with capabilities for diagnostics, hover, definition, references
- `src/lsp/index.ts`: Public API exposing LSP operations
- Missing: `completion`, `formatting`, `codeAction` operations

The server already exposes HTTP endpoints via `src/server/server.ts` using Hono framework.

## Goals / Non-Goals

**Goals:**

- Enable autocomplete in the Web UI editor with both client-side and LSP-powered completions
- Display LSP diagnostics (errors, warnings, hints) inline in the editor
- Support code formatting on-demand and on-save
- Maintain responsive UX despite network latency to LSP servers

**Non-Goals:**

- Real-time collaborative editing
- Supporting LSP features beyond completion, diagnostics, formatting (e.g., rename, code actions - future work)
- Custom language server configuration from the UI
- Offline-first architecture (requires server connection)

## Decisions

### 1. Hybrid Completion Strategy

**Decision:** Use client-side completions as primary with LSP completions merged in asynchronously.

**Rationale:**

- Client-side completions (from `@codemirror/autocomplete` + language extensions) are instant
- LSP completions have network latency (50-200ms typical)
- Users expect immediate feedback when typing

**Alternatives considered:**

- LSP-only: Too slow, poor UX on every keystroke
- Client-only: Misses type-aware completions, project-specific symbols

**Implementation:**

```
User types → Show client-side completions immediately
         → Fire LSP request (debounced 150ms)
         → Merge LSP results when they arrive
```

### 2. HTTP for LSP Operations (not WebSocket)

**Decision:** Use HTTP POST endpoints for LSP operations, not WebSocket.

**Rationale:**

- LSP operations are request/response (not streaming)
- Simpler implementation, no connection state management
- Existing server uses Hono HTTP framework
- Diagnostics can be polled or pushed via existing event system

**Alternatives considered:**

- WebSocket: More complex, overkill for request/response pattern
- Server-Sent Events: Good for diagnostics push, but adds complexity

**Endpoints:**

- `POST /lsp/completion` - Get completions at position
- `POST /lsp/format` - Format document or range
- `GET /lsp/diagnostics` - Get current diagnostics for file

### 3. Extend Existing LSP Client Capabilities

**Decision:** Add completion/formatting capabilities to existing `LSPClient` rather than creating new abstraction.

**Rationale:**

- Follows existing patterns in `src/lsp/index.ts`
- Reuses connection management, error handling
- Consistent with how other LSP features are exposed

**Changes to `src/lsp/client.ts` capabilities:**

```typescript
capabilities: {
  textDocument: {
    // existing
    synchronization: { didOpen: true, didChange: true },
    publishDiagnostics: { versionSupport: true },
    // new
    completion: {
      completionItem: { snippetSupport: true, commitCharactersSupport: true }
    },
    formatting: { dynamicRegistration: true },
  }
}
```

### 4. CodeMirror Extension Architecture

**Decision:** Create a single `lspExtension()` factory that bundles all LSP-related CodeMirror extensions.

**Rationale:**

- Clean API for consumers: `createExtension(() => lspExtension({ endpoint: '/lsp' }))`
- Encapsulates autocomplete source, lint source, and formatting commands
- Easy to enable/disable as a unit

**Structure:**

```
packages/ui/src/extensions/lsp/
├── index.ts          # lspExtension() factory
├── completion.ts     # Autocomplete source
├── diagnostics.ts    # Lint source
└── formatting.ts     # Format command
```

## Risks / Trade-offs

### Network Latency

**Risk:** LSP completions arrive too late, feel sluggish
**Mitigation:**

- Show client-side completions immediately
- Debounce LSP requests (150ms)
- Cache recent completions per file

### LSP Server Availability

**Risk:** Language server not running or crashed
**Mitigation:**

- Graceful degradation to client-side only
- Show subtle indicator when LSP unavailable
- Existing LSP infrastructure handles server lifecycle

### Bundle Size

**Risk:** CodeMirror extensions increase UI bundle size
**Mitigation:**

- `@codemirror/autocomplete` is ~15KB gzipped
- `@codemirror/lint` is ~5KB gzipped
- Acceptable for the functionality gained

### Diagnostics Freshness

**Risk:** Diagnostics become stale after edits
**Mitigation:**

- Re-fetch diagnostics on document change (debounced)
- Clear diagnostics while fetching to avoid confusion
- Use existing `touchFile` mechanism to trigger LSP analysis
