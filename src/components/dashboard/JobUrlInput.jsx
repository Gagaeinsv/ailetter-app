// src/components/dashboard/JobUrlInput.jsx
// Вставляється над або під textarea з описом вакансії

import React, { useState } from 'react';
import { Link2, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';

const JobUrlInput = ({ onParsed }) => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const isValidUrl = (str) => {
    try {
      const u = new URL(str);
      return u.protocol === 'https:' || u.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const handleFetch = async () => {
    if (!isValidUrl(url)) {
      setStatus('error');
      setErrorMsg('Enter a valid URL starting with https://');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/parse-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to load the page.');
        return;
      }

      setStatus('success');
      onParsed(data.text); // pass text up to parent (DashboardTab)
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleFetch();
  };

  const handleClear = () => {
    setUrl('');
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="mb-3">
      <div
        className={`flex items-center gap-2 bg-[#1e293b] border rounded-xl px-3 py-2 transition-all ${
          status === 'error'
            ? 'border-red-500/50'
            : status === 'success'
            ? 'border-green-500/40'
            : 'border-[#334155] focus-within:border-indigo-500/50'
        }`}
      >
        {/* Icon */}
        <Link2 className="w-4 h-4 text-gray-500 flex-shrink-0" />

        {/* Input */}
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Paste job URL (LinkedIn, Indeed, InfoJobs…)"
          className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none min-w-0"
        />

        {/* Clear */}
        {url && status !== 'loading' && (
          <button
            onClick={handleClear}
            className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Status icon */}
        {status === 'loading' && (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
        )}
        {status === 'error' && (
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
        )}

        {/* Button */}
        <button
          onClick={handleFetch}
          disabled={status === 'loading' || !url.trim()}
          className="flex-shrink-0 text-xs font-bold px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all"
        >
          {status === 'loading' ? 'Loading…' : 'Import'}
        </button>
      </div>

      {/* Error message */}
      {status === 'error' && errorMsg && (
        <p className="mt-1.5 text-xs text-red-400 px-1">{errorMsg}</p>
      )}

      {/* Success message */}
      {status === 'success' && (
        <p className="mt-1.5 text-xs text-green-400 px-1">
          ✓ Job description imported — check the text below and edit if needed.
        </p>
      )}
    </div>
  );
};

export default JobUrlInput;