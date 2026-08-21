import {
  FiArrowUpRight,
  FiClock,
  FiMapPin,
  FiStar,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import "./TourCard.css";

function TourCard({ tour }) {
  if (!tour) {
    return null;
  }

  const tourUrl = `/tours/${tour.slug}`;

  return (
    <article className="tour-card">
      {/* =====================================================
          TOUR IMAGE
      ===================================================== */}

      <Link
        to={tourUrl}
        className="tour-card-image"
        aria-label={`View ${tour.title}`}
      >
        <img
          src={tour.image}
          alt={tour.title}
          loading="lazy"
        />

        {tour.badge && (
          <span className="tour-card-badge">
            {tour.badge}
          </span>
        )}

        {tour.category && (
          <span className="tour-card-category">
            {tour.category}
          </span>
        )}
      </Link>

      {/* =====================================================
          TOUR CONTENT
      ===================================================== */}

      <div className="tour-card-content">

        {/* LOCATION */}

        <div className="tour-card-location">
          <FiMapPin />

          <span>{tour.destination}</span>
        </div>

        {/* TITLE */}

        <Link
          to={tourUrl}
          className="tour-card-title"
        >
          {tour.title}
        </Link>

        {/* META */}

        <div className="tour-card-meta">

          {tour.duration && (
            <span>
              <FiClock />
              {tour.duration}
            </span>
          )}

          <span>
            <FiStar />

            <strong>{tour.rating}</strong>

            {tour.reviews !== undefined && (
              <small>
                ({tour.reviews})
              </small>
            )}
          </span>

        </div>

        {/* FOOTER */}

        <div className="tour-card-footer">

          <div className="tour-card-price">

            <small>From</small>

            <strong>
              $
              {Number(tour.price || 0).toLocaleString()}
            </strong>

            <span>
              {tour.priceLabel || "per person"}
            </span>

          </div>

          <Link
            to={tourUrl}
            className="tour-card-arrow"
            aria-label={`View ${tour.title}`}
          >
            <FiArrowUpRight />
          </Link>

        </div>

      </div>
    </article>
  );
}

export default TourCard;