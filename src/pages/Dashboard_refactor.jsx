import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateLetter, parseCV } from '../gemini';
import html2pdf from 'html2pdf.js';
import { usePlan } from '../hooks/usePlan';
import { redirectToCheckout } from '../stripe';
import UpgradeModal from '../components/UpgradeModal';

// --- UI ICONS (SVG) ---
const IconDash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconHist = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconMagic = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>;
const IconRefresh = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6m12-4a9 9 0 0 1-15 6.7L3 16"></path></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconCopy = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>;
const IconSave = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconUpload = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const IconDuplicate = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconTemplate = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const IconLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconStar = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const IconAI = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M18 2v4h4"/></svg>;

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

// --- MAIN DASHBOARD ---

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { uiLang, setUiLang } = useLanguage();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [contactInfo, setContactInfo] = useState({ fullName: '', profession: '', email: '', phone: '', location: '', linkedin: '' });
  const [jobDescription, setJobDescription] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [settings, setSettings] = useState({ language: 'Auto', tone: 'Professional', length: 'Standard' });

  const [generatedLetter, setGeneratedLetter] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('influx');
  const [loading, setLoading] = useState(false);
  const { isPro, planLoading } = usePlan(user);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Auto-show upgrade if returned from Stripe with ?success=true
  useEffect(() => {
    if (window.location.search.includes('success=true')) {
      showNotification('🎉 Welcome to Pro!');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (window.location.search.includes('canceled=true')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  const [parsingCV, setParsingCV] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [previewScale, setPreviewScale] = useState(0.65);
  const [history, setHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const documentRef = useRef();

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) setContactInfo(JSON.parse(savedProfile));
    else if (user) setContactInfo(prev => ({ ...prev, fullName: user.displayName || '', email: user.email || '' }));
    const savedHistory = localStorage.getItem('letterHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 1200) setPreviewScale(0.45);
      else if (w < 1500) setPreviewScale(0.55);
      else setPreviewScale(0.65);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const translations = {
    en: {
      logo: 'AIletter', dashboard: 'Dashboard', history: 'History', settings: 'Settings', logout: 'Log out',
      step1: '1. Add CV & Job Vacancy', step1Desc: 'Upload your CV, paste the job description, choose language and template — then hit Generate.',
      cvSection: 'CV', cvUploadBtn: 'Upload PDF', cvOrPaste: 'Or paste CV text here...', cvHelp: "PDF, max 5MB. We'll extract your details automatically.",
      jobSection: 'Job Description', jobPlaceholder: 'Paste the job text or a link to the listing...', jobHelp: 'The more detail, the better the result.',
      configSection: 'Generation Settings', tone: 'Tone', length: 'Length', lang: 'Language',
      generate: 'Generate cover letter', generateHint: 'AI will create a draft you can edit before saving.',
      templatesSection: 'Templates', templatesHint: 'Choose a visual style',
      preview: 'Preview', regenerate: 'Regenerate', copyText: 'Copy text', saveHistory: 'Save to history', download: 'Download PDF',
      autoFill: 'Auto-fill from CV', saved: 'Saved to history', copied: 'Copied!', deleted: 'Deleted',
      historyTitle: 'History', historySearchPlaceholder: 'Search by job title, company or text...',
      filterAll: 'All time', filter7: 'Last 7 days', filter30: 'Last 30 days',
      emptyHistory: 'No letters yet. Generate your first one!',
      colJob: 'Job / Company', colDate: 'Date', colLang: 'Language', colActions: 'Actions',
      loadLetter: 'Load', duplicate: 'Duplicate',
      settingsTitle: 'Settings',
      tabProfile: 'Profile', tabPreferences: 'Preferences', tabPlan: 'Plan & Billing', tabPrivacy: 'Privacy',
      labelName: 'Full Name', labelTitle: 'Job Title', labelEmail: 'Email', labelPhone: 'Phone', labelLocation: 'Location',
      saveChanges: 'Save Changes', reset: 'Reset',
      prefTitle: 'Default Preferences', prefLang: 'Default language', prefTone: 'Default tone', prefTemplate: 'Default template',
      prefRemember: 'Remember last used settings', prefTips: 'Show tips and explanations',
      planTitle: 'Plan & Billing', planCurrent: 'Free Plan', planLimit: '5 generations / month',
      planUpgrade: 'Upgrade to Pro', planProList: 'Unlimited generations, PDF export, 5 templates, priority AI',
      privTitle: 'Privacy & Security', privDesc: 'Your CV and letters are stored only in your browser\'s local storage. We do not send them to third parties.',
      privToggle: 'Allow saving history', deleteHistory: 'Delete all history', deleteAccount: 'Delete account',
    },
    uk: {
      logo: 'AIletter', dashboard: 'Дашборд', history: 'Історія', settings: 'Налаштування', logout: 'Вийти',
      step1: '1. Додай CV та вакансію', step1Desc: 'Завантаж CV, встав текст вакансії, обери мову та шаблон — і натисни Generate.',
      cvSection: 'CV', cvUploadBtn: 'Завантажити PDF', cvOrPaste: 'Або встав текст CV...', cvHelp: 'PDF, до 5МБ. Дані заповняться автоматично.',
      jobSection: 'Опис вакансії', jobPlaceholder: 'Встав текст або посилання на оголошення...', jobHelp: 'Чим більше деталей — тим кращий результат.',
      configSection: 'Налаштування генерації', tone: 'Тон', length: 'Довжина', lang: 'Мова листа',
      generate: 'Згенерувати лист', generateHint: 'AI створить чернетку, яку ти зможеш відредагувати перед збереженням.',
      templatesSection: 'Шаблони', templatesHint: 'Обери стиль оформлення',
      preview: 'Перегляд', regenerate: 'Перегенерувати', copyText: 'Копіювати', saveHistory: 'Зберегти в історію', download: 'Скачати PDF',
      autoFill: 'Заповнити з CV', saved: 'Збережено в історію', copied: 'Скопійовано!', deleted: 'Видалено',
      historyTitle: 'Історія', historySearchPlaceholder: 'Пошук за вакансією, компанією або текстом...',
      filterAll: 'Весь час', filter7: 'Останні 7 днів', filter30: 'Останні 30 днів',
      emptyHistory: 'Листів ще немає. Згенеруй перший!',
      colJob: 'Вакансія / Компанія', colDate: 'Дата', colLang: 'Мова', colActions: 'Дії',
      loadLetter: 'Завантажити', duplicate: 'Дублювати',
      settingsTitle: 'Налаштування',
      tabProfile: 'Профіль', tabPreferences: 'Уподобання', tabPlan: 'Тарифний план', tabPrivacy: 'Приватність',
      labelName: 'Повне ім\'я', labelTitle: 'Посада', labelEmail: 'Email', labelPhone: 'Телефон', labelLocation: 'Місто / Країна',
      saveChanges: 'Зберегти', reset: 'Скинути',
      prefTitle: 'Стандартні налаштування', prefLang: 'Мова листів', prefTone: 'Тон', prefTemplate: 'Шаблон',
      prefRemember: 'Запам\'ятовувати останні налаштування', prefTips: 'Показувати підказки',
      planTitle: 'Тарифний план', planCurrent: 'Free Plan', planLimit: '5 генерацій / місяць',
      planUpgrade: 'Перейти на Pro', planProList: 'Необмежені генерації, PDF, 5 шаблонів, пріоритетний AI',
      privTitle: 'Приватність та безпека', privDesc: 'Твоє CV та листи зберігаються лише в локальному сховищі браузера. Ми не передаємо їх третім особам.',
      privToggle: 'Зберігати історію', deleteHistory: 'Видалити всю історію', deleteAccount: 'Видалити акаунт',
    },
    it: {
      logo: 'AIletter', dashboard: 'Dashboard', history: 'Cronologia', settings: 'Impostazioni', logout: 'Esci',
      step1: '1. Aggiungi CV e Offerta', step1Desc: 'Carica il CV, incolla la descrizione, scegli lingua e template — poi premi Genera.',
      cvSection: 'CV', cvUploadBtn: 'Carica PDF', cvOrPaste: 'O incolla il testo del CV...', cvHelp: 'PDF, max 5MB. I dati verranno estratti automaticamente.',
      jobSection: 'Descrizione del lavoro', jobPlaceholder: 'Incolla il testo o un link all\'annuncio...', jobHelp: 'Più dettagli fornisci, migliore sarà il risultato.',
      configSection: 'Impostazioni', tone: 'Tono', length: 'Lunghezza', lang: 'Lingua',
      generate: 'Genera lettera', generateHint: 'L\'AI creerà una bozza che potrai modificare prima di salvare.',
      templatesSection: 'Template', templatesHint: 'Scegli lo stile',
      preview: 'Anteprima', regenerate: 'Rigenera', copyText: 'Copia', saveHistory: 'Salva nella cronologia', download: 'Scarica PDF',
      autoFill: 'Compila dal CV', saved: 'Salvato nella cronologia', copied: 'Copiato!', deleted: 'Eliminato',
      historyTitle: 'Cronologia', historySearchPlaceholder: 'Cerca per posizione, azienda o testo...',
      filterAll: 'Tutto', filter7: 'Ultimi 7 giorni', filter30: 'Ultimi 30 giorni',
      emptyHistory: 'Nessuna lettera ancora. Generane una!',
      colJob: 'Posizione / Azienda', colDate: 'Data', colLang: 'Lingua', colActions: 'Azioni',
      loadLetter: 'Carica', duplicate: 'Duplica',
      settingsTitle: 'Impostazioni',
      tabProfile: 'Profilo', tabPreferences: 'Preferenze', tabPlan: 'Piano', tabPrivacy: 'Privacy',
      labelName: 'Nome completo', labelTitle: 'Titolo', labelEmail: 'Email', labelPhone: 'Telefono', labelLocation: 'Posizione',
      saveChanges: 'Salva modifiche', reset: 'Ripristina',
      prefTitle: 'Preferenze predefinite', prefLang: 'Lingua predefinita', prefTone: 'Tono', prefTemplate: 'Template',
      prefRemember: 'Ricorda ultime impostazioni', prefTips: 'Mostra suggerimenti',
      planTitle: 'Piano', planCurrent: 'Piano gratuito', planLimit: '5 generazioni / mese',
      planUpgrade: 'Passa a Pro', planProList: 'Generazioni illimitate, PDF, 5 template, AI prioritario',
      privTitle: 'Privacy e sicurezza', privDesc: 'Il tuo CV e le tue lettere sono archiviati solo localmente nel browser.',
      privToggle: 'Salva cronologia', deleteHistory: 'Elimina tutta la cronologia', deleteAccount: 'Elimina account',
    },
    de: {
      logo: 'AIletter', dashboard: 'Dashboard', history: 'Verlauf', settings: 'Einstellungen', logout: 'Abmelden',
      step1: '1. Lebenslauf & Stelle', step1Desc: 'Lebenslauf hochladen, Stellenbeschreibung einfügen, Sprache und Vorlage wählen — dann auf Erstellen klicken.',
      cvSection: 'Lebenslauf', cvUploadBtn: 'PDF hochladen', cvOrPaste: 'Oder Lebenslauf-Text einfügen...', cvHelp: 'PDF, max. 5 MB. Daten werden automatisch extrahiert.',
      jobSection: 'Stellenbeschreibung', jobPlaceholder: 'Text oder Link zur Stellenanzeige einfügen...', jobHelp: 'Je mehr Details, desto besser das Ergebnis.',
      configSection: 'Einstellungen', tone: 'Tonfall', length: 'Länge', lang: 'Sprache',
      generate: 'Anschreiben erstellen', generateHint: 'Die KI erstellt einen Entwurf, den Sie vor dem Speichern bearbeiten können.',
      templatesSection: 'Vorlagen', templatesHint: 'Stil auswählen',
      preview: 'Vorschau', regenerate: 'Neu generieren', copyText: 'Kopieren', saveHistory: 'Im Verlauf speichern', download: 'PDF herunterladen',
      autoFill: 'Aus Lebenslauf ausfüllen', saved: 'Im Verlauf gespeichert', copied: 'Kopiert!', deleted: 'Gelöscht',
      historyTitle: 'Verlauf', historySearchPlaceholder: 'Suche nach Stelle, Firma oder Text...',
      filterAll: 'Alle', filter7: 'Letzte 7 Tage', filter30: 'Letzte 30 Tage',
      emptyHistory: 'Noch keine Briefe. Erstellen Sie Ihren ersten!',
      colJob: 'Stelle / Firma', colDate: 'Datum', colLang: 'Sprache', colActions: 'Aktionen',
      loadLetter: 'Laden', duplicate: 'Duplizieren',
      settingsTitle: 'Einstellungen',
      tabProfile: 'Profil', tabPreferences: 'Präferenzen', tabPlan: 'Tarif', tabPrivacy: 'Datenschutz',
      labelName: 'Vollständiger Name', labelTitle: 'Berufsbezeichnung', labelEmail: 'E-Mail', labelPhone: 'Telefon', labelLocation: 'Standort',
      saveChanges: 'Speichern', reset: 'Zurücksetzen',
      prefTitle: 'Standardeinstellungen', prefLang: 'Standardsprache', prefTone: 'Tonfall', prefTemplate: 'Vorlage',
      prefRemember: 'Letzte Einstellungen merken', prefTips: 'Tipps anzeigen',
      planTitle: 'Tarif', planCurrent: 'Kostenloser Plan', planLimit: '5 Generierungen / Monat',
      planUpgrade: 'Auf Pro upgraden', planProList: 'Unbegrenzte Generierungen, PDF, 5 Vorlagen, Prioritäts-KI',
      privTitle: 'Datenschutz & Sicherheit', privDesc: 'Ihr Lebenslauf und Ihre Briefe werden nur lokal im Browser gespeichert.',
      privToggle: 'Verlauf speichern', deleteHistory: 'Gesamten Verlauf löschen', deleteAccount: 'Konto löschen',
    },
  };

  const dict = translations[uiLang] || translations.en;

  const showNotification = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setCvFile({ inlineData: { data: reader.result.split(',')[1], mimeType: file.type } });
    reader.readAsDataURL(file);
    showNotification('CV Uploaded');
  };

  const handleAutoFill = async () => {
    if (!cvFile) return alert('Upload PDF first');
    setParsingCV(true);
    try {
      const data = await parseCV(cvFile);
      const updated = { ...contactInfo, ...data };
      setContactInfo(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
      showNotification(dict.autoFill + ' ✓');
    } catch (e) { alert('AI error.'); }
    finally { setParsingCV(false); }
  };

  const handleGenerate = async () => {
    if (!jobDescription) return alert('Paste job text');

    // Free plan limit — verified server-side via Firestore counter
    if (!isPro) {
      const key = 'genCount_' + new Date().toISOString().slice(0, 7);
      const count = parseInt(localStorage.getItem(key) || '0');
      if (count >= 5) {
        setShowUpgrade(true);
        return showNotification('Free limit reached — upgrade to Pro for unlimited generations');
      }
      // Note: real enforcement happens server-side — this is just UX hint
      // The actual Pro check is from Firestore via usePlan (not localStorage)
    }

    // Block Pro templates for free users
    const selectedTpl = TEMPLATES.find(t => t.id === selectedTemplate);
    if (selectedTpl?.pro && !isPro) {
      setShowUpgrade(true);
      return showNotification('This template is Pro only — upgrade to unlock');
    }

    setLoading(true);
    setGeneratedLetter('');
    try {
      const text = await generateLetter(contactInfo, jobDescription, cvFile, settings);
      setGeneratedLetter(text);
    } catch (e) { alert('AI error. Try in 10s.'); }
    finally { setLoading(false); }
  };

  const handleSaveToHistory = () => {
    if (!generatedLetter) return;
    const newEntry = { id: Date.now(), date: new Date().toLocaleDateString(), job: jobDescription.substring(0, 50) + '...', text: generatedLetter, lang: settings.language };
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('letterHistory', JSON.stringify(updatedHistory));
    showNotification(dict.saved);
  };

  const deleteHistoryItem = (id) => {
    if (!window.confirm('Delete this letter?')) return;
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('letterHistory', JSON.stringify(updated));
    showNotification(dict.deleted);
  };

  const duplicateHistoryItem = (item) => {
    const copy = { ...item, id: Date.now(), date: new Date().toLocaleDateString(), job: '[Copy] ' + item.job };
    const updated = [copy, ...history];
    setHistory(updated);
    localStorage.setItem('letterHistory', JSON.stringify(updated));
    showNotification('Duplicated');
  };

  const downloadPDF = () => {
    const opt = { margin: 0, filename: `Cover_Letter.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    html2pdf().set(opt).from(documentRef.current).save();
  };

  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(contactInfo));
    showNotification(dict.saved);
  };

  const getFilteredHistory = () => {
    let filtered = history;
    if (historySearch) filtered = filtered.filter(h => h.job.toLowerCase().includes(historySearch.toLowerCase()) || h.text?.toLowerCase().includes(historySearch.toLowerCase()));
    if (historyFilter === '7') { const ago = Date.now() - 7 * 86400000; filtered = filtered.filter(h => h.id > ago); }
    if (historyFilter === '30') { const ago = Date.now() - 30 * 86400000; filtered = filtered.filter(h => h.id > ago); }
    return filtered;
  };

  const todayStr = new Date().toLocaleDateString(uiLang === 'uk' ? 'uk-UA' : uiLang === 'de' ? 'de-DE' : uiLang === 'it' ? 'it-IT' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const placeholderText = 'Dear Hiring Manager,\n\nI am writing to express my interest in the position... (Preview Draft Mode)';
  const TEMPLATES = [
    // FREE (5)
    { id: 'influx',     name: 'Influx',     pro: false, color: '#1e293b', accent: '#60a5fa', desc: 'Bold dark header, modern corporate' },
    { id: 'iconic',     name: 'Iconic',     pro: false, color: '#ffffff', accent: '#111827', desc: 'Minimal centered, ultra-clean' },
    { id: 'minimal',    name: 'Minimal',    pro: false, color: '#ffffff', accent: '#4f46e5', desc: 'Left accent bar, simple & sharp' },
    { id: 'nova',       name: 'Nova',       pro: false, color: '#0f172a', accent: '#818cf8', desc: 'Dark elegant, night mode feel' },
    { id: 'breeze',     name: 'Breeze',     pro: false, color: '#f0fdf4', accent: '#16a34a', desc: 'Fresh green, creative industries' },
    // PRO (10)
    { id: 'enfold',     name: 'Enfold',     pro: true,  color: '#f1f5f9', accent: '#334155', desc: 'Two-column sidebar with photo' },
    { id: 'modern',     name: 'Modern',     pro: true,  color: '#1e293b', accent: '#818cf8', desc: 'Dark sidebar, bold identity' },
    { id: 'executive',  name: 'Executive',  pro: true,  color: '#ffffff', accent: '#b45309', desc: 'Gold accents, senior positions' },
    { id: 'nordic',     name: 'Nordic',     pro: true,  color: '#f8fafc', accent: '#0284c7', desc: 'Scandinavian minimal, cool blue' },
    { id: 'berlin',     name: 'Berlin',     pro: true,  color: '#ffffff', accent: '#dc2626', desc: 'European style, red accents' },
    { id: 'tokyo',      name: 'Tokyo',      pro: true,  color: '#fafafa', accent: '#7c3aed', desc: 'Asian-inspired, purple geometric' },
    { id: 'milano',     name: 'Milano',     pro: true,  color: '#fffbf0', accent: '#d97706', desc: 'Italian elegance, warm tones' },
    { id: 'sydney',     name: 'Sydney',     pro: true,  color: '#f0f9ff', accent: '#0369a1', desc: 'Coastal clean, ocean blue' },
    { id: 'atlas',      name: 'Atlas',      pro: true,  color: '#fdf4ff', accent: '#9333ea', desc: 'Bold purple, creative & bold' },
    { id: 'onyx',       name: 'Onyx',       pro: true,  color: '#111827', accent: '#f59e0b', desc: 'Luxury black & gold, premium' },
    { id: 'pearl',      name: 'Pearl',      pro: true,  color: '#ffffff', accent: '#e11d48', desc: 'Classic rose, feminine & elegant' },
  ];
  const templateList = TEMPLATES.map(t => t.name);

  const inputClass = 'w-full bg-[#0f172a]/60 border border-[#334155] p-4 rounded-2xl text-[#f8fafc] text-sm outline-none focus:border-[#6366f1] transition-all placeholder-[#475569]';
  const labelClass = 'block text-[10px] font-black uppercase text-[#64748b] tracking-widest mb-2';

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden font-sans">
      <Toast show={toast.show} message={toast.msg} />

      {/* ─── SIDEBAR ─── */}
      <aside className="w-60 bg-[#1e293b] border-r border-[#1e293b] flex flex-col shrink-0 z-30">
        {/* Logo + Profile */}
        <div className="p-6 border-b border-[#334155] space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#6366f1] w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-[#6366f1]/30">AI</span>
            <span className="text-lg font-black tracking-tight text-white">{dict.logo}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#0f172a]/60 rounded-xl border border-[#334155]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center font-bold text-sm shrink-0">
              {user?.displayName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-bold truncate text-[#f8fafc]">{user?.displayName || 'Guest'}</p>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{color: isPro ? '#34d399' : '#6366f1'}}>{isPro ? '✦ Pro' : 'Free Plan'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', icon: <IconDash />, label: dict.dashboard },
            { id: 'templates', icon: <IconTemplate />, label: 'Templates' },
            { id: 'history', icon: <IconHist />, label: dict.history },
            { id: 'settings', icon: <IconSettings />, label: dict.settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all relative ${activeTab === item.id ? 'bg-[#0f172a] text-white' : 'text-[#64748b] hover:text-white hover:bg-[#334155]/50'}`}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#6366f1] rounded-r-full shadow-[0_0_10px_#6366f1]" />
              )}
              <span className={activeTab === item.id ? 'text-[#6366f1]' : ''}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Upgrade + Logout */}
        <div className="p-4 border-t border-[#334155] space-y-2">
          {!planLoading && !isPro && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full py-2.5 px-4 text-xs font-black text-white bg-[#6366f1] hover:bg-[#4f46e5] rounded-xl transition-all shadow-lg shadow-[#6366f1]/20"
            >
              ✦ Upgrade to Pro
            </button>
          )}
          {planLoading && (
            <div className="w-full py-2.5 px-4 text-xs font-black text-[#475569] bg-[#1e293b] rounded-xl text-center animate-pulse">
              Loading...
            </div>
          )}
          {isPro && (
            <div className="w-full py-2 px-4 text-xs font-black text-emerald-400 bg-emerald-500/10 rounded-xl text-center border border-emerald-500/20">
              ✅ Pro Active
            </div>
          )}
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 text-xs font-semibold text-[#64748b] hover:text-[#94a3b8] border border-[#334155] rounded-xl hover:border-[#475569] transition-all"
          >
            {dict.logout}
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 border-b border-[#334155] flex items-center justify-between px-6 bg-[#0f172a] shrink-0 z-20">
          <h2 className="text-xs font-black text-[#64748b] uppercase tracking-[0.2em]">
            {activeTab === 'dashboard' ? dict.dashboard : activeTab === 'history' ? dict.history : dict.settings}
          </h2>
          <div className="flex bg-[#1e293b] rounded-lg p-0.5 border border-[#334155]">
            {['en', 'uk', 'it', 'de'].map(l => (
              <button key={l} onClick={() => setUiLang(l)} className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all uppercase ${uiLang === l ? 'bg-[#6366f1] text-white shadow-md' : 'text-[#64748b] hover:text-white'}`}>{l}</button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-hidden">

          {/* ══════════════════ DASHBOARD ══════════════════ */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

              {/* ── LEFT: Inputs (fixed width, flex column) ── */}
              <div style={{ width: '420px', minWidth: '420px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155', background: '#0f172a' }}>

                {/* Scrollable inputs area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginBottom: '4px' }}>{dict.step1}</h1>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>{dict.step1Desc}</p>

                  {/* CV block */}
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dict.cvSection}</span>
                      <button onClick={handleAutoFill} disabled={parsingCV || !cvFile}
                        style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: (!cvFile || parsingCV) ? 0.4 : 1 }}>
                        <IconMagic /> {parsingCV ? '...' : dict.autoFill}
                      </button>
                    </div>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '90px', background: 'rgba(15,23,42,0.6)', border: '2px dashed #334155', borderRadius: '12px', cursor: 'pointer' }}
                      onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'}
                      onMouseOut={e => e.currentTarget.style.borderColor = '#334155'}>
                      <IconUpload />
                      <span style={{ marginTop: '8px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{fileName || dict.cvUploadBtn}</span>
                      <input type="file" style={{ display: 'none' }} accept=".pdf" onChange={handleFileChange} />
                    </label>
                    <p style={{ fontSize: '10px', color: '#475569', marginTop: '8px' }}>{dict.cvHelp}</p>
                  </div>

                  {/* Job description block */}
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>{dict.jobSection}</span>
                    <textarea
                      style={{ width: '100%', height: '160px', background: 'rgba(15,23,42,0.6)', border: '1px solid #334155', borderRadius: '10px', padding: '14px', fontSize: '13px', color: 'white', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      placeholder={dict.jobPlaceholder}
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#334155'}
                    />
                    <p style={{ fontSize: '10px', color: '#475569', marginTop: '8px' }}>{dict.jobHelp}</p>
                  </div>
                </div>

                {/* Generate button — always visible at bottom */}
                <div style={{ padding: '20px 32px', borderTop: '1px solid #334155', background: '#0f172a', flexShrink: 0 }}>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    style={{ width: '100%', padding: '16px', background: loading ? '#4338ca' : '#6366f1', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
                    onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#4f46e5'; }}
                    onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#6366f1'; }}
                  >
                    {loading ? <><span>⟳</span> Generating…</> : <><IconMagic /> {dict.generate}</>}
                  </button>
                  <p style={{ fontSize: '10px', color: '#475569', textAlign: 'center', marginTop: '8px' }}>{dict.generateHint}</p>
                </div>
              </div>

              {/* ── RIGHT: Preview (flex column, fills remaining space) ── */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#1e293b' }}>

                {/* Preview toolbar row 1 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #334155', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconAI /> {dict.preview}
                    <span style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button onClick={handleGenerate} title={dict.regenerate}
                      style={{ padding: '7px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', display: 'flex' }}
                      onMouseOver={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}>
                      <IconRefresh />
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(generatedLetter); showNotification(dict.copied); }} title={dict.copyText}
                      style={{ padding: '7px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', display: 'flex' }}
                      onMouseOver={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}>
                      <IconCopy />
                    </button>
                    <button onClick={handleSaveToHistory} title={dict.saveHistory} disabled={!generatedLetter}
                      style={{ padding: '7px 12px', color: generatedLetter ? '#6366f1' : '#475569', background: generatedLetter ? 'rgba(99,102,241,0.1)' : 'none', border: generatedLetter ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent', cursor: generatedLetter ? 'pointer' : 'not-allowed', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700 }}
                      onMouseOver={e => { if (generatedLetter) { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = 'white'; }}}
                      onMouseOut={e => { if (generatedLetter) { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#6366f1'; }}}>
                      <IconSave /> {dict.saveHistory}
                    </button>
                    <div style={{ width: '1px', height: '20px', background: '#334155', margin: '0 4px' }} />
                    <button onClick={downloadPDF} disabled={!generatedLetter}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#0f172a', border: 'none', borderRadius: '10px', padding: '7px 14px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', cursor: generatedLetter ? 'pointer' : 'not-allowed', opacity: generatedLetter ? 1 : 0.4 }}>
                      <IconDownload /> {dict.download}
                    </button>
                  </div>
                </div>

                {/* Quick settings bar row 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '8px 20px', borderBottom: '1px solid #334155', background: 'rgba(15,23,42,0.5)', flexShrink: 0, flexWrap: 'wrap' }}>
                  {/* Tone */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dict.tone}</span>
                    {['Professional', 'Friendly', 'Formal'].map(t => (
                      <button key={t} onClick={() => setSettings(s => ({ ...s, tone: t }))}
                        style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                          background: settings.tone === t ? '#6366f1' : '#1e293b',
                          color: settings.tone === t ? 'white' : '#64748b',
                          borderColor: settings.tone === t ? '#6366f1' : '#334155' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div style={{ width: '1px', height: '18px', background: '#334155' }} />
                  {/* Language */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dict.lang}</span>
                    <select value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}
                      style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', fontSize: '10px', fontWeight: 700, padding: '5px 8px', borderRadius: '7px', outline: 'none', cursor: 'pointer' }}>
                      <option value="Auto">Auto</option>
                      <option>English</option><option>Ukrainian</option><option>Italiano</option><option>Deutsch</option>
                    </select>
                  </div>
                  <div style={{ width: '1px', height: '18px', background: '#334155' }} />
                  {/* Template */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dict.templatesSection}</span>
                    {templateList.map(t => (
                      <button key={t} onClick={() => setSelectedTemplate(t.toLowerCase())}
                        style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                          background: selectedTemplate === t.toLowerCase() ? 'white' : '#1e293b',
                          color: selectedTemplate === t.toLowerCase() ? '#0f172a' : '#64748b',
                          borderColor: selectedTemplate === t.toLowerCase() ? 'white' : '#334155' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── PREVIEW DOCUMENT — scrollable ── */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#111827', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                  <div style={{ padding: '40px 30px 80px', display: 'flex', justifyContent: 'center' }}>
                    {loading ? (
                      <div style={{ width: '100%', maxWidth: '680px', background: 'white', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
                        <Skeleton />
                      </div>
                    ) : generatedLetter ? (
                      /* ── EDIT MODE: two-panel — styled preview left, editable textarea right ── */
                      <div style={{ width: '100%', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        {/* Styled preview */}
                        <div ref={documentRef} style={{ flex: 1, background: 'white', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)', minWidth: 0 }}>
                          {(() => {
                            const props = { contact: contactInfo, text: generatedLetter, date: todayStr, userPhoto: user?.photoURL };
                            if (selectedTemplate === 'influx')    return <TemplateInfluxInline    {...props} />;
                            if (selectedTemplate === 'iconic')    return <TemplateIconicInline    {...props} />;
                            if (selectedTemplate === 'enfold')    return <TemplateEnfoldInline    {...props} />;
                            if (selectedTemplate === 'modern')    return <TemplateModernInline    {...props} />;
                            if (selectedTemplate === 'minimal')   return <TemplateMinimalInline   {...props} />;
                            if (selectedTemplate === 'nova')      return <TemplateNovaInline      {...props} />;
                            if (selectedTemplate === 'breeze')    return <TemplateBreezeInline    {...props} />;
                            if (selectedTemplate === 'executive') return <TemplateExecutiveInline {...props} />;
                            if (selectedTemplate === 'nordic')    return <TemplateNordicInline    {...props} />;
                            if (selectedTemplate === 'berlin')    return <TemplateBerlinInline    {...props} />;
                            if (selectedTemplate === 'onyx')      return <TemplateOnyxInline      {...props} />;
                            if (selectedTemplate === 'tokyo')     return <TemplateGenericProInline {...props} accent="#7c3aed" bg="#fafafa" />;
                            if (selectedTemplate === 'milano')    return <TemplateGenericProInline {...props} accent="#d97706" bg="#fffbf0" />;
                            if (selectedTemplate === 'sydney')    return <TemplateGenericProInline {...props} accent="#0369a1" bg="#f0f9ff" />;
                            if (selectedTemplate === 'atlas')     return <TemplateGenericProInline {...props} accent="#9333ea" bg="#fdf4ff" />;
                            if (selectedTemplate === 'pearl')     return <TemplateGenericProInline {...props} accent="#e11d48" bg="#fff1f2" />;
                          })()}
                        </div>
                        {/* Editable panel */}
                        <div style={{ width: '260px', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>✏ Edit text</span>
                          </div>
                          <textarea
                            value={generatedLetter}
                            onChange={e => setGeneratedLetter(e.target.value)}
                            style={{ width: '100%', minHeight: '500px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px', fontSize: '12px', lineHeight: 1.7, color: '#e2e8f0', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
                            onFocus={e => e.target.style.borderColor = '#6366f1'}
                            onBlur={e => e.target.style.borderColor = '#334155'}
                          />
                          <p style={{ fontSize: '10px', color: '#475569', lineHeight: 1.5 }}>Редагуй текст — прев'ю оновлюється в реальному часі</p>
                        </div>
                      </div>
                    ) : (
                      /* ── EMPTY STATE ── */
                      <div style={{ width: '100%', maxWidth: '680px', background: 'white', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)' }}>
                        {(() => {
                          const props = { contact: contactInfo, text: placeholderText, date: todayStr, userPhoto: user?.photoURL };
                            if (selectedTemplate === 'influx')    return <TemplateInfluxInline    {...props} />;
                            if (selectedTemplate === 'iconic')    return <TemplateIconicInline    {...props} />;
                            if (selectedTemplate === 'enfold')    return <TemplateEnfoldInline    {...props} />;
                            if (selectedTemplate === 'modern')    return <TemplateModernInline    {...props} />;
                            if (selectedTemplate === 'minimal')   return <TemplateMinimalInline   {...props} />;
                            if (selectedTemplate === 'nova')      return <TemplateNovaInline      {...props} />;
                            if (selectedTemplate === 'breeze')    return <TemplateBreezeInline    {...props} />;
                            if (selectedTemplate === 'executive') return <TemplateExecutiveInline {...props} />;
                            if (selectedTemplate === 'nordic')    return <TemplateNordicInline    {...props} />;
                            if (selectedTemplate === 'berlin')    return <TemplateBerlinInline    {...props} />;
                            if (selectedTemplate === 'onyx')      return <TemplateOnyxInline      {...props} />;
                            if (selectedTemplate === 'tokyo')     return <TemplateGenericProInline {...props} accent="#7c3aed" bg="#fafafa" />;
                            if (selectedTemplate === 'milano')    return <TemplateGenericProInline {...props} accent="#d97706" bg="#fffbf0" />;
                            if (selectedTemplate === 'sydney')    return <TemplateGenericProInline {...props} accent="#0369a1" bg="#f0f9ff" />;
                            if (selectedTemplate === 'atlas')     return <TemplateGenericProInline {...props} accent="#9333ea" bg="#fdf4ff" />;
                            if (selectedTemplate === 'pearl')     return <TemplateGenericProInline {...props} accent="#e11d48" bg="#fff1f2" />;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════ TEMPLATES ══════════════════ */}
          {activeTab === 'templates' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent', background: '#0f172a' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: '36px' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', margin: '0 0 8px' }}>Templates</h2>
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
                      const previewProps = { contact: { fullName: 'Alex Morgan', profession: 'Product Manager', email: 'alex@email.com', phone: '+1 234 567', location: 'New York' }, text: 'Dear Hiring Manager,\n\nI am excited to apply for this position. With 5+ years of experience in product management and a proven track record of delivering results, I am confident I would be a strong addition to your team.\n\nI look forward to discussing how I can contribute.\n\nSincerely,', date: 'February 22, 2026', userPhoto: null };
                      const isSelected = selectedTemplate === tpl.id;
                      return (
                        <div key={tpl.id}
                          onClick={() => { setSelectedTemplate(tpl.id); setActiveTab('dashboard'); showNotification(`Template: ${tpl.name}`); }}
                          style={{ cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', border: isSelected ? '2px solid #6366f1' : '2px solid #1e293b', transition: 'all 0.2s', background: '#1e293b', boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.3)' : 'none' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = isSelected ? '#6366f1' : '#1e293b'; e.currentTarget.style.transform = 'none'; }}
                        >
                          {/* Document preview — scaled down */}
                          <div style={{ height: '220px', overflow: 'hidden', position: 'relative', background: '#111827' }}>
                            <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', pointerEvents: 'none' }}>
                              {tpl.id === 'influx'  && <TemplateInfluxInline  {...previewProps} />}
                              {tpl.id === 'iconic'  && <TemplateIconicInline  {...previewProps} />}
                              {tpl.id === 'minimal' && <TemplateMinimalInline {...previewProps} />}
                              {tpl.id === 'nova'    && <TemplateNovaInline    {...previewProps} />}
                              {tpl.id === 'breeze'  && <TemplateBreezeInline  {...previewProps} />}
                            </div>
                            {isSelected && (
                              <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#6366f1', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: 900 }}>✓</div>
                            )}
                          </div>
                          {/* Label */}
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
                      const previewProps = { contact: { fullName: 'Alex Morgan', profession: 'Product Manager', email: 'alex@email.com', phone: '+1 234 567', location: 'New York' }, text: 'Dear Hiring Manager,\n\nI am excited to apply for this position. With 5+ years of experience in product management and a proven track record of delivering results, I am confident I would be a strong addition to your team.\n\nI look forward to discussing how I can contribute.\n\nSincerely,', date: 'February 22, 2026', userPhoto: null };
                      const isSelected = selectedTemplate === tpl.id;
                      const accentMap = { executive: '#b45309', nordic: '#0284c7', berlin: '#dc2626', tokyo: '#7c3aed', milano: '#d97706', sydney: '#0369a1', atlas: '#9333ea', onyx: '#f59e0b', pearl: '#e11d48' };
                      const bgMap = { executive: '#ffffff', nordic: '#f8fafc', berlin: '#ffffff', tokyo: '#fafafa', milano: '#fffbf0', sydney: '#f0f9ff', atlas: '#fdf4ff', onyx: '#111827', pearl: '#fff1f2' };
                      return (
                        <div key={tpl.id}
                          onClick={() => { if (!isPro) { setShowUpgrade(true); return; } setSelectedTemplate(tpl.id); setActiveTab('dashboard'); showNotification(`Template: ${tpl.name}`); }}
                          style={{ cursor: isPro ? 'pointer' : 'default', borderRadius: '16px', overflow: 'hidden', border: isSelected ? '2px solid #6366f1' : '2px solid #1e293b', transition: 'all 0.2s', background: '#1e293b' }}
                          onMouseOver={e => { if (isPro) { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = isSelected ? '#6366f1' : '#1e293b'; e.currentTarget.style.transform = 'none'; }}
                        >
                          {/* Document preview */}
                          <div style={{ height: '220px', overflow: 'hidden', position: 'relative', background: '#111827' }}>
                            <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', pointerEvents: 'none' }}>
                              {tpl.id === 'enfold'    && <TemplateEnfoldInline    {...previewProps} />}
                              {tpl.id === 'modern'    && <TemplateModernInline    {...previewProps} />}
                              {tpl.id === 'executive' && <TemplateExecutiveInline {...previewProps} />}
                              {tpl.id === 'nordic'    && <TemplateNordicInline    {...previewProps} />}
                              {tpl.id === 'berlin'    && <TemplateBerlinInline    {...previewProps} />}
                              {tpl.id === 'onyx'      && <TemplateOnyxInline      {...previewProps} />}
                              {['tokyo','milano','sydney','atlas','pearl'].includes(tpl.id) && <TemplateGenericProInline {...previewProps} accent={accentMap[tpl.id]} bg={bgMap[tpl.id]} />}
                            </div>
                            {/* Lock overlay */}
                            {!isPro && (
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div style={{ background: 'rgba(99,102,241,0.9)', borderRadius: '24px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'white' }}>
                                  <IconLock /> Pro only
                                </div>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Click to upgrade</p>
                              </div>
                            )}
                          </div>
                          {/* Label */}
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

                  {!isPro && (
                    <div style={{ marginTop: '32px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(124,58,237,0.08))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '16px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                      <div>
                        <p style={{ fontWeight: 800, color: 'white', fontSize: '15px', margin: '0 0 4px' }}>Unlock all 11 Pro templates</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Plus unlimited generations, DOCX export, full history, and priority AI</p>
                      </div>
                      <button onClick={() => setShowUpgrade(true)}
                        style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 900, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                        ✦ Upgrade to Pro
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ══════════════════ HISTORY ══════════════════ */}
          {activeTab === 'history' && (
            <div className="h-full overflow-y-auto p-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
              <div className="max-w-5xl mx-auto space-y-6">

                {/* Header + filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <h2 className="text-3xl font-black text-white">{dict.historyTitle}</h2>
                  <div className="flex-1" />
                  {/* Date filter pills */}
                  <div className="flex gap-1.5 bg-[#1e293b] rounded-xl p-1 border border-[#334155]">
                    {[
                      { key: 'all', label: dict.filterAll },
                      { key: '30', label: dict.filter30 },
                      { key: '7', label: dict.filter7 },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setHistoryFilter(f.key)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${historyFilter === f.key ? 'bg-[#6366f1] text-white' : 'text-[#64748b] hover:text-white'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]"><IconSearch /></span>
                  <input
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    placeholder={dict.historySearchPlaceholder}
                    className="w-full bg-[#1e293b] border border-[#334155] pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-[#475569] outline-none focus:border-[#6366f1] transition-all"
                  />
                </div>

                {/* Table */}
                {getFilteredHistory().length === 0 ? (
                  <div className="text-center py-20 bg-[#1e293b] rounded-2xl border border-[#334155]">
                    <p className="text-[#475569] text-sm">{dict.emptyHistory}</p>
                  </div>
                ) : (
                  <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-12 px-6 py-3 border-b border-[#334155] bg-[#0f172a]/40">
                      <span className="col-span-5 text-[10px] font-black text-[#475569] uppercase tracking-widest">{dict.colJob}</span>
                      <span className="col-span-2 text-[10px] font-black text-[#475569] uppercase tracking-widest">{dict.colDate}</span>
                      <span className="col-span-2 text-[10px] font-black text-[#475569] uppercase tracking-widest">{dict.colLang}</span>
                      <span className="col-span-3 text-[10px] font-black text-[#475569] uppercase tracking-widest text-right">{dict.colActions}</span>
                    </div>

                    {/* Rows */}
                    {getFilteredHistory().map((item, idx) => (
                      <div
                        key={item.id}
                        className={`grid grid-cols-12 px-6 py-4 items-center hover:bg-[#334155]/30 transition-all border-b border-[#334155]/50 last:border-0 ${idx % 2 === 0 ? '' : 'bg-[#0f172a]/20'}`}
                      >
                        <div className="col-span-5">
                          <p className="text-sm font-semibold text-[#f1f5f9] truncate pr-4">{item.job}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs text-[#64748b] font-medium">{item.date}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] font-bold bg-[#6366f1]/10 text-[#818cf8] px-2.5 py-1 rounded-full border border-[#6366f1]/20">{item.lang || 'Auto'}</span>
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setGeneratedLetter(item.text); setActiveTab('dashboard'); }}
                            className="px-3 py-1.5 text-[10px] font-bold text-[#6366f1] hover:text-white bg-[#6366f1]/10 hover:bg-[#6366f1] rounded-lg border border-[#6366f1]/30 hover:border-[#6366f1] transition-all"
                          >
                            {dict.loadLetter}
                          </button>
                          <button
                            onClick={() => duplicateHistoryItem(item)}
                            className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#334155] rounded-lg transition-all"
                            title={dict.duplicate}
                          >
                            <IconDuplicate />
                          </button>
                          <button
                            onClick={() => { const el = document.createElement('a'); const blob = new Blob([item.text], { type: 'text/plain' }); el.href = URL.createObjectURL(blob); el.download = 'cover_letter.txt'; el.click(); }}
                            className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#334155] rounded-lg transition-all"
                            title={dict.download}
                          >
                            <IconDownload />
                          </button>
                          <button
                            onClick={() => deleteHistoryItem(item.id)}
                            className="p-1.5 text-[#64748b] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════ SETTINGS ══════════════════ */}
          {activeTab === 'settings' && (
            <div className="h-full flex overflow-hidden">
              {/* Vertical tabs */}
              <div className="w-48 shrink-0 bg-[#1e293b] border-r border-[#334155] p-4 space-y-1">
                {[
                  { key: 'profile', label: dict.tabProfile },
                  { key: 'preferences', label: dict.tabPreferences },
                  { key: 'plan', label: dict.tabPlan },
                  { key: 'privacy', label: dict.tabPrivacy },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setSettingsTab(t.key)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${settingsTab === t.key ? 'bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/20' : 'text-[#64748b] hover:text-white hover:bg-[#334155]/50'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                <div className="max-w-2xl space-y-8">

                  {/* ── Profile ── */}
                  {settingsTab === 'profile' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-black text-white">{dict.tabProfile}</h3>
                        <p className="text-xs text-[#64748b] mt-1">Manage your personal information</p>
                      </div>

                      {/* Avatar row */}
                      <div className="flex items-center gap-5 p-5 bg-[#1e293b] rounded-2xl border border-[#334155]">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center font-black text-2xl shrink-0">
                          {contactInfo.fullName?.[0] || user?.displayName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{contactInfo.fullName || user?.displayName}</p>
                          <p className="text-xs text-[#6366f1] font-black uppercase tracking-widest mt-0.5">Free Plan</p>
                        </div>
                      </div>

                      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className={labelClass}>{dict.labelName}</label><input value={contactInfo.fullName} onChange={e => setContactInfo({ ...contactInfo, fullName: e.target.value })} className={inputClass} /></div>
                          <div><label className={labelClass}>{dict.labelTitle}</label><input value={contactInfo.profession} onChange={e => setContactInfo({ ...contactInfo, profession: e.target.value })} className={inputClass} /></div>
                          <div><label className={labelClass}>{dict.labelEmail}</label><input value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} className={inputClass} /></div>
                          <div><label className={labelClass}>{dict.labelPhone}</label><input value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} className={inputClass} /></div>
                        </div>
                        <div><label className={labelClass}>{dict.labelLocation}</label><input value={contactInfo.location} onChange={e => setContactInfo({ ...contactInfo, location: e.target.value })} className={inputClass} /></div>
                      </div>

                      <div className="flex gap-3">
                        <button onClick={saveProfile} className="flex-1 py-3.5 bg-[#6366f1] hover:bg-[#4f46e5] rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-[#6366f1]/20 active:scale-95">
                          {dict.saveChanges}
                        </button>
                        <button
                          onClick={() => setContactInfo({ fullName: user?.displayName || '', email: user?.email || '', profession: '', phone: '', location: '', linkedin: '' })}
                          className="px-6 py-3.5 bg-[#1e293b] text-[#64748b] hover:text-white border border-[#334155] rounded-2xl font-semibold text-sm transition-all"
                        >
                          {dict.reset}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Preferences ── */}
                  {settingsTab === 'preferences' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-black text-white">{dict.prefTitle}</h3>
                        <p className="text-xs text-[#64748b] mt-1">Set your defaults for every new letter</p>
                      </div>
                      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>{dict.prefLang}</label>
                            <select value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })} className={inputClass}>
                              <option value="Auto">Auto Match</option>
                              <option>English</option><option>Ukrainian</option><option>Italiano</option><option>Deutsch</option>
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>{dict.prefTone}</label>
                            <select value={settings.tone} onChange={e => setSettings({ ...settings, tone: e.target.value })} className={inputClass}>
                              <option>Professional</option><option>Friendly</option><option>Formal</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>{dict.prefTemplate}</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {templateList.map(t => (
                              <button
                                key={t}
                                onClick={() => setSelectedTemplate(t.toLowerCase())}
                                className={`px-4 py-2 rounded-full text-[11px] font-bold border transition-all ${selectedTemplate === t.toLowerCase() ? 'bg-white text-[#0f172a] border-white' : 'border-[#334155] text-[#64748b] hover:text-white'}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-3">
                        {[
                          { label: dict.prefRemember, key: 'remember' },
                          { label: dict.prefTips, key: 'tips' },
                        ].map(toggle => (
                          <label key={toggle.key} className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm text-[#94a3b8] font-medium">{toggle.label}</span>
                            <div className="relative">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-10 h-5 bg-[#334155] rounded-full peer peer-checked:bg-[#6366f1] transition-colors" />
                              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Plan ── */}
                  {settingsTab === 'plan' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-black text-white">{dict.planTitle}</h3>
                        <p className="text-xs text-[#64748b] mt-1">Manage your subscription</p>
                      </div>
                      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 flex items-center justify-between">
                        <div>
                          <p className="font-black text-white">{dict.planCurrent}</p>
                          <p className="text-xs text-[#64748b] mt-0.5">{dict.planLimit}</p>
                        </div>
                        <span className="text-[10px] font-black bg-[#334155] text-[#94a3b8] px-3 py-1.5 rounded-full uppercase tracking-widest">Free</span>
                      </div>
                      <div className="bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/10 rounded-2xl border border-[#6366f1]/30 p-6 space-y-4">
                        <p className="font-black text-white text-lg">Pro Plan</p>
                        <p className="text-xs text-[#94a3b8] leading-relaxed">{dict.planProList}</p>
                        <button onClick={() => setShowUpgrade(true)} className="w-full py-3 bg-[#6366f1] hover:bg-[#4f46e5] rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-[#6366f1]/20">
                          {dict.planUpgrade}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Privacy ── */}
                  {settingsTab === 'privacy' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-black text-white">{dict.privTitle}</h3>
                      </div>
                      <div className="bg-[#1e293b] rounded-2xl border border-[#334155] p-6 space-y-4">
                        <p className="text-sm text-[#94a3b8] leading-relaxed">{dict.privDesc}</p>
                        <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-[#334155]">
                          <span className="text-sm text-[#94a3b8] font-medium">{dict.privToggle}</span>
                          <div className="relative">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-10 h-5 bg-[#334155] rounded-full peer peer-checked:bg-[#6366f1] transition-colors" />
                            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                          </div>
                        </label>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={() => { if (window.confirm('Delete all history?')) { setHistory([]); localStorage.removeItem('letterHistory'); showNotification(dict.deleted); } }}
                          className="w-full py-3 border border-[#334155] text-[#94a3b8] hover:text-white hover:border-[#475569] rounded-xl font-semibold text-sm transition-all"
                        >
                          {dict.deleteHistory}
                        </button>
                        <button className="w-full py-3 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 rounded-xl font-semibold text-sm transition-all">
                          {dict.deleteAccount}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
};

export default Dashboard;