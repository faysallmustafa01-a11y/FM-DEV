import React, {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Home.css";

/*
 * PERFORMANCE: About, Services and Work are below the fold, so they are
 * loaded as separate chunks AFTER the hero intro has finished. This keeps
 * the first JavaScript bundle small and keeps the intro animation smooth.
 */
const About = lazy(() => import("./About"));
const Services = lazy(() => import("./Services"));
const Work = lazy(() => import("./Work"));

const HERO_VIDEO_SRC = "/videos/hero.mp4";
const BELOW_FOLD_SECTIONS = 3;

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({ ignoreMobileResize: true });

/*
 * One shared, debounced ScrollTrigger refresh. Fonts, page load and the
 * lazy sections all ask for a refresh, so the requests are merged into a
 * single refresh instead of several refreshes in a row.
 */
let refreshTimer = 0;

const requestScrollRefresh = () => {
  window.clearTimeout(refreshTimer);

  refreshTimer = window.setTimeout(() => {
    refreshTimer = 0;
    ScrollTrigger.refresh();
  }, 400);
};

/* Asks for a refresh once a lazy section has actually mounted. */
const SectionReady = () => {
  useEffect(() => {
    requestScrollRefresh();
  }, []);

  return null;
};

const SplitChars = ({ text }) =>
  Array.from(text).map((char, index) => (
    <span className="hero-char-mask" key={`${char}-${index}`}>
      <span className="hero-char">{char}</span>
    </span>
  ));

function Home() {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const videoRef = useRef(null);

  const primaryButtonRef = useRef(null);
  const secondaryButtonRef = useRef(null);

  const aboutRef = useRef(null);

  /* Called by the hero intro when it has finished (see below). */
  const revealBelowFoldRef = useRef(() => {});

  /* How many below-the-fold sections are mounted (0 to 3). */
  const [stage, setStage] = useState(0);

  const handleViewWork = (event) => {
    const target = document.getElementById("work");

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /*
   * LOAD BELOW-THE-FOLD SECTIONS
   * They start loading when the hero intro has finished (so the intro
   * animation never competes with them), one by one during idle time.
   * Any user interaction loads all of them immediately.
   */
  useEffect(() => {
    let cancelled = false;
    let handle = 0;
    let usedIdle = false;
    let fallbackTimer = 0;
    let started = false;
    let current = 0;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const interactionEvents = [
      "wheel",
      "touchstart",
      "pointerdown",
      "keydown",
    ];

    const cancelHandle = () => {
      if (!handle) return;

      if (usedIdle && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }

      handle = 0;
    };

    const whenIdle = (callback) => {
      if ("requestIdleCallback" in window) {
        usedIdle = true;
        handle = window.requestIdleCallback(callback, {
          timeout: 1500,
        });
      } else {
        usedIdle = false;
        handle = window.setTimeout(callback, 250);
      }
    };

    const removeInteractionListeners = () => {
      interactionEvents.forEach((name) =>
        window.removeEventListener(name, handleInteraction)
      );
    };

    const advance = () => {
      handle = 0;

      if (cancelled) return;

      current += 1;
      setStage(current);

      if (current < BELOW_FOLD_SECTIONS) {
        whenIdle(advance);
      }
    };

    function handleInteraction() {
      if (cancelled) return;

      started = true;
      window.clearTimeout(fallbackTimer);
      cancelHandle();
      removeInteractionListeners();

      current = BELOW_FOLD_SECTIONS;
      setStage(BELOW_FOLD_SECTIONS);
    }

    const begin = () => {
      if (cancelled || started) return;

      started = true;
      window.clearTimeout(fallbackTimer);
      whenIdle(advance);
    };

    revealBelowFoldRef.current = begin;

    interactionEvents.forEach((name) =>
      window.addEventListener(name, handleInteraction, {
        passive: true,
        once: true,
      })
    );

    const afterLoad = () => {
      if (cancelled) return;

      if (reduceMotion) {
        begin();
      } else {
        /* Safety net: the intro normally starts this much earlier. */
        fallbackTimer = window.setTimeout(begin, 5000);
      }
    };

    if (document.readyState === "complete") {
      afterLoad();
    } else {
      window.addEventListener("load", afterLoad, { once: true });
    }

    return () => {
      cancelled = true;

      window.clearTimeout(fallbackTimer);
      cancelHandle();
      removeInteractionListeners();
      window.removeEventListener("load", afterLoad);
      revealBelowFoldRef.current = () => {};
    };
  }, []);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const content = contentRef.current;
    const video = videoRef.current;

    if (!hero || !content) return undefined;

    let cancelled = false;
    let introTimer = 0;
    let pinFrame = 0;
    let pinTimer = 0;
    let videoTimer = 0;
    let loadFallbackTimer = 0;
    let heroRect = null;
    let pinCtx = null;
    let heroObserver = null;

    /* Video state */
    let offscreen = false;
    let pinReady = false;
    let pageLoaded = document.readyState === "complete";

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scheduleRefresh = () => {
      if (cancelled) return;

      requestScrollRefresh();
    };

    /*
     * The hero rectangle is measured once and reused, instead of being
     * measured on every mouse move (this removes forced reflows).
     */
    const readHeroRect = () => {
      if (!heroRect) {
        heroRect = hero.getBoundingClientRect();
      }

      return heroRect;
    };

    const invalidateHeroRect = () => {
      heroRect = null;
    };

    const handleMouseMove = (event) => {
      const rect = readHeroRect();

      if (!rect.width || !rect.height) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const moveX = (x / rect.width - 0.5) * 10;
      const moveY = (y / rect.height - 0.5) * 10;

      content.style.setProperty("--mouse-x", `${moveX}px`);
      content.style.setProperty("--mouse-y", `${moveY}px`);
    };

    const handleMouseLeave = () => {
      heroRect = null;

      content.style.setProperty("--mouse-x", "0px");
      content.style.setProperty("--mouse-y", "0px");
    };

    const createMagneticButton = (button) => {
      if (!button) return () => {};

      let rect = null;

      const handleEnter = () => {
        rect = button.getBoundingClientRect();
      };

      const handleMove = (event) => {
        if (!rect) {
          rect = button.getBoundingClientRect();
        }

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
        rect = null;

        button.style.setProperty("--magnetic-x", "0px");
        button.style.setProperty("--magnetic-y", "0px");
      };

      button.addEventListener("mouseenter", handleEnter);
      button.addEventListener("mousemove", handleMove);
      button.addEventListener("mouseleave", handleLeave);

      return () => {
        button.removeEventListener("mouseenter", handleEnter);
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
    window.addEventListener("resize", invalidateHeroRect, {
      passive: true,
    });

    const cleanupPrimary = createMagneticButton(
      primaryButtonRef.current
    );

    const cleanupSecondary = createMagneticButton(
      secondaryButtonRef.current
    );

    /*
     * HERO VIDEO
     *
     * 1) The video file is requested only AFTER the pin has been created
     *    and the page has loaded. Creating the pin moves the hero element
     *    in the DOM, and moving a <video> pauses it and makes it blink.
     * 2) The video is paused while the hero is completely off screen
     *    (saves decoding work, so scrolling stays smooth).
     * 3) After every ScrollTrigger refresh, and when the tab becomes
     *    visible again, the video is resumed if the browser paused it.
     */
    const playVideo = () => {
      if (cancelled || !video || offscreen || document.hidden) return;
      if (!video.getAttribute("src")) return;

      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    const startVideo = () => {
      if (cancelled || !video) return;

      if (!video.getAttribute("src")) {
        video.src = HERO_VIDEO_SRC;
      }

      playVideo();
    };

    const tryStartVideo = () => {
      if (!pinReady || !pageLoaded) return;

      /* small pause so the load-time refreshes are finished first */
      window.clearTimeout(videoTimer);
      videoTimer = window.setTimeout(startVideo, 600);
    };

    const handleVideoMetadata = () => scheduleRefresh();

    let fadeAnimation = null;

    const handleVideoReady = () => {
      if (!video || video.dataset.ready === "true" || fadeAnimation) {
        return;
      }

      if (reduceMotion || typeof video.animate !== "function") {
        video.dataset.ready = "true";
        return;
      }

      /*
       * Web Animations API (not a CSS animation): it keeps running when
       * ScrollTrigger moves the hero in the DOM, so there is no blink.
       */
      fadeAnimation = video.animate(
        [
          { opacity: 0, transform: "scale(1.1)" },
          { opacity: 1, transform: "scale(1.05)" },
        ],
        {
          duration: 1800,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        }
      );

      fadeAnimation.onfinish = () => {
        video.dataset.ready = "true";

        if (fadeAnimation) {
          fadeAnimation.cancel();
          fadeAnimation = null;
        }
      };
    };

    const handleScrollTriggerRefresh = () => playVideo();

    const handleVisibility = () => {
      if (!document.hidden) playVideo();
    };

    if (video) {
      video.addEventListener("loadedmetadata", handleVideoMetadata);
      video.addEventListener("loadeddata", handleVideoReady);
    }

    ScrollTrigger.addEventListener(
      "refresh",
      handleScrollTriggerRefresh
    );

    document.addEventListener("visibilitychange", handleVisibility);

    if ("IntersectionObserver" in window) {
      heroObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;

          offscreen = !entry.isIntersecting;

          if (offscreen) {
            if (video) video.pause();
          } else {
            playVideo();
          }
        },
        { threshold: 0 }
      );

      heroObserver.observe(hero);
    }

    /*
     * HERO INTRO ANIMATION
     * Heading, eyebrow, top information, description and buttons all
     * animate in together, so nothing is visible on its own first.
     */
    const introCtx = gsap.context(() => {
      if (reduceMotion) return;

      const topItems = gsap.utils.toArray("[data-hero-top]", hero);
      const topLine = hero.querySelector(".hero-top-line");
      const eyebrow = hero.querySelector("[data-hero-eyebrow]");
      const description = hero.querySelector(".home-hero-description");

      const firstChars = gsap.utils.toArray(
        ".hero-heading-first .hero-char",
        hero
      );

      const secondChars = gsap.utils.toArray(
        ".hero-heading-second .hero-char",
        hero
      );

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

      gsap.set([description, actions, bottom], {
        autoAlpha: 0,
        y: 26,
      });

      const intro = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out" },
        onComplete: () => revealBelowFoldRef.current(),
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
          description,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
          },
          0.6
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
     * The About layer is moved off-screen immediately (before the first
     * paint, so nothing flashes), exactly as before. The ScrollTrigger
     * itself is created right after the first paint so it no longer
     * delays the hero text. The video starts only after this has run.
     */
    const setCtx = gsap.context(() => {
      if (!aboutRef.current) return;

      gsap.set(aboutRef.current, {
        yPercent: 100,
      });
    }, hero);

    const setupPin = () => {
      pinTimer = 0;

      const about = aboutRef.current;

      if (!cancelled && about) {
        pinCtx = gsap.context(() => {
          gsap.to(about, {
            yPercent: 0,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
              pin: hero,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        }, hero);

        scheduleRefresh();
      }

      pinReady = true;
      tryStartVideo();
    };

    pinFrame = requestAnimationFrame(() => {
      pinFrame = 0;
      pinTimer = window.setTimeout(setupPin, 0);
    });

    const handleWindowLoad = () => {
      window.clearTimeout(loadFallbackTimer);
      pageLoaded = true;
      tryStartVideo();
      scheduleRefresh();
    };

    if (!pageLoaded) {
      window.addEventListener("load", handleWindowLoad, {
        once: true,
      });

      /* Safety net: never leave the hero without a video. */
      loadFallbackTimer = window.setTimeout(() => {
        pageLoaded = true;
        tryStartVideo();
      }, 4000);
    }

    return () => {
      cancelled = true;

      if (pinFrame) {
        cancelAnimationFrame(pinFrame);
      }

      window.clearTimeout(pinTimer);
      window.clearTimeout(videoTimer);
      window.clearTimeout(loadFallbackTimer);
      window.clearTimeout(introTimer);
      window.clearTimeout(refreshTimer);
      refreshTimer = 0;

      if (heroObserver) heroObserver.disconnect();

      if (fadeAnimation) {
        fadeAnimation.onfinish = null;
        fadeAnimation.cancel();
        fadeAnimation = null;
      }

      ScrollTrigger.removeEventListener(
        "refresh",
        handleScrollTriggerRefresh
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", invalidateHeroRect);

      if (video) {
        video.removeEventListener(
          "loadedmetadata",
          handleVideoMetadata
        );

        video.removeEventListener("loadeddata", handleVideoReady);
      }

      window.removeEventListener("load", handleWindowLoad);

      cleanupPrimary();
      cleanupSecondary();

      introCtx.revert();

      if (pinCtx) pinCtx.revert();

      setCtx.revert();
    };
  }, []);

  return (
    <main className="home-page">
      {/* FULL SCREEN HERO */}
      <section ref={heroRef} className="home-hero">
        <video
          ref={videoRef}
          className="home-hero-video"
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
              Building modern digital experiences, intelligent
              products, and scalable full-stack solutions.
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
        {stage >= 1 && (
          <Suspense fallback={null}>
            <About />
            <SectionReady />
          </Suspense>
        )}
      </section>

      {/* SERVICES SECTION */}
      <section className="home-services-layer">
        {stage >= 2 && (
          <Suspense fallback={null}>
            <Services />
            <SectionReady />
          </Suspense>
        )}
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
        {stage >= 3 && (
          <Suspense fallback={null}>
            <Work />
            <SectionReady />
          </Suspense>
        )}
      </section>
    </main>
  );
}

export default Home;