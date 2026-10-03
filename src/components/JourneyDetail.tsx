import type { Departure } from "../data/types";
import type { CSSProperties } from "react";
import { lineStyle } from "../data/networks";
import { arrivalDayLabel } from "../data/arrival";
import { clockTime } from "../data/time";
export function JourneyDetail({
  departure,
  networkId = "",
}: {
  departure: Departure;
  networkId?: string;
}) {
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
      <ol className="journey-timeline" aria-label="Tramos del trayecto">
        {legs.map((leg, i) => {
          const color = lineStyle(networkId, leg.line);
          const time = (seconds: number, label: string) => {
            const iso = new Date(seconds * 1000).toISOString();
            const day = arrivalDayLabel(departure.scheduledAt, iso);
            return (
              <span className="journey-clock">
                <time
                  dateTime={iso}
                  aria-label={`${label} ${clockTime(seconds * 1000)}${day ? ` ${day}` : ""}`}
                >
                  {clockTime(seconds * 1000)}
                </time>
                {day && <small>{day}</small>}
              </span>
            );
          };
          return (
            <li
              className="journey-leg"
              key={`${leg.tripId}-${i}`}
              style={
                { "--journey-color": color.backgroundColor } as CSSProperties
              }
            >
              {leg.change && (
                <div className="journey-change">
                  <b>
                    {leg.change.from !== leg.change.to
                      ? "Transbordo a pie"
                      : "Espera"}{" "}
                    · {Math.round((leg.departure - legs[i - 1].arrival) / 60)}{" "}
                    min
                  </b>
                  {leg.change.from !== leg.change.to && (
                    <small>
                      A pie: {leg.change.fromName} → {leg.change.toName}
                    </small>
                  )}
                  {leg.change.estimated && (
                    <small>
                      Margen estimado: {leg.change.seconds / 60} min
                    </small>
                  )}
                </div>
              )}
              <div className="journey-segment">
                <div className="journey-stop">
                  {time(leg.departure, "Salida")}
                  <b>{leg.fromName}</b>
                </div>
                <div className="journey-service">
                  <span className="journey-line" style={color}>
                    {leg.line}
                    {leg.mode === "bus" ? " · Autobús" : ""}
                  </span>
                </div>
                <div className="journey-stop">
                  {time(leg.arrival, "Llegada")}
                  <b>{leg.toName}</b>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
