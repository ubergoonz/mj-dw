/**
 * Safe wrappers around `localStorage`. Every call is guarded so private-mode
 * browsers, quota errors, or corrupt JSON never break a page; callers simply
 * fall back to defaults.
 */

const KEY_PREFIX = "mj-dw:";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function resolveStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function storageKey(key: string): string {
  return key.startsWith(KEY_PREFIX) ? key : `${KEY_PREFIX}${key}`;
}

/**
 * Read a JSON value. `validate` lets the caller reject stale/incompatible
 * shapes (returning `null`) so a previous version's data cannot crash a page.
 */
export function readStorage<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
  storage?: StorageLike,
): T {
  const target = resolveStorage(storage);
  if (!target) return fallback;

  try {
    const raw = target.getItem(storageKey(key));
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate) return validate(parsed) ? parsed : fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T, storage?: StorageLike): boolean {
  const target = resolveStorage(storage);
  if (!target) return false;

  try {
    target.setItem(storageKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key: string, storage?: StorageLike): void {
  const target = resolveStorage(storage);
  if (!target) return;

  try {
    target.removeItem(storageKey(key));
  } catch {
    // Ignore: nothing useful can be done if storage is unavailable.
  }
}

/** Type-guard helpers for `readStorage` validators. */
export const is = {
  number: (value: unknown): value is number => typeof value === "number" && Number.isFinite(value),
  string: (value: unknown): value is string => typeof value === "string",
  boolean: (value: unknown): value is boolean => typeof value === "boolean",
  record: (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value),
  arrayOf:
    <T>(item: (value: unknown) => value is T) =>
    (value: unknown): value is T[] =>
      Array.isArray(value) && value.every(item),
  oneOf:
    <T extends string | number>(options: readonly T[]) =>
    (value: unknown): value is T =>
      options.includes(value as T),
};
