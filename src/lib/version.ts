import { UTILITIES } from "./utilities";

/** App-level version and build identity, injected at build time (see vite.config.ts). */
export const APP_VERSION: string = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "0.0.0";
export const BUILD_SHA: string = typeof __BUILD_SHA__ === "string" ? __BUILD_SHA__ : "dev";
export const BUILD_DATE: string = typeof __BUILD_DATE__ === "string" ? __BUILD_DATE__ : "";

/** Strict SemVer 2.0.0 (no build metadata), e.g. 1.2.3 or 1.2.3-beta.1. */
export const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?$/;

export function isSemVer(value: string): boolean {
  return SEMVER_PATTERN.test(value);
}

export interface VersionInfo {
  /** Human label of what the version belongs to, e.g. a tool name or the app. */
  subject: string;
  version: string;
  /** True when this is the app-level version rather than a tool's. */
  isApp: boolean;
}

/** Resolves which version to show for a route: the tool's, or the app's on Home / unknown routes. */
export function versionForPath(pathname: string): VersionInfo {
  const utility = UTILITIES.find((entry) => !entry.external && entry.path === pathname);
  if (utility?.version) return { subject: utility.label, version: utility.version, isApp: false };
  return { subject: "麻将都Win", version: APP_VERSION, isApp: true };
}

export function formatBuildInfo(): string {
  const date = BUILD_DATE ? ` · ${BUILD_DATE}` : "";
  return `App v${APP_VERSION} · build ${BUILD_SHA}${date}`;
}
