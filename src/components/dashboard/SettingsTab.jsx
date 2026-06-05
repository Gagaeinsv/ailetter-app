// src/components/dashboard/SettingsTab.jsx
import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import VoiceDictationModal from './VoiceDictationModal';

const inputClass = "w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#6366f1] transition-all mt-1";
const labelClass = "text-xs font-semibold text-[#64748b] uppercase tracking-widest";

const voiceBtnText = {
  en: "🎙️ Dictate Profile",
  uk: "🎙️ Надиктувати профіль",
  it: "🎙️ Detta Profilo",
  de: "🎙️ Profil diktieren"
};

const TEMPLATE_LIST = ['Influx','Iconic','Minimal','Nova','Breeze','Enfold','Modern','Executive','Nordic','Berlin','Tokyo','Milano','Sydney','Atlas','Onyx','Pearl'];

const SettingsTab = ({ dict, contactInfo, setContactInfo, uiLang, setUiLang, settings, setSettings, showNotification, history, setHistory, clearTrackerJobs, isPro, setShowUpgrade, saveProfile, user, selectedTemplate, setSelectedTemplate, profileSyncStatus }) => {
  const [settingsTab, setSettingsTab] = useState('profile');
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError]     = useState(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleVoiceParsed = (parsed) => {
    setContactInfo({ ...contactInfo, ...parsed });
  };

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

  return (
    <div className="h-full flex overflow-hidden">
      {/* Vertical tabs */}
      <div className="w-48 shrink-0 bg-[#1e293b] border-r border-[#334155] p-4 space-y-1">
        {[
          { key: 'profile',     label: dict.tabProfile },
          { key: 'preferences', label: dict.tabPreferences },
          { key: 'plan',        label: dict.tabPlan },
          { key: 'privacy',     label: dict.tabPrivacy },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setSettingsTab(t.key)}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${settingsTab === t.key ? 'bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/20' : 'text-[#64748b] hover:text-white hover:bg-[#334155]/50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
        <div className="max-w-2xl space-y-8">

          {/* ── Profile ── */}
          {settingsTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white">{dict.tabProfile}</h3>
                  <p className="text-xs text-[#64748b] mt-1">Manage your personal information</p>
                </div>
                <button
                  onClick={() => setShowVoiceModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 shrink-0"
                >
                  {voiceBtnText[uiLang] || voiceBtnText.en}
                </button>
              </div>
              {user?.uid && (
                <p className="text-[10px] text-slate-500 -mt-2">
                  {profileSyncStatus === 'syncing' && (dict?.historySyncing || 'Syncing…')}
                  {profileSyncStatus === 'synced' && (dict?.historySynced || 'Synced')}
                  {profileSyncStatus === 'error' && (dict?.historySyncError || 'Cloud sync issue — using local copy')}
                </p>
              )}
              <div className="flex items-center gap-5 p-5 bg-[#1e293b] rounded-2xl border border-[#334155]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center font-black text-2xl shrink-0">
                  {contactInfo.fullName?.[0] || user?.displayName?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-bold text-white">{contactInfo.fullName || user?.displayName}</p>
                  <p className="text-xs font-black uppercase tracking-widest mt-0.5" style={{ color: isPro ? '#34d399' : '#6366f1' }}>
                    {isPro ? '✦ Pro' : 'Free Plan'}
                  </p>
                </div>
              </div>
              <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>{dict.labelName}</label><input value={contactInfo.fullName || ''} onChange={e => setContactInfo({ ...contactInfo, fullName: e.target.value })} className={inputClass} /></div>
                  <div><label className={labelClass}>{dict.labelTitle}</label><input value={contactInfo.profession || ''} onChange={e => setContactInfo({ ...contactInfo, profession: e.target.value })} className={inputClass} /></div>
                  <div><label className={labelClass}>{dict.labelEmail}</label><input value={contactInfo.email || ''} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} className={inputClass} /></div>
                  <div><label className={labelClass}>{dict.labelPhone}</label><input value={contactInfo.phone || ''} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} className={inputClass} /></div>
                </div>
                <div><label className={labelClass}>{dict.labelLocation}</label><input value={contactInfo.location || ''} onChange={e => setContactInfo({ ...contactInfo, location: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={saveProfile} className="flex-1 py-3.5 bg-[#6366f1] hover:bg-[#4f46e5] rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-[#6366f1]/20 active:scale-95">
                  {dict.saveChanges}
                </button>
                <button
                  onClick={() => setContactInfo({ fullName: user?.displayName || '', email: user?.email || '', profession: '', phone: '', location: '' })}
                  className="px-6 py-3.5 bg-[#1e293b] text-[#64748b] hover:text-white border border-[#334155] rounded-2xl font-semibold text-sm transition-all"
                >
                  {dict.reset}
                </button>
              </div>
            </div>
          )}

          {/* ── Preferences ── */}
          {settingsTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">{dict.prefTitle}</h3>
                <p className="text-xs text-[#64748b] mt-1">Set your defaults for every new letter</p>
              </div>
              <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-4">
                <div>
                  <label className={labelClass}>Interface Language</label>
                  <select value={uiLang} onChange={e => setUiLang(e.target.value)} className={inputClass}>
                    <option value="en">English</option>
                    <option value="uk">Українська</option>
                    <option value="it">Italiano</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{dict.prefLang}</label>
                    <select value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })} className={inputClass}>
                      <option value="Auto">Auto Match</option>
                      <option>English</option><option>Ukrainian</option><option>Italiano</option><option>Deutsch</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>{dict.prefTone}</label>
                    <select value={settings.tone} onChange={e => setSettings({ ...settings, tone: e.target.value })} className={inputClass}>
                      <option>Professional</option><option>Friendly</option><option>Formal</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{dict.prefTemplate}</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TEMPLATE_LIST.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTemplate(t.toLowerCase())}
                        className={`px-4 py-2 rounded-full text-[11px] font-bold border transition-all ${selectedTemplate === t.toLowerCase() ? 'bg-white text-[#0f172a] border-white' : 'border-[#334155] text-[#64748b] hover:text-white'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Plan ── */}
          {settingsTab === 'plan' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">{dict.planTitle}</h3>
                <p className="text-xs text-[#64748b] mt-1">Manage your subscription</p>
              </div>
              <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 flex items-center justify-between">
                <div>
                  <p className="font-black text-white">{isPro ? 'Pro Plan' : dict.planCurrent}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{isPro ? 'Unlimited generations' : dict.planLimit}</p>
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${isPro ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#334155] text-[#94a3b8]'}`}>
                  {isPro ? 'Pro' : 'Free'}
                </span>
              </div>

              {isPro && (
                <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-3">
                  <p className="text-sm font-bold text-white">Billing & Subscription</p>
                  <p className="text-xs text-[#64748b]">Cancel, update your card, or view payment history via Stripe.</p>
                  <button
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="w-full py-3 border border-[#334155] hover:border-[#6366f1] text-[#94a3b8] hover:text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    {portalLoading ? 'Opening...' : 'Manage subscription →'}
                  </button>
                  {portalError && <p className="text-xs text-red-400">{portalError}</p>}
                </div>
              )}

              {!isPro && (
                <div className="bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/10 rounded-2xl border border-[#6366f1]/30 p-6 space-y-4">
                  <p className="font-black text-white text-lg">Pro Plan</p>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{dict.planProList}</p>
                  <button onClick={() => setShowUpgrade(true)} className="w-full py-3 bg-[#6366f1] hover:bg-[#4f46e5] rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-[#6366f1]/20">
                    {dict.planUpgrade}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Privacy ── */}
          {settingsTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">{dict.privTitle}</h3>
              </div>
              <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-4">
                <p className="text-sm text-[#94a3b8] leading-relaxed">{dict.privDesc}</p>
                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#334155]">
                  <span className="text-sm text-[#94a3b8] font-medium">{dict.privToggle}</span>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-[#334155] rounded-full peer peer-checked:bg-[#6366f1] transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                  </div>
                </label>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(dict.confirmDeleteAllHistory || 'Delete all history?')) {
                      setHistory([]);
                      showNotification(dict.deleted);
                    }
                  }}
                  className="w-full py-3 border border-[#334155] text-[#94a3b8] hover:text-white hover:border-[#475569] rounded-xl font-semibold text-sm transition-all"
                >
                  {dict.deleteHistory}
                </button>
                {user?.uid && clearTrackerJobs && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(dict.trackerClearConfirm || dict.trackerDeleteAll)) {
                        clearTrackerJobs();
                        showNotification(dict.deleted || 'Deleted');
                      }
                    }}
                    className="w-full py-3 border border-[#334155] text-[#94a3b8] hover:text-white hover:border-[#475569] rounded-xl font-semibold text-sm transition-all"
                  >
                    {dict.trackerDeleteAll}
                  </button>
                )}
                <button className="w-full py-3 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 rounded-xl font-semibold text-sm transition-all">
                  {dict.deleteAccount}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      {showVoiceModal && (
        <VoiceDictationModal
          uiLang={uiLang}
          onClose={() => setShowVoiceModal(false)}
          onParsed={handleVoiceParsed}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

export default SettingsTab;