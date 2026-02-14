"use client";

import { useState } from "react";

interface PrintModalProps {
  open: boolean;
  onClose: () => void;
  onPrint: (email: string) => void;
}

export function PrintModal({ open, onClose, onPrint }: PrintModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Close modal first, then trigger print after a brief delay
    // so the modal is gone when the print dialog opens
    onPrint(email.trim());
    setLoading(false);
  }

  function handleSkip() {
    onPrint("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center screen-only">
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
            Print Character Sheet
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
          <p className="font-[family-name:var(--font-source-serif)] text-[14px] text-[#5C4A32] mb-5">
            Get a beautifully formatted character sheet. Enter your email to also
            receive a PDF copy and updates about new features.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email (optional)"
              className="w-full h-10 px-3 bg-[#F5EDE0] border border-[#C4B89A] font-[family-name:var(--font-source-serif)] text-[14px] text-[#2C1810] placeholder:text-[#8B7355] placeholder:italic focus:outline-none focus:border-[#8B6914]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#8B6914] font-[family-name:var(--font-barlow)] text-[14px] font-semibold text-[#F2E8D5] hover:bg-[#7A5B10] transition-colors disabled:opacity-50"
            >
              {loading ? "Preparing..." : "Print Character Sheet"}
            </button>
          </form>

          <button
            onClick={handleSkip}
            className="mt-3 w-full text-center font-[family-name:var(--font-barlow)] text-[13px] text-[#8B7355] hover:text-[#2C1810] transition-colors"
          >
            Skip and print without email
          </button>
        </div>
      </div>
    </div>
  );
}
