import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_SELL_REQUESTS } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { SellRequestStatus } from "@/types";
import { OpsRequestDrawer } from "@/components/ops/OpsRequestDrawer";

const filterOptions: { label: string; value: SellRequestStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "Negotiation", value: "under_negotiation" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Executed", value: "executed" },
  { label: "Settled", value: "settled" },
  { label: "Terminated", value: "terminated" },
];

export default function OpsSellRequests() {
  const [filter, setFilter] = useState<SellRequestStatus | "all">("all");
  const [selectedReq, setSelectedReq] = useState<typeof MOCK_SELL_REQUESTS[0] | null>(null);

  const filtered = filter === "all"
    ? MOCK_SELL_REQUESTS
    : MOCK_SELL_REQUESTS.filter((r) => r.status === filter);

  return (
    <PortalLayout role="ops">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">All Sell Requests</h1>
          <p className="text-sm text-muted-foreground">Filter and manage all sell orders</p>
        </div>

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
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Investor</th>
                <th className="text-left p-3 font-medium">Bond</th>
                <th className="text-right p-3 font-medium">Units</th>
                <th className="text-right p-3 font-medium">Yield</th>
                <th className="text-left p-3 font-medium">Source</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">{req.id}</td>
                  <td className="p-3 text-xs">{req.investorName}</td>
                  <td className="p-3 text-xs truncate max-w-[160px]">{req.bond.name.split(" ").slice(0, 3).join(" ")}</td>
                  <td className="p-3 text-right">{req.units}</td>
                  <td className="p-3 text-right">{req.desiredYield}%</td>
                  <td className="p-3 text-xs capitalize">{req.source}</td>
                  <td className="p-3"><StatusBadge status={req.status} /></td>
                  <td className="p-3 text-right">
                    <button onClick={() => setSelectedReq(req)} className="text-xs text-accent hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {filtered.map((req) => (
            <button
              key={req.id}
              onClick={() => setSelectedReq(req)}
              className="w-full text-left card-elevated p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{req.investorName}</p>
                  <p className="text-xs text-muted-foreground">{req.bond.name.split(" ").slice(0, 3).join(" ")}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="font-mono">{req.id}</span>
                <span>{req.units}u</span>
                <span>{req.desiredYield}%</span>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No requests match this filter.</p>
        )}
      </div>

      {selectedReq && (
        <OpsRequestDrawer request={selectedReq} onClose={() => setSelectedReq(null)} />
      )}
    </PortalLayout>
  );
}
