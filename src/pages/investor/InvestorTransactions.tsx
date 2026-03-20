import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_PORTFOLIO, MOCK_SELL_REQUESTS } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { BankAccount } from "@/types";

type TxType = "all" | "buy" | "sell";

interface UnifiedTransaction {
  id: string;
  type: "buy" | "sell";
  bondName: string;
  isin: string;
  units: number;
  price: number;
  yield?: number;
  date: string;
  status: string;
  utrNumber?: string;
  bankAccount?: BankAccount;
}

const buyTransactions: UnifiedTransaction[] = MOCK_PORTFOLIO.map((o) => ({
  id: o.orderId,
  type: "buy",
  bondName: o.bond.name,
  isin: o.bond.isin,
  units: o.units,
  price: o.purchasePrice,
  date: o.purchaseDate,
  status: "settled",
}));

const sellTransactions: UnifiedTransaction[] = MOCK_SELL_REQUESTS.map((r) => ({
  id: r.id,
  type: "sell",
  bondName: r.bond.name,
  isin: r.bond.isin,
  units: r.units,
  price: r.bond.faceValue,
  yield: r.desiredYield,
  date: r.transactionDate,
  status: r.status,
  utrNumber: r.utrNumber,
  bankAccount: r.bankAccount,
}));

const allTransactions: UnifiedTransaction[] = [
  ...buyTransactions,
  ...sellTransactions,
].sort((a, b) => (a.date > b.date ? -1 : 1));

const TYPE_TABS: { label: string; value: TxType }[] = [
  { label: "All", value: "all" },
  { label: "Buy", value: "buy" },
  { label: "Sell", value: "sell" },
];

export default function InvestorTransactions() {
  const [activeTab, setActiveTab] = useState<TxType>("all");

  const filtered =
    activeTab === "all"
      ? allTransactions
      : allTransactions.filter((t) => t.type === activeTab);

  return (
    <PortalLayout role="investor">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground">All buy and sell transactions</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-elevated p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{allTransactions.length}</p>
          </div>
          <div className="card-elevated p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Buy Orders</p>
            <p className="text-2xl font-semibold text-success">{buyTransactions.length}</p>
          </div>
          <div className="card-elevated p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Sell Requests</p>
            <p className="text-2xl font-semibold text-accent">{sellTransactions.length}</p>
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-2">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${
                activeTab === tab.value
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Bond</th>
                <th className="text-left p-3 font-medium">ISIN</th>
                <th className="text-right p-3 font-medium">Units</th>
                <th className="text-right p-3 font-medium">Price</th>
                <th className="text-right p-3 font-medium">Yield</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">UTR</th>
                <th className="text-left p-3 font-medium">Bank</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={`${tx.type}-${tx.id}`} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">{tx.id}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        tx.type === "buy"
                          ? "bg-success/10 text-success"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {tx.type === "buy" ? "Buy" : "Sell"}
                    </span>
                  </td>
                  <td className="p-3 text-xs max-w-[180px] truncate">{tx.bondName.split(" ").slice(0, 3).join(" ")}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{tx.isin}</td>
                  <td className="p-3 text-right text-xs">{tx.units}</td>
                  <td className="p-3 text-right text-xs">₹{tx.price.toLocaleString()}</td>
                  <td className="p-3 text-right text-xs">{tx.yield != null ? `${tx.yield}%` : "—"}</td>
                  <td className="p-3 text-xs">{tx.date}</td>
                  <td className="p-3 text-xs font-mono">
                    {tx.type === "sell" ? (tx.utrNumber ?? <span className="text-muted-foreground">—</span>) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-3 text-xs">
                    {tx.bankAccount ? (
                      <div>
                        <p className="font-medium">{tx.bankAccount.bankName}</p>
                        <p className="font-mono text-muted-foreground">{tx.bankAccount.accountNumber}</p>
                      </div>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={tx.status as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No transactions found.
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((tx) => (
            <div key={`${tx.type}-${tx.id}`} className="card-elevated p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{tx.bondName.split(" ").slice(0, 3).join(" ")}</p>
                  <p className="text-xs font-mono text-muted-foreground">{tx.id}</p>
                  <p className="text-xs font-mono text-muted-foreground">{tx.isin}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      tx.type === "buy"
                        ? "bg-success/10 text-success"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {tx.type === "buy" ? "Buy" : "Sell"}
                  </span>
                  <StatusBadge status="settled" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Units</p>
                  <p className="font-medium">{tx.units}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">₹{tx.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{tx.type === "sell" ? "Yield" : "Date"}</p>
                  <p className="font-medium">{tx.type === "sell" && tx.yield != null ? `${tx.yield}%` : tx.date}</p>
                </div>
              </div>
              {tx.type === "buy" && (
                <p className="text-xs text-muted-foreground">Date: {tx.date}</p>
              )}
              {(tx.utrNumber || tx.bankAccount) && (
                <div className="pt-2 border-t border-border space-y-1.5 text-xs">
                  {tx.type === "sell" && tx.utrNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UTR</span>
                      <span className="font-mono font-medium">{tx.utrNumber}</span>
                    </div>
                  )}
                  {tx.bankAccount && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Bank</span>
                      <div className="text-right">
                        <p className="font-medium">{tx.bankAccount.bankName}</p>
                        <p className="font-mono text-muted-foreground">{tx.bankAccount.accountNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
