"use client";

import { useState, useEffect } from "react";
import type { Character, ChatMessage } from "@/types/character";
import { DEFAULT_CHARACTER } from "@/types/character";

// Portrait matching (same logic as character-preview)
const PORTRAITS = [
  { race: "halfling", class: "rogue", image: "/characters/halfling-rogue.png" },
  { race: "human", class: "fighter", image: "/characters/human-fighter.png" },
  { race: "elf", class: "ranger", image: "/characters/elf-ranger.png" },
  { race: "dwarf", class: "cleric", image: "/characters/dwarf-cleric.png" },
  { race: "tiefling", class: "warlock", image: "/characters/tiefling-warlock.png" },
  { race: "half-orc", class: "barbarian", image: "/characters/halforc-barbarian.png" },
  { race: "dragonborn", class: "paladin", image: "/characters/dragonborn-paladin.png" },
  { race: "elf", class: "wizard", image: "/characters/elf-wizard.png" },
];

const CLASS_FAMILY: Record<string, string> = {
  sorcerer: "wizard",
  bard: "rogue",
  monk: "fighter",
  druid: "cleric",
};

function findPortrait(race: string, charClass: string): string | null {
  const r = race.toLowerCase();
  const c = charClass.toLowerCase();
  const exact = PORTRAITS.find((p) => r.includes(p.race) && c === p.class);
  if (exact) return exact.image;
  const classMatch = PORTRAITS.find((p) => c === p.class);
  if (classMatch) return classMatch.image;
  const raceMatch = PORTRAITS.find((p) => r.includes(p.race));
  if (raceMatch) return raceMatch.image;
  if (CLASS_FAMILY[c]) {
    const family = PORTRAITS.find((p) => p.class === CLASS_FAMILY[c]);
    if (family) return family.image;
  }
  return null;
}

interface SavedCharacter extends Character {
  id: string;
  updated_at: string;
  chatHistory?: ChatMessage[];
}

interface MyCharactersProps {
  onNewCharacter: () => void;
  onContinue: (character: SavedCharacter) => void;
  onSignOut: () => void;
  userEmail: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

// Map DB row to our Character type
function dbToCharacter(row: Record<string, unknown>): SavedCharacter {
  return {
    id: row.id as string,
    name: (row.name as string) || "",
    race: (row.race as string) || "",
    class: (row.class as string) || "",
    level: (row.level as number) || 1,
    abilityScores: (row.ability_scores as Character["abilityScores"]) || DEFAULT_CHARACTER.abilityScores,
    hitPoints: (row.hit_points as number) || 0,
    proficiencies: (row.proficiencies as string[]) || [],
    equipment: (row.equipment as string[]) || [],
    background: (row.background as string) || "",
    backstory: (row.backstory as string) || "",
    appearance: (row.appearance as string) || "",
    edition: (row.edition as string) || "5e",
    portraitUrl: (row.portrait_url as string) || "",
    updated_at: row.updated_at as string,
    chatHistory: (row.chat_history as ChatMessage[]) || [],
  };
}

export function MyCharacters({ onNewCharacter, onContinue, onSignOut, userEmail }: MyCharactersProps) {
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCharacters(data.map(dbToCharacter));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name || "this character"}? This can't be undone.`)) return;
    await fetch(`/api/characters?id=${id}`, { method: "DELETE" });
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }

  const initials = userEmail
    .split("@")[0]
    .split(/[.\-_]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background */}
      <img
        src="/tavern-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15"
      />
      <div className="absolute inset-0 bg-[#E8DCC8]/90" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between h-14 md:h-16 px-4 md:px-12 border-b border-[#B8A88A] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[#8B6914] text-lg">✦</span>
            <span className="font-[family-name:var(--font-cormorant)] text-[18px] md:text-[20px] font-bold text-[#2C1810]">
              The Character Wizard
            </span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onNewCharacter}
              className="hidden md:flex items-center gap-2 h-9 px-5 bg-[#8B6914] font-[family-name:var(--font-barlow)] text-[13px] font-semibold text-[#F2E8D5] hover:bg-[#7A5B10] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              New Character
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#C4B89A] flex items-center justify-center">
                <span className="font-[family-name:var(--font-barlow)] text-[11px] md:text-[12px] font-semibold text-[#5C4A32]">
                  {initials}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="font-[family-name:var(--font-barlow)] text-[11px] md:text-[12px] text-[#8B7355] hover:text-[#2C1810] transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Title */}
        <div className="px-4 md:px-12 pt-6 md:pt-10 pb-0">
          <div className="flex items-center justify-between">
            <h1 className="font-[family-name:var(--font-cormorant)] text-[26px] md:text-[36px] font-bold text-[#2C1810]">
              Your Characters
            </h1>
            <div className="flex items-center gap-2 px-3.5 py-1.5 border border-[#B8A88A]">
              <span className="text-[#8B7355] text-xs">⚄</span>
              <span className="font-[family-name:var(--font-barlow)] text-[11px] font-semibold text-[#8B7355] tracking-wider">
                {characters.length} Character{characters.length !== 1 ? "s" : ""} Saved
              </span>
            </div>
          </div>
          <p className="mt-1 md:mt-2 font-[family-name:var(--font-source-serif)] text-[13px] md:text-[16px] italic text-[#8B7355]">
            Continue an adventure or start a new one
          </p>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 py-4 md:py-8">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="font-[family-name:var(--font-source-serif)] text-[14px] italic text-[#8B7355]">
                Loading your characters...
              </p>
            </div>
          ) : characters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 border border-dashed border-[#B8A88A] bg-[#F5EDE0]/50">
              <span className="text-[#8B7355] text-3xl mb-3">⚔</span>
              <p className="font-[family-name:var(--font-cormorant)] text-[18px] font-bold text-[#8B7355]">
                No characters yet
              </p>
              <p className="mt-1 font-[family-name:var(--font-source-serif)] text-[13px] text-[#A89878]">
                Start your first adventure to create a character
              </p>
              <button
                onClick={onNewCharacter}
                className="mt-5 px-6 py-2.5 bg-[#8B6914] font-[family-name:var(--font-barlow)] text-[13px] font-semibold text-[#F2E8D5] hover:bg-[#7A5B10] transition-colors"
              >
                Create Your First Character
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              {characters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onContinue={() => onContinue(char)}
                  onDelete={() => handleDelete(char.id, char.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile New Character button */}
        <div className="md:hidden shrink-0 px-4 pb-3 pt-1">
          <button
            onClick={onNewCharacter}
            className="flex items-center justify-center gap-2 w-full h-11 bg-[#8B6914] font-[family-name:var(--font-barlow)] text-[13px] font-semibold text-[#F2E8D5] hover:bg-[#7A5B10] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New Character
          </button>
        </div>

        {/* Footer */}
        <div className="hidden md:flex items-center justify-center h-12 shrink-0">
          <p className="font-[family-name:var(--font-source-serif)] text-[12px] italic text-[#A89878]">
            The Character Wizard — thecharacterwizard.com
          </p>
        </div>
      </div>
    </div>
  );
}

function CharacterCard({
  character,
  onContinue,
  onDelete,
}: {
  character: SavedCharacter;
  onContinue: () => void;
  onDelete: () => void;
}) {
  const portrait = character.portraitUrl || findPortrait(character.race, character.class);
  const mod = (v: number) => (v > 0 ? Math.floor((v - 10) / 2) : 0);

  // Pick two most relevant ability scores based on class
  const primaryStats = getPrimaryStats(character.class, character.abilityScores);

  return (
    <div className="flex flex-row md:flex-col bg-[#F5EDE0] border border-[#B8A88A] overflow-hidden group">
      {/* Portrait */}
      <div className="relative w-[100px] md:w-full h-auto md:h-[240px] bg-[#0F0F0F] overflow-hidden shrink-0">
        {portrait ? (
          <img
            src={portrait}
            alt={character.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[100px] bg-[#D4C4A8]">
            <span className="text-[#8B7355] text-4xl">⚔</span>
          </div>
        )}
        {/* Delete button — desktop only */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-[#0A0A0A]/60 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#0A0A0A]/80"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="#E8DCC8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Info — horizontal on mobile, stacked on desktop */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-col gap-2.5 px-4 md:px-5 py-3 md:py-4 flex-1">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-cormorant)] text-[18px] md:text-[20px] font-bold text-[#2C1810] leading-tight truncate">
              {character.name || "Unnamed Character"}
            </p>
            <p className="mt-1 font-[family-name:var(--font-barlow)] text-[10px] md:text-[11px] font-semibold text-[#8B6914] tracking-[1.5px] md:tracking-[2px] uppercase truncate">
              {[character.race, character.class, character.level > 0 ? `Level ${character.level}` : ""]
                .filter(Boolean)
                .join(" · ") || "New Character"}
            </p>
          </div>

          <div className="hidden md:block h-px bg-[#C4B89A]" />

          {/* Stats row — desktop only */}
          <div className="hidden md:flex justify-between">
            <StatBox label="HP" value={character.hitPoints} />
            {primaryStats.map((s) => (
              <StatBox key={s.label} label={s.label} value={s.value} modifier={mod(s.value)} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 border-t border-[#C4B89A] mt-auto">
          <span className="font-[family-name:var(--font-source-serif)] text-[11px] italic text-[#8B7355]">
            {timeAgo(character.updated_at)}
          </span>
          <button
            onClick={onContinue}
            className="font-[family-name:var(--font-barlow)] text-[12px] font-semibold text-[#8B6914] hover:text-[#7A5B10] transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, modifier }: { label: string; value: number; modifier?: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-[family-name:var(--font-cormorant)] text-[18px] font-bold text-[#2C1810]">
        {value > 0 ? value : "—"}
      </span>
      <span className="font-[family-name:var(--font-barlow)] text-[9px] font-semibold text-[#8B7355] tracking-wider uppercase">
        {label}
      </span>
    </div>
  );
}

function getPrimaryStats(
  charClass: string,
  scores: Character["abilityScores"]
): { label: string; value: number }[] {
  const c = charClass.toLowerCase();
  const all = [
    { label: "STR", value: scores.strength },
    { label: "DEX", value: scores.dexterity },
    { label: "CON", value: scores.constitution },
    { label: "INT", value: scores.intelligence },
    { label: "WIS", value: scores.wisdom },
    { label: "CHA", value: scores.charisma },
  ];

  // Class-appropriate primary stats
  const classStats: Record<string, string[]> = {
    fighter: ["STR", "CON"],
    barbarian: ["STR", "CON"],
    paladin: ["STR", "CHA"],
    ranger: ["DEX", "WIS"],
    rogue: ["DEX", "INT"],
    monk: ["DEX", "WIS"],
    wizard: ["INT", "CON"],
    sorcerer: ["CHA", "CON"],
    warlock: ["CHA", "CON"],
    bard: ["CHA", "DEX"],
    cleric: ["WIS", "STR"],
    druid: ["WIS", "CON"],
  };

  const preferred = classStats[c] || ["STR", "DEX"];
  return preferred.map((label) => all.find((a) => a.label === label)!).filter(Boolean);
}
