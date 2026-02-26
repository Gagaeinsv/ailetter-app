import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [uiLang, setUiLang] = useState(
    localStorage.getItem('uiLang') || 'en'
  );

  const handleSetLang = (lang) => {
    setUiLang(lang);
    localStorage.setItem('uiLang', lang);
  };

  return (
    <LanguageContext.Provider value={{ uiLang, setUiLang: handleSetLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);