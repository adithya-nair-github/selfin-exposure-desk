import { IllustrativeTag } from "@/components/ui/IllustrativeTag";
import { SourceChip } from "@/components/ui/SourceChip";
import type { Scenario } from "@/lib/types";

type CompanyCardProps = {
  scenario: Scenario;
};

export function CompanyCard({ scenario }: CompanyCardProps) {
  const { company, eventLabel } = scenario;

  return (
    <section className="space-y-3 rounded-md border border-white/[0.08] bg-card p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        Target company
      </p>
      <h2 className="font-serif text-xl tracking-tight text-foreground">
        {company.name}
      </h2>
      <p className="text-sm text-muted-foreground">{company.descriptor}</p>
      <p className="text-xs text-muted-foreground">{company.ownership}</p>
      <div className="border-t border-border pt-3">
        <p className="font-serif text-sm text-foreground">{eventLabel}</p>
      </div>
      <ul className="space-y-2 text-sm">
        {company.facts.map((f) => (
          <li key={f.label} className="flex flex-col gap-1">
            <span className="text-muted-foreground">{f.label}</span>
            <span className="font-mono tabular-nums text-foreground">
              {f.value}
            </span>
            <div className="flex flex-wrap gap-1">
              {f.prov.kind === "illustrative" ? (
                <IllustrativeTag note={f.prov.note} />
              ) : (
                <SourceChip prov={f.prov} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}