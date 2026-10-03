// Repair legacy UTF-8 decoded as Latin-1/Windows-1252, including mixed names.
const windowsBytes = new Map<number, number>();
const windowsDecoder = new TextDecoder("windows-1252");
for (let byte = 128; byte < 160; byte++) {
  windowsBytes.set(
    windowsDecoder.decode(Uint8Array.of(byte)).charCodeAt(0),
    byte,
  );
}
export function stationLabel(value: string): string {
  let result = value;
  for (let pass = 0; pass < 3; pass++) {
    const repaired = result.replace(/[ÃÂ][\s\S]/g, (pair) => {
      const bytes = [...pair].map(
        (c) => windowsBytes.get(c.charCodeAt(0)) ?? c.charCodeAt(0),
      );
      if (bytes.some((b) => b > 255)) return pair;
      try {
        return new TextDecoder("utf-8", { fatal: true }).decode(
          Uint8Array.from(bytes),
        );
      } catch {
        return pair;
      }
    });
    if (repaired === result) break;
    result = repaired;
  }
  return result;
}
