type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  label?: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className = "",
}: SegmentedProps<T>) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label ? (
        <span className="text-sm text-muted-foreground">{label}</span>
      ) : null}
      <div
        role="group"
        aria-label={label}
        className="inline-flex rounded-md border border-border p-0.5"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`h-8 rounded px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                active
                  ? "bg-primary text-white"
                  : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}