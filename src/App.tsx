import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import LoginPage from "./pages/LoginPage";
import InvestorHome from "./pages/investor/InvestorHome";
import InvestorPortfolio from "./pages/investor/InvestorPortfolio";
import InvestorSellRequests from "./pages/investor/InvestorSellRequests";
import InvestorTransactions from "./pages/investor/InvestorTransactions";
import IFADashboard from "./pages/ifa/IFADashboard";
import IFAClients from "./pages/ifa/IFAClients";
import IFASell from "./pages/ifa/IFASell";
import IFATransactions from "./pages/ifa/IFATransactions";
import OpsDashboard from "./pages/ops/OpsDashboard";
import OpsSellRequests from "./pages/ops/OpsSellRequests";
import OpsTrades from "./pages/ops/OpsTrades";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* Investor Portal */}
          <Route path="/investor" element={<InvestorHome />} />
          <Route path="/investor/portfolio" element={<InvestorPortfolio />} />
          <Route path="/investor/sell-requests" element={<InvestorSellRequests />} />
          <Route path="/investor/transactions" element={<InvestorTransactions />} />

          {/* IFA Portal */}
          <Route path="/ifa" element={<IFADashboard />} />
          <Route path="/ifa/clients" element={<IFAClients />} />
          <Route path="/ifa/sell" element={<IFASell />} />
          <Route path="/ifa/transactions" element={<IFATransactions />} />

          {/* Ops Portal */}
          <Route path="/ops" element={<OpsDashboard />} />
          <Route path="/ops/sell-requests" element={<OpsSellRequests />} />
          <Route path="/ops/trades" element={<OpsTrades />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
