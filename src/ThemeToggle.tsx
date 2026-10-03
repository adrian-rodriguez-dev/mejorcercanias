import { useLayoutEffect, useState } from "react";
const KEY = "mejorcercanias.theme.v1";
export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "dark";
    } catch {
      return false;
    }
  });
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#101917" : "#f5f5ee");
  }, [dark]);
  const label = dark ? "Activar modo claro" : "Activar modo oscuro";
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        const next = !dark;
        setDark(next);
        try {
          localStorage.setItem(KEY, next ? "dark" : "light");
        } catch {
          /* Theme still works for this visit. */
        }
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </>
        ) : (
          <path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" />
        )}
      </svg>
    </button>
  );
}
