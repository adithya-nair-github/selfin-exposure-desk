type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  id?: string;
  className?: string;
  mono?: boolean;
};

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  id,
  className = "",
  mono = true,
}: NumberFieldProps) {
  const inputId = id ?? `num-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={inputId} className="text-sm text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isNaN(next)) {
              onChange(next);
            }
          }}
          className={`h-9 w-full rounded-md border border-border bg-muted px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${mono ? "font-mono tabular-nums" : ""}`}
        />
        {suffix ? (
          <span className="shrink-0 text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}