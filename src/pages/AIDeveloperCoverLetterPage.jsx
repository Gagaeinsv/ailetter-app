import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAIDevHook } from '../gemini';
import { useLanguage } from '../context/LanguageContext';
import translations from '../locales/translations';
import { Loader2, Copy, Check, Terminal, Cpu, Award } from 'lucide-react';

const UI_TO_PROMPT_LANG = { en: 'English', uk: 'Ukrainian', it: 'Italian', de: 'German' };

export default function AIDeveloperCoverLetterPage() {
  const { uiLang } = useLanguage();
  const dict = translations[uiLang] || translations.en;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: dict.seoAIDevTitle?.split('|')[0]?.trim() || 'AI Developer Cover Letter Generator',
    url: 'https://ailetter.pro/cover-letter-ai-developer',
    description: dict.seoAIDevDesc || '',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }), [dict.seoAIDevTitle, dict.seoAIDevDesc]);

  useEffect(() => {
    let sd = document.querySelector('#ailetter-aidev-schema');
    if (!sd) {
      sd = document.createElement('script');
      sd.id = 'ailetter-aidev-schema';
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
    navigate('/?from=cover-letter-ai-developer');
  };

  const handleGenerate = async () => {
    if (!skills.trim() || !jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const data = await generateAIDevHook(name, skills, experience, jobDescription, {
        outputLanguage: UI_TO_PROMPT_LANG[uiLang] || 'English',
      });
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

  // Structured advice text based on language
  const guideText = useMemo(() => {
    if (uiLang === 'uk') {
      return {
        title: 'Як написати супровідний лист для AI розробника?',
        p1: 'Вакансії в сфері AI/ML зараз мають шалений попит, але рекрутери шукають кандидатів, які вміють вирішувати реальні бізнес-проблеми, а не просто викликати OpenAI API. Ваш супровідний лист має демонструвати глибоку технічну експертизу та розуміння архітектури систем.',
        ruleTitle: '3 золотих правила написання:',
        rule1: 'Уникайте загальних фраз про «пристрасть до ШІ». Покажіть конкретні технології: PyTorch, JAX, Hugging Face, LangChain, векторні бази даних (Pinecone, Qdrant).',
        rule2: 'Фокусуйтеся на бізнес-метриках. Наприклад: "Скоротив витрати на API на 45% завдяки оновленню промптів та тонкому налаштуванню LLaMA".',
        rule3: 'Покажіть досвід розгортання та продакшену (MLOps). Напишіть про контейнеризацію моделей, оптимізацію інференсу та роботу з Triton/TensorRT.',
        exampleTitle: 'Приклад успішного вступу:',
        exampleText: '«Останні 3 роки я спеціалізуюся на розробці систем генеративного ШІ. У своїй останній ролі я розробив RAG-систему для автоматизації підтримки, яка обробляє понад 50 000 запитів щодня з точністю відповіді 92%. Маючи глибокі знання PyTorch, LangChain та досвід тонкого налаштування LLM (LLaMA-3, Mistral), я готовий допомогти вашій команді оптимізувати конвеєри обробки даних...»'
      };
    }
    if (uiLang === 'it') {
      return {
        title: 'Come scrivere una lettera di presentazione per un AI Developer?',
        p1: 'I ruoli di AI/ML sono molto richiesti, ma i recruiter cercano candidati che sappiano risolvere problemi aziendali reali e non solo chiamare le API di OpenAI. La tua lettera di presentazione deve dimostrare competenza tecnica e rigore ingegneristico.',
        ruleTitle: '3 regole d\'oro:',
        rule1: 'Evita frasi generiche sulla passione per l\'IA. Dimostra familiarità con strumenti reali come PyTorch, Hugging Face, database vettoriali (Qdrant, Pinecone) e framework come LangChain.',
        rule2: 'Enfatizza i risultati misurabili. Ad esempio: "Ridotto i costi delle API del 40% tramite tecniche di caching dei prompt e finetuning locale di modelli open-source".',
        rule3: 'Parla di MLOps ed engineering. Descrivi come hai ottimizzato i tempi di inferenza in produzione o come hai gestito pipeline di dati complesse.',
        exampleTitle: 'Esempio di introduzione efficace:',
        exampleText: '"Negli ultimi 3 anni ho lavorato allo sviluppo di soluzioni IA aziendali basate su modelli linguistici di grandi dimensioni. Nel mio ultimo ruolo, ho progettato un sistema RAG che gestisce oltre 20.000 richieste giornaliere con una precisione del 94%. Grazie alla mia competenza in PyTorch e al finetuning di LLaMA, sono pronto a contribuire..."'
      };
    }
    if (uiLang === 'de') {
      return {
        title: 'Wie schreibt man ein Anschreiben für einen AI Developer?',
        p1: 'Stellen im Bereich KI/ML sind heiß begehrt, aber Recruiter suchen Entwickler, die echte Geschäftsprobleme lösen können, anstatt nur OpenAI-APIs aufzurufen. Ihr Anschreiben muss technisches Verständnis und ingenieurwissenschaftliche Tiefe zeigen.',
        ruleTitle: '3 goldene Regeln:',
        rule1: 'Vermeiden Sie allgemeine Sätze über Ihre Faszination für KI. Nennen Sie konkrete Frameworks: PyTorch, Hugging Face, Vektordatenbanken (Pinecone, Qdrant) oder LangChain/LlamaIndex.',
        rule2: 'Betonen Sie messbare Ergebnisse. Beispiel: "API-Kosten durch Prompt-Caching und Fine-Tuning lokaler LLaMA-Modelle um 40 % gesenkt".',
        rule3: 'Erwähnen Sie MLOps & Skalierung. Beschreiben Sie, wie Sie Modelle in die Produktion gebracht und Inferenz-Latenzen optimiert haben.',
        exampleTitle: 'Beispiel für einen starken Einstieg:',
        exampleText: '"In den letzten drei Jahren habe ich mich auf die Entwicklung und das Deployment von Generative-AI-Systemen spezialisiert. Zuletzt habe ich eine RAG-Pipeline aufgebaut, die täglich über 30.000 Kundenanfragen mit einer Präzision von 91% automatisiert beantwortet. Mit tiefen Kenntnissen in PyTorch..."'
      };
    }
    // Default English
    return {
      title: 'How to write an AI Developer cover letter?',
      p1: 'AI/ML roles are highly competitive, and recruiters are looking for candidates who can solve real business problems rather than just call OpenAI endpoints. Your cover letter needs to demonstrate engineering rigour and specific technical depth.',
      ruleTitle: '3 golden rules for writing:',
      rule1: 'Be specific about your toolkit. Mention PyTorch, JAX, Hugging Face, vector databases (Pinecone, Qdrant), or fine-tuning workflows.',
      rule2: 'Highlight metrics and efficiency. For example: "Reduced LLM API latency by 35% through query caching and prompt optimization".',
      rule3: 'Discuss MLOps and production experience. Mention how you deployed models, managed pipelines, or optimized GPU inference using Triton/TensorRT.',
      exampleTitle: 'Example of a successful opening:',
      exampleText: '"For the past three years, I have specialized in building and deploying generative AI systems. In my last role, I designed a production RAG system that automates 40,000+ support queries daily with a 93% accuracy rate. Leveraging PyTorch, LangChain, and extensive experience fine-tuning open-source LLMs (LLaMA-3, Mistral)..."'
    };
  }, [uiLang]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center px-4 py-12 font-sans select-text">
      {/* Title Header */}
      <div className="max-w-2xl mb-8 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
          {guideText.title}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          {dict.aiDevPageLead}
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
            placeholder={dict.aiDevSkillsPh}
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
            placeholder={dict.aiDevJdPh}
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
              <p className="text-xs text-slate-400">Generate a custom formatted, print-ready PDF resume and cover letter in 1 click.</p>
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
          <Terminal className="text-indigo-400 w-6 h-6" />
          {guideText.title}
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed font-medium">
          {guideText.p1}
        </p>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Award size={14} />
            {guideText.ruleTitle}
          </h4>
          <ul className="space-y-2.5 text-slate-400 text-xs font-semibold pl-1.5">
            <li className="flex gap-2">
              <span className="text-indigo-400">⚡</span>
              <span>{guideText.rule1}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-400">⚡</span>
              <span>{guideText.rule2}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-400">⚡</span>
              <span>{guideText.rule3}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
            {guideText.exampleTitle}
          </h3>
          <div className="bg-slate-800/40 border border-[#334155]/20 p-5 rounded-2xl font-serif text-slate-300 text-xs leading-relaxed italic relative">
            {guideText.exampleText}
          </div>
        </div>
      </div>
    </div>
  );
}
