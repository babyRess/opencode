import { createSignal, createEffect, onCleanup, splitProps, type ComponentProps } from "solid-js"
import { createCodeMirror } from "solid-codemirror"
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
} from "@codemirror/view"
import { Compartment } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { markdown } from "@codemirror/lang-markdown"
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { lspExtension, type LspExtensionConfig } from "../extensions/lsp"

export type EditorProps = {
  file: {
    name: string
    contents: string
    cacheKey?: string
    /** Absolute file path for LSP operations */
    path?: string
  }
  onValueChange?: (value: string) => void
  onSave?: (value: string) => void
  class?: string
  classList?: ComponentProps<"div">["classList"]
  /** LSP configuration. If provided, enables autocomplete, diagnostics, and formatting. */
  lsp?: {
    /** Base URL for the LSP API endpoints (e.g., "http://localhost:4096") */
    endpoint: string
    /** Enable autocomplete (default: true) */
    completion?: boolean
    /** Enable diagnostics/linting (default: true) */
    diagnostics?: boolean
    /** Enable formatting (default: true) */
    formatting?: boolean
    /** Format on save (default: false) */
    formatOnSave?: boolean
  }
}

// Map file extensions to CodeMirror language support
function getLanguageExtension(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return javascript({ jsx: true })
    case "ts":
    case "tsx":
    case "mts":
    case "cts":
      return javascript({ jsx: true, typescript: true })
    case "json":
      return json()
    case "html":
    case "htm":
      return html()
    case "css":
    case "scss":
    case "less":
      return css()
    case "md":
    case "mdx":
    case "markdown":
      return markdown()
    default:
      return []
  }
}

// Custom theme that maps to existing CSS variables
const editorTheme = EditorView.theme({
  "&": {
    fontSize: "var(--font-size-small, 13px)",
    fontFamily: "var(--font-family-mono, monospace)",
    backgroundColor: "transparent",
    height: "100%",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
  ".cm-content": {
    fontFamily: "var(--font-family-mono, monospace)",
    padding: "8px 0",
    caretColor: "var(--text-strong, #000)",
  },
  ".cm-line": {
    padding: "0 8px",
    lineHeight: "24px",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    borderRight: "none",
    color: "var(--text-weak, #666)",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 8px 0 16px",
    minWidth: "40px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "var(--text-strong, #000)",
  },
  ".cm-activeLine": {
    backgroundColor: "var(--surface-base-hover, rgba(0,0,0,0.03))",
  },
  ".cm-selectionBackground": {
    backgroundColor: "var(--surface-interactive-weak, rgba(0,100,255,0.15)) !important",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "var(--surface-interactive-weak, rgba(0,100,255,0.2)) !important",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--text-strong, #000)",
    borderLeftWidth: "2px",
  },
})

export function Editor(props: EditorProps) {
  const [local] = splitProps(props, ["file", "onValueChange", "onSave", "class", "classList", "lsp"])

  // State
  const [isDirty, setIsDirty] = createSignal(false)
  const [originalContent, setOriginalContent] = createSignal(local.file.contents)

  // Compartments for dynamic configuration
  const languageCompartment = new Compartment()

  // Create CodeMirror instance
  const { ref, editorView, createExtension } = createCodeMirror({
    value: local.file.contents,
    onValueChange: (value) => {
      if (value !== originalContent()) {
        setIsDirty(true)
      }
      local.onValueChange?.(value)
    },
  })

  // Base extensions
  createExtension(() => [
    lineNumbers(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    drawSelection(),
    history(),
    syntaxHighlighting(defaultHighlightStyle),
    editorTheme,
    EditorView.lineWrapping,
  ])

  // Language extension (dynamic based on file)
  createExtension(() => languageCompartment.of(getLanguageExtension(local.file.name)))

  // Keyboard shortcuts - defaultKeymap provides Enter, Backspace, arrows, Home/End, etc.
  createExtension(() =>
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      indentWithTab,
      {
        key: "Mod-s",
        run: () => {
          if (isDirty()) {
            const view = editorView()
            if (view) {
              local.onSave?.(view.state.doc.toString())
              setIsDirty(false)
              setOriginalContent(view.state.doc.toString())
            }
          }
          return true
        },
      },
    ]),
  )

  // LSP extension (autocomplete, diagnostics, formatting)
  createExtension(() => {
    if (!local.lsp || !local.file.path) {
      console.log("[Editor] LSP disabled - missing config or file.path")
      return []
    }
    console.log("[Editor] LSP enabled for:", local.file.path)
    return lspExtension({
      endpoint: local.lsp.endpoint,
      file: local.file.path,
      completion: local.lsp.completion,
      diagnostics: local.lsp.diagnostics,
      formatting: local.lsp.formatting,
      formatOnSave: local.lsp.formatOnSave,
      getContent: () => editorView()?.state.doc.toString() ?? "",
    })
  })

  // Update content when file changes
  createEffect(() => {
    const view = editorView()
    if (!view) return

    const newContent = local.file.contents
    if (view.state.doc.toString() !== newContent) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: newContent },
      })
      setOriginalContent(newContent)
      setIsDirty(false)
    }
  })

  // Update language when filename changes
  createEffect(() => {
    const view = editorView()
    if (!view) return

    view.dispatch({
      effects: languageCompartment.reconfigure(getLanguageExtension(local.file.name)),
    })
  })

  // Beforeunload warning for unsaved changes
  createEffect(() => {
    if (!isDirty()) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }

    window.addEventListener("beforeunload", handler)
    onCleanup(() => window.removeEventListener("beforeunload", handler))
  })

  return (
    <div
      data-component="editor"
      class="h-full"
      classList={{
        ...(local.classList || {}),
        [local.class ?? ""]: !!local.class,
      }}
      ref={ref}
    />
  )
}
