// src/components/dashboard/CVMakerTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Plus, Trash2, FileText, Download, Briefcase, 
  GraduationCap, Award, Globe, User, Save, RefreshCw, Check, ArrowUp, ArrowDown 
} from 'lucide-react';
import { enhanceAchievement } from '../../gemini';
import html2pdf from 'html2pdf.js';

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
  fileName
}) {
  // --- Local states copy for active editing ---
  const [cvData, setCvData] = useState({
    fullName: '',
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
    certifications: []
  });

  const [activeSection, setActiveSection] = useState('personal'); // personal | experience | skills | education | misc
  const [selectedTemplate, setSelectedTemplate] = useState('modern'); // modern | classic | minimal
  const [aiLoadingIdx, setAiLoadingIdx] = useState(null); // tracking AI sparkles loading state
  const [pdfGenerating, setPdfGenerating] = useState(false);
  
  // New entry temp states
  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newCert, setNewCert] = useState('');

  const previewRef = useRef();

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
        certifications: Array.isArray(contactInfo.certifications) ? [...contactInfo.certifications] : []
      });
    }
  }, [contactInfo]);

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
  const handleExportPDF = () => {
    if (pdfGenerating) return;
    setPdfGenerating(true);
    showNotification('Preparing PDF for download...');

    const safeName = (cvData.fullName || '').trim().replace(/\s+/g, '_') || 'CV';

    const opt = {
      margin:       0,
      filename:     `Resume_${safeName}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .from(previewRef.current)
      .set(opt)
      .save()
      .then(() => {
        setPdfGenerating(false);
        showNotification('PDF downloaded successfully! ✓');
      })
      .catch((err) => {
        console.error("PDF generation error:", err);
        setPdfGenerating(false);
        alert('Failed to generate PDF');
      });
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
            
            {/* Section selector tabs */}
            <div className="flex flex-wrap gap-1 bg-[#1e293b] p-1 rounded-xl">
              {[
                { id: 'personal', label: 'Personal', icon: User },
                { id: 'experience', label: 'Experience', icon: Briefcase },
                { id: 'skills', label: 'Skills', icon: Award },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'misc', label: 'More', icon: Globe }
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
                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 mb-2">Personal Details</h3>
                
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

            {/* TAB CONTENT: EXPERIENCE */}
            {activeSection === 'experience' && (
              <div className="bg-[#1e293b]/50 border border-[#334155]/50 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400">Work Experience</h3>
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
                <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400">Education Details</h3>
                
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
            
            {/* Template Switcher */}
            <div className="bg-[#1e293b] p-3 rounded-2xl border border-[#334155]/50 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold text-slate-300">Choose Design Template:</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'modern', label: 'Modern Accent' },
                  { id: 'classic', label: 'Classic Executive' },
                  { id: 'minimal', label: 'Elegant Minimal' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTemplate === t.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-[#0f172a] text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Document sheet preview container */}
            <div className="bg-[#111827] border border-[#1e293b] rounded-3xl p-6 overflow-x-auto shadow-2xl flex justify-center custom-scrollbar">
              <div 
                ref={previewRef}
                className="w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-xl overflow-hidden print-page select-text relative"
                style={{
                  fontFamily: selectedTemplate === 'classic' ? 'Georgia, serif' : 'system-ui, -apple-system, sans-serif',
                  padding: '40px 48px',
                  boxSizing: 'border-box'
                }}
              >
                
                {/* TEMPLATE 1: MODERN ACCENT */}
                {selectedTemplate === 'modern' && (
                  <div className="space-y-6 text-left">
                    {/* Header */}
                    <div className="border-b-4 border-indigo-600 pb-4">
                      <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight leading-none mb-1">{cvData.fullName || 'Alex Morgan'}</h2>
                      <h4 className="text-sm font-extrabold text-indigo-600 uppercase tracking-wider mb-2">{cvData.profession || 'Product Manager'}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-500">
                        {cvData.email && <span>✉ {cvData.email}</span>}
                        {cvData.phone && <span>📞 {cvData.phone}</span>}
                        {cvData.location && <span>📍 {cvData.location}</span>}
                        {cvData.linkedin && <span className="text-indigo-600 font-semibold">{cvData.linkedin}</span>}
                      </div>
                    </div>

                    {/* Summary */}
                    {cvData.summary && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">Professional Summary</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{cvData.summary}</p>
                      </div>
                    )}

                    {/* Main experience and secondary sidebar grid */}
                    <div className="grid grid-cols-12 gap-8 pt-2">
                      {/* Left: Exp & Ed */}
                      <div className="col-span-8 space-y-6">
                        
                        {/* Work Exp */}
                        {cvData.experience.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 border-b border-slate-200 pb-1">Work Experience</h4>
                            <div className="space-y-4">
                              {cvData.experience.map((exp, idx) => (
                                <div key={idx} className="space-y-1.5">
                                  <div className="flex justify-between items-baseline">
                                    <h5 className="text-[12px] font-black text-slate-900">{exp.title}</h5>
                                    <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">{exp.duration}</span>
                                  </div>
                                  <h6 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider mt-0.5">{exp.company}</h6>
                                  <ul className="list-disc pl-4 space-y-1">
                                    {exp.achievements.map((ach, aIdx) => (
                                      ach.trim() && (
                                        <li key={aIdx} className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                                          {ach}
                                        </li>
                                      )
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {cvData.education && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 border-b border-slate-200 pb-1">Education</h4>
                            <p className="text-[10.5px] text-slate-600 leading-relaxed whitespace-pre-line font-medium">{cvData.education}</p>
                          </div>
                        )}

                      </div>

                      {/* Right Sidebar: Skills, Langs, Certs */}
                      <div className="col-span-4 space-y-6 border-l border-slate-100 pl-6">
                        
                        {/* Skills */}
                        {cvData.skills.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 border-b border-slate-200 pb-1">Skills</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {cvData.skills.map((skill, idx) => (
                                <span key={idx} className="text-[9.5px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Languages */}
                        {cvData.languages.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 border-b border-slate-200 pb-1">Languages</h4>
                            <ul className="space-y-1">
                              {cvData.languages.map((l, idx) => (
                                <li key={idx} className="text-[10px] font-bold text-slate-600">• {l}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Certs */}
                        {cvData.certifications.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 border-b border-slate-200 pb-1">Certifications</h4>
                            <ul className="space-y-1">
                              {cvData.certifications.map((c, idx) => (
                                <li key={idx} className="text-[9.5px] font-bold text-slate-600 leading-relaxed">• {c}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )}

                {/* TEMPLATE 2: CLASSIC EXECUTIVE */}
                {selectedTemplate === 'classic' && (
                  <div className="space-y-5 text-center">
                    {/* Header */}
                    <div className="space-y-2 border-b border-slate-300 pb-4">
                      <h2 className="text-2xl font-bold tracking-wide text-slate-950 uppercase">{cvData.fullName || 'Alex Morgan'}</h2>
                      <h4 className="text-xs font-bold text-slate-600 italic tracking-widest uppercase">{cvData.profession || 'Product Manager'}</h4>
                      <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-600">
                        {cvData.email && <span>✉ {cvData.email}</span>}
                        {cvData.phone && <span>📞 {cvData.phone}</span>}
                        {cvData.location && <span>📍 {cvData.location}</span>}
                        {cvData.linkedin && <span>{cvData.linkedin}</span>}
                      </div>
                    </div>

                    {/* Summary */}
                    {cvData.summary && (
                      <div className="space-y-1 text-left">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-0.5">Professional Summary</h4>
                        <p className="text-[11px] text-slate-700 leading-relaxed italic">{cvData.summary}</p>
                      </div>
                    )}

                    {/* Work Exp */}
                    {cvData.experience.length > 0 && (
                      <div className="space-y-3 text-left">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-0.5">Work Experience</h4>
                        <div className="space-y-3.5">
                          {cvData.experience.map((exp, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[11.5px] font-bold text-slate-900">{exp.title} | <span className="font-medium italic">{exp.company}</span></span>
                                <span className="text-[10px] font-bold text-slate-500">{exp.duration}</span>
                              </div>
                              <ul className="list-disc pl-4 space-y-0.5 mt-1">
                                {exp.achievements.map((ach, aIdx) => (
                                  ach.trim() && (
                                    <li key={aIdx} className="text-[10.5px] text-slate-700 leading-relaxed">
                                      {ach}
                                    </li>
                                  )
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {cvData.education && (
                      <div className="space-y-1 text-left">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-0.5">Education</h4>
                        <p className="text-[10.5px] text-slate-700 leading-relaxed whitespace-pre-line">{cvData.education}</p>
                      </div>
                    )}

                    {/* Skills Grid */}
                    {cvData.skills.length > 0 && (
                      <div className="space-y-1 text-left">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-0.5">Core Skills</h4>
                        <p className="text-[10.5px] text-slate-700 leading-relaxed">
                          {cvData.skills.join(' • ')}
                        </p>
                      </div>
                    )}

                    {/* Misc row */}
                    {(cvData.languages.length > 0 || cvData.certifications.length > 0) && (
                      <div className="grid grid-cols-2 gap-6 text-left pt-1">
                        {cvData.languages.length > 0 && (
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-0.5">Languages</h4>
                            <p className="text-[10px] text-slate-700">{cvData.languages.join(', ')}</p>
                          </div>
                        )}
                        {cvData.certifications.length > 0 && (
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-0.5">Certifications</h4>
                            <p className="text-[10px] text-slate-700 leading-relaxed">{cvData.certifications.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}

                {/* TEMPLATE 3: ELEGANT MINIMAL */}
                {selectedTemplate === 'minimal' && (
                  <div className="space-y-6 text-left">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-950">{cvData.fullName || 'Alex Morgan'}</h2>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">{cvData.profession || 'Product Manager'}</h4>
                      </div>
                      <div className="text-right text-[9.5px] font-bold text-slate-500 space-y-0.5">
                        {cvData.email && <div>{cvData.email}</div>}
                        {cvData.phone && <div>{cvData.phone}</div>}
                        {cvData.location && <div>{cvData.location}</div>}
                        {cvData.linkedin && <div className="text-indigo-600 font-semibold">{cvData.linkedin}</div>}
                      </div>
                    </div>

                    {/* Summary */}
                    {cvData.summary && (
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-950">Summary</h4>
                        <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">{cvData.summary}</p>
                      </div>
                    )}

                    {/* Work Exp */}
                    {cvData.experience.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-950 border-b border-slate-200 pb-0.5">Experience</h4>
                        <div className="space-y-4">
                          {cvData.experience.map((exp, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[11px] font-black text-slate-900">{exp.title}</span>
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{exp.duration}</span>
                              </div>
                              <div className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">{exp.company}</div>
                              <ul className="list-disc pl-4 space-y-1 mt-1">
                                {exp.achievements.map((ach, aIdx) => (
                                  ach.trim() && (
                                    <li key={aIdx} className="text-[10px] text-slate-600 leading-relaxed font-medium">
                                      {ach}
                                    </li>
                                  )
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {cvData.skills.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-950 border-b border-slate-200 pb-0.5">Skills</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {cvData.skills.map((skill, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-slate-600">
                              {skill}{idx < cvData.skills.length - 1 ? '  |' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ed, Lang, Certs Grid */}
                    <div className="grid grid-cols-3 gap-6 pt-1 border-t border-slate-100">
                      {/* Education */}
                      {cvData.education && (
                        <div className="col-span-1 space-y-1">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-950">Education</h4>
                          <p className="text-[9.5px] text-slate-600 leading-relaxed whitespace-pre-line font-medium">{cvData.education}</p>
                        </div>
                      )}
                      
                      {/* Languages */}
                      {cvData.languages.length > 0 && (
                        <div className="col-span-1 space-y-1">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-950">Languages</h4>
                          <ul className="space-y-0.5">
                            {cvData.languages.map((l, idx) => (
                              <li key={idx} className="text-[9.5px] font-bold text-slate-600">• {l}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Certs */}
                      {cvData.certifications.length > 0 && (
                        <div className="col-span-1 space-y-1">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-950">Certifications</h4>
                          <ul className="space-y-0.5">
                            {cvData.certifications.map((c, idx) => (
                              <li key={idx} className="text-[9.5px] font-bold text-slate-600 leading-normal">• {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

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
