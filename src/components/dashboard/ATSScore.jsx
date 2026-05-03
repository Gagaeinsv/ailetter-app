import React, { useEffect, useReducer } from 'react';
import { Loader2, Target } from 'lucide-react';
import { analyzeATSScore } from '../../gemini';

const initial = { data: null, loading: false, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { data: null, loading: true, error: null };
    case 'OK':
      return { data: action.payload, loading: false, error: null };
    case 'ERR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function ATSScore({ coverLetter, jobDescription, dict }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    if (!coverLetter?.trim() || !jobDescription?.trim()) {
      dispatch({ type: 'OK', payload: null });
      return;
    }
    let cancelled = false;
    dispatch({ type: 'START' });
    analyzeATSScore(coverLetter, jobDescription)
      .then((data) => {
        if (!cancelled) dispatch({ type: 'OK', payload: data });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'ERR', payload: dict?.atsError || 'Could not analyze.' });
      });
    return () => { cancelled = true; };
  }, [coverLetter, jobDescription, dict?.atsError]);

  if (!coverLetter?.trim() || !jobDescription?.trim()) return null;

  const { data, loading, error } = state;

  return (
    <div className="mt-4 bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#334155]/80">
        <Target className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-sm font-semibold text-white">{dict?.atsTitle || 'ATS match'}</span>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400 ml-auto" />}
      </div>
      <div className="px-4 pb-4 pt-3">
        {loading && (
          <p className="text-sm text-slate-400">{dict?.atsLoading || 'Analyzing…'}</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && data && (
          <div className="space-y-3 text-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-slate-500">{dict?.atsScoreLabel || 'Score'}</span>
              <span className="text-2xl font-black text-emerald-400 tabular-nums">{data.score ?? '—'}</span>
              <span className="text-slate-600">/100</span>
            </div>
            {(data.matchedKeywords?.length > 0) && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{dict?.atsMatched || 'Matched'}</p>
                <p className="text-slate-300 leading-relaxed">{data.matchedKeywords.join(', ')}</p>
              </div>
            )}
            {(data.missingKeywords?.length > 0) && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80 mb-1">{dict?.atsMissing || 'Could strengthen'}</p>
                <p className="text-slate-400 leading-relaxed">{data.missingKeywords.join(', ')}</p>
              </div>
            )}
            {data.tip && (
              <p className="text-slate-400 border-t border-[#334155] pt-3 mt-2">
                <span className="text-indigo-400 font-medium">{dict?.atsTipLabel || 'Tip'}: </span>
                {data.tip}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
