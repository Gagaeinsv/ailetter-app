import React from "react";
import {
  TemplateInfluxInline,
  TemplateIconicInline,
  TemplateEnfoldInline,
  TemplateModernInline,
  TemplateMinimalInline,
  TemplateNovaInline,
  TemplateBreezeInline,
  TemplateExecutiveInline,
  TemplateNordicInline,
  TemplateBerlinInline,
  TemplateOnyxInline,
  TemplateGenericProInline
} from "../templates/Templates";
import Skeleton from "../ui/Skeleton";

export default function DashboardMain({
  dict,
  loading,
  generatedLetter,
  selectedTemplate,
  setSelectedTemplate,
  setSettings,
  settings,
  handleGenerate,
  handleSaveToHistory,
  downloadPDF,
  contactInfo,
  user,
  todayStr,
  placeholderText,
  templateList,
  showNotification,
  documentRef
}) {
  const renderTemplate = (text) => {
    const props = {
      contact: contactInfo,
      text,
      date: todayStr,
      userPhoto: user?.photoURL
    };

    switch (selectedTemplate) {
      case "influx": return <TemplateInfluxInline {...props} />;
      case "iconic": return <TemplateIconicInline {...props} />;
      case "enfold": return <TemplateEnfoldInline {...props} />;
      case "modern": return <TemplateModernInline {...props} />;
      case "minimal": return <TemplateMinimalInline {...props} />;
      case "nova": return <TemplateNovaInline {...props} />;
      case "breeze": return <TemplateBreezeInline {...props} />;
      case "executive": return <TemplateExecutiveInline {...props} />;
      case "nordic": return <TemplateNordicInline {...props} />;
      case "berlin": return <TemplateBerlinInline {...props} />;
      case "onyx": return <TemplateOnyxInline {...props} />;
      case "tokyo": return <TemplateGenericProInline {...props} accent="#7c3aed" bg="#fafafa" />;
      case "milano": return <TemplateGenericProInline {...props} accent="#d97706" bg="#fffbf0" />;
      case "sydney": return <TemplateGenericProInline {...props} accent="#0369a1" bg="#f0f9ff" />;
      case "atlas": return <TemplateGenericProInline {...props} accent="#9333ea" bg="#fdf4ff" />;
      case "pearl": return <TemplateGenericProInline {...props} accent="#e11d48" bg="#fff1f2" />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* LEFT PANEL */}
      <div className="w-[420px] min-w-[420px] flex flex-col border-r border-[#334155] bg-[#0f172a]">

        <div className="flex-1 overflow-y-auto p-8">
          <h1 className="text-[22px] font-black mb-1">{dict.step1}</h1>
          <p className="text-xs text-[#64748b] mb-6">{dict.step1Desc}</p>

          {/* GENERATE */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 bg-[#6366f1] hover:bg-[#4f46e5] rounded-xl font-black text-sm uppercase tracking-widest transition"
          >
            {loading ? "Generating…" : dict.generate}
          </button>

          <p className="text-[10px] text-[#475569] text-center mt-2">
            {dict.generateHint}
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col bg-[#1e293b]">

        {/* TOP BAR */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#334155]">

          <span className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
            {dict.preview}
          </span>

          <div className="flex items-center gap-2">

            <button
              onClick={handleGenerate}
              className="px-3 py-1 text-xs rounded bg-[#0f172a] hover:bg-[#334155]"
            >
              ↻
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLetter);
                showNotification(dict.copied);
              }}
              className="px-3 py-1 text-xs rounded bg-[#0f172a] hover:bg-[#334155]"
            >
              Copy
            </button>

            <button
              onClick={handleSaveToHistory}
              className="px-3 py-1 text-xs rounded bg-[#6366f1] hover:bg-[#4f46e5]"
            >
              {dict.saveHistory}
            </button>

            <button
              onClick={downloadPDF}
              className="px-3 py-1 text-xs rounded bg-white text-black"
            >
              PDF
            </button>

          </div>
        </div>

        {/* TEMPLATE SETTINGS */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-2 border-b border-[#334155]">

          {templateList.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTemplate(t.toLowerCase())}
              className={`px-3 py-1 text-[10px] rounded border ${
                selectedTemplate === t.toLowerCase()
                  ? "bg-white text-black border-white"
                  : "border-[#334155] text-[#64748b]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* PREVIEW */}
        <div className="flex-1 overflow-y-auto bg-[#111827] flex justify-center p-10">

          {loading ? (
            <div className="w-full max-w-[700px] bg-white rounded shadow">
              <Skeleton />
            </div>
          ) : (
            <div
              ref={documentRef}
              className="w-full max-w-[700px] bg-white rounded shadow overflow-hidden"
            >
              {renderTemplate(generatedLetter || placeholderText)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}