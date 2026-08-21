import { useEffect, useState } from "react";
import { useCharacterStore } from "../store/characterStore";
import { StatBlock } from "./StatBlock";
import { ThemeToggle } from "./ThemeToggle";
import { useMediaQuery } from "./useMediaQuery";
import { Wizard } from "./Wizard";

export function App() {
  const step = useCharacterStore((state) => state.step);
  const fullSheet = step === "sheet";
  const isMobileLayout = useMediaQuery("(max-width: 900px)");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    if (!isMobileLayout) setMobileSheetOpen(false);
  }, [isMobileLayout]);

  useEffect(() => {
    setMobileSheetOpen(false);
  }, [step]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-start">
          <p className="app-header-title">Anima Character Generator</p>
          <a className="legacy-version-link" href={`${import.meta.env.BASE_URL}legacy/`}>
            <span className="legacy-version-link-long">Looking for the old version? Click here!</span>
            <span className="legacy-version-link-short">Old version</span>
          </a>
        </div>
        <ThemeToggle />
      </header>
      {!fullSheet && isMobileLayout ? (
        <div className="mobile-sheet-bar">
          <button type="button" className="mobile-sheet-open" onClick={() => setMobileSheetOpen(true)}>
            View live sheet
          </button>
        </div>
      ) : null}
      <div
        className={`app ${fullSheet ? "app--full-sheet" : ""}${isMobileLayout && !fullSheet ? " app--mobile-wizard" : ""}`}
      >
        {!fullSheet && (!isMobileLayout || mobileSheetOpen) ? (
          <>
            {isMobileLayout && mobileSheetOpen ? (
              <button
                type="button"
                className="mobile-sheet-backdrop"
                aria-label="Close live sheet"
                onClick={() => setMobileSheetOpen(false)}
              />
            ) : null}
            <StatBlock
              className={isMobileLayout ? "sheet--mobile-drawer" : undefined}
              onClose={isMobileLayout ? () => setMobileSheetOpen(false) : undefined}
            />
          </>
        ) : null}
        <Wizard />
      </div>
    </div>
  );
}
