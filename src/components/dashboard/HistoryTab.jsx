import React, { useState } from 'react';

const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconCopy = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>;

const HistoryTab = ({ history, setHistory, setGeneratedLetter, setActiveTab, dict, showNotification }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // ФІКС БІЛОГО ЕКРАНУ
  const safeHistory = Array.isArray(history) ? history : [];

  const getFilteredHistory = () => {
    let res = safeHistory;
    if (search) res = res.filter(h => h.job?.toLowerCase().includes(search.toLowerCase()) || h.text?.toLowerCase().includes(search.toLowerCase()));
    if (filter === '7') { const ago = Date.now() - 7 * 86400000; res = res.filter(h => h.id > ago); }
    return res;
  };

  const handleDelete = (id) => {
    if(window.confirm('Delete?')) {
        const updated = safeHistory.filter(h => h.id !== id);
        setHistory(updated);
        localStorage.setItem('letterHistory', JSON.stringify(updated));
        if (showNotification) showNotification('Deleted');
    }
  };

  const handleDuplicate = (item) => {
      const copy = { ...item, id: Date.now(), date: new Date().toLocaleDateString(), job: `[Copy] ${item.job}` };
      const updated = [copy, ...safeHistory];
      setHistory(updated);
      localStorage.setItem('letterHistory', JSON.stringify(updated));
      if (showNotification) showNotification('Duplicated');
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] p-10 custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-black text-white mb-8">{dict?.history || "History"}</h2>
        
        <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><IconSearch /></span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search history..." className="w-full bg-[#1e293b] border border-[#334155] rounded-xl py-3 pl-10 pr-4 text-white focus:border-[#6366f1] outline-none" />
            </div>
            <div className="flex bg-[#1e293b] rounded-xl p-1 border border-[#334155]">
                {['all', '7'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-[#6366f1] text-white' : 'text-gray-400 hover:text-white'}`}>
                        {f === 'all' ? 'All Time' : '7 Days'}
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] overflow-hidden shadow-xl">
          {getFilteredHistory().length === 0 ? (
             <div className="text-gray-500 text-center py-20"><p>No history found</p></div>
          ) : (
             <table className="w-full text-left">
                <thead className="bg-[#0f172a]/50 border-b border-[#334155]">
                    <tr><th className="p-5 text-[10px] font-black uppercase text-gray-500">Job</th><th className="p-5 text-[10px] font-black uppercase text-gray-500">Date</th><th className="p-5 text-[10px] font-black uppercase text-gray-500 text-right">Actions</th></tr>
                </thead>
                <tbody>
                    {getFilteredHistory().map(item => (
                        <tr key={item.id} className="border-b border-[#334155]/50 hover:bg-[#334155]/30 transition-all">
                            <td className="p-5 font-bold text-white text-sm">{item.job}</td>
                            <td className="p-5 text-xs text-gray-400">{item.date} • {item.lang}</td>
                            <td className="p-5 flex justify-end gap-2">
                                <button onClick={() => { setGeneratedLetter(item.text); setActiveTab('dashboard'); }} className="px-4 py-2 bg-[#6366f1]/10 text-[#6366f1] rounded-lg text-xs font-bold uppercase">Load</button>
                                <button onClick={() => handleDuplicate(item)} className="p-2 text-gray-400 hover:text-white rounded-lg"><IconCopy /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-400 rounded-lg"><IconTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;