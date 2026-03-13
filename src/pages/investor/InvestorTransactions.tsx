import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_SELL_REQUESTS } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";

export default function InvestorTransactions() {
  const completed = MOCK_SELL_REQUESTS.filter((r) =>
    ["settled", "executed"].includes(r.status)
  );

  return (
    <PortalLayout role="investor">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Transaction History</h1>
          <p className="text-sm text-muted-foreground">Completed and settled trades</p>
        </div>

        {completed.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            No completed transactions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map((req) => (
              <div key={req.id} className="card-elevated p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{req.bond.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{req.id}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Units</p>
                    <p className="font-medium">{req.units}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Yield</p>
                    <p className="font-medium">{req.desiredYield}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Settlement</p>
                    <p className="font-medium">{req.settlementDate || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">UTR</p>
                    <p className="font-mono font-medium text-[11px]">{req.utrNumber || "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
