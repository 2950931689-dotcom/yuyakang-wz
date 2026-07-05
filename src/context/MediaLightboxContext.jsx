import { createContext, useCallback, useContext, useMemo, useState } from "react";

/** @typedef {{ type: "image" | "video", src: string, poster?: string, title?: object, description?: object, alt?: string }} MediaItem */

const MediaLightboxContext = createContext(null);

export function MediaLightboxProvider({ children }) {
  const [open, setOpen] = useState(false);
  /** @type {[MediaItem[], React.Dispatch<React.SetStateAction<MediaItem[]>>]} */
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);

  const openLightbox = useCallback((nextItems, startIndex = 0) => {
    if (!nextItems?.length) return;
    setItems(nextItems);
    setIndex(Math.min(Math.max(startIndex, 0), nextItems.length - 1));
    setOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setOpen(false);
  }, []);

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : items.length - 1));
  }, [items.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < items.length - 1 ? i + 1 : 0));
  }, [items.length]);

  const value = useMemo(
    () => ({ open, items, index, openLightbox, closeLightbox, goPrev, goNext, setIndex }),
    [open, items, index, openLightbox, closeLightbox, goPrev, goNext]
  );

  return (
    <MediaLightboxContext.Provider value={value}>
      {children}
    </MediaLightboxContext.Provider>
  );
}

export function useMediaLightbox() {
  const ctx = useContext(MediaLightboxContext);
  if (!ctx) throw new Error("useMediaLightbox must be used within MediaLightboxProvider");
  return ctx;
}
