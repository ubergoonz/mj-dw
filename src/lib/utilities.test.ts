import { describe, expect, it } from "vitest";
import changelog from "../../CHANGELOG.md?raw";
import pkg from "../../package.json";
import { UTILITIES, VERSIONED_UTILITIES } from "./utilities";
import { isSemVer, versionForPath } from "./version";

describe("versioning standard", () => {
  it("every tool page carries a SemVer version", () => {
    const tools = UTILITIES.filter((u) => !u.external && u.path !== "/");
    expect(tools.length).toBeGreaterThan(0);
    for (const tool of tools) {
      expect(tool.version, `${tool.label} is missing a version`).toBeDefined();
      expect(isSemVer(tool.version!), `${tool.label} version "${tool.version}" is not SemVer`).toBe(true);
    }
  });

  it("home and external entries do not carry a tool version", () => {
    for (const entry of UTILITIES.filter((u) => u.external || u.path === "/")) {
      expect(entry.version).toBeUndefined();
    }
  });

  it("the app version in package.json is SemVer", () => {
    expect(isSemVer(pkg.version)).toBe(true);
    expect(pkg.version).not.toBe("0.0.0");
  });

  it("every current tool version has a CHANGELOG heading", () => {
    for (const tool of VERSIONED_UTILITIES) {
      const heading = `#### ${tool.label} v${tool.version}`;
      expect(changelog, `CHANGELOG.md is missing "${heading}"`).toContain(heading);
    }
  });

  it("the app version has a CHANGELOG release heading", () => {
    expect(changelog).toMatch(new RegExp(`^## \\[${pkg.version.replace(/\./g, "\\.")}\\] - \\d{4}-\\d{2}-\\d{2}$`, "m"));
  });

  it("resolves the tool version for tool routes and the app version elsewhere", () => {
    expect(versionForPath("/fan-payout")).toMatchObject({ subject: "台數計算", isApp: false });
    expect(versionForPath("/")).toMatchObject({ isApp: true });
    expect(versionForPath("/does-not-exist")).toMatchObject({ isApp: true });
  });

  it("accepts and rejects SemVer strings correctly", () => {
    expect(isSemVer("1.0.0")).toBe(true);
    expect(isSemVer("1.2.3-beta.1")).toBe(true);
    expect(isSemVer("01.0.0")).toBe(false);
    expect(isSemVer("1.0")).toBe(false);
    expect(isSemVer("v1.0.0")).toBe(false);
  });
});
