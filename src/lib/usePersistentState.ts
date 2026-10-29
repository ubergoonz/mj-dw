import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { readStorage, writeStorage } from "./storage";

/**
 * `useState` that survives reloads, screen locks and accidental tab closes.
 * Reads once on mount and writes on every change. A `validate` guard protects
 * against stale data written by an older build.
 */
export function usePersistentState<T>(
  key: string,
  initial: T | (() => T),
  validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === "function" ? (initial as () => T)() : initial;
    return readStorage(key, fallback, validate);
  });

  const isFirstRender = useRef(true);
  useEffect(() => {
    // Skip the mount write: it would only echo back what was just read.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
