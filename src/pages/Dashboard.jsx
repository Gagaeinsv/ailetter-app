import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateLetter, parseCV, extractCompanyName } from '../gemini';
import html2pdf from 'html2pdf.js';
import { usePlan } from '../hooks/usePlan';
import { useHistory } from '../hooks/useHistory';
import { useJobTracker } from '../hooks/useJobTracker';
import { useProfile } from '../hooks/useProfile';
import UpgradeModal from '../components/UpgradeModal';
import useMediaQuery from '../hooks/useMediaQuery';

// Desktop Components
import Sidebar from '../components/dashboard/Sidebar';
import DashboardTab from '../components/dashboard/DashboardTab';
import TemplatesTab from '../components/dashboard/TemplatesTab';
import HistoryTab from '../components/dashboard/HistoryTab';
import SettingsTab from '../components/dashboard/SettingsTab';
import FollowUpModal from '../components/dashboard/FollowUpModal';
import InterviewTab from '../components/dashboard/InterviewTab';
import JobTrackerTab from '../components/dashboard/JobTrackerTab';

// Mobile Components
import MobileNav from '../components/dashboard/mobile/MobileNav';
import MobileDashboardTab from '../components/dashboard/mobile/MobileDashboardTab';
import MobileHistoryTab from '../components/dashboard/mobile/MobileHistoryTab';
import MobileTemplatesTab from '../components/dashboard/mobile/MobileTemplatesTab';
import MobileSettingsTab from '../components/dashboard/mobile/MobileSettingsTab';
import MobileInterviewTab from '../components/dashboard/mobile/MobileInterviewTab';
import MobileJobTrackerTab from '../components/dashboard/mobile/MobileJobTrackerTab';

import { TEMPLATES } from '../constants/templates';
import translations from '../locales/translations';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { uiLang, setUiLang } = useLanguage();
  const { isPro, planLoading } = usePlan(user);
  const {
    history,
    setHistory: replaceAllHistory,
    addEntry,
    updateEntry,
    removeEntry,
    syncStatus,
  } = useHistory(user, isPro);
  const {
    trackerJobs,
    trackerSyncStatus,
    upsertTrackerJob,
    patchTrackerJob,
    removeTrackerJob,
    clearTrackerJobs,
  } = useJobTracker(user, isPro);
  const { profile, setProfile, profileSyncStatus } = useProfile(user);
  const isMobile = useMediaQuery('(max-width: 1024px)') &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // ── UI State ──
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [toast, setToast]             = useState({ show: false, msg: '' });

  // ── Follow-up State ──
  const [followUpEntry, setFollowUpEntry]         = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpModalEntry, setFollowUpModalEntry] = useState(null);

  // ── Letter State ──
  const [contactInfo, setContactInfo] = useState({
    fullName: '', profession: '', email: '', phone: '', location: '', linkedin: ''
  });
  const [jobDescription, setJobDescription] = useState('');
  const [cvFile, setCvFile]           = useState(null);
  const [fileName, setFileName]       = useState('');
  const [settings, setSettings]       = useState({ language: 'Auto', tone: 'Professional', length: 'Standard' });
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [currentLetterSavedId, setCurrentLetterSavedId] = useState(null); // ID збереженого запису
  const [selectedTemplate, setSelectedTemplate] = useState('influx');
  const [loading, setLoading]         = useState(false);
  const [parsingCV, setParsingCV]     = useState(false);
  const [editMode, setEditMode]       = useState(false);
  const [editText, setEditText]       = useState('');

  // ── History filters (desktop history tab) ──
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  /** Incremented when loading a letter from history so mobile dashboard switches to the Result tab */
  const [mobileHistoryLoadNonce, setMobileHistoryLoadNonce] = useState(0);
  const skipNextGeneratedLetterSaveIdReset = useRef(false);

  const documentRef = useRef();
  const dict        = translations[uiLang] || translations.en;
  const todayStr    = new Date().toLocaleDateString('uk-UA');
  const placeholderText = 'Your letter will appear here...';

  // ── Load synced profile ──
  useEffect(() => {
    if (profile) {
      setContactInfo((prev) => ({ ...prev, ...profile }));
      return;
    }
    if (user) {
      setContactInfo((prev) => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [profile, user]);

  // ── Скидаємо ID збереження при новій генерації (крім завантаження з історії) ──
  useEffect(() => {
    if (skipNextGeneratedLetterSaveIdReset.current) {
      skipNextGeneratedLetterSaveIdReset.current = false;
      return;
    }
    setCurrentLetterSavedId(null);
  }, [generatedLetter]);

  // ── Follow-up banner check ──
  useEffect(() => {
    if (!history.length) return;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const pending = history.find(h =>
      h.savedAt &&
      !h.followUpSent &&
      h.savedAt < sevenDaysAgo
    );
    setFollowUpEntry(pending || null);
  }, [history]);

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
      setProfile(updated);
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

    const isAdmin = user?.email === 'gagatinsv@gmail.com';
    if (!isAdmin && !isPro && getMonthlyCount() >= 5) {
      setShowUpgrade(true);
      return;
    }

    setLoading(true);
    setGeneratedLetter('');
    setCurrentLetterSavedId(null);

    try {
      const text = await generateLetter(contactInfo, jobDescription, cvFile, settings);
      setGeneratedLetter(text);
      setEditMode(false);

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

  // ── Save to history (внутрішня) ──
  // trigger: 'manual' | 'copy' | 'pdf' | 'docx'
  const saveToHistory = async (trigger = 'manual') => {
    if (!generatedLetter) return null;

    // Якщо вже збережено — не дублювати
    if (currentLetterSavedId) return currentLetterSavedId;

    let company = 'Unknown';
    try {
      company = await extractCompanyName(jobDescription);
    } catch (e) {
      console.warn('Could not extract company name:', e);
    }

    const id = Date.now();
    const entry = {
      id,
      date:          new Date().toLocaleDateString(),
      savedAt:       id,
      job:           jobDescription.substring(0, 60) + '...',
      jobDescription,
      text:          generatedLetter,
      lang:          settings.language,
      company,
      followUpSent:  false,
      savedVia:      trigger,
    };

    await addEntry(entry);
    setCurrentLetterSavedId(id);
    return id;
  };

  // ── Публічний handleSaveToHistory (для кнопки Save) ──
  const handleSaveToHistory = async () => {
    const id = await saveToHistory('manual');
    if (id === currentLetterSavedId && currentLetterSavedId !== null) {
      showNotification('Already saved ✓');
    } else {
      showNotification('Saved ✓ — follow-up reminder in 7 days');
    }
  };

  const loadLetterFromHistory = (item) => {
    const text = item?.text ?? '';
    setEditMode(false);
    setEditText('');
    if (item?.jobDescription && String(item.jobDescription).trim()) {
      setJobDescription(String(item.jobDescription).trim());
    } else if (item?.job && String(item.job).trim()) {
      const short = String(item.job).replace(/\.\.\.\s*$/, '').trim();
      if (short) setJobDescription(short);
    }
    if (item?.lang && item.lang !== 'Auto') {
      setSettings((prev) => ({ ...prev, language: item.lang }));
    }
    skipNextGeneratedLetterSaveIdReset.current = true;
    setCurrentLetterSavedId(item?.id ?? null);
    if (isMobile) setMobileHistoryLoadNonce((n) => n + 1);
    setGeneratedLetter(text);
    setActiveTab('dashboard');
  };

  // ── PDF ──
  const downloadPDF = async () => {
    if (!generatedLetter) {
      showNotification('Generate a letter first');
      return;
    }

    // Автозбереження при PDF якщо ще не збережено
    await saveToHistory('pdf');

    const element = documentRef.current;
    let watermarkEl = null;

    if (!isPro) {
      watermarkEl = document.createElement('div');
      watermarkEl.style.cssText = `
        position: absolute; bottom: 15px; left: 50%;
        transform: translateX(-50%);
        font-size: 11px; font-weight: 500;
        color: rgba(100,116,139,0.5);
        font-family: sans-serif; pointer-events: none;
        z-index: 1000; white-space: nowrap;
      `;
      watermarkEl.innerHTML = 'Generated with <b>AIletter.app</b> (Free Plan)';
      element.style.position = 'relative';
      element.appendChild(watermarkEl);
    }

    const opt = {
      margin: 0,
      filename: 'Cover_Letter_AIletter.pdf',
      image: { type: 'jpeg', quality: isPro ? 0.98 : 0.88 },
      html2canvas: { scale: isPro ? 2 : 1.5, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save().then(() => {
      if (watermarkEl && element.contains(watermarkEl)) {
        element.removeChild(watermarkEl);
      }
      if (!isPro) {
        setTimeout(() => showNotification('💡 Upgrade Pro — HD export, DOCX & no watermark'), 800);
      }
    });
  };

  // ── DOCX ──
  const downloadDOCX = async () => {
    if (!isPro) { setShowUpgrade(true); return; }
    if (!generatedLetter) { showNotification('Generate a letter first'); return; }

    // Автозбереження при DOCX якщо ще не збережено
    await saveToHistory('docx');

    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
      const { fullName, profession, email, phone, location, linkedin } = contactInfo;

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
        styles: { default: { document: { run: { font: 'Calibri', size: 24, color: '1e293b' } } } },
        sections: [{
          properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
          children: [
            new Paragraph({
              children: [new TextRun({ text: fullName || 'Your Name', bold: true, size: 36, font: 'Calibri', color: '4f46e5' })],
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 80 },
            }),
            new Paragraph({
              children: [new TextRun({
                text: [profession, email, phone, location, linkedin].filter(Boolean).join('  ·  '),
                size: 20, font: 'Calibri', color: '64748b'
              })],
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [new TextRun({ text: todayStr, size: 22, font: 'Calibri', color: '94a3b8' })],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 400 },
            }),
            ...paragraphs,
            new Paragraph({ text: '', spacing: { before: 400 } }),
            new Paragraph({
              children: [new TextRun({ text: 'Generated with AIletter.app', size: 18, font: 'Calibri', color: 'cbd5e1' })],
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

  // ── Copy (з автозбереженням) ──
  const copyLetter = async () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    await saveToHistory('copy');
    showNotification('Copied to clipboard ✓');
  };

  // ── History helpers ──
  const markFollowUpSent = async (id) => {
    await updateEntry(id, { followUpSent: true });
    setFollowUpEntry(null);
    showNotification('Follow-up marked as sent ✓');
  };

  const deleteHistoryItem = async (id) => {
    if (!window.confirm('Delete this letter?')) return;
    await removeEntry(id);
    showNotification('Deleted');
  };

  const duplicateHistoryItem = async (item) => {
    const copy = {
      ...item,
      id:   Date.now(),
      date: new Date().toLocaleDateString(),
      job:  '[Copy] ' + item.job,
    };
    await addEntry(copy);
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
  const saveProfile = async () => {
    await setProfile(contactInfo);
    showNotification('Profile saved ✓');
  };

  // ── All props ──
  const props = {
    user, logout,
    activeTab, setActiveTab,
    contactInfo, setContactInfo,
    jobDescription, setJobDescription,
    cvFile, setCvFile, fileName, setFileName, handleFileChange, handleAutoFill, parsingCV,
    settings, setSettings,
    selectedTemplate, setSelectedTemplate,
    TEMPLATES,
    generatedLetter, setGeneratedLetter,
    loading, handleGenerate,
    editMode, setEditMode,
    editText, setEditText,
    documentRef, downloadPDF, downloadDOCX,
    copyLetter, // передаємо замість navigator.clipboard напряму
    currentLetterSavedId,
    history,
    setHistory: replaceAllHistory,
    addEntry, updateEntry, removeEntry,
    historySearch, setHistorySearch,
    historyFilter, setHistoryFilter,
    handleSaveToHistory,
    deleteHistoryItem,
    duplicateHistoryItem,
    loadLetterFromHistory,
    getFilteredHistory,
    markFollowUpSent,
    syncStatus,
    clearTrackerJobs,
    trackerJobs,
    trackerSyncStatus,
    upsertTrackerJob,
    patchTrackerJob,
    removeTrackerJob,
    profileSyncStatus,
    mobileHistoryLoadNonce,
    isPro, planLoading, setShowUpgrade,
    dict, showNotification,
    todayStr, placeholderText,
    uiLang, setUiLang,
    saveProfile,
    onFollowUp: (entry) => { setFollowUpModalEntry(entry); setShowFollowUpModal(true); },
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

      {/* ── Follow-up Banner ── */}
      {followUpEntry && activeTab === 'dashboard' && (
        <div className="fixed top-4 right-4 z-[90] max-w-sm bg-[#1e293b] border border-amber-500/30 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏰</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Time for a follow-up!</p>
              <p className="text-gray-400 text-xs mt-0.5 truncate">
                You applied to <span className="text-amber-400">{followUpEntry.company || 'this company'}</span> 7+ days ago
              </p>
              <div className="flex gap-2 mt-3">
                {isPro ? (
                  <button
                    onClick={() => { setFollowUpModalEntry(followUpEntry); setShowFollowUpModal(true); }}
                    className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-all"
                  >
                    Generate Follow-up
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="flex-1 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-lg transition-all"
                  >
                    ✦ Pro — Generate Follow-up
                  </button>
                )}
                <button
                  onClick={() => markFollowUpSent(followUpEntry.id)}
                  className="px-3 py-1.5 bg-white/5 text-gray-500 hover:text-white text-xs rounded-lg transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {showFollowUpModal && followUpModalEntry && (
        <FollowUpModal
          entry={followUpModalEntry}
          contactInfo={contactInfo}
          onClose={() => { setShowFollowUpModal(false); setFollowUpModalEntry(null); }}
          onSent={() => markFollowUpSent(followUpModalEntry.id)}
          showNotification={showNotification}
        />
      )}

      {isMobile ? (
        <div className="fixed inset-0 flex flex-col h-[100dvh] bg-[#0f172a]">
          <MobileNav {...props} />
          <div className="flex-1 overflow-y-auto pt-14 pb-20 landscape:pb-4 landscape:pl-14 w-full scroll-smooth">
            <div className="min-h-full">
              {activeTab === 'dashboard' && <MobileDashboardTab {...props} />}
              {activeTab === 'history' && <MobileHistoryTab {...props} />}
              {activeTab === 'templates' && <MobileTemplatesTab {...props} />}
              {activeTab === 'interview' && <MobileInterviewTab {...props} />}
              {activeTab === 'jobtracker' && <MobileJobTrackerTab {...props} />}
              {activeTab === 'settings' && <MobileSettingsTab {...props} />}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-screen">
          <Sidebar {...props} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden relative">
              {activeTab === 'dashboard' && <DashboardTab {...props} />}
              {activeTab === 'templates' && <TemplatesTab {...props} />}
              {activeTab === 'interview' && <InterviewTab {...props} />}
              {activeTab === 'history' && <HistoryTab {...props} />}
              {activeTab === 'jobtracker' && <JobTrackerTab {...props} />}
              {activeTab === 'settings' && <SettingsTab {...props} />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Dashboard;