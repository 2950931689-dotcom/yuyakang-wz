import { createContext, useCallback, useContext, useEffect, useState } from "react";
import mockData from "../data/site-content.mock.json";
import { getContent, getContentSource, clearContentCache } from "../lib/content";
import { normalizeContent } from "../lib/contentDefaults";

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
      console.warn("[content] reload failed, using mock fallback:", err.message);
      const fallback = normalizeContent(mockData);
      setContent(fallback);
      setSource("mock");
      return fallback;
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
