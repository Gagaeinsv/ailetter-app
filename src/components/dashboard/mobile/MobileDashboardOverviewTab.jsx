import React, { useState } from 'react';
import { Sparkles, Clock, MessageSquare, XCircle, Calendar, Briefcase, FileText, CheckCircle2, Bell, ChevronLeft, ChevronRight, Plus, ArrowRight } from 'lucide-react';

export default function MobileDashboardOverviewTab({
  trackerJobs = [],
  history = [],
  setActiveTab,
  loadLetterFromHistory,
  dict = {},
  user = {},
  patchTrackerJob,
  removeTrackerJob,
  contactInfo = {},
  cvAnalysis = null,
  setTrackerFilter,
  setTrackerEditJob,
  setTrackerAddDate,
  followUpEntry,
  ...props
}) {
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [bellRead, setBellRead] = useState(false);

  // Aggregate Metrics
  const totalSent = trackerJobs.length;
  const pendingCount = trackerJobs.filter((j) => j.status === 'applied').length;
  const interviewCount = trackerJobs.filter((j) => j.status === 'interview').length;
  const rejectedCount = trackerJobs.filter((j) => j.status === 'rejected').length;

  // Calculate sent this week
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const sentThisWeek = trackerJobs.filter(j => {
    const jobTime = new Date(j.date).getTime();
    return jobTime >= oneWeekAgo;
  }).length;

  // Local Filter state
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);

  // Recent applications (3 on mobile)
  const recentJobs = [...trackerJobs]
    .sort((a, b) => Number(b.updatedAt || b.id) - Number(a.updatedAt || a.id))
    .slice(0, 3);

  const displayedJobs = recentJobs.filter(job => !selectedStatusFilter || job.status === selectedStatusFilter);

  // Dynamic Profile Completeness for AI Readiness
  let aiReadinessScore = 0;
  if (contactInfo?.fullName) aiReadinessScore += 15;
  if (contactInfo?.email || contactInfo?.phone) aiReadinessScore += 15;
  if (contactInfo?.profession) aiReadinessScore += 15;
  if (contactInfo?.skills && (contactInfo.skills.length > 0 || typeof contactInfo.skills === 'string')) aiReadinessScore += 25;
  if (contactInfo?.experience && (contactInfo.experience.length > 0 || typeof contactInfo.experience === 'string')) aiReadinessScore += 30;

  // Resume Health
  const overallScore = cvAnalysis?.atsScore ?? 0;
  const keywordsScore = cvAnalysis?.atsBreakdown?.keywords ?? 0;
  const formattingScore = cvAnalysis?.atsBreakdown?.structure ?? 0;
  const impactScore = cvAnalysis?.atsBreakdown?.metrics ?? 0;

  // Calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const emptyPads = Array.from({ length: (firstDayIndex + 6) % 7 });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedCalendarDay(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedCalendarDay(null);
  };

  // Calendar Popover State
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  const handleDayClick = (day) => {
    const pad = (num) => String(num).padStart(2, '0');
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    const dayJobs = trackerJobs.filter(j => j.date === dateStr);
    
    setSelectedCalendarDay({
      day,
      dateStr,
      jobs: dayJobs
    });
  };

  const STATUSES = [
    { key: 'applied', label: dict.trackerStatusApplied || 'Applied', color: '#6366f1' },
    { key: 'interview', label: dict.trackerStatusInterview || 'Interview', color: '#f59e0b' },
    { key: 'offer', label: dict.trackerStatusOffer || 'Offer', color: '#22c55e' },
    { key: 'rejected', label: dict.trackerStatusRejected || 'Rejected', color: '#ef4444' }
  ];

  const welcomeText = (dict.dbWelcome || "Hey, {{name}}! 👋").replace("{{name}}", user?.displayName || 'Job Hunter');

  const handleMetricToggle = (statusKey) => {
    if (selectedStatusFilter === statusKey) {
      setSelectedStatusFilter(null);
    } else {
      setSelectedStatusFilter(statusKey);
    }
  };

  const navigateToTrackerWithFilter = () => {
    if (setTrackerFilter) {
      setTrackerFilter(selectedStatusFilter || 'all');
    }
    setActiveTab('jobtracker');
  };

  const handleEditJob = (job) => {
    if (setTrackerEditJob) {
      setTrackerEditJob(job);
    }
    setActiveTab('jobtracker');
  };

  const handleAddJobForDate = (dateStr) => {
    if (setTrackerAddDate) {
      setTrackerAddDate(dateStr);
    }
    setActiveTab('jobtracker');
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] px-4 py-6 pb-24 custom-scrollbar text-white">
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-white">
              Hi, {user?.displayName || 'Job Hunter'}
            </h1>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              Targeting <span className="text-[#6366f1] font-black">{contactInfo?.profession || 'Manager'}</span> roles
            </p>
          </div>
          <div className="relative">
            <button 
              onClick={() => {
                setShowBellDropdown(!showBellDropdown);
                setBellRead(true);
              }}
              className="p-2 bg-[#1e293b] border border-[#334155] rounded-xl hover:border-slate-500 transition-colors relative"
            >
              <Bell size={14} className="text-slate-400" />
              {followUpEntry && !bellRead && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#6366f1] rounded-full animate-pulse" />
              )}
            </button>

            {showBellDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl p-4 z-50 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-[#334155] pb-2">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                    Notifications
                  </span>
                  <button 
                    onClick={() => setShowBellDropdown(false)}
                    className="text-[9px] text-slate-500 hover:text-white font-bold"
                  >
                    ✕ Close
                  </button>
                </div>

                {followUpEntry ? (
                  <div className="space-y-3 py-1">
                    <div className="flex items-start gap-2">
                      <span className="text-lg shrink-0 mt-0.5">⏰</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-bold text-xs">Time for a follow-up!</p>
                        <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                          You applied to <span className="text-indigo-300 font-bold">{followUpEntry.company}</span> 7+ days ago.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          setShowBellDropdown(false);
                          if (props.onFollowUp) props.onFollowUp(followUpEntry);
                        }}
                        className="w-full py-2 bg-[#6366f1] hover:bg-[#5458ee] text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all text-center"
                      >
                        Generate Follow-up
                      </button>
                      <button
                        onClick={() => {
                          if (props.markFollowUpSent) props.markFollowUpSent(followUpEntry.id);
                          setShowBellDropdown(false);
                        }}
                        className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-bold rounded-lg transition-all text-center"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-slate-500 text-xs">
                    No new notifications. You are all caught up! ✨
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card 1: Application Overview */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={12} className="text-indigo-400" />
              Overview
            </span>
            <span className="text-[10px] font-bold text-slate-500 cursor-default">+</span>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-white">{totalSent}</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">SENT</span>
            </div>
            <div className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-wider">
              +{sentThisWeek} this week
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#334155]/60">
            
            <button 
              onClick={() => handleMetricToggle('applied')}
              className={`border rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all ${
                selectedStatusFilter === 'applied'
                  ? 'bg-indigo-600/30 border-indigo-500 scale-[1.02]'
                  : 'bg-[#0f172a]/60 border-[#334155]/40'
              }`}
            >
              <Clock size={12} className="text-slate-500 mb-1" />
              <span className="text-base font-black text-white">{pendingCount}</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">Pending</span>
            </button>

            <button 
              onClick={() => handleMetricToggle('interview')}
              className={`border rounded-xl p-2.5 flex flex-col items-center justify-center text-center relative transition-all ${
                selectedStatusFilter === 'interview'
                  ? 'bg-indigo-600 border-indigo-400 scale-[1.02]'
                  : 'bg-white border-[#334155]'
              }`}
            >
              <span className="absolute top-1 right-1 w-1 h-1 bg-emerald-500 rounded-full" />
              <Calendar size={12} className={`${selectedStatusFilter === 'interview' ? 'text-white' : 'text-slate-900'} mb-1`} />
              <span className={`text-base font-black ${selectedStatusFilter === 'interview' ? 'text-white' : 'text-slate-950'}`}>{interviewCount}</span>
              <span className={`text-[8px] font-black ${selectedStatusFilter === 'interview' ? 'text-indigo-200' : 'text-slate-900'} uppercase tracking-wide`}>Interviews</span>
            </button>

            <button 
              onClick={() => handleMetricToggle('rejected')}
              className={`border rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all ${
                selectedStatusFilter === 'rejected'
                  ? 'bg-indigo-600/30 border-indigo-500 scale-[1.02]'
                  : 'bg-[#0f172a]/60 border-[#334155]/40'
              }`}
            >
              <XCircle size={12} className="text-slate-500 mb-1" />
              <span className="text-base font-black text-white">{rejectedCount}</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">Rejected</span>
            </button>

          </div>
        </div>

        {/* Card 2: AI Readiness */}
        <button 
          onClick={() => setActiveTab('settings')}
          className="w-full bg-[#1e293b] border border-[#334155] rounded-2xl p-5 space-y-4 shadow-md text-left block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-indigo-400" />
              AI Readiness
            </span>
            <span className="text-xs font-black text-emerald-400">{aiReadinessScore}%</span>
          </div>

          <div className="w-full bg-[#0f172a] h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000"
              style={{ width: `${aiReadinessScore}%` }}
            />
          </div>

          <div className="flex flex-col items-center justify-center text-center pt-2">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-1.5">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-black text-white text-xs">
              {aiReadinessScore === 100 ? "All Set!" : "In Progress"}
            </h3>
            <p className="text-slate-400 text-[10px] mt-0.5 max-w-[180px] leading-relaxed mb-2">
              {aiReadinessScore === 100 
                ? "Your AI profile is fully optimized."
                : "Complete your profile to maximize accuracy."}
            </p>
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
              Profile Settings ➔
            </span>
          </div>
        </button>

        {/* Card 3: Resume Health */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} className="text-indigo-400" />
              Resume Health
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">ATS Score</span>
          </div>

          <div className="flex items-center justify-between gap-4 cursor-pointer" onClick={() => setActiveTab('cv-optimizer')}>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-slate-300">Keywords: {keywordsScore}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                <span className="text-[10px] text-slate-300">Formatting: {formattingScore}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] text-slate-300">Impact: {impactScore}%</span>
              </div>
            </div>

            <div className="relative flex items-center justify-center w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="stroke-[#0f172a]"
                  strokeWidth="5"
                  fill="transparent"
                  r="24"
                  cx="32"
                  cy="32"
                />
                <circle
                  className="stroke-indigo-500 transition-all duration-1000"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 - (overallScore / 100) * (2 * Math.PI * 24)}
                  fill="transparent"
                  r="24"
                  cx="32"
                  cy="32"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute font-black text-xs text-white">
                {overallScore}%
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('cv-optimizer')}
            className="w-full py-2 bg-[#6366f1]/10 border border-[#6366f1]/20 hover:bg-[#6366f1]/20 text-[#a5b4fc] rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all text-center"
          >
            Optimize Resume
          </button>
        </div>

        {/* Card 4: Recent Applications */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#334155]/60 pb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                📋 Recent Applications
              </h3>
              {selectedStatusFilter && (
                <button
                  onClick={() => setSelectedStatusFilter(null)}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-0.5"
                >
                  {STATUSES.find(s => s.key === selectedStatusFilter)?.label} ✕
                </button>
              )}
            </div>
            <button
              onClick={navigateToTrackerWithFilter}
              className="text-[10px] font-bold text-indigo-400"
            >
              {dict.dbFullTracker || "Tracker"}
            </button>
          </div>

          <div className="space-y-2">
            {displayedJobs.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic py-2 text-center">
                {selectedStatusFilter ? "No matching applications." : (dict.dbNoApps || "No applications logged yet.")}
              </p>
            ) : (
              displayedJobs.map((job) => {
                const currentStatus = STATUSES.find(s => s.key === job.status) || STATUSES[0];
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-3 p-2 bg-[#0f172a]/40 border border-[#334155]/50 rounded-xl"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2 cursor-pointer" onClick={() => handleEditJob(job)}>
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400 uppercase text-[10px] shrink-0">
                        {job.company?.[0] || 'J'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate">{job.role}</p>
                        <p className="text-[10px] text-slate-400 truncate">{job.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {patchTrackerJob && (
                        <select
                          value={job.status}
                          onChange={(e) => patchTrackerJob(job.id, { status: e.target.value })}
                          className="text-[9px] font-bold bg-[#1e293b] border border-[#334155] rounded-lg px-1.5 py-1 outline-none cursor-pointer"
                          style={{ color: currentStatus.color }}
                        >
                          {STATUSES.map(s => (
                            <option key={s.key} value={s.key} className="bg-[#1e293b]">
                              {s.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {removeTrackerJob && (
                        <button
                          onClick={() => {
                            if (window.confirm(dict.deleteConfirm || 'Delete?')) {
                              removeTrackerJob(job.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-red-500/10 transition-all text-xs"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Card 5: Up Next Calendar */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#334155]/60 pb-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              📅 Up Next
            </h3>
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
              Calendar
            </span>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase text-white tracking-wider">
              {monthNames[month]} {year}
            </span>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-0.5 text-slate-400 hover:text-white rounded">
                <ChevronLeft size={12} />
              </button>
              <button onClick={nextMonth} className="p-0.5 text-slate-400 hover:text-white rounded">
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[8px] font-bold text-slate-500 uppercase">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {emptyPads.map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {daysArray.map(day => {
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              
              const pad = (num) => String(num).padStart(2, '0');
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const hasActivity = trackerJobs.some(j => j.date === dateStr);
              const isSelected = selectedCalendarDay?.day === day;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`h-5 w-full flex items-center justify-center rounded text-[9px] font-black transition-all relative ${
                    isToday 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                      : isSelected
                        ? 'bg-[#6366f1]/20 border border-indigo-400 text-white'
                        : hasActivity
                          ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                          : 'text-slate-400'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Interactive Mobile Calendar Popover */}
          {selectedCalendarDay && (
            <div className="p-3 bg-[#0f172a]/95 border border-[#334155] rounded-xl space-y-2 text-left">
              <div className="flex items-center justify-between border-b border-[#334155] pb-1">
                <span className="text-[9px] font-black text-indigo-400 tracking-wider">
                  {selectedCalendarDay.day} {monthNames[month]} {year}
                </span>
                <button onClick={() => setSelectedCalendarDay(null)} className="text-[8px] text-slate-500 hover:text-white font-bold">
                  ✕ Close
                </button>
              </div>

              {selectedCalendarDay.jobs.length === 0 ? (
                <div className="flex items-center justify-between gap-2 py-0.5">
                  <span className="text-[9px] text-slate-400 italic">No applications logged.</span>
                  <button
                    onClick={() => handleAddJobForDate(selectedCalendarDay.dateStr)}
                    className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-wider rounded flex items-center gap-0.5"
                  >
                    <Plus size={8} /> Add
                  </button>
                </div>
              ) : (
                <div className="max-h-[80px] overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
                  {selectedCalendarDay.jobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between gap-2 p-1 bg-[#1e293b]/40 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[9px] text-white truncate leading-normal">{job.role}</p>
                        <p className="text-[8px] text-slate-500 truncate leading-normal">{job.company}</p>
                      </div>
                      <button
                        onClick={() => handleEditJob(job)}
                        className="px-1.5 py-0.5 bg-[#1e293b] text-white text-[8px] font-bold rounded"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Floating Sparkles Action Button */}
          <div className="flex justify-end pt-3">
            <button
              onClick={() => setActiveTab('cover-letter')}
              className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
