import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import LocomotiveScroll from "locomotive-scroll";

import {
  SiHtml5,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiVite,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiNumpy,
  SiPandas,
  SiStreamlit,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiPostman,
  SiVercel,
  SiDocker,
  SiN8N,
  SiDialogflow,
  SiGooglecloud,
  SiPython,
  SiFastapi,
  SiAnthropic,
} from "react-icons/si";

import {
  FaCss3Alt,
  FaAws,
  FaRobot,
  FaMagic,
  FaLock,
  FaBrain,
} from "react-icons/fa";

import { MdApi } from "react-icons/md";
import { RiOpenaiFill } from "react-icons/ri";
import { VscVscode } from "react-icons/vsc";

import spiderLogo from "../assets/spiderville-logo.png";

import "./Work.css";

const LIVE_URL = "https://spiderville.netlify.app/";

const groups = [
  {
    title: "Frontend",
    skills: [
      { name: "HTML5", Icon: SiHtml5, color: "#E34F26" },
      { name: "CSS3", Icon: FaCss3Alt, color: "#1572B6" },
      { name: "JavaScript", Icon: SiJavascript, color: "#D6B600" },
      { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
      { name: "React.js", Icon: SiReact, color: "#61DAFB" },
      { name: "Next.js", Icon: SiNextdotjs, color: "#111111" },
      { name: "Vite", Icon: SiVite, color: "#646CFF" },
      { name: "Tailwind CSS", Icon: SiTailwindcss, color: "#06B6D4" },
    ],
  },
  {
    title: "Backend",
    skills: [
      { name: "Node.js", Icon: SiNodedotjs, color: "#5FA04E" },
      { name: "Express.js", Icon: SiExpress, color: "#222222" },
      { name: "REST API", Icon: MdApi, color: "#E4572E" },
      { name: "Python", Icon: SiPython, color: "#3776AB" },
      { name: "FastAPI", Icon: SiFastapi, color: "#009688" },
    ],
  },
  {
    title: "Databases",
    skills: [
      { name: "MongoDB", Icon: SiMongodb, color: "#47A248" },
      { name: "MySQL", Icon: SiMysql, color: "#4479A1" },
      { name: "PostgreSQL", Icon: SiPostgresql, color: "#4169E1" },
    ],
  },
  {
    title: "Cloud & Deployment",
    skills: [
      { name: "Git", Icon: SiGit, color: "#F05032" },
      { name: "GitHub", Icon: SiGithub, color: "#171717" },
      {
        name: "GitHub Actions",
        Icon: SiGithubactions,
        color: "#2088FF",
      },
      { name: "Vercel", Icon: SiVercel, color: "#111111" },
      { name: "Netlify", Icon: SiVercel, color: "#00AD9F" },
      { name: "Docker", Icon: SiDocker, color: "#2496ED" },
      { name: "AWS", Icon: FaAws, color: "#FF9900" },
      {
        name: "Google Cloud",
        Icon: SiGooglecloud,
        color: "#4285F4",
      },
    ],
  },
  {
    title: "Dev Tools & Data",
    skills: [
      { name: "VS Code", Icon: VscVscode, color: "#007ACC" },
      { name: "Postman", Icon: SiPostman, color: "#FF6C37" },
      { name: "NumPy", Icon: SiNumpy, color: "#4DABCF" },
      { name: "Pandas", Icon: SiPandas, color: "#130654" },
      { name: "Streamlit", Icon: SiStreamlit, color: "#FF4B4B" },
    ],
  },
  {
    title: "AI & Automation",
    skills: [
      { name: "n8n", Icon: SiN8N, color: "#EA4B71" },
      { name: "Dialogflow", Icon: SiDialogflow, color: "#FF9800" },
      { name: "AI Chatbots", Icon: FaRobot, color: "#7357FF" },
      { name: "LLMs", Icon: FaBrain, color: "#7C3AED" },
      { name: "OpenAI", Icon: RiOpenaiFill, color: "#10A37F" },
      { name: "Claude", Icon: SiAnthropic, color: "#D97757" },
      {
        name: "Prompt Engineering",
        Icon: FaMagic,
        color: "#D97706",
      },
    ],
  },
];

/* ---------------------------------------------------------
   PROJECTS
   slot = position in the desktop / tablet fan:
     0        -> center (featured, on top)
     -2, -1   -> left side
      1,  2   -> right side
   On mobile the cards become a 3D coverflow carousel.
--------------------------------------------------------- */
const projects = [
  {
    id: "spiderville",
    number: "01",
    title: "SpiderVille",
    category: "BPO & DIGITAL SERVICES",
    description:
      "A modern digital experience for an outsourcing and technology services brand.",
    url: LIVE_URL,
    status: "LIVE",
    theme: "spider",
    slot: 0,
    logo: spiderLogo,
  },
  {
    id: "locked-orange",
    locked: true,
    status: "COMING SOON",
    bg: "#FB9623",
    fg: "#111111",
    slot: -2,
  },
  {
    id: "locked-red",
    locked: true,
    status: "COMING SOON",
    bg: "#ED304C",
    fg: "#FFFFFF",
    slot: -1,
  },
  {
    id: "locked-green",
    locked: true,
    status: "COMING SOON",
    bg: "#70E737",
    fg: "#111111",
    slot: 1,
  },
  {
    id: "locked-dark-green",
    locked: true,
    status: "SOMETHING NEW",
    bg: "#1A9739",
    fg: "#FFFFFF",
    slot: 2,
  },
];

/* ---------------------------------------------------------
   SETTINGS
--------------------------------------------------------- */

const MOBILE_MAX = 700;
const TABLET_MAX = 1100;

/* Must match the @media (min-width: 1025px) zoom rule in Work.css */
const ZOOM_MIN_WIDTH = 1025;
const DESKTOP_ZOOM = 0.8;

/* Entry animation (cards). ENTRY_STAGGER = 0 -> all at the same time */
const ENTRY_STAGGER = 0.06;

const ENTRY_SPRING = {
  type: "spring",
  stiffness: 70,
  damping: 13,
  mass: 0.9,
};

/* Floating (cards) */
const FLOAT_AMPLITUDE = 16;
const FLOAT_TILT = 1.6;
const FLOAT_DURATION = 5.5;

/* Locomotive-style text + scroll reveal */
const EASE_OUT = [0.16, 1, 0.3, 1];
const HEADING_DRIFT_DESKTOP = 10; // vw the heading lines drift while scrolling
const HEADING_DRIFT_MOBILE = 7;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const supportsCssZoom = () =>
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("zoom", "0.8");

/*
  Returns the "effective" layout width, i.e. the width the page is laid
  out in after the 80% zoom is applied on desktop screens.
*/
function useStageWidth() {
  const compute = () => {
    const real = window.innerWidth;
    const zoom =
      real >= ZOOM_MIN_WIDTH && supportsCssZoom() ? DESKTOP_ZOOM : 1;

    return Math.round(real / zoom);
  };

  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? compute() : 1600
  );

  useEffect(() => {
    const onResize = () => setWidth(compute());

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}

/* ---------------------------------------------------------
   SCROLL REVEAL HELPERS
--------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: EASE_OUT, delay },
  }),
};

function Reveal({ as = "div", delay = 0, className, children }) {
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      {children}
    </Tag>
  );
}

const headingParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};

const headingLine = {
  hidden: { y: "130%" },
  show: { y: "0%", transition: { duration: 1.1, ease: EASE_OUT } },
};

/*
  Locomotive-style heading:
  1) every line slides up out of a mask when the heading enters the screen
  2) while scrolling, the lines drift sideways in opposite directions
*/
function RevealHeading({ lines, isMobile }) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const shift = isMobile ? HEADING_DRIFT_MOBILE : HEADING_DRIFT_DESKTOP;

  const xForward = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-shift}vw`, `${shift}vw`]
  );

  const xBackward = useTransform(
    scrollYProgress,
    [0, 1],
    [`${shift}vw`, `${-shift}vw`]
  );

  return (
    <motion.h2
      ref={ref}
      className="work-heading"
      aria-label={lines.map((line) => line.text).join(" ")}
      variants={headingParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      {lines.map((line, index) => (
        <motion.span
          key={line.text}
          className="heading-drift"
          style={{ x: index % 2 === 0 ? xForward : xBackward }}
          aria-hidden="true"
        >
          <span className="heading-mask">
            <motion.span
              className={`heading-line ${
                line.outline ? "heading-line-outline" : ""
              }`}
              variants={headingLine}
            >
              {line.text}
            </motion.span>
          </span>
        </motion.span>
      ))}
    </motion.h2>
  );
}

/* ---------------------------------------------------------
   SKILLS SECTION
--------------------------------------------------------- */

const chipListVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.2 } },
};

const chipVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

function SkillsSection({ isMobile }) {
  return (
    <section className="skills-section" id="skills">
      <div className="skills-inner">
        <div className="skills-header">
          <Reveal as="p" className="skills-eyebrow">
            THE TOOLS BEHIND THE WORK
          </Reveal>

          <RevealHeading
            isMobile={isMobile}
            lines={[
              { text: "WHAT I WORK" },
              { text: "WITH.", outline: true },
            ]}
          />

          <Reveal as="p" className="skills-intro" delay={0.25}>
            Technologies and tools I use to build digital products, scalable
            applications, and intelligent experiences.
          </Reveal>
        </div>

        <div className="skills-groups">
          {groups.map((group, index) => (
            <motion.div
              className="skills-group"
              key={group.title}
              variants={fadeUp}
              custom={(index % 2) * 0.1}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h3 className="skills-group-title">{group.title}</h3>

              <motion.div className="skills-list" variants={chipListVariants}>
                {group.skills.map(({ name, Icon, color }) => (
                  <motion.div
                    className="skill-chip"
                    key={name}
                    variants={chipVariants}
                  >
                    <div className="skill-item">
                      <Icon
                        className="skill-icon"
                        style={{ color }}
                        aria-hidden="true"
                      />
                      <span>{name}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   FAN LAYOUT HELPERS (DESKTOP / TABLET)
--------------------------------------------------------- */

function getCardWidth(width) {
  if (width <= MOBILE_MAX) return clamp(width * 0.56, 190, 250);

  return width <= TABLET_MAX
    ? clamp(width * 0.27, 200, 260)
    : clamp(width * 0.24, 260, 340);
}

/*
  Resting position of a card inside the fan.
  SpiderVille in the center, two cards on each side.
*/
function getFanTransform(slot, width) {
  const isMobile = width <= MOBILE_MAX;
  const isTablet = !isMobile && width <= TABLET_MAX;
  const cardWidth = getCardWidth(width);

  /* desktop / tablet: keep every card inside the screen.
     mobile: outer cards may bleed off the edges (like a real fan) */
  const maxSpread = isMobile
    ? Infinity
    : (width / 2 - 24 - cardWidth / 2) / 2;
  const spreadFactor = isMobile ? 0.34 : isTablet ? 0.5 : 0.6;
  const spread = Math.min(cardWidth * spreadFactor, maxSpread);
  const rotateStep = isTablet ? 4 : 5;
  const arcDepth = isMobile ? 10 : isTablet ? 7 : 9;

  const t = slot;

  return {
    x: t * spread,
    y: t * t * arcDepth,
    rotate: t * rotateStep,
    scale: t === 0 ? 1.06 : 1,
    zIndex: 10 - Math.round(Math.abs(t) * 2),
  };
}

/*
  Starting (hidden) state of a card before the entry animation:
  slightly translated, slightly rotated, opacity 0.
*/
function getEntryState(target, index) {
  const side = index % 2 === 0 ? -1 : 1;

  return {
    x: target.x * 0.8,
    y: target.y + 56,
    rotate: target.rotate + side * 6,
    scale: target.scale * 0.94,
    opacity: 0,
  };
}

/*
  Soft, endless floating. Every card has its own speed, direction and
  phase, so the whole set drifts like it is hanging in the air.
*/
function getFloat(index, small = false) {
  const dir = index % 2 === 0 ? 1 : -1;
  const amp = small ? FLOAT_AMPLITUDE * 0.45 : FLOAT_AMPLITUDE;
  const tilt = small ? FLOAT_TILT * 0.5 : FLOAT_TILT;

  return {
    animate: {
      y: [0, -amp, 0, amp * 0.35, 0],
      rotate: [0, tilt * dir, 0, -tilt * dir, 0],
    },
    transition: {
      duration: FLOAT_DURATION + (index % 3) * 0.8,
      repeat: Infinity,
      ease: "easeInOut",
      delay: index * 0.3,
    },
  };
}

/* The SpiderVille card content (shared by desktop fan and mobile) */
function SpiderCardBody({ project }) {
  return (
    <>
      <div className="project-card-visual">
        <div className="project-image-composition">
          <div className="project-logo-wrap">
            <img
              className="project-logo"
              src={project.logo}
              alt="SpiderVille logo"
            />
          </div>

          <span className="project-card-status project-status-live project-status-corner">
            <span className="project-live-dot" />
            {project.status}
          </span>
        </div>
      </div>

      <div className="project-card-info">
        <div className="project-card-meta">
          <span className="project-card-category">{project.category}</span>
        </div>

        <p className="project-card-description">{project.description}</p>
      </div>
    </>
  );
}

function ProjectCard({ project, index, width, inView }) {
  const isLocked = Boolean(project.locked);
  const isMobile = width <= MOBILE_MAX;

  const target = getFanTransform(project.slot, width);
  const hidden = getEntryState(target, index);
  const float = getFloat(index);

  const Wrapper = isLocked ? motion.div : motion.a;

  const wrapperProps = isLocked
    ? {
        role: "group",
        "aria-label": `${project.status} (locked)`,
      }
    : {
        href: project.url,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `Open ${project.title} project`,
      };

  return (
    <Wrapper
      className={`fan-item ${isLocked ? "fan-item-locked" : "fan-item-link"}`}
      {...wrapperProps}
      style={{ zIndex: target.zIndex }}
      initial={hidden}
      animate={
        inView
          ? {
              x: target.x,
              y: target.y,
              rotate: target.rotate,
              scale: target.scale,
              opacity: 1,
              transition: {
                ...ENTRY_SPRING,
                delay: index * ENTRY_STAGGER,
                opacity: { duration: 0.45, delay: index * ENTRY_STAGGER },
              },
            }
          : hidden
      }
      whileHover={
        isLocked || isMobile
          ? undefined
          : {
              y: target.y - 28,
              rotate: 0,
              scale: target.scale + 0.04,
              transition: { type: "spring", stiffness: 260, damping: 22 },
            }
      }
      whileTap={isLocked ? undefined : { scale: target.scale - 0.02 }}
    >
      <motion.div
        className={
          isLocked
            ? "project-card project-card-locked"
            : `project-card project-card-${project.theme}`
        }
        style={
          isLocked ? { background: project.bg, color: project.fg } : undefined
        }
        animate={float.animate}
        transition={float.transition}
      >
        {isLocked ? (
          <>
            <span className="locked-status">{project.status}</span>

            <span className="locked-icon" aria-hidden="true">
              <FaLock />
            </span>
          </>
        ) : (
          <SpiderCardBody project={project} />
        )}
      </motion.div>
    </Wrapper>
  );
}

/* ---------------------------------------------------------
   MOBILE PROJECTS: 3D COVERFLOW CAROUSEL
   One focused card in the middle, the neighbours tilted at the
   sides (peeking, never covering the focused card).
   Swipe, tap a side card, or use the arrows / dots.
--------------------------------------------------------- */

const CF_SPRING = {
  type: "spring",
  stiffness: 190,
  damping: 25,
  mass: 0.9,
};

const CF_SWIPE_DISTANCE = 40;
const CF_SWIPE_VELOCITY = 400;

function getCoverflowPose(offset, cardWidth) {
  const abs = Math.abs(offset);

  if (abs === 0) return { x: 0, scale: 1, rotateY: 0, opacity: 1 };

  if (abs === 1) {
    return {
      x: offset * cardWidth * 0.9,
      scale: 0.86,
      rotateY: offset * 34,
      opacity: 1,
    };
  }

  return {
    x: offset * cardWidth * 1.1,
    scale: 0.7,
    rotateY: offset * 34,
    opacity: 0,
  };
}

function MobileCarousel({ width, inView }) {
  const cardWidth = Math.round(Math.min(width * 0.66, 300));
  const total = projects.length;

  const [active, setActive] = useState(0);
  const panning = useRef(false);

  const go = (i) => setActive(((i % total) + total) % total);
  const next = () => go(active + 1);
  const prev = () => go(active - 1);

  const hiddenPose = { opacity: 0, x: 0, scale: 0.8, rotateY: 0 };

  return (
    <div className="m-cf" style={{ "--cf-w": `${cardWidth}px` }}>
      <motion.div
        className="m-cf-stage"
        onPanStart={() => {
          panning.current = true;
        }}
        onPanEnd={(event, info) => {
          setTimeout(() => {
            panning.current = false;
          }, 80);

          if (
            info.offset.x < -CF_SWIPE_DISTANCE ||
            info.velocity.x < -CF_SWIPE_VELOCITY
          ) {
            next();
          } else if (
            info.offset.x > CF_SWIPE_DISTANCE ||
            info.velocity.x > CF_SWIPE_VELOCITY
          ) {
            prev();
          }
        }}
      >
        {projects.map((project, index) => {
          const offset = ((index - active + total + 2) % total) - 2;
          const abs = Math.abs(offset);
          const pose = getCoverflowPose(offset, cardWidth);
          const isLocked = Boolean(project.locked);
          const float = getFloat(index, true);

          return (
            <motion.div
              key={project.id}
              className={`m-cf-card ${abs > 1 ? "is-hidden" : ""}`}
              style={{ zIndex: 10 - abs }}
              initial={hiddenPose}
              animate={inView ? pose : hiddenPose}
              transition={CF_SPRING}
              onTap={() => {
                if (abs === 1) go(index);
              }}
              aria-hidden={abs !== 0}
            >
              <motion.div
                className={
                  isLocked
                    ? "project-card project-card-locked m-cf-locked"
                    : `project-card project-card-${project.theme}`
                }
                style={
                  isLocked
                    ? { background: project.bg, color: project.fg }
                    : undefined
                }
                animate={float.animate}
                transition={float.transition}
              >
                {isLocked ? (
                  <>
                    <span className="locked-status">{project.status}</span>

                    <span className="locked-icon" aria-hidden="true">
                      <FaLock />
                    </span>

                    <span className="m-cf-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </>
                ) : (
                  <a
                    className="m-cf-link"
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.title} project`}
                    tabIndex={abs === 0 ? 0 : -1}
                    onClick={(event) => {
                      if (abs !== 0 || panning.current) event.preventDefault();
                    }}
                  >
                    <SpiderCardBody project={project} />
                  </a>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="m-cf-controls">
        <button
          type="button"
          className="m-cf-arrow"
          onClick={prev}
          aria-label="Previous card"
        >
          ←
        </button>

        <div className="m-cf-dots">
          {projects.map((project, i) => (
            <button
              type="button"
              key={project.id}
              className={`m-cf-dot ${i === active ? "is-active" : ""}`}
              onClick={() => go(i)}
              aria-label={`Show card ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="m-cf-arrow"
          onClick={next}
          aria-label="Next card"
        >
          →
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   WHAT I'VE BUILT
--------------------------------------------------------- */

function WorkStackSection({ width }) {
  const isMobile = width <= MOBILE_MAX;
  const cardWidth = getCardWidth(width);

  const stageRef = useRef(null);
  const inView = useInView(stageRef, { once: true, amount: 0.15 });

  /* soft parallax of the fan while the page scrolls (desktop / tablet) */
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "end start"],
  });
  const fanY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section className="work-stack-section" id="work">
      <div className="work-stack-inner">
        <div className="work-stack-heading-row">
          <RevealHeading
            isMobile={isMobile}
            lines={[
              { text: "WHAT I'VE" },
              { text: "BUILT.", outline: true },
            ]}
          />

          <Reveal className="work-stack-intro" delay={0.2}>
            <p className="work-stack-kicker">SELECTED WORK / 2026</p>

            <p className="work-stack-description">
              A collection of digital experiences, ideas, and projects in
              progress.
            </p>
          </Reveal>
        </div>

        <div className="work-stage" ref={stageRef}>
          {isMobile ? (
            <MobileCarousel width={width} inView={inView} />
          ) : (
            <motion.div
              className="project-fan"
              style={{ y: fanY, "--fan-card-w": `${cardWidth}px` }}
            >
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  width={width}
                  inView={inView}
                />
              ))}
            </motion.div>
          )}
        </div>

        <Reveal className="work-stack-bottom">
          <span>INDEPENDENTLY DESIGNED & DEVELOPED</span>
          <span>{String(projects.length).padStart(2, "0")} PROJECTS</span>
        </Reveal>
      </div>
    </section>
  );
}

export default function Work() {
  const width = useStageWidth();
  const isMobile = width <= MOBILE_MAX;

  /* Locomotive Scroll v5: smooth scroll up / down on top of native scroll */
  useEffect(() => {
    const scroll = new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.075,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.2,
        smoothWheel: true,
        autoResize: true,
      },
    });

    return () => {
      scroll.destroy();
    };
  }, []);

  return (
    <main className="skills-page">
      <SkillsSection isMobile={isMobile} />
      <WorkStackSection width={width} />
    </main>
  );
}