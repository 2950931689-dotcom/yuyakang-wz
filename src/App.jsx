import { ContentProvider } from "./context/ContentContext";
import { LanguageProvider } from "./context/LanguageContext";
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
        <AppRouter />
      </ContentProvider>
    </LanguageProvider>
  );
}
