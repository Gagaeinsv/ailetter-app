import React, { useState } from 'react';

const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconCopy = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>;

const MobileHistoryTab = ({
  history,
  user,
  syncStatus,
  deleteHistoryItem,
  duplicateHistoryItem,
  setGeneratedLetter,
  setActiveTab,
  dict,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const safeHistory = Array.isArray(history) ? history : [];

  const getFilteredHistory = () => {
    let res = safeHistory;
    if (search) {
      res = res.filter(h =>
        h.job?.toLowerCase().includes(search.toLowerCase()) ||
        h.text?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter === '7') { const ago = Date.now() - 7 * 86400000; res = res.filter(h => h.id > ago); }
    if (filter === '30') { const ago = Date.now() - 30 * 86400000; res = res.filter(h => h.id > ago); }
    return res;
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] px-4 py-6 pb-24 custom-scrollbar">
      <h2 className="text-2xl font-black text-white mb-2">{dict?.history || 'History'}</h2>
      {user?.uid && (
        <p className="text-[10px] text-slate-500 mb-4">
          {syncStatus === 'syncing' && (dict?.historySyncing || 'Syncing…')}
          {syncStatus === 'synced' && (dict?.historySynced || 'Synced')}
          {syncStatus === 'error' && (dict?.historySyncError || 'Sync issue')}
        </p>
      )}

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><IconSearch /></span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict?.historySearchPlaceholder || 'Search...'}
            className="w-full bg-[#1e293b] border border-[#334155] rounded-xl py-3 pl-9 pr-3 text-sm text-white focus:border-[#6366f1] outline-none"
          />
        </div>
        <div className="flex bg-[#1e293b] rounded-xl p-1 border border-[#334155] shrink-0">
          {[
            { key: 'all', label: dict?.filterAll || 'All' },
            { key: '7', label: dict?.filter7 || '7d' },
            { key: '30', label: dict?.filter30 || '30d' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-2 rounded-lg text-[10px] font-bold transition-all ${filter === f.key ? 'bg-[#6366f1] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {getFilteredHistory().length === 0 ? (
          <div className="text-gray-500 text-center py-10 text-sm">
            <p>{safeHistory.length === 0 ? (dict?.emptyHistory || 'No letters yet') : (dict?.emptyHistorySearch || 'No matches')}</p>
          </div>
        ) : (
          getFilteredHistory().map(item => (
            <div key={item.id} className="bg-[#1e293b] p-4 rounded-xl border border-[#334155] shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  {item.company && item.company !== 'Unknown' && (
                    <p className="text-[10px] font-black text-indigo-400 mb-0.5">{item.company}</p>
                  )}
                  <h3 className="font-bold text-white text-sm line-clamp-1">{item.job}</h3>
                  <p className="text-[10px] text-gray-400 mt-1">{item.date} • <span className="text-[#6366f1]">{item.lang}</span></p>
                </div>
                <button type="button" onClick={() => deleteHistoryItem(item.id)} className="text-gray-500 hover:text-red-400 p-1"><IconTrash /></button>
              </div>
              <div className="flex gap-2 border-t border-[#334155] pt-3">
                <button
                  type="button"
                  onClick={() => { setGeneratedLetter(item.text); setActiveTab('dashboard'); }}
                  className="flex-1 py-2 bg-[#6366f1]/10 text-[#6366f1] rounded-lg text-xs font-bold uppercase"
                >
                  {dict?.loadLetter || 'Load'}
                </button>
                <button type="button" onClick={() => duplicateHistoryItem(item)} className="p-2 bg-[#0f172a] text-gray-400 rounded-lg border border-[#334155]"><IconCopy /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileHistoryTab;
