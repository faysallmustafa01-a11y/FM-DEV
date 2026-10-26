import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LocomotiveScroll from "locomotive-scroll";
import "./About.css";

const timeline = [
  {
    date: "2023 — 2025",
    title: "Intermediate in Commerce",
    meta: "Studied business and economics, which helps me understand client needs better.",
  },
  {
    date: "Now",
    title: "Open for work",
    meta: "Freelance projects and full-time jobs.",
  },
];

const chatLetters = "chat?".split("");

const About = () => {
  const sectionRef = useRef(null);

  /* Locomotive Scroll v5 (smooth scroll on top of native scroll) */
  useEffect(() => {
    const scroll = new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.08,
        smoothWheel: true,
      },
    });

    return () => {
      scroll.destroy();
    };
  }, []);

  /* Scroll reveal */
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const revealElements = section.querySelectorAll("[data-abt-reveal]");

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  /* Button: red fill follows the cursor */
  const handleBtnMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return (
      <section ref={sectionRef} className="abt-section" data-scroll-section>
        <div className="abt-container">
          {/* HEADING */}
          <header className="abt-head">
            <h1 className="abt-title" data-abt-reveal>
              <span className="abt-mask">
                <span className="abt-line abt-solid">About</span>
              </span>
              <span className="abt-mask">
                <span className="abt-line abt-outline">Me</span>
              </span>
            </h1>
          </header>

          {/* INTRODUCTION */}
          <div className="abt-intro">
            <div className="abt-intro-text">
              <p
                className="abt-para abt-reveal"
                data-abt-reveal
                style={{ "--d": "0.05s" }}
              >
                I'm a 21-year-old Full-Stack Developer and AI Automation
                Engineer based in Lahore, Pakistan. My journey started with an
                interest in freelancing and the beautiful website designs I came
                across online. I became curious about how these designs were
                built, and that curiosity inspired me to create my own digital
                experiences.
              </p>

              <p
                className="abt-para abt-reveal"
                data-abt-reveal
                style={{ "--d": "0.1s" }}
              >
                I work with React.js, Next.js, JavaScript, Node.js, Python, and
                MongoDB, combining development with a strong interest in UI/UX
                design. I enjoy turning ideas into websites and applications
                that look great, work smoothly, and solve real problems.
              </p>

              <p
                className="abt-para abt-reveal"
                data-abt-reveal
                style={{ "--d": "0.15s" }}
              >
                Beyond web development, I'm exploring the possibilities of AI,
                LLMs, chatbots, and automation to build smarter digital
                solutions. I love experimenting with new tools, discovering
                creative ideas, and finding better ways to bring things to life.
              </p>

              <p
                className="abt-para abt-reveal"
                data-abt-reveal
                style={{ "--d": "0.2s" }}
              >
                My goal is to combine creativity, technology, and
                problem-solving to build useful digital products and work with
                clients around the world. For me, the best part of development
                is turning a simple idea into something meaningful.
              </p>
            </div>
          </div>

          {/* BACKGROUND / TIMELINE */}
          <section className="abt-block">
            <span className="abt-eyebrow abt-reveal" data-abt-reveal>
              background
            </span>

            <h2 className="abt-h2 abt-big" data-abt-reveal>
              <span className="abt-mask">
                <span className="abt-line abt-solid">The path</span>
              </span>
              <span className="abt-mask">
                <span className="abt-line abt-outline">so far.</span>
              </span>
            </h2>

            <ol className="abt-timeline">
              {timeline.map((row, i) => (
                <li
                  key={row.title}
                  className="abt-row abt-reveal"
                  data-abt-reveal
                  style={{ "--d": `${i * 0.08}s` }}
                >
                  <span className="abt-row-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="abt-row-date">{row.date}</span>

                  <div className="abt-row-main">
                    <h3>{row.title}</h3>
                    <p>{row.meta}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* CTA */}
          <section className="abt-block abt-cta">
            <div className="abt-cta-head">
              <span className="abt-eyebrow abt-reveal" data-abt-reveal>
                want to
              </span>

              <h2
                className="abt-h2 abt-gradient"
                data-abt-reveal
                aria-label="chat?"
              >
                <span className="abt-mask">
                  <span className="abt-line" aria-hidden="true">
                    {chatLetters.map((letter, i) => (
                      <span
                        key={i}
                        className="abt-letter"
                        style={{ "--i": i }}
                      >
                        {letter}
                      </span>
                    ))}
                  </span>
                </span>
              </h2>
            </div>

            <div className="abt-cta-body">
              <p
                className="abt-para abt-reveal"
                data-abt-reveal
                style={{ "--d": "0.1s" }}
              >
                Got a project in mind? I'd love to hear about it.
              </p>

              <Link
                to="/contact"
                className="abt-btn abt-reveal"
                data-abt-reveal
                style={{ "--d": "0.18s" }}
                onMouseEnter={handleBtnMove}
                onMouseMove={handleBtnMove}
              >
                <span>Contact me</span>
                <span className="abt-btn-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </section>
        </div>
      </section>
  );
};

export default About;