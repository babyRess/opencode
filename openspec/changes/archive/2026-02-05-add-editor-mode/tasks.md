## 1. Setup & Dependencies

- [x] 1.1 Add CodeMirror dependencies to packages/ui/package.json: `solid-codemirror`, `@codemirror/view`, `@codemirror/state`, `@codemirror/merge`, `@codemirror/language`
- [x] 1.2 Add common language packages: `@codemirror/lang-javascript`, `@codemirror/lang-typescript`, `@codemirror/lang-json`, `@codemirror/lang-html`, `@codemirror/lang-css`, `@codemirror/lang-markdown`
- [x] 1.3 Verify dependencies install and build succeeds

## 2. Editor Component Foundation

- [x] 2.1 Create `packages/ui/src/components/editor.tsx` with basic CodeMirror setup using `createCodeMirror`
- [x] 2.2 Implement `EditorProps` interface matching existing `CodeProps` for compatibility
- [x] 2.3 Add language detection based on file extension and configure syntax highlighting
- [x] 2.4 Create CodeMirror theme that maps to existing CSS variables (--font-family-mono, --font-size-small, etc.)
- [x] 2.5 Add editor container styling to match existing code viewer dimensions

## 3. View/Edit Mode Toggle

- [x] 3.1 Add `editMode` signal and `editableCompartment` for dynamic readonly toggle
- [x] 3.2 Implement Cmd+E / Ctrl+E keyboard shortcut using CodeMirror keymap
- [x] 3.3 Add mode toggle button UI element
- [x] 3.4 Add status bar indicator showing "VIEW" or "EDIT" mode
- [x] 3.5 Add subtle background color change for edit mode visual distinction
- [x] 3.6 Ensure cursor is hidden in view mode (EditorView.editable.of(false))

## 4. Unsaved Changes Handling

- [x] 4.1 Track dirty state (content changed from original)
- [x] 4.2 Implement warning dialog when switching from edit to view mode with unsaved changes
- [x] 4.3 Add beforeunload handler to warn on page navigation with unsaved changes
- [x] 4.4 Expose onSave callback prop for parent components to handle saves

## 5. Agent Diff Preview

- [x] 5.1 Add `mergeViewCompartment` for dynamic diff overlay
- [x] 5.2 Create `showAgentDiff(originalContent, proposedContent)` function using `unifiedMergeView`
- [x] 5.3 Implement diff highlighting styles (green for additions, red with strikethrough for deletions)
- [x] 5.4 Add pending changes indicator (badge/border) when diff is active

## 6. Accept/Reject Workflow

- [x] 6.1 Add "Accept All" button that applies all changes and clears diff overlay
- [x] 6.2 Add "Reject All" button that restores original content and clears diff overlay
- [x] 6.3 Implement per-hunk accept/reject buttons using @codemirror/merge chunk API
- [x] 6.4 Add Tab keyboard shortcut to accept focused hunk
- [x] 6.5 Add Escape keyboard shortcut to reject all pending changes
- [x] 6.6 Ensure editor returns to normal state after all hunks are resolved

## 7. Provider Integration

- [x] 7.1 Create `EditorComponentProvider` in `packages/ui/src/context/editor.tsx`
- [x] 7.2 Update `packages/app/src/app.tsx` to provide Editor component where editing is needed
- [x] 7.3 Add feature flag or prop to switch between Code (view-only) and Editor components
- [x] 7.4 Test Editor component in session page file viewer context

## 8. Testing & Polish

- [x] 8.1 Test mode toggle preserves scroll position and selection
- [x] 8.2 Test syntax highlighting for common languages (JS, TS, JSON, HTML, CSS, MD)
- [x] 8.3 Test diff preview with multi-hunk changes
- [x] 8.4 Test accept/reject workflow clears state correctly
- [x] 8.5 Test keyboard shortcuts don't conflict with existing app shortcuts
- [x] 8.6 Verify bundle size impact is within expected range (~150-300KB)

## 9. Session Page Integration

- [x] 9.1 Update session.tsx to use useEditorComponent() instead of useCodeComponent() for file viewer

## 10. Fix: Keep Original View Mode

- [x] 10.1 Revert session.tsx to use Code component (view mode cũ) as default
- [x] 10.2 Add toggle state to switch between Code (view) and Editor (edit) components
- [x] 10.3 Add toggle UI button in file viewer header

## 11. UI Polish: Redesign Toggle

- [x] 11.1 Replace single button with segmented control (both VIEW and EDIT always visible)

## 12. Fix: Add Missing Keymaps

- [x] 12.1 Add defaultKeymap from @codemirror/commands for basic editing (Enter, Backspace, arrows, etc.)
- [x] 12.2 Add history() and historyKeymap for undo/redo support
- [x] 12.3 Add indentWithTab for Tab key indentation
- [x] 12.4 Add drawSelection for proper selection rendering

## 13. Backend: File Write API

- [x] 13.1 Add POST /file/content endpoint in packages/opencode/src/server/routes/file.ts
- [x] 13.2 Add File.write() function in packages/opencode/src/file/index.ts
- [x] 13.3 Emit File.Event.Edited and FileWatcher.Event.Updated after write
- [x] 13.4 Regenerate SDK with ./script/generate.ts

## 14. Frontend: Save Integration

- [x] 14.1 Add file.write() call in session.tsx when user saves in edit mode
- [x] 14.2 Add dirty indicator (•) in toggle area when content changed
- [x] 14.3 Show save dialog when switching from EDIT to VIEW with unsaved changes
- [x] 14.4 Update file tab to show dirty indicator
