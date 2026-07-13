import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateLetter, parseCV, extractCompanyName, integrateKeyword, analyzeCVQuality } from '../gemini';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas-pro';

if (typeof window !== 'undefined') {
  window.html2canvas = html2canvas;
}
import { usePlan } from '../hooks/usePlan';
import { useHistory } from '../hooks/useHistory';
import { useJobTracker } from '../hooks/useJobTracker';
import { useProfile } from '../hooks/useProfile';
import UpgradeModal from '../components/UpgradeModal';
import useMediaQuery from '../hooks/useMediaQuery';

// Desktop Components
import Sidebar from '../components/dashboard/Sidebar';
import DashboardOverviewTab from '../components/dashboard/DashboardOverviewTab';
import CoverLetterTab from '../components/dashboard/CoverLetterTab';
import TemplatesTab from '../components/dashboard/TemplatesTab';
import HistoryTab from '../components/dashboard/HistoryTab';
import SettingsTab from '../components/dashboard/SettingsTab';
import FollowUpModal from '../components/dashboard/FollowUpModal';
import InterviewTab from '../components/dashboard/InterviewTab';
import JobTrackerTab from '../components/dashboard/JobTrackerTab';
import CVOptimizerTab from '../components/dashboard/CVOptimizerTab';
import CVMakerTab from '../components/dashboard/CVMakerTab';
import PremiumTab from '../components/dashboard/PremiumTab';

// Mobile Components
import MobileNav from '../components/dashboard/MobileNav';

import { TEMPLATES } from '../constants/templates';
import translations from '../locales/translations';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { uiLang, setUiLang } = useLanguage();
  const { isPro, bonusGenerations = 0, planLoading } = usePlan(user);
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
  const [trackerFilter, setTrackerFilter] = useState('all');
  const [trackerEditJob, setTrackerEditJob] = useState(null);
  const [trackerAddDate, setTrackerAddDate] = useState(null);

  // ── CV Optimizer State ──
  const [cvAnalysis, setCvAnalysis] = useState(() => {
    try {
      const saved = localStorage.getItem(`cv_analysis_${user?.uid || 'guest'}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [cvAnalysisLoading, setCvAnalysisLoading] = useState(false);

  useEffect(() => {
    if (cvAnalysis) {
      localStorage.setItem(`cv_analysis_${user?.uid || 'guest'}`, JSON.stringify(cvAnalysis));
    } else {
      localStorage.removeItem(`cv_analysis_${user?.uid || 'guest'}`);
    }
  }, [cvAnalysis, user]);



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
  const [settings, setSettings]       = useState({ language: 'Auto', tone: 'Professional', length: 'Standard', level: 'Middle' });
  const [showCvSuggestion, setShowCvSuggestion] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [currentLetterSavedId, setCurrentLetterSavedId] = useState(null); // ID збереженого запису
  const [selectedTemplate, setSelectedTemplate] = useState('influx');
  const [selectedCVTemplate, setSelectedCVTemplate] = useState('modern');
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

  // Load CV from cache when user changes
  useEffect(() => {
    const keyFile = `cv_file_${user?.uid || 'guest'}`;
    const keyName = `cv_filename_${user?.uid || 'guest'}`;
    try {
      const savedFile = localStorage.getItem(keyFile);
      const savedName = localStorage.getItem(keyName);
      if (savedFile) {
        setCvFile(JSON.parse(savedFile));
      } else {
        setCvFile(null);
      }
      if (savedName) {
        setFileName(savedName);
      } else {
        setFileName('');
      }
    } catch (e) {
      console.warn('Failed to load CV from cache:', e);
    }
  }, [user]);

  // Save CV to cache when it changes
  useEffect(() => {
    const keyFile = `cv_file_${user?.uid || 'guest'}`;
    const keyName = `cv_filename_${user?.uid || 'guest'}`;
    try {
      if (cvFile) {
        localStorage.setItem(keyFile, JSON.stringify(cvFile));
      } else {
        localStorage.removeItem(keyFile);
      }
      if (fileName) {
        localStorage.setItem(keyName, fileName);
      } else {
        localStorage.removeItem(keyName);
      }
    } catch (e) {
      console.warn('Failed to save CV to cache (usually quota exceeded):', e);
    }
  }, [cvFile, fileName, user]);

  // ── Saved CVs List State ──
  const [savedCvs, setSavedCvs] = useState([]);

  // Load saved CVs from cache when user changes
  useEffect(() => {
    const key = `saved_cvs_${user?.uid || 'guest'}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setSavedCvs(JSON.parse(saved));
      } else {
        setSavedCvs([]);
      }
    } catch (e) {
      console.warn('Failed to load saved CVs:', e);
    }
  }, [user]);

  // Save CVs list to cache when it changes
  useEffect(() => {
    if (!user) return;
    const key = `saved_cvs_${user.uid || 'guest'}`;
    try {
      localStorage.setItem(key, JSON.stringify(savedCvs));
    } catch (e) {
      console.warn('Failed to save CVs list to cache:', e);
    }
  }, [savedCvs, user]);

  const addSavedCv = (filePart, name, parsedData) => {
    setSavedCvs((prev) => {
      const filtered = prev.filter(c => c.fileName !== name);
      return [
        ...filtered,
        {
          id: Date.now().toString(),
          fileName: name,
          cvFile: filePart,
          parsedData: parsedData || {}
        }
      ];
    });
  };

  const handleSelectSavedCv = (cv) => {
    setCvFile(cv.cvFile);
    setFileName(cv.fileName);
    if (cv.parsedData) {
      const updated = { ...contactInfo, ...cv.parsedData };
      setContactInfo(updated);
      setProfile(updated);
    }
    showNotification(`Active CV: ${cv.fileName}`);
  };

  const handleDeleteSavedCv = (id) => {
    if (!window.confirm('Delete this saved resume?')) return;
    setSavedCvs((prev) => {
      const next = prev.filter(c => c.id !== id);
      const deletedCv = prev.find(c => c.id === id);
      if (deletedCv && deletedCv.fileName === fileName) {
        setCvFile(null);
        setFileName('');
      }
      return next;
    });
    showNotification('Resume deleted from cache');
  };

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

  // ── Preload template from landing page template library ──
  useEffect(() => {
    try {
      const preloaded = localStorage.getItem('preloaded_template');
      if (preloaded) {
        const data = JSON.parse(preloaded);
        if (data.profession) {
          setContactInfo(prev => ({ ...prev, profession: data.profession }));
        }
        if (data.jobDescription) {
          setJobDescription(data.jobDescription);
        }
        localStorage.removeItem('preloaded_template');
        setTimeout(() => showNotification('Template preloaded successfully! ⚡'), 400);
      }
    } catch (e) {
      console.warn('Could not parse preloaded template:', e);
    }
  }, [user]);

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
      h.applied &&
      h.appliedAt &&
      !h.followUpSent &&
      h.appliedAt < sevenDaysAgo
    );
    setFollowUpEntry(pending || null);
  }, [history]);

  // ── CV Input quality check observer ──
  useEffect(() => {
    if (!contactInfo) {
      setShowCvSuggestion(true);
      return;
    }
    const totalAchievementsLength = (contactInfo.experience || [])
      .flatMap(e => e.achievements || [])
      .join(" ").length;
    const skillsLength = (contactInfo.skills || []).join(" ").length;
    
    if (totalAchievementsLength + skillsLength < 150) {
      setShowCvSuggestion(true);
    } else {
      setShowCvSuggestion(false);
    }
  }, [contactInfo]);

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
    reader.onloadend = () => {
      const cvData = {
        inlineData: { data: reader.result.split(',')[1], mimeType: file.type }
      };
      setCvFile(cvData);
      addSavedCv(cvData, file.name, contactInfo);
    };
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
      setSavedCvs((prev) => prev.map(c => {
        if (c.fileName === fileName) {
          return { ...c, parsedData: data };
        }
        return c;
      }));
      showNotification('Auto-filled ✓');
      
      // Background express quality validation check
      try {
        const quality = await analyzeCVQuality(data);
        setShowCvSuggestion(!!quality.isLackingDetail);
      } catch (err) {
        console.warn('Express CV quality check failed:', err);
      }
    } catch (e) {
      alert('AI Error: Could not parse CV');
    } finally {
      setParsingCV(false);
    }
  };

  // ── Generate ──
  // ── Save to history (внутрішня) ──
  // trigger: 'manual' | 'generate' | 'copy' | 'pdf' | 'docx'
  const saveToHistory = async (trigger = 'manual', letterText = null) => {
    const textToSave = letterText || generatedLetter;
    if (!textToSave) return null;

    let company = 'Unknown';
    try {
      company = await extractCompanyName(jobDescription);
    } catch (e) {
      console.warn('Could not extract company name:', e);
    }

    const isAppliedTrigger = ['copy', 'pdf', 'docx'].includes(trigger);

    // Якщо вже збережено — оновимо його статус при копіюванні/скачуванні
    if (currentLetterSavedId) {
      if (isAppliedTrigger) {
        await updateEntry(currentLetterSavedId, {
          applied: true,
          appliedAt: Date.now(),
          company,
        });
      }
      return currentLetterSavedId;
    }

    const id = Date.now();
    const entry = {
      id,
      date:          new Date().toLocaleDateString(),
      savedAt:       id,
      job:           jobDescription.substring(0, 60) + '...',
      jobDescription,
      text:          textToSave,
      lang:          settings.language,
      company,
      followUpSent:  false,
      savedVia:      trigger,
      applied:       isAppliedTrigger,
      appliedAt:     isAppliedTrigger ? Date.now() : null,
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
      showNotification('Saved ✓ — copy or download to start follow-up timer');
    }
  };

  const getMonthlyCount = () => {
    const key = `gen_count_${new Date().getMonth()}_${new Date().getFullYear()}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  };

  const handleGenerate = async () => {
    if (!jobDescription) return alert('Paste job description');
    if (planLoading) return showNotification('Checking plan...');

    const isAdmin = user?.email === 'gagatinsv@gmail.com';
    const totalAllowed = 5 + (bonusGenerations || 0);
    if (!isAdmin && !isPro && getMonthlyCount() >= totalAllowed) {
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

      // Auto save on generation
      try {
        await saveToHistory('generate', text);
      } catch (err) {
        console.warn('Auto-saving to history failed:', err);
      }

      if (!isAdmin && !isPro) {
        const key = `gen_count_${new Date().getMonth()}_${new Date().getFullYear()}`;
        const newCount = getMonthlyCount() + 1;
        localStorage.setItem(key, String(newCount));
        const left = totalAllowed - newCount;
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

    try {
      const canvas = await html2canvas(element, {
        scale: isPro ? 2 : 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/jpeg', isPro ? 0.98 : 0.88);
      
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('Cover_Letter_AIletter.pdf');
    } catch (err) {
      console.error("PDF generation error:", err);
      alert('Failed to generate PDF');
    } finally {
      if (watermarkEl && element.contains(watermarkEl)) {
        element.removeChild(watermarkEl);
      }
      if (!isPro) {
        setTimeout(() => showNotification('💡 Upgrade Pro — HD export, DOCX & no watermark'), 800);
      }
    }
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

  // ── Keyword Integration ──
  const handleIntegrateKeyword = async (keyword) => {
    if (!generatedLetter || !jobDescription || !keyword) return;

    setLoading(true);
    showNotification(`Integrating "${keyword}" into cover letter...`);

    try {
      const result = await integrateKeyword(generatedLetter, jobDescription, keyword);
      if (result && result.originalParagraph && result.updatedParagraph) {
        const originalText = result.originalParagraph.trim();
        const updatedText = result.updatedParagraph.trim();

        let newLetterText = generatedLetter;
        if (newLetterText.includes(originalText)) {
          newLetterText = newLetterText.replace(originalText, updatedText);
        } else {
          // Paragraph matching fallback
          const paragraphs = newLetterText.split(/\n\s*\n/);
          let bestIndex = -1;
          let bestScore = 0;
          
          for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i].trim();
            if (!p) continue;
            
            const wordsP = new Set(p.toLowerCase().split(/\s+/));
            const wordsOrig = new Set(originalText.toLowerCase().split(/\s+/));
            let overlap = 0;
            for (const w of wordsOrig) {
              if (wordsP.has(w)) overlap++;
            }
            const score = overlap / Math.max(wordsOrig.size, 1);
            if (score > bestScore && score > 0.4) {
              bestScore = score;
              bestIndex = i;
            }
          }

          if (bestIndex !== -1) {
            paragraphs[bestIndex] = updatedText;
            newLetterText = paragraphs.join('\n\n');
          } else {
            newLetterText = newLetterText + '\n\n' + updatedText;
          }
        }

        setGeneratedLetter(newLetterText);
        
        if (currentLetterSavedId) {
          await updateEntry(currentLetterSavedId, { text: newLetterText });
        }

        showNotification(`Integrated "${keyword}" ✓`);
      } else {
        showNotification('Failed to integrate keyword');
      }
    } catch (err) {
      console.error("Keyword integration failed:", err);
      showNotification('AI Busy. Please try again.');
    } finally {
      setLoading(false);
    }
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
    showCvSuggestion, setShowCvSuggestion, bonusGenerations,
    selectedTemplate, setSelectedTemplate,
    selectedCVTemplate, setSelectedCVTemplate,
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
    handleIntegrateKeyword,
    removeTrackerJob,
    profileSyncStatus,
    mobileHistoryLoadNonce,
    isPro, planLoading, setShowUpgrade, getMonthlyCount,
    dict, showNotification,
    todayStr, placeholderText,
    uiLang, setUiLang,
    saveProfile,
    onFollowUp: (entry) => { setFollowUpModalEntry(entry); setShowFollowUpModal(true); },
    cvAnalysis, setCvAnalysis,
    cvAnalysisLoading, setCvAnalysisLoading,
    trackerFilter, setTrackerFilter,
    trackerEditJob, setTrackerEditJob,
    trackerAddDate, setTrackerAddDate,
    followUpEntry,
    savedCvs, addSavedCv, handleSelectSavedCv, handleDeleteSavedCv,
  };

  return (
    <div className="bg-[#0f172a] text-white font-sans overflow-hidden">

      {/* Toast */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white px-4 py-2 rounded-xl shadow-2xl transition-all duration-300 z-[100] text-sm font-medium ${
        toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        {toast.msg}
      </div>

      {showUpgrade && (
        <UpgradeModal 
          onClose={() => setShowUpgrade(false)} 
          isLimitReached={getMonthlyCount() >= 5 + (bonusGenerations || 0)} 
        />
      )}

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

      <div className="flex flex-col lg:flex-row h-[100dvh] lg:h-screen w-full overflow-hidden bg-[#0f172a]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 h-full">
          <Sidebar {...props} />
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <MobileNav {...props} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden pt-14 pb-20 lg:pt-0 lg:pb-0 landscape:pb-4 landscape:pl-14 lg:landscape:pb-0 lg:landscape:pl-0">
          <div className="flex-1 overflow-hidden relative min-h-0 w-full">
            {activeTab === 'dashboard' && <DashboardOverviewTab {...props} />}
            {activeTab === 'cover-letter' && <CoverLetterTab {...props} />}
            {activeTab === 'cv-optimizer' && <CVOptimizerTab {...props} />}
            {activeTab === 'cv-maker' && <CVMakerTab {...props} />}
            {activeTab === 'templates' && <TemplatesTab {...props} />}
            {activeTab === 'premium' && <PremiumTab {...props} />}
            {activeTab === 'interview' && <InterviewTab {...props} />}
            {activeTab === 'history' && <HistoryTab {...props} />}
            {activeTab === 'jobtracker' && <JobTrackerTab {...props} />}
            {activeTab === 'settings' && <SettingsTab {...props} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;