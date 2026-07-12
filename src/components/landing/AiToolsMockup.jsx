// src/components/landing/AiToolsMockup.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';

const TOTAL_H = 420;
const CHROME_H = 33;
const BODY_H = TOTAL_H - CHROME_H;

const TABS = [
  { key: 'letter', icon: '📄' },
  { key: 'cvmaker', icon: '📝' },
  { key: 'ats', icon: '📊' },
  { key: 'interview', icon: '🎤' },
  { key: 'tracker', icon: '💼' },
  { key: 'outreach', icon: '✉️' },
];

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const AiToolsMockup = ({ t, activeTab, onChangeTab }) => {
  const [localTab, setLocalTab] = useState('letter');
  const tab = activeTab || localTab;
  const setTab = onChangeTab || setLocalTab;
  const [tick, setTick] = useState(0);
  const timerRef = useRef(null);

  // Gentle auto-rotate so it feels "alive" like HeroMockup.
  useEffect(() => {
    if (activeTab && onChangeTab) return; // parent handles it
    timerRef.current = setInterval(() => setTick((x) => x + 1), 3500);
    return () => clearInterval(timerRef.current);
  }, [activeTab, onChangeTab]);

  useEffect(() => {
    if (activeTab && onChangeTab) return; // parent handles it
    const idx = tick % TABS.length;
    setTab(TABS[idx].key);
  }, [tick, activeTab, onChangeTab]);

  const labels = useMemo(() => ({
    letter: t?.('dashboard') || 'Cover Letter',
    cvmaker: t?.('cvMaker') || 'CV Maker',
    ats: t?.('cvOptimizer') || 'CV Optimizer',
    interview: t?.('interview') || 'Interview Prep',
    tracker: t?.('jobtracker') || 'Job Tracker',
    outreach: t?.('navLinkedIn') || 'Outreach & Email',
    header: t?.('aiDemoHeader') || 'AI Job Search Suite — Example Output',
    aiDemoHint: t?.('aiDemoHint') || 'Tap a tool to preview example output.',
  }), [t]);

  const renderPanel = () => {
    if (tab === 'letter') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{labels.letter}</div>
            <div className="flex gap-1">
              {['Standard', 'Modern', 'Creative'].map((temp, i) => (
                <span key={temp} className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${i === 1 ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300' : 'bg-slate-900/50 border-white/5 text-slate-400'}`}>{temp}</span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#111827] shadow-xl p-4 text-[10.5px] leading-relaxed text-slate-300 space-y-3 font-serif max-h-[300px] overflow-hidden relative">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 font-sans not-italic">
              <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-black">AJ</span>
              <div>
                <div className="text-[10px] font-bold text-white">Alex Johnson</div>
                <div className="text-[8px] text-slate-500">Product Designer</div>
              </div>
            </div>
            <p className="italic text-slate-400">Dear Hiring Manager,</p>
            <p>
              I am writing to express my strong interest in the Product Designer position at Spotify. With 5 years of user experience design...
            </p>
            <p>
              At Figma, I spearheaded our design system migration, scaling component reuse by 45% and reducing developer handoff time.
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111827] to-transparent pointer-events-none" />
          </div>
        </div>
      );
    }

    if (tab === 'cvmaker') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{labels.cvmaker}</div>
            <div className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">✨ Magic AI Active</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#111827] shadow-xl p-3 text-[10.5px] leading-relaxed text-slate-300 space-y-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[9.5px] font-bold text-white">Alex Johnson — CV</span>
              <span className="text-[8.5px] text-indigo-400 font-bold">Template: Modern</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[9px] border-b border-white/5 pb-2">
              <div><span className="text-slate-500">Email:</span> alex@example.com</div>
              <div><span className="text-slate-500">Phone:</span> +1 234 567 890</div>
            </div>

            <div className="space-y-1">
              <div className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest">Work Experience</div>
              <div className="bg-[#1e293b]/40 rounded-lg p-2 border border-white/5 space-y-1">
                <div className="flex justify-between text-[9.5px] font-bold text-white">
                  <span>Product Designer</span>
                  <span className="text-slate-500">Spotify · Present</span>
                </div>
                <p className="text-[8.5px] text-slate-400 leading-normal">
                  • Led core UI redesign of Spotify's Web Player, boosting active user retention by 34%.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (tab === 'ats') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{labels.ats}</div>
            <div className="text-[10px] font-black text-emerald-400">ATS Score: 85%</div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#6366f1] to-emerald-400" style={{ width: '85%' }} />
          </div>
          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3 space-y-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 border-b border-white/5 pb-1.5">
              Bullet Point Optimizer
            </div>
            <div className="space-y-2">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase tracking-wider text-rose-400/90">Original Achievement</span>
                <p className="text-[10.5px] text-gray-400 leading-normal italic">
                  "Responsible for managing design files and updating style guide."
                </p>
              </div>
              <div className="space-y-0.5 pt-1.5 border-t border-white/5">
                <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400">AI-Optimized (ATS-Ready)</span>
                <p className="text-[10.5px] text-white leading-relaxed font-semibold">
                  "Spearheaded design system migration on Figma, scaling UI component reuse by 45% and reducing developer handoff time by 3 hours/week."
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Matched Keywords</span>
              <div className="flex flex-wrap gap-1">
                {['Figma', 'UI design'].map(k => (
                  <span key={k} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">{k}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.02] p-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 block mb-1">Missing Keywords</span>
              <div className="flex flex-wrap gap-1">
                {['design system', 'metrics'].map(k => (
                  <span key={k} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (tab === 'interview') {
      const items = [
        { q: 'Tell me about a time you worked with engineering under a tight deadline.', a: 'I align on scope early, define success metrics, and ship in iterations with clear trade-offs.' },
        { q: 'How do you measure design impact?', a: 'I define a baseline, track adoption/retention, and pair quantitative data with qualitative feedback.' },
      ];
      return (
        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{labels.interview}</div>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-3">
                <div className="text-xs font-bold text-white mb-1">{it.q}</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">{it.a}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (tab === 'tracker') {
      const trackerJobs = [
        { company: 'Google', role: 'Senior Designer', status: 'Interview', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' },
        { company: 'Spotify', role: 'Product Designer', status: 'Applied', color: 'bg-sky-500/10 text-sky-300 border-sky-500/20' },
        { company: 'Stripe', role: 'Lead UX Designer', status: 'Offer', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
      ];
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{labels.tracker}</div>
            <div className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">⏰ Follow-up ready</div>
          </div>
          <div className="space-y-2">
            {trackerJobs.map((job, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900/80 transition-all">
                <div>
                  <div className="text-xs font-bold text-white">{job.company}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{job.role}</div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${job.color}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-white">Time to follow up!</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Applied to Spotify 7 days ago. Click to generate follow-up email.</div>
            </div>
          </div>
        </div>
      );
    }

    // outreach (LinkedIn Outreach & Subject Lines)
    const styles = [
      { k: 'Formal Subject', c: 'border-blue-500/20 bg-blue-500/5 text-blue-200' },
      { k: 'Direct Subject', c: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-200' },
    ];
    const lines = [
      'Alex Johnson — Senior Product Designer (Spotify)',
      'Senior Product Designer — Spotify — Alex Johnson',
    ];

    return (
      <div className="space-y-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{labels.outreach}</div>
        <div className="rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-sky-500/10 pb-1">
            <span className="text-[8px] font-black uppercase tracking-wider text-sky-400">LinkedIn Easy Apply Intro</span>
            <span className="text-[8px] text-sky-400/70 font-semibold">Copy ready ✓</span>
          </div>
          <p className="text-[10.5px] text-slate-200 leading-relaxed italic">
            "Hi — the part of your JD about simplifying complex workflows stood out. I’ve shipped UX improvements end‑to‑end and I’m comfortable partnering tightly with engineering to hit deadlines."
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {styles.map((s, i) => (
            <div key={s.k} className={['rounded-xl border p-2.5', s.c].join(' ')}>
              <div className="text-[8px] font-black uppercase tracking-widest opacity-90 mb-1">{s.k}</div>
              <div className="text-[10px] font-semibold text-white truncate">{lines[clamp(i, 0, lines.length - 1)]}</div>
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
        <div className="w-[145px] shrink-0 border-r border-white/5 p-3.5 space-y-2.5">
          <div className="text-[9px] font-black text-slate-500 tracking-wider">AI SUITE PREVIEW</div>
          {TABS.map((t1) => (
            <button
              type="button"
              key={t1.key}
              onClick={() => setTab(t1.key)}
              className={[
                'w-full text-left rounded-xl px-2.5 py-2 flex items-center gap-2 transition-all',
                tab === t1.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-500 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              <span className="text-sm shrink-0">{t1.icon}</span>
              <span className="text-[10.5px] font-black truncate">{labels[t1.key]}</span>
            </button>
          ))}
          <div className="mt-auto pt-4 text-[9px] text-slate-600 leading-normal border-t border-white/5 font-medium">
            {labels.aiDemoHint}
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
