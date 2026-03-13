import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_SELL_REQUESTS } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";

export default function IFATransactions() {
  return (
    <PortalLayout role="ifa">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Client Transactions</h1>
          <p className="text-sm text-muted-foreground">All sell orders across clients</p>
        </div>

        <div className="space-y-3">
          {MOCK_SELL_REQUESTS.map((req) => (
            <div key={req.id} className="card-elevated p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{req.investorName}</p>
                  <p className="text-xs text-muted-foreground">{req.bond.name.split(" ").slice(0, 3).join(" ")}</p>
                  <p className="text-xs font-mono text-muted-foreground">{req.id}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>{req.units} units</span>
                <span>{req.desiredYield}% yield</span>
                <span>{req.transactionDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
