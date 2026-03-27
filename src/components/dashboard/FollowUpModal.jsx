// src/components/dashboard/FollowUpModal.jsx
import React, { useState } from 'react';
import { X, Copy, Check, Sparkles } from 'lucide-react';
import { generateFollowUp } from '../../gemini';

const FollowUpModal = ({ entry, contactInfo, onClose, onSent, showNotification }) => {
  const [text, setText]     = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState('');

  const daysSince = entry.sentDate
    ? Math.floor((Date.now() - new Date(entry.sentDate).getTime()) / (1000 * 60 * 60 * 24))
    : 7;

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateFollowUp(
        entry.text,
        entry.jobDescription || entry.job,
        contactInfo,
        daysSince
      );
      setText(result);
    } catch (err) {
      console.error(err);
      setError('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkSent = () => {
    onSent();
    showNotification('Follow-up marked as sent ✓');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div>
            <h2 className="text-white font-bold text-sm flex items-center gap-2">
              ⏰ Follow-up Email
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {daysSince} days since you applied to <span className="text-amber-400">{entry.company}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Generated text */}
          {text ? (
            <div className="relative">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={8}
                className="w-full bg-[#1e293b] border border-[#334155] text-gray-200 text-sm rounded-xl p-4 resize-none outline-none focus:border-indigo-500/50 transition-all leading-relaxed"
              />
            </div>
          ) : (
            <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-sm text-gray-500 leading-relaxed">
              Click <span className="text-white font-bold">Generate</span> to create a short, professional follow-up email based on your original cover letter.
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-all"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> {text ? 'Regenerate' : 'Generate'}</>
              )}
            </button>

            {text && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-xl transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {/* Mark as sent */}
          {text && (
            <button
              onClick={handleMarkSent}
              className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              ✓ Mark follow-up as sent (dismiss reminder)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;