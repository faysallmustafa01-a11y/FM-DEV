
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import LogoDesktopWhite from "../assets/logo1.png";
import LogoDesktopBlack from "../assets/logo2.png";

const DESKTOP_BREAKPOINT = 900;
const SCROLLED_AT = 30;
const HIDE_AFTER = 80;
const DELTA = 4;

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lastScrollY = useRef(0);
  const scrolledRef = useRef(false);
  const hiddenRef = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isInnerPage = location.pathname !== "/";
  const isContactPage = location.pathname === "/contact";

  useEffect(() => {
    let ticking = false;
    let animationFrame;

    lastScrollY.current = Math.max(0, window.scrollY);

    const update = () => {
      ticking = false;

      const y = Math.max(0, window.scrollY);
      const isDesktop = window.innerWidth > DESKTOP_BREAKPOINT;

      if (!isDesktop) {
        if (scrolledRef.current) {
          scrolledRef.current = false;
          setScrolled(false);
        }

        if (y <= SCROLLED_AT) {
          if (hiddenRef.current) {
            hiddenRef.current = false;
            setHidden(false);
          }

          lastScrollY.current = y;
          return;
        }

        const delta = y - lastScrollY.current;

        if (delta > DELTA && y > HIDE_AFTER) {
          if (!hiddenRef.current) {
            hiddenRef.current = true;
            setHidden(true);
          }

          lastScrollY.current = y;
        } else if (delta < -DELTA) {
          if (hiddenRef.current) {
            hiddenRef.current = false;
            setHidden(false);
          }

          lastScrollY.current = y;
        }

        return;
      }

      const aboutSection = document.getElementById("about");
      const navbarElement = document.querySelector(".navbar");

      let shouldBeScrolled = false;

      if (aboutSection && navbarElement) {
        const aboutTop = aboutSection.getBoundingClientRect().top;
        const navbarHeight = navbarElement.offsetHeight;

        shouldBeScrolled = aboutTop <= navbarHeight;
      } else {
        shouldBeScrolled = y > SCROLLED_AT;
      }

      if (shouldBeScrolled !== scrolledRef.current) {
        scrolledRef.current = shouldBeScrolled;
        setScrolled(shouldBeScrolled);
      }

      if (y <= SCROLLED_AT) {
        if (hiddenRef.current) {
          hiddenRef.current = false;
          setHidden(false);
        }

        lastScrollY.current = y;
        return;
      }

      const delta = y - lastScrollY.current;

      if (delta > DELTA && y > HIDE_AFTER) {
        if (!hiddenRef.current) {
          hiddenRef.current = true;
          setHidden(true);
        }

        lastScrollY.current = y;
      } else if (delta < -DELTA) {
        if (hiddenRef.current) {
          hiddenRef.current = false;
          setHidden(false);
        }

        lastScrollY.current = y;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        animationFrame = requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(animationFrame);
    };
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);

    hiddenRef.current = false;
    scrolledRef.current = false;

    setHidden(false);
    setScrolled(false);

    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;

    const sectionId = location.hash.substring(1);
    let frame1;
    let frame2;

    const scrollToSection = () => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(scrollToSection);
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > DESKTOP_BREAKPOINT) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/" && !location.hash;
    }

    if (["/about", "/services", "/work"].includes(path)) {
      return (
        location.pathname === "/" &&
        location.hash === `#${path.substring(1)}`
      );
    }

    return location.pathname === path;
  };

  const replayAnimation = (element, className) => {
    if (!element) return;

    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  };

  const handleNavHover = (event) => {
    const text = event.currentTarget.querySelector(".nav-text");
    replayAnimation(text, "nav-text-reveal");
  };

  const handleMobileTouch = (event) => {
    const text = event.currentTarget.querySelector(".mobile-nav-text");
    replayAnimation(text, "mobile-nav-text-reveal");
  };

  const handleHomeClick = (event) => {
    event.preventDefault();

    const wasOpen = menuOpen;
    setMenuOpen(false);

    const goHome = () => {
      if (location.pathname !== "/" || location.hash) {
        navigate("/");
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };

    setTimeout(goHome, wasOpen ? 60 : 0);
  };

  const handleSectionClick = (event, sectionId) => {
    event.preventDefault();

    const wasOpen = menuOpen;
    setMenuOpen(false);

    const targetHash = `#${sectionId}`;

    const goToSection = () => {
      if (location.pathname !== "/") {
        navigate(`/${targetHash}`);
        return;
      }

      if (location.hash !== targetHash) {
        navigate(`/${targetHash}`);
        return;
      }

      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    setTimeout(goToSection, wasOpen ? 60 : 0);
  };

  const darkLogo =
    menuOpen || (scrolled && !isContactPage) || (isInnerPage && !isContactPage);

  const isHidden = hidden && !menuOpen;

  return (
    <>
      <header
        className={`navbar ${
          scrolled && !isContactPage
            ? "navbar-scrolled"
            : "navbar-transparent"
        } ${isInnerPage ? "navbar-inner-page" : ""} ${
          isContactPage ? "navbar-contact-page" : ""
        } ${isHidden ? "navbar-hidden" : ""}`}
      >
        <div className="navbar-inner">
          <a
            href="/"
            className="navbar-logo"
            aria-label="Home"
            onClick={handleHomeClick}
          >
            <img
              src={LogoDesktopWhite}
              alt="Portfolio logo"
              className={`navbar-logo-image ${
                darkLogo ? "logo-hidden" : ""
              }`}
            />

            <img
              src={LogoDesktopBlack}
              alt=""
              aria-hidden="true"
              className={`navbar-logo-image ${
                darkLogo ? "" : "logo-hidden"
              }`}
            />
          </a>

          <nav className="navbar-links">
            <a
              href="/"
              className={isActive("/") ? "nav-link active" : "nav-link"}
              onClick={handleHomeClick}
              onMouseEnter={handleNavHover}
              onFocus={handleNavHover}
            >
              <span className="nav-text">
                <span className="nav-text-current">Home</span>
                <span className="nav-text-next">Home</span>
              </span>
            </a>

            <a
              href="/#about"
              className={isActive("/about") ? "nav-link active" : "nav-link"}
              onClick={(event) => handleSectionClick(event, "about")}
              onMouseEnter={handleNavHover}
              onFocus={handleNavHover}
            >
              <span className="nav-text">
                <span className="nav-text-current">About</span>
                <span className="nav-text-next">About</span>
              </span>
            </a>

            <a
              href="/#services"
              className={
                isActive("/services") ? "nav-link active" : "nav-link"
              }
              onClick={(event) => handleSectionClick(event, "services")}
              onMouseEnter={handleNavHover}
              onFocus={handleNavHover}
            >
              <span className="nav-text">
                <span className="nav-text-current">Services</span>
                <span className="nav-text-next">Services</span>
              </span>
            </a>

            <a
              href="/#work"
              className={isActive("/work") ? "nav-link active" : "nav-link"}
              onClick={(event) => handleSectionClick(event, "work")}
              onMouseEnter={handleNavHover}
              onFocus={handleNavHover}
            >
              <span className="nav-text">
                <span className="nav-text-current">Work</span>
                <span className="nav-text-next">Work</span>
              </span>
            </a>

            <Link
              to="/contact"
              className={
                isActive("/contact") ? "nav-link active" : "nav-link"
              }
              onMouseEnter={handleNavHover}
              onFocus={handleNavHover}
            >
              <span className="nav-text">
                <span className="nav-text-current">Contact</span>
                <span className="nav-text-next">Contact</span>
              </span>
            </Link>
          </nav>
        </div>
      </header>

      <button
        type="button"
        className={`menu-button ${
          isInnerPage && !isContactPage ? "menu-button-inner-page" : ""
        } ${menuOpen ? "menu-active" : ""}`}
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={
          menuOpen ? "Close navigation menu" : "Open navigation menu"
        }
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
      </button>

      <div
        className={`mobile-menu ${
          menuOpen ? "mobile-menu-open" : ""
        }`}
      >
        <div className="mobile-menu-content">
          <nav className="mobile-links">
            <a
              href="/"
              className={
                isActive("/")
                  ? "mobile-link mobile-link-left active"
                  : "mobile-link mobile-link-left"
              }
              onClick={handleHomeClick}
              onTouchStart={handleMobileTouch}
              onMouseEnter={handleMobileTouch}
            >
              <span className="mobile-nav-text">
                <span className="mobile-nav-text-current">Home</span>
                <span className="mobile-nav-text-next">Home</span>
              </span>
            </a>

            <a
              href="/#about"
              className={
                isActive("/about")
                  ? "mobile-link mobile-link-right active"
                  : "mobile-link mobile-link-right"
              }
              onClick={(event) => handleSectionClick(event, "about")}
              onTouchStart={handleMobileTouch}
              onMouseEnter={handleMobileTouch}
            >
              <span className="mobile-nav-text">
                <span className="mobile-nav-text-current">About</span>
                <span className="mobile-nav-text-next">About</span>
              </span>
            </a>

            <a
              href="/#services"
              className={
                isActive("/services")
                  ? "mobile-link mobile-link-left active"
                  : "mobile-link mobile-link-left"
              }
              onClick={(event) => handleSectionClick(event, "services")}
              onTouchStart={handleMobileTouch}
              onMouseEnter={handleMobileTouch}
            >
              <span className="mobile-nav-text">
                <span className="mobile-nav-text-current">Services</span>
                <span className="mobile-nav-text-next">Services</span>
              </span>
            </a>

            <a
              href="/#work"
              className={
                isActive("/work")
                  ? "mobile-link mobile-link-right active"
                  : "mobile-link mobile-link-right"
              }
              onClick={(event) => handleSectionClick(event, "work")}
              onTouchStart={handleMobileTouch}
              onMouseEnter={handleMobileTouch}
            >
              <span className="mobile-nav-text">
                <span className="mobile-nav-text-current">Work</span>
                <span className="mobile-nav-text-next">Work</span>
              </span>
            </a>

            <Link
              to="/contact"
              className={
                isActive("/contact")
                  ? "mobile-link mobile-link-left active"
                  : "mobile-link mobile-link-left"
              }
              onTouchStart={handleMobileTouch}
              onMouseEnter={handleMobileTouch}
            >
              <span className="mobile-nav-text">
                <span className="mobile-nav-text-current">Contact</span>
                <span className="mobile-nav-text-next">Contact</span>
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Navbar;
