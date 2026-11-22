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
        className="flex w-full flex-wrap rounded-md border border-border p-0.5 sm:inline-flex sm:w-auto"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`h-10 min-w-0 flex-1 rounded px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:h-8 sm:flex-none sm:px-3 sm:text-sm ${
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