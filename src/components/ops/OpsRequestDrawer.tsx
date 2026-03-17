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
}

type ModalType = "accept" | "reject" | "counter" | null;

export function OpsRequestDrawer({ request, onClose }: OpsRequestDrawerProps) {
  const [modal, setModal] = useState<ModalType>(null);
  const [counterYield, setCounterYield] = useState("");
  const [counterNote, setCounterNote] = useState("");
  const [actionRemark, setActionRemark] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const canNegotiate = ["submitted", "under_review", "under_negotiation"].includes(request.status);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-foreground/40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card shadow-xl animate-slide-in-right overflow-y-auto">
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">{request.id}</h2>
            <p className="text-xs text-muted-foreground">{request.investorName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
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
              <span className="text-muted-foreground">Desired Yield</span>
              <span>{request.desiredYield}%</span>
              <span className="text-muted-foreground">Txn Date</span>
              <span>{request.transactionDate}</span>
              {request.dpAccountId && (
                <>
                  <span className="text-muted-foreground">DP Account</span>
                  <span className="font-mono">{request.dpAccountId}</span>
                </>
              )}
            </div>
          </div>

          {/* Negotiation history */}
          {request.negotiationRounds.length > 0 && (
            <div className="space-y-3">
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
                      Round {round.round} – {round.proposedBy === "ops" ? "Your Proposal" : "Investor"}
                    </span>
                    <span className="text-muted-foreground">{new Date(round.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>Yield: <strong>{round.yield}%</strong></span>
                    <span>Price: <strong>₹{round.price}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {canNegotiate && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Actions</h3>
              <div className="flex gap-3">
                <Button
                  className="bg-success text-success-foreground hover:bg-success/90 rounded-sm text-sm gap-1 flex-1"
                  onClick={() => {
                    setModal("accept");
                    setActionRemark("");
                    setCounterNote("");
                    setCounterYield("");
                    setConfirmed(false);
                  }}
                >
                  <Check className="h-4 w-4" /> Accept
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10 rounded-sm text-sm gap-1 flex-1"
                  onClick={() => {
                    setModal("reject");
                    setActionRemark("");
                    setCounterNote("");
                    setCounterYield("");
                    setConfirmed(false);
                  }}
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
                <Button
                  className="bg-warning text-warning-foreground hover:bg-warning/90 rounded-sm text-sm gap-1 flex-1"
                  onClick={() => {
                    setModal("counter");
                    setActionRemark("");
                    setCounterNote("");
                    setCounterYield("");
                    setConfirmed(false);
                  }}
                >
                  <ArrowLeftRight className="h-4 w-4" /> Counter
                </Button>
              </div>
            </div>
          )}

          {/* Settlement info */}
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
        </div>
      </div>

      {/* Action Modals */}
      {modal && (
        <div className="fixed inset-0 z-[60] bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold capitalize">
                {modal === "accept" ? "Accept Request" : modal === "reject" ? "Reject Request" : "Counter Proposal"}
              </h3>
              <button
                onClick={() => {
                  setModal(null);
                  setConfirmed(false);
                  setActionRemark("");
                  setCounterNote("");
                  setCounterYield("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {!confirmed ? (
                <>
                  <div className="bg-muted/50 rounded p-3 text-xs">
                    <p><strong>{request.investorName}</strong> · {request.bond.name.split(" ").slice(0, 3).join(" ")}</p>
                    <p className="text-muted-foreground">{request.units} units · {request.desiredYield}% yield</p>
                  </div>

                  {modal === "counter" && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Counter Yield (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={counterYield}
                          onChange={(e) => setCounterYield(e.target.value)}
                          className="rounded-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Note (optional)</Label>
                        <Input
                          value={counterNote}
                          onChange={(e) => setCounterNote(e.target.value)}
                          className="rounded-sm"
                          placeholder="Reason for counter..."
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {modal === "accept"
                      ? "Are you sure you want to accept this sell request at the investor's proposed terms?"
                      : modal === "reject"
                      ? "Are you sure you want to reject this sell request? This action cannot be undone."
                      : "Submit a counter-proposal to the investor. They will have 48 working hours to respond."}
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Remark</Label>
                      <Textarea
                        value={actionRemark}
                        onChange={(e) => setActionRemark(e.target.value)}
                        className="rounded-sm"
                        placeholder="Add a note for internal tracking (required)"
                        rows={3}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This remark will be recorded for audit purposes.
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      className="rounded-sm text-sm"
                      onClick={() => {
                        setModal(null);
                        setConfirmed(false);
                        setActionRemark("");
                        setCounterNote("");
                        setCounterYield("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={`rounded-sm text-sm ${
                        modal === "accept"
                          ? "bg-success text-success-foreground hover:bg-success/90"
                          : modal === "reject"
                          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          : "bg-warning text-warning-foreground hover:bg-warning/90"
                      }`}
                      disabled={!actionRemark.trim()}
                      onClick={() => setConfirmed(true)}
                    >
                      Confirm {modal === "accept" ? "Accept" : modal === "reject" ? "Reject" : "Counter"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="mx-auto w-12 h-12 bg-success/10 rounded-full flex items-center justify-center animate-check-mark">
                    <Check className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-sm font-semibold">
                    {modal === "accept" ? "Request Accepted" : modal === "reject" ? "Request Rejected" : "Counter Sent"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The investor has been notified.
                  </p>
                  <Button
                    className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
                    onClick={() => {
                      setModal(null);
                      setConfirmed(false);
                      setActionRemark("");
                      setCounterNote("");
                      setCounterYield("");
                      onClose();
                    }}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
