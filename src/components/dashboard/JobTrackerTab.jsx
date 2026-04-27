import React, { useState, useEffect } from 'react';

const STATUSES = [
  { key: 'applied',   label: 'Applied',   color: '#6366f1', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  dot: 'bg-indigo-400' },
  { key: 'interview', label: 'Interview', color: '#f59e0b', bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400'  },
  { key: 'offer',     label: 'Offer',     color: '#22c55e', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  { key: 'rejected',  label: 'Rejected',  color: '#ef4444', bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400'    },
];

const EMPTY_FORM = { company: '', role: '', url: '', notes: '', status: 'applied', date: '' };

const LS_KEY = 'jobTracker';

const loadJobs = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
};
const saveJobs = (jobs) => localStorage.setItem(LS_KEY, JSON.stringify(jobs));

const daysSince = (dateStr) => {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
};

const JobCard = ({ job, onEdit, onDelete, onStatusChange }) => {
  const st = STATUSES.find(s => s.key === job.status) || STATUSES[0];
  const days = daysSince(job.date);
  return (
    <div className="bg-[#0f172a] border border-[#334155] rounded-xl p-4 space-y-2 group hover:border-[#475569] transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-black text-white text-sm truncate">{job.company || '—'}</p>
          <p className="text-[11px] text-slate-400 truncate">{job.role || '—'}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(job)} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-[#1e293b] transition-all" title="Edit">✏️</button>
          <button onClick={() => onDelete(job.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all" title="Delete">🗑</button>
        </div>
      </div>

      {job.notes && (
        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{job.notes}</p>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          <select
            value={job.status}
            onChange={e => onStatusChange(job.id, e.target.value)}
            className="text-[10px] font-bold bg-transparent outline-none cursor-pointer"
            style={{ color: st.color }}
          >
            {STATUSES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
        {days !== null && (
          <span className="text-[9px] text-slate-600">
            {days === 0 ? 'Today' : `${days}d ago`}
          </span>
        )}
      </div>

      {job.url && (
        <a href={job.url} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-indigo-400 hover:text-indigo-300 truncate block transition-colors">
          ↗ {job.url.replace(/^https?:\/\//, '').substring(0, 40)}
        </a>
      )}
    </div>
  );
};

const JobForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || { ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-5 space-y-3">
      <h3 className="font-black text-white text-sm">{initial?.id ? 'Edit Application' : 'Add Application'}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Company *</label>
          <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Google"
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1] transition-colors" />
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Role *</label>
          <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="Product Manager"
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1] transition-colors" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white outline-none">
            {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Date Applied</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1] transition-colors" />
        </div>
      </div>
      <div>
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Job URL</label>
        <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..."
          className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1] transition-colors" />
      </div>
      <div>
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Interview date, contact name, salary range..."
          className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1] resize-none transition-colors" />
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={() => { if (!form.company || !form.role) return; onSave(form); }}
          disabled={!form.company || !form.role}
          className="flex-1 py-2.5 bg-[#6366f1] hover:bg-[#5458ee] disabled:opacity-50 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
          {initial?.id ? 'Save Changes' : 'Add Application'}
        </button>
        <button onClick={onCancel} className="px-5 py-2.5 bg-[#0f172a] text-slate-400 border border-[#334155] rounded-xl font-semibold text-xs transition-all active:scale-95">
          Cancel
        </button>
      </div>
    </div>
  );
};

const JobTrackerTab = () => {
  const [jobs, setJobs]             = useState(loadJobs);
  const [showForm, setShowForm]     = useState(false);
  const [editJob, setEditJob]       = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch]         = useState('');

  useEffect(() => { saveJobs(jobs); }, [jobs]);

  const addJob = (form) => {
    const job = { ...form, id: Date.now() };
    setJobs(prev => [job, ...prev]);
    setShowForm(false);
  };

  const updateJob = (form) => {
    setJobs(prev => prev.map(j => j.id === form.id ? form : j));
    setEditJob(null);
  };

  const deleteJob = (id) => {
    if (!window.confirm('Delete this application?')) return;
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const changeStatus = (id, status) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  const filtered = jobs.filter(j => {
    const matchStatus = filterStatus === 'all' || j.status === filterStatus;
    const matchSearch = !search ||
      j.company?.toLowerCase().includes(search.toLowerCase()) ||
      j.role?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const countByStatus = (key) => jobs.filter(j => j.status === key).length;

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black text-white">Job Tracker</h2>
            <p className="text-slate-500 text-sm mt-1">{jobs.length} application{jobs.length !== 1 ? 's' : ''} tracked</p>
          </div>
          <button
            onClick={() => { setEditJob(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6366f1] hover:bg-[#5458ee] rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            + Add Application
          </button>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {STATUSES.map(s => (
            <div key={s.key} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{countByStatus(s.key)}</p>
              <p className="text-xs font-bold text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add / Edit form */}
        {(showForm || editJob) && (
          <div className="mb-6">
            <JobForm
              initial={editJob || undefined}
              onSave={editJob ? updateJob : addJob}
              onCancel={() => { setShowForm(false); setEditJob(null); }}
            />
          </div>
        )}

        {/* Search & filter */}
        <div className="flex gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company or role..."
            className="flex-1 bg-[#1e293b] border border-[#334155] rounded-xl py-2.5 px-4 text-sm text-white outline-none focus:border-[#6366f1] transition-colors"
          />
          <div className="flex bg-[#1e293b] rounded-xl p-1 border border-[#334155]">
            <button onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-[#6366f1] text-white' : 'text-slate-400 hover:text-white'}`}>
              All
            </button>
            {STATUSES.map(s => (
              <button key={s.key} onClick={() => setFilterStatus(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s.key ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                style={filterStatus === s.key ? { background: s.color } : {}}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-white font-bold text-lg mb-2">
              {jobs.length === 0 ? 'Start tracking your applications' : 'No applications found'}
            </p>
            <p className="text-slate-500 text-sm">
              {jobs.length === 0
                ? 'Click "Add Application" to log your first job application.'
                : 'Try a different filter or search term.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={(j) => { setEditJob(j); setShowForm(false); }}
                onDelete={deleteJob}
                onStatusChange={changeStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobTrackerTab;
