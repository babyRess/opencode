## 1. Server-side LSP Extensions

- [x] 1.1 Add `completion` capability to LSP client in `src/lsp/client.ts` (snippetSupport, commitCharactersSupport)
- [x] 1.2 Add `formatting` capability to LSP client in `src/lsp/client.ts`
- [x] 1.3 Implement `LSP.completion()` function in `src/lsp/index.ts` for `textDocument/completion`
- [x] 1.4 Implement `LSP.format()` function in `src/lsp/index.ts` for `textDocument/formatting`
- [x] 1.5 Implement `LSP.formatRange()` function in `src/lsp/index.ts` for `textDocument/rangeFormatting`

## 2. API Endpoints

- [x] 2.1 Create `POST /lsp/completion` endpoint in `src/server/server.ts` (file, line, character)
- [x] 2.2 Create `POST /lsp/format` endpoint in `src/server/server.ts` (file, options)
- [x] 2.3 Create `POST /lsp/format-range` endpoint in `src/server/server.ts` (file, range, options)
- [x] 2.4 Create `GET /lsp/diagnostics` endpoint in `src/server/server.ts` (file query param)
- [x] 2.5 Regenerate SDK with `./script/generate.ts` after adding endpoints

## 3. UI Dependencies

- [x] 3.1 Add `@codemirror/autocomplete` to `packages/ui/package.json`
- [x] 3.2 Add `@codemirror/lint` to `packages/ui/package.json`
- [x] 3.3 Run `bun install` to install new dependencies

## 4. CodeMirror LSP Extension - Autocomplete

- [x] 4.1 Create `packages/ui/src/extensions/lsp/` directory structure
- [x] 4.2 Implement `completion.ts` - LSP completion source that calls `/lsp/completion`
- [x] 4.3 Add debouncing (150ms) to LSP completion requests
- [x] 4.4 Implement completion item detail/documentation display
- [x] 4.5 Add graceful fallback when LSP unavailable

## 5. CodeMirror LSP Extension - Diagnostics

- [x] 5.1 Implement `diagnostics.ts` - lint source that calls `/lsp/diagnostics`
- [x] 5.2 Map LSP diagnostic severity to CodeMirror lint severity (error, warning, info, hint)
- [x] 5.3 Add debounced refresh on document change (500ms)
- [x] 5.4 Implement gutter markers for diagnostic indicators

## 6. CodeMirror LSP Extension - Formatting

- [x] 6.1 Implement `formatting.ts` - format command that calls `/lsp/format`
- [x] 6.2 Add keyboard shortcut Shift+Alt+F for format document
- [x] 6.3 Implement format selection using `/lsp/format-range`
- [x] 6.4 Add format-on-save option (configurable)
- [x] 6.5 Implement progress indicator during format operation

## 7. Integration

- [x] 7.1 Create `index.ts` - `lspExtension()` factory bundling all extensions
- [x] 7.2 Integrate `lspExtension()` into `packages/ui/src/components/editor.tsx`
- [x] 7.3 Pass API endpoint configuration to lspExtension
- [x] 7.4 Add error handling for network failures with user-friendly messages

## 8. Testing & Polish

- [ ] 8.1 Test autocomplete with TypeScript files (type-aware completions)
- [ ] 8.2 Test diagnostics with ESLint errors
- [ ] 8.3 Test formatting with Prettier/language formatters
- [ ] 8.4 Verify graceful degradation when LSP unavailable
- [ ] 8.5 Test performance with large files (debouncing effectiveness)

> **Note:** Testing tasks require manual verification with a running OpenCode server.
