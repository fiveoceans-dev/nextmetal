
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextMetalAuthProvider } from "@/contexts/NextMetalAuthContext";
import { WagmiConfigProvider } from "@/providers/WagmiProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NextMetalAuthPage from "./pages/NextMetalAuth";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import Database from "./pages/Database";
import Functions from "./pages/Functions";
import Containers from "./pages/Containers";
import Hosting from "./pages/Hosting";
import AccountSettingsPage from "./pages/AccountSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WagmiConfigProvider>
      <TooltipProvider>
        <AuthProvider>
          <NextMetalAuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/nextmetal-auth" element={<NextMetalAuthPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/statistics" element={
                  <ProtectedRoute>
                    <Statistics />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/database" element={
                  <ProtectedRoute>
                    <Database />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/functions" element={
                  <ProtectedRoute>
                    <Functions />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/containers" element={
                  <ProtectedRoute>
                    <Containers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/hosting" element={
                  <ProtectedRoute>
                    <Hosting />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/settings" element={
                  <ProtectedRoute>
                    <AccountSettingsPage />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NextMetalAuthProvider>
        </AuthProvider>
      </TooltipProvider>
    </WagmiConfigProvider>
  </QueryClientProvider>
);

export default App;
