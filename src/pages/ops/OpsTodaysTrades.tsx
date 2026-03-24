import { useMemo, useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_TRADES, MOCK_SELL_REQUESTS } from "@/data/mockData";
import { TradeRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { X, Check, Search } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Payment Pending",
  payment_uploaded: "Payment Uploaded",
  rfq_placed: "RFQ Placed",
  in_progress: "In Progress",
  settled: "Settled",
};

function formatCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0]);
  const csv = [columns.join(",")];
  for (const row of rows) {
    csv.push(columns.map((col) => JSON.stringify(row[col] ?? "")).join(","));
  }
  return csv.join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function UploadUtrModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold">Upload UTR File</h2>
          <button className="text-muted-foreground hover:text-foreground" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload the bank file containing UTR numbers. Supported formats: CSV, XLSX.
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-xs"
          />
          {file && (
            <div className="rounded border border-border bg-muted/50 p-3 text-xs">
              <p className="font-medium">Selected file:</p>
              <p className="truncate">{file.name}</p>
              <p className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="text-sm rounded-sm">
            Cancel
          </Button>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
            disabled={!file}
            onClick={() => {
              alert(`Uploading file: ${file?.name}`);
              onClose();
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TradeViewDrawerProps {
  trade: TradeRecord;
  disFileName?: string;
  onClose: () => void;
  onUtrSubmit: (tradeId: string, utr: string) => void;
  onDisUpload: (tradeId: string, fileName: string) => void;
}

function TradeViewDrawer({ trade, disFileName, onClose, onUtrSubmit, onDisUpload }: TradeViewDrawerProps) {
  const [utr, setUtr] = useState(trade.utrNumber ?? "");
  const [disCopy, setDisCopy] = useState<File | null>(null);
  const [utrSaved, setUtrSaved] = useState(false);
  const [disSaved, setDisSaved] = useState(false);

  const isUtrLocked = trade.status === "in_progress";

  const handleUtrSubmit = () => {
    onUtrSubmit(trade.id, utr);
    setUtrSaved(true);
  };

  const handleDisSubmit = () => {
    if (!disCopy) return;
    onDisUpload(trade.id, disCopy.name);
    setDisSaved(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card shadow-xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">{trade.id}</h2>
            <p className="text-xs text-muted-foreground">{trade.investorName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Trade details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-xs">
            <p className="font-semibold text-sm">{trade.bond.name}</p>
            <div className="grid grid-cols-2 gap-y-1.5">
              <span className="text-muted-foreground">ISIN</span>
              <span className="font-mono">{trade.bond.isin}</span>
              <span className="text-muted-foreground">Investor</span>
              <span>{trade.investorName}</span>
              <span className="text-muted-foreground">Units</span>
              <span>{trade.units}</span>
              <span className="text-muted-foreground">Settled Yield</span>
              <span className="font-semibold text-accent">{trade.settledYield}%</span>
              <span className="text-muted-foreground">Settlement Date</span>
              <span>{trade.settlementDate}</span>
              <span className="text-muted-foreground">Status</span>
              <span>{STATUS_LABELS[trade.status] ?? trade.status}</span>
              {trade.rfqNumber && (
                <>
                  <span className="text-muted-foreground">RFQ</span>
                  <span className="font-mono">{trade.rfqNumber}</span>
                </>
              )}
              {trade.utrNumber && (
                <>
                  <span className="text-muted-foreground">UTR</span>
                  <span className="font-mono">{trade.utrNumber}</span>
                </>
              )}
            </div>
          </div>

          {/* UTR section */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold">UTR Number</h3>
            {isUtrLocked ? (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700 font-medium">
                UTR has been recorded for this trade. No further changes are allowed.
              </div>
            ) : utrSaved ? (
              <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded p-3 text-xs text-success font-medium">
                <Check className="h-3.5 w-3.5 shrink-0" />
                UTR <span className="font-mono">{utr}</span> saved successfully.
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm">
                  UTR / Transaction Reference <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  className="rounded-sm font-mono text-sm"
                  placeholder="e.g. UTR202603180001"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the UTR number from the payment confirmation.
                </p>
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
                  disabled={utr.trim() === ""}
                  onClick={handleUtrSubmit}
                >
                  Save UTR
                </Button>
              </div>
            )}
          </div>

          {/* DIS Copy section — always available */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold">
              DIS Copy{" "}
              <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </h3>
            {disSaved || disFileName ? (
              <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded p-3 text-xs text-success font-medium">
                <Check className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{disSaved ? disCopy?.name : disFileName}</span>
              </div>
            ) : null}
            {!disSaved && (
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDisCopy(e.target.files?.[0] ?? null)}
                  className="w-full text-xs"
                />
                {disCopy && (
                  <div className="rounded border border-border bg-muted/50 p-2 text-xs flex items-center justify-between">
                    <span className="truncate">{disCopy.name}</span>
                    <button
                      className="ml-2 text-muted-foreground hover:text-foreground shrink-0"
                      onClick={() => setDisCopy(null)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload the Delivery Instruction Slip. Accepted: PDF, JPG, PNG.
                </p>
                <Button
                  variant="outline"
                  className="w-full rounded-sm text-sm"
                  disabled={!disCopy}
                  onClick={handleDisSubmit}
                >
                  Upload DIS Copy
                </Button>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <Button variant="outline" className="rounded-sm text-sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

interface Filters {
  id: string;
  investor: string;
  isin: string;
  settlementDate: string;
}

export default function OpsTodaysTrades() {
  const today = formatDate(new Date());
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewTrade, setViewTrade] = useState<TradeRecord | null>(null);
  const [trades, setTrades] = useState(() =>
    MOCK_TRADES.filter((t) => t.settlementDate === today)
  );
  const [disFileNames, setDisFileNames] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Filters>({
    id: "",
    investor: "",
    isin: "",
    settlementDate: "",
  });

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () =>
    setFilters({ id: "", investor: "", isin: "", settlementDate: "" });

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const getOrderId = (trade: TradeRecord) => {
    const sellRequest = MOCK_SELL_REQUESTS.find((req) => req.id === trade.sellRequestId);
    return sellRequest?.orderId ?? "-";
  };

  const filtered = useMemo(() => {
    const id = filters.id.toLowerCase();
    const investor = filters.investor.toLowerCase();
    const isin = filters.isin.toLowerCase();
    const date = filters.settlementDate;
    return trades.filter((t) => {
      if (id && !t.id.toLowerCase().includes(id)) return false;
      if (investor && !t.investorName.toLowerCase().includes(investor)) return false;
      if (isin && !t.bond.isin.toLowerCase().includes(isin)) return false;
      if (date && t.settlementDate !== date) return false;
      return true;
    });
  }, [trades, filters]);

  const totalUnits = useMemo(() => filtered.reduce((sum, t) => sum + t.units, 0), [filtered]);
  const totalAmount = useMemo(
    () => filtered.reduce((sum, t) => sum + t.units * t.bond.faceValue, 0),
    [filtered]
  );

  const handleUtrSubmit = (tradeId: string, utr: string) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === tradeId ? { ...t, utrNumber: utr } : t))
    );
  };

  const handleDisUpload = (tradeId: string, fileName: string) => {
    setDisFileNames((prev) => ({ ...prev, [tradeId]: fileName }));
  };

  const handleDownload = () => {
    const csv = formatCsv(
      filtered.map((trade) => ({
        id: trade.id,
        investor: trade.investorName,
        bond: trade.bond.name,
        isin: trade.bond.isin,
        orderId: getOrderId(trade),
        units: trade.units,
        settledYield: trade.settledYield,
        settlementDate: trade.settlementDate,
        utrNumber: trade.utrNumber ?? "",
        rfqNumber: trade.rfqNumber ?? "",
        status: trade.status,
      }))
    );
    downloadCsv(`todays-trades-${today}.csv`, csv);
  };

  return (
    <PortalLayout role="ops">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Today's Trades</h1>
            <p className="text-sm text-muted-foreground">
              Trades settling today — {today}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="text-sm rounded-sm"
              onClick={() => setUploadModalOpen(true)}
            >
              Upload UTR
            </Button>
            <Button className="text-sm rounded-sm" onClick={handleDownload}>
              Download
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              Filter
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Trade ID</Label>
              <Input
                value={filters.id}
                onChange={(e) => setFilter("id", e.target.value)}
                placeholder="e.g. TR-011"
                className="h-8 text-xs rounded-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Investor</Label>
              <Input
                value={filters.investor}
                onChange={(e) => setFilter("investor", e.target.value)}
                placeholder="Name"
                className="h-8 text-xs rounded-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">ISIN</Label>
              <Input
                value={filters.isin}
                onChange={(e) => setFilter("isin", e.target.value)}
                placeholder="e.g. INE002A07RY8"
                className="h-8 text-xs rounded-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Settlement Date</Label>
              <Input
                type="date"
                value={filters.settlementDate}
                onChange={(e) => setFilter("settlementDate", e.target.value)}
                className="h-8 text-xs rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* Summary card */}
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          <div className="card-elevated p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Total Units</p>
            <p className="text-2xl font-semibold">{totalUnits}</p>
          </div>
          <div className="card-elevated p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-semibold">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Investor</th>
                <th className="text-left p-3 font-medium">Bond</th>
                <th className="text-left p-3 font-medium">Order ID</th>
                <th className="text-right p-3 font-medium">Units</th>
                <th className="text-right p-3 font-medium">Yield</th>
                <th className="text-left p-3 font-medium">UTR</th>
                <th className="text-left p-3 font-medium">DIS</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3 font-mono text-xs">{trade.id}</td>
                  <td className="p-3 text-xs">{trade.investorName}</td>
                  <td className="p-3 text-xs truncate max-w-[160px]">
                    {trade.bond.name.split(" ").slice(0, 3).join(" ")}
                  </td>
                  <td className="p-3 font-mono text-xs">{getOrderId(trade)}</td>
                  <td className="p-3 text-right text-xs">{trade.units}</td>
                  <td className="p-3 text-right text-xs font-semibold text-accent">
                    {trade.settledYield}%
                  </td>
                  <td className="p-3 text-xs font-mono">
                    {trade.utrNumber ? (
                      <span className="text-success">{trade.utrNumber}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3 text-xs">
                    {disFileNames[trade.id] ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <Check className="h-3 w-3" />
                        <span className="truncate max-w-[80px]">{disFileNames[trade.id]}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        trade.status === "settled"
                          ? "bg-success/10 text-success"
                          : trade.status === "pending_payment"
                          ? "bg-destructive/10 text-destructive"
                          : trade.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {STATUS_LABELS[trade.status] ?? trade.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3 text-xs rounded-sm"
                      onClick={() => setViewTrade(trade)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">
                    No trades match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((trade) => (
            <div key={trade.id} className="card-elevated p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{trade.investorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {trade.bond.name.split(" ").slice(0, 3).join(" ")}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">{trade.id}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    trade.status === "settled"
                      ? "bg-success/10 text-success"
                      : trade.status === "pending_payment"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  {STATUS_LABELS[trade.status] ?? trade.status}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Units</p>
                  <p className="font-medium">{trade.units}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Yield</p>
                  <p className="font-semibold text-accent">{trade.settledYield}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">UTR</p>
                  <p className={`font-mono text-xs truncate ${trade.utrNumber ? "text-success" : "text-muted-foreground"}`}>
                    {trade.utrNumber ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">DIS</p>
                  {disFileNames[trade.id] ? (
                    <span className="inline-flex items-center gap-0.5 text-success">
                      <Check className="h-3 w-3 shrink-0" />
                      <span className="truncate text-xs">Uploaded</span>
                    </span>
                  ) : (
                    <p className="text-muted-foreground">—</p>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs rounded-sm"
                  onClick={() => setViewTrade(trade)}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No trades match the current filters.
            </div>
          )}
        </div>
      </div>

      <UploadUtrModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />

      {viewTrade && (
        <TradeViewDrawer
          trade={viewTrade}
          disFileName={disFileNames[viewTrade.id]}
          onClose={() => setViewTrade(null)}
          onUtrSubmit={handleUtrSubmit}
          onDisUpload={handleDisUpload}
        />
      )}
    </PortalLayout>
  );
}
