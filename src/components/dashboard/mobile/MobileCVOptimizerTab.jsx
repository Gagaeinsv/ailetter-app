// src/components/dashboard/mobile/MobileCVOptimizerTab.jsx
import React, { useState } from 'react';
import { Sparkles, Copy, Check, AlertCircle, FileText, CheckCircle2, Award } from 'lucide-react';
import { analyzeCV } from '../../../gemini';

export default function MobileCVOptimizerTab({
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
}) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [jdOpen, setJdOpen] = useState(false);

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
    <div className="h-full overflow-y-auto bg-[#0f172a] px-4 py-6 pb-24 custom-scrollbar text-white">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Award className="text-[#6366f1] w-6 h-6 shrink-0" />
          <h2 className="text-xl font-black text-white tracking-tight">
            {dict.cvOptimizerTitle || 'ATS CV Reviewer & Optimizer'}
          </h2>
        </div>
        <p className="text-[11px] text-gray-400 leading-normal">
          {dict.cvOptimizerDesc || 'Optimize your resume achievements and keywords to pass recruitment screening.'}
        </p>

        {hasCv && hasJd && !cvAnalysisLoading && (
          <button
            onClick={handleAnalyze}
            className="w-full mt-3 py-3 bg-[#6366f1] hover:bg-[#5458ee] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#6366f1]/20"
          >
            <Sparkles className="w-4 h-4" />
            {cvAnalysis ? (dict.atsRetry || 'Re-Analyze') : (dict.cvOptimizerAnalyze || 'Analyze CV')}
          </button>
        )}
      </div>

      {/* Warnings & Setup */}
      {(!hasCv || !hasJd) && (
        <div className="flex flex-col gap-4 mb-6">
          <div className={`p-4 rounded-xl border ${hasCv ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 'border-rose-500/10 bg-rose-500/[0.02]'} flex items-start gap-3`}>
            {hasCv ? (
              <CheckCircle2 className="text-emerald-400 w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="text-rose-400 w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-xs text-white">{dict.cvSection || 'CV Profile'}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {hasCv
                  ? 'CV profile loaded successfully from your settings. Ready to scan.'
                  : (dict.cvOptimizerNoCv || 'Please upload your CV in the Create tab or complete onboarding first.')}
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${hasJd ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 'border-rose-500/10 bg-rose-500/[0.02]'} flex flex-col gap-3`}>
            <div className="flex items-start gap-3">
              {hasJd ? (
                <CheckCircle2 className="text-emerald-400 w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="text-rose-400 w-5 h-5 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="font-bold text-xs text-white">{dict.jobSection || 'Job Description'}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
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
        <div className="space-y-4 animate-pulse mb-6">
          <div className="w-full h-36 bg-[#1e293b]/40 rounded-xl border border-white/5" />
          <div className="w-full h-44 bg-[#1e293b]/40 rounded-xl border border-white/5" />
          <div className="w-full h-48 bg-[#1e293b]/40 rounded-xl border border-white/5" />
        </div>
      )}

      {/* Empty State (Ready to Scan) */}
      {!cvAnalysis && !cvAnalysisLoading && hasCv && hasJd && (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[#334155] bg-[#1e293b]/10 text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mb-3">📊</div>
          <h3 className="font-bold text-sm text-white">Compare your CV to the Job Requirements</h3>
          <p className="text-[11px] text-gray-400 mt-1 max-w-xs leading-relaxed">
            Our ATS Reviewer evaluates your profile skills and experience against the requirements. Click below to start.
          </p>
          <button
            onClick={handleAnalyze}
            className="w-full mt-5 py-3 bg-[#6366f1] hover:bg-[#5458ee] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#6366f1]/20"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            {dict.cvOptimizerAnalyze || 'Analyze CV'}
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {cvAnalysis && !cvAnalysisLoading && (
        <div className="space-y-4 mb-6">
          {/* Target Job Description Collapsible Panel */}
          <div className="bg-[#1e293b]/30 rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => setJdOpen(o => !o)}
              className="w-full flex items-center justify-between p-4 text-left font-black text-xs uppercase tracking-widest text-indigo-400"
            >
              <div className="flex items-center gap-2">
                <span>💼</span>
                <span>{dict.jobSection || 'Job Description'}</span>
              </div>
              <span className="text-gray-500 text-[10px]">{jdOpen ? '✕' : '▼'}</span>
            </button>

            {jdOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder={dict.jobPlaceholder || "Paste job description here..."}
                  className="w-full h-32 bg-[#0f172a]/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
                <button
                  onClick={handleAnalyze}
                  className="w-full py-2.5 bg-[#6366f1] hover:bg-[#5458ee] text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/15"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {dict.atsRetry || 'Re-Analyze'}
                </button>
              </div>
            )}
          </div>

          {/* Collapsible Loaded CV Profile */}
          <div className="bg-[#1e293b]/30 rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="w-full flex items-center justify-between p-4 text-left font-black text-xs uppercase tracking-widest text-indigo-400"
            >
              <div className="flex items-center gap-2">
                <span>📄</span>
                <span>{dict.cvProfileTitle || 'Loaded CV Profile'}</span>
              </div>
              <span className="text-gray-500 text-[10px]">{profileOpen ? '✕' : '▼'}</span>
            </button>

            {profileOpen && (
              <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-3">
                {/* General Info */}
                <div className="p-3 bg-[#0f172a]/40 border border-white/5 rounded-lg space-y-2">
                  <div>
                    <span className="text-[7px] font-black uppercase tracking-wider text-slate-500">Candidate Name</span>
                    <p className="text-[11px] font-bold text-white">{contactInfo.fullName || 'User'}</p>
                  </div>
                  {contactInfo.profession && (
                    <div>
                      <span className="text-[7px] font-black uppercase tracking-wider text-slate-500">Profession</span>
                      <p className="text-[11px] font-bold text-white">{contactInfo.profession}</p>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {contactInfo.skills?.length > 0 ? (
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {contactInfo.skills.map((s, idx) => (
                        <span key={idx} className="text-[9px] font-semibold px-2 py-0.5 rounded bg-[#0f172a]/55 text-slate-300 border border-white/5">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : contactInfo.skills ? (
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Skills</span>
                    <p className="text-[10px] text-gray-300 leading-normal">{contactInfo.skills}</p>
                  </div>
                ) : null}

                {/* Work Experience */}
                <div className="space-y-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Work Experience</span>
                  {Array.isArray(contactInfo.experience) && contactInfo.experience.length > 0 ? (
                    <div className="space-y-3">
                      {contactInfo.experience.map((job, idx) => (
                        <div key={idx} className="border-l border-indigo-500/30 pl-2.5 py-0.5 space-y-0.5">
                          <h4 className="font-bold text-[11px] text-white leading-tight">{job.title}</h4>
                          <p className="text-[9px] text-gray-400 font-semibold">{job.company} {job.duration ? `(${job.duration})` : ''}</p>
                          {job.achievements?.length > 0 && (
                            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-gray-300 pl-0.5">
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
                    <p className="text-[10px] text-gray-300 whitespace-pre-wrap">{contactInfo.experience}</p>
                  ) : (
                    <p className="text-[9px] text-gray-500 italic">No structured experience found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Score dial */}
          <div className="bg-[#1e293b]/30 rounded-xl border border-white/5 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">
              {dict.cvOptimizerScore || 'ATS Match Score'}
            </span>

            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
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
                <span className={`text-2xl font-black ${getScoreColor(cvAnalysis.atsScore).split(' ')[1]}`}>
                  {cvAnalysis.atsScore}%
                </span>
              </div>
            </div>

            <span className={`text-[10px] font-black uppercase tracking-widest mt-3 ${getScoreColor(cvAnalysis.atsScore).split(' ')[1]}`}>
              {getScoreLabel(cvAnalysis.atsScore)}
            </span>
          </div>

          {/* Breakdown bars */}
          <div className="bg-[#1e293b]/30 rounded-xl border border-white/5 p-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3 block">
              ATS Breakdown Evaluation
            </span>
            <div className="space-y-3">
              {[
                { label: dict.cvOptimizerKeywords || 'Keywords Match', score: cvAnalysis.atsBreakdown.keywords, color: 'bg-emerald-400 shadow-emerald-400/25' },
                { label: dict.cvOptimizerMetrics || 'Impact & Metrics', score: cvAnalysis.atsBreakdown.metrics, color: 'bg-[#6366f1] shadow-indigo-500/25' },
                { label: dict.cvOptimizerStructure || 'Structure & Format', score: cvAnalysis.atsBreakdown.structure, color: 'bg-purple-400 shadow-purple-500/25' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-300">
                    <span>{item.label}</span>
                    <span>{item.score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 shadow-md ${item.color}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords Matched & Missing */}
          <div className="bg-[#1e293b]/30 rounded-xl border border-white/5 p-4 space-y-4">
            <div>
              <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-400/90 mb-2">
                {dict.atsMatched || '✓ Matched Keywords'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {cvAnalysis.matchedKeywords?.length > 0 ? (
                  cvAnalysis.matchedKeywords.map((k) => (
                    <span key={k} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-gray-500 italic">No exact matched terms found.</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-[9px] font-black uppercase tracking-widest text-amber-400/90 mb-2">
                {dict.atsMissing || '⚠ Missing Keywords'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {cvAnalysis.missingKeywords?.length > 0 ? (
                  cvAnalysis.missingKeywords.map((k) => (
                    <span key={k} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-emerald-400 italic">Excellent! No missing hard requirements detected.</span>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Checklist */}
          <div className="bg-[#1e293b]/30 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-[#6366f1] w-4 h-4 shrink-0" />
              <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-300">
                {dict.cvOptimizerTips || 'Actionable CV Checklist'}
              </h3>
            </div>
            <div className="space-y-2">
              {cvAnalysis.tips?.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-[#0f172a]/30 border border-white/5 rounded-xl">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-[9px] text-indigo-300 font-black shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-[11px] text-gray-200 leading-relaxed font-semibold">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Bullet Point Optimizer */}
          <div className="bg-[#1e293b]/30 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-3">
              <Sparkles className="text-amber-400 w-4 h-4 shrink-0" />
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-300">
                  {dict.cvOptimizerOptimizedBullets || 'AI-Optimized Bullet Points'}
                </h3>
                <p className="text-gray-500 text-[9px] mt-0.5">
                  Enhance your resume achievements with action verbs and target metrics.
                </p>
              </div>
            </div>

            {cvAnalysis.bulletPoints?.length > 0 ? (
              <div className="space-y-3">
                {cvAnalysis.bulletPoints.map((bp, idx) => (
                  <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border border-white/5 bg-[#0f172a]/20">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">
                        {dict.cvOptimizerOriginal || 'Original Achievement'}
                      </span>
                      <p className="text-[11px] text-gray-400 leading-relaxed italic">
                        "{bp.original}"
                      </p>
                    </div>

                    <div className="space-y-0.5 pt-1.5 border-t border-white/5">
                      <span className="text-[8px] font-black uppercase tracking-wider text-[#6366f1]">
                        {dict.cvOptimizerOptimized || 'ATS-Optimized'}
                      </span>
                      <p className="text-[11px] text-white leading-relaxed font-semibold">
                        {bp.optimized}
                      </p>
                    </div>

                    <div className="flex justify-end mt-1">
                      <button
                        onClick={() => handleCopy(bp.optimized, idx)}
                        className="w-full py-2 bg-[#334155] hover:bg-[#475569] text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                      >
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copiedIdx === idx ? (dict.copied || 'Copied!') : (dict.copyText || 'Copy')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-[11px] italic">
                AI could not optimize any bullet points. Ensure experience fields contain text achievements.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
