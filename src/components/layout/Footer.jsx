import {
  FiArrowUpRight,
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiYoutube,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">

      {/* =====================================================
          FOOTER CTA
      ===================================================== */}

      <div className="footer-cta">
        <div className="container">
          <div className="footer-cta-inner">

            <div className="footer-cta-content">
              <span>Start your journey</span>

              <h2>
                Africa is waiting.
                <em> Let's explore it.</em>
              </h2>

              <p>
                Tell us where you want to go and we'll help
                you create a journey around your interests,
                travel style and schedule.
              </p>
            </div>

            <Link to="/tours" className="footer-cta-button">
              Explore our tours
              <FiArrowUpRight />
            </Link>

          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}

      <div className="footer-main">
        <div className="container">

          <div className="footer-grid">

            {/* BRAND */}

            <div className="footer-brand">

              <Link to="/" className="footer-logo">
                <span>JNI</span>
                <small>TOURS</small>
              </Link>

              <p>
                Thoughtfully designed journeys across East Africa,
                created for travelers who want to experience
                Africa beyond the ordinary.
              </p>

              <a
                href="https://wa.me/254111565424"
                target="_blank"
                rel="noreferrer"
                className="footer-whatsapp"
              >
                <span className="footer-whatsapp-icon">
                  <FiMessageCircle />
                </span>

                <span>
                  <strong>Chat with us</strong>
                  <small>WhatsApp · Usually replies quickly</small>
                </span>

                <FiArrowUpRight />
              </a>

              <div className="footer-socials">

                <a href="#" aria-label="Facebook">
                  <FiFacebook />
                </a>

                <a href="#" aria-label="Instagram">
                  <FiInstagram />
                </a>

                <a href="#" aria-label="YouTube">
                  <FiYoutube />
                </a>

                <a
                  href="https://wa.me/254111565424"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="footer-social-whatsapp"
                >
                  <FiMessageCircle />
                </a>

              </div>
            </div>

            {/* EXPLORE */}

            <div className="footer-column">

              <h3>Explore</h3>

              <Link to="/tours">
                <span>Tours</span>
                <FiArrowUpRight />
              </Link>

              <Link to="/destinations">
                <span>Destinations</span>
                <FiArrowUpRight />
              </Link>

              <Link to="/gallery">
                <span>Gallery</span>
                <FiArrowUpRight />
              </Link>

              <Link to="/blog">
                <span>Travel Guide</span>
                <FiArrowUpRight />
              </Link>

            </div>

            {/* COMPANY */}

            <div className="footer-column">

              <h3>JNI Tours</h3>

              <Link to="/about">
                <span>Our Story</span>
                <FiArrowUpRight />
              </Link>

              <Link to="/contact">
                <span>Contact Us</span>
                <FiArrowUpRight />
              </Link>

              <Link to="/login">
                <span>My Account</span>
                <FiArrowUpRight />
              </Link>

              <Link to="/customer/bookings">
                <span>My Trips</span>
                <FiArrowUpRight />
              </Link>

            </div>

            {/* DESTINATIONS */}

            <div className="footer-column">

              <h3>Destinations</h3>

              <Link to="/tours/masai-mara-safari">
                <span>Masai Mara</span>
                <FiArrowUpRight />
              </Link>

              <Link to="/tours/amboseli-kilimanjaro">
                <span>Amboseli</span>
                <FiArrowUpRight />
              </Link>

              <Link to="/tours/tanzania-serengeti-safari">
                <span>Serengeti</span>
                <FiArrowUpRight />
              </Link>

              <Link to="/tours/zanzibar-island-escape">
                <span>Zanzibar</span>
                <FiArrowUpRight />
              </Link>

            </div>

            {/* CONTACT */}

            <div className="footer-column footer-contact">

              <h3>Get in touch</h3>

              <a href="https://maps.google.com/?q=Kenya">
                <span className="footer-contact-icon">
                  <FiMapPin />
                </span>

                <span>
                  Kenya
                  <small>East Africa</small>
                </span>
              </a>

              <a href="tel:+254702551560">
                <span className="footer-contact-icon">
                  <FiPhone />
                </span>

                <span>
                  +254 702 551 560
                  <small>Call us</small>
                </span>
              </a>

              <a href="mailto:hello@jnitours.com">
                <span className="footer-contact-icon">
                  <FiMail />
                </span>

                <span>
                  hello@jnitours.com
                  <small>Email us</small>
                </span>
              </a>

            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">

          <p>
            © {currentYear} JNI Tours.
            <span> Crafted for unforgettable journeys.</span>
          </p>

          <div className="footer-bottom-links">
            <Link to="/privacy">
              Privacy
            </Link>

            <Link to="/terms">
              Terms
            </Link>

            <Link to="/contact">
              Contact
            </Link>
          </div>

        </div>
      </div>

    </footer>
  );
}

export default Footer;