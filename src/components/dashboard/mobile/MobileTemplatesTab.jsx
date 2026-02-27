import React from 'react';
import { TEMPLATES } from '../../../constants/templates';
// Імпортуємо Inline-шаблони для прев'ю (переконайтесь, що цей шлях правильний у вашому проекті)
import { 
  TemplateInfluxInline, 
  TemplateIconicInline, 
  TemplateEnfoldInline, 
  TemplateModernInline, 
  TemplateMinimalInline 
} from '../../templates/Templates'; 

// Локальна іконка (щоб уникнути помилок імпорту)
const IconLock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const MobileTemplatesTab = ({ 
  selectedTemplate, 
  setSelectedTemplate, 
  setActiveTab, 
  isPro, 
  setShowUpgrade,
  dict
}) => {

  const handleSelect = (templateId, isLocked) => {
    if (isLocked) {
      setShowUpgrade(true);
    } else {
      setSelectedTemplate(templateId);
      setActiveTab('dashboard'); // Повертаємось на головну після вибору
    }
  };

  // Функція для рендеру міні-прев'ю
  const renderPreview = (id) => {
    const props = { 
      contact: { fullName: 'ALEX DOE', profession: 'PRODUCT DESIGNER', email: 'alex@email.com', phone: '+1234567890', location: 'New York, USA' },
      text: 'Dear Hiring Manager, I am writing to express my interest...',
      date: '2025-02-24',
      userPhoto: null 
    };

    // Масштабуємо контент, щоб він вліз у картку
    const scaleStyle = { transform: 'scale(0.28)', transformOrigin: 'top left', width: '357%', height: '357%' };

    return (
      <div className="w-full h-full overflow-hidden bg-white pointer-events-none select-none relative">
        <div style={scaleStyle}>
          {id === 'influx' && <TemplateInfluxInline {...props} />}
          {id === 'iconic' && <TemplateIconicInline {...props} />}
          {id === 'enfold' && <TemplateEnfoldInline {...props} />}
          {id === 'modern' && <TemplateModernInline {...props} />}
          {id === 'minimal' && <TemplateMinimalInline {...props} />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#0f172a] pt-20 pb-24 px-4 overflow-y-auto">
      <h2 className="text-2xl font-black text-white mb-2">{dict?.templatesSection || 'Templates'}</h2>
<p className="text-gray-400 text-sm mb-6">{dict?.templatesHint || 'Tap to apply'}</p>

      <div className="grid grid-cols-2 gap-4">
        {TEMPLATES.map((t) => {
          const isLocked = t.pro && !isPro;
          const isSelected = selectedTemplate === t.id;

          return (
            <div 
              key={t.id}
              onClick={() => handleSelect(t.id, isLocked)}
              className={`relative rounded-2xl overflow-hidden aspect-[1/1.4] transition-all border-2 ${
                isSelected ? 'border-[#6366f1] ring-4 ring-[#6366f1]/20' : 'border-transparent hover:border-gray-600'
              }`}
            >
              {/* Прев'ю документа */}
              {renderPreview(t.id)}

              {/* Overlay для заблокованих */}
              {isLocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white z-10">
                  <div className="bg-[#1e293b] p-3 rounded-full mb-2 border border-[#334155] shadow-xl">
                    <IconLock />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#6366f1] px-2 py-1 rounded">PRO</span>
                </div>
              )}

              {/* Назва шаблону знизу */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                <p className="text-white text-xs font-bold text-center capitalize">{t.id}</p>
              </div>

              {/* Індикатор вибору */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#6366f1] rounded-full flex items-center justify-center text-white text-xs border-2 border-white shadow-lg z-20">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileTemplatesTab;