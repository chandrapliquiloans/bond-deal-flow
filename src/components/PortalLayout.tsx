import { ReactNode } from "react";
import { TopNav, BottomNav } from "./Navigation";
import { UserRole } from "@/types";

interface PortalLayoutProps {
  role: UserRole;
  children: ReactNode;
}

export function PortalLayout({ role, children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav role={role} />
      <main className="container py-6 pb-20 md:pb-6 animate-fade-in">
        {children}
      </main>
      <BottomNav role={role} />
    </div>
  );
}
