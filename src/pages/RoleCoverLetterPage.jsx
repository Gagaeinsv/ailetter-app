import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateRoleHook } from '../gemini';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import translations from '../locales/translations';
import { SEO_ROLE_PAGES } from '../constants/seoRolePages';
import { Loader2, Copy, Check, Terminal, Cpu, Award } from 'lucide-react';

const UI_TO_PROMPT_LANG = { en: 'English', uk: 'Ukrainian', it: 'Italian', de: 'German' };

export default function RoleCoverLetterPage({ roleConfig }) {
  const { uiLang, setUiLang } = useLanguage();
  const { user } = useAuth();
  const dict = translations[uiLang] || translations.en;
  const loc = roleConfig.locales[uiLang] || roleConfig.locales.en;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedFull, setCopiedFull] = useState(false);

  const handleCopyFull = () => {
    if (!loc.fullExampleLetter) return;
    navigator.clipboard.writeText(loc.fullExampleLetter);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleCustomizeFull = () => {
    localStorage.setItem(
      'preloaded_template',
      JSON.stringify({
        profession: loc.roleName,
        jobDescription: `Target Role: ${loc.roleName}\nCore Skills: ${loc.skillsPlaceholder}`,
      })
    );
    window.scrollTo(0, 0);
    navigate(user ? '/dashboard' : '/login');
  };

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: loc.title.split('|')[0].trim(),
    url: `https://ailetter.pro${uiLang && uiLang !== 'en' ? `/${uiLang}` : ''}${roleConfig.path}`,
    description: loc.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }), [loc.title, loc.description, roleConfig.path, uiLang]);

  useEffect(() => {
    const id = `ailetter-role-schema-${roleConfig.slug}`;
    let sd = document.querySelector(`#${id}`);
    if (!sd) {
      sd = document.createElement('script');
      sd.id = id;
      sd.type = 'application/ld+json';
      document.head.appendChild(sd);
    }
    sd.textContent = JSON.stringify(schema);
    return () => {
      try { document.head.removeChild(sd); } catch { /* ignore */ }
    };
  }, [schema, roleConfig.slug]);

  const langPrefix = uiLang && uiLang !== 'en' ? `/${uiLang}` : '';

  const goToMain = () => {
    window.scrollTo(0, 0);
    navigate(`/?from=${roleConfig.slug}`);
  };

  const handleGenerate = async () => {
    if (!skills.trim() || !jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const data = await generateRoleHook(
        loc.roleName,
        name,
        skills,
        experience,
        jobDescription,
        { outputLanguage: UI_TO_PROMPT_LANG[uiLang] || 'English' }
      );
      if (Array.isArray(data) && data.length >= 2) {
        setResults(data);
      } else {
        throw new Error('Invalid format');
      }
    } catch {
      setError(dict.aiDevError || 'Failed to generate hooks.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center px-4 py-8 font-sans select-text">
      {/* Top Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-10 pb-4 border-b border-white/[0.06]">
        <Link to={langPrefix || '/'} className="flex items-center gap-2 font-black tracking-tighter text-base text-white">
          <img src="/android-chrome-192x192.png" alt="AI-Letter" className="w-7 h-7 rounded-lg" />
          AI-Letter
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher value={uiLang} onChange={(newLang) => {
            setUiLang(newLang);
            navigate(`${newLang === 'en' ? '' : `/${newLang}`}${roleConfig.path}`);
          }} />
          <Link to="/login" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-colors">
            {dict.login || 'Login'}
          </Link>
        </div>
      </header>

      {/* Title Header */}
      <div className="max-w-2xl mb-8 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
          {loc.h1}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          {loc.lead}
        </p>
        <p className="text-xs text-indigo-400/90 font-semibold">{dict.toolLangNote}</p>
      </div>

      {/* Generator Tool Widget */}
      <div className="w-full max-w-2xl bg-[#1e293b]/50 border border-[#334155]/50 p-6 rounded-3xl space-y-4 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {dict.aiDevNameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={dict.aiDevNamePh}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {dict.aiDevExpLabel}
            </label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder={dict.aiDevExpPh}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {dict.aiDevSkillsLabel}
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder={loc.skillsPlaceholder}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {dict.aiDevJdLabel}
          </label>
          <textarea
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            rows={5}
            placeholder={loc.jdPlaceholder}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !skills.trim() || !jobDescription.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-600/20"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {dict.aiDevGenerating}
            </>
          ) : (
            <>
              <Cpu size={16} />
              {dict.aiDevGenerate}
            </>
          )}
        </button>

        {error && <p className="text-xs text-rose-400 text-center font-bold">{error}</p>}
      </div>

      {/* Generated Results Panel */}
      {results.length > 0 && (
        <div className="w-full max-w-2xl mt-8 space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">
            {dict.aiDevResultsTitle}
          </h3>

          <div className="space-y-4">
            {results.map((hook, i) => (
              <div key={i} className="bg-[#1e293b]/70 border border-[#334155]/50 p-5 rounded-2xl space-y-3 relative shadow-xl">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {i === 0 ? dict.aiDevResultBold : dict.aiDevResultTech}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(hook, i)}
                    className="text-slate-400 hover:text-white transition-all bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg border border-white/5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {copiedIdx === i ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedIdx === i ? dict.aiDevCopied : dict.aiDevCopy}
                  </button>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {hook}
                </p>
              </div>
            ))}
          </div>

          {/* Upsell to full cover letter */}
          <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-0.5 text-center md:text-left">
              <p className="font-bold text-white text-sm">{dict.aiDevUpsellTitle}</p>
              <p className="text-xs text-slate-400">{dict.seoHomeDesc}</p>
            </div>
            <button
              type="button"
              onClick={goToMain}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-lg shadow-indigo-600/15"
            >
              {dict.aiDevUpsellBtn}
            </button>
          </div>
        </div>
      )}

      {/* Guide Content Section (SEO-Rich) */}
      <div className="w-full max-w-2xl mt-16 border-t border-slate-800 pt-10 space-y-6">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Terminal className="text-indigo-400 w-6 h-6 shrink-0" />
          {loc.roleName}
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed font-medium">
          {loc.lead}
        </p>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Award size={14} />
            {loc.ruleTitle}
          </h3>
          <ul className="space-y-2.5 text-slate-400 text-xs font-semibold pl-1.5">
            {loc.rules.map((rule, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-indigo-400">⚡</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
            {loc.exampleTitle}
          </h3>
          <div className="bg-slate-800/40 border border-[#334155]/20 p-5 rounded-2xl font-serif text-slate-300 text-xs leading-relaxed italic relative">
            {loc.exampleText}
          </div>
        </div>

        {loc.fullExampleLetter && (
          <div className="bg-[#1e293b]/50 border border-indigo-500/25 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black text-white">
                {loc.fullExampleTitle || 'Full Cover Letter Sample'}
              </h3>
              <button
                type="button"
                onClick={handleCopyFull}
                className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 text-[11px] font-bold transition-colors"
              >
                {copiedFull ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copiedFull ? (dict.copied || 'Copied!') : (uiLang === 'uk' ? 'Копіювати весь лист' : 'Copy Full Example')}
              </button>
            </div>
            <div className="bg-[#0f172a]/80 border border-white/5 rounded-2xl p-5 font-serif text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {loc.fullExampleLetter}
            </div>
            <button
              type="button"
              onClick={handleCustomizeFull}
              className="w-full py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20"
            >
              {uiLang === 'uk' ? 'Адаптувати цей лист під моє CV →' : 'Customize This Letter with My CV →'}
            </button>
          </div>
        )}
      </div>

      {/* Internal Navigation between Tools & Roles */}
      <nav aria-label="Related AI-Letter Tools" className="w-full max-w-2xl mt-12 pt-8 border-t border-slate-800/80 text-xs text-slate-400">
        <p className="font-bold uppercase tracking-wider text-[10px] text-slate-500 mb-3">
          {uiLang === 'uk' ? 'Інші інструменти та гайди AI-Letter:' : 'More AI-Letter Generators & Guides:'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to={langPrefix || '/'} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-indigo-300 transition-colors">
            AI-Letter Home
          </Link>
          <Link to={`${langPrefix}/ats-resume-checker`} className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-300 font-semibold transition-colors">
            ATS Resume Checker 🔥
          </Link>
          <Link to={`${langPrefix}/cover-letter-ai-developer`} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors">
            AI Developer
          </Link>
          <Link to={`${langPrefix}/linkedin-message`} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors">
            LinkedIn Easy Apply
          </Link>
          <Link to={`${langPrefix}/subject-line`} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors">
            Email Subject Line
          </Link>
          <Link to={`${langPrefix}/freelancer-self-introduction`} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors">
            Freelancer Pitch
          </Link>
          {SEO_ROLE_PAGES.filter((p) => p.slug !== roleConfig.slug).map((p) => (
            <Link key={p.slug} to={`${langPrefix}${p.path}`} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors">
              {(p.locales[uiLang] || p.locales.en).roleName}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
