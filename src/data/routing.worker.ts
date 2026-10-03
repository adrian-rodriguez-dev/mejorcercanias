import { findJourneys, type Graph } from "./router";
self.onmessage = (
  event: MessageEvent<{
    graph: Graph;
    origin: string;
    destination: string;
    days: string[];
    lines: string[];
  }>,
) => {
  try {
    const { graph, origin, destination, days, lines } = event.data;
    self.postMessage({
      results: days.map((day) => ({
        day,
        journeys: findJourneys(graph, origin, destination, day, lines),
      })),
    });
  } catch {
    self.postMessage({ error: "No se pudo calcular el trayecto." });
  }
};
