import { useState } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_PORTFOLIO, BONDS_CATALOG } from "@/data/mockData";
import { PurchaseOrder } from "@/types";
import { Button } from "@/components/ui/button";
import { SellStepper } from "@/components/investor/SellStepper";

export default function InvestorPortfolio() {
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sellType, setSellType] = useState<"internal" | "external">("internal");

  // Group by bond
  const bondGroups = MOCK_PORTFOLIO.reduce<Record<string, PurchaseOrder[]>>((acc, order) => {
    const key = order.bond.isin;
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  const handleSellOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSellType("internal");
    setSellModalOpen(true);
  };

  const handleSellExternal = () => {
    setSellType("external");
    setSellModalOpen(true);
  };

  return (
    <PortalLayout role="investor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">My Portfolio</h1>
            <p className="text-sm text-muted-foreground">Your active bond holdings</p>
          </div>
          <Button
            onClick={handleSellExternal}
            variant="outline"
            className="text-sm rounded-sm"
          >
            Sell External Bond
          </Button>
        </div>

        {/* Bond cards */}
        <div className="space-y-4">
          {Object.entries(bondGroups).map(([isin, orders]) => {
            const bond = orders[0].bond;
            const totalUnits = orders.reduce((s, o) => s + o.availableUnits, 0);
            return (
              <div key={isin} className="card-elevated overflow-hidden">
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate">{bond.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{bond.isin}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium bg-success/10 text-success px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Coupon Rate</p>
                      <p className="font-semibold">{bond.couponRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Maturity</p>
                      <p className="font-semibold">{bond.maturityDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-semibold">{bond.creditRating}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Units</p>
                      <p className="font-semibold">{totalUnits}</p>
                    </div>
                  </div>

                  {/* Orders table (desktop) */}
                  <div className="hidden sm:block">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-2 font-medium">Order ID</th>
                          <th className="text-left py-2 font-medium">Purchase Date</th>
                          <th className="text-right py-2 font-medium">Price</th>
                          <th className="text-right py-2 font-medium">Available Units</th>
                          <th className="text-right py-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.orderId} className="border-b border-border/50">
                            <td className="py-2 font-mono">{order.orderId}</td>
                            <td className="py-2">{order.purchaseDate}</td>
                            <td className="py-2 text-right">₹{order.purchasePrice}</td>
                            <td className="py-2 text-right">{order.availableUnits}</td>
                            <td className="py-2 text-right">
                              <Button
                                size="sm"
                                onClick={() => handleSellOrder(order.orderId)}
                                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-xs h-7 px-3"
                              >
                                Sell
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="sm:hidden space-y-2">
                    {orders.map((order) => (
                      <div key={order.orderId} className="bg-muted/50 rounded p-3 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="font-mono">{order.orderId}</span>
                          <span className="font-semibold">{order.availableUnits} units</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>{order.purchaseDate}</span>
                          <span>₹{order.purchasePrice}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSellOrder(order.orderId)}
                          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-xs h-7"
                        >
                          Sell
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sellModalOpen && (
        <SellStepper
          type={sellType}
          orderId={selectedOrderId}
          onClose={() => {
            setSellModalOpen(false);
            setSelectedOrderId(null);
          }}
        />
      )}
    </PortalLayout>
  );
}
