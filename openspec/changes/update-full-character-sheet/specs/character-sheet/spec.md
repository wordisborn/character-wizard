## MODIFIED Requirements

### Requirement: Character Data Model
The app SHALL maintain a structured character data model that represents a complete D&D 5e character with all fields found on the official character sheet.

#### Scenario: Core character fields
- **WHEN** a character is being created
- **THEN** the data model tracks: name, race, class, level, subclass, subrace, alignment, experience points, ability scores (STR, DEX, CON, INT, WIS, CHA), hit points (max, current, temporary), hit dice, death saves, armor class, initiative, speed, saving throw proficiencies, skill proficiencies, proficiencies (armor/weapon/tool), languages, equipment list, currency (CP/SP/EP/GP/PP), background, personality traits, ideals, bonds, flaws, features and traits, attacks, backstory, appearance, physical details (age, height, weight, eyes, skin, hair), and spellcasting data (for caster classes)

#### Scenario: Backward compatibility with existing characters
- **WHEN** a previously saved character is loaded that lacks the new fields
- **THEN** all new fields default to empty/zero values without errors
- **AND** the character sheet renders correctly showing existing data

### Requirement: Character Sheet Sections
The character sheet SHALL be organized into collapsible sections covering all aspects of a D&D 5e character, matching the official character sheet layout.

#### Scenario: Section structure
- **WHEN** the character sheet is displayed
- **THEN** it includes sections for: Identity (name, class, level, race, alignment, XP, subclass, subrace), Ability Scores (6 scores with modifiers), Saving Throws (6 saves with proficiency indicators), Skills (18 skills with proficiency indicators and bonuses), Combat Stats (AC, Initiative, Speed), Hit Points (max, current, temp, hit dice, death saves), Attacks and Spellcasting, Personality (traits, ideals, bonds, flaws), Features and Traits, Proficiencies and Languages, Equipment and Currency, Background and Story, Physical Details, and Spellcasting (conditional, caster classes only)

#### Scenario: Section collapse/expand
- **WHEN** the user clicks a section header
- **THEN** that section toggles between collapsed and expanded states
- **AND** the section retains its state during the session

## ADDED Requirements

### Requirement: Computed Character Values
The app SHALL automatically compute derived character values from base stats using D&D 5e rules, without requiring manual calculation.

#### Scenario: Proficiency bonus computation
- **WHEN** a character has a level set
- **THEN** the proficiency bonus is computed as ceil(level / 4) + 1
- **AND** it is displayed on the character sheet

#### Scenario: Ability modifier computation
- **WHEN** a character has ability scores set
- **THEN** each ability modifier is computed as floor((score - 10) / 2)
- **AND** modifiers are displayed alongside their ability scores

#### Scenario: Saving throw computation
- **WHEN** a character has ability scores and saving throw proficiencies set
- **THEN** each saving throw total equals the ability modifier plus proficiency bonus (if proficient)
- **AND** proficient saves are visually marked

#### Scenario: Skill bonus computation
- **WHEN** a character has ability scores and skill proficiencies set
- **THEN** each skill bonus equals the governing ability modifier plus proficiency bonus (if proficient)
- **AND** proficient skills are visually marked
- **AND** skills are grouped or labeled by their governing ability

#### Scenario: Passive Perception computation
- **WHEN** a character has a Wisdom score
- **THEN** Passive Perception equals 10 plus the Perception skill bonus

#### Scenario: Spell Save DC and Attack Bonus computation
- **WHEN** a character is a spellcasting class with a spellcasting ability set
- **THEN** Spell Save DC equals 8 + proficiency bonus + spellcasting ability modifier
- **AND** Spell Attack Bonus equals proficiency bonus + spellcasting ability modifier

### Requirement: Saving Throws Display
The character sheet SHALL display all six saving throws with proficiency indicators and computed values.

#### Scenario: Saving throws rendering
- **WHEN** the Saving Throws section is viewed
- **THEN** it shows all six ability-based saving throws (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma)
- **AND** each shows a proficiency indicator (filled/unfilled dot)
- **AND** each shows the computed saving throw bonus

### Requirement: Skills Display
The character sheet SHALL display all 18 D&D 5e skills with their governing ability, proficiency status, and computed bonus.

#### Scenario: Skills rendering
- **WHEN** the Skills section is viewed
- **THEN** it lists all 18 skills: Acrobatics (DEX), Animal Handling (WIS), Arcana (INT), Athletics (STR), Deception (CHA), History (INT), Insight (WIS), Intimidation (CHA), Investigation (INT), Medicine (WIS), Nature (INT), Perception (WIS), Performance (CHA), Persuasion (CHA), Religion (INT), Sleight of Hand (DEX), Stealth (DEX), Survival (WIS)
- **AND** each skill shows a proficiency indicator, the governing ability abbreviation, and the computed bonus

### Requirement: Combat Statistics Block
The character sheet SHALL display AC, Initiative, and Speed as prominent combat statistics.

#### Scenario: Combat stats rendering
- **WHEN** the Combat section is viewed
- **THEN** Armor Class, Initiative modifier, and Speed are displayed as prominent values
- **AND** hit dice type and total are shown
- **AND** death saves are tracked with success/failure indicators

### Requirement: Personality Section
The character sheet SHALL display personality traits, ideals, bonds, and flaws from the character's background.

#### Scenario: Personality fields rendering
- **WHEN** the Personality section is viewed
- **THEN** it displays personality traits, ideals, bonds, and flaws as separate labeled fields

### Requirement: Spellcasting Section
The character sheet SHALL conditionally display a spellcasting section for characters with spellcasting abilities.

#### Scenario: Spellcasting section for caster class
- **WHEN** the character's class has spellcasting ability
- **THEN** a Spellcasting section appears showing: spellcasting ability, spell save DC, spell attack bonus, available spell slots by level, and lists of known cantrips and spells

#### Scenario: No spellcasting for non-caster class
- **WHEN** the character's class has no spellcasting ability (e.g., Fighter, Barbarian, Rogue, Monk)
- **THEN** the Spellcasting section is not displayed

### Requirement: Currency Tracking
The character sheet SHALL display currency in the five D&D denominations.

#### Scenario: Currency display
- **WHEN** the Equipment section is viewed
- **THEN** currency is shown in CP, SP, EP, GP, and PP denominations

### Requirement: Attacks and Weapons Display
The character sheet SHALL display a structured list of attacks with name, attack bonus, and damage.

#### Scenario: Attack entries rendering
- **WHEN** the Attacks section is viewed
- **THEN** each attack entry shows the weapon/spell name, attack bonus, and damage/type

### Requirement: AI Wizard Computes Derived Fields
The AI wizard SHALL automatically compute and assign derived character fields when base choices are made, following D&D 5e rules.

#### Scenario: Class selection triggers derived fields
- **WHEN** the user selects a class
- **THEN** the AI assigns saving throw proficiencies, hit dice type, and armor/weapon proficiencies for that class
- **AND** if the class has spellcasting, the AI sets the spellcasting ability

#### Scenario: Race selection triggers derived fields
- **WHEN** the user selects a race
- **THEN** the AI assigns speed, racial languages, and racial features

#### Scenario: Background selection triggers personality
- **WHEN** the user selects a background
- **THEN** the AI suggests personality traits, ideals, bonds, and flaws appropriate to that background
- **AND** assigns additional skill proficiencies and languages from the background

#### Scenario: Ability scores trigger combat computations
- **WHEN** ability scores are assigned
- **THEN** the AI computes and sets hit points (hit die max + CON modifier at level 1)
- **AND** the character sheet displays computed AC (10 + DEX mod as base), initiative (DEX mod), and passive perception

#### Scenario: Spell selection for caster classes
- **WHEN** the user's class is a spellcasting class
- **THEN** the AI guides cantrip and spell selection appropriate to the class and level
- **AND** assigns spell slot counts based on the class spell slot table
