import { useState } from "react";
import { SellRequest } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Check, XCircle, ArrowLeftRight } from "lucide-react";

interface OpsRequestDrawerProps {
  request: SellRequest;
  onClose: () => void;
  onConfirm: (requestId: string, action: "cancel" | "reject" | "counter", remark: string, counterYield?: string) => void;
}

type ActionType = "cancel" | "reject" | "counter" | null;

export function OpsRequestDrawer({ request, onClose, onConfirm }: OpsRequestDrawerProps) {
  const [action, setAction] = useState<ActionType>(null);
  const [counterYield, setCounterYield] = useState("");
  const [remark, setRemark] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const lastRound = request.negotiationRounds[request.negotiationRounds.length - 1];
  const sellerYield = lastRound?.proposedBy === "investor" ? lastRound.yield : request.desiredYield;

  const counterYieldValid =
    counterYield !== "" && parseFloat(counterYield) >= 4 && parseFloat(counterYield) <= 25;

  const canSubmit =
    remark.trim() !== "" &&
    (action !== "counter" || counterYieldValid);

  const handleConfirm = () => {
    onConfirm(request.id, action!, remark, action === "counter" ? counterYield : undefined);
    setConfirmed(true);
  };

  const resetAction = () => {
    setAction(null);
    setCounterYield("");
    setRemark("");
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-foreground/40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card shadow-xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">{request.id}</h2>
            <p className="text-xs text-muted-foreground">{request.investorName} · Seller</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {confirmed ? (
            /* ── Success state ── */
            <div className="text-center space-y-4 py-10">
              <div className="mx-auto w-14 h-14 bg-success/10 rounded-full flex items-center justify-center">
                <Check className="h-7 w-7 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">
                  {action === "cancel" ? "Quote Accepted" : action === "reject" ? "Quote Rejected" : "Counter Sent"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action === "cancel"
                    ? "You have accepted the seller's quote. The investor will be notified."
                    : action === "reject"
                    ? "The quote has been rejected. The investor has been notified."
                    : `Counter yield of ${counterYield}% has been sent to the seller.`}
                </p>
              </div>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              {/* Status */}
              <div className="flex items-center gap-3">
                <StatusBadge status={request.status} />
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(request.updatedAt).toLocaleString()}
                </span>
              </div>

              {/* Bond info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-xs">
                <p className="font-semibold text-sm">{request.bond.name}</p>
                <div className="grid grid-cols-2 gap-y-1.5">
                  <span className="text-muted-foreground">ISIN</span>
                  <span className="font-mono">{request.bond.isin}</span>
                  <span className="text-muted-foreground">Source</span>
                  <span className="capitalize">{request.source}</span>
                  <span className="text-muted-foreground">Units</span>
                  <span>{request.units}</span>
                  <span className="text-muted-foreground">Seller Yield</span>
                  <span className="font-semibold text-accent">{request.desiredYield}%</span>
                  {request.buyYield && (
                    <>
                      <span className="text-muted-foreground">Buy Yield</span>
                      <span>{request.buyYield}%</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Settlement Date</span>
                  <span>{request.transactionDate}</span>
                  {request.dpAccountId && (
                    <>
                      <span className="text-muted-foreground">DP Account</span>
                      <span className="font-mono">{request.dpAccountId}</span>
                    </>
                  )}
                </div>
                {request.bankAccount && (
                  <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                    <p className="text-muted-foreground">Settlement Bank</p>
                    <div className="bg-muted/50 rounded p-2 space-y-0.5">
                      <p className="font-semibold">{request.bankAccount.bankName}</p>
                      <p className="font-mono text-muted-foreground">{request.bankAccount.accountNumber} · IFSC: {request.bankAccount.ifscCode}</p>
                      <p className="text-muted-foreground">{request.bankAccount.accountHolderName}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Negotiation history */}
              {request.negotiationRounds.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Negotiation History</h3>
                  {request.negotiationRounds.map((round) => (
                    <div
                      key={round.round}
                      className={`rounded p-3 text-xs border ${
                        round.proposedBy === "ops"
                          ? "bg-accent/5 border-accent/20"
                          : "bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">
                          Round {round.round} — {round.proposedBy === "ops" ? "Your Counter (Buyer)" : "Seller"}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(round.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <span>Yield: <strong>{round.yield}%</strong></span>
                        <span>Price: <strong>₹{round.price}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Buyer Approved — info only, no action buttons */}
              {request.status === "buyer_approved" && (
                <div className="border-t border-border pt-4">
                  <div className="bg-success/5 border border-success/20 rounded p-3 text-xs space-y-1">
                    <p className="font-medium text-success">Buyer has approved this quote</p>
                    <p className="text-muted-foreground">Awaiting seller confirmation to proceed to settlement.</p>
                  </div>
                </div>
              )}

              {/* Action buttons — hidden for buyer_approved */}
              {request.status !== "buyer_approved" && !action && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Take Action</h3>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-success text-success-foreground hover:bg-success/90 rounded-sm text-sm gap-1"
                      onClick={() => setAction("cancel")}
                    >
                      <Check className="h-4 w-4" /> Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive/10 rounded-sm text-sm gap-1"
                      onClick={() => setAction("reject")}
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-sm text-sm gap-1"
                      onClick={() => setAction("counter")}
                    >
                      <ArrowLeftRight className="h-4 w-4" /> Counter
                    </Button>
                  </div>
                </div>
              )}

              {/* Accept form */}
              {request.status !== "buyer_approved" && action === "cancel" && (
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-success">Accept Quote</h3>
                    <button onClick={resetAction} className="text-xs text-muted-foreground hover:text-foreground">
                      ← Change action
                    </button>
                  </div>
                  <div className="bg-success/5 border border-success/20 rounded p-3 text-xs space-y-1">
                    <p className="font-medium">You are accepting the seller's quote at:</p>
                    <p className="text-base font-semibold text-success">{request.desiredYield}% yield</p>
                    <p className="text-muted-foreground">{request.units} units · {request.bond.name.split(" ").slice(0, 3).join(" ")}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Remark <span className="text-destructive">*</span></Label>
                    <Textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="rounded-sm text-sm min-h-[80px]"
                      placeholder="Add a note for internal tracking..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">This remark will be recorded for audit purposes.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-sm text-sm" onClick={resetAction}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-success text-success-foreground hover:bg-success/90 rounded-sm text-sm"
                      disabled={!canSubmit}
                      onClick={handleConfirm}
                    >
                      Confirm Accept
                    </Button>
                  </div>
                </div>
              )}

              {/* Reject form */}
              {request.status !== "buyer_approved" && action === "reject" && (
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-destructive">Reject Quote</h3>
                    <button onClick={resetAction} className="text-xs text-muted-foreground hover:text-foreground">
                      ← Change action
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rejecting this quote will close the negotiation. The investor will be notified.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-sm">Reason for Rejection <span className="text-destructive">*</span></Label>
                    <Textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="rounded-sm text-sm min-h-[80px]"
                      placeholder="Provide a reason for rejecting this quote..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">This remark will be recorded for audit purposes.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-sm text-sm" onClick={resetAction}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm text-sm"
                      disabled={!canSubmit}
                      onClick={handleConfirm}
                    >
                      Confirm Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Counter form */}
              {request.status !== "buyer_approved" && action === "counter" && (
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-blue-600">Counter Proposal</h3>
                    <button onClick={resetAction} className="text-xs text-muted-foreground hover:text-foreground">
                      ← Change action
                    </button>
                  </div>

                  {/* Yield comparison */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded p-3 text-xs space-y-1 text-center">
                      <p className="text-muted-foreground">Seller Yield</p>
                      <p className="text-lg font-semibold text-accent">{sellerYield}%</p>
                      <p className="text-muted-foreground">{request.investorName}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs space-y-1 text-center">
                      <p className="text-muted-foreground">Your Counter</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {counterYield ? `${counterYield}%` : "—"}
                      </p>
                      <p className="text-muted-foreground">Buyer (OPS)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Counter Yield (%) <span className="text-destructive">*</span></Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={4}
                      max={25}
                      value={counterYield}
                      onChange={(e) => setCounterYield(e.target.value)}
                      className="rounded-sm"
                      placeholder="e.g. 9.50"
                    />
                    {counterYield && !counterYieldValid && (
                      <p className="text-xs text-destructive">Yield must be between 4% and 25%</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Remark <span className="text-destructive">*</span></Label>
                    <Textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="rounded-sm text-sm min-h-[80px]"
                      placeholder="Add a note for internal tracking..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">This remark will be recorded for audit purposes.</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-sm text-sm" onClick={resetAction}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-sm text-sm"
                      disabled={!canSubmit}
                      onClick={handleConfirm}
                    >
                      Send Counter Proposal
                    </Button>
                  </div>
                </div>
              )}

              {/* Settled info */}
              {request.status === "settled" && (
                <div className="border-2 border-settled/30 rounded-lg p-4 text-xs space-y-2">
                  <p className="font-semibold text-settled text-sm">✅ Settled</p>
                  <div className="grid grid-cols-2 gap-y-1">
                    <span className="text-muted-foreground">Settlement Date</span>
                    <span>{request.settlementDate}</span>
                    <span className="text-muted-foreground">UTR</span>
                    <span className="font-mono">{request.utrNumber}</span>
                    <span className="text-muted-foreground">RFQ</span>
                    <span className="font-mono">{request.rfqNumber}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
