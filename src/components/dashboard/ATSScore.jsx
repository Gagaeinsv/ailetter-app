import React, { useState, useEffect } from 'react';
import { analyzeATSScore } from '../../gemini';

const ATSScore = ({ coverLetter, jobDescription, triggerKey, dict, onIntegrateKeyword }) => {
  const t = (k, fb) => dict?.[k] || fb;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualRetryToken, setManualRetryToken] = useState(0);

  useEffect(() => {
    if (!coverLetter?.trim() || !jobDescription?.trim()) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    analyzeATSScore(coverLetter, jobDescription)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('ATS analyze failed:', err);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [triggerKey, manualRetryToken, coverLetter, jobDescription]);

  if (!coverLetter?.trim() || !jobDescription?.trim()) return null;

  const matched = data?.matched ?? data?.matchedKeywords ?? [];
  const missing = data?.missing ?? data?.missingKeywords ?? [];

  const color = data
    ? data.score >= 75 ? '#22c55e'
      : data.score >= 50 ? '#f59e0b'
        : '#ef4444'
    : '#6366f1';

  const label = data
    ? data.score >= 75 ? t('atsGreat', 'Great match')
      : data.score >= 50 ? t('atsFair', 'Fair match')
        : t('atsWeak', 'Weak match')
    : '';

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-xs font-black text-white uppercase tracking-wider">{t('atsTitle', 'ATS Match Score')}</span>
        </div>
        {loading && (
          <span className="text-[10px] text-slate-500 animate-pulse">{t('atsAnalyzing', 'Analyzing…')}</span>
        )}
      </div>

      {loading && (
        <div className="h-2 rounded-full bg-[#334155] overflow-hidden">
          <div className="h-full bg-[#6366f1]/40 animate-pulse rounded-full w-2/3" />
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-slate-500">{t('atsError', 'Could not analyze. Try again later.')}</p>
          <button
            type="button"
            onClick={() => { setManualRetryToken((x) => x + 1); }}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 shrink-0 self-start sm:self-auto"
          >
            {t('atsRetry', 'Try again')}
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-[#334155] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${data.score}%`, background: color }}
              />
            </div>
            <span className="text-lg font-black tabular-nums" style={{ color }}>{data.score}%</span>
          </div>

          <p className="text-[11px] font-bold" style={{ color }}>{label}</p>

          <div className="space-y-2">
             {matched.length > 0 && (
              <div>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{t('atsMatched', '✓ Matched')}</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {matched.map((kw, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium transition-all duration-200 hover:scale-105 cursor-default">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {missing.length > 0 && (
              <div>
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">{t('atsMissing', '⚠ Missing')}</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {missing.map((kw, i) => (
                    <span
                      key={i}
                      onClick={() => onIntegrateKeyword?.(kw)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium transition-all duration-200 hover:scale-105 cursor-pointer hover:bg-amber-500/20"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {data.tip && (
            <p className="text-[11px] text-slate-400 italic border-t border-[#334155] pt-2">
              <span className="text-indigo-400 font-medium not-italic">{t('atsTipLabel', 'Tip')}: </span>
              {data.tip}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ATSScore;
