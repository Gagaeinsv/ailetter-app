// src/constants/templates.js

export const TEMPLATES = [
  // FREE (5)
  { id: 'influx',     name: 'Influx',          pro: false, color: '#1e293b', accent: '#60a5fa', desc: 'Bold dark header, modern corporate' },
  { id: 'iconic',     name: 'Iconic',          pro: false, color: '#ffffff', accent: '#111827', desc: 'Minimal centered, ultra-clean' },
  { id: 'minimal',    name: 'Minimal',         pro: false, color: '#ffffff', accent: '#4f46e5', desc: 'Left accent bar, simple & sharp' },
  { id: 'nova',       name: 'Dev Clean',       pro: false, color: '#ffffff', accent: '#0f766e', desc: 'Tech & engineering, monospace meta' },
  { id: 'breeze',     name: 'Swiss Grid',      pro: false, color: '#ffffff', accent: '#111827', desc: 'Asymmetric 25/75 editorial grid' },
  // PRO (11)
  { id: 'enfold',     name: 'Enfold',          pro: true,  color: '#f1f5f9', accent: '#334155', desc: 'Two-column sidebar with photo' },
  { id: 'modern',     name: 'Modern',          pro: true,  color: '#1e293b', accent: '#818cf8', desc: 'Dark sidebar, bold identity' },
  { id: 'executive',  name: 'Executive',       pro: true,  color: '#ffffff', accent: '#b45309', desc: 'Gold serif accents, senior roles' },
  { id: 'nordic',     name: 'Nordic',          pro: true,  color: '#f8fafc', accent: '#0284c7', desc: 'Scandinavian minimal, cool blue' },
  { id: 'berlin',     name: 'Berlin DIN',      pro: true,  color: '#ffffff', accent: '#b91c1c', desc: 'German DIN 5008 business format' },
  { id: 'tokyo',      name: 'Tokyo',           pro: true,  color: '#fafafa', accent: '#e11d48', desc: 'Japanese minimalist, crimson rule' },
  { id: 'milano',     name: 'Milano',          pro: true,  color: '#fffef7', accent: '#92400e', desc: 'Italian serif elegance, warm ivory' },
  { id: 'sydney',     name: 'Executive Frame', pro: true,  color: '#ffffff', accent: '#1e3a5f', desc: 'Architectural double-border frame' },
  { id: 'atlas',      name: 'Atlas',           pro: true,  color: '#292524', accent: '#d97706', desc: 'Charcoal & amber editorial header' },
  { id: 'onyx',       name: 'Onyx Monolith',   pro: true,  color: '#111827', accent: '#f59e0b', desc: 'Black-gold card on crisp white paper' },
  { id: 'pearl',      name: 'Atelier',         pro: true,  color: '#fcfbf9', accent: '#881337', desc: 'Warm editorial serif & burgundy monogram' },
];

export const templateList = TEMPLATES.map(t => t.name);
