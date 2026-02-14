# Change: Add D&D Character Creation Wizard Web App

## Why
Creating a D&D character is one of the most daunting parts of getting into tabletop RPGs. New players face rulebooks, stat calculations, race/class combos, and backstory writing all at once. Even experienced players can get stuck in creative ruts. An AI-powered conversational wizard that walks you through character creation — while showing the character sheet and a 3D model come to life in real time — makes the whole process approachable and fun.

## What Changes
- **Conversational UI** (left 2/3 of screen): A chat interface where an AI wizard guides character creation through natural conversation. Adapts to the user's experience level and the game system being used (starting with D&D 5e).
- **Live Character Sheet** (right 1/3 of screen): A character sheet panel that updates in real time as the conversation progresses. Shows stats, abilities, equipment, backstory, and other fields filling in as decisions are made.
- **3D Character Visualization**: A Three.js-powered canvas embedded in the character sheet panel that renders a 3D character model. The model updates as the user makes choices about race, class, appearance, and equipment.
- **LLM Integration**: Claude API integration powering the wizard. The AI understands D&D rules, can explain mechanics, suggest options, help with backstory, and knows when to push forward vs. let the user explore.
- **Next.js Full-Stack App**: Next.js app with React frontend and API routes for Claude communication. No database for v1 — character data lives in client state with export/download capability.

## Impact
- Affected specs: `conversational-ui`, `character-sheet`, `character-visualization`, `llm-integration` (all new)
- Affected code: Entirely greenfield — new Next.js project
- External dependencies: Anthropic API (Claude), Three.js, potentially ReadyPlayerMe or similar for 3D avatar base models
