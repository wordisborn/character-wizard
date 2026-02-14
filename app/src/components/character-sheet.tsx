"use client";

import { useState, useEffect, useRef } from "react";
import type { Character } from "@/types/character";

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
          <Field label="Class" value={character.class} />
          <Field label="Level" value={character.level > 0 ? String(character.level) : ""} />
          <Field label="Edition" value={character.edition} />
        </Section>

        {/* Ability Scores */}
        <Section title="Ability Scores" defaultOpen forceOpen={allOpen}>
          <AbilityScoreGrid scores={character.abilityScores} />
        </Section>

        {/* Combat */}
        <Section title="Combat" forceOpen={allOpen}>
          <Field label="Hit Points" value={character.hitPoints > 0 ? String(character.hitPoints) : ""} />
        </Section>

        {/* Proficiencies */}
        <Section title="Proficiencies" forceOpen={allOpen}>
          <TagList items={character.proficiencies} />
        </Section>

        {/* Equipment */}
        <Section title="Equipment" forceOpen={allOpen}>
          <TagList items={character.equipment} />
        </Section>

        {/* Background & Story */}
        <Section title="Background & Story" forceOpen={allOpen}>
          <Field label="Background" value={character.background} />
          {character.backstory && (
            <div className="mt-2">
              <span className="font-[family-name:var(--font-barlow)] text-[11px] font-medium uppercase tracking-wider text-[#8B7355]">
                Backstory
              </span>
              <p className="mt-1 font-[family-name:var(--font-source-serif)] text-[13px] leading-relaxed text-[#2C1810]">
                {character.backstory}
              </p>
            </div>
          )}
          {character.appearance && (
            <div className="mt-2">
              <span className="font-[family-name:var(--font-barlow)] text-[11px] font-medium uppercase tracking-wider text-[#8B7355]">
                Appearance
              </span>
              <p className="mt-1 font-[family-name:var(--font-source-serif)] text-[13px] leading-relaxed text-[#2C1810]">
                {character.appearance}
              </p>
            </div>
          )}
        </Section>
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
