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
            <h1 className="text-xl font-semibold">My Transactions</h1>
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

        {/* Orders table */}
        <div className="card-elevated overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">All Orders</h3>
                <p className="text-xs text-muted-foreground">View and sell units from your full holdings.</p>
              </div>
              <span className="shrink-0 text-xs font-medium bg-success/10 text-success px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-medium">Bond</th>
                    <th className="text-left py-2 font-medium">ISIN</th>
                    <th className="text-left py-2 font-medium">Order ID</th>
                    <th className="text-left py-2 font-medium">Purchase Date</th>
                    <th className="text-right py-2 font-medium">Price</th>
                    <th className="text-right py-2 font-medium">Total Units</th>
                    <th className="text-right py-2 font-medium">Sold</th>
                    <th className="text-right py-2 font-medium">Available</th>
                    <th className="text-right py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PORTFOLIO.map((order) => {
                    const soldUnits = order.units - order.availableUnits;
                    return (
                      <tr key={order.orderId} className="border-b border-border/50">
                        <td className="py-2 font-medium truncate max-w-[180px]">{order.bond.name}</td>
                        <td className="py-2 font-mono">{order.bond.isin}</td>
                        <td className="py-2 font-mono">{order.orderId}</td>
                        <td className="py-2">{order.purchaseDate}</td>
                        <td className="py-2 text-right">₹{order.purchasePrice}</td>
                        <td className="py-2 text-right">{order.units}</td>
                        <td className="py-2 text-right">{soldUnits}</td>
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-2">
              {MOCK_PORTFOLIO.map((order) => {
                const soldUnits = order.units - order.availableUnits;
                return (
                  <div key={order.orderId} className="bg-muted/50 rounded p-3 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold truncate max-w-[65%]">{order.bond.name}</span>
                      <span className="text-muted-foreground font-mono">{order.orderId}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <div>
                        <p className="text-xs">ISIN</p>
                        <p className="font-mono text-xs">{order.bond.isin}</p>
                      </div>
                      <div>
                        <p className="text-xs">Purchased</p>
                        <p className="text-xs">{order.purchaseDate}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <div>
                        <p className="text-xs">Total</p>
                        <p className="font-semibold text-slate-900">{order.units}</p>
                      </div>
                      <div>
                        <p className="text-xs">Sold</p>
                        <p className="font-semibold text-slate-900">{soldUnits}</p>
                      </div>
                      <div>
                        <p className="text-xs">Available</p>
                        <p className="font-semibold text-slate-900">{order.availableUnits}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>₹{order.purchasePrice}</span>
                      <Button
                        size="sm"
                        onClick={() => handleSellOrder(order.orderId)}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-xs h-7"
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
