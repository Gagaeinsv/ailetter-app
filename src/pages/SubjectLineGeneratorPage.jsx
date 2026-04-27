import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSubjectLines } from '../gemini';

const LINKEDIN_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Email Subject Line Generator for Job Applications',
  url: 'https://ailetter.pro/subject-line',
  description: 'Generate 3 compelling email subject lines for your job application in seconds. Free, no sign-up required.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};

const IconCopy    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const IconCheck   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IconMagic   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>;

const STYLE_COLORS = {
  Formal:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400'   },
  Direct:   { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  Creative: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
};

export default function SubjectLineGeneratorPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [name, setName]                     = useState('');
  const [results, setResults]               = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [copiedIdx, setCopiedIdx]           = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let sd = document.querySelector('#ailetter-subject-schema');
    if (!sd) { sd = document.createElement('script'); sd.id = 'ailetter-subject-schema'; sd.type = 'application/ld+json'; document.head.appendChild(sd); }
    sd.textContent = JSON.stringify(LINKEDIN_SCHEMA);
    return () => { try { document.head.removeChild(sd); } catch(e) {} };
  }, []);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const data = await generateSubjectLines('', jobDescription, { fullName: name });
      setResults(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center px-4 py-12">

      {/* HEADER */}
      <div className="max-w-2xl w-full mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Free Tool
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          Email Subject Line Generator
        </h1>
        <p className="text-gray-400 mb-3">
          Paste the job description and get 3 compelling subject lines — formal, direct, and creative. Stand out in the recruiter's inbox.
        </p>
        <p className="text-xs text-gray-500">
          Free · No sign-up ·{' '}
          <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300 underline">
            Need a full cover letter? →
          </button>
        </p>
      </div>

      {/* INPUTS */}
      <div className="w-full max-w-2xl space-y-4">
        <input
          type="text"
          placeholder="Your full name (optional, for personalisation)"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#6366f1] transition-colors"
        />
        <textarea
          className="w-full bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-white resize-none text-sm outline-none focus:border-[#6366f1] transition-colors"
          rows={6}
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !jobDescription.trim()}
          className="w-full bg-[#6366f1] hover:bg-[#5458ee] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          {loading ? (
            <><span className="animate-spin inline-block text-lg">⟳</span> Generating…</>
          ) : (
            <><IconMagic /> Generate Subject Lines</>
          )}
        </button>
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      </div>

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="w-full max-w-2xl mt-8 space-y-3">
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4">Your subject lines:</h2>
          {results.map((r, i) => {
            const c = STYLE_COLORS[r.style] || STYLE_COLORS.Formal;
            return (
              <div key={i} className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${c.bg} ${c.border}`}>
                <div className="flex-1 min-w-0">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${c.text} block mb-1`}>{r.style}</span>
                  <p className="text-white font-semibold text-sm truncate">{r.subject}</p>
                </div>
                <button
                  onClick={() => handleCopy(r.subject, i)}
                  className="shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  {copiedIdx === i ? <IconCheck /> : <IconCopy />}
                </button>
              </div>
            );
          })}

          {/* CTA */}
          <div className="mt-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-sm">Now write the cover letter to match</p>
              <p className="text-xs text-gray-400 mt-0.5">Upload your CV + job description → tailored letter in 30 seconds.</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-[#6366f1] hover:bg-[#5458ee] px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all active:scale-95"
            >
              Try AIletter →
            </button>
          </div>
        </div>
      )}

      {/* SEO EXAMPLES */}
      <div className="w-full max-w-2xl mt-16 space-y-6">
        <h2 className="text-xl font-semibold text-center">
          Example Email Subject Lines for Job Applications
        </h2>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="bg-[#1e293b] p-4 rounded-xl">
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Formal</span>
            Application for Senior Product Manager — Alex Morgan
          </div>
          <div className="bg-[#1e293b] p-4 rounded-xl">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Direct</span>
            5 Years of Product Leadership → Ideal for Your PM Role
          </div>
          <div className="bg-[#1e293b] p-4 rounded-xl">
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1">Creative</span>
            Grew ARR 3× — Excited to Do the Same at [Company]
          </div>
        </div>

        <div className="prose prose-invert prose-sm max-w-none text-gray-500 space-y-3 text-xs leading-relaxed border-t border-[#1e293b] pt-6">
          <p>A strong email subject line is the difference between your application being opened or ignored. Recruiters receive dozens of applications daily — a generic "Job Application" subject line gets lost instantly.</p>
          <p>The best subject lines are specific, confident, and under 60 characters. Reference the role, your name, and ideally a concrete value you bring.</p>
          <p>AIletter's subject line generator analyzes the job description to create three distinct styles tailored to the role and company.</p>
        </div>
      </div>

    </div>
  );
}
