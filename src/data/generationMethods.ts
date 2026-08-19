export const generationMethods = [
  { id: "open", label: "Open" },
  { id: "45", label: "45 Point Spend" },
  { id: "55", label: "55 Point Spend" },
  { id: "65", label: "65 Point Spend" },
] as const;

export type GenerationMethod = (typeof generationMethods)[number]["id"];

export function generationMethodLabel(method: GenerationMethod): string {
  return generationMethods.find((item) => item.id === method)?.label ?? "Open";
}

export function characteristicPointLimit(method: GenerationMethod): number | null {
  if (method === "open") return null;
  return Number(method);
}
