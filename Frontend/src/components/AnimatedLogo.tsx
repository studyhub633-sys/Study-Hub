import { useTheme } from "../contexts/ThemeContext";
import "./AnimatedLogo.css";

const AnimatedLogo = () => {
  const { theme } = useTheme();

  return (
    <div className="studyhub-logo-shell">
      <div className="studyhub-logo-particles">
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
      </div>

      <div className="studyhub-logo">
        <div className="book-icon">
          <img
            src={theme === "dark" ? "/images/darkmode.png" : "/images/lightmode.png"}
            alt="Scientia.ai Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="brand-name">
          <span className="study">Scientia</span>
          <span className="hub">.ai</span>
        </div>
        <div className="tagline">Learn smarter. Shine brighter.</div>
      </div>
    </div>
  );
};

export default AnimatedLogo;

