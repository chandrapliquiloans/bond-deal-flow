import { SellRequestStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<SellRequestStatus, { label: string; className: string }> = {
  sell_initiated: { label: "Sell Initiated", className: "bg-accent/10 text-accent" },
  negotiation: { label: "Negotiation", className: "bg-warning/10 text-warning" },
  buyer_approved: { label: "Buyer Approved", className: "bg-success/10 text-success" },
  seller_approved: { label: "Seller Approved", className: "bg-success/10 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
  payment_done: { label: "Payment Done", className: "bg-executed/10 text-executed" },
  processing: { label: "InProgress", className: "bg-warning/10 text-warning" },
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
