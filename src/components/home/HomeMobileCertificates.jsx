import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getVisibleCertificates } from "../../lib/content";
import CertificationRack from "../about/CertificationRack";

/** Mobile-only homepage certificate rack — reuses About page component & CMS data. */
export default function HomeMobileCertificates() {
  const { content } = useContent();
  const { lang } = useLanguage();

  if (!content) return null;

  const certificates = getVisibleCertificates(content);
  if (!certificates.length) return null;

  return (
    <div className="home-mobile-certificates">
      <CertificationRack certificates={certificates} lang={lang} />
    </div>
  );
}
