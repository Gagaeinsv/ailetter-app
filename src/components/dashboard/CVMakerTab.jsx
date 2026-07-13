// src/components/dashboard/CVMakerTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Plus, Trash2, FileText, Download, Briefcase, 
  GraduationCap, Award, Globe, User, Save, RefreshCw, Check, ArrowUp, ArrowDown 
} from 'lucide-react';
import { enhanceAchievement, parseVoiceCV } from '../../gemini';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas-pro';

if (typeof window !== 'undefined') {
  window.html2canvas = html2canvas;
}

export default function CVMakerTab({
  contactInfo,
  setContactInfo,
  saveProfile,
  dict,
  showNotification,
  isPro,
  setShowUpgrade,
  savedCvs = [],
  handleSelectSavedCv,
  handleDeleteSavedCv,
  fileName,
  uiLang = 'en',
  setUiLang,
  bonusGenerations = 0,
  selectedCVTemplate,
  setSelectedCVTemplate
}) {
  const labels = {
    en: {
      personal: 'Personal',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      languages: 'Languages',
      certifications: 'Certifications',
      summary: 'Summary',
      contact: 'Contact',
      more: 'More',
      personalDetails: 'Personal Details',
      aiWriterTitle: '✦ Magic AI Resume Fill',
      aiWriterDesc: 'Just describe your education, jobs, and skills in freeform text below. The AI will instantly structure and populate your resume fields.',
      aiWriterPlaceholder: 'E.g.: I am Igor, a Frontend developer with 3 years of experience. I studied Computer Science at KPI, graduated in 2022. I worked at SoftServe doing React and Redux...',
      aiWriterBtn: 'Generate Resume with AI',
      aiWriting: 'Generating...',
      aiFillSuccess: 'Resume populated successfully! ✓',
      projects: 'Projects',
      courses: 'Courses',
      awards: 'Awards',
      publications: 'Publications',
      interests: 'Interests'
    },
    uk: {
      personal: 'Профіль',
      experience: 'Досвід роботи',
      education: 'Освіта',
      skills: 'Навички',
      languages: 'Мови',
      certifications: 'Сертифікати',
      summary: 'Про себе',
      contact: 'Контакти',
      more: 'Додатково',
      personalDetails: 'Особисті дані',
      aiWriterTitle: '✦ ШІ-Генератор резюме з тексту',
      aiWriterDesc: 'Просто опишіть своє навчання, роботу та навички своїми словами нижче. ШІ розпізнає та автоматично заповнить усі поля конструктора.',
      aiWriterPlaceholder: 'Наприклад: Мене звати Ігор, я розробник інтерфейсів з 3 роками досвіду. Навчався в КПІ на комп\'ютерних науках (2022 рік випуску). Працював у SoftServe на React та Redux...',
      aiWriterBtn: 'Створити резюме через ШІ',
      aiWriting: 'Створення...',
      aiFillSuccess: 'Резюме успішно заповнено! ✓',
      projects: 'Проекти',
      courses: 'Курси',
      awards: 'Нагороди',
      publications: 'Публікації',
      interests: 'Інтереси'
    },
    de: {
      personal: 'Persönlich',
      experience: 'Berufserfahrung',
      education: 'Ausbildung',
      skills: 'Fähigkeiten',
      languages: 'Sprachen',
      certifications: 'Zertifikate',
      summary: 'Zusammenfassung',
      contact: 'Kontakt',
      more: 'Mehr',
      personalDetails: 'Persönliche Daten',
      aiWriterTitle: '✦ KI-Lebenslauf-Assistent (Freitext)',
      aiWriterDesc: 'Beschreiben Sie Ihre Ausbildung, Jobs und Fähigkeiten im Freitext. Die KI strukturiert und befüllt Ihren Lebenslauf sofort.',
      aiWriterPlaceholder: 'Z.B.: Ich bin Igor, Frontend-Entwickler mit 3 Jahren Erfahrung. Ich habe Informatik an der KPI studiert...',
      aiWriterBtn: 'Lebenslauf mit KI generieren',
      aiWriting: 'Generierung...',
      aiFillSuccess: 'Lebenslauf erfolgreich ausgefüllt! ✓',
      projects: 'Projekte',
      courses: 'Kurse',
      awards: 'Auszeichnungen',
      publications: 'Publikationen',
      interests: 'Interessen'
    },
    it: {
      personal: 'Personale',
      experience: 'Esperienza',
      education: 'Istruzione',
      skills: 'Competenze',
      languages: 'Lingue',
      certifications: 'Certificazioni',
      summary: 'Rieplogo',
      contact: 'Contatti',
      more: 'Altro',
      personalDetails: 'Dati Personali',
      aiWriterTitle: '✦ Generatore di CV con IA',
      aiWriterDesc: 'Descrivi la tua istruzione, i tuoi lavori e le tue competenze a parole tue. L\'IA strutturerà e popolerà istantaneamente il tuo curriculum.',
      aiWriterPlaceholder: 'Ad es.: Sono Igor, sviluppatore Frontend con 3 anni di esperienza. Ho studiato informatica alla KPI...',
      aiWriterBtn: 'Genera curriculum con l\'IA',
      aiWriting: 'Generazione in corso...',
      aiFillSuccess: 'Curriculum popolato con successo! ✓',
      projects: 'Progetti',
      courses: 'Corsi',
      awards: 'Premi',
      publications: 'Pubblicazioni',
      interests: 'Interessi'
    }
  };

  const t = labels[uiLang] || labels.en;

  // --- Local states copy for active editing ---
  const [cvData, setCvData] = useState({
    fullName: '',
    photo: '',
    profession: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
    skills: [],
    experience: [],
    education: '',
    languages: [],
    certifications: [],
    projects: [],
    courses: [],
    awards: [],
    publications: [],
    interests: []
  });

  const [activeSection, setActiveSection] = useState('personal'); // personal | experience | projects | skills | education | misc
  const selectedTemplate = selectedCVTemplate || 'modern';
  const setSelectedTemplate = setSelectedCVTemplate || (() => {});
  const [spacingPreset, setSpacingPreset] = useState('normal'); // compact | normal | spacious
  const [textSizePreset, setTextSizePreset] = useState('normal'); // small | normal | large
  const [aiLoadingIdx, setAiLoadingIdx] = useState(null); // tracking AI sparkles loading state
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Section Reordering state & handlers
  const [sectionOrder, setSectionOrder] = useState(['summary', 'experience', 'projects', 'education', 'skills', 'languages', 'certifications', 'courses', 'awards', 'publications', 'interests']);

  const moveSectionUp = (index) => {
    if (index === 0) return;
    const newOrder = [...sectionOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setSectionOrder(newOrder);
    showNotification('Section moved up ↑');
  };

  const moveSectionDown = (index) => {
    if (index === sectionOrder.length - 1) return;
    const newOrder = [...sectionOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setSectionOrder(newOrder);
    showNotification('Section moved down ↓');
  };
  
  // New entry temp states
  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newCert, setNewCert] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newAward, setNewAward] = useState('');
  const [newPub, setNewPub] = useState('');
  const [newInterest, setNewInterest] = useState('');
  
  const [rawCvText, setRawCvText] = useState('');
  const [aiTextWriting, setAiTextWriting] = useState(false);

  const handleGenerateFromRawText = async () => {
    if (!rawCvText.trim()) return alert('Please enter some text first');
    
    const getMonthlyCount = () => {
      const key = `gen_count_${new Date().getMonth()}_${new Date().getFullYear()}`;
      return parseInt(localStorage.getItem(key) || '0', 10);
    };

    if (!isPro) {
      const totalAllowed = 5 + (bonusGenerations || 0);
      if (getMonthlyCount() >= totalAllowed) {
        setShowUpgrade(true);
        return;
      }
    }

    setAiTextWriting(true);
    try {
      const parsed = await parseVoiceCV(rawCvText);
      if (parsed && typeof parsed === 'object') {
        setCvData(prev => ({
          ...prev,
          fullName: parsed.fullName || prev.fullName,
          profession: parsed.profession || prev.profession,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          location: parsed.location || prev.location,
          linkedin: parsed.linkedin || prev.linkedin,
          summary: parsed.summary || prev.summary || '',
          skills: Array.isArray(parsed.skills) ? parsed.skills : prev.skills,
          experience: Array.isArray(parsed.experience) ? parsed.experience : prev.experience,
          education: parsed.education || prev.education,
          languages: Array.isArray(parsed.languages) ? parsed.languages : prev.languages,
          projects: Array.isArray(parsed.projects) ? parsed.projects : prev.projects,
          courses: Array.isArray(parsed.courses) ? parsed.courses : prev.courses,
          awards: Array.isArray(parsed.awards) ? parsed.awards : prev.awards,
          publications: Array.isArray(parsed.publications) ? parsed.publications : prev.publications,
          interests: Array.isArray(parsed.interests) ? parsed.interests : prev.interests,
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : prev.certifications
        }));
        
        if (!isPro) {
          const key = `gen_count_${new Date().getMonth()}_${new Date().getFullYear()}`;
          localStorage.setItem(key, String(getMonthlyCount() + 1));
        }

        setRawCvText('');
        showNotification(t.aiFillSuccess);
      }
    } catch (err) {
      console.error(err);
      alert('AI Error: Could not generate CV fields. Please try again.');
    } finally {
      setAiTextWriting(false);
    }
  };

  const renderTemplateSection = (secId, templateId) => {
    const isClassic = templateId === 'classic' || templateId === 'milano' || templateId === 'onyx' || templateId === 'photo-classic';
    const isNova = templateId === 'nova';
    const isNordic = templateId === 'nordic';
    const isMilano = templateId === 'milano';
    const isOnyx = templateId === 'onyx';
    
    let accentColorClass = 'text-indigo-600';
    let headingBorderClass = 'border-slate-200';
    let skillBg = 'bg-slate-100 text-slate-800';
    let skillBorder = 'border-slate-200';
    let listTextClass = 'text-slate-700 font-semibold';
    let companyClass = 'text-slate-500 font-bold';

    if (templateId === 'modern') {
      accentColorClass = 'text-indigo-600';
      headingBorderClass = 'border-slate-200';
    } else if (templateId === 'classic') {
      accentColorClass = 'text-slate-900';
      headingBorderClass = 'border-slate-300';
      listTextClass = 'text-slate-700';
      companyClass = 'text-slate-500 font-bold';
    } else if (templateId === 'minimal') {
      accentColorClass = 'text-slate-955';
      headingBorderClass = 'border-slate-200';
    } else if (templateId === 'photo-modern') {
      accentColorClass = 'text-indigo-600';
      headingBorderClass = 'border-slate-200';
      skillBg = 'bg-indigo-50 text-indigo-700';
      skillBorder = 'border-indigo-100';
    } else if (templateId === 'photo-classic') {
      accentColorClass = 'text-indigo-600';
      headingBorderClass = 'border-slate-200';
    } else if (isNova) {
      accentColorClass = 'text-indigo-400';
      headingBorderClass = 'border-indigo-500/20';
      skillBg = 'bg-slate-800 text-indigo-300';
      skillBorder = 'border-slate-700';
      listTextClass = 'text-slate-300';
      companyClass = 'text-indigo-400 italic';
    } else if (isNordic) {
      accentColorClass = 'text-sky-700';
      headingBorderClass = 'border-sky-100';
      skillBg = 'bg-sky-50 text-sky-700';
      skillBorder = 'border-sky-100';
      listTextClass = 'text-slate-600';
      companyClass = 'text-sky-600';
    } else if (isMilano) {
      accentColorClass = 'text-amber-800';
      headingBorderClass = 'border-amber-600/20';
      skillBg = 'bg-amber-500/10 text-amber-900';
      skillBorder = 'border-amber-600/20';
      listTextClass = 'text-amber-955';
      companyClass = 'text-amber-800 italic';
    } else if (isOnyx) {
      accentColorClass = 'text-slate-900';
      headingBorderClass = 'border-slate-300';
      skillBg = 'bg-slate-100 text-slate-800';
      skillBorder = 'border-slate-200';
      listTextClass = 'text-slate-600';
      companyClass = 'text-amber-600';
    }

    if (secId === 'summary' && cvData.summary) {
      return (
        <div className="space-y-1.5 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} ${templateId === 'milano' ? 'border-b border-amber-600/20 pb-0.5' : ''}`}>
            {t.summary}
          </h4>
          <p style={{ fontSize: 'var(--cv-font-body)' }} className={`${templateId === 'nova' ? 'text-slate-300' : templateId === 'milano' ? 'text-amber-955/80 italic' : 'text-slate-600'} leading-relaxed font-medium`}>
            {cvData.summary}
          </p>
        </div>
      );
    }

    if (secId === 'experience' && cvData.experience.length > 0) {
      return (
        <div className="space-y-3 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} border-b ${headingBorderClass} pb-0.5`}>
            {t.experience}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-item-gap)' }}>
            {cvData.experience.map((exp, idx) => (
              <div key={idx} className="cv-avoid-break space-y-1">
                <div className="flex justify-between items-baseline">
                  <h5 style={{ fontSize: 'var(--cv-font-subtitle)' }} className={`font-black ${templateId === 'nova' ? 'text-white' : 'text-slate-900'}`}>{exp.title}</h5>
                  <span style={{ fontSize: 'var(--cv-font-meta)' }} className={`font-bold ${templateId === 'nova' ? 'text-slate-400' : 'text-slate-500'} whitespace-nowrap`}>{exp.duration}</span>
                </div>
                <h6 style={{ fontSize: 'var(--cv-font-meta)' }} className={`font-black uppercase tracking-wider ${companyClass}`}>{exp.company}</h6>
                <ul className="list-disc pl-4 mt-1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-list-gap)' }}>
                  {exp.achievements.map((ach, aIdx) => (
                    ach.trim() && (
                      <li key={aIdx} style={{ fontSize: 'var(--cv-font-body)' }} className={`cv-avoid-break ${listTextClass} leading-relaxed font-medium`}>
                        {ach}
                      </li>
                    )
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (secId === 'projects' && cvData.projects && cvData.projects.length > 0) {
      return (
        <div className="space-y-3 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} border-b ${headingBorderClass} pb-0.5`}>
            {t.projects}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-item-gap)' }}>
            {cvData.projects.map((proj, idx) => (
              <div key={idx} className="cv-avoid-break space-y-1">
                <div className="flex justify-between items-baseline">
                  <h5 style={{ fontSize: 'var(--cv-font-subtitle)' }} className={`font-black ${templateId === 'nova' ? 'text-white' : 'text-slate-900'}`}>
                    {proj.name}
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-400 hover:underline text-[9px] font-bold">
                        🔗 {uiLang === 'uk' ? 'Посилання' : 'Link'}
                      </a>
                    )}
                  </h5>
                  {proj.technologies && (
                    <span style={{ fontSize: 'var(--cv-font-meta)' }} className={`font-bold ${templateId === 'nova' ? 'text-slate-400' : 'text-slate-500'} whitespace-nowrap`}>
                      {proj.technologies}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p style={{ fontSize: 'var(--cv-font-body)' }} className={`${templateId === 'nova' ? 'text-slate-300' : templateId === 'milano' ? 'text-amber-955' : 'text-slate-600'} leading-relaxed font-semibold`}>
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (secId === 'courses' && cvData.courses && cvData.courses.length > 0) {
      return (
        <div className="space-y-1.5 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} border-b ${headingBorderClass} pb-0.5`}>
            {t.courses}
          </h4>
          <ul style={{ fontSize: 'var(--cv-font-body)', gap: 'var(--cv-list-gap)' }} className="list-disc pl-4 space-y-1 font-semibold leading-relaxed">
            {cvData.courses.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (secId === 'awards' && cvData.awards && cvData.awards.length > 0) {
      return (
        <div className="space-y-1.5 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} border-b ${headingBorderClass} pb-0.5`}>
            {t.awards}
          </h4>
          <ul style={{ fontSize: 'var(--cv-font-body)', gap: 'var(--cv-list-gap)' }} className="list-disc pl-4 space-y-1 font-semibold leading-relaxed">
            {cvData.awards.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (secId === 'publications' && cvData.publications && cvData.publications.length > 0) {
      return (
        <div className="space-y-1.5 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} border-b ${headingBorderClass} pb-0.5`}>
            {t.publications}
          </h4>
          <ul style={{ fontSize: 'var(--cv-font-body)', gap: 'var(--cv-list-gap)' }} className="list-disc pl-4 space-y-1 font-semibold leading-relaxed">
            {cvData.publications.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (secId === 'interests' && cvData.interests && cvData.interests.length > 0) {
      return (
        <div className="space-y-1.5 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} border-b ${headingBorderClass} pb-0.5`}>
            {t.interests}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }} className="pt-1 font-semibold">
            {cvData.interests.map((interest, idx) => (
              <span 
                key={idx} 
                className={`px-2.5 py-0.5 border ${skillBorder} ${skillBg} rounded-md text-[9px] uppercase font-extrabold tracking-wider`}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (secId === 'education' && cvData.education) {
      return (
        <div className="space-y-1.5 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} border-b ${headingBorderClass} pb-0.5`}>
            {t.education}
          </h4>
          <p style={{ fontSize: 'var(--cv-font-body)' }} className={`${templateId === 'nova' ? 'text-slate-300' : templateId === 'milano' ? 'text-amber-955' : 'text-slate-600'} leading-relaxed font-semibold`}>
            {cvData.education}
          </p>
        </div>
      );
    }

    if (secId === 'skills' && cvData.skills.length > 0) {
      return (
        <div className="space-y-1.5 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} ${templateId === 'milano' || templateId === 'nordic' || templateId === 'onyx' ? '' : `border-b ${headingBorderClass} pb-0.5`}`}>
            {t.skills}
          </h4>
          <div className="flex flex-wrap gap-1">
            {cvData.skills.map((skill, idx) => (
              <span key={idx} style={{ fontSize: 'var(--cv-font-meta)' }} className={`font-bold px-2 py-0.5 rounded border ${skillBg} ${skillBorder}`}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (secId === 'languages' && cvData.languages.length > 0) {
      return (
        <div className="space-y-1.5 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} ${templateId === 'milano' || templateId === 'nordic' || templateId === 'onyx' ? '' : `border-b ${headingBorderClass} pb-0.5`}`}>
            {t.languages}
          </h4>
          <ul className="list-disc pl-4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-list-gap)' }}>
            {cvData.languages.map((l, idx) => (
              <li key={idx} style={{ fontSize: 'var(--cv-font-body)' }} className={`font-semibold ${templateId === 'nova' ? 'text-slate-300' : templateId === 'milano' ? 'text-amber-955' : 'text-slate-700'}`}>{l}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (secId === 'certifications' && cvData.certifications.length > 0) {
      return (
        <div className="space-y-1.5 cv-avoid-break">
          <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className={`font-black uppercase tracking-widest ${accentColorClass} border-b ${headingBorderClass} pb-0.5`}>
            {t.certifications}
          </h4>
          <ul className="list-disc pl-4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-list-gap)' }}>
            {cvData.certifications.map((c, idx) => (
              <li key={idx} style={{ fontSize: 'var(--cv-font-body)' }} className={`font-semibold ${templateId === 'nova' ? 'text-slate-300' : templateId === 'milano' ? 'text-amber-955' : 'text-slate-700'}`}>{c}</li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  };

  const previewRef = useRef();

  const getSheetStyle = () => {
    const isClassic = selectedTemplate === 'classic' || selectedTemplate === 'milano' || selectedTemplate === 'onyx' || selectedTemplate === 'photo-classic';
    let padding = '40px 48px';
    let sectionGap = '24px';
    let itemGap = '16px';
    let listGap = '4px';
    
    if (spacingPreset === 'compact') {
      padding = '24px 32px';
      sectionGap = '12px';
      itemGap = '8px';
      listGap = '2px';
    } else if (spacingPreset === 'spacious') {
      padding = '56px 64px';
      sectionGap = '32px';
      itemGap = '20px';
      listGap = '8px';
    }
    
    let fontTitle = '24px';
    let fontSubtitle = '12px';
    let fontSection = '12px';
    let fontBody = '10.5px';
    let fontMeta = '9.5px';
    
    if (textSizePreset === 'small') {
      fontTitle = '20px';
      fontSubtitle = '10px';
      fontSection = '10px';
      fontBody = '9px';
      fontMeta = '8.5px';
    } else if (textSizePreset === 'large') {
      fontTitle = '28px';
      fontSubtitle = '14px';
      fontSection = '14px';
      fontBody = '12px';
      fontMeta = '11px';
    }
    
    let background = '#ffffff';
    let color = '#0f172a';
    
    if (selectedTemplate === 'nova') {
      background = '#0f172a';
      color = '#f1f5f9';
    } else if (selectedTemplate === 'milano') {
      background = '#fffbf0';
      color = '#451a03';
    } else if (selectedTemplate === 'nordic') {
      background = '#f8fafc';
      color = '#1e293b';
    }
    
    return {
      fontFamily: isClassic ? 'Georgia, serif' : 'system-ui, -apple-system, sans-serif',
      padding,
      boxSizing: 'border-box',
      background,
      color,
      '--cv-font-title': fontTitle,
      '--cv-font-subtitle': fontSubtitle,
      '--cv-font-section-title': fontSection,
      '--cv-font-body': fontBody,
      '--cv-font-meta': fontMeta,
      '--cv-section-gap': sectionGap,
      '--cv-item-gap': itemGap,
      '--cv-list-gap': listGap
    };
  };

  // Sync from props on load or profile update
  useEffect(() => {
    if (contactInfo) {
      const formatEdu = (edu) => {
        if (!edu) return '';
        if (Array.isArray(edu)) {
          return edu.map(e => {
            if (typeof e === 'object' && e !== null) {
              const parts = [];
              if (e.degree) parts.push(e.degree);
              if (e.university || e.school || e.institution) parts.push(e.university || e.school || e.institution);
              if (e.year || e.date) parts.push(e.year || e.date);
              return parts.join(', ');
            }
            return String(e);
          }).join('\n');
        }
        if (typeof edu === 'object' && edu !== null) {
          const parts = [];
          if (edu.degree) parts.push(edu.degree);
          if (edu.university || edu.school || edu.institution) parts.push(edu.university || edu.school || edu.institution);
          if (edu.year || edu.date) parts.push(edu.year || edu.date);
          return parts.join(', ');
        }
        return String(edu);
      };

      setCvData({
        fullName: contactInfo.fullName || '',
        photo: contactInfo.photo || '',
        profession: contactInfo.profession || '',
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        location: contactInfo.location || '',
        linkedin: contactInfo.linkedin || '',
        summary: contactInfo.summary || '',
        skills: Array.isArray(contactInfo.skills) ? [...contactInfo.skills] : [],
        experience: Array.isArray(contactInfo.experience) 
          ? JSON.parse(JSON.stringify(contactInfo.experience)) 
          : typeof contactInfo.experience === 'string' && contactInfo.experience.trim() 
            ? [{ title: 'Experience', company: '', duration: '', achievements: [contactInfo.experience] }]
            : [],
        education: formatEdu(contactInfo.education),
        languages: Array.isArray(contactInfo.languages) ? [...contactInfo.languages] : [],
        projects: Array.isArray(contactInfo.projects) ? JSON.parse(JSON.stringify(contactInfo.projects)) : [],
        courses: Array.isArray(contactInfo.courses) ? [...contactInfo.courses] : [],
        awards: Array.isArray(contactInfo.awards) ? [...contactInfo.awards] : [],
        publications: Array.isArray(contactInfo.publications) ? [...contactInfo.publications] : [],
        interests: Array.isArray(contactInfo.interests) ? [...contactInfo.interests] : [],
        certifications: Array.isArray(contactInfo.certifications) ? [...contactInfo.certifications] : []
      });
    }
  }, [contactInfo]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showNotification(uiLang === 'uk' ? 'Максимальний розмір фото 2MB' : 'Max photo size is 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCvData(prev => ({ ...prev, photo: uploadEvent.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setCvData(prev => ({ ...prev, photo: '' }));
  };

  // Handle saving data back to profile
  const handleSave = async () => {
    try {
      setContactInfo(cvData);
      if (saveProfile) {
        await saveProfile(cvData);
      }
      showNotification(dict?.cvSavedText || 'Resume profile saved successfully ✓');
    } catch (e) {
      console.error(e);
      showNotification('Failed to save profile');
    }
  };

  // --- EXPERIENCE HANDLERS ---
  const handleAddProject = () => {
    setCvData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', link: '', technologies: '' }]
    }));
  };

  const handleProjectChange = (index, field, value) => {
    setCvData(prev => {
      const copy = [...prev.projects];
      copy[index][field] = value;
      return { ...prev, projects: copy };
    });
  };

  const handleDeleteProject = (index) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const handleAddExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', company: '', duration: '', achievements: [''] }
      ]
    }));
    setActiveSection('experience');
  };

  const handleRemoveExperience = (idx) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx)
    }));
  };

  const handleExperienceChange = (expIdx, field, val) => {
    setCvData(prev => {
      const nextExp = [...prev.experience];
      nextExp[expIdx] = { ...nextExp[expIdx], [field]: val };
      return { ...prev, experience: nextExp };
    });
  };

  const handleAchievementChange = (expIdx, achIdx, val) => {
    setCvData(prev => {
      const nextExp = [...prev.experience];
      const nextAch = [...nextExp[expIdx].achievements];
      nextAch[achIdx] = val;
      nextExp[expIdx] = { ...nextExp[expIdx], achievements: nextAch };
      return { ...prev, experience: nextExp };
    });
  };

  const handleAddAchievement = (expIdx) => {
    setCvData(prev => {
      const nextExp = [...prev.experience];
      nextExp[expIdx] = {
        ...nextExp[expIdx],
        achievements: [...nextExp[expIdx].achievements, '']
      };
      return { ...prev, experience: nextExp };
    });
  };

  const handleRemoveAchievement = (expIdx, achIdx) => {
    setCvData(prev => {
      const nextExp = [...prev.experience];
      nextExp[expIdx] = {
        ...nextExp[expIdx],
        achievements: nextExp[expIdx].achievements.filter((_, i) => i !== achIdx)
      };
      return { ...prev, experience: nextExp };
    });
  };

  // Reorder experiences
  const moveExperience = (idx, direction) => {
    setCvData(prev => {
      const nextExp = [...prev.experience];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= nextExp.length) return prev;
      const temp = nextExp[idx];
      nextExp[idx] = nextExp[targetIdx];
      nextExp[targetIdx] = temp;
      return { ...prev, experience: nextExp };
    });
  };

  // --- AI REWRITE BULLET POINT ---
  const handleAiEnhanceBullet = async (expIdx, achIdx) => {
    const originalText = cvData.experience[expIdx].achievements[achIdx];
    const jobTitle = cvData.experience[expIdx].title;
    if (!originalText || originalText.trim().length < 4) {
      alert(dict?.cvMinLengthAlert || 'Please write a brief description first so AI has context to enhance.');
      return;
    }

    const key = `${expIdx}-${achIdx}`;
    setAiLoadingIdx(key);
    showNotification('AI is rewriting achievement...');

    try {
      const result = await enhanceAchievement(originalText, jobTitle);

      if (result && result.trim()) {
        handleAchievementChange(expIdx, achIdx, result.trim());
        showNotification('Achievement enhanced successfully! ✓');
      }
    } catch (e) {
      console.error(e);
      alert('AI Rewrite failed. Please try again.');
    } finally {
      setAiLoadingIdx(null);
    }
  };

  // --- MISC LIST HANDLERS (Skills, Languages, Certs) ---
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!cvData.skills.includes(newSkill.trim())) {
      setCvData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setCvData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleAddLang = () => {
    if (!newLang.trim()) return;
    if (!cvData.languages.includes(newLang.trim())) {
      setCvData(prev => ({ ...prev, languages: [...prev.languages, newLang.trim()] }));
    }
    setNewLang('');
  };

  const handleRemoveLang = (lang) => {
    setCvData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));
  };

  const handleAddCert = () => {
    if (!newCert.trim()) return;
    if (!cvData.certifications.includes(newCert.trim())) {
      setCvData(prev => ({ ...prev, certifications: [...prev.certifications, newCert.trim()] }));
    }
    setNewCert('');
  };

  const handleRemoveCert = (cert) => {
    setCvData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== cert) }));
  };

  // --- EXPORT TO PDF ---
  const handleExportPDF = async () => {
    if (pdfGenerating) return;
    setPdfGenerating(true);
    showNotification('Preparing PDF for download...');

    const safeName = (cvData.fullName || '').trim().replace(/\s+/g, '_') || 'CV';

    try {
      const element = previewRef.current;
      
      // Dynamic page breaks insertion to avoid splitting elements
      const elementWidth = element.offsetWidth || 794;
      const pageHeightPx = Math.floor(elementWidth * 1.414); // Exact A4 aspect ratio height in layout pixels
      const targets = element.querySelectorAll('.cv-avoid-break');
      const insertedSpacers = [];
      
      const getAbsoluteOffsetTop = (el, container) => {
        let top = 0;
        let current = el;
        while (current && current !== container) {
          top += current.offsetTop || 0;
          current = current.offsetParent;
        }
        return top;
      };
      
      for (let i = 0; i < targets.length; i++) {
        const targetEl = targets[i];
        const top = getAbsoluteOffsetTop(targetEl, element);
        const bottom = top + targetEl.offsetHeight;
        
        const startPage = Math.floor(top / pageHeightPx);
        const endPage = Math.floor(bottom / pageHeightPx);
        
        if (startPage !== endPage) {
          const remainingSpace = pageHeightPx - (top % pageHeightPx);
          
          const isListItem = targetEl.tagName.toLowerCase() === 'li';
          const spacer = document.createElement(isListItem ? 'li' : 'div');
          spacer.style.height = `${remainingSpace}px`;
          spacer.style.width = '100%';
          spacer.style.display = 'block';
          spacer.style.clear = 'both';
          spacer.style.overflow = 'hidden';
          spacer.style.listStyleType = 'none';
          spacer.style.backgroundColor = 'transparent';
          spacer.className = 'temp-pdf-spacer';
          
          targetEl.parentNode.insertBefore(spacer, targetEl);
          insertedSpacers.push(spacer);
        }
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // Clean up temporary spacers
      insertedSpacers.forEach(spacer => {
        if (spacer.parentNode) {
          spacer.parentNode.removeChild(spacer);
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Smart Auto-Scaling: if content overflows by less than 17% (up to 348mm),
      // scale it down to fit exactly on 1 page.
      if (imgHeight <= 348) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, pageHeight);
      } else {
        // Multi-page export
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
      }
      
      pdf.save(`Resume_${safeName}.pdf`);
      showNotification('PDF downloaded successfully! ✓');
    } catch (err) {
      console.error("PDF generation error:", err);
      alert('Failed to generate PDF');
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 md:p-8 bg-[#0f172a] text-white custom-scrollbar">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <FileText className="text-[#6366f1] w-7 h-7" />
              {dict?.cvMakerTitle || 'AI Resume & CV Maker'}
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              {dict?.cvMakerDesc || 'Build, polish with AI, and download a professional print-ready resume.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* CV Language Switcher */}
            <div className="flex gap-0.5 bg-[#1e293b] rounded-lg p-0.5 border border-[#334155] mr-2">
              {['EN', 'UK', 'DE', 'IT'].map((lang) => (
                <button 
                  key={lang} 
                  onClick={() => setUiLang && setUiLang(lang.toLowerCase())}
                  className={`px-2 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                    uiLang === lang.toLowerCase() 
                      ? 'bg-[#6366f1] text-white' 
                      : 'text-[#475569] hover:text-white'
                  }`}
                  title={`Switch Resume language to ${lang}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2.5 bg-[#1e293b] hover:bg-slate-800 border border-[#334155] rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Save size={14} />
              {dict?.saveBtn || 'Save Changes'}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={pdfGenerating}
              className="px-5 py-2.5 bg-[#6366f1] hover:bg-[#5458ee] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-[#6366f1]/20 disabled:opacity-50"
            >
              {pdfGenerating ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {pdfGenerating ? 'Generating...' : (dict?.downloadPdf || 'Download PDF')}
            </button>
          </div>
        </div>

        {savedCvs && savedCvs.length > 0 && (
          <div className="bg-[#1e293b]/70 p-4 rounded-2xl border border-[#334155]/50 flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <FileText className="text-[#6366f1] w-4 h-4" />
              <span className="text-xs font-bold text-slate-300">{dict?.activeCv || 'Active Resume:'}</span>
              {fileName ? (
                <span className="text-xs font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-[200px]">
                  {fileName}
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-400">None</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={savedCvs.find(c => c.fileName === fileName)?.id || ''}
                onChange={(e) => {
                  const selected = savedCvs.find(c => c.id === e.target.value);
                  if (selected && handleSelectSavedCv) {
                    handleSelectSavedCv(selected);
                  }
                }}
                className="text-xs font-bold bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-white outline-none cursor-pointer hover:border-indigo-500 transition-colors"
              >
                <option value="" disabled>-- Switch Resume --</option>
                {savedCvs.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fileName}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const currentId = savedCvs.find(c => c.fileName === fileName)?.id;
                  if (currentId && handleDeleteSavedCv) {
                    handleDeleteSavedCv(currentId);
                  }
                }}
                disabled={!fileName}
                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                title="Delete saved resume"
              >
                🗑️
              </button>
            </div>
          </div>
        )}

        {/* Dual Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: FORM EDITOR */}
          <div className="xl:col-span-5 space-y-4">

            {/* AI Resume Auto-Writer (Raw Text) */}
            <div className="bg-gradient-to-br from-[#1e293b]/70 to-[#0f172a]/70 border border-[#334155]/60 p-4 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-400 w-4 h-4 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
                  {t.aiWriterTitle}
                </h3>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-medium">
                {t.aiWriterDesc}
              </p>
              <textarea
                value={rawCvText}
                onChange={(e) => setRawCvText(e.target.value)}
                placeholder={t.aiWriterPlaceholder}
                disabled={aiTextWriting}
                className="w-full h-20 bg-[#0f172a]/80 border border-[#334155] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none resize-none font-medium custom-scrollbar"
              />
              <button
                onClick={handleGenerateFromRawText}
                disabled={aiTextWriting || !rawCvText.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500/10 to-indigo-600/10 hover:from-amber-500/20 hover:to-indigo-600/20 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {aiTextWriting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
                {aiTextWriting ? t.aiWriting : t.aiWriterBtn}
              </button>
            </div>
            
            {/* Section selector tabs */}
            <div className="flex flex-wrap gap-1 bg-[#1e293b] p-1 rounded-xl">
              {[
                { id: 'personal', label: t.personal || 'Personal', icon: User },
                { id: 'experience', label: t.experience || 'Experience', icon: Briefcase },
                { id: 'skills', label: t.skills || 'Skills', icon: Award },
                { id: 'education', label: t.education || 'Education', icon: GraduationCap },
                { id: 'misc', label: t.more || 'More', icon: Globe }
              ].map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeSection === s.id 
                        ? 'bg-[#6366f1] text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon size={13} />
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: PERSONAL */}
            {activeSection === 'personal' && (
              <div className="bg-[#1e293b]/50 border border-[#334155]/50 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 mb-2">{t.personalDetails || 'Personal Details'}</h3>
                
                {/* Photo Upload Section */}
                <div className="flex items-center gap-4 border-b border-[#334155]/30 pb-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0">
                    {cvData.photo ? (
                      <img src={cvData.photo} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-slate-500 w-8 h-8" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer">
                        {uiLang === 'uk' ? 'Завантажити фото' : 'Upload Photo'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload} 
                          className="hidden" 
                        />
                      </label>
                      {cvData.photo && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-rose-400 hover:text-rose-300 rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/5"
                        >
                          {uiLang === 'uk' ? 'Видалити' : 'Remove'}
                        </button>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-500">{uiLang === 'uk' ? 'Макс. розмір: 2MB. JPG, PNG.' : 'Max size: 2MB. JPG, PNG formats.'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={cvData.fullName}
                      onChange={(e) => setCvData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Job Title / Profession</label>
                    <input
                      type="text"
                      value={cvData.profession}
                      onChange={(e) => setCvData(prev => ({ ...prev, profession: e.target.value }))}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={cvData.email}
                      onChange={(e) => setCvData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={cvData.phone}
                      onChange={(e) => setCvData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Location</label>
                    <input
                      type="text"
                      value={cvData.location}
                      onChange={(e) => setCvData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={cvData.linkedin}
                      onChange={(e) => setCvData(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Professional Summary / Bio</label>
                  <textarea
                    rows={4}
                    value={cvData.summary}
                    onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Short professional summary highlighting your key background and value proposition..."
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 text-xs text-white focus:border-indigo-500 outline-none resize-y custom-scrollbar"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: PROJECTS */}
            {activeSection === 'projects' && (
              <div className="bg-[#1e293b]/50 border border-[#334155]/50 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400">{uiLang === 'uk' ? 'Мої проекти' : 'My Projects'}</h3>
                  <button
                    onClick={handleAddProject}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 transition-all"
                  >
                    + {uiLang === 'uk' ? 'Додати проект' : 'Add Project'}
                  </button>
                </div>

                <div className="space-y-6">
                  {cvData.projects && cvData.projects.map((proj, idx) => (
                    <div key={idx} className="p-4 bg-[#0f172a]/40 border border-[#334155]/30 rounded-xl relative space-y-4">
                      <button
                        onClick={() => handleDeleteProject(idx)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition-colors text-xs font-bold"
                      >
                        {uiLang === 'uk' ? 'Видалити' : 'Delete'}
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">{uiLang === 'uk' ? 'Назва проекту' : 'Project Name'}</label>
                          <input
                            type="text"
                            value={proj.name}
                            onChange={(e) => handleProjectChange(idx, 'name', e.target.value)}
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">{uiLang === 'uk' ? 'Технології' : 'Technologies / Tools'}</label>
                          <input
                            type="text"
                            value={proj.technologies}
                            onChange={(e) => handleProjectChange(idx, 'technologies', e.target.value)}
                            placeholder="e.g. React, Node.js, Python"
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">{uiLang === 'uk' ? 'Посилання (URL)' : 'Project Link (URL)'}</label>
                          <input
                            type="text"
                            value={proj.link}
                            onChange={(e) => handleProjectChange(idx, 'link', e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">{uiLang === 'uk' ? 'Опис проекту' : 'Description / Achievements'}</label>
                          <textarea
                            rows={3}
                            value={proj.description}
                            onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 text-xs text-white focus:border-indigo-500 outline-none resize-y custom-scrollbar"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: EXPERIENCE */}
            {activeSection === 'experience' && (
              <div className="bg-[#1e293b]/50 border border-[#334155]/50 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400">{t.experience || 'Work Experience'}</h3>
                  <button
                    onClick={handleAddExperience}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 transition-all"
                  >
                    <Plus size={12} />
                    Add Job
                  </button>
                </div>

                {cvData.experience.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No experience entries yet. Click "Add Job" to start building.</p>
                ) : (
                  <div className="space-y-6">
                    {cvData.experience.map((exp, expIdx) => (
                      <div key={expIdx} className="bg-[#0f172a] p-4 rounded-xl border border-[#334155] space-y-3 relative group">
                        
                        {/* Control buttons */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => moveExperience(expIdx, 'up')}
                            disabled={expIdx === 0}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => moveExperience(expIdx, 'down')}
                            disabled={expIdx === cvData.experience.length - 1}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded disabled:opacity-30"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            onClick={() => handleRemoveExperience(expIdx)}
                            className="p-1 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded"
                            title="Delete entry"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-20">
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Job Title</label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => handleExperienceChange(expIdx, 'title', e.target.value)}
                              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Company Name</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(expIdx, 'company', e.target.value)}
                              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Duration (e.g., 2022 - Present)</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => handleExperienceChange(expIdx, 'duration', e.target.value)}
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                          />
                        </div>

                        {/* Achievements / Bullet points */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-bold uppercase text-slate-400">Achievements / Responsibilities</label>
                            <button
                              onClick={() => handleAddAchievement(expIdx)}
                              className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold uppercase"
                            >
                              + Add Bullet
                            </button>
                          </div>
                          
                          {exp.achievements.map((ach, achIdx) => (
                            <div key={achIdx} className="flex gap-2 items-start">
                              <span className="text-slate-500 mt-2 text-[10px]">•</span>
                              <textarea
                                value={ach}
                                rows={2}
                                onChange={(e) => handleAchievementChange(expIdx, achIdx, e.target.value)}
                                className="flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-2.5 py-1 text-xs text-white outline-none resize-none"
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleAiEnhanceBullet(expIdx, achIdx)}
                                  disabled={aiLoadingIdx === `${expIdx}-${achIdx}`}
                                  className="p-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 rounded-lg disabled:opacity-40 transition-colors"
                                  title="Polish & Enhance with AI"
                                >
                                  {aiLoadingIdx === `${expIdx}-${achIdx}` ? (
                                    <RefreshCw size={11} className="animate-spin" />
                                  ) : (
                                    <Sparkles size={11} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRemoveAchievement(expIdx, achIdx)}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-lg transition-colors"
                                  title="Delete bullet"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SKILLS */}
            {activeSection === 'skills' && (
              <div className="bg-[#1e293b]/50 border border-[#334155]/50 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400">Core Skills</h3>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Type a skill (e.g. React, Project Management)..."
                    className="flex-1 bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {cvData.skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:border-rose-500 hover:text-rose-400 cursor-pointer transition-colors group"
                      onClick={() => handleRemoveSkill(skill)}
                      title="Click to remove"
                    >
                      {skill}
                      <Trash2 size={10} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
                    </span>
                  ))}
                  {cvData.skills.length === 0 && (
                    <span className="text-xs text-slate-400">No skills added yet.</span>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: EDUCATION */}
            {activeSection === 'education' && (
              <div className="bg-[#1e293b]/50 border border-[#334155]/50 p-6 rounded-2xl space-y-4">
                 <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400">{t.education || 'Education'}</h3>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Degree, Institution, Dates</label>
                  <textarea
                    rows={6}
                    value={cvData.education}
                    onChange={(e) => setCvData(prev => ({ ...prev, education: e.target.value }))}
                    placeholder="E.g.:&#10;M.S. in Computer Science - New York University (2018 - 2020)&#10;B.S. in Software Engineering - NYU (2014 - 2018)"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-xl p-3 text-xs text-white focus:border-indigo-500 outline-none resize-y custom-scrollbar"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: MISC */}
            {activeSection === 'misc' && (
              <div className="bg-[#1e293b]/50 border border-[#334155]/50 p-6 rounded-2xl space-y-6">
                
                {/* Languages */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">Languages</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLang())}
                      placeholder="E.g., English (Fluent)..."
                      className="flex-1 bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                    />
                    <button
                      onClick={handleAddLang}
                      className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {cvData.languages.map((l, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:border-rose-500 hover:text-rose-400 cursor-pointer transition-colors group"
                        onClick={() => handleRemoveLang(l)}
                      >
                        {l}
                        <Trash2 size={10} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">Certifications</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCert())}
                      placeholder="E.g., AWS Certified Solutions Architect..."
                      className="flex-1 bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                    />
                    <button
                      onClick={handleAddCert}
                      className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {cvData.certifications.map((c, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:border-rose-500 hover:text-rose-400 cursor-pointer transition-colors group"
                        onClick={() => handleRemoveCert(c)}
                      >
                        {c}
                        <Trash2 size={10} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT: LIVE PREVIEW & EXPORT */}
          <div className="xl:col-span-7 space-y-4">
            
            {/* Section Order Controls */}
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-[#334155]/50 space-y-2 mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">{uiLang === 'uk' ? 'Порядок розділів' : uiLang === 'de' ? 'Reihenfolge der Abschnitte' : uiLang === 'it' ? 'Ordine delle sezioni' : 'Section Order'}</span>
              <div className="flex flex-wrap gap-2">
                {sectionOrder.map((secId, index) => {
                  const label = {
                    summary: t.summary || 'Summary',
                    experience: t.experience || 'Experience',
                    projects: t.projects || 'Projects',
                    education: t.education || 'Education',
                    skills: t.skills || 'Skills',
                    languages: t.languages || 'Languages',
                    certifications: t.certifications || 'Certifications',
                    courses: t.courses || 'Courses',
                    awards: t.awards || 'Awards',
                    publications: t.publications || 'Publications',
                    interests: t.interests || 'Interests'
                  }[secId];
                  return (
                    <div key={secId} className="flex items-center gap-1.5 bg-[#0f172a] px-3 py-1.5 rounded-xl border border-[#334155]">
                      <span className="text-[10px] font-extrabold text-slate-300">{label}</span>
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          className="p-0.5 hover:text-white text-slate-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSectionDown(index)}
                          disabled={index === sectionOrder.length - 1}
                          className="p-0.5 hover:text-white text-slate-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Design Controls */}
            <div className="bg-[#1e293b] p-4 rounded-2xl border border-[#334155]/50 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Template Switcher */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Template Style</span>
                <div className="flex flex-wrap gap-1 bg-[#0f172a] p-1 rounded-xl border border-[#334155]">
                  {[
                    { id: 'modern', label: 'Influx (Modern)', pro: false },
                    { id: 'classic', label: 'Iconic (Classic)', pro: false },
                    { id: 'minimal', label: 'Minimal', pro: false },
                    { id: 'photo-modern', label: 'Breeze (Photo)', pro: false },
                    { id: 'nova', label: 'Nova (Dark)', pro: false },
                    { id: 'nordic', label: 'Nordic ✦ PRO', pro: true },
                    { id: 'milano', label: 'Milano ✦ PRO', pro: true },
                    { id: 'onyx', label: 'Onyx ✦ PRO', pro: true },
                    { id: 'photo-classic', label: 'Executive Photo ✦ PRO', pro: true }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.pro && !isPro) {
                          setShowUpgrade(true);
                          return;
                        }
                        setSelectedTemplate(item.id);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-black transition-all ${
                        selectedTemplate === item.id 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Size */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Text Size</span>
                <div className="flex gap-1 bg-[#0f172a] p-1 rounded-xl border border-[#334155]">
                  {[
                    { id: 'small', label: 'A-' },
                    { id: 'normal', label: 'Normal' },
                    { id: 'large', label: 'A+' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setTextSizePreset(item.id)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        textSizePreset === item.id 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Spacing / Margins</span>
                <div className="flex gap-1 bg-[#0f172a] p-1 rounded-xl border border-[#334155]">
                  {[
                    { id: 'compact', label: 'Compact' },
                    { id: 'normal', label: 'Normal' },
                    { id: 'spacious', label: 'Wide' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSpacingPreset(item.id)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        spacingPreset === item.id 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Document sheet preview container */}
            <div className="bg-[#111827] border border-[#1e293b] rounded-3xl p-6 overflow-x-auto shadow-2xl flex justify-center custom-scrollbar">
              <div 
                ref={previewRef}
                className="w-[794px] min-h-[1123px] shadow-xl overflow-hidden print-page select-text relative"
                style={getSheetStyle()}
              >
                
                {/* TEMPLATE 1: MODERN ACCENT */}
                {selectedTemplate === 'modern' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-section-gap)' }} className="text-left">
                    {/* Header */}
                    <div className="border-b-4 border-indigo-600 pb-4 flex items-center justify-between gap-4">
                      <div>
                        <h2 style={{ fontSize: 'var(--cv-font-title)', lineHeight: '1.1' }} className="font-black text-slate-955 uppercase tracking-tight mb-1">{cvData.fullName || 'Alex Morgan'}</h2>
                        <h4 style={{ fontSize: 'var(--cv-font-subtitle)' }} className="font-extrabold text-indigo-600 uppercase tracking-wider mb-2">{cvData.profession || 'Product Manager'}</h4>
                        <div style={{ fontSize: 'var(--cv-font-meta)' }} className="flex flex-wrap gap-x-4 gap-y-1.5 font-bold text-slate-500">
                          {cvData.email && <span>✉ {cvData.email}</span>}
                          {cvData.phone && <span>📞 {cvData.phone}</span>}
                          {cvData.location && <span>📍 {cvData.location}</span>}
                          {cvData.linkedin && <span className="text-indigo-600 font-semibold">{cvData.linkedin}</span>}
                        </div>
                      </div>
                      {cvData.photo && (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-600 shrink-0">
                          <img src={cvData.photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    {cvData.summary && renderTemplateSection('summary', 'modern')}

                    {/* Main experience and secondary sidebar grid */}
                    <div className="grid grid-cols-12 gap-8 pt-2" style={{ gap: 'var(--cv-section-gap)' }}>
                      {/* Left: Exp & Ed */}
                      <div className="col-span-8 space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-section-gap)' }}>
                        {sectionOrder.filter(s => s === 'experience' || s === 'projects' || s === 'education').map(secId => renderTemplateSection(secId, 'modern'))}
                      </div>

                      {/* Right Sidebar: Skills, Langs, Certs */}
                      <div className="col-span-4 space-y-6 border-l border-slate-100 pl-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-section-gap)' }}>
                        {sectionOrder.filter(s => s === 'skills' || s === 'languages' || s === 'interests' || s === 'certifications' || s === 'courses' || s === 'awards' || s === 'publications' || s === 'interests').map(secId => renderTemplateSection(secId, 'modern'))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE 2: CLASSIC EXECUTIVE */}
                {selectedTemplate === 'classic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-section-gap)' }} className="text-center">
                    {/* Header */}
                    <div className="border-b border-slate-300 pb-4 flex flex-col items-center gap-1.5">
                      <h2 style={{ fontSize: 'var(--cv-font-title)' }} className="font-bold tracking-tight text-slate-900">{cvData.fullName || 'Alex Morgan'}</h2>
                      <h4 style={{ fontSize: 'var(--cv-font-subtitle)' }} className="font-semibold text-slate-500 uppercase tracking-widest">{cvData.profession || 'Product Manager'}</h4>
                      <div style={{ fontSize: 'var(--cv-font-meta)' }} className="flex justify-center flex-wrap gap-x-4 gap-y-1 font-bold text-slate-500">
                        {cvData.email && <span>{cvData.email}</span>}
                        {cvData.phone && <span>{cvData.phone}</span>}
                        {cvData.location && <span>{cvData.location}</span>}
                        {cvData.linkedin && <span>{cvData.linkedin}</span>}
                      </div>
                      {cvData.photo && (
                        <div className="w-14 h-14 overflow-hidden border border-slate-200 mt-2 shrink-0">
                          <img src={cvData.photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {sectionOrder.map(secId => renderTemplateSection(secId, 'classic'))}
                  </div>
                )}

                {/* TEMPLATE 3: ELEGANT MINIMAL */}
                {selectedTemplate === 'minimal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-section-gap)' }} className="text-left">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                      <div className="flex gap-4 items-center">
                        {cvData.photo && (
                          <div className="w-14 h-14 overflow-hidden border border-slate-200 shrink-0">
                            <img src={cvData.photo} alt="Profile" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <h2 style={{ fontSize: 'var(--cv-font-title)' }} className="font-bold tracking-tight text-slate-955">{cvData.fullName || 'Alex Morgan'}</h2>
                          <h4 style={{ fontSize: 'var(--cv-font-subtitle)' }} className="font-semibold text-slate-500 uppercase tracking-widest mt-1">{cvData.profession || 'Product Manager'}</h4>
                        </div>
                      </div>
                      <div style={{ fontSize: 'var(--cv-font-meta)' }} className="text-right font-bold text-slate-500 space-y-0.5">
                        {cvData.email && <div>{cvData.email}</div>}
                        {cvData.phone && <div>{cvData.phone}</div>}
                        {cvData.location && <div>{cvData.location}</div>}
                        {cvData.linkedin && <div className="text-indigo-600 font-semibold">{cvData.linkedin}</div>}
                      </div>
                    </div>

                    {sectionOrder.map(secId => renderTemplateSection(secId, 'minimal'))}
                  </div>
                )}

                {/* TEMPLATE 4: CREATIVE PHOTO (PRO) */}
                {selectedTemplate === 'photo-modern' && (
                  <div style={{ display: 'flex', gap: '20px' }} className="text-left font-sans text-slate-900">
                    {/* Left Column (Sidebar) */}
                    <div style={{ width: '32%', display: 'flex', flexDirection: 'column', gap: '15px' }} className="border-r border-slate-200 pr-4">
                      {/* Photo */}
                      {cvData.photo ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-600 mx-auto shrink-0">
                          <img src={cvData.photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-300 mx-auto shrink-0 text-slate-400 font-bold text-[9px] uppercase">Photo</div>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-2 pt-2">
                        <h4 style={{ fontSize: 'var(--cv-font-section-title)' }} className="font-extrabold uppercase tracking-widest text-indigo-600 border-b border-slate-200 pb-1">{t.contact || 'Contact'}</h4>
                        <div style={{ fontSize: 'var(--cv-font-meta)', display: 'flex', flexDirection: 'column', gap: '4px' }} className="font-semibold text-slate-600">
                          {cvData.email && <div className="truncate">{cvData.email}</div>}
                          {cvData.phone && <div>{cvData.phone}</div>}
                          {cvData.location && <div>{cvData.location}</div>}
                          {cvData.linkedin && <div className="text-indigo-600 truncate">{cvData.linkedin}</div>}
                        </div>
                      </div>

                      {sectionOrder.filter(s => s === 'skills' || s === 'languages' || s === 'interests').map(secId => renderTemplateSection(secId, 'photo-modern'))}
                    </div>

                    {/* Right Column (Main) */}
                    <div style={{ width: '68%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {/* Name Header */}
                      <div>
                        <h2 style={{ fontSize: 'var(--cv-font-title)', lineHeight: '1.1' }} className="font-black text-slate-955 uppercase tracking-tight mb-1">{cvData.fullName || 'Alex Morgan'}</h2>
                        <h4 style={{ fontSize: 'var(--cv-font-subtitle)' }} className="font-extrabold text-indigo-600 uppercase tracking-wider">{cvData.profession || 'Product Manager'}</h4>
                      </div>

                      {sectionOrder.filter(s => s !== 'skills' && s !== 'languages' && s !== 'interests').map(secId => renderTemplateSection(secId, 'photo-modern'))}
                    </div>
                  </div>
                )}

                {/* TEMPLATE 5: EXECUTIVE PHOTO (PRO) */}
                {selectedTemplate === 'photo-classic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-section-gap)' }} className="text-left font-serif">
                    {/* Header */}
                    <div className="border-b border-slate-200 pb-4 flex items-center justify-between gap-4">
                      <div>
                        <h2 style={{ fontSize: 'var(--cv-font-title)' }} className="font-bold tracking-tight text-slate-900">{cvData.fullName || 'Alex Morgan'}</h2>
                        <h4 style={{ fontSize: 'var(--cv-font-subtitle)' }} className="font-bold text-indigo-600 uppercase tracking-widest">{cvData.profession || 'Product Manager'}</h4>
                        <div style={{ fontSize: 'var(--cv-font-meta)' }} className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-slate-505 font-semibold">
                          {cvData.email && <span>{cvData.email}</span>}
                          {cvData.phone && <span>{cvData.phone}</span>}
                          {cvData.location && <span>{cvData.location}</span>}
                          {cvData.linkedin && <span>{cvData.linkedin}</span>}
                        </div>
                      </div>
                      {cvData.photo && (
                        <div className="w-16 h-16 overflow-hidden border border-slate-200 shrink-0">
                          <img src={cvData.photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {sectionOrder.map(secId => renderTemplateSection(secId, 'photo-classic'))}
                  </div>
                )}

                {/* TEMPLATE 6: NOVA DARK MODE (FREE) */}
                {selectedTemplate === 'nova' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-section-gap)' }} className="text-left font-sans text-slate-300">
                    {/* Header */}
                    <div className="border-b border-indigo-500/30 pb-4 flex items-center justify-between gap-4">
                      <div>
                        <h2 style={{ fontSize: 'var(--cv-font-title)', lineHeight: '1.1' }} className="font-black text-white uppercase tracking-tight mb-1">{cvData.fullName || 'Alex Morgan'}</h2>
                        <h4 style={{ fontSize: 'var(--cv-font-subtitle)' }} className="font-extrabold text-indigo-400 uppercase tracking-wider mb-2">{cvData.profession || 'Product Manager'}</h4>
                        <div style={{ fontSize: 'var(--cv-font-meta)' }} className="flex flex-wrap gap-x-4 gap-y-1.5 font-bold text-slate-400">
                          {cvData.email && <span>✉ {cvData.email}</span>}
                          {cvData.phone && <span>📞 {cvData.phone}</span>}
                          {cvData.location && <span>📍 {cvData.location}</span>}
                          {cvData.linkedin && <span className="text-indigo-400 font-semibold">{cvData.linkedin}</span>}
                        </div>
                      </div>
                      {cvData.photo && (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-400 shrink-0">
                          <img src={cvData.photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {sectionOrder.map(secId => renderTemplateSection(secId, 'nova'))}
                  </div>
                )}

                {/* TEMPLATE 7: NORDIC COOL BLUE (PRO) */}
                {selectedTemplate === 'nordic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-section-gap)' }} className="text-left font-sans text-slate-800">
                    {/* Header */}
                    <div className="border-l-4 border-sky-500 pl-4 py-2 flex justify-between items-center gap-4">
                      <div>
                        <h2 style={{ fontSize: 'var(--cv-font-title)' }} className="font-black tracking-tight text-slate-900 uppercase">{cvData.fullName || 'Alex Morgan'}</h2>
                        <h4 style={{ fontSize: 'var(--cv-font-subtitle)' }} className="font-bold text-sky-600 uppercase tracking-widest">{cvData.profession || 'Product Manager'}</h4>
                        <div style={{ fontSize: 'var(--cv-font-meta)' }} className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-slate-505 font-semibold">
                          {cvData.email && <span>{cvData.email}</span>}
                          {cvData.phone && <span>{cvData.phone}</span>}
                          {cvData.location && <span>{cvData.location}</span>}
                          {cvData.linkedin && <span className="text-sky-600">{cvData.linkedin}</span>}
                        </div>
                      </div>
                      {cvData.photo && (
                        <div className="w-16 h-16 overflow-hidden border border-slate-200 shrink-0">
                          <img src={cvData.photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {sectionOrder.map(secId => renderTemplateSection(secId, 'nordic'))}
                  </div>
                )}

                {/* TEMPLATE 8: MILANO IVORY ELEGANCE (PRO) */}
                {selectedTemplate === 'milano' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-section-gap)' }} className="text-center font-serif text-amber-950">
                    {/* Header */}
                    <div className="border-b-2 border-amber-600/30 pb-4 flex flex-col items-center gap-2">
                      {cvData.photo && (
                        <div className="w-16 h-16 overflow-hidden border border-amber-600/40 rounded-full mb-1 shrink-0">
                          <img src={cvData.photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <h2 style={{ fontSize: 'var(--cv-font-title)' }} className="font-bold tracking-wide text-amber-900 uppercase">{cvData.fullName || 'Alex Morgan'}</h2>
                      <h4 style={{ fontSize: 'var(--cv-font-subtitle)' }} className="font-bold text-amber-700 italic tracking-widest uppercase">{cvData.profession || 'Product Manager'}</h4>
                      <div style={{ fontSize: 'var(--cv-font-meta)' }} className="flex justify-center flex-wrap gap-x-4 gap-y-1 font-bold text-amber-800/80">
                        {cvData.email && <span>{cvData.email}</span>}
                        {cvData.phone && <span>{cvData.phone}</span>}
                        {cvData.location && <span>{cvData.location}</span>}
                        {cvData.linkedin && <span>{cvData.linkedin}</span>}
                      </div>
                    </div>

                    {sectionOrder.map(secId => renderTemplateSection(secId, 'milano'))}
                  </div>
                )}

                {/* TEMPLATE 9: ONYX LUXURY (PRO) */}
                {selectedTemplate === 'onyx' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cv-section-gap)' }} className="text-left font-serif text-slate-800">
                    {/* Header */}
                    <div className="bg-[#0f172a] text-white p-6 rounded-xl flex items-center justify-between gap-4 border-b-4 border-amber-500">
                      <div>
                        <h2 style={{ fontSize: 'var(--cv-font-title)', color: '#f59e0b' }} className="font-bold tracking-wide uppercase mb-1">{cvData.fullName || 'Alex Morgan'}</h2>
                        <h4 style={{ fontSize: 'var(--cv-font-subtitle)' }} className="font-bold text-slate-300 uppercase tracking-widest">{cvData.profession || 'Product Manager'}</h4>
                        <div style={{ fontSize: 'var(--cv-font-meta)' }} className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-slate-400 font-semibold">
                          {cvData.email && <span>{cvData.email}</span>}
                          {cvData.phone && <span>{cvData.phone}</span>}
                          {cvData.location && <span>{cvData.location}</span>}
                          {cvData.linkedin && <span className="text-amber-400">{cvData.linkedin}</span>}
                        </div>
                      </div>
                      {cvData.photo && (
                        <div className="w-16 h-16 overflow-hidden border-2 border-amber-500 rounded-full shrink-0">
                          <img src={cvData.photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {sectionOrder.map(secId => renderTemplateSection(secId, 'onyx'))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
