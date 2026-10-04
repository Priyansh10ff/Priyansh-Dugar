export default function Nav() {
  return (
    <header className="nav">
      <a className="brand" href="#top">
        Priyansh
      </a>
      <nav>
        <a href="#work">Work</a>
        <a href="#off">Off the clock</a>
        <a className="pill magnetic" href="#contact">
          Say hello
        </a>
      </nav>
    </header>
  );
}