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
    { label: "Transactions", path: "/investor/portfolio" },
    { label: "Sell Requests", path: "/investor/sell-requests" },
  ],
  ifa: [
    { label: "Dashboard", path: "/ifa" },
    { label: "Clients", path: "/ifa/clients" },
    { label: "Transactions", path: "/ifa/transactions" },
    { label: "Sell", path: "/ifa/sell" },
  ],
  ops: [
    { label: "Sell Requests", path: "/ops/sell-requests" },
    { label: "Today's Trade", path: "/ops/todays-trade" },
    { label: "Transactions", path: "/ops/trades" },
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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to={`/${role}`} className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-md bg-gradient-to-br from-emerald-500 to-sky-500" />
            <span className="text-lg font-semibold tracking-tight text-slate-900">LiquiBonds</span>
          </Link>

          <nav className="hidden md:flex items-center gap-3">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium rounded-full px-4 py-2 transition",
                  location.pathname === item.path
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-xs text-slate-500 border border-slate-200 rounded px-2 py-1">
            {roleLabel}
          </span>
          <Link
            to="/"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-full px-4 py-2"
          >
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
