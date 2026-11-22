import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyzePublicCV } from '../gemini';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import { SEO_ROLE_PAGES } from '../constants/seoRolePages';
import {
  Loader2, Upload, FileText, Flame, BarChart3, Copy, Check,
  Download, Lock, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, X
} from 'lucide-react';

const UI_TO_PROMPT_LANG = { en: 'English', uk: 'Ukrainian', de: 'German', it: 'Italian' };

const COPY = {
  en: {
    badge: 'Free Tool · No Sign-Up Required',
    h1: 'Free ATS Resume Checker & Brutal CV Roast',
    lead: 'Upload your PDF resume or paste your CV text to get an instant ATS match score (0–100), missing hard-skill keywords, or a candid 6-second recruiter roast.',
    modeAts: '📊 Standard ATS Audit',
    modeRoast: '🔥 Brutal 6s Recruiter Roast',
    modeAtsHint: 'Requires your CV + Target Job Description for keyword & match scoring.',
    modeRoastHint: 'Optional Job Description — get a blunt recruiter critique & shareable score card.',
    uploadPdf: 'Upload PDF Resume (max 5MB)',
    orPasteCv: 'Or paste your CV / resume text here...',
    jdLabel: 'Target Job Description',
    jdOptional: '(Optional in Roast Mode)',
    jdPlaceholder: 'Paste the job description to match hard skills and calculate ATS score...',
    runAtsBtn: 'Run Free ATS Scan — No Sign-Up',
    runRoastBtn: 'Roast My CV in 6 Seconds — Free',
    scanning: 'Scanning your resume...',
    errNeedCv: 'Please upload a PDF resume or paste your CV text.',
    errNeedJd: 'Please paste a target Job Description for the Standard ATS Audit (or switch to Roast mode).',
    errPdfTooBig: 'PDF file must be under 5MB.',
    errGeneric: 'AI scanner is busy right now. Please try again in a few seconds.',
    verifiedBy: 'Verified by ailetter.pro',
    scoreLabel: 'ATS Match Score',
    keywordsLabel: 'Keywords',
    metricsLabel: 'Metrics',
    structureLabel: 'Structure',
    copyShare: 'Copy Share Summary',
    copiedShare: 'Copied!',
    downloadPng: 'Download PNG Card',
    firstImpression: '6-Second Recruiter First Impression',
    critiquesTitle: 'Why Recruiters Might Reject This CV',
    quickWinsTitle: 'Top Quick Fixes',
    matchedTitle: 'Matched Hard Skills',
    missingTitle: 'Missing Critical Keywords',
    tipsTitle: 'Actionable Checklist',
    previewTitle: 'AI Bullet Point Upgrade Preview',
    originalLabel: 'Original',
    optimizedLabel: 'ATS-Ready Upgrade',
    lockedTitle: 'Unlock Full CV Rewrite & Tailored Cover Letter',
    lockedDesc: 'Fix all weak bullets automatically, apply missing keywords, and export print-ready A4 PDF & DOCX.',
    lockedBtn: 'Fix My CV & Generate Cover Letter (Free) →',
    guideTitle: 'How Our Free ATS Resume Checker Evaluates Your CV',
    guideP: 'Over 70% of resumes are filtered or deprioritized before reaching a hiring manager due to missing role-specific keywords, vague duty lists without measurable outcomes, or unclear structure. AI-Letter checks your resume like a real technical recruiter plus an Applicant Tracking System.',
    faqs: [
      { q: 'Is this ATS Resume Checker free without an account?', a: 'Yes. You can scan your PDF or pasted CV against a job description for free with no registration required, and switch to Brutal Recruiter Roast mode anytime.' },
      { q: 'Does AI-Letter invent fake metrics on my resume?', a: 'Never. Where measurable numbers are missing, our optimizer flags gaps with [X%] placeholders so you stay 100% honest in interviews.' },
      { q: 'Can I download and share my ATS Score Card?', a: 'Yes. Every scan generates a clean score card you can copy as text or download as a PNG image in one click.' },
    ],
  },
  uk: {
    badge: 'Безкоштовно · Без реєстрації',
    h1: 'Безкоштовна перевірка резюме на ATS та чесний розбір від рекрутера',
    lead: 'Завантажте PDF-резюме або вставте текст CV, щоб миттєво дізнатися свій ATS-бал (0–100), знайти пропущені ключові слова або отримати чесний 6-секундний розбір від рекрутера.',
    modeAts: '📊 Стандартний ATS-аудит',
    modeRoast: '🔥 Прожарка резюме (CV Roast)',
    modeAtsHint: 'Потрібне резюме + текст вакансії для точного підрахунку збігу ключових слів.',
    modeRoastHint: 'Вакансія не обов’язкова — отримайте 3 чесні зауваження рекрутера та картку результату.',
    uploadPdf: 'Завантажити PDF-резюме (до 5 МБ)',
    orPasteCv: 'Або вставте текст вашого резюме сюди...',
    jdLabel: 'Опис цільової вакансії',
    jdOptional: '(Необов’язково в режимі Roast)',
    jdPlaceholder: 'Вставте текст вакансії, щоб перевірити збіг навичок та розрахувати ATS-бал...',
    runAtsBtn: 'Перевірити резюме безкоштовно — Без входу',
    runRoastBtn: 'Отримати розбір рекрутера за 6 сек',
    scanning: 'Аналізуємо ваше резюме...',
    errNeedCv: 'Будь ласка, завантажте PDF або вставте текст резюме.',
    errNeedJd: 'Вставте текст вакансії для ATS-аудиту (або оберіть режим «Прожарка резюме»).',
    errPdfTooBig: 'Файл PDF має бути меншим за 5 МБ.',
    errGeneric: 'ШІ-сканер тимчасово перевантажений. Спробуйте через кілька секунд.',
    verifiedBy: 'Перевірено на ailetter.pro',
    scoreLabel: 'Оцінка ATS',
    keywordsLabel: 'Ключові слова',
    metricsLabel: 'Метрики',
    structureLabel: 'Структура',
    copyShare: 'Копіювати результат',
    copiedShare: 'Скопійовано!',
    downloadPng: 'Завантажити PNG-картку',
    firstImpression: 'Перше враження рекрутера за 6 секунд',
    critiquesTitle: 'Чому резюме можуть відхилити',
    quickWinsTitle: 'Швидкі виправлення прямо зараз',
    matchedTitle: 'Знайдені ключові навички',
    missingTitle: 'Пропущені важливі слова з вакансії',
    tipsTitle: 'Чек-лист покращень',
    previewTitle: 'Приклад покращення формулювання з ШІ',
    originalLabel: 'Було',
    optimizedLabel: 'Підсилено під ATS',
    lockedTitle: 'Відкрийте повне покращення CV та супровідний лист',
    lockedDesc: 'Автоматично додайте пропущені ключові слова, виправте всі досягнення та експортуйте чистий A4 PDF.',
    lockedBtn: 'Виправити резюме та створити лист (Безкоштовно) →',
    guideTitle: 'Як працює безкоштовна перевірка резюме на ATS',
    guideP: 'Більшість резюме не доходять до фінальної співбесіди через розмиті описи обов’язків без цифр або відсутність ключових технологій із вакансії. Наш інструмент поєднує алгоритм зіставлення навичок та погляд сеньйор-рекрутера.',
    faqs: [
      { q: 'Чи справді перевірка резюме на ATS безкоштовна без реєстрації?', a: 'Так. Ви можете завантажити PDF або вставити текст резюме та миттєво побачити свій бал ATS або розбір рекрутера без створення акаунту.' },
      { q: 'Чи вигадує ШІ фейкові цифри у прикладах покращення?', a: 'Ні. Якщо в резюме бракує цифр, оптимізатор ставить підказки [X%], щоб ви вписали лише свої реальні досягнення.' },
      { q: 'Чи можна поділитися карткою оцінки з друзями?', a: 'Так, картку з балом можна завантажити одним кліком у форматі PNG або скопіювати коротким текстом.' },
    ],
  },
  de: {
    badge: 'Kostenlos · Ohne Registrierung',
    h1: 'Kostenloser ATS-Lebenslauf-Check & Recruiter Roast',
    lead: 'Laden Sie Ihren PDF-Lebenslauf hoch oder fügen Sie den Text ein, um sofort Ihren ATS-Score (0–100), fehlende Keywords oder ein ehrliches 6-Sekunden-Recruiter-Feedback zu erhalten.',
    modeAts: '📊 Standard ATS-Check',
    modeRoast: '🔥 Ehrlicher 6-Sekunden Recruiter-Roast',
    modeAtsHint: 'Erfordert Lebenslauf + Stellenanzeige für Keyword- und ATS-Bewertung.',
    modeRoastHint: 'Stellenanzeige optional — direktes Recruiter-Feedback & teilbare Score-Card.',
    uploadPdf: 'PDF-Lebenslauf hochladen (max. 5 MB)',
    orPasteCv: 'Oder Lebenslauf-Text hier einfügen...',
    jdLabel: 'Ziel-Stellenbeschreibung',
    jdOptional: '(Optional im Roast-Modus)',
    jdPlaceholder: 'Stellenanzeige einfügen, um Keywords und ATS-Score zu berechnen...',
    runAtsBtn: 'Kostenlosen ATS-Scan starten — Ohne Anmeldung',
    runRoastBtn: 'Lebenslauf in 6 Sek. prüfen lassen',
    scanning: 'Lebenslauf wird analysiert...',
    errNeedCv: 'Bitte laden Sie ein PDF hoch oder fügen Sie Ihren Lebenslauf-Text ein.',
    errNeedJd: 'Bitte fügen Sie für den Standard-ATS-Check eine Stellenbeschreibung ein (oder wechseln Sie zu Roast).',
    errPdfTooBig: 'Die PDF-Datei darf maximal 5 MB groß sein.',
    errGeneric: 'KI-Scanner ist kurzzeitig ausgelastet. Bitte versuchen Sie es erneut.',
    verifiedBy: 'Geprüft mit ailetter.pro',
    scoreLabel: 'ATS-Score',
    keywordsLabel: 'Keywords',
    metricsLabel: 'Kennzahlen',
    structureLabel: 'Struktur',
    copyShare: 'Ergebnis kopieren',
    copiedShare: 'Kopiert!',
    downloadPng: 'PNG-Karte speichern',
    firstImpression: '6-Sekunden-Eindruck des Recruiters',
    critiquesTitle: 'Kritische Schwachstellen im Lebenslauf',
    quickWinsTitle: 'Schnelle Verbesserungen',
    matchedTitle: 'Gefundene Hard Skills',
    missingTitle: 'Fehlende wichtige Keywords',
    tipsTitle: 'Konkrete Checkliste',
    previewTitle: 'KI-Vorschau für optimierten Lebenslauf-Punkt',
    originalLabel: 'Original',
    optimizedLabel: 'ATS-Optimiert',
    lockedTitle: 'Vollständige Lebenslauf-Optimierung & Anschreiben freischalten',
    lockedDesc: 'Fügen Sie fehlende Keywords automatisch ein und exportieren Sie druckfertige A4-PDFs.',
    lockedBtn: 'Lebenslauf verbessern & Anschreiben erstellen (Kostenlos) →',
    guideTitle: 'So bewertet unser kostenloser ATS-Checker Ihren Lebenslauf',
    guideP: 'Viele Bewerbungen scheitern an fehlenden Fachbegriffen oder unklaren Tätigkeitsbeschreibungen ohne messbare Erfolge. Unser Scanner prüft Keyword-Übereinstimmung, Zahlen und Struktur.',
    faqs: [
      { q: 'Ist der ATS-Lebenslauf-Check ohne Anmeldung kostenlos?', a: 'Ja. Sie können PDFs oder Text kostenlos und ohne Registrierung prüfen.' },
      { q: 'Erfindet die KI falsche Zahlen für meinen Lebenslauf?', a: 'Nein. Fehlende Kennzahlen werden mit [X%] als Platzhalter markiert, damit Ihre Angaben ehrlich bleiben.' },
      { q: 'Kann ich meine Score-Card als Bild speichern?', a: 'Ja, die Ergebnis-Karte lässt sich direkt als PNG herunterladen.' },
    ],
  },
  it: {
    badge: 'Gratis · Senza Registrazione',
    h1: 'Verifica CV ATS Gratuita & Recruiter Roast',
    lead: 'Carica il tuo CV in PDF o incolla il testo per ottenere subito il punteggio ATS (0–100), le parole chiave mancanti o un giudizio diretto da recruiter in 6 secondi.',
    modeAts: '📊 Audit ATS Standard',
    modeRoast: '🔥 Roast Recruiter (6 Secondi)',
    modeAtsHint: 'Richiede CV + Offerta di lavoro per calcolare il match delle parole chiave.',
    modeRoastHint: 'Offerta opzionale — ottieni critiche schiette da recruiter e la scheda condivisibile.',
    uploadPdf: 'Carica CV in PDF (max 5 MB)',
    orPasteCv: 'Oppure incolla qui il testo del tuo CV...',
    jdLabel: 'Descrizione dell’Offerta di Lavoro',
    jdOptional: '(Opzionale in modalità Roast)',
    jdPlaceholder: 'Incolla l’annuncio di lavoro per calcolare il punteggio ATS...',
    runAtsBtn: 'Avvia Scansione ATS Gratuita — Senza Account',
    runRoastBtn: 'Analizza il CV in 6 Secondi — Gratis',
    scanning: 'Analisi del curriculum in corso...',
    errNeedCv: 'Carica un PDF oppure incolla il testo del tuo CV.',
    errNeedJd: 'Incolla un annuncio di lavoro per l’Audit ATS Standard (o usa la modalità Roast).',
    errPdfTooBig: 'Il file PDF deve pesare meno di 5 MB.',
    errGeneric: 'Scanner AI momentaneamente occupato. Riprova tra qualche secondo.',
    verifiedBy: 'Verificato su ailetter.pro',
    scoreLabel: 'Punteggio ATS',
    keywordsLabel: 'Parole chiave',
    metricsLabel: 'Metriche',
    structureLabel: 'Struttura',
    copyShare: 'Copia Riepilogo',
    copiedShare: 'Copiato!',
    downloadPng: 'Scarica Scheda PNG',
    firstImpression: 'Impressione Recruiter in 6 Secondi',
    critiquesTitle: 'Punti critici da correggere subito',
    quickWinsTitle: 'Miglioramenti rapidi',
    matchedTitle: 'Competenze trovate',
    missingTitle: 'Parole chiave mancanti',
    tipsTitle: 'Checklist operativa',
    previewTitle: 'Anteprima Punto Elenco Ottimizzato con IA',
    originalLabel: 'Originale',
    optimizedLabel: 'Versione ATS',
    lockedTitle: 'Sblocca l’ottimizzazione completa del CV e la lettera',
    lockedDesc: 'Integra automaticamente le parole chiave mancanti ed esporta CV e lettere in PDF A4.',
    lockedBtn: 'Migliora il CV e Crea la Lettera (Gratis) →',
    guideTitle: 'Come il nostro Checker ATS valuta il tuo Curriculum',
    guideP: 'Oltre il 70% dei CV viene filtrato per mancanza di parole chiave specifiche o risultati privi di metriche. Il nostro strumento combina scansione ATS e lettura critica da recruiter.',
    faqs: [
      { q: 'La verifica CV ATS è gratuita senza registrazione?', a: 'Sì, puoi analizzare il tuo PDF o testo gratuitamente senza creare alcun account.' },
      { q: 'L’IA inventa numeri falsi nel mio CV?', a: 'Mai: dove mancano dati reali vengono mostrati segnaposto [X%] per farti inserire solo cifre vere.' },
      { q: 'Posso scaricare la scheda del punteggio ATS?', a: 'Sì, puoi copiarla come testo o scaricarla come immagine PNG in un clic.' },
    ],
  },
};

export default function ATSCheckerPage() {
  const { uiLang, setUiLang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = COPY[uiLang] || COPY.en;
  const langPrefix = uiLang && uiLang !== 'en' ? `/${uiLang}` : '';

  const [mode, setMode] = useState('ats');
  const [cvFile, setCvFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [clippedSource, setClippedSource] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlJd = params.get('jd');
      const urlMode = params.get('mode');
      const urlSrc = params.get('src');
      if (urlMode === 'roast' || urlMode === 'ats') {
        setMode(urlMode);
      }
      if (urlJd && urlJd.trim()) {
        setJobDescription(urlJd.trim().slice(0, 6000));
        if (urlSrc) setClippedSource(urlSrc.trim().slice(0, 80));
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // Ignore malformed query strings
    }
  }, []);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const scoreCardRef = useRef(null);
  const fileInputRef = useRef(null);

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t.errPdfTooBig);
      return;
    }
    setError('');
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = String(reader.result || '').split(',')[1];
      if (base64) {
        setCvFile({ inlineData: { data: base64, mimeType: file.type || 'application/pdf' } });
      }
    };
    reader.readAsDataURL(file);
  };

  const clearPdf = () => {
    setCvFile(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    setError('');
    if (!cvFile && cvText.trim().length < 30) {
      setError(t.errNeedCv);
      return;
    }
    if (mode === 'ats' && jobDescription.trim().length < 20) {
      setError(t.errNeedJd);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await analyzePublicCV({
        cvText,
        cvFilePart: cvFile,
        jobDescription,
        mode,
        outputLanguage: UI_TO_PROMPT_LANG[uiLang] || 'English',
      });
      setResult({ ...data, scanMode: mode });
    } catch (err) {
      console.error('Public ATS scan error:', err);
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShare = () => {
    if (!result) return;
    const summaryLines = [
      `AI-Letter ATS Resume Scan: ${result.atsScore}/100${result.verdictBadge ? ` (${result.verdictBadge})` : ''}`,
      `Keywords: ${result.atsBreakdown?.keywords ?? 0}% | Metrics: ${result.atsBreakdown?.metrics ?? 0}% | Structure: ${result.atsBreakdown?.structure ?? 0}%`,
      result.recruiterFirstImpression ? `Recruiter Note: ${result.recruiterFirstImpression}` : '',
      `Scan your CV free (no sign-up): https://ailetter.pro${langPrefix}/ats-resume-checker`,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(summaryLines);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleDownloadPng = async () => {
    if (!scoreCardRef.current) return;
    setDownloadingPng(true);
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const canvas = await html2canvas(scoreCardRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `ailetter-ats-score-${result?.atsScore || 'scan'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Score card PNG export failed:', err);
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleContinueInApp = () => {
    const rawCvText = cvText.trim();
    const prof = result?.parsedProfile?.profession || '';
    localStorage.setItem(
      'preloaded_template',
      JSON.stringify({
        profession: prof,
        jobDescription: jobDescription.trim(),
        cvText: rawCvText,
      })
    );
    if (jobDescription.trim()) {
      localStorage.setItem('clipped_jd', jobDescription.trim().slice(0, 6000));
    }
    window.scrollTo(0, 0);
    navigate(user ? '/dashboard' : '/login');
  };

  const scoreColor = useMemo(() => {
    const s = result?.atsScore ?? 0;
    if (s >= 75) return '#34d399';
    if (s >= 50) return '#fbbf24';
    return '#fb7185';
  }, [result?.atsScore]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center px-4 py-8 font-sans select-text">
      {/* Top Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-10 pb-4 border-b border-white/[0.06]">
        <Link to={langPrefix || '/'} className="flex items-center gap-2 font-black tracking-tighter text-base text-white">
          <img src="/android-chrome-192x192.png" alt="AI-Letter" className="w-7 h-7 rounded-lg" />
          AI-Letter
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher
            value={uiLang}
            onChange={(newLang) => {
              setUiLang(newLang);
              navigate(`${newLang === 'en' ? '' : `/${newLang}`}/ats-resume-checker`);
            }}
          />
          <Link
            to={user ? '/dashboard' : '/login'}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-colors"
          >
            {user ? 'Dashboard' : 'Login'}
          </Link>
        </div>
      </header>

      {/* Hero Title */}
      <div className="max-w-2xl mb-8 text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
          <Sparkles size={12} />
          {t.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t.h1}
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          {t.lead}
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="w-full max-w-2xl mb-5">
        <div className="grid grid-cols-2 gap-2 bg-[#1e293b]/70 p-1.5 rounded-2xl border border-[#334155]/60">
          <button
            type="button"
            onClick={() => setMode('ats')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'ats'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            {t.modeAts}
          </button>
          <button
            type="button"
            onClick={() => setMode('roast')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'roast'
                ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame size={14} />
            {t.modeRoast}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-2">
          {mode === 'ats' ? t.modeAtsHint : t.modeRoastHint}
        </p>
      </div>

      {/* Input Card */}
      <div className="w-full max-w-2xl bg-[#1e293b]/60 border border-[#334155]/60 p-6 rounded-3xl space-y-4 shadow-2xl backdrop-blur-md">
        {/* PDF Upload Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold cursor-pointer transition-colors">
            <Upload size={15} />
            <span>{t.uploadPdf}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfUpload}
              className="hidden"
            />
          </label>
          {fileName && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <FileText size={13} />
              <span className="max-w-[200px] truncate">{fileName}</span>
              <button type="button" onClick={clearPdf} className="hover:text-white" aria-label="Remove PDF">
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Or Paste CV Text */}
        <textarea
          rows={5}
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          placeholder={t.orPasteCv}
          className="w-full bg-[#0f172a] border border-[#334155] rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />

        {/* Job Description */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center flex-wrap gap-2 mb-1.5">
            <span>{t.jdLabel}</span>
            {mode === 'roast' && <span className="text-[10px] text-slate-500 lowercase font-medium">{t.jdOptional}</span>}
            {clippedSource && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300 normal-case">
                ⚡ Loaded from {clippedSource}
              </span>
            )}
          </label>
          <textarea
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={t.jdPlaceholder}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className={`w-full py-3.5 px-6 rounded-xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
            mode === 'roast'
              ? 'bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 shadow-rose-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t.scanning}
            </>
          ) : (
            <>
              {mode === 'roast' ? <Flame size={16} /> : <BarChart3 size={16} />}
              {mode === 'roast' ? t.runRoastBtn : t.runAtsBtn}
            </>
          )}
        </button>

        {error && <p className="text-xs text-rose-400 text-center font-bold">{error}</p>}
      </div>

      {/* Results & Shareable Score Card */}
      {result && (
        <div className="w-full max-w-2xl mt-8 space-y-6">
          {/* Capture-Ready Shareable Score Card */}
          <div
            ref={scoreCardRef}
            style={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
            className="rounded-3xl border p-6 shadow-2xl space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  {result.scanMode === 'roast' ? '🔥 6s Recruiter Roast' : '📊 ATS Resume Audit'}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span style={{ color: scoreColor }} className="text-5xl font-black">
                    {result.atsScore}
                  </span>
                  <span className="text-slate-400 text-lg font-bold">/ 100</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{t.scoreLabel}</p>
              </div>

              {result.verdictBadge && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                  {result.verdictBadge}
                </span>
              )}
            </div>

            {/* 3 Breakdown Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: t.keywordsLabel, val: result.atsBreakdown?.keywords ?? 0, color: '#6366f1' },
                { label: t.metricsLabel, val: result.atsBreakdown?.metrics ?? 0, color: '#10b981' },
                { label: t.structureLabel, val: result.atsBreakdown?.structure ?? 0, color: '#a855f7' },
              ].map((bar) => (
                <div key={bar.label} style={{ backgroundColor: '#1e293b' }} className="p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-300">{bar.label}</span>
                    <span className="text-white">{bar.val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div style={{ width: `${bar.val}%`, backgroundColor: bar.color }} className="h-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            {result.recruiterFirstImpression && (
              <div style={{ backgroundColor: '#1e293b' }} className="p-4 rounded-2xl border border-orange-500/20">
                <p className="text-[10px] font-black uppercase tracking-wider text-orange-400 mb-1">
                  {t.firstImpression}
                </p>
                <p className="text-sm text-slate-200 leading-relaxed">{result.recruiterFirstImpression}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-slate-500 font-semibold">
              <span>AI-Letter · Career Suite</span>
              <span>{t.verifiedBy}</span>
            </div>
          </div>

          {/* Share / Download Card Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopyShare}
              className="flex-1 min-w-[160px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {copiedShare ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copiedShare ? t.copiedShare : t.copyShare}
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={downloadingPng}
              className="flex-1 min-w-[160px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {downloadingPng ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {t.downloadPng}
            </button>
          </div>

          {/* Roast Critiques + Quick Wins OR ATS Matched/Missing Keywords */}
          {result.scanMode === 'roast' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1e293b]/60 border border-rose-500/20 rounded-2xl p-5 space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  {t.critiquesTitle}
                </h2>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  {(result.roastCritiques || []).map((c, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#1e293b]/60 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  {t.quickWinsTitle}
                </h2>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  {(result.quickWins || []).map((w, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1e293b]/60 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400">{t.matchedTitle}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {(result.matchedKeywords || []).length > 0 ? (
                    result.matchedKeywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                        ✓ {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </div>
              </div>
              <div className="bg-[#1e293b]/60 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">{t.missingTitle}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {(result.missingKeywords || []).length > 0 ? (
                    result.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                        + {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actionable Tips */}
          {Array.isArray(result.tips) && result.tips.length > 0 && (
            <div className="bg-[#1e293b]/50 border border-[#334155]/60 rounded-2xl p-5 space-y-2.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-indigo-400">{t.tipsTitle}</h2>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-indigo-400">⚡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Teaser Bullet Rewrite + Conversion CTA */}
          <div className="bg-gradient-to-br from-indigo-600/15 to-purple-600/15 border border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            {Array.isArray(result.bulletPoints) && result.bulletPoints[0] && (
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-indigo-300">{t.previewTitle}</h2>
                <div className="bg-[#0f172a]/80 border border-white/5 rounded-xl p-3.5 space-y-2 text-xs">
                  <p className="text-slate-400">
                    <span className="font-bold text-rose-400 uppercase text-[10px] mr-1.5">{t.originalLabel}:</span>
                    {result.bulletPoints[0].original}
                  </p>
                  <p className="text-slate-100 font-medium">
                    <span className="font-bold text-emerald-400 uppercase text-[10px] mr-1.5">{t.optimizedLabel}:</span>
                    {result.bulletPoints[0].optimized}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <Lock size={14} className="text-indigo-400" />
                  {t.lockedTitle}
                </p>
                <p className="text-xs text-slate-300">{t.lockedDesc}</p>
              </div>
              <button
                type="button"
                onClick={handleContinueInApp}
                className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-all"
              >
                <span>{t.lockedBtn}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO Guide + Visible Q&A */}
      <div className="w-full max-w-2xl mt-16 border-t border-slate-800 pt-10 space-y-6">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">{t.guideTitle}</h2>
        <p className="text-slate-300 text-sm leading-relaxed">{t.guideP}</p>

        <div className="space-y-3 pt-2">
          {t.faqs.map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <h3 className="text-sm font-bold text-white">{item.q}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Navigation */}
      <nav aria-label="AI-Letter Tools & Resources" className="w-full max-w-2xl mt-10 pt-8 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex flex-wrap gap-2">
          <Link to={langPrefix || '/'} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-indigo-300 transition-colors">
            AI-Letter Home
          </Link>
          <Link to={`${langPrefix}/linkedin-message`} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors">
            LinkedIn Easy Apply
          </Link>
          <Link to={`${langPrefix}/subject-line`} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors">
            Email Subject Line
          </Link>
          <Link to={`${langPrefix}/cover-letter-ai-developer`} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors">
            AI Developer
          </Link>
          {SEO_ROLE_PAGES.map((p) => (
            <Link key={p.slug} to={`${langPrefix}${p.path}`} className="px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors">
              {(p.locales[uiLang] || p.locales.en).roleName}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
