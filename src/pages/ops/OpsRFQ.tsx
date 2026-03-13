import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_TRADES } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const stages = [
  { key: "pending_payment", label: "Pending Payment" },
  { key: "payment_uploaded", label: "Payment Uploaded" },
  { key: "rfq_placed", label: "RFQ Placed" },
  { key: "settled", label: "Settled" },
];

export default function OpsRFQ() {
  const [rfqInputs, setRfqInputs] = useState<Record<string, string>>({});

  return (
    <PortalLayout role="ops">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">RFQ Management</h1>
          <p className="text-sm text-muted-foreground">Place and track Request for Quotes</p>
        </div>

        {/* Status pipeline */}
        <div className="flex gap-1">
          {stages.map((stage, i) => {
            const count = MOCK_TRADES.filter((t) => t.status === stage.key).length;
            return (
              <div key={stage.key} className="flex-1 text-center">
                <div
                  className={`h-2 rounded-full ${
                    i <= 1 ? "bg-accent" : "bg-border"
                  }`}
                />
                <p className="text-[10px] mt-1 text-muted-foreground">{stage.label}</p>
                <p className="text-xs font-semibold">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Trades for RFQ */}
        <div className="space-y-3">
          {MOCK_TRADES.map((trade) => (
            <div key={trade.id} className="card-elevated p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{trade.investorName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{trade.id}</p>
                </div>
                <span className="text-xs font-medium capitalize bg-muted px-2 py-0.5 rounded">
                  {trade.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Bond</p>
                  <p>{trade.bond.name.split(" ").slice(0, 3).join(" ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Units</p>
                  <p>{trade.units}</p>
                </div>
              </div>

              {!trade.rfqNumber && (
                <div className="flex items-end gap-3 border-t border-border pt-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">RFQ Number</label>
                    <Input
                      value={rfqInputs[trade.id] || ""}
                      onChange={(e) =>
                        setRfqInputs((prev) => ({ ...prev, [trade.id]: e.target.value }))
                      }
                      className="rounded-sm text-sm"
                      placeholder="Enter RFQ number"
                    />
                  </div>
                  <Button
                    className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
                    disabled={!rfqInputs[trade.id]}
                  >
                    Place RFQ
                  </Button>
                </div>
              )}

              {trade.rfqNumber && (
                <p className="text-xs text-success font-mono">✅ RFQ: {trade.rfqNumber}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm">
            Bulk Place RFQ
          </Button>
        </div>
      </div>
    </PortalLayout>
  );
}
