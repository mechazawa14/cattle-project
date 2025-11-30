import React, { createContext, useState, useContext } from 'react';

// 1. Define the text in simple JSON objects, as per the plan
const translations = {
  en: {
    startButton: 'Start New Identification',
    breedHeader: 'Breed'
  },
  hi: {
    startButton: 'नई पहचान शुरू करें', // [cite: 49]
    breedHeader: 'नस्ल' // [cite: 50]
  }
};

// 2. Create the "context" itself
const LanguageContext = createContext();

// 3. Create a "Provider" component. This is the component
//    that will "provide" the language data to our app.
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en'); // Default to English

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === 'en' ? 'hi' : 'en'));
  };

  // Get the correct text for the current language
  const text = translations[language];

  return (
    <LanguageContext.Provider value={{ language, text, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 4. Create a "hook" to make it easy for components to USE the context
export const useLanguage = () => {
  return useContext(LanguageContext);
};