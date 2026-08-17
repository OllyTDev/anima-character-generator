import { useCharacterStore } from "../store/characterStore";
import { StatBlock } from "./StatBlock";
import { Wizard } from "./Wizard";

export function App() {
  const step = useCharacterStore((state) => state.step);
  const fullSheet = step === "sheet";

  return (
    <div className={`app ${fullSheet ? "app--full-sheet" : ""}`}>
      {!fullSheet ? <StatBlock /> : null}
      <Wizard />
    </div>
  );
}
