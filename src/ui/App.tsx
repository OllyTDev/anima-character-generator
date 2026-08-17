import { useCharacterStore } from "../store/characterStore";
import { StatBlock } from "./StatBlock";
import { ThemeToggle } from "./ThemeToggle";
import { Wizard } from "./Wizard";

export function App() {
  const step = useCharacterStore((state) => state.step);
  const fullSheet = step === "sheet";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-header-title">Anima Character Generator</p>
        <ThemeToggle />
      </header>
      <div className={`app ${fullSheet ? "app--full-sheet" : ""}`}>
        {!fullSheet ? <StatBlock /> : null}
        <Wizard />
      </div>
    </div>
  );
}
