const EMAIL = "priyansh10work@gmail.com";

export default function Contact() {
  return (
    <section className="contact" id="contact" aria-label="Contact">
      <div>
        <h2>Got something that keeps breaking?</h2>
        <div className="contact-row">
          <a className="email" id="email" href={`mailto:${EMAIL}`} aria-label={EMAIL}>
            {EMAIL.split("").map((c, i) => (
              <span className="ch" key={i} aria-hidden="true">
                {c}
              </span>
            ))}
          </a>
        </div>
        <div className="contact-row">
          <a className="btn magnetic" href={`mailto:${EMAIL}`}>
            Email me
          </a>
        </div>
      </div>
      <footer>
        <span>Made in Bengaluru</span>
        <nav>
          <a href="https://github.com/Priyansh10ff">GitHub</a>
          <a href="https://www.linkedin.com/in/priyansh-dugar-709333363/">LinkedIn</a>
          <a href="https://x.com/_Priyansh_10">X</a>
          <a href="https://leetcode.com/u/_priyansh_10">LeetCode</a>
        </nav>
      </footer>
    </section>
  );
}