// src/constants/templates.js

export const TEMPLATES = [
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
export const templateList = TEMPLATES.map(t => t.name);