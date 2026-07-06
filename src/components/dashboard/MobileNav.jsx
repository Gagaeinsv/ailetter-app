import React, { useState } from 'react';
import { IconMagic } from '../ui/Icons';

const IconHome     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
const IconGrid     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconClock    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconUser     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconX        = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconLogOut   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconStar     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconGlobe    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconLinkedin = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
const IconInterview = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IconMail = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconCV = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

const LANGS = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
];

const MobileNav = ({ activeTab, setActiveTab, dict, logout, isPro, setShowUpgrade, uiLang, setUiLang }) => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: <IconHome />, label: dict?.dashboard || 'Overview' },
    { id: 'cover-letter', icon: <IconMagic />, label: dict?.coverLetterTab || 'Cover Letter' },
    { id: 'cv-optimizer', icon: <IconCV />, label: dict?.cvOptimizer || 'CV Optimizer' },
    { id: 'templates', icon: <IconGrid />, label: dict?.templates || 'Templates' },
    { id: 'history', icon: <IconClock />, label: dict?.history || 'History' },
    { id: 'interview', icon: <IconInterview />, label: dict?.interview || 'Interview' },
    { id: 'jobtracker', icon: <span className="text-base leading-none">📋</span>, label: dict?.jobtracker || 'Tracker' },
    { id: 'settings', icon: <IconUser />, label: dict?.settings || 'Profile' },
  ];

  const bottomNavItems = [
    { id: 'dashboard', icon: <IconHome />, label: dict?.dashboard || 'Overview' },
    { id: 'cover-letter', icon: <IconMagic />, label: dict?.coverLetterTab || 'Cover Letter' },
    { id: 'cv-optimizer', icon: <IconCV />, label: dict?.cvOptimizer || 'CV' },
    { id: 'jobtracker', icon: <span className="text-base leading-none">📋</span>, label: dict?.jobtracker || 'Tracker' },
    { id: 'history', icon: <IconClock />, label: dict?.history || 'History' },
  ];

  const go = (id) => { setActiveTab(id); setOpen(false); };

  return (
    <>
      {/* ── TOP HEADER ── */}
      <div className="h-14 bg-[#1e293b] border-b border-[#334155] flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50 shadow-md shrink-0">
        <a href="/" className="flex items-center gap-2 no-underline">
          <img src="/android-chrome-192x192.png" alt="AIletter" className="w-7 h-7 rounded-lg" />
          <span className="font-black text-white tracking-tight text-sm">AIletter</span>
          {isPro && <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">PRO</span>}
        </a>
        <button onClick={() => setOpen(true)} className="p-2 text-gray-300 active:scale-95 transition-transform">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      {/* ── SIDEBAR DRAWER ── */}
      {open && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-[#1e293b] w-[80%] max-w-[300px] h-full shadow-2xl flex flex-col border-l border-[#334155]">

            <div className="h-14 flex items-center justify-between px-5 border-b border-[#334155] shrink-0">
              <div className="flex items-center gap-2">
                <img src="/android-chrome-192x192.png" alt="AIletter" className="w-6 h-6 rounded-md" />
                <span className="font-black text-white text-sm">AIletter</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 bg-[#0f172a] rounded-full">
                <IconX />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => go(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left ${
                    activeTab === item.id
                      ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20'
                      : 'text-gray-400 hover:bg-[#0f172a] hover:text-white'
                  }`}>
                  {item.icon}
                  <span className="font-bold text-sm">{item.label}</span>
                </button>
              ))}

              <a
                href="/linkedin-message"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left text-[#38bdf8] hover:bg-[#0077b5]/10 border border-[#0077b5]/20"
              >
                <IconLinkedin />
                <span className="font-bold text-sm">{dict?.navLinkedIn || 'LinkedIn ↗'}</span>
              </a>
              <a
                href="/subject-line"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left text-violet-300 hover:bg-violet-500/10 border border-violet-500/20"
              >
                <IconMail />
                <span className="font-bold text-sm">{dict?.navSubjectLine || 'Subject lines ↗'}</span>
              </a>

              <div className="pt-4 pb-1">
                <div className="flex items-center gap-2 px-4 mb-2">
                  <IconGlobe />
                  <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Interface Language</span>
                </div>
                <div className="grid grid-cols-2 gap-2 px-1">
                  {LANGS.map(l => (
                    <button key={l.code} onClick={() => { setUiLang(l.code); setOpen(false); }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        uiLang === l.code
                          ? 'bg-[#6366f1] text-white border-[#6366f1]'
                          : 'text-[#64748b] border-[#334155] hover:border-[#6366f1]/50'
                      }`}>
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#334155] space-y-2 shrink-0">
              {!isPro && (
                <button onClick={() => { setShowUpgrade(true); setOpen(false); }}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                  <IconStar /> Upgrade to Pro
                </button>
              )}
              <a href="/" className="w-full py-2.5 flex items-center justify-center gap-2 text-gray-500 font-bold text-xs hover:text-gray-300 rounded-xl transition-colors">
                ← Back to Homepage
              </a>
              <button onClick={logout}
                className="w-full py-3 flex items-center justify-center gap-2 text-red-400 font-bold text-sm hover:bg-red-500/10 rounded-xl transition-colors">
                <IconLogOut /> Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      <div className="landscape:hidden h-20 bg-[#1e293b] border-t border-[#334155] flex items-start justify-around px-1 fixed bottom-0 left-0 right-0 z-40 pt-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {bottomNavItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1.5 px-0.5 rounded-xl transition-all flex-1 min-w-0 ${
              activeTab === item.id ? 'text-[#6366f1] translate-y-[-2px]' : 'text-gray-500'
            }`}>
            {item.icon}
            <span className="text-[8px] sm:text-[9.5px] font-black tracking-wide truncate max-w-full text-center px-0.5">{item.label}</span>
          </button>
        ))}
      </div>

      {/* ── LANDSCAPE SIDE NAV ── */}
      <div className="hidden landscape:flex flex-col w-14 bg-[#1e293b] border-r border-[#334155] fixed left-0 top-0 bottom-0 z-40 pt-14 pb-2 items-center justify-start gap-1">
        {bottomNavItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`w-10 h-10 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeTab === item.id ? 'bg-[#6366f1] text-white' : 'text-gray-500 hover:text-white hover:bg-[#0f172a]'
            }`}>
            {item.icon}
          </button>
        ))}
      </div>
    </>
  );
};

export default MobileNav;
