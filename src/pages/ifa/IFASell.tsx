import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_IFA_CLIENTS, BONDS_CATALOG } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, X } from "lucide-react";

export default function IFASell() {
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedIsin, setSelectedIsin] = useState("");
  const [units, setUnits] = useState(0);
  const [desiredYield, setDesiredYield] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const client = MOCK_IFA_CLIENTS.find((c) => c.id === selectedClient);
  const bond = BONDS_CATALOG.find((b) => b.isin === selectedIsin);

  const approvalLink = `https://liquibonds.com/approve/IFA-SR-${Date.now().toString(36).toUpperCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(approvalLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <PortalLayout role="ifa">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Initiate Sell Order</h1>
          <p className="text-sm text-muted-foreground">Create a sell order on behalf of a client</p>
        </div>

        {/* Steps indicator */}
        <div className="flex gap-1">
          {["Client", "Bond", "Terms", "Review", "Link"].map((label, i) => (
            <div key={i} className="flex-1 space-y-1">
              <div className={`h-1.5 rounded-full ${i + 1 <= step ? "bg-accent" : "bg-border"}`} />
              <p className="text-[10px] text-muted-foreground text-center">{label}</p>
            </div>
          ))}
        </div>

        <div className="card-elevated p-5 space-y-5">
          {/* Step 1: Select Client */}
          {step === 1 && (
            <div className="space-y-3">
              <Label>Select Client</Label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full input-field bg-card"
              >
                <option value="">Choose a client...</option>
                {MOCK_IFA_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.panNumber})
                  </option>
                ))}
              </select>
              {client && (
                <div className="bg-muted/50 rounded p-3 text-xs">
                  <p className="font-medium">{client.name}</p>
                  <p className="text-muted-foreground">{client.email} · {client.phone}</p>
                  <p className="mt-1">{client.holdings.length} holdings available</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Bond */}
          {step === 2 && (
            <div className="space-y-3">
              <Label>Select Bond to Sell</Label>
              <select
                value={selectedIsin}
                onChange={(e) => setSelectedIsin(e.target.value)}
                className="w-full input-field bg-card"
              >
                <option value="">Choose a bond...</option>
                {client?.holdings.map((h) => (
                  <option key={h.orderId} value={h.bond.isin}>
                    {h.bond.isin} – {h.bond.name} ({h.availableUnits} units)
                  </option>
                ))}
              </select>
              {bond && (
                <div className="bg-muted/50 rounded p-3 text-xs space-y-1">
                  <p className="font-semibold">{bond.name}</p>
                  <p className="text-muted-foreground">
                    Coupon: {bond.couponRate}% · Rating: {bond.creditRating} · Maturity: {bond.maturityDate}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Units to Sell</Label>
                <Input
                  type="number"
                  min={1}
                  value={units || ""}
                  onChange={(e) => setUnits(parseInt(e.target.value) || 0)}
                  className="rounded-sm"
                />
              </div>
            </div>
          )}

          {/* Step 3: Terms */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Desired Yield (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={4}
                  max={25}
                  value={desiredYield}
                  onChange={(e) => setDesiredYield(e.target.value)}
                  className="rounded-sm"
                  placeholder="e.g. 9.25"
                />
              </div>
              <div className="space-y-2">
                <Label>Transaction Date</Label>
                <Input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="rounded-sm"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Order Summary</h3>
              <div className="bg-muted/50 rounded p-4 grid grid-cols-2 gap-y-2 text-xs">
                <span className="text-muted-foreground">Client</span>
                <span className="font-medium">{client?.name}</span>
                <span className="text-muted-foreground">Bond</span>
                <span className="font-medium">{bond?.name}</span>
                <span className="text-muted-foreground">Units</span>
                <span>{units}</span>
                <span className="text-muted-foreground">Yield</span>
                <span>{desiredYield}%</span>
                <span className="text-muted-foreground">Txn Date</span>
                <span>{transactionDate}</span>
              </div>
            </div>
          )}

          {/* Step 5: Approval Link */}
          {step === 5 && (
            <div className="space-y-4 text-center">
              {!linkGenerated ? (
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm"
                  onClick={() => setLinkGenerated(true)}
                >
                  Generate Approval Link
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center animate-check-mark">
                    <Check className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-sm font-semibold">Approval Link Generated</p>
                  <div className="flex items-center gap-2 bg-muted rounded p-3">
                    <p className="text-xs font-mono flex-1 truncate text-left">{approvalLink}</p>
                    <button onClick={handleCopyLink} className="shrink-0 text-accent hover:text-accent/80">
                      {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this link with {client?.name} via WhatsApp or email. The client will need to
                    verify via OTP and approve the sell order.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          {step > 1 && step < 5 ? (
            <Button variant="outline" className="rounded-sm text-sm" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < 4 && (
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
              disabled={
                (step === 1 && !selectedClient) ||
                (step === 2 && (!selectedIsin || units <= 0)) ||
                (step === 3 && (!desiredYield || !transactionDate))
              }
              onClick={() => setStep(step + 1)}
            >
              Continue
            </Button>
          )}
          {step === 4 && (
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
              onClick={() => setStep(5)}
            >
              Generate Approval Link
            </Button>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
