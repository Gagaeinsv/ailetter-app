(() => {
  const MAX_JD_LENGTH = 3400;

  function cleanText(str) {
    return String(str || '')
      .replace(/\r/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  function firstText(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = cleanText(el.innerText || el.textContent);
        if (text.length > 0) return text;
      }
    }
    return '';
  }

  function detectLocale(hostname, text) {
    const h = (hostname || '').toLowerCase();
    if (h.includes('stepstone.de') || h.includes('stepstone.at') || h.includes('xing.com') || h.startsWith('de.') || h.endsWith('.de')) {
      return 'de';
    }
    if (h.includes('djinni.co') || h.includes('dou.ua') || h.includes('work.ua') || h.includes('robota.ua') || h.endsWith('.ua')) {
      return 'uk';
    }
    if (h.startsWith('it.') || h.endsWith('.it')) {
      return 'it';
    }
    const sample = (text || '').slice(0, 1200);
    if (/[іїєґІЇЄҐ]/.test(sample)) return 'uk';
    if (/\b(Stellenanzeige|Bewerbung|Aufgaben|Anforderungen|Wir bieten|Vollzeit|Teilzeit|Kenntnisse)\b/i.test(sample)) {
      return 'de';
    }
    if (/\b(Requisiti|Mansioni|Offerta di lavoro|Candidati|Esperienza|Sede di lavoro)\b/i.test(sample)) {
      return 'it';
    }
    return 'en';
  }

  function extractJobData() {
    const host = window.location.hostname.toLowerCase();
    const selection = cleanText(window.getSelection ? window.getSelection().toString() : '');

    let title = '';
    let company = '';
    let body = '';

    if (host.includes('linkedin.com')) {
      title = firstText([
        '.job-details-jobs-unified-top-card__job-title h1',
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-unified-top-card__job-title',
        '.top-card-layout__title',
        'h1',
      ]);
      company = firstText([
        '.job-details-jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name',
        '.topcard__org-name-link',
      ]);
      body = firstText([
        '.jobs-description__content .jobs-box__html-content',
        '.jobs-description-content__text',
        '.jobs-description__content',
        '.show-more-less-html__markup',
        '#job-details',
      ]);
    } else if (host.includes('stepstone.')) {
      title = firstText(['[data-at="header-job-title"]', 'h1']);
      company = firstText(['[data-at="header-company-name"]', '[data-at="metadata-company-name"]']);
      body = firstText(['[data-at="job-ad-content"]', '[data-genesis-element="CARD_GROUP"]', 'article', 'main']);
    } else if (host.includes('indeed.')) {
      title = firstText(['.jobsearch-JobInfoHeader-title', '[data-testid="jobsearch-JobInfoHeader-title"]', 'h1']);
      company = firstText(['[data-testid="inlineHeader-companyName"]', '[data-company-name="true"]']);
      body = firstText(['#jobDescriptionText', '.jobsearch-jobDescriptionText']);
    } else if (host.includes('djinni.co')) {
      title = firstText(['h1']);
      company = firstText(['.job-details--title a', 'a[href*="/jobs/company-"]']);
      body = firstText(['.job-post__description', '.mb-4.text-break', 'main']);
    } else if (host.includes('dou.ua')) {
      title = firstText(['.l-vacancy h1', 'h1']);
      company = firstText(['.b-compinfo .l-n a', '.l-vacancy .company']);
      body = firstText(['.l-vacancy .vacancy-section', '.l-vacancy']);
    } else if (host.includes('work.ua')) {
      title = firstText(['#h1-name', 'h1']);
      company = firstText(['.glyphicon-company + a', 'a[href*="/jobs/by-company/"]']);
      body = firstText(['#job-description', '.card']);
    } else if (host.includes('robota.ua')) {
      title = firstText(['h1']);
      body = firstText(['[data-id="vacancy-description"]', 'article', 'main']);
    } else if (host.includes('xing.com')) {
      title = firstText(['h1']);
      body = firstText(['[data-testid="job-details-description"]', 'main', 'article']);
    } else if (host.includes('glassdoor.')) {
      title = firstText(['[data-test="job-title"]', 'h1']);
      company = firstText(['[data-test="employer-name"]']);
      body = firstText(['.JobDetails_jobDescription__uW_fK', '[class*="jobDescriptionContent"]', 'main']);
    }

    if (!title) {
      title = firstText(['h1']) || cleanText(document.title);
    }

    const rawBody = selection.length >= 60
      ? selection
      : body || firstText(['main', 'article']) || cleanText(document.body?.innerText || '');

    const headerParts = [];
    if (title) headerParts.push(`Role: ${title}`);
    if (company) headerParts.push(`Company: ${company}`);
    const header = headerParts.length ? `${headerParts.join(' | ')}\n\n` : '';

    const fullText = cleanText(`${header}${rawBody}`).slice(0, MAX_JD_LENGTH);
    const lang = detectLocale(host, fullText);

    return {
      title: title || document.title || 'Job Listing',
      company,
      text: fullText,
      source: host.replace(/^www\./, ''),
      lang,
    };
  }

  function buildTargetUrl(kind, jobData) {
    const base = 'https://ailetter.pro';
    const langPrefix = jobData.lang && jobData.lang !== 'en' ? `/${jobData.lang}` : '';
    const params = new URLSearchParams();
    if (jobData.text) params.set('jd', jobData.text);
    if (jobData.source) params.set('src', jobData.source);
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

  window.__AILETTER_EXTRACTOR__ = {
    extractJobData,
    buildTargetUrl,
  };
})();
