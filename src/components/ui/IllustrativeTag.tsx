import { Tooltip } from "@/components/ui/Tooltip";

type IllustrativeTagProps = {
  note?: string;
};

export function IllustrativeTag({ note }: IllustrativeTagProps) {
  const tip =
    note ??
    "Illustrative assumption, not company data";
  return (
    <Tooltip content={tip}>
      <span className="cursor-help border-b border-dotted border-muted-foreground text-muted-foreground">
        illustrative
      </span>
    </Tooltip>
  );
}