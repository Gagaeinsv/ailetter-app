import React, { useState } from 'react';
import { Sparkles, Clock, MessageSquare, XCircle, Calendar, Briefcase, FileText, CheckCircle2, User, Bell, ChevronLeft, ChevronRight, ArrowRight, Trash, Edit, Plus } from 'lucide-react';

export default function DashboardOverviewTab({
  trackerJobs = [],
  history = [],
  setActiveTab,
  loadLetterFromHistory,
  dict = {},
  user = {},
  isPro = false,
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

  // Aggregate Metrics from Tracker
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

  // Local Filter state clicked from Overview metrics
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);

  // Get 5 most recent job applications
  const recentJobs = [...trackerJobs]
    .sort((a, b) => Number(b.updatedAt || b.id) - Number(a.updatedAt || a.id))
    .slice(0, 5);

  // Filter recent applications based on the metric click
  const displayedJobs = recentJobs.filter(job => !selectedStatusFilter || job.status === selectedStatusFilter);

  // Dynamic Profile Completeness for AI Readiness
  let aiReadinessScore = 0;
  if (contactInfo?.fullName) aiReadinessScore += 15;
  if (contactInfo?.email || contactInfo?.phone) aiReadinessScore += 15;
  if (contactInfo?.profession) aiReadinessScore += 15;
  if (contactInfo?.skills && (contactInfo.skills.length > 0 || typeof contactInfo.skills === 'string')) aiReadinessScore += 25;
  if (contactInfo?.experience && (contactInfo.experience.length > 0 || typeof contactInfo.experience === 'string')) aiReadinessScore += 30;

  // Resume Health Scores
  const overallScore = cvAnalysis?.atsScore ?? 0;
  const keywordsScore = cvAnalysis?.atsBreakdown?.keywords ?? 0;
  const formattingScore = cvAnalysis?.atsBreakdown?.structure ?? 0;
  const impactScore = cvAnalysis?.atsBreakdown?.metrics ?? 0;

  // Calendar States for "Up Next"
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
  const emptyPads = Array.from({ length: (firstDayIndex + 6) % 7 }); // Start week on Monday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedCalendarDay(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedCalendarDay(null);
  };

  // Calendar Day Click Popover State
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  const handleDayClick = (day) => {
    // Zero-pad helper
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
    <div className="h-full overflow-y-auto bg-[#0f172a] p-8 custom-scrollbar text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Hi, {user?.displayName || 'Job Hunter'}
            </h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Targeting <span className="text-[#6366f1] font-black">{contactInfo?.profession || 'Manager'}</span> roles
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => {
                  setShowBellDropdown(!showBellDropdown);
                  setBellRead(true);
                }}
                className="p-2.5 bg-[#1e293b] border border-[#334155] rounded-xl hover:border-slate-500 transition-colors relative"
              >
                <Bell size={16} className="text-slate-400" />
                {followUpEntry && !bellRead && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#6366f1] rounded-full animate-pulse" />
                )}
              </button>

              {showBellDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl p-4 z-50 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-[#334155] pb-2">
                    <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">
                      Notifications
                    </span>
                    <button 
                      onClick={() => setShowBellDropdown(false)}
                      className="text-[10px] text-slate-500 hover:text-white font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {followUpEntry ? (
                    <div className="space-y-3 py-1">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl shrink-0 mt-0.5">⏰</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-bold text-xs">Time for a follow-up!</p>
                          <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                            You applied to <span className="text-indigo-300 font-bold">{followUpEntry.company}</span> 7+ days ago.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowBellDropdown(false);
                            if (props.onFollowUp) props.onFollowUp(followUpEntry);
                          }}
                          className="flex-1 py-1.5 bg-[#6366f1] hover:bg-[#5458ee] text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all text-center"
                        >
                          Generate Follow-up
                        </button>
                        <button
                          onClick={() => {
                            if (props.markFollowUpSent) props.markFollowUpSent(followUpEntry.id);
                            setShowBellDropdown(false);
                          }}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-bold rounded-lg transition-all"
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center font-black border border-[#334155]">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                user?.displayName?.[0]?.toUpperCase() || 'U'
              )}
            </div>
          </div>
        </div>

        {/* Top Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Application Overview */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase size={14} className="text-indigo-400" />
                {dict.jobtrackerFull || 'Application Overview'}
              </span>
              <span className="text-xs font-bold text-slate-500 cursor-default">+</span>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{totalSent}</span>
                <span className="text-sm font-black text-slate-400 uppercase tracking-wider">SENT</span>
              </div>
              <div className="inline-block mt-2 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                +{sentThisWeek} this week
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-[#334155]/60">
              
              {/* Pending sub-card */}
              <button 
                onClick={() => handleMetricToggle('applied')}
                className={`border rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all ${
                  selectedStatusFilter === 'applied'
                    ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.03]'
                    : 'bg-[#0f172a]/60 border-[#334155]/40 hover:border-indigo-500/50'
                }`}
              >
                <Clock size={14} className="text-slate-500 mb-1" />
                <span className="text-lg font-black text-white">{pendingCount}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Pending</span>
              </button>

              {/* Interviews sub-card */}
              <button 
                onClick={() => handleMetricToggle('interview')}
                className={`border rounded-2xl p-3 flex flex-col items-center justify-center text-center relative transition-all ${
                  selectedStatusFilter === 'interview'
                    ? 'bg-indigo-600 border-indigo-400 ring-2 ring-indigo-400/20 scale-[1.03]'
                    : 'bg-white border-[#334155] hover:scale-[1.02]'
                }`}
              >
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <Calendar size={14} className={`${selectedStatusFilter === 'interview' ? 'text-white' : 'text-slate-900'} mb-1`} />
                <span className={`text-lg font-black ${selectedStatusFilter === 'interview' ? 'text-white' : 'text-slate-950'}`}>{interviewCount}</span>
                <span className={`text-[9px] font-black ${selectedStatusFilter === 'interview' ? 'text-indigo-200' : 'text-slate-900'} uppercase tracking-wide`}>Interviews</span>
              </button>

              {/* Rejected sub-card */}
              <button 
                onClick={() => handleMetricToggle('rejected')}
                className={`border rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all ${
                  selectedStatusFilter === 'rejected'
                    ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.03]'
                    : 'bg-[#0f172a]/60 border-[#334155]/40 hover:border-indigo-500/50'
                }`}
              >
                <XCircle size={14} className="text-slate-500 mb-1" />
                <span className="text-lg font-black text-white">{rejectedCount}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Rejected</span>
              </button>

            </div>
          </div>

          {/* Card 2: AI Readiness */}
          <button 
            onClick={() => setActiveTab('settings')}
            className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 flex flex-col justify-between shadow-xl text-left hover:scale-[1.01] hover:border-slate-500 transition-all group"
          >
            <div className="flex items-center justify-between w-full mb-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-400" />
                AI Readiness
              </span>
              <span className="text-sm font-black text-emerald-400">{aiReadinessScore}%</span>
            </div>

            <div className="w-full bg-[#0f172a] h-2.5 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${aiReadinessScore}%` }}
              />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center py-3">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-black text-white text-sm">
                {aiReadinessScore === 100 ? "All Set!" : "In Progress"}
              </h3>
              <p className="text-slate-400 text-xs mt-1 max-w-[200px] leading-relaxed mb-2">
                {aiReadinessScore === 100 
                  ? "Your AI profile is fully optimized for custom cover letter parsing."
                  : "Complete your professional profile settings to maximize generator accuracy."}
              </p>
              <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors uppercase tracking-widest mt-auto">
                Go to Profile Settings ➔
              </span>
            </div>
          </button>

          {/* Card 3: Resume Health */}
          <div 
            className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 flex flex-col justify-between shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-indigo-400" />
                Resume Health
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ATS Score</span>
            </div>

            <div className="grid grid-cols-12 gap-4 items-center cursor-pointer" onClick={() => setActiveTab('cv-optimizer')}>
              
              {/* Bullet details */}
              <div className="col-span-7 space-y-3">
                <div className="flex items-center gap-2 hover:translate-x-0.5 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-300">Keywords: {keywordsScore}%</span>
                </div>
                <div className="flex items-center gap-2 hover:translate-x-0.5 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
                  <span className="text-xs font-semibold text-slate-300">Formatting: {formattingScore}%</span>
                </div>
                <div className="flex items-center gap-2 hover:translate-x-0.5 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-semibold text-slate-300">Impact: {impactScore}%</span>
                </div>
              </div>

              {/* Radial Score ring */}
              <div className="col-span-5 flex justify-center hover:scale-105 transition-transform">
                <div className="relative flex items-center justify-center w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      className="stroke-[#0f172a]"
                      strokeWidth="6"
                      fill="transparent"
                      r="30"
                      cx="40"
                      cy="40"
                    />
                    <circle
                      className="stroke-indigo-500 transition-all duration-1000"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 30}
                      strokeDashoffset={2 * Math.PI * 30 - (overallScore / 100) * (2 * Math.PI * 30)}
                      fill="transparent"
                      r="30"
                      cx="40"
                      cy="40"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute font-black text-sm text-white">
                    {overallScore}%
                  </div>
                </div>
              </div>

            </div>

            <button
              onClick={() => setActiveTab('cv-optimizer')}
              className="mt-6 w-full py-2.5 bg-[#6366f1]/10 border border-[#6366f1]/20 hover:bg-[#6366f1]/20 text-[#a5b4fc] rounded-xl font-bold text-xs uppercase tracking-wider transition-all text-center"
            >
              Optimize Resume
            </button>
          </div>

        </div>

        {/* Bottom Split Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recent Applications (Left Wide Card) */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 lg:col-span-8 flex flex-col h-[480px]">
            <div className="flex items-center justify-between mb-4 border-b border-[#334155]/60 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  📋 {dict.dbRecentApps || "Recent Applications"}
                </h3>
                {selectedStatusFilter && (
                  <button
                    onClick={() => setSelectedStatusFilter(null)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 active:scale-95 transition-all"
                  >
                    Status: {STATUSES.find(s => s.key === selectedStatusFilter)?.label} ✕
                  </button>
                )}
              </div>
              <button
                onClick={navigateToTrackerWithFilter}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
              >
                {dict.dbFullTracker || "Full Tracker"}
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {displayedJobs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
                  <p className="text-xs font-medium">
                    {selectedStatusFilter 
                      ? `No applications with status "${STATUSES.find(s => s.key === selectedStatusFilter)?.label}" found.` 
                      : (dict.dbNoApps || "No tracked applications yet.")}
                  </p>
                  {selectedStatusFilter ? (
                    <button
                      onClick={() => setSelectedStatusFilter(null)}
                      className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-xl transition-all"
                    >
                      Clear Status Filter
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('jobtracker')}
                      className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-xl transition-all"
                    >
                      {dict.dbAddJob || "Add Job to Tracker"}
                    </button>
                  )}
                </div>
              ) : (
                displayedJobs.map((job) => {
                  const currentStatus = STATUSES.find(s => s.key === job.status) || STATUSES[0];
                  return (
                    <div
                      key={job.id}
                      className="flex items-center justify-between gap-4 p-3 bg-[#0f172a]/40 border border-[#334155]/50 rounded-2xl hover:border-slate-500 transition-colors group/row"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => handleEditJob(job)}>
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400 uppercase text-xs shrink-0">
                          {job.company?.[0] || 'J'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate group-hover/row:text-indigo-400 transition-colors">{job.role}</p>
                          <p className="text-xs text-slate-400 truncate">{job.company}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Interactive Status Selector */}
                        {patchTrackerJob && (
                          <select
                            value={job.status}
                            onChange={(e) => patchTrackerJob(job.id, { status: e.target.value })}
                            className="text-[11px] font-bold bg-[#1e293b] border border-[#334155] rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:border-[#6366f1] transition-colors"
                            style={{ color: currentStatus.color }}
                          >
                            {STATUSES.map(s => (
                              <option key={s.key} value={s.key} className="bg-[#1e293b] text-white">
                                {s.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Edit & Delete Shortcuts */}
                        <div className="flex gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditJob(job)}
                            className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-all text-xs"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {removeTrackerJob && (
                            <button
                              onClick={() => {
                                if (window.confirm(dict.deleteConfirm || 'Delete this vacancy?')) {
                                  removeTrackerJob(job.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all text-xs"
                              title="Delete"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Up Next Calendar (Right Smaller Card) */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-6 lg:col-span-4 flex flex-col h-[480px] justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#334155]/60 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  📅 Up Next
                </h3>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Calendar
                </span>
              </div>

              {/* Month selector */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  {monthNames[month]} {year}
                </span>
                <div className="flex gap-1">
                  <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-white hover:bg-[#0f172a] rounded transition-all">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-white hover:bg-[#0f172a] rounded transition-all">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Mini Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase">
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
                  
                  // Check if any job matches this day
                  const pad = (num) => String(num).padStart(2, '0');
                  const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                  const hasActivity = trackerJobs.some(j => j.date === dateStr);
                  const isSelected = selectedCalendarDay?.day === day;

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`h-6 w-full flex items-center justify-center rounded-lg text-[10px] font-black transition-all relative ${
                        isToday 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                          : isSelected
                            ? 'bg-[#6366f1]/20 border border-indigo-400 text-white'
                            : hasActivity
                              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                              : 'text-slate-400 hover:bg-[#0f172a]'
                      }`}
                    >
                      {day}
                      {hasActivity && !isToday && (
                        <span className="absolute bottom-0.5 w-1 h-1 bg-indigo-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Calendar Day Detail Popover / Panel */}
            {selectedCalendarDay && (
              <div className="mt-4 p-3.5 bg-[#0f172a]/80 border border-[#334155] rounded-2xl space-y-3 transition-all animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#334155] pb-1.5">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                    {selectedCalendarDay.day} {monthNames[month]} {year}
                  </span>
                  <button onClick={() => setSelectedCalendarDay(null)} className="text-[9px] text-slate-500 hover:text-white font-bold">
                    ✕ Dismiss
                  </button>
                </div>

                {selectedCalendarDay.jobs.length === 0 ? (
                  <div className="flex items-center justify-between gap-2 py-1">
                    <span className="text-[10px] text-slate-400 italic">No applications logged.</span>
                    <button
                      onClick={() => handleAddJobForDate(selectedCalendarDay.dateStr)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow"
                    >
                      <Plus size={10} /> Add Job
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[100px] overflow-y-auto space-y-2 custom-scrollbar pr-0.5">
                    {selectedCalendarDay.jobs.map(job => (
                      <div key={job.id} className="flex items-center justify-between gap-2 p-1.5 bg-[#1e293b]/40 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[10px] text-white truncate leading-normal">{job.role}</p>
                          <p className="text-[9px] text-slate-500 truncate leading-normal">{job.company}</p>
                        </div>
                        <button
                          onClick={() => handleEditJob(job)}
                          className="px-2 py-1 bg-[#1e293b] hover:bg-slate-700 text-white text-[9px] font-bold rounded"
                        >
                          View ➔
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Floating Action Button inside Calendar */}
            <div className="flex justify-end pt-4 mt-auto">
              <button
                onClick={() => setActiveTab('cover-letter')}
                className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25 active:scale-95 transition-all group"
                title={dict.dbGenerateLetter || "New Cover Letter"}
              >
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
