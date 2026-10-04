export default function Loader() {
  return (
    <div className="loader" id="loader" aria-hidden="true">
      <div className="loader-half top" />
      <div className="loader-half bottom" />
      <svg viewBox="0 0 1000 60" preserveAspectRatio="none">
        <path id="loaderPath" pathLength="1" d="M0 30 C 160 4, 320 56, 500 30 S 840 4, 1000 30" />
      </svg>
      <div className="loader-count">
        <span id="count">0</span>
      </div>
      <div className="loader-note">Threading the needle</div>
    </div>
  );
}
