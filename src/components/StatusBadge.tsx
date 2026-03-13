import { SellRequestStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<SellRequestStatus, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-accent/10 text-accent" },
  under_review: { label: "Under Review", className: "bg-accent/10 text-accent" },
  under_negotiation: { label: "Negotiation", className: "bg-warning/10 text-warning" },
  accepted: { label: "Accepted", className: "bg-success/10 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
  executed: { label: "Executed", className: "bg-executed/10 text-executed" },
  settled: { label: "Settled", className: "bg-settled/10 text-settled" },
  terminated: { label: "Terminated", className: "bg-terminated/10 text-terminated" },
};

interface StatusBadgeProps {
  status: SellRequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn("status-badge", config.className, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
