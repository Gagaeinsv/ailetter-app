// src/components/ui/Toast.jsx
import React from 'react';

const Toast = ({ show, message }) => (
  <div className={`fixed bottom-8 right-8 bg-[#6366f1] text-white px-5 py-3 rounded-xl shadow-2xl transition-all duration-500 z-50 flex items-center gap-3 ${show ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}>
    <div className="bg-white/20 p-1 rounded-full"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>
    <span className="text-xs font-bold uppercase tracking-widest">{message}</span>
  </div>
);



export default Toast;