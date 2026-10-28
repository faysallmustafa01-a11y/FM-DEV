
import React, { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "./Contact.css";

import bgDesktop from "../assets/lets-talk.svg";
import bgMobile from "../assets/lets-talk.mob.svg";

const EMAIL = "m.fais.dev@gmail.com";

const EMAILJS_SERVICE_ID = "service_e08t3zj";
const EMAILJS_TEMPLATE_ID = "template_47a73e5";
const EMAILJS_PUBLIC_KEY = "i-SQj3R5TfGQEJRj7";

/* Splits text into animated letters */
const Chars = ({ text, start = 0 }) =>
  text.split("").map((ch, i) => (
    <span key={i} className="ct-char" style={{ "--i": start + i }}>
      {ch}
    </span>
  ));

const Contact = () => {
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [sending, setSending] = useState(false);

  const pageRef = useRef(null);
  const btnRef = useRef(null);
  const loadedRef = useRef(false);

  /* Page-load reveal */
  useEffect(() => {
    let frame1 = 0;
    let frame2 = 0;

    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        setReady(true);
      });
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, []);

  /*
   * Scroll reveal.
   * No global smooth-scroll override and no scroll-linked
   * style updates, so native browser scrolling stays responsive.
   */
  useEffect(() => {
    if (!ready) return;

    const root = pageRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll(".ct-fade"));

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("ct-in"));
      return;
    }

    const timer = window.setTimeout(() => {
      loadedRef.current = true;
    }, 1600);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          const repeat = el.hasAttribute("data-repeat");

          if (entry.isIntersecting) {
            if (loadedRef.current) {
              el.style.setProperty("--d", "0s");
            }

            el.classList.add("ct-in");

            if (!repeat) {
              observer.unobserve(el);
            }
          } else if (repeat) {
            const leftAbove = entry.boundingClientRect.top < 0;

            el.style.setProperty("--dir", leftAbove ? "-1" : "1");
            el.style.setProperty("--d", "0s");
            el.classList.remove("ct-in");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px 30px 0px",
      }
    );

    items.forEach((el) => observer.observe(el));

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [ready]);

  /* Magnetic submit button on mouse devices only */
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!fine || reduce) return;

    const RANGE = 80;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let px = 0;
    let py = 0;
    let raf = 0;
    let moved = false;

    const frame = () => {
      raf = 0;

      if (moved) {
        moved = false;

        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = px - centerX;
        const dy = py - centerY;

        const outX = Math.max(Math.abs(dx) - rect.width / 2, 0);
        const outY = Math.max(Math.abs(dy) - rect.height / 2, 0);

        if (Math.hypot(outX, outY) < RANGE) {
          tx = dx * 0.3;
          ty = dy * 0.4;
        } else {
          tx = 0;
          ty = 0;
        }
      }

      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;

      btn.style.setProperty("--mx", `${cx.toFixed(2)}px`);
      btn.style.setProperty("--my", `${cy.toFixed(2)}px`);

      if (
        Math.abs(tx - cx) > 0.05 ||
        Math.abs(ty - cy) > 0.05
      ) {
        raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (event) => {
      px = event.clientX;
      py = event.clientY;
      moved = true;

      if (!raf) {
        raf = requestAnimationFrame(frame);
      }
    };

    const onLeaveDoc = () => {
      tx = 0;
      ty = 0;
      moved = false;

      if (!raf) {
        raf = requestAnimationFrame(frame);
      }
    };

    window.addEventListener("pointermove", onMove, {
      passive: true,
    });
    document.addEventListener("mouseleave", onLeaveDoc);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeaveDoc);

      if (raf) {
        cancelAnimationFrame(raf);
      }

      btn.style.removeProperty("--mx");
      btn.style.removeProperty("--my");
    };
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (status) {
      setStatus("");
      setStatusType("");
    }
  };

  /* Submit contact form through EmailJS */
  const onSubmit = async (event) => {
    event.preventDefault();

    if (sending) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      setStatus("Please fill in all fields.");
      setStatusType("error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setStatus("Please enter a valid email address.");
      setStatusType("error");
      return;
    }

    setSending(true);
    setStatus("Sending your message...");
    setStatusType("loading");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          from_email: email,
          message,
        },
        {
          publicKey: EMAILJS_PUBLIC_KEY,
        }
      );

      setStatus(
        "Message sent successfully! I'll get back to you soon."
      );
      setStatusType("success");

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("EmailJS submission failed:", error);

      setStatus(
        "Couldn't send your message. Please try again or email me directly."
      );
      setStatusType("error");
    } finally {
      setSending(false);
    }
  };

  const backToTop = (event) => {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="ct-scroll-container">
      <main
        id="contact"
        ref={pageRef}
        className={`contact-page ${ready ? "ct-ready" : ""}`}
      >
        <picture className="ct-bg" aria-hidden="true">
          <source media="(max-width: 650px)" srcSet={bgMobile} />
          <img src={bgDesktop} alt="" draggable="false" />
        </picture>

        <div className="ct-inner">
          <header className="ct-header">
            <h1 className="ct-title" aria-label="LET'S TALK">
              <span className="ct-mask" aria-hidden="true">
                <span className="ct-line">
                  <Chars text="LET'S" />
                </span>
              </span>

              <span
                className="ct-mask ct-mask-2"
                aria-hidden="true"
              >
                <span className="ct-line ct-outline">
                  <Chars text="TALK" start={5} />
                </span>
              </span>
            </h1>
          </header>

          <div className="ct-grid">
            {/* LEFT: CONTACT DETAILS */}
            <aside className="ct-info">
              <div
                className="ct-block ct-fade"
                data-repeat
                style={{ "--d": "0.35s" }}
              >
                <span className="ct-label">Write to me</span>

                <a
                  className="ct-email ct-link"
                  href={`mailto:${EMAIL}`}
                  aria-label={EMAIL}
                >
                  <span
                    className="ct-email-text"
                    aria-hidden="true"
                  >
                    {EMAIL.split("").map((ch, i) => (
                      <span
                        key={i}
                        className="ct-ec"
                        style={{ "--i": i }}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                </a>
              </div>

              <div
                className="ct-block ct-fade"
                style={{ "--d": "0.45s" }}
              >
                <span className="ct-label">Availability</span>

                <p className="ct-text ct-availability">
                  <span
                    className="ct-availability-dot"
                    aria-hidden="true"
                  />
                  <span>
                    Open for freelance projects and full-time jobs.
                  </span>
                </p>
              </div>
            </aside>

            {/* RIGHT: CONTACT FORM */}
            <form
              className="ct-form"
              onSubmit={onSubmit}
              noValidate
            >
              <div
                className="ct-field ct-fade"
                style={{ "--d": "0.4s" }}
              >
                <label htmlFor="ct-name">01 — Your name</label>

                <input
                  id="ct-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={onChange}
                  maxLength={100}
                  required
                  disabled={sending}
                />
              </div>

              <div
                className="ct-field ct-fade"
                style={{ "--d": "0.5s" }}
              >
                <label htmlFor="ct-email">02 — Your email</label>

                <input
                  id="ct-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={onChange}
                  maxLength={254}
                  required
                  disabled={sending}
                />
              </div>

              <div
                className="ct-field ct-fade"
                style={{ "--d": "0.7s" }}
              >
                <label htmlFor="ct-message">
                  03 — Tell us your idea
                </label>

                <textarea
                  id="ct-message"
                  name="message"
                  rows="4"
                  placeholder="A few lines about your project..."
                  value={form.message}
                  onChange={onChange}
                  maxLength={5000}
                  required
                  disabled={sending}
                />
              </div>

              <div
                className="ct-submit-row ct-fade"
                style={{ "--d": "0.8s" }}
              >
                <button
                  ref={btnRef}
                  type="submit"
                  className="ct-submit"
                  disabled={sending}
                  aria-busy={sending}
                >
                  <span className="ct-submit-text">
                    {sending ? "Sending..." : "Send message"}
                  </span>

                  <span
                    className="ct-submit-arrow"
                    aria-hidden="true"
                  >
                    {sending ? "…" : "→"}
                  </span>
                </button>

                <p
                  className={`ct-status ${
                    statusType ? `ct-status-${statusType}` : ""
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {status}
                </p>
              </div>
            </form>
          </div>

          <footer
            className="ct-bottom ct-fade"
            style={{ "--d": "0.9s" }}
          >
            <span>
              © {new Date().getFullYear()} ALL RIGHTS RESERVED
            </span>

            <a
              className="ct-link"
              href="#top"
              onClick={backToTop}
            >
              BACK TO TOP ↑
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Contact;
