import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import HeroMockup from '../components/landing/HeroMockup';

const styles = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-scroll { animation: scroll 20s linear infinite; }
  .bg-grid {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  }
  .glass {
    background: rgba(30,41,59,0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.05);
  }
  .text-glow { text-shadow: 0 0 20px rgba(99,102,241,0.5); }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.6s ease forwards; }
  .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
  .fade-up-2 { animation-delay: 0.2s; opacity: 0; }
  .fade-up-3 { animation-delay: 0.35s; opacity: 0; }
  .fade-up-4 { animation-delay: 0.5s; opacity: 0; }
  .star { color: #f59e0b; }
`;

const IconCheck  = () => <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>;
const IconX      = () => <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>;
const IconRocket = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>;
const IconMenu   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconClose  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevron = ({ open }) => <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>;
const IconQuote  = () => <svg className="w-6 h-6 text-indigo-400/40" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>;

const Stars = ({ n = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: n }).map((_, i) => (
      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
);

const REVIEWS = [
  { name: 'Olena M.', role: 'UX Designer → Google', text: 'Got 3 interview calls within a week. The letters felt genuinely personalized, not templated.', stars: 5, avatar: 'O' },
  { name: 'Marco B.', role: 'Product Manager → Spotify', text: 'I was spending 2 hours per application. Now it\'s literally 30 seconds and the quality is better.', stars: 5, avatar: 'M' },
  { name: 'Anna K.', role: 'Data Analyst → Amazon', text: 'The Ukrainian language support is flawless. Finally an AI tool that actually works for us.', stars: 5, avatar: 'A' },
  { name: 'Dmitri V.', role: 'Software Engineer → Netflix', text: 'Used it for 12 applications. Got 4 interviews. The ATS optimization really works.', stars: 5, avatar: 'D' },
  { name: 'Sofia R.', role: 'Marketing → Meta', text: 'The different tone options are a game-changer. Professional for corporate, friendly for startups.', stars: 5, avatar: 'S' },
  { name: 'Taras H.', role: 'Finance → Deutsche Bank', text: 'Switched from ChatGPT prompting to AIletter. Night and day difference in output quality.', stars: 5, avatar: 'T' },
];

const FAQS = {
  en: [
    { q: 'Is AIletter really free to start?', a: 'Yes — you get 5 free generations per month with no credit card required. Each generation produces a complete, ready-to-send cover letter.' },
    { q: 'How personalized are the letters?', a: 'Very. AIletter analyzes your CV and the specific job description to create unique letters. No two letters are the same, and they reference actual requirements from the job posting.' },
    { q: 'What languages are supported?', a: 'Currently English, Ukrainian, Italian, and German. The AI detects the job description language automatically or you can set it manually.' },
    { q: 'Will the letter pass ATS screening?', a: 'Yes. Letters are optimized with relevant keywords from the job description, which helps with Applicant Tracking Systems used by most companies.' },
    { q: 'Can I edit the generated letter?', a: 'Absolutely. Every generated letter is fully editable directly in the app. The preview updates in real time as you type.' },
    { q: 'What is the Pro plan?', a: 'Pro gives you unlimited generations, all 16 templates, DOCX export, no watermarks on PDFs, and priority AI processing. Plans start from €6/month.' },
  ],
  uk: [
    { q: 'Чи справді безкоштовно?', a: 'Так — 5 безкоштовних генерацій щомісяця без кредитної картки. Кожна генерація дає готовий лист.' },
    { q: 'Наскільки персоналізовані листи?', a: 'Дуже. AI аналізує ваше CV і конкретну вакансію, тому кожен лист унікальний і містить реальні вимоги з оголошення.' },
    { q: 'Які мови підтримуються?', a: 'English, Українська, Italiano та Deutsch. AI визначає мову автоматично або ви можете задати вручну.' },
    { q: 'Чи пройде лист через ATS?', a: 'Так. Листи оптимізовані під ключові слова з вакансії, що допомагає пройти ATS-фільтри.' },
    { q: 'Чи можна редагувати лист?', a: 'Так, кожен лист повністю редагується прямо в додатку. Прев\'ю оновлюється в реальному часі.' },
    { q: 'Що входить у Pro план?', a: 'Необмежені генерації, всі 16 шаблонів, DOCX експорт, без водяних знаків, пріоритетний AI. Від €6/місяць.' },
  ],
  it: [
    { q: 'È davvero gratuito per iniziare?', a: 'Sì — 5 generazioni gratis al mese, senza carta di credito. Ogni generazione produce una lettera completa e pronta all\'invio.' },
    { q: 'Quanto sono personalizzate le lettere?', a: 'Molto. AIletter analizza il tuo CV e la descrizione del lavoro specifica per creare lettere uniche.' },
    { q: 'Quali lingue sono supportate?', a: 'English, Українська, Italiano e Deutsch. L\'AI rileva automaticamente la lingua.' },
    { q: 'La lettera supererà il filtro ATS?', a: 'Sì. Le lettere sono ottimizzate con parole chiave dalla descrizione del lavoro.' },
    { q: 'Posso modificare la lettera generata?', a: 'Assolutamente. Ogni lettera è completamente modificabile direttamente nell\'app.' },
    { q: 'Cos\'è il piano Pro?', a: 'Generazioni illimitate, tutti i 16 template, export DOCX, nessuna filigrana. Da €6/mese.' },
  ],
  de: [
    { q: 'Ist AIletter wirklich kostenlos?', a: 'Ja — 5 kostenlose Generierungen pro Monat ohne Kreditkarte. Jede Generierung ergibt ein vollständiges Anschreiben.' },
    { q: 'Wie personalisiert sind die Briefe?', a: 'Sehr. AIletter analysiert deinen Lebenslauf und die spezifische Stellenbeschreibung.' },
    { q: 'Welche Sprachen werden unterstützt?', a: 'English, Українська, Italiano und Deutsch. Die KI erkennt die Sprache automatisch.' },
    { q: 'Besteht der Brief den ATS-Filter?', a: 'Ja. Briefe sind mit relevanten Keywords aus der Stellenbeschreibung optimiert.' },
    { q: 'Kann ich den generierten Brief bearbeiten?', a: 'Absolut. Jeder Brief ist direkt in der App vollständig bearbeitbar.' },
    { q: 'Was ist der Pro-Plan?', a: 'Unbegrenzte Generierungen, alle 16 Vorlagen, DOCX-Export, keine Wasserzeichen. Ab €6/Monat.' },
  ],
};

const TRANSLATIONS = {
  en: {
    heroTitle: "Get Hired 10x Faster with AI.",
    heroSubtitle: "Stop wasting hours on cover letters. Upload your CV, paste the job link, and get a tailored, persuasive letter in seconds.",
    ctaButton: "Generate For Free", ctaSubtext: "No credit card · 5 free generations",
    trust: "Trusted by candidates getting hired at",
    feature1: "ATS Optimized", feature2: "Perfect Grammar", feature3: "Unique Every Time",
    compareTitle: "Why AIletter?",
    oldWay: "The Old Way", newWay: "AIletter Way",
    old1: "2 hours per application", new1: "30 seconds per application",
    old2: "Generic templates", new2: "Hyper-personalized content",
    old3: "Stress & Writer's block", new3: "Confidence & Speed",
    stepsTitle: "How it works",
    step1: "Upload CV", step2: "Paste Job", step3: "Get Letter",
    reviewsTitle: "Loved by job seekers",
    reviewsSubtitle: "Real results from real users",
    faqTitle: "Frequently Asked Questions",
    footerDesc: "The future of job applications.",
    login: "Login", openApp: "Open App", welcomeBack: "Welcome back",
    terms: "Terms of Service", privacy: "Privacy Policy",
  },
  uk: {
    heroTitle: "Отримай офер у 10 разів швидше.",
    heroSubtitle: "Досить витрачати години на супровідні листи. Завантаж CV, встав вакансію та отримай переконливий лист за секунди.",
    ctaButton: "Створити безкоштовно", ctaSubtext: "Картка не потрібна · 5 безкоштовних спроб",
    trust: "Нашим користувачам довіряють в",
    feature1: "Проходить ATS", feature2: "Ідеальна граматика", feature3: "Унікальність 100%",
    compareTitle: "Чому AIletter?",
    oldWay: "Старий спосіб", newWay: "Спосіб AIletter",
    old1: "2 години на заявку", new1: "30 секунд на заявку",
    old2: "Шаблонні фрази", new2: "Персоналізований контент",
    old3: "Стрес та муки творчості", new3: "Впевненість та швидкість",
    stepsTitle: "Як це працює",
    step1: "Завантаж CV", step2: "Встав вакансію", step3: "Отримай лист",
    reviewsTitle: "Нас люблять шукачі роботи",
    reviewsSubtitle: "Реальні результати реальних користувачів",
    faqTitle: "Часті запитання",
    footerDesc: "Майбутнє пошуку роботи.",
    login: "Увійти", openApp: "Відкрити додаток", welcomeBack: "З поверненням",
    terms: "Умови використання", privacy: "Політика конфіденційності",
  },
  it: {
    heroTitle: "Assunto 10 volte più veloce con l'AI.",
    heroSubtitle: "Smetti di perdere ore sulle lettere. Carica il CV, incolla l'offerta e ottieni una lettera perfetta in secondi.",
    ctaButton: "Genera gratis", ctaSubtext: "Nessuna carta · 5 generazioni gratis",
    trust: "Candidati assunti da",
    feature1: "Ottimizzato ATS", feature2: "Grammatica perfetta", feature3: "Sempre unico",
    compareTitle: "Perché AIletter?",
    oldWay: "Il vecchio modo", newWay: "Il modo AIletter",
    old1: "2 ore per candidatura", new1: "30 secondi per candidatura",
    old2: "Template generici", new2: "Contenuto personalizzato",
    old3: "Stress e blocco creativo", new3: "Fiducia e velocità",
    stepsTitle: "Come funziona",
    step1: "Carica CV", step2: "Incolla offerta", step3: "Ottieni lettera",
    reviewsTitle: "Amato dai candidati",
    reviewsSubtitle: "Risultati reali da utenti reali",
    faqTitle: "Domande frequenti",
    footerDesc: "Il futuro delle candidature.",
    login: "Accedi", openApp: "Apri l'app", welcomeBack: "Bentornato",
    terms: "Termini di servizio", privacy: "Privacy Policy",
  },
  de: {
    heroTitle: "10x schneller eingestellt mit KI.",
    heroSubtitle: "Hör auf, Stunden für Anschreiben zu verschwenden. Lade deinen Lebenslauf hoch und erhalte ein perfektes Anschreiben in Sekunden.",
    ctaButton: "Kostenlos generieren", ctaSubtext: "Keine Kreditkarte · 5 kostenlose Generierungen",
    trust: "Vertrauen von Kandidaten bei",
    feature1: "ATS-optimiert", feature2: "Perfekte Grammatik", feature3: "Immer einzigartig",
    compareTitle: "Warum AIletter?",
    oldWay: "Der alte Weg", newWay: "Der AIletter-Weg",
    old1: "2 Stunden pro Bewerbung", new1: "30 Sekunden pro Bewerbung",
    old2: "Generische Vorlagen", new2: "Personalisierter Inhalt",
    old3: "Stress & Schreibblockade", new3: "Selbstvertrauen & Geschwindigkeit",
    stepsTitle: "So funktioniert es",
    step1: "Lebenslauf hochladen", step2: "Stelle einfügen", step3: "Brief erhalten",
    reviewsTitle: "Geliebt von Jobsuchenden",
    reviewsSubtitle: "Echte Ergebnisse von echten Nutzern",
    faqTitle: "Häufig gestellte Fragen",
    footerDesc: "Die Zukunft der Bewerbungen.",
    login: "Anmelden", openApp: "App öffnen", welcomeBack: "Willkommen zurück",
    terms: "Nutzungsbedingungen", privacy: "Datenschutz",
  },
};

// ── FAQ Item ──
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl transition-all ${open ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
        <span className="font-bold text-sm md:text-base text-white">{q}</span>
        <span className={`shrink-0 transition-colors ${open ? 'text-indigo-400' : 'text-gray-500'}`}>
          <IconChevron open={open} />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
          {a}
        </div>
      )}
    </div>
  );
};

const Landing = () => {
  const { uiLang, setUiLang } = useLanguage();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // SEO meta tags
    document.title = 'AIletter — AI Cover Letter Generator | Get Hired 10x Faster';

    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setMeta('description', 'Generate personalized, ATS-optimized cover letters in 30 seconds. Upload your CV, paste the job description, and get a tailored letter. Free to start.');
    setMeta('keywords', 'cover letter generator, AI cover letter, job application, ATS optimized, resume, CV, супровідний лист, lettera di presentazione');
    setMeta('robots', 'index, follow');
    setMeta('og:title', 'AIletter — AI Cover Letter Generator', true);
    setMeta('og:description', 'Get personalized cover letters in 30 seconds. Free to start, no credit card needed.', true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', 'https://ailetter.app', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', 'AIletter — AI Cover Letter Generator');
    setMeta('twitter:description', 'Generate ATS-optimized cover letters in 30 seconds. Free to start.');

    // Structured data
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AIletter',
      applicationCategory: 'BusinessApplication',
      description: 'AI-powered cover letter generator that creates personalized, ATS-optimized cover letters in seconds.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '312' },
    };
    let sd = document.querySelector('#ailetter-schema');
    if (!sd) { sd = document.createElement('script'); sd.id = 'ailetter-schema'; sd.type = 'application/ld+json'; document.head.appendChild(sd); }
    sd.textContent = JSON.stringify(schema);

    // Styles
    const el = document.createElement('style');
    el.innerText = styles;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  const t = (key) => TRANSLATIONS[uiLang]?.[key] || TRANSLATIONS.en[key] || key;
  const faqs = FAQS[uiLang] || FAQS.en;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[400px] md:h-[500px] bg-indigo-600/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none z-0" />

      {/* ─── HEADER ─── */}
      <header className="fixed w-full top-0 z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg md:text-xl font-black tracking-tighter">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white text-[9px] md:text-[10px] shadow-lg">AI</span>
            AILETTER
          </div>
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher
  value={uiLang}
  onChange={setUiLang}
/>
            {user ? (
              <Link to="/dashboard" className="flex items-center gap-2 px-5 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">{user.displayName?.[0]?.toUpperCase() || 'U'}</div>
                {t('openApp')}
              </Link>
            ) : (
              <Link to="/login" className="px-5 py-2 bg-white text-[#0f172a] rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">{t('login')}</Link>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen(o => !o)} className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            {mobileMenuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1e293b] border-t border-white/5 px-4 py-4 space-y-3">
            <div className="flex gap-2">
              {['en', 'uk', 'it', 'de'].map(lang => (
                <button key={lang} onClick={() => { setUiLang(lang); setMobileMenuOpen(false); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${uiLang === lang ? 'bg-[#6366f1] text-white' : 'text-gray-400 bg-white/5'}`}>
                  {lang === 'uk' ? 'UA' : lang.toUpperCase()}
                </button>
              ))}
            </div>
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-[#6366f1] rounded-xl text-sm font-black uppercase tracking-widest">{t('openApp')}</Link>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3 bg-white text-[#0f172a] rounded-xl text-sm font-black uppercase tracking-widest">{t('login')}</Link>
            )}
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="fade-up fade-up-1 inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-6 md:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_#818cf8]" />
            V2.5 Now Live
          </div>
          <h1 className="fade-up fade-up-2 text-4xl sm:text-5xl md:text-7xl font-black mb-5 md:mb-6 leading-tight tracking-tight px-2">
            {t('heroTitle').split(' ').map((word, i) => (
              i === 1 || i === 2
                ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-glow">{word} </span>
                : word + ' '
            ))}
          </h1>
          <p className="fade-up fade-up-3 text-base md:text-xl text-gray-400 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">{t('heroSubtitle')}</p>
          <div className="fade-up fade-up-4 flex flex-col items-center gap-3">
            <Link to={user ? '/dashboard' : '/login'}
              className="group relative inline-flex items-center justify-center gap-2 px-7 md:px-8 py-4 font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] text-base">
              {user ? t('openApp') : t('ctaButton')}
              <IconRocket />
              <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
            </Link>
            <p className="text-xs text-gray-500">{t('ctaSubtext')}</p>
          </div>
          {user && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {t('welcomeBack')}, {user.displayName?.split(' ')[0] || 'User'} 👋
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-10 md:mt-12">
            {[t('feature1'), t('feature2'), t('feature3')].map((feat, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-white/5 rounded-full border border-white/5 text-xs md:text-sm font-semibold text-gray-400">
                <IconCheck /> {feat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LOGO SCROLL ─── */}
      <section className="py-8 md:py-10 border-y border-white/5 bg-[#0f172a]/50 relative overflow-hidden z-10">
        <p className="text-center text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 md:mb-8">{t('trust')}</p>
        <div className="relative w-full overflow-hidden">
          <div className="flex w-[200%] animate-scroll">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex justify-around w-full opacity-30 grayscale">
                {['Google', 'Netflix', 'Spotify', 'Amazon', 'Meta', 'Apple', 'Tesla'].map(logo => (
                  <span key={logo} className="text-base md:text-xl font-black text-white px-4 md:px-8">{logo}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-12 md:w-20 bg-gradient-to-r from-[#0f172a] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-12 md:w-20 bg-gradient-to-l from-[#0f172a] to-transparent" />
        </div>
      </section>

      {/* ─── APP MOCKUP ─── */}
<section className="py-16 md:py-24 px-4 md:px-6 z-10 relative">
  <div className="max-w-5xl mx-auto">
    <div className="relative rounded-2xl md:rounded-3xl p-[2px] shadow-2xl" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7,#ec4899)' }}>
      <div className="absolute -inset-2 rounded-3xl blur-xl opacity-25 pointer-events-none" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7,#ec4899)' }} />
      <div className="relative rounded-2xl overflow-hidden">
        <HeroMockup />
      </div>
    </div>
  </div>
</section>

      {/* ─── COMPARISON ─── */}
      <section className="py-16 md:py-24 px-4 md:px-6 relative z-10 bg-[#1e293b]/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-center mb-10 md:mb-16">{t('compareTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl border border-red-500/10 bg-red-500/5">
              <h3 className="text-base md:text-xl font-bold text-red-400 mb-6 md:mb-8 flex items-center gap-2"><IconX /> {t('oldWay')}</h3>
              <ul className="space-y-3 md:space-y-4">
                {[t('old1'), t('old2'), t('old3')].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm md:text-base text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/50 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl border border-indigo-500/30 bg-indigo-500/10">
              <h3 className="text-base md:text-xl font-bold text-indigo-400 mb-6 md:mb-8 flex items-center gap-2"><IconCheck /> {t('newWay')}</h3>
              <ul className="space-y-3 md:space-y-4">
                {[t('new1'), t('new2'), t('new3')].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm md:text-base text-white font-medium">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] shrink-0">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto z-10 relative">
        <h2 className="text-center text-2xl sm:text-3xl md:text-5xl font-black mb-10 md:mb-20">{t('stepsTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
          {[
            { num: '01', title: t('step1'), color: 'from-blue-400 to-indigo-500' },
            { num: '02', title: t('step2'), color: 'from-indigo-500 to-purple-500' },
            { num: '03', title: t('step3'), color: 'from-purple-500 to-pink-500' },
          ].map((step, i) => (
            <div key={i} className="glass p-6 md:p-8 rounded-2xl md:rounded-[2rem] flex sm:block items-center gap-4">
              <span className={`text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br ${step.color} opacity-80 shrink-0`}>{step.num}</span>
              <div>
                <h3 className="text-lg md:text-2xl font-bold sm:mt-4">{step.title}</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-gray-700 to-transparent rounded-full mt-2 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-[#1e293b]/20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3">{t('reviewsTitle')}</h2>
            <p className="text-gray-400 text-sm md:text-base">{t('reviewsSubtitle')}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Stars />
              <span className="font-black text-white">4.9</span>
              <span className="text-gray-500 text-sm">/ 5.0 · 312 reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {REVIEWS.map((r, i) => (
              <div key={i} className="glass p-5 md:p-6 rounded-2xl flex flex-col gap-4 hover:border-indigo-500/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-sm shrink-0">
                      {r.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{r.name}</p>
                      <p className="text-[10px] text-indigo-400 font-medium">{r.role}</p>
                    </div>
                  </div>
                  <IconQuote />
                </div>
                <Stars n={r.stars} />
                <p className="text-gray-400 text-sm leading-relaxed flex-1">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-16 md:py-24 px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-center mb-10 md:mb-14">{t('faqTitle')}</h2>
          <div className="space-y-3">
            {faqs.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-16 md:py-24 px-4 md:px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass rounded-3xl p-8 md:p-12 border border-indigo-500/20">
            <h2 className="text-2xl md:text-4xl font-black mb-4">Ready to land your dream job?</h2>
            <p className="text-gray-400 mb-8 text-sm md:text-base">Join thousands of candidates already using AIletter.</p>
            <Link to={user ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 px-8 py-4 font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] text-base">
              {user ? t('openApp') : t('ctaButton')} <IconRocket />
            </Link>
            <p className="text-xs text-gray-500 mt-4">{t('ctaSubtext')}</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 bg-[#0f172a] pt-12 md:pt-16 pb-8 px-4 md:px-6 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left mb-8">
            <div>
              <div className="text-xl md:text-2xl font-black tracking-tighter mb-2 flex items-center justify-center md:justify-start gap-2">
                <span className="bg-gray-800 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white text-[9px] md:text-[10px]">AI</span>
                AILETTER
              </div>
              <p className="text-gray-500 text-sm">{t('footerDesc')}</p>
            </div>
            <div className="flex gap-6 md:gap-8 text-sm text-gray-400 font-medium">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Email</a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 font-mono">
            <span>© 2025 AIletter. All rights reserved.</span>
            <div className="flex gap-6">
              <Link to="/terms" className="hover:text-gray-400 transition-colors">{t('terms')}</Link>
              <Link to="/privacy" className="hover:text-gray-400 transition-colors">{t('privacy')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;