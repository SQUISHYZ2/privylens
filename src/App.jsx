import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./hooks/useAuth";
import LoadingScreen from "./components/LoadingScreen";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import History from "./pages/History";

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
  }, []);

  // Show loading screen on first visit
  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Wait for Firebase auth to resolve
  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public: Login */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />

          {/* Protected Routes with Layout */}
          <Route
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/history" element={<History user={user} />} />
          </Route>

          {/* Default redirect */}
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            }
          />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
