import { useEffect, useRef, useState } from "react";
import { canShare, copyText, shareText } from "../lib/clipboard";

interface CopyActionsProps {
  text: string;
  /** Title passed to the native share sheet. */
  shareTitle?: string;
  copyLabel?: string;
  disabled?: boolean;
}

type Feedback = { tone: "ok" | "error"; message: string } | null;

const FEEDBACK_MS = 2200;

/**
 * Copy button with a native-share companion on supporting devices. Feedback is
 * announced to assistive tech and clears itself so stale "Copied" never lingers.
 */
export default function CopyActions({ text, shareTitle, copyLabel = "Copy", disabled = false }: CopyActionsProps) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const timerRef = useRef<number | null>(null);
  const showShare = canShare();

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function announce(next: Feedback) {
    setFeedback(next);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    if (next) timerRef.current = window.setTimeout(() => setFeedback(null), FEEDBACK_MS);
  }

  async function handleCopy() {
    const outcome = await copyText(text);
    announce(
      outcome === "copied"
        ? { tone: "ok", message: "Copied ✓" }
        : { tone: "error", message: "Copy blocked — long-press the text to copy manually." },
    );
  }

  async function handleShare() {
    const outcome = await shareText(text, shareTitle);
    if (outcome === "shared") announce({ tone: "ok", message: "Shared ✓" });
    else if (outcome === "failed") announce({ tone: "error", message: "Share failed — try Copy instead." });
  }

  return (
    <div className="copy-actions">
      <div className="copy-actions-buttons">
        <button className="utility-action" type="button" onClick={handleCopy} disabled={disabled}>
          {copyLabel}
        </button>
        {showShare && (
          <button className="utility-action utility-action-secondary" type="button" onClick={handleShare} disabled={disabled}>
            Share
          </button>
        )}
      </div>
      <small
        className={`copy-feedback${feedback ? ` is-${feedback.tone}` : ""}`}
        role="status"
        aria-live="polite"
      >
        {feedback?.message ?? ""}
      </small>
    </div>
  );
}
