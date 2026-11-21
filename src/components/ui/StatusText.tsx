type StatusTextProps = {
  message: string;
  className?: string;
};

export function StatusText({ message, className = "" }: StatusTextProps) {
  if (!message) {
    return null;
  }
  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-sm text-primary ${className}`}
    >
      {message}
    </p>
  );
}