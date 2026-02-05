import type { Extension } from "@codemirror/state"
import { lspCompletion, type LspCompletionConfig } from "./completion"
import { lspDiagnostics, type LspDiagnosticsConfig } from "./diagnostics"
import { lspFormatting, type LspFormattingConfig, formatDocument, formatSelection } from "./formatting"

export interface LspExtensionConfig {
  /** Base URL for the LSP API endpoints (e.g., "http://localhost:4096") */
  endpoint: string
  /** File path for LSP operations */
  file: string
  /** Enable autocomplete (default: true) */
  completion?: boolean
  /** Enable diagnostics/linting (default: true) */
  diagnostics?: boolean
  /** Enable formatting (default: true) */
  formatting?: boolean
  /** Format on save (default: false) */
  formatOnSave?: boolean
  /** Debounce time for diagnostics refresh in ms (default: 500) */
  diagnosticsDebounceMs?: number
  /** Get current editor content for LSP sync */
  getContent?: () => string
}

/**
 * Creates a bundled CodeMirror extension for LSP features.
 *
 * This extension provides:
 * - Autocomplete with LSP completions (merged with client-side)
 * - Inline diagnostics (errors, warnings) from LSP
 * - Code formatting via LSP (Shift+Alt+F or format-on-save)
 *
 * @example
 * ```tsx
 * import { lspExtension } from "@opencode-ai/ui/extensions/lsp"
 *
 * createExtension(() => lspExtension({
 *   endpoint: "http://localhost:4096",
 *   file: "/path/to/file.ts",
 *   formatOnSave: true,
 * }))
 * ```
 */
export function lspExtension(config: LspExtensionConfig): Extension {
  const {
    endpoint,
    file,
    completion = true,
    diagnostics = true,
    formatting = true,
    formatOnSave = false,
    diagnosticsDebounceMs = 500,
    getContent,
  } = config

  const extensions: Extension[] = []

  if (completion) {
    extensions.push(
      lspCompletion({
        endpoint,
        file,
        getContent,
      }),
    )
  }

  if (diagnostics) {
    extensions.push(
      lspDiagnostics({
        endpoint,
        file,
        debounceMs: diagnosticsDebounceMs,
      }),
    )
  }

  if (formatting) {
    extensions.push(
      lspFormatting({
        endpoint,
        file,
        formatOnSave,
      }),
    )
  }

  return extensions
}

// Re-export individual extensions for granular control
export { lspCompletion, lspDiagnostics, lspFormatting, formatDocument, formatSelection }
export type { LspCompletionConfig, LspDiagnosticsConfig, LspFormattingConfig }
