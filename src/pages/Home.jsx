
import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import About from "./About";
import Services from "./Services";
import Work from "./Work";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({ ignoreMobileResize: true });

const SplitChars = ({ text }) =>
  Array.from(text).map((char, index) => (
    <span className="hero-char-mask" key={`${char}-${index}`}>
      <span className="hero-char">{char}</span>
    </span>
  ));

const SplitWords = ({ text }) => {
  const words = text.split(" ");

  return words.map((word, index) => (
    <React.Fragment key={`${word}-${index}`}>
      <span className="hero-word-mask">
        <span className="hero-word">{word}</span>
      </span>
      {index < words.length - 1 ? " " : null}
    </React.Fragment>
  ));
};

function Home() {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const videoRef = useRef(null);

  const primaryButtonRef = useRef(null);
  const secondaryButtonRef = useRef(null);

  const aboutRef = useRef(null);

  const handleViewWork = (event) => {
    const target = document.getElementById("work");

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const content = contentRef.current;
    const video = videoRef.current;

    if (!hero || !content) return undefined;

    let cancelled = false;
    let refreshFrame = 0;
    let introTimer = 0;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /*
     * Combine refresh requests into one animation frame.
     * Fonts, video metadata and window load can all request a refresh.
     */
    const scheduleRefresh = () => {
      if (cancelled || refreshFrame) return;

      refreshFrame = requestAnimationFrame(() => {
        refreshFrame = 0;

        if (!cancelled) {
          ScrollTrigger.refresh();
        }
      });
    };

    const handleMouseMove = (event) => {
      const rect = hero.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const moveX = (x / rect.width - 0.5) * 10;
      const moveY = (y / rect.height - 0.5) * 10;

      content.style.setProperty("--mouse-x", `${moveX}px`);
      content.style.setProperty("--mouse-y", `${moveY}px`);
    };

    const handleMouseLeave = () => {
      content.style.setProperty("--mouse-x", "0px");
      content.style.setProperty("--mouse-y", "0px");
    };

    const createMagneticButton = (button) => {
      if (!button) return () => {};

      const handleMove = (event) => {
        const rect = button.getBoundingClientRect();

        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        const strength = 0.25;

        button.style.setProperty(
          "--magnetic-x",
          `${x * strength}px`
        );

        button.style.setProperty(
          "--magnetic-y",
          `${y * strength}px`
        );
      };

      const handleLeave = () => {
        button.style.setProperty("--magnetic-x", "0px");
        button.style.setProperty("--magnetic-y", "0px");
      };

      button.addEventListener("mousemove", handleMove);
      button.addEventListener("mouseleave", handleLeave);

      return () => {
        button.removeEventListener("mousemove", handleMove);
        button.removeEventListener("mouseleave", handleLeave);
        button.style.setProperty("--magnetic-x", "0px");
        button.style.setProperty("--magnetic-y", "0px");
      };
    };

    hero.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });
    hero.addEventListener("mouseleave", handleMouseLeave);

    const cleanupPrimary = createMagneticButton(
      primaryButtonRef.current
    );
    const cleanupSecondary = createMagneticButton(
      secondaryButtonRef.current
    );

    const handleVideoMetadata = () => scheduleRefresh();

    if (video) {
      video.addEventListener("loadedmetadata", handleVideoMetadata);
      video.play().catch(() => {});
    }

    /*
     * HERO INTRO ANIMATION
     * Preserves the original text and button reveal.
     */
    const introCtx = gsap.context(() => {
      if (reduceMotion) return;

      const topItems = gsap.utils.toArray("[data-hero-top]", hero);
      const topLine = hero.querySelector(".hero-top-line");
      const eyebrow = hero.querySelector("[data-hero-eyebrow]");

      const firstChars = gsap.utils.toArray(
        ".hero-heading-first .hero-char",
        hero
      );
      const secondChars = gsap.utils.toArray(
        ".hero-heading-second .hero-char",
        hero
      );

      const words = gsap.utils.toArray(".hero-word", hero);
      const actions = hero.querySelector(".home-hero-actions");
      const bottom = hero.querySelector(".home-hero-bottom");

      gsap.set(topItems, { yPercent: 125 });
      gsap.set(topLine, {
        scaleX: 0,
        transformOrigin: "left center",
      });
      gsap.set(eyebrow, { yPercent: 125 });

      gsap.set([...firstChars, ...secondChars], {
        yPercent: 118,
        rotate: 8,
        transformOrigin: "0% 100%",
      });

      gsap.set(words, { yPercent: 118 });
      gsap.set([actions, bottom], {
        autoAlpha: 0,
        y: 26,
      });

      const intro = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out" },
      });

      intro
        .to(
          topLine,
          {
            scaleX: 1,
            duration: 1.4,
            ease: "power3.inOut",
          },
          0.15
        )
        .to(
          topItems,
          { yPercent: 0, duration: 1.1, stagger: 0.12 },
          0.25
        )
        .to(eyebrow, { yPercent: 0, duration: 1.1 }, 0.45)
        .to(
          firstChars,
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.25,
            stagger: 0.055,
          },
          0.5
        )
        .to(
          secondChars,
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.25,
            stagger: 0.055,
          },
          0.72
        )
        .to(
          words,
          {
            yPercent: 0,
            duration: 1,
            stagger: 0.03,
            ease: "power4.out",
          },
          1.0
        )
        .to(
          actions,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          },
          1.25
        )
        .to(
          bottom,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          },
          1.4
        );

      const startIntro = () => {
        if (!cancelled) intro.play();
      };

      if (document.fonts?.ready) {
        introTimer = window.setTimeout(startIntro, 1200);

        document.fonts.ready.then(() => {
          if (cancelled) return;

          window.clearTimeout(introTimer);
          introTimer = 0;
          startIntro();
          scheduleRefresh();
        });
      } else {
        startIntro();
      }
    }, hero);

    /*
     * ABOUT PIN / REVEAL
     * The original pinned hero effect remains in place.
     */
    const ctx = gsap.context(() => {
      if (!aboutRef.current) return;

      gsap.set(aboutRef.current, {
        yPercent: 100,
      });

      gsap.to(aboutRef.current, {
        yPercent: 0,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          pin: hero,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, hero);

    scheduleRefresh();

    const handleWindowLoad = () => scheduleRefresh();

    if (document.readyState !== "complete") {
      window.addEventListener("load", handleWindowLoad, {
        once: true,
      });
    }

    if (video?.readyState >= 1) {
      scheduleRefresh();
    }

    return () => {
      cancelled = true;

      if (refreshFrame) {
        cancelAnimationFrame(refreshFrame);
      }

      if (introTimer) {
        window.clearTimeout(introTimer);
      }

      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);

      if (video) {
        video.removeEventListener(
          "loadedmetadata",
          handleVideoMetadata
        );
      }

      window.removeEventListener("load", handleWindowLoad);

      cleanupPrimary();
      cleanupSecondary();

      introCtx.revert();
      ctx.revert();
    };
  }, []);

  return (
    <main className="home-page">
      {/* FULL SCREEN HERO */}
      <section ref={heroRef} className="home-hero">
        <video
          ref={videoRef}
          className="home-hero-video"
          src="/videos/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />

        <div className="home-hero-overlay" />

        <div ref={contentRef} className="home-hero-content">
          <div className="home-hero-top">
            <span className="hero-line-mask">
              <span className="hero-line-inner" data-hero-top>
                FULL-STACK DEVELOPER
              </span>
            </span>

            <span className="hero-line-mask hero-top-right">
              <span className="hero-line-inner" data-hero-top>
                PAKISTAN — 2026
              </span>
            </span>

            <div className="hero-top-line" aria-hidden="true" />
          </div>

          <div className="home-hero-main">
            <p className="home-hero-eyebrow">
              <span className="hero-line-mask">
                <span className="hero-line-inner" data-hero-eyebrow>
                  DIGITAL EXPERIENCES
                </span>
              </span>
            </p>

            <h1
              className="home-hero-heading"
              aria-label="FAISAL MUSTAFA"
            >
              <span
                className="hero-heading-word hero-heading-first"
                aria-hidden="true"
              >
                <SplitChars text="FAISAL" />
              </span>

              <span
                className="hero-heading-word hero-heading-second"
                aria-hidden="true"
              >
                <SplitChars text="MUSTAFA" />
              </span>
            </h1>

            <p className="home-hero-description">
              <SplitWords text="Building modern digital experiences, intelligent products, and scalable full-stack solutions." />
            </p>

            <div className="home-hero-actions">
              <a
                ref={primaryButtonRef}
                href="/#work"
                onClick={handleViewWork}
                className="hero-button hero-button-primary"
              >
                <span>View Work</span>
              </a>

              <Link
                ref={secondaryButtonRef}
                to="/contact"
                className="hero-button hero-button-secondary"
              >
                <span>Let's Talk</span>
              </Link>
            </div>
          </div>

          <div className="home-hero-bottom">
            <span className="hero-scroll-label">
              SCROLL TO EXPLORE
            </span>

            <span className="hero-scroll-line" />

            <span className="hero-scroll-arrow" aria-hidden="true">
              ↓
            </span>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        id="about"
        ref={aboutRef}
        className="home-about-layer"
      >
        <About />
      </section>

      {/* SERVICES SECTION */}
      <section className="home-services-layer">
        <Services />
      </section>

      {/* WORK SECTION */}
      <section
        id="work"
        className="home-work-layer"
        style={{
          position: "relative",
          zIndex: 5,
          width: "100%",
          background: "#DFDDDC",
        }}
      >
        <Work />
      </section>
    </main>
  );
}

export default Home;
