"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CharacterProvider, useCharacter, useCharacterDispatch } from "@/lib/character-context";
import { useChat } from "@/lib/use-chat";
import { ChatPanel } from "@/components/chat-panel";
import { CharacterSheet } from "@/components/character-sheet";
import { CharacterPreview } from "@/components/character-preview";
import { WelcomeScreen } from "@/components/welcome-screen";
import { MyCharacters } from "@/components/my-characters";
import { SaveModal } from "@/components/save-modal";
import { PrintModal } from "@/components/print-modal";
import { PrintSheet } from "@/components/print-sheet";
import { createClient } from "@/lib/supabase-browser";
import type { Character, CharacterUpdate, ChatMessage } from "@/types/character";
import { DEFAULT_CHARACTER } from "@/types/character";

type View = "welcome" | "characters" | "wizard";

interface LoadedCharacter extends Character {
  id?: string;
  chatHistory?: ChatMessage[];
}

export default function Home() {
  const [view, setView] = useState<View>("welcome");
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [initialCharacter, setInitialCharacter] = useState<LoadedCharacter | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check auth state on mount and handle OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user?.email) {
        setUser({ email: data.user.email });

        // Returning from OAuth with a pending save?
        const pendingSave = sessionStorage.getItem("wizard_pending_save");
        if (action === "save" && pendingSave) {
          try {
            const charData = JSON.parse(pendingSave);
            // Save to DB
            const res = await fetch("/api/characters", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(charData),
            });
            if (res.ok) {
              const saved = await res.json();
              // Restore the character into the wizard with its new DB id
              setInitialCharacter({ ...charData, id: saved.id });
            } else {
              setInitialCharacter(charData);
            }
          } catch {
            // Restore character even if save fails
            try {
              setInitialCharacter(JSON.parse(pendingSave));
            } catch { /* ignore */ }
          }
          sessionStorage.removeItem("wizard_pending_save");
          setView("wizard");
        } else if (action === "save") {
          // Returning from OAuth but no pending data — go to wizard
          setView("wizard");
        } else {
          setView("characters");
        }
      } else {
        // Not signed in — check if we were in a wizard session
        if (sessionStorage.getItem("wizard_started") === "true") {
          // Restore character from sessionStorage if available
          const pendingSave = sessionStorage.getItem("wizard_pending_save");
          if (pendingSave) {
            try {
              setInitialCharacter(JSON.parse(pendingSave));
            } catch { /* ignore */ }
          }
          setView("wizard");
        }
      }
      setCheckingAuth(false);
    });

    // Clean up URL params
    if (window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  function handleStartNew() {
    setInitialCharacter(null);
    sessionStorage.setItem("wizard_started", "true");
    setView("wizard");
  }

  function handleContinue(character: LoadedCharacter) {
    setInitialCharacter(character);
    sessionStorage.setItem("wizard_started", "true");
    setView("wizard");
  }

  function handleSignOut() {
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      setUser(null);
      sessionStorage.removeItem("wizard_started");
      setView("welcome");
    });
  }

  function handleBackToCharacters() {
    setView("characters");
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#E8DCC8]">
        <p className="font-[family-name:var(--font-source-serif)] text-[14px] italic text-[#8B7355]">
          Loading...
        </p>
      </div>
    );
  }

  if (view === "welcome") {
    return (
      <WelcomeScreen
        onStart={handleStartNew}
        hasAccount={!!user}
        onViewCharacters={() => setView("characters")}
      />
    );
  }

  if (view === "characters" && user) {
    return (
      <MyCharacters
        onNewCharacter={handleStartNew}
        onContinue={handleContinue}
        onSignOut={handleSignOut}
        userEmail={user.email}
      />
    );
  }

  return (
    <CharacterProvider initialCharacter={initialCharacter || undefined}>
      <AppLayout
        user={user}
        characterId={initialCharacter?.id}
        initialMessages={initialCharacter?.chatHistory}
        onBack={user ? handleBackToCharacters : undefined}
        onSignedIn={(email) => setUser({ email })}
      />
    </CharacterProvider>
  );
}

function BottomSheetPeek({
  character,
  onClick,
}: {
  character: Character;
  onClick: () => void;
}) {
  const hasIdentity = character.name || character.race || character.class;
  const modifier = (v: number) => {
    if (v <= 0) return "";
    const m = Math.floor((v - 10) / 2);
    return m >= 0 ? `+${m}` : String(m);
  };

  // Pick the highest ability score to show
  const scores = character.abilityScores;
  const allScores = [
    { label: "STR", value: scores.strength },
    { label: "DEX", value: scores.dexterity },
    { label: "CON", value: scores.constitution },
    { label: "INT", value: scores.intelligence },
    { label: "WIS", value: scores.wisdom },
    { label: "CHA", value: scores.charisma },
  ].filter((s) => s.value > 0);
  const topScore = allScores.sort((a, b) => b.value - a.value)[0];

  return (
    <button
      onClick={onClick}
      className="md:hidden w-full bg-[#F5EDE0] border-t border-[#B8A88A] rounded-t-xl shrink-0"
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-9 h-1 rounded-full bg-[#C4B89A]" />
      </div>

      {/* Peek content */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-[#2C1810] rounded flex items-center justify-center shrink-0">
            <span className="text-[#C9A962] text-sm">⚔</span>
          </div>
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-cormorant)] text-[15px] font-bold text-[#2C1810] truncate">
              {hasIdentity ? (character.name || "Unnamed") : "Character Sheet"}
            </p>
            <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold text-[#8B6914] tracking-wide uppercase truncate">
              {hasIdentity
                ? [character.race, character.class, character.level > 0 ? `Level ${character.level}` : ""]
                    .filter(Boolean)
                    .join(" · ")
                : "Tap to view"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {character.hitPoints > 0 && (
            <div className="flex flex-col items-center">
              <span className="font-[family-name:var(--font-cormorant)] text-[16px] font-bold text-[#2C1810]">
                {character.hitPoints}
              </span>
              <span className="font-[family-name:var(--font-barlow)] text-[8px] font-semibold text-[#8B7355] tracking-wider uppercase">
                HP
              </span>
            </div>
          )}
          {topScore && (
            <div className="flex flex-col items-center">
              <span className="font-[family-name:var(--font-cormorant)] text-[16px] font-bold text-[#2C1810]">
                {topScore.value}
              </span>
              <span className="font-[family-name:var(--font-barlow)] text-[8px] font-semibold text-[#8B7355] tracking-wider uppercase">
                {topScore.label}
              </span>
            </div>
          )}
          <svg width="12" height="8" viewBox="0 0 12 8" className="text-[#8B7355] ml-1">
            <path d="M2 6l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </button>
  );
}

function MobileBottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setAnimating(true);
    } else if (visible) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 top-0 bg-[#E8DCC8] ${
          open ? "bottom-sheet-enter" : "bottom-sheet-exit"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function AppLayout({
  user,
  characterId,
  initialMessages,
  onBack,
  onSignedIn,
}: {
  user: { email: string } | null;
  characterId?: string;
  initialMessages?: ChatMessage[];
  onBack?: () => void;
  onSignedIn: (email: string) => void;
}) {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [savedId, setSavedId] = useState<string | undefined>(characterId);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobilePrintOpen, setMobilePrintOpen] = useState(false);

  const isTouchDevice = typeof window !== "undefined" && (
    "ontouchstart" in window || navigator.maxTouchPoints > 0
  );

  function handlePrintClick() {
    if (isTouchDevice) {
      // Touch devices (phones, tablets) — show inline printable view
      setSheetOpen(false);
      setMobilePrintOpen(true);
    } else if (user) {
      window.print();
    } else {
      setPrintModalOpen(true);
    }
  }

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  const handleCharacterUpdate = useCallback(
    (updates: CharacterUpdate) => {
      dispatch({ type: "UPDATE_CHARACTER", payload: updates });
    },
    [dispatch]
  );

  const { messages, isLoading, sendMessage } = useChat(
    character,
    handleCharacterUpdate,
    initialMessages
  );

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...(savedId ? { id: savedId } : {}),
        name: character.name,
        race: character.race,
        class: character.class,
        level: character.level,
        abilityScores: character.abilityScores,
        hitPoints: character.hitPoints,
        proficiencies: character.proficiencies,
        equipment: character.equipment,
        background: character.background,
        backstory: character.backstory,
        appearance: character.appearance,
        edition: character.edition,
        portraitUrl: character.portraitUrl,
        chatHistory: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      };

      const res = await fetch("/api/characters", {
        method: savedId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedId(data.id);
        setSaveModalOpen(false);
        showToast("Character saved");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleSaveClick() {
    if (user) {
      // Already signed in — save directly
      handleSave();
    } else {
      // Need to sign in first
      setSaveModalOpen(true);
    }
  }

  function handlePrintModalDone(email: string) {
    setPrintModalOpen(false);
    setTimeout(() => window.print(), 150);
  }

  return (
    <>
      {/* Screen layout — hidden when printing */}
      <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden screen-only">
        {/* Chat panel — full width on mobile, 2/3 on desktop */}
        <div className="flex-1 md:w-2/3 h-full flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              onBack={onBack}
            />
          </div>

          {/* Bottom sheet peek — mobile only */}
          <BottomSheetPeek
            character={character}
            onClick={() => setSheetOpen(true)}
          />
        </div>

        {/* Right panel — Character Sheet (1/3) — desktop only */}
        <div className="hidden md:flex w-1/3 h-full flex-col border-l border-[#B8A88A]">
          {/* Preview */}
          <div className="shrink-0">
            <CharacterPreview
              character={character}
              characterId={savedId}
              onPortraitGenerated={async (url) => {
                dispatch({ type: "UPDATE_CHARACTER", payload: { portraitUrl: url } });
                // Auto-save portrait URL to DB if character is already saved
                if (savedId) {
                  await fetch("/api/characters", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: savedId,
                      name: character.name,
                      race: character.race,
                      class: character.class,
                      level: character.level,
                      abilityScores: character.abilityScores,
                      hitPoints: character.hitPoints,
                      proficiencies: character.proficiencies,
                      equipment: character.equipment,
                      background: character.background,
                      backstory: character.backstory,
                      appearance: character.appearance,
                      edition: character.edition,
                      portraitUrl: url,
                      chatHistory: messages.map((m) => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                      })),
                    }),
                  });
                }
              }}
            />
          </div>

          {/* Character Sheet */}
          <div className="flex-1 min-h-0">
            <CharacterSheet
              character={character}
              onSave={handleSaveClick}
              onPrint={handlePrintClick}
              saving={saving}
            />
          </div>
        </div>

        {/* Mobile bottom sheet — full screen character sheet */}
        <MobileBottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
          <div className="flex flex-col h-full">
            <CharacterSheet
              character={character}
              onSave={handleSaveClick}
              onPrint={handlePrintClick}
              saving={saving}
              allOpen
              onClose={() => setSheetOpen(false)}
            />
          </div>
        </MobileBottomSheet>

        {/* Modals */}
        <SaveModal
          open={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          onSaved={async (email) => {
            onSignedIn(email);
            setSaveModalOpen(false);
            // After signing in, save immediately
            await handleSave();
          }}
          characterToSave={character as unknown as Record<string, unknown>}
        />
        <PrintModal
          open={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          onPrint={handlePrintModalDone}
        />
      </div>

      {/* Print-only character sheet (desktop) */}
      <PrintSheet character={character} />

      {/* Mobile print view */}
      {mobilePrintOpen && (
        <PrintSheet
          character={character}
          inline
          onClose={() => setMobilePrintOpen(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
          <div className="flex items-center gap-2 px-5 py-3 bg-[#2C1810] border border-[#8B6914] shadow-lg">
            <span className="text-[#C9A962] text-sm">✓</span>
            <span className="font-[family-name:var(--font-barlow)] text-[14px] font-medium text-[#E8DCC8]">
              {toast}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
