export default function Button({
  children,
  variant = "primary",
  className = "",
  as: Tag = "button",
  ...props
}) {
  return (
    <Tag className={`btn btn--${variant} ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}
