import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_IFA_CLIENTS, MOCK_TRADES } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Copy, Check } from "lucide-react";

export default function IFAClients() {
  const [selectedClient, setSelectedClient] = useState<typeof MOCK_IFA_CLIENTS[0] | null>(null);
  const [sellModal, setSellModal] = useState<typeof MOCK_TRADES[0] | null>(null);
  const [sellUnits, setSellUnits] = useState("");
  const [sellYield, setSellYield] = useState("");
  const [sellStep, setSellStep] = useState(1);
  const [sellLink, setSellLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);

  const clientTransactions = selectedClient
    ? MOCK_TRADES.filter((trade) => trade.investorName === selectedClient.name)
    : [];

  const handleSellClick = (trade: typeof MOCK_TRADES[0]) => {
    setSellModal(trade);
    setSellUnits("");
    setSellYield("");
    setSellLink("");
    setSellStep(1);
    setLinkGenerated(false);
    setLinkCopied(false);
  };

  const handleGenerateSellLink = () => {
    if (!sellUnits || !sellYield || !sellModal) return;
    setSellStep(2);
  };

  const handleGenerateApprovalLink = () => {
    const randomId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const link = `${window.location.origin}/approve/IFA-SR-${randomId}`;
    setSellLink(link);
    setLinkGenerated(true);
  };

  const handleCopyLink = () => {
    if (sellLink) {
      navigator.clipboard.writeText(sellLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <>
      <PortalLayout role="ifa">
        <div className="space-y-5">
          <div>
            <h1 className="text-xl font-semibold">Clients</h1>
            <p className="text-sm text-muted-foreground">Manage your client portfolio</p>
          </div>

          <div className="space-y-3">
            {MOCK_IFA_CLIENTS.map((client) => (
              <div
                key={client.id}
                className="card-elevated p-4 space-y-3"
              >
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
                <Button
                  variant="outline"
                  className="text-xs rounded-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClient(client);
                  }}
                >
                  View Transactions
                </Button>
              </div>
            ))}
          </div>
        </div>
      </PortalLayout>

      {/* Client Transactions Drawer */}
      {selectedClient && (
        <>
          <div className="fixed right-0 top-0 bottom-0 z-60 w-full max-w-2xl bg-card shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold">{selectedClient.name}</h2>
                <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div>
                <h3 className="text-sm font-semibold">All Transactions</h3>
              </div>

              <div className="card-elevated overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground">
                      <th className="text-left p-3 font-medium">ID</th>
                      <th className="text-left p-3 font-medium">Bond</th>
                      <th className="text-right p-3 font-medium">Units</th>
                      <th className="text-right p-3 font-medium">Yield</th>
                      <th className="text-left p-3 font-medium">Settlement</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-right p-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientTransactions.map((trade) => (
                      <tr key={trade.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs">{trade.id}</td>
                        <td className="p-3 text-xs truncate max-w-[180px]">{trade.bond.name}</td>
                        <td className="p-3 text-right">{trade.units}</td>
                        <td className="p-3 text-right">{trade.settledYield ?? "-"}%</td>
                        <td className="p-3 text-xs">{trade.settlementDate}</td>
                        <td className="p-3 text-xs capitalize">{trade.status}</td>
                        <td className="p-3 text-right">
                          <Button
                            variant="outline"
                            className="text-xs rounded-sm"
                            onClick={() => handleSellClick(trade)}
                          >
                            Sell
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {clientTransactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sell Modal */}
      {sellModal && selectedClient && (
        <div className="fixed inset-0 z-70 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold">
                {sellStep === 1 ? "Create Sell Order" : "Generate Approval Link"}
              </h3>
              <button
                onClick={() => setSellModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {sellStep === 1 && (
                <>
                  <div className="bg-muted/50 rounded p-3 text-xs">
                    <p className="font-medium text-foreground">{sellModal.bond.name}</p>
                    <p className="text-muted-foreground">Transaction ID: {sellModal.id}</p>
                    <p className="text-muted-foreground">Available Units: {sellModal.units}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Units to Sell</Label>
                    <Input
                      type="number"
                      min="1"
                      max={sellModal.units}
                      value={sellUnits}
                      onChange={(e) => setSellUnits(e.target.value)}
                      className="rounded-sm"
                      placeholder="Enter units"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Desired Yield (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={sellYield}
                      onChange={(e) => setSellYield(e.target.value)}
                      className="rounded-sm"
                      placeholder="Enter yield"
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      className="rounded-sm text-sm"
                      onClick={() => setSellModal(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
                      disabled={!sellUnits || !sellYield}
                      onClick={handleGenerateSellLink}
                    >
                      Continue
                    </Button>
                  </div>
                </>
              )}

              {sellStep === 2 && (
                <>
                  <div className="bg-muted/50 rounded p-3 text-xs space-y-2">
                    <p className="font-medium text-foreground">Order Summary</p>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Client:</span>
                      <span className="font-medium">{selectedClient.name}</span>
                      <span className="text-muted-foreground">Bond:</span>
                      <span className="font-medium">{sellModal.bond.name}</span>
                      <span className="text-muted-foreground">Units:</span>
                      <span>{sellUnits}</span>
                      <span className="text-muted-foreground">Yield:</span>
                      <span>{sellYield}%</span>
                    </div>
                  </div>

                  {!linkGenerated ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Review the details above. Click "Generate Link" to create an approval link for {selectedClient.name}.
                      </p>
                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="outline"
                          className="rounded-sm text-sm"
                          onClick={() => setSellStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
                          onClick={handleGenerateApprovalLink}
                        >
                          Generate Link
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-success/10 border border-success/20 rounded p-3 space-y-3">
                        <div className="flex justify-center">
                          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                            <Check className="h-6 w-6 text-success" />
                          </div>
                        </div>
                        <p className="text-xs font-medium text-center text-success">Approval Link Generated</p>
                        
                        <div className="flex items-center gap-2 bg-card border border-input rounded p-2">
                          <input
                            type="text"
                            value={sellLink}
                            readOnly
                            className="flex-1 text-xs bg-transparent outline-none font-mono"
                          />
                          <button
                            onClick={handleCopyLink}
                            className="shrink-0 text-accent hover:text-accent/80"
                          >
                            {linkCopied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Share this link with {selectedClient.name} via email or WhatsApp. They will need to verify and approve the sell order.
                        </p>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="outline"
                          className="rounded-sm text-sm"
                          onClick={() => setSellModal(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
                          onClick={() => {
                            alert(
                              `Sell request link sent to ${selectedClient.email}\n\nLink: ${sellLink}`
                            );
                            setSellModal(null);
                          }}
                        >
                          Send Email & Close
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
