import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { generateLinkedInStandalone } from "../gemini";
import { useLanguage } from "../context/LanguageContext";
import translations from "../locales/translations";
import { Loader2, Copy, Check, Linkedin } from "lucide-react";

const UI_TO_PROMPT_LANG = { en: "English", uk: "Ukrainian", it: "Italian", de: "German" };

export default function LinkedInGeneratorPage() {
  const { uiLang } = useLanguage();
  const dict = translations[uiLang] || translations.en;
  const navigate = useNavigate();

  const [jobDescription, setJobDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [profession, setProfession] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const outputLanguage = UI_TO_PROMPT_LANG[uiLang] || "English";

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: dict.seoLinkedInTitle?.split('|')[0]?.trim() || 'LinkedIn Easy Apply Message Generator',
    url: 'https://ailetter.pro/linkedin-message',
    description: dict.seoLinkedInDesc || '',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }), [dict.seoLinkedInTitle, dict.seoLinkedInDesc]);

  useEffect(() => {
    let sd = document.querySelector('#ailetter-linkedin-schema');
    if (!sd) {
      sd = document.createElement('script');
      sd.id = 'ailetter-linkedin-schema';
      sd.type = 'application/ld+json';
      document.head.appendChild(sd);
    }
    sd.textContent = JSON.stringify(schema);
    return () => { try { document.head.removeChild(sd); } catch { /* ignore */ } };
  }, [schema]);

  const goToMain = () => {
    window.scrollTo(0, 0);
    navigate("/?from=linkedin");
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const text = await generateLinkedInStandalone(
        jobDescription,
        { fullName, profession },
        { outputLanguage }
      );
      setResult(text);
    } catch {
      setError(dict.linkedinError);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLinkedIn = () => {
    window.open("https://www.linkedin.com/jobs", "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center px-4 py-12">
      <div className="max-w-2xl mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          {dict.linkedinPageTitle}
        </h1>
        <p className="text-gray-400 mb-3">
          {dict.linkedinPageLead}
        </p>
        <p className="text-gray-500 text-sm">
          {dict.linkedinPageSteps}
        </p>
        <p className="text-xs text-indigo-400/90 mt-3">{dict.toolLangNote}</p>
        <p className="text-xs text-gray-500 mt-4">
          {dict.linkedinPageFreeLine}{" "}
          <button
            type="button"
            onClick={goToMain}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            {dict.linkedinPageCtaMain} →
          </button>
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">{dict.labelName}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">{dict.labelTitle}</label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-white"
            />
          </div>
        </div>
        <textarea
          className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-white resize-none"
          rows={7}
          placeholder={dict.linkedinPlaceholder}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !jobDescription.trim()}
          className="mt-1 w-full bg-[#6366f1] hover:bg-[#5458ee] px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {dict.linkedinGenerating}
            </>
          ) : (
            <>
              <Linkedin size={18} />
              {dict.linkedinGenerate}
            </>
          )}
        </button>
        {error && (
          <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
        )}
      </div>

      {result && (
        <>
          <div className="w-full max-w-2xl mt-8 bg-[#1e293b] border border-[#334155] rounded-xl p-5">
            <p className="whitespace-pre-wrap text-gray-200 text-sm mb-4">
              {result}
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleCopy}
                className="bg-[#334155] px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? dict.linkedinCopied : dict.linkedinCopy}
              </button>
              <button
                type="button"
                onClick={handleOpenLinkedIn}
                className="bg-[#0077b5] px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Linkedin size={15} />
                {dict.linkedinOpen}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              {dict.linkedinHint}
            </p>
            <p className="text-xs text-gray-700 mt-1">
              {dict.linkedinFooter}
            </p>
          </div>

          <div className="w-full max-w-2xl mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-sm">
                {dict.linkedinUpsellTitle}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {dict.linkedinUpsellBody}
              </p>
            </div>
            <button
              type="button"
              onClick={goToMain}
              className="bg-[#6366f1] hover:bg-[#5458ee] px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              {dict.linkedinUpsellBtn} →
            </button>
          </div>

          <div className="w-full max-w-2xl mt-4 bg-[#1e293b] border border-[#334155] rounded-xl p-5">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-white">
                {dict.linkedinToolkitTitle}
              </p>
              <p className="text-xs text-gray-400">
                {dict.linkedinToolkitSub}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-3">
                <p className="font-semibold text-gray-300 mb-2">{dict.linkedinFreeCol}</p>
                <ul className="space-y-1 text-gray-500">
                  <li>✔ {dict.linkedinFree1}</li>
                  <li>✔ {dict.linkedinFree2}</li>
                </ul>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 relative">
                <div className="absolute -top-2 right-2 text-[10px] bg-indigo-500 px-2 py-0.5 rounded">
                  PRO
                </div>
                <p className="font-semibold text-white mb-2">{dict.linkedinProCol}</p>
                <ul className="space-y-1 text-gray-300">
                  <li>✔ {dict.linkedinPro1}</li>
                  <li>✔ {dict.linkedinPro2}</li>
                  <li>✔ {dict.linkedinPro3}</li>
                  <li>✔ {dict.linkedinPro4}</li>
                </ul>
              </div>
            </div>
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={goToMain}
                className="bg-[#6366f1] hover:bg-[#5458ee] px-6 py-2.5 rounded-xl font-semibold text-sm"
              >
                {dict.linkedinUpgradeBtn} →
              </button>
            </div>
          </div>
        </>
      )}

      <div className="w-full max-w-2xl mt-16">
        <h2 className="text-xl font-semibold mb-6 text-center">
          {dict.linkedinExamplesTitle}
        </h2>
        <div className="space-y-4 text-sm text-gray-300">
          <div className="bg-[#1e293b] p-4 rounded-xl">
            {dict.linkedinExample1}
          </div>
          <div className="bg-[#1e293b] p-4 rounded-xl">
            {dict.linkedinExample2}
          </div>
        </div>
      </div>
    </div>
  );
}
