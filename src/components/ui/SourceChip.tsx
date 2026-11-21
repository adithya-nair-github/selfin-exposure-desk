import { SOURCES } from "@/data/sources";
import type { Provenance } from "@/lib/types";
import { ExternalLink } from "lucide-react";

type SourceChipProps = {
  prov: Provenance;
  className?: string;
};

export function SourceChip({ prov, className = "" }: SourceChipProps) {
  if (prov.kind === "illustrative") {
    return null;
  }

  const source = SOURCES[prov.sourceId];
  const label = source?.label ?? prov.sourceId;
  const url = source?.url ?? "#";
  const unverified =
    prov.kind === "unverified" || source?.status === "unverified";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${className}`}
    >
      <span className="max-w-[140px] truncate">{label}</span>
      {unverified ? (
        <span className="text-muted-foreground">Unverified</span>
      ) : null}
      <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" aria-hidden />
    </a>
  );
}