export const magicPaths = [
  "Air",
  "Creation",
  "Darkness",
  "Destruction",
  "Earth",
  "Essence",
  "Fire",
  "Illusion",
  "Light",
  "Necromany",
  "Water",
] as const;

export type MagicPath = (typeof magicPaths)[number];
