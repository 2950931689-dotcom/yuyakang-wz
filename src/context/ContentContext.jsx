import { createContext, useContext, useEffect, useState } from "react";
import { getContent, getContentSource } from "../lib/content";

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);

  useEffect(() => {
    getContent()
      .then((data) => {
        setContent(data);
        setSource(getContentSource());
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading, source }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
