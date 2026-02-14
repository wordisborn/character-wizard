"use client";

import { useState, useEffect, useRef } from "react";
import type { Character } from "@/types/character";
import {
  getProficiencyBonus,
  getAbilityModifier,
  formatModifier,
  getSavingThrow,
  getSkillBonus,
  getPassivePerception,
  getSpellSaveDC,
  getSpellAttackBonus,
  SKILL_ABILITY_MAP,
  ABILITY_NAMES,
} from "@/lib/character-utils";

interface CharacterSheetProps {
  character: Character;
  onSave: () => void;
  onPrint: () => void;
  saving?: boolean;
  allOpen?: boolean;
  onClose?: () => void;
}

export function CharacterSheet({
  character,
  onSave,
  onPrint,
  saving,
  allOpen,
  onClose,
}: CharacterSheetProps) {
  const profBonus = getProficiencyBonus(character.level);
  const hasScores = character.abilityScores.strength > 0;

  return (
    <div className="flex flex-col h-full bg-[#E8DCC8]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-[#B8A88A] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#8B6914] text-lg">⚔</span>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[20px] font-bold text-[#2C1810]">
            Character Sheet
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2C1810] font-[family-name:var(--font-barlow)] text-[12px] font-semibold text-[#F2E8D5]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Close
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Identity */}
        <Section title="Identity" defaultOpen forceOpen={allOpen}>
          <Field label="Name" value={character.name} />
          <Field label="Race" value={character.race} />
          {character.subrace && <Field label="Subrace" value={character.subrace} />}
          <Field label="Class" value={character.class} />
          {character.subclass && <Field label="Subclass" value={character.subclass} />}
          <Field label="Level" value={character.level > 0 ? String(character.level) : ""} />
          {character.alignment && <Field label="Alignment" value={character.alignment} />}
          <Field label="Edition" value={character.edition} />
          {hasScores && (
            <Field label="Proficiency" value={formatModifier(profBonus)} />
          )}
        </Section>

        {/* Ability Scores */}
        <Section title="Ability Scores" defaultOpen forceOpen={allOpen}>
          <AbilityScoreGrid scores={character.abilityScores} />
        </Section>

        {/* Saving Throws */}
        {hasScores && (
          <Section title="Saving Throws" forceOpen={allOpen}>
            <div className="space-y-1">
              {ABILITY_NAMES.map((a) => {
                const isProficient = character.savingThrowProficiencies.includes(a.key);
                const total = getSavingThrow(
                  character.abilityScores[a.key],
                  isProficient,
                  profBonus
                );
                return (
                  <div key={a.key} className="flex items-center gap-2 py-0.5">
                    <ProficiencyDot filled={isProficient} />
                    <span className="font-[family-name:var(--font-barlow)] text-[11px] font-semibold text-[#8B6914] w-5">
                      {formatModifier(total)}
                    </span>
                    <span className="font-[family-name:var(--font-barlow)] text-[12px] text-[#2C1810]">
                      {a.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Skills */}
        {hasScores && (
          <Section title="Skills" forceOpen={allOpen}>
            <div className="space-y-0.5">
              {SKILL_ABILITY_MAP.map((s) => {
                const isProficient = character.skillProficiencies
                  .map((sk) => sk.toLowerCase())
                  .includes(s.skill);
                const bonus = getSkillBonus(
                  character.abilityScores[s.ability],
                  isProficient,
                  profBonus
                );
                return (
                  <div key={s.skill} className="flex items-center gap-2 py-0.5">
                    <ProficiencyDot filled={isProficient} />
                    <span className="font-[family-name:var(--font-barlow)] text-[11px] font-semibold text-[#8B6914] w-5">
                      {formatModifier(bonus)}
                    </span>
                    <span className="font-[family-name:var(--font-barlow)] text-[12px] text-[#2C1810]">
                      {s.label}
                    </span>
                    <span className="font-[family-name:var(--font-barlow)] text-[10px] text-[#8B7355]">
                      ({s.abilityAbbr})
                    </span>
                  </div>
                );
              })}
            </div>
            {hasScores && (
              <div className="mt-2 pt-2 border-t border-[#C4B89A]">
                <Field
                  label="Passive Perception"
                  value={String(
                    getPassivePerception(
                      character.abilityScores.wisdom,
                      character.skillProficiencies
                        .map((s) => s.toLowerCase())
                        .includes("perception"),
                      profBonus
                    )
                  )}
                />
              </div>
            )}
          </Section>
        )}

        {/* Combat Stats */}
        <Section title="Combat" defaultOpen forceOpen={allOpen}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatBox label="AC" value={character.armorClass > 0 ? String(character.armorClass) : (hasScores ? String(10 + getAbilityModifier(character.abilityScores.dexterity)) : "—")} />
            <StatBox label="Initiative" value={hasScores ? formatModifier(getAbilityModifier(character.abilityScores.dexterity)) : "—"} />
            <StatBox label="Speed" value={character.speed > 0 ? `${character.speed}ft` : "—"} />
          </div>
          <Field label="Hit Points" value={character.hitPoints > 0 ? String(character.hitPoints) : ""} />
          {character.hitDice && <Field label="Hit Dice" value={character.hitDice} />}
          {(character.deathSaves.successes > 0 || character.deathSaves.failures > 0) && (
            <div className="mt-2">
              <DeathSaveTracker saves={character.deathSaves} />
            </div>
          )}
        </Section>

        {/* Attacks & Spellcasting */}
        {character.attacks.length > 0 && (
          <Section title="Attacks" forceOpen={allOpen}>
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 text-[10px] font-[family-name:var(--font-barlow)] uppercase tracking-wider text-[#8B7355] font-medium">
                <span>Name</span>
                <span>Bonus</span>
                <span>Damage</span>
              </div>
              {character.attacks.map((atk, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-2 text-[12px] font-[family-name:var(--font-barlow)] text-[#2C1810]">
                  <span>{atk.name}</span>
                  <span className="text-[#8B6914] font-semibold">{atk.bonus}</span>
                  <span>{atk.damage}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Spellcasting */}
        {character.spellcasting && (
          <Section title="Spellcasting" forceOpen={allOpen}>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <StatBox
                label="Ability"
                value={character.spellcasting.spellcastingAbility
                  ? character.spellcasting.spellcastingAbility.slice(0, 3).toUpperCase()
                  : "—"}
              />
              <StatBox
                label="Save DC"
                value={hasScores && character.spellcasting.spellcastingAbility
                  ? String(getSpellSaveDC(
                      character.abilityScores[character.spellcasting.spellcastingAbility as keyof typeof character.abilityScores] || 0,
                      profBonus
                    ))
                  : "—"}
              />
              <StatBox
                label="Attack"
                value={hasScores && character.spellcasting.spellcastingAbility
                  ? formatModifier(getSpellAttackBonus(
                      character.abilityScores[character.spellcasting.spellcastingAbility as keyof typeof character.abilityScores] || 0,
                      profBonus
                    ))
                  : "—"}
              />
            </div>
            {character.spellcasting.spellSlots && Object.keys(character.spellcasting.spellSlots).length > 0 && (
              <div className="mb-2">
                <span className="font-[family-name:var(--font-barlow)] text-[10px] font-medium uppercase tracking-wider text-[#8B7355]">
                  Spell Slots
                </span>
                <div className="flex gap-3 mt-1">
                  {Object.entries(character.spellcasting.spellSlots).map(([level, count]) => (
                    <div key={level} className="text-center">
                      <div className="font-[family-name:var(--font-barlow)] text-[10px] text-[#8B7355]">Lv {level}</div>
                      <div className="font-[family-name:var(--font-cormorant)] text-[16px] font-bold text-[#2C1810]">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {character.spellcasting.cantripsKnown && character.spellcasting.cantripsKnown.length > 0 && (
              <div className="mb-2">
                <span className="font-[family-name:var(--font-barlow)] text-[10px] font-medium uppercase tracking-wider text-[#8B7355]">
                  Cantrips
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {character.spellcasting.cantripsKnown.map((spell, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#EDE3D1] border border-[#C4B89A] font-[family-name:var(--font-barlow)] text-[11px] text-[#2C1810]">
                      {spell}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {character.spellcasting.spellsKnown && character.spellcasting.spellsKnown.length > 0 && (
              <div>
                <span className="font-[family-name:var(--font-barlow)] text-[10px] font-medium uppercase tracking-wider text-[#8B7355]">
                  Spells
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {character.spellcasting.spellsKnown.map((spell, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#EDE3D1] border border-[#C4B89A] font-[family-name:var(--font-barlow)] text-[11px] text-[#2C1810]">
                      {spell}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* Personality */}
        {(character.personalityTraits || character.ideals || character.bonds || character.flaws) && (
          <Section title="Personality" forceOpen={allOpen}>
            {character.personalityTraits && <TextBlock label="Traits" value={character.personalityTraits} />}
            {character.ideals && <TextBlock label="Ideals" value={character.ideals} />}
            {character.bonds && <TextBlock label="Bonds" value={character.bonds} />}
            {character.flaws && <TextBlock label="Flaws" value={character.flaws} />}
          </Section>
        )}

        {/* Features & Traits */}
        {character.features.length > 0 && (
          <Section title="Features & Traits" forceOpen={allOpen}>
            <TagList items={character.features} />
          </Section>
        )}

        {/* Proficiencies & Languages */}
        <Section title="Proficiencies & Languages" forceOpen={allOpen}>
          {character.proficiencies.length > 0 && (
            <div className="mb-2">
              <span className="font-[family-name:var(--font-barlow)] text-[10px] font-medium uppercase tracking-wider text-[#8B7355]">
                Proficiencies
              </span>
              <div className="mt-1">
                <TagList items={character.proficiencies} />
              </div>
            </div>
          )}
          {character.languages.length > 0 && (
            <div>
              <span className="font-[family-name:var(--font-barlow)] text-[10px] font-medium uppercase tracking-wider text-[#8B7355]">
                Languages
              </span>
              <div className="mt-1">
                <TagList items={character.languages} />
              </div>
            </div>
          )}
          {character.proficiencies.length === 0 && character.languages.length === 0 && (
            <span className="font-[family-name:var(--font-source-serif)] text-[13px] text-[#8B7355] italic">
              None yet
            </span>
          )}
        </Section>

        {/* Equipment & Currency */}
        <Section title="Equipment" forceOpen={allOpen}>
          <TagList items={character.equipment} />
          {(character.currency.gp > 0 || character.currency.sp > 0 || character.currency.cp > 0 || character.currency.ep > 0 || character.currency.pp > 0) && (
            <div className="mt-2 pt-2 border-t border-[#C4B89A]">
              <span className="font-[family-name:var(--font-barlow)] text-[10px] font-medium uppercase tracking-wider text-[#8B7355]">
                Currency
              </span>
              <div className="flex gap-3 mt-1">
                {(
                  [
                    ["CP", character.currency.cp],
                    ["SP", character.currency.sp],
                    ["EP", character.currency.ep],
                    ["GP", character.currency.gp],
                    ["PP", character.currency.pp],
                  ] as const
                )
                  .filter(([, v]) => v > 0)
                  .map(([label, value]) => (
                    <div key={label} className="text-center">
                      <div className="font-[family-name:var(--font-barlow)] text-[10px] text-[#8B7355]">{label}</div>
                      <div className="font-[family-name:var(--font-cormorant)] text-[16px] font-bold text-[#2C1810]">{value}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Section>

        {/* Background & Story */}
        <Section title="Background & Story" forceOpen={allOpen}>
          <Field label="Background" value={character.background} />
          {character.backstory && <TextBlock label="Backstory" value={character.backstory} />}
          {character.appearance && <TextBlock label="Appearance" value={character.appearance} />}
        </Section>

        {/* Physical Details */}
        {(character.age || character.height || character.weight || character.eyes || character.skin || character.hair) && (
          <Section title="Physical Details" forceOpen={allOpen}>
            {character.age && <Field label="Age" value={character.age} />}
            {character.height && <Field label="Height" value={character.height} />}
            {character.weight && <Field label="Weight" value={character.weight} />}
            {character.eyes && <Field label="Eyes" value={character.eyes} />}
            {character.skin && <Field label="Skin" value={character.skin} />}
            {character.hair && <Field label="Hair" value={character.hair} />}
          </Section>
        )}
      </div>

      {/* Footer with Save/Print */}
      <div className="flex items-center gap-3 px-6 h-14 border-t border-[#B8A88A] shrink-0">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 h-9 bg-[#8B6914] font-[family-name:var(--font-barlow)] text-[13px] font-semibold text-[#F2E8D5] hover:bg-[#7A5B10] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Character"}
        </button>
        <button
          onClick={onPrint}
          className="flex-1 h-9 border border-[#8B6914] font-[family-name:var(--font-barlow)] text-[13px] font-semibold text-[#8B6914] hover:bg-[#8B691410] transition-colors"
        >
          Print Sheet
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  defaultOpen = false,
  forceOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = forceOpen || open;

  return (
    <div className="border border-[#C4B89A] bg-[#F5EDE0]">
      <button
        onClick={() => !forceOpen && setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-left"
      >
        <span className="font-[family-name:var(--font-cormorant)] text-[15px] font-bold text-[#2C1810]">
          {title}
        </span>
        {!forceOpen && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={`text-[#8B7355] transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            <path
              d="M2 4l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      {isOpen && <div className="px-4 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const [highlighted, setHighlighted] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value && value !== prevValue.current) {
      setHighlighted(true);
      const timer = setTimeout(() => setHighlighted(false), 1500);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div
      className={`flex items-baseline gap-2 py-0.5 px-1 -mx-1 rounded-sm ${highlighted ? "highlight-update" : ""}`}
    >
      <span className="font-[family-name:var(--font-barlow)] text-[11px] font-medium uppercase tracking-wider text-[#8B7355] shrink-0">
        {label}
      </span>
      <span className="font-[family-name:var(--font-source-serif)] text-[14px] text-[#2C1810]">
        {value || "—"}
      </span>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2">
      <span className="font-[family-name:var(--font-barlow)] text-[11px] font-medium uppercase tracking-wider text-[#8B7355]">
        {label}
      </span>
      <p className="mt-1 font-[family-name:var(--font-source-serif)] text-[13px] leading-relaxed text-[#2C1810]">
        {value}
      </p>
    </div>
  );
}

function AbilityScoreGrid({
  scores,
}: {
  scores: Character["abilityScores"];
}) {
  const abilities = [
    { key: "strength", label: "STR", value: scores.strength },
    { key: "dexterity", label: "DEX", value: scores.dexterity },
    { key: "constitution", label: "CON", value: scores.constitution },
    { key: "intelligence", label: "INT", value: scores.intelligence },
    { key: "wisdom", label: "WIS", value: scores.wisdom },
    { key: "charisma", label: "CHA", value: scores.charisma },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {abilities.map((a) => (
        <AbilityBox key={a.key} label={a.label} value={a.value} />
      ))}
    </div>
  );
}

function AbilityBox({ label, value }: { label: string; value: number }) {
  const [highlighted, setHighlighted] = useState(false);
  const prevValue = useRef(value);
  const modifier = value > 0 ? Math.floor((value - 10) / 2) : 0;
  const modStr = modifier >= 0 ? `+${modifier}` : String(modifier);

  useEffect(() => {
    if (value > 0 && value !== prevValue.current) {
      setHighlighted(true);
      const timer = setTimeout(() => setHighlighted(false), 1500);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div
      className={`flex flex-col items-center py-2 border border-[#C4B89A] bg-[#EDE3D1] rounded-sm ${highlighted ? "highlight-update" : ""}`}
    >
      <span className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-wider text-[#8B7355]">
        {label}
      </span>
      <span className="font-[family-name:var(--font-cormorant)] text-[22px] font-bold text-[#2C1810]">
        {value > 0 ? value : "—"}
      </span>
      {value > 0 && (
        <span className="font-[family-name:var(--font-barlow)] text-[11px] text-[#8B6914]">
          {modStr}
        </span>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center py-2 border border-[#C4B89A] bg-[#EDE3D1] rounded-sm">
      <span className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-wider text-[#8B7355]">
        {label}
      </span>
      <span className="font-[family-name:var(--font-cormorant)] text-[20px] font-bold text-[#2C1810]">
        {value}
      </span>
    </div>
  );
}

function ProficiencyDot({ filled }: { filled: boolean }) {
  return (
    <div
      className={`w-2.5 h-2.5 rounded-full border shrink-0 ${
        filled
          ? "bg-[#8B6914] border-[#8B6914]"
          : "bg-transparent border-[#C4B89A]"
      }`}
    />
  );
}

function DeathSaveTracker({ saves }: { saves: Character["deathSaves"] }) {
  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-1.5">
        <span className="font-[family-name:var(--font-barlow)] text-[10px] font-medium uppercase tracking-wider text-[#8B7355]">
          Saves
        </span>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border ${
              i < saves.successes ? "bg-[#4a7c59] border-[#4a7c59]" : "border-[#C4B89A]"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-[family-name:var(--font-barlow)] text-[10px] font-medium uppercase tracking-wider text-[#8B7355]">
          Fails
        </span>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border ${
              i < saves.failures ? "bg-[#8b3a3a] border-[#8b3a3a]" : "border-[#C4B89A]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return (
      <span className="font-[family-name:var(--font-source-serif)] text-[13px] text-[#8B7355] italic">
        None yet
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className="px-2.5 py-1 bg-[#EDE3D1] border border-[#C4B89A] font-[family-name:var(--font-barlow)] text-[12px] text-[#2C1810]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
