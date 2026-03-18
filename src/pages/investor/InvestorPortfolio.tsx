import { useState, useMemo } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_PORTFOLIO } from "@/data/mockData";
import { PurchaseOrder } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SellStepper } from "@/components/investor/SellStepper";
import { X } from "lucide-react";

export default function InvestorPortfolio() {
  const [search, setSearch] = useState("");
  const [selectedBondIsin, setSelectedBondIsin] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellType, setSellType] = useState<"internal" | "external">("internal");

  // Group orders by bond ISIN
  const groupedByBond = useMemo(() => {
    const groups: Record<string, PurchaseOrder[]> = {};
    MOCK_PORTFOLIO.forEach((order) => {
      const isin = order.bond.isin;
      if (!groups[isin]) {
        groups[isin] = [];
      }
      groups[isin].push(order);
    });
    return groups;
  }, []);

  // Filter bonds by search
  const filteredBonds = useMemo(() => {
    return Object.entries(groupedByBond).filter(([isin, orders]) => {
      const bond = orders[0]?.bond;
      if (!bond) return false;
      const searchLower = search.toLowerCase();
      return (
        bond.name.toLowerCase().includes(searchLower) ||
        isin.toLowerCase().includes(searchLower)
      );
    });
  }, [search, groupedByBond]);

  const selectedBondOrders = selectedBondIsin ? groupedByBond[selectedBondIsin] : [];
  const selectedBond = selectedBondOrders[0]?.bond;

  const handleSellOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSellType("internal");
    setSellModalOpen(true);
  };

  return (
    <PortalLayout role="investor">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">My Holdings</h1>
            <p className="text-sm text-muted-foreground">View and manage your bond holdings by bond</p>
          </div>
          <Button
            className="shrink-0 bg-blue-600 text-white hover:bg-blue-700 rounded-sm text-sm"
            onClick={() => {
              setSellType("external");
              setSellModalOpen(true);
            }}
          >
            External Sell
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search by Bond name or ISIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md text-sm rounded-sm"
          />
        </div>

        {/* Bonds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBonds.map(([isin, orders]) => {
            const bond = orders[0].bond;
            const totalUnits = orders.reduce((sum, o) => sum + o.units, 0);
            const totalAvailable = orders.reduce((sum, o) => sum + o.availableUnits, 0);
            const totalSold = totalUnits - totalAvailable;

            return (
              <button
                key={isin}
                onClick={() => setSelectedBondIsin(isin)}
                className="text-left card-elevated p-4 space-y-3 hover:ring-2 hover:ring-accent/50 transition-all"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold truncate">{bond.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{isin}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold">{totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sold</p>
                    <p className="font-semibold">{totalSold}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Available</p>
                    <p className="font-semibold text-success">{totalAvailable}</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-sm h-8"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedBondIsin(isin);
                  }}
                >
                  View Orders
                </Button>
              </button>
            );
          })}
        </div>

        {filteredBonds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No bonds match your search</p>
          </div>
        )}
      </div>

      {/* Right Drawer - Order Details */}
      {selectedBondIsin && selectedBond && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-foreground/40"
            onClick={() => setSelectedBondIsin(null)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card shadow-xl animate-slide-in-right overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold">{selectedBond.name}</h2>
                <p className="text-xs text-muted-foreground font-mono">{selectedBond.isin}</p>
              </div>
              <button
                onClick={() => setSelectedBondIsin(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary */}
            <div className="p-4 border-b border-border space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Total Units</p>
                  <p className="font-semibold text-lg">
                    {selectedBondOrders.reduce((sum, o) => sum + o.units, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Available</p>
                  <p className="font-semibold text-lg text-success">
                    {selectedBondOrders.reduce((sum, o) => sum + o.availableUnits, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sold</p>
                  <p className="font-semibold text-lg">
                    {selectedBondOrders.reduce((sum, o) => sum + (o.units - o.availableUnits), 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-semibold">Order Items</h3>
              {selectedBondOrders.map((order) => {
                const soldUnits = order.units - order.availableUnits;
                return (
                  <div
                    key={order.orderId}
                    className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-muted-foreground">Order ID</p>
                        <p className="font-mono font-medium">{order.orderId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Purchased</p>
                        <p className="font-medium">{order.purchaseDate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-muted-foreground">Total Qty</p>
                        <p className="font-semibold">{order.units}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Available</p>
                        <p className="font-semibold text-success">{order.availableUnits}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sold</p>
                        <p className="font-semibold">{soldUnits}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">
                        Price: ₹{order.purchasePrice}
                      </span>
                      {order.availableUnits > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleSellOrder(order.orderId)}
                          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm text-xs h-7 px-3"
                        >
                          Sell
                        </Button>
                      )}
                      {order.availableUnits === 0 && (
                        <span className="text-xs text-muted-foreground">Fully Sold</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Sell Modal */}
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
