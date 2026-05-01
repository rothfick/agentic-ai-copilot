import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Samples from "./pages/Samples.tsx";
import Workspace from "./pages/Workspace.tsx";
import Evals from "./pages/Evals.tsx";
import Reports from "./pages/Reports.tsx";
import ReportDetail from "./pages/ReportDetail.tsx";
import Demo from "./pages/Demo.tsx";
import PortfolioReadme from "./pages/PortfolioReadme.tsx";
import Architecture from "./pages/Architecture.tsx";
import MarcuraFit from "./pages/MarcuraFit.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/samples" element={<Samples />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/workspace/:sampleId" element={<Workspace />} />
          <Route path="/evals" element={<Evals />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/sample/:sampleId" element={<ReportDetail />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/portfolio-readme" element={<PortfolioReadme />} />
          <Route path="/marcura-fit" element={<MarcuraFit />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
