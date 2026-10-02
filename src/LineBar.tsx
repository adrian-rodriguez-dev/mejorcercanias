export function LineBar({
  value,
  available,
  onChange,
}: {
  value: string[];
  available: string[];
  onChange: (lines: string[]) => void;
}) {
  return (
    <div
      className="line-bar"
      role="group"
      aria-label="Filtrar por líneas. Ninguna marcada muestra todas."
    >
      {["C1", "C2", "C3"].map((line) => {
        const active = value.includes(line),
          unavailable = !available.includes(line);
        return (
          <button
            key={line}
            className={`toggle-${line.toLowerCase()}`}
            type="button"
            aria-pressed={active}
            disabled={unavailable && !active}
            title={
              unavailable
                ? `${line}: no pasa por esta estación`
                : "Marca una o varias líneas. Ninguna marcada muestra todas."
            }
            aria-label={
              unavailable ? `${line}: no pasa por esta estación` : line
            }
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
