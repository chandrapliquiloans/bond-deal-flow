import { useMemo, useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_TRADES, MOCK_SELL_REQUESTS } from "@/data/mockData";
import { TradeRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

function formatCsv(rows: Record<string, any>[]) {
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
            ✕
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
              // TODO: Upload handling (API integration)
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

export default function OpsTodaysTrades() {
  const today = formatDate(new Date());
  const [modalOpen, setModalOpen] = useState(false);

  const todaysTrades = useMemo(() => {
    return MOCK_TRADES.filter(
      (trade) =>
        trade.settlementDate === today &&
        (trade.status === "approved" || trade.status === "settled")
    );
  }, [today]);

  const getOrderId = (trade: TradeRecord) => {
    const sellRequest = MOCK_SELL_REQUESTS.find(req => req.id === trade.sellRequestId);
    return sellRequest?.orderId || "-";
  };

  return (
    <PortalLayout role="ops">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Today's Trades</h1>
            <p className="text-sm text-muted-foreground">
              Trades settling today with approved status.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="text-sm rounded-sm"
              onClick={() => setModalOpen(true)}
            >
              Upload UTR
            </Button>
            <Button
              className="text-sm rounded-sm"
              onClick={() => {
                const csv = formatCsv(
                  todaysTrades.map((trade) => ({
                    id: trade.id,
                    investor: trade.investorName,
                    bond: trade.bond.name,
                    isin: trade.bond.isin,
                    orderId: getOrderId(trade),
                    units: trade.units,
                    settledYield: trade.settledYield,
                    settlementDate: trade.settlementDate,
                    status: trade.status,
                  }))
                );
                downloadCsv(`todays-trades-${today}.csv`, csv);
              }}
            >
              Export CSV
            </Button>
          </div>
        </div>

        <div className="card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Investor</th>
                <th className="text-left p-3 font-medium">Bond</th>
                <th className="text-left p-3 font-medium">Order ID</th>
                <th className="text-right p-3 font-medium">Units</th>
                <th className="text-right p-3 font-medium">Yield</th>
                <th className="text-left p-3 font-medium">Settlement</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {todaysTrades.map((trade) => (
                <tr key={trade.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">{trade.id}</td>
                  <td className="p-3 text-xs">{trade.investorName}</td>
                  <td className="p-3 text-xs truncate max-w-[180px]">{trade.bond.name}</td>
                  <td className="p-3 font-mono text-xs">{getOrderId(trade)}</td>
                  <td className="p-3 text-right">{trade.units}</td>
                  <td className="p-3 text-right">{trade.settledYield ?? "-"}%</td>
                  <td className="p-3 text-xs">{trade.settlementDate}</td>
                  <td className="p-3 text-xs capitalize">{trade.status}</td>
                </tr>
              ))}
              {todaysTrades.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                    No trades match today's settlement date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UploadUtrModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </PortalLayout>
  );
}
