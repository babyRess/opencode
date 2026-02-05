import { autocompletion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete"
import type { Extension } from "@codemirror/state"

export interface LspCompletionConfig {
  endpoint: string
  file: string
  /** Get current editor content for LSP sync */
  getContent?: () => string
}

/**
 * Creates a CodeMirror autocomplete extension that fetches completions from LSP server
 */
export function lspCompletion(config: LspCompletionConfig): Extension {
  const { endpoint, file, getContent } = config
  let lastRequest: AbortController | null = null

  async function fetchCompletions(context: CompletionContext): Promise<CompletionResult | null> {
    // Cancel any pending request
    if (lastRequest) {
      lastRequest.abort()
      lastRequest = null
    }

    // Get position info
    const pos = context.pos
    const line = context.state.doc.lineAt(pos)
    const lineNumber = line.number - 1 // LSP uses 0-indexed lines
    const character = pos - line.from // Character position in line

    // Match word characters (can be empty)
    const word = context.matchBefore(/\w*/)

    // Check for trigger characters (., ::, etc.)
    const afterDot = context.matchBefore(/\.\w*$/)

    // Determine completion start position
    const from = word?.from ?? pos

    // Only skip if: not explicit AND no word being typed AND not after trigger char
    if (!context.explicit && (!word || word.from === word.to) && !afterDot) {
      return null
    }

    lastRequest = new AbortController()

    try {
      // Build request body
      const body: Record<string, unknown> = {
        file,
        line: lineNumber,
        character,
      }

      // Include current content if available (for LSP sync)
      if (getContent) {
        body.content = getContent()
      }

      const response = await fetch(`${endpoint}/lsp/completion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: lastRequest.signal,
      })

      if (!response.ok) {
        console.warn("[LSP] Completion request failed:", response.status)
        return null
      }

      const items = await response.json()

      if (!Array.isArray(items) || items.length === 0) {
        return null
      }

      return {
        from,
        validFor: /^\w*$/, // CRITICAL: Allow filtering without re-fetching
        options: items.map((item: any) => ({
          label: item.label,
          type: mapCompletionKind(item.kind),
          detail: item.detail,
          info: item.documentation
            ? typeof item.documentation === "string"
              ? item.documentation
              : item.documentation.value
            : undefined,
          apply: item.insertText ?? item.label,
          boost: item.sortText ? -parseInt(item.sortText, 10) : 0,
        })),
      }
    } catch (err) {
      // Graceful fallback - return null on error (network failure, timeout, etc.)
      if ((err as Error).name !== "AbortError") {
        console.warn("[LSP] Completion error:", err)
      }
      return null
    }
  }

  return autocompletion({
    override: [fetchCompletions],
    defaultKeymap: true,
    activateOnTyping: true,
    maxRenderedOptions: 50,
    interactionDelay: 100, // Built-in debounce instead of manual
  })
}

/**
 * Map LSP CompletionItemKind to CodeMirror completion type
 */
function mapCompletionKind(kind?: number): string {
  switch (kind) {
    case 1:
      return "text"
    case 2:
      return "method"
    case 3:
      return "function"
    case 4:
      return "constructor"
    case 5:
      return "field"
    case 6:
      return "variable"
    case 7:
      return "class"
    case 8:
      return "interface"
    case 9:
      return "module"
    case 10:
      return "property"
    case 11:
      return "unit"
    case 12:
      return "value"
    case 13:
      return "enum"
    case 14:
      return "keyword"
    case 15:
      return "snippet"
    case 16:
      return "color"
    case 17:
      return "file"
    case 18:
      return "reference"
    case 19:
      return "folder"
    case 20:
      return "enum"
    case 21:
      return "constant"
    case 22:
      return "class"
    case 23:
      return "event"
    case 24:
      return "operator"
    case 25:
      return "type"
    default:
      return "text"
  }
}
