"use client";

import { useState } from "react";
import { Share2, Check } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  ogUrl?: string;
  displayTag?: string;
  className?: string;
}

export function ShareButton({ title, text, url, ogUrl, displayTag, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user cancelled or share API threw — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { void handleShare(); }}
        className={cn("font-display text-xs tracking-widest uppercase gap-1", className)}
        style={{ color: "var(--cyan-accent)" }}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            COPIED
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            SHARE
          </>
        )}
      </Button>
      {ogUrl && (
        <a
          href={ogUrl}
          download={`owmmr-${displayTag ?? "profile"}.png`}
          className="inline-flex items-center gap-1 px-2 py-1 rounded font-display text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
          style={{ color: "var(--text-secondary)", textDecoration: "none" }}
        >
          PNG
        </a>
      )}
    </div>
  );
}
