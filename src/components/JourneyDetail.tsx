import type { Departure } from "../data/types";
import { clockTime } from "../data/time";
export function JourneyDetail({ departure }: { departure: Departure }) {
  const legs = departure.journey;
  if (!legs) return null;
  const count = legs.length - 1;
  if (!count) return null;
  return (
    <details className="journey-detail">
      <summary>
        <span className="journey-toggle" aria-hidden="true">
          +
        </span>{" "}
        {count} {count === 1 ? "transbordo" : "transbordos"}
        {departure.directSavingMinutes !== undefined &&
          ` · llega ${departure.directSavingMinutes} min antes que el directo`}
      </summary>
      <ol>
        {legs.map((leg, i) => (
          <li key={`${leg.tripId}-${i}`}>
            {leg.change && (
              <p>
                {leg.change.from !== leg.change.to
                  ? `A pie: ${leg.change.fromName} → ${leg.change.toName}`
                  : `Cambio en ${leg.fromName}`}{" "}
                · {Math.round((leg.departure - legs[i - 1].arrival) / 60)} min
                disponibles
                {leg.change.estimated
                  ? ` · margen estimado ${leg.change.seconds / 60} min`
                  : ""}
              </p>
            )}
            <p>
              <b>{leg.line}</b>
              {leg.mode === "bus" ? " · Autobús" : ""} · {leg.fromName}{" "}
              {clockTime(leg.departure * 1000)} → {leg.toName}{" "}
              {clockTime(leg.arrival * 1000)}
            </p>
          </li>
        ))}
      </ol>
    </details>
  );
}
