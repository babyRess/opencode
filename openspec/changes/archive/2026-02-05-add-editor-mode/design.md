## Context

OpenCode's GUI currently uses `@pierre/diffs` for file viewing - a read-only renderer with Shiki-based syntax highlighting via web workers. The architecture uses a `CodeComponentProvider` pattern that allows swapping the viewer implementation. Files are displayed in a `<diffs-container>` Shadow DOM web component.

Key existing components:

- `packages/ui/src/components/code.tsx` - Primary file viewer (read-only)
- `packages/ui/src/components/diff.tsx` - Diff viewer for before/after states
- `packages/ui/src/context/code.tsx` - Provider for injecting code component

No CodeMirror usage exists in the codebase currently.

## Goals / Non-Goals

**Goals:**

- Add edit capability to the existing file viewer without rebuilding the UI
- Enable inline diff preview for agent-proposed changes
- Maintain compatibility with existing `CodeProps` interface for gradual rollout
- Support future extensibility (LSP, formatters, vim mode)

**Non-Goals:**

- Full IDE feature parity (debugger, git integration, etc.)
- Replacing the TUI editor experience
- LSP integration (Phase 2+)
- Collaborative editing
- Mobile-optimized editing experience (view mode sufficient on mobile)

## Decisions

### Decision 1: Use CodeMirror 6 via solid-codemirror

**Choice:** CodeMirror 6 with `solid-codemirror` bindings

**Alternatives considered:**

- **Monaco Editor**: Full VS Code editor, but ~2.5MB bundle, poor mobile support, not SolidJS-native
- **Ace Editor**: Mature but dated architecture, less extensible
- **Enhance @pierre/diffs**: Would require building editor from scratch

**Rationale:**

- Small bundle (~150-300KB modular)
- Excellent mobile support
- `solid-codemirror` provides reactive primitives (`createCodeMirror`, `createEditorReadonly`)
- `@codemirror/merge` provides built-in diff visualization
- Compartment system enables dynamic mode switching

### Decision 2: Create new Editor component, keep Code component

**Choice:** Create `packages/ui/src/components/editor.tsx` alongside existing `code.tsx`

**Alternatives considered:**

- **Replace Code entirely**: Breaking change, risky
- **Modify Code in-place**: Mixes concerns, harder to test

**Rationale:**

- Provider pattern allows gradual rollout
- Can A/B test or feature-flag the new editor
- Existing `@pierre/diffs` remains for contexts where editing isn't needed
- Clear separation: `Code` = view-only, `Editor` = view + edit

### Decision 3: Mode toggle via Compartment reconfiguration

**Choice:** Use CodeMirror's `Compartment` for dynamic readonly toggle

```typescript
const editableCompartment = new Compartment()

// Toggle mode
view.dispatch({
  effects: editableCompartment.reconfigure(
    editable ? [] : [EditorState.readOnly.of(true), EditorView.editable.of(false)],
  ),
})
```

**Alternatives considered:**

- **Destroy/recreate editor**: Loses scroll position, slower
- **CSS pointer-events**: Doesn't prevent programmatic edits

**Rationale:**

- Official CodeMirror pattern for dynamic configuration
- Preserves editor state (scroll, selection) across mode switches
- `solid-codemirror` provides `createEditorReadonly` helper

### Decision 4: Use @codemirror/merge for agent diff preview

**Choice:** `unifiedMergeView` from `@codemirror/merge`

**Alternatives considered:**

- **Custom decorations**: More control but significant implementation effort
- **Keep @pierre/diffs for diffs**: Two systems, inconsistent UX
- **Side-by-side diff**: Takes more space, less intuitive for inline changes

**Rationale:**

- Built-in accept/reject per-chunk functionality
- Unified view shows changes in context
- Same editor instance, no context switching
- Well-maintained official package

### Decision 5: Store pending changes in component state

**Choice:** Pending agent changes stored as SolidJS signals in Editor component

```typescript
const [originalContent, setOriginalContent] = createSignal<string | null>(null)
const [pendingChanges, setPendingChanges] = createSignal(false)
```

**Alternatives considered:**

- **Global store**: Overkill for single-file changes
- **URL state**: Not appropriate for transient UI state

**Rationale:**

- Simple, local state management
- Easy to clear on accept/reject
- Component owns its diff lifecycle

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    packages/ui                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐     ┌─────────────────┐               │
│  │   code.tsx      │     │   editor.tsx    │  ← NEW        │
│  │  (@pierre/diffs)│     │  (CodeMirror 6) │               │
│  │   View only     │     │  View + Edit    │               │
│  └────────┬────────┘     └────────┬────────┘               │
│           │                       │                         │
│           └───────────┬───────────┘                         │
│                       ▼                                     │
│           ┌─────────────────────┐                          │
│           │ CodeComponentProvider│                          │
│           │ (context/code.tsx)  │                          │
│           └─────────────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Editor Component State                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   editMode: Signal<boolean>        ← View/Edit toggle       │
│   originalContent: Signal<string>  ← For diff comparison    │
│   pendingChanges: Signal<boolean>  ← Agent changes pending  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              CodeMirror EditorView                   │  │
│   ├─────────────────────────────────────────────────────┤  │
│   │  Extensions (via Compartments):                      │  │
│   │  ├── editableCompartment  → readonly toggle          │  │
│   │  ├── mergeViewCompartment → diff overlay             │  │
│   │  ├── themeCompartment     → light/dark theme         │  │
│   │  └── languageCompartment  → syntax highlighting      │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Risks / Trade-offs

| Risk                                           | Impact                 | Mitigation                                                                      |
| ---------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| Bundle size increase (~150-300KB)              | Slower initial load    | Lazy load editor component; CodeMirror is tree-shakeable                        |
| Two rendering systems during transition        | Maintenance burden     | Clear separation via provider; deprecate pierre for editable contexts over time |
| CodeMirror theme doesn't match existing UI     | Visual inconsistency   | Map existing CSS variables to CodeMirror theme; create custom theme             |
| @codemirror/merge limitations with large files | Performance issues     | Document size limits; fall back to simple diff for very large files             |
| Unsaved changes lost on navigation             | Data loss              | Implement beforeunload warning; auto-save draft to localStorage                 |
| Mobile editing UX suboptimal                   | Poor mobile experience | Default to view mode on mobile; edit mode opt-in                                |

## Open Questions

1. **Line annotations**: Current `Code` component supports `LineAnnotation` for comments. How to map this to CodeMirror decorations?
2. **Line selection**: Current component has `selectedLines` and `onLineSelectionEnd`. Need to implement equivalent in CodeMirror.
3. **Theme synchronization**: Should CodeMirror theme auto-switch with system dark mode, or follow app theme setting?
4. **Diff persistence**: If user navigates away with pending changes, should we persist them? (Leaning toward: warn and discard)
