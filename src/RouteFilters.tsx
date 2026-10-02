import { useRef, type ReactNode } from "react";
import { stations, stationName } from "./data/stations";
import {
  changeLine,
  routeDestinations,
  type RouteFilter,
} from "./data/route-filters";
import type { Departure } from "./data/types";

export function RouteFilters({
  rows,
  value,
  onChange,
  onClear,
  extraSummary,
  children,
  disabled = false,
  showDestination = true,
}: {
  rows: Departure[];
  value: RouteFilter;
  onChange: (value: RouteFilter) => void;
  onClear: () => void;
  extraSummary?: string;
  children?: ReactNode;
  disabled?: boolean;
  showDestination?: boolean;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  const lines = [...new Set(rows.map((row) => row.line))].sort();
  const ids = routeDestinations(rows, value.line);
  const destinations = stations.filter((station) => ids.includes(station.id));
  const text = [
    value.line || "Todas las líneas",
    showDestination
      ? value.destination
        ? stationName(value.destination)
        : "Todos los destinos"
      : undefined,
    extraSummary,
  ]
    .filter(Boolean)
    .join(" · ");
  const active = Boolean(value.line || value.destination || extraSummary);
  const close = () => {
    if (details.current) details.current.open = false;
    summary.current?.focus();
  };
  return (
    <details
      className={`route-filters${active ? " is-active" : ""}`}
      ref={details}
    >
      <summary ref={summary} aria-label={`Filtros: ${text}`}>
        <span className="filter-icon" aria-hidden="true">
          ☷
        </span>
        <span className="route-filter-summary" title={text}>
          {text}
        </span>
        <span className="filter-chevron" aria-hidden="true">
          ⌄
        </span>
      </summary>
      <div className="route-filter-body">
        <div className="route-selectors">
          <label>
            Línea
            <select
              value={value.line}
              disabled={disabled}
              onChange={(e) =>
                onChange(changeLine(rows, value, e.target.value))
              }
            >
              <option value="">Todas las líneas</option>
              {value.line && !lines.includes(value.line) && (
                <option value={value.line}>{value.line}</option>
              )}
              {lines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </label>
          {showDestination && (
            <label>
              Destino directo
              <select
                value={value.destination}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...value, destination: e.target.value })
                }
              >
                <option value="">Todos los destinos</option>
                {value.destination && !ids.includes(value.destination) && (
                  <option value={value.destination}>
                    {stationName(value.destination)}
                  </option>
                )}
                {destinations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {children}
        <div className="route-filter-actions">
          <button type="button" onClick={onClear}>
            Quitar filtros
          </button>
          <button type="button" className="apply-route-filters" onClick={close}>
            Ver trenes
          </button>
        </div>
      </div>
    </details>
  );
}
