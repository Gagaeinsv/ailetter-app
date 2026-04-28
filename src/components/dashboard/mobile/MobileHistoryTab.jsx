import React, { useState } from 'react';

const IconSearch  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconTrash   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconCopy    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const IconLock    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const daysSince = (savedAt) => {
  if (!savedAt) return null;
  return Math.floor((Date.now() - savedAt) / 86400000);
};

const FollowUpStatus = ({ item, isPro, onFollowUp, setShowUpgrade }) => {
  const days = daysSince(item.savedAt);
  if (days === null) return null;

  if (item.followUpSent) {
    return (
      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
        ✓ Follow-up sent
      </span>
    );
  }

  if (days >= 7) {
    return isPro ? (
      <button
        onClick={() => onFollowUp && onFollowUp(item)}
        className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg active:bg-amber-500/20 transition-all animate-pulse"
      >
        ⏰ Send follow-up
      </button>
    ) : (
      <button
        onClick={() => setShowUpgrade && setShowUpgrade(true)}
        className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg active:bg-amber-500/20 transition-all"
      >
        <IconLock /> Pro — Follow-up
      </button>
    );
  }

  const daysLeft = 7 - days;
  return (
    <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg">
      Follow-up in {daysLeft}d
    </span>
  );
};

const MobileHistoryTab = ({
  history, setHistory,
  addEntry, removeEntry, syncStatus,
  setGeneratedLetter, setActiveTab,
  dict, showNotification,
  isPro, setShowUpgrade,
  onFollowUp, markFollowUpSent,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const safeHistory = Array.isArray(history) ? history : [];

  const getFilteredHistory = () => {
    let res = safeHistory;
    if (search) res = res.filter(h =>
      h.job?.toLowerCase().includes(search.toLowerCase()) ||
      h.text?.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === '7')  { const ago = Date.now() - 7  * 86400000; res = res.filter(h => h.id > ago); }
    if (filter === '30') { const ago = Date.now() - 30 * 86400000; res = res.filter(h => h.id > ago); }
    return res;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    if (removeEntry) {
      await removeEntry(id);
    } else {
      setHistory(safeHistory.filter(h => h.id !== id));
    }
    if (showNotification) showNotification('Deleted');
  };

  const handleDuplicate = async (item) => {
    const copy = { ...item, id: Date.now(), date: new Date().toLocaleDateString(), job: `[Copy] ${item.job}` };
    if (addEntry) {
      await addEntry(copy);
    } else {
      setHistory([copy, ...safeHistory]);
    }
    if (showNotification) showNotification('Duplicated');
  };

  const pendingFollowUps = safeHistory.filter(h =>
    h.savedAt && !h.followUpSent && daysSince(h.savedAt) >= 7
  ).length;

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] px-4 py-6 pb-24 custom-scrollbar">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-2xl font-black text-white">{dict?.history || 'History'}</h2>
        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
          {safeHistory.length} saved letters
          {syncStatus === 'syncing' && <span className="text-indigo-400 animate-pulse">☁ Syncing…</span>}
          {syncStatus === 'synced'  && <span className="text-emerald-400">☁ Synced</span>}
          {syncStatus === 'error'   && <span className="text-amber-400">⚠ Local</span>}
        </p>
      </div>
      </div>

      {/* Pending follow-ups banner */}
      {pendingFollowUps > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-2xl mb-4">
          <span className="text-xl shrink-0">⏰</span>
          <div className="flex-1 min-w-0">
            <p className="text-amber-400 font-bold text-sm">
              {pendingFollowUps} follow-up{pendingFollowUps > 1 ? 's' : ''} ready
            </p>
            <p className="text-amber-500/70 text-xs">7+ days since application</p>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><IconSearch /></span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl py-3 pl-9 pr-3 text-sm text-white focus:border-[#6366f1] outline-none"
          />
        </div>
        <div className="flex bg-[#1e293b] rounded-xl p-1 border border-[#334155] shrink-0">
          {[
            { key: 'all', label: 'All'  },
            { key: '7',   label: '7d'   },
            { key: '30',  label: '30d'  },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${filter === f.key ? 'bg-[#6366f1] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {getFilteredHistory().length === 0 ? (
          <div className="text-gray-500 text-center py-10 text-sm">
            <p>No history found</p>
            {safeHistory.length === 0 && (
              <p className="text-gray-600 text-xs mt-2">Generate and save your first letter to see it here</p>
            )}
          </div>
        ) : (
          getFilteredHistory().map(item => {
            const days = daysSince(item.savedAt);
            const isOverdue = days !== null && days >= 7 && !item.followUpSent;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border shadow-sm transition-all ${
                  isOverdue
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-[#1e293b] border-[#334155]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    {/* Company name */}
                    {item.company && item.company !== 'Unknown' && (
                      <p className="text-[10px] font-black text-indigo-400 mb-0.5 truncate">{item.company}</p>
                    )}
                    <h3 className="font-bold text-white text-sm line-clamp-1 flex items-center gap-1.5">
                      {isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                      {item.job}
                    </h3>
                    {/* Date + relative */}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {item.date}
                      {days !== null && (
                        <span className="text-slate-600 ml-1">
                          · {days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'} ago`}
                        </span>
                      )}
                      {item.lang && <span className="text-[#6366f1] ml-1">· {item.lang}</span>}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-red-400 p-1 shrink-0">
                    <IconTrash />
                  </button>
                </div>

                {/* Follow-up status */}
                <div className="mb-3">
                  <FollowUpStatus
                    item={item}
                    isPro={isPro}
                    onFollowUp={onFollowUp}
                    setShowUpgrade={setShowUpgrade}
                  />
                </div>

                <div className="flex gap-2 border-t border-[#334155] pt-3">
                  <button
                    onClick={() => { setGeneratedLetter(item.text); setActiveTab('dashboard'); }}
                    className="flex-1 py-2 bg-[#6366f1]/10 text-[#6366f1] rounded-lg text-xs font-bold uppercase active:scale-95 transition-all"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDuplicate(item)}
                    className="p-2 bg-[#0f172a] text-gray-400 rounded-lg border border-[#334155] active:scale-95 transition-all"
                  >
                    <IconCopy />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileHistoryTab;
