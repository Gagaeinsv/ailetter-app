import React, { useState } from 'react';
import { IconLock } from '../ui/Icons';
import {
  TemplateInfluxInline, TemplateIconicInline, TemplateEnfoldInline,
  TemplateModernInline, TemplateMinimalInline, TemplateNovaInline,
  TemplateBreezeInline, TemplateExecutiveInline, TemplateNordicInline,
  TemplateBerlinInline, TemplateOnyxInline,
  TemplateTokyoInline, TemplateMilanoInline, TemplateSydneyInline,
  TemplateAtlasInline, TemplatePearlInline,
  TemplateGenericProInline
} from '../templates/Templates';
import { TEMPLATES } from '../../constants/templates';

const TEMPLATE_MAP = {
  influx:    TemplateInfluxInline,
  iconic:    TemplateIconicInline,
  minimal:   TemplateMinimalInline,
  nova:      TemplateNovaInline,
  breeze:    TemplateBreezeInline,
  enfold:    TemplateEnfoldInline,
  modern:    TemplateModernInline,
  executive: TemplateExecutiveInline,
  nordic:    TemplateNordicInline,
  berlin:    TemplateBerlinInline,
  onyx:      TemplateOnyxInline,
  tokyo:     TemplateTokyoInline,
  milano:    TemplateMilanoInline,
  sydney:    TemplateSydneyInline,
  atlas:     TemplateAtlasInline,
  pearl:     TemplatePearlInline,
};

const CV_TEMPLATES = [
  { id: 'modern',        name: 'Influx (Modern)',          pro: false, desc: 'Clean modern layout (with photo support)' },
  { id: 'classic',       name: 'Iconic (Classic)',         pro: false, desc: 'Elegant centered serif layout' },
  { id: 'minimal',       name: 'Minimal',                  pro: false, desc: 'Minimalist left-bordered layout' },
  { id: 'photo-modern',  name: 'Breeze (Photo)',           pro: false, desc: 'Creative layout built for profile photographs' },
  { id: 'nova',          name: 'Nova (Dark)',              pro: false, desc: 'High-end slate dark-mode resume theme' },
  { id: 'nordic',        name: 'Nordic',                   pro: true,  desc: 'Minimalist cool-blue accent layout' },
  { id: 'milano',        name: 'Milano',                   pro: true,  desc: 'Serif layout with warm ivory background' },
  { id: 'onyx',          name: 'Onyx',                     pro: true,  desc: 'Luxury slate-header and gold-accent layout' },
  { id: 'photo-classic', name: 'Executive Photo',          pro: true,  desc: 'Elite classic layout with top-border' },
];

const MiniCVPreview = ({ templateId }) => {
  const isSerif = templateId === 'classic' || templateId === 'milano' || templateId === 'onyx' || templateId === 'photo-classic';
  const fontFamily = isSerif ? 'Georgia, serif' : 'system-ui, -apple-system, sans-serif';
  
  let bg = '#ffffff';
  let text = '#0f172a';
  
  if (templateId === 'nova') {
    bg = '#0f172a';
    text = '#f8fafc';
  } else if (templateId === 'milano') {
    bg = '#fffbf0';
    text = '#451a03';
  } else if (templateId === 'nordic') {
    bg = '#f8fafc';
    text = '#1e293b';
  }

  return (
    <div style={{ fontFamily, background: bg, color: text, padding: '20px 24px', height: '580px', width: '400px', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }} className="text-left">
      {/* Header */}
      {templateId === 'onyx' ? (
        <div style={{ background: '#0f172a', color: '#fff', padding: '10px 14px', borderBottom: '3px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '6px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>Alex Morgan</div>
            <div style={{ fontSize: '10px', color: '#ccc' }}>Product Manager</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#444' }} />
        </div>
      ) : templateId === 'nova' ? (
        <div style={{ borderBottom: '1px solid rgba(129,140,248,0.3)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'black', color: '#fff' }}>ALEX MORGAN</div>
            <div style={{ fontSize: '10px', color: '#818cf8', fontWeight: 'bold' }}>PRODUCT MANAGER</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#818cf8' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: templateId === 'minimal' ? 'none' : '1px solid #eee', paddingBottom: '8px', borderLeft: templateId === 'nordic' ? '3px solid #0284c7' : 'none', paddingLeft: templateId === 'nordic' ? '8px' : 'none' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: templateId === 'milano' ? '#78350f' : '#111' }}>Alex Morgan</div>
            <div style={{ fontSize: '10px', color: templateId === 'nordic' ? '#0284c7' : '#666', fontWeight: 'bold' }}>Product Manager</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: templateId === 'photo-classic' || templateId === 'milano' ? '50%' : '0', background: '#ccc' }} />
        </div>
      )}

      {/* Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: templateId === 'nova' ? '#818cf8' : templateId === 'nordic' ? '#0284c7' : templateId === 'milano' ? '#b45309' : '#6366f1' }}>Summary</div>
        <div style={{ fontSize: '8px', opacity: 0.8, lineHeight: 1.4 }}>Result-oriented Product Manager with 5+ years of experience leading cross-functional teams to design, build, and launch complex web applications.</div>
      </div>

      {/* Experience */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #eee', paddingBottom: '2px', color: templateId === 'nova' ? '#818cf8' : templateId === 'nordic' ? '#0284c7' : templateId === 'milano' ? '#b45309' : '#6366f1' }}>Experience</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 'bold' }}>
            <div>Senior Product Manager</div>
            <div style={{ opacity: 0.6 }}>2022 - Present</div>
          </div>
          <div style={{ fontSize: '8px', fontStyle: 'italic', color: templateId === 'nova' ? '#818cf8' : '#666' }}>Google</div>
          <div style={{ fontSize: '8px', opacity: 0.8 }}>• Led launch of 3 major AI-driven features, increasing user engagement by 25%.</div>
          <div style={{ fontSize: '8px', opacity: 0.8 }}>• Managed a roadmap for a team of 12 software engineers and designers.</div>
        </div>
      </div>

      {/* Skills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: templateId === 'nova' ? '#818cf8' : templateId === 'nordic' ? '#0284c7' : templateId === 'milano' ? '#b45309' : '#6366f1' }}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {['Product Strategy', 'Agile', 'User Research', 'Data Analysis'].map(s => (
            <span key={s} style={{ fontSize: '7px', background: templateId === 'nova' ? '#1e293b' : '#f1f5f9', color: templateId === 'nova' ? '#fff' : '#334155', padding: '2px 6px', borderRadius: '4px' }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const TemplatesTab = ({
  selectedTemplate,
  setSelectedTemplate,
  selectedCVTemplate,
  setSelectedCVTemplate,
  setActiveTab,
  showNotification,
  isPro,
  setShowUpgrade,
  dict
}) => {
  const [mode, setMode] = useState('cover-letter'); // 'cover-letter' | 'cv'

  const p = {
    contact: { fullName: 'Alex Morgan', profession: 'Product Manager', email: 'alex@email.com', phone: '+1 234 567', location: 'New York' },
    text: 'Dear Hiring Manager...',
    date: '2026',
    userPhoto: null
  };

  const renderPreview = (tplId) => {
    const Component = TEMPLATE_MAP[tplId] || TemplateGenericProInline;
    return <Component {...p} />;
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 md:p-10 bg-[#0f172a] text-white custom-scrollbar select-text">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Tab Header & Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              {dict?.templatesSection || "Templates"}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">
              {mode === 'cover-letter' 
                ? "Browse cover letter layouts. Click to apply to your current letter."
                : "Browse resume & CV layouts. Click to apply and start editing."}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-[#1e293b] p-1.5 rounded-2xl border border-[#334155] self-start md:self-auto shadow-lg">
            <button
              onClick={() => setMode('cover-letter')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                mode === 'cover-letter'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cover Letters
            </button>
            <button
              onClick={() => setMode('cv')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                mode === 'cv'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Resumes / CVs
            </button>
          </div>
        </div>

        {/* --- COVER LETTERS GRID --- */}
        {mode === 'cover-letter' && (
          <div className="space-y-12">
            {/* FREE */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Layouts</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {TEMPLATES.filter(t => !t.pro).map(tpl => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div key={tpl.id}
                      onClick={() => { setSelectedTemplate(tpl.id); setActiveTab('dashboard'); showNotification(`Template applied: ${tpl.name}`); }}
                      className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all bg-[#1e293b] hover:border-indigo-500/50 ${
                        isSelected ? 'border-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-[#1e293b]'
                      }`}>
                      <div className="h-[220px] overflow-hidden relative bg-[#111827]">
                        <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', pointerEvents: 'none' }}>
                          {renderPreview(tpl.id)}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white font-black shadow-lg">✓</div>
                        )}
                      </div>
                      <div className="p-4 flex justify-between items-center bg-[#1e293b]/70 border-t border-slate-800">
                        <div>
                          <p className="font-extrabold text-sm text-white">{tpl.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{tpl.desc}</p>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">Free</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRO */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">✦ PRO Layouts</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {TEMPLATES.filter(t => t.pro).map(tpl => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div key={tpl.id}
                      onClick={() => { if (!isPro) { setShowUpgrade(true); return; } setSelectedTemplate(tpl.id); setActiveTab('dashboard'); showNotification(`Template applied: ${tpl.name}`); }}
                      className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all bg-[#1e293b] hover:border-indigo-500/50 ${
                        isSelected ? 'border-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-[#1e293b]'
                      }`}>
                      <div className="h-[220px] overflow-hidden relative bg-[#111827]">
                        <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', pointerEvents: 'none' }}>
                          {renderPreview(tpl.id)}
                        </div>
                        {!isPro && (
                          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                            <div className="bg-indigo-600/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-white shadow-lg">
                              <IconLock className="w-3 h-3" /> Pro Only
                            </div>
                          </div>
                        )}
                        {isPro && isSelected && (
                          <div className="absolute top-2 right-2 bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white font-black shadow-lg">✓</div>
                        )}
                      </div>
                      <div className="p-4 flex justify-between items-center bg-[#1e293b]/70 border-t border-slate-800">
                        <div>
                          <p className="font-extrabold text-sm text-white">{tpl.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{tpl.desc}</p>
                        </div>
                        <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded border border-indigo-500/10">PRO</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- RESUMES / CVS GRID --- */}
        {mode === 'cv' && (
          <div className="space-y-12">
            {/* FREE */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Layouts</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {CV_TEMPLATES.filter(t => !t.pro).map(tpl => {
                  const isSelected = selectedCVTemplate === tpl.id;
                  return (
                    <div key={tpl.id}
                      onClick={() => { setSelectedCVTemplate(tpl.id); setActiveTab('cv-maker'); showNotification(`CV Template applied: ${tpl.name}`); }}
                      className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all bg-[#1e293b] hover:border-indigo-500/50 ${
                        isSelected ? 'border-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-[#1e293b]'
                      }`}>
                      <div className="h-[220px] overflow-hidden relative bg-[#111827]">
                        <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', pointerEvents: 'none' }}>
                          <MiniCVPreview templateId={tpl.id} />
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white font-black shadow-lg">✓</div>
                        )}
                      </div>
                      <div className="p-4 flex justify-between items-center bg-[#1e293b]/70 border-t border-slate-800">
                        <div>
                          <p className="font-extrabold text-sm text-white">{tpl.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{tpl.desc}</p>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">Free</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRO */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">✦ PRO Layouts</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {CV_TEMPLATES.filter(t => t.pro).map(tpl => {
                  const isSelected = selectedCVTemplate === tpl.id;
                  return (
                    <div key={tpl.id}
                      onClick={() => { if (!isPro) { setShowUpgrade(true); return; } setSelectedCVTemplate(tpl.id); setActiveTab('cv-maker'); showNotification(`CV Template applied: ${tpl.name}`); }}
                      className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all bg-[#1e293b] hover:border-indigo-500/50 ${
                        isSelected ? 'border-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-[#1e293b]'
                      }`}>
                      <div className="h-[220px] overflow-hidden relative bg-[#111827]">
                        <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', pointerEvents: 'none' }}>
                          <MiniCVPreview templateId={tpl.id} />
                        </div>
                        {!isPro && (
                          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                            <div className="bg-indigo-600/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-white shadow-lg">
                              <IconLock className="w-3 h-3" /> Pro Only
                            </div>
                          </div>
                        )}
                        {isPro && isSelected && (
                          <div className="absolute top-2 right-2 bg-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-xs text-white font-black shadow-lg">✓</div>
                        )}
                      </div>
                      <div className="p-4 flex justify-between items-center bg-[#1e293b]/70 border-t border-slate-800">
                        <div>
                          <p className="font-extrabold text-sm text-white">{tpl.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{tpl.desc}</p>
                        </div>
                        <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded border border-indigo-500/10">PRO</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TemplatesTab;
