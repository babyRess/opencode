## ADDED Requirements

### Requirement: Editor displays autocomplete popup on trigger

The editor SHALL display an autocomplete popup when the user types a trigger character (`.`, `/`, `@`, `<`) or invokes completion manually (Ctrl+Space).

#### Scenario: Trigger character activates completion

- **WHEN** user types a trigger character (e.g., `.` after an object)
- **THEN** the editor displays an autocomplete popup with relevant suggestions

#### Scenario: Manual completion invocation

- **WHEN** user presses Ctrl+Space (or Cmd+Space on Mac)
- **THEN** the editor displays an autocomplete popup at the cursor position

### Requirement: Client-side completions appear immediately

The editor SHALL show client-side completions (keywords, snippets, local symbols) immediately without waiting for LSP response.

#### Scenario: Instant keyword suggestions

- **WHEN** user starts typing a keyword (e.g., "func" in JavaScript)
- **THEN** matching keywords appear in the popup within 50ms

#### Scenario: Snippet suggestions

- **WHEN** user types a snippet prefix (e.g., "for" in JavaScript)
- **THEN** available snippets appear in the completion list

### Requirement: LSP completions merge asynchronously

The editor SHALL request completions from the LSP server and merge results into the popup when they arrive.

#### Scenario: LSP completions augment client-side results

- **WHEN** user triggers completion and LSP server responds
- **THEN** LSP completions (type-aware symbols, imports) are merged into the existing popup

#### Scenario: LSP request is debounced

- **WHEN** user types rapidly
- **THEN** LSP completion requests are debounced (150ms) to avoid excessive server load

### Requirement: Completion item shows detail and documentation

The editor SHALL display completion item details (type, signature) and documentation when available.

#### Scenario: Type information displayed

- **WHEN** user highlights a completion item from LSP
- **THEN** the item shows its type signature (e.g., `(param: string) => void`)

#### Scenario: Documentation shown in detail panel

- **WHEN** completion item has documentation
- **THEN** a detail panel shows the documentation alongside the popup

### Requirement: Completion gracefully degrades without LSP

The editor SHALL continue to provide client-side completions when LSP server is unavailable.

#### Scenario: LSP server not running

- **WHEN** LSP server is not available for the file type
- **THEN** editor shows client-side completions only without error

#### Scenario: LSP request timeout

- **WHEN** LSP completion request times out (>2s)
- **THEN** editor continues showing client-side completions
