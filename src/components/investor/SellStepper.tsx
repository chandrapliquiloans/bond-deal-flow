import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_PORTFOLIO, BONDS_CATALOG, MOCK_SELL_REQUESTS, MOCK_BANK_ACCOUNTS } from "@/data/mockData";

const ACTIVE_STATUSES = ["sell_initiated", "negotiation", "buyer_approved", "seller_approved", "payment_done", "processing"];

function computeAvailableUnits(orderId: string, totalUnits: number): number {
  const blocked = MOCK_SELL_REQUESTS
    .filter((r) => r.orderId === orderId && ACTIVE_STATUSES.includes(r.status))
    .reduce((sum, r) => sum + r.units, 0);
  const sold = MOCK_SELL_REQUESTS
    .filter((r) => r.orderId === orderId && r.status === "settled")
    .reduce((sum, r) => sum + r.units, 0);
  return Math.max(0, totalUnits - blocked - sold);
}
import { Bond } from "@/types";
import { addWorkingDays, formatDate, isWorkingDay, nextWorkingDay } from "@/lib/utils";

interface SellStepperProps {
  type: "internal" | "external";
  orderId: string | null;
  onClose: () => void;
}

export function SellStepper({ type, orderId, onClose }: SellStepperProps) {
  // Internal sell modal state

  const order = orderId ? MOCK_PORTFOLIO.find((o) => o.orderId === orderId) : undefined;
  const availableUnits = order ? computeAvailableUnits(order.orderId, order.units) : 0;
  const [unitsToSell, setUnitsToSell] = useState(0);

  // External sell state (single modal, no steps)
  const [selectedIsin, setSelectedIsin] = useState("");
  const [externalUnits, setExternalUnits] = useState(0);

  // Bank selection — default to marked-default bank
  const defaultBank = MOCK_BANK_ACCOUNTS.find((b) => b.isDefault) ?? MOCK_BANK_ACCOUNTS[0];
  const [selectedBankId, setSelectedBankId] = useState(defaultBank.id);
  const selectedBank = MOCK_BANK_ACCOUNTS.find((b) => b.id === selectedBankId)!;

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

  const minTransactionDate = formatDate(addWorkingDays(new Date(), 2));

  const transactionDateValid =
    transactionDate !== "" &&
    isWorkingDay(new Date(transactionDate)) &&
    transactionDate >= minTransactionDate;

  const canSubmitInternal =
    unitsToSell > 0 &&
    unitsToSell <= (availableUnits) &&
    yieldValid &&
    transactionDateValid &&
    disclaimerChecked;

  const canSubmitExternal =
    selectedIsin !== "" &&
    externalUnits > 0 &&
    yieldValid &&
    transactionDateValid &&
    disclaimerChecked;

  const handleConfirm = () => {
    setConfirmed(true);
  };

  // ─── EXTERNAL: Right-side drawer ───
  if (type === "external") {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-foreground/40" onClick={onClose} />
        <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card shadow-xl animate-slide-in-right overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold">External Sell</h2>
              <p className="text-xs text-muted-foreground">Create a quote for bonds purchased from other vendors</p>
            </div>
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
                        <span>Rating: {selectedBond.creditRating}</span>
                        <span>Maturity: {selectedBond.maturityDate}</span>
                        <span>Face Value: ₹{selectedBond.faceValue}</span>
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-border/40 flex gap-2 items-center">
                        <span className="text-muted-foreground">Purchase Yield (Coupon):</span>
                        <span className="font-semibold text-success">{selectedBond.couponRate}%</span>
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
                  <Label className="text-sm">Settlement Date</Label>
                  <Input
                    type="date"
                    value={transactionDate}
                    min={minTransactionDate}
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (!selected) {
                        setTransactionDate("");
                        return;
                      }

                      const selectedDate = new Date(selected);
                      const normalized = !isWorkingDay(selectedDate)
                        ? nextWorkingDay(selectedDate)
                        : selectedDate;
                      const normalizedStr = formatDate(normalized);

                      setTransactionDate(
                        normalizedStr < minTransactionDate ? minTransactionDate : normalizedStr
                      );
                    }}
                    className="rounded-sm"
                  />
                  {settlementDate && (
                    <p className="text-xs text-muted-foreground">
                      Settlement Date: <span className="font-semibold">{settlementDate}</span> (T+2 working days)
                    </p>
                  )}
                  <div className="bg-warning/10 border border-warning/30 rounded p-3 text-xs text-warning">
                    <strong>⚠ T-Day Warning:</strong> If negotiation is not resolved by the Settlement
                    date, the order will be automatically terminated at 00:00 IST.
                  </div>
                </div>

                {/* Bank Selection */}
                <div className="space-y-2">
                  <Label className="text-sm">Settlement Bank Account</Label>
                  <div className="space-y-2">
                    {MOCK_BANK_ACCOUNTS.map((bank) => (
                      <label
                        key={bank.id}
                        className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                          selectedBankId === bank.id
                            ? "border-accent bg-accent/5"
                            : "border-border bg-muted/30 hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="bank-external"
                          value={bank.id}
                          checked={selectedBankId === bank.id}
                          onChange={() => setSelectedBankId(bank.id)}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="text-xs space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{bank.bankName}</span>
                            {bank.isDefault && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded-full font-medium">Default</span>
                            )}
                          </div>
                          <p className="text-muted-foreground font-mono">{bank.accountNumber}</p>
                          <p className="text-muted-foreground">IFSC: {bank.ifscCode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disclaimerChecked}
                    onChange={(e) => setDisclaimerChecked(e.target.checked)}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I confirm that the above details are correct. I understand that sell orders are
                    subject to market conditions and negotiation with buyers. I agree
                    to the Terms of Service and understand the T-day termination policy.
                  </span>
                </label>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="rounded-sm text-sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-sm text-sm"
                    disabled={!canSubmitExternal}
                    onClick={handleConfirm}
                  >
                    Create Quote
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-10">
                <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Quote Created!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your sell request has been submitted to the buyers.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Request ID: <span className="font-mono font-semibold">SR-EXT-001</span>
                  </p>
                </div>
                <div className="bg-accent/5 rounded p-3 text-xs text-muted-foreground">
                  Our team will review and match your quote with buyers shortly.
                </div>
                <div className="bg-muted/50 rounded p-3 text-xs space-y-0.5 text-left">
                  <p className="text-muted-foreground">Settlement to:</p>
                  <p className="font-semibold">{selectedBank.bankName}</p>
                  <p className="font-mono text-muted-foreground">{selectedBank.accountNumber} · {selectedBank.ifscCode}</p>
                </div>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm"
                  onClick={onClose}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ─── INTERNAL: Single-page modal (all fields visible) ───
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

        <div className="p-4 space-y-5">
          {!confirmed ? (
            <>
              {order && (
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
                    <div className="flex gap-4 mt-1 text-muted-foreground">
                      <span>Total Units: {order.units}</span>
                      <span>Available: {availableUnits}</span>
                      <span>Sold: {order.units - availableUnits}</span>
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-border/40 flex gap-2 items-center">
                      <span className="text-muted-foreground">Purchase Yield:</span>
                      <span className="font-semibold text-success">{order.bond.couponRate}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Units to Sell (max {availableUnits})</Label>
                    <Input
                      type="number"
                      min={1}
                      max={availableUnits}
                      value={unitsToSell || ""}
                      onChange={(e) => {
                        const val = Math.min(
                          Math.max(0, parseInt(e.target.value) || 0),
                          availableUnits
                        );
                        setUnitsToSell(val);
                      }}
                      className="rounded-sm"
                      placeholder={`1 – ${availableUnits}`}
                    />
                    {unitsToSell > availableUnits && (
                      <p className="text-xs text-destructive">Cannot exceed {availableUnits} units</p>
                    )}
                  </div>
                </div>
              )}

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
                  <Label className="text-sm">Settlement Date</Label>
                  <Input
                    type="date"
                    value={transactionDate}
                    min={minTransactionDate}
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (!selected) {
                        setTransactionDate("");
                        return;
                      }

                      const selectedDate = new Date(selected);
                      const normalized = !isWorkingDay(selectedDate)
                        ? nextWorkingDay(selectedDate)
                        : selectedDate;
                      const normalizedStr = formatDate(normalized);

                      setTransactionDate(
                        normalizedStr < minTransactionDate ? minTransactionDate : normalizedStr
                      );
                    }}
                    className="rounded-sm"
                  />
                  {settlementDate && (
                    <p className="text-xs text-muted-foreground">
                      Settlement Date: <span className="font-semibold">{settlementDate}</span> (T+2 working days)
                    </p>
                  )}
                  <div className="bg-warning/10 border border-warning/30 rounded p-3 text-xs text-warning">
                    <strong>⚠ T-Day Warning:</strong> If negotiation is not resolved by the Settlement
                    date, the order will be automatically terminated at 00:00 IST.
                  </div>
                </div>
              </div>

              {/* Bank Selection */}
              <div className="space-y-2">
                <Label className="text-sm">Settlement Bank Account</Label>
                <div className="space-y-2">
                  {MOCK_BANK_ACCOUNTS.map((bank) => (
                    <label
                      key={bank.id}
                      className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                        selectedBankId === bank.id
                          ? "border-accent bg-accent/5"
                          : "border-border bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bank-internal"
                        value={bank.id}
                        checked={selectedBankId === bank.id}
                        onChange={() => setSelectedBankId(bank.id)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="text-xs space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{bank.bankName}</span>
                          {bank.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded-full font-medium">Default</span>
                          )}
                        </div>
                        <p className="text-muted-foreground font-mono">{bank.accountNumber}</p>
                        <p className="text-muted-foreground">IFSC: {bank.ifscCode}</p>
                      </div>
                    </label>
                  ))}
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
                  subject to market conditions and negotiation with buyer. I agree
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
                Our Team will review your request shortly. You'll receive updates via
                email and in-app notifications.
              </div>
              <div className="bg-muted/50 rounded p-3 text-xs space-y-0.5 text-left">
                <p className="text-muted-foreground">Settlement to:</p>
                <p className="font-semibold">{selectedBank.bankName}</p>
                <p className="font-mono text-muted-foreground">{selectedBank.accountNumber} · {selectedBank.ifscCode}</p>
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
              disabled={!canSubmitInternal}
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