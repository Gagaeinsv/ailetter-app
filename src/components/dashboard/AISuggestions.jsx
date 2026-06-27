import React, { useEffect, useReducer, useState } from "react";
import { Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { generateSuggestions } from "../../gemini";

const initialState = { suggestions: [], loading: false, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'START':   return { suggestions: [], loading: true,  error: null };
    case 'SUCCESS': return { suggestions: action.payload, loading: false, error: null };
    case 'ERROR':   return { ...state, loading: false, error: action.payload };
    default:        return state;
  }
}

export default function AISuggestions({ coverLetter, jobDescription, dict }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [collapsed, setCollapsed] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    if (!coverLetter || !jobDescription) return;

    let cancelled = false;
    dispatch({ type: 'START' });

    const fetchSuggestions = async () => {
      try {
        const text = await generateSuggestions(coverLetter, jobDescription);
        if (cancelled) return;
        
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
          .slice(0, 3);
        
        dispatch({ type: 'SUCCESS', payload: lines });
      } catch (err) {
        console.error("AI Suggestions generation failed. Raw error details:", err);
        if (!cancelled) {
          dispatch({ type: 'ERROR', payload: dict?.suggestionsError || 'Could not load suggestions.' });
        }
      }
    };

    fetchSuggestions();

    return () => { cancelled = true; };
  }, [coverLetter, jobDescription, retryTrigger, dict?.suggestionsError]);

  const { suggestions, loading, error } = state;

  if (!coverLetter || !jobDescription) return null;

  return (
    <div className="mt-4 bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden shadow-md">
      {/* Header — clickable to collapse */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-[#334155]/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400 shrink-0" />
          <span className="text-sm font-semibold text-white">{dict?.suggestionsTitle || 'AI Suggestions'}</span>
          {!loading && suggestions.length > 0 && (
            <span className="text-[10px] font-black text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full">
              {suggestions.length}
            </span>
          )}
        </div>
        <svg
          width="14" height="14"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-gray-500 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="px-4 pb-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 size={13} className="animate-spin shrink-0" />
              <span>{dict?.suggestionsLoading || 'Analyzing your letter...'}</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-red-500/10 border border-red-500/25 rounded-lg text-sm text-red-400 my-1">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setRetryTrigger(prev => prev + 1)}
                className="flex items-center justify-center gap-1.5 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors active:scale-[0.98] self-start sm:self-auto shrink-0"
              >
                <RefreshCw size={11} />
                {dict?.suggestionsRetry || 'Retry Suggestions'}
              </button>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <ul className="space-y-2.5">
              {suggestions.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-300 leading-relaxed">
                  <span className="text-violet-400 mt-0.5 shrink-0 font-bold">›</span>
                  <span className="break-words">{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}