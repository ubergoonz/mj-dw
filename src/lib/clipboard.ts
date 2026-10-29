/**
 * Copy / share helpers that degrade gracefully. The async Clipboard API is
 * unavailable on plain-HTTP origins, some in-app browsers, and older iOS, so a
 * hidden-textarea `execCommand` fallback is attempted before giving up.
 */

export type CopyOutcome = "copied" | "failed";

export async function copyText(text: string): Promise<CopyOutcome> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      // Fall through to the legacy path.
    }
  }

  return legacyCopy(text) ? "copied" : "failed";
}

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export function canShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export type ShareOutcome = "shared" | "cancelled" | "unsupported" | "failed";

/** Opens the native share sheet (mobile) when available. */
export async function shareText(text: string, title?: string): Promise<ShareOutcome> {
  if (!canShare()) return "unsupported";

  try {
    await navigator.share({ text, title });
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    return "failed";
  }
}
