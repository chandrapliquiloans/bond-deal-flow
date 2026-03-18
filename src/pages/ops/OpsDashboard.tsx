import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_SELL_REQUESTS, MOCK_TRADES } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { SellRequest } from "@/types";
import { OpsRequestDrawer } from "@/components/ops/OpsRequestDrawer";
import { AlertTriangle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OpsDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<SellRequest | null>(null);

  const newRequests = MOCK_SELL_REQUESTS.filter((r) =>
    ["sell_initiated", "negotiation", "buyer_approved"].includes(r.status)
  );
  const todaysTrades = MOCK_SELL_REQUESTS.filter((r) =>
    ["seller_approved", "payment_done", "processing"].includes(r.status)
  );

  return (
    <PortalLayout role="ops">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Operations Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage sell requests and trades</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-elevated p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">New Requests</p>
            <p className="text-2xl font-semibold text-accent">{newRequests.length}</p>
          </div>
          <div className="card-elevated p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Today's Trades</p>
            <p className="text-2xl font-semibold text-success">{todaysTrades.length}</p>
          </div>
          <div className="card-elevated p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Under Negotiation</p>
            <p className="text-2xl font-semibold text-warning">
              {MOCK_SELL_REQUESTS.filter((r) => r.status === "negotiation").length}
            </p>
          </div>
          <div className="card-elevated p-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Settled Today</p>
            <p className="text-2xl font-semibold text-settled">
              {MOCK_SELL_REQUESTS.filter((r) => r.status === "settled").length}
            </p>
          </div>
        </div>

        {/* Urgent banners */}
        {MOCK_SELL_REQUESTS.filter((r) => r.status === "negotiation").length > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-warning">Negotiation deadlines approaching</p>
              <p className="text-xs text-muted-foreground">
                1 request requires action within 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Two-pane: New Requests + Today's Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Requests */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" /> New & Active Requests
            </h2>
            {newRequests.map((req) => (
              <button
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="w-full text-left card-elevated p-4 space-y-2 hover:ring-1 hover:ring-accent/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{req.investorName}</p>
                    <p className="text-xs text-muted-foreground">{req.bond.name.split(" ").slice(0, 3).join(" ")}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="font-mono">{req.id}</span>
                  <span>{req.units} units</span>
                  <span>{req.desiredYield}%</span>
                  <span>{req.transactionDate}</span>
                </div>
              </button>
            ))}
            {newRequests.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No pending requests</p>
            )}
          </div>

          {/* Today's Trades */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" /> Today's Trades
              </h2>
              <Button variant="outline" className="text-xs rounded-sm h-8 gap-1">
                <Download className="h-3 w-3" /> Download CSV
              </Button>
            </div>
            {todaysTrades.map((req) => (
              <button
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="w-full text-left card-elevated p-4 space-y-2 hover:ring-1 hover:ring-accent/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{req.investorName}</p>
                    <p className="text-xs text-muted-foreground">{req.bond.name.split(" ").slice(0, 3).join(" ")}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="font-mono">{req.id}</span>
                  <span>{req.units} units</span>
                  <span>{req.settlementDate || req.transactionDate}</span>
                </div>
              </button>
            ))}
            {todaysTrades.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No trades today</p>
            )}
          </div>
        </div>
      </div>

      {selectedRequest && (
        <OpsRequestDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </PortalLayout>
  );
}
