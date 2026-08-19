import { useSheet } from "../store/characterStore";
import { CharacterSheetContent } from "./CharacterSheetContent";

export function StatBlock() {
  const sheet = useSheet();
  return (
    <aside className="sheet">
      <CharacterSheetContent sheet={sheet} variant="sidebar" />
    </aside>
  );
}
