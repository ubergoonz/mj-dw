import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { UTILITIES } from "../lib/utilities";

const APP_NAME = "雀起 · 麻将都Win";

/**
 * Keeps the tab / home-screen title in sync with the active tool and resets
 * scroll on navigation. Hash-router pages are long, so a new tool should
 * always open at the top.
 */
export default function RouteChrome() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const utility = UTILITIES.find((entry) => !entry.external && entry.path === pathname);
    if (pathname === "/") document.title = APP_NAME;
    else if (utility) document.title = `${utility.label} · ${APP_NAME}`;
    else document.title = `找不到頁面 · ${APP_NAME}`;
  }, [pathname]);

  return null;
}
