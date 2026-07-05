import { useTheme } from "../../context/ThemeContext";

export default function ThemeSwitch({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-switch${className ? ` ${className}` : ""}`}
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "切换到白色主题" : "切换到黑色主题"}
      title={theme === "dark" ? "白色主题" : "黑色主题"}
    >
      <span className="theme-switch__icon" aria-hidden="true">
        ◐
      </span>
    </button>
  );
}
