"use client";

import type { Character } from "@/types/character";

function mod(score: number) {
  if (score <= 0) return "";
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
}

export function PrintSheet({
  character,
  inline,
  onClose,
}: {
  character: Character;
  inline?: boolean;
  onClose?: () => void;
}) {
  // Inline view for touch devices (phones + tablets)
  if (inline) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto screen-only">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-white/95 backdrop-blur-sm border-b border-[#e5e5e5]">
          <button
            onClick={onClose}
            className="font-[family-name:var(--font-barlow)] text-[14px] font-semibold text-[#8B6914]"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <span className="font-[family-name:var(--font-barlow)] text-[12px] text-[#8B7355]">
              Use Share to save as PDF
            </span>
            <button
              onClick={() => window.print()}
              className="font-[family-name:var(--font-barlow)] text-[13px] font-semibold text-[#8B6914] px-3 py-1.5 border border-[#8B6914]"
            >
              Print
            </button>
          </div>
        </div>
        <div className="max-w-[640px] mx-auto px-6 py-6">
          <SheetContent character={character} />
          <Footer />
        </div>
      </div>
    );
  }

  // Desktop print-only version (hidden, shown via @media print)
  return (
    <div className="print-sheet" style={{ display: "none" }}>
      <SheetContent character={character} />
      <Footer />
    </div>
  );
}

function SheetContent({ character }: { character: Character }) {
  const backstory = character.backstory;
  const appearance = character.appearance;

  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#2c1810" }}>
      {/* Header — name + race/class on one line, with optional portrait */}
      <div style={{ borderBottom: "2px solid #8b6914", paddingBottom: 6, marginBottom: 12, display: "flex", alignItems: "flex-end", gap: 12 }}>
        {character.portraitUrl && (
          <img
            src={character.portraitUrl}
            alt={character.name || "Character portrait"}
            style={{ width: 64, height: 64, objectFit: "cover", border: "1px solid #c4b89a", flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: "bold" }}>
            {character.name || "Unnamed Character"}
          </div>
          <div style={{ fontSize: 12, color: "#8b6914", textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>
            {[
              character.race,
              character.class,
              character.level > 0 ? `Level ${character.level}` : "",
              character.edition,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      </div>

      {/* Top row: Identity + Combat + Ability Scores — all in a row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left column: Identity fields */}
        <div>
          <SectionTitle>Identity</SectionTitle>
          <FieldRow label="Name" value={character.name} />
          <FieldRow label="Race" value={character.race} />
          <FieldRow label="Class" value={character.class} />
          <FieldRow label="Level" value={character.level > 0 ? String(character.level) : ""} />
          <FieldRow label="Background" value={character.background} />
          <FieldRow label="Hit Points" value={character.hitPoints > 0 ? String(character.hitPoints) : ""} />
        </div>

        {/* Right column: Ability Scores */}
        <div>
          <SectionTitle>Ability Scores</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 4 }}>
            {(
              [
                ["STR", character.abilityScores.strength],
                ["DEX", character.abilityScores.dexterity],
                ["CON", character.abilityScores.constitution],
                ["INT", character.abilityScores.intelligence],
                ["WIS", character.abilityScores.wisdom],
                ["CHA", character.abilityScores.charisma],
              ] as const
            ).map(([label, value]) => (
              <div key={label} style={{ border: "1px solid #c4b89a", padding: "4px 2px", textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355" }}>
                  {label}
                </div>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>
                  {value > 0 ? value : "—"}
                </div>
                {value > 0 && (
                  <div style={{ fontSize: 10, color: "#8b6914" }}>{mod(value)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle row: Proficiencies + Equipment */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
        <div>
          <SectionTitle>Proficiencies</SectionTitle>
          {character.proficiencies.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
              {character.proficiencies.map((p, i) => (
                <span key={i} style={{ border: "1px solid #c4b89a", padding: "1px 6px", fontSize: 11 }}>
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ color: "#8b7355", fontStyle: "italic", fontSize: 12 }}>None yet</span>
          )}
        </div>
        <div>
          <SectionTitle>Equipment</SectionTitle>
          {character.equipment.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
              {character.equipment.map((e, i) => (
                <span key={i} style={{ border: "1px solid #c4b89a", padding: "1px 6px", fontSize: 11 }}>
                  {e}
                </span>
              ))}
            </div>
          ) : (
            <span style={{ color: "#8b7355", fontStyle: "italic", fontSize: 12 }}>None yet</span>
          )}
        </div>
      </div>

      {/* Bottom: Backstory + Appearance */}
      {(backstory || appearance) && (
        <div style={{ marginTop: 4 }}>
          <SectionTitle>Background & Story</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: backstory && appearance ? "1fr 1fr" : "1fr", gap: 16, marginTop: 2 }}>
            {backstory && (
              <div>
                <strong style={{ color: "#5c4a32", fontSize: 11 }}>Backstory</strong>
                <p style={{ fontSize: 11, lineHeight: 1.5, marginTop: 2, color: "#2c1810" }}>
                  {backstory}
                </p>
              </div>
            )}
            {appearance && (
              <div>
                <strong style={{ color: "#5c4a32", fontSize: 11 }}>Appearance</strong>
                <p style={{ fontSize: 11, lineHeight: 1.5, marginTop: 2, color: "#2c1810" }}>
                  {appearance}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 4,
        color: "#8b6914",
        textTransform: "uppercase",
        letterSpacing: 1,
        fontFamily: "Georgia, serif",
      }}
    >
      {children}
    </h2>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 6, margin: "2px 0", fontSize: 12 }}>
      <span style={{ fontWeight: 600, color: "#5c4a32", minWidth: 75 }}>{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 8,
        borderTop: "1px solid #c4b89a",
        fontSize: 10,
        color: "#8b7355",
        textAlign: "center",
      }}
    >
      Created with The Character Wizard — thecharacterwizard.com
    </div>
  );
}
