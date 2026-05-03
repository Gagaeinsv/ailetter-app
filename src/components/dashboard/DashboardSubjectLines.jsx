import React, { useReducer, useEffect, useState } from 'react';
import { Mail, Loader2, Copy, Check } from 'lucide-react';
import { generateSubjectLines } from '../../gemini';

const UI_TO_PROMPT_LANG = { en: 'English', uk: 'Ukrainian', it: 'Italian', de: 'German' };

const initialState = { lines: [], loading: false, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { lines: [], loading: true, error: null };
    case 'SUCCESS':
      return { lines: action.payload, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

function normalizeLines(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, i) => {
      if (typeof item === 'string') {
        const styles = ['Formal', 'Direct', 'Creative'];
        return { style: styles[i] || '', subject: item };
      }
      return {
        style: item?.style || '',
        subject: item?.subject || '',
      };
    })
    .filter((r) => r.subject?.trim());
}

export default function DashboardSubjectLines({
  coverLetter,
  jobDescription,
  contactInfo,
  uiLang,
  dict,
  triggerKey = 0,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    if (!coverLetter?.trim() || !jobDescription?.trim()) return;

    let cancelled = false;
    dispatch({ type: 'START' });

    generateSubjectLines(
      coverLetter,
      jobDescription,
      contactInfo || {},
      { outputLanguage: UI_TO_PROMPT_LANG[uiLang] || 'English' },
    )
      .then((data) => {
        if (!cancelled) dispatch({ type: 'SUCCESS', payload: normalizeLines(data) });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'ERROR', payload: dict?.subjectError || 'Could not generate subject lines.' });
      });

    return () => {
      cancelled = true;
    };
  }, [coverLetter, jobDescription, contactInfo, uiLang, dict?.subjectError, triggerKey]);

  const tTitle = dict?.dashSubjectLinesTitle || dict?.subjectPageTitle?.split(',')[0]?.trim() || 'Email subject lines';

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!coverLetter?.trim() || !jobDescription?.trim()) return null;

  const { lines, loading, error } = state;

  return (
    <div className="mt-4 bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
      <div className="w-full flex items-center justify-between gap-2 px-4 py-3 border-b border-[#334155]/60">
        <div className="flex items-center gap-2 min-w-0">
          <Mail size={14} className="text-sky-400 shrink-0" />
          <span className="text-sm font-semibold text-white truncate">{tTitle}</span>
        </div>
        {!loading && lines.length > 0 && (
          <span className="text-[10px] font-black text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full shrink-0">
            {lines.length}
          </span>
        )}
      </div>

      <div className="px-4 pb-4 pt-3">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 size={13} className="animate-spin shrink-0" />
            <span>{dict?.subjectGenerating || 'Generating…'}</span>
          </div>
        )}

        {error && <p className="text-sm text-red-400 py-1">{error}</p>}

        {!loading && lines.length > 0 && (
          <ul className="space-y-2.5 mt-1">
            {lines.map((row, idx) => (
              <li
                key={idx}
                className="flex gap-2 items-start text-sm rounded-lg bg-[#0f172a]/80 border border-[#334155]/50 p-3"
              >
                <span className="text-[10px] font-black uppercase text-slate-500 shrink-0 mt-0.5 w-16">
                  {row.style || `#${idx + 1}`}
                </span>
                <span className="text-gray-200 break-words flex-1">{row.subject}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(row.subject, idx)}
                  className="shrink-0 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#334155]/50 transition-colors"
                  title={dict?.subjectCopy || 'Copy'}
                >
                  {copiedIdx === idx ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && lines.length === 0 && !error && (
          <p className="text-xs text-slate-500 italic">{dict?.dashSubjectLinesEmpty || dict?.subjectHint || ''}</p>
        )}
      </div>
    </div>
  );
}
