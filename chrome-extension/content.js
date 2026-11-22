(() => {
  const WIDGET_ID = 'ailetter-ext-widget';
  const DISMISS_KEY = 'ailetter_ext_dismissed_session';

  if (sessionStorage.getItem(DISMISS_KEY) === '1') return;

  function createWidget() {
    if (document.getElementById(WIDGET_ID)) return;

    const root = document.createElement('div');
    root.id = WIDGET_ID;
    root.innerHTML = `
      <div class="ailetter-ext-card" role="region" aria-label="AI-Letter Quick Actions">
        <div class="ailetter-ext-header">
          <span class="ailetter-ext-brand">⚡ AI-Letter</span>
          <button type="button" class="ailetter-ext-close" title="Hide for this session" aria-label="Close">×</button>
        </div>
        <div class="ailetter-ext-actions">
          <button type="button" class="ailetter-ext-btn ailetter-ext-btn-primary" data-action="ats">
            📊 Free ATS Check
          </button>
          <button type="button" class="ailetter-ext-btn ailetter-ext-btn-secondary" data-action="cover_letter">
            ✉️ Cover Letter
          </button>
        </div>
      </div>
    `;

    root.querySelector('.ailetter-ext-close').addEventListener('click', () => {
      sessionStorage.setItem(DISMISS_KEY, '1');
      root.remove();
    });

    root.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const api = window.__AILETTER_EXTRACTOR__;
        if (!api) return;
        const jobData = api.extractJobData();
        const url = api.buildTargetUrl(btn.dataset.action, jobData);
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    document.body.appendChild(root);
  }

  // Mount once DOM is ready and keep alive across SPA navigations (LinkedIn / Indeed)
  createWidget();
  const observer = new MutationObserver(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === '1') {
      observer.disconnect();
      return;
    }
    if (document.body && !document.getElementById(WIDGET_ID)) {
      createWidget();
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: false });
  }
})();
