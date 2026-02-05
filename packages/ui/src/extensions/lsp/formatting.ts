import { type Extension, StateField, StateEffect } from "@codemirror/state"
import { EditorView, keymap, showPanel, type Panel } from "@codemirror/view"

export interface LspFormattingConfig {
  endpoint: string
  file: string
  formatOnSave?: boolean
}

// State effect to show/hide formatting progress
const setFormatting = StateEffect.define<boolean>()

// State field to track formatting status
const formattingState = StateField.define<boolean>({
  create: () => false,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setFormatting)) {
        return effect.value
      }
    }
    return value
  },
})

/**
 * Creates a formatting progress panel
 */
function formattingPanel(view: EditorView): Panel {
  const dom = document.createElement("div")
  dom.className = "cm-formatting-panel"
  dom.style.padding = "4px 8px"
  dom.style.fontSize = "12px"
  dom.style.color = "var(--text-muted, #666)"
  dom.style.display = "none"
  dom.textContent = "Formatting..."

  return {
    dom,
    update(update) {
      const isFormatting = update.state.field(formattingState)
      dom.style.display = isFormatting ? "block" : "none"
    },
  }
}

/**
 * Format the entire document using LSP
 */
async function formatDocument(view: EditorView, config: LspFormattingConfig): Promise<boolean> {
  const { endpoint, file } = config

  // Show progress indicator
  view.dispatch({ effects: setFormatting.of(true) })

  try {
    const response = await fetch(`${endpoint}/lsp/format`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file,
        options: {
          tabSize: view.state.tabSize,
          insertSpaces: true,
        },
      }),
    })

    if (!response.ok) {
      console.warn("LSP format failed:", response.statusText)
      return false
    }

    const edits = await response.json()

    if (!Array.isArray(edits) || edits.length === 0) {
      return true // No changes needed
    }

    // Apply edits in reverse order to preserve positions
    const sortedEdits = [...edits].sort((a, b) => {
      const aStart = a.range?.start?.line ?? 0
      const bStart = b.range?.start?.line ?? 0
      return bStart - aStart
    })

    const changes = sortedEdits.map((edit) => {
      const doc = view.state.doc
      const startLine = Math.min((edit.range?.start?.line ?? 0) + 1, doc.lines)
      const endLine = Math.min((edit.range?.end?.line ?? 0) + 1, doc.lines)
      const startLineInfo = doc.line(startLine)
      const endLineInfo = doc.line(endLine)

      const from = Math.min(startLineInfo.from + (edit.range?.start?.character ?? 0), startLineInfo.to)
      const to = Math.min(endLineInfo.from + (edit.range?.end?.character ?? 0), endLineInfo.to)

      return {
        from,
        to,
        insert: edit.newText ?? "",
      }
    })

    view.dispatch({ changes })
    return true
  } catch (err) {
    console.warn("LSP format error:", err)
    return false
  } finally {
    // Hide progress indicator
    view.dispatch({ effects: setFormatting.of(false) })
  }
}

/**
 * Format the selected range using LSP
 */
async function formatSelection(view: EditorView, config: LspFormattingConfig): Promise<boolean> {
  const { endpoint, file } = config
  const selection = view.state.selection.main

  if (selection.empty) {
    // No selection, format entire document
    return formatDocument(view, config)
  }

  // Show progress indicator
  view.dispatch({ effects: setFormatting.of(true) })

  try {
    const doc = view.state.doc
    const fromLine = doc.lineAt(selection.from)
    const toLine = doc.lineAt(selection.to)

    const response = await fetch(`${endpoint}/lsp/format-range`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file,
        range: {
          start: {
            line: fromLine.number - 1,
            character: selection.from - fromLine.from,
          },
          end: {
            line: toLine.number - 1,
            character: selection.to - toLine.from,
          },
        },
        options: {
          tabSize: view.state.tabSize,
          insertSpaces: true,
        },
      }),
    })

    if (!response.ok) {
      console.warn("LSP format-range failed:", response.statusText)
      return false
    }

    const edits = await response.json()

    if (!Array.isArray(edits) || edits.length === 0) {
      return true // No changes needed
    }

    // Apply edits
    const changes = edits.map((edit) => {
      const startLine = Math.min((edit.range?.start?.line ?? 0) + 1, doc.lines)
      const endLine = Math.min((edit.range?.end?.line ?? 0) + 1, doc.lines)
      const startLineInfo = doc.line(startLine)
      const endLineInfo = doc.line(endLine)

      const from = Math.min(startLineInfo.from + (edit.range?.start?.character ?? 0), startLineInfo.to)
      const to = Math.min(endLineInfo.from + (edit.range?.end?.character ?? 0), endLineInfo.to)

      return {
        from,
        to,
        insert: edit.newText ?? "",
      }
    })

    view.dispatch({ changes })
    return true
  } catch (err) {
    console.warn("LSP format-range error:", err)
    return false
  } finally {
    // Hide progress indicator
    view.dispatch({ effects: setFormatting.of(false) })
  }
}

/**
 * Creates a CodeMirror extension for LSP formatting
 */
export function lspFormatting(config: LspFormattingConfig): Extension {
  const extensions: Extension[] = [
    formattingState,
    showPanel.of(formattingPanel),
    keymap.of([
      {
        // Shift+Alt+F for format document (VS Code style)
        key: "Shift-Alt-f",
        run: (view) => {
          formatDocument(view, config)
          return true
        },
      },
      {
        // Also support Shift+Option+F on Mac
        key: "Shift-Meta-f",
        mac: "Shift-Alt-f",
        run: (view) => {
          formatSelection(view, config)
          return true
        },
      },
    ]),
  ]

  // Add format-on-save if enabled
  if (config.formatOnSave) {
    extensions.push(
      EditorView.domEventHandlers({
        keydown: (event, view) => {
          // Intercept Cmd/Ctrl+S for format-on-save
          if ((event.metaKey || event.ctrlKey) && event.key === "s") {
            formatDocument(view, config)
            // Don't prevent default - let the save handler also run
          }
          return false
        },
      }),
    )
  }

  return extensions
}

// Export format functions for programmatic use
export { formatDocument, formatSelection }
