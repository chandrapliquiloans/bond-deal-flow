import { useState } from "react";
import { SellRequest } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowLeft, Clock, MessageSquare } from "lucide-react";

interface NegotiationDetailProps {
  request: SellRequest;
  onBack: () => void;
}

export function NegotiationDetail({ request, onBack }: NegotiationDetailProps) {
  const [counterYield, setCounterYield] = useState("");
  const [settlementDate, setSettlementDate] = useState("");
  const [showSettlement, setShowSettlement] = useState(false);

  const lastRound = request.negotiationRounds[request.negotiationRounds.length - 1];
  const isOpsProposal = lastRound?.proposedBy === "ops";
  const canRespond = request.status === "under_negotiation" && isOpsProposal;
  const needsSettlement = request.status === "accepted" && !request.settlementDate;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Sell Requests
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{request.id}</h1>
          <p className="text-sm text-muted-foreground">{request.bond.name}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* T-day warning */}
      {["submitted", "under_review", "under_negotiation"].includes(request.status) && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-warning">Transaction Date: {request.transactionDate}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Order will be auto-terminated if not resolved by this date.
            </p>
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="card-elevated p-5">
        <h2 className="text-sm font-semibold mb-3">Order Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 text-xs">
          <div>
            <p className="text-muted-foreground">ISIN</p>
            <p className="font-mono font-medium">{request.bond.isin}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Units</p>
            <p className="font-medium">{request.units}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Source</p>
            <p className="font-medium capitalize">{request.source}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Desired Yield</p>
            <p className="font-medium">{request.desiredYield}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
          {request.dpAccountId && (
            <div>
              <p className="text-muted-foreground">DP Account</p>
              <p className="font-mono font-medium">{request.dpAccountId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Negotiation History - Sheet Trigger */}
      {request.negotiationRounds.length > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              View Negotiation History ({request.negotiationRounds.length} rounds)
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Negotiation History</SheetTitle>
            </SheetHeader>
            <div className="space-y-3 mt-4">
              {request.negotiationRounds.map((round) => (
                <div
                  key={round.round}
                  className={`rounded-lg p-3 text-xs border ${
                    round.proposedBy === "investor"
                      ? "bg-accent/5 border-accent/20"
                      : "bg-warning/5 border-warning/20"
                  }`}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold capitalize">
                      Round {round.round} – {round.proposedBy === "investor" ? "Your Proposal" : "Ops Counter"}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(round.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span>Yield: <strong>{round.yield}%</strong></span>
                    <span>Price: <strong>₹{round.price}</strong></span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Deadline: {new Date(round.deadline).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Action: Respond to Ops proposal */}
      {canRespond && (
        <div className="card-elevated p-5 space-y-4">
          <h2 className="text-sm font-semibold">Respond to Ops Proposal</h2>
          <p className="text-xs text-muted-foreground">
            Ops proposed <strong>{lastRound.yield}%</strong> yield at <strong>₹{lastRound.price}</strong>.
            You can accept, reject, or counter.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-success text-success-foreground hover:bg-success/90 rounded-sm text-sm">
              Accept Proposal
            </Button>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 rounded-sm text-sm">
              Reject
            </Button>
          </div>
          {request.negotiationRounds.length < 3 && (
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-xs font-medium">Or submit a counter-proposal:</p>
              <div className="flex gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Your Yield (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={counterYield}
                    onChange={(e) => setCounterYield(e.target.value)}
                    className="w-28 rounded-sm text-sm"
                    placeholder="e.g. 9.15"
                  />
                </div>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm">
                  Submit Counter
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settlement date confirmation */}
      {needsSettlement && (
        <div className="card-elevated p-5 space-y-4 border-2 border-success/30">
          <h2 className="text-sm font-semibold text-success">🎉 Order Accepted!</h2>
          <p className="text-xs text-muted-foreground">
            Please confirm your preferred settlement date to proceed.
          </p>
          <div className="flex gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Settlement Date</label>
              <Input
                type="date"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className="rounded-sm text-sm"
              />
            </div>
            <Button
              className="bg-success text-success-foreground hover:bg-success/90 rounded-sm text-sm"
              disabled={!settlementDate}
            >
              Confirm Settlement
            </Button>
          </div>
        </div>
      )}

      {/* Settlement info for settled */}
      {request.status === "settled" && (
        <div className="card-elevated p-5 border-2 border-settled/30">
          <h2 className="text-sm font-semibold text-settled mb-3">✅ Trade Settled</h2>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div>
              <p className="text-muted-foreground">Settlement Date</p>
              <p className="font-medium">{request.settlementDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">UTR Number</p>
              <p className="font-mono font-medium">{request.utrNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">RFQ Number</p>
              <p className="font-mono font-medium">{request.rfqNumber}</p>
            </div>
          </div>
        </div>
      )}

      {request.status === "terminated" && (
        <div className="bg-terminated/10 border border-terminated/30 rounded-lg p-4 text-sm">
          <p className="font-semibold text-terminated">❌ Order Terminated</p>
          <p className="text-xs text-muted-foreground mt-1">
            This order was auto-terminated as the negotiation was not resolved by the transaction date.
          </p>
        </div>
      )}
    </div>
  );
}
