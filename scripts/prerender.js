/**
 * prerender.js
 *
 * After `vite build`, this script reads dist/index.html and generates
 * static HTML for each public route with:
 * - Clean, deduplicated <title>, <meta name="description">, <link rel="canonical">,
 *   og:*, twitter:* tags marked with data-rh="true" so react-helmet-async updates
 *   them in-place without creating duplicate tags.
 * - Static JSON-LD structured data in <head>.
 * - Pre-rendered semantic HTML content inside <div id="root">...</div> so Googlebot
 *   sees full headings, copy, FAQ answers, and internal navigation links on Wave 1
 *   (initial HTML crawl) before JavaScript executes.
 * - Both dist/<route>/index.html and dist/<route>.html for compatibility with
 *   Vercel (cleanUrls: true, trailingSlash: false) and Firebase Hosting.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const PUBLIC = path.resolve(__dirname, '../public');
const BASE_URL = 'https://ailetter.pro';
const OG_IMAGE = `${BASE_URL}/android-chrome-512x512.png`;
const TODAY = new Date().toISOString().slice(0, 10);

const NAV_LINKS_HTML = `
  <nav aria-label="AI-Letter Tools & Resources">
    <ul>
      <li><a href="https://ailetter.pro/">AI-Letter — AI Cover Letter Generator &amp; Resume CV Builder</a></li>
      <li><a href="https://ailetter.pro/linkedin-message">LinkedIn Easy Apply Message Generator</a></li>
      <li><a href="https://ailetter.pro/subject-line">Email Subject Line Generator for Job Applications</a></li>
      <li><a href="https://ailetter.pro/cover-letter-ai-developer">AI Developer Cover Letter Guide &amp; Generator</a></li>
      <li><a href="https://ailetter.pro/linkedin-cold-message-templates">LinkedIn Cold Message Templates &amp; AI Generator</a></li>
      <li><a href="https://ailetter.pro/freelancer-self-introduction">Freelancer Self-Introduction Examples &amp; AI Pitch Generator</a></li>
      <li><a href="https://ailetter.pro/terms">Terms of Service</a></li>
      <li><a href="https://ailetter.pro/privacy">Privacy Policy</a></li>
    </ul>
  </nav>
`;

const ROUTES = [
  {
    path: '/',
    title: 'AI-Letter — AI Cover Letter Generator & Resume CV Builder',
    description: 'Generate personalized, ATS-friendly cover letters and build professional resumes in seconds using AI. Audit your CV against job descriptions to pass recruiter screening.',
    h1: 'Tailor Your CV & Cover Letter in Under 60 Seconds with AI-Letter',
    lead: 'Speed up your job application prep 10x. Automatically check ATS keyword matches, customize your resume achievements inline, generate tailored cover letters, practice STAR interview questions, and track applications on a visual Kanban board.',
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
          'How does the ATS Resume Optimizer work? You upload your CV and paste the target vacancy. The AI audits formatting, structure, and missing keywords, and rewrites bullet points with quantitative metrics.',
          'What languages are supported? English, Ukrainian, Italian, and German.',
        ],
      },
    ],
  },
  {
    path: '/linkedin-message',
    title: 'LinkedIn Easy Apply Message Generator | AI-Letter',
    description: 'Generate a short LinkedIn Easy Apply message from any job description. Free tool by AI-Letter.',
    h1: 'LinkedIn Easy Apply Message Generator',
    lead: 'Generate a concise, high-impact LinkedIn note tailored to any job description in seconds. Free to use, no sign-up required.',
    sections: [
      {
        h2: 'How to Write a Winning LinkedIn Easy Apply Note',
        items: [
          'Paste the target job description and optionally add your name and role.',
          'Generate a personalized 300-character message highlighting your relevant experience.',
          'Copy and paste directly into LinkedIn Easy Apply or recruiter InMail.',
        ],
      },
    ],
  },
  {
    path: '/subject-line',
    title: 'Email Subject Line Generator for Job Applications | AI-Letter',
    description: 'Generate three job application email subject lines in seconds. Free tool by AI-Letter.',
    h1: 'Email Subject Line Generator for Job Applications',
    lead: 'Create 3 compelling email subject lines (Formal, Direct, and Creative) tailored to the job description so hiring managers open your application first.',
    sections: [
      {
        h2: 'Stand Out in the Hiring Manager Inbox',
        items: [
          'Formal style for corporate, finance, and enterprise applications.',
          'Direct style highlighting your role title and core qualification.',
          'Creative style for startups, tech, and product teams.',
        ],
      },
    ],
  },
  {
    path: '/cover-letter-ai-developer',
    title: 'How to Write a Cover Letter for an AI Developer | Templates & AI Generator | AI-Letter',
    description: 'Learn how to write a job-winning AI Developer cover letter. Get templates, skills to highlight, and generate custom opening hooks with AI.',
    h1: 'How to Write an AI Developer Cover Letter',
    lead: 'Applying for AI/ML engineering roles? Learn best practices for highlighting PyTorch, LLMs, RAG pipelines, and MLOps metrics, and generate custom opening hooks with AI.',
    sections: [
      {
        h2: '3 Golden Rules for AI & Machine Learning Cover Letters',
        items: [
          'Be specific about your stack: PyTorch, JAX, Hugging Face, vector databases (Pinecone, Qdrant), LangChain, and fine-tuning workflows.',
          'Highlight measurable impact: e.g., reduced LLM API latency by 35% through query caching and prompt optimization.',
          'Demonstrate MLOps and production experience: containerization, GPU inference optimization with Triton or TensorRT.',
        ],
      },
    ],
  },
  {
    path: '/linkedin-cold-message-templates',
    title: 'LinkedIn Cold Message Templates & AI Generator | AI-Letter',
    description: 'Get high-converting LinkedIn cold message templates for job applications, referrals, and networking. Customize with AI instantly.',
    h1: 'LinkedIn Cold Message Generator & Templates',
    lead: 'Stand out in recruiter inboxes. Choose a proven cold outreach template for direct applications, networking, or referral requests and customize it with AI.',
    sections: [
      {
        h2: 'Proven LinkedIn Outreach Templates for Job Seekers',
        items: [
          'Direct Job Application Follow-Up: message the hiring manager or technical recruiter right after applying.',
          'Informational Interview & Networking: connect with team leads and engineers at your target company.',
          'Employee Referral Request: politely ask for a referral with a clear summary of your relevant achievements.',
        ],
      },
    ],
  },
  {
    path: '/freelancer-self-introduction',
    title: 'Freelancer Self-Introduction Examples & AI Pitch Generator | AI-Letter',
    description: 'Find freelancer self-introduction examples for Upwork, Fiverr, and cold client pitches. Generate a custom, high-converting proposal with AI.',
    h1: 'Freelancer Self-Introduction & Proposal Generator',
    lead: 'Win more freelance clients on Upwork, Fiverr, and direct outreach. Generate a high-converting self-introduction proposal tailored to the client project.',
    sections: [
      {
        h2: '3 Rules for a Winning Freelance Proposal',
        items: [
          'Lead with the client problem and your proposed solution in the first two sentences.',
          'Outline an actionable execution plan or ask 1-2 smart clarifying questions about the project.',
          'Include concrete Proof of Work with measurable metrics from similar past projects.',
        ],
      },
    ],
  },
  {
    path: '/terms',
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
  },
  {
    path: '/privacy',
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
  },
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
      ${NAV_LINKS_HTML}
    </main>
  </div>`;
}

function buildJsonLd(route, canonical) {
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': route.path === '/' ? 'SoftwareApplication' : 'WebApplication',
    name: route.title.split('|')[0].trim(),
    url: canonical,
    description: route.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };
  return `<script type="application/ld+json">${JSON.stringify(appSchema)}</script>`;
}

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');

for (const route of ROUTES) {
  const canonical = route.path === '/' ? `${BASE_URL}/` : `${BASE_URL}${route.path}`;
  const safeTitle = escapeHtml(route.title);
  const safeDesc = escapeHtml(route.description);

  const metaBlock = `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" data-rh="true" />
    <meta name="robots" content="index, follow" data-rh="true" />
    <link rel="canonical" href="${canonical}" data-rh="true" />
    <meta property="og:site_name" content="AI-Letter" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${safeTitle}" data-rh="true" />
    <meta property="og:description" content="${safeDesc}" data-rh="true" />
    <meta property="og:url" content="${canonical}" data-rh="true" />
    <meta property="og:image" content="${OG_IMAGE}" data-rh="true" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@ailetterapp" />
    <meta name="twitter:title" content="${safeTitle}" data-rh="true" />
    <meta name="twitter:description" content="${safeDesc}" data-rh="true" />
    <meta name="twitter:image" content="${OG_IMAGE}" data-rh="true" />
    ${buildJsonLd(route, canonical)}`;

  let html = template
    .replace(/<meta charset="UTF-8"\s*\/?>/gi, '')
    .replace(/<meta name="viewport"[^>]*>/gi, '')
    .replace(/<title>.*?<\/title>/gis, '')
    .replace(/<meta name="description"[^>]*>/gi, '')
    .replace(/<meta name="robots"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '')
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
    .replace(/<div id="root"><\/div>/i, buildBodyContent(route));

  if (route.path === '/') {
    fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf-8');
  } else {
    const cleanRoute = route.path.replace(/^\/+/, '');
    const outDir = path.join(DIST, cleanRoute);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
    fs.writeFileSync(path.join(DIST, `${cleanRoute}.html`), html, 'utf-8');
  }
  console.log(`✓ Prerendered ${route.path}`);
}

// Update sitemap.xml lastmod dates in both public/ and dist/
for (const sitemapDir of [PUBLIC, DIST]) {
  const sitemapPath = path.join(sitemapDir, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const updatedSitemap = fs
      .readFileSync(sitemapPath, 'utf-8')
      .replace(/<lastmod>.*?<\/lastmod>/g, `<lastmod>${TODAY}</lastmod>`);
    fs.writeFileSync(sitemapPath, updatedSitemap, 'utf-8');
  }
}

console.log(`\nPrerender done — ${ROUTES.length} routes + sitemap lastmod (${TODAY}).`);
