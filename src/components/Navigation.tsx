import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";

interface NavItem {
  label: string;
  path: string;
  icon?: ReactNode;
}

const navItems: Record<UserRole, NavItem[]> = {
  investor: [
    { label: "Home", path: "/investor" },
    { label: "Portfolio", path: "/investor/portfolio" },
    { label: "Transactions", path: "/investor/transactions" },
    { label: "Sell Requests", path: "/investor/sell-requests" },
  ],
  ifa: [
    { label: "Dashboard", path: "/ifa" },
    { label: "Clients", path: "/ifa/clients" },
    { label: "Transactions", path: "/ifa/transactions" },
    { label: "Sell", path: "/ifa/sell" },
  ],
  ops: [
    { label: "Dashboard", path: "/ops" },
    { label: "Sell Requests", path: "/ops/sell-requests" },
    { label: "Today's Trades", path: "/ops/trades" },
  ],
};

interface TopNavProps {
  role: UserRole;
}

export function TopNav({ role }: TopNavProps) {
  const location = useLocation();
  const items = navItems[role];
  const roleLabel = role === "investor" ? "Investor" : role === "ifa" ? "LiquiOne (IFA)" : "Ops Admin";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-primary">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to={`/${role}`} className="text-lg font-semibold text-primary-foreground tracking-tight">
            LiquiBonds
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "nav-link text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10",
                  location.pathname === item.path && "text-primary-foreground bg-primary-foreground/15"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-primary-foreground/60 border border-primary-foreground/20 rounded px-2 py-0.5">
            {roleLabel}
          </span>
          <Link to="/" className="text-xs text-primary-foreground/60 hover:text-primary-foreground">
            Logout
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomNav({ role }: TopNavProps) {
  const location = useLocation();
  const items = navItems[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-0.5 text-xs text-muted-foreground py-1 px-2 min-w-[60px]",
              location.pathname === item.path && "text-accent font-medium"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
