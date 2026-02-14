## ADDED Requirements

### Requirement: Claude API Integration
The app SHALL use the Anthropic Claude API via a server-side API route to power the wizard's conversational intelligence.

#### Scenario: Message sent to Claude
- **WHEN** the user sends a message in the chat
- **THEN** the app sends the message along with conversation history and current character state to Claude via an API route
- **AND** the API key is never exposed to the client

#### Scenario: Streaming response
- **WHEN** Claude begins generating a response
- **THEN** the response is streamed to the client
- **AND** the chat displays the response progressively as it arrives

### Requirement: Structured Character Updates
The wizard SHALL return both conversational text and structured character data updates in each response so the character sheet can update programmatically.

#### Scenario: Response with character update
- **WHEN** Claude's response includes a character decision (e.g., the user chose to be an elf)
- **THEN** the response contains structured data indicating which character fields to update
- **AND** the chat displays the conversational portion
- **AND** the character sheet applies the structured updates

#### Scenario: Response without character update
- **WHEN** Claude's response is purely conversational (e.g., explaining a concept)
- **THEN** only the chat message is displayed
- **AND** the character sheet remains unchanged

### Requirement: D&D Knowledge System Prompt
The wizard SHALL be initialized with a system prompt that gives it deep knowledge of D&D 5e rules, character creation procedures, and the wizard persona.

#### Scenario: System prompt contents
- **WHEN** a conversation is initiated
- **THEN** the system prompt instructs Claude to act as a friendly character creation wizard
- **AND** includes D&D 5e character creation rules and procedures
- **AND** includes the current character state as context
- **AND** instructs Claude to return structured updates alongside conversational text

### Requirement: Error Handling
The app SHALL handle API errors gracefully without breaking the conversation flow.

#### Scenario: API error during response
- **WHEN** the Claude API returns an error or times out
- **THEN** the wizard displays a friendly error message in the chat
- **AND** the user can retry their last message
- **AND** the character state is not corrupted
