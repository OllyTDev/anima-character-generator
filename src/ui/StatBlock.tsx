import { useSheet } from "../store/characterStore";
import { CharacterSheetContent } from "./CharacterSheetContent";

type StatBlockProps = {
  className?: string;
  onClose?: () => void;
};

export function StatBlock({ className, onClose }: StatBlockProps) {
  const sheet = useSheet();
  const classes = ["sheet", className].filter(Boolean).join(" ");

  return (
    <aside className={classes}>
      {onClose ? (
        <div className="mobile-sheet-drawer-header">
          <h2>Live sheet</h2>
          <button type="button" className="secondary mobile-sheet-close" onClick={onClose}>
            Close
          </button>
        </div>
      ) : null}
      <CharacterSheetContent sheet={sheet} variant="sidebar" />
    </aside>
  );
}
