import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LinkedInGeneratorPage from './pages/LinkedInGeneratorPage';

const SEO_CONFIG = {
  '/':                 { canonical: 'https://ailetter.pro/',                       index: true  },
  '/terms':            { canonical: 'https://ailetter.pro/terms',                  index: true  },
  '/privacy':          { canonical: 'https://ailetter.pro/privacy',                index: true  },
  '/linkedin-message': { canonical: 'https://ailetter.pro/linkedin-message',       index: true  },
  '/login':            { canonical: null,                                           index: false },
  '/onboarding':       { canonical: null,                                           index: false },
  '/dashboard':        { canonical: null,                                           index: false },
};

const PageSEO = () => {
  const { pathname } = useLocation();
  const config = SEO_CONFIG[pathname] ?? { canonical: null, index: false };
  return (
    <Helmet>
      <meta name="robots" content={config.index ? 'index, follow' : 'noindex, nofollow'} />
      {config.canonical && <link rel="canonical" href={config.canonical} />}
    </Helmet>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
    </div>
  );
  return user ? children : <Navigate replace to="/" />;
};

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
    <HelmetProvider>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <PageSEO />
            <Routes>
              <Route path="/"                  element={<Landing />} />
              <Route path="/login"             element={<Login />} />
              <Route path="/onboarding"        element={<PrivateRoute><Onboarding /></PrivateRoute>} />
              <Route path="/dashboard"         element={<DashboardRoute />} />
              <Route path="/terms"             element={<TermsOfService />} />
              <Route path="/privacy"           element={<PrivacyPolicy />} />
              <Route path="/linkedin-message"  element={<LinkedInGeneratorPage />} />
              <Route path="*"                  element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;