"use client";

import { createClient } from "@/lib/supabase-browser";

interface WelcomeScreenProps {
  onStart: () => void;
  hasAccount?: boolean;
  onViewCharacters?: () => void;
}

export function WelcomeScreen({ onStart, hasAccount, onViewCharacters }: WelcomeScreenProps) {
  function handleSignIn() {
    const supabase = createClient();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }
  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden bg-[#1a1208]">
      {/* Tavern background image */}
      <img
        src="/tavern-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark radial overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 120% at 50% 50%, rgba(26,18,8,0.3) 0%, rgba(10,6,4,0.8) 70%, rgba(10,6,4,0.93) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-8 max-w-[600px]">
        {/* Wand icon */}
        <span className="text-[#C9A962] text-2xl md:text-3xl mb-4 md:mb-6 opacity-80">✦</span>

        {/* Title */}
        <h1 className="font-[family-name:var(--font-cormorant)] text-[38px] md:text-[56px] font-bold text-[#E8DCC8] leading-tight mb-2 md:mb-3">
          The Character Wizard
        </h1>

        {/* Subtitle */}
        <p className="font-[family-name:var(--font-source-serif)] text-[16px] md:text-[20px] italic text-[#B8A88A] mb-5 md:mb-7">
          Your guide through the realms of character creation
        </p>

        {/* Description */}
        <p className="hidden md:block font-[family-name:var(--font-source-serif)] text-[16px] text-[#8B7355] leading-[1.7] mb-10 max-w-[480px]">
          Whether you are a seasoned adventurer or rolling your first d20, the
          Wizard will walk you through every step of creating a character — from
          choosing your race and class to forging your backstory. Watch your hero
          come to life as you go.
        </p>
        <p className="md:hidden font-[family-name:var(--font-source-serif)] text-[14px] text-[#8B7355] leading-[1.7] mb-8 max-w-[320px]">
          Whether you are a seasoned adventurer or rolling your first d20, the
          Wizard will walk you through every step of creating a character.
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="group flex items-center gap-2.5 px-10 py-4 bg-[#C9A962] hover:bg-[#D4B56E] transition-all duration-300 shadow-[0_4px_24px_rgba(201,169,98,0.25)]"
        >
          <span className="text-[#1A1208]">📜</span>
          <span className="font-[family-name:var(--font-cormorant)] text-[18px] font-bold text-[#1A1208]">
            Begin Your Adventure
          </span>
        </button>

        {/* Edition badge */}
        <div className="flex items-center gap-1.5 mt-7 px-3.5 py-1.5 border border-[#C9A96240]">
          <span className="text-[#8B7355] text-xs">🎲</span>
          <span className="font-[family-name:var(--font-barlow)] text-[11px] font-semibold text-[#8B7355] tracking-[1px]">
            Supports D&D 5th Edition
          </span>
        </div>

        {/* Footer */}
        {hasAccount && onViewCharacters ? (
          <button
            onClick={onViewCharacters}
            className="mt-8 font-[family-name:var(--font-source-serif)] text-[13px] text-[#C9A962] hover:text-[#D4B56E] transition-colors"
          >
            View Your Saved Characters →
          </button>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-2">
            <button
              onClick={handleSignIn}
              className="font-[family-name:var(--font-source-serif)] text-[13px] text-[#C9A962] hover:text-[#D4B56E] transition-colors"
            >
              Sign in to access saved characters →
            </button>
            <p className="font-[family-name:var(--font-source-serif)] text-[12px] italic text-[#5C403380]">
              Or start without an account
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
