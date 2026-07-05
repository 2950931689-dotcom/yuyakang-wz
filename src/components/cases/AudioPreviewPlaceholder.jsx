import { useLanguage } from "../../context/LanguageContext";

export default function AudioPreviewPlaceholder() {
  const { lang } = useLanguage();

  return (
    <div className="audio-placeholder">
      {lang === "cn"
        ? "音频试听播放器将在下一阶段接入"
        : "Audio preview player will be integrated in the next phase"}
    </div>
  );
}
