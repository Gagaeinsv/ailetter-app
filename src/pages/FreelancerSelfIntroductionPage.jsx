import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateFreelancerProposal } from '../gemini';
import { useLanguage } from '../context/LanguageContext';
import translations from '../locales/translations';
import { Loader2, Copy, Check, Briefcase, Award, Zap } from 'lucide-react';

const UI_TO_PROMPT_LANG = { en: 'English', uk: 'Ukrainian', it: 'Italian', de: 'German' };

export default function FreelancerSelfIntroductionPage() {
  const { uiLang } = useLanguage();
  const dict = translations[uiLang] || translations.en;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [experience, setExperience] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: dict.seoFreelancerTitle?.split('|')[0]?.trim() || 'Freelancer Self-Introduction Pitch Generator',
    url: 'https://ailetter.pro/freelancer-self-introduction',
    description: dict.seoFreelancerDesc || '',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }), [dict.seoFreelancerTitle, dict.seoFreelancerDesc]);

  useEffect(() => {
    let sd = document.querySelector('#ailetter-free-schema');
    if (!sd) {
      sd = document.createElement('script');
      sd.id = 'ailetter-free-schema';
      sd.type = 'application/ld+json';
      document.head.appendChild(sd);
    }
    sd.textContent = JSON.stringify(schema);
    return () => {
      try { document.head.removeChild(sd); } catch { /* ignore */ }
    };
  }, [schema]);

  const goToMain = () => {
    window.scrollTo(0, 0);
    navigate('/?from=freelancer-self-introduction');
  };

  const handleGenerate = async () => {
    if (!niche.trim() || !projectDescription.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const text = await generateFreelancerProposal(
        name,
        niche,
        projectDescription,
        experience,
        { outputLanguage: UI_TO_PROMPT_LANG[uiLang] || 'English' }
      );
      setResult(text);
    } catch {
      setError(dict.freeError || 'Failed to generate proposal.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Structured guide data based on language
  const guideData = useMemo(() => {
    if (uiLang === 'uk') {
      return {
        title: 'Як написати ефективну самопрезентацію фрілансера?',
        p1: 'Коли ви подаєте пропозицію на Upwork або пишете клієнту напряму, перші два речення визначають, чи відкриє він ваш лист взагалі. Ваша самопрезентація має відразу відповідати на головне запитання клієнта: "Як саме ви вирішите мою проблему?".',
        rulesTitle: '3 правила успішного супровідного листа:',
        rule1: 'Не починайте з тривалої розповіді про себе. Замість "Мене звати Олександр, я маю 5 років досвіду..." напишіть: "Привіт! Я ознайомився з вашим запитом щодо [Проблема] і бачу, що [Рішення/Ваш аналіз]".',
        rule2: 'Пропонуйте рішення відразу. Опишіть короткий план дій або задайте 1-2 уточнюючі питання щодо проекту клієнта.',
        rule3: 'Покажіть схожий кейс (Proof of Work). Вкажіть посилання або згадайте подібний проект із конкретними цифрами успіху.',
        exampleTitle: 'Приклад успішного пітчу:',
        exampleText: '«Вітаю! Я уважно вивчив ваш опис проекту щодо створення лендінгу на Webflow. Маючи понад 4 роки досвіду розробки дизайну та верстки, я допомагаю клієнтам створювати сторінки, що завантажуються менш ніж за 1.5 секунди та конвертують відвідувачів на 20% краще. Ознайомтеся з моєю останньою роботою: [посилання]. Пропоную провести короткий збіг, щоб детальніше обговорити структуру...»'
      };
    }
    if (uiLang === 'it') {
      return {
        title: 'Come scrivere una presentazione efficace per freelance?',
        p1: 'Quando invii una proposta su Upwork o scrivi direttamente a un cliente, le prime due frasi determinano se aprirà la tua candidatura o meno. La tua presentazione deve focalizzarsi su come risolverai il suo problema specifico.',
        rulesTitle: '3 regole per una proposta vincente:',
        rule1: 'Inizia parlando del cliente, non di te. Invece di "Sono Alex, sono uno sviluppatore...", inizia con: "Ciao! Ho letto le specifiche del tuo progetto su [problema] e..."',
        rule2: 'Proponi una soluzione immediata. Condividi un breve piano d\'azione o poni una domanda strategica per mostrare interesse.',
        rule3: 'Mostra prove tangibili (Proof of Work). Cita un progetto simile che hai completato con successo.',
        exampleTitle: 'Esempio di pitch efficace:',
        exampleText: '"Ciao! Ho analizzato la tua richiesta di migrazione a Shopify. Negli ultimi 4 anni ho assistito marchi e-commerce riducendo i tempi di caricamento del 30% e aumentando le vendite. Ecco un esempio del mio ultimo lavoro... Contattami per una breve chiacchierata!"'
      };
    }
    if (uiLang === 'de') {
      return {
        title: 'Wie verfasst man eine erfolgreiche Freelancer-Vorstellung?',
        p1: 'Wenn Sie ein Angebot auf Upwork einreichen oder Kunden direkt anschreiben, entscheiden die ersten zwei Sätze, ob Ihre Nachricht geöffnet wird. Ihre Vorstellung muss direkt klären, wie Sie das Problem des Kunden lösen.',
        rulesTitle: '3 goldene Regeln für Angebote:',
        rule1: 'Beginnen Sie mit dem Problem des Kunden, nicht mit sich selbst. Schreiben Sie statt "Ich bin Entwickler mit 5 Jahren Erfahrung..." lieber: "Hallo! Ich habe Ihre Anforderungen bezüglich [Projekt] gelesen und..."',
        rule2: 'Schlagen Sie direkt eine Lösung vor. Skizzieren Sie einen kurzen Aktionsplan oder stellen Sie 1-2 präzise Fragen.',
        rule3: 'Bringen Sie Referenzen (Proof of Work). Nennen Sie ein ähnliches Projekt, das Sie erfolgreich abgeschlossen haben.',
        exampleTitle: 'Beispiel für einen starken Pitch:',
        exampleText: '"Hallo! Ich habe Ihre Ausschreibung zur Optimierung Ihrer WordPress-Website gelesen. In meinen 5 Jahren als Entwickler habe ich Ladezeiten im Schnitt um 40% gesenkt. Hier ist ein Link zu meinem letzten Projekt... Lassen Sie uns kurz abstimmen!"'
      };
    }
    // Default English
    return {
      title: 'How to write a winning freelancer self-introduction?',
      p1: 'When submitting proposals on Upwork or pitching clients cold, the first two sentences determine whether they read your pitch or skip it. Your introduction must focus on the client\'s pain points and explain how you will solve them.',
      rulesTitle: '3 rules for a high-converting pitch:',
      rule1: 'Start with the client, not yourself. Instead of "I am Alex, a developer with 5 years experience...", start with: "Hi! I read your post about [project] and noticed..."',
      rule2: 'Offer immediate value. Outline a 2-step action plan or ask a strategic question about their project requirements.',
      rule3: 'Provide proof of work. Mention a similar project you successfully delivered and include metrics if possible.',
      exampleTitle: 'Example of a successful freelancer pitch:',
      exampleText: '"Hi! I saw your post looking for a Webflow designer. Over the past 4 years, I have built 30+ high-converting landing pages that load in under 1.8 seconds. Here is a recent project similar to yours: [Link]. I would love to connect and discuss how we can map out your structure..."'
    };
  }, [uiLang]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center px-4 py-12 font-sans select-text">
      {/* Title Header */}
      <div className="max-w-2xl mb-8 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
          {dict.freePageTitle}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          {dict.freePageLead}
        </p>
        <p className="text-xs text-indigo-400/90 font-semibold">{dict.toolLangNote}</p>
      </div>

      {/* Generator Form */}
      <div className="w-full max-w-2xl bg-[#1e293b]/50 border border-[#334155]/50 p-6 rounded-3xl space-y-4 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {dict.freeNameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={dict.freeNamePh}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {dict.freeExpLabel}
            </label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder={dict.freeExpPh}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {dict.freeNicheLabel}
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder={dict.freeNichePh}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {dict.freeClientJd}
          </label>
          <textarea
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            rows={5}
            placeholder={dict.freeClientJdPh}
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !niche.trim() || !projectDescription.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-600/20"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {dict.freeGenerating}
            </>
          ) : (
            <>
              <Zap size={16} />
              {dict.freeGenerate}
            </>
          )}
        </button>

        {error && <p className="text-xs text-rose-400 text-center font-bold">{error}</p>}
      </div>

      {/* Result Panel */}
      {result && (
        <div className="w-full max-w-2xl mt-8 space-y-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <p className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-medium">
              {result}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-white/5 flex items-center gap-2"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? dict.freeCopied : dict.freeCopy}
              </button>
            </div>
          </div>

          {/* Upsell Banner */}
          <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-0.5 text-center md:text-left">
              <p className="font-bold text-white text-sm">{dict.freeUpsellTitle}</p>
              <p className="text-xs text-slate-400">Generate a custom formatted, print-ready PDF resume and cover letter in 1 click.</p>
            </div>
            <button
              type="button"
              onClick={goToMain}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-lg shadow-indigo-600/15"
            >
              {dict.freeUpsellBtn}
            </button>
          </div>
        </div>
      )}

      {/* Guide Content Section (SEO-Rich) */}
      <div className="w-full max-w-2xl mt-16 border-t border-slate-800 pt-10 space-y-6">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Briefcase className="text-indigo-400 w-6 h-6" />
          {guideData.title}
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed font-medium">
          {guideData.p1}
        </p>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Award size={14} />
            {guideData.rulesTitle}
          </h4>
          <ul className="space-y-2.5 text-slate-400 text-xs font-semibold pl-1.5">
            <li className="flex gap-2">
              <span className="text-indigo-400">⚡</span>
              <span>{guideData.rule1}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-400">⚡</span>
              <span>{guideText.rule2 || guideData.rule2}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-400">⚡</span>
              <span>{guideData.rule3}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
            {guideData.exampleTitle}
          </h3>
          <div className="bg-slate-800/40 border border-[#334155]/20 p-5 rounded-2xl font-serif text-slate-300 text-xs leading-relaxed italic relative">
            {guideData.exampleText}
          </div>
        </div>
      </div>
    </div>
  );
}
