/**
 * prerender.js
 *
 * After `vite build`, this script reads dist/index.html and generates
 * a separate index.html for each public route — with correct <title>,
 * <meta description>, <link rel="canonical">, og:*, twitter:* tags
 * baked in as static HTML.
 *
 * Firebase Hosting serves static files before falling back to the
 * SPA rewrite, so Google receives the correct meta tags without
 * needing to execute JavaScript.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST      = path.resolve(__dirname, '../dist');
const BASE_URL  = 'https://ailetter.pro';
const OG_IMAGE  = `${BASE_URL}/android-chrome-512x512.png`;

const ROUTES = [
  {
    path: '/',
    title: 'AIletter — AI Cover Letter Generator | Get Hired 10x Faster',
    description: 'Generate personalized, ATS-optimized cover letters in 30 seconds. Upload your CV, paste the job description, and get a tailored letter. Free to start.',
  },
  {
    path: '/linkedin-message',
    title: 'LinkedIn Easy Apply Message Generator | AIletter',
    description: 'Generate a short, professional LinkedIn Easy Apply message tailored to any job description in seconds. Free, no sign-up required.',
  },
  {
    path: '/subject-line',
    title: 'Email Subject Line Generator for Job Applications | AIletter',
    description: 'Generate 3 compelling email subject lines for your job application in seconds. Formal, direct, and creative options. Free, no sign-up required.',
  },
  {
    path: '/terms',
    title: 'Terms of Service | AIletter',
    description: 'Read the AIletter Terms of Service. Learn about usage rules, subscriptions, and your rights when using our AI cover letter generator.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | AIletter',
    description: 'Learn how AIletter collects, uses, and protects your personal data. Our privacy policy explains your rights and how we handle your information.',
  },
];

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');

for (const route of ROUTES) {
  const canonical = `${BASE_URL}${route.path}`;

  const metaBlock = `
    <title>${route.title}</title>
    <meta name="description" content="${route.description}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />`;

  // Replace the <title> and insert full meta block right after <head>
  let html = template
    .replace(/<title>.*?<\/title>/s, '')
    .replace(/<meta name="description"[^>]*>/g, '')
    .replace(/<meta name="robots"[^>]*>/g, '')
    .replace(/<link rel="canonical"[^>]*>/g, '')
    .replace(/<meta property="og:title"[^>]*>/g, '')
    .replace(/<meta property="og:description"[^>]*>/g, '')
    .replace(/<meta property="og:url"[^>]*>/g, '')
    .replace(/<meta name="twitter:title"[^>]*>/g, '')
    .replace(/<meta name="twitter:description"[^>]*>/g, '')
    .replace(/<head>/, `<head>${metaBlock}`);

  // Write to dist/<route>/index.html
  const outDir = route.path === '/'
    ? DIST
    : path.join(DIST, route.path);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  console.log(`✓ Prerendered ${route.path}`);
}

console.log(`\nPrerender done — ${ROUTES.length} routes.`);
