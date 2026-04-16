"use client";

import { useState } from "react";

interface ShareButtonProps {
  /** Text shown on the button */
  label?: string;
  /** Title passed to the share sheet */
  title?: string;
  /** Body text passed to the share sheet */
  text?: string;
  /** Optional URL — defaults to current page */
  url?: string;
  /** Tailwind class additions */
  className?: string;
}

export function ShareButton({
  label = "Share",
  title = "Athens Biscuit",
  text = "Check out the Athens Biscuit leaderboard!",
  url,
  className = "",
}: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  const handleShare = async () => {
    const shareUrl =
      url ?? (typeof window !== "undefined" ? window.location.href : "");

    // Prefer native share sheet (mobile + some desktop browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (err) {
        // User cancelled, or share failed — fall through to clipboard
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      // Last resort: select a prompt
      window.prompt("Copy this link:", shareUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50 ${className}`}
    >
      {status === "copied" ? (
        <>
          <span aria-hidden>✓</span>
          <span>Link copied!</span>
        </>
      ) : (
        <>
          <span aria-hidden>🔗</span>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
