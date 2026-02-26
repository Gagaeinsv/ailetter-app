import React from 'react';
import { 
  TemplateInfluxInline, TemplateIconicInline, TemplateEnfoldInline, 
  TemplateModernInline, TemplateMinimalInline, TemplateNovaInline, 
  TemplateBreezeInline, TemplateExecutiveInline, TemplateNordicInline, 
  TemplateBerlinInline, TemplateOnyxInline, TemplateGenericProInline 
} from '../templates/Templates';

const IconMagic    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>;
const IconRefresh  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6m12-4a9 9 0 0 1-15 6.7L3 16"/></svg>;
const IconCopy     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const IconSave     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconCheck    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const IconEdit     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconLock     = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const DashboardTab = (props) => {
  const {
    contactInfo, jobDescription, setJobDescription,
    cvFile, fileName, handleFileChange, handleAutoFill, parsingCV,
    settings, setSettings, selectedTemplate, setSelectedTemplate,
    handleGenerate, loading, generatedLetter, setGeneratedLetter,
    downloadPDF, editMode, setEditMode, editText, setEditText,
    dict, TEMPLATES, todayStr, placeholderText,
    showNotification, handleSaveToHistory,
    documentRef,   // ← FIX 1: needed for html2pdf
    isPro,         // ← FIX 3: needed for Pro template lock
    setShowUpgrade,
  } = props;

  const renderTemplate = () => {
    const p = { contact: contactInfo, text: generatedLetter || placeholderText, date: todayStr };
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
      default:          return <TemplateGenericProInline {...p} />;
    }
  };

  const handleTemplateClick = (t) => {
    if (t.pro && !isPro) { setShowUpgrade(true); return; }
    setSelectedTemplate(t.id);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0f172a]">

      {/* ── LEFT: Inputs ── */}
      <div className="w-[420px] min-w-[420px] flex flex-col border-r border-[#334155] bg-[#0f172a] h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 space-y-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
          <h1 className="text-2xl font-black text-white">{dict.step1}</h1>
          <p className="text-xs text-gray-400 leading-relaxed">{dict.step1Desc}</p>

          {/* CV Upload */}
          <div className="bg-[#1e293b] p-5 rounded-2xl border border-[#334155]">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black uppercase text-gray-500">{dict.cvSection}</label>
              <button
                onClick={handleAutoFill}
                disabled={parsingCV || !cvFile}
                className="text-[10px] font-bold text-[#6366f1] hover:text-white transition-colors disabled:opacity-40"
              >
                {parsingCV ? 'Parsing...' : dict.autoFill}
              </button>
            </div>
            <label className="flex flex-col items-center justify-center w-full h-24 bg-[#0f172a]/50 border-2 border-dashed border-[#334155] rounded-xl cursor-pointer hover:border-[#6366f1] transition-all group">
              <span className="text-xs font-bold text-gray-500 group-hover:text-white transition-colors">{fileName || dict.cvUploadBtn}</span>
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </label>
          </div>

          {/* Job Description */}
          <div className="bg-[#1e293b] p-5 rounded-2xl border border-[#334155]">
            <label className="text-[10px] font-black uppercase text-gray-500 mb-3 block">{dict.jobSection}</label>
            <textarea
              className="w-full h-64 bg-[#0f172a]/50 border border-[#334155] rounded-xl p-4 text-sm text-white focus:border-[#6366f1] outline-none resize-none placeholder-gray-700 transition-all"
              placeholder={dict.jobPlaceholder}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="p-6 border-t border-[#334155] bg-[#0f172a] shrink-0">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 bg-[#6366f1] hover:bg-[#4f46e5] disabled:bg-[#4338ca] rounded-2xl font-black text-sm uppercase shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'Generating...' : <><IconMagic /> {dict.generate}</>}
          </button>
        </div>
      </div>

      {/* ── RIGHT: Preview ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#1e293b]">

        {/* Toolbar */}
        <div className="h-16 border-b border-[#334155] flex items-center justify-between px-6 shrink-0 bg-[#1e293b]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-[#94a3b8] uppercase tracking-widest">{dict.preview}</span>
            {generatedLetter && (
              <div className="flex gap-1">
                <button onClick={handleGenerate} title={dict.regenerate} className="p-2 text-gray-400 hover:text-white hover:bg-[#334155] rounded-lg transition-all"><IconRefresh /></button>
                <button onClick={() => { navigator.clipboard.writeText(generatedLetter); showNotification('Copied!'); }} className="p-2 text-gray-400 hover:text-white hover:bg-[#334155] rounded-lg transition-all"><IconCopy /></button>
                <button onClick={handleSaveToHistory} title="Save to history" className="p-2 text-[#6366f1] hover:bg-[#6366f1]/10 rounded-lg transition-all"><IconSave /></button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {generatedLetter && (
              <button
                onClick={() => {
                  if (!editMode) setEditText(generatedLetter);
                  else setGeneratedLetter(editText);
                  setEditMode(!editMode);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${editMode ? 'bg-[#6366f1] text-white' : 'bg-[#0f172a] text-gray-400 border border-[#334155]'}`}
              >
                {editMode ? <><IconCheck /> {dict.done || 'Done'}</> : <><IconEdit /> {dict.edit || 'Edit'}</>}
              </button>
            )}
            <button
              onClick={downloadPDF}
              disabled={!generatedLetter}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-gray-200 transition-all disabled:opacity-40"
            >
              <IconDownload /> {dict.download}
            </button>
          </div>
        </div>

        {/* Quick Settings Bar */}
        <div className="border-b border-[#334155] bg-[#0f172a]/30 p-3 flex gap-4 shrink-0 overflow-x-auto items-center" style={{ scrollbarWidth: 'none' }}>
          {/* Tone */}
          <div className="flex gap-2 items-center shrink-0">
            <span className="text-[9px] font-black uppercase text-gray-500">{dict.tone}:</span>
            {['Professional', 'Friendly', 'Formal'].map(t => (
              <button key={t} onClick={() => setSettings({ ...settings, tone: t })}
                className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-all ${settings.tone === t ? 'bg-[#6366f1] border-[#6366f1] text-white' : 'border-[#334155] text-gray-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-[#334155] shrink-0" />

          {/* Language */}
          <div className="flex gap-2 items-center shrink-0">
            <span className="text-[9px] font-black uppercase text-gray-500">{dict.lang}:</span>
            <select
              value={settings.language}
              onChange={e => setSettings({ ...settings, language: e.target.value })}
              className="bg-[#1e293b] border border-[#334155] text-white text-[10px] font-bold py-1 px-2 rounded-md outline-none cursor-pointer"
            >
              <option>Auto</option>
              <option>English</option>
              <option>Ukrainian</option>
              <option>Italiano</option>
              <option>Deutsch</option>
            </select>
          </div>

          <div className="w-px h-4 bg-[#334155] shrink-0" />

          {/* Templates — FIX 3: Pro lock */}
          <div className="flex gap-2 items-center shrink-0">
            <span className="text-[9px] font-black uppercase text-gray-500">{dict.template || 'Template'}:</span>
            {TEMPLATES.slice(0, 5).map(t => (
              <button
                key={t.id}
                onClick={() => handleTemplateClick(t)}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold border transition-all ${
                  selectedTemplate === t.id
                    ? 'bg-white border-white text-black'
                    : 'border-[#334155] text-gray-400 hover:text-white'
                } ${t.pro && !isPro ? 'opacity-50' : ''}`}
              >
                {t.pro && !isPro && <IconLock />}
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Document Preview */}
        <div
          className="flex-1 overflow-y-auto p-10 flex justify-center bg-[#111827]"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
        >
          {editMode ? (
            // ── FIX 2: Edit mode uses renderTemplate() not hardcoded Influx ──
            <div className="flex w-full max-w-[1200px] gap-6">
              <div className="flex-1 bg-white shadow-2xl rounded-sm opacity-80 pointer-events-none h-fit">
                {renderTemplate()}
              </div>
              <div className="flex-1 flex flex-col min-h-[297mm]">
                <div className="bg-[#1e293b] text-white text-xs font-bold p-3 rounded-t-xl border border-[#334155] flex items-center gap-2">
                  <IconEdit /> Editor
                </div>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full flex-1 bg-[#0f172a] border border-t-0 border-[#334155] rounded-b-xl p-6 text-sm text-gray-300 focus:outline-none resize-none font-mono leading-relaxed"
                />
              </div>
            </div>
          ) : (
            // ── Normal preview ──
            <div className="w-full max-w-[210mm]" ref={documentRef}>
              <div className="bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-sm min-h-[297mm]">
                {renderTemplate()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;