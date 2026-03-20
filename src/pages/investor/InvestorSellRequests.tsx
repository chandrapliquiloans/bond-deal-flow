import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_SELL_REQUESTS } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { SellRequest, SellRequestStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, CreditCard, Clock, RotateCcw, ArrowLeftRight } from "lucide-react";

interface ActionModalProps {
  modalState: { isOpen: boolean; action: string; requestId: string; remark: string };
  requests: SellRequest[];
  onClose: () => void;
  onSubmit: () => void;
  onRemarkChange: (remark: string) => void;
}

function ActionModal({ modalState, requests, onClose, onSubmit, onRemarkChange }: ActionModalProps) {
  if (!modalState.isOpen) return null;

  const request = requests.find((r) => r.id === modalState.requestId);
  if (!request) return null;

  const getModalTitle = () => {
    switch (modalState.action) {
      case "Cancel": return "Cancel Sell Request";
      case "Reject": return "Reject Sell Request";
      case "Approve": return "Approve Sell Request";
      case "Make Payment": return "Make Payment";
      case "View Details": return "Transaction Details";
      case "Retry": return "Retry Sell Request";
      default: return "Action Required";
    }
  };

  const getModalDescription = () => {
    switch (modalState.action) {
      case "Cancel": return "Are you sure you want to cancel this sell request? This action cannot be undone.";
      case "Reject": return "Please provide a reason for rejecting this sell request.";
      case "Approve": return "Please confirm your approval for this sell request.";
      case "Make Payment": return "Complete the payment for this approved sell request.";
      case "View Details": return "View the complete transaction details.";
      case "Retry": return "Retry this sell request with updated parameters.";
      default: return "";
    }
  };

  const showRemarkField = ["Cancel", "Reject", "Approve", "Retry"].includes(modalState.action);
  const showPaymentFields = modalState.action === "Make Payment";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-foreground/50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card shadow-xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">{getModalTitle()}</h2>
            <p className="text-xs text-muted-foreground font-mono">{request.id}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Request Summary */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
            <p className="font-semibold">{request.bond.name}</p>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Units:</span>
              <span>{request.units}</span>
              <span className="text-muted-foreground">Yield:</span>
              <span>{request.desiredYield}%</span>
              <span className="text-muted-foreground">Settlement Date:</span>
              <span>{request.transactionDate}</span>
              <span className="text-muted-foreground">Status:</span>
              <StatusBadge status={request.status} />
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">{getModalDescription()}</p>

          {/* Remark Field */}
          {showRemarkField && (
            <div className="space-y-2">
              <Label className="text-sm">Remarks (Optional)</Label>
              <Textarea
                placeholder="Add any additional remarks..."
                value={modalState.remark}
                onChange={(e) => onRemarkChange(e.target.value)}
                className="min-h-[80px] text-sm rounded-sm"
              />
            </div>
          )}

          {/* Payment Fields */}
          {showPaymentFields && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Payment Amount</Label>
                <div className="text-lg font-semibold">₹{(request.units * 1000 * (1 + request.desiredYield / 100)).toFixed(2)}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Payment Method</Label>
                <select className="w-full rounded border border-input px-3 py-2 text-sm">
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                  <option>Net Banking</option>
                </select>
              </div>
              <div className="bg-muted/50 rounded p-3 text-xs text-muted-foreground">
                UTR will be assigned by the buyer (LiquiBonds Ops) after payment confirmation.
              </div>
            </div>
          )}

          {/* View Details */}
          {modalState.action === "View Details" && (
            <div className="space-y-3">
              {request.status === "settled" && request.utrNumber && (
                <div className="bg-settled/10 border border-settled/30 rounded p-3 space-y-1">
                  <p className="text-xs font-semibold text-settled">✅ Trade Settled</p>
                  <p className="text-xs text-muted-foreground">UTR Number</p>
                  <p className="text-sm font-mono font-semibold">{request.utrNumber}</p>
                </div>
              )}
              <div className="bg-muted/50 rounded p-3 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Settlement Date:</span>
                  <span>{request.settlementDate || "Pending"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UTR Number:</span>
                  <span className="font-mono">{request.utrNumber || "Pending"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RFQ Number:</span>
                  <span className="font-mono">{request.rfqNumber || "Pending"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 text-sm rounded-sm"
            >
              Cancel
            </Button>
            {modalState.action !== "View Details" && (
              <Button
                onClick={onSubmit}
                className="flex-1 text-sm rounded-sm bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {modalState.action === "Make Payment" ? "Complete Payment" : `Confirm ${modalState.action}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

interface NegotiationModalProps {
  request: SellRequest | null;
  onClose: () => void;
  onConfirm: (requestId: string, action: "accept" | "reject" | "counter", remark: string, counterYield?: string) => void;
}

function NegotiationModal({ request, onClose, onConfirm }: NegotiationModalProps) {
  const [counterYield, setCounterYield] = useState("");
  const [remark, setRemark] = useState("");
  const [action, setAction] = useState<"accept" | "reject" | "counter" | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!request) return null;

  const lastRound = request.negotiationRounds[request.negotiationRounds.length - 1];
  const isOpsProposal = lastRound?.proposedBy === "ops";
  const canRespond = isOpsProposal;
  const counterYieldValid =
    counterYield !== "" && parseFloat(counterYield) >= 4 && parseFloat(counterYield) <= 25;

  const handleConfirm = () => {
    onConfirm(request.id, action!, remark, action === "counter" ? counterYield : undefined);
    setConfirmed(true);
  };

  const handleBack = () => {
    setAction(null);
    setRemark("");
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card shadow-xl animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">Negotiate — {request.id}</h2>
            <p className="text-xs text-muted-foreground truncate max-w-xs">{request.bond.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {confirmed ? (
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto w-14 h-14 bg-success/10 rounded-full flex items-center justify-center">
                <Check className="h-7 w-7 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">
                  {action === "accept" ? "Quote Accepted!" : action === "reject" ? "Quote Rejected" : "Counter Quote Submitted!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action === "accept"
                    ? "You have accepted the buyer's proposal. Our team will proceed with settlement."
                    : action === "reject"
                    ? "You have rejected the proposal. The request has been closed."
                    : "Your counter quote has been sent to the buyer for review."}
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
              {/* Request summary */}
              <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-2">
                <p className="font-semibold text-sm">{request.bond.name}</p>
                <div className="grid grid-cols-2 gap-y-1.5">
                  <span className="text-muted-foreground">ISIN</span>
                  <span className="font-mono">{request.bond.isin}</span>
                  <span className="text-muted-foreground">Units</span>
                  <span>{request.units}</span>
                  <span className="text-muted-foreground">Purchase Yield</span>
                  <span className="font-semibold text-success">{request.buyYield ?? request.bond.couponRate}%</span>
                  <span className="text-muted-foreground">Your Desired Yield</span>
                  <span>{request.desiredYield}%</span>
                  <span className="text-muted-foreground">Settlement Date</span>
                  <span>{request.transactionDate}</span>
                </div>
              </div>

              {/* Negotiation history */}
              {request.negotiationRounds.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Negotiation History</h3>
                  {request.negotiationRounds.map((round) => (
                    <div
                      key={round.round}
                      className={`rounded p-3 text-xs border ${
                        round.proposedBy === "investor"
                          ? "bg-accent/5 border-accent/20"
                          : "bg-warning/5 border-warning/20"
                      }`}
                    >
                      <div className="flex justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Round {round.round}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            round.proposedBy === "investor"
                              ? "bg-accent/20 text-accent"
                              : "bg-warning/20 text-warning"
                          }`}>
                            {round.proposedBy === "investor" ? "You" : "Buyer"}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(round.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-4 mb-1">
                        <span>Yield: <strong>{round.yield}%</strong></span>
                        <span>Price: <strong>₹{round.price}</strong></span>
                      </div>
                      {round.note && (
                        <p className="text-muted-foreground italic mt-1 border-t border-border/40 pt-1">
                          "{round.note}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions — choose */}
              {canRespond && !action && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Respond to Buyer's Quote</h3>
                  <p className="text-xs text-muted-foreground">
                    Buyer proposed <strong>{lastRound.yield}%</strong> yield at <strong>₹{lastRound.price}</strong>.
                    Choose to accept, reject, or counter.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-success text-success-foreground hover:bg-success/90 rounded-sm text-sm gap-1"
                      onClick={() => setAction("accept")}
                    >
                      <Check className="h-4 w-4" /> Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive/10 rounded-sm text-sm gap-1"
                      onClick={() => setAction("reject")}
                    >
                      <X className="h-4 w-4" /> Reject
                    </Button>
                    <Button
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm gap-1"
                      onClick={() => setAction("counter")}
                    >
                      <ArrowLeftRight className="h-4 w-4" /> Counter
                    </Button>
                  </div>
                </div>
              )}

              {/* Accept form */}
              {action === "accept" && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="text-sm font-semibold">Accept Quote</h3>
                  <p className="text-sm text-muted-foreground">
                    You are accepting the buyer's quote of <strong>{lastRound?.yield}%</strong> yield
                    at <strong>₹{lastRound?.price}</strong>.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-sm">Remark (Optional)</Label>
                    <Textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="rounded-sm text-sm min-h-[80px]"
                      placeholder="Add a note for this acceptance..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-sm text-sm" onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-success text-success-foreground hover:bg-success/90 rounded-sm text-sm"
                      onClick={handleConfirm}
                    >
                      Confirm Accept
                    </Button>
                  </div>
                </div>
              )}

              {/* Reject form */}
              {action === "reject" && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="text-sm font-semibold">Reject Quote</h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to reject this quote? This will close the negotiation.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-sm">Remark (Optional)</Label>
                    <Textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="rounded-sm text-sm min-h-[80px]"
                      placeholder="Add a reason for rejection..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-sm text-sm" onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm text-sm"
                      onClick={handleConfirm}
                    >
                      Confirm Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Counter form */}
              {action === "counter" && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="text-sm font-semibold">Submit Counter Quote</h3>
                  <div className="space-y-2">
                    <Label className="text-sm">Your Yield (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={4}
                      max={25}
                      value={counterYield}
                      onChange={(e) => setCounterYield(e.target.value)}
                      className="rounded-sm"
                      placeholder="e.g. 9.15"
                    />
                    {counterYield && !counterYieldValid && (
                      <p className="text-xs text-destructive">Yield must be between 4% and 25%</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Remark (Optional)</Label>
                    <Textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="rounded-sm text-sm min-h-[80px]"
                      placeholder="Add a note for your counter quote..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-sm text-sm" onClick={handleBack}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
                      disabled={!counterYieldValid}
                      onClick={handleConfirm}
                    >
                      Submit Counter Quote
                    </Button>
                  </div>
                </div>
              )}

              {!canRespond && request.negotiationRounds.length > 0 && (
                <div className="bg-muted/50 rounded p-3 text-xs text-muted-foreground text-center">
                  Waiting for buyer's response to your latest quote.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

const filterOptions: { label: string; value: SellRequestStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Sell Initiated", value: "sell_initiated" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Buyer Approved", value: "buyer_approved" },
  { label: "Seller Approved", value: "seller_approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Payment Done", value: "payment_done" },
  { label: "Processing", value: "processing" },
  { label: "Settled", value: "settled" },
  { label: "Terminated", value: "terminated" },
];

const ACTION_STATUS_MAP: Record<string, SellRequestStatus> = {
  Cancel: "terminated",
  Reject: "rejected",
  Approve: "seller_approved",
  "Make Payment": "payment_done",
  Retry: "sell_initiated",
};

export default function InvestorSellRequests() {
  const [requests, setRequests] = useState<SellRequest[]>([...MOCK_SELL_REQUESTS]);
  const [filter, setFilter] = useState<SellRequestStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: string;
    requestId: string;
    remark: string;
  }>({
    isOpen: false,
    action: "",
    requestId: "",
    remark: "",
  });

  const updateStatus = (requestId: string, status: SellRequestStatus) => {
    setRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status } : r)
    );
  };

  const filtered =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status === filter);

  const selectedRequest = selectedId
    ? requests.find((r) => r.id === selectedId)
    : null;

  const handleAction = (action: string, requestId: string) => {
    setModalState({
      isOpen: true,
      action,
      requestId,
      remark: "",
    });
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      action: "",
      requestId: "",
      remark: "",
    });
  };

  const handleModalSubmit = () => {
    const newStatus = ACTION_STATUS_MAP[modalState.action];
    if (newStatus) updateStatus(modalState.requestId, newStatus);
    handleModalClose();
  };

  const handleNegotiationConfirm = (
    requestId: string,
    action: "accept" | "reject" | "counter",
  ) => {
    const newStatus: SellRequestStatus =
      action === "accept" ? "seller_approved" :
      action === "reject" ? "rejected" :
      "negotiation";
    updateStatus(requestId, newStatus);
  };

  const getActionButtons = (request: SellRequest) => {
    switch (request.status) {
      case "sell_initiated":
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2"
              onClick={() => handleAction("Cancel", request.id)}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        );
      case "negotiation":
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              className="text-xs h-7 px-2 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => setSelectedId(request.id)}
            >
              Negotiate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2"
              onClick={() => handleAction("Reject", request.id)}
            >
              <X className="h-3 w-3 mr-1" />
              Reject
            </Button>
          </div>
        );
      case "buyer_approved":
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              className="text-xs h-7 px-2 bg-success text-white hover:bg-success/90"
              onClick={() => handleAction("Approve", request.id)}
            >
              <Check className="h-3 w-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2"
              onClick={() => handleAction("Reject", request.id)}
            >
              <X className="h-3 w-3 mr-1" />
              Reject
            </Button>
          </div>
        );
      case "seller_approved":
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2"
              onClick={() => handleAction("Make Payment", request.id)}
            >
              <CreditCard className="h-3 w-3 mr-1" />
              Pay
            </Button>
          </div>
        );
      case "payment_done":
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2"
              disabled
            >
              <Clock className="h-3 w-3 mr-1" />
              Processing
            </Button>
          </div>
        );
      case "processing":
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2"
              disabled
            >
              <Clock className="h-3 w-3 mr-1" />
              In Progress
            </Button>
          </div>
        );
      case "settled":
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2"
              onClick={() => handleAction("View Details", request.id)}
            >
              View
            </Button>
          </div>
        );
      case "rejected":
        return null;
      case "terminated":
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2"
              onClick={() => handleAction("Retry", request.id)}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PortalLayout role="investor">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Sell Requests</h1>
          <p className="text-sm text-muted-foreground">Track and manage your sell orders through the complete lifecycle</p>
        </div>

        {/* Status Flow */}
        <div className="card-elevated p-4">
          <h3 className="text-sm font-semibold mb-3">Sell Request Flow</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-accent/10 text-accent rounded">1. Sell Initiated</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 bg-warning/10 text-warning rounded">2. Negotiation</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 bg-success/10 text-success rounded">3. Buyer Approved</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 bg-success/10 text-success rounded">4. Seller Approved</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 bg-executed/10 text-executed rounded">5. Payment Done</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 bg-warning/10 text-warning rounded">6. Processing</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-1 bg-settled/10 text-settled rounded">7. Settled</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Rejected or Terminated requests can be retried from any stage.
          </p>
        </div>

        {/* Filters */}
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

        {/* Desktop table */}
        <div className="hidden md:block card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left p-3 font-medium">Request ID</th>
                <th className="text-left p-3 font-medium">Bond</th>
                <th className="text-left p-3 font-medium">Order ID</th>
                <th className="text-right p-3 font-medium">Units</th>
                <th className="text-right p-3 font-medium">Yield</th>
                <th className="text-left p-3 font-medium">Settlement Date</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">{req.id}</td>
                  <td className="p-3 text-xs max-w-[200px] truncate">{req.bond.name.split(" ").slice(0, 3).join(" ")}</td>
                  <td className="p-3 font-mono text-xs">{req.orderId || "-"}</td>
                  <td className="p-3 text-right">{req.units}</td>
                  <td className="p-3 text-right">{req.desiredYield}%</td>
                  <td className="p-3 text-xs">{req.transactionDate}</td>
                  <td className="p-3">
                    <StatusBadge status={req.status} />
                    {req.status === "settled" && req.utrNumber && (
                      <p className="text-xs font-mono text-muted-foreground mt-1">{req.utrNumber}</p>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {getActionButtons(req)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((req) => (
            <div key={req.id} className="card-elevated p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{req.bond.name.split(" ").slice(0, 3).join(" ")}</p>
                  <p className="text-xs font-mono text-muted-foreground">{req.id}</p>
                  <p className="text-xs text-muted-foreground">Order: {req.orderId || "-"}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={req.status} />
                  {req.status === "settled" && req.utrNumber && (
                    <p className="text-xs font-mono text-muted-foreground">{req.utrNumber}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{req.units} units</span>
                <span>{req.desiredYield}% yield</span>
                <span>{req.transactionDate}</span>
              </div>
              <div className="flex justify-end pt-2 border-t border-border">
                {getActionButtons(req)}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No sell requests found for this filter.
          </div>
        )}
      </div>

      {/* Action Modal */}
      <ActionModal
        modalState={modalState}
        requests={requests}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        onRemarkChange={(remark) => setModalState((prev) => ({ ...prev, remark }))}
      />

      {/* Negotiation Modal */}
      <NegotiationModal
        request={selectedRequest ?? null}
        onClose={() => setSelectedId(null)}
        onConfirm={handleNegotiationConfirm}
      />
    </PortalLayout>
  );
}
