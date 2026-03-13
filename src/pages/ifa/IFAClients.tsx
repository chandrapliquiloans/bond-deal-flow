import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_IFA_CLIENTS } from "@/data/mockData";

export default function IFAClients() {
  return (
    <PortalLayout role="ifa">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage your client portfolio</p>
        </div>

        <div className="space-y-3">
          {MOCK_IFA_CLIENTS.map((client) => (
            <div key={client.id} className="card-elevated p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.email} · {client.phone}</p>
                </div>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{client.panNumber}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{client.holdings.length}</span> bond holdings ·{" "}
                <span className="font-medium text-foreground">
                  {client.holdings.reduce((s, h) => s + h.availableUnits, 0)}
                </span>{" "}
                total units
              </div>
              <div className="flex flex-wrap gap-2">
                {client.holdings.map((h) => (
                  <span key={h.orderId} className="text-[11px] bg-muted rounded px-2 py-1">
                    {h.bond.isin} · {h.availableUnits}u
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
