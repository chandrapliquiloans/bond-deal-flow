import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_TRADES, MOCK_SELL_REQUESTS } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

export default function OpsTrades() {
  const [activeTab, setActiveTab] = useState<"pending" | "transactions" | "orders">("transactions");
  const [transactionDateFrom, setTransactionDateFrom] = useState("");
  const [transactionDateTo, setTransactionDateTo] = useState("");
  const [settlementDateFrom, setSettlementDateFrom] = useState("");
  const [settlementDateTo, setSettlementDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending_payment" | "payment_uploaded" | "settled">("all");

  const filteredTrades = MOCK_TRADES.filter((trade) => {
    if (activeTab === "pending" && trade.status !== "pending_payment") return false;
    if (activeTab === "transactions" && trade.status === "pending_payment") return false;
    if (activeTab === "orders" && trade.status !== "settled") return false;

    if (statusFilter !== "all" && trade.status !== statusFilter) return false;

    if (transactionDateFrom && trade.settlementDate) {
      const t = new Date(trade.settlementDate);
      if (new Date(transactionDateFrom) > t) return false;
    }
    if (transactionDateTo && trade.settlementDate) {
      const t = new Date(trade.settlementDate);
      if (new Date(transactionDateTo) < t) return false;
    }

    if (settlementDateFrom && trade.settlementDate) {
      const s = new Date(trade.settlementDate);
      if (new Date(settlementDateFrom) > s) return false;
    }
    if (settlementDateTo && trade.settlementDate) {
      const s = new Date(trade.settlementDate);
      if (new Date(settlementDateTo) < s) return false;
    }

    return true;
  });

  const getOrderId = (trade: any) => {
    const sellRequest = MOCK_SELL_REQUESTS.find(req => req.id === trade.sellRequestId);
    return sellRequest?.orderId || "-";
  };

  return (
    <PortalLayout role="ops">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
              <h1 className="text-2xl font-semibold">Transactions</h1>
              <p className="text-sm text-muted-foreground">Manage and track bond transactions across stages</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={activeTab === "pending" ? "secondary" : "outline"}
              className="text-xs rounded-full px-4"
              onClick={() => setActiveTab("pending")}
            >
              Payment Pending
            </Button>
            <Button
              variant={activeTab === "transactions" ? "secondary" : "outline"}
              className="text-xs rounded-full px-4"
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </Button>
            <Button
              variant={activeTab === "orders" ? "secondary" : "outline"}
              className="text-xs rounded-full px-4"
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </Button>

          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-semibold">Filters</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-xs rounded-sm"
                onClick={() => {
                  const csvRows = filteredTrades.map((t) => ({
                    id: t.id,
                    investor: t.investorName,
                    bond: t.bond.name,
                    isin: t.bond.isin,
                    orderId: getOrderId(t),
                    units: t.units,
                    settledYield: t.settledYield,
                    settlementDate: t.settlementDate,
                    status: t.status,
                  }));
                  const csv = csvRows.length
                    ? [
                        Object.keys(csvRows[0]).join(","),
                        ...csvRows.map((row) =>
                          Object.values(row)
                            .map((v) => JSON.stringify(v ?? ""))
                            .join(",")
                        ),
                      ].join("\n")
                    : "";
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", "ops-transactions.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Transaction Date</Label>
              <input
                type="date"
                value={transactionDateFrom}
                onChange={(e) => setTransactionDateFrom(e.target.value)}
                className="w-full rounded border border-input px-3 py-2 text-sm"
                placeholder="From"
              />
              <input
                type="date"
                value={transactionDateTo}
                onChange={(e) => setTransactionDateTo(e.target.value)}
                className="w-full rounded border border-input px-3 py-2 text-sm"
                placeholder="To"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Settlement Date</Label>
              <input
                type="date"
                value={settlementDateFrom}
                onChange={(e) => setSettlementDateFrom(e.target.value)}
                className="w-full rounded border border-input px-3 py-2 text-sm"
                placeholder="From"
              />
              <input
                type="date"
                value={settlementDateTo}
                onChange={(e) => setSettlementDateTo(e.target.value)}
                className="w-full rounded border border-input px-3 py-2 text-sm"
                placeholder="To"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full rounded border border-input px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="pending_payment">Payment Pending</option>
                <option value="payment_uploaded">Payment Uploaded</option>
                <option value="settled">Settled</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-1 flex items-end gap-2">
              <Button className="w-full text-sm" onClick={() => {}}>
                Search
              </Button>
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  setTransactionDateFrom("");
                  setTransactionDateTo("");
                  setSettlementDateFrom("");
                  setSettlementDateTo("");
                  setStatusFilter("all");
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredTrades.length} records
            </p>
          </div>
          <Button variant="outline" className="text-xs rounded-sm h-8 gap-1">
            <Download className="h-3 w-3" /> Export Orders
          </Button>
        </div>

        <div className="card-elevated overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Investor</th>
                <th className="p-3 font-medium">Bond</th>
                <th className="p-3 font-medium">Order ID</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Transaction Date</th>
                <th className="p-3 font-medium">Settlement Date</th>
                <th className="p-3 font-medium">Units</th>
                <th className="p-3 font-medium">Investment Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => {
                const statusColor =
                  trade.status === "settled"
                    ? "bg-settled/10 text-settled"
                    : trade.status === "payment_uploaded"
                    ? "bg-success/10 text-success"
                    : trade.status === "pending_payment"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted/20 text-muted-foreground";

                const investmentAmount = (trade.units * 1324.32).toFixed(2);

                return (
                  <tr key={trade.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{trade.id}</td>
                    <td className="p-3 text-xs">{trade.investorName}</td>
                    <td className="p-3 text-xs truncate max-w-[220px]">
                      {trade.bond?.name || "-"}
                    </td>
                    <td className="p-3 font-mono text-xs">{getOrderId(trade)}</td>
                    <td className="p-3 text-xs">
                      <span className={`status-badge ${statusColor}`}>{trade.status}</span>
                    </td>
                    <td className="p-3 text-xs">{trade.settlementDate || "—"}</td>
                    <td className="p-3 text-xs">{trade.settlementDate || "—"}</td>
                    <td className="p-3 text-xs">{trade.units}</td>
                    <td className="p-3 text-xs">₹{investmentAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </PortalLayout>
  );
}
