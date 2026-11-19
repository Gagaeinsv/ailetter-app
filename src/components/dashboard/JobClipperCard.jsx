import React, { useEffect, useRef, useState } from 'react';
import { Bookmark, Check, ChevronDown, Copy, Zap } from 'lucide-react';

const BOOKMARKLET_CODE =
  "javascript:(function(){var s=window.getSelection?window.getSelection().toString().trim():'';var t=s||(document.body&&document.body.innerText?document.body.innerText.trim().slice(0,3200):'');if(!t){alert('Highlight the job description first, then click Save to AI-Letter.');return;}window.open('https://ailetter.pro/dashboard?jd='+encodeURIComponent(t.slice(0,3200))+'&src='+encodeURIComponent(location.hostname),'_blank');})();";

const COPY = {
  en: {
    toggle: '1-Click Job Clipper (LinkedIn / Djinni / Indeed)',
    desc: 'Drag this button to your browser bookmarks bar. While viewing any job listing, highlight text (or just click) to open AI-Letter with the job pre-filled:',
    pill: '⚡ Clip Job → AI-Letter',
    copy: 'Copy Bookmarklet Code',
    copied: 'Copied! Paste as URL in a new bookmark',
  },
  uk: {
    toggle: 'Кліпер вакансій в 1 клік (LinkedIn / Djinni / Work.ua)',
    desc: 'Перетягніть цю кнопку на панель закладок браузера. Коли переглядаєте будь-яку вакансію, натисніть закладку — AI-Letter відкриється з уже вставленим описом:',
    pill: '⚡ Clip Job → AI-Letter',
    copy: 'Копіювати код закладки',
    copied: 'Скопійовано! Вставте як URL нової закладки',
  },
  de: {
    toggle: '1-Klick Job Clipper (LinkedIn / StepStone / Indeed)',
    desc: 'Ziehen Sie diesen Button in Ihre Lesezeichenleiste. Ein Klick auf einer beliebigen Stellenanzeige übernimmt den Text direkt in AI-Letter:',
    pill: '⚡ Clip Job → AI-Letter',
    copy: 'Bookmarklet-Code kopieren',
    copied: 'Kopiert! Als Lesezeichen-URL einfügen',
  },
  it: {
    toggle: 'Job Clipper in 1 Clic (LinkedIn / Indeed / Upwork)',
    desc: 'Trascina questo pulsante nella barra dei preferiti. Mentre guardi un annuncio di lavoro, cliccalo per aprirlo già compilato in AI-Letter:',
    pill: '⚡ Clip Job → AI-Letter',
    copy: 'Copia Codice Bookmarklet',
    copied: 'Copiato! Incolla come URL nei preferiti',
  },
};

export default function JobClipperCard({ uiLang = 'en', showNotification }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const linkRef = useRef(null);
  const t = COPY[uiLang] || COPY.en;

  useEffect(() => {
    if (open && linkRef.current) {
      linkRef.current.setAttribute('href', BOOKMARKLET_CODE);
    }
  }, [open]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(BOOKMARKLET_CODE);
    setCopied(true);
    if (showNotification) showNotification(t.copied);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mb-2.5 rounded-xl border border-indigo-500/20 bg-[#1e293b]/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-indigo-300 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Bookmark size={12} className="text-indigo-400" />
          {t.toggle}
        </span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2.5 text-[11px] text-slate-300">
          <p className="leading-relaxed text-slate-400">{t.desc}</p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              ref={linkRef}
              onClick={(e) => {
                e.preventDefault();
                handleCopyCode();
              }}
              draggable
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] cursor-grab active:cursor-grabbing shadow-md shadow-indigo-600/20"
              title="Drag to bookmarks bar"
            >
              <Zap size={12} />
              {t.pill}
            </a>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 text-[10px] font-bold transition-colors"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? t.copied : t.copy}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
