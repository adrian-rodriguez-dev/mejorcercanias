export function LineBar({
  value,
  available,
  onChange,
}: {
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
