// src/components/dashboard/mobile/MobileSettingsTab.jsx
import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const inputClass = "w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#6366f1] transition-all mt-1.5";
const labelClass = "text-[10px] font-black text-[#64748b] uppercase tracking-widest";

const TEMPLATE_LIST = ['Influx','Iconic','Minimal','Nova','Breeze','Enfold','Modern','Executive','Nordic','Berlin','Tokyo','Milano','Sydney','Atlas','Onyx','Pearl'];

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-black text-white">{title}</h3>
    {children}
  </div>
);

const Card = ({ children }) => (
  <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 space-y-4">
    {children}
  </div>
);

const MobileSettingsTab = ({
  dict, contactInfo, setContactInfo, uiLang, setUiLang,
  settings, setSettings, showNotification, setHistory,
  isPro, setShowUpgrade, saveProfile, user, selectedTemplate, setSelectedTemplate
}) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);

  const openPortal = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const fn = httpsCallable(getFunctions(), 'createPortalSession');
      const result = await fn();
      window.location.href = result.data.url;
    } catch (err) {
      console.error('Portal error:', err);
      setPortalError('Could not open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const sections = [
    { key: 'profile',     label: dict.tabProfile     || 'Profile' },
    { key: 'preferences', label: dict.tabPreferences || 'Prefs' },
    { key: 'plan',        label: dict.tabPlan        || 'Plan' },
    { key: 'privacy',     label: dict.tabPrivacy     || 'Privacy' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0f172a]">

      {/* Horizontal tabs */}
      <div className="flex shrink-0 bg-[#1e293b] border-b border-[#334155] px-3 py-2 gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSection === s.key ? 'bg-[#6366f1] text-white' : 'text-[#64748b] bg-[#0f172a]'
            }`}
          >{s.label}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>

        {/* ── Profile ── */}
        {activeSection === 'profile' && (
          <Section title={dict.tabProfile || 'Profile'}>
            <div className="flex items-center gap-4 p-4 bg-[#1e293b] rounded-2xl border border-[#334155]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center font-black text-2xl shrink-0">
                {contactInfo.fullName?.[0] || user?.displayName?.[0] || 'U'}
              </div>
              <div>
                <p className="font-bold text-white">{contactInfo.fullName || user?.displayName || 'User'}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isPro ? 'text-emerald-400' : 'text-[#6366f1]'}`}>
                  {isPro ? '✦ Pro' : 'Free Plan'}
                </p>
              </div>
            </div>
            <Card>
              <div><label className={labelClass}>{dict.labelName || 'Name'}</label><input value={contactInfo.fullName || ''} onChange={e => setContactInfo({ ...contactInfo, fullName: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>{dict.labelTitle || 'Title'}</label><input value={contactInfo.profession || ''} onChange={e => setContactInfo({ ...contactInfo, profession: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>{dict.labelEmail || 'Email'}</label><input value={contactInfo.email || ''} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} className={inputClass} type="email" /></div>
              <div><label className={labelClass}>{dict.labelPhone || 'Phone'}</label><input value={contactInfo.phone || ''} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} className={inputClass} type="tel" /></div>
              <div><label className={labelClass}>{dict.labelLocation || 'Location'}</label><input value={contactInfo.location || ''} onChange={e => setContactInfo({ ...contactInfo, location: e.target.value })} className={inputClass} /></div>
            </Card>
            <div className="flex gap-3">
              <button onClick={saveProfile} className="flex-1 py-3.5 bg-[#6366f1] rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#6366f1]/20">
                {dict.saveChanges || 'Save'}
              </button>
              <button
                onClick={() => setContactInfo({ fullName: user?.displayName || '', email: user?.email || '', profession: '', phone: '', location: '' })}
                className="px-5 py-3.5 bg-[#1e293b] text-[#64748b] border border-[#334155] rounded-2xl font-semibold text-sm transition-all"
              >
                {dict.reset || 'Reset'}
              </button>
            </div>
          </Section>
        )}

        {/* ── Preferences ── */}
        {activeSection === 'preferences' && (
          <Section title={dict.prefTitle || 'Preferences'}>
            <Card>
              <div>
                <label className={labelClass}>Interface Language</label>
                <select value={uiLang} onChange={e => setUiLang(e.target.value)} className={inputClass}>
                  <option value="en">English</option>
                  <option value="uk">Українська</option>
                  <option value="it">Italiano</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{dict.prefLang || 'Letter Language'}</label>
                <select value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })} className={inputClass}>
                  <option value="Auto">Auto Match</option>
                  <option>English</option><option>Ukrainian</option><option>Italiano</option><option>Deutsch</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{dict.prefTone || 'Default Tone'}</label>
                <div className="flex gap-2 mt-2">
                  {['Professional', 'Friendly', 'Formal'].map(t => (
                    <button key={t} onClick={() => setSettings({ ...settings, tone: t })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${settings.tone === t ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'text-[#64748b] border-[#334155]'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
            <Card>
              <label className={labelClass}>{dict.prefTemplate || 'Default Template'}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TEMPLATE_LIST.map(t => (
                  <button key={t} onClick={() => setSelectedTemplate(t.toLowerCase())}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedTemplate === t.toLowerCase() ? 'bg-white text-[#0f172a] border-white' : 'border-[#334155] text-[#64748b]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </Card>
          </Section>
        )}

        {/* ── Plan ── */}
        {activeSection === 'plan' && (
          <Section title={dict.planTitle || 'Subscription'}>
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="font-black text-white">{isPro ? 'Pro Plan' : (dict.planCurrent || 'Free Plan')}</p>
                <p className="text-xs text-[#64748b] mt-0.5">{isPro ? 'Unlimited generations' : (dict.planLimit || '5/month')}</p>
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${isPro ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#334155] text-[#94a3b8]'}`}>
                {isPro ? '✦ Pro' : 'Free'}
              </span>
            </div>

            {isPro ? (
              <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">✦</div>
                  <div>
                    <p className="font-black text-white text-sm">Pro Plan Active</p>
                    <p className="text-xs text-[#64748b]">Unlimited generations & all features</p>
                  </div>
                </div>
                <p className="text-xs text-[#64748b]">Cancel, update your card, or view payment history via Stripe.</p>
                <div className="border-t border-[#334155] pt-4 space-y-2">
                  <button
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="w-full py-3 border border-[#334155] hover:border-[#6366f1] text-[#94a3b8] hover:text-white rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {portalLoading ? 'Opening...' : 'Manage subscription →'}
                  </button>
                  {portalError && <p className="text-xs text-red-400 text-center">{portalError}</p>}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/10 border border-[#6366f1]/30 rounded-2xl p-5 space-y-4">
                <p className="font-black text-white text-lg">Pro — from €6/mo</p>
                <ul className="space-y-2">
                  {['Unlimited generations', 'All 16 templates', 'No watermark on PDF', 'Priority AI processing'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[#94a3b8]">
                      <span className="text-emerald-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowUpgrade(true)}
                  className="w-full py-4 bg-[#6366f1] rounded-xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#6366f1]/20">
                  {dict.planUpgrade || '✦ Upgrade to Pro'}
                </button>
              </div>
            )}
          </Section>
        )}

        {/* ── Privacy ── */}
        {activeSection === 'privacy' && (
          <Section title={dict.privTitle || 'Privacy'}>
            <Card>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{dict.privDesc || 'Your data is stored locally and never sold to third parties.'}</p>
              <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-[#334155]">
                <span className="text-sm text-[#94a3b8] font-medium">{dict.privToggle || 'Save history locally'}</span>
                <div className="relative">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-[#334155] rounded-full peer peer-checked:bg-[#6366f1] transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                </div>
              </label>
            </Card>
            <div className="space-y-3">
              <button
                onClick={() => { if (window.confirm('Delete all history?')) { setHistory([]); localStorage.removeItem('letterHistory'); showNotification(dict.deleted || 'Deleted'); } }}
                className="w-full py-3.5 border border-[#334155] text-[#94a3b8] rounded-xl font-semibold text-sm transition-all active:bg-[#334155]/30"
              >
                {dict.deleteHistory || 'Delete all history'}
              </button>
              <button className="w-full py-3.5 border border-red-500/20 text-red-400 rounded-xl font-semibold text-sm transition-all active:bg-red-500/10">
                {dict.deleteAccount || 'Delete account'}
              </button>
            </div>
          </Section>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
};

export default MobileSettingsTab;