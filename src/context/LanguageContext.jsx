import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const STORAGE_KEY = "yuyakang-lang";

export function LanguageProvider({ children, defaultLang = "cn" }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || defaultLang;
    } catch {
      return defaultLang;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang: (next) => setLangState(next === "en" ? "en" : "cn"),
      toggleLang: () => setLangState((l) => (l === "cn" ? "en" : "cn")),
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
