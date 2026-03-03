// src/components/dashboard/mobile/MobileTemplatesTab.jsx
import React from 'react';
import { IconLock } from '../../ui/Icons';
import {
  TemplateInfluxInline, TemplateIconicInline, TemplateEnfoldInline, TemplateModernInline,
  TemplateMinimalInline, TemplateNovaInline, TemplateBreezeInline, TemplateExecutiveInline,
  TemplateNordicInline, TemplateBerlinInline, TemplateOnyxInline, TemplateGenericProInline
} from '../../templates/Templates';
import { TEMPLATES } from '../../../constants/templates';

const PREVIEW_PROPS = {
  contact: { fullName: 'Alex Morgan', profession: 'Product Manager', email: 'alex@email.com', phone: '+1 234 567', location: 'New York' },
  text: 'Dear Hiring Manager,\n\nI am excited to apply for this position. With 5+ years of experience in product management and a proven track record of delivering results, I am confident I would be a strong addition.\n\nSincerely,',
  date: 'February 2026',
  userPhoto: null,
};

const renderPreview = (id) => {
  if (id === 'influx')    return <TemplateInfluxInline    {...PREVIEW_PROPS} />;
  if (id === 'iconic')    return <TemplateIconicInline    {...PREVIEW_PROPS} />;
  if (id === 'enfold')    return <TemplateEnfoldInline    {...PREVIEW_PROPS} />;
  if (id === 'modern')    return <TemplateModernInline    {...PREVIEW_PROPS} />;
  if (id === 'minimal')   return <TemplateMinimalInline   {...PREVIEW_PROPS} />;
  if (id === 'nova')      return <TemplateNovaInline      {...PREVIEW_PROPS} />;
  if (id === 'breeze')    return <TemplateBreezeInline    {...PREVIEW_PROPS} />;
  if (id === 'executive') return <TemplateExecutiveInline {...PREVIEW_PROPS} />;
  if (id === 'nordic')    return <TemplateNordicInline    {...PREVIEW_PROPS} />;
  if (id === 'berlin')    return <TemplateBerlinInline    {...PREVIEW_PROPS} />;
  if (id === 'onyx')      return <TemplateOnyxInline      {...PREVIEW_PROPS} />;
  if (id === 'tokyo')     return <TemplateGenericProInline {...PREVIEW_PROPS} accent="#7c3aed" bg="#fafafa" />;
  if (id === 'milano')    return <TemplateGenericProInline {...PREVIEW_PROPS} accent="#d97706" bg="#fffbf0" />;
  if (id === 'sydney')    return <TemplateGenericProInline {...PREVIEW_PROPS} accent="#0369a1" bg="#f0f9ff" />;
  if (id === 'atlas')     return <TemplateGenericProInline {...PREVIEW_PROPS} accent="#9333ea" bg="#fdf4ff" />;
  if (id === 'pearl')     return <TemplateGenericProInline {...PREVIEW_PROPS} accent="#e11d48" bg="#fff1f2" />;
};

const MobileTemplateCard = ({ tpl, isSelected, isPro, onClick }) => {
  const locked = tpl.pro && !isPro;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all bg-[#1e293b] active:scale-95 ${
        isSelected
          ? 'border-[#6366f1] shadow-[0_0_16px_rgba(99,102,241,0.3)]'
          : 'border-[#1e293b]'
      }`}
    >
      {/* Preview thumbnail */}
      <div className="h-48 overflow-hidden relative bg-white">
        <div className="pointer-events-none" style={{ transform: 'scale(0.33)', transformOrigin: 'top left', width: '303%', height: '303%' }}>
          {renderPreview(tpl.id)}
        </div>

        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 bg-[#0f172a]/75 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 bg-[#1e293b] border border-[#334155] rounded-full flex items-center justify-center">
              <IconLock />
            </div>
            <span className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">Pro</span>
          </div>
        )}

        {isSelected && (
          <div className="absolute top-2 right-2 bg-[#6366f1] rounded-full w-5 h-5 flex items-center justify-center text-white text-[10px] font-black shadow">✓</div>
        )}

        <div className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
          tpl.pro ? 'bg-[#7c3aed]/90 text-white' : 'bg-emerald-500/90 text-white'
        }`}>
          {tpl.pro ? 'PRO' : 'Free'}
        </div>
      </div>

      {/* Label */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <p className="text-sm font-black text-white">{tpl.name}</p>
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: tpl.color }} />
      </div>
    </div>
  );
};

const MobileTemplatesTab = ({ selectedTemplate, setSelectedTemplate, setActiveTab, showNotification, isPro, setShowUpgrade }) => {
  const free = TEMPLATES.filter(t => !t.pro);
  const pro  = TEMPLATES.filter(t => t.pro);

  const handleSelect = (tpl) => {
    if (tpl.pro && !isPro) { setShowUpgrade(true); return; }
    setSelectedTemplate(tpl.id);
    setActiveTab('dashboard');
    showNotification(`Template: ${tpl.name}`);
  };

  return (
    <div
      className="h-full overflow-y-auto bg-[#0f172a]"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
    >
      <div className="p-4 space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-white">Templates</h2>
          <p className="text-xs text-[#64748b] mt-1">Tap to apply. Pro templates need a subscription.</p>
        </div>

        {/* Free */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Free</span>
            <div className="flex-1 h-px bg-[#1e293b]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {free.map(tpl => (
              <MobileTemplateCard
                key={tpl.id}
                tpl={tpl}
                isSelected={selectedTemplate === tpl.id}
                isPro={isPro}
                onClick={() => handleSelect(tpl)}
              />
            ))}
          </div>
        </div>

        {/* Pro */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-black text-[#a78bfa] uppercase tracking-widest">✦ Pro</span>
            <div className="flex-1 h-px bg-[#1e293b]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {pro.map(tpl => (
              <MobileTemplateCard
                key={tpl.id}
                tpl={tpl}
                isSelected={selectedTemplate === tpl.id}
                isPro={isPro}
                onClick={() => handleSelect(tpl)}
              />
            ))}
          </div>

          {!isPro && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="mt-4 w-full py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-lg shadow-[#6366f1]/25 active:scale-95 transition-all"
            >
              ✦ Unlock All Pro Templates
            </button>
          )}
        </div>

        {/* Bottom padding for nav */}
        <div className="h-2" />
      </div>
    </div>
  );
};

export default MobileTemplatesTab;