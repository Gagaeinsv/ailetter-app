import React, { useState } from 'react';
import JobUrlInput from '../JobUrlInput';
import LinkedInModal from '../LinkedInModal';
import AISuggestions from '../AISuggestions';
import ATSScore from '../ATSScore';

const IconMagic    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>;
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconCopy     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const IconSave     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconUpload   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconLinkedin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
const IconX        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const MobileDashboardTab = ({
  dict,
  contactInfo, jobDescription, setJobDescription,
  cvFile, fileName, handleFileChange, handleAutoFill, parsingCV,
  settings, setSettings, handleGenerate, loading,
  generatedLetter, setGeneratedLetter, downloadPDF,
  editMode, setEditMode, handleSaveToHistory, showNotification,
  isPro, setShowUpgrade,
  uiLang,
}) => {
  const [view, setView] = useState('inputs');
  const [showLinkedIn, setShowLinkedIn] = useState(false);

  const handleGenerateAndSwitch = async () => {
    setView('inputs');
    await handleGenerate();
    setView('preview');
  };

  return (
    <div className="w-full">

      {/* Tab switcher */}
      <div className="sticky top-0 z-10 bg-[#0f172a] px-4 pt-4 pb-3">
        <div className="bg-[#1e293b] p-1 rounded-xl flex gap-1 border border-[#334155]">
          <button onClick={() => setView('inputs')}
            className={`flex-1 py-2.5 text-xs font-black uppercase rounded-lg transition-all ${view === 'inputs' ? 'bg-[#6366f1] text-white shadow-lg' : 'text-gray-400'}`}>
            {dict?.step1Title || '1. Data'}
          </button>
          <button onClick={() => setView('preview')} disabled={!generatedLetter}
            className={`flex-1 py-2.5 text-xs font-black uppercase rounded-lg transition-all ${view === 'preview' ? 'bg-[#6366f1] text-white shadow-lg' : generatedLetter ? 'text-gray-300' : 'text-gray-600 opacity-50'}`}>
            {dict?.preview || '2. Result'}
          </button>
        </div>
      </div>

      {/* INPUTS view */}
      {view === 'inputs' && (
        <div className="px-4 pb-6 space-y-4">

          {/* CV upload */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">{dict?.cvSection || 'CV (PDF)'}</span>
              <button onClick={handleAutoFill} disabled={parsingCV || !cvFile}
                className={`text-[11px] font-bold text-[#6366f1] transition-opacity ${(!cvFile || parsingCV) ? 'opacity-40' : ''}`}>
                {parsingCV ? '...' : (dict?.autoFill || 'Auto-fill')}
              </button>
            </div>
            <label className="flex flex-col items-center justify-center w-full h-20 bg-[#0f172a] border-2 border-dashed border-[#334155] rounded-xl cursor-pointer active:border-[#6366f1] transition-colors">
              <IconUpload />
              <span className="mt-2 text-xs font-semibold text-[#64748b]">{fileName || (dict?.cvUploadBtn || 'Upload PDF')}</span>
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </label>
          </div>

          {/* Job description */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">
                {dict?.jobSection || 'Job Description'}
              </span>
              {jobDescription.length > 0 && (
                <button
                  onClick={() => setJobDescription('')}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#475569] active:text-red-400 transition-all"
                >
                  <IconX /> Clear
                </button>
              )}
            </div>

            <JobUrlInput onParsed={(text) => setJobDescription(text)} />

            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder={dict?.jobPlaceholder || 'Paste job description here...'}
              className="w-full h-36 bg-[#0f172a] border border-[#334155] rounded-xl p-3 text-sm text-white outline-none resize-none focus:border-[#6366f1] transition-colors"
            />
          </div>

          {/* Quick settings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-3">
              <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-2">{dict?.lang || 'Language'}</span>
              <select value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-2 py-2 text-xs text-white outline-none">
                <option value="Auto">Auto</option>
                <option>English</option>
                <option>Ukrainian</option>
                <option>Italiano</option>
                <option>Deutsch</option>
              </select>
            </div>
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-3">
              <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-2">{dict?.tone || 'Tone'}</span>
              <select value={settings.tone} onChange={e => setSettings({ ...settings, tone: e.target.value })}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-2 py-2 text-xs text-white outline-none">
                <option>Professional</option>
                <option>Friendly</option>
                <option>Formal</option>
              </select>
            </div>
          </div>

          {/* Generate button */}
          <button onClick={handleGenerateAndSwitch} disabled={loading || !jobDescription}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg ${
              loading || !jobDescription ? 'bg-[#6366f1] opacity-50 cursor-not-allowed' : 'bg-[#6366f1] shadow-indigo-500/30'
            }`}>
            {loading ? (
              <><span className="animate-spin inline-block">&#8635;</span> Generating...</>
            ) : (
              <><IconMagic /> {dict?.generate || 'Generate'}</>
            )}
          </button>

          {!isPro && (
            <p className="text-center text-[10px] text-[#475569]">
              {dict?.generateHint || '5 free generations / month'}
              {' · '}
              <button onClick={() => setShowUpgrade(true)} className="text-[#6366f1] font-bold">Upgrade Pro</button>
            </p>
          )}

          {/* ── AI SUGGESTIONS (inputs view) ── */}
          {generatedLetter && jobDescription && (
            <AISuggestions
              coverLetter={generatedLetter}
              jobDescription={jobDescription}
              dict={dict}
            />
          )}
          {generatedLetter && jobDescription && (
            <ATSScore coverLetter={generatedLetter} jobDescription={jobDescription} dict={dict} />
          )}
        </div>
      )}

      {/* PREVIEW view */}
      {view === 'preview' && (
        <div className="px-4 pb-6 space-y-4">

          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(generatedLetter); showNotification('Copied!'); }}
              className="flex-1 py-2.5 bg-[#1e293b] text-[#94a3b8] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#334155] active:scale-95 transition-all">
              <IconCopy /> Copy
            </button>
            <button onClick={handleSaveToHistory} disabled={!generatedLetter}
              className="flex-1 py-2.5 bg-[#1e293b] text-[#6366f1] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#6366f1]/30 active:scale-95 transition-all">
              <IconSave /> Save
            </button>
            <button onClick={downloadPDF} disabled={!generatedLetter}
              className="flex-1 py-2.5 bg-white text-[#0f172a] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              <IconDownload /> PDF
            </button>
          </div>

          {generatedLetter && (
            <button
              onClick={() => setShowLinkedIn(true)}
              className="w-full py-2.5 bg-[#0077b5]/10 border border-[#0077b5]/30 text-[#38bdf8] rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <IconLinkedin />
              Generate LinkedIn Easy Apply Message
            </button>
          )}

          <div className="bg-white text-black rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-xs leading-relaxed whitespace-pre-wrap font-serif min-h-[300px]">
              {generatedLetter || '...'}
            </div>
          </div>

          {/* ── AI SUGGESTIONS (preview view) ── */}
          {generatedLetter && jobDescription && (
            <AISuggestions
              coverLetter={generatedLetter}
              jobDescription={jobDescription}
              dict={dict}
            />
          )}
          {generatedLetter && jobDescription && (
            <ATSScore coverLetter={generatedLetter} jobDescription={jobDescription} dict={dict} />
          )}

          <div>
            <button onClick={() => setEditMode(!editMode)}
              className="w-full py-3 bg-[#1e293b] text-[#94a3b8] rounded-xl font-bold text-xs border border-[#334155] active:scale-95 transition-all">
              {editMode ? 'Done Editing' : 'Edit Text'}
            </button>
            {editMode && (
              <textarea
                value={generatedLetter}
                onChange={e => setGeneratedLetter(e.target.value)}
                className="w-full mt-3 h-64 bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-sm text-white outline-none resize-none focus:border-[#6366f1] transition-colors"
              />
            )}
          </div>

          <button onClick={handleGenerateAndSwitch} disabled={loading}
            className="w-full py-3 border border-[#334155] text-[#64748b] rounded-xl font-bold text-xs active:scale-95 transition-all">
            Regenerate
          </button>
        </div>
      )}

      {/* LinkedIn Modal */}
      {showLinkedIn && (
        <LinkedInModal
          onClose={() => setShowLinkedIn(false)}
          coverLetter={generatedLetter}
          contactInfo={contactInfo}
          jobDescription={jobDescription}
          isPro={isPro}
          setShowUpgrade={setShowUpgrade}
          uiLang={uiLang}
        />
      )}
    </div>
  );
};

export default MobileDashboardTab;
