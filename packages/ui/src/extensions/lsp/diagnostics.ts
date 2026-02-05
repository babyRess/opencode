import { linter, type Diagnostic } from "@codemirror/lint"
import type { Extension } from "@codemirror/state"

export interface LspDiagnosticsConfig {
  endpoint: string
  file: string
  debounceMs?: number
}

/**
 * Creates a CodeMirror linter extension that fetches diagnostics from LSP server
 */
export function lspDiagnostics(config: LspDiagnosticsConfig): Extension {
  const { endpoint, file, debounceMs = 500 } = config

  return linter(
    async (view) => {
      try {
        const response = await fetch(`${endpoint}/lsp/diagnostics?file=${encodeURIComponent(file)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
          return []
        }

        const items = await response.json()

        if (!Array.isArray(items)) {
          return []
        }

        const diagnostics: Diagnostic[] = []

        for (const item of items) {
          const startLine = item.range?.start?.line ?? 0
          const startChar = item.range?.start?.character ?? 0
          const endLine = item.range?.end?.line ?? startLine
          const endChar = item.range?.end?.character ?? startChar

          // Convert LSP positions to CodeMirror positions
          const doc = view.state.doc
          const startLineInfo = doc.line(Math.min(startLine + 1, doc.lines))
          const endLineInfo = doc.line(Math.min(endLine + 1, doc.lines))

          const from = Math.min(startLineInfo.from + startChar, startLineInfo.to)
          const to = Math.min(endLineInfo.from + endChar, endLineInfo.to)

          diagnostics.push({
            from,
            to: Math.max(from, to),
            severity: mapSeverity(item.severity),
            message: item.message,
            source: item.source,
          })
        }

        return diagnostics
      } catch (err) {
        console.warn("LSP diagnostics failed:", err)
        return []
      }
    },
    {
      delay: debounceMs,
    },
  )
}

/**
 * Map LSP DiagnosticSeverity to CodeMirror severity
 */
function mapSeverity(severity?: number): "error" | "warning" | "info" | "hint" {
  switch (severity) {
    case 1:
      return "error"
    case 2:
      return "warning"
    case 3:
      return "info"
    case 4:
      return "hint"
    default:
      return "error"
  }
}
