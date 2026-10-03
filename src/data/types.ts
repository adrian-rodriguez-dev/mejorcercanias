export interface Station {
  id: string;
  name: string;
  network: string;
  lines: string[];
}
export interface Departure {
  directSavingMinutes?: number;
  mode?: "train" | "bus";
  journey?: (import("./router").Leg & {
    fromName: string;
    toName: string;
    change?: import("./router").Leg["change"] & {
      fromName: string;
      toName: string;
    };
  })[];
  id: string;
  line: string;
  destination: string;
  terminalId?: string;
  scheduledAt: string;
  arrivals?: { stationId: string; at: string }[];
}
export interface StationSchedule {
  offline?: boolean;
  stationId: string;
  source: "demo" | "renfe-gtfs";
  departures: Departure[];
  availability?: "available" | "unpublished";
  destinations?: string[];
}
export interface ScheduleProvider {
  load(
    stationId: string,
    now: number,
    signal: AbortSignal,
  ): Promise<StationSchedule>;
}
export interface DemoPattern {
  line: string;
  destination: string;
  offset: number;
  every: number;
}
