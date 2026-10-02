export function LineBar({
  value,
  available,
  onChange,
}: {
  value: string;
  available: string[];
  onChange: (line: string) => void;
}) {
  return (
    <div className="line-bar" role="group" aria-label="Filtrar por línea">
      {["", "C1", "C2", "C3"].map((line) => {
        const unavailable = Boolean(line && !available.includes(line));
        return (
          <button
            key={line}
            type="button"
            aria-pressed={value === line}
            disabled={unavailable}
            title={
              unavailable ? `${line}: no pasa por esta estación` : undefined
            }
            aria-label={
              unavailable
                ? `${line}: no pasa por esta estación`
                : line || "Todas"
            }
            onClick={() => onChange(line)}
          >
            <span
              className={line ? `line line-${line.toLowerCase()}` : "all-lines"}
            >
              {line || "Todas"}
            </span>
            <span className="line-selected" aria-hidden="true">
              {value === line ? "✓" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
