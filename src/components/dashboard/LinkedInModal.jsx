import React, { useState, useRef } from 'react';
import { X, Linkedin, Copy, Check, Sparkles, Lock } from 'lucide-react';
import { generateLinkedInVersion } from '../../gemini';

const LinkedInModal = ({
  onClose,
  coverLetter,
  contactInfo,
  jobDescription,
  isPro,
  setShowUpgrade
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const textareaRef = useRef(null);

  const wordCount = message.trim()
    ? message.trim().split(/\s+/).length
    : 0;

  const handleGenerate = async () => {
    if (!isPro) {
      onClose();
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await generateLinkedInVersion(
        coverLetter,
        jobDescription,
        contactInfo
      );

      setMessage(result);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height =
            textareaRef.current.scrollHeight + 'px';
        }
      }, 0);
    } catch (err) {
      setError('Generation failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextarea = (e) => {
    setMessage(e.target.value);

    const el = textareaRef.current;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0077b5]/15 flex items-center justify-center">
              <Linkedin className="w-4 h-4 text-[#0077b5]" />
            </div>

            <div>
              <h2 className="text-white font-bold text-sm">
                LinkedIn Easy Apply Message
              </h2>
              <p className="text-gray-500 text-xs">
                ~150–200 words, ready to paste
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Explanation */}
          {!message && !loading && (
            <div className="bg-[#0077b5]/8 border border-[#0077b5]/20 rounded-xl p-4 text-sm text-gray-400 leading-relaxed">
              Generates a concise cover message for the{' '}
              <span className="text-[#0077b5] font-semibold">
                LinkedIn Easy Apply
              </span>{' '}
              field — short, impactful, and tailored to the job description you entered.
            </div>
          )}

          {/* Pro gate */}
          {!isPro && (
            <div className="flex items-center gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
              <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                LinkedIn Easy Apply message is a{' '}
                <span className="font-bold">Pro</span> feature.
              </p>
            </div>
          )}

          {/* Generated message */}
          {message && (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextarea}
                className="w-full min-h-[120px] max-h-[320px] overflow-y-auto bg-[#1e293b] border border-[#334155] text-gray-200 text-sm rounded-xl p-4 resize-none focus:outline-none focus:border-[#0077b5]/50 leading-relaxed"
              />

              <div className="absolute bottom-3 right-3 text-xs text-gray-600">
                {wordCount} words
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 text-center">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0077b5] hover:bg-[#006097] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-all text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {message ? 'Regenerate' : 'Generate'}
                </>
              )}
            </button>

            {message && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 rounded-xl transition-all text-sm"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}

                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {/* Tip */}
          {message && (
            <p className="text-xs text-gray-600 text-center">
              Paste this in the{' '}
              <span className="text-gray-500">Cover Letter</span>{' '}
              field when applying via LinkedIn Easy Apply.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedInModal;