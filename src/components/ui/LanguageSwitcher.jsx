import { useState, useRef, useEffect } from 'react';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'uk', label: 'UA' },
  { code: 'it', label: 'IT' },
  { code: 'de', label: 'DE' },
];

const LanguageSwitcher = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Закриття при кліку поза компонентом
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
      
      {/* Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl 
                   bg-[#1e293b] border border-white/10 
                   text-sm font-bold uppercase tracking-wide
                   hover:bg-[#273449] transition-all
                   focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        {current.label}
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-28 rounded-xl overflow-hidden
                        bg-[#1e293b] border border-white/10 shadow-2xl
                        animate-in fade-in zoom-in-95 z-50">
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-semibold uppercase
                         transition-colors
                         ${value === lang.code
                           ? 'bg-indigo-600 text-white'
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