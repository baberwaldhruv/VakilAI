import React, { createContext, useContext, useState, useEffect } from "react";

export const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  toggleLanguage: () => {},
  t: (key) => key,
});

export const translations = {
  en: {
    newChat: "New chat",
    searchChats: "Search chats",
    filterChats: "Filter chats...",
    recent: "Recent",
    clearHistory: "Clear history",
    noConversations: "No conversations yet",
    noMatchingChats: "No matching chats found",
    signOut: "Sign out",
    language: "Language",
    theme: "Theme",
    welcomeTitle: "What should we focus on?",
    welcomeSubtitle: "Select a service to get started or ask anything below",
    askPlaceholder: "Ask VakilAI anything about legal clauses, RTI, or rights...",
    disclaimer: "VakilAI provides legal information, not formal counsel. Verify critical clauses with a lawyer.",
    serviceRtiTitle: "Draft an RTI",
    serviceRtiTag: "RTI Application",
    serviceRtiDesc: "Converts plain-language questions into properly formatted applications for the right department.",
    serviceRightsTitle: "Know your Rights",
    serviceRightsTag: "Legal Advisory",
    serviceRightsDesc: "Explains in simple terms what you can do about tenant, consumer, or workplace disputes.",
    serviceSchemesTitle: "Scheme Eligibility",
    serviceSchemesTag: "Govt Schemes",
    serviceSchemesDesc: "Reads government portals and answers your scheme eligibility questions in plain language."
  },
  hi: {
    newChat: "नई बातचीत",
    searchChats: "चैट खोजें",
    filterChats: "चैट खोजें...",
    recent: "हालिया चैट",
    clearHistory: "इतिहास हटाएं",
    noConversations: "अभी कोई बातचीत नहीं है",
    noMatchingChats: "कोई चैट नहीं मिली",
    signOut: "साइन आउट",
    language: "भाषा",
    theme: "थीम",
    welcomeTitle: "आज हम किस कानूनी विषय पर काम करें?",
    welcomeSubtitle: "शुरुआत करने के लिए कोई सेवा चुनें या नीचे अपना प्रश्न लिखें",
    askPlaceholder: "VakilAI से कानूनी सलाह, RTI या अधिकारों के बारे में पूछें...",
    disclaimer: "VakilAI केवल कानूनी जानकारी प्रदान करता है, औपचारिक कानूनी सलाह नहीं।",
    serviceRtiTitle: "RTI आवेदन तैयार करें",
    serviceRtiTag: "RTI ड्राफ्ट",
    serviceRtiDesc: "सरल भाषा के सवालों को संबंधित विभाग के लिए उचित RTI प्रारूप में बदलता है।",
    serviceRightsTitle: "अपने अधिकार जानें",
    serviceRightsTag: "कानूनी सलाह",
    serviceRightsDesc: "किरायेदार, उपभोक्ता या कार्यस्थल विवादों में आपके कानूनी विकल्पों को समझाता है।",
    serviceSchemesTitle: "योजना पात्रता",
    serviceSchemesTag: "सरकारी योजनाएं",
    serviceSchemesDesc: "सरकारी पोर्टलों के आधार पर आपकी पात्रता की जाँच करके सरल उत्तर देता है।"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("vakilai-lang") || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("vakilai-lang", lang);
    } catch (err) {
      console.error(err);
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key) => {
    return translations?.[lang]?.[key] || translations?.["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: "en",
      setLang: () => {},
      toggleLanguage: () => {},
      t: (k) => k,
    };
  }
  return context;
};