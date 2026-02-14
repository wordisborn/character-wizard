## Context
Greenfield web app for AI-guided D&D character creation. The app combines a chat interface, a live-updating character sheet, and a 3D character preview. Built with Next.js, React, Claude API, and Three.js.

Key stakeholders: D&D players (new and experienced), DMs who want to help players prep.

## Goals / Non-Goals

### Goals
- Conversational character creation that feels like talking to a knowledgeable friend
- Real-time character sheet that reflects conversation progress
- 3D character model that visually evolves with choices
- Support D&D 5e as the primary system, with architecture that could support others later
- Works well on desktop (the split-panel layout is the primary experience)

### Non-Goals
- Mobile-first design (v1 is desktop-focused, the layout needs screen real estate)
- User accounts or persistence beyond the session (v1 uses client-side state + export)
- Full rules engine / automated validation of every D&D rule
- Support for every D&D edition or other TTRPG systems in v1
- Multiplayer / party creation

## Decisions

### Architecture: Next.js App Router
- Use App Router with server components where possible
- API routes handle Claude communication (keeps API key server-side)
- Client components for chat, character sheet, and 3D canvas

### State Management: React Context + useReducer
- A `CharacterContext` holds the evolving character data
- The LLM response parser extracts structured data and dispatches updates
- No external state library needed for v1 scope
- Character state shape is a well-typed TypeScript interface

### LLM Integration Pattern
- System prompt gives Claude deep D&D knowledge and the wizard persona
- Each message includes current character state as context
- Claude responds with both conversational text AND structured JSON updates to the character sheet
- Use a structured output format: `{ message: string, characterUpdates: Partial<Character> }`
- Stream responses for good UX

### 3D Visualization: Three.js + React Three Fiber
- Use React Three Fiber (R3F) for React-idiomatic Three.js
- Start with a simple humanoid base model
- Swap/modify model parts based on race, class, and equipment choices
- Keep it stylized (low-poly or painterly) to avoid uncanny valley and keep performance light
- Fall back to a 2D illustrated portrait if 3D assets aren't ready

### Character Sheet Layout
- Right panel is scrollable with sections that highlight/animate when updated
- Sections: Basic Info, Ability Scores, Race & Class, Skills & Proficiencies, Equipment, Backstory, Appearance
- Each section can be collapsed/expanded
- Visual indicators when a field gets updated from the conversation

## Risks / Trade-offs

### Risk: 3D asset pipeline complexity
- Creating/customizing 3D models for every race/class combo is a lot of work
- **Mitigation**: Start with a single humanoid base, use color/material changes and simple prop swaps. Expand asset library over time.

### Risk: LLM response parsing reliability
- Claude needs to return both conversational text and structured updates consistently
- **Mitigation**: Use tool_use / structured outputs. Validate parsed data before applying. Graceful fallback if parsing fails (show message, skip character update).

### Risk: Character data model complexity
- D&D 5e character sheets have many interconnected fields
- **Mitigation**: Start with core fields (name, race, class, level, ability scores, HP, backstory). Add derived/complex fields iteratively.

## Open Questions
- What 3D model format/source to use? (glTF from ReadyPlayerMe, Mixamo, or custom low-poly?)
- Should the wizard have a visible avatar/persona in the chat? (a little wizard character?)
- Export format: PDF character sheet, JSON, or both?
