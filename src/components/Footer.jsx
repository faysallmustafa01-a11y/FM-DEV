import React, { useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FMDEV from "../assets/FMDEV.svg";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const LOGO_SLICES = [
  { name: "F", left: 0, right: 84.65 },
  { name: "M", left: 15.35, right: 57.72 },
  { name: "D", left: 42.28, right: 36.7 },
  { name: "E", left: 63.3, right: 20.53 },
  { name: "V", left: 79.47, right: 0 },
];

const NAVIGATION_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/your-username" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/your-username/",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ffaaiissaall_?psln=Z3FyYzF0eWt1YWpn&utm_source=qr",
  },
  { label: "WhatsApp", href: "https://wa.me/923000000000" },
  { label: "Gmail", href: "mailto:m.fais.dev@gmail.com" },
];

const Reveal = React.memo(({ children }) => (
  <span className="fm-reveal">
    <span className="fm-reveal-inner">{children}</span>
  </span>
));

const RollText = React.memo(({ children }) => (
  <span className="fm-link-roll">
    <span className="fm-link-roll-text" data-text={children}>
      {children}
    </span>
  </span>
));

const Footer = () => {
  const footerRef = useRef(null);
  const logoRef = useRef(null);
  const headingRef = useRef(null);
  const location = useLocation();

  useLayoutEffect(() => {
    const footer = footerRef.current;
    const logo = logoRef.current;
    const heading = headingRef.current;

    if (!footer || !logo || !heading) return;

    let cancelled = false;
    let refreshFrame1 = 0;
    let refreshFrame2 = 0;
    let logoTimeline = null;
    let logoObserver = null;
    let layoutObserver = null;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const refreshAfterLayout = () => {
      if (cancelled || refreshFrame1 || refreshFrame2) return;

      refreshFrame1 = requestAnimationFrame(() => {
        refreshFrame1 = 0;

        refreshFrame2 = requestAnimationFrame(() => {
          refreshFrame2 = 0;

          if (!cancelled) {
            ScrollTrigger.refresh();
          }
        });
      });
    };

    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray(
        ".fm-footer-logo-letter-inner",
        logo
      );

      const headingLines = gsap.utils.toArray(
        ".fm-heading-line-inner",
        heading
      );

      const sections = gsap.utils.toArray(
        ".fm-footer-section",
        footer
      );

      if (reduceMotion) {
        gsap.set(letters, { yPercent: 0 });
        gsap.set(headingLines, { yPercent: 0, skewY: 0 });
        gsap.set(".fm-reveal-inner", {
          yPercent: 0,
          skewY: 0,
        });
        return;
      }

      /*
        LOGO: the letters rise out of the mask ONE BY ONE (F, M, D, E, V).
        The timeline is played / reversed by an IntersectionObserver (see
        below), which always uses the REAL layout. That is why the logo
        can never stay hidden after a route change or a late layout shift.
      */
      gsap.set(letters, { yPercent: 105, force3D: true });

      logoTimeline = gsap.timeline({ paused: true });

      logoTimeline.to(letters, {
        yPercent: 0,
        force3D: true,
        duration: 1.1,
        stagger: 0.22,
        ease: "power3.out",
      });

      gsap.fromTo(
        headingLines,
        {
          yPercent: 120,
          skewY: 8,
          force3D: true,
          transformOrigin: "left bottom",
        },
        {
          yPercent: 0,
          skewY: 0,
          force3D: true,
          duration: 1.4,
          stagger: 0.16,
          ease: "expo.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: heading,
            start: "top 92%",
            end: "bottom top",
            toggleActions: "play reverse play reverse",
            invalidateOnRefresh: true,
          },
        }
      );

      gsap.fromTo(
        heading,
        {
          y: 30,
          force3D: true,
        },
        {
          y: 0,
          force3D: true,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: footer,
            start: "top bottom",
            end: "top 40%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );

      sections.forEach((section) => {
        const items = gsap.utils.toArray(
          ".fm-reveal-inner",
          section
        );

        if (!items.length) return;

        gsap.fromTo(
          items,
          {
            yPercent: 120,
            skewY: 5,
            force3D: true,
            transformOrigin: "left bottom",
          },
          {
            yPercent: 0,
            skewY: 0,
            force3D: true,
            duration: 1.1,
            stagger: 0.07,
            ease: "expo.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: "top 92%",
              end: "bottom top",
              toggleActions: "play reverse play reverse",
              invalidateOnRefresh: true,
            },
          }
        );
      });
    }, footer);

    /* Logo: play when it is on screen, reverse when it is scrolled back out below */
    if (logoTimeline) {
      if ("IntersectionObserver" in window) {
        logoObserver = new IntersectionObserver(
          ([entry]) => {
            if (!entry) return;

            if (entry.isIntersecting) {
              logoTimeline.play();
            } else if (entry.boundingClientRect.top > 0) {
              logoTimeline.reverse();
            }
          },
          { threshold: 0.05 }
        );

        logoObserver.observe(logo);
      } else {
        logoTimeline.progress(1);
      }
    }

    /* Keep every ScrollTrigger in sync when the page height changes later */
    if ("ResizeObserver" in window) {
      layoutObserver = new ResizeObserver(() => refreshAfterLayout());
      layoutObserver.observe(document.body);
    }

    const logoImages = Array.from(logo.querySelectorAll("img"));

    logoImages.forEach((img) => {
      img.addEventListener("load", refreshAfterLayout);
      img.addEventListener("error", refreshAfterLayout);
    });

    const handleResize = () => refreshAfterLayout();
    const handlePageShow = () => refreshAfterLayout();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize);
    window.addEventListener("pageshow", handlePageShow);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) refreshAfterLayout();
      });
    }

    if (document.readyState === "complete") {
      refreshAfterLayout();
    } else {
      window.addEventListener("load", refreshAfterLayout, {
        once: true,
      });
    }

    logoImages.forEach((img) => {
      if (img.complete) refreshAfterLayout();
    });

    refreshAfterLayout();

    return () => {
      cancelled = true;

      if (refreshFrame1) cancelAnimationFrame(refreshFrame1);
      if (refreshFrame2) cancelAnimationFrame(refreshFrame2);

      if (logoObserver) logoObserver.disconnect();
      if (layoutObserver) layoutObserver.disconnect();

      logoImages.forEach((img) => {
        img.removeEventListener("load", refreshAfterLayout);
        img.removeEventListener("error", refreshAfterLayout);
      });

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("load", refreshAfterLayout);

      ctx.revert();
    };
  }, [location.pathname]);

  return (
    <footer className="fm-footer" ref={footerRef}>
      <div className="fm-footer-inner">
        <div className="fm-footer-main">
          <div className="fm-footer-intro fm-footer-section">
            <span className="fm-footer-eyebrow">
              <Reveal>HAVE A PROJECT IN MIND?</Reveal>
            </span>

            <h2 ref={headingRef} className="fm-footer-heading">
              <span className="fm-heading-line">
                <span className="fm-heading-line-inner">
                  LET'S MAKE
                </span>
              </span>

              <span className="fm-heading-line">
                <span className="fm-heading-line-inner">
                  IT HAPPEN<span className="fm-footer-period">.</span>
                </span>
              </span>
            </h2>

            {/* MOBILE ONLY: copyright sits under the heading (hidden on larger screens) */}
            <p className="fm-footer-copy fm-footer-copy-mobile">
              <Reveal>©️ 2026 FM Dev. All rights reserved.</Reveal>
            </p>
          </div>

          <div className="fm-footer-links fm-footer-section">
            <div className="fm-footer-column">
              <span className="fm-footer-label">
                <Reveal>EXPLORE</Reveal>
              </span>

              <nav
                aria-label="Footer navigation"
                className="fm-footer-nav"
              >
                {NAVIGATION_LINKS.map((item) => (
                  <Link to={item.href} key={item.label}>
                    <Reveal>
                      <span className="fm-link-line">
                        <RollText>{item.label}</RollText>
                      </span>
                    </Reveal>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="fm-footer-column">
              <span className="fm-footer-label">
                <Reveal>FIND ME ON</Reveal>
              </span>

              <div className="fm-footer-nav">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    href={item.href}
                    key={item.label}
                    target={
                      item.href.startsWith("mailto:")
                        ? undefined
                        : "_blank"
                    }
                    rel={
                      item.href.startsWith("mailto:")
                        ? undefined
                        : "noopener noreferrer"
                    }
                  >
                    <Reveal>
                      <span className="fm-link-line">
                        <RollText>{item.label}</RollText>
                        <span
                          className="fm-link-arrow"
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </span>
                    </Reveal>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="fm-footer-copy fm-footer-copy-main fm-footer-section">
          <Reveal>©️ 2026 FM Dev. All rights reserved.</Reveal>
        </p>

        <div
          className="fm-footer-logo-wrap"
          ref={logoRef}
          role="img"
          aria-label="FM DEV"
        >
          <div className="fm-footer-logo-mask">
            {LOGO_SLICES.map((slice) => (
              <div
                className="fm-footer-logo-letter"
                key={slice.name}
                aria-hidden="true"
                style={{
                  clipPath: `inset(0 ${slice.right}% 0 ${slice.left}%)`,
                }}
              >
                <div className="fm-footer-logo-letter-inner">
                  <img
                    src={FMDEV}
                    alt=""
                    className="fm-footer-logo"
                    draggable="false"
                    decoding="async"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;