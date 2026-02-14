## Context

The current character data model is minimal — it captures the basics of character identity but omits the majority of fields found on an official D&D 5e character sheet. This design covers how to expand the model, compute derived values, update the AI integration, and present everything in the UI without overcomplicating the architecture.

Key reference: [D&D Basic Rules 2014](https://www.dndbeyond.com/sources/dnd/basic-rules-2014) — the canonical source for character creation rules, ability scores, skills, combat mechanics, and spellcasting.

## Goals / Non-Goals

### Goals
- Full coverage of the official D&D 5e character sheet (pages 1-3)
- Computed values derived automatically from base stats (no manual math)
- AI wizard assigns all relevant fields during character creation
- Backward compatibility with existing saved characters (graceful defaults)
- Print sheet updated to match the expanded data

### Non-Goals
- Multiclassing support (complex edge case, defer to future)
- Feats selection UI (AI can mention them, but no structured picker)
- Full spell database/search (AI recommends spells by name; no autocomplete)
- Character leveling/advancement flow (focus is level 1 creation)
- Encounter/combat tracker functionality

## Decisions

### 1. Computed vs Stored Fields

**Decision**: Store base data, compute derived values at render time via pure utility functions.

Fields that are **stored** (source of truth from user/AI choices):
- Ability scores, level, class, race, subclass, subrace
- Saving throw proficiencies (string[]), skill proficiencies (string[])
- Equipment list, spell list, feature list
- Background, personality fields, currency values

Fields that are **computed** (never stored, always derived):
- Ability modifiers, proficiency bonus
- Saving throw totals, skill totals
- Passive Perception, Spell Save DC, Spell Attack Bonus
- HP at level 1 (max hit die + CON mod) — though `hitPoints` remains the stored override

**Rationale**: Avoids data staleness. If a user changes an ability score, all derived values update automatically. Keeps the data model lean and the AI tool schema focused on base choices.

**Alternatives considered**:
- Store everything flat (simpler AI output but creates sync bugs when scores change)
- Use a class-based model with methods (over-engineered for a React app)

### 2. Character Type Structure

**Decision**: Extend the existing flat `Character` interface with new optional fields. Use sub-interfaces for structured groups (spellcasting, currency, attacks).

```typescript
interface Character {
  // Existing fields (unchanged)
  name, race, class, level, abilityScores, hitPoints, proficiencies,
  equipment, background, backstory, appearance, edition, portraitUrl

  // New identity fields
  alignment?: string;
  experiencePoints?: number;
  subclass?: string;
  subrace?: string;

  // New physical details
  age?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  skin?: string;
  hair?: string;

  // New combat fields
  armorClass?: number;
  initiative?: number;
  speed?: number;
  hitDice?: string;          // e.g. "1d10"
  currentHitPoints?: number;
  temporaryHitPoints?: number;
  deathSaves?: { successes: number; failures: number };

  // Proficiency details
  savingThrowProficiencies?: string[];  // e.g. ["strength", "constitution"]
  skillProficiencies?: string[];        // e.g. ["athletics", "perception"]
  languages?: string[];

  // Personality
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;

  // Features
  features?: string[];  // Racial traits + class features

  // Attacks
  attacks?: Attack[];

  // Spellcasting
  spellcasting?: SpellcastingInfo;

  // Currency
  currency?: Currency;
}
```

**Rationale**: Optional fields maintain backward compatibility. Existing saved characters load without errors — missing fields render as empty/default. No migration needed for reading; only new saves include the expanded data.

### 3. Skill and Saving Throw Representation

**Decision**: Store proficiencies as string arrays (e.g., `skillProficiencies: ["athletics", "perception"]`). Compute bonuses at display time using ability scores + proficiency bonus.

**Rationale**: The AI naturally outputs skill names. Storing just proficiency flags keeps the tool schema simple. The UI maps each skill to its governing ability and computes the total. This matches how D&D works: you either are or aren't proficient, and the bonus follows from that.

### 4. Spellcasting Data Model

**Decision**: Use a nested `SpellcastingInfo` object, only populated for caster classes.

```typescript
interface SpellcastingInfo {
  spellcastingAbility: string;  // "intelligence" | "wisdom" | "charisma"
  cantripsKnown?: string[];
  spellsKnown?: string[];       // For known-caster classes (bard, sorcerer, etc.)
  spellsPrepared?: string[];    // For prepared-caster classes (cleric, wizard, etc.)
  spellSlots?: Record<string, number>;  // e.g. { "1": 2 } for 2 first-level slots
}
```

**Rationale**: Keeps spellcasting data grouped and conditional. Non-casters have `spellcasting: undefined`. The AI determines the spellcasting ability from the class and fills slots from the class table.

### 5. AI Wizard Flow Changes

**Decision**: Expand the existing 10-step flow to include new sub-steps, rather than adding many new top-level steps:

1. Experience level and edition (unchanged)
2. Character concept (unchanged)
3. Race → now also sets: speed, languages, racial features, subrace
4. Class → now also sets: hit dice, saving throw proficiencies, armor/weapon proficiencies, class features, subclass prompt
5. Ability scores (unchanged method, but now triggers: AC calculation, initiative, HP computation)
6. Background → now also sets: personality traits, ideals, bonds, flaws, additional skill proficiencies, languages, equipment
7. Skills and proficiencies → now shows computed skill bonuses and lets user swap
8. Starting equipment → now also sets starting currency
9. **NEW sub-step**: Spellcasting (for caster classes only) — cantrips and spells
10. Backstory and appearance (unchanged)
11. Review and finalize → show full computed sheet

**Rationale**: Minimal disruption to the existing conversational flow. The AI handles the new fields as part of existing steps rather than creating a disjointed experience.

### 6. UI Layout for New Sections

**Decision**: Follow the official D&D character sheet layout order:
1. Identity (name, class, level, race, alignment, XP) — top header
2. Ability Scores (left column, 6 boxes with modifiers)
3. Saving Throws (below abilities, 6 rows with proficiency dots)
4. Skills (18 rows with proficiency dots and bonuses)
5. Passive Perception (small field below skills)
6. Combat Stats (AC, Initiative, Speed — horizontal block)
7. HP Block (max, current, temp, hit dice, death saves)
8. Attacks & Spellcasting
9. Personality (traits, ideals, bonds, flaws)
10. Features & Traits
11. Proficiencies & Languages
12. Equipment & Currency
13. Backstory & Appearance
14. Spellcasting (conditional section at bottom)

All sections remain collapsible. New sections default to collapsed except Identity, Ability Scores, and Combat Stats.

### 7. Database Migration Strategy

**Decision**: Add new columns as JSONB with defaults. No data migration needed — existing rows get null/default values.

```sql
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS alignment text DEFAULT '',
  ADD COLUMN IF NOT EXISTS subclass text DEFAULT '',
  ADD COLUMN IF NOT EXISTS subrace text DEFAULT '',
  ADD COLUMN IF NOT EXISTS speed integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS armor_class integer DEFAULT 10,
  ADD COLUMN IF NOT EXISTS saving_throw_proficiencies text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skill_proficiencies text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS personality jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS attacks jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS spellcasting jsonb,
  ADD COLUMN IF NOT EXISTS currency jsonb DEFAULT '{"cp":0,"sp":0,"ep":0,"gp":0,"pp":0}',
  ADD COLUMN IF NOT EXISTS physical_details jsonb DEFAULT '{}';
```

**Rationale**: Additive schema change. No existing data is altered. New fields are nullable or have sensible defaults. JSONB for complex nested structures, native arrays for simple lists.

## Risks / Trade-offs

- **AI output size**: More fields means larger tool call payloads. Mitigated by making all new fields optional — the AI only sends what's relevant to each step.
- **UI complexity**: 14 sections could overwhelm the sidebar. Mitigated by collapsible sections and smart defaults (most start collapsed).
- **Spell data accuracy**: Without a spell database, the AI generates spell names from its training data. Minor inaccuracies possible. Acceptable for a character creator (not a rules engine).
- **Print layout**: Significantly more content to format for print. Will need careful CSS grid work.

## Open Questions

- Should expertise (double proficiency bonus) be tracked for Rogues/Bards? (Recommend: yes, as a separate `expertiseSkills` array)
- Should we support custom/homebrew races and classes? (Recommend: defer, AI already handles free-text input)
