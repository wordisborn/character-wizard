"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { Character } from "@/types/character";

// Character portrait database — maps race+class combos to images
const PORTRAITS = [
  { race: "halfling", class: "rogue", image: "/characters/halfling-rogue.png", title: "The Nimble Trickster" },
  { race: "human", class: "fighter", image: "/characters/human-fighter.png", title: "The Battle-Hardened Knight" },
  { race: "elf", class: "ranger", image: "/characters/elf-ranger.png", title: "The Woodland Sentinel" },
  { race: "dwarf", class: "cleric", image: "/characters/dwarf-cleric.png", title: "The Stoneforge Priest" },
  { race: "tiefling", class: "warlock", image: "/characters/tiefling-warlock.png", title: "The Pact-Bound Sorcerer" },
  { race: "half-orc", class: "barbarian", image: "/characters/halforc-barbarian.png", title: "The Raging Berserker" },
  { race: "dragonborn", class: "paladin", image: "/characters/dragonborn-paladin.png", title: "The Oath-Sworn Dragon" },
  { race: "elf", class: "wizard", image: "/characters/elf-wizard.png", title: "The Arcane Scholar" },
];

// Fallback priority: exact match > class match > race match > default
function findBestPortrait(race: string, charClass: string) {
  const r = race.toLowerCase();
  const c = charClass.toLowerCase();

  const exact = PORTRAITS.find(
    (p) => r.includes(p.race) && c === p.class
  );
  if (exact) return exact;

  const classMatch = PORTRAITS.find((p) => c === p.class);
  if (classMatch) return classMatch;

  const raceMatch = PORTRAITS.find((p) => r.includes(p.race));
  if (raceMatch) return raceMatch;

  const classFamily: Record<string, string> = {
    sorcerer: "wizard",
    bard: "rogue",
    monk: "fighter",
    druid: "cleric",
  };
  if (classFamily[c]) {
    const familyMatch = PORTRAITS.find((p) => p.class === classFamily[c]);
    if (familyMatch) return familyMatch;
  }

  return null;
}

interface CharacterPreviewProps {
  character: Character;
  characterId?: string;
  onPortraitGenerated?: (portraitUrl: string) => void;
}

export function CharacterPreview({ character, characterId, onPortraitGenerated }: CharacterPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPortrait, setLocalPortrait] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const portrait = useMemo(
    () => findBestPortrait(character.race, character.class),
    [character.race, character.class]
  );

  const hasIdentity = character.race || character.class;

  // AI portrait takes priority: local base64 > persisted URL > static
  const aiPortrait = localPortrait || character.portraitUrl;

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: {
            race: character.race,
            class: character.class,
            name: character.name,
            appearance: character.appearance,
            equipment: character.equipment,
          },
          characterId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate portrait");
      }

      const data = await res.json();

      // Show immediately from base64
      if (data.base64) {
        setLocalPortrait(data.base64);
        setImageLoaded(true);
      }

      // Persist the Supabase URL
      if (data.portraitUrl && onPortraitGenerated) {
        onPortraitGenerated(data.portraitUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }, [character, characterId, onPortraitGenerated]);

  return (
    <>
      <div
        className="relative w-full h-[320px] bg-[#0F0F0F] border-b border-[#B8A88A] overflow-hidden"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {aiPortrait && hasIdentity ? (
          <>
            {/* AI-generated portrait — clickable */}
            <img
              src={aiPortrait}
              alt={character.name || "Character portrait"}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 cursor-pointer ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              onClick={() => setLightboxOpen(true)}
            />
            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
            {/* Label */}
            <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
              <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold tracking-[2px] text-[#8B6914] uppercase">
                {[character.race, character.class].filter(Boolean).join(" · ")}
              </p>
              {character.name && (
                <p className="font-[family-name:var(--font-cormorant)] text-[18px] font-bold text-[#E8DCC8] leading-tight mt-0.5">
                  {character.name}
                </p>
              )}
            </div>
            {/* Regenerate button — on hover */}
            {hovering && !generating && (
              <button
                onClick={handleGenerate}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0A0A]/70 border border-[#8B6914]/50 hover:bg-[#0A0A0A]/90 hover:border-[#8B6914] transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1.5 6a4.5 4.5 0 0 1 7.7-3.2M10.5 6a4.5 4.5 0 0 1-7.7 3.2" stroke="#C9A962" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M9.5 1v2.5H7M2.5 11V8.5H5" stroke="#C9A962" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold text-[#C9A962] tracking-wide uppercase">
                  Regenerate
                </span>
              </button>
            )}
          </>
        ) : portrait && hasIdentity ? (
          <>
            {/* Static portrait */}
            <img
              src={portrait.image}
              alt={portrait.title}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
            />
            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
            {/* Label */}
            <div className="absolute bottom-3 left-4 right-4">
              <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold tracking-[2px] text-[#8B6914] uppercase">
                {[character.race, character.class].filter(Boolean).join(" · ")}
              </p>
              {character.name && (
                <p className="font-[family-name:var(--font-cormorant)] text-[18px] font-bold text-[#E8DCC8] leading-tight mt-0.5">
                  {character.name}
                </p>
              )}
            </div>
            {/* Generate Portrait button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#8B6914] hover:bg-[#7A5B10] transition-colors disabled:opacity-50"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1l1.5 3.5L11 6l-3.5 1.5L6 11 4.5 7.5 1 6l3.5-1.5z" fill="#F2E8D5" />
              </svg>
              <span className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold text-[#F2E8D5] tracking-wide uppercase">
                Generate Portrait
              </span>
            </button>
          </>
        ) : (
          /* Empty state — before race/class chosen */
          <div className="flex flex-col items-center justify-center h-full bg-[#D4C4A8]">
            <div className="w-20 h-20 rounded-full bg-[#C4B89A] border-2 border-dashed border-[#B8A88A] flex items-center justify-center mb-4">
              <span className="text-[#8B7355] text-3xl">⚔</span>
            </div>
            <p className="font-[family-name:var(--font-cormorant)] text-[15px] font-bold text-[#8B7355]">
              Character Preview
            </p>
            <p className="font-[family-name:var(--font-barlow)] text-[11px] text-[#A89878] mt-1">
              Choose a race and class to see your hero
            </p>
          </div>
        )}

        {/* Loading overlay */}
        {generating && (
          <div className="absolute inset-0 bg-[#0A0A0A]/80 flex flex-col items-center justify-center z-10">
            <div className="w-14 h-14 rounded-full border-2 border-[#8B6914]/30 border-t-[#C9A962] animate-spin mb-4" />
            <p className="font-[family-name:var(--font-cormorant)] text-[16px] font-bold text-[#C9A962]">
              Conjuring Portrait...
            </p>
            <p className="font-[family-name:var(--font-barlow)] text-[10px] text-[#8B7355] mt-1 tracking-wide">
              This may take a moment
            </p>
          </div>
        )}

        {/* Error message */}
        {error && !generating && (
          <div className="absolute top-3 left-3 right-3 flex items-center gap-2 px-3 py-2 bg-[#2C1810]/90 border border-[#8B3A3A] z-10">
            <span className="text-[#E88B8B] text-xs shrink-0">!</span>
            <span className="font-[family-name:var(--font-barlow)] text-[11px] text-[#E8DCC8] flex-1">
              {error}
            </span>
            <button
              onClick={handleGenerate}
              className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold text-[#C9A962] hover:text-[#E8DCC8] shrink-0"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen lightbox modal */}
      {lightboxOpen && aiPortrait && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-[#0A0A0A]/60 border border-[#8B6914]/40 hover:bg-[#0A0A0A]/80 hover:border-[#8B6914] transition-all z-10"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="#E8DCC8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Portrait image */}
          <img
            src={aiPortrait}
            alt={character.name || "Character portrait"}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Character label */}
          <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
            <p className="font-[family-name:var(--font-barlow)] text-[11px] font-semibold tracking-[2px] text-[#8B6914] uppercase">
              {[character.race, character.class].filter(Boolean).join(" · ")}
            </p>
            {character.name && (
              <p className="font-[family-name:var(--font-cormorant)] text-[24px] font-bold text-[#E8DCC8] mt-1">
                {character.name}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
