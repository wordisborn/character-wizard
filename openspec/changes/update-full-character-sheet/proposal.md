# Change: Expand Character Data Model and Sheet to Full D&D 5e Coverage

## Why

The current character sheet only captures a minimal subset of D&D 5e character data — name, race, class, level, ability scores, hit points, a flat proficiency list, equipment list, background, and backstory. A real D&D 5e character sheet includes saving throws, 18 skills with proficiency markers, combat stats (AC, initiative, speed, hit dice, death saves), personality traits (ideals, bonds, flaws), spellcasting fields, currency, languages, class features, and numerous derived/computed values. Players cannot actually use the current sheet at a table without manually filling in these gaps elsewhere.

## What Changes

### Data Model Expansion (`app/src/types/character.ts`)
- Add **saving throw proficiencies** (array of 6 ability names the character is proficient in)
- Add **skills** with proficiency tracking (18 skills, each with proficiency boolean)
- Add **combat stats**: armor class, initiative bonus, speed, hit dice type/total, current HP, temporary HP, death saves
- Add **personality**: traits, ideals, bonds, flaws (from background)
- Add **spellcasting**: spellcasting ability, spell save DC, spell attack bonus, spell slots, cantrips known, spells known/prepared
- Add **features & traits**: racial traits and class features list
- Add **languages** as a separate tracked field
- Add **currency**: CP, SP, EP, GP, PP
- Add **alignment**, **experience points**, **subclass**, **subrace**
- Add **physical details**: age, height, weight, eyes, skin, hair
- Add **attacks**: structured weapon/spell attack entries (name, bonus, damage)

### Computed Fields Logic
- **Proficiency bonus**: derived from level (Math.ceil(level / 4) + 1)
- **Ability modifiers**: derived from scores (Math.floor((score - 10) / 2))
- **Saving throw values**: ability modifier + proficiency bonus if proficient
- **Skill values**: ability modifier + proficiency bonus if proficient
- **Passive Perception**: 10 + Perception skill value
- **Spell Save DC**: 8 + proficiency bonus + spellcasting ability modifier
- **Spell Attack Bonus**: proficiency bonus + spellcasting ability modifier
- **HP at level 1**: max hit die + CON modifier

### Character Sheet UI (`app/src/components/character-sheet.tsx`)
- Add **Saving Throws** section with proficiency indicators and computed values
- Add **Skills** section with all 18 skills, proficiency dots, and computed bonuses
- Add **Combat Stats** block: AC, Initiative, Speed in a horizontal row
- Add **Hit Dice & Death Saves** sub-section
- Add **Personality** section: traits, ideals, bonds, flaws
- Add **Features & Traits** section for racial/class features
- Add **Attacks & Spellcasting** section with structured attack entries
- Add **Spellcasting** section (conditional, only shown for caster classes)
- Add **Currency** display in equipment section
- Add **Languages** display

### AI Wizard Updates (`app/src/lib/system-prompt.ts`, `app/src/app/api/chat/route.ts`)
- Expand `update_character` tool schema to accept all new fields
- Update system prompt to guide the AI through computing and assigning derived values
- AI should auto-compute saving throw proficiencies, HP, skill proficiencies based on class/race/background choices
- AI should offer spell selection for spellcasting classes
- AI should assign personality traits from chosen background

### Database Schema (`supabase/migrations/`)
- Add migration to expand the `characters` table with new JSONB columns for skills, saving throws, spellcasting, personality, features, attacks, currency, and physical details

## Impact
- Affected specs: `character-sheet` (major expansion), `llm-integration` (tool schema expansion), `conversational-ui` (new steps for spells, personality)
- Affected code: `app/src/types/character.ts`, `app/src/components/character-sheet.tsx`, `app/src/components/print-sheet.tsx`, `app/src/lib/system-prompt.ts`, `app/src/lib/character-context.tsx`, `app/src/app/api/chat/route.ts`, `app/src/app/api/characters/route.ts`, `supabase/migrations/`
- **BREAKING**: The `Character` interface changes significantly — saved characters will need migration or graceful defaults for new fields
