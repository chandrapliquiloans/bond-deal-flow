import { PortalLayout } from "@/components/PortalLayout";
import { MOCK_IFA_CLIENTS, MOCK_SELL_REQUESTS } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Users, ArrowUpRight, Clock } from "lucide-react";

export default function IFADashboard() {
  const pendingApprovals = 2;
  return (
    <PortalLayout role="ifa">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">LiquiOne Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage client bond sales</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-elevated p-5 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Total Clients</span>
            </div>
            <p className="text-2xl font-semibold">{MOCK_IFA_CLIENTS.length}</p>
          </div>
          <div className="card-elevated p-5 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs font-medium">Active Sell Orders</span>
            </div>
            <p className="text-2xl font-semibold">{MOCK_SELL_REQUESTS.filter(r => !["settled", "terminated", "rejected"].includes(r.status)).length}</p>
          </div>
          <div className="card-elevated p-5 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Pending Approvals</span>
            </div>
            <p className="text-2xl font-semibold">{pendingApprovals}</p>
          </div>
        </div>

        <div className="card-elevated p-5 space-y-3">
          <h2 className="text-sm font-semibold">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/ifa/sell"
              className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground text-sm font-medium rounded hover:bg-accent/90 transition-colors"
            >
              Initiate Sell Order
            </Link>
            <Link
              to="/ifa/clients"
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground text-sm font-medium rounded hover:bg-muted transition-colors"
            >
              View Clients
            </Link>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
