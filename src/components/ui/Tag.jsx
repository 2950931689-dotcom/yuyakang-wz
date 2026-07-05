export default function Tag({ children, featured = false, className = "" }) {
  return (
    <span className={`tag ${featured ? "tag--featured" : ""} ${className}`.trim()}>
      {children}
    </span>
  );
}
