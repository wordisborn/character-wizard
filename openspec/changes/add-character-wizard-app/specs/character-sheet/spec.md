## ADDED Requirements

### Requirement: Live Character Sheet Panel
The app SHALL display a character sheet in the right panel that updates in real time as the user makes decisions through conversation with the wizard.

#### Scenario: Character field updated via conversation
- **WHEN** the user makes a character decision in the chat (e.g., chooses a race)
- **THEN** the corresponding field on the character sheet updates immediately
- **AND** the updated field is visually highlighted briefly to draw attention

#### Scenario: Empty state
- **WHEN** no character decisions have been made yet
- **THEN** the character sheet shows placeholder/empty states for all fields
- **AND** the sheet still displays the full structure so the user can see what's ahead

### Requirement: Character Sheet Sections
The character sheet SHALL be organized into collapsible sections covering the core aspects of a D&D character.

#### Scenario: Section structure
- **WHEN** the character sheet is displayed
- **THEN** it includes sections for: Basic Info (name, level), Race & Class, Ability Scores, Skills & Proficiencies, Equipment, and Backstory

#### Scenario: Section collapse/expand
- **WHEN** the user clicks a section header
- **THEN** that section toggles between collapsed and expanded states
- **AND** the section retains its state during the session

### Requirement: Character Data Model
The app SHALL maintain a structured character data model that represents a D&D 5e character with core fields.

#### Scenario: Core character fields
- **WHEN** a character is being created
- **THEN** the data model tracks: name, race, class, level, ability scores (STR, DEX, CON, INT, WIS, CHA), hit points, proficiencies, equipment list, background, and backstory text

### Requirement: Character Save
The app SHALL allow the user to save their character to their account via a lightweight authentication flow.

#### Scenario: Save triggers login
- **WHEN** the user clicks Save and is not logged in
- **THEN** a modal appears offering Sign in with Google or email-based account creation
- **AND** after authentication the character is saved to their account

#### Scenario: Save when logged in
- **WHEN** the user clicks Save and is already logged in
- **THEN** the character is saved immediately with a confirmation

### Requirement: Character Print
The app SHALL allow the user to print their character sheet, capturing an email address first.

#### Scenario: Print triggers email capture
- **WHEN** the user clicks Print
- **THEN** a modal appears asking for their email address
- **AND** after providing the email the browser print dialog opens with a print-formatted character sheet
- **AND** the email is stored for future marketing communications
