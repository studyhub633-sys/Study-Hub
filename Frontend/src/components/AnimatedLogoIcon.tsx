import "./AnimatedLogoIcon.css";

const AnimatedLogoIcon = () => {
  return (
    <div className="logo-icon-shell" aria-label="Study Spark Hub animated logo">
      <div className="logo-icon-scale">
        <div className="logo-book-icon">
          <div className="logo-book-spine" />
          <div className="logo-book-cover" />
          <div className="logo-page logo-page-1" />
          <div className="logo-page logo-page-2" />
          <div className="logo-page logo-page-3" />

          <div className="logo-bulb-container">
            <div className="logo-light-ray logo-ray-1" />
            <div className="logo-light-ray logo-ray-2" />
            <div className="logo-light-ray logo-ray-3" />
            <div className="logo-bulb">
              <div className="logo-bulb-base" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLogoIcon;

