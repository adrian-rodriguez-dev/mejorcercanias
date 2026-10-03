import { networks } from "./data/networks";
import type { CSSProperties } from "react";
export function LineBar({
  networkId,
  value,
  available,
  onChange,
}: {
  networkId?: string;
  value: string[];
  available: string[];
  onChange: (lines: string[]) => void;
}) {
  if (available.length < 2) return null;
  return (
    <div
      className="line-bar"
      role="group"
      aria-label="Filtrar por líneas. Ninguna marcada muestra todas."
    >
      {available.map((line) => {
        const active = value.includes(line);
        return (
          <button
            key={line}
            style={
              {
                "--line-color":
                  "#" +
                  (networks().find((n) => n.id === networkId)?.colors[line] ??
                    "789B88"),
              } as CSSProperties
            }
            className={`toggle-${line.toLowerCase()}`}
            type="button"
            aria-pressed={active}
            title="Marca una o varias líneas. Ninguna marcada muestra todas."
            aria-label={line}
            onClick={() =>
              onChange(
                active ? value.filter((l) => l !== line) : [...value, line],
              )
            }
          >
            {line}
            <span className="line-selected" aria-hidden="true">
              {active ? "✓" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
