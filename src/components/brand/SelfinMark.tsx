type SelfinMarkProps = {
  compact?: boolean;
  showWordmark?: boolean;
  className?: string;
};

export function SelfinMark({
  compact = false,
  showWordmark = true,
  className = "",
}: SelfinMarkProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={compact ? 28 : 32}
        height={compact ? 28 : 32}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0 rounded-[4px]"
      >
        <rect width="32" height="32" rx="4" fill="#008BFF" />
        <path
          d="M10 22C10 14 14 11 18 11C21 11 23 12.5 23 15C23 17 21.5 18.5 19 18.5C17 18.5 15.5 17.5 15.5 16C15.5 14.5 16.5 13.5 18 13.5"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M22 8L25 11"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M10 24L7 21"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark ? (
        <span className="flex items-baseline gap-1.5 text-sm">
          <span className="font-medium text-foreground">Selfin</span>
          <span className="text-muted-foreground">/ Exposure Desk</span>
        </span>
      ) : null}
    </div>
  );
}