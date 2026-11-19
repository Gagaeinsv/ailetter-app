/**
 * prerender.js
 *
 * After `vite build`, this script reads dist/index.html and generates
 * static HTML for all 46 public routes (11 localized routes × 4 languages:
 * en, uk, de, it + /terms and /privacy):
 * - Correct <html lang="..."> per language edition.
 * - Clean, deduplicated <title>, <meta name="description">, <link rel="canonical">,
 *   <link rel="alternate" hreflang="...">, LLM discovery link (/llms.txt),
 *   og:*, twitter:* tags marked with data-rh="true".
 * - Static @graph JSON-LD (Organization + SoftwareApplication/WebApplication +
 *   localized FAQPage) in <head> for Google AI Overviews and AI search engines.
 * - Pre-rendered semantic HTML + Answer-First Q&A sections inside <div id="root">
 *   so Googlebot, OAI-SearchBot, PerplexityBot, and Gemini read full content
 *   without executing JavaScript.
 * - Both dist/<route>/index.html and dist/<route>.html for Vercel & Firebase Hosting.
 * - Auto-generated public/sitemap.xml and dist/sitemap.xml listing all 46 URLs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import translations from '../src/locales/translations.js';
import { SEO_ROLE_PAGES, SUPPORTED_SEO_LANGS } from '../src/constants/seoRolePages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const PUBLIC = path.resolve(__dirname, '../public');
const BASE_URL = 'https://ailetter.pro';
const OG_IMAGE = `${BASE_URL}/android-chrome-512x512.png`;
const TODAY = new Date().toISOString().slice(0, 10);

const FEATURE_LIST = [
  'AI Cover Letter Generator with 16+ visual templates',
  '10-Section Interactive CV & Resume Builder with A4 PDF & DOCX export',
  'ATS CV Optimizer & Missing Keyword Scanner',
  '8-Question STAR Interview Preparation Coach',
  'Kanban Job Application Tracker with Follow-Up Reminders',
  'Free No-Signup LinkedIn, Email Subject Line, and Pitch Generators',
];

const HOME_COPY = {
  en: {
    h1: 'Tailor Your CV & Cover Letter in Under 60 Seconds with AI-Letter',
    sections: [
      {
        h2: 'Complete AI Job Search Suite',
        items: [
          'Tailored Cover Letters: Generate high-converting cover letters in 30 seconds across 16+ professional visual templates.',
          'AI Resume & CV Maker: Build a print-ready A4 resume from scratch or generate it from freeform text in English, Ukrainian, German, or Italian.',
          'ATS CV Optimizer & Keyword Scanner: Upload your CV, paste the job description, uncover missing keyword gaps, and rewrite bullet points with measurable impact.',
          'STAR Interview Preparation: Generate 8 role-specific interview questions and model answers tailored to your resume and target vacancy.',
          'Smart Kanban Job Tracker: Organize job applications (Applied, Interview, Offer, Rejected) with automated follow-up reminders.',
        ],
      },
    ],
  },
  uk: {
    h1: 'Адаптуй резюме та супровідний лист менш ніж за 60 секунд з AI-Letter',
    sections: [
      {
        h2: 'Повний набір ШІ-інструментів для пошуку роботи',
        items: [
          'Персоналізовані супровідні листи: генерація високоефективних листів за 30 секунд у 16+ візуальних шаблонах.',
          'Конструктор резюме з ШІ (CV Maker): створення професійного резюме формату A4 з нуля або з тексту українською, англійською, німецькою та італійською мовами.',
          'ATS Оптимізатор резюме: перевірка збігу ключових слів під вакансію та покращення досягнень із метриками.',
          'Підготовка до співбесіди за методом STAR: 8 персональних запитань та ідеальних відповідей під конкретну вакансію.',
          'Розумний Kanban-трекер вакансій з автоматичними нагадуваннями про follow-up.',
        ],
      },
    ],
  },
  de: {
    h1: 'Lebenslauf & Anschreiben in unter 60 Sekunden anpassen mit AI-Letter',
    sections: [
      {
        h2: 'Komplette KI-Bewerbungssuite',
        items: [
          'Maßgeschneiderte Anschreiben: In 30 Sekunden mit 16+ professionellen Design-Vorlagen.',
          'KI-Lebenslauf-Builder (CV Maker): Druckfertige A4-Lebensläufe auf Deutsch, Englisch, Ukrainisch oder Italienisch.',
          'ATS-Lebenslauf-Optimierer: Keyword-Analyse und gezielte Optimierung Ihrer Erfolge für Bewerbersysteme.',
          'STAR-Interview-Vorbereitung: 8 maßgeschneiderte Fragen und Antworten passend zur Stellenanzeige.',
          'Bewerbungs-Tracker mit automatischen Follow-up-Erinnerungen.',
        ],
      },
    ],
  },
  it: {
    h1: 'Adatta CV e Lettera di Presentazione in meno di 60 secondi con AI-Letter',
    sections: [
      {
        h2: 'Suite AI Completa per la Ricerca di Lavoro',
        items: [
          'Lettere di Presentazione su Misura: pronte in 30 secondi con oltre 16 modelli professionali.',
          'Costruttore di CV con IA: crea un curriculum A4 pronto per la stampa in Italiano, Inglese, Tedesco o Ucraino.',
          'Ottimizzatore CV per ATS: verifica le parole chiave mancanti e migliora i risultati del tuo profilo.',
          'Preparazione Colloquio STAR: 8 domande e risposte personalizzate in base all\'offerta di lavoro.',
          'Tracker Candidature Kanban con promemoria automatici per i follow-up.',
        ],
      },
    ],
  },
};

const FAQ_HEADINGS = {
  en: 'Frequently Asked Questions',
  uk: 'Часті запитання та прямі відповіді',
  de: 'Häufig gestellte Fragen',
  it: 'Domande Frequenti',
};

const HOME_FAQS = {
  en: [
    {
      q: 'What is AI-Letter and how much does it cost?',
      a: 'AI-Letter is an all-in-one AI cover letter generator, 10-section resume builder, ATS keyword optimizer, STAR interview coach, and Kanban job tracker. You can start free with 5 monthly generations (no credit card required) and earn +2 bonus generations per referral, or upgrade to Pro from €3.25/month billed annually.',
    },
    {
      q: 'How does the AI-Letter ATS Resume Optimizer work?',
      a: 'Upload your PDF CV and paste the target job description. AI-Letter audits formatting, structure, and keyword overlap, highlights missing hard skills, calculates an ATS match score from 0 to 100, and rewrites bullet points with measurable metrics so your resume passes automated recruiter screening.',
    },
    {
      q: 'Which languages and export formats does AI-Letter support?',
      a: 'AI-Letter supports English, Ukrainian, German, and Italian interfaces and document generation. Resumes and tailored cover letters export as print-ready A4 PDF and editable DOCX files across 16+ visual templates without layout overlap.',
    },
  ],
  uk: [
    {
      q: 'Що таке AI-Letter і скільки він коштує?',
      a: 'AI-Letter — це ШІ-кабінет для пошуку роботи, який поєднує генератор супровідних листів, конструктор резюме на 10 секцій, ATS-аудитор, підготовку до інтерв’ю за методом STAR та Kanban-трекер вакансій. Безкоштовний план дає 5 генерацій щомісяця без картки (+2 за друга), а Pro-підписка коштує від €3.25/місяць.',
    },
    {
      q: 'Як працює перевірка резюме на ATS в AI-Letter?',
      a: 'Ви завантажуєте PDF-резюме та вставляєте текст вакансії. Алгоритм аналізує збіг ключових слів, виявляє пропущені технічні вимоги, оцінює структуру від 0 до 100 балів та переписує досягнення з кількісними метриками, щоб CV успішно пройшло автоматичні фільтри рекрутерів.',
    },
    {
      q: 'Які мови та формати експорту підтримує AI-Letter?',
      a: 'Сервіс повністю працює українською, англійською, німецькою та італійською мовами. Готові резюме та супровідні листи можна експортувати у стандартний формат A4 PDF або DOCX у більш ніж 16 візуальних шаблонах без спотворення верстки.',
    },
  ],
  de: [
    {
      q: 'Was ist AI-Letter und was kostet die Nutzung?',
      a: 'AI-Letter ist eine KI-Bewerbungsplattform mit Anschreiben-Generator, 10-teiligem Lebenslauf-Builder, ATS-Keyword-Scanner, STAR-Interview-Coach und Kanban-Job-Tracker. Im kostenlosen Tarif erhalten Sie 5 Generierungen pro Monat ohne Kreditkarte; Pro startet ab 3,25 € monatlich bei jährlicher Zahlung.',
    },
    {
      q: 'Wie funktioniert der ATS-Lebenslauf-Optimierer?',
      a: 'Laden Sie Ihren PDF-Lebenslauf hoch und fügen Sie die Stellenanzeige ein. AI-Letter berechnet einen ATS-Match-Score von 0 bis 100, erkennt fehlende Fachbegriffe und formuliert Ihre Erfolge mit messbaren Kennzahlen neu, um automatische Bewerbermanagementsysteme zu bestehen.',
    },
    {
      q: 'Welche Sprachen und Exportformate werden unterstützt?',
      a: 'AI-Letter unterstützt Deutsch, Englisch, Ukrainisch und Italienisch. Alle Lebensläufe und Anschreiben lassen sich in über 16 professionellen Design-Vorlagen als druckfertiges A4-PDF sowie als DOCX-Datei exportieren.',
    },
  ],
  it: [
    {
      q: 'Cos’è AI-Letter e quanto costa?',
      a: 'AI-Letter è una suite AI per la ricerca di lavoro con generatore di lettere di presentazione, CV maker a 10 sezioni, ottimizzatore ATS, preparazione colloqui STAR e tracker Kanban. Il piano gratuito include 5 generazioni al mese senza carta di credito; il piano Pro parte da 3,25 €/mese.',
    },
    {
      q: 'Come funziona l’ottimizzatore CV per filtri ATS?',
      a: 'Carichi il tuo CV in PDF e incolli l’offerta di lavoro: AI-Letter assegna un punteggio ATS da 0 a 100, individua le parole chiave mancanti e riscrive i punti elenco con metriche quantitative per superare i filtri automatici dei recruiter.',
    },
    {
      q: 'Quali lingue e formati di esportazione sono supportati?',
      a: 'AI-Letter supporta Italiano, Inglese, Ucraino e Tedesco. Curriculum e lettere possono essere esportati in PDF formato A4 pronto per la stampa e in formato DOCX scegliendo tra oltre 16 modelli visivi.',
    },
  ],
};

const TOOL_FAQS = {
  '/linkedin-message': {
    en: [
      {
        q: 'How long should a LinkedIn Easy Apply message be?',
        a: 'A high-converting LinkedIn recruiter note or Easy Apply message should stay under 300 characters or 3–4 crisp sentences: reference the exact role, name one measurable achievement matching the job description, and close with a polite call to action.',
      },
      {
        q: 'Is the AI-Letter LinkedIn Message Generator free without sign-up?',
        a: 'Yes. You can paste any job description, optionally enter your name and job title, and generate a tailored LinkedIn message immediately for free with no account required.',
      },
      {
        q: 'Can I generate LinkedIn recruiter notes in other languages?',
        a: 'Yes. Switch between English, Ukrainian, German, and Italian at any time to generate localized LinkedIn outreach notes tailored to European, Ukrainian, or international hiring managers.',
      },
    ],
    uk: [
      {
        q: 'Якою має бути оптимальна довжина повідомлення для LinkedIn Easy Apply?',
        a: 'Ефективне повідомлення рекрутеру в LinkedIn має містити до 300 символів (2–4 речення): вкажіть назву посади, одне конкретне досягнення з цифрами під вимоги вакансії та короткий заклик до спілкування.',
      },
      {
        q: 'Чи працює LinkedIn генератор без реєстрації та оплати?',
        a: 'Так, інструмент працює миттєво без створення акаунту та кредитної картки: просто вставте опис вакансії і за кілька секунд отримайте готовий текст для відправки рекрутеру.',
      },
      {
        q: 'Якими мовами можна згенерувати повідомлення для рекрутера?',
        a: 'Підтримуються українська, англійська, німецька та італійська мови — зручно для подачі як в українські IT-компанії, так і на міжнародні чи європейські вакансії.',
      },
    ],
    de: [
      {
        q: 'Wie lang sollte eine LinkedIn Easy Apply Nachricht sein?',
        a: 'Eine wirkungsvolle LinkedIn-Nachricht an Recruiter umfasst maximal 300 Zeichen in zwei bis drei Sätzen: Nennen Sie die konkrete Position, einen messbaren Erfolg passend zur Stelle und schließen Sie mit einem höflichen Gesprächsimpuls.',
      },
      {
        q: 'Ist der LinkedIn-Nachrichtengenerator ohne Anmeldung kostenlos?',
        a: 'Ja, das Tool steht kostenlos und ohne Registrierung bereit. Fügen Sie einfach die Stellenbeschreibung ein und kopieren Sie die generierte Nachricht direkt in LinkedIn.',
      },
      {
        q: 'Welche Sprachen werden für LinkedIn-Nachrichten unterstützt?',
        a: 'Sie können Bewerbungsnachrichten auf Deutsch, Englisch, Ukrainisch und Italienisch erstellen.',
      },
    ],
    it: [
      {
        q: 'Quanto deve essere lungo un messaggio LinkedIn Easy Apply?',
        a: 'Un messaggio efficace su LinkedIn resta sotto i 300 caratteri (2–3 frasi): cita il ruolo specifico, un risultato misurabile pertinente all’annuncio e un breve invito al confronto.',
      },
      {
        q: 'Il generatore di messaggi LinkedIn è gratuito senza registrazione?',
        a: 'Sì, puoi incollare qualsiasi descrizione di lavoro e generare gratuitamente il messaggio personalizzato senza creare un account.',
      },
      {
        q: 'In quali lingue posso generare il messaggio per i recruiter?',
        a: 'Il tool supporta Italiano, Inglese, Tedesco e Ucraino.',
      },
    ],
  },
  '/subject-line': {
    en: [
      {
        q: 'What makes a good email subject line for a job application?',
        a: 'A strong job application subject line stays under 60 characters and clearly states the role title, your name, and one differentiator (such as years of experience or a core credential) so hiring managers immediately know why to open your email.',
      },
      {
        q: 'How many subject line variations does AI-Letter generate?',
        a: 'In a single click without signing up, AI-Letter creates three distinct variations tailored to the vacancy: Formal (for enterprise roles), Direct (metrics and title upfront), and Creative (for startups and product teams).',
      },
      {
        q: 'Can I generate the full cover letter alongside the subject line?',
        a: 'Yes. Once you pick a subject line, click Open AI-Letter to upload your CV and generate the full matching cover letter and ATS score check in under 60 seconds.',
      },
    ],
    uk: [
      {
        q: 'Яка тема електронного листа для відгуку на вакансію працює найкраще?',
        a: 'Найкраща тема листа містить до 60 символів і чітко вказує назву вакансії, ваше ім’я та ключову перевагу (досвід у роках або профільну спеціалізацію), щоб рекрутер відкрив лист серед десятків інших.',
      },
      {
        q: 'Скільки варіантів теми генерує AI-Letter без реєстрації?',
        a: 'За один клік без входу в акаунт ви отримуєте 3 стилі на вибір: офіційний (Formal) для корпорацій, прямий (Direct) з акцентом на досвід та креативний (Creative) для стартапів.',
      },
      {
        q: 'Чи можна одразу створити повний супровідний лист до цієї теми?',
        a: 'Так, ви можете перейти в AI-Letter, завантажити PDF-резюме та за 30 секунд згенерувати повний персоналізований лист і перевірити ATS-відповідність.',
      },
    ],
    de: [
      {
        q: 'Wie sieht eine optimale E-Mail-Betreffzeile für Bewerbungen aus?',
        a: 'Eine überzeugende Betreffzeile bleibt unter 60 Zeichen und kombiniert die exakte Stellenbezeichnung, Ihren Namen und ein klares Qualifikationsmerkmal.',
      },
      {
        q: 'Wie viele Varianten erstellt der Betreffzeilen-Generator?',
        a: 'Kostenlos und ohne Anmeldung erhalten Sie drei Varianten passend zur Stelle: Formell, Direkt und Kreativ.',
      },
      {
        q: 'Kann ich dazu auch das komplette Anschreiben erstellen?',
        a: 'Ja, im AI-Letter Dashboard erstellen Sie anhand Ihres Lebenslaufs in unter einer Minute das vollständige Anschreiben samt ATS-Check.',
      },
    ],
    it: [
      {
        q: 'Come scrivere un oggetto email efficace per una candidatura?',
        a: 'Un buon oggetto resta sotto i 60 caratteri e indica chiaramente il titolo della posizione, il tuo nome e un elemento distintivo come gli anni di esperienza.',
      },
      {
        q: 'Quante varianti genera lo strumento senza registrazione?',
        a: 'Genera gratuitamente tre opzioni su misura per l’annuncio: Formale, Diretto e Creativo.',
      },
      {
        q: 'Posso creare anche la lettera di presentazione completa?',
        a: 'Sì, aprendo AI-Letter puoi caricare il CV e ottenere la lettera completa e l’analisi ATS in meno di 60 secondi.',
      },
    ],
  },
  '/cover-letter-ai-developer': {
    en: [
      {
        q: 'What should an AI Developer include in a cover letter?',
        a: 'Focus on concrete frameworks and production outcomes rather than generic passion for AI: cite PyTorch, JAX, Hugging Face, RAG architectures, vector databases (Qdrant, Pinecone), and measurable gains such as API latency or accuracy improvements.',
      },
      {
        q: 'How do I avoid weak clichés in an AI Engineer cover letter?',
        a: 'Skip openers like "I am writing to apply" or "passionate about AI". Start immediately with a production system you built, an optimization metric (e.g. 35% lower inference cost), or an architectural challenge relevant to the hiring company.',
      },
      {
        q: 'How does the AI-Letter AI Developer Hook Generator work?',
        a: 'Enter your core AI/ML skills, years of experience, and the target job description to generate two ready-to-use opening hooks (metric-driven and technical) for free without registering.',
      },
    ],
    uk: [
      {
        q: 'Що обов’язково вказати в супровідному листі AI / ML розробнику?',
        a: 'Замість загальних фраз про інтерес до ШІ вкажіть реальний продакшн-стек (PyTorch, Hugging Face, LangChain, RAG, векторні БД Pinecone або Qdrant) та вимірні метрики: зниження затримки інференсу, економію витрат на API або точність моделі.',
      },
      {
        q: 'Як уникнути шаблонних фраз у Cover Letter для AI Engineer?',
        a: 'Не починайте зі слів «Я пишу, щоб податися...». Почніть одразу з конкретного інженерного кейсу — побудованої RAG-системи, оптимізації GPU-інференсу через Triton/TensorRT або досвіду fine-tuning LLM.',
      },
      {
        q: 'Як працює безкоштовний генератор вступів для AI Developer?',
        a: 'Введіть ваші AI/ML навички, досвід та текст вакансії — сервіс без реєстрації створить 2 сильні вступні абзаци (метричний та технічний), адаптовані під вимоги компанії.',
      },
    ],
    de: [
      {
        q: 'Was gehört in ein Anschreiben für AI & ML Developer?',
        a: 'Nennen Sie konkrete Technologien wie PyTorch, Hugging Face, LangChain, RAG-Pipelines und Vektordatenbanken (Qdrant, Pinecone) sowie messbare Ergebnisse wie geringere Inferenz-Latenzen oder API-Kostensenkungen.',
      },
      {
        q: 'Welche Einstiege sollten KI-Entwickler vermeiden?',
        a: 'Vermeiden Sie Standardfloskeln wie „Hiermit bewerbe ich mich“. Starten Sie direkt mit einem produktiven ML-System, MLOps-Skalierung oder einem konkreten Effizienzgewinn.',
      },
      {
        q: 'Kann ich Einleitungen kostenlos ohne Anmeldung generieren?',
        a: 'Ja, der AI-Developer-Generator erstellt direkt aus Ihren Skills und der Stellenanzeige zwei maßgeschneiderte Einstiege ohne Registrierung.',
      },
    ],
    it: [
      {
        q: 'Cosa includere in una lettera di presentazione per AI Developer?',
        a: 'Evidenzia tecnologie concrete come PyTorch, Hugging Face, LangChain, sistemi RAG e database vettoriali insieme a metriche reali su latenza, accuratezza o riduzione dei costi API.',
      },
      {
        q: 'Come evitare frasi banali nella candidatura AI/ML?',
        a: 'Evita aperture generiche sulla passione per l’intelligenza artificiale e inizia subito con un progetto MLOps o un sistema RAG portato in produzione.',
      },
      {
        q: 'Il generatore di aperture per AI Developer è gratuito?',
        a: 'Sì, genera due paragrafi introduttivi personalizzati senza bisogno di registrarsi.',
      },
    ],
  },
  '/linkedin-cold-message-templates': {
    en: [
      {
        q: 'When should job seekers send a LinkedIn cold message to a recruiter?',
        a: 'Send a short cold message right after applying for an open role, when requesting an employee referral, or when asking a hiring manager for a 10-minute informational chat. Keeping the note specific to the team increases reply rates significantly.',
      },
      {
        q: 'What types of LinkedIn cold message templates are included?',
        a: 'AI-Letter provides three proven frameworks — Direct Job Application, Networking / Informational Chat, and Referral Request — plus an AI customizer that adapts the tone (Warm, Professional, or Short) to your target company.',
      },
      {
        q: 'Is the LinkedIn Cold Message Generator free to use?',
        a: 'Yes, you can pick any template, fill in your role and target company, and generate a personalized cold outreach message without creating an account.',
      },
    ],
    uk: [
      {
        q: 'Коли варто писати холодне повідомлення рекрутеру в LinkedIn?',
        a: 'Найкращий час — одразу після подачі резюме на відкриту вакансію, при запиті на реферальну рекомендацію від співробітника компанії або для короткого нетворкінгу з тимлідом команди.',
      },
      {
        q: 'Які шаблони холодних повідомлень доступні в AI-Letter?',
        a: 'Доступні 3 готові сценарії (прямий відгук, нетворкінг та запит на реферал) з миттєвою ШІ-персоналізацією під компанію, посаду та обраний тон спілкування.',
      },
      {
        q: 'Чи потрібен платний тариф для генерації повідомлень у LinkedIn?',
        a: 'Ні, сторінка шаблонів і ШІ-генератор холодних повідомлень працюють повністю безкоштовно та без реєстрації.',
      },
    ],
    de: [
      {
        q: 'Wann lohnt sich eine LinkedIn Cold Message an Recruiter?',
        a: 'Direkt nach dem Absenden einer Bewerbung, für eine gezielte Referral-Anfrage bei Mitarbeitenden oder für ein kurzes Kennenlerngespräch mit dem Fachbereich.',
      },
      {
        q: 'Welche Vorlagen bietet der LinkedIn Cold Message Generator?',
        a: 'Sie erhalten drei erprobte Vorlagen (Direkte Bewerbung, Networking, Empfehlungsanfrage) inklusive KI-Anpassung an Unternehmen und Tonfall.',
      },
      {
        q: 'Ist der Generator ohne Anmeldung nutzbar?',
        a: 'Ja, Sie können sofort Nachrichten kostenlos erstellen und kopieren.',
      },
    ],
    it: [
      {
        q: 'Quando inviare un messaggio a freddo su LinkedIn a un recruiter?',
        a: 'Subito dopo aver inviato una candidatura, per richiedere una referenza interna o per proporre una breve chiacchierata conoscitiva al responsabile del team.',
      },
      {
        q: 'Quali modelli di messaggi include AI-Letter?',
        a: 'Include tre modelli pronti (Candidatura Diretta, Networking e Richiesta Referral) personalizzabili istantaneamente tramite IA.',
      },
      {
        q: 'È gratuito e utilizzabile senza registrazione?',
        a: 'Sì, puoi personalizzare e copiare i messaggi gratuitamente senza creare un account.',
      },
    ],
  },
  '/freelancer-self-introduction': {
    en: [
      {
        q: 'How should a freelancer start a self-introduction proposal on Upwork?',
        a: 'Open with the client’s problem rather than your biography. Replace generic introductions with one sentence showing you read their brief, a concise 2–3 step action plan, and one metric-backed Proof of Work example from a similar project.',
      },
      {
        q: 'What makes a cold freelance pitch convert better?',
        a: 'Clients scan the first two lines in seconds. Highlighting specific deliverables, relevant niche experience, and a single smart clarifying question sets your proposal apart from copy-paste bids.',
      },
      {
        q: 'Can I generate custom Upwork and client proposals for free?',
        a: 'Yes. Enter your niche, years of experience, and the client project brief to generate a tailored freelance proposal immediately without signing up.',
      },
    ],
    uk: [
      {
        q: 'З чого почати самопрезентацію фрілансера на Upwork чи прямому клієнту?',
        a: 'Почніть із завдання клієнта, а не зі своєї біографії. У перших двох реченнях покажіть розуміння проблеми проєкту, запропонуйте короткий план дій і додайте релевантний кейс із вимірним результатом.',
      },
      {
        q: 'Що робить фріланс-пропозицію (Proposal) найбільш конверсійною?',
        a: 'Конкретний Proof of Work (посилання чи цифри минулих проєктів) та 1–2 влучні уточнюючі запитання по брифу клієнта — це миттєво виділяє вас серед шаблонних відгуків.',
      },
      {
        q: 'Чи можна згенерувати персоналізований Upwork-пітч безкоштовно?',
        a: 'Так, вкажіть вашу спеціалізацію, досвід та опис проєкту замовника, і AI-Letter без реєстрації згенерує готовий супровідний лист для фрілансу.',
      },
    ],
    de: [
      {
        q: 'Wie beginnt man eine überzeugende Freelancer-Vorstellung auf Upwork?',
        a: 'Beginnen Sie mit dem konkreten Problem des Kunden statt mit Ihrem Lebenslauf: Zeigen Sie Projektverständnis in den ersten zwei Sätzen, skizzieren Sie einen Umsetzungsplan und nennen Sie ein passendes Referenzprojekt.',
      },
      {
        q: 'Was erhöht die Antwortquote bei Freelance-Pitches?',
        a: 'Messbare Projekterfolge (Proof of Work) und ein bis zwei präzise Rückfragen zum Briefing heben Ihr Angebot sofort von Standardtexten ab.',
      },
      {
        q: 'Ist der Freelancer-Angebotsgenerator kostenlos?',
        a: 'Ja, Sie können ohne Anmeldung direkt maßgeschneiderte Pitches erstellen.',
      },
    ],
    it: [
      {
        q: 'Come iniziare una presentazione freelance efficace su Upwork?',
        a: 'Parti dal problema del cliente e non dalla tua biografia: nelle prime due frasi dimostra di aver letto il brief, proponi un piano d’azione sintetico e cita un risultato misurabile.',
      },
      {
        q: 'Cosa rende più efficace una proposta per clienti freelance?',
        a: 'Includere prove concrete (Proof of Work) e una o due domande mirate sul progetto distingue subito la tua candidatura.',
      },
      {
        q: 'Il generatore di proposte freelance è gratuito?',
        a: 'Sì, genera proposte su misura gratuitamente senza registrazione.',
      },
    ],
  },
  '/ats-resume-checker': {
    en: [
      {
        q: 'Is the AI-Letter ATS Resume Checker free without sign-up?',
        a: 'Yes. You can upload your PDF resume or paste your CV text against any job description for free with no registration required, and receive an ATS match score (0–100) plus missing keywords or a 6-second recruiter roast.',
      },
      {
        q: 'What is the Brutal 6-Second Recruiter Roast mode?',
        a: 'Roast mode evaluates your CV from the perspective of a senior technical recruiter skimming for 6 seconds: it flags clichés, weak duty lists, and missing metrics, and creates a shareable PNG score card.',
      },
      {
        q: 'Does the ATS optimizer invent fake metrics or numbers?',
        a: 'No. Whenever your resume lacks quantitative results, AI-Letter inserts honest bracketed placeholders like [X%] so you fill in your real numbers without fabricating data.',
      },
    ],
    uk: [
      {
        q: 'Чи безкоштовна перевірка резюме на ATS без реєстрації?',
        a: 'Так. Ви можете завантажити PDF або вставити текст резюме та одразу отримати оцінку ATS (0–100), список пропущених ключових слів або чесний 6-секундний розбір від рекрутера без входу в акаунт.',
      },
      {
        q: 'Що таке режим «Прожарка резюме (CV Roast)»?',
        a: 'Це оцінка вашого CV очима сеньйор-рекрутера за перші 6 секунд: система вказує на слабкі формулювання, брак цифр і формує готову PNG-картку з результатом.',
      },
      {
        q: 'Чи вигадує ШІ фейкові відсотки в прикладах покращення?',
        a: 'Ні. Якщо в резюме бракує вимірних результатів, оптимізатор ставить чесні підказки [X%], щоб ви вписали лише свої реальні досягнення.',
      },
    ],
    de: [
      {
        q: 'Ist der ATS-Lebenslauf-Check ohne Anmeldung kostenlos?',
        a: 'Ja. Laden Sie Ihren PDF-Lebenslauf hoch oder fügen Sie Text ein und erhalten Sie sofort Ihren ATS-Score (0–100), fehlende Keywords oder den 6-Sekunden-Recruiter-Roast ohne Registrierung.',
      },
      {
        q: 'Was bietet der Brutal 6-Second Recruiter Roast?',
        a: 'Der Roast-Modus bewertet Ihren Lebenslauf aus Sicht eines erfahrenen Tech-Recruiters in 6 Sekunden, deckt Floskeln auf und erstellt eine teilbare PNG-Score-Card.',
      },
      {
        q: 'Erfindet der ATS-Checker falsche Kennzahlen?',
        a: 'Nein. Fehlende Zahlen werden transparent mit Platzhaltern wie [X%] markiert.',
      },
    ],
    it: [
      {
        q: 'La verifica CV ATS è gratuita senza registrazione?',
        a: 'Sì. Carica il tuo CV in PDF o incolla il testo per ottenere gratuitamente il punteggio ATS (0–100), le parole chiave mancanti o il giudizio recruiter in 6 secondi senza registrarti.',
      },
      {
        q: 'Cos’è la modalità Recruiter Roast in 6 secondi?',
        a: 'Simula la lettura rapida di un recruiter senior in 6 secondi, segnalando punti deboli, frasi generiche e mancanza di metriche con scheda PNG scaricabile.',
      },
      {
        q: 'L’IA inventa numeri falsi durante l’ottimizzazione?',
        a: 'Mai: usa segnaposto [X%] dove mancano dati reali per garantire la massima trasparenza.',
      },
    ],
  },
};

const ATS_CHECKER_PRERENDER = {
  en: {
    title: 'Free ATS Resume Checker & Recruiter CV Roast | AI-Letter',
    description: 'Scan your PDF resume against any job description for free. Get an instant ATS score (0–100), missing keywords, or a 6-second recruiter roast.',
    h1: 'Free ATS Resume Checker & Brutal 6-Second CV Roast',
    lead: 'Upload your PDF CV or paste text to check ATS keyword match (0–100), uncover missing hard skills, or get a candid 6-second recruiter critique with a shareable score card.',
    h2: 'What the Free ATS Checker Evaluates',
    items: [
      'ATS Keyword Overlap: detects matched and missing hard skills directly against the target job description.',
      'Impact & Metrics Audit: flags vague duties and shows concrete bullet rewrites without fabricating numbers.',
      '6-Second Recruiter Roast Mode: honest feedback on clarity, formatting, and quick wins with PNG card export.',
    ],
  },
  uk: {
    title: 'Безкоштовна перевірка резюме на ATS та CV Roast | AI-Letter',
    description: 'Перевірте PDF-резюме під вакансію безкоштовно та без реєстрації. Отримайте ATS-бал (0–100), пропущені ключові слова та чесний розбір від рекрутера.',
    h1: 'Безкоштовна перевірка резюме на ATS та чесний розбір від рекрутера',
    lead: 'Завантажте PDF-резюме або вставте текст, щоб перевірити збіг ключових слів під вакансію (0–100) або отримати 6-секундний розбір від рекрутера без реєстрації.',
    h2: 'Що перевіряє безкоштовний ATS-сканер',
    items: [
      'Збіг ключових слів ATS: показує знайдені та пропущені хард-скіли порівняно з текстом вакансії.',
      'Оцінка метрик і досягнень: підказує, як посилити формулювання без вигаданих цифр.',
      'Режим CV Roast за 6 секунд: чесний фідбек рекрутера та PNG-картка результату в 1 клік.',
    ],
  },
  de: {
    title: 'Kostenloser ATS-Lebenslauf-Check & Recruiter Roast | AI-Letter',
    description: 'Prüfen Sie Ihren PDF-Lebenslauf kostenlos gegen jede Stellenanzeige: ATS-Score (0–100), fehlende Keywords und direktes 6-Sekunden-Recruiter-Feedback.',
    h1: 'Kostenloser ATS-Lebenslauf-Check & 6-Sekunden Recruiter Roast',
    lead: 'Laden Sie Ihren PDF-Lebenslauf hoch oder fügen Sie Text ein: ATS-Match-Score (0–100), fehlende Fachbegriffe und ehrliches Recruiter-Feedback ohne Anmeldung.',
    h2: 'Was der kostenlose ATS-Checker prüft',
    items: [
      'Keyword-Abgleich: erkennt übereinstimmende und fehlende Hard Skills aus der Stellenanzeige.',
      'Messbare Erfolge & Struktur: konkrete Verbesserungsvorschläge ohne erfundene Kennzahlen.',
      '6-Sekunden Recruiter Roast: direktes Feedback inklusive teilbarer PNG-Score-Card.',
    ],
  },
  it: {
    title: 'Verifica CV ATS Gratuita & Recruiter Roast | AI-Letter',
    description: 'Scansiona gratuitamente il tuo CV in PDF senza registrazione: punteggio ATS (0–100), parole chiave mancanti e valutazione critica in 6 secondi.',
    h1: 'Verifica CV ATS Gratuita & Recruiter Roast in 6 Secondi',
    lead: 'Carica il tuo CV in PDF o incolla il testo per ottenere punteggio ATS (0–100), parole chiave mancanti e una critica schietta da recruiter senza registrazione.',
    h2: 'Cosa analizza il Checker ATS gratuito',
    items: [
      'Match delle parole chiave ATS rispetto ai requisiti tecnici dell’annuncio di lavoro.',
      'Audit di metriche e struttura con esempi di riscrittura senza numeri inventati.',
      'Modalità Recruiter Roast in 6 secondi con scheda PNG scaricabile.',
    ],
  },
};

function buildRoleFaqs(rolePage, lang) {
  const loc = rolePage.locales[lang] || rolePage.locales.en;
  const roleName = loc.roleName;
  const ruleSummary = (loc.rules || []).join(' ');

  if (lang === 'uk') {
    return [
      {
        q: `Як правильно написати супровідний лист для ${roleName}?`,
        a: `Сильний супровідний лист на позицію ${roleName} починається не з шаблонів, а з конкретних цифр і релевантного стеку. ${loc.rules?.[0] || ''} ${loc.rules?.[1] || ''}`.trim(),
      },
      {
        q: `Які навички та метрики варто підкреслити кандидату на роль ${roleName}?`,
        a: `Рекрутери насамперед шукають практичний вплив на бізнес і прозорий інструментарій. Зосередьтеся на таких принципах: ${ruleSummary}`,
      },
      {
        q: `Чи можна згенерувати персоналізований вступ для ${roleName} безкоштовно?`,
        a: `Так. На цій сторінці AI-Letter ви можете без реєстрації вказати свої навички, досвід і текст вакансії, щоб миттєво отримати 2 варіанти вступного абзацу, або створити повне CV та лист у кабінеті (5 безкоштовних генерацій щомісяця).`,
      },
    ];
  }
  if (lang === 'de') {
    return [
      {
        q: `Wie schreibt man ein überzeugendes Anschreiben als ${roleName}?`,
        a: `Ein starkes Anschreiben für ${roleName} verzichtet auf Floskeln und beginnt direkt mit messbaren Erfolgen. ${loc.rules?.[0] || ''} ${loc.rules?.[1] || ''}`.trim(),
      },
      {
        q: `Welche Skills und Kennzahlen sollte ein ${roleName} hervorheben?`,
        a: `Personalverantwortliche achten besonders auf nachweisbaren Business-Impact und praxiserprobte Tools: ${ruleSummary}`,
      },
      {
        q: `Kann ich ein ${roleName}-Anschreiben kostenlos mit KI generieren?`,
        a: `Ja. Mit dem kostenlosen Generator auf dieser Seite erstellen Sie ohne Anmeldung zwei individuelle Einstiege auf Basis Ihrer Skills und Stellenanzeige oder nutzen im Dashboard 5 kostenlose Vollgenerierungen pro Monat.`,
      },
    ];
  }
  if (lang === 'it') {
    return [
      {
        q: `Come scrivere una lettera di presentazione efficace per ${roleName}?`,
        a: `Una lettera vincente per ${roleName} evita frasi generiche e punta subito su risultati concreti e competenze tecniche. ${loc.rules?.[0] || ''} ${loc.rules?.[1] || ''}`.trim(),
      },
      {
        q: `Quali competenze e metriche deve evidenziare un ${roleName}?`,
        a: `I recruiter cercano impatto misurabile sul business e padronanza degli strumenti di ruolo: ${ruleSummary}`,
      },
      {
        q: `Posso generare gratuitamente l’apertura per ${roleName} con l’IA?`,
        a: `Sì. Inserisci competenze ed esperienza nel modulo qui sopra per generare subito due aperture personalizzate senza registrazione, oppure accedi a 5 generazioni complete gratis al mese nella dashboard AI-Letter.`,
      },
    ];
  }
  return [
    {
      q: `How do you write a high-converting ${roleName} cover letter?`,
      a: `A strong ${roleName} cover letter skips generic openers like "I am writing to apply" and leads with measurable delivery outcomes. ${loc.rules?.[0] || ''} ${loc.rules?.[1] || ''}`.trim(),
    },
    {
      q: `What skills and metrics should a ${roleName} highlight?`,
      a: `Hiring managers evaluate concrete execution impact and relevant domain tooling first. Follow these three guidelines: ${ruleSummary}`,
    },
    {
      q: `Can I generate a tailored ${roleName} cover letter for free with AI-Letter?`,
      a: `Yes. Use the free generator on this page with no sign-up required to create two tailored opening hooks (metric-driven and domain-focused), or sign in for 5 free full cover letters, CV optimization, and A4 PDF export every month.`,
    },
  ];
}

function buildFaqsForRoute(route) {
  if (route.basePath === '/terms' || route.basePath === '/privacy') {
    return [];
  }
  if (route.basePath === '/') {
    return HOME_FAQS[route.lang] || HOME_FAQS.en;
  }
  if (TOOL_FAQS[route.basePath]) {
    const entry = TOOL_FAQS[route.basePath];
    return entry[route.lang] || entry.en;
  }
  const matchedRole = SEO_ROLE_PAGES.find((r) => r.path === route.basePath);
  if (matchedRole) {
    return buildRoleFaqs(matchedRole, route.lang);
  }
  return [];
}

function buildUrl(lang, basePath) {
  const cleanBase = basePath === '/' ? '' : basePath;
  if (!lang || lang === 'en') {
    return `${BASE_URL}${cleanBase || '/'}`;
  }
  return `${BASE_URL}/${lang}${cleanBase}`;
}

function buildRoutePath(lang, basePath) {
  const cleanBase = basePath === '/' ? '' : basePath;
  if (!lang || lang === 'en') {
    return cleanBase || '/';
  }
  return `/${lang}${cleanBase}`;
}

function buildBaseRoutesForLang(lang) {
  const dict = translations[lang] || translations.en;
  const homeCopy = HOME_COPY[lang] || HOME_COPY.en;
  const atsCopy = ATS_CHECKER_PRERENDER[lang] || ATS_CHECKER_PRERENDER.en;

  const basePages = [
    {
      basePath: '/',
      title: dict.seoHomeTitle,
      description: dict.seoHomeDesc,
      h1: homeCopy.h1,
      lead: dict.seoHomeDesc,
      sections: homeCopy.sections,
      changefreq: 'weekly',
      priority: '1.0',
    },
    {
      basePath: '/ats-resume-checker',
      title: atsCopy.title,
      description: atsCopy.description,
      h1: atsCopy.h1,
      lead: atsCopy.lead,
      sections: [
        {
          h2: atsCopy.h2,
          items: atsCopy.items,
        },
      ],
      changefreq: 'weekly',
      priority: '0.95',
    },
    {
      basePath: '/linkedin-message',
      title: dict.seoLinkedInTitle,
      description: dict.seoLinkedInDesc,
      h1: dict.linkedinPageTitle || dict.seoLinkedInTitle,
      lead: dict.linkedinPageLead || dict.seoLinkedInDesc,
      sections: [
        {
          h2: dict.linkedinToolkitTitle || 'LinkedIn Easy Apply Toolkit',
          items: [
            dict.linkedinPageSteps || 'Paste job description and generate a concise LinkedIn recruiter note.',
            dict.linkedinExample1 || 'Highlight relevant leadership and delivery outcomes.',
            dict.linkedinExample2 || 'Copy and paste directly into LinkedIn Easy Apply or InMail.',
          ],
        },
      ],
      changefreq: 'monthly',
      priority: '0.9',
    },
    {
      basePath: '/subject-line',
      title: dict.seoSubjectTitle,
      description: dict.seoSubjectDesc,
      h1: dict.subjectPageTitle || dict.seoSubjectTitle,
      lead: dict.subjectPageLead || dict.seoSubjectDesc,
      sections: [
        {
          h2: dict.subjectHint || 'Email Subject Line Styles',
          items: [
            dict.subjectPageSteps || 'Paste the job description, generate 3 subject lines (Formal, Direct, Creative), and copy.',
          ],
        },
      ],
      changefreq: 'monthly',
      priority: '0.9',
    },
    {
      basePath: '/cover-letter-ai-developer',
      title: dict.seoAIDevTitle,
      description: dict.seoAIDevDesc,
      h1: dict.aiDevPageTitle || 'AI Developer Cover Letter Guide & Generator',
      lead: dict.aiDevPageLead || dict.seoAIDevDesc,
      sections: [
        {
          h2: 'AI / ML Engineering Cover Letter Highlights',
          items: [
            'PyTorch, JAX, Hugging Face, RAG pipelines, vector databases (Pinecone, Qdrant), and LangChain.',
            'Measurable LLM latency, cost reduction, and accuracy metrics.',
            'Production MLOps deployment with Docker, Triton, and TensorRT.',
          ],
        },
      ],
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      basePath: '/linkedin-cold-message-templates',
      title: dict.seoLinkedInColdTitle,
      description: dict.seoLinkedInColdDesc,
      h1: dict.liColdPageTitle || 'LinkedIn Cold Message Generator & Templates',
      lead: dict.liColdPageLead || dict.seoLinkedInColdDesc,
      sections: [
        {
          h2: dict.liColdTemplateLabel || 'Outreach Templates',
          items: [
            dict.liColdTemplate1 || 'Direct Application Follow-Up',
            dict.liColdTemplate2 || 'Networking / Informational Interview',
            dict.liColdTemplate3 || 'Employee Referral Request',
          ],
        },
      ],
      changefreq: 'weekly',
      priority: '0.8',
    },
    {
      basePath: '/freelancer-self-introduction',
      title: dict.seoFreelancerTitle,
      description: dict.seoFreelancerDesc,
      h1: dict.freePageTitle || 'Freelancer Self-Introduction & Proposal Generator',
      lead: dict.freePageLead || dict.seoFreelancerDesc,
      sections: [
        {
          h2: 'High-Converting Freelance Pitch Principles',
          items: [
            'Lead with the client problem and concrete solution in the opening lines.',
            'Include a clear execution plan and Proof of Work metrics.',
          ],
        },
      ],
      changefreq: 'weekly',
      priority: '0.8',
    },
  ];

  for (const rolePage of SEO_ROLE_PAGES) {
    const loc = rolePage.locales[lang] || rolePage.locales.en;
    basePages.push({
      basePath: rolePage.path,
      title: loc.title,
      description: loc.description,
      h1: loc.h1,
      lead: loc.lead,
      sections: [
        {
          h2: loc.ruleTitle,
          items: loc.rules,
        },
        {
          h2: loc.exampleTitle,
          items: [loc.exampleText],
        },
        ...(loc.fullExampleLetter
          ? [{ h2: loc.fullExampleTitle || loc.exampleTitle, items: [loc.fullExampleLetter] }]
          : []),
      ],
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  return basePages.map((page) => {
    const route = {
      ...page,
      lang,
      routePath: buildRoutePath(lang, page.basePath),
      canonical: buildUrl(lang, page.basePath),
      hasAlternates: true,
    };
    route.faqs = buildFaqsForRoute(route);
    return route;
  });
}

const LEGAL_ROUTES = [
  {
    basePath: '/terms',
    routePath: '/terms',
    canonical: `${BASE_URL}/terms`,
    lang: 'en',
    hasAlternates: false,
    title: 'Terms of Service | AI-Letter',
    description: 'Read the AI-Letter Terms of Service. Learn about usage rules, subscriptions, and your rights when using our AI cover letter generator.',
    h1: 'Terms of Service — AI-Letter',
    lead: 'By accessing or using AI-Letter, you agree to these Terms of Service governing our AI cover letter generator, resume CV builder, and Pro subscriptions.',
    sections: [
      {
        h2: 'Summary of Terms',
        items: [
          'Service Description: AI-powered cover letter generation, ATS resume optimization, and job tracking.',
          'Plans: Free tier (5 generations/month) and Pro subscription billed monthly or annually via Stripe.',
          'Intellectual Property: You own the letters and resumes you generate for your personal career use.',
        ],
      },
    ],
    faqs: [],
    changefreq: 'yearly',
    priority: '0.4',
  },
  {
    basePath: '/privacy',
    routePath: '/privacy',
    canonical: `${BASE_URL}/privacy`,
    lang: 'en',
    hasAlternates: false,
    title: 'Privacy Policy | AI-Letter',
    description: 'Learn how AI-Letter collects, uses, and protects your personal data. Our privacy policy explains your rights and how we handle your information.',
    h1: 'Privacy Policy — AI-Letter',
    lead: 'Learn how AI-Letter collects, processes, and protects your personal data, CV documents, and account information in compliance with GDPR.',
    sections: [
      {
        h2: 'Data Protection & Privacy Principles',
        items: [
          'Your CV and job description inputs are used solely to generate your requested career documents.',
          'Authentication and cloud sync are secured via Google Firebase and encrypted in transit.',
          'You can delete your saved history or account data at any time from Settings.',
        ],
      },
    ],
    faqs: [],
    changefreq: 'yearly',
    priority: '0.4',
  },
];

const ALL_ROUTES = [
  ...SUPPORTED_SEO_LANGS.flatMap((lang) => buildBaseRoutesForLang(lang)),
  ...LEGAL_ROUTES,
];

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildNavHtml(lang, basePath) {
  const dict = translations[lang] || translations.en;
  const atsNavTitle = (ATS_CHECKER_PRERENDER[lang] || ATS_CHECKER_PRERENDER.en).title;
  const roleLinks = SEO_ROLE_PAGES.map((p) => {
    const loc = p.locales[lang] || p.locales.en;
    return `<li><a href="${buildUrl(lang, p.path)}">${escapeHtml(loc.roleName)}</a></li>`;
  }).join('\n      ');

  const langLinks = SUPPORTED_SEO_LANGS.map((l) =>
    `<li><a href="${buildUrl(l, basePath)}">${l.toUpperCase()} (${escapeHtml(basePath)})</a></li>`
  ).join('\n      ');

  return `
  <nav aria-label="AI-Letter Tools &amp; Resources">
    <ul>
      <li><a href="${buildUrl(lang, '/')}">${escapeHtml(dict.seoHomeTitle)}</a></li>
      <li><a href="${buildUrl(lang, '/ats-resume-checker')}">${escapeHtml(atsNavTitle)}</a></li>
      <li><a href="${buildUrl(lang, '/linkedin-message')}">${escapeHtml(dict.seoLinkedInTitle)}</a></li>
      <li><a href="${buildUrl(lang, '/subject-line')}">${escapeHtml(dict.seoSubjectTitle)}</a></li>
      <li><a href="${buildUrl(lang, '/cover-letter-ai-developer')}">${escapeHtml(dict.seoAIDevTitle)}</a></li>
      <li><a href="${buildUrl(lang, '/linkedin-cold-message-templates')}">${escapeHtml(dict.seoLinkedInColdTitle)}</a></li>
      <li><a href="${buildUrl(lang, '/freelancer-self-introduction')}">${escapeHtml(dict.seoFreelancerTitle)}</a></li>
      ${roleLinks}
      <li><a href="${BASE_URL}/terms">Terms of Service</a></li>
      <li><a href="${BASE_URL}/privacy">Privacy Policy</a></li>
      <li><a href="${BASE_URL}/llms.txt">AI / LLM Documentation (llms.txt)</a></li>
    </ul>
    <ul>
      ${langLinks}
    </ul>
  </nav>`;
}

function buildBodyContent(route) {
  const sectionsHtml = (route.sections || [])
    .map(
      (sec) => `
      <section>
        <h2>${escapeHtml(sec.h2)}</h2>
        <ul>
          ${sec.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n          ')}
        </ul>
      </section>`
    )
    .join('\n');

  const faqsHtml = route.faqs && route.faqs.length > 0
    ? `
      <section aria-label="FAQ">
        <h2>${escapeHtml(FAQ_HEADINGS[route.lang] || FAQ_HEADINGS.en)}</h2>
        <dl>
          ${route.faqs
            .map(
              (item) => `
          <div>
            <dt><h3>${escapeHtml(item.q)}</h3></dt>
            <dd><p>${escapeHtml(item.a)}</p></dd>
          </div>`
            )
            .join('\n')}
        </dl>
      </section>`
    : '';

  return `<div id="root">
    <main style="max-width:960px;margin:0 auto;padding:48px 20px;font-family:system-ui,-apple-system,sans-serif;color:#f8fafc;background:#0f172a;">
      <h1>${escapeHtml(route.h1)}</h1>
      <p>${escapeHtml(route.lead)}</p>
      ${sectionsHtml}
      ${faqsHtml}
      ${buildNavHtml(route.lang, route.hasAlternates ? route.basePath : '/')}
    </main>
  </div>`;
}

function buildJsonLd(route) {
  const orgId = `${BASE_URL}/#organization`;
  const graph = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: 'AI-Letter',
      url: `${BASE_URL}/`,
      logo: {
        '@type': 'ImageObject',
        url: OG_IMAGE,
        width: 512,
        height: 512,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@ailetter.pro',
        contactType: 'customer support',
        availableLanguage: ['en', 'uk', 'de', 'it'],
      },
    },
    {
      '@type': route.basePath === '/' ? 'SoftwareApplication' : 'WebApplication',
      '@id': `${route.canonical}#app`,
      name: route.title.split('|')[0].trim(),
      url: route.canonical,
      inLanguage: route.lang,
      description: route.description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      availableLanguage: ['en', 'uk', 'de', 'it'],
      publisher: { '@id': orgId },
      featureList: FEATURE_LIST,
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Plan',
          price: '0',
          priceCurrency: 'EUR',
        },
        {
          '@type': 'Offer',
          name: 'Pro Plan (Annual)',
          price: '3.25',
          priceCurrency: 'EUR',
        },
      ],
    },
  ];

  if (route.faqs && route.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${route.canonical}#faq`,
      inLanguage: route.lang,
      mainEntity: route.faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
    });
  }

  const payload = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return `<script type="application/ld+json">${JSON.stringify(payload).replace(/<\/script>/gi, '<\\/script>')}</script>`;
}

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');

for (const route of ALL_ROUTES) {
  const safeTitle = escapeHtml(route.title);
  const safeDesc = escapeHtml(route.description);

  const hreflangTags = route.hasAlternates
    ? SUPPORTED_SEO_LANGS.map(
        (l) => `    <link rel="alternate" hreflang="${l}" href="${buildUrl(l, route.basePath)}" data-rh="true" />`
      ).join('\n') +
      `\n    <link rel="alternate" hreflang="x-default" href="${buildUrl('en', route.basePath)}" data-rh="true" />`
    : '';

  const metaBlock = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" data-rh="true" />
    <meta name="robots" content="index, follow" data-rh="true" />
    <link rel="canonical" href="${route.canonical}" data-rh="true" />
    <link rel="alternate" type="text/plain" href="${BASE_URL}/llms.txt" title="LLM Context" />
${hreflangTags}
    <meta property="og:site_name" content="AI-Letter" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${safeTitle}" data-rh="true" />
    <meta property="og:description" content="${safeDesc}" data-rh="true" />
    <meta property="og:url" content="${route.canonical}" data-rh="true" />
    <meta property="og:image" content="${OG_IMAGE}" data-rh="true" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@ailetterapp" />
    <meta name="twitter:title" content="${safeTitle}" data-rh="true" />
    <meta name="twitter:description" content="${safeDesc}" data-rh="true" />
    <meta name="twitter:image" content="${OG_IMAGE}" data-rh="true" />
    ${buildJsonLd(route)}`;

  let html = template
    .replace(/<html\s+lang="[^"]*"/i, `<html lang="${route.lang}"`)
    .replace(/<meta charset="UTF-8"\s*\/?>/gi, '')
    .replace(/<meta name="viewport"[^>]*>/gi, '')
    .replace(/<title>.*?<\/title>/gis, '')
    .replace(/<meta name="description"[^>]*>/gi, '')
    .replace(/<meta name="robots"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '')
    .replace(/<link rel="alternate"[^>]*>/gi, '')
    .replace(/<meta property="og:site_name"[^>]*>/gi, '')
    .replace(/<meta property="og:type"[^>]*>/gi, '')
    .replace(/<meta property="og:title"[^>]*>/gi, '')
    .replace(/<meta property="og:description"[^>]*>/gi, '')
    .replace(/<meta property="og:url"[^>]*>/gi, '')
    .replace(/<meta property="og:image"[^>]*>/gi, '')
    .replace(/<meta property="og:image:width"[^>]*>/gi, '')
    .replace(/<meta property="og:image:height"[^>]*>/gi, '')
    .replace(/<meta name="twitter:card"[^>]*>/gi, '')
    .replace(/<meta name="twitter:site"[^>]*>/gi, '')
    .replace(/<meta name="twitter:title"[^>]*>/gi, '')
    .replace(/<meta name="twitter:description"[^>]*>/gi, '')
    .replace(/<meta name="twitter:image"[^>]*>/gi, '')
    .replace(/<head>/i, `<head>${metaBlock}`)
    .replace(/<div id="root">\s*<\/div>/i, buildBodyContent(route));

  if (route.routePath === '/') {
    fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf-8');
  } else {
    const cleanRoute = route.routePath.replace(/^\/+/, '');
    const outDir = path.join(DIST, cleanRoute);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
    fs.writeFileSync(path.join(DIST, `${cleanRoute}.html`), html, 'utf-8');
  }
  console.log(`✓ Prerendered [${route.lang}] ${route.routePath}`);
}

const sitemapEntries = ALL_ROUTES.map(
  (r) => `  <url>
    <loc>${r.canonical}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
).join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`;

fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), sitemapXml, 'utf-8');
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemapXml, 'utf-8');

console.log(`\nPrerender done — ${ALL_ROUTES.length} routes + sitemap.xml generated (${TODAY}).`);
