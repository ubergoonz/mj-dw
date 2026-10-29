import { describe, expect, it } from "vitest";
import { is, readStorage, removeStorage, storageKey, writeStorage } from "./storage";

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    dump: () => Object.fromEntries(map),
  };
}

function throwingStorage() {
  return {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("quota");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
}

describe("storage", () => {
  it("namespaces keys without double-prefixing", () => {
    expect(storageKey("foo")).toBe("mj-dw:foo");
    expect(storageKey("mj-dw:foo")).toBe("mj-dw:foo");
  });

  it("round-trips JSON values", () => {
    const store = memoryStorage();
    expect(writeStorage("k", { a: 1, b: [true, "x"] }, store)).toBe(true);
    expect(readStorage("k", null, undefined, store)).toEqual({ a: 1, b: [true, "x"] });
    expect(store.dump()).toEqual({ "mj-dw:k": '{"a":1,"b":[true,"x"]}' });
  });

  it("returns the fallback when the key is missing", () => {
    expect(readStorage("missing", 42, undefined, memoryStorage())).toBe(42);
  });

  it("returns the fallback for corrupt JSON instead of throwing", () => {
    const store = memoryStorage({ "mj-dw:k": "{not json" });
    expect(readStorage("k", "fallback", undefined, store)).toBe("fallback");
  });

  it("rejects values that fail validation", () => {
    const store = memoryStorage({ "mj-dw:k": '"a string"' });
    expect(readStorage("k", 0, is.number, store)).toBe(0);
    expect(readStorage("k", "", is.string, store)).toBe("a string");
  });

  it("never throws when storage itself is broken", () => {
    const store = throwingStorage();
    expect(readStorage("k", "fallback", undefined, store)).toBe("fallback");
    expect(writeStorage("k", 1, store)).toBe(false);
    expect(() => removeStorage("k", store)).not.toThrow();
  });

  it("removes keys", () => {
    const store = memoryStorage({ "mj-dw:k": "1" });
    removeStorage("k", store);
    expect(store.dump()).toEqual({});
  });
});

describe("storage validators", () => {
  it("is.number rejects NaN and Infinity", () => {
    expect(is.number(1)).toBe(true);
    expect(is.number(Number.NaN)).toBe(false);
    expect(is.number(Number.POSITIVE_INFINITY)).toBe(false);
    expect(is.number("1")).toBe(false);
  });

  it("is.record rejects arrays and null", () => {
    expect(is.record({})).toBe(true);
    expect(is.record([])).toBe(false);
    expect(is.record(null)).toBe(false);
  });

  it("is.arrayOf checks every element", () => {
    const strings = is.arrayOf(is.string);
    expect(strings(["a", "b"])).toBe(true);
    expect(strings(["a", 1])).toBe(false);
    expect(strings("a")).toBe(false);
  });

  it("is.oneOf restricts to the option list", () => {
    const seat = is.oneOf(["東", "南"] as const);
    expect(seat("東")).toBe(true);
    expect(seat("西")).toBe(false);
  });
});
