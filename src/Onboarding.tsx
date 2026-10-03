import { useEffect, useRef, useState } from "react";
import { networks } from "./data/networks";
import { stations } from "./data/stations";
export function Onboarding({
  onComplete,
  onCancel,
}: {
  onComplete: (network: string, origin: string, destination: string) => void;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState(0),
    [network, setNetwork] = useState(""),
    [origin, setOrigin] = useState(""),
    [destination, setDestination] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => title.current?.focus(), [step]);
  const options = stations.filter((s) => s.network === network);
  return (
    <section className="onboarding board" aria-label="Configura tu trayecto">
      <small>Paso {step + 1} de 3</small>
      <h1 ref={title} tabIndex={-1}>
        {
          [
            "Elige tu núcleo",
            "¿Desde dónde sales?",
            "¿Tienes un destino habitual?",
          ][step]
        }
      </h1>
      <p>
        Configúralo una vez. Después verás tus próximos trenes al abrir. Puedes
        cambiarlo cuando quieras.
      </p>
      {step === 0 ? (
        <label>
          Núcleo
          <select
            autoFocus
            aria-label="Núcleo de Cercanías"
            value={network}
            onChange={(e) => {
              setNetwork(e.target.value);
              setOrigin("");
              setDestination("");
            }}
          >
            <option value="">Elige un núcleo</option>
            {networks().map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </label>
      ) : step === 1 ? (
        <label>
          Estación de origen
          <select
            aria-label="Estación de origen"
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              setDestination("");
            }}
          >
            <option value="">Elige tu estación</option>
            {options.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label>
          Destino · opcional
          <select
            aria-label="Estación de destino opcional"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            <option value="">Sin destino</option>
            {options
              .filter((s) => s.id !== origin)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </label>
      )}
      <div className="onboarding-actions">
        {step > 0 && <button onClick={() => setStep(step - 1)}>Atrás</button>}
        {step < 2 ? (
          <button
            className="light-button"
            disabled={step === 0 ? !network : !origin}
            onClick={() => setStep(step + 1)}
          >
            Continuar
          </button>
        ) : (
          <button
            className="light-button"
            onClick={() => onComplete(network, origin, destination)}
          >
            Ver mis trenes
          </button>
        )}
        {onCancel && <button onClick={onCancel}>Cancelar</button>}
      </div>
    </section>
  );
}
