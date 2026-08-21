import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/common/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { RealTimeProvider } from "@/context/RealTimeContext";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LoadingOverlay } from "@/components/common/loading-overlay";
import { useAuth } from "@/components/auth/auth-provider";

// Lazy loading de páginas para otimização
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Lines = lazy(() => import("@/pages/lines"));
const Admin = lazy(() => import("@/pages/admin"));
const ExcelAnalyzer = lazy(() => import("@/pages/excel-analyzer"));
const AboutSystem = lazy(() => import("@/pages/about-system"));
const NotFound = lazy(() => import("@/pages/not-found"));

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Carregando...</div>}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/lines">
          <ProtectedRoute>
            <Lines />
          </ProtectedRoute>
        </Route>
        <Route path="/admin">
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        </Route>
        <Route path="/excel-analyzer">
          <ProtectedRoute requiredRole="admin">
            <ExcelAnalyzer />
          </ProtectedRoute>
        </Route>
        <Route path="/sobre-sistema" component={AboutSystem} />
        <Route path="/">
          {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="line-manager-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <RealTimeProvider>
              <AppRouter />
              <Toaster />
            </RealTimeProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
