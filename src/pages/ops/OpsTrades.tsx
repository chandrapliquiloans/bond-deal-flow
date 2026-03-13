import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_TRADES } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Check } from "lucide-react";

export default function OpsTrades() {
  const [utrInputs, setUtrInputs] = useState<Record<string, string>>({});

  return (
    <PortalLayout role="ops">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Today's Trades</h1>
            <p className="text-sm text-muted-foreground">Settlement and payment management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-xs rounded-sm h-8 gap-1">
              <Upload className="h-3 w-3" /> Bulk UTR Upload
            </Button>
            <Button variant="outline" className="text-xs rounded-sm h-8 gap-1">
              <Download className="h-3 w-3" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {MOCK_TRADES.map((trade) => {
            const statusColor =
              trade.status === "settled"
                ? "bg-settled/10 text-settled"
                : trade.status === "rfq_placed"
                ? "bg-executed/10 text-executed"
                : trade.status === "payment_uploaded"
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning";

            return (
              <div key={trade.id} className="card-elevated p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{trade.investorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {trade.bond.name.split(" ").slice(0, 3).join(" ")} · {trade.units} units
                    </p>
                  </div>
                  <span className={`status-badge ${statusColor}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {trade.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Trade ID</p>
                    <p className="font-mono">{trade.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Yield</p>
                    <p>{trade.settledYield}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Settlement</p>
                    <p>{trade.settlementDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RFQ #</p>
                    <p className="font-mono">{trade.rfqNumber || "—"}</p>
                  </div>
                </div>

                {/* UTR input for pending */}
                {trade.status === "pending_payment" && (
                  <div className="flex items-end gap-3 pt-2 border-t border-border">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-muted-foreground">UTR Number</label>
                      <Input
                        value={utrInputs[trade.id] || ""}
                        onChange={(e) =>
                          setUtrInputs((prev) => ({ ...prev, [trade.id]: e.target.value }))
                        }
                        className="rounded-sm text-sm"
                        placeholder="Enter UTR reference"
                      />
                    </div>
                    <Button
                      className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm gap-1"
                      disabled={!utrInputs[trade.id]}
                    >
                      <Upload className="h-3 w-3" /> Upload
                    </Button>
                  </div>
                )}

                {trade.utrNumber && (
                  <div className="text-xs flex items-center gap-1 text-success">
                    <Check className="h-3 w-3" />
                    UTR: <span className="font-mono">{trade.utrNumber}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PortalLayout>
  );
}
