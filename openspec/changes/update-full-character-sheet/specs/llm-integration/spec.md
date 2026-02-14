## MODIFIED Requirements

### Requirement: Character Update Tool
The `update_character` tool SHALL accept all fields of the expanded D&D 5e character data model, allowing the AI to update any character attribute in a single tool call.

#### Scenario: Expanded tool schema
- **WHEN** the AI calls the `update_character` tool
- **THEN** it can include any combination of: name, race, class, level, subclass, subrace, alignment, experiencePoints, abilityScores, hitPoints, armorClass, initiative, speed, hitDice, savingThrowProficiencies, skillProficiencies, proficiencies, languages, equipment, currency, background, personalityTraits, ideals, bonds, flaws, features, attacks, spellcasting, backstory, appearance, age, height, weight, eyes, skin, hair
- **AND** all fields are optional (partial updates supported)
- **AND** the character sheet updates in real time for each field provided

#### Scenario: Class selection auto-populates derived fields
- **WHEN** the AI processes a class selection
- **THEN** the tool call includes savingThrowProficiencies, hitDice, and class-specific proficiencies in a single update
- **AND** if the class is a spellcasting class, the spellcasting ability is set

#### Scenario: Race selection auto-populates derived fields
- **WHEN** the AI processes a race selection
- **THEN** the tool call includes speed, languages, and racial features in a single update

## ADDED Requirements

### Requirement: Spellcasting Guidance
The AI wizard SHALL guide spellcasting class characters through spell selection as part of the character creation flow.

#### Scenario: Cantrip and spell selection
- **WHEN** the character's class is a spellcasting class (Bard, Cleric, Druid, Sorcerer, Warlock, Wizard)
- **THEN** the AI presents cantrip choices appropriate to the class
- **AND** presents level 1 spell choices appropriate to the class
- **AND** updates the spellcasting field with selected spells via the update_character tool

### Requirement: Background Personality Suggestions
The AI wizard SHALL suggest personality traits, ideals, bonds, and flaws from the chosen background's tables.

#### Scenario: Background personality assignment
- **WHEN** the user selects a background
- **THEN** the AI suggests 1-2 personality traits, an ideal, a bond, and a flaw thematically appropriate to the background
- **AND** the user can accept, modify, or replace the suggestions
- **AND** the AI updates the personality fields via the update_character tool
