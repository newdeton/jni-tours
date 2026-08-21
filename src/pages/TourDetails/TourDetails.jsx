import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiMapPin,
  FiMinus,
  FiPlus,
  FiStar,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getTour } from "../../data/tourDetails";
import "./TourDetails.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85";

/* =========================================================
   HELPERS
   ========================================================= */

const createSlug = (value) => {
  return String(value || "tour")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
};

const getImages = (tour) => {
  const images = normalizeArray(tour?.images);

  if (images.length > 0) {
    return images;
  }

  if (tour?.image) {
    return [tour.image];
  }

  return [FALLBACK_IMAGE];
};

/* =========================================================
   NORMALIZE DATABASE TOUR
   ========================================================= */

const normalizeTour = (tour) => {
  if (!tour) {
    return null;
  }

  const images = getImages(tour);

  const slug =
    tour.slug ||
    createSlug(tour.title);

  const itinerary = Array.isArray(tour.itinerary)
    ? tour.itinerary
    : [];

  const highlights = normalizeArray(
    tour.highlights
  );

  const included = normalizeArray(
    tour.included
  );

  const excluded = normalizeArray(
    tour.excluded
  );

  return {
    ...tour,

    id:
      tour.id ||
      tour._id ||
      slug,

    _id:
      tour._id ||
      tour.id ||
      null,

    title:
      tour.title ||
      "Untitled Tour",

    slug,

    destination:
      tour.destination ||
      tour.location ||
      "East Africa",

    location:
      tour.location ||
      tour.destination ||
      "East Africa",

    category:
      tour.category ||
      "Safari",

    style:
      tour.style ||
      "Adventure",

    duration:
      tour.duration ||
      "Custom itinerary",

    guests:
      tour.guests ||
      tour.groupSize ||
      "Private or small group",

    price:
      Number(tour.price) || 0,

    rating:
      Number(tour.rating) || 0,

    reviews:
      Number(tour.reviews) || 0,

    images,

    image:
      tour.image ||
      images[0] ||
      FALLBACK_IMAGE,

    highlights,
    itinerary,
    included,
    excluded,

    accommodation:
      tour.accommodation ||
      "Accommodation can be arranged according to your itinerary.",

    notes:
      tour.notes ||
      "This journey can be customized to match your preferred travel dates, accommodation and experiences.",

    bestTime:
      tour.bestTime ||
      "Year-round",

    overview:
      tour.overview ||
      tour.description ||
      "Discover an unforgettable East African experience with a carefully designed itinerary tailored around remarkable destinations, wildlife and local experiences.",

    badge:
      tour.badge ||
      "",

    priceLabel:
      tour.priceLabel ||
      "person",
  };
};

/* =========================================================
   API RESPONSE HELPER
   ========================================================= */

const extractTours = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.tours)) {
    return data.tours;
  }

  if (data && Array.isArray(data.data)) {
    return data.data;
  }

  if (
    data &&
    data.data &&
    Array.isArray(data.data.tours)
  ) {
    return data.data.tours;
  }

  return [];
};

/* =========================================================
   FIND TOUR IN API RESPONSE
   ========================================================= */

const findTourBySlug = (tours, tourId) => {
  const requested = String(tourId || "")
    .trim()
    .toLowerCase();

  if (!requested) {
    return null;
  }

  return (
    tours.find((tour) => {
      const slug = String(tour.slug || "")
        .trim()
        .toLowerCase();

      const id = String(
        tour._id ||
          tour.id ||
          ""
      )
        .trim()
        .toLowerCase();

      const titleSlug = createSlug(
        tour.title
      ).toLowerCase();

      return (
        slug === requested ||
        id === requested ||
        titleSlug === requested
      );
    }) || null
  );
};

/* =========================================================
   COMPONENT
   ========================================================= */

function TourDetails() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] =
    useState(0);

  const [openDay, setOpenDay] = useState(0);

  /* =======================================================
     LOAD TOUR
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadTour = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * First check the existing built-in tour data.
         * This keeps the original tours working.
         */

        let localTour = null;

        try {
          localTour = getTour(tourId);
        } catch {
          localTour = null;
        }

        /*
         * If a built-in tour exists, use it immediately.
         */

        if (localTour) {
          const normalized =
            normalizeTour(localTour);

          if (!cancelled) {
            setTour(normalized);
            setLoading(false);
          }

          return;
        }

        /*
         * ===================================================
         * DATABASE TOUR
         * ===================================================
         *
         * Fetch public tours from the backend and find
         * the requested tour by slug or ID.
         */

        const response = await fetch(
          `${API_URL}/api/tours`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load tours (${response.status})`
          );
        }

        const data =
          await response.json();

        const tours =
          extractTours(data);

        const databaseTour =
          findTourBySlug(
            tours,
            tourId
          );

        if (!databaseTour) {
          if (!cancelled) {
            setTour(null);
            setError(
              "The requested tour could not be found."
            );
          }

          return;
        }

        const normalized =
          normalizeTour(
            databaseTour
          );

        if (!cancelled) {
          setTour(normalized);
        }
      } catch (err) {
        console.error(
          "Failed to load tour details:",
          err
        );

        if (!cancelled) {
          setTour(null);
          setError(
            "We couldn't load this journey right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTour();

    return () => {
      cancelled = true;
    };
  }, [tourId]);

  /* =======================================================
     RESET PAGE STATE WHEN TOUR CHANGES
     ======================================================= */

  useEffect(() => {
    setActiveImage(0);
    setOpenDay(0);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [tourId]);

  /* =======================================================
     IMAGE NAVIGATION
     ======================================================= */

  const showPreviousImage = () => {
    if (!tour?.images?.length) {
      return;
    }

    setActiveImage((current) =>
      current <= 0
        ? tour.images.length - 1
        : current - 1
    );
  };

  const showNextImage = () => {
    if (!tour?.images?.length) {
      return;
    }

    setActiveImage((current) =>
      current >= tour.images.length - 1
        ? 0
        : current + 1
    );
  };

  /* =======================================================
     KEYBOARD NAVIGATION
     ======================================================= */

  useEffect(() => {
    if (!tour) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }

      if (event.key === "Escape") {
        navigate("/tours");
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [tour, navigate]);

  /* =======================================================
     SAFE TOUR DATA
     ======================================================= */

  const images = useMemo(() => {
    return tour?.images?.length
      ? tour.images
      : [FALLBACK_IMAGE];
  }, [tour]);

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <main className="tour-not-found">
        <div>
          <FiMapPin />

          <h1>
            Loading journey...
          </h1>

          <p>
            We're preparing the details
            for this adventure.
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     NOT FOUND
     ======================================================= */

  if (!tour) {
    return (
      <main className="tour-not-found">
        <div>
          <FiMapPin />

          <h1>
            Tour not found
          </h1>

          <p>
            {error ||
              "The journey you're looking for doesn't exist or may have been removed."}
          </p>

          <Link to="/tours">
            Browse all tours
            <FiArrowRight />
          </Link>
        </div>
      </main>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="tour-details-page">

      {/* ===================================================
          BREADCRUMB
      =================================================== */}

      <div className="container">
        <div className="tour-breadcrumb">
          <Link to="/tours">
            <FiArrowLeft />
            All tours
          </Link>

          <span>/</span>

          <span>
            {tour.destination}
          </span>

          <span>/</span>

          <strong>
            {tour.title}
          </strong>
        </div>
      </div>

      {/* ===================================================
          GALLERY
      =================================================== */}

      <section className="tour-gallery-section">
        <div className="container">
          <div className="tour-gallery">

            {/* MAIN IMAGE */}

            <div className="tour-gallery-main">
              <img
                src={
                  images[activeImage] ||
                  FALLBACK_IMAGE
                }
                alt={`${tour.title} - view ${
                  activeImage + 1
                }`}
                onError={(event) => {
                  if (
                    event.currentTarget.src !==
                    FALLBACK_IMAGE
                  ) {
                    event.currentTarget.src =
                      FALLBACK_IMAGE;
                  }
                }}
              />

              {tour.badge && (
                <span className="tour-gallery-badge">
                  {tour.badge}
                </span>
              )}

              <div className="tour-gallery-counter">
                {activeImage + 1} /{" "}
                {images.length}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="tour-gallery-prev"
                    onClick={
                      showPreviousImage
                    }
                    aria-label="Previous tour image"
                  >
                    <FiArrowLeft />
                  </button>

                  <button
                    type="button"
                    className="tour-gallery-next"
                    onClick={
                      showNextImage
                    }
                    aria-label="Next tour image"
                  >
                    <FiArrowRight />
                  </button>
                </>
              )}
            </div>

            {/* THUMBNAILS */}

            <div className="tour-gallery-thumbnails">
              {images.map(
                (image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={
                      activeImage === index
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveImage(index)
                    }
                    aria-label={`View tour image ${
                      index + 1
                    }`}
                    aria-current={
                      activeImage === index
                        ? "true"
                        : undefined
                    }
                  >
                    <img
                      src={image}
                      alt={`${tour.title} thumbnail ${
                        index + 1
                      }`}
                      loading={
                        index === 0
                          ? "eager"
                          : "lazy"
                      }
                      onError={(event) => {
                        event.currentTarget.src =
                          FALLBACK_IMAGE;
                      }}
                    />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          TOUR INFORMATION
      =================================================== */}

      <section className="tour-information">
        <div className="container">
          <div className="tour-information-layout">

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="tour-information-main">

              {/* HEADING */}

              <div className="tour-heading">
                <span className="tour-category">
                  {tour.category}
                </span>

                <h1>
                  {tour.title}
                </h1>

                <div className="tour-meta">
                  <span>
                    <FiMapPin />
                    {tour.location}
                  </span>

                  <span>
                    <FiClock />
                    {tour.duration}
                  </span>

                  <span>
                    <FiUsers />
                    {tour.guests}
                  </span>

                  {tour.rating > 0 && (
                    <span className="tour-rating">
                      <FiStar />

                      {tour.rating}

                      <small>
                        (
                        {
                          tour.reviews
                        }{" "}
                        reviews)
                      </small>
                    </span>
                  )}
                </div>
              </div>

              {/* =================================================
                  OVERVIEW
              ================================================= */}

              <div className="tour-overview">
                <span className="tour-section-label">
                  The experience
                </span>

                <h2>
                  A journey worth
                  <em>
                    {" "}
                    remembering.
                  </em>
                </h2>

                <p>
                  {tour.overview}
                </p>
              </div>

              {/* =================================================
                  HIGHLIGHTS
              ================================================= */}

              {tour.highlights.length > 0 && (
                <div className="tour-highlights">
                  <span className="tour-section-label">
                    Tour highlights
                  </span>

                  <div className="tour-highlights-grid">
                    {tour.highlights.map(
                      (
                        highlight,
                        index
                      ) => (
                        <div
                          key={`${highlight}-${index}`}
                        >
                          <FiCheck />

                          <span>
                            {highlight}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* =================================================
                  ITINERARY
              ================================================= */}

              {tour.itinerary.length > 0 && (
                <div className="tour-itinerary">
                  <div className="tour-section-heading">
                    <div>
                      <span className="tour-section-label">
                        Your journey
                      </span>

                      <h2>
                        Detailed itinerary
                      </h2>
                    </div>
                  </div>

                  <div className="tour-itinerary-list">
                    {tour.itinerary.map(
                      (
                        item,
                        index
                      ) => {
                        const isOpen =
                          openDay ===
                          index;

                        const dayLabel =
                          item.day ||
                          `Day ${
                            index + 1
                          }`;

                        return (
                          <div
                            className={`tour-day ${
                              isOpen
                                ? "tour-day-open"
                                : ""
                            }`}
                            key={`${dayLabel}-${index}`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenDay(
                                  isOpen
                                    ? -1
                                    : index
                                )
                              }
                              aria-expanded={
                                isOpen
                              }
                            >
                              <div className="tour-day-number">
                                {String(
                                  dayLabel
                                ).replace(
                                  "Day ",
                                  ""
                                )}
                              </div>

                              <div className="tour-day-title">
                                <small>
                                  {
                                    dayLabel
                                  }
                                </small>

                                <strong>
                                  {item.title ||
                                    "Daily itinerary"}
                                </strong>
                              </div>

                              <span className="tour-day-icon">
                                {isOpen ? (
                                  <FiMinus />
                                ) : (
                                  <FiPlus />
                                )}
                              </span>
                            </button>

                            <div className="tour-day-content">
                              <p>
                                {item.description ||
                                  "Details for this day will be confirmed as part of your itinerary."}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* =================================================
                  INCLUDED / EXCLUDED
              ================================================= */}

              {(tour.included.length > 0 ||
                tour.excluded.length > 0) && (
                <div className="tour-inclusions">

                  {/* INCLUDED */}

                  {tour.included.length > 0 && (
                    <div>
                      <span className="tour-section-label">
                        Included
                      </span>

                      <h2>
                        What's covered
                      </h2>

                      <ul>
                        {tour.included.map(
                          (
                            item,
                            index
                          ) => (
                            <li
                              key={`${item}-${index}`}
                            >
                              <FiCheck />

                              <span>
                                {item}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* EXCLUDED */}

                  {tour.excluded.length > 0 && (
                    <div>
                      <span className="tour-section-label">
                        Not included
                      </span>

                      <h2>
                        Before you book
                      </h2>

                      <ul>
                        {tour.excluded.map(
                          (
                            item,
                            index
                          ) => (
                            <li
                              key={`${item}-${index}`}
                            >
                              <FiX />

                              <span>
                                {item}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================
                  ACCOMMODATION
              ================================================= */}

              <div className="tour-accommodation">
                <span className="tour-section-label">
                  Accommodation
                </span>

                <h2>
                  Where you'll stay
                </h2>

                <p>
                  {tour.accommodation}
                </p>
              </div>

              {/* =================================================
                  CUSTOMIZATION
              ================================================= */}

              <div className="tour-customization-note">
                <FiCalendar />

                <div>
                  <strong>
                    Make this journey yours
                  </strong>

                  <p>
                    {tour.notes}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                BOOKING SIDEBAR
            ================================================= */}

            <aside className="tour-booking-card">

              {/* PRICE */}

              <div className="tour-booking-price">
                <small>
                  From
                </small>

                <strong>
                  $
                  {tour.price.toLocaleString()}
                </strong>

                <span>
                  /{" "}
                  {tour.priceLabel ||
                    "person"}
                </span>
              </div>

              {/* RATING */}

              {tour.rating > 0 && (
                <div className="tour-booking-rating">
                  <FiStar />

                  <strong>
                    {tour.rating}
                  </strong>

                  <span>
                    {
                      tour.reviews
                    }{" "}
                    traveler reviews
                  </span>
                </div>
              )}

              <div className="tour-booking-divider" />

              {/* DURATION */}

              <div className="tour-booking-detail">
                <span>
                  <FiClock />
                  Duration
                </span>

                <strong>
                  {tour.duration}
                </strong>
              </div>

              {/* BEST TIME */}

              <div className="tour-booking-detail">
                <span>
                  <FiCalendar />
                  Best time
                </span>

                <strong>
                  {tour.bestTime}
                </strong>
              </div>

              {/* GROUP SIZE */}

              <div className="tour-booking-detail">
                <span>
                  <FiUsers />
                  Group size
                </span>

                <strong>
                  {tour.guests}
                </strong>
              </div>

              {/* BOOKING */}

              <Link
                to={`/booking/${tour.slug}`}
                className="tour-book-button"
              >
                Check availability
                <FiArrowRight />
              </Link>

              <p className="tour-booking-note">
                No payment required to
                request availability.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

export default TourDetails;