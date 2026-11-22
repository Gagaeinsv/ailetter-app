// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, CreditCard, FileText, Zap, Sliders, Target,
  BarChart3, Mic, Briefcase, Send, ArrowRight, Check, X,
  Code2, Palette, TrendingUp, Flame, ChevronDown, Menu
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import HeroMockup from '../components/landing/HeroMockup';
import AiToolsMockup from '../components/landing/AiToolsMockup';

const styles = `
  @keyframes landingScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .landing-scroll { animation: landingScroll 22s linear infinite; }
  .bg-grid-light {
    background-size: 36px 36px;
    background-image:
      linear-gradient(to right, rgba(15,23,42,0.035) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(15,23,42,0.035) 1px, transparent 1px);
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .fu { animation: fadeUp 0.5s ease forwards; opacity: 0; }
  .fu1 { animation-delay: 0.04s; }
  .fu2 { animation-delay: 0.12s; }
  .fu3 { animation-delay: 0.22s; }
  .fu4 { animation-delay: 0.34s; }
  .fu5 { animation-delay: 0.44s; }
`;

const IconCheck   = () => <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />;
const IconX       = () => <X className="w-4 h-4 text-rose-500 shrink-0" strokeWidth={2.5} />;
const IconRocket  = () => <ArrowRight className="w-4 h-4" strokeWidth={2.25} />;
const IconMenu    = () => <Menu className="w-5 h-5" />;
const IconClose   = () => <X className="w-5 h-5" />;
const IconChevron = ({ open }) => <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />;

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
    { q: 'Is AI-Letter really free to start?', a: 'Yes — you get 5 free generations per month with no credit card required. Each generation produces a complete, ready-to-use cover letter, resume optimizer scan, or interview Q&A list.' },
    { q: 'How does the ATS Resume Optimizer work?', a: 'You upload your CV and paste the target vacancy. The AI audits your formatting, structure, and text achievements, highlights missing keywords, and automatically re-writes your bullet points with quantitative impact metrics to pass screening.' },
    { q: 'How personalized are the letters and interview preps?', a: 'Extremely. AI-Letter analyzes your actual CV profile and the job description. It generates tailored letters referencing vacancy requirements and designs custom questions using the STAR interview methodology.' },
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
    { q: 'Quanto sono personalizzate le lettere e le domande di colloquio?', a: 'Moltissimo. AI-Letter analizza i dati del tuo profilo e della vacancy per creare lettere su misura e formulare domande basate sul metodo STAR.' },
    { q: 'Cos’è il tracker delle candidature?', a: 'È una bacheca Kanban all’interno della dashboard dove puoi salvare le posizioni a cui ti sei candidato, aggiungere note e ricevere alert che ti segnalano quando è ora di inviare un follow-up.' },
    { q: 'Quali lingue sono supportate?', a: 'English,  Italiano e Deutsch. L’AI rileva automaticamente la lingua o puoi impostarla a mano.' },
    { q: 'Cos’è il piano Pro?', a: 'Generazioni illimitate, 16+ template premium, esportazione DOCX, nessuna filigrana su PDF, stesura automatica dei follow-up ed elaborazione AI prioritaria. Da €6/mese.' },
  ],
  de: [
    { q: 'Ist AI-Letter wirklich kostenlos?', a: 'Ja — Sie erhalten 5 kostenlose Generierungen pro Monat ohne Kreditkarte. Jede Generierung liefert vollständige Anschreiben, ATS-Scans oder Interview-Fragen.' },
    { q: 'Wie funktioniert der ATS-Lebenslauf-Optimierer?', a: 'Sie laden Ihren Lebenslauf hoch und fügen die Stellenanzeige ein. Die KI prüft die Struktur, findet Keyword-Lücken und schreibt Ihre Erfolge mit messbaren Ergebnissen um, um die Filter zu bestehen.' },
    { q: 'Wie personalisiert sind Anschreiben und Interview-Fragen?', a: 'Absolut maßgeschneidert. AI-Letter analysiert die Fähigkeiten Ihres Profils und gleicht sie mit der Ausschreibung ab. Fragen und STAR-Antworten werden individuell erstellt.' },
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
    step1T: "1. Scan CV & Vacancy", step1D: "Upload your CV and paste the job description. AI-Letter extracts your skills and matches them against requirements.",
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
    bentoSubtitle: "Why use separate tools? AI-Letter covers your application from first search to signed offer.",
    compareTitle: "Why Candidates Choose AI-Letter", oldWay: "The Old Way", newWay: "With AI-Letter Suite",
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
    bentoSubtitle: "Навіщо користуватися різними сервісами? AI-Letter покриває весь шлях від першого пошуку до оферу.",
    compareTitle: "Чому шукачі обирають AI-Letter", oldWay: "Старий спосіб", newWay: "З кабінетом AI-Letter",
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
    bentoSubtitle: "Perché usare strumenti separati? AI-Letter copre l'intero percorso dalla prima ricerca fino all'offerta.",
    compareTitle: "Perché i Candidati Scelgono AI-Letter", oldWay: "Il vecchio modo", newWay: "Con la suite AI-Letter",
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
    cvMakerD: "Crea un curriculum premium da zero o crealo istantaneamente dal testo libero. Modelli pronti per la stampa.",
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
    bentoSubtitle: "Warum separate Tools nutzen? AI-Letter deckt Ihren gesamten Bewerbungsprozess ab.",
    compareTitle: "Warum Kandidaten AI-Letter wählen", oldWay: "Der alte Weg", newWay: "Mit der AI-Letter Suite",
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
      className={`border rounded-xl transition-all duration-200 ${
        open ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-bold text-sm text-slate-900">{q}</span>
        <span className={`shrink-0 ${open ? 'text-indigo-600' : 'text-slate-400'}`}><IconChevron open={open} /></span>
      </button>
      <div className={open ? "px-5 pb-4 text-sm text-slate-600 leading-relaxed block" : "hidden"}>{a}</div>
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
      name: 'AI-Letter',
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
      en: 'AI-Letter — AI Cover Letter Generator & Resume CV Builder',
      uk: 'AI-Letter — Конструктор резюме з ШІ та супровідних листів',
      de: 'AI-Letter — KI-Anschreiben & Lebenslauf Generator',
      it: 'AI-Letter — Generatore di Lettere di Presentazione e CV con IA'
    };

    const metaDescs = {
      en: 'Create tailored cover letters and build professional resumes using AI. Optimize your CV for ATS screening, track applications, and ace interviews.',
      uk: 'Створюйте персоналізовані супровідні листи та професійні резюме за допомогою ШІ. Оптимізуйте CV під ATS, відстежуйте вакансії та готуйтеся до співбесід.',
      de: 'Erstellen Sie maßgeschneiderte Anschreiben und professionelle Lebensläufe mit KI. Optimieren Sie Ihren Lebenslauf für ATS-Systeme, verwalten Sie Bewerbungen.',
      it: 'Crea lettere di presentazione personalizzate e curricula professionali con l\'IA. Ottimizza il tuo CV per i filtri ATS, traccia le candidature e preparati al colloquio.'
    };

    // Title & meta description are managed centrally by PageSEO (react-helmet-async)
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      // Handled by Helmet
    }
  }, [uiLang]);

  const t = k => TRANSLATIONS[uiLang]?.[k] || TRANSLATIONS.en[k] || k;
  const faqs = FAQS[uiLang] || FAQS.en;
  const langPrefix = uiLang && uiLang !== 'en' ? `/${uiLang}` : '';
  const atsPath = `${langPrefix}/ats-resume-checker`;

  const navCopy = {
    en: {
      ats: 'ATS Checker',
      features: 'Features',
      templates: 'Templates',
      pricing: 'Pricing',
      atsCta: 'Free ATS Resume Check',
      noSignupLabel: 'No sign-up tools:',
      tryTool: 'Open tool',
      bottomTitle: 'Ready for your next interview?',
      bottomSub: 'Audit your resume against any job description, fix missing keywords, and draft your cover letter in minutes.',
    },
    uk: {
      ats: 'ATS Чекер',
      features: 'Можливості',
      templates: 'Шаблони',
      pricing: 'Тарифи',
      atsCta: 'Перевірити CV на ATS',
      noSignupLabel: 'Без реєстрації:',
      tryTool: 'Відкрити',
      bottomTitle: 'Готові до наступної співбесіди?',
      bottomSub: 'Перевірте резюме під реальну вакансію, закрийте пропущені ключові слова та згенеруйте супровідний лист за хвилини.',
    },
    de: {
      ats: 'ATS-Check',
      features: 'Funktionen',
      templates: 'Vorlagen',
      pricing: 'Preise',
      atsCta: 'Kostenloser ATS-Check',
      noSignupLabel: 'Ohne Anmeldung:',
      tryTool: 'Öffnen',
      bottomTitle: 'Bereit für Ihr nächstes Gespräch?',
      bottomSub: 'Prüfen Sie Ihren Lebenslauf gegen jede Stellenanzeige, schließen Sie Keyword-Lücken und erstellen Sie ein Anschreiben in Minuten.',
    },
    it: {
      ats: 'Test ATS',
      features: 'Funzioni',
      templates: 'Modelli',
      pricing: 'Prezzi',
      atsCta: 'Test ATS Gratuito',
      noSignupLabel: 'Senza registrazione:',
      tryTool: 'Apri',
      bottomTitle: 'Pronto per il prossimo colloquio?',
      bottomSub: 'Confronta il tuo CV con l’offerta di lavoro, aggiungi le parole chiave mancanti e prepara la tua lettera in pochi minuti.',
    },
  };
  const nc = navCopy[uiLang] || navCopy.en;

  const toolItems = [
    { key: 'letter', icon: FileText, title: t('letterT'), desc: t('letterD'), href: user ? '/dashboard' : '/login' },
    { key: 'cvmaker', icon: Sliders, title: t('cvMakerT'), desc: t('cvMakerD'), href: user ? '/dashboard' : '/login' },
    { key: 'ats', icon: BarChart3, title: t('atsT'), desc: t('atsD'), href: atsPath },
    { key: 'interview', icon: Mic, title: t('interviewT'), desc: t('interviewD'), href: user ? '/dashboard' : '/login' },
    { key: 'tracker', icon: Briefcase, title: t('trackerT'), desc: t('trackerD'), href: user ? '/dashboard' : '/login' },
    { key: 'outreach', icon: Send, title: t('outreachT'), desc: t('outreachD'), href: `${langPrefix}/linkedin-message` },
  ];

  const templateIcons = {
    dev: Code2,
    design: Palette,
    marketing: TrendingUp,
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden antialiased">
      {/* HEADER */}
      <header className="fixed w-full top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-6">
          <Link to={langPrefix || '/'} className="flex items-center gap-2.5 font-black tracking-tight text-slate-900 text-base shrink-0">
            <img src="/android-chrome-192x192.png" alt="AI-Letter" className="w-7 h-7 rounded-lg border border-slate-200" />
            <span>AI-Letter</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <Link to={atsPath} className="hover:text-slate-900 transition-colors">{nc.ats}</Link>
            <a href="#features" className="hover:text-slate-900 transition-colors">{nc.features}</a>
            <a href="#templates" className="hover:text-slate-900 transition-colors">{nc.templates}</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">{nc.pricing}</a>
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <LanguageSwitcher value={uiLang} onChange={setUiLang} variant="light" />
            {user ? (
              <Link
                id="open-app-header-btn"
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                  {user.displayName?.[0]?.toUpperCase() || 'U'}
                </span>
                {t('openApp')}
              </Link>
            ) : (
              <Link
                id="login-header-btn"
                to="/login"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                {t('login')}
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle Menu"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            {mobileMenuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-lg">
            <div className="flex gap-2">
              {['en', 'uk', 'it', 'de'].map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => { setUiLang(lang); setMobileMenuOpen(false); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                    uiLang === lang ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'uk' ? 'UA' : lang.toUpperCase()}
                </button>
              ))}
            </div>
            <Link
              to={atsPath}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-bold"
            >
              {nc.atsCta}
            </Link>
            {user ? (
              <Link
                id="open-app-mobile-btn"
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold uppercase tracking-wider"
              >
                {t('openApp')}
              </Link>
            ) : (
              <Link
                id="login-mobile-btn"
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase tracking-wider"
              >
                {t('login')}
              </Link>
            )}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 bg-grid-light border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
            <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
              <div className="fu fu1 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200/80 bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                {t('badge')}
              </div>

              <h1 className="fu fu2 text-4xl sm:text-5xl lg:text-[54px] font-black leading-[1.08] tracking-tight text-slate-900 mb-5">
                <span className="block">{t('heroTitle1')}</span>
                <span className="text-indigo-600 block">{t('heroTitle2')}</span>
                <span className="block">{t('heroTitle3')}</span>
              </h1>

              <p className="fu fu3 text-slate-600 text-base md:text-lg leading-relaxed mb-7 max-w-lg mx-auto lg:mx-0">
                {t('heroSubtitle')}
              </p>

              <div className="fu fu4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-4">
                <Link
                  id="hero-cta-btn"
                  to={user ? '/dashboard' : '/login'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 active:scale-[0.99] transition-all shadow-sm text-sm"
                >
                  {user ? t('openApp') : t('ctaButton')} <IconRocket />
                </Link>
                <Link
                  to={atsPath}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 font-bold text-slate-800 bg-white border border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all text-sm"
                >
                  <Flame className="w-4 h-4 text-amber-600" />
                  {nc.atsCta}
                </Link>
              </div>

              <p className="fu fu4 text-xs text-slate-500 font-medium mb-5">{t('ctaSubtext')}</p>

              <div className="fu fu5 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">{nc.noSignupLabel}</span>
                <Link to={`${langPrefix}/linkedin-message`} className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition-colors">
                  LinkedIn Note
                </Link>
                <Link to={`${langPrefix}/subject-line`} className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition-colors">
                  Email Subject
                </Link>
                <Link to={`${langPrefix}/freelancer-self-introduction`} className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition-colors">
                  Upwork Pitch
                </Link>
              </div>

              {user && (
                <div className="fu fu5 mt-5 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  {t('welcomeBack')}, {user.displayName?.split(' ')[0] || 'User'}
                </div>
              )}
            </div>

            <div className="fu fu3 w-full lg:flex-1 lg:max-w-[620px]">
              <div className="rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden bg-[#0f172a]" style={{ maxHeight: 420 }}>
                <HeroMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST ASSURANCES */}
      <section className="py-7 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-wrap justify-around items-center gap-6 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{t('assurancePrivacy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{t('assuranceNoCard')}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{t('assuranceA4')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{t('assuranceAts')}</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900 mb-14 tracking-tight">
          {t('howItWorksTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { key: 'step1', num: '01', icon: Zap, title: t('step1T'), desc: t('step1D') },
            { key: 'step2', num: '02', icon: Sliders, title: t('step2T'), desc: t('step2D') },
            { key: 'step3', num: '03', icon: Target, title: t('step3T'), desc: t('step3D') },
          ].map((step) => {
            const StepIcon = step.icon;
            return (
              <div key={step.key} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">{step.num}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE PRODUCT SUITE (single unified feature showcase) */}
      <section id="features" className="py-20 md:py-24 px-4 md:px-6 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              {t('aiTitle')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-2xl mx-auto leading-relaxed">
              {t('aiSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white rounded-3xl p-5 md:p-8 border border-slate-200 shadow-sm">
            <div className="lg:col-span-5 flex flex-col justify-center space-y-2">
              {toolItems.map((item) => {
                const ItemIcon = item.icon;
                const isActive = demoTab === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => handleDemoTabChange(item.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDemoTabChange(item.key); } }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${
                      isActive
                        ? 'bg-slate-50 border-indigo-600 shadow-sm'
                        : 'border-transparent bg-transparent hover:bg-slate-50/70'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                        {isActive && (
                          <Link
                            to={item.href}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 shrink-0"
                          >
                            <span>{nc.tryTool}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-7 flex items-center">
              <div className="w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-[#0b1120]" style={{ height: 420 }}>
                <AiToolsMockup t={t} activeTab={demoTab} onChangeTab={handleDemoTabChange} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEMPLATE LIBRARY */}
      <section id="templates" className="py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">{t('templateLibraryTitle')}</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">{t('templateLibrarySub')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-4 flex flex-col justify-center space-y-2.5">
            {SAMPLE_TEMPLATES.map((tmpl) => {
              const TmplIcon = templateIcons[tmpl.key] || FileText;
              const isActive = activeTemplate === tmpl.key;
              return (
                <button
                  key={tmpl.key}
                  type="button"
                  onClick={() => setActiveTemplate(tmpl.key)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3.5 ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <TmplIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold truncate">{tmpl.title[uiLang] || tmpl.title.en}</h3>
                    <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{tmpl.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 flex flex-col">
            {(() => {
              const current = SAMPLE_TEMPLATES.find(x => x.key === activeTemplate) || SAMPLE_TEMPLATES[0];
              const letterText = current.text[uiLang] || current.text.en;
              return (
                <div className="flex-1 flex flex-col bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                  <div className="bg-slate-900 px-6 py-4 flex items-center justify-between gap-4 text-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-black text-xs uppercase shrink-0">
                        {current.company?.[0] || 'A'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">Template: {current.title[uiLang] || current.title.en}</h4>
                        <p className="text-[11px] text-slate-300 truncate">Ready to customize for {current.company}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUseTemplate(current)}
                      className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] shrink-0"
                    >
                      {t('customizeTemplate')}
                    </button>
                  </div>

                  <div className="p-6 md:p-8 font-serif text-xs md:text-[13px] leading-relaxed text-slate-800 flex-1 whitespace-pre-wrap max-h-[340px] overflow-y-auto">
                    {letterText}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* COMPARISON BLOCK */}
      <section className="py-20 px-4 md:px-6 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-14 tracking-tight">{t('compareTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-5">
              <h3 className="text-base font-extrabold text-slate-500 flex items-center gap-2">
                <X className="w-4 h-4 text-rose-500" strokeWidth={2.5} />
                {t('oldWay')}
              </h3>
              <div className="space-y-4">
                {[t('compare1'), t('compare2'), t('compare3'), t('compare4')].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <IconX />
                    <p className="text-xs text-slate-600 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border-2 border-indigo-600 rounded-3xl p-6 md:p-8 space-y-5 shadow-md shadow-indigo-900/5">
              <h3 className="text-base font-extrabold text-indigo-700 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                {t('newWay')}
              </h3>
              <div className="space-y-4">
                {[t('new1'), t('new2'), t('new3'), t('new4')].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <IconCheck />
                    <p className="text-xs text-slate-900 leading-relaxed font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">{t('pricingTitle')}</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">{t('pricingSub')}</p>

          <div className="inline-flex items-center gap-1 mt-6 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                billingPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('pricingMonthly')}
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t('pricingYearly')}</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {t('pricingSaveText')}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Card 1: Free */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 flex flex-col justify-between shadow-sm">
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-slate-900">{t('pricingFreeName')}</h3>
                <p className="text-slate-500 text-[11px] mt-1 uppercase tracking-wider font-semibold">Start building now</p>
              </div>

              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-900">{t('pricingFreePrice')}</span>
                <span className="text-xs text-slate-500 font-medium">/ {t('pricingFreePeriod')}</span>
              </div>

              <div className="h-px bg-slate-100 my-6" />

              <ul className="space-y-3.5 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <IconCheck /> <span>5 {uiLang === 'uk' ? 'генерацій на місяць' : 'generations per month'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Конструктор резюме (CV Maker)' : 'Resume CV Maker (manual editing)'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Базові шаблони дизайну' : 'Basic templates library'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'ATS аналіз ключових слів' : 'ATS keyword scanner'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Канбан-трекер вакансій' : 'Smart Kanban job tracker'}</span>
                </li>
                <li className="flex items-center gap-2.5 text-emerald-700 font-bold">
                  <IconCheck /> <span>{uiLang === 'uk' ? '+2 додаткові генерації за кожного друга' : '+2 bonus generations per friend invited'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                to={user ? '/dashboard' : '/login'}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                {t('pricingStartBtn')}
              </Link>
            </div>
          </div>

          {/* Card 2: Pro */}
          <div className="bg-white border-2 border-indigo-600 rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-indigo-900/5 relative">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              {t('pricingPopular')}
            </div>

            <div>
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-indigo-600">{t('pricingProName')}</h3>
                <p className="text-slate-500 text-[11px] mt-1 uppercase tracking-wider font-semibold">Full AI Suite Access</p>
              </div>

              <div className="mb-1 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-900">
                  {billingPeriod === 'yearly' ? t('pricingProYearlyPrice') : t('pricingProMonthlyPrice')}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ {t('pricingProPeriod')}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {billingPeriod === 'yearly' ? t('pricingProBillNotice') : (uiLang === 'uk' ? 'Сплачується щомісячно' : 'Billed monthly')}
              </p>

              <div className="h-px bg-slate-100 my-6" />

              <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2.5 font-bold text-slate-900">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Безлімітні генерації ШІ' : 'Unlimited AI letter & CV generations'}</span>
                </li>
                <li className="flex items-center gap-2.5 text-indigo-700 font-bold">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'ШІ Авто-заповнення резюме з тексту' : 'Magic AI CV Generator (from freeform text)'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Режим Executive (PRO)' : 'Executive Mode presets for senior roles'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Преміальні шаблони CV та листів' : 'Premium resume & letter visual templates'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'ШІ супровідні листи нагадування (Follow-up)' : 'Auto-scheduled Follow-up drafts'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Експорт без водяних знаків' : 'High-definition export without watermarks'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <IconCheck /> <span>{uiLang === 'uk' ? 'Пріоритетний доступ до ШІ' : 'Priority access & advanced models'}</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                to={user ? '/dashboard' : '/login'}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>{t('pricingUpgradeBtn')}</span>
              </Link>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{uiLang === 'uk' ? 'Скасування в 1 клік будь-коли · Захищена оплата Stripe' : 'Cancel anytime in 1 click · Secure Stripe checkout'}</span>
        </p>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 md:px-6 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-10 tracking-tight">{t('faqTitle')}</h2>
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
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 text-center shadow-xl">
            <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight">{nc.bottomTitle}</h2>
            <p className="text-slate-300 mb-7 text-sm leading-relaxed max-w-lg mx-auto">
              {nc.bottomSub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                id="bottom-cta-btn"
                to={user ? '/dashboard' : '/login'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-all text-sm"
              >
                {user ? t('openApp') : t('ctaButton')} <IconRocket />
              </Link>
              <Link
                to={atsPath}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 font-bold text-white bg-white/10 border border-white/15 rounded-xl hover:bg-white/15 transition-all text-sm"
              >
                {nc.atsCta}
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-5">{t('ctaSubtext')}</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 pt-10 pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-2 font-black tracking-tight text-slate-900 text-base">
              <img src="/android-chrome-192x192.png" alt="AI-Letter" className="w-7 h-7 rounded-lg border border-slate-200" />
              AI-Letter
            </div>
            <p className="text-slate-500 text-xs">{t('footerDesc')}</p>
            <div className="flex items-center gap-5 text-xs text-slate-600">
              <Link to="/linkedin-message" className="hover:text-slate-900 transition-colors">LinkedIn Tool</Link>
              <Link to="/subject-line" className="hover:text-slate-900 transition-colors">Subject Lines</Link>
              <a href="mailto:support@ailetter.pro" className="hover:text-slate-900 transition-colors">support@ailetter.pro</a>
              <a href="https://www.producthunt.com/products/ailetter-2/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-ailetter&#0045;2" target="_blank" rel="noopener noreferrer">
                <img src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1173518&theme=light" alt="AI-Letter on Product Hunt" style={{ width: '120px', height: '26px' }} width="120" height="26" />
              </a>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>© 2026 AI-Letter. All rights reserved.</span>
            <div className="flex flex-wrap justify-end gap-x-5 gap-y-2">
              <Link to="/terms" className="hover:text-slate-900 transition-colors">{t('terms')}</Link>
              <Link to="/privacy" className="hover:text-slate-900 transition-colors">{t('privacy')}</Link>
              <Link to="/ats-resume-checker" className="text-amber-700 hover:text-amber-900 transition-colors font-semibold">{uiLang === 'uk' ? 'ATS Чекер' : 'ATS Resume Checker'}</Link>
              <Link to="/linkedin-message" className="text-indigo-600 hover:text-indigo-800 transition-colors">{t('linkedinGen')}</Link>
              <Link to="/subject-line" className="text-indigo-600 hover:text-indigo-800 transition-colors">Subject Line</Link>
              <Link to="/cover-letter-ai-developer" className="text-indigo-600 hover:text-indigo-800 transition-colors">{uiLang === 'uk' ? 'Супровідний лист (AI)' : 'AI Developer Cover Letter'}</Link>
              <Link to="/linkedin-cold-message-templates" className="text-indigo-600 hover:text-indigo-800 transition-colors">{uiLang === 'uk' ? 'Шаблони LinkedIn' : 'LinkedIn Cold Messages'}</Link>
              <Link to="/freelancer-self-introduction" className="text-indigo-600 hover:text-indigo-800 transition-colors">{uiLang === 'uk' ? 'Фріланс Proposal' : 'Freelancer Pitch'}</Link>
              <Link to="/cover-letter-project-manager" className="text-indigo-600 hover:text-indigo-800 transition-colors">{uiLang === 'uk' ? 'Лист Project Manager' : 'Project Manager'}</Link>
              <Link to="/cover-letter-product-manager" className="text-indigo-600 hover:text-indigo-800 transition-colors">{uiLang === 'uk' ? 'Лист Product Manager' : 'Product Manager'}</Link>
              <Link to="/cover-letter-qa-engineer" className="text-indigo-600 hover:text-indigo-800 transition-colors">{uiLang === 'uk' ? 'Лист QA Engineer' : 'QA Engineer'}</Link>
              <Link to="/cover-letter-frontend-developer" className="text-indigo-600 hover:text-indigo-800 transition-colors">{uiLang === 'uk' ? 'Лист Frontend Dev' : 'Frontend Developer'}</Link>
              <Link to="/cover-letter-data-analyst" className="text-indigo-600 hover:text-indigo-800 transition-colors">{uiLang === 'uk' ? 'Лист Data Analyst' : 'Data Analyst'}</Link>
              <Link to="/uk" className="hover:text-slate-900 transition-colors text-slate-600 font-semibold">UA</Link>
              <Link to="/de" className="hover:text-slate-900 transition-colors text-slate-600 font-semibold">DE</Link>
              <Link to="/it" className="hover:text-slate-900 transition-colors text-slate-600 font-semibold">IT</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;