import React, { useMemo, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LinkedInGeneratorPage from './pages/LinkedInGeneratorPage';
import SubjectLineGeneratorPage from './pages/SubjectLineGeneratorPage';
import AIDeveloperCoverLetterPage from './pages/AIDeveloperCoverLetterPage';
import LinkedInColdMessagesPage from './pages/LinkedInColdMessagesPage';
import FreelancerSelfIntroductionPage from './pages/FreelancerSelfIntroductionPage';
import RoleCoverLetterPage from './pages/RoleCoverLetterPage';
import { SEO_ROLE_PAGES, PREFIXED_LANGS, SUPPORTED_SEO_LANGS } from './constants/seoRolePages';
import translations from './locales/translations';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

const BASE_URL = 'https://ailetter.pro';
const OG_IMAGE = `${BASE_URL}/android-chrome-512x512.png`;

const STATIC_SEO = {
  '/terms': {
    title: 'Terms of Service | AI-Letter',
    description: 'Read the AI-Letter Terms of Service. Learn about usage rules, subscriptions, and your rights when using our AI cover letter generator.',
    canonical: `${BASE_URL}/terms`,
    ogImage: OG_IMAGE,
    index: true,
  },
  '/privacy': {
    title: 'Privacy Policy | AI-Letter',
    description: 'Learn how AI-Letter collects, uses, and protects your personal data. Our privacy policy explains your rights and how we handle your information.',
    canonical: `${BASE_URL}/privacy`,
    ogImage: OG_IMAGE,
    index: true,
  },
  '/login': { title: 'Login | AI-Letter', description: '', canonical: null, ogImage: null, index: false },
  '/onboarding': { title: 'Onboarding | AI-Letter', description: '', canonical: null, ogImage: null, index: false },
  '/dashboard': { title: 'Dashboard | AI-Letter', description: '', canonical: null, ogImage: null, index: false },
};

/** Match router paths so Helmet never marks public pages as noindex (e.g. /privacy/). */
const normalizePathname = (raw) => {
  const p = raw || '/';
  if (p !== '/' && p.endsWith('/')) return p.replace(/\/+$/, '');
  return p;
};

const parseLocalizedPath = (raw) => {
  const normalized = normalizePathname(raw);
  const match = normalized.match(/^\/(uk|de|it)(\/.*|$)/);
  if (match) {
    return {
      langPrefix: match[1],
      basePath: normalizePathname(match[2] || '/'),
    };
  }
  return {
    langPrefix: null,
    basePath: normalized,
  };
};

const buildCanonicalUrl = (lang, basePath) => {
  const cleanBase = basePath === '/' ? '' : basePath;
  if (!lang || lang === 'en') {
    return `${BASE_URL}${cleanBase || '/'}`;
  }
  return `${BASE_URL}/${lang}${cleanBase}`;
};

const PageSEO = () => {
  const { pathname: rawPath } = useLocation();
  const { langPrefix, basePath } = parseLocalizedPath(rawPath);
  const { uiLang, setUiLang } = useLanguage();
  const lastPrefixRef = useRef(null);

  useEffect(() => {
    if (langPrefix && lastPrefixRef.current !== langPrefix) {
      lastPrefixRef.current = langPrefix;
      if (uiLang !== langPrefix) {
        setUiLang(langPrefix);
      }
    } else if (!langPrefix) {
      lastPrefixRef.current = null;
    }
  }, [langPrefix, uiLang, setUiLang]);

  const effectiveLang = langPrefix || uiLang || 'en';
  const canonicalLang = langPrefix || 'en';
  const dict = translations[effectiveLang] || translations.en;

  const localized = useMemo(() => {
    const baseEntries = {
      '/': {
        title: dict.seoHomeTitle,
        description: dict.seoHomeDesc,
        canonical: buildCanonicalUrl(canonicalLang, '/'),
        ogImage: OG_IMAGE,
        index: true,
      },
      '/linkedin-message': {
        title: dict.seoLinkedInTitle,
        description: dict.seoLinkedInDesc,
        canonical: buildCanonicalUrl(canonicalLang, '/linkedin-message'),
        ogImage: OG_IMAGE,
        index: true,
      },
      '/subject-line': {
        title: dict.seoSubjectTitle,
        description: dict.seoSubjectDesc,
        canonical: buildCanonicalUrl(canonicalLang, '/subject-line'),
        ogImage: OG_IMAGE,
        index: true,
      },
      '/cover-letter-ai-developer': {
        title: dict.seoAIDevTitle,
        description: dict.seoAIDevDesc,
        canonical: buildCanonicalUrl(canonicalLang, '/cover-letter-ai-developer'),
        ogImage: OG_IMAGE,
        index: true,
      },
      '/linkedin-cold-message-templates': {
        title: dict.seoLinkedInColdTitle,
        description: dict.seoLinkedInColdDesc,
        canonical: buildCanonicalUrl(canonicalLang, '/linkedin-cold-message-templates'),
        ogImage: OG_IMAGE,
        index: true,
      },
      '/freelancer-self-introduction': {
        title: dict.seoFreelancerTitle,
        description: dict.seoFreelancerDesc,
        canonical: buildCanonicalUrl(canonicalLang, '/freelancer-self-introduction'),
        ogImage: OG_IMAGE,
        index: true,
      },
    };

    for (const page of SEO_ROLE_PAGES) {
      const loc = page.locales[effectiveLang] || page.locales.en;
      baseEntries[page.path] = {
        title: loc.title,
        description: loc.description,
        canonical: buildCanonicalUrl(canonicalLang, page.path),
        ogImage: OG_IMAGE,
        index: true,
      };
    }

    return baseEntries;
  }, [dict, effectiveLang, canonicalLang]);

  const seoByPath = useMemo(() => {
    if (langPrefix) return localized;
    return { ...STATIC_SEO, ...localized };
  }, [langPrefix, localized]);

  const config = seoByPath[basePath] ?? {
    title: '404 — Page Not Found | AI-Letter',
    description: '',
    canonical: null,
    ogImage: null,
    index: false,
  };

  const showHreflang = config.index && basePath !== '/terms' && basePath !== '/privacy';

  return (
    <Helmet>
      <html lang={canonicalLang} />
      {config.title && <title>{config.title}</title>}
      {config.description && <meta name="description" content={config.description} />}
      <meta name="robots" content={config.index ? 'index, follow' : 'noindex, nofollow'} />
      {config.canonical && <link rel="canonical" href={config.canonical} />}
      {showHreflang && SUPPORTED_SEO_LANGS.map((lang) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={buildCanonicalUrl(lang, basePath)} />
      ))}
      {showHreflang && (
        <link rel="alternate" hrefLang="x-default" href={buildCanonicalUrl('en', basePath)} />
      )}
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

const PageLoader = () => (
  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Suspense fallback={<PageLoader />}>{children}</Suspense> : <Navigate replace to="/" />;
};

const DashboardRoute = () => {
  const { user, loading, isNewUser } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate replace to="/" />;
  if (isNewUser) return <Navigate replace to="/onboarding" />;
  return (
    <Suspense fallback={<PageLoader />}>
      <Dashboard />
    </Suspense>
  );
};

const NotFoundPage = () => (
  <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center px-4 text-center font-sans">
    <h1 className="text-5xl font-black text-indigo-400 mb-3">404</h1>
    <p className="text-slate-300 text-lg font-semibold mb-2">Page not found</p>
    <p className="text-slate-500 text-sm max-w-md mb-6">
      The page you are looking for does not exist or has been moved.
    </p>
    <Link
      to="/"
      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors"
    >
      Back to AI-Letter Home
    </Link>
  </div>
);

const ROUTE_PREFIXES = ['', ...PREFIXED_LANGS.map((l) => `/${l}`)];

function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('referrer_uid', ref);
    }
  }, []);
  return (
    <HelmetProvider>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <PageSEO />
            <Routes>
              {ROUTE_PREFIXES.flatMap((prefix) => [
                <Route key={`${prefix}-home`} path={prefix || '/'} element={<Landing />} />,
                <Route key={`${prefix}-linkedin`} path={`${prefix}/linkedin-message`} element={<LinkedInGeneratorPage />} />,
                <Route key={`${prefix}-subject`} path={`${prefix}/subject-line`} element={<SubjectLineGeneratorPage />} />,
                <Route key={`${prefix}-aidev`} path={`${prefix}/cover-letter-ai-developer`} element={<AIDeveloperCoverLetterPage />} />,
                <Route key={`${prefix}-licold`} path={`${prefix}/linkedin-cold-message-templates`} element={<LinkedInColdMessagesPage />} />,
                <Route key={`${prefix}-freelancer`} path={`${prefix}/freelancer-self-introduction`} element={<FreelancerSelfIntroductionPage />} />,
                ...SEO_ROLE_PAGES.map((rolePage) => (
                  <Route
                    key={`${prefix}-${rolePage.slug}`}
                    path={`${prefix}${rolePage.path}`}
                    element={<RoleCoverLetterPage roleConfig={rolePage} />}
                  />
                )),
              ])}
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
              <Route path="/dashboard" element={<DashboardRoute />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
