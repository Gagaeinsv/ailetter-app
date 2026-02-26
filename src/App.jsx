import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

// ── Private route — redirect to landing if not logged in ──
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
    </div>
  );
  return user ? children : <Navigate replace to="/" />;
};

// ── Dashboard route — redirect new users to onboarding first ──
const DashboardRoute = () => {
  const { user, loading, isNewUser } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
    </div>
  );
  if (!user) return <Navigate replace to="/" />;
  if (isNewUser) return <Navigate replace to="/onboarding" />;
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/"           element={<Landing />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
            <Route path="/dashboard"  element={<DashboardRoute />} />
            <Route path="/terms"      element={<TermsOfService />} />
            <Route path="/privacy"    element={<PrivacyPolicy />} />
            <Route path="*"           element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;