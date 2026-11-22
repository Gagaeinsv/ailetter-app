const statusBox = document.getElementById('statusBox');
const jdInput = document.getElementById('jdInput');
const charCount = document.getElementById('charCount');
const langBadge = document.getElementById('langBadge');

let detectedSource = 'chrome-extension';
let detectedLang = 'en';

function updateCount() {
  charCount.textContent = `${jdInput.value.trim().length} chars`;
}

function buildUrl(kind) {
  const base = 'https://ailetter.pro';
  const langPrefix = detectedLang && detectedLang !== 'en' ? `/${detectedLang}` : '';
  const params = new URLSearchParams();
  const text = jdInput.value.trim().slice(0, 3400);
  if (text) params.set('jd', text);
  if (detectedSource) params.set('src', detectedSource);
  params.set('utm_source', 'chrome_ext');

  if (kind === 'cover_letter') {
    return `${base}/dashboard?${params.toString()}`;
  }
  if (kind === 'roast') {
    params.set('mode', 'roast');
    return `${base}${langPrefix}/ats-resume-checker?${params.toString()}`;
  }
  return `${base}${langPrefix}/ats-resume-checker?${params.toString()}`;
}

async function init() {
  jdInput.addEventListener('input', updateCount);

  document.getElementById('btnAts').addEventListener('click', () => {
    chrome.tabs.create({ url: buildUrl('ats') });
  });
  document.getElementById('btnRoast').addEventListener('click', () => {
    chrome.tabs.create({ url: buildUrl('roast') });
  });
  document.getElementById('btnLetter').addEventListener('click', () => {
    chrome.tabs.create({ url: buildUrl('cover_letter') });
  });

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || !/^https?:\/\//i.test(tab.url)) {
      statusBox.textContent = 'Paste any job description below to start.';
      statusBox.className = 'status warn';
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['extractor.js'],
    });

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => (window.__AILETTER_EXTRACTOR__ ? window.__AILETTER_EXTRACTOR__.extractJobData() : null),
    });

    if (result && result.text) {
      jdInput.value = result.text;
      detectedSource = result.source || detectedSource;
      detectedLang = result.lang || 'en';
      langBadge.textContent = detectedLang.toUpperCase();
      statusBox.textContent = `✓ Extracted from ${detectedSource}: ${result.title}`;
      statusBox.className = 'status ok';
      updateCount();
    } else {
      statusBox.textContent = 'No job text found — highlight text or paste below.';
      statusBox.className = 'status warn';
    }
  } catch (err) {
    statusBox.textContent = 'Open a job page or paste the description below.';
    statusBox.className = 'status warn';
  }
}

init();
