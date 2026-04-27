import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconDash, IconTemplate, IconHist, IconSettings } from '../ui/Icons';

const SidebarContent = ({ user, activeTab, isPro, planLoading, setShowUpgrade, logout, dict, uiLang, setUiLang, navItems, handleNav, navigate }) => (
  <>
    {/* ── Logo + Language switcher ── */}
    <div className="p-5 border-b border-[#334155]">
      <div className="flex items-center gap-2.5 cursor-pointer group mb-4" onClick={() => navigate('/')}>
        <img src="/android-chrome-192x192.png" alt="AIletter" className="w-8 h-8 rounded-lg shadow-lg shadow-[#6366f1]/30" />
        <span className="text-lg font-black tracking-tight text-white group-hover:text-[#a5b4fc] transition-colors">{dict.logo}</span>
      </div>

      {/* User card */}
      <div className="flex items-center gap-3 p-3 bg-[#0f172a]/60 rounded-xl border border-[#334155]">
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center font-bold text-sm">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'U'}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            user?.displayName?.[0]?.toUpperCase() || 'U'
          )}
        </div>
        <div className="overflow-hidden min-w-0">
          <p className="text-[13px] font-bold text-white truncate">{user?.displayName || 'User'}</p>
          {planLoading ? (
            <p className="text-[9px] font-black uppercase tracking-widest text-[#475569] animate-pulse">Loading...</p>
          ) : (
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: isPro ? '#34d399' : '#6366f1' }}>
              {isPro ? '✦ Pro' : 'Free Plan'}
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => handleNav(item.id)}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all relative ${
            activeTab === item.id ? 'bg-[#0f172a] text-white' : 'text-[#64748b] hover:text-white hover:bg-[#334155]/50'
          }`}
        >
          {activeTab === item.id && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#6366f1] rounded-full" />
          )}
          <span className={activeTab === item.id ? 'text-[#6366f1]' : ''}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* LinkedIn Generator */}
      <a
        href="/linkedin-message"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all text-[#38bdf8] hover:text-white hover:bg-[#0077b5]/10 border border-transparent hover:border-[#0077b5]/20"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect width="4" height="12" x="2" y="9"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
        LinkedIn Generator ↗
      </a>
      <a
        href="/subject-line"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all text-indigo-300 hover:text-white hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20"
      >
        <span>✉️</span>
        Subject Line Generator ↗
      </a>
    </nav>

    {/* Bottom — без language switcher */}
    <div className="p-4 border-t border-[#334155] space-y-3">
      {!planLoading && isPro && (
        <div className="w-full py-2 px-4 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
          ✅ Pro Active
        </div>
      )}
      {!planLoading && !isPro && (
        <button
          onClick={() => setShowUpgrade(true)}
          className="w-full py-2.5 px-4 text-xs font-black text-white bg-[#6366f1] hover:bg-[#4f46e5] rounded-xl transition-all shadow-lg shadow-[#6366f1]/20"
        >
          ✦ Upgrade to Pro
        </button>
      )}
      {planLoading && (
        <div className="w-full py-2.5 px-4 text-xs font-black text-[#475569] bg-[#1e293b] rounded-xl text-center animate-pulse">
          Loading...
        </div>
      )}
      <button
        onClick={logout}
        className="w-full py-2.5 px-4 text-xs font-semibold text-[#64748b] hover:text-[#94a3b8] border border-[#334155] rounded-xl hover:border-[#475569] transition-all"
      >
        {dict.logout}
      </button>
    </div>
  </>
);

const Sidebar = ({ user, activeTab, setActiveTab, isPro, planLoading, setShowUpgrade, logout, dict, uiLang, setUiLang }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard',  label: dict.dashboard,    icon: <IconDash /> },
    { id: 'templates',  label: 'Templates',       icon: <IconTemplate /> },
    { id: 'history',    label: dict.history,      icon: <IconHist /> },
    { id: 'interview',  label: 'Interview Prep',  icon: <span>🎤</span> },
    { id: 'jobtracker', label: 'Job Tracker',     icon: <span>📋</span> },
    { id: 'settings',   label: dict.settings,     icon: <IconSettings /> },
  ];

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const contentProps = {
    user, activeTab, isPro, planLoading, setShowUpgrade,
    logout, dict, uiLang, setUiLang, navItems, handleNav, navigate,
  };

  return (
    <>
      {/* ── DESKTOP sidebar ── */}
      <aside className="hidden md:flex w-60 bg-[#1e293b] border-r border-[#334155] flex-col shrink-0 z-30">
        <SidebarContent {...contentProps} />
      </aside>

      {/* ── MOBILE topbar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#1e293b] border-b border-[#334155] flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/android-chrome-192x192.png" alt="AIletter" className="w-7 h-7 rounded-lg" />
          <span className="text-base font-black text-white">{dict.logo}</span>
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-none mx-2 flex-1" style={{ scrollbarWidth: 'none' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${
                activeTab === item.id ? 'bg-[#6366f1] text-white' : 'text-[#475569] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {/* Language switcher — right side of header */}
        <div className="flex gap-0.5 bg-[#0f172a] rounded-lg p-0.5 border border-[#334155] shrink-0">
          {['en', 'uk', 'de', 'it'].map(lang => (
            <button
              key={lang}
              onClick={() => setUiLang(lang)}
              className={`px-1.5 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                uiLang === lang ? 'bg-[#6366f1] text-white' : 'text-[#475569] hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 shrink-0 ml-1"
        >
          <span className="w-5 h-0.5 bg-[#94a3b8] rounded-full" />
          <span className="w-5 h-0.5 bg-[#94a3b8] rounded-full" />
          <span className="w-5 h-0.5 bg-[#94a3b8] rounded-full" />
        </button>
      </div>

      {/* ── MOBILE drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-[#1e293b] flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-0">
              <span className="text-xs font-black text-[#475569] uppercase tracking-widest">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-[#64748b] hover:text-white rounded-lg hover:bg-[#334155] transition-all text-xl"
              >
                ✕
              </button>
            </div>
            <SidebarContent {...contentProps} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;