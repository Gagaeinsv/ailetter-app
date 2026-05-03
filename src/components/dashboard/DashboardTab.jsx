import React, { useState, useEffect, useRef } from 'react';
import { 
  TemplateInfluxInline, TemplateIconicInline, TemplateEnfoldInline, 
  TemplateModernInline, TemplateMinimalInline, TemplateNovaInline, 
  TemplateBreezeInline, TemplateExecutiveInline, TemplateNordicInline, 
  TemplateBerlinInline, TemplateOnyxInline,
  TemplateTokyoInline, TemplateMilanoInline, TemplateSydneyInline,
  TemplateAtlasInline, TemplatePearlInline,
  TemplateGenericProInline 
} from '../templates/Templates';
import { Loader2, Copy, Sparkles, FileText, Download, Lock, RefreshCw, Save, Check, PenLine, Settings2, Linkedin } from 'lucide-react';
import LinkedInModal from './LinkedInModal';
import JobUrlInput from './JobUrlInput';
import AISuggestions from './AISuggestions';
import ATSScore from './ATSScore';
import ReviewModal from './ReviewModal';

const DashboardTab = (props) => {
  const {
    contactInfo, setContactInfo,
    jobDescription, setJobDescription,
    cvFile, fileName, handleFileChange, handleAutoFill, parsingCV,
    settings, setSettings, selectedTemplate, setSelectedTemplate,
    handleGenerate, loading, generatedLetter, setGeneratedLetter,
    downloadPDF, downloadDOCX,
    copyLetter,           // з Dashboard.jsx — copy + автозбереження
    currentLetterSavedId, // ID якщо вже збережено
    editMode, setEditMode, editText, setEditText,
    dict, TEMPLATES, todayStr, placeholderText,
    showNotification, handleSaveToHistory,
    documentRef,
    isPro,
    setShowUpgrade,
    uiLang, setUiLang,
    user,
  } = props;

  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [showReview, setShowReview]     = useState(false);
  const [displayedLetter, setDisplayedLetter] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [atsKey, setAtsKey] = useState(0);
  const typingRef = useRef(null);

  useEffect(() => {
    if (!generatedLetter) {
      setDisplayedLetter('');
      setIsTyping(false);
      return;
    }
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

  const renderTemplate = () => {
    const textToShow = editMode
      ? editText
      : ((isTyping ? displayedLetter : generatedLetter) || placeholderText);
    const p = { contact: contactInfo, text: textToShow, date: todayStr };
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
  };

  const handleTemplateClick = (t) => {
    if (t.pro && !isPro) { setShowUpgrade(true); return; }
    setSelectedTemplate(t.id);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0f172a]">

      {/* ── LEFT COLUMN ── */}
      <div className="w-[450px] flex-shrink-0 flex flex-col border-r border-[#1e293b] bg-[#0f172a] h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">1</div>
              <h1 className="text-xl font-bold text-white">{dict.step1 || 'Your Data'}</h1>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed ml-11">{dict.step1Desc || 'Upload your CV and paste the job description.'}</p>
          </div>

          {/* CV Upload */}
          <div className="bg-[#1e293b] p-5 rounded-2xl border border-[#334155]/50 hover:border-indigo-500/30 transition-colors group">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-400 transition-colors">{dict.cvSection || 'RESUME / CV'}</label>
              {fileName && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-[120px]">{fileName}</span>}
            </div>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer bg-[#0f172a] hover:bg-slate-900 border border-dashed border-slate-600 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center py-4 transition-all">
                <span className="text-xs font-medium text-slate-400 hover:text-white transition-colors">{fileName ? 'Replace PDF' : (dict.cvUploadBtn || 'Upload PDF')}</span>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </label>
              <button onClick={handleAutoFill} disabled={parsingCV || !cvFile}
                className="w-1/3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {parsingCV ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {parsingCV ? 'Parsing...' : (dict.autoFill || 'Auto-fill')}
              </button>
            </div>
          </div>

          {/* Name & Role */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Full Name</label>
              <input value={contactInfo?.fullName || ''} onChange={e => setContactInfo({ ...contactInfo, fullName: e.target.value })}
                placeholder="Your Name" className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Role</label>
              <input value={contactInfo?.profession || ''} onChange={e => setContactInfo({ ...contactInfo, profession: e.target.value })}
                placeholder="Current Role" className="w-full bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
            </div>
          </div>

          {/* Job Description */}
          <div className="flex-1 flex flex-col min-h-[200px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">{dict.jobSection || 'JOB DESCRIPTION'}</label>
            <JobUrlInput onParsed={(text) => setJobDescription(text)} />
            <textarea
              className="flex-1 w-full bg-[#1e293b] border border-[#334155] rounded-2xl p-4 text-sm text-slate-200 focus:border-indigo-500 outline-none resize-none placeholder-slate-600 transition-all leading-relaxed custom-scrollbar"
              placeholder={dict.jobPlaceholder || "Paste the job description here..."}
              value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
          </div>

          {/* AI Suggestions */}
          {generatedLetter && jobDescription && (
            <AISuggestions coverLetter={generatedLetter} jobDescription={jobDescription} dict={dict} />
          )}

          {/* ── Follow-up Block ── */}
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
                    <Lock className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </div>

              {currentLetterSavedId ? (
                // Вже збережено — показуємо коли follow-up
                <div>
                  <p className="text-xs text-emerald-400 font-medium mb-1">✓ Saved — follow-up reminder in 7 days</p>
                  <p className="text-[10px] text-slate-500">AIletter нагадає вам написати рекрутеру через тиждень</p>
                </div>
              ) : (
                // Ще не збережено
                <div>
                  <p className="text-xs text-slate-400 mb-2">Copy or download to start the 7-day follow-up timer</p>
                  {!isPro && (
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="w-full py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold transition-all"
                    >
                      ✦ Upgrade Pro — Auto Follow-up
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Review prompt */}
          {generatedLetter && isPro && (
            <button onClick={() => setShowReview(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500/8 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-bold transition-all">
              ⭐ Enjoying AIletter? Leave a review
            </button>
          )}
        </div>

        {/* Generate Button */}
        <div className="p-6 border-t border-[#1e293b] bg-[#0f172a]/95 backdrop-blur shrink-0 z-10">
          <button onClick={handleGenerate} disabled={loading || !jobDescription}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-sm text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
            {loading ? 'GENERATING MAGIC...' : (dict.generate || 'GENERATE LETTER')}
          </button>
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0f172a] relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

        {/* Toolbar */}
        <div className="h-16 border-b border-[#1e293b] flex items-center justify-between px-6 shrink-0 bg-[#0f172a]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]" />
            </div>
            <div className="h-4 w-px bg-[#334155] mx-2" />
            <span className="text-xs font-medium text-slate-400 select-none">AIletter Preview</span>
          </div>

          <div className="flex items-center gap-2">
            {generatedLetter && (
              <>
                <button onClick={handleGenerate} title={dict.regenerate}
                  className="p-2 text-slate-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Save — показує чи вже збережено */}
                <button
                  onClick={handleSaveToHistory}
                  title={currentLetterSavedId ? 'Already saved' : 'Save to history'}
                  className={`p-2 rounded-lg transition-all ${
                    currentLetterSavedId
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-[#1e293b]'
                  }`}
                >
                  <Save className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-[#334155] mx-1" />

                <button
                  onClick={() => {
                    if (!editMode) setEditText(generatedLetter);
                    else setGeneratedLetter(editText);
                    setEditMode(!editMode);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-[#1e293b] text-slate-300 hover:text-white border border-[#334155]'
                  }`}
                >
                  {editMode ? <><Check className="w-3.5 h-3.5" /> {dict.done || 'Done'}</> : <><PenLine className="w-3.5 h-3.5" /> {dict.edit || 'Edit'}</>}
                </button>
              </>
            )}

            {/* Export */}
            <div className="flex items-center bg-[#1e293b] rounded-lg p-0.5 border border-[#334155] ml-2">
              {/* PDF — автозбереження всередині downloadPDF */}
              <button onClick={downloadPDF} disabled={!generatedLetter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-30">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <div className="w-px h-3 bg-[#334155]" />
              {/* DOCX — автозбереження всередині downloadDOCX */}
              <button onClick={() => isPro ? downloadDOCX() : setShowUpgrade(true)} disabled={!generatedLetter}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all disabled:opacity-30 ${isPro ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-amber-400 hover:text-amber-300'}`}>
                {isPro ? <FileText className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                DOCX
              </button>
            </div>

            {generatedLetter && (
              <>
                {/* Copy — автозбереження через copyLetter */}
                <button onClick={copyLetter} className="ml-1 p-2 text-slate-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-all" title="Copy to clipboard">
                  <Copy className="w-4 h-4" />
                </button>
                {/* LinkedIn */}
                <button onClick={() => setShowLinkedIn(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/30 text-[#38bdf8] rounded-lg text-xs font-bold transition-all">
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </button>
              </>
            )}

            {/* Language switcher */}
            <div className="flex gap-0.5 bg-[#1e293b] rounded-lg p-0.5 border border-[#334155] ml-1">
              {['EN', 'UK', 'DE', 'IT'].map((lang) => (
                <button key={lang} onClick={() => setUiLang(lang.toLowerCase())}
                  className={`px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all ${uiLang === lang.toLowerCase() ? 'bg-[#6366f1] text-white' : 'text-slate-500 hover:text-white'}`}>
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Settings Bar */}
        <div className="border-b border-[#1e293b] bg-[#0f172a]/50 backdrop-blur p-2 flex gap-4 shrink-0 overflow-x-auto items-center z-10 pl-6" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-2 text-slate-500">
            <Settings2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Settings:</span>
          </div>
          <div className="flex bg-[#1e293b] rounded-lg p-0.5 border border-[#334155]">
            {['Professional', 'Friendly', 'Formal'].map(t => (
              <button key={t} onClick={() => setSettings({ ...settings, tone: t })}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${settings.tone === t ? 'bg-[#6366f1] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex bg-[#1e293b] rounded-lg p-0.5 border border-[#334155]">
            {[
              { val: 'Short',    label: 'Short',    hint: '~280w' },
              { val: 'Standard', label: 'Standard', hint: '~350w' },
              { val: 'Detailed', label: 'Detailed', hint: '~400w' },
            ].map(({ val, label, hint }) => (
              <button key={val} onClick={() => setSettings({ ...settings, length: val })}
                title={hint}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${settings.length === val || (!settings.length && val === 'Standard') ? 'bg-[#6366f1] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <select value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })}
              className="appearance-none bg-[#1e293b] border border-[#334155] text-slate-300 hover:text-white text-[10px] font-bold py-1.5 pl-3 pr-8 rounded-lg outline-none cursor-pointer focus:border-indigo-500 transition-colors">
              <option>Auto</option><option>English</option><option>Ukrainian</option><option>Italiano</option><option>Deutsch</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
          </div>
          <div className="h-4 w-px bg-[#334155] mx-2" />
          <div className="flex gap-2 items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Template:</span>
            <div className="flex gap-2">
              {TEMPLATES.slice(0, 4).map(t => (
                <button key={t.id} onClick={() => handleTemplateClick(t)}
                  className={`group relative px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    selectedTemplate === t.id ? 'bg-white border-white text-black shadow-md' : 'bg-[#1e293b] border-[#334155] text-slate-400 hover:border-indigo-500 hover:text-white'
                  } ${t.pro && !isPro ? 'opacity-70' : ''}`}>
                  {t.pro && !isPro && <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-400 bg-[#0f172a] rounded-full p-px" />}
                  {t.name}
                </button>
              ))}
              <button onClick={() => props.setActiveTab && props.setActiveTab('templates')} className="text-[10px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                View All
              </button>
            </div>
          </div>
        </div>

        {/* Document Preview — flex-col stacks letter + ATS; row would push ATS sideways off-screen */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center gap-8 bg-[#0b1120] relative custom-scrollbar">
          {editMode ? (
            <div className="flex w-full max-w-[1200px] gap-6 h-full">
              <div className="flex-1 bg-white shadow-2xl rounded-sm opacity-50 pointer-events-none h-fit scale-[0.9] origin-top">{renderTemplate()}</div>
              <div className="flex-1 flex flex-col h-full bg-[#1e293b] rounded-xl border border-[#334155] shadow-2xl overflow-hidden">
                <div className="bg-[#0f172a] px-4 py-3 border-b border-[#334155] flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Editor</span>
                </div>
                <textarea value={editText} onChange={e => setEditText(e.target.value)}
                  className="flex-1 w-full bg-[#1e293b] p-6 text-sm text-slate-300 focus:outline-none resize-none font-mono leading-relaxed" />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[210mm] transition-transform duration-500 ease-out" ref={documentRef}>
              <div className="bg-white text-black shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-sm min-h-[297mm] relative">
                {renderTemplate()}
                {isTyping && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-indigo-600/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">Writing...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!generatedLetter && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="bg-[#1e293b]/80 backdrop-blur border border-[#334155] p-6 rounded-2xl flex flex-col items-center gap-4 max-w-sm text-center">
                <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center border border-[#334155]">
                  <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Ready to Create?</h3>
                  <p className="text-slate-400 text-sm">Fill in your details on the left and click Generate to see the magic happen.</p>
                </div>
              </div>
            </div>
          )}

          {generatedLetter && jobDescription?.trim() && (
            <div className="w-full max-w-[210mm] mx-auto mt-8 shrink-0">
              <ATSScore coverLetter={generatedLetter} jobDescription={jobDescription} triggerKey={atsKey} dict={dict} />
            </div>
          )}
        </div>
      </div>

      {showLinkedIn && (
        <LinkedInModal onClose={() => setShowLinkedIn(false)} coverLetter={generatedLetter}
          contactInfo={contactInfo} jobDescription={jobDescription} isPro={isPro} setShowUpgrade={setShowUpgrade} uiLang={uiLang} />
      )}
      {showReview && <ReviewModal onClose={() => setShowReview(false)} user={user} />}
    </div>
  );
};

export default DashboardTab;