type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  id?: string;
  className?: string;
};

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  id,
  className = "",
}: SliderProps) {
  const display = formatValue ? formatValue(value) : String(value);
  const inputId = id ?? `slider-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm text-muted-foreground">
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {display}
        </span>
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-full cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:h-2"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
}