## 1. Project Setup
- [ ] 1.1 Initialize Next.js app with TypeScript and App Router
- [ ] 1.2 Install dependencies: @anthropic-ai/sdk, three, @react-three/fiber, @react-three/drei
- [ ] 1.3 Set up project structure (components/, lib/, types/, app/ directories)
- [ ] 1.4 Configure environment variables for Anthropic API key

## 2. Character Data Model
- [ ] 2.1 Define TypeScript interfaces for Character (name, race, class, level, ability scores, HP, proficiencies, equipment, background, backstory, appearance)
- [ ] 2.2 Create CharacterContext with useReducer for state management
- [ ] 2.3 Define action types for character updates (SET_NAME, SET_RACE, SET_CLASS, UPDATE_ABILITY_SCORES, etc.)

## 3. Layout & UI Shell
- [ ] 3.1 Build the split-panel layout (left 2/3 chat, right 1/3 character sheet)
- [ ] 3.2 Create the chat panel component with message list and input area
- [ ] 3.3 Create the character sheet panel shell with collapsible sections
- [ ] 3.4 Style the app (clean, atmospheric D&D-inspired theme)

## 4. LLM Integration
- [ ] 4.1 Create the API route (app/api/chat/route.ts) for Claude communication
- [ ] 4.2 Write the D&D wizard system prompt with character creation knowledge
- [ ] 4.3 Implement structured output parsing (tool_use for character updates + conversational text)
- [ ] 4.4 Wire up streaming responses to the chat UI
- [ ] 4.5 Send current character state as context with each message

## 5. Chat UI
- [ ] 5.1 Implement message sending and display (user + wizard messages)
- [ ] 5.2 Add streaming response rendering
- [ ] 5.3 Add auto-scroll behavior
- [ ] 5.4 Add loading/typing indicator
- [ ] 5.5 Display initial wizard greeting on load

## 6. Character Sheet
- [ ] 6.1 Build the Basic Info section (name, level)
- [ ] 6.2 Build the Race & Class section
- [ ] 6.3 Build the Ability Scores section (six stats with modifiers)
- [ ] 6.4 Build the Skills & Proficiencies section
- [ ] 6.5 Build the Equipment section
- [ ] 6.6 Build the Backstory section
- [ ] 6.7 Add update highlight animations when fields change
- [ ] 6.8 Wire character sheet sections to CharacterContext

## 7. 3D Character Visualization
- [ ] 7.1 Set up React Three Fiber canvas in the character sheet panel
- [ ] 7.2 Create/source a base humanoid 3D model (low-poly or stylized)
- [ ] 7.3 Implement orbit controls (rotate, zoom)
- [ ] 7.4 Add dynamic material/color changes based on race and class
- [ ] 7.5 Add WebGL fallback for unsupported browsers

## 8. Character Export
- [ ] 8.1 Implement JSON export/download of character data

## 9. Polish & Error Handling
- [ ] 9.1 Add API error handling with retry capability
- [ ] 9.2 Add graceful degradation when 3D assets are missing
- [ ] 9.3 Test end-to-end character creation flow
