import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import ClientProfilePage from "./pages/ClientProfilePage";
import TripManagerPage from "./pages/TripManagerPage";

import RequestPinPage from "./pages/RequestPinPage";

import SettingsPage from "./pages/SettingsPage";
import SuperAdminPage from "./pages/SuperAdminPage";
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientProfilePage />} />
          <Route path="/trip-manager" element={<TripManagerPage />} />
          <Route path="/map-settings" element={<Navigate to="/settings" replace />} />
          <Route path="/request-pin" element={<RequestPinPage />} />
          
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/super-admin" element={<SuperAdminPage />} />
          {/* Legacy redirect */}
          <Route path="/trip-builder" element={<Navigate to="/trip-manager" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
