export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
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
};

export type CharacterUpdate = Partial<Character>;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  characterUpdates?: CharacterUpdate;
}
