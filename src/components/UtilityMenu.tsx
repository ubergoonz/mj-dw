import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UTILITIES } from "../lib/utilities";

export default function UtilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="utility-menu" ref={containerRef}>
      <button
        className="icon-button utility-menu-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="打开工具菜单"
        title="Utilities"
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5 5h4v4H5V5Zm5 0h4v4h-4V5Zm5 0h4v4h-4V5ZM5 10h4v4H5v-4Zm5 0h4v4h-4v-4Zm5 0h4v4h-4v-4ZM5 15h4v4H5v-4Zm5 0h4v4h-4v-4Zm5 0h4v4h-4v-4Z" />
        </svg>
      </button>

      {isOpen && (
        <ul className="utility-menu-list" role="menu">
          {UTILITIES.map((utility) => {
            const isActive = !utility.external && location.pathname === utility.path;

            if (utility.external) {
              return (
                <li key={utility.path} role="none">
                  <a
                    role="menuitem"
                    className="utility-menu-item"
                    href={utility.path}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="utility-menu-glyph" aria-hidden="true">{utility.glyph}</span>
                    <strong>{utility.label}</strong>
                    <small>{utility.description}</small>
                  </a>
                </li>
              );
            }

            return (
              <li key={utility.path} role="none">
                <Link
                  role="menuitem"
                  className={`utility-menu-item${isActive ? " is-active" : ""}`}
                  to={utility.path}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="utility-menu-glyph" aria-hidden="true">{utility.glyph}</span>
                  <strong>{utility.label}</strong>
                  <small>{utility.description}</small>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
