/** Short vibration on supporting devices; silently ignored elsewhere. */
export function vibrate(pattern: number | number[] = 20): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    // Some browsers throw when vibration is blocked by policy; never surface this.
  }
}
