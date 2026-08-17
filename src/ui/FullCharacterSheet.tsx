import { useSheet } from "../store/characterStore";
import { CharacterSheetContent } from "./CharacterSheetContent";

export function FullCharacterSheet() {
  const sheet = useSheet();
  return (
    <section className="full-sheet">
      <header className="full-sheet-header">
        <h2>Full Character Sheet</h2>
        <p className="muted">Use the tabs above to edit your character.</p>
      </header>
      <CharacterSheetContent sheet={sheet} variant="full" showTitle={false} />
    </section>
  );
}
