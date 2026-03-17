import { useState, useEffect } from "react";
import { X, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_PORTFOLIO, BONDS_CATALOG } from "@/data/mockData";
import { Bond } from "@/types";
import { addWorkingDays, formatDate } from "@/lib/utils";

interface SellStepperProps {
  type: "internal" | "external";
  orderId: string | null;
  onClose: () => void;
}

export function SellStepper({ type, orderId, onClose }: SellStepperProps) {
  // Internal stepper state
  const [step, setStep] = useState(1);
  const totalSteps = 4; // internal only uses stepper

  const order = orderId ? MOCK_PORTFOLIO.find((o) => o.orderId === orderId) : undefined;
  const [unitsToSell, setUnitsToSell] = useState(0);

  // External sell state (single modal, no steps)
  const [selectedIsin, setSelectedIsin] = useState("");
  const [externalUnits, setExternalUnits] = useState(0);

  // Shared state
  const [desiredYield, setDesiredYield] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [settlementDate, setSettlementDate] = useState("");
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Calculate settlement date (T+2 working days) when transaction date changes
  useEffect(() => {
    if (transactionDate) {
      const tDate = new Date(transactionDate);
      const settlement = addWorkingDays(tDate, 2);
      setSettlementDate(formatDate(settlement));
    } else {
      setSettlementDate("");
    }
  }, [transactionDate]);

  const totalUnitsToSell = type === "internal" ? unitsToSell : externalUnits;

  const selectedBond: Bond | undefined =
    type === "internal"
      ? order?.bond
      : BONDS_CATALOG.find((b) => b.isin === selectedIsin);

  const yieldValid =
    desiredYield !== "" &&
    parseFloat(desiredYield) >= 4 &&
    parseFloat(desiredYield) <= 25;

  // Internal stepper validation
  const canProceedStep = (): boolean => {
    if (step === 1) return unitsToSell > 0 && unitsToSell <= (order?.availableUnits ?? 0);
    if (step === 2) return yieldValid && transactionDate !== "";
    if (step === 3) return disclaimerChecked;
    return false;
  };

  // External single-modal validation
  const canSubmitExternal =
    selectedIsin !== "" &&
    externalUnits > 0 &&
    yieldValid &&
    transactionDate !== "" &&
    disclaimerChecked;

  const handleConfirm = () => {
    setConfirmed(true);
    if (type === "internal") setStep(totalSteps);
  };

  const stepLabels = ["Select Units", "Yield & Date", "Review & Confirm", "Done"];

  // ─── EXTERNAL: Single modal (no stepper) ───
  if (type === "external") {
    return (
      <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
        <div className="bg-card w-full max-w-lg rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-semibold">Sell External Bond</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 space-y-5">
            {!confirmed ? (
              <>
                {/* Bond Selection */}
                <div className="space-y-2">
                  <Label className="text-sm">Select Bond ISIN</Label>
                  <select
                    value={selectedIsin}
                    onChange={(e) => setSelectedIsin(e.target.value)}
                    className="w-full input-field bg-card"
                  >
                    <option value="">Search and select ISIN...</option>
                    {BONDS_CATALOG.map((b) => (
                      <option key={b.isin} value={b.isin}>
                        {b.isin} – {b.name}
                      </option>
                    ))}
                  </select>
                  {selectedBond && (
                    <div className="bg-muted/50 rounded p-3 text-xs space-y-1">
                      <p className="font-semibold">{selectedBond.name}</p>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <span>Coupon: {selectedBond.couponRate}%</span>
                        <span>Rating: {selectedBond.creditRating}</span>
                        <span>Maturity: {selectedBond.maturityDate}</span>
                        <span>Face Value: ₹{selectedBond.faceValue}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Number of Units */}
                <div className="space-y-2">
                  <Label className="text-sm">Number of Units</Label>
                  <Input
                    type="number"
                    min={1}
                    value={externalUnits || ""}
                    onChange={(e) => setExternalUnits(parseInt(e.target.value) || 0)}
                    className="rounded-sm"
                    placeholder="Enter number of units"
                  />
                </div>

                {/* Desired Yield */}
                <div className="space-y-2">
                  <Label className="text-sm">Desired Yield (%)</Label>
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
                  {desiredYield && !yieldValid && (
                    <p className="text-xs text-destructive">Yield must be between 4% and 25%</p>
                  )}
                </div>

                {/* Transaction Date */}
                <div className="space-y-2">
                  <Label className="text-sm">Transaction Date</Label>
                  <Input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="rounded-sm"
                  />
                  {settlementDate && (
                    <p className="text-xs text-muted-foreground">
                      Settlement Date: <span className="font-semibold">{settlementDate}</span> (T+2 working days)
                    </p>
                  )}
                  <div className="bg-warning/10 border border-warning/30 rounded p-3 text-xs text-warning">
                    <strong>⚠ T-Day Warning:</strong> If negotiation is not resolved by the transaction
                    date, the order will be automatically terminated at 00:00 IST.
                  </div>
                </div>

                {/* Disclaimer */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disclaimerChecked}
                    onChange={(e) => setDisclaimerChecked(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I confirm that the above details are correct. I understand that sell orders are
                    subject to market conditions and negotiation with LiquiBonds Operations. I agree
                    to the Terms of Service and understand the T-day termination policy.
                  </span>
                </label>
              </>
            ) : (
              <div className="text-center space-y-4 py-6">
                <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center animate-check-mark">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Sell Request Submitted!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your request ID is <span className="font-mono font-semibold">SR-006</span>
                  </p>
                </div>
                <div className="bg-accent/5 rounded p-3 text-xs text-muted-foreground">
                  Our Operations Team will review your request shortly. You'll receive updates via
                  email and in-app notifications.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 border-t border-border">
            {confirmed ? (
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm" onClick={onClose}>
                Done
              </Button>
            ) : (
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
                disabled={!canSubmitExternal}
                onClick={handleConfirm}
              >
                Confirm Sell Request
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── INTERNAL: Stepper flow (unchanged) ───
  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold">Sell LiquiBonds Holdings</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper indicator */}
        <div className="flex items-center gap-1 px-4 pt-4">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i + 1 <= step ? "bg-accent" : "bg-border"
                }`}
              />
            </div>
          ))}
        </div>
        <p className="px-4 pt-1 text-xs text-muted-foreground">
          Step {Math.min(step, totalSteps)} of {totalSteps}: {stepLabels[Math.min(step, totalSteps) - 1]}
        </p>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Step 1: Select Units */}
          {step === 1 && order && (
            <div className="space-y-4">
              <p className="text-sm">
                Sell from order <span className="font-mono font-semibold">{order.orderId}</span>
              </p>
              <div className="bg-muted/50 rounded p-3 text-xs space-y-1">
                <p className="font-semibold">{order.bond.name}</p>
                <p className="text-muted-foreground font-mono">{order.bond.isin}</p>
                <div className="flex gap-4 mt-1 text-muted-foreground">
                  <span>Purchased: {order.purchaseDate}</span>
                  <span>Price: ₹{order.purchasePrice}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Units to Sell (max {order.availableUnits})</Label>
                <Input
                  type="number"
                  min={1}
                  max={order.availableUnits}
                  value={unitsToSell || ""}
                  onChange={(e) => {
                    const val = Math.min(
                      Math.max(0, parseInt(e.target.value) || 0),
                      order.availableUnits
                    );
                    setUnitsToSell(val);
                  }}
                  className="rounded-sm"
                  placeholder={`1 – ${order.availableUnits}`}
                />
                {unitsToSell > order.availableUnits && (
                  <p className="text-xs text-destructive">Cannot exceed {order.availableUnits} units</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Yield & Date */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Desired Yield (%)</Label>
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
                {desiredYield && !yieldValid && (
                  <p className="text-xs text-destructive">Yield must be between 4% and 25%</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Transaction Date</Label>
                <Input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="rounded-sm"
                />
                {settlementDate && (
                  <p className="text-xs text-muted-foreground">
                    Settlement Date: <span className="font-semibold">{settlementDate}</span> (T+2 working days)
                  </p>
                )}
                <div className="bg-warning/10 border border-warning/30 rounded p-3 text-xs text-warning">
                  <strong>⚠ T-Day Warning:</strong> If negotiation is not resolved by the transaction
                  date, the order will be automatically terminated at 00:00 IST.
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && !confirmed && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded p-4 space-y-2 text-sm">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Bond</span>
                  <span className="font-medium">{selectedBond?.name}</span>
                  <span className="text-muted-foreground">ISIN</span>
                  <span className="font-mono">{selectedBond?.isin}</span>
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono">{order?.orderId}</span>
                  <span className="text-muted-foreground">Units</span>
                  <span>{totalUnitsToSell}</span>
                  <span className="text-muted-foreground">Desired Yield</span>
                  <span>{desiredYield}%</span>
                  <span className="text-muted-foreground">Transaction Date</span>
                  <span>{transactionDate}</span>
                  <span className="text-muted-foreground">Settlement Date</span>
                  <span>{settlementDate}</span>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disclaimerChecked}
                  onChange={(e) => setDisclaimerChecked(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I confirm that the above details are correct. I understand that sell orders are
                  subject to market conditions and negotiation with LiquiBonds Operations. I agree
                  to the Terms of Service and understand the T-day termination policy.
                </span>
              </label>
            </div>
          )}

          {/* Step 4: Done */}
          {step === totalSteps && confirmed && (
            <div className="text-center space-y-4 py-6">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center animate-check-mark">
                <Check className="h-8 w-8 text-success" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Sell Request Submitted!</h3>
                <p className="text-sm text-muted-foreground">
                  Your request ID is <span className="font-mono font-semibold">SR-006</span>
                </p>
              </div>
              <div className="bg-accent/5 rounded p-3 text-xs text-muted-foreground">
                Our Operations Team will review your request shortly. You'll receive updates via
                email and in-app notifications.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          {step > 1 && !confirmed ? (
            <Button variant="outline" className="rounded-sm text-sm" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {confirmed ? (
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm" onClick={onClose}>
              Done
            </Button>
          ) : step === 3 ? (
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
              disabled={!canProceedStep()}
              onClick={handleConfirm}
            >
              Confirm Sell Request
            </Button>
          ) : (
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm gap-1"
              disabled={!canProceedStep()}
              onClick={() => setStep(step + 1)}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}