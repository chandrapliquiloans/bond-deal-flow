import { PortalLayout } from "@/components/PortalLayout";
import { Link } from "react-router-dom";
import { MOCK_SELL_REQUESTS } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowRight, TrendingUp, Wallet, Clock } from "lucide-react";

export default function InvestorHome() {
  const activeRequests = MOCK_SELL_REQUESTS.filter(
    (r) => !["settled", "terminated", "rejected"].includes(r.status)
  );

  return (
    <PortalLayout role="investor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, Nisha</h1>
          <p className="text-sm text-muted-foreground">Here's your bond portfolio overview</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-elevated p-5 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium">Total Holdings</span>
            </div>
            <p className="text-2xl font-semibold">₹2,80,000</p>
            <p className="text-xs text-muted-foreground">280 units across 5 bonds</p>
          </div>
          <div className="card-elevated p-5 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Active Sell Requests</span>
            </div>
            <p className="text-2xl font-semibold">{activeRequests.length}</p>
            <p className="text-xs text-muted-foreground">Across all bonds</p>
          </div>
          <div className="card-elevated p-5 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Pending Action</span>
            </div>
            <p className="text-2xl font-semibold">1</p>
            <p className="text-xs text-warning text-sm">Counter-offer awaiting response</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-elevated p-5 space-y-3">
          <h2 className="text-sm font-semibold">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/investor/portfolio"
              className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground text-sm font-medium rounded hover:bg-accent/90 transition-colors"
            >
              Sell Bonds <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/investor/sell-requests"
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground text-sm font-medium rounded hover:bg-muted transition-colors"
            >
              View Sell Requests
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-elevated p-5 space-y-4">
          <h2 className="text-sm font-semibold">Recent Sell Requests</h2>
          <div className="space-y-3">
            {MOCK_SELL_REQUESTS.slice(0, 3).map((req) => (
              <Link
                key={req.id}
                to={`/investor/sell-requests`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{req.bond.name.split(" ").slice(0, 3).join(" ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.units} units · {req.desiredYield}% yield
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
