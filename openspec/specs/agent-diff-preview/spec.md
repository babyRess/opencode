## ADDED Requirements

### Requirement: Agent changes shown as inline diff

When an agent proposes changes to a file, the editor SHALL display the changes as an inline diff overlay on the current content.

#### Scenario: Display agent-proposed changes

- **WHEN** an agent proposes changes to the currently open file
- **THEN** the editor SHALL display a unified diff view showing additions and deletions inline

#### Scenario: Diff highlighting colors

- **WHEN** agent changes are displayed
- **THEN** added lines SHALL be highlighted in green
- **AND** deleted lines SHALL be highlighted in red with strikethrough

### Requirement: Accept changes per hunk

The user SHALL be able to accept individual hunks (change blocks) from agent-proposed changes.

#### Scenario: Accept single hunk

- **WHEN** agent changes are displayed with multiple hunks
- **AND** user clicks "Accept" on a specific hunk
- **THEN** only that hunk SHALL be applied to the document
- **AND** other hunks SHALL remain as pending proposals

### Requirement: Reject changes per hunk

The user SHALL be able to reject individual hunks from agent-proposed changes.

#### Scenario: Reject single hunk

- **WHEN** agent changes are displayed with multiple hunks
- **AND** user clicks "Reject" on a specific hunk
- **THEN** that hunk SHALL be discarded
- **AND** other hunks SHALL remain as pending proposals

### Requirement: Accept all changes

The user SHALL be able to accept all pending changes at once.

#### Scenario: Accept all hunks

- **WHEN** agent changes are displayed
- **AND** user clicks "Accept All"
- **THEN** all pending changes SHALL be applied to the document
- **AND** the diff overlay SHALL be removed

### Requirement: Reject all changes

The user SHALL be able to reject all pending changes at once.

#### Scenario: Reject all hunks

- **WHEN** agent changes are displayed
- **AND** user clicks "Reject All"
- **THEN** all pending changes SHALL be discarded
- **AND** the document SHALL return to its original state
- **AND** the diff overlay SHALL be removed

### Requirement: Keyboard shortcuts for accept/reject

The user SHALL be able to accept or reject changes using keyboard shortcuts.

#### Scenario: Accept with Tab key

- **WHEN** agent changes are displayed
- **AND** a hunk is focused
- **AND** user presses Tab
- **THEN** the focused hunk SHALL be accepted

#### Scenario: Reject with Escape key

- **WHEN** agent changes are displayed
- **AND** user presses Escape
- **THEN** all pending changes SHALL be rejected

### Requirement: Diff view uses codemirror merge

The diff visualization SHALL use the @codemirror/merge package for rendering.

#### Scenario: Merge view integration

- **WHEN** agent proposes changes
- **THEN** the system SHALL use unifiedMergeView from @codemirror/merge to display the diff

### Requirement: Editor remains functional during diff preview

The user SHALL be able to scroll and navigate the document while viewing agent-proposed changes.

#### Scenario: Scroll during diff preview

- **WHEN** agent changes are displayed
- **AND** user scrolls the editor
- **THEN** the diff overlay SHALL scroll with the document content

### Requirement: Clear visual state for pending changes

The editor SHALL clearly indicate when there are pending agent changes awaiting review.

#### Scenario: Pending changes indicator

- **WHEN** agent changes are pending review
- **THEN** the editor SHALL display a visual indicator (e.g., badge, border) showing changes are pending
