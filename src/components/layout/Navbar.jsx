import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiUser,
  FiCalendar,
} from "react-icons/fi";

import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toursOpen, setToursOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    setToursOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* =====================================================
            BRAND / LOGO
        ===================================================== */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
          aria-label="JNI Tours Home"
        >
          {/* Logo Image */}
          <img
            src="/icons.png"
            alt="JNI Tours"
            className="navbar-logo-image"
          />

          {/* Brand Text */}
          <span className="navbar-logo-text">
            <span className="navbar-logo-main">JNI</span>
            <span className="navbar-logo-sub">TOURS</span>
          </span>
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}
        <nav className="navbar-nav">

          <NavLink
            to="/"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Home
          </NavLink>

          {/* Tours Dropdown */}
          <div className="navbar-dropdown">
            <button
              className="navbar-link navbar-dropdown-trigger"
              onClick={() => setToursOpen((prev) => !prev)}
              type="button"
              aria-expanded={toursOpen}
            >
              Tours

              <FiChevronDown
                className={`dropdown-icon ${
                  toursOpen ? "open" : ""
                }`}
              />
            </button>

            {toursOpen && (
              <div className="navbar-dropdown-menu">

                <Link to="/tours" onClick={closeMenu}>
                  All Tours
                </Link>

                <Link to="/tours/safaris" onClick={closeMenu}>
                  Safari Tours
                </Link>

                <Link to="/tours/beach" onClick={closeMenu}>
                  Beach Holidays
                </Link>

                <Link to="/tours/cultural" onClick={closeMenu}>
                  Cultural Experiences
                </Link>

                <Link to="/tours/adventure" onClick={closeMenu}>
                  Adventure Tours
                </Link>

              </div>
            )}
          </div>

          <NavLink
            to="/destinations"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Destinations
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            About
          </NavLink>

          <NavLink
            to="/blog"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Travel Guide
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "active" : ""}`
            }
          >
            Contact
          </NavLink>

        </nav>

        {/* =====================================================
            DESKTOP ACTIONS
        ===================================================== */}
        <div className="navbar-actions">

          <Link
            to="/customer/bookings"
            className="navbar-icon-button"
          >
            <FiCalendar />
            <span>My Trips</span>
          </Link>

          <Link
            to="/login"
            className="navbar-icon-button"
          >
            <FiUser />
            <span>Account</span>
          </Link>

          <Link
            to="/tours"
            className="navbar-book-button"
          >
            Explore Tours
          </Link>

        </div>

        {/* =====================================================
            MOBILE TOGGLE
        ===================================================== */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}
      <div
        className={`navbar-mobile ${
          menuOpen ? "show" : ""
        }`}
      >
        <nav className="navbar-mobile-nav">

          <NavLink to="/" onClick={closeMenu}>
            Home
          </NavLink>

          {/* Mobile Tours Dropdown */}
          <button
            type="button"
            className="mobile-dropdown-trigger"
            onClick={() =>
              setToursOpen((prev) => !prev)
            }
            aria-expanded={toursOpen}
          >
            <span>Tours</span>

            <FiChevronDown
              className={
                toursOpen ? "open" : ""
              }
            />
          </button>

          {toursOpen && (
            <div className="mobile-dropdown-menu">

              <Link
                to="/tours"
                onClick={closeMenu}
              >
                All Tours
              </Link>

              <Link
                to="/tours/safaris"
                onClick={closeMenu}
              >
                Safari Tours
              </Link>

              <Link
                to="/tours/beach"
                onClick={closeMenu}
              >
                Beach Holidays
              </Link>

              <Link
                to="/tours/cultural"
                onClick={closeMenu}
              >
                Cultural Experiences
              </Link>

              <Link
                to="/tours/adventure"
                onClick={closeMenu}
              >
                Adventure Tours
              </Link>

            </div>
          )}

          <NavLink
            to="/destinations"
            onClick={closeMenu}
          >
            Destinations
          </NavLink>

          <NavLink
            to="/about"
            onClick={closeMenu}
          >
            About
          </NavLink>

          <NavLink
            to="/blog"
            onClick={closeMenu}
          >
            Travel Guide
          </NavLink>

          <NavLink
            to="/contact"
            onClick={closeMenu}
          >
            Contact
          </NavLink>

          {/* Mobile Actions */}
          <div className="navbar-mobile-actions">

            <Link
              to="/customer/bookings"
              onClick={closeMenu}
            >
              <FiCalendar />
              My Trips
            </Link>

            <Link
              to="/login"
              onClick={closeMenu}
            >
              <FiUser />
              Account
            </Link>

            <Link
              to="/tours"
              className="mobile-book-button"
              onClick={closeMenu}
            >
              Explore Tours
            </Link>

          </div>

        </nav>
      </div>
    </header>
  );
}

export default Navbar;