import { useLocation } from "react-router-dom";
import { formatBuildInfo, versionForPath } from "../lib/version";

/**
 * Small version pill for page headers. Shows the current tool's version, or the
 * app version on Home. The tooltip always carries the full app build identity.
 */
export default function VersionBadge() {
  const { pathname } = useLocation();
  const info = versionForPath(pathname);
  const label = info.isApp ? `App version ${info.version}` : `${info.subject} version ${info.version}`;

  return (
    <span
      className={`version-badge${info.isApp ? " version-badge-app" : ""}`}
      title={info.isApp ? formatBuildInfo() : `${info.subject} v${info.version} · ${formatBuildInfo()}`}
      aria-label={label}
    >
      v{info.version}
    </span>
  );
}
