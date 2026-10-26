import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Services.css";

import Service1 from "../assets/service-1.jpg";
import Service2 from "../assets/service-2.jpg";
import Service3 from "../assets/service-3.jpg";
import Service4 from "../assets/service-4.jpg";

import Process1 from "../assets/process-1.jpg";
import Process2 from "../assets/process-2.jpg";
import Process3 from "../assets/process-3.jpg";
import Process4 from "../assets/process-4.jpg";
import Process5 from "../assets/process-5.jpg";
import Process6 from "../assets/process-6.jpg";

gsap.registerPlugin(ScrollTrigger);

// Mobile address-bar show/hide should not trigger a full refresh (causes jumps)
ScrollTrigger.config({ ignoreMobileResize: true });

const services = [
  { id: "01", title: "Web Development", text: "Fast, scalable, and modern websites built around your business goals." },
  { id: "02", title: "AI Automations", text: "Smart AI-powered workflows that reduce repetitive work and save time." },
  { id: "03", title: "UI/UX Design", text: "Clean, intuitive interfaces designed to make digital products easier to use." },
  { id: "04", title: "Web Apps", text: "Interactive web applications built for performance, usability, and growth." },
  { id: "05", title: "SaaS Development", text: "Scalable SaaS products designed from the idea stage to production." },
  { id: "06", title: "API & Backend Development", text: "Reliable backend systems, APIs, databases, and integrations that power your products." },
  { id: "07", title: "Cloud Deployments", text: "Secure and reliable cloud deployments that keep your applications fast, stable, and accessible." },
];

const processSteps = [
  { id: "01", label: "WEB DEVELOPMENT", title: "Web Apps / Frontend Development", text: "High-performance, modern, and interactive user interfaces." },
  { id: "02", label: "AI AUTOMATIONS", title: "AI Automations", text: "Custom AI workflows, agents, and intelligent integrations." },
  { id: "03", label: "UI/UX DESIGN", title: "UI/UX Design", text: "User-centric wireframing, interactive prototyping, and seamless digital experiences." },
  { id: "04", label: "SAAS DEVELOPMENT", title: "SaaS Development", text: "Scalable web application architecture tailored for modern business growth." },
  { id: "05", label: "API & BACKEND DEVELOPMENT", title: "API & Backend Development", text: "Robust, secure server logic and API integrations." },
  { id: "06", label: "CLOUD DEPLOYMENTS", title: "Cloud Deployments", text: "Optimized hosting setup, CI/CD pipelines, and infrastructure management." },
];

const projectImages = [Service1, Service2, Service3, Service4];
const processImages = [Process1, Process2, Process3, Process4, Process5, Process6];

export default function Services() {
  const sectionRef = useRef(null);
  const processRef = useRef(null);
  const processTrackRef = useRef(null);
  const processProgressRef = useRef(null);

  const [activeImage, setActiveImage] = useState(0);

  /* Disable page snap while Services is mounted */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      hs: html.style.scrollSnapType,
      bs: body.style.scrollSnapType,
      hb: html.style.scrollBehavior,
      bb: body.style.scrollBehavior,
    };

    html.style.scrollSnapType = "none";
    body.style.scrollSnapType = "none";
    html.style.scrollBehavior = "auto";
    body.style.scrollBehavior = "auto";

    return () => {
      html.style.scrollSnapType = prev.hs;
      body.style.scrollSnapType = prev.bs;
      html.style.scrollBehavior = prev.hb;
      body.style.scrollBehavior = prev.bb;
    };
  }, []);

  /* Services image slider */
  useEffect(() => {
    const id = setInterval(() => {
      setActiveImage((c) => (c + 1) % projectImages.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  /* Services reveal (also drives the Locomotive-style heading reveal) */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Toggles on enter AND leave, so the animation replays on scroll down and up
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("service-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -4% 0px" }
    );

    section
      .querySelectorAll("[data-service-reveal]")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  /* Locomotive-style in-view reveal for OUR PROCESS heading + cards */
  useEffect(() => {
    const el = processRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("ls-in", entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* =========================================================
     OUR PROCESS: pinned horizontal scroll, then NEXT section
     slides OVER the last panel (so "Cloud Deployments" never
     scrolls away / repeats and there is no extra empty space).

     - Horizontal distance is measured in px (no % maths)
     - Pin is held for a short extra "overlap" while the next
       section / footer covers the pinned screen
     - If there is nothing after this section, it simply unpins
  ========================================================= */
  useLayoutEffect(() => {
    const root = sectionRef.current;
    const section = processRef.current;
    const track = processTrackRef.current;
    const progress = processProgressRef.current;
    if (!root || !section || !track || !progress) return;

    // Find the element that comes right after this whole component
    const findNext = () => {
      let el = root;
      while (el && el !== document.body && !el.nextElementSibling) {
        el = el.parentElement;
      }
      if (!el || el === document.body) return null;

      let candidate = el.nextElementSibling;
      while (candidate) {
        const cs = window.getComputedStyle(candidate);
        const skip =
          ["SCRIPT", "STYLE", "LINK"].includes(candidate.tagName) ||
          cs.display === "none" ||
          cs.position === "fixed" ||
          cs.position === "absolute";
        if (!skip) return candidate;
        candidate = candidate.nextElementSibling;
      }
      return null;
    };

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const next = findNext();

      const saved = next
        ? {
            marginTop: next.style.marginTop,
            position: next.style.position,
            zIndex: next.style.zIndex,
            background: next.style.backgroundColor,
          }
        : null;

      if (next) {
        const cs = window.getComputedStyle(next);
        if (cs.position === "static") next.style.position = "relative";
        next.style.zIndex = "2";
        const bg = cs.backgroundColor;
        if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
          next.style.backgroundColor = "#DFDDDC";
        }
      }

      let dist = 0; // horizontal distance (px)
      let overlap = 0; // extra pinned scroll while next section covers us

      const measure = () => {
        dist = Math.max(0, track.scrollWidth - window.innerWidth);
        overlap = next
          ? Math.min(window.innerHeight, next.offsetHeight)
          : 0;
        if (next) {
          next.style.marginTop = overlap ? `-${overlap}px` : saved.marginTop;
        }
      };

      measure();

      // Horizontal movement finishes first, then pin holds for `overlap`
      const ease = (p) =>
        dist > 0 ? Math.min(1, (p * (dist + overlap)) / dist) : 1;

      const tl = gsap.timeline({
        defaults: { ease },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${dist + overlap}`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
        },
      });

      tl.to(track, { x: () => -dist }, 0).fromTo(
        progress,
        { scaleX: 0 },
        { scaleX: 1 },
        0
      );

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }

      return () => {
        if (next && saved) {
          next.style.marginTop = saved.marginTop;
          next.style.position = saved.position;
          next.style.zIndex = saved.zIndex;
          next.style.backgroundColor = saved.background;
        }
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div id="services" ref={sectionRef} className="services-page">
      {/* SERVICES INTRO */}
      <section className="services-intro">
        <div className="services-intro-header" data-service-reveal>
          <span className="services-eyebrow">WHAT I DO</span>
          <div className="services-title">
            <h1 className="ls-mask">
              <span className="ls-inner ls-our">OUR</span>
            </h1>
            <h1 className="ls-mask">
              <span className="ls-inner ls-outline ls-delay">SERVICES</span>
            </h1>
          </div>
        </div>

        <div className="services-slider" data-service-reveal>
          <div className="services-slider-track">
            {projectImages.map((image, index) => (
              <div
                key={image}
                className={`services-slide ${
                  index === activeImage ? "services-slide-active" : ""
                }`}
              >
                <img src={image} alt={`Project ${index + 1}`} />
              </div>
            ))}
          </div>

          <div className="services-slider-footer">
            <span>SELECTED WORK</span>
            <div className="services-slider-count">
              <span>{String(activeImage + 1).padStart(2, "0")}</span>
              <span>/</span>
              <span>{String(projectImages.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES LIST */}
      <section className="services-list">
        {services.map((service, index) => (
          <article
            key={service.id}
            id={`service-${service.id}`}
            className={`service-screen ${
              index % 2 === 0 ? "service-left" : "service-right"
            }`}
            data-service-reveal
          >
            <div className="service-screen-inner">
              <div className="service-number">{service.id}</div>
              <div className="service-content">
                <span className="service-label">{service.id}</span>
                <h2>{service.title}</h2>
                <p>{service.text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* OUR PROCESS */}
      <section className="services-process" ref={processRef}>
        <div className="services-process-pin">
          <div className="services-process-heading">
            <span className="services-process-eyebrow">HOW I WORK</span>
            <h2 className="services-process-title">
              <span className="ls-mask">
                <span className="ls-inner ls-our">OUR</span>
              </span>
              <span className="ls-mask">
                <span className="ls-inner ls-outline ls-delay">PROCESS</span>
              </span>
            </h2>
          </div>

          <div className="services-process-viewport">
            <div className="services-process-track" ref={processTrackRef}>
              {processSteps.map((step, index) => (
                <article key={step.id} className="services-process-panel">
                  <div className="services-process-inner">
                    <div className="services-process-number">{step.id}</div>

                    <div className="services-process-image">
                      <img
                        src={processImages[index]}
                        alt={step.title}
                        decoding="async"
                        draggable="false"
                      />
                    </div>

                    <div className="services-process-content">
                      <span className="services-process-label">{step.label}</span>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="services-process-progress" aria-hidden="true">
            <span ref={processProgressRef} />
          </div>
        </div>
      </section>
    </div>
  );
}