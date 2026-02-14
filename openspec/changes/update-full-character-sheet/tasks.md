## 1. Data Model & Type Expansion

- [ ] 1.1 Add new sub-interfaces to `app/src/types/character.ts`: `Attack`, `SpellcastingInfo`, `Currency`, `DeathSaves`
- [ ] 1.2 Extend `Character` interface with all new optional fields (alignment, subclass, subrace, combat stats, personality, spellcasting, currency, physical details, saving throw proficiencies, skill proficiencies, languages, features, attacks)
- [ ] 1.3 Update `DEFAULT_CHARACTER` with sensible defaults for new fields
- [ ] 1.4 Create `app/src/lib/character-utils.ts` with pure computation functions:
  - `getProficiencyBonus(level: number): number`
  - `getAbilityModifier(score: number): number`
  - `getSavingThrow(score: number, isProficient: boolean, profBonus: number): number`
  - `getSkillBonus(abilityScore: number, isProficient: boolean, hasExpertise: boolean, profBonus: number): number`
  - `getPassivePerception(wisdomScore: number, isProficient: boolean, profBonus: number): number`
  - `getSpellSaveDC(abilityScore: number, profBonus: number): number`
  - `getSpellAttackBonus(abilityScore: number, profBonus: number): number`
  - `getHitPointsAtLevel1(hitDieMax: number, conScore: number): number`
  - `getHitDieForClass(className: string): string`
  - `getSpellcastingAbility(className: string): string | null`
  - `SKILL_ABILITY_MAP` constant mapping each of 18 skills to its governing ability

## 2. AI Integration Updates

- [ ] 2.1 Expand `UPDATE_CHARACTER_TOOL` input schema in `app/src/lib/system-prompt.ts` to accept all new fields (savingThrowProficiencies, skillProficiencies, languages, alignment, subclass, subrace, speed, armorClass, hitDice, personalityTraits, ideals, bonds, flaws, features, attacks, spellcasting, currency, physical details)
- [ ] 2.2 Update system prompt guidance to instruct the AI to:
  - Auto-assign saving throw proficiencies when class is chosen
  - Auto-assign hit dice type and compute HP when class + ability scores are set
  - Auto-assign speed and languages when race is chosen
  - Offer personality traits/ideals/bonds/flaws when background is chosen
  - Guide spell selection for caster classes (cantrips + level 1 spells)
  - Assign starting currency from background/class
  - Compute AC from equipment choices
- [ ] 2.3 Update `app/src/app/api/chat/route.ts` to handle new fields in tool call responses

## 3. Character Sheet UI Expansion

- [ ] 3.1 Add **Saving Throws** section to `character-sheet.tsx` — 6 rows showing ability name, proficiency dot, and computed total
- [ ] 3.2 Add **Skills** section — 18 rows showing skill name, governing ability abbreviation, proficiency dot, and computed bonus
- [ ] 3.3 Add **Passive Perception** field below skills section
- [ ] 3.4 Add **Combat Stats** horizontal block — AC, Initiative, Speed displayed as three prominent boxes
- [ ] 3.5 Expand **HP block** to include current HP, temporary HP, hit dice display, and death save tracker (3 success / 3 failure circles)
- [ ] 3.6 Add **Personality** section with traits, ideals, bonds, flaws
- [ ] 3.7 Add **Features & Traits** section as a list of racial/class features
- [ ] 3.8 Add **Attacks & Spellcasting** section showing attack entries (name, bonus, damage)
- [ ] 3.9 Add **Spellcasting** conditional section (only for caster classes) showing spell save DC, spell attack bonus, spell slots, and spell list
- [ ] 3.10 Add **Currency** display (CP/SP/EP/GP/PP) inside equipment section
- [ ] 3.11 Add **Languages** display inside proficiencies section
- [ ] 3.12 Expand **Identity** section with alignment, XP, subclass, subrace fields
- [ ] 3.13 Add **Physical Details** section with age, height, weight, eyes, skin, hair

## 4. Character Context & State

- [ ] 4.1 Update `app/src/lib/character-context.tsx` reducer to handle all new character fields in UPDATE_CHARACTER action
- [ ] 4.2 Ensure `CharacterUpdate` type (Partial<Character>) automatically covers new fields

## 5. Print Sheet

- [ ] 5.1 Update `app/src/components/print-sheet.tsx` to render all new sections in a print-friendly format matching the official D&D character sheet layout

## 6. Database Schema

- [ ] 6.1 Create Supabase migration adding new columns for expanded character data
- [ ] 6.2 Update `app/src/app/api/characters/route.ts` to read/write all new fields

## 7. Backward Compatibility

- [ ] 7.1 Ensure existing saved characters load without errors (all new fields optional with defaults)
- [ ] 7.2 Test that the AI wizard flow works end-to-end with expanded fields

## 8. Verification

- [ ] 8.1 Run `npm run build` to verify no type errors
- [ ] 8.2 Manual test: create a Fighter character (non-caster) — verify all fields populate
- [ ] 8.3 Manual test: create a Wizard character (caster) — verify spellcasting section appears
- [ ] 8.4 Manual test: load an existing saved character — verify backward compatibility
