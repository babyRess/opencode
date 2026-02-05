## ADDED Requirements

### Requirement: Editor displays inline diagnostics

The editor SHALL display LSP diagnostics (errors, warnings, info, hints) as inline decorations in the editor.

#### Scenario: Error shown with red underline

- **WHEN** LSP reports an error diagnostic for a range
- **THEN** the editor displays a red wavy underline under the affected text

#### Scenario: Warning shown with yellow underline

- **WHEN** LSP reports a warning diagnostic for a range
- **THEN** the editor displays a yellow wavy underline under the affected text

#### Scenario: Multiple diagnostics on same line

- **WHEN** LSP reports multiple diagnostics on the same line
- **THEN** all diagnostics are displayed with appropriate styling

### Requirement: Diagnostic details shown on hover

The editor SHALL display diagnostic message and details when user hovers over a diagnostic marker.

#### Scenario: Hover shows error message

- **WHEN** user hovers over a diagnostic underline
- **THEN** a tooltip displays the diagnostic message and severity

#### Scenario: Hover shows source

- **WHEN** diagnostic has a source (e.g., "typescript", "eslint")
- **THEN** the tooltip includes the source name

### Requirement: Diagnostics panel shows all issues

The editor SHALL provide a diagnostics panel listing all current diagnostics for the file.

#### Scenario: Panel lists all diagnostics

- **WHEN** user opens the diagnostics panel
- **THEN** all diagnostics are listed with severity icon, message, and line number

#### Scenario: Clicking diagnostic navigates to location

- **WHEN** user clicks a diagnostic in the panel
- **THEN** the editor scrolls to and highlights the diagnostic location

### Requirement: Diagnostics update on document change

The editor SHALL refresh diagnostics when the document content changes.

#### Scenario: Diagnostics refresh after edit

- **WHEN** user edits the document
- **THEN** editor requests fresh diagnostics from LSP (debounced 500ms)

#### Scenario: Stale diagnostics cleared during refresh

- **WHEN** diagnostics refresh is in progress
- **THEN** diagnostics for changed regions are cleared until new results arrive

### Requirement: Gutter shows diagnostic indicators

The editor SHALL display diagnostic severity indicators in the line number gutter.

#### Scenario: Error indicator in gutter

- **WHEN** a line contains an error diagnostic
- **THEN** a red dot or icon appears in the gutter for that line

#### Scenario: Highest severity shown when multiple

- **WHEN** a line contains both error and warning diagnostics
- **THEN** the gutter shows the error indicator (highest severity)
