import { afterEach, describe, expect, it, vi } from "vitest";
import { canShare, copyText, shareText } from "./clipboard";

const originalNavigator = globalThis.navigator;
const originalDocument = globalThis.document;

function setNavigator(value: unknown) {
  Object.defineProperty(globalThis, "navigator", { value, configurable: true, writable: true });
}

function setDocument(value: unknown) {
  Object.defineProperty(globalThis, "document", { value, configurable: true, writable: true });
}

afterEach(() => {
  setNavigator(originalNavigator);
  setDocument(originalDocument);
});

describe("copyText", () => {
  it("uses the async clipboard when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigator({ clipboard: { writeText } });
    await expect(copyText("hello")).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to execCommand when the async clipboard rejects", async () => {
    setNavigator({ clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    const textarea = {
      value: "",
      style: {} as Record<string, string>,
      setAttribute: vi.fn(),
      focus: vi.fn(),
      select: vi.fn(),
      setSelectionRange: vi.fn(),
    };
    const execCommand = vi.fn().mockReturnValue(true);
    setDocument({
      createElement: () => textarea,
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
      execCommand,
    });

    await expect(copyText("fallback")).resolves.toBe("copied");
    expect(textarea.value).toBe("fallback");
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("reports failure instead of throwing when nothing works", async () => {
    setNavigator({});
    setDocument(undefined);
    await expect(copyText("x")).resolves.toBe("failed");
  });
});

describe("shareText", () => {
  it("reports unsupported when navigator.share is absent", async () => {
    setNavigator({});
    expect(canShare()).toBe(false);
    await expect(shareText("x")).resolves.toBe("unsupported");
  });

  it("distinguishes user cancellation from failure", async () => {
    const abort = new DOMException("cancelled", "AbortError");
    setNavigator({ share: vi.fn().mockRejectedValue(abort) });
    await expect(shareText("x")).resolves.toBe("cancelled");

    setNavigator({ share: vi.fn().mockRejectedValue(new Error("boom")) });
    await expect(shareText("x")).resolves.toBe("failed");

    setNavigator({ share: vi.fn().mockResolvedValue(undefined) });
    await expect(shareText("x", "title")).resolves.toBe("shared");
  });
});
