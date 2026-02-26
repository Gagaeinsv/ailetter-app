// src/components/templates/Templates.jsx

// --- TEMPLATES ---

const TemplateInflux = ({ contact, text, date }) => (
  <div className="h-[290mm] w-[210mm] bg-[#ffffff] text-[#000000] font-sans relative overflow-hidden flex flex-col mx-auto">
    <div className="p-10 flex justify-between items-center bg-[#1e293b] text-[#ffffff]">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-1 leading-none">{contact.fullName}</h1>
        <p className="font-bold tracking-widest text-xs uppercase text-[#60a5fa]">{contact.profession}</p>
      </div>
      <div className="text-right text-[10px] space-y-1 opacity-90 leading-tight">
        <p>{contact.email}</p><p>{contact.phone}</p><p>{contact.location}</p>
      </div>
    </div>
    <div className="p-10 flex-1 flex flex-col overflow-hidden">
      <div className="mb-6 pb-2 border-b-2 border-[#f3f4f6]"><p className="text-xs font-bold text-[#6b7280]">{date}</p></div>
      <div className="text-[12px] leading-6 whitespace-pre-wrap font-medium text-justify flex-1 overflow-hidden text-[#1f2937]">{text}</div>
      <div className="mt-4 pt-4 border-t border-[#e5e7eb] font-bold text-sm text-[#111827]">{contact.fullName}</div>
    </div>
  </div>
);

const TemplateIconic = ({ contact, text, date }) => (
  <div className="h-[290mm] w-[210mm] bg-[#ffffff] text-[#000000] font-sans p-12 relative flex flex-col mx-auto overflow-hidden">
    <div className="text-center mb-8 border-b-2 border-[#111827] pb-6">
      <h1 className="text-4xl font-thin mb-2 uppercase text-[#111827]">{contact.fullName}</h1>
      <div className="flex justify-center gap-4 text-[10px] font-bold text-[#6b7280]"><span>✉️ {contact.email}</span><span>📱 {contact.phone}</span><span>📍 {contact.location}</span></div>
    </div>
    <div className="max-w-2xl mx-auto flex-1 flex flex-col overflow-hidden">
      <p className="text-[10px] font-bold text-[#9ca3af] mb-6 text-right">{date}</p>
      <div className="text-[12px] leading-6 whitespace-pre-wrap text-justify flex-1 overflow-hidden text-[#374151]">{text}</div>
    </div>
  </div>
);

const TemplateEnfold = ({ contact, text, date, userPhoto }) => (
  <div className="flex h-[290mm] w-[210mm] bg-[#ffffff] text-[#000000] font-sans mx-auto overflow-hidden">
    <div className="w-[30%] p-6 pt-12 text-center bg-[#f1f5f9] border-r border-[#e5e7eb]">
       {userPhoto && (<div className="w-20 h-20 rounded-full mb-4 overflow-hidden mx-auto bg-[#d1d5db] border-[4px] border-[#ffffff]"><img src={userPhoto} alt="User" className="w-full h-full object-cover"/></div>)}
       <div className="space-y-4">
         <h3 className="text-[10px] font-black uppercase text-[#9ca3af]">Contact</h3>
         <p className="text-[10px] font-bold break-all text-[#374151]">{contact.email}</p>
         <p className="text-[10px] font-bold text-[#374151]">{contact.phone}</p>
         <p className="text-[10px] font-bold text-[#374151]">{contact.location}</p>
       </div>
    </div>
    <div className="w-[70%] p-10 pt-12 flex flex-col overflow-hidden">
      <h1 className="text-2xl font-bold mb-1 uppercase text-[#1e293b]">{contact.fullName}</h1>
      <p className="text-sm font-medium mb-8 tracking-widest text-[#64748b] uppercase">{contact.profession}</p>
      <div className="mb-6 pb-2 border-b border-[#e2e8f0] font-bold text-[10px] text-[#94a3b8]">{date}</div>
      <div className="text-[12px] leading-6 whitespace-pre-wrap text-justify flex-1 overflow-hidden text-[#334155]">{text}</div>
    </div>
  </div>
);

const TemplateModern = ({ contact, text, date, userPhoto }) => (
  <div className="flex h-[290mm] w-[210mm] bg-[#ffffff] text-[#000000] font-sans mx-auto overflow-hidden">
    <div className="w-1/3 p-8 pt-12 bg-[#1e293b] text-[#ffffff]">
      {userPhoto && (<div className="w-24 h-24 rounded-full mb-6 mx-auto overflow-hidden bg-[#6b7280] border-[4px] border-[#475569]"><img src={userPhoto} alt="User" className="w-full h-full object-cover" /></div>)}
      <h3 className="font-bold text-[10px] pb-2 mb-4 uppercase border-b border-[#475569] text-[#818cf8]">Contact</h3>
      <div className="space-y-3 text-[10px] opacity-90 break-all"><p>{contact.email}</p><p>{contact.phone}</p><p>{contact.location}</p></div>
    </div>
    <div className="w-2/3 p-10 pt-12 flex flex-col overflow-hidden">
      <h2 className="text-3xl font-black uppercase text-[#0f172a] mb-1">{contact.fullName}</h2>
      <p className="font-bold text-[10px] uppercase text-[#4f46e5] mb-8">{contact.profession}</p>
      <div className="mb-6 pb-2 border-b border-[#e5e7eb] font-bold text-[10px] text-[#6b7280]">{date}</div>
      <div className="text-[12px] leading-6 whitespace-pre-wrap text-justify flex-1 overflow-hidden text-[#374151]">{text}</div>
    </div>
  </div>
);

const TemplateMinimal = ({ contact, text, date }) => (
  <div className="h-[290mm] w-[210mm] bg-[#ffffff] text-[#000000] font-sans p-12 relative flex flex-col mx-auto overflow-hidden">
    <div className="pl-6 mb-8 border-l-[4px] border-[#4f46e5]">
      <h2 className="text-3xl font-bold uppercase text-[#111827]">{contact.fullName}</h2>
      <p className="text-sm text-[#6b7280] mt-1">{contact.profession}</p>
    </div>
    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-[#9ca3af] mb-8 border-b border-[#e5e7eb] pb-4"><p>{contact.email}</p><p>•</p><p>{contact.phone}</p><p>•</p><p>{contact.location}</p></div>
    <p className="text-[10px] font-bold text-[#111827] mb-6">{date}</p>
    <div className="text-[12px] leading-6 whitespace-pre-wrap text-justify flex-1 overflow-hidden text-[#111827]">{text}</div>
  </div>
);

// --- AUXILIARY ---

const Skeleton = () => (
  <div className="p-10 space-y-6 animate-pulse bg-white h-full w-full">
    <div className="h-8 bg-gray-100 rounded w-1/3 mb-10"></div>
    <div className="space-y-3">{[...Array(18)].map((_, i) => (<div key={i} className={`h-2.5 bg-gray-50 rounded ${i % 3 === 0 ? 'w-full' : 'w-5/6'}`}></div>))}</div>
    <div className="h-10 bg-gray-100 rounded w-1/4 mt-20"></div>
  </div>
);

const Toast = ({ show, message }) => (
  <div className={`fixed bottom-8 right-8 bg-[#6366f1] text-white px-5 py-3 rounded-xl shadow-2xl transition-all duration-500 z-50 flex items-center gap-3 ${show ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}>
    <div className="bg-white/20 p-1 rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>
    <span className="text-xs font-bold uppercase tracking-widest">{message}</span>
  </div>
);


// ─── INLINE TEMPLATES (no fixed height — scroll-friendly) ───────────────────

const TemplateInfluxInline = ({ contact, text, date }) => (
  <div style={{ background: '#ffffff', fontFamily: 'sans-serif' }}>
    <div style={{ padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', color: 'white' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>{contact.fullName}</h1>
        <p style={{ fontWeight: 700, letterSpacing: '0.15em', fontSize: '11px', textTransform: 'uppercase', color: '#60a5fa', margin: '6px 0 0' }}>{contact.profession}</p>
      </div>
      <div style={{ textAlign: 'right', fontSize: '11px', opacity: 0.85, lineHeight: 1.7 }}>
        <p style={{ margin: 0 }}>{contact.email}</p>
        <p style={{ margin: 0 }}>{contact.phone}</p>
        <p style={{ margin: 0 }}>{contact.location}</p>
      </div>
    </div>
    <div style={{ padding: '32px 40px 48px' }}>
      <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '12px', marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', margin: 0 }}>{date}</p>
      </div>
      <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#1f2937', textAlign: 'justify' }}>{text}</div>
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', fontWeight: 700, fontSize: '14px', color: '#111827' }}>{contact.fullName}</div>
    </div>
  </div>
);

const TemplateIconicInline = ({ contact, text, date }) => (
  <div style={{ background: '#ffffff', fontFamily: 'sans-serif', padding: '48px' }}>
    <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid #111827', paddingBottom: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 100, textTransform: 'uppercase', color: '#111827', margin: '0 0 10px' }}>{contact.fullName}</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px', fontWeight: 700, color: '#6b7280' }}>
        <span>✉️ {contact.email}</span><span>📱 {contact.phone}</span><span>📍 {contact.location}</span>
      </div>
    </div>
    <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textAlign: 'right', marginBottom: '24px' }}>{date}</p>
    <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#374151', textAlign: 'justify' }}>{text}</div>
  </div>
);

const TemplateEnfoldInline = ({ contact, text, date, userPhoto }) => (
  <div style={{ display: 'flex', background: '#ffffff', fontFamily: 'sans-serif' }}>
    <div style={{ width: '30%', padding: '40px 20px', textAlign: 'center', background: '#f1f5f9', borderRight: '1px solid #e5e7eb' }}>
      {userPhoto && <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '3px solid white' }}><img src={userPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
      <h3 style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 12px' }}>Contact</h3>
      <p style={{ fontSize: '10px', fontWeight: 700, color: '#374151', margin: '0 0 6px', wordBreak: 'break-all' }}>{contact.email}</p>
      <p style={{ fontSize: '10px', fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>{contact.phone}</p>
      <p style={{ fontSize: '10px', fontWeight: 700, color: '#374151', margin: 0 }}>{contact.location}</p>
    </div>
    <div style={{ flex: 1, padding: '40px 36px 48px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, textTransform: 'uppercase', color: '#1e293b', margin: '0 0 4px' }}>{contact.fullName}</h1>
      <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', margin: '0 0 24px' }}>{contact.profession}</p>
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>{date}</div>
      <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#334155', textAlign: 'justify' }}>{text}</div>
    </div>
  </div>
);

const TemplateModernInline = ({ contact, text, date, userPhoto }) => (
  <div style={{ display: 'flex', background: '#ffffff', fontFamily: 'sans-serif' }}>
    <div style={{ width: '32%', padding: '40px 24px', background: '#1e293b', color: 'white' }}>
      {userPhoto && <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px', border: '3px solid #475569' }}><img src={userPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
      <h3 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8', borderBottom: '1px solid #475569', paddingBottom: '8px', marginBottom: '14px', letterSpacing: '0.1em' }}>Contact</h3>
      <div style={{ fontSize: '10px', opacity: 0.85, lineHeight: 1.8, wordBreak: 'break-all' }}>
        <p style={{ margin: '0 0 4px' }}>{contact.email}</p>
        <p style={{ margin: '0 0 4px' }}>{contact.phone}</p>
        <p style={{ margin: 0 }}>{contact.location}</p>
      </div>
    </div>
    <div style={{ flex: 1, padding: '40px 36px 48px' }}>
      <h2 style={{ fontSize: '26px', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', margin: '0 0 4px' }}>{contact.fullName}</h2>
      <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#4f46e5', margin: '0 0 24px', letterSpacing: '0.1em' }}>{contact.profession}</p>
      <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px', fontSize: '10px', fontWeight: 700, color: '#6b7280' }}>{date}</div>
      <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#374151', textAlign: 'justify' }}>{text}</div>
    </div>
  </div>
);

const TemplateMinimalInline = ({ contact, text, date }) => (
  <div style={{ background: '#ffffff', fontFamily: 'sans-serif', padding: '48px' }}>
    <div style={{ borderLeft: '4px solid #4f46e5', paddingLeft: '20px', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '26px', fontWeight: 700, textTransform: 'uppercase', color: '#111827', margin: '0 0 4px' }}>{contact.fullName}</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{contact.profession}</p>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '10px', fontWeight: 700, color: '#9ca3af', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '24px' }}>
      <span>{contact.email}</span><span>•</span><span>{contact.phone}</span><span>•</span><span>{contact.location}</span>
    </div>
    <p style={{ fontSize: '10px', fontWeight: 700, color: '#111827', marginBottom: '20px' }}>{date}</p>
    <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#111827', textAlign: 'justify' }}>{text}</div>
  </div>
);


// ── ADDITIONAL INLINE TEMPLATES ──────────────────────────────────────────────

const TemplateNovaInline = ({ contact, text, date }) => (
  <div style={{ background: '#0f172a', fontFamily: 'sans-serif', color: 'white' }}>
    <div style={{ padding: '32px 40px', borderBottom: '1px solid #1e293b' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 4px', background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{contact.fullName}</h1>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 16px' }}>{contact.profession}</p>
      <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#64748b' }}>
        <span>{contact.email}</span><span>·</span><span>{contact.phone}</span><span>·</span><span>{contact.location}</span>
      </div>
    </div>
    <div style={{ padding: '32px 40px 48px' }}>
      <p style={{ fontSize: '10px', color: '#475569', fontWeight: 700, marginBottom: '24px' }}>{date}</p>
      <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#cbd5e1', textAlign: 'justify' }}>{text}</div>
      <div style={{ marginTop: '32px', fontWeight: 700, color: '#818cf8' }}>{contact.fullName}</div>
    </div>
  </div>
);

const TemplateBreezeInline = ({ contact, text, date }) => (
  <div style={{ background: '#f0fdf4', fontFamily: 'sans-serif' }}>
    <div style={{ padding: '32px 40px', background: '#16a34a', color: 'white' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 4px' }}>{contact.fullName}</h1>
      <p style={{ fontSize: '11px', fontWeight: 600, opacity: 0.85, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{contact.profession}</p>
      <div style={{ display: 'flex', gap: '16px', fontSize: '10px', opacity: 0.8 }}>
        <span>{contact.email}</span><span>{contact.phone}</span><span>{contact.location}</span>
      </div>
    </div>
    <div style={{ padding: '32px 40px 48px' }}>
      <p style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, marginBottom: '24px' }}>{date}</p>
      <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#166534', textAlign: 'justify' }}>{text}</div>
      <div style={{ marginTop: '32px', fontWeight: 700, color: '#15803d' }}>{contact.fullName}</div>
    </div>
  </div>
);

const TemplateExecutiveInline = ({ contact, text, date }) => (
  <div style={{ background: '#ffffff', fontFamily: 'Georgia, serif' }}>
    <div style={{ padding: '40px 48px 20px', borderBottom: '3px solid #b45309' }}>
      <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#1c1917', margin: '0 0 6px', letterSpacing: '0.05em' }}>{contact.fullName}</h1>
      <p style={{ fontSize: '12px', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 12px' }}>{contact.profession}</p>
      <div style={{ display: 'flex', gap: '20px', fontSize: '10px', color: '#78716c' }}>
        <span>{contact.email}</span><span>{contact.phone}</span><span>{contact.location}</span>
      </div>
    </div>
    <div style={{ padding: '32px 48px 48px' }}>
      <p style={{ fontSize: '11px', color: '#a8a29e', fontWeight: 600, marginBottom: '24px' }}>{date}</p>
      <div style={{ fontSize: '14px', lineHeight: 1.9, whiteSpace: 'pre-wrap', color: '#1c1917', textAlign: 'justify' }}>{text}</div>
      <div style={{ marginTop: '40px', fontWeight: 700, color: '#b45309', fontSize: '15px' }}>{contact.fullName}</div>
    </div>
  </div>
);

const TemplateNordicInline = ({ contact, text, date }) => (
  <div style={{ background: '#f8fafc', fontFamily: 'sans-serif' }}>
    <div style={{ padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #0284c7' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 300, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{contact.fullName}</h1>
        <p style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>{contact.profession}</p>
      </div>
      <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b', lineHeight: 1.8 }}>
        <p style={{ margin: 0 }}>{contact.email}</p><p style={{ margin: 0 }}>{contact.phone}</p><p style={{ margin: 0 }}>{contact.location}</p>
      </div>
    </div>
    <div style={{ padding: '32px 48px 48px' }}>
      <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginBottom: '24px' }}>{date}</p>
      <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#334155', textAlign: 'justify' }}>{text}</div>
      <div style={{ marginTop: '32px', fontWeight: 600, color: '#0284c7' }}>{contact.fullName}</div>
    </div>
  </div>
);

const TemplateBerlinInline = ({ contact, text, date }) => (
  <div style={{ background: '#ffffff', fontFamily: 'sans-serif' }}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '8px', background: '#dc2626', flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '40px 40px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 4px', textTransform: 'uppercase' }}>{contact.fullName}</h1>
        <p style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 16px' }}>{contact.profession}</p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#6b7280' }}>
          <span>{contact.email}</span><span>{contact.phone}</span><span>{contact.location}</span>
        </div>
      </div>
    </div>
    <div style={{ borderTop: '1px solid #f3f4f6', padding: '28px 48px 48px' }}>
      <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, marginBottom: '20px' }}>{date}</p>
      <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#374151', textAlign: 'justify' }}>{text}</div>
      <div style={{ marginTop: '32px', fontWeight: 700, color: '#111827' }}>{contact.fullName}</div>
    </div>
  </div>
);

const TemplateOnyxInline = ({ contact, text, date }) => (
  <div style={{ background: '#111827', fontFamily: 'sans-serif', color: 'white' }}>
    <div style={{ padding: '40px 48px', background: 'linear-gradient(135deg, #1f2937, #111827)', borderBottom: '1px solid #f59e0b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '0 0 4px', color: '#f9fafb', letterSpacing: '-0.02em' }}>{contact.fullName}</h1>
          <p style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>{contact.profession}</p>
        </div>
        <div style={{ width: '48px', height: '48px', background: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', color: '#111827' }}>
          {contact.fullName?.[0] || 'A'}
        </div>
      </div>
    </div>
    <div style={{ padding: '32px 48px 48px' }}>
      <div style={{ display: 'flex', gap: '20px', fontSize: '10px', color: '#6b7280', marginBottom: '24px' }}>
        <span>{contact.email}</span><span>·</span><span>{contact.phone}</span><span>·</span><span>{contact.location}</span>
      </div>
      <p style={{ fontSize: '10px', color: '#4b5563', fontWeight: 700, marginBottom: '20px' }}>{date}</p>
      <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#d1d5db', textAlign: 'justify' }}>{text}</div>
      <div style={{ marginTop: '32px', fontWeight: 700, color: '#f59e0b' }}>{contact.fullName}</div>
    </div>
  </div>
);

// Generic Pro template placeholder for templates not yet fully designed
const TemplateGenericProInline = ({ contact, text, date, accent = '#6366f1', bg = '#ffffff' }) => (
  <div style={{ background: bg, fontFamily: 'sans-serif' }}>
    <div style={{ padding: '36px 44px', borderBottom: `3px solid ${accent}` }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{contact.fullName}</h1>
      <p style={{ fontSize: '11px', color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 12px' }}>{contact.profession}</p>
      <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#6b7280' }}>
        <span>{contact.email}</span><span>{contact.phone}</span><span>{contact.location}</span>
      </div>
    </div>
    <div style={{ padding: '28px 44px 44px' }}>
      <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, marginBottom: '20px' }}>{date}</p>
      <div style={{ fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#374151', textAlign: 'justify' }}>{text}</div>
      <div style={{ marginTop: '32px', fontWeight: 700, color: accent }}>{contact.fullName}</div>
    </div>
  </div>
);


// Named exports
export { TemplateInflux };
export { TemplateIconic };
export { TemplateEnfold };
export { TemplateModern };
export { TemplateMinimal };
export { TemplateInfluxInline };
export { TemplateIconicInline };
export { TemplateEnfoldInline };
export { TemplateModernInline };
export { TemplateMinimalInline };
export { TemplateNovaInline };
export { TemplateBreezeInline };
export { TemplateExecutiveInline };
export { TemplateNordicInline };
export { TemplateBerlinInline };
export { TemplateOnyxInline };
export { TemplateGenericProInline };