import type { Journey } from "./router";
export function journeyKey(
  version: string,
  network: string,
  origin: string,
  destination: string,
  day: string,
  lines: string[],
) {
  return JSON.stringify([
    version,
    network,
    origin,
    destination,
    day,
    [...new Set(lines)].sort(),
  ]);
}
/** Completed daily queries only. Bounded independently of the graph cache. */
export class JourneyCache {
  private entries = new Map<string, Journey[]>();
  constructor(private capacity = 24) {}
  get(key: string): Journey[] | undefined {
    const result = this.entries.get(key);
    if (result !== undefined) {
      this.entries.delete(key);
      this.entries.set(key, result);
    }
    return result;
  }
  set(key: string, value: Journey[]) {
    this.entries.delete(key);
    this.entries.set(key, value);
    while (this.entries.size > this.capacity)
      this.entries.delete(this.entries.keys().next().value!);
  }
}
