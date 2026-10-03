// Some legacy snapshots were read as Latin-1 before being written as UTF-8.
export function stationLabel(value: string): string {
  if (!/[ÃÂ]/.test(value) || [...value].some((c) => c.charCodeAt(0) > 255))
    return value;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from([...value], (c) => c.charCodeAt(0)),
    );
  } catch {
    return value;
  }
}
