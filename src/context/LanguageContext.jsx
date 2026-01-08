import { createContext, useContext, useState, useEffect } from "react";

// Supported languages
const languages = {
  en: "En",
  he: "He",
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Default: English, ya localStorage se
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "he";
  });

  useEffect(() => {
    if (!localStorage.getItem("language")) {
      localStorage.setItem("language", "he");
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    
    // Set RTL direction for Hebrew
    if (lang === "he") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "he";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    }
  };

  // Set initial direction based on current language
  useEffect(() => {
    if (language === "he") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "he";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}; 
