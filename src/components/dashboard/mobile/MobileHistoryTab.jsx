import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
const IconCopy = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>;

const daysSince = (savedAt) => {
  if (!savedAt) return null;
  return Math.floor((Date.now() - savedAt) / 86400000);
};

const FollowUpStatus = ({ item, isPro, onFollowUp, setShowUpgrade, dict }) => {
  const d = daysSince(item.savedAt);
  if (d === null) return null;

  if (item.followUpSent) {
    return (
      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
        ✓ {dict?.followUpSentLabel || 'Follow-up sent'}
      </span>
    );
  }

  if (d >= 7) {
    return isPro ? (
      <button
        type="button"
        onClick={() => onFollowUp?.(item)}
        className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg active:bg-amber-500/20 transition-all animate-pulse"
      >
        ⏰ {dict?.followUpSend || 'Send follow-up'}
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setShowUpgrade?.(true)}
        className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg active:bg-amber-500/20 transition-all"
      >
        <Lock className="w-2.5 h-2.5" /> {dict?.followUpPro || 'Pro — Follow-up'}
      </button>
    );
  }

  const daysLeft = 7 - d;
  return (
    <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg">
      {(dict?.followUpIn || 'Follow-up in {n}d').replace('{n}', String(daysLeft))}
    </span>
  );
};

const MobileHistoryTab = ({
  history,
  user,
  syncStatus,
  deleteHistoryItem,
  duplicateHistoryItem,
  loadLetterFromHistory,
  dict,
  isPro,
  setShowUpgrade,
  onFollowUp,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const safeHistory = Array.isArray(history) ? history : [];

  const historyCountLabel =
    safeHistory.length === 1
      ? (dict?.historyCountSuffixOne ?? dict?.historyCountSuffix)
      : dict?.historyCountSuffix;

  const getFilteredHistory = () => {
    let res = safeHistory;
    if (search) {
      res = res.filter((h) =>
        h.job?.toLowerCase().includes(search.toLowerCase()) ||
        h.text?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter === '7') { const ago = Date.now() - 7 * 86400000; res = res.filter((h) => h.id > ago); }
    if (filter === '30') { const ago = Date.now() - 30 * 86400000; res = res.filter((h) => h.id > ago); }
    return res;
  };

  const pendingFollowUps = safeHistory.filter((h) =>
    h.savedAt && !h.followUpSent && daysSince(h.savedAt) >= 7
  ).length;

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] px-4 py-6 pb-24 custom-scrollbar">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-white">{dict?.history || 'History'}</h2>
        <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{safeHistory.length} {historyCountLabel ?? (safeHistory.length === 1 ? 'saved letter' : 'saved letters')}</span>
          {user?.uid && syncStatus === 'syncing' && (
            <span className="text-indigo-400 shrink-0">{dict?.historySyncing || 'Syncing…'}</span>
          )}
          {user?.uid && syncStatus === 'synced' && (
            <span className="text-emerald-400 shrink-0">{dict?.historySynced || 'Synced'}</span>
          )}
          {user?.uid && syncStatus === 'error' && (
            <span className="text-amber-400 shrink-0">{dict?.historySyncError || 'Sync issue'}</span>
          )}
        </p>
      </div>

      {pendingFollowUps > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-2xl mb-4">
          <span className="text-xl shrink-0">⏰</span>
          <div className="flex-1 min-w-0">
            <p className="text-amber-400 font-bold text-sm">
              {(dict?.followUpBannerTitle || '{n} follow-ups ready').replace('{n}', String(pendingFollowUps))}
            </p>
            <p className="text-amber-500/70 text-xs">{dict?.followUpBannerSub || '7+ days since application'}</p>
          </div>
        </div>
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
          ].map((f) => (
            <button
              key={f.key}
              type="button"
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
          getFilteredHistory().map((item) => {
            const d = daysSince(item.savedAt);
            const isOverdue = d !== null && d >= 7 && !item.followUpSent;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border shadow-sm transition-all ${
                  isOverdue ? 'bg-amber-500/5 border-amber-500/20' : 'bg-[#1e293b] border-[#334155]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    {item.company && item.company !== 'Unknown' && (
                      <p className="text-[10px] font-black text-indigo-400 mb-0.5 truncate">{item.company}</p>
                    )}
                    <h3 className="font-bold text-white text-sm line-clamp-1 flex items-center gap-1.5">
                      {isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                      {item.job}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {item.date}
                      {d !== null && (
                        <span className="text-slate-600 ml-1">
                          · {d === 0
                            ? (dict?.historyToday || 'Today')
                            : (dict?.historyDaysAgo || '{n} days ago').replace('{n}', String(d))}
                        </span>
                      )}
                      {item.lang && <span className="text-[#6366f1] ml-1">· {item.lang}</span>}
                    </p>
                  </div>
                  <button type="button" onClick={() => deleteHistoryItem(item.id)} className="text-gray-500 hover:text-red-400 p-1 shrink-0">
                    <IconTrash />
                  </button>
                </div>

                <div className="mb-3">
                  <FollowUpStatus
                    item={item}
                    isPro={isPro}
                    onFollowUp={onFollowUp}
                    setShowUpgrade={setShowUpgrade}
                    dict={dict}
                  />
                </div>

                <div className="flex gap-2 border-t border-[#334155] pt-3">
                  <button
                    type="button"
                    onClick={() => loadLetterFromHistory?.(item)}
                    className="flex-1 py-2 bg-[#6366f1]/10 text-[#6366f1] rounded-lg text-xs font-bold uppercase active:scale-95 transition-all"
                  >
                    {dict?.loadLetter || 'Load'}
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateHistoryItem(item)}
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
