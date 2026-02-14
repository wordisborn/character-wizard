import type { AbilityScores } from "@/types/character";

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function getAbilityModifier(score: number): number {
  if (score <= 0) return 0;
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : String(mod);
}

export function getSavingThrow(
  score: number,
  isProficient: boolean,
  profBonus: number
): number {
  const mod = getAbilityModifier(score);
  return isProficient ? mod + profBonus : mod;
}

export function getSkillBonus(
  abilityScore: number,
  isProficient: boolean,
  profBonus: number
): number {
  const mod = getAbilityModifier(abilityScore);
  return isProficient ? mod + profBonus : mod;
}

export function getPassivePerception(
  wisdomScore: number,
  isProficient: boolean,
  profBonus: number
): number {
  return 10 + getSkillBonus(wisdomScore, isProficient, profBonus);
}

export function getSpellSaveDC(
  abilityScore: number,
  profBonus: number
): number {
  return 8 + profBonus + getAbilityModifier(abilityScore);
}

export function getSpellAttackBonus(
  abilityScore: number,
  profBonus: number
): number {
  return profBonus + getAbilityModifier(abilityScore);
}

export function getHitPointsAtLevel1(
  hitDieMax: number,
  conScore: number
): number {
  return hitDieMax + getAbilityModifier(conScore);
}

const CLASS_HIT_DICE: Record<string, string> = {
  barbarian: "1d12",
  bard: "1d8",
  cleric: "1d8",
  druid: "1d8",
  fighter: "1d10",
  monk: "1d8",
  paladin: "1d10",
  ranger: "1d10",
  rogue: "1d8",
  sorcerer: "1d6",
  warlock: "1d8",
  wizard: "1d6",
};

export function getHitDieForClass(className: string): string {
  return CLASS_HIT_DICE[className.toLowerCase()] || "";
}

export function getHitDieMax(hitDice: string): number {
  const match = hitDice.match(/d(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

const CLASS_SPELLCASTING_ABILITY: Record<string, string> = {
  bard: "charisma",
  cleric: "wisdom",
  druid: "wisdom",
  paladin: "charisma",
  ranger: "wisdom",
  sorcerer: "charisma",
  warlock: "charisma",
  wizard: "intelligence",
};

export function getSpellcastingAbility(className: string): string | null {
  return CLASS_SPELLCASTING_ABILITY[className.toLowerCase()] || null;
}

export type SkillName =
  | "acrobatics"
  | "animal handling"
  | "arcana"
  | "athletics"
  | "deception"
  | "history"
  | "insight"
  | "intimidation"
  | "investigation"
  | "medicine"
  | "nature"
  | "perception"
  | "performance"
  | "persuasion"
  | "religion"
  | "sleight of hand"
  | "stealth"
  | "survival";

export const SKILL_ABILITY_MAP: {
  skill: SkillName;
  ability: keyof AbilityScores;
  label: string;
  abilityAbbr: string;
}[] = [
  { skill: "acrobatics", ability: "dexterity", label: "Acrobatics", abilityAbbr: "DEX" },
  { skill: "animal handling", ability: "wisdom", label: "Animal Handling", abilityAbbr: "WIS" },
  { skill: "arcana", ability: "intelligence", label: "Arcana", abilityAbbr: "INT" },
  { skill: "athletics", ability: "strength", label: "Athletics", abilityAbbr: "STR" },
  { skill: "deception", ability: "charisma", label: "Deception", abilityAbbr: "CHA" },
  { skill: "history", ability: "intelligence", label: "History", abilityAbbr: "INT" },
  { skill: "insight", ability: "wisdom", label: "Insight", abilityAbbr: "WIS" },
  { skill: "intimidation", ability: "charisma", label: "Intimidation", abilityAbbr: "CHA" },
  { skill: "investigation", ability: "intelligence", label: "Investigation", abilityAbbr: "INT" },
  { skill: "medicine", ability: "wisdom", label: "Medicine", abilityAbbr: "WIS" },
  { skill: "nature", ability: "intelligence", label: "Nature", abilityAbbr: "INT" },
  { skill: "perception", ability: "wisdom", label: "Perception", abilityAbbr: "WIS" },
  { skill: "performance", ability: "charisma", label: "Performance", abilityAbbr: "CHA" },
  { skill: "persuasion", ability: "charisma", label: "Persuasion", abilityAbbr: "CHA" },
  { skill: "religion", ability: "intelligence", label: "Religion", abilityAbbr: "INT" },
  { skill: "sleight of hand", ability: "dexterity", label: "Sleight of Hand", abilityAbbr: "DEX" },
  { skill: "stealth", ability: "dexterity", label: "Stealth", abilityAbbr: "DEX" },
  { skill: "survival", ability: "wisdom", label: "Survival", abilityAbbr: "WIS" },
];

export const ABILITY_NAMES: { key: keyof AbilityScores; label: string; abbr: string }[] = [
  { key: "strength", label: "Strength", abbr: "STR" },
  { key: "dexterity", label: "Dexterity", abbr: "DEX" },
  { key: "constitution", label: "Constitution", abbr: "CON" },
  { key: "intelligence", label: "Intelligence", abbr: "INT" },
  { key: "wisdom", label: "Wisdom", abbr: "WIS" },
  { key: "charisma", label: "Charisma", abbr: "CHA" },
];
