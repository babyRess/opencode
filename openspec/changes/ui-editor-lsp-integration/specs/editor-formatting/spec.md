## ADDED Requirements

### Requirement: Format document on demand

The editor SHALL format the entire document when user invokes the format command.

#### Scenario: Format via keyboard shortcut

- **WHEN** user presses Shift+Alt+F (or Shift+Option+F on Mac)
- **THEN** the editor sends format request to LSP and applies the edits

#### Scenario: Format via command palette

- **WHEN** user selects "Format Document" from command palette
- **THEN** the editor formats the document using LSP

### Requirement: Format on save

The editor SHALL optionally format the document automatically when saving.

#### Scenario: Format on save enabled

- **WHEN** format-on-save is enabled and user saves (Cmd/Ctrl+S)
- **THEN** the editor formats the document before saving

#### Scenario: Format on save disabled

- **WHEN** format-on-save is disabled and user saves
- **THEN** the document is saved without formatting

### Requirement: Format selection

The editor SHALL format only the selected text range when user has a selection.

#### Scenario: Format selected code block

- **WHEN** user selects a code block and invokes format
- **THEN** only the selected range is formatted, preserving surrounding code

#### Scenario: No selection formats entire document

- **WHEN** user invokes format with no selection
- **THEN** the entire document is formatted

### Requirement: Formatting preserves cursor position

The editor SHALL maintain logical cursor position after formatting.

#### Scenario: Cursor stays at logical position

- **WHEN** user formats document with cursor at line 10, column 5
- **THEN** cursor remains at the equivalent logical position after formatting

### Requirement: Formatting shows progress indicator

The editor SHALL indicate when formatting is in progress.

#### Scenario: Progress shown during format

- **WHEN** format request is sent to LSP
- **THEN** editor shows a subtle progress indicator

#### Scenario: Progress hidden on completion

- **WHEN** format operation completes
- **THEN** progress indicator is hidden

### Requirement: Formatting handles unavailable LSP gracefully

The editor SHALL show appropriate feedback when formatting is unavailable.

#### Scenario: No formatter available

- **WHEN** user invokes format but no LSP formatter supports the file type
- **THEN** editor shows message "No formatter available for this file type"

#### Scenario: LSP format request fails

- **WHEN** LSP format request fails or times out
- **THEN** editor shows error message and document remains unchanged
