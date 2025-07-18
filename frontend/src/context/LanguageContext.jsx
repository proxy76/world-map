import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Inițializează limba din localStorage sau default "ro"
  const [lang, setLangState] = useState(() => localStorage.getItem("lang") || "ro");

  // Când se schimbă limba, salveaz-o în localStorage
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  // Wrapper ca să nu uiți să salvezi și în localStorage
  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);