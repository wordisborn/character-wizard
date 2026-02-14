export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface Attack {
  name: string;
  bonus: string;
  damage: string;
}

export interface SpellcastingInfo {
  spellcastingAbility: string;
  cantripsKnown: string[];
  spellsKnown: string[];
  spellSlots: Record<string, number>;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface Character {
  name: string;
  race: string;
  class: string;
  level: number;
  abilityScores: AbilityScores;
  hitPoints: number;
  proficiencies: string[];
  equipment: string[];
  background: string;
  backstory: string;
  appearance: string;
  edition: string;
  portraitUrl: string;

  // Extended identity
  alignment: string;
  experiencePoints: number;
  subclass: string;
  subrace: string;

  // Physical details
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;

  // Combat
  armorClass: number;
  speed: number;
  hitDice: string;
  currentHitPoints: number;
  temporaryHitPoints: number;
  deathSaves: DeathSaves;

  // Proficiency details
  savingThrowProficiencies: string[];
  skillProficiencies: string[];
  languages: string[];

  // Personality
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;

  // Features & attacks
  features: string[];
  attacks: Attack[];

  // Spellcasting
  spellcasting: SpellcastingInfo | null;

  // Currency
  currency: Currency;
}

export const DEFAULT_CHARACTER: Character = {
  name: "",
  race: "",
  class: "",
  level: 1,
  abilityScores: {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  },
  hitPoints: 0,
  proficiencies: [],
  equipment: [],
  background: "",
  backstory: "",
  appearance: "",
  edition: "5e",
  portraitUrl: "",

  alignment: "",
  experiencePoints: 0,
  subclass: "",
  subrace: "",

  age: "",
  height: "",
  weight: "",
  eyes: "",
  skin: "",
  hair: "",

  armorClass: 0,
  speed: 0,
  hitDice: "",
  currentHitPoints: 0,
  temporaryHitPoints: 0,
  deathSaves: { successes: 0, failures: 0 },

  savingThrowProficiencies: [],
  skillProficiencies: [],
  languages: [],

  personalityTraits: "",
  ideals: "",
  bonds: "",
  flaws: "",

  features: [],
  attacks: [],

  spellcasting: null,

  currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
};

export type CharacterUpdate = Partial<Character>;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  characterUpdates?: CharacterUpdate;
}
