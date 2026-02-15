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
            &larr; Back
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
          <GameplayTracker character={character} />
          <Footer />
        </div>
      </div>
    );
  }

  // Desktop print-only version (hidden, shown via @media print)
  return (
    <div className="print-sheet" style={{ display: "none" }}>
      <SheetContent character={character} />
      <GameplayTracker character={character} />
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
              .join(" \u00b7 ")}
          </div>
        </div>
      </div>

      {/* Top row: Ability Scores + Combat Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left column: Ability Scores + Saving Throws */}
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
                  {value > 0 ? value : "\u2014"}
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

        {/* Right column: Combat Stats with writable HP tracking */}
        <div>
          <SectionTitle>Combat</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 4 }}>
            <StatBox label="AC" value={character.armorClass > 0 ? String(character.armorClass) : hasScores ? String(10 + getAbilityModifier(character.abilityScores.dexterity)) : "\u2014"} />
            <StatBox label="Init" value={hasScores ? formatModifier(getAbilityModifier(character.abilityScores.dexterity)) : "\u2014"} />
            <StatBox label="Speed" value={character.speed > 0 ? `${character.speed}` : "\u2014"} />
          </div>

          {/* HP Tracking — writable boxes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
            <div style={{ border: "1px solid #c4b89a", padding: "3px 4px", textAlign: "center" }}>
              <div style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355" }}>HP Max</div>
              <div style={{ fontSize: 16, fontWeight: "bold" }}>{character.hitPoints > 0 ? character.hitPoints : "\u2014"}</div>
            </div>
            <WritableBox label="Current HP" height={32} />
            <WritableBox label="Temp HP" height={32} />
          </div>

          {/* Hit Dice + Inspiration */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
            <div style={{ border: "1px solid #c4b89a", padding: "3px 4px" }}>
              <div style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355" }}>Hit Dice</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                <span style={{ fontSize: 12, fontWeight: "bold" }}>{character.hitDice || "\u2014"}</span>
                <span style={{ fontSize: 9, color: "#8b7355" }}>Remaining: ____</span>
              </div>
            </div>
            <div style={{ border: "1px solid #c4b89a", padding: "3px 4px" }}>
              <div style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355" }}>Inspiration</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                <EmptyCircle size={12} />
              </div>
            </div>
          </div>

          {/* Death Saves — always show empty circles */}
          <div style={{ border: "1px solid #c4b89a", padding: "4px 6px", marginTop: 6 }}>
            <div style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355", marginBottom: 3 }}>Death Saves</div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 9, color: "#5c4a32", fontWeight: 600 }}>Successes</span>
                <EmptyCircle size={8} /><EmptyCircle size={8} /><EmptyCircle size={8} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 9, color: "#5c4a32", fontWeight: 600 }}>Failures</span>
                <EmptyCircle size={8} /><EmptyCircle size={8} /><EmptyCircle size={8} />
              </div>
            </div>
          </div>

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
                  <strong>{atk.name}</strong> {atk.bonus} &mdash; {atk.damage}
                </div>
              ))}
            </>
          )}
          {/* Blank attack rows for in-game additions */}
          <div style={{ marginTop: 4 }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 4, marginTop: 2 }}>
                <BlankLine />
                <BlankLine />
                <BlankLine />
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 4, fontSize: 8, color: "#8b7355", marginTop: 1 }}>
              <span>Name</span><span>Bonus</span><span>Damage</span>
            </div>
          </div>
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
          {/* Currency boxes — writable */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginTop: 6 }}>
            {(["CP", "SP", "EP", "GP", "PP"] as const).map((label) => {
              const key = label.toLowerCase() as keyof typeof character.currency;
              const value = character.currency[key];
              return (
                <div key={label} style={{ border: "1px solid #c4b89a", padding: "2px 2px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 600, color: "#8b7355" }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: "bold", minHeight: 16 }}>{value > 0 ? value : ""}</div>
                </div>
              );
            })}
          </div>
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
          </div>
          {/* Spell Slot Tracking with checkable circles */}
          {character.spellcasting.spellSlots && Object.keys(character.spellcasting.spellSlots).length > 0 && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: "#5c4a32", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Spell Slots</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 4 }}>
                {Object.entries(character.spellcasting.spellSlots).map(([level, count]) => (
                  <div key={level} style={{ border: "1px solid #c4b89a", padding: "3px 6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: "#8b7355" }}>Level {level}</span>
                      <span style={{ fontSize: 9, color: "#8b7355" }}>{count} total</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                      {Array.from({ length: count }, (_, i) => (
                        <EmptyCircle key={i} size={10} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Cantrips */}
          {character.spellcasting.cantripsKnown && character.spellcasting.cantripsKnown.length > 0 && (
            <div style={{ marginTop: 3, fontSize: 11 }}>
              <strong style={{ color: "#5c4a32", fontSize: 10 }}>Cantrips:</strong>{" "}
              {character.spellcasting.cantripsKnown.join(", ")}
            </div>
          )}
          {/* Spells with preparation checkboxes */}
          {character.spellcasting.spellsKnown && character.spellcasting.spellsKnown.length > 0 && (
            <div style={{ marginTop: 3 }}>
              <strong style={{ color: "#5c4a32", fontSize: 10 }}>Spells</strong>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px 12px", marginTop: 2 }}>
                {character.spellcasting.spellsKnown.map((spell, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}>
                    <EmptyCircle size={6} />
                    <span>{spell}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 8, color: "#8b7355", marginTop: 2 }}>&cir; = prepared</div>
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

/* ──────────────────────────────────────────────────────────
 * Page 2: In-Game Tracking Sheet
 * ────────────────────────────────────────────────────────── */

const CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
];

function GameplayTracker({ character }: { character: Character }) {
  return (
    <div className="print-page-break" style={{ fontFamily: "Georgia, serif", color: "#2c1810" }}>
      {/* Page 2 header */}
      <div style={{ borderBottom: "2px solid #8b6914", paddingBottom: 4, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 16, fontWeight: "bold" }}>
          {character.name || "Unnamed Character"} &mdash; Session Tracker
        </div>
        <div style={{ fontSize: 10, color: "#8b7355" }}>
          Date: ____________
        </div>
      </div>

      {/* Top section: HP tracker + Conditions + Exhaustion */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Left: HP & combat tracking */}
        <div>
          <SectionTitle>Hit Point Tracker</SectionTitle>
          <div style={{ fontSize: 9, color: "#8b7355", marginBottom: 4 }}>
            Max HP: {character.hitPoints > 0 ? character.hitPoints : "___"} | Hit Dice: {character.hitDice || "___"}
          </div>
          {/* HP tracking grid — 10 rows */}
          <div style={{ border: "1px solid #c4b89a" }}>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 60px 1fr", fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355", borderBottom: "1px solid #c4b89a" }}>
              <div style={{ padding: "2px 4px", borderRight: "1px solid #c4b89a" }}>Dmg/Heal</div>
              <div style={{ padding: "2px 4px", borderRight: "1px solid #c4b89a" }}>Source</div>
              <div style={{ padding: "2px 4px", borderRight: "1px solid #c4b89a" }}>New HP</div>
              <div style={{ padding: "2px 4px" }}>Notes</div>
            </div>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 60px 1fr", borderBottom: i < 11 ? "1px solid #e5dcc8" : undefined, minHeight: 18 }}>
                <div style={{ borderRight: "1px solid #e5dcc8" }} />
                <div style={{ borderRight: "1px solid #e5dcc8" }} />
                <div style={{ borderRight: "1px solid #e5dcc8" }} />
                <div />
              </div>
            ))}
          </div>

          {/* Death Saves — larger for tracking */}
          <div style={{ border: "1px solid #c4b89a", padding: "6px 8px", marginTop: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355", marginBottom: 4 }}>Death Saves</div>
            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "#5c4a32", fontWeight: 600 }}>Successes</span>
                <EmptyCircle size={12} /><EmptyCircle size={12} /><EmptyCircle size={12} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "#5c4a32", fontWeight: 600 }}>Failures</span>
                <EmptyCircle size={12} /><EmptyCircle size={12} /><EmptyCircle size={12} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Conditions + Exhaustion + Resources */}
        <div>
          <SectionTitle>Conditions</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px 8px", marginTop: 2 }}>
            {CONDITIONS.map((condition) => (
              <div key={condition} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, margin: "1px 0" }}>
                <EmptySquare size={8} />
                <span>{condition}</span>
              </div>
            ))}
          </div>

          {/* Exhaustion */}
          <div style={{ border: "1px solid #c4b89a", padding: "4px 8px", marginTop: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355", marginBottom: 3 }}>Exhaustion</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
              {[
                { level: 1, effect: "Disadv. ability checks" },
                { level: 2, effect: "Speed halved" },
                { level: 3, effect: "Disadv. attacks & saves" },
                { level: 4, effect: "HP max halved" },
                { level: 5, effect: "Speed reduced to 0" },
                { level: 6, effect: "Death" },
              ].map((e) => (
                <div key={e.level} style={{ textAlign: "center" }}>
                  <EmptyCircle size={12} />
                  <div style={{ fontSize: 7, color: "#8b7355", marginTop: 1 }}>{e.level}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginTop: 1 }}>
              {[
                "Disadv. checks",
                "Speed \u00bd",
                "Disadv. atk/saves",
                "HP max \u00bd",
                "Speed 0",
                "Death",
              ].map((text, i) => (
                <div key={i} style={{ fontSize: 6, color: "#8b7355", textAlign: "center", lineHeight: 1.2 }}>{text}</div>
              ))}
            </div>
          </div>

          {/* Class/Feature Resources */}
          <SectionTitle>Feature & Resource Tracker</SectionTitle>
          <div style={{ marginTop: 2 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <BlankLine width={100} />
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: 6 }, (_, j) => (
                    <EmptyCircle key={j} size={8} />
                  ))}
                </div>
              </div>
            ))}
            <div style={{ fontSize: 7, color: "#8b7355" }}>Write feature name, fill circles as uses are spent</div>
          </div>
        </div>
      </div>

      {/* Spell Slot Tracker — if spellcaster */}
      {character.spellcasting && character.spellcasting.spellSlots && Object.keys(character.spellcasting.spellSlots).length > 0 && (
        <div style={{ marginTop: 8 }}>
          <SectionTitle>Spell Slot Tracker</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 6, marginTop: 4 }}>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((level) => {
              const total = character.spellcasting?.spellSlots?.[String(level)] || 0;
              const maxCircles = total > 0 ? total : (level <= 5 ? 4 : level <= 7 ? 3 : 2);
              return (
                <div key={level} style={{ border: "1px solid #c4b89a", padding: "4px 6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#8b6914" }}>Lv {level}</span>
                    <span style={{ fontSize: 8, color: "#8b7355" }}>{total > 0 ? `${total} slots` : "\u2014"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 3, marginTop: 3, flexWrap: "wrap" }}>
                    {Array.from({ length: maxCircles }, (_, j) => (
                      <EmptyCircle key={j} size={10} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 7, color: "#8b7355", marginTop: 2 }}>Fill circles as spell slots are expended. Clear on long rest.</div>
        </div>
      )}

      {/* Equipment & Treasure tracking */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
        {/* Loot / Treasure */}
        <div>
          <SectionTitle>Treasure & Loot</SectionTitle>
          <div style={{ border: "1px solid #c4b89a", padding: 4 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{ borderBottom: "1px solid #e5dcc8", minHeight: 16, marginBottom: 1 }} />
            ))}
          </div>
          {/* Currency change tracker */}
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#5c4a32", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Currency Changes</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
              {["CP", "SP", "EP", "GP", "PP"].map((label) => (
                <div key={label} style={{ border: "1px solid #c4b89a", padding: "2px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 600, color: "#8b7355" }}>{label}</div>
                  <div style={{ minHeight: 40 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session Notes */}
        <div>
          <SectionTitle>Session Notes</SectionTitle>
          <div style={{ border: "1px solid #c4b89a", padding: 4 }}>
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} style={{ borderBottom: "1px solid #e5dcc8", minHeight: 16, marginBottom: 1 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Allies, Organizations, and NPCs */}
      <div style={{ marginTop: 8 }}>
        <SectionTitle>Allies, NPCs & Organizations</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ border: "1px solid #c4b89a", padding: "4px 6px", minHeight: 40 }}>
              <BlankLine />
              <div style={{ fontSize: 7, color: "#8b7355", marginTop: 1 }}>Name / Relationship</div>
            </div>
          ))}
        </div>
      </div>

      {/* XP Tracker */}
      <div style={{ marginTop: 8, display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div>
          <SectionTitle>Experience Points</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "100px 100px 100px", gap: 6 }}>
            <div style={{ border: "1px solid #c4b89a", padding: "3px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 8, fontWeight: 600, color: "#8b7355", textTransform: "uppercase" }}>Starting XP</div>
              <div style={{ fontSize: 14, fontWeight: "bold", minHeight: 20 }}>{character.experiencePoints > 0 ? character.experiencePoints : ""}</div>
            </div>
            <WritableBox label="XP Earned" height={20} />
            <WritableBox label="New Total" height={20} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <SectionTitle>Concentration</SectionTitle>
          <div style={{ border: "1px solid #c4b89a", padding: "4px 8px", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "#5c4a32", fontWeight: 600, whiteSpace: "nowrap" }}>Spell:</span>
            <BlankLine />
            <span style={{ fontSize: 9, color: "#5c4a32", fontWeight: 600, whiteSpace: "nowrap" }}>Duration:</span>
            <BlankLine width={60} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
 * Shared print components
 * ────────────────────────────────────────────────────────── */

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

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #c4b89a", padding: "4px 2px", textAlign: "center" }}>
      <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 6, margin: "2px 0", fontSize: 12 }}>
      <span style={{ fontWeight: 600, color: "#5c4a32", minWidth: 75 }}>{label}</span>
      <span>{value || "\u2014"}</span>
    </div>
  );
}

function EmptyCircle({ size }: { size: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1.5px solid #8b6914",
        background: "transparent",
        flexShrink: 0,
      }}
    />
  );
}

function EmptySquare({ size }: { size: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: "1.5px solid #8b6914",
        background: "transparent",
        flexShrink: 0,
      }}
    />
  );
}

function WritableBox({ label, height }: { label: string; height: number }) {
  return (
    <div style={{ border: "1px solid #c4b89a", padding: "3px 4px", textAlign: "center" }}>
      <div style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8b7355" }}>{label}</div>
      <div style={{ minHeight: height }} />
    </div>
  );
}

function BlankLine({ width }: { width?: number }) {
  return (
    <div
      style={{
        flex: width ? undefined : 1,
        width: width ? width : undefined,
        borderBottom: "1px solid #c4b89a",
        minHeight: 14,
      }}
    />
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
      Created with The Character Wizard &mdash; thecharacterwizard.com
    </div>
  );
}
