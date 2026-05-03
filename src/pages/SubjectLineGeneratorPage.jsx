import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSubjectLines } from '../gemini';
import { useLanguage } from '../context/LanguageContext';
import translations from '../locales/translations';
import { Loader2, Copy, Check, Mail } from 'lucide-react';

const UI_TO_PROMPT_LANG = { en: 'English', uk: 'Ukrainian', it: 'Italian', de: 'German' };

export default function SubjectLineGeneratorPage() {
  const { uiLang } = useLanguage();
  const dict = translations[uiLang] || translations.en;
  const navigate = useNavigate();

  const [jobDescription, setJobDescription] = useState('');
  const [name, setName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: dict.seoSubjectTitle?.split('|')[0]?.trim() || 'Email subject line generator',
    url: 'https://ailetter.pro/subject-line',
    description: dict.seoSubjectDesc || '',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }), [dict.seoSubjectTitle, dict.seoSubjectDesc]);

  useEffect(() => {
    let sd = document.querySelector('#ailetter-subject-schema');
    if (!sd) {
      sd = document.createElement('script');
      sd.id = 'ailetter-subject-schema';
      sd.type = 'application/ld+json';
      document.head.appendChild(sd);
    }
    sd.textContent = JSON.stringify(schema);
    return () => { try { document.head.removeChild(sd); } catch { /* ignore */ } };
  }, [schema]);

  const goToMain = () => {
    window.scrollTo(0, 0);
    navigate('/?from=subject-line');
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const data = await generateSubjectLines('', jobDescription, { fullName: name }, {
        outputLanguage: UI_TO_PROMPT_LANG[uiLang] || 'English',
      });
      setResults(data);
    } catch {
      setError(dict.subjectError);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (line, idx) => {
    navigator.clipboard.writeText(line);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center px-4 py-12">
      <div className="max-w-2xl mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{dict.subjectPageTitle}</h1>
        <p className="text-gray-400 mb-3">{dict.subjectPageLead}</p>
        <p className="text-gray-500 text-sm">{dict.subjectPageSteps}</p>
        <p className="text-xs text-indigo-400/90 mt-3">{dict.toolLangNote}</p>
        <p className="text-xs text-gray-500 mt-2">
          <button type="button" onClick={goToMain} className="text-indigo-400 hover:text-indigo-300 underline">
            {dict.subjectUpsellBtn}
          </button>
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">{dict.subjectNameLabel}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={dict.subjectNamePh}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 text-white text-sm"
          />
        </div>
        <textarea
          className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-white resize-none"
          rows={7}
          placeholder={dict.subjectPlaceholder}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !jobDescription.trim()}
          className="w-full bg-[#6366f1] hover:bg-[#5458ee] px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {dict.subjectGenerating}
            </>
          ) : (
            <>
              <Mail size={18} />
              {dict.subjectGenerate}
            </>
          )}
        </button>
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="w-full max-w-2xl mt-8 space-y-3">
          {results.map((line, i) => (
            <div
              key={i}
              className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <p className="flex-1 text-gray-200 text-sm">{line}</p>
              <button
                type="button"
                onClick={() => handleCopy(line, i)}
                className="shrink-0 bg-[#334155] px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
              >
                {copiedIdx === i ? <Check size={15} /> : <Copy size={15} />}
                {copiedIdx === i ? dict.subjectCopied : dict.subjectCopy}
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-600">{dict.subjectHint}</p>
          <p className="text-xs text-gray-700">{dict.subjectFooter}</p>
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-semibold text-white text-sm">{dict.subjectUpsellTitle}</p>
            <button
              type="button"
              onClick={goToMain}
              className="bg-[#6366f1] hover:bg-[#5458ee] px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              {dict.subjectUpsellBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
