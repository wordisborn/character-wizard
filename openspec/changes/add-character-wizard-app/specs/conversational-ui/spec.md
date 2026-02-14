## ADDED Requirements

### Requirement: Welcome Screen
The app SHALL display a welcome/landing screen as the first thing users see before entering the character creation interface.

#### Scenario: First visit
- **WHEN** the user navigates to the app for the first time
- **THEN** a full-screen welcome page is displayed with the Character Wizard branding
- **AND** a brief description of what the wizard does
- **AND** a prominent "Get Started" button that transitions to the chat interface

### Requirement: Chat Interface Layout
The app SHALL display a split-panel layout with the conversational chat occupying the left two-thirds of the viewport and the character sheet panel occupying the right one-third.

#### Scenario: Initial page load
- **WHEN** the user loads the app
- **THEN** the chat panel is displayed on the left (approximately 66% width)
- **AND** the character sheet panel is displayed on the right (approximately 34% width)
- **AND** the chat shows an initial greeting from the wizard

### Requirement: Message Input and Display
The app SHALL provide a text input area where the user can type messages and see a scrolling conversation history with both user and wizard messages.

#### Scenario: User sends a message
- **WHEN** the user types a message and presses Enter or clicks Send
- **THEN** the message appears in the chat history as a user message
- **AND** a loading indicator shows while the wizard is responding
- **AND** the wizard's response streams in and appears as a wizard message

#### Scenario: Conversation history scrolling
- **WHEN** the conversation grows beyond the visible area
- **THEN** the chat auto-scrolls to the latest message
- **AND** the user can scroll up to review earlier messages

### Requirement: Wizard Persona
The wizard SHALL adopt a friendly, knowledgeable persona that adapts its guidance based on the user's experience level with D&D.

#### Scenario: New player detected
- **WHEN** the user indicates they are new to D&D or seems unfamiliar with concepts
- **THEN** the wizard explains concepts in simple terms
- **AND** offers suggestions and recommendations rather than overwhelming with options

#### Scenario: Experienced player detected
- **WHEN** the user demonstrates knowledge of D&D mechanics
- **THEN** the wizard skips basic explanations
- **AND** engages at a deeper level about optimization, lore, or creative backstory ideas

### Requirement: Guided Conversation Flow
The wizard SHALL guide the user through character creation in a logical order while remaining flexible enough to handle out-of-order decisions.

#### Scenario: Standard creation flow
- **WHEN** a new conversation begins
- **THEN** the wizard starts by understanding which game system and edition the user wants
- **AND** proceeds through: concept/idea, race, class, ability scores, background, equipment, backstory, and finishing touches

#### Scenario: User jumps ahead
- **WHEN** the user makes a decision about a later step (e.g., picks equipment before choosing a class)
- **THEN** the wizard acknowledges the choice
- **AND** notes any dependencies that still need to be resolved
- **AND** continues the conversation naturally
