import { SCENARIO_IDS, getScenario } from "@/data/scenarios";
import type { Action, ScenarioId } from "@/lib/types";
import { Cpu, Plane, Scale, Trophy } from "lucide-react";
import type { Dispatch } from "react";

type ScenarioSwitcherProps = {
  scenarioId: ScenarioId;
  dispatch: Dispatch<Action>;
};

const ICONS: Record<ScenarioId, typeof Trophy> = {
  coventry: Trophy,
  aircanada: Plane,
  gpu: Cpu,
  calibration: Scale,
};

export function ScenarioSwitcher({
  scenarioId,
  dispatch,
}: ScenarioSwitcherProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-md border border-border p-0.5"
      role="group"
      aria-label="Scenario preset"
    >
      {SCENARIO_IDS.map((id) => {
        const s = getScenario(id);
        const Icon = ICONS[id];
        const active = id === scenarioId;
        return (
          <button
            key={id}
            type="button"
            onClick={() => dispatch({ type: "setScenario", id })}
            className={`flex h-8 items-center gap-1.5 rounded px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
              active
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{s.name.split("·")[0].trim()}</span>
          </button>
        );
      })}
    </div>
  );
}