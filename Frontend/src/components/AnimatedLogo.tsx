import "./AnimatedLogo.css";

const AnimatedLogo = () => {
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
          <div className="book-spine" />
          <div className="book-cover" />
          <div className="page page-1" />
          <div className="page page-2" />
          <div className="page page-3" />

          <div className="bulb-container">
            <div className="light-ray ray-1" />
            <div className="light-ray ray-2" />
            <div className="light-ray ray-3" />
            <div className="bulb">
              <div className="bulb-base" />
            </div>
          </div>
        </div>

        <div className="brand-name">
          <span className="study">Learnly</span>
          <span className="hub">.AI</span>
        </div>
        <div className="tagline">Learn smarter. Shine brighter.</div>
      </div>
    </div>
  );
};

export default AnimatedLogo;

