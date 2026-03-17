import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_TRADES } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Check, X } from "lucide-react";

export default function OpsTrades() {
  const [utrModalOpen, setUtrModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <PortalLayout role="ops">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Today's Trades</h1>
            <p className="text-sm text-muted-foreground">Settlement and payment management</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-xs rounded-sm h-8 gap-1"
              onClick={() => setUtrModalOpen(true)}
            >
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
                      {trade.bond?.name?.split(" ").slice(0, 3).join(" ") || "Unknown Bond"} · {trade.units} units
                    </p>
                  </div>
                  <span className={`status-badge ${statusColor}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {trade.status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Trade ID</p>
                    <p className="font-mono">{trade.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Yield</p>
                    <p>{trade.settledYield || 0}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Settlement</p>
                    <p>{trade.settlementDate || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RFQ #</p>
                    <p className="font-mono">{trade.rfqNumber || "—"}</p>
                  </div>
                </div>

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

        {/* UTR Upload Modal */}
        {utrModalOpen && (
          <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-lg shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-sm font-semibold">Bulk UTR Upload</h2>
                <button
                  onClick={() => {
                    setUtrModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Select UTR File</Label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="rounded-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a CSV or Excel file containing UTR numbers for bulk processing.
                  </p>
                </div>

                {selectedFile && (
                  <div className="bg-muted/50 rounded p-3 text-xs">
                    <p className="font-medium">Selected file:</p>
                    <p className="text-muted-foreground">{selectedFile.name}</p>
                    <p className="text-muted-foreground">Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUtrModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="rounded-sm text-sm"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm gap-1"
                  disabled={!selectedFile}
                  onClick={() => {
                    // Handle file upload logic here
                    console.log("Uploading file:", selectedFile);
                    setUtrModalOpen(false);
                    setSelectedFile(null);
                  }}
                >
                  <Upload className="h-3 w-3" /> Upload
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
