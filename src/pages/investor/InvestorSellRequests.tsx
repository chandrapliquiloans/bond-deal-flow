import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_SELL_REQUESTS } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { SellRequestStatus } from "@/types";
import { NegotiationDetail } from "@/components/investor/NegotiationDetail";

const filterOptions: { label: string; value: SellRequestStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Negotiation", value: "under_negotiation" },
  { label: "Accepted", value: "accepted" },
  { label: "Settled", value: "settled" },
  { label: "Terminated", value: "terminated" },
];

export default function InvestorSellRequests() {
  const [filter, setFilter] = useState<SellRequestStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? MOCK_SELL_REQUESTS
      : MOCK_SELL_REQUESTS.filter((r) => r.status === filter);

  const selectedRequest = selectedId
    ? MOCK_SELL_REQUESTS.find((r) => r.id === selectedId)
    : null;

  if (selectedRequest) {
    return (
      <PortalLayout role="investor">
        <NegotiationDetail request={selectedRequest} onBack={() => setSelectedId(null)} />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout role="investor">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Sell Requests</h1>
          <p className="text-sm text-muted-foreground">Track and manage your sell orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.value
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium">Request ID</th>
                <th className="text-left p-3 font-medium">Bond</th>
                <th className="text-left p-3 font-medium">Order ID</th>
                <th className="text-right p-3 font-medium">Units</th>
                <th className="text-right p-3 font-medium">Yield</th>
                <th className="text-left p-3 font-medium">Txn Date</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">{req.id}</td>
                  <td className="p-3 text-xs max-w-[200px] truncate">{req.bond.name.split(" ").slice(0, 3).join(" ")}</td>
                  <td className="p-3 font-mono text-xs">{req.orderId || "-"}</td>
                  <td className="p-3 text-right">{req.units}</td>
                  <td className="p-3 text-right">{req.desiredYield}%</td>
                  <td className="p-3 text-xs">{req.transactionDate}</td>
                  <td className="p-3"><StatusBadge status={req.status} /></td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedId(req.id)}
                      className="text-xs text-accent hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((req) => (
            <button
              key={req.id}
              onClick={() => setSelectedId(req.id)}
              className="w-full text-left card-elevated p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{req.bond.name.split(" ").slice(0, 3).join(" ")}</p>
                  <p className="text-xs font-mono text-muted-foreground">{req.id}</p>
                  <p className="text-xs text-muted-foreground">Order: {req.orderId || "-"}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{req.units} units</span>
                <span>{req.desiredYield}% yield</span>
                <span>{req.transactionDate}</span>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No sell requests found for this filter.
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
