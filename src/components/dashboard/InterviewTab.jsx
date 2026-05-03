import React, { useState } from 'react';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { generateInterviewQA } from '../../gemini';

const UI_TO_PROMPT_LANG = { en: 'English', uk: 'Ukrainian', it: 'Italian', de: 'German' };

export default function InterviewTab({
  generatedLetter,
  jobDescription,
  contactInfo,
  dict,
  showNotification,
  uiLang = 'en',
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleGenerate = async () => {
    if (!generatedLetter?.trim() || !jobDescription?.trim()) {
      showNotification?.(dict?.interviewNeedInputs || 'Add a letter and job description first.');
      return;
    }
    setLoading(true);
    setItems([]);
    try {
      const data = await generateInterviewQA(generatedLetter, jobDescription, contactInfo, {
        outputLanguage: UI_TO_PROMPT_LANG[uiLang] || 'English',
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showNotification?.(dict?.interviewError || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyBlock = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    showNotification?.(dict?.copied || 'Copied!');
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] p-6 md:p-8 custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white">{dict?.interviewTitle || 'Interview prep'}</h2>
          <p className="text-slate-500 text-sm mt-1">{dict?.interviewSubtitle || 'Practice Q&A from your letter and the job post.'}</p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !generatedLetter?.trim() || !jobDescription?.trim()}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 font-bold text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? (dict?.interviewLoading || 'Generating…') : (dict?.interviewGenerate || 'Generate questions')}
        </button>

        {!generatedLetter?.trim() && (
          <p className="text-sm text-amber-400/90">{dict?.interviewNeedLetter || 'Generate or load a cover letter from the dashboard first.'}</p>
        )}

        <div className="space-y-4">
          {items.map((row, i) => (
            <div key={i} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
              <p className="text-xs font-black uppercase tracking-wider text-indigo-400 mb-2">{dict?.interviewQuestion || 'Question'}</p>
              <p className="text-white font-medium mb-4">{row.question}</p>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">{dict?.interviewAnswer || 'Suggested answer'}</p>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{row.answer}</p>
              <button
                type="button"
                onClick={() => copyBlock(`${row.question}\n\n${row.answer}`, i)}
                className="mt-4 flex items-center gap-2 text-xs text-slate-400 hover:text-white"
              >
                {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIdx === i ? (dict?.copied || 'Copied') : (dict?.copyText || 'Copy')}
              </button>
            </div>
          ))}
        </div>

        {!loading && items.length === 0 && generatedLetter?.trim() && jobDescription?.trim() && (
          <p className="text-slate-600 text-sm text-center py-8">{dict?.interviewEmpty || 'Press generate to see questions.'}</p>
        )}
      </div>
    </div>
  );
}
