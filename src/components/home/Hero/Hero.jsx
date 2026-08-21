import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import heroSlides from "../../../data/heroSlides";

import "./Hero.css";

const SLIDE_DURATION = 4000;

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slide = heroSlides[activeSlide];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className={`hero hero-position-${slide.position}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="hero-background"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 4, ease: "linear" },
          }}
        >
          <img src={slide.image} alt={slide.imageAlt} />
        </motion.div>
      </AnimatePresence>

      <div className="hero-overlay" />

      <div className="container hero-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className={`hero-content hero-content-${slide.textAnimation}`}
            initial={{
              opacity: 0,
              x:
                slide.textAnimation === "left"
                  ? -70
                  : slide.textAnimation === "right"
                  ? 70
                  : 0,
              y:
                slide.textAnimation.includes("bottom")
                  ? 50
                  : slide.textAnimation === "center"
                  ? 30
                  : 0,
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              x:
                slide.textAnimation === "left"
                  ? -40
                  : slide.textAnimation === "right"
                  ? 40
                  : 0,
              y:
                slide.textAnimation.includes("bottom")
                  ? 30
                  : 0,
            }}
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="hero-eyebrow">
              {slide.location}
            </span>

            <h1>
              {slide.title}
              <span>{slide.highlight}</span>
            </h1>

            <p>{slide.description}</p>

            <div className="hero-actions">
              <Link
                to={slide.primaryLink}
                className="hero-primary-button"
              >
                {slide.primaryAction}
                <FiArrowRight />
              </Link>

              <Link
                to={slide.secondaryLink}
                className="hero-secondary-button"
              >
                {slide.secondaryAction}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="hero-progress">
          {heroSlides.map((item, index) => (
            <span
              key={item.id}
              className={`hero-progress-item ${
                index === activeSlide ? "active" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;