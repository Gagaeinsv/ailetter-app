// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import HeroMockup from '../components/landing/HeroMockup';
import AiToolsMockup from '../components/landing/AiToolsMockup';

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

const IconCheck   = () => <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>;
const IconX       = () => <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>;
const IconRocket  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>;
const IconMenu    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconClose   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconChevron = ({ open }) => <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>;

const Stars = ({ n = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: n }).map((_, i) => (
      <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
);

const FAQS = {
  en: [
    { q: 'Is AIletter really free to start?', a: 'Yes — you get 5 free generations per month with no credit card required. Each generation produces a complete, ready-to-use cover letter, resume optimizer scan, or interview Q&A list.' },
    { q: 'How does the ATS Resume Optimizer work?', a: 'You upload your CV and paste the target vacancy. The AI audits your formatting, structure, and text achievements, highlights missing keywords, and automatically re-writes your bullet points with quantitative impact metrics to pass screening.' },
    { q: 'How personalized are the letters and interview preps?', a: 'Extremely. AIletter analyzes your actual CV profile and the job description. It generates tailored letters referencing vacancy requirements and designs custom questions using the STAR interview methodology.' },
    { q: 'What is the Smart Job Tracker?', a: 'It is a visual board inside your dashboard where you can log applications, add notes, and move entries between columns (Applied, Interview, Offer, Rejected). The system tracks application dates and alerts you when it is time to follow up.' },
    { q: 'What languages are supported?', a: 'Currently English, Ukrainian, Italian, and German. The AI detects the job description language automatically or you can set it manually.' },
    { q: 'What is the Pro plan?', a: 'Pro gives you unlimited generations, 16+ premium templates, DOCX & HD PDF exports, no watermarks, automated follow-up draft generation, and priority AI processing. Plans start from €6/month.' },
  ],
  uk: [
    { q: 'Чи справді безкоштовно?', a: 'Так — 5 безкоштовних спроб щомісяця без кредитної картки. Ви можете створювати листи, аналізувати резюме або готуватися до інтерв’ю безкоштовно.' },
    { q: 'Як працює ATS Оптимізатор резюме?', a: 'Ви завантажуєте резюме та вставляєте вакансію. AI перевіряє форматування, підраховує відповідність ключових слів та переписує ваші досягнення, додаючи метрики, щоб пройти автоматичний фільтр рекрутерів.' },
    { q: 'Наскільки персоналізовані листи та питання до інтерв’ю?', a: 'Максимально. Система бере досвід з вашого профілю та співвідносить його з кожним рядком вакансії. Листи та питання до співбесіди за методом STAR будуть унікальними для кожної вакансії.' },
    { q: 'Що таке розумний трекер вакансій?', a: 'Це візуальна Kanban-дошка в додатку, де ви можете зберігати вакансії, міняти їхній статус (Відправлено, Співбесіда, Офер, Відмова) та отримувати нагадування про те, що пора нагадати рекрутеру про себе.' },
    { q: 'Які мови підтримуються?', a: 'English, Українська, Italiano та Deutsch. AI визначає мову вакансії автоматично або ви можете вибрати її в налаштуваннях.' },
    { q: 'Що входить у Pro план?', a: 'Необмежені генерації, 16+ шаблонів, експорт у DOCX та PDF без водяних знаків, автогенерація follow-up листів, пріоритетний AI. Від €6/місяць.' },
  ],
  it: [
    { q: 'È davvero gratuito per iniziare?', a: 'Sì — ricevi 5 generazioni gratuite al mese senza carta di credito. Ogni generazione produce lettere, scansioni CV o domande di colloquio.' },
    { q: 'Come funziona l’ottimizzatore CV per ATS?', a: 'Carichi il tuo CV e incolli l’offerta. L’AI valuta la struttura del testo, individua le parole chiave mancanti richieste dall’azienda e riscrive i punti elenco con indicatori di performance quantitativi.' },
    { q: 'Quanto sono personalizzate le lettere e le domande di colloquio?', a: 'Moltissimo. AIletter analizza i dati del tuo profilo e della vacancy per creare lettere su misura e formulare domande basate sul metodo STAR.' },
    { q: 'Cos’è il tracker delle candidature?', a: 'È una bacheca Kanban all’interno della dashboard dove puoi salvare le posizioni a cui ti sei candidato, aggiungere note e ricevere alert che ti segnalano quando è ora di inviare un follow-up.' },
    { q: 'Quali lingue sono supportate?', a: 'English,  Italiano e Deutsch. L’AI rileva automaticamente la lingua o puoi impostarla a mano.' },
    { q: 'Cos’è il piano Pro?', a: 'Generazioni illimitate, 16+ template premium, esportazione DOCX, nessuna filigrana su PDF, stesura automatica dei follow-up ed elaborazione AI prioritaria. Da €6/mese.' },
  ],
  de: [
    { q: 'Ist AIletter wirklich kostenlos?', a: 'Ja — Sie erhalten 5 kostenlose Generierungen pro Monat ohne Kreditkarte. Jede Generierung liefert vollständige Anschreiben, ATS-Scans oder Interview-Fragen.' },
    { q: 'Wie funktioniert der ATS-Lebenslauf-Optimierer?', a: 'Sie laden Ihren Lebenslauf hoch und fügen die Stellenanzeige ein. Die KI prüft die Struktur, findet Keyword-Lücken und schreibt Ihre Erfolge mit messbaren Ergebnissen um, um die Filter zu bestehen.' },
    { q: 'Wie personalisiert sind Anschreiben und Interview-Fragen?', a: 'Absolut maßgeschneidert. AIletter analysiert die Fähigkeiten Ihres Profils und gleicht sie mit der Ausschreibung ab. Fragen und STAR-Antworten werden individuell erstellt.' },
    { q: 'Was ist der Job-Tracker?', a: 'Ein visuelles Kanban-Board, auf dem Sie Ihre Bewerbungen verwalten (Beworben, Gespräch, Angebot, Abgelehnt). Der Tracker erinnert Sie automatisch, wenn ein Follow-up ansteht.' },
    { q: 'Welche Sprachen werden unterstützt?', a: 'English, Englisch, Ukrainisch, Italienisch und Deutsch. Die KI erkennt die Sprache automatisch.' },
    { q: 'Was ist der Pro-Plan?', a: 'Unbegrenzte Generierungen, 16+ Vorlagen, DOCX-Export, keine Wasserzeichen auf PDFs, automatische Follow-up-Entwürfe. Ab €6/Monat.' },
  ],
};

const SAMPLE_TEMPLATES = [
  {
    key: 'dev',
    icon: '💻',
    title: { en: 'Software Engineer', uk: 'Розробник ПЗ', it: 'Sviluppatore Software', de: 'Softwareentwickler' },
    company: 'Google',
    roleName: 'Software Engineer',
    desc: 'Focuses on scalable backends, microservices, cloud deployments, and clean code.',
    text: {
      en: `Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at Google. With 4 years of experience building scalable web applications using React, Node.js, and cloud systems, I am excited about the opportunity to contribute to your engineering team.

In my previous role at TechCorp, I led the migration of a legacy monolithic service to microservices, improving system performance by 40% and reducing server costs by $12k/year. I value clean code, automated testing, and agile collaboration.

Best regards,
Alex Johnson`,
      uk: `Шановний менеджер з найму,

Пишу, щоб висловити свій великий інтерес до вакансії розробника програмного забезпечення в Google. Маючи 4 роки досвіду розробки масштабованих вебдодатків з використанням React, Node.js та хмарних систем, я радий можливості приєднатися до вашої команди.

На попередній посаді в TechCorp я керував міграцією застарілої системи на мікросервісну архітектуру, що покращило швидкість роботи на 40% та знизило витрати на сервер на $12,000/рік. Я ціную чистий код та автоматизоване тестування.

З повагою,
Олексій Іванов`,
      it: `Gentile Responsabile delle Selezioni,

Le scrivo per esprimere il mio forte interesse per la posizione di Sviluppatore Software presso Google. Con 4 anni di esperienza nella creazione di applicazioni web scalabili con React, Node.js e sistemi cloud, sono entusiasta dell'opportunità di contribuire al vostro team.

Nel mio ruolo precedente presso TechCorp, ho guidato la migrazione di un servizio monolitico legacy verso microservizi, migliorando le prestazioni del 40% e riducendo i costi del server di $12.000 all'anno.

Distinti saluti,
Alessandro Rossi`,
      de: `Sehr geehrte Damen und Herren,

ich schreibe Ihnen, um mein großes Interesse an der Stelle als Softwareentwickler bei Google zu bekunden. Mit 4 Jahren Erfahrung in der Entwicklung skalierbarer Webanwendungen mit React, Node.js und Cloud-Systemen freue ich mich auf die Zusammenarbeit mit Ihrem Team.

In meiner vorherigen Position bei TechCorp leitete ich die Migration eines monolithischen Dienstes zu Mikrodiensten, was die Leistung um 40 % verbesserte und die Serverkosten senkte.

Mit freundlichen Grüßen,
Alex Johnson`
    }
  },
  {
    key: 'design',
    icon: '🎨',
    title: { en: 'Product Designer', uk: 'Продуктовий дизайнер', it: 'Product Designer', de: 'Product Designer' },
    company: 'Spotify',
    roleName: 'Product Designer',
    desc: 'Focuses on user research, user journey mapping, high-fidelity prototypes, and Figma systems.',
    text: {
      en: `Dear Hiring Manager,

I am writing to express my strong interest in the Product Designer position at Spotify. With 5 years of user experience design and a passion for music technology, I am confident I would be a valuable addition to your team.

At Figma, I led the redesign of our core editor interface, resulting in a 34% increase in user retention. I collaborated closely with engineering and product teams to ship features used by millions worldwide.

Best regards,
Alex Johnson`,
      uk: `Шановний менеджер з найму,

Пишу, щоб висловити свій великий інтерес до вакансії продуктового дизайнера в Spotify. Маючи 5 років досвіду дизайну інтерфейсів та пристрасть до музичних технологій, я впевнений, що зможу принести цінність вашій команді.

У компанії Figma я очолював редизайн основного інтерфейсу редактора, що призвело до збільшення утримання користувачів на 34%. Я тісно співпрацював з інженерами та продуктовими командами.

З повагою,
Олексій Іванов`,
      it: `Gentile Responsabile delle Selezioni,

Le scrivo per esprimere il mio interesse per la posizione di Product Designer presso Spotify. Con 5 anni di esperienza nel design dell'esperienza utente e una forte passione per la tecnologia musicale, sono sicuro di poter dare un valore aggiunto al vostro team.

Presso Figma, ho guidato la riprogettazione dell'interfaccia principale, ottenendo un aumento del 34% nella fidelizzazione degli utenti e collaborando a stretto contatto con gli sviluppatori.

Distinti saluti,
Alessandro Rossi`,
      de: `Sehr geehrte Damen und Herren,

ich schreibe Ihnen, um mein Interesse an der Stelle als Product Designer bei Spotify zu bekunden. Mit 5 Jahren Erfahrung im User Experience Design und einer Leidenschaft für Musiktechnologie bin ich zuversichtlich, eine Bereicherung für Ihr Team zu sein.

Bei Figma leitete ich die Neugestaltung unserer Editor-Oberfläche, was zu einer Steigerung der Nutzerbindung um 34 % führte. Ich arbeitete eng mit Entwicklerteams zusammen.

Mit freundlichen Grüßen,
Alex Johnson`
    }
  },
  {
    key: 'marketing',
    icon: '📈',
    title: { en: 'Marketing Manager', uk: 'Маркетинг менеджер', it: 'Marketing Manager', de: 'Marketing Manager' },
    company: 'Airbnb',
    roleName: 'Marketing Manager',
    desc: 'Focuses on SEO, PPC, email marketing campaigns, influencer outreach, and retention analytics.',
    text: {
      en: `Dear Hiring Manager,

I am writing to apply for the Marketing Manager role at Airbnb. With a proven track record of scaling organic user acquisition by 150% and managing $50k+ monthly ad budgets, I am excited to drive growth for your travel experiences.

At WebFlow, I built an inbound marketing engine that generated 20,000 sign-ups per month. I look forward to bringing my growth mindset and analytics background to Airbnb.

Best regards,
Alex Johnson`,
      uk: `Шановний менеджер з найму,

Пишу, щоб подати заявку на вакансію маркетинг-менеджера в Airbnb. Маючи підтверджений досвід збільшення органічного залучення користувачів на 150% та управління рекламним бюджетом понад $50,000/місяць, я радий можливості розвивати ваші сервіси.

У компанії WebFlow я побудував систему вхідного маркетингу, яка приносила 20,000 реєстрацій щомісяця. Я з нетерпінням чекаю можливості принести свій аналітичний досвід в Airbnb.

З повагою,
Олексій Іванов`,
      it: `Gentile Responsabile delle Selezioni,

Le scrivo per candidarmi al ruolo di Marketing Manager presso Airbnb. Con un solido percorso di crescita dell'acquisizione organica degli utenti del 150% e la gestione di budget pubblicitari mensili superiori a $50.000, sono entusiasta di far crescere il vostro brand.

Presso WebFlow, ho strutturato un canale di inbound marketing che ha generato 20.000 registrazioni al mese. Spero di poter portare questa mentalità orientata alla crescita in Airbnb.

Distinti saluti,
Alessandro Rossi`,
      de: `Sehr geehrte Damen und Herren,

ich bewerbe mich um die Stelle als Marketing Manager bei Airbnb. Mit einer nachgewiesenen Erfolgsbilanz bei der Steigerung der organischen Nutzerakquise um 150 % und der Verwaltung von Werbebudgets freue ich mich darauf, das Wachstum bei Airbnb voranzutreiben.

Bei WebFlow baute ich eine Inbound-Marketing-Engine auf, die 20.000 Anmeldungen pro Monat generierte. Ich freue mich darauf, meine analytischen Fähigkeiten einzubringen.

Mit freundlichen Grüßen,
Alex Johnson`
    }
  }
];

const TRANSLATIONS = {
  en: {
    badge: "V3.0 Now Live",
    heroTitle1: "Tailor CV & Letter", heroTitle2: "in under 60 seconds", heroTitle3: "instead of hours",
    heroSubtitle: "Speed up your manual job application preparation by 10x. Automatically audit your ATS keyword matches, tailor your resume inline, and write personalized cover letters.",
    ctaButton: "Get Started For Free", ctaSubtext: "No credit card required · 5 free generations",
    assurancePrivacy: "100% Data Privacy",
    assuranceNoCard: "No Credit Card Required",
    assuranceA4: "Standard A4 PDF Exports",
    assuranceAts: "ATS-Friendly Layouts",
    howItWorksTitle: "Get Hired in 3 Simple Steps",
    step1T: "1. Scan CV & Vacancy", step1D: "Upload your CV and paste the job description. AIletter extracts your skills and matches them against requirements.",
    step2T: "2. Optimize & Generate", step2D: "Review your ATS match score, fill keyword gaps, edit your resume accomplishments, and generate a tailored cover letter.",
    step3T: "3. Track & Practice", step3D: "Organize applications on your pipeline board, practice role-specific interview Q&As, and get alerts for follow-ups.",
    aiTitle: "AI Job Search Suite",
    aiSubtitle: "Everything you need to speed up your job hunt, pass ATS screening, and nail your interviews.",
    aiDemoHint: "Tap a tool to preview example output.",
    aiDemoHeader: "AI tools — Example output",
    letterT: "Tailor-made Cover Letters",
    letterD: "Generate personalized, high-converting cover letters in 30 seconds with 16+ professional templates.",
    atsT: "CV Tailoring & ATS Match",
    atsD: "Upload your CV, paste the job description, edit your achievements inline, and instantly check keyword matches to pass automated ATS filters.",
    interviewT: "Interview prep Q&A",
    interviewD: "Practice with 8 custom behavioral and role-specific questions and ideal answers prepared using the STAR methodology.",
    trackerT: "Smart Job Tracker",
    trackerD: "Track application statuses, store custom notes, and receive auto-scheduled follow-up alerts.",
    outreachT: "LinkedIn & Email Outreach",
    outreachD: "Create short LinkedIn Easy Apply introductions and direct email subject lines to double your recruiter response rate.",
    bentoTitle: "Complete Job Application Toolkit",
    bentoSubtitle: "Why use separate tools? AIletter covers your application from first search to signed offer.",
    compareTitle: "Why Candidates Choose AIletter", oldWay: "The Old Way", newWay: "With AIletter Suite",
    compare1: "Hours spent writing and formatting manual letters", new1: "Personalized letter ready in 30 seconds",
    compare2: "Untracked applications and lost spreadsheet data", new2: "Visual Kanban board with auto follow-up alerts",
    compare3: "Resume rejected by automated ATS screening systems", new3: "ATS keyword analysis and optimizer built-in",
    compare4: "Stress and lack of preparation before interviews", new4: "8 customized interview questions with answers",
    reviewsTitle: "Real Results from Real Candidates",
    review1Text: "The ATS CV optimizer found 4 missing keyword gaps in my resume. Got an interview in 4 days!", review1Author: "Sarah M., Frontend Developer",
    review2Text: "The Job Tracker saved me from spreadsheet hell. The follow-up notification prompted me to write, and that email got me the offer.", review2Author: "Dmitri K., Product Manager",
    review3Text: "Preparing for interview questions using the customized STAR prep answers gave me so much confidence. Landed the job!", review3Author: "Marco P., Business Analyst",
    faqTitle: "Frequently Asked Questions",
    footerDesc: "The future of job applications.",
    login: "Login", openApp: "Open App", welcomeBack: "Welcome back",
    terms: "Terms of Service", privacy: "Privacy Policy", linkedinGen: "LinkedIn Message Gen",
    templateLibraryTitle: "Cover Letter Template Library",
    templateLibrarySub: "Select a profession to preview a high-converting cover letter sample. Click Customize to load it directly into your AI dashboard.",
    customizeTemplate: "Customize with AI ⚡",
    copyAll: "Copy All Achievements",
    exportPdf: "Export Resume PDF",
    cvMakerT: "AI Resume & CV Builder",
    cvMakerD: "Build a premium resume from scratch or generate it instantly using raw text. Choose print-ready templates.",
    pricingTitle: "Simple, Transparent Pricing",
    pricingSub: "Choose the plan that fits your career goals. Save over 45% with our yearly plan.",
    pricingMonthly: "Monthly",
    pricingYearly: "Yearly",
    pricingFreeName: "Free Plan",
    pricingFreePrice: "€0",
    pricingFreePeriod: "forever",
    pricingProName: "Pro Plan",
    pricingProMonthlyPrice: "€5.99",
    pricingProYearlyPrice: "€3.25",
    pricingProPeriod: "per month",
    pricingProBillNotice: "Billed annually (€39/year)",
    pricingSaveText: "Save 45%",
    pricingPopular: "Most Popular",
    pricingStartBtn: "Get Started For Free",
    pricingUpgradeBtn: "Upgrade to Pro Now",
  },
  uk: {
    badge: "V3.0 Вже Доступно",
    heroTitle1: "Адаптуй резюме та лист", heroTitle2: "менш ніж за 60 секунд", heroTitle3: "замість довгих годин",
    heroSubtitle: "Прискорюй підготовку до подачі вакансій у 10 разів. Автоматично перевіряй збіг ключових слів ATS, адаптуй свій досвід inline та генеруй супровідні листи.",
    ctaButton: "Почати безкоштовно", ctaSubtext: "Картка не потрібна · 5 безкоштовних спроб",
    assurancePrivacy: "100% приватність даних",
    assuranceNoCard: "Без кредитної картки",
    assuranceA4: "Стандартний A4 PDF експорт",
    assuranceAts: "ATS-сумісні шаблони",
    howItWorksTitle: "Отримай роботу за 3 прості кроки",
    step1T: "1. Завантаж CV та вакансію", step1D: "Завантаж резюме та встав текст вакансії. AI автоматично проаналізує твої навички та вимоги.",
    step2T: "2. Оптимізуй та налаштуй", step2D: "Переглянь ATS-оцінку, додай пропущені ключові слова, онови досвід та згенеруй лист.",
    step3T: "3. Відстежуй та готуйся", step3D: "Організуй відгуки на дошці трекера, пройди тренувальне інтерв'ю та надсилай follow-up.",
    aiTitle: "AI Кабінет Пошуку Роботи",
    aiSubtitle: "Все необхідне, щоб прискорити твій пошук роботи, пройти ATS-фільтри та блискуче пройти інтерв'ю.",
    aiDemoHint: "Обери інструмент, щоб побачити приклад.",
    aiDemoHeader: "AI інструменти — приклад результату",
    letterT: "Персоналізовані листи",
    letterD: "Генеруй високоефективні супровідні листи за 30 секунд у 16+ професійних візуальних шаблонах.",
    atsT: "Адаптація CV та Оцінка ATS",
    atsD: "Завантажуй резюме, вставляй вакансію, редагуй свої досягнення inline та миттєво перевіряй збіг ключових слів для проходження автоматичних фільтрів ATS.",
    interviewT: "Підготовка до співбесіди",
    interviewD: "Отримуй 8 персоналізованих запитань та ідеальних відповідей за методом STAR на основі твого резюме.",
    trackerT: "Розумний трекер вакансій",
    trackerD: "Відстежуй статуси відгуків, зберігай нотатки та отримуй автоматичні нагадування про follow-up.",
    outreachT: "Outreach та теми листів",
    outreachD: "Генеруй повідомлення для LinkedIn Easy Apply та теми електронних листів, щоб зацікавити рекрутерів.",
    bentoTitle: "Повний набір інструментів пошуку роботи",
    bentoSubtitle: "Навіщо користуватися різними сервісами? AIletter покриває весь шлях від першого пошуку до оферу.",
    compareTitle: "Чому шукачі обирають AIletter", oldWay: "Старий спосіб", newWay: "З кабінетом AIletter",
    compare1: "Години на ручне написання листів та форматування дизайну", new1: "Супровідний лист готовий за 30 секунд",
    compare2: "Заявки губляться у пошті та хаотичних Excel файлах", new2: "Візуальна дошка трекера з нагадуваннями follow-up",
    compare3: "Резюме відхиляється автоматичними ATS-фільтрами", new3: "Аналіз ATS-оцінки та оптимізація ключових слів",
    compare4: "Стрес та відсутність підготовки перед співбесідою", new4: "8 персональних запитань та відповідей під вакансію",
    reviewsTitle: "Реальні результати реальних кандидатів",
    review1Text: "Оптимізатор CV знайшов 4 прогалини в моєму резюме. Отримала запрошення на інтерв'ю вже за 4 дні!", review1Author: "Світлана М., Frontend Developer",
    review2Text: "Трекер врятував мене від хаосу Excel. Нагадування про follow-up спонукало мене написати рекрутеру, і цей лист приніс офер!", review2Author: "Дмитро К., Product Manager",
    review3Text: "Підготовка за методом STAR дала мені величезну впевненість на співбесіді. Отримав офер!", review3Author: "Марко П., Бізнес-аналітик",
    faqTitle: "Часті запитання",
    footerDesc: "Майбутнє пошуку роботи.",
    login: "Увійти", openApp: "Дашборд", welcomeBack: "З поверненням",
    terms: "Умови використання", privacy: "Політика конфіденційності", linkedinGen: "LinkedIn Генератор",
    templateLibraryTitle: "Бібліотека шаблонів супровідних листів",
    templateLibrarySub: "Обери професію, щоб переглянути приклад ефективного листа. Натисни «Налаштувати», щоб завантажити його у свій кабінет.",
    customizeTemplate: "Налаштувати з AI ⚡",
    copyAll: "Копіювати всі досягнення",
    exportPdf: "Експортувати резюме PDF",
    cvMakerT: "Конструктор резюме з ШІ",
    cvMakerD: "Створюйте преміальні резюме з нуля або генеруйте їх миттєво з довільного опису своїми словами.",
    pricingTitle: "Прості та прозорі тарифи",
    pricingSub: "Оберіть план, який відповідає вашим кар'єрним цілям. Заощаджуйте понад 45% з річним планом.",
    pricingMonthly: "Щомісячно",
    pricingYearly: "Щорічно",
    pricingFreeName: "Безкоштовно",
    pricingFreePrice: "€0",
    pricingFreePeriod: "назавжди",
    pricingProName: "Pro план",
    pricingProMonthlyPrice: "€5.99",
    pricingProYearlyPrice: "€3.25",
    pricingProPeriod: "на місяць",
    pricingProBillNotice: "Сплачується щорічно (€39/рік)",
    pricingSaveText: "Знижка 45%",
    pricingPopular: "Популярний",
    pricingStartBtn: "Почати безкоштовно",
    pricingUpgradeBtn: "Перейти на Pro",
  },
  it: {
    badge: "V3.0 Ora Disponibile",
    heroTitle1: "Adatta CV e Lettera", heroTitle2: "in meno di 60 secondi", heroTitle3: "invece di ore di lavoro",
    heroSubtitle: "Velocizza la preparazione manuale delle candidature di 10 volte. Ottimizza le parole chiave per ATS, modifica il CV inline e genera lettere di presentazione su misura.",
    ctaButton: "Inizia Gratis", ctaSubtext: "Nessuna carta richiesta · 5 generazioni gratis",
    assurancePrivacy: "100% Privacy dei Dati",
    assuranceNoCard: "Nessuna Carta Richiesta",
    assuranceA4: "Esportazione PDF A4 Standard",
    assuranceAts: "Layout Compatibili ATS",
    howItWorksTitle: "Fatti Assumere in 3 Semplici Passaggi",
    step1T: "1. Carica CV e Offerta", step1D: "Carica il tuo curriculum e inserisci la descrizione del lavoro. L'AI estrarrà le competenze e le confronterà con l'annuncio.",
    step2T: "2. Ottimizza e Personalizza", step2D: "Controlla il punteggio ATS, colma le lacune, migliora le frasi del curriculum e scegli un modello di lettera.",
    step3T: "3. Traccia e Allenati", step3D: "Organizza i tuoi contatti nella pipeline visuale, esercitasi per i colloqui e ricevi alert per i follow-up.",
    aiTitle: "Suite AI per la Ricerca di Lavoro",
    aiSubtitle: "Tutto ciò di cui hai bisogno per accelerare la ricerca, superare i filtri ATS e superare brillantemente i colloqui.",
    aiDemoHint: "Scegli uno strumento per vedere un esempio.",
    aiDemoHeader: "Strumenti AI — esempio",
    letterT: "Lettere su Misura",
    letterD: "Genera lettere personalizzate ad alto tasso di conversione in 30 secondi con 16+ modelli professionali.",
    atsT: "Personalizzazione CV e Check ATS",
    atsD: "Carica il CV, incolla la descrizione del lavoro, modifica i tuoi traguardi inline e verifica all'istante la corrispondenza delle parole chiave per superare i filtri ATS.",
    interviewT: "Domande per Colloquio",
    interviewD: "Ricevi 8 domande personalizzate basate sulla tua candidatura con risposte ideali metodo STAR.",
    trackerT: "Tracker Candidature",
    trackerD: "Traccia lo stato dei tuoi invii, aggiungi note e ricevi notifiche per inviare i follow-up puntualmente.",
    outreachT: "LinkedIn e Outreach",
    outreachD: "Genera brevi messaggi di presentazione per Easy Apply e oggetti email che raddoppiano i tassi di risposta.",
    bentoTitle: "Toolkit Completo per la Ricerca Lavoro",
    bentoSubtitle: "Perché usare strumenti separati? AIletter copre l'intero percorso dalla prima ricerca fino all'offerta.",
    compareTitle: "Perché i Candidati Scelgono AIletter", oldWay: "Il vecchio modo", newWay: "Con la suite AIletter",
    compare1: "Ore spese a scrivere a mano e sistemare l'impaginazione", new1: "Lettera personalizzata pronta in 30 secondi",
    compare2: "Candidature sparse tra email e fogli Excel disordinati", new2: "Pipeline visuale con notifiche automatiche di follow-up",
    compare3: "CV scartato dai filtri di selezione ATS automatici", new3: "Analisi del punteggio ATS e ottimizzazione integrate",
    compare4: "Ansia e mancanza di preparazione al colloquio", new4: "8 domande e risposte personalizzate basate sul CV",
    reviewsTitle: "Risultati Reali da Candidati Reali",
    review1Text: "L'ottimizzatore CV ha trovato 4 lacune nel mio curriculum. Ho ottenuto un colloquio in soli 4 giorni!", review1Author: "Sofia M., Sviluppatrice Frontend",
    review2Text: "Il Tracker mi ha salvato dall'inferno dei fogli Excel. Il promemoria mi ha spinto a scrivere, e quella mail mi ha portato l'offerta.", review2Author: "Daniele K., Product Manager",
    review3Text: "Prepararsi al colloquio con le risposte personalizzate STAR mi ha dato una sicurezza incredibile. Lavoro ottenuto!", review3Author: "Marco P., Business Analyst",
    faqTitle: "Domande Frequenti",
    footerDesc: "Il futuro delle candidature.",
    login: "Accedi", openApp: "Apri l'app", welcomeBack: "Bentornato",
    terms: "Termini di servizio", privacy: "Privacy Policy", linkedinGen: "LinkedIn Generator",
    templateLibraryTitle: "Libreria dei Modelli di Lettera",
    templateLibrarySub: "Seleziona una professione per vedere un esempio di lettera ad alta conversione. Clicca su Personalizza per caricarlo direttamente nella dashboard.",
    customizeTemplate: "Personalizza con AI ⚡",
    copyAll: "Copia tutti i punti",
    exportPdf: "Esporta CV PDF",
    cvMakerT: "Costruttore di CV con IA",
    cvMakerD: "Crea un curriculum premium da zero oificalo istantaneamente dal testo libero. Modelli pronti per la stampa.",
    pricingTitle: "Prezzi Semplici e Trasparenti",
    pricingSub: "Scegli il piano più adatto ai tuoi obiettivi di carriera. Risparmia oltre il 45% con il piano annuale.",
    pricingMonthly: "Mensile",
    pricingYearly: "Annuale",
    pricingFreeName: "Piano Gratuito",
    pricingFreePrice: "€0",
    pricingFreePeriod: "per sempre",
    pricingProName: "Piano Pro",
    pricingProMonthlyPrice: "€5.99",
    pricingProYearlyPrice: "€3.25",
    pricingProPeriod: "al mese",
    pricingProBillNotice: "Fatturato annualmente (€39/anno)",
    pricingSaveText: "Risparmia 45%",
    pricingPopular: "Più Popolare",
    pricingStartBtn: "Inizia Gratis",
    pricingUpgradeBtn: "Passa a Pro Ora",
  },
  de: {
    badge: "V3.0 Jetzt Live",
    heroTitle1: "Lebenslauf & Anschreiben", heroTitle2: "in unter 60 Sekunden anpassen", heroTitle3: "statt stundenlanger Arbeit",
    heroSubtitle: "Beschleunigen Sie Ihre Bewerbungsvorbereitung um das 10-Fache. Analysieren Sie ATS-Keywords, passen Sie Ihren Lebenslauf inline an und erstellen Sie Anschreiben.",
    ctaButton: "Kostenlos Starten", ctaSubtext: "Keine Kreditkarte erforderlich · 5 kostenlose Generierungen",
    assurancePrivacy: "100% Datenschutz",
    assuranceNoCard: "Keine Kreditkarte nötig",
    assuranceA4: "Standard-A4-PDF-Export",
    assuranceAts: "ATS-freundliche Vorlagen",
    howItWorksTitle: "Eingestellt werden in 3 einfachen Schritten",
    step1T: "1. Lebenslauf & Stelle hochladen", step1D: "Laden Sie Ihren Lebenslauf hoch und fügen Sie die Stellenanzeige ein. Die KI gleicht Ihre Fähigkeiten ab.",
    step2T: "2. Optimieren & Anpassen", step2D: "Prüfen Sie den ATS-Score, schließen Sie Keyword-Lücken und wählen Sie eine Designvorlage für das Anschreiben.",
    step3T: "3. Tracken & Vorbereiten", step3D: "Organisieren Sie Bewerbungen im Tracker, bereiten Sie sich auf das Gespräch vor und senden Sie Follow-ups.",
    aiTitle: "KI-Jobsuche-Suite",
    aiSubtitle: "Alles, was Sie brauchen, um Ihre Bewerbungen zu beschleunigen, das ATS-Screening zu bestehen und das Interview zu meistern.",
    aiDemoHint: "Wählen Sie ein Tool, um ein Beispiel zu sehen.",
    aiDemoHeader: "KI-Tools — Beispiel",
    letterT: "Maßgeschneiderte Anschreiben",
    letterD: "Erstellen Sie in 30 Sekunden ein maßgeschneidertes Anschreiben in verschiedenen professionellen Vorlagen.",
    atsT: "CV-Anpassung & ATS-Check",
    atsD: "Laden Sie Ihren Lebenslauf hoch, fügen Sie die Stellenbeschreibung ein, bearbeiten Sie Ihre Erfolge direkt inline und prüfen Sie die Keyword-Übereinstimmung für ATS-Filter.",
    interviewT: "Interview-Vorbereitung",
    interviewD: "Erhalten Sie 8 maßgeschneiderte Fragen und ideale STAR-Antworten basierend auf Ihrer Bewerbung.",
    trackerT: "Bewerbungs-Tracker",
    trackerD: "Verfolgen Sie den Status Ihrer Bewerbungen und erhalten Sie automatische Erinnerungen für Follow-ups.",
    outreachT: "LinkedIn & Outreach",
    outreachD: "Erstellen Sie kurze LinkedIn-Nachrichten und Betreffzeilen, um Ihre Rücklaufquote zu verdoppeln.",
    bentoTitle: "Komplettes Bewerbungs-Toolkit",
    bentoSubtitle: "Warum separate Tools nutzen? AIletter deckt Ihren gesamten Bewerbungsprozess ab.",
    compareTitle: "Warum Kandidaten AIletter wählen", oldWay: "Der alte Weg", newWay: "Mit der AIletter Suite",
    compare1: "Stundenlanges manuelles Schreiben und Formatieren von Anschreiben", new1: "Maßgeschneidertes Anschreiben bereit in 30 Sekunden",
    compare2: "Unübersichtliche Bewerbungen in E-Mails und verstreuten Notizen", new2: "Visualisierter Tracker mit automatischen Erinnerungen",
    compare3: "Lebenslauf wird von automatischen ATS-Systemen abgelehnt", new3: "Integriertes ATS-Audit und Keyword-Optimierung",
    compare4: "Unsicherheit und mangelnde Vorbereitung auf Vorstellungsgespräche", new4: "8 personalisierte Interviewfragen mit STAR-Antworten",
    reviewsTitle: "Echte Ergebnisse von echten Kandidaten",
    review1Text: "Der ATS-CV-Optimierer fand 4 Keyword-Lücken in meinem Lebenslauf. Ich hatte in 4 Tagen ein Interview!", review1Author: "Sarah M., Frontend-Entwickler",
    review2Text: "Der Job-Tracker hat mich gerettet. Die Follow-up-Erinnerung war perfekt — genau diese E-Mail hat mir das Angebot eingebracht.", review2Author: "Dmitri K., Product Manager",
    review3Text: "Die Vorbereitung mit den maßgeschneiderten STAR-Antworten hat mir so viel Sicherheit gegeben. Job bekommen!", review3Author: "Marco P., Business Analyst",
    faqTitle: "Häufig gestellte Fragen",
    footerDesc: "Die Zukunft der Bewerbungen.",
    login: "Anmelden", openApp: "App öffnen", welcomeBack: "Willkommen zurück",
    terms: "Nutzungsbedingungen", privacy: "Datenschutz", linkedinGen: "LinkedIn Generator",
    templateLibraryTitle: "Muster-Anschreiben Bibliothek",
    templateLibrarySub: "Wählen Sie einen Beruf, um ein erfolgreiches Anschreiben anzuzeigen. Klicken Sie auf Anpassen, um es direkt in Ihr Dashboard zu laden.",
    customizeTemplate: "Mit KI anpassen ⚡",
    copyAll: "Alle Erfolge kopieren",
    exportPdf: "Lebenslauf PDF exportieren",
    cvMakerT: "KI Lebenslauf Maker",
    cvMakerD: "Erstellen Sie einen Premium-Lebenslauf von Grund auf oder generieren Sie ihn direkt aus Freitext. Druckfertige Vorlagen.",
    pricingTitle: "Einfache, transparente Preise",
    pricingSub: "Wählen Sie den Plan, der zu Ihren Karrierezielen passt. Sparen Sie über 45% mit unserem Jahresplan.",
    pricingMonthly: "Monatlich",
    pricingYearly: "Jährlich",
    pricingFreeName: "Kostenlos",
    pricingFreePrice: "€0",
    pricingFreePeriod: "kostenlos",
    pricingProName: "Pro Plan",
    pricingProMonthlyPrice: "€5.99",
    pricingProYearlyPrice: "€3.25",
    pricingProPeriod: "pro Monat",
    pricingProBillNotice: "Jährlich abgerechnet (€39/Jahr)",
    pricingSaveText: "45% sparen",
    pricingPopular: "Sehr beliebt",
    pricingStartBtn: "Kostenlos starten",
    pricingUpgradeBtn: "Jetzt auf Pro upgraden",
  },
};

const FaqItem = ({ q, a, id }) => {
  const [open, setOpen] = useState(false);
  return (
    <div 
      id={id}
      className={`border rounded-xl transition-all duration-200 ${open ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.015]'}`}
    >
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
  const [demoTab, setDemoTab] = useState('letter');
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('dev');
  const [billingPeriod, setBillingPeriod] = useState('yearly');

  useEffect(() => {
    if (isInteracting) return;
    const interval = setInterval(() => {
      const tabs = ['letter', 'cvmaker', 'ats', 'interview', 'tracker', 'outreach'];
      setDemoTab((prev) => {
        const idx = (tabs.indexOf(prev) + 1) % tabs.length;
        return tabs[idx];
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isInteracting]);

  const handleDemoTabChange = (key) => {
    setDemoTab(key);
    setIsInteracting(true);
  };

  const handleUseTemplate = (tmpl) => {
    localStorage.setItem('preloaded_template', JSON.stringify({
      profession: tmpl.title[uiLang] || tmpl.title.en,
      jobDescription: `Position: ${tmpl.title[uiLang] || tmpl.title.en}\nCompany: ${tmpl.company}\nKey requirements: system performance, scale systems, clean code, engineering collaboration.`,
    }));
    window.location.href = user ? '/dashboard' : '/login';
  };

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'AIletter',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    };
    let sd = document.querySelector('#ailetter-schema');
    if (!sd) { sd = document.createElement('script'); sd.id = 'ailetter-schema'; sd.type = 'application/ld+json'; document.head.appendChild(sd); }
    sd.textContent = JSON.stringify(schema);

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.en.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    };
    let faqSd = document.querySelector('#ailetter-faq-schema');
    if (!faqSd) { faqSd = document.createElement('script'); faqSd.id = 'ailetter-faq-schema'; faqSd.type = 'application/ld+json'; document.head.appendChild(faqSd); }
    faqSd.textContent = JSON.stringify(faqSchema);

    const el = document.createElement('style'); el.innerText = styles; document.head.appendChild(el);
    return () => {
      try { document.head.removeChild(el); } catch(e) {}
    };
  }, []);

  useEffect(() => {
    const metaTitles = {
      en: 'AIletter — AI Cover Letter Generator & Resume CV Builder',
      uk: 'AIletter — Конструктор резюме з ШІ та супровідних листів',
      de: 'AIletter — KI-Anschreiben & Lebenslauf Generator',
      it: 'AIletter — Generatore di Lettere di Presentazione e CV con IA'
    };

    const metaDescs = {
      en: 'Create tailored cover letters and build professional resumes using AI. Optimize your CV for ATS screening, track applications, and ace interviews.',
      uk: 'Створюйте персоналізовані супровідні листи та професійні резюме за допомогою ШІ. Оптимізуйте CV під ATS, відстежуйте вакансії та готуйтеся до співбесід.',
      de: 'Erstellen Sie maßgeschneiderte Anschreiben und professionelle Lebensläufe mit KI. Optimieren Sie Ihren Lebenslauf für ATS-Systeme, verwalten Sie Bewerbungen.',
      it: 'Crea lettere di presentazione personalizzate e curricula professionali con l\'IA. Ottimizza il tuo CV per i filtri ATS, traccia le candidature e preparati al colloquio.'
    };

    document.title = metaTitles[uiLang] || metaTitles.en;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', metaDescs[uiLang] || metaDescs.en);
    }
  }, [uiLang]);

  const t = k => TRANSLATIONS[uiLang]?.[k] || TRANSLATIONS.en[k] || k;
  const faqs = FAQS[uiLang] || FAQS.en;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden">
      <div className="fixed inset-0 bg-grid opacity-[0.15] pointer-events-none z-0" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/4 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* HEADER */}
      <header className="fixed w-full top-0 z-50 border-b border-white/[0.06] bg-[#0f172a]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black tracking-tighter text-base">
            <img src="/android-chrome-192x192.png" alt="AIletter" className="w-7 h-7 rounded-lg" />
            AIletter
          </div>
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher value={uiLang} onChange={setUiLang} />
            <Link to="/linkedin-message" className="px-3 py-2 text-xs font-bold text-[#38bdf8] hover:text-white hover:bg-[#0077b5]/10 rounded-lg transition-all border border-[#0077b5]/20">
              LinkedIn ↗
            </Link>
            {user ? (
              <Link id="open-app-header-btn" to="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">{user.displayName?.[0]?.toUpperCase() || 'U'}</div>
                {t('openApp')}
              </Link>
            ) : (
              <Link id="login-header-btn" to="/login" className="px-4 py-2 bg-white text-[#0f172a] rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">{t('login')}</Link>
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
            <Link to="/linkedin-message" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-3 bg-[#0077b5]/10 border border-[#0077b5]/20 text-[#38bdf8] rounded-xl text-sm font-bold">
              LinkedIn Easy Apply Generator ↗
            </Link>
            {user ? (
              <Link id="open-app-mobile-btn" to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 rounded-xl text-sm font-black uppercase tracking-widest">{t('openApp')}</Link>
            ) : (
              <Link id="login-mobile-btn" to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3 bg-white text-[#0f172a] rounded-xl text-sm font-black uppercase tracking-widest">{t('login')}</Link>
            )}
          </div>
        )}
      </header>

      {/* HERO */}
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
              <p className="fu fu3 text-gray-400 text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">{t('heroSubtitle')}</p>
              <div className="fu fu4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-6">
                <Link id="hero-cta-btn" to={user ? '/dashboard' : '/login'}
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
            </div>
            <div className="fu fu3 w-full lg:flex-1 lg:max-w-[640px] overflow-hidden">
              <div className="relative rounded-2xl p-[1.5px]" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7,#ec4899)' }}>
                <div className="absolute -inset-3 rounded-3xl blur-2xl opacity-20 pointer-events-none" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7,#ec4899)' }} />
                <div className="relative rounded-2xl overflow-hidden bg-[#0f172a]" style={{ maxHeight: 420 }}>
                  <HeroMockup />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST ASSURANCES / KEY METRICS */}
      <section className="py-8 border-y border-white/[0.05] bg-[#0f172a]/60 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-wrap justify-around items-center gap-6 text-center text-xs font-bold text-gray-400 tracking-wider">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-lg">🛡️</span>
            <span>{t('assurancePrivacy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-lg">💳</span>
            <span>{t('assuranceNoCard')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-lg">📄</span>
            <span>{t('assuranceA4')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-lg">⚡</span>
            <span>{t('assuranceAts')}</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-16 tracking-tight">{t('howItWorksTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { key: 'step1', icon: '⚡', title: t('step1T'), desc: t('step1D') },
            { key: 'step2', icon: '🛠️', title: t('step2T'), desc: t('step2D') },
            { key: 'step3', icon: '🎯', title: t('step3T'), desc: t('step3D') },
          ].map((step, idx) => (
            <div key={step.key} className="glass rounded-2xl p-6 border border-white/5 relative hover:border-indigo-500/20 transition-all duration-300">
              <span className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-black text-sm text-white">
                {idx + 1}
              </span>
              <div className="text-3xl mb-4 mt-2">{step.icon}</div>
              <h3 className="text-lg font-black text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI TOOLS SECTION (INLINE INTERACTIVE SUITE DEMO) */}
      <section className="py-20 md:py-28 px-4 md:px-6 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-glow text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
            {t('aiTitle')}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
            {t('aiSubtitle')}
          </p>
        </div>

        {/* Inline Interactive Suite Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#1e293b]/20 rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Left: Interactive Info Cards / Controls */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-3 relative z-10">
            {[
              { key: 'letter', icon: '📄', title: t('letterT'), desc: t('letterD'), tint: 'from-indigo-500/10 to-transparent border-indigo-500/10' },
              { key: 'cvmaker', icon: '📝', title: t('cvMakerT'), desc: t('cvMakerD'), tint: 'from-fuchsia-500/10 to-transparent border-fuchsia-500/10' },
              { key: 'ats', icon: '📊', title: t('atsT'), desc: t('atsD'), tint: 'from-emerald-500/10 to-transparent border-emerald-500/10' },
              { key: 'interview', icon: '🎤', title: t('interviewT'), desc: t('interviewD'), tint: 'from-purple-500/10 to-transparent border-purple-500/10' },
              { key: 'tracker', icon: '💼', title: t('trackerT'), desc: t('trackerD'), tint: 'from-amber-500/10 to-transparent border-amber-500/10' },
              { key: 'outreach', icon: '✉️', title: t('outreachT'), desc: t('outreachD'), tint: 'from-sky-500/10 to-transparent border-sky-500/10' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleDemoTabChange(item.key)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                  demoTab === item.key
                    ? 'bg-[#1e293b]/50 border-white/10 shadow-lg shadow-black/20 scale-[1.01]'
                    : 'border-transparent bg-white/[0.01] hover:bg-white/[0.02] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="text-2xl shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <h3 className="text-xs font-black text-white">{item.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Mockup Window */}
          <div className="lg:col-span-7 relative z-10 w-full flex items-center">
            <div className="w-full relative rounded-2xl p-[1.5px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
              <div className="absolute -inset-3 rounded-3xl blur-2xl opacity-10 pointer-events-none bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
              <div className="relative rounded-2xl overflow-hidden bg-[#0b1120]" style={{ height: 420 }}>
                <AiToolsMockup t={t} activeTab={demoTab} onChangeTab={handleDemoTabChange} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO FEATURE DETAILS */}
      <section className="py-20 px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">{t('bentoTitle')}</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">{t('bentoSubtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '📄', title: t('letterT'), desc: t('letterD') },
            { icon: '📝', title: t('cvMakerT'), desc: t('cvMakerD') },
            { icon: '📊', title: t('atsT'), desc: t('atsD') },
            { icon: '🎤', title: t('interviewT'), desc: t('interviewD') },
            { icon: '💼', title: t('trackerT'), desc: t('trackerD') },
            { icon: '✉️', title: t('outreachT'), desc: t('outreachD') },
          ].map((feat, idx) => (
            <div key={idx} className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
              <div className="mt-6 flex items-center text-xs text-indigo-400 font-bold tracking-wider uppercase gap-1 hover:text-indigo-300">
                <span>Learn More</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEMPLATE LIBRARY */}
      <section className="py-20 px-4 md:px-6 relative z-10 max-w-7xl mx-auto border-t border-white/[0.04]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">{t('templateLibraryTitle')}</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">{t('templateLibrarySub')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Side: Category Tabs Selector */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-3">
            {SAMPLE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.key}
                type="button"
                onClick={() => setActiveTemplate(tmpl.key)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                  activeTemplate === tmpl.key
                    ? 'bg-[#1e293b]/60 border-indigo-500/30 text-white shadow-lg'
                    : 'border-transparent bg-white/[0.01] hover:bg-white/[0.02] text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-2xl shrink-0">{tmpl.icon}</span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate">{tmpl.title[uiLang] || tmpl.title.en}</h3>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{tmpl.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Side: A4 Page Mockup Letter View */}
          <div className="lg:col-span-8 flex flex-col">
            {(() => {
              const current = SAMPLE_TEMPLATES.find(x => x.key === activeTemplate) || SAMPLE_TEMPLATES[0];
              const letterText = current.text[uiLang] || current.text.en;
              return (
                <div className="flex-1 flex flex-col bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/5">
                  {/* Top Header bar with custom styling */}
                  <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-sm uppercase">
                        {t('logo')?.[0] || 'A'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Template: {current.title[uiLang] || current.title.en}</h4>
                        <p className="text-[10px] text-indigo-200">Ready to customize for {current.company}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleUseTemplate(current)}
                      className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-md"
                    >
                      {t('customizeTemplate')}
                    </button>
                  </div>

                  {/* Body Cover Letter content */}
                  <div className="p-6 md:p-8 font-serif text-[11px] md:text-xs leading-relaxed text-slate-800 flex-1 whitespace-pre-wrap max-h-[320px] overflow-y-auto custom-scrollbar">
                    {letterText}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* COMPARISON BLOCK */}
      <section className="py-20 px-4 md:px-6 relative z-10 max-w-4xl mx-auto border-t border-white/[0.04]">
        <h2 className="text-3xl font-black text-center mb-16 tracking-tight">{t('compareTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Old Way */}
          <div className="bg-[#1e293b]/10 border border-rose-500/10 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-black text-rose-400 flex items-center gap-2">
              <span className="text-xl">❌</span> {t('oldWay')}
            </h3>
            <div className="space-y-4">
              {[t('compare1'), t('compare2'), t('compare3'), t('compare4')].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <IconX />
                  <p className="text-xs text-gray-400 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* New Way */}
          <div className="bg-indigo-600/[0.03] border border-indigo-500/15 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-lg font-black text-indigo-400 flex items-center gap-2">
              <span className="text-xl">✨</span> {t('newWay')}
            </h3>
            <div className="space-y-4">
              {[t('compare1New'), t('compare2New'), t('compare3New'), t('compare4New')].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <IconCheck />
                  <p className="text-xs text-slate-200 leading-relaxed font-bold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-20 px-4 md:px-6 relative z-10 max-w-5xl mx-auto border-t border-white/[0.04]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">{t('pricingTitle')}</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">{t('pricingSub')}</p>
          
          {/* Switcher */}
          <div className="inline-flex items-center gap-2 mt-6 bg-[#1e293b] p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${billingPeriod === 'monthly' ? 'bg-[#6366f1] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {t('pricingMonthly')}
            </button>
            <button 
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${billingPeriod === 'yearly' ? 'bg-[#6366f1] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <span>{t('pricingYearly')}</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded-full font-black border border-emerald-500/10">{t('pricingSaveText')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto mt-10">
          {/* Card 1: Free */}
          <div className="glass rounded-3xl p-8 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black text-white">{t('pricingFreeName')}</h3>
                  <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-wider">Start building now</p>
                </div>
              </div>
              
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{t('pricingFreePrice')}</span>
                <span className="text-xs text-slate-400">/ {t('pricingFreePeriod')}</span>
              </div>

              <div className="h-px bg-white/5 my-6" />

              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <IconCheck /> <span>5 {uiLang === 'uk' ? 'генерацій на місяць' : 'generations per month'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Конструктор резюме (CV Maker)' : 'Resume CV Maker (manual editing)'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Базові шаблони дизайну' : 'Basic templates library'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'ATS аналіз ключових слів' : 'ATS keyword scanner'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Канбан-трекер вакансій' : 'Smart Kanban job tracker'}</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400 font-bold">
                  <IconCheck /> <span>{uiLang === 'uk' ? '+2 додаткові генерації за кожного друга' : '+2 bonus generations per friend invited'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link 
                to={user ? '/dashboard' : '/login'} 
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/5"
              >
                {t('pricingStartBtn')}
              </Link>
            </div>
          </div>

          {/* Card 2: Pro */}
          <div className="bg-[#6366f1]/[0.02] border-2 border-[#6366f1]/50 rounded-3xl p-8 flex flex-col justify-between hover:border-[#6366f1]/80 transition-all duration-300 relative">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#6366f1] text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-[#6366f1]/20 border border-white/10">
              {t('pricingPopular')}
            </div>
            
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black text-indigo-400">{t('pricingProName')}</h3>
                  <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-wider">Unleash the full AI capability</p>
                </div>
              </div>

              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">
                  {billingPeriod === 'yearly' ? t('pricingProYearlyPrice') : t('pricingProMonthlyPrice')}
                </span>
                <span className="text-xs text-slate-400">/ {t('pricingProPeriod')}</span>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                {billingPeriod === 'yearly' ? t('pricingProBillNotice') : (uiLang === 'uk' ? 'Сплачується щомісячно' : 'Billed monthly')}
              </p>

              <div className="h-px bg-white/5 my-6" />

              <ul className="space-y-3.5 text-xs text-slate-200 font-medium">
                <li className="flex items-center gap-2 font-bold text-white">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Безлімітні генерації ШІ' : 'Unlimited AI letter & CV generations'}</span>
                </li>
                <li className="flex items-center gap-2 text-indigo-300 font-bold">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'ШІ Авто-заповнення резюме з тексту' : 'Magic AI CV Generator (from freeform text)'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Режим Executive (PRO)' : 'Executive Mode presets for senior roles'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Преміальні шаблони CV та листів' : 'Premium resume & letter visual templates'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'ШІ супровідні листи нагадування (Follow-up)' : 'Auto-scheduled Follow-up drafts'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Експорт без водяних знаків' : 'High-definition export without watermarks'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Пріоритетний доступ до ШІ' : 'Priority access & advanced models'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link 
                to={user ? '/dashboard' : '/login'} 
                className="w-full py-3 bg-[#6366f1] hover:bg-[#5458ee] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#6366f1]/25 border border-white/5"
              >
                {t('pricingUpgradeBtn')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 md:px-6 relative z-10">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <h2 className="text-3xl font-black text-center mb-12 tracking-tight">{t('faqTitle')}</h2>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <FaqItem 
                key={i} 
                q={item.q} 
                a={item.a} 
                id={`faq-item-${i}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-20 px-4 md:px-6 relative z-10">
        <div className="max-w-xl mx-auto text-center">
          <div className="glass rounded-3xl p-8 md:p-10 border border-indigo-500/15 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl" />
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30 text-lg">✦</div>
            <h2 className="text-2xl md:text-3xl font-black mb-3 text-white">Ready to Land Your Dream Job?</h2>
            <p className="text-gray-400 mb-6 text-xs leading-relaxed max-w-sm mx-auto">
              Join thousands of job hunters who optimize CVs, generate tailored letters, and track applications on auto-pilot.
            </p>
            <Link id="bottom-cta-btn" to={user ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-2 px-7 py-3.5 font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25 text-sm">
              {user ? t('openApp') : t('ctaButton')} <IconRocket />
            </Link>
            <p className="text-[10px] text-gray-500 mt-4">{t('ctaSubtext')}</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.05] bg-[#0f172a] pt-10 pb-6 px-4 md:px-6 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 font-black tracking-tighter text-base">
              <img src="/android-chrome-192x192.png" alt="AIletter" className="w-7 h-7 rounded-lg" />
              AIletter
            </div>
            <p className="text-gray-600 text-xs">{t('footerDesc')}</p>
            <div className="flex items-center gap-5 text-xs text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Email</a>
              <a href="https://www.producthunt.com/products/ailetter-2/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-ailetter&#0045;2" target="_blank" rel="noopener noreferrer">
                <img src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1173518&theme=neutral" alt="AIletter on Product Hunt" style={{ width: '120px', height: '26px' }} width="120" height="26" />
              </a>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-700">
            <span>© 2025 AIletter. All rights reserved.</span>
            <div className="flex flex-wrap justify-end gap-x-5 gap-y-2">
              <Link to="/terms" className="hover:text-gray-400 transition-colors">{t('terms')}</Link>
              <Link to="/privacy" className="hover:text-gray-400 transition-colors">{t('privacy')}</Link>
              <Link to="/linkedin-message" className="hover:text-indigo-400 transition-colors text-indigo-600">{t('linkedinGen')}</Link>
              <Link to="/subject-line" className="hover:text-indigo-400 transition-colors text-indigo-600">Subject Line</Link>
              <Link to="/cover-letter-ai-developer" className="hover:text-indigo-400 transition-colors text-indigo-600">{uiLang === 'uk' ? 'Супровідний лист (AI)' : 'AI Developer Cover Letter'}</Link>
              <Link to="/linkedin-cold-message-templates" className="hover:text-indigo-400 transition-colors text-indigo-600">{uiLang === 'uk' ? 'Шаблони LinkedIn' : 'LinkedIn Cold Messages'}</Link>
              <Link to="/freelancer-self-introduction" className="hover:text-indigo-400 transition-colors text-indigo-600">{uiLang === 'uk' ? 'Фріланс Proposal' : 'Freelancer Pitch'}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;