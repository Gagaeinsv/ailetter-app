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
import SubjectLineGeneratorPage from './pages/SubjectLineGeneratorPage';

const SEO_CONFIG = {
  '/': {
    title:       'AIletter — AI Cover Letter Generator | Get Hired 10x Faster',
    description: 'Generate personalized, ATS-optimized cover letters in 30 seconds. Upload your CV, paste the job description, and get a tailored letter. Free to start.',
    canonical:   'https://ailetter.pro/',
    ogImage:     'https://ailetter.pro/android-chrome-512x512.png',
    index:       true,
  },
  '/linkedin-message': {
    title:       'LinkedIn Easy Apply Message Generator | AIletter',
    description: 'Generate a short, professional LinkedIn Easy Apply message tailored to any job description in seconds. Free, no sign-up required.',
    canonical:   'https://ailetter.pro/linkedin-message',
    ogImage:     'https://ailetter.pro/android-chrome-512x512.png',
    index:       true,
  },
  '/subject-line': {
    title:       'Email Subject Line Generator for Job Applications | AIletter',
    description: 'Generate 3 compelling email subject lines for your job application in seconds. Formal, direct, and creative options. Free, no sign-up required.',
    canonical:   'https://ailetter.pro/subject-line',
    ogImage:     'https://ailetter.pro/android-chrome-512x512.png',
    index:       true,
  },
  '/terms': {
    title:       'Terms of Service | AIletter',
    description: 'Read the AIletter Terms of Service. Learn about usage rules, subscriptions, and your rights when using our AI cover letter generator.',
    canonical:   'https://ailetter.pro/terms',
    ogImage:     'https://ailetter.pro/android-chrome-512x512.png',
    index:       true,
  },
  '/privacy': {
    title:       'Privacy Policy | AIletter',
    description: 'Learn how AIletter collects, uses, and protects your personal data. Our privacy policy explains your rights and how we handle your information.',
    canonical:   'https://ailetter.pro/privacy',
    ogImage:     'https://ailetter.pro/android-chrome-512x512.png',
    index:       true,
  },
  '/login':      { title: 'Login | AIletter',      description: '', canonical: null, ogImage: null, index: false },
  '/onboarding': { title: 'Onboarding | AIletter',  description: '', canonical: null, ogImage: null, index: false },
  '/dashboard':  { title: 'Dashboard | AIletter',   description: '', canonical: null, ogImage: null, index: false },
};

const PageSEO = () => {
  const { pathname } = useLocation();
  const config = SEO_CONFIG[pathname] ?? { title: 'AIletter', description: '', canonical: null, ogImage: null, index: false };
  return (
    <Helmet>
      {config.title && <title>{config.title}</title>}
      {config.description && <meta name="description" content={config.description} />}
      <meta name="robots" content={config.index ? 'index, follow' : 'noindex, nofollow'} />
      {config.canonical && <link rel="canonical" href={config.canonical} />}
      {config.canonical && <meta property="og:url" content={config.canonical} />}
      {config.title && <meta property="og:title" content={config.title} />}
      {config.description && <meta property="og:description" content={config.description} />}
      {config.ogImage && <meta property="og:image" content={config.ogImage} />}
      {config.title && <meta name="twitter:title" content={config.title} />}
      {config.description && <meta name="twitter:description" content={config.description} />}
      {config.ogImage && <meta name="twitter:image" content={config.ogImage} />}
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
              <Route path="/subject-line"     element={<SubjectLineGeneratorPage />} />
              <Route path="*"                  element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;