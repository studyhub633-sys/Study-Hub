import { useTheme } from "../contexts/ThemeContext";
import "./AnimatedLogoIcon.css";

const AnimatedLogoIcon = () => {
  const { theme } = useTheme();

  return (
    <div className="logo-icon-shell" aria-label="Revisely.ai animated logo">
      <div className="logo-icon-scale">
        <div className="logo-book-icon">
          <img
            src={theme === "dark" ? "/images/darkmode.png" : "/images/lightmode.png"}
            alt="Revisely.ai Icon"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedLogoIcon;

