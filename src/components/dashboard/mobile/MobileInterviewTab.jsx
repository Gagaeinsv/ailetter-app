import React, { useState } from 'react';
import { generateInterviewQA } from '../../../gemini';

const IconMagic   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>;
const IconChevron = ({ open }) => (
  <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
);

const QACard = ({ item, index }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`border rounded-xl transition-all ${open ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-[#334155] bg-[#1e293b]/60'}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 w-5 h-5 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center text-[9px] font-black text-indigo-400">{index + 1}</span>
          <span className="font-semibold text-xs text-white line-clamp-2">{item.q}</span>
        </div>
        <span className={open ? 'text-indigo-400' : 'text-gray-600'}><IconChevron open={open} /></span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-xs text-gray-300 leading-relaxed border-t border-[#334155]/50 pt-3">
          {item.a}
        </div>
      )}
    </div>
  );
};

const MobileInterviewTab = ({ jobDescription, generatedLetter, contactInfo, dict }) => {
  const [qa, setQa]               = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [generated, setGenerated] = useState(false);

  const hasContent = jobDescription || generatedLetter;

  const handleGenerate = async () => {
    if (!hasContent) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateInterviewQA(generatedLetter || '', jobDescription || '', contactInfo);
      setQa(data);
      setGenerated(true);
    } catch {
      setError('AI is busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] px-4 py-6 pb-24 custom-scrollbar">
      <h2 className="text-2xl font-black text-white mb-1">Interview Prep</h2>
      <p className="text-xs text-slate-500 mb-6">Personalized questions &amp; answers based on your application.</p>

      {!generated && (
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 mb-6">
          <div className="text-3xl mb-3">🎤</div>
          <h3 className="font-black text-white text-sm mb-1">Ready to prep?</h3>
          <p className="text-xs text-slate-400 mb-4">
            {hasContent
              ? '8 personalized questions with ideal answers based on your cover letter and the job.'
              : 'Generate a cover letter in the Create tab first.'}
          </p>
          {hasContent ? (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 bg-[#6366f1] disabled:opacity-50 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {loading
                ? <><span className="animate-spin text-base">⟳</span> Generating…</>
                : <><IconMagic /> Generate Questions</>}
            </button>
          ) : (
            <p className="text-[11px] text-amber-400">⚠ Paste a job description in the Create tab first</p>
          )}
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
      )}

      {qa.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500">{qa.length} questions</p>
            <button onClick={handleGenerate} disabled={loading} className="text-xs text-indigo-400 font-bold flex items-center gap-1 disabled:opacity-50">
              <IconMagic /> Regenerate
            </button>
          </div>
          <div className="space-y-2 mb-6">
            {qa.map((item, i) => <QACard key={i} item={item} index={i} />)}
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4">
            <p className="font-black text-white text-xs mb-2">💡 Quick Tips</p>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>✓ Use STAR: Situation, Task, Action, Result</li>
              <li>✓ Prepare 2-3 examples with real numbers</li>
              <li>✓ Research the company before the call</li>
              <li>✓ Prepare 3 questions to ask them</li>
            </ul>
          </div>
        </>
      )}

      {!generated && !loading && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🎯', title: 'Role-specific', desc: 'From actual JD requirements' },
            { icon: '💬', title: 'Behavioral', desc: '"Tell me about a time..."' },
            { icon: '🧠', title: 'Technical', desc: 'Skills & knowledge checks' },
            { icon: '✍️', title: 'Personalized', desc: 'Based on your background' },
          ].map((c, i) => (
            <div key={i} className="bg-[#1e293b] border border-[#334155] rounded-xl p-3">
              <span className="text-lg block mb-1">{c.icon}</span>
              <p className="font-bold text-white text-xs">{c.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{c.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileInterviewTab;
