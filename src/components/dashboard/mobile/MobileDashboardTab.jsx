import React, { useState, useEffect, useRef } from 'react';
import {
  TemplateInfluxInline, TemplateIconicInline, TemplateEnfoldInline, TemplateModernInline,
  TemplateMinimalInline, TemplateNovaInline, TemplateBreezeInline, TemplateExecutiveInline,
  TemplateNordicInline, TemplateBerlinInline, TemplateOnyxInline,
  TemplateTokyoInline, TemplateMilanoInline, TemplateSydneyInline,
  TemplateAtlasInline, TemplatePearlInline,
  TemplateGenericProInline
} from '../../templates/Templates';
import JobUrlInput from '../JobUrlInput';
import LinkedInModal from '../LinkedInModal';
import ReviewModal from '../ReviewModal';
import AISuggestions from '../AISuggestions';
import ATSScore from '../ATSScore';

const IconMagic    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>;
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconCopy     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const IconSave     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconUpload   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconLinkedin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
const IconX        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconLock     = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconPen      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IconCheck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IconSparkles = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500 animate-pulse"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>;

const renderTemplate = (selectedTemplate, contact, text, date, documentRef) => {
  const p = { contact, text, date };
  const el = (() => {
    switch (selectedTemplate) {
      case 'influx':    return <TemplateInfluxInline    {...p} />;
      case 'iconic':    return <TemplateIconicInline    {...p} />;
      case 'enfold':    return <TemplateEnfoldInline    {...p} />;
      case 'modern':    return <TemplateModernInline    {...p} />;
      case 'minimal':   return <TemplateMinimalInline   {...p} />;
      case 'nova':      return <TemplateNovaInline      {...p} />;
      case 'breeze':    return <TemplateBreezeInline    {...p} />;
      case 'executive': return <TemplateExecutiveInline {...p} />;
      case 'nordic':    return <TemplateNordicInline    {...p} />;
      case 'berlin':    return <TemplateBerlinInline    {...p} />;
      case 'onyx':      return <TemplateOnyxInline      {...p} />;
      case 'tokyo':     return <TemplateTokyoInline     {...p} />;
      case 'milano':    return <TemplateMilanoInline    {...p} />;
      case 'sydney':    return <TemplateSydneyInline    {...p} />;
      case 'atlas':     return <TemplateAtlasInline     {...p} />;
      case 'pearl':     return <TemplatePearlInline     {...p} />;
      default:          return <TemplateGenericProInline {...p} />;
    }
  })();
  return (
    <div ref={documentRef} className="bg-white text-black shadow-2xl rounded-xl overflow-hidden">
      {el}
    </div>
  );
};

const MobileDashboardTab = ({
  dict,
  contactInfo, setContactInfo, jobDescription, setJobDescription,
  cvFile, fileName, handleFileChange, handleAutoFill, parsingCV,
  settings, setSettings, selectedTemplate, setSelectedTemplate, setActiveTab,
  handleGenerate, loading,
  generatedLetter, setGeneratedLetter,
  downloadPDF, downloadDOCX,
  copyLetter,
  currentLetterSavedId,
  editMode, setEditMode, editText, setEditText,
  handleSaveToHistory, showNotification,
  isPro, setShowUpgrade,
  uiLang,
  documentRef,
  todayStr, placeholderText,
  user,
  TEMPLATES,
  mobileHistoryLoadNonce = 0,
}) => {
  const [view, setView] = useState('inputs');
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [atsKey, setAtsKey] = useState(0);

  // Typing animation
  const [displayedLetter, setDisplayedLetter] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingRef = useRef(null);

  useEffect(() => {
    if (!generatedLetter) { setDisplayedLetter(''); setIsTyping(false); return; }
    setAtsKey(k => k + 1);
    if (typingRef.current) clearTimeout(typingRef.current);
    setDisplayedLetter('');
    setIsTyping(true);
    let i = 0;
    const type = () => {
      if (i >= generatedLetter.length) { setIsTyping(false); return; }
      const char = generatedLetter[i];
      const speed = char === '\n' ? 15 : 8;
      typingRef.current = setTimeout(() => {
        setDisplayedLetter(generatedLetter.slice(0, i + 1));
        i++;
        type();
      }, speed);
    };
    type();
    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [generatedLetter]);

  useEffect(() => {
    if (!mobileHistoryLoadNonce || !generatedLetter) return;
    setView('preview');
  }, [mobileHistoryLoadNonce, generatedLetter]);

  const handleGenerateAndSwitch = async () => {
    setView('inputs');
    await handleGenerate();
    setView('preview');
  };

  const handleCopyLetter = async () => {
    if (copyLetter) {
      await copyLetter();
    } else {
      navigator.clipboard.writeText(generatedLetter);
      showNotification('Copied!');
    }
  };

  const textForPreview = editMode
    ? editText
    : ((isTyping ? displayedLetter : generatedLetter) || placeholderText || '...');

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

      {/* ── INPUTS view ── */}
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

          {/* Name & Role — same as desktop */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-3">
              <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-2">{dict?.labelName || 'Full Name'}</span>
              <input
                value={contactInfo?.fullName || ''}
                onChange={e => setContactInfo({ ...contactInfo, fullName: e.target.value })}
                placeholder="Your Name"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-[#6366f1] transition-colors"
              />
            </div>
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-3">
              <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-2">{dict?.labelTitle || 'Role'}</span>
              <input
                value={contactInfo?.profession || ''}
                onChange={e => setContactInfo({ ...contactInfo, profession: e.target.value })}
                placeholder="Current Role"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-[#6366f1] transition-colors"
              />
            </div>
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
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-3">
            <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest block mb-2">{dict?.length || 'Letter Length'}</span>
            <div className="flex gap-2">
              {[
                { val: 'Short',    label: 'Short',    hint: '~280w' },
                { val: 'Standard', label: 'Standard', hint: '~350w' },
                { val: 'Detailed', label: 'Detailed', hint: '~400w' },
              ].map(({ val, label, hint }) => (
                <button key={val} onClick={() => setSettings({ ...settings, length: val })}
                  title={hint}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
                    (settings.length === val) || (!settings.length && val === 'Standard')
                      ? 'bg-[#6366f1] text-white border-[#6366f1]'
                      : 'text-[#64748b] border-[#334155]'
                  }`}>
                  {label}
                </button>
              ))}
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

          {generatedLetter && jobDescription && (
            <AISuggestions
              coverLetter={generatedLetter}
              jobDescription={jobDescription}
              dict={dict}
            />
          )}

          {generatedLetter && (
            <div className={`rounded-xl border p-4 transition-all ${
              currentLetterSavedId
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-[#334155] bg-[#1e293b]'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">⏰</span>
                <span className="text-xs font-black text-white uppercase tracking-wider">Follow-up Reminder</span>
                {!isPro && (
                  <span className="ml-auto flex items-center gap-1 text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <IconLock /> PRO
                  </span>
                )}
              </div>
              {currentLetterSavedId ? (
                <div>
                  <p className="text-xs text-emerald-400 font-medium mb-1">✓ Saved — follow-up reminder in 7 days</p>
                  <p className="text-[10px] text-slate-500">AIletter нагадає вам написати рекрутеру через тиждень</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Copy or download to start the 7-day follow-up timer</p>
                  {!isPro && (
                    <button
                      type="button"
                      onClick={() => setShowUpgrade(true)}
                      className="w-full py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold transition-all active:scale-95"
                    >
                      ✦ Upgrade Pro — Auto Follow-up
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {generatedLetter && isPro && (
            <button type="button" onClick={() => setShowReview(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/8 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold transition-all active:scale-95">
              ⭐ Enjoying AIletter? Leave a review
            </button>
          )}
        </div>
      )}

      {/* ── PREVIEW view ── */}
      {view === 'preview' && (
        <div className="px-4 pb-6 space-y-4">

          {/* Action toolbar */}
          <div className="flex gap-2">
            <button onClick={handleCopyLetter}
              className="flex-1 py-2.5 bg-[#1e293b] text-[#94a3b8] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#334155] active:scale-95 transition-all">
              <IconCopy /> Copy
            </button>
            <button onClick={handleSaveToHistory} disabled={!generatedLetter}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border active:scale-95 transition-all ${
                currentLetterSavedId
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-[#1e293b] text-[#6366f1] border-[#6366f1]/30'
              }`}>
              {currentLetterSavedId ? <><IconCheck /> Saved</> : <><IconSave /> Save</>}
            </button>
            <button onClick={downloadPDF} disabled={!generatedLetter}
              className="flex-1 py-2.5 bg-white text-[#0f172a] rounded-xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
              <IconDownload /> PDF
            </button>
            {/* DOCX — Pro or upgrade */}
            <button
              onClick={() => isPro ? downloadDOCX() : setShowUpgrade(true)}
              disabled={!generatedLetter}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border active:scale-95 transition-all disabled:opacity-30 ${
                isPro
                  ? 'bg-[#1e293b] text-indigo-400 border-indigo-500/30'
                  : 'bg-[#1e293b] text-amber-400 border-amber-500/30'
              }`}>
              {isPro ? <IconDownload /> : <IconLock />} DOCX
            </button>
          </div>

          {/* LinkedIn */}
          {generatedLetter && (
            <button
              onClick={() => setShowLinkedIn(true)}
              className="w-full py-2.5 bg-[#0077b5]/10 border border-[#0077b5]/30 text-[#38bdf8] rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <IconLinkedin />
              Generate LinkedIn Easy Apply Message
            </button>
          )}

          {/* Styled template preview */}
          <div className="relative">
            {generatedLetter
              ? renderTemplate(selectedTemplate, contactInfo, textForPreview, todayStr, documentRef)
              : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-[#1e293b] rounded-full flex items-center justify-center border border-[#334155] mb-4">
                    <IconSparkles />
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">Ready to Create?</h3>
                  <p className="text-slate-400 text-xs">Fill in your details and click Generate.</p>
                </div>
              )
            }
            {isTyping && generatedLetter && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-indigo-600/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">Writing...</span>
              </div>
            )}
          </div>

          {generatedLetter && jobDescription && (
            <AISuggestions
              coverLetter={generatedLetter}
              jobDescription={jobDescription}
              dict={dict}
            />
          )}
          {generatedLetter && jobDescription && (
            <ATSScore coverLetter={generatedLetter} jobDescription={jobDescription} triggerKey={atsKey} dict={dict} />
          )}

          {/* Edit mode */}
          <div>
            <button
              onClick={() => {
                if (!editMode) setEditText(generatedLetter);
                else setGeneratedLetter(editText);
                setEditMode(!editMode);
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs border active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                editMode
                  ? 'bg-[#6366f1] text-white border-[#6366f1]'
                  : 'bg-[#1e293b] text-[#94a3b8] border-[#334155]'
              }`}>
              {editMode ? <><IconCheck /> Done Editing</> : <><IconPen /> Edit Text</>}
            </button>
            {editMode && (
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="w-full mt-3 h-64 bg-[#1e293b] border border-[#334155] rounded-xl p-4 text-sm text-white outline-none resize-none focus:border-[#6366f1] transition-colors font-mono"
              />
            )}
          </div>

          {/* Template quick-pick */}
          {TEMPLATES && (
            <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Template</span>
                <button onClick={() => setActiveTab('templates')} className="text-[10px] text-indigo-400 font-bold">View All →</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {TEMPLATES.slice(0, 5).map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (t.pro && !isPro) { setShowUpgrade(true); return; }
                      setSelectedTemplate(t.id);
                    }}
                    className={`relative px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${
                      selectedTemplate === t.id
                        ? 'bg-white border-white text-[#0f172a] shadow'
                        : 'bg-[#0f172a] border-[#334155] text-[#94a3b8]'
                    } ${t.pro && !isPro ? 'opacity-70' : ''}`}>
                    {t.pro && !isPro && <span className="absolute -top-1 -right-1 text-amber-400"><IconLock /></span>}
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Regenerate */}
          <button onClick={handleGenerateAndSwitch} disabled={loading}
            className="w-full py-3 border border-[#334155] text-[#64748b] rounded-xl font-bold text-xs active:scale-95 transition-all">
            ↺ Regenerate
          </button>
        </div>
      )}

      {/* Modals */}
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
      {showReview && <ReviewModal onClose={() => setShowReview(false)} user={user} />}
    </div>
  );
};

export default MobileDashboardTab;
