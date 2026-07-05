import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getContent, getContentSource, clearContentCache } from "../lib/content";

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);

  const reloadContent = useCallback(async () => {
    clearContentCache();
    try {
      const data = await getContent();
      setContent(data);
      setSource(getContentSource());
      return data;
    } catch (err) {
      console.warn("[content] reload failed:", err.message);
      return null;
    }
  }, []);

  useEffect(() => {
    reloadContent().finally(() => setLoading(false));
  }, [reloadContent]);

  return (
    <ContentContext.Provider value={{ content, loading, source, reloadContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
