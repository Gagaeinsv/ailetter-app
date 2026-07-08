// src/components/dashboard/CVOptimizerTab.jsx
import React, { useState } from 'react';
import { Sparkles, Copy, Check, AlertCircle, FileText, CheckCircle2, Award, Download, ClipboardList } from 'lucide-react';
import { analyzeCV, parseCV } from '../../gemini';
import html2pdf from 'html2pdf.js';

export default function CVOptimizerTab({
  contactInfo,
  jobDescription,
  setJobDescription,
  cvAnalysis,
  setCvAnalysis,
  cvAnalysisLoading,
  setCvAnalysisLoading,
  dict,
  showNotification,
  isPro,
  setShowUpgrade,
  ...props
}) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [jdOpen, setJdOpen] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPdf(true);
    setCvAnalysisLoading(true);
    showNotification('Uploading and parsing CV PDF...');

    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const cvFilePart = {
        inlineData: { data: base64Data, mimeType: file.type }
      };

      const parsedData = await parseCV(cvFilePart);
      if (!parsedData || !parsedData.skills) {
        throw new Error("Invalid parse response");
      }

      if (props.setFileName) props.setFileName(file.name);
      if (props.setCvFile) props.setCvFile(cvFilePart);
      if (props.addSavedCv) props.addSavedCv(cvFilePart, file.name, parsedData);
      
      const updatedProfile = { ...contactInfo, ...parsedData };
      if (props.setContactInfo) props.setContactInfo(updatedProfile);
      if (props.saveProfile) {
        await props.saveProfile(updatedProfile);
      }

      showNotification('CV successfully parsed ✓');

      if (jobDescription && jobDescription.trim().length > 10) {
        showNotification('Analyzing CV against Job Description...');
        const result = await analyzeCV(updatedProfile, jobDescription);
        setCvAnalysis(result);
        showNotification('CV optimized successfully! ✓');
      }
    } catch (err) {
      console.error("PDF upload failed:", err);
      showNotification('Parsing failed — try another PDF');
    } finally {
      setUploadingPdf(false);
      setCvAnalysisLoading(false);
    }
  };

  const hasCv = contactInfo && (contactInfo.skills?.length > 0 || contactInfo.experience?.length > 0);
  const hasJd = jobDescription && jobDescription.trim().length > 10;

  const handleAnalyze = async () => {
    if (!hasCv || !hasJd) return;
    setCvAnalysisLoading(true);
    try {
      const result = await analyzeCV(contactInfo, jobDescription);
      setCvAnalysis(result);
      showNotification('CV optimized successfully! ✓');
    } catch (err) {
      console.error(err);
      alert('AI is busy. Please try again.');
    } finally {
      setCvAnalysisLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    showNotification('Copied bullet point! ✓');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopyAll = () => {
    if (!cvAnalysis?.bulletPoints?.length) return;
    const text = cvAnalysis.bulletPoints.map(bp => `• ${bp.optimized}`).join('\n');
    navigator.clipboard.writeText(text);
    showNotification(dict.copyAllSuccess || 'All achievements copied! ✓');
  };

  const handleExportPDF = () => {
    if (!cvAnalysis) return;
    const element = document.createElement('div');
    element.style.padding = '20mm 15mm';
    element.style.color = '#1e293b';
    element.style.fontFamily = 'Calibri, sans-serif';
    element.style.lineHeight = '1.6';
    element.style.fontSize = '12px';
    element.style.background = '#ffffff';

    const header = document.createElement('div');
    header.style.borderBottom = '2px solid #6366f1';
    header.style.paddingBottom = '10px';
    header.style.marginBottom = '20px';
    header.innerHTML = `
      <h1 style="margin: 0; font-size: 24px; color: #6366f1; font-weight: 800; text-transform: uppercase;">${contactInfo.fullName || 'User'}</h1>
      <p style="margin: 5px 0 0 0; font-size: 13px; font-weight: bold; color: #475569;">${contactInfo.profession || 'Resume Profile'}</p>
      <p style="margin: 5px 0 0 0; font-size: 10px; color: #64748b;">
        ${[contactInfo.email ? `✉ ${contactInfo.email}` : '', contactInfo.phone ? `📞 ${contactInfo.phone}` : '', contactInfo.location ? `📍 ${contactInfo.location}` : '', contactInfo.linkedin ? `🔗 ${contactInfo.linkedin}` : ''].filter(Boolean).join('  ·  ')}
      </p>
    `;
    element.appendChild(header);

    if (contactInfo.skills) {
      const skillsSec = document.createElement('div');
      skillsSec.style.marginBottom = '20px';
      const skillsList = Array.isArray(contactInfo.skills) ? contactInfo.skills.join(', ') : contactInfo.skills;
      skillsSec.innerHTML = `
        <h2 style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #6366f1; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">Key Skills</h2>
        <p style="margin: 0; font-size: 10.5px; color: #334155;">${skillsList}</p>
      `;
      element.appendChild(skillsSec);
    }

    const expSec = document.createElement('div');
    expSec.style.marginBottom = '20px';
    let achievementsHtml = '';
    if (cvAnalysis.bulletPoints && cvAnalysis.bulletPoints.length > 0) {
      achievementsHtml = `<ul style="margin: 0; padding-left: 20px; list-style-type: disc;">`;
      cvAnalysis.bulletPoints.forEach(bp => {
        achievementsHtml += `<li style="margin-bottom: 8px; font-size: 10.5px; color: #1e293b; text-align: justify; font-weight: 500;">${bp.optimized}</li>`;
      });
      achievementsHtml += `</ul>`;
    } else {
      achievementsHtml = `<p style="margin: 0; font-style: italic; color: #64748b;">No optimized achievements available.</p>`;
    }
    expSec.innerHTML = `
      <h2 style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #6366f1; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px;">Optimized Work Achievements</h2>
      ${achievementsHtml}
    `;
    element.appendChild(expSec);

    if (cvAnalysis.tips && cvAnalysis.tips.length > 0) {
      const tipsSec = document.createElement('div');
      tipsSec.style.marginTop = '30px';
      tipsSec.style.padding = '10px 15px';
      tipsSec.style.background = '#f8fafc';
      tipsSec.style.border = '1px solid #e2e8f0';
      tipsSec.style.borderRadius = '8px';
      let tipsList = '<ul style="margin: 0; padding-left: 15px; list-style-type: decimal;">';
      cvAnalysis.tips.slice(0, 3).forEach(tip => {
        tipsList += `<li style="margin-bottom: 4px; font-size: 9.5px; color: #475569;">${tip}</li>`;
      });
      tipsList += '</ul>';
      tipsSec.innerHTML = `
        <h3 style="margin: 0 0 6px 0; font-size: 9px; text-transform: uppercase; font-weight: bold; color: #64748b;">ATS Compliance Suggestions</h3>
        ${tipsList}
      `;
      element.appendChild(tipsSec);
    }

    const opt = {
      margin: 0,
      filename: `${contactInfo.fullName?.replace(/\s+/g, '_') || 'Resume'}_Optimized.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
    showNotification('CV PDF exported successfully! ✓');
  };

  // Helper for Circular progress dial
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = cvAnalysis
    ? circumference - (cvAnalysis.atsScore / 100) * circumference
    : circumference;

  const getScoreColor = (score) => {
    if (score >= 75) return 'stroke-emerald-400 text-emerald-400';
    if (score >= 50) return 'stroke-amber-400 text-amber-400';
    return 'stroke-rose-400 text-rose-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return dict.atsGreat || 'Excellent Match';
    if (score >= 50) return dict.atsFair || 'Fair Match';
    return dict.atsWeak || 'Weak Match';
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#0f172a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <Award className="text-[#6366f1] w-7 h-7" />
            {dict.cvOptimizerTitle || 'ATS CV Reviewer & Optimizer'}
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            {dict.cvOptimizerDesc || 'Optimize your resume achievements and keywords to pass recruitment screening.'}
          </p>
        </div>

        {hasCv && hasJd && !cvAnalysisLoading && (
          <div className="flex gap-3">
            <label className="px-4 py-2.5 bg-[#1e293b] hover:bg-slate-800 border border-[#334155] text-slate-300 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]">
              <FileText className="w-4 h-4" />
              Upload CV PDF
              <input type="file" className="hidden" accept=".pdf" onChange={handlePdfUpload} />
            </label>
            <button
              onClick={handleAnalyze}
              className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#5458ee] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-[#6366f1]/20 active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              {cvAnalysis ? (dict.atsRetry || 'Re-Analyze') : (dict.cvOptimizerAnalyze || 'Analyze CV')}
            </button>
          </div>
        )}
      </div>

      {props.savedCvs && props.savedCvs.length > 0 && (
        <div className="bg-[#1e293b]/70 p-4 rounded-2xl border border-[#334155]/50 flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <FileText className="text-[#6366f1] w-4 h-4" />
            <span className="text-xs font-bold text-slate-300">{dict.activeCv || 'Active Resume:'}</span>
            {props.fileName ? (
              <span className="text-xs font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-[200px]">
                {props.fileName}
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-400">None</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={props.savedCvs.find(c => c.fileName === props.fileName)?.id || ''}
              onChange={(e) => {
                const selected = props.savedCvs.find(c => c.id === e.target.value);
                if (selected && props.handleSelectSavedCv) {
                  props.handleSelectSavedCv(selected);
                }
              }}
              className="text-xs font-bold bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-white outline-none cursor-pointer hover:border-indigo-500 transition-colors"
            >
              <option value="" disabled>-- Switch Resume --</option>
              {props.savedCvs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fileName}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const currentId = props.savedCvs.find(c => c.fileName === props.fileName)?.id;
                if (currentId && props.handleDeleteSavedCv) {
                  props.handleDeleteSavedCv(currentId);
                }
              }}
              disabled={!props.fileName}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              title="Delete saved resume"
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* Warnings & Setup */}
      {(!hasCv || !hasJd) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border ${hasCv ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 'border-rose-500/10 bg-rose-500/[0.02]'} flex items-start gap-4`}>
            {hasCv ? (
              <CheckCircle2 className="text-emerald-400 w-6 h-6 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="text-rose-400 w-6 h-6 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold text-sm text-white">{dict.cvSection || 'CV Profile'}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {hasCv
                    ? 'CV profile loaded successfully from your settings. Ready to scan.'
                    : (dict.cvOptimizerNoCv || 'Please upload your CV here or in the Create tab to evaluate it.')}
                </p>
              </div>
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6366f1] hover:bg-[#5458ee] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-md active:scale-95 w-fit">
                <FileText size={14} />
                {hasCv ? 'Upload different CV PDF' : 'Upload CV PDF'}
                <input type="file" className="hidden" accept=".pdf" onChange={handlePdfUpload} />
              </label>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${hasJd ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 'border-rose-500/10 bg-rose-500/[0.02]'} flex flex-col gap-4`}>
            <div className="flex items-start gap-4">
              {hasJd ? (
                <CheckCircle2 className="text-emerald-400 w-6 h-6 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="text-rose-400 w-6 h-6 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="font-bold text-sm text-white">{dict.jobSection || 'Job Description'}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {hasJd
                    ? 'Job description loaded. Edit it below if needed.'
                    : 'Paste the target job description details below to analyze match score.'}
                </p>
              </div>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={dict.jobPlaceholder || "Paste job description here..."}
              className="w-full h-32 bg-[#0f172a]/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {cvAnalysisLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="w-full h-44 bg-[#1e293b]/40 rounded-2xl border border-white/5" />
            <div className="w-full h-44 bg-[#1e293b]/40 rounded-2xl border border-white/5 lg:col-span-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full h-48 bg-[#1e293b]/40 rounded-2xl border border-white/5" />
            <div className="w-full h-48 bg-[#1e293b]/40 rounded-2xl border border-white/5" />
          </div>
          <div className="w-full h-64 bg-[#1e293b]/40 rounded-2xl border border-white/5" />
        </div>
      )}

      {/* Empty State (Ready to Scan) */}
      {!cvAnalysis && !cvAnalysisLoading && hasCv && hasJd && (
        <div className="flex flex-col items-center justify-center p-16 rounded-2xl border border-dashed border-[#334155] bg-[#1e293b]/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl mb-4">📊</div>
          <h2 className="font-black text-base text-white">Compare your CV to the Job Requirements</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Our ATS Reviewer evaluates your profile skills and experience against the requirements. Click below to start.
          </p>
          <button
            onClick={handleAnalyze}
            className="mt-6 px-6 py-3 bg-[#6366f1] hover:bg-[#5458ee] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-[#6366f1]/20 active:scale-[0.98]"
          >
            <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            {dict.cvOptimizerAnalyze || 'Analyze CV'}
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {cvAnalysis && !cvAnalysisLoading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Loaded CV Profile */}
          <div className="bg-[#1e293b]/30 rounded-2xl border border-white/5 p-6 space-y-6 h-fit xl:sticky xl:top-0">
            {/* Target Job Description Collapsible Panel */}
            <div className="border border-white/5 bg-[#0f172a]/30 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setJdOpen(!jdOpen)}
                className="w-full flex items-center justify-between p-3.5 text-left font-bold text-xs uppercase tracking-widest text-indigo-400 hover:bg-white/[0.02] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span>💼</span>
                  <span>{dict.jobSection || 'Job Description'}</span>
                </div>
                <span className="text-gray-500 text-[10px]">{jdOpen ? '✕' : '▼'}</span>
              </button>
              {jdOpen && (
                <div className="p-3.5 border-t border-white/5 space-y-3">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder={dict.jobPlaceholder || "Paste job description here..."}
                    className="w-full h-32 bg-[#0f172a]/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                  <button
                    onClick={handleAnalyze}
                    className="w-full py-2 bg-[#6366f1] hover:bg-[#5458ee] rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/15"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {dict.atsRetry || 'Re-Analyze'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6366f1] block">
                {dict.cvProfileTitle || 'Loaded CV Profile'}
              </span>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {dict.cvProfileDesc || 'Resume data currently analyzed.'}
              </p>
            </div>

            {/* General Info */}
            <div className="p-4 bg-[#0f172a]/40 border border-white/5 rounded-xl space-y-2">
              <div>
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Candidate Name</span>
                <p className="text-xs font-bold text-white">{contactInfo.fullName || 'User'}</p>
              </div>
              {contactInfo.profession && (
                <div>
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Profession</span>
                  <p className="text-xs font-bold text-white">{contactInfo.profession}</p>
                </div>
              )}
              {(contactInfo.email || contactInfo.phone || contactInfo.location) && (
                <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[11px] text-gray-400">
                  {contactInfo.email && <div className="truncate">✉ {contactInfo.email}</div>}
                  {contactInfo.phone && <div>📞 {contactInfo.phone}</div>}
                  {contactInfo.location && <div className="truncate">📍 {contactInfo.location}</div>}
                </div>
              )}
            </div>

            {/* Skills */}
            {contactInfo.skills?.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {contactInfo.skills.map((s, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2.5 py-1 rounded bg-[#0f172a]/55 text-slate-300 border border-white/5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : contactInfo.skills ? (
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Skills</span>
                <p className="text-xs text-gray-300 leading-normal">{contactInfo.skills}</p>
              </div>
            ) : null}

            {/* Work Experience */}
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Work Experience</span>
              {Array.isArray(contactInfo.experience) && contactInfo.experience.length > 0 ? (
                <div className="space-y-4">
                  {contactInfo.experience.map((job, idx) => (
                    <div key={idx} className="border-l-2 border-indigo-500/30 pl-3.5 py-0.5 space-y-1">
                      <h4 className="font-bold text-xs text-white leading-tight">{job.title}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold">{job.company} {job.duration ? `(${job.duration})` : ''}</p>
                      {job.achievements?.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-[10px] text-gray-300 pl-1">
                          {job.achievements.map((ach, aIdx) => (
                            <li key={aIdx} className="leading-relaxed">
                              {ach}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : typeof contactInfo.experience === 'string' && contactInfo.experience.trim() ? (
                <p className="text-xs text-gray-300 whitespace-pre-wrap">{contactInfo.experience}</p>
              ) : (
                <p className="text-[10px] text-gray-500 italic">No structured experience found. achievements list is empty.</p>
              )}
            </div>
          </div>

          {/* Right Column: ATS Optimization Results */}
          <div className="xl:col-span-2 space-y-6">
            {/* Top Row: Score + Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score circle */}
              <div className="bg-[#1e293b]/30 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                  {dict.cvOptimizerScore || 'ATS Match Score'}
                </span>

                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      className="stroke-[#334155]"
                      strokeWidth={stroke}
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius + stroke}
                      cy={radius + stroke}
                    />
                    <circle
                      className={`transition-all duration-1000 ease-out ${getScoreColor(cvAnalysis.atsScore)}`}
                      strokeWidth={stroke}
                      strokeDasharray={circumference + ' ' + circumference}
                      style={{ strokeDashoffset }}
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius + stroke}
                      cy={radius + stroke}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={`text-3xl font-black ${getScoreColor(cvAnalysis.atsScore).split(' ')[1]}`}>
                      {cvAnalysis.atsScore}%
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-black uppercase tracking-widest mt-4 ${getScoreColor(cvAnalysis.atsScore).split(' ')[1]}`}>
                  {getScoreLabel(cvAnalysis.atsScore)}
                </span>
              </div>

              {/* Breakdown bars */}
              <div className="bg-[#1e293b]/30 rounded-2xl border border-white/5 p-6 flex flex-col justify-between lg:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 block">
                  ATS Breakdown Evaluation
                </span>

                <div className="space-y-4">
                  {[
                    { label: dict.cvOptimizerKeywords || 'Keywords Match', score: cvAnalysis.atsBreakdown.keywords, color: 'bg-emerald-400 shadow-emerald-400/25' },
                    { label: dict.cvOptimizerMetrics || 'Impact & Metrics', score: cvAnalysis.atsBreakdown.metrics, color: 'bg-[#6366f1] shadow-indigo-500/25' },
                    { label: dict.cvOptimizerStructure || 'Structure & Format', score: cvAnalysis.atsBreakdown.structure, color: 'bg-purple-400 shadow-purple-500/25' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                        <span>{item.label}</span>
                        <span>{item.score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 shadow-md ${item.color}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Row: Checklist + Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Checklist */}
              <div className="bg-[#1e293b]/30 rounded-2xl border border-white/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="text-[#6366f1] w-4.5 h-4.5" />
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-300">
                    {dict.cvOptimizerTips || 'Actionable CV Checklist'}
                  </h3>
                </div>

                <div className="space-y-3">
                  {cvAnalysis.tips?.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 bg-[#0f172a]/30 border border-white/5 rounded-xl">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-[10px] text-indigo-300 font-black shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-gray-200 leading-relaxed font-semibold">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-[#1e293b]/30 rounded-2xl border border-white/5 p-6 space-y-4">
                {/* Matched */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400/90 mb-2">
                    {dict.atsMatched || '✓ Matched Keywords'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {cvAnalysis.matchedKeywords?.length > 0 ? (
                      cvAnalysis.matchedKeywords.map((k) => (
                        <span key={k} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 transition-all duration-200 hover:scale-105 cursor-default">
                          {k}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">No exact matched terms found.</span>
                    )}
                  </div>
                </div>

                {/* Missing */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-2">
                    {dict.atsMissing || '⚠ Missing Keywords'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {cvAnalysis.missingKeywords?.length > 0 ? (
                      cvAnalysis.missingKeywords.map((k) => (
                        <span key={k} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 transition-all duration-200 hover:scale-105 cursor-default">
                          {k}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-400 italic">Excellent! No missing hard requirements detected.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: AI Bullet Point Optimizer */}
            <div className="bg-[#1e293b]/30 rounded-2xl border border-white/5 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-300 flex items-center gap-2">
                    <Sparkles className="text-amber-400 w-4.5 h-4.5" />
                    {dict.cvOptimizerOptimizedBullets || 'AI-Optimized Bullet Points'}
                  </h3>
                  <p className="text-gray-500 text-[10px] mt-0.5">
                    Enhance your resume achievements with action verbs and target metrics.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyAll}
                    className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] border border-white/5 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-[0.98]"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    {dict.copyAll || 'Copy All'}
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-md shadow-indigo-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {dict.exportPdf || 'Export CV PDF'}
                  </button>
                </div>
              </div>

              {cvAnalysis.bulletPoints?.length > 0 ? (
                <div className="space-y-4">
                  {cvAnalysis.bulletPoints.map((bp, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-white/5 bg-[#0f172a]/20">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                          {dict.cvOptimizerOriginal || 'Original Achievement'}
                        </span>
                        <p className="text-xs text-gray-400 leading-relaxed italic">
                          "{bp.original}"
                        </p>
                      </div>

                      <div className="space-y-1 md:border-l md:border-white/5 md:pl-4 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#6366f1]">
                            {dict.cvOptimizerOptimized || 'ATS-Optimized'}
                          </span>
                          <p className="text-xs text-white leading-relaxed font-semibold">
                            {bp.optimized}
                          </p>
                        </div>

                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => handleCopy(bp.optimized, idx)}
                            className="px-3 py-1.5 bg-[#334155] hover:bg-[#475569] text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                          >
                            {copiedIdx === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            {copiedIdx === idx ? (dict.copied || 'Copied!') : (dict.copyText || 'Copy')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs italic">
                  AI could not optimize any bullet points. Ensure your experience fields contain text achievements.
                </div>
              )}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
