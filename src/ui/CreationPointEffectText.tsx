import { parseCreationPointEffect } from "../engine/creationPointOptions";

type CreationPointEffectTextProps = {
  text: string;
};

export function CreationPointEffectText({ text }: CreationPointEffectTextProps) {
  const parsed = parseCreationPointEffect(text);

  if (!parsed.mechanics) {
    return <p className="creation-point-effect">{parsed.description}</p>;
  }

  return (
    <div className="creation-point-effect-block">
      <p className="creation-point-description">{parsed.description}</p>
      <p className="creation-point-effect">{parsed.mechanics}</p>
    </div>
  );
}
