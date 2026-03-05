// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import HeroMockup from '../components/landing/HeroMockup';

const styles = `
  @keyframes landingScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .landing-scroll { animation: landingScroll 22s linear infinite; }
  .bg-grid {
    background-size: 40px 40px;
    background-image:
      linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
  }
  .glass {
    background: rgba(30,41,59,0.5);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .text-glow { text-shadow: 0 0 30px rgba(99,102,241,0.4); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  .fu { animation: fadeUp 0.55s ease forwards; opacity: 0; }
  .fu1 { animation-delay: 0.05s; }
  .fu2 { animation-delay: 0.15s; }
  .fu3 { animation-delay: 0.28s; }
  .fu4 { animation-delay: 0.42s; }
  .fu5 { animation-delay: 0.55s; }
`;

const IconCheck   = () => <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>;
const IconX       = () => <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>;
const IconRocket  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>;
const IconMenu    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconClose   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevron = ({ open }) => <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>;
const IconQuote   = () => <svg className="w-5 h-5 text-indigo-400/30" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>;

const Stars = ({ n = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: n }).map((_, i) => (
      <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
);

const REVIEWS = [
  { name: 'Olena M.', role: 'UX Designer → Google', text: 'Got 3 interview calls within a week. The letters felt genuinely personalized, not templated.', stars: 5, avatar: 'O', color: 'from-indigo-500 to-purple-600' },
  { name: 'Marco B.', role: 'Product Manager → Spotify', text: "I was spending 2 hours per application. Now it's literally 30 seconds and the quality is better.", stars: 5, avatar: 'M', color: 'from-green-500 to-teal-600' },
  { name: 'Anna K.', role: 'Data Analyst → Amazon', text: 'The Ukrainian language support is flawless. Finally an AI tool that actually works for us.', stars: 5, avatar: 'A', color: 'from-orange-500 to-red-600' },
  { name: 'Dmitri V.', role: 'Software Engineer → Netflix', text: 'Used it for 12 applications. Got 4 interviews. The ATS optimization really works.', stars: 5, avatar: 'D', color: 'from-blue-500 to-indigo-600' },
  { name: 'Sofia R.', role: 'Marketing → Meta', text: 'The different tone options are a game-changer. Professional for corporate, friendly for startups.', stars: 5, avatar: 'S', color: 'from-pink-500 to-rose-600' },
  { name: 'Taras H.', role: 'Finance → Deutsche Bank', text: 'Switched from ChatGPT prompting to AIletter. Night and day difference in output quality.', stars: 5, avatar: 'T', color: 'from-purple-500 to-violet-600' },
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
    { q: 'Наскільки персоналізовані листи?', a: "Дуже. AI аналізує ваше CV і конкретну вакансію, тому кожен лист унікальний і містить реальні вимоги з оголошення." },
    { q: 'Які мови підтримуються?', a: 'English, Українська, Italiano та Deutsch. AI визначає мову автоматично або ви можете задати вручну.' },
    { q: 'Чи пройде лист через ATS?', a: 'Так. Листи оптимізовані під ключові слова з вакансії, що допомагає пройти ATS-фільтри.' },
    { q: 'Чи можна редагувати лист?', a: "Так, кожен лист повністю редагується прямо в додатку. Прев'ю оновлюється в реальному часі." },
    { q: 'Що входить у Pro план?', a: 'Необмежені генерації, всі 16 шаблонів, DOCX експорт, без водяних знаків, пріоритетний AI. Від €6/місяць.' },
  ],
  it: [
    { q: 'È davvero gratuito per iniziare?', a: "Sì — 5 generazioni gratis al mese, senza carta di credito. Ogni generazione produce una lettera completa e pronta all'invio." },
    { q: 'Quanto sono personalizzate le lettere?', a: 'Molto. AIletter analizza il tuo CV e la descrizione del lavoro specifica per creare lettere uniche.' },
    { q: 'Quali lingue sono supportate?', a: "English, Українська, Italiano e Deutsch. L'AI rileva automaticamente la lingua." },
    { q: 'La lettera supererà il filtro ATS?', a: 'Sì. Le lettere sono ottimizzate con parole chiave dalla descrizione del lavoro.' },
    { q: 'Posso modificare la lettera generata?', a: "Assolutamente. Ogni lettera è completamente modificabile direttamente nell'app." },
    { q: "Cos'è il piano Pro?", a: 'Generazioni illimitate, tutti i 16 template, export DOCX, nessuna filigrana. Da €6/mese.' },
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
    badge: "V2.5 Now Live",
    heroTitle1: "Get Hired",
    heroTitle2: "10x Faster",
    heroTitle3: "with AI",
    heroSubtitle: "Upload your CV, paste the job description, and get a tailored, ATS-optimized cover letter in 30 seconds.",
    ctaButton: "Generate For Free",
    ctaSubtext: "No credit card · 5 free generations",
    trust: "Trusted by candidates hired at",
    feature1: "ATS Optimized", feature2: "30 Seconds", feature3: "4 Languages",
    compareTitle: "Why switch to AIletter?",
    oldWay: "The Old Way", newWay: "With AIletter",
    old1: "2+ hours per application", new1: "30 seconds per application",
    old2: "Generic copy-paste templates", new2: "Hyper-personalized content",
    old3: "Stress & writer's block", new3: "Confidence & speed",
    stepsTitle: "How it works",
    step1T: "Upload CV", step1D: "Drop your PDF — we extract all relevant info automatically.",
    step2T: "Paste Job", step2D: "Add the job description or paste a link to the posting.",
    step3T: "Get Letter", step3D: "AI generates a tailored letter. Edit, export, and apply.",
    reviewsTitle: "Real results from real users",
    faqTitle: "Common questions",
    footerDesc: "The future of job applications.",
    login: "Login", openApp: "Open App", welcomeBack: "Welcome back",
    terms: "Terms of Service", privacy: "Privacy Policy",
  },
  uk: {
    badge: "V2.5 Вже доступно",
    heroTitle1: "Отримай офер",
    heroTitle2: "у 10 разів",
    heroTitle3: "швидше",
    heroSubtitle: "Завантаж CV, встав вакансію та отримай персоналізований супровідний лист за 30 секунд.",
    ctaButton: "Створити безкоштовно",
    ctaSubtext: "Картка не потрібна · 5 безкоштовних спроб",
    trust: "Нашим користувачам довіряють в",
    feature1: "Проходить ATS", feature2: "30 Секунд", feature3: "4 Мови",
    compareTitle: "Чому AIletter?",
    oldWay: "Старий спосіб", newWay: "З AIletter",
    old1: "2+ години на заявку", new1: "30 секунд на заявку",
    old2: "Шаблонні фрази", new2: "Персоналізований контент",
    old3: "Стрес та муки творчості", new3: "Впевненість та швидкість",
    stepsTitle: "Як це працює",
    step1T: "Завантаж CV", step1D: "Додай PDF — ми автоматично витягуємо всю інформацію.",
    step2T: "Встав вакансію", step2D: "Додай опис вакансії або вставте посилання на неї.",
    step3T: "Отримай лист", step3D: "AI генерує персоналізований лист. Редагуй і відправляй.",
    reviewsTitle: "Реальні результати реальних користувачів",
    faqTitle: "Часті запитання",
    footerDesc: "Майбутнє пошуку роботи.",
    login: "Увійти", openApp: "Відкрити додаток", welcomeBack: "З поверненням",
    terms: "Умови використання", privacy: "Політика конфіденційності",
  },
  it: {
    badge: "V2.5 Ora disponibile",
    heroTitle1: "Assunto",
    heroTitle2: "10 volte",
    heroTitle3: "più veloce",
    heroSubtitle: "Carica il CV, incolla l'offerta di lavoro e ottieni una lettera personalizzata in 30 secondi.",
    ctaButton: "Genera gratis",
    ctaSubtext: "Nessuna carta · 5 generazioni gratis",
    trust: "Candidati assunti da",
    feature1: "Ottimizzato ATS", feature2: "30 Secondi", feature3: "4 Lingue",
    compareTitle: "Perché AIletter?",
    oldWay: "Il vecchio modo", newWay: "Con AIletter",
    old1: "2+ ore per candidatura", new1: "30 secondi per candidatura",
    old2: "Template generici", new2: "Contenuto personalizzato",
    old3: "Stress e blocco creativo", new3: "Fiducia e velocità",
    stepsTitle: "Come funziona",
    step1T: "Carica CV", step1D: "Carica il tuo PDF — estraiamo automaticamente le info.",
    step2T: "Incolla offerta", step2D: "Aggiungi la descrizione del lavoro o incolla un link.",
    step3T: "Ottieni lettera", step3D: "L'AI genera una lettera su misura. Modifica ed invia.",
    reviewsTitle: "Risultati reali da utenti reali",
    faqTitle: "Domande frequenti",
    footerDesc: "Il futuro delle candidature.",
    login: "Accedi", openApp: "Apri l'app", welcomeBack: "Bentornato",
    terms: "Termini di servizio", privacy: "Privacy Policy",
  },
  de: {
    badge: "V2.5 Jetzt verfügbar",
    heroTitle1: "Eingestellt",
    heroTitle2: "10x schneller",
    heroTitle3: "mit KI",
    heroSubtitle: "Lebenslauf hochladen, Stellenbeschreibung einfügen und in 30 Sekunden ein maßgeschneidertes Anschreiben erhalten.",
    ctaButton: "Kostenlos generieren",
    ctaSubtext: "Keine Kreditkarte · 5 kostenlose Generierungen",
    trust: "Vertrauen von Kandidaten bei",
    feature1: "ATS-optimiert", feature2: "30 Sekunden", feature3: "4 Sprachen",
    compareTitle: "Warum AIletter?",
    oldWay: "Der alte Weg", newWay: "Mit AIletter",
    old1: "2+ Stunden pro Bewerbung", new1: "30 Sekunden pro Bewerbung",
    old2: "Generische Vorlagen", new2: "Personalisierter Inhalt",
    old3: "Stress & Schreibblockade", new3: "Selbstvertrauen & Geschwindigkeit",
    stepsTitle: "So funktioniert es",
    step1T: "Lebenslauf hochladen", step1D: "PDF hochladen — wir extrahieren alle relevanten Infos.",
    step2T: "Stelle einfügen", step2D: "Stellenbeschreibung oder Link zur Ausschreibung einfügen.",
    step3T: "Brief erhalten", step3D: "KI erstellt ein maßgeschneidertes Anschreiben. Bearbeiten & senden.",
    reviewsTitle: "Echte Ergebnisse von echten Nutzern",
    faqTitle: "Häufige Fragen",
    footerDesc: "Die Zukunft der Bewerbungen.",
    login: "Anmelden", openApp: "App öffnen", welcomeBack: "Willkommen zurück",
    terms: "Nutzungsbedingungen", privacy: "Datenschutz",
  },
};

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl transition-all duration-200 ${open ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.015]'}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-semibold text-sm text-white">{q}</span>
        <span className={`shrink-0 ${open ? 'text-indigo-400' : 'text-gray-600'}`}><IconChevron open={open} /></span>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">{a}</div>}
    </div>
  );
};

const Landing = () => {
  const { uiLang, setUiLang } = useLanguage();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
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
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', 'AIletter — AI Cover Letter Generator');
    const schema = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'AIletter', applicationCategory: 'BusinessApplication', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '312' } };
    let sd = document.querySelector('#ailetter-schema');
    if (!sd) { sd = document.createElement('script'); sd.id = 'ailetter-schema'; sd.type = 'application/ld+json'; document.head.appendChild(sd); }
    sd.textContent = JSON.stringify(schema);
    const el = document.createElement('style'); el.innerText = styles; document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch(e) {} };
  }, []);

  const t = k => TRANSLATIONS[uiLang]?.[k] || TRANSLATIONS.en[k] || k;
  const faqs = FAQS[uiLang] || FAQS.en;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden">
      <div className="fixed inset-0 bg-grid opacity-[0.15] pointer-events-none z-0" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/4 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* ─── HEADER ─── */}
      <header className="fixed w-full top-0 z-50 border-b border-white/[0.06] bg-[#0f172a]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black tracking-tighter text-base">
            <span className="bg-gradient-to-br from-indigo-500 to-purple-600 w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] shadow-lg shadow-indigo-500/30">AI</span>
            AILETTER
          </div>
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher value={uiLang} onChange={setUiLang} />
            {user ? (
              <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">{user.displayName?.[0]?.toUpperCase() || 'U'}</div>
                {t('openApp')}
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-white text-[#0f172a] rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">{t('login')}</Link>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen(o => !o)} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            {mobileMenuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#1e293b]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-4 space-y-3">
            <div className="flex gap-2">
              {['en', 'uk', 'it', 'de'].map(lang => (
                <button key={lang} onClick={() => { setUiLang(lang); setMobileMenuOpen(false); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${uiLang === lang ? 'bg-indigo-600 text-white' : 'text-gray-400 bg-white/5 hover:bg-white/10'}`}>
                  {lang === 'uk' ? 'UA' : lang.toUpperCase()}
                </button>
              ))}
            </div>
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 rounded-xl text-sm font-black uppercase tracking-widest">{t('openApp')}</Link>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3 bg-white text-[#0f172a] rounded-xl text-sm font-black uppercase tracking-widest">{t('login')}</Link>
            )}
          </div>
        )}
      </header>

      {/* ─── HERO + MOCKUP ─── */}
      <section className="relative pt-20 md:pt-16 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-12 md:py-16 lg:py-20">
            <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
              <div className="fu fu1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                {t('badge')}
              </div>
              <h1 className="fu fu2 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-5">
                <span className="text-white block">{t('heroTitle1')}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-glow block">{t('heroTitle2')}</span>
                <span className="text-white block">{t('heroTitle3')}</span>
              </h1>
              <p className="fu fu3 text-gray-400 text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                {t('heroSubtitle')}
              </p>
              <div className="fu fu4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-6">
                <Link to={user ? '/dashboard' : '/login'}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25 text-sm">
                  {user ? t('openApp') : t('ctaButton')} <IconRocket />
                </Link>
                <p className="text-xs text-gray-500">{t('ctaSubtext')}</p>
              </div>
              {user && (
                <div className="fu fu4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-bold mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {t('welcomeBack')}, {user.displayName?.split(' ')[0] || 'User'} 👋
                </div>
              )}
              <div className="fu fu5 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {[t('feature1'), t('feature2'), t('feature3')].map((feat, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] rounded-full border border-white/[0.07] text-xs font-medium text-gray-400">
                    <IconCheck /> {feat}
                  </div>
                ))}
              </div>
            </div>
            <div className="fu fu3 w-full lg:flex-1 lg:max-w-[640px]">
              <div className="relative rounded-2xl p-[1.5px]" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7,#ec4899)' }}>
                <div className="absolute -inset-3 rounded-3xl blur-2xl opacity-20 pointer-events-none" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7,#ec4899)' }} />
                <div className="relative rounded-2xl overflow-hidden">
                  <HeroMockup />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGO SCROLL ─── */}
      <section className="py-6 border-y border-white/[0.05] bg-[#0f172a]/60 relative overflow-hidden z-10">
        <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">{t('trust')}</p>
        <div className="relative w-full overflow-hidden">
          <div className="flex w-[200%] landing-scroll">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex justify-around w-full opacity-20 grayscale">
                {['Google', 'Netflix', 'Spotify', 'Amazon', 'Meta', 'Apple', 'Tesla', 'Figma'].map(logo => (
                  <span key={logo} className="text-sm font-black text-white px-6">{logo}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0f172a] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0f172a] to-transparent" />
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 md:py-20 px-4 md:px-6 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">{t('stepsTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { num: '01', title: t('step1T'), desc: t('step1D'), color: 'from-blue-500 to-indigo-500' },
            { num: '02', title: t('step2T'), desc: t('step2D'), color: 'from-indigo-500 to-purple-500' },
            { num: '03', title: t('step3T'), desc: t('step3D'), color: 'from-purple-500 to-pink-500' },
          ].map((step, i) => (
            <div key={i} className="glass p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
              <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${step.color} opacity-60`} />
              <span className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br ${step.color} opacity-70 block mb-3`}>{step.num}</span>
              <h3 className="text-base font-black text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── COMPARISON ─── */}
      <section className="py-16 md:py-20 px-4 md:px-6 relative z-10 bg-[#1e293b]/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-10">{t('compareTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border border-red-500/10 bg-red-500/[0.03]">
              <h3 className="text-sm font-black text-red-400 mb-5 flex items-center gap-2 uppercase tracking-wider"><IconX /> {t('oldWay')}</h3>
              <ul className="space-y-3">
                {[t('old1'), t('old2'), t('old3')].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/40 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06]">
              <h3 className="text-sm font-black text-indigo-400 mb-5 flex items-center gap-2 uppercase tracking-wider"><IconCheck /> {t('newWay')}</h3>
              <ul className="space-y-3">
                {[t('new1'), t('new2'), t('new3')].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/80 flex items-center justify-center text-[9px] shrink-0 font-black">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="py-16 md:py-20 px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">{t('reviewsTitle')}</h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Stars /><span className="font-black text-white text-sm">4.9</span>
              <span className="text-gray-600 text-xs">/ 5.0 · 312 reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <div key={i} className="glass p-5 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center font-black text-sm shrink-0`}>{r.avatar}</div>
                    <div>
                      <p className="font-bold text-white text-xs">{r.name}</p>
                      <p className="text-[10px] text-indigo-400">{r.role}</p>
                    </div>
                  </div>
                  <IconQuote />
                </div>
                <Stars n={r.stars} />
                <p className="text-gray-400 text-xs leading-relaxed flex-1">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-16 md:py-20 px-4 md:px-6 relative z-10 bg-[#1e293b]/20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-10">{t('faqTitle')}</h2>
          <div className="space-y-2">
            {faqs.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-16 md:py-20 px-4 md:px-6 relative z-10">
        <div className="max-w-xl mx-auto text-center">
          <div className="glass rounded-2xl p-8 md:p-10 border border-indigo-500/15">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30 text-lg">✦</div>
            <h2 className="text-xl md:text-3xl font-black mb-3">Ready to land your dream job?</h2>
            <p className="text-gray-400 mb-6 text-sm">Join thousands of candidates already using AIletter.</p>
            <Link to={user ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 px-7 py-3.5 font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25 text-sm">
              {user ? t('openApp') : t('ctaButton')} <IconRocket />
            </Link>
            <p className="text-xs text-gray-600 mt-4">{t('ctaSubtext')}</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.05] bg-[#0f172a] pt-10 pb-6 px-4 md:px-6 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 font-black tracking-tighter text-base">
              <span className="bg-gray-800 w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px]">AI</span>
              AILETTER
            </div>
            <p className="text-gray-600 text-xs">{t('footerDesc')}</p>
            <div className="flex items-center gap-5 text-xs text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Email</a>
              {/* ✅ Product Hunt бейдж */}
              <a
                href="https://www.producthunt.com/products/ailetter-2/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-ailetter&#0045;2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1173518&theme=neutral"
                  alt="AIletter on Product Hunt"
                  style={{ width: '120px', height: '26px' }}
                  width="120"
                  height="26"
                />
              </a>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-700">
            <span>© 2025 AIletter. All rights reserved.</span>
            <div className="flex gap-5">
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