import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateLetter, parseCV } from '../gemini';
import html2pdf from 'html2pdf.js';
import { usePlan } from '../hooks/usePlan';
import UpgradeModal from '../components/UpgradeModal';
import useMediaQuery from '../hooks/useMediaQuery';

// Desktop Components
import Sidebar from '../components/dashboard/Sidebar';
import DashboardTab from '../components/dashboard/DashboardTab';
import TemplatesTab from '../components/dashboard/TemplatesTab';
import HistoryTab from '../components/dashboard/HistoryTab';
import SettingsTab from '../components/dashboard/SettingsTab';

// Mobile Components
import MobileNav from '../components/dashboard/mobile/MobileNav';
import MobileDashboardTab from '../components/dashboard/mobile/MobileDashboardTab';
import MobileHistoryTab from '../components/dashboard/mobile/MobileHistoryTab';
import MobileTemplatesTab from '../components/dashboard/mobile/MobileTemplatesTab';
import MobileSettingsTab from '../components/dashboard/mobile/MobileSettingsTab';

import { TEMPLATES } from '../constants/templates';
import translations from '../locales/translations';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { uiLang, setUiLang } = useLanguage();
  const { isPro, planLoading } = usePlan(user);
  const isMobile = useMediaQuery('(max-width: 1024px)') &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // ── UI State ──
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [toast, setToast]             = useState({ show: false, msg: '' });

  // ── Letter State ──
  const [contactInfo, setContactInfo] = useState({
    fullName: '', profession: '', email: '', phone: '', location: '', linkedin: ''
  });
  const [jobDescription, setJobDescription] = useState('');
  const [cvFile, setCvFile]           = useState(null);
  const [fileName, setFileName]       = useState('');
  const [settings, setSettings]       = useState({ language: 'Auto', tone: 'Professional', length: 'Standard' });
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('influx');
  const [loading, setLoading]         = useState(false);
  const [parsingCV, setParsingCV]     = useState(false);
  const [editMode, setEditMode]       = useState(false);
  const [editText, setEditText]       = useState('');

  // ── History State ──
  const [history, setHistory]               = useState([]);
  const [historySearch, setHistorySearch]   = useState('');
  const [historyFilter, setHistoryFilter]   = useState('all');

  const documentRef = useRef();
  const dict        = translations[uiLang] || translations.en;
  const todayStr    = new Date().toLocaleDateString('uk-UA');
  const placeholderText = 'Your letter will appear here...';

  // ── Load saved data ──
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) setContactInfo(JSON.parse(savedProfile));
    else if (user) setContactInfo(prev => ({
      ...prev,
      fullName: user.displayName || '',
      email: user.email || ''
    }));

    const savedHistory = localStorage.getItem('letterHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [user]);

  // ── Notifications ──
  const showNotification = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3500);
  };

  // ── CV ──
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setCvFile({
      inlineData: { data: reader.result.split(',')[1], mimeType: file.type }
    });
    reader.readAsDataURL(file);
    showNotification('CV uploaded ✓');
  };

  const handleAutoFill = async () => {
    if (!cvFile) return alert('Upload PDF first');
    setParsingCV(true);
    try {
      const data = await parseCV(cvFile);
      const updated = { ...contactInfo, ...data };
      setContactInfo(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
      showNotification('Auto-filled ✓');
    } catch (e) {
      alert('AI Error: Could not parse CV');
    } finally {
      setParsingCV(false);
    }
  };

  // ── Generate ──
  const getMonthlyCount = () => {
    const key = `gen_count_${new Date().getMonth()}_${new Date().getFullYear()}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  };

  const handleGenerate = async () => {
    if (!jobDescription) return alert('Paste job description');
    if (planLoading) return showNotification('Checking plan...');

    // 👑 "РЕЖИМ БОГА": Перевірка вашого email
    const isAdmin = user?.email === 'gagatinsv@gmail.com';

    // Якщо це НЕ адмін, НЕ Pro і ліміт вичерпано — показуємо вікно оплати
    if (!isAdmin && !isPro && getMonthlyCount() >= 5) { 
        setShowUpgrade(true); 
        return; 
    }

    setLoading(true);
    setGeneratedLetter('');
    try {
      const text = await generateLetter(contactInfo, jobDescription, cvFile, settings);
      setGeneratedLetter(text);
      setEditMode(false);

      // Рахуємо ліміти тільки якщо це НЕ адмін і НЕ Pro
      if (!isAdmin && !isPro) {
        const key = `gen_count_${new Date().getMonth()}_${new Date().getFullYear()}`;
        const newCount = getMonthlyCount() + 1;
        localStorage.setItem(key, String(newCount));
        
        const left = 5 - newCount;
        if (left <= 0) {
          showNotification('Monthly limit reached — upgrade for unlimited');
        } else if (left <= 2) {
          showNotification(`⚠️ ${left} free generation${left === 1 ? '' : 's'} left this month`);
        }
      }
    } catch (e) {
      alert('AI Busy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── PDF — доступний для всіх, free отримує watermark ──
  const downloadPDF = () => {
    if (!generatedLetter) {
      showNotification('Generate a letter first');
      return;
    }

    const element = documentRef.current;

    // ... всередині функції downloadPDF ...

  // Для free — додаємо watermark (оновлена версія: акуратно знизу)
  let watermarkEl = null;
  if (!isPro) {
    watermarkEl = document.createElement('div');
    watermarkEl.id = 'pdf-watermark';
    
    // ЗМІНЕНИЙ CSS:
    watermarkEl.style.cssText = `
      position: absolute;
      bottom: 15px;                  /* Відступ від нижнього краю */
      left: 50%;                     /* Центр по горизонталі */
      transform: translateX(-50%);   /* Точне центрування */
      font-size: 12px;               /* Невеликий, акуратний шрифт */
      font-weight: 500;
      color: rgba(100, 116, 139, 0.6); /* Сірий колір, не надто яскравий */
      font-family: sans-serif;
      pointer-events: none;
      z-index: 1000;
      white-space: nowrap;
    `;
    
    // Текст теж можна зробити більш "професійним"
    watermarkEl.innerHTML = 'Generated with <b>AIletter.app</b> (Free Plan)';
    
    element.style.position = 'relative';
    element.appendChild(watermarkEl);
  }

  // ... далі йде const opt = { ... }

    const opt = {
      margin: 0,
      filename: 'Cover_Letter_AIletter.pdf',
      image: { type: 'jpeg', quality: isPro ? 0.98 : 0.88 },
      html2canvas: { scale: isPro ? 2 : 1.5, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        // Прибираємо watermark після збереження
        if (watermarkEl && element.contains(watermarkEl)) {
          element.removeChild(watermarkEl);
        }
        if (!isPro) {
          setTimeout(() => showNotification('💡 Upgrade Pro — HD export, DOCX & no watermark'), 800);
        }
      });
  };

  // ── DOCX — тільки Pro ──
  const downloadDOCX = async () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    if (!generatedLetter) {
      showNotification('Generate a letter first');
      return;
    }

    try {
      // Динамічний імпорт щоб не збільшувати bundle для всіх
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');

      const { fullName, profession, email, phone, location, linkedin } = contactInfo;

      // Парсимо текст листа на параграфи
      const paragraphs = generatedLetter
        .split('\n')
        .map(line => line.trim())
        .map(line => {
          if (!line) return new Paragraph({ text: '', spacing: { after: 120 } });
          return new Paragraph({
            children: [new TextRun({ text: line, font: 'Calibri', size: 24 })],
            spacing: { after: 160 },
          });
        });

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: { font: 'Calibri', size: 24, color: '1e293b' },
            },
          },
        },
        sections: [{
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch margins
            },
          },
          children: [
            // Ім'я та контакти зверху
            new Paragraph({
              children: [new TextRun({ text: fullName || 'Your Name', bold: true, size: 36, font: 'Calibri', color: '4f46e5' })],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 80 },
            }),
            new Paragraph({
              children: [new TextRun({
                text: [profession, email, phone, location, linkedin].filter(Boolean).join('  ·  '),
                size: 20, font: 'Calibri', color: '64748b',
              })],
              spacing: { after: 400 },
            }),
            // Дата
            new Paragraph({
              children: [new TextRun({ text: todayStr, size: 22, font: 'Calibri', color: '94a3b8' })],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 400 },
            }),
            // Сам лист
            ...paragraphs,
            // Footer
            new Paragraph({ text: '', spacing: { before: 400 } }),
            new Paragraph({
              children: [new TextRun({
                text: 'Generated with AIletter.app',
                size: 18, font: 'Calibri', color: 'cbd5e1',
              })],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Cover_Letter_AIletter.docx';
      a.click();
      URL.revokeObjectURL(url);
      showNotification('DOCX downloaded ✓');
    } catch (e) {
      console.error('DOCX error:', e);
      showNotification('DOCX export failed — try again');
    }
  };

  // ── History ──
  const handleSaveToHistory = () => {
    if (!generatedLetter) return;
    const entry = {
      id:   Date.now(),
      date: new Date().toLocaleDateString(),
      job:  jobDescription.substring(0, 60) + '...',
      text: generatedLetter,
      lang: settings.language,
    };
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem('letterHistory', JSON.stringify(updated));
    showNotification('Saved to history ✓');
  };

  const deleteHistoryItem = (id) => {
    if (!window.confirm('Delete this letter?')) return;
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('letterHistory', JSON.stringify(updated));
    showNotification('Deleted');
  };

  const duplicateHistoryItem = (item) => {
    const copy = {
      ...item,
      id:   Date.now(),
      date: new Date().toLocaleDateString(),
      job:  '[Copy] ' + item.job
    };
    const updated = [copy, ...history];
    setHistory(updated);
    localStorage.setItem('letterHistory', JSON.stringify(updated));
    showNotification('Duplicated ✓');
  };

  const getFilteredHistory = () => {
    let filtered = [...history];
    if (historySearch) filtered = filtered.filter(h =>
      h.job.toLowerCase().includes(historySearch.toLowerCase()) ||
      h.text?.toLowerCase().includes(historySearch.toLowerCase())
    );
    if (historyFilter === '7')  { const ago = Date.now() - 7  * 86400000; filtered = filtered.filter(h => h.id > ago); }
    if (historyFilter === '30') { const ago = Date.now() - 30 * 86400000; filtered = filtered.filter(h => h.id > ago); }
    return filtered;
  };

  // ── Profile ──
  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(contactInfo));
    showNotification('Profile saved ✓');
  };

  // ── All props ──
  const props = {
    // Auth
    user, logout,
    // Navigation
    activeTab, setActiveTab,
    // Contact & Job
    contactInfo, setContactInfo,
    jobDescription, setJobDescription,
    // CV
    cvFile, setCvFile, fileName, setFileName, handleFileChange, handleAutoFill, parsingCV,
    // Settings & Templates
    settings, setSettings,
    selectedTemplate, setSelectedTemplate,
    TEMPLATES,
    // Letter
    generatedLetter, setGeneratedLetter,
    loading, handleGenerate,
    editMode, setEditMode,
    editText, setEditText,
    // Export
    documentRef, downloadPDF, downloadDOCX,
    // History
    history, setHistory,
    historySearch, setHistorySearch,
    historyFilter, setHistoryFilter,
    handleSaveToHistory,
    deleteHistoryItem,
    duplicateHistoryItem,
    getFilteredHistory,
    // Plan
    isPro, planLoading, setShowUpgrade,
    // UI
    dict, showNotification,
    todayStr, placeholderText,
    uiLang, setUiLang,
    // Profile
    saveProfile,
  };

  return (
    <div className="bg-[#0f172a] text-white font-sans overflow-hidden">

      {/* Toast */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white px-4 py-2 rounded-xl shadow-2xl transition-all duration-300 z-[100] text-sm font-medium ${
        toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        {toast.msg}
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {isMobile ? (
        // ── MOBILE ──
        <div className="fixed inset-0 flex flex-col h-[100dvh] bg-[#0f172a]">
          <MobileNav {...props} />
          <div className="flex-1 overflow-y-auto pt-14 pb-20 landscape:pb-4 landscape:pl-14 w-full scroll-smooth">
            <div className="min-h-full">
              {activeTab === 'dashboard' && <MobileDashboardTab {...props} />}
              {activeTab === 'history'   && <MobileHistoryTab   {...props} />}
              {activeTab === 'templates' && <MobileTemplatesTab {...props} />}
              {activeTab === 'settings'  && <MobileSettingsTab  {...props} />}
            </div>
          </div>
        </div>
      ) : (
        // ── DESKTOP ──
        <div className="flex h-screen">
          <Sidebar {...props} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden relative">
              {activeTab === 'dashboard' && <DashboardTab  {...props} />}
              {activeTab === 'templates' && <TemplatesTab  {...props} />}
              {activeTab === 'history'   && <HistoryTab    {...props} />}
              {activeTab === 'settings'  && <SettingsTab   {...props} />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Dashboard;