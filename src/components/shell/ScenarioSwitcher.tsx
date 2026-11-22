import { SCENARIO_IDS, getScenario } from "@/data/scenarios";
import type { Action, ScenarioId } from "@/lib/types";
import { Cpu, Plane, Scale, Trophy } from "lucide-react";
import type { Dispatch } from "react";

type ScenarioSwitcherProps = {
  scenarioId: ScenarioId;
  dispatch: Dispatch<Action>;
  className?: string;
};

const ICONS: Record<ScenarioId, typeof Trophy> = {
  coventry: Trophy,
  aircanada: Plane,
  gpu: Cpu,
  calibration: Scale,
};

const SHORT: Record<ScenarioId, string> = {
  coventry: "Coventry",
  aircanada: "Air Can",
  gpu: "GPU",
  calibration: "Calibrate",
};

export function ScenarioSwitcher({
  scenarioId,
  dispatch,
  className = "",
}: ScenarioSwitcherProps) {
  return (
    <div
      className={`flex w-full items-stretch gap-1 overflow-x-auto rounded-md border border-border p-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
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
            title={s.name}
            className={`flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:h-8 sm:flex-none sm:justify-start sm:px-2.5 ${
              active
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            aria-pressed={active}
            aria-label={SHORT[id]}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{SHORT[id]}</span>
          </button>
        );
      })}
    </div>
  );
}
