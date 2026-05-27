// src/components/dashboard/CVOptimizerTab.jsx
import React, { useState } from 'react';
import { Sparkles, Copy, Check, AlertCircle, FileText, CheckCircle2, Award } from 'lucide-react';
import { analyzeCV } from '../../gemini';

export default function CVOptimizerTab({
  contactInfo,
  jobDescription,
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
    <div className="absolute inset-0 overflow-y-auto p-8 custom-scrollbar bg-[#0f172a] text-white">
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
          <button
            onClick={handleAnalyze}
            className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#5458ee] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-[#6366f1]/20 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            {cvAnalysis ? (dict.atsRetry || 'Re-Analyze') : (dict.cvOptimizerAnalyze || 'Analyze CV')}
          </button>
        )}
      </div>

      {/* Warnings & Setup */}
      {(!hasCv || !hasJd) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border ${hasCv ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 'border-rose-500/10 bg-rose-500/[0.02]'} flex items-start gap-4`}>
            {hasCv ? (
              <CheckCircle2 className="text-emerald-400 w-6 h-6 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="text-rose-400 w-6 h-6 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-sm text-white">{dict.cvSection || 'CV Profile'}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {hasCv
                  ? 'CV profile loaded successfully from your settings. Ready to scan.'
                  : (dict.cvOptimizerNoCv || 'Please upload your CV in the Create tab or complete onboarding first.')}
              </p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${hasJd ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 'border-rose-500/10 bg-rose-500/[0.02]'} flex items-start gap-4`}>
            {hasJd ? (
              <CheckCircle2 className="text-emerald-400 w-6 h-6 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="text-rose-400 w-6 h-6 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-sm text-white">{dict.jobSection || 'Job Description'}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {hasJd
                  ? 'Job description loaded from dashboard. Ready to scan.'
                  : (dict.cvOptimizerNoJd || 'Please paste a Job Description in the Dashboard tab first.')}
              </p>
            </div>
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
        <div className="space-y-6">
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
                      <span key={k} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
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
                      <span key={k} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
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
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="font-black text-xs uppercase tracking-widest text-gray-300 flex items-center gap-2">
                  <Sparkles className="text-amber-400 w-4.5 h-4.5" />
                  {dict.cvOptimizerOptimizedBullets || 'AI-Optimized Bullet Points'}
                </h3>
                <p className="text-gray-500 text-[10px] mt-0.5">
                  Enhance your resume achievements with action verbs and target metrics.
                </p>
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
      )}
    </div>
  );
}
