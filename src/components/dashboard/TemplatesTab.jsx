import React from 'react';
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

const TemplatesTab = ({ selectedTemplate, setSelectedTemplate, setActiveTab, showNotification, isPro, setShowUpgrade, dict }) => {
  const p = { contact: { fullName: 'Alex Morgan', profession: 'Product Manager', email: 'alex@email.com', phone: '+1 234 567', location: 'New York' }, text: 'Dear Hiring Manager...', date: '2026', userPhoto: null };

  const renderPreview = (tplId) => {
    const Component = TEMPLATE_MAP[tplId] || TemplateGenericProInline;
    return <Component {...p} />;
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 md:p-10 bg-[#0f172a] text-white custom-scrollbar">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', margin: '0 0 8px' }}>{dict?.templatesSection || "Templates"}</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Click any template to apply it. Pro templates require a Pro subscription.</p>
        </div>

        {/* FREE */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Free</span>
            <div style={{ flex: 1, height: '1px', background: '#1e293b' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {TEMPLATES.filter(t => !t.pro).map(tpl => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <div key={tpl.id}
                  onClick={() => { setSelectedTemplate(tpl.id); setActiveTab('dashboard'); showNotification(`Template: ${tpl.name}`); }}
                  style={{ cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', border: isSelected ? '2px solid #6366f1' : '2px solid #1e293b', transition: 'all 0.2s', background: '#1e293b', boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.3)' : 'none' }}>
                  <div style={{ height: '220px', overflow: 'hidden', position: 'relative', background: '#111827' }}>
                    <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', pointerEvents: 'none' }}>
                      {renderPreview(tpl.id)}
                    </div>
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#6366f1', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 900 }}>✓</div>
                    )}
                  </div>
                  <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '13px', color: 'white', margin: '0 0 2px' }}>{tpl.name}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>{tpl.desc}</p>
                    </div>
                    <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 700 }}>Free</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRO */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>✦ Pro</span>
            <div style={{ flex: 1, height: '1px', background: '#1e293b' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {TEMPLATES.filter(t => t.pro).map(tpl => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <div key={tpl.id}
                  onClick={() => { if (!isPro) { setShowUpgrade(true); return; } setSelectedTemplate(tpl.id); setActiveTab('dashboard'); showNotification(`Template: ${tpl.name}`); }}
                  style={{ cursor: isPro ? 'pointer' : 'default', borderRadius: '16px', overflow: 'hidden', border: isSelected ? '2px solid #6366f1' : '2px solid #1e293b', transition: 'all 0.2s', background: '#1e293b', boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.3)' : 'none' }}>
                  <div style={{ height: '220px', overflow: 'hidden', position: 'relative', background: '#111827' }}>
                    <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', pointerEvents: 'none' }}>
                      {renderPreview(tpl.id)}
                    </div>
                    {!isPro && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div style={{ background: 'rgba(99,102,241,0.9)', borderRadius: '24px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'white' }}>
                          <IconLock /> Pro only
                        </div>
                      </div>
                    )}
                    {isPro && isSelected && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#6366f1', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 900 }}>✓</div>
                    )}
                  </div>
                  <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '13px', color: 'white', margin: '0 0 2px' }}>{tpl.name}</p>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>{tpl.desc}</p>
                    </div>
                    <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '9px', fontWeight: 900, padding: '3px 7px', borderRadius: '6px', textTransform: 'uppercase' }}>PRO</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TemplatesTab;

