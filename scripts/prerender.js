/**
 * prerender.js
 *
 * After `vite build`, this script reads dist/index.html and generates
 * static HTML for all 46 public routes (11 localized routes × 4 languages:
 * en, uk, de, it + /terms and /privacy):
 * - Correct <html lang="..."> per language edition.
 * - Clean, deduplicated <title>, <meta name="description">, <link rel="canonical">,
 *   <link rel="alternate" hreflang="...">, og:*, twitter:* tags marked with
 *   data-rh="true" so react-helmet-async updates them without duplicates.
 * - Static JSON-LD structured data in <head>.
 * - Pre-rendered semantic HTML content inside <div id="root">...</div> so Googlebot
 *   sees full localized headings, copy, FAQ/rules, and internal links on Wave 1.
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
      {
        h2: 'Frequently Asked Questions',
        items: [
          'Is AI-Letter really free to start? Yes — you get 5 free generations per month with no credit card required.',
          'How does the ATS Resume Optimizer work? You upload your CV and paste the target vacancy. The AI audits formatting, structure, and missing keywords.',
          'What languages are supported? English, Ukrainian, Italian, and German.',
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
      {
        h2: 'Часті запитання',
        items: [
          'Чи справді безкоштовно? Так — 5 безкоштовних генерацій щомісяця без кредитної картки.',
          'Які мови підтримуються? Українська, English, Deutsch, Italiano.',
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
      ],
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  return basePages.map((page) => ({
    ...page,
    lang,
    routePath: buildRoutePath(lang, page.basePath),
    canonical: buildUrl(lang, page.basePath),
    hasAlternates: true,
  }));
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
      <li><a href="${buildUrl(lang, '/linkedin-message')}">${escapeHtml(dict.seoLinkedInTitle)}</a></li>
      <li><a href="${buildUrl(lang, '/subject-line')}">${escapeHtml(dict.seoSubjectTitle)}</a></li>
      <li><a href="${buildUrl(lang, '/cover-letter-ai-developer')}">${escapeHtml(dict.seoAIDevTitle)}</a></li>
      <li><a href="${buildUrl(lang, '/linkedin-cold-message-templates')}">${escapeHtml(dict.seoLinkedInColdTitle)}</a></li>
      <li><a href="${buildUrl(lang, '/freelancer-self-introduction')}">${escapeHtml(dict.seoFreelancerTitle)}</a></li>
      ${roleLinks}
      <li><a href="${BASE_URL}/terms">Terms of Service</a></li>
      <li><a href="${BASE_URL}/privacy">Privacy Policy</a></li>
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

  return `<div id="root">
    <main style="max-width:960px;margin:0 auto;padding:48px 20px;font-family:system-ui,-apple-system,sans-serif;color:#f8fafc;background:#0f172a;">
      <h1>${escapeHtml(route.h1)}</h1>
      <p>${escapeHtml(route.lead)}</p>
      ${sectionsHtml}
      ${buildNavHtml(route.lang, route.hasAlternates ? route.basePath : '/')}
    </main>
  </div>`;
}

function buildJsonLd(route) {
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': route.basePath === '/' ? 'SoftwareApplication' : 'WebApplication',
    name: route.title.split('|')[0].trim(),
    url: route.canonical,
    inLanguage: route.lang,
    description: route.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };
  return `<script type="application/ld+json">${JSON.stringify(appSchema)}</script>`;
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
