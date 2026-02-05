import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Auth from "./pages/Auth";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import WorkoutSession from "./pages/WorkoutSession";
import Diet from "./pages/Diet";
import AIChat from "./pages/AIChat";
import Profile from "./pages/Profile";
import NotFound from "@/pages/NotFound";
import ExerciseDetails from "@/pages/ExerciseDetails"; // Import the new page

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Workout Library */}
      <Route
        path="/workout"
        element={
          <ProtectedRoute>
            <Workout />
          </ProtectedRoute>
        }
      />
      {/* Exercise Details (NEW) */}
      <Route
        path="/exercises/:id"
        element={
          <ProtectedRoute>
            <ExerciseDetails />
          </ProtectedRoute>
        }
      />
      {/* Active Workout Session */}
      <Route
        path="/workout/:id"
        element={
          <ProtectedRoute>
            <WorkoutSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diet"
        element={
          <ProtectedRoute>
            <Diet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-chat"
        element={
          <ProtectedRoute>
            <AIChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;