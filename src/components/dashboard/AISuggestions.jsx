import React, { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { generateSuggestions } from "../../gemini";

export default function AISuggestions({ coverLetter, jobDescription }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coverLetter || !jobDescription) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSuggestions([]);

    generateSuggestions(coverLetter, jobDescription)
      .then((text) => {
        if (cancelled) return;
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
          .slice(0, 3);
        setSuggestions(lines);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load suggestions.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [coverLetter, jobDescription]);

  if (!coverLetter || !jobDescription) return null;

  return (
    <div className="mt-4 bg-[#1e293b] border border-[#334155] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-white">AI Suggestions</span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Analyzing your letter...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!loading && suggestions.length > 0 && (
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300">
              <span className="text-violet-400 mt-0.5">›</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
