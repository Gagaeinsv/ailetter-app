import React, { useState } from 'react';

const getStatuses = (dict) => {
  const t = (k, fb) => dict?.[k] || fb;
  return [
    { key: 'applied',   label: t('trackerStatusApplied',   'Applied'),   color: '#6366f1', dot: 'bg-indigo-400'  },
    { key: 'interview', label: t('trackerStatusInterview', 'Interview'), color: '#f59e0b', dot: 'bg-amber-400'   },
    { key: 'offer',     label: t('trackerStatusOffer',     'Offer'),     color: '#22c55e', dot: 'bg-emerald-400' },
    { key: 'rejected',  label: t('trackerStatusRejected',  'Rejected'),  color: '#ef4444', dot: 'bg-red-400'     },
  ];
};

const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null;

const MobileJobTrackerTab = ({
  dict,
  user,
  trackerJobs = [],
  trackerSyncStatus,
  upsertTrackerJob,
  patchTrackerJob,
  removeTrackerJob,
}) => {
  const t = (k, fb) => dict?.[k] || fb;
  const STATUSES = getStatuses(dict);

  const jobs = Array.isArray(trackerJobs) ? trackerJobs : [];
  const [showAdd, setShowAdd] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [filter, setFilter]   = useState('all');
  const [form, setForm]       = useState({ company: '', role: '', url: '', notes: '', status: 'applied', date: new Date().toISOString().slice(0, 10) });

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm({ company: '', role: '', url: '', notes: '', status: 'applied', date: new Date().toISOString().slice(0, 10) });
    setEditJob(null);
    setShowAdd(true);
  };

  const openEdit = (job) => { setForm({ ...job }); setEditJob(job); setShowAdd(true); };

  const handleSave = () => {
    if (!form.company || !form.role) return;
    const id = editJob ? editJob.id : Date.now();
    upsertTrackerJob?.({ ...form, id });
    setShowAdd(false);
    setEditJob(null);
  };

  const deleteJob    = (id)            => { if (window.confirm(t('trackerDeleteConfirm', 'Delete?'))) removeTrackerJob?.(id); };
  const changeStatus = (id, status)    => patchTrackerJob?.(id, { status });

  const filtered = jobs.filter(j => filter === 'all' || j.status === filter);
  const inputCls = "w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#6366f1] transition-colors";
  const lblCls   = "text-[9px] font-black text-[#64748b] uppercase tracking-widest block mb-1";

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] px-4 py-6 pb-24 custom-scrollbar">

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black text-white">{t('trackerTitle', 'Job Tracker')}</h2>
          <div className="text-xs text-slate-500 mt-0.5 space-y-0.5">
            <p>{jobs.length} {t('trackerSubtitle', 'applications')}</p>
            {user?.uid && trackerSyncStatus === 'syncing' && (
              <p className="text-indigo-400 text-[10px]">{dict?.trackerJobsSyncing}</p>
            )}
            {user?.uid && trackerSyncStatus === 'error' && (
              <p className="text-amber-400 text-[10px]">{dict?.trackerJobsSyncError}</p>
            )}
            {user?.uid && trackerSyncStatus === 'synced' && (
              <p className="text-emerald-500/80 text-[10px]">{dict?.trackerJobsSynced}</p>
            )}
          </div>
        </div>
        <button onClick={openAdd} className="px-4 py-2 bg-[#6366f1] rounded-xl font-black text-xs uppercase active:scale-95 transition-all">
          {t('trackerAddShort', '+ Add')}
        </button>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {STATUSES.map(s => (
          <div key={s.key} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] border border-[#334155] rounded-full">
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.label}</span>
            <span className="text-[10px] text-slate-500">{jobs.filter(j => j.status === s.key).length}</span>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 mb-4 space-y-3">
          <h3 className="font-black text-white text-sm">{editJob ? t('trackerEdit', 'Edit') : t('trackerAdd', 'Add')} </h3>
          <div><label className={lblCls}>{t('trackerCompany', 'Company')} *</label><input value={form.company} onChange={e => setF('company', e.target.value)} placeholder="Google" className={inputCls} /></div>
          <div><label className={lblCls}>{t('trackerRole', 'Role')} *</label><input value={form.role} onChange={e => setF('role', e.target.value)} placeholder="Product Manager" className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lblCls}>{t('trackerStatus', 'Status')}</label>
              <select value={form.status} onChange={e => setF('status', e.target.value)} className={inputCls}>
                {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={lblCls}>{t('trackerDate', 'Date Applied')}</label>
              <input type="date" value={form.date} onChange={e => setF('date', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div><label className={lblCls}>{t('trackerUrl', 'Job URL')}</label><input value={form.url} onChange={e => setF('url', e.target.value)} placeholder="https://..." className={inputCls} /></div>
          <div>
            <label className={lblCls}>{t('trackerNotes', 'Notes')}</label>
            <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} rows={2} className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#6366f1] resize-none transition-colors" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!form.company || !form.role}
              className="flex-1 py-3 bg-[#6366f1] disabled:opacity-50 rounded-xl font-black text-xs uppercase active:scale-95 transition-all">
              {editJob ? t('trackerSaveEdit', 'Save') : t('trackerSave', 'Add')}
            </button>
            <button onClick={() => { setShowAdd(false); setEditJob(null); }}
              className="px-4 py-3 bg-[#0f172a] border border-[#334155] text-slate-400 rounded-xl font-semibold text-xs active:scale-95">
              {t('trackerCancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1 mb-4 bg-[#1e293b] rounded-xl p-1 border border-[#334155] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setFilter('all')}
          className={`shrink-0 flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${filter === 'all' ? 'bg-[#6366f1] text-white' : 'text-slate-400'}`}>
          {t('trackerAll', 'All')}
        </button>
        {STATUSES.map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`shrink-0 flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${filter === s.key ? 'text-white' : 'text-slate-400'}`}
            style={filter === s.key ? { background: s.color } : {}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-white font-bold mb-1">{jobs.length === 0 ? t('trackerEmpty', 'No applications yet') : t('trackerNoResults', 'No results')}</p>
          <p className="text-slate-500 text-xs">{jobs.length === 0 ? t('trackerEmptyDesc', 'Tap + Add to log your first application.') : t('trackerNoResultsDesc', 'Try a different filter.')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(job => {
            const st   = STATUSES.find(s => s.key === job.status) || STATUSES[0];
            const days = daysSince(job.date);
            return (
              <div key={String(job.id)} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-white text-sm truncate">{job.company}</p>
                    <p className="text-xs text-slate-400 truncate">{job.role}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <button onClick={() => openEdit(job)} className="p-1.5 text-slate-500 rounded-lg active:bg-[#334155] text-xs">✏️</button>
                    <button onClick={() => deleteJob(job.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg active:bg-red-500/10 text-xs">🗑</button>
                  </div>
                </div>
                {job.notes && <p className="text-[10px] text-slate-500 line-clamp-2 mb-2">{job.notes}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    <select value={job.status} onChange={e => changeStatus(job.id, e.target.value)}
                      className="text-[10px] font-bold bg-transparent outline-none cursor-pointer" style={{ color: st.color }}>
                      {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                  {days !== null && (
                    <span className="text-[9px] text-slate-600">
                      {days === 0 ? t('trackerToday', 'Today') : `${days}${t('trackerDaysAgo', 'd ago')}`}
                    </span>
                  )}
                </div>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-indigo-400 truncate block mt-1">
                    ↗ {job.url.replace(/^https?:\/\//, '').substring(0, 35)}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileJobTrackerTab;
