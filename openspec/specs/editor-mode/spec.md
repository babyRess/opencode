## ADDED Requirements

### Requirement: File viewer supports edit mode

The file viewer component SHALL support two modes: View mode (readonly) and Edit mode (editable). View mode SHALL be the default.

#### Scenario: Default to view mode

- **WHEN** a file is opened in the file viewer
- **THEN** the editor SHALL be in View mode (readonly)

#### Scenario: Cursor behavior in view mode

- **WHEN** the editor is in View mode
- **THEN** the cursor SHALL NOT be visible and text SHALL NOT be editable

### Requirement: Mode toggle via keyboard shortcut

The user SHALL be able to toggle between View and Edit modes using Cmd+E (Mac) or Ctrl+E (Windows/Linux).

#### Scenario: Toggle from view to edit mode

- **WHEN** the editor is in View mode
- **AND** user presses Cmd+E
- **THEN** the editor SHALL switch to Edit mode

#### Scenario: Toggle from edit to view mode

- **WHEN** the editor is in Edit mode
- **AND** user presses Cmd+E
- **THEN** the editor SHALL switch to View mode

### Requirement: Mode toggle via UI control

The user SHALL be able to toggle modes via a clickable UI control in addition to the keyboard shortcut.

#### Scenario: Click to toggle mode

- **WHEN** user clicks the mode toggle button
- **THEN** the editor SHALL switch to the opposite mode

### Requirement: Visual mode indicator

The editor SHALL display a clear visual indicator showing the current mode.

#### Scenario: View mode indicator

- **WHEN** the editor is in View mode
- **THEN** a status indicator SHALL display "VIEW"

#### Scenario: Edit mode indicator

- **WHEN** the editor is in Edit mode
- **THEN** a status indicator SHALL display "EDIT"
- **AND** the editor background MAY have a subtle visual distinction

### Requirement: Syntax highlighting in both modes

The editor SHALL provide syntax highlighting for supported languages in both View and Edit modes.

#### Scenario: Syntax highlighting preserved across mode switch

- **WHEN** user toggles between View and Edit modes
- **THEN** syntax highlighting SHALL remain applied

### Requirement: CodeMirror 6 integration

The editor SHALL use CodeMirror 6 as the underlying editor engine via the solid-codemirror package.

#### Scenario: Editor renders with CodeMirror

- **WHEN** a file is opened
- **THEN** the content SHALL be rendered using CodeMirror 6

### Requirement: Unsaved changes warning

The system SHALL warn users about unsaved changes when switching from Edit mode to View mode.

#### Scenario: Warn on mode switch with unsaved changes

- **WHEN** user is in Edit mode with unsaved changes
- **AND** user attempts to switch to View mode
- **THEN** the system SHALL prompt user to save or discard changes
