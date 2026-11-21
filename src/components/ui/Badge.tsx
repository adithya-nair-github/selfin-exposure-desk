import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "default" | "primary" | "risk" | "hedge" | "destructive" | "muted";
  className?: string;
};

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "border-border bg-muted text-foreground",
  primary: "border-primary/40 bg-primary-light text-primary",
  risk: "border-risk/40 bg-risk/10 text-risk",
  hedge: "border-hedge/40 bg-hedge/10 text-hedge",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "border-border bg-transparent text-muted-foreground",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}