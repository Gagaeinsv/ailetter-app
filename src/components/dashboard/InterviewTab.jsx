import React, { useState } from 'react';
import { generateInterviewQA } from '../../gemini';

const UI_TO_PROMPT_LANG = { en: 'English', uk: 'Ukrainian', it: 'Italian', de: 'German' };

const pickFirst = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
};

const IconMagic = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" /></svg>;
const IconChevron = ({ open }) => (
  <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
);

const QACard = ({ item, index }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`border rounded-xl transition-all duration-200 ${open ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-[#334155] bg-[#1e293b]/60'}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center text-[10px] font-black text-indigo-400">
            {index + 1}
          </span>
          <span className="font-semibold text-sm text-white">{item.q}</span>
        </div>
        <span className={`shrink-0 ${open ? 'text-indigo-400' : 'text-gray-600'}`}><IconChevron open={open} /></span>
      </button>
      {open && (
        <div className="px-5 pb-4 pl-14 text-sm text-gray-300 leading-relaxed border-t border-[#334155]/50 pt-3 whitespace-pre-wrap">
          {item.a}
        </div>
      )}
    </div>
  );
};

const InterviewTab = ({
  jobDescription,
  generatedLetter,
  contactInfo,
  dict,
  showNotification,
  uiLang = 'en',
}) => {
  const [qa, setQa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generated, setGenerated] = useState(false);

  const t = (key, fallback) => dict?.[key] || fallback;

  const handleGenerate = async () => {
    if (!generatedLetter?.trim() || !jobDescription?.trim()) {
      showNotification?.(t('interviewNeedInputs', 'Add a cover letter and job description first.'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await generateInterviewQA(generatedLetter, jobDescription, contactInfo, {
        outputLanguage: UI_TO_PROMPT_LANG[uiLang] || 'English',
      });
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map((row) => ({
        q: pickFirst(row, ['q', 'question', 'domanda', 'frage', 'питання']),
        a: pickFirst(row, ['a', 'answer', 'risposta', 'antwort', 'відповідь']),
      })).filter((row) => row.q && row.a);
      if (normalized.length === 0) throw new Error('Empty interview result');
      setQa(normalized);
      setGenerated(true);
    } catch {
      setError(t('interviewError', 'AI is busy. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const hasContent = !!(jobDescription?.trim() && generatedLetter?.trim());

  const featureCards = [
    { icon: '🎯', titleKey: 'interviewCard1Title', descKey: 'interviewCard1Desc', titleFb: 'Role-specific questions', descFb: 'Based on actual requirements from the job description' },
    { icon: '💬', titleKey: 'interviewCard2Title', descKey: 'interviewCard2Desc', titleFb: 'Behavioral questions', descFb: 'Tell me about a time... prepared with ideal answers' },
    { icon: '🧠', titleKey: 'interviewCard3Title', descKey: 'interviewCard3Desc', titleFb: 'Technical questions', descFb: 'Skills and knowledge questions relevant to this role' },
    { icon: '✍️', titleKey: 'interviewCard4Title', descKey: 'interviewCard4Desc', titleFb: 'Personalized answers', descFb: 'Answers tailored to your background from the cover letter' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] p-4 md:p-8 custom-scrollbar">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <h2 className="text-3xl font-black text-white">{t('interviewTitle', 'Interview Prep')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('interviewSubtitle', 'Personalized questions & answers based on your application.')}</p>
        </div>

        {!generated && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 bg-indigo-500/20 rounded-xl flex items-center justify-center text-2xl">🎤</div>
              <div className="flex-1">
                <h3 className="font-black text-white mb-1">{t('interviewReady', 'Ready to prep for your interview?')}</h3>
                <p className="text-sm text-slate-400 mb-4">
                  {hasContent
                    ? t('interviewReadyDesc', "We'll use your cover letter and job description to generate 8 personalized questions with ideal answers.")
                    : t('interviewNeedContent', 'Go to the Create tab first, paste the job description, and generate a cover letter.')}
                </p>
                {hasContent ? (
                  <button type="button" onClick={handleGenerate} disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#6366f1] hover:bg-[#5458ee] disabled:opacity-50 rounded-xl font-bold text-sm transition-all active:scale-95">
                    {loading
                      ? <><span className="animate-spin inline-block text-base">⟳</span> {t('interviewGenerating', 'Generating…')}</>
                      : <><IconMagic /> {t('interviewGenerate', 'Generate 8 Questions')}</>}
                  </button>
                ) : (
                  <p className="text-[11px] text-amber-400">⚠ {t('interviewNeedContent', 'Paste a job description in the Create tab first')}</p>
                )}
                {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
              </div>
            </div>
          </div>
        )}

        {qa.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500">{qa.length} {t('interviewQuestionsCount', 'questions generated')}</p>
              <button type="button" onClick={handleGenerate} disabled={loading}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 disabled:opacity-50">
                <IconMagic /> {t('interviewRegenerate', 'Regenerate')}
              </button>
            </div>
            <div className="space-y-2">
              {qa.map((item, i) => <QACard key={i} item={item} index={i} />)}
            </div>
            <div className="mt-8 bg-[#1e293b] border border-[#334155] rounded-2xl p-5">
              <h3 className="font-black text-white text-sm mb-3">{t('interviewTipsTitle', '💡 Interview Tips')}</h3>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                {['interviewTip1', 'interviewTip2', 'interviewTip3', 'interviewTip4'].map((k, i) => (
                  <li key={i}>✓ {t(k, '')}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {!generated && !loading && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('interviewWhatGet', "What you'll get:")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featureCards.map((c, i) => (
                <div key={i} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 flex gap-3">
                  <span className="text-xl">{c.icon}</span>
                  <div>
                    <p className="font-bold text-white text-xs">{t(c.titleKey, c.titleFb)}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t(c.descKey, c.descFb)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewTab;
