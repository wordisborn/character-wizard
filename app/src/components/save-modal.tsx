"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

interface SaveModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (email: string) => void;
  characterToSave?: Record<string, unknown>;
}

export function SaveModal({ open, onClose, onSaved, characterToSave }: SaveModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (open) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUser({ email: data.user.email ?? undefined });
        }
      });
    }
  }, [open]);

  if (!open) return null;

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    // Stash character data before redirect so we can restore it after OAuth
    if (characterToSave) {
      sessionStorage.setItem("wizard_pending_save", JSON.stringify(characterToSave));
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?action=save`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    // Stash character data before redirect
    if (characterToSave) {
      sessionStorage.setItem("wizard_pending_save", JSON.stringify(characterToSave));
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?action=save`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2C1810]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-[420px] bg-[#EDE3D1] border border-[#B8A88A] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#B8A88A]">
          <h2 className="font-[family-name:var(--font-cormorant)] text-[20px] font-bold text-[#2C1810]">
            Save Your Character
          </h2>
          <button
            onClick={onClose}
            className="text-[#8B7355] hover:text-[#2C1810] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {user ? (
            <div className="text-center py-4">
              <span className="text-[#8B6914] text-3xl">✓</span>
              <p className="mt-3 font-[family-name:var(--font-cormorant)] text-[16px] text-[#2C1810]">
                Signed in as {user.email}
              </p>
              <button
                onClick={() => onSaved(user.email || "")}
                className="mt-4 w-full h-10 bg-[#8B6914] font-[family-name:var(--font-barlow)] text-[14px] font-semibold text-[#F2E8D5] hover:bg-[#7A5B10] transition-colors"
              >
                Save Character
              </button>
            </div>
          ) : emailSent ? (
            <div className="text-center py-4">
              <span className="text-[#8B6914] text-3xl">✉</span>
              <p className="mt-3 font-[family-name:var(--font-cormorant)] text-[16px] text-[#2C1810]">
                Check your email for a magic link to sign in and save your
                character.
              </p>
            </div>
          ) : (
            <>
              <p className="font-[family-name:var(--font-source-serif)] text-[14px] text-[#5C4A32] mb-5">
                Sign in to save your character to the cloud so you can continue
                later.
              </p>

              {/* Google button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full h-11 bg-white border border-[#C4B89A] hover:bg-[#F5EDE0] transition-colors disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="font-[family-name:var(--font-barlow)] text-[14px] font-medium text-[#2C1810]">
                  Continue with Google
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#C4B89A]" />
                <span className="font-[family-name:var(--font-barlow)] text-[12px] text-[#8B7355]">
                  or
                </span>
                <div className="flex-1 h-px bg-[#C4B89A]" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-10 px-3 bg-[#F5EDE0] border border-[#C4B89A] font-[family-name:var(--font-source-serif)] text-[14px] text-[#2C1810] placeholder:text-[#8B7355] placeholder:italic focus:outline-none focus:border-[#8B6914]"
                />
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full h-10 bg-[#8B6914] font-[family-name:var(--font-barlow)] text-[14px] font-semibold text-[#F2E8D5] hover:bg-[#7A5B10] transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Sign in with Email"}
                </button>
              </form>

              {error && (
                <p className="mt-3 font-[family-name:var(--font-source-serif)] text-[13px] text-red-700">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
