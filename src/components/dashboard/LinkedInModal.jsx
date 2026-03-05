import React, { useState } from 'react';
import { Linkedin, Copy, Check, X, Sparkles, Loader2, Lock } from 'lucide-react';
import { generateLinkedInVersion } from '../../gemini';

const LinkedInModal = ({ onClose, coverLetter, contactInfo, jobDescription, isPro, setShowUpgrade }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const MAX_CHARS = 300;
  const remaining = MAX_CHARS - text.length;
  const isOverLimit = remaining < 0;

  const handleGenerate = async () => {
    if (!isPro) { onClose(); setShowUpgrade(true); return; }
    setLoading(true);
    setError('');
    try {
      const result = await generateLinkedInVersion(coverLetter, contactInfo, jobDescription);
      setText(result.trim());
    } catch (e) {
      setError('AI is busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0077b5] rounded-xl flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">LinkedIn Note</h2>
              <p className="text-slate-400 text-xs">Short connection message · max 300 chars</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-[#334155] rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {!isPro && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-300">LinkedIn Note is a <span className="font-bold">Pro</span> feature. Upgrade to generate.</p>
            </div>
          )}

          {/* Text area */}
          <div className="relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={isPro ? "Click Generate to create your LinkedIn note..." : "Upgrade to Pro to use this feature."}
              disabled={!isPro}
              rows={5}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-4 text-sm text-slate-200 focus:border-indigo-500 outline-none resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {/* Char counter */}
            {text && (
              <span className={`absolute bottom-3 right-3 text-[10px] font-bold ${isOverLimit ? 'text-red-400' : remaining < 50 ? 'text-amber-400' : 'text-slate-500'}`}>
                {remaining}
              </span>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {isOverLimit && (
            <p className="text-xs text-red-400">Message is too long. LinkedIn limit is 300 characters.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 rounded-xl font-bold text-sm text-white transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Generate'}
          </button>

          {text && !isOverLimit && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-3 bg-[#0f172a] hover:bg-[#334155] border border-[#334155] rounded-xl text-sm font-bold text-slate-300 hover:text-white transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default LinkedInModal;