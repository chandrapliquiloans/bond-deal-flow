import { useMemo, useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_SELL_REQUESTS } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { SellRequest, SellRequestStatus } from "@/types";
import { OpsRequestDrawer } from "@/components/ops/OpsRequestDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Search, X as XIcon } from "lucide-react";
import { addWorkingDays, formatDate } from "@/lib/utils";

/** Which party needs to act next on this request */
function getBucket(req: SellRequest): "buyer" | "seller" {
  if (req.status === "sell_initiated") return "buyer";
  if (req.status === "negotiation") {
    const last = req.negotiationRounds[req.negotiationRounds.length - 1];
    return last?.proposedBy === "ops" ? "seller" : "buyer";
  }
  if (req.status === "buyer_approved") return "seller";
  if (req.status === "seller_approved") return "seller";
  return "buyer";
}

function BucketBadge({ bucket }: { bucket: "buyer" | "seller" }) {
  return bucket === "buyer" ? (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
      Awaiting Buyer
    </span>
  ) : (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">
      Awaiting Seller
    </span>
  );
}

// Statuses that are still pending / actionable
const PENDING_STATUSES: SellRequestStatus[] = [
  "sell_initiated",
  "negotiation",
  "buyer_approved",
  "seller_approved",
  "payment_done",
  "processing",
];

const STATUS_LABELS: Record<string, string> = {
  sell_initiated: "Sell Initiated",
  negotiation: "Negotiation",
  buyer_approved: "Buyer Approved",
  seller_approved: "Seller Approved",
  payment_done: "Payment Done",
  processing: "Processing",
};

type FilterValue = SellRequestStatus | "all";

const filterOptions: { label: string; value: FilterValue }[] = [
  { label: "All Pending", value: "all" },
  { label: "Sell Initiated", value: "sell_initiated" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Buyer Approved", value: "buyer_approved" },
  { label: "Seller Approved", value: "seller_approved" },
  { label: "Payment Done", value: "payment_done" },
  { label: "Processing", value: "processing" },
];

const minSettlementDate = formatDate(addWorkingDays(new Date(), 3));

function isSettlementValid(date: string): boolean {
  return date >= minSettlementDate;
}

interface DrawerState {
  request: SellRequest;
}

interface SearchFilters {
  id: string;
  investor: string;
  isin: string;
  settlementDate: string;
}

export default function OpsSellRequests() {
  const [requests, setRequests] = useState<SellRequest[]>([...MOCK_SELL_REQUESTS]);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    id: "",
    investor: "",
    isin: "",
    settlementDate: "",
  });

  const setSearchFilter = (key: keyof SearchFilters, value: string) =>
    setSearchFilters((prev) => ({ ...prev, [key]: value }));

  const clearSearchFilters = () =>
    setSearchFilters({ id: "", investor: "", isin: "", settlementDate: "" });

  const hasActiveSearchFilters = Object.values(searchFilters).some((v) => v !== "");

  const pending = requests.filter((r) => PENDING_STATUSES.includes(r.status));
  const byStatus = filter === "all" ? pending : pending.filter((r) => r.status === filter);

  const filtered = useMemo(() => {
    const id = searchFilters.id.toLowerCase();
    const investor = searchFilters.investor.toLowerCase();
    const isin = searchFilters.isin.toLowerCase();
    const date = searchFilters.settlementDate;
    return byStatus.filter((r) => {
      if (id && !r.id.toLowerCase().includes(id)) return false;
      if (investor && !r.investorName.toLowerCase().includes(investor)) return false;
      if (isin && !r.bond.isin.toLowerCase().includes(isin)) return false;
      if (date && r.transactionDate !== date) return false;
      return true;
    });
  }, [byStatus, searchFilters]);

  const openDrawer = (req: SellRequest) => {
    setDrawerState({ request: req });
  };

  const handleConfirm = (
    requestId: string,
    action: "cancel" | "reject" | "counter",
  ) => {
    const newStatus: SellRequestStatus =
      action === "cancel" ? "terminated" :
      action === "reject" ? "rejected" :
      "negotiation";

    setRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: newStatus } : r)
    );
  };

  // Summary counts
  const counts = PENDING_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = pending.filter((r) => r.status === s).length;
    return acc;
  }, {});

  return (
    <PortalLayout role="ops">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Sell Requests</h1>
          <p className="text-sm text-muted-foreground">
            Pending quotes — OPS acts as buyer in all negotiations
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {PENDING_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`card-elevated p-3 text-left space-y-1 transition-all hover:ring-2 hover:ring-accent/30 ${
                filter === s ? "ring-2 ring-accent" : ""
              }`}
            >
              <p className="text-lg font-semibold">{counts[s] ?? 0}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{STATUS_LABELS[s]}</p>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
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

        {/* Search filters */}
        <div className="card-elevated p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              Filter
            </div>
            {hasActiveSearchFilters && (
              <button
                onClick={clearSearchFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Request ID</Label>
              <Input
                value={searchFilters.id}
                onChange={(e) => setSearchFilter("id", e.target.value)}
                placeholder="e.g. SR-001"
                className="h-8 text-xs rounded-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Investor</Label>
              <Input
                value={searchFilters.investor}
                onChange={(e) => setSearchFilter("investor", e.target.value)}
                placeholder="Name"
                className="h-8 text-xs rounded-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">ISIN</Label>
              <Input
                value={searchFilters.isin}
                onChange={(e) => setSearchFilter("isin", e.target.value)}
                placeholder="e.g. INE002A07RY8"
                className="h-8 text-xs rounded-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Settlement Date</Label>
              <Input
                type="date"
                value={searchFilters.settlementDate}
                onChange={(e) => setSearchFilter("settlementDate", e.target.value)}
                className="h-8 text-xs rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Seller (Investor)</th>
                <th className="text-left p-3 font-medium">Bond</th>
                <th className="text-right p-3 font-medium">Units</th>
                <th className="text-right p-3 font-medium">Seller Yield</th>
                <th className="text-left p-3 font-medium">Settlement Date</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Bucket</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const settlementValid = isSettlementValid(req.transactionDate);
                const bucket = getBucket(req);
                return (
                  <tr key={req.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{req.id}</td>
                    <td className="p-3 text-xs">{req.investorName}</td>
                    <td className="p-3 text-xs truncate max-w-[160px]">
                      {req.bond.name.split(" ").slice(0, 3).join(" ")}
                    </td>
                    <td className="p-3 text-right text-xs">{req.units}</td>
                    <td className="p-3 text-right text-xs font-semibold text-accent">{req.desiredYield}%</td>
                    <td className="p-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={!settlementValid ? "text-destructive font-medium" : ""}>
                          {req.transactionDate}
                        </span>
                        {!settlementValid && (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        )}
                      </div>
                    </td>
                    <td className="p-3"><StatusBadge status={req.status} /></td>
                    <td className="p-3"><BucketBadge bucket={bucket} /></td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs rounded-sm"
                        onClick={() => openDrawer(req)}
                      >
                        Action
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No requests match the current filters.
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((req) => {
            const settlementValid = isSettlementValid(req.transactionDate);
            const bucket = getBucket(req);
            return (
              <div key={req.id} className="card-elevated p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{req.investorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.bond.name.split(" ").slice(0, 3).join(" ")}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">{req.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={req.status} />
                    <BucketBadge bucket={bucket} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Units</p>
                    <p className="font-medium">{req.units}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Seller Yield</p>
                    <p className="font-semibold text-accent">{req.desiredYield}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Settlement</p>
                    <div className="flex items-center gap-1">
                      <p className={`font-medium ${!settlementValid ? "text-destructive" : ""}`}>
                        {req.transactionDate}
                      </p>
                      {!settlementValid && <AlertTriangle className="h-3 w-3 text-destructive" />}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs rounded-sm"
                    onClick={() => openDrawer(req)}
                  >
                    Action
                  </Button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No requests match the current filters.
            </div>
          )}
        </div>
      </div>

      {drawerState && (
        <OpsRequestDrawer
          request={drawerState.request}
          onClose={() => setDrawerState(null)}
          onConfirm={(id, action) => handleConfirm(id, action)}
        />
      )}
    </PortalLayout>
  );
}
