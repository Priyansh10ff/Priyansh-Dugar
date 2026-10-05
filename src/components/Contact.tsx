import { PROFILE } from "@/data/projects";
import { F1_MODEL_CREDIT } from "@/data/content";

export default function Contact() {
  const EMAIL = PROFILE.email;
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
          <a className="btn ghost magnetic" href={PROFILE.links.resume} target="_blank" rel="noopener noreferrer">
            Resume
          </a>
        </div>
      </div>
      <footer>
        <span>
          Made in Bengaluru · {new Date().getFullYear()}
          {F1_MODEL_CREDIT.author && (
            <>
              {" · "}
              <a href={F1_MODEL_CREDIT.href} target="_blank" rel="noopener noreferrer">
                {F1_MODEL_CREDIT.title}
              </a>{" "}
              by {F1_MODEL_CREDIT.author}
            </>
          )}
        </span>
        <nav>
          <a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={PROFILE.links.x} target="_blank" rel="noopener noreferrer">X</a>
          <a href={PROFILE.links.leetcode} target="_blank" rel="noopener noreferrer">LeetCode</a>
          <a href={PROFILE.links.codeforces} target="_blank" rel="noopener noreferrer">Codeforces</a>
          <a href={PROFILE.links.huggingface} target="_blank" rel="noopener noreferrer">Hugging Face</a>
        </nav>
      </footer>
    </section>
  );
}
