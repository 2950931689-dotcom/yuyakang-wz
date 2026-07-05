import { ExternalLink } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getUiText } from "../../lib/content";
import Button from "./Button";

export default function ExternalLinkButton({
  href,
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const { lang } = useLanguage();
  const empty = !href?.trim();

  if (empty || disabled) {
    return (
      <Button variant={variant} className={className} disabled>
        {empty ? getUiText("notConfigured", lang) : children}
      </Button>
    );
  }

  return (
    <Button
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      className={`external-link-btn ${className}`.trim()}
      {...props}
    >
      {children}
      <ExternalLink size={14} strokeWidth={1.5} className="external-link-btn__icon" aria-hidden="true" />
    </Button>
  );
}
