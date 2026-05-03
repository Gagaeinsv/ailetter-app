import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconTrash  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconCopy   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;

// Скільки днів пройшло з savedAt
const daysSince = (savedAt) => {
  if (!savedAt) return null;
  return Math.floor((Date.now() - savedAt) / 86400000);
};

// Статус follow-up для запису
const FollowUpStatus = ({ item, isPro, onFollowUp, setShowUpgrade, dict }) => {
  const days = daysSince(item.savedAt);
  if (days === null) return null;

  if (item.followUpSent) {
    return (
      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
        ✓ {dict?.followUpSentLabel || 'Follow-up sent'}
      </span>
    );
  }

  if (days >= 7) {
    return isPro ? (
      <button
        onClick={() => onFollowUp(item)}
        className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg hover:bg-amber-500/20 transition-all animate-pulse"
      >
        ⏰ {dict?.followUpSend || 'Send follow-up'}
      </button>
    ) : (
      <button
        onClick={() => setShowUpgrade(true)}
        className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg hover:bg-amber-500/20 transition-all"
      >
        <Lock className="w-2.5 h-2.5" /> {dict?.followUpPro || 'Pro — Follow-up'}
      </button>
    );
  }

  // До follow-up ще є час
  const daysLeft = 7 - days;
  return (
    <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg">
      {(dict?.followUpIn || 'Follow-up in {n}d').replace('{n}', String(daysLeft))}
    </span>
  );
};

const HistoryTab = ({
  history,
  user,
  syncStatus,
  deleteHistoryItem,
  duplicateHistoryItem,
  setGeneratedLetter, setActiveTab,
  dict, showNotification,
  isPro, setShowUpgrade,
  onFollowUp,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const safeHistory = Array.isArray(history) ? history : [];

  const historyCountLabel =
    safeHistory.length === 1
      ? (dict?.historyCountSuffixOne ?? dict?.historyCountSuffix)
      : dict?.historyCountSuffix;

  const getFiltered = () => {
    let res = safeHistory;
    if (search) res = res.filter(h =>
      h.job?.toLowerCase().includes(search.toLowerCase()) ||
      h.text?.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === '7')  { const ago = Date.now() - 7  * 86400000; res = res.filter(h => h.id > ago); }
    if (filter === '30') { const ago = Date.now() - 30 * 86400000; res = res.filter(h => h.id > ago); }
    return res;
  };

  // Кількість записів що чекають follow-up
  const pendingFollowUps = safeHistory.filter(h =>
    h.savedAt && !h.followUpSent && daysSince(h.savedAt) >= 7
  ).length;

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white">{dict?.history || 'History'}</h2>
            <p className="text-slate-500 text-sm mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                {safeHistory.length} {historyCountLabel ?? (safeHistory.length === 1 ? 'saved letter' : 'saved letters')}
              </span>
              {user?.uid && syncStatus === 'syncing' && (
                <span className="text-indigo-400 text-xs shrink-0">{dict?.historySyncing || 'Syncing…'}</span>
              )}
              {user?.uid && syncStatus === 'error' && (
                <span className="text-amber-400 text-xs shrink-0">{dict?.historySyncError || 'Cloud sync issue — data kept locally'}</span>
              )}
              {user?.uid && syncStatus === 'synced' && (
                <span className="text-emerald-500/80 text-xs shrink-0">{dict?.historySynced || 'Synced'}</span>
              )}
            </p>
          </div>
          {pendingFollowUps > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl">
              <span className="text-lg">⏰</span>
              <div>
                <p className="text-amber-400 font-bold text-sm">
                  {(dict?.followUpBannerTitle || '{n} follow-ups ready').replace('{n}', String(pendingFollowUps))}
                </p>
                <p className="text-amber-500/70 text-xs">{dict?.followUpBannerSub || '7+ days since application'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><IconSearch /></span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={dict?.historySearchPlaceholder || 'Search...'}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          <div className="flex bg-[#1e293b] rounded-xl p-1 border border-[#334155]">
            {[
              { key: 'all', label: dict?.filterAll || 'All' },
              { key: '7',   label: dict?.filter7 || '7d' },
              { key: '30',  label: dict?.filter30 || '30d' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f.key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden shadow-xl">
          {getFiltered().length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-sm">{dict?.emptyHistorySearch || 'No letters found'}</p>
              {safeHistory.length === 0 && (
                <p className="text-slate-600 text-xs mt-2">{dict?.emptyHistory}</p>
              )}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#0f172a]/50 border-b border-[#334155]">
                <tr>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">{dict?.historyColJob || 'Job'}</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">{dict?.colDate || 'Date'}</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">{dict?.historyColFollowUp || 'Follow-up'}</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">{dict?.colActions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {getFiltered().map(item => {
                  const days = daysSince(item.savedAt);
                  const isOverdue = days !== null && days >= 7 && !item.followUpSent;

                  return (
                    <tr key={item.id}
                      className={`border-b border-[#334155]/50 hover:bg-[#334155]/20 transition-all ${isOverdue ? 'bg-amber-500/5' : ''}`}>

                      {/* Company / Job */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          {isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                          <div>
                            {item.company && item.company !== 'Unknown' && (
                              <p className="text-xs font-black text-indigo-400 mb-0.5">{item.company}</p>
                            )}
                            <p className="font-semibold text-white text-sm truncate max-w-[280px]">{item.job}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-5">
                        <p className="text-xs text-slate-400">{item.date}</p>
                        {days !== null && (
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            {days === 0
                              ? (dict?.historyToday || 'Today')
                              : (dict?.historyDaysAgo || '{n} days ago').replace('{n}', String(days))}
                          </p>
                        )}
                        {item.lang && (
                          <span className="text-[9px] font-bold text-slate-600 uppercase">{item.lang}</span>
                        )}
                      </td>

                      {/* Follow-up status */}
                      <td className="p-5">
                        <FollowUpStatus
                          item={item}
                          isPro={isPro}
                          onFollowUp={onFollowUp}
                          setShowUpgrade={setShowUpgrade}
                          dict={dict}
                        />
                      </td>

                      {/* Actions */}
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setGeneratedLetter(item.text); setActiveTab('dashboard'); }}
                            className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-bold transition-all"
                          >
                            {dict?.loadLetter || 'Load'}
                          </button>
                          <button onClick={() => duplicateHistoryItem(item)} className="p-2 text-slate-500 hover:text-white rounded-lg transition-all">
                            <IconCopy />
                          </button>
                          <button onClick={() => deleteHistoryItem(item.id)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition-all">
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;