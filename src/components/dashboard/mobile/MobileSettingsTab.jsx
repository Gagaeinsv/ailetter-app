import React from 'react';

const MobileSettingsTab = ({ contactInfo, setContactInfo, logout, dict, uiLang, setUiLang }) => {
  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] px-4 py-6 pb-24 custom-scrollbar">
      <h2 className="text-2xl font-black text-white mb-6">{dict?.settings || "Settings"}</h2>

      <div className="space-y-6">
        
        {/* UI Language Switcher */}
        <div className="bg-[#1e293b] p-5 rounded-2xl border border-[#334155]">
           <label className="text-[10px] font-black uppercase text-gray-500 mb-3 block">Interface Language</label>
           {/* Змінив grid-cols-3 на grid-cols-4 і додав 'it' */}
           <div className="grid grid-cols-4 gap-2">
              {['en', 'uk', 'de', 'it'].map(lang => (
                <button 
                  key={lang} 
                  onClick={() => setUiLang(lang)}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${uiLang === lang ? 'bg-[#6366f1] text-white' : 'bg-[#0f172a] text-gray-400 border border-[#334155]'}`}
                >
                  {lang}
                </button>
              ))}
           </div>
        </div>

        {/* Profile Form */}
        <div className="bg-[#1e293b] p-5 rounded-2xl border border-[#334155] space-y-4">
           <h3 className="text-sm font-bold text-white mb-2">{dict?.profile || "Profile"}</h3>
           <input 
             value={contactInfo.fullName} 
             onChange={(e) => setContactInfo({...contactInfo, fullName: e.target.value})} 
             placeholder="Full Name" 
             className="w-full bg-[#0f172a] border border-[#334155] p-3 rounded-xl text-white text-sm outline-none focus:border-[#6366f1]" 
           />
           <input 
             value={contactInfo.email} 
             disabled 
             className="w-full bg-[#0f172a]/50 border border-[#334155] p-3 rounded-xl text-gray-500 text-sm" 
           />
        </div>

        <button onClick={logout} className="w-full py-4 border border-[#334155] text-red-400 rounded-2xl font-bold text-sm hover:bg-red-500/10 transition-colors">
           Log out
        </button>
      </div>
    </div>
  );
};

export default MobileSettingsTab;