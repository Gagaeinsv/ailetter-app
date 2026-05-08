// src/components/landing/AiToolsMockup.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';

const TOTAL_H = 420;
const CHROME_H = 33;
const BODY_H = TOTAL_H - CHROME_H;

const TABS = [
  { key: 'ats', icon: '📊' },
  { key: 'interview', icon: '🎤' },
  { key: 'linkedin', icon: '💼' },
  { key: 'subject', icon: '✉️' },
];

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const AiToolsMockup = ({ t }) => {
  const [tab, setTab] = useState('ats');
  const [tick, setTick] = useState(0);
  const timerRef = useRef(null);

  // Gentle auto-rotate so it feels "alive" like HeroMockup.
  useEffect(() => {
    timerRef.current = setInterval(() => setTick((x) => x + 1), 3500);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const idx = tick % TABS.length;
    setTab(TABS[idx].key);
  }, [tick]);

  const labels = useMemo(() => ({
    ats: t?.('ai1T') || 'ATS score & keyword gaps',
    interview: t?.('ai2T') || 'Interview Q&A',
    linkedin: t?.('ai3T') || 'LinkedIn Easy Apply message',
    subject: t?.('ai4T') || 'Email subject lines',
    header: t?.('aiDemoHeader') || 'AI tools — Example output',
  }), [t]);

  const renderPanel = () => {
    if (tab === 'ats') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{labels.ats}</div>
            <div className="text-[10px] font-black text-emerald-400">Score: 78</div>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400" style={{ width: '78%' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300/90 mb-2">Matched</div>
              <div className="flex flex-wrap gap-1.5">
                {['stakeholder', 'Figma', 'UX research', 'prototypes'].map((k) => (
                  <span key={k} className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-200 border border-emerald-500/10">{k}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-300/90 mb-2">Missing</div>
              <div className="flex flex-wrap gap-1.5">
                {['accessibility', 'design systems', 'metrics'].map((k) => (
                  <span key={k} className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-200 border border-amber-500/10">{k}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Quick tips</div>
            <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <div>Include “design systems” once in the 2nd paragraph.</div>
              <div>Add one accessibility example (WCAG, contrast, keyboard nav).</div>
            </div>
          </div>
        </div>
      );
    }

    if (tab === 'interview') {
      const items = [
        { q: 'Tell me about a time you worked with engineering under a tight deadline.', a: 'I align on scope early, define success metrics, and ship in iterations with clear trade-offs.' },
        { q: 'How do you measure design impact?', a: 'I define a baseline, track adoption/retention, and pair quantitative data with qualitative feedback.' },
        { q: 'How do you handle stakeholder conflict?', a: 'I restate goals, show options with risks, and make the decision explicit with a clear owner.' },
      ];
      return (
        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{labels.interview}</div>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-3">
                <div className="text-xs font-bold text-white mb-1">{it.q}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{it.a}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (tab === 'linkedin') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{labels.linkedin}</div>
            <div className="text-[10px] font-black text-sky-300">~180 words</div>
          </div>
          <div className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
            Hi — the part of your JD about simplifying complex workflows stood out.
            {'\n\n'}
            I’ve shipped UX improvements end‑to‑end (research → prototypes → delivery) and I’m comfortable partnering tightly with engineering to hit deadlines without sacrificing quality.
            {'\n\n'}
            If helpful, I can share a short case study on a redesign that improved retention and reduced time‑to‑task. Happy to chat.
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 text-[10px] text-slate-400 font-bold">Copy</div>
            <div className="flex-1 rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 text-[10px] text-slate-400 font-bold">Regenerate</div>
          </div>
        </div>
      );
    }

    // subject
    const styles = [
      { k: 'Formal', c: 'border-blue-500/20 bg-blue-500/5 text-blue-200' },
      { k: 'Direct', c: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-200' },
      { k: 'Creative', c: 'border-purple-500/20 bg-purple-500/5 text-purple-200' },
    ];
    const lines = [
      'Alex Johnson — Senior Product Designer (Spotify)',
      'Senior Product Designer — Spotify — Alex Johnson',
      'Design systems + research — Spotify (Alex Johnson)',
    ];

    return (
      <div className="space-y-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{labels.subject}</div>
        <div className="space-y-2">
          {styles.map((s, i) => (
            <div key={s.k} className={['rounded-xl border p-3', s.c].join(' ')}>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-90 mb-1">{s.k}</div>
              <div className="text-xs font-semibold text-white">{lines[clamp(i, 0, lines.length - 1)]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: TOTAL_H, maxHeight: TOTAL_H }}>
      {/* Window chrome */}
      <div className="bg-[#1e293b] border-b border-white/[0.06] px-4 flex items-center gap-2" style={{ height: CHROME_H }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="flex-1 text-center text-[10px] text-slate-500 font-bold tracking-wider">{labels.header}</span>
      </div>

      <div className="flex" style={{ height: BODY_H, maxHeight: BODY_H }}>
        <div className="w-[150px] shrink-0 border-r border-white/5 p-3 space-y-2">
          <div className="text-[10px] font-black text-white tracking-tight">AILETTER</div>
          {TABS.map((t1) => (
            <button
              type="button"
              key={t1.key}
              onClick={() => setTab(t1.key)}
              className={[
                'w-full text-left rounded-xl px-3 py-2 flex items-center gap-2 transition-all',
                tab === t1.key ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              <span className="text-sm">{t1.icon}</span>
              <span className="text-[11px] font-black">{labels[t1.key]}</span>
            </button>
          ))}
          <div className="mt-auto pt-3 text-[10px] text-slate-500">
            {t?.('aiDemoHint') || 'Tap a tool to preview example output.'}
          </div>
        </div>

        <div className="flex-1 min-w-0 p-4 bg-[#0b1120] overflow-hidden">
          <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
            {renderPanel()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiToolsMockup;

