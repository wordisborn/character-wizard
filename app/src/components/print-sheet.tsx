"use client";

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
  const profBonus = getProficiencyBonus(character.level);
  const hasScores = character.abilityScores.strength > 0;

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
              character.subrace ? `(${character.subrace})` : "",
              character.class,
              character.subclass ? `(${character.subclass})` : "",
              character.level > 0 ? `Level ${character.level}` : "",
              character.alignment,
              character.edition,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      </div>

      {/* Top row: Ability Scores + Combat Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left column: Identity + Ability Scores */}
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

          {/* Saving Throws */}
          {hasScores && (
            <>
              <SectionTitle>Saving Throws</SectionTitle>
              <div style={{ marginTop: 2 }}>
                {ABILITY_NAMES.map((a) => {
                  const isProficient = character.savingThrowProficiencies.includes(a.key);
                  const total = getSavingThrow(character.abilityScores[a.key], isProficient, profBonus);
                  return (
                    <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, margin: "1px 0" }}>
                      <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", border: "1px solid #8b6914", background: isProficient ? "#8b6914" : "transparent" }} />
                      <span style={{ fontWeight: 600, color: "#8b6914", width: 24 }}>{formatModifier(total)}</span>
                      <span>{a.label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right column: Combat Stats */}
        <div>
          <SectionTitle>Combat</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 4 }}>
            <div style={{ border: "1px solid #c4b89a", padding: "4px 2px", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355" }}>AC</div>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>
                {character.armorClass > 0 ? character.armorClass : hasScores ? 10 + getAbilityModifier(character.abilityScores.dexterity) : "—"}
              </div>
            </div>
            <div style={{ border: "1px solid #c4b89a", padding: "4px 2px", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355" }}>Init</div>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{hasScores ? formatModifier(getAbilityModifier(character.abilityScores.dexterity)) : "—"}</div>
            </div>
            <div style={{ border: "1px solid #c4b89a", padding: "4px 2px", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355" }}>Speed</div>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{character.speed > 0 ? `${character.speed}` : "—"}</div>
            </div>
          </div>
          <FieldRow label="Hit Points" value={character.hitPoints > 0 ? String(character.hitPoints) : ""} />
          {character.hitDice && <FieldRow label="Hit Dice" value={character.hitDice} />}
          <FieldRow label="Prof. Bonus" value={hasScores ? formatModifier(profBonus) : ""} />
          {hasScores && (
            <FieldRow label="Passive Perception" value={String(getPassivePerception(
              character.abilityScores.wisdom,
              character.skillProficiencies.map((s) => s.toLowerCase()).includes("perception"),
              profBonus
            ))} />
          )}

          {/* Attacks */}
          {character.attacks.length > 0 && (
            <>
              <SectionTitle>Attacks</SectionTitle>
              {character.attacks.map((atk, i) => (
                <div key={i} style={{ fontSize: 11, margin: "2px 0" }}>
                  <strong>{atk.name}</strong> {atk.bonus} — {atk.damage}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Skills */}
      {hasScores && (
        <div style={{ marginTop: 4 }}>
          <SectionTitle>Skills</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px 16px", marginTop: 2 }}>
            {SKILL_ABILITY_MAP.map((s) => {
              const isProficient = character.skillProficiencies.map((sk) => sk.toLowerCase()).includes(s.skill);
              const bonus = getSkillBonus(character.abilityScores[s.ability], isProficient, profBonus);
              return (
                <div key={s.skill} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, margin: "0.5px 0" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", border: "1px solid #8b6914", background: isProficient ? "#8b6914" : "transparent" }} />
                  <span style={{ fontWeight: 600, color: "#8b6914", width: 20, fontSize: 10 }}>{formatModifier(bonus)}</span>
                  <span>{s.label}</span>
                  <span style={{ color: "#8b7355", fontSize: 9 }}>({s.abilityAbbr})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Personality */}
      {(character.personalityTraits || character.ideals || character.bonds || character.flaws) && (
        <div style={{ marginTop: 4 }}>
          <SectionTitle>Personality</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 2 }}>
            {character.personalityTraits && (
              <div>
                <strong style={{ color: "#5c4a32", fontSize: 10 }}>Traits</strong>
                <p style={{ fontSize: 10, lineHeight: 1.4, marginTop: 1 }}>{character.personalityTraits}</p>
              </div>
            )}
            {character.ideals && (
              <div>
                <strong style={{ color: "#5c4a32", fontSize: 10 }}>Ideals</strong>
                <p style={{ fontSize: 10, lineHeight: 1.4, marginTop: 1 }}>{character.ideals}</p>
              </div>
            )}
            {character.bonds && (
              <div>
                <strong style={{ color: "#5c4a32", fontSize: 10 }}>Bonds</strong>
                <p style={{ fontSize: 10, lineHeight: 1.4, marginTop: 1 }}>{character.bonds}</p>
              </div>
            )}
            {character.flaws && (
              <div>
                <strong style={{ color: "#5c4a32", fontSize: 10 }}>Flaws</strong>
                <p style={{ fontSize: 10, lineHeight: 1.4, marginTop: 1 }}>{character.flaws}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      {character.features.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <SectionTitle>Features & Traits</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
            {character.features.map((f, i) => (
              <span key={i} style={{ border: "1px solid #c4b89a", padding: "1px 6px", fontSize: 10 }}>{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Proficiencies, Languages, Equipment */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
        <div>
          <SectionTitle>Proficiencies & Languages</SectionTitle>
          {character.proficiencies.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
              {character.proficiencies.map((p, i) => (
                <span key={i} style={{ border: "1px solid #c4b89a", padding: "1px 6px", fontSize: 11 }}>
                  {p}
                </span>
              ))}
            </div>
          )}
          {character.languages.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "#5c4a32", fontWeight: 600 }}>Languages: </span>
              <span style={{ fontSize: 11 }}>{character.languages.join(", ")}</span>
            </div>
          )}
          {character.proficiencies.length === 0 && character.languages.length === 0 && (
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
          {(character.currency.gp > 0 || character.currency.sp > 0 || character.currency.cp > 0) && (
            <div style={{ marginTop: 4, fontSize: 11 }}>
              <span style={{ fontSize: 10, color: "#5c4a32", fontWeight: 600 }}>Currency: </span>
              {[
                character.currency.pp > 0 ? `${character.currency.pp} PP` : "",
                character.currency.gp > 0 ? `${character.currency.gp} GP` : "",
                character.currency.ep > 0 ? `${character.currency.ep} EP` : "",
                character.currency.sp > 0 ? `${character.currency.sp} SP` : "",
                character.currency.cp > 0 ? `${character.currency.cp} CP` : "",
              ].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* Spellcasting */}
      {character.spellcasting && (
        <div style={{ marginTop: 4 }}>
          <SectionTitle>Spellcasting</SectionTitle>
          <div style={{ display: "flex", gap: 16, fontSize: 11, marginTop: 2 }}>
            <span><strong>Ability:</strong> {character.spellcasting.spellcastingAbility?.slice(0, 3).toUpperCase()}</span>
            {hasScores && character.spellcasting.spellcastingAbility && (
              <>
                <span><strong>Save DC:</strong> {getSpellSaveDC(character.abilityScores[character.spellcasting.spellcastingAbility as keyof typeof character.abilityScores] || 0, profBonus)}</span>
                <span><strong>Attack:</strong> {formatModifier(getSpellAttackBonus(character.abilityScores[character.spellcasting.spellcastingAbility as keyof typeof character.abilityScores] || 0, profBonus))}</span>
              </>
            )}
            {character.spellcasting.spellSlots && Object.entries(character.spellcasting.spellSlots).map(([lvl, count]) => (
              <span key={lvl}><strong>Lv{lvl} Slots:</strong> {count}</span>
            ))}
          </div>
          {character.spellcasting.cantripsKnown && character.spellcasting.cantripsKnown.length > 0 && (
            <div style={{ marginTop: 3, fontSize: 11 }}>
              <strong style={{ color: "#5c4a32", fontSize: 10 }}>Cantrips:</strong>{" "}
              {character.spellcasting.cantripsKnown.join(", ")}
            </div>
          )}
          {character.spellcasting.spellsKnown && character.spellcasting.spellsKnown.length > 0 && (
            <div style={{ marginTop: 2, fontSize: 11 }}>
              <strong style={{ color: "#5c4a32", fontSize: 10 }}>Spells:</strong>{" "}
              {character.spellcasting.spellsKnown.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Bottom: Backstory + Appearance */}
      {(backstory || appearance) && (
        <div style={{ marginTop: 4 }}>
          <SectionTitle>Background & Story</SectionTitle>
          {character.background && <FieldRow label="Background" value={character.background} />}
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
