"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
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
  );
}
