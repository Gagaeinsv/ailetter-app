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
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [toast, setToast]           = useState({ show: false, msg: '' });

  // ── Letter State ──
  const [contactInfo, setContactInfo] = useState({ fullName: '', profession: '', email: '', phone: '', location: '', linkedin: '' });
  const [jobDescription, setJobDescription] = useState('');
  const [cvFile, setCvFile]         = useState(null);
  const [fileName, setFileName]     = useState('');
  const [settings, setSettings]     = useState({ language: 'Auto', tone: 'Professional', length: 'Standard' });
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('influx');
  const [loading, setLoading]       = useState(false);
  const [parsingCV, setParsingCV]   = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [editText, setEditText]     = useState('');

  // ── History State ──
  const [history, setHistory]             = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  const documentRef = useRef();
  const dict        = translations[uiLang] || translations.en;
  const todayStr    = new Date().toLocaleDateString('uk-UA');
  const placeholderText = 'Your letter will appear here...';

  // ── Load saved data ──
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) setContactInfo(JSON.parse(savedProfile));
    else if (user) setContactInfo(prev => ({ ...prev, fullName: user.displayName || '', email: user.email || '' }));

    const savedHistory = localStorage.getItem('letterHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [user]);

  // ── Notifications ──
  const showNotification = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  // ── CV ──
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setCvFile({ inlineData: { data: reader.result.split(',')[1], mimeType: file.type } });
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
    } catch (e) { alert('AI Error: Could not parse CV'); }
    finally { setParsingCV(false); }
  };

  // ── Generate ──
  const getMonthlyCount = () => {
    const key = `gen_count_${new Date().getMonth()}_${new Date().getFullYear()}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  };

  const handleGenerate = async () => {
    if (!jobDescription) return alert('Paste job description');
    if (planLoading) return showNotification('Checking plan...');
    if (!isPro && getMonthlyCount() >= 5) { setShowUpgrade(true); return; }
    setLoading(true);
    setGeneratedLetter('');
    try {
      const text = await generateLetter(contactInfo, jobDescription, cvFile, settings);
      setGeneratedLetter(text);
      setEditMode(false);
      if (!isPro) {
        const key = `gen_count_${new Date().getMonth()}_${new Date().getFullYear()}`;
        localStorage.setItem(key, String(getMonthlyCount() + 1));
        const left = 5 - getMonthlyCount();
        if (left <= 0) showNotification('Monthly limit reached — upgrade for unlimited');
        else if (left <= 2) showNotification(`⚠️ ${left} free generation${left === 1 ? '' : 's'} left this month`);
      }
    } catch (e) { alert('AI Busy. Please try again.'); }
    finally { setLoading(false); }
  };

  // ── PDF ──
  const downloadPDF = () => {
    if (!isPro) { setShowUpgrade(true); return; }
    const opt = {
      margin: 0,
      filename: 'Cover_Letter.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(documentRef.current).save();
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
    const copy = { ...item, id: Date.now(), date: new Date().toLocaleDateString(), job: '[Copy] ' + item.job };
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

  // ── All props in one object ──
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
    // PDF
    documentRef, downloadPDF,
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
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white px-4 py-2 rounded-xl shadow-2xl transition-all z-[100] ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
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