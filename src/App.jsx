import { ContentProvider } from "./context/ContentContext";
import { LanguageProvider } from "./context/LanguageContext";
import { MediaLightboxProvider } from "./context/MediaLightboxContext";
import MediaLightbox from "./components/ui/MediaLightbox";
import AppRouter from "./app/router";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/mobile.css";
import "./styles/admin.css";

export default function App() {
  return (
    <LanguageProvider>
      <ContentProvider>
        <MediaLightboxProvider>
          <AppRouter />
          <MediaLightbox />
        </MediaLightboxProvider>
      </ContentProvider>
    </LanguageProvider>
  );
}
