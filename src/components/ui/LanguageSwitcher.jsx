import { useState, useRef, useEffect } from 'react';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'uk', label: 'UA' },
  { code: 'it', label: 'IT' },
  { code: 'de', label: 'DE' },
];

const LanguageSwitcher = ({ value, onChange, variant = 'dark' }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const isLight = variant === 'light';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGS.find(l => l.code === value) || LANGS[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
          isLight
            ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            : 'bg-[#1e293b] border border-white/10 text-sm text-white hover:bg-[#273449]'
        }`}
      >
        {current.label}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute right-0 mt-2 w-28 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 z-50 ${
            isLight
              ? 'bg-white border border-slate-200 shadow-lg'
              : 'bg-[#1e293b] border border-white/10 shadow-2xl'
          }`}
        >
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-xs font-bold uppercase transition-colors ${
                value === lang.code
                  ? 'bg-indigo-600 text-white'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-gray-300 hover:bg-[#273449] hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
