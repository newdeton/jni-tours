import { useEffect, useMemo, useState } from "react";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiCompass,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import featuredTours from "../../data/featuredTours";
import TourFilters from "../../components/tours/TourFilters/TourFilters";

import "./Tours.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const defaultFilters = {
  search: "",
  destination: "all",
  category: "all",
  duration: "all",
  style: "all",
  maxPrice: 5000,
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85";

/* =========================================================
   HELPERS
   ========================================================= */

const getDurationDays = (duration) => {
  if (!duration) return 0;

  const match = String(duration).match(/(\d+)\s*Days?/i);

  return match ? Number(match[1]) : 0;
};

const matchesDuration = (tour, durationFilter) => {
  if (durationFilter === "all") {
    return true;
  }

  const days = getDurationDays(tour.duration);

  if (durationFilter === "short") {
    return days >= 1 && days <= 3;
  }

  if (durationFilter === "medium") {
    return days >= 4 && days <= 6;
  }

  if (durationFilter === "long") {
    return days >= 7;
  }

  return true;
};

const getTourImage = (tour) => {
  if (tour.image) {
    return tour.image;
  }

  if (Array.isArray(tour.images)) {
    const firstImage = tour.images.find(Boolean);

    if (firstImage) {
      return firstImage;
    }
  }

  return FALLBACK_IMAGE;
};

const createSlug = (title) => {
  return String(title || "tour")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getTourKey = (tour) => {
  return (
    tour.slug ||
    tour.id ||
    tour._id ||
    createSlug(tour.title)
  );
};

/* =========================================================
   NORMALIZE TOUR
   ========================================================= */

const normalizeTour = (tour, source = "database") => {
  if (!tour || typeof tour !== "object") {
    return null;
  }

  const normalizedImages = Array.isArray(tour.images)
    ? tour.images.filter(Boolean)
    : [];

  const normalizedImage =
    tour.image ||
    normalizedImages[0] ||
    FALLBACK_IMAGE;

  const slug =
    tour.slug ||
    createSlug(tour.title);

  return {
    ...tour,

    id: tour.id || tour._id || slug,
    _id: tour._id || tour.id || null,

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
      "",

    category:
      tour.category ||
      "Safari",

    style:
      tour.style ||
      "Adventure",

    duration:
      tour.duration ||
      "Custom itinerary",

    price:
      Number(tour.price) || 0,

    rating:
      Number(tour.rating) || 0,

    reviews:
      Number(tour.reviews) || 0,

    image:
      normalizedImage,

    images:
      normalizedImages.length > 0
        ? normalizedImages
        : [normalizedImage],

    priceLabel:
      tour.priceLabel ||
      "person",

    source,
  };
};

/* =========================================================
   CHECK PUBLIC/PUBLISHED TOUR
   ========================================================= */

const isPublishedTour = (tour) => {
  /*
   * If the backend explicitly sends a published/status field,
   * respect it.
   *
   * If no such field exists, allow the tour.
   *
   * This keeps compatibility with the current backend while
   * preventing explicitly unpublished/draft tours from being
   * displayed if they are ever returned by the API.
   */

  if (
    typeof tour.published === "boolean"
  ) {
    return tour.published;
  }

  if (
    typeof tour.isPublished === "boolean"
  ) {
    return tour.isPublished;
  }

  if (
    typeof tour.status === "string"
  ) {
    const status =
      tour.status.toLowerCase().trim();

    if (
      status === "draft" ||
      status === "unpublished" ||
      status === "inactive"
    ) {
      return false;
    }

    if (
      status === "published" ||
      status === "active"
    ) {
      return true;
    }
  }

  return true;
};

/* =========================================================
   MERGE TOURS
   ========================================================= */

const mergeTours = (
  hardcodedTours,
  databaseTours
) => {
  const merged = new Map();

  /*
   * Built-in tours first.
   */
  hardcodedTours.forEach((tour) => {
    const normalized =
      normalizeTour(
        tour,
        "hardcoded"
      );

    if (!normalized) {
      return;
    }

    merged.set(
      getTourKey(normalized),
      normalized
    );
  });

  /*
   * Database tours second.
   *
   * Database tours take priority if a database tour
   * happens to have the same slug as a built-in tour.
   */
  databaseTours.forEach((tour) => {
    if (!isPublishedTour(tour)) {
      return;
    }

    const normalized =
      normalizeTour(
        tour,
        "database"
      );

    if (!normalized) {
      return;
    }

    merged.set(
      getTourKey(normalized),
      normalized
    );
  });

  return Array.from(
    merged.values()
  );
};

/* =========================================================
   EXTRACT TOURS FROM API RESPONSE
   ========================================================= */

const extractToursFromResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data.tours)
  ) {
    return data.tours;
  }

  if (
    data &&
    data.data &&
    Array.isArray(data.data)
  ) {
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
   COMPONENT
   ========================================================= */

function Tours() {
  const [filters, setFilters] =
    useState(defaultFilters);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [sort, setSort] =
    useState("featured");

  const [databaseTours, setDatabaseTours] =
    useState([]);

  const [loadingTours, setLoadingTours] =
    useState(true);

  const [apiError, setApiError] =
    useState("");

  /* =======================================================
     LOAD DATABASE TOURS
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadTours = async () => {
      try {
        setLoadingTours(true);
        setApiError("");

        const endpoint =
          `${API_URL}/api/tours`;

        console.log(
          "Loading public tours from:",
          endpoint
        );

        const response =
          await fetch(endpoint, {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
          });

        if (!response.ok) {
          let message = "";

          try {
            const errorData =
              await response.json();

            message =
              errorData?.message ||
              errorData?.error ||
              "";
          } catch {
            // Ignore JSON parsing errors.
          }

          throw new Error(
            message ||
              `Failed to load tours (${response.status})`
          );
        }

        const data =
          await response.json();

        const tours =
          extractToursFromResponse(
            data
          );

        console.log(
          `Public tours loaded: ${tours.length}`
        );

        if (!cancelled) {
          setDatabaseTours(tours);
        }
      } catch (error) {
        console.error(
          "Failed to load public tours:",
          error
        );

        if (!cancelled) {
          setDatabaseTours([]);

          setApiError(
            "Latest tours could not be loaded. Showing available tours."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingTours(false);
        }
      }
    };

    loadTours();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     COMBINE BUILT-IN + DATABASE TOURS
     ======================================================= */

  const allTours = useMemo(() => {
    return mergeTours(
      featuredTours,
      databaseTours
    );
  }, [databaseTours]);

  /* =======================================================
     FILTER + SORT
     ======================================================= */

  const filteredTours = useMemo(() => {
    let results = [...allTours];

    /* SEARCH */

    if (filters.search.trim()) {
      const search =
        filters.search
          .trim()
          .toLowerCase();

      results = results.filter(
        (tour) =>
          [
            tour.title,
            tour.destination,
            tour.category,
            tour.style,
            tour.location,
            tour.description,
            tour.overview,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(search)
      );
    }

    /* DESTINATION */

    if (
      filters.destination !== "all"
    ) {
      results = results.filter(
        (tour) =>
          String(
            tour.destination || ""
          )
            .toLowerCase()
            .includes(
              filters.destination.toLowerCase()
            )
      );
    }

    /* CATEGORY */

    if (
      filters.category !== "all"
    ) {
      results = results.filter(
        (tour) =>
          String(
            tour.category || ""
          ).toLowerCase() ===
          filters.category.toLowerCase()
      );
    }

    /* DURATION */

    if (
      filters.duration !== "all"
    ) {
      results = results.filter(
        (tour) =>
          matchesDuration(
            tour,
            filters.duration
          )
      );
    }

    /* STYLE */

    if (
      filters.style !== "all"
    ) {
      results = results.filter(
        (tour) =>
          String(
            tour.style || ""
          ).toLowerCase() ===
          filters.style.toLowerCase()
      );
    }

    /* MAX PRICE */

    results = results.filter(
      (tour) =>
        Number(tour.price || 0) <=
        Number(filters.maxPrice)
    );

    /* SORT */

    if (sort === "price-low") {
      results.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sort === "price-high") {
      results.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sort === "rating") {
      results.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
    }

    return results;
  }, [
    allTours,
    filters,
    sort,
  ]);

  /* =======================================================
     RESET FILTERS
     ======================================================= */

  const clearFilters = () => {
    setFilters({
      ...defaultFilters,
    });

    setSort("featured");
  };

  /* =======================================================
     TOUR URL
     ======================================================= */

  const getTourUrl = (tour) => {
    return `/tours/${tour.slug}`;
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="tours-page">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="tours-hero">
        <div className="container">

          <div className="tours-hero-content">

            <span>
              <FiCompass />
              Explore JNI Tours
            </span>

            <h1>
              Find your next
              <em> adventure.</em>
            </h1>

            <p>
              Explore carefully designed
              journeys across East Africa,
              from unforgettable safaris to
              tropical escapes.
            </p>

          </div>

        </div>
      </section>

      {/* ===================================================
          TOUR BROWSER
      =================================================== */}

      <section className="tours-browser">
        <div className="container">

          <div className="tours-layout">

            {/* FILTERS */}

            <TourFilters
              filters={filters}
              setFilters={setFilters}
              onClear={clearFilters}
              mobileOpen={mobileOpen}
              setMobileOpen={
                setMobileOpen
              }
            />

            {/* RESULTS */}

            <div className="tours-results">

              {/* RESULTS HEADER */}

              <div className="tours-results-header">

                <div>

                  <span className="tours-results-label">
                    Discover
                  </span>

                  <h2>
                    {loadingTours
                      ? "Loading journeys..."
                      : `${filteredTours.length} ${
                          filteredTours.length ===
                          1
                            ? "journey"
                            : "journeys"
                        }`}
                  </h2>

                </div>

                {/* SORT */}

                <div className="tour-sort">

                  <label htmlFor="tourSort">
                    Sort by
                  </label>

                  <div>

                    <select
                      id="tourSort"
                      value={sort}
                      onChange={(event) =>
                        setSort(
                          event.target.value
                        )
                      }
                    >
                      <option value="featured">
                        Featured
                      </option>

                      <option value="rating">
                        Highest rated
                      </option>

                      <option value="price-low">
                        Price: low to high
                      </option>

                      <option value="price-high">
                        Price: high to low
                      </option>
                    </select>

                    <FiChevronDown />

                  </div>

                </div>

              </div>

              {/* API NOTICE */}

              {apiError && (
                <div
                  className="tours-api-notice"
                  role="status"
                >
                  {apiError}
                </div>
              )}

              {/* =================================================
                  LOADING STATE
              ================================================= */}

              {loadingTours ? (

                <div
                  className="tours-loading"
                  role="status"
                  aria-live="polite"
                >
                  <FiCompass />

                  <h3>
                    Loading journeys...
                  </h3>

                  <p>
                    We're bringing the latest
                    JNI Tours experiences into
                    view.
                  </p>
                </div>

              ) : filteredTours.length > 0 ? (

                /* =================================================
                   TOUR GRID
                ================================================= */

                <div className="tours-results-grid">

                  {filteredTours.map(
                    (tour) => {

                      const tourUrl =
                        getTourUrl(tour);

                      const tourImage =
                        getTourImage(tour);

                      return (
                        <article
                          className="listing-tour-card"
                          key={getTourKey(
                            tour
                          )}
                        >

                          {/* IMAGE */}

                          <Link
                            to={tourUrl}
                            className="listing-tour-image"
                          >

                            <img
                              src={tourImage}
                              alt={
                                tour.title
                              }
                              loading="lazy"
                              onError={(
                                event
                              ) => {
                                if (
                                  event
                                    .currentTarget
                                    .src !==
                                  FALLBACK_IMAGE
                                ) {
                                  event.currentTarget.src =
                                    FALLBACK_IMAGE;
                                }
                              }}
                            />

                            {tour.badge && (
                              <span>
                                {tour.badge}
                              </span>
                            )}

                          </Link>

                          {/* CONTENT */}

                          <div className="listing-tour-content">

                            <small>
                              {
                                tour.destination
                              }
                            </small>

                            {/* TITLE */}

                            <Link
                              to={tourUrl}
                              className="listing-tour-title"
                            >
                              {tour.title}
                            </Link>

                            {/* INFO */}

                            <div className="listing-tour-info">

                              <span>
                                {
                                  tour.duration
                                }
                              </span>

                              {Number(
                                tour.rating
                              ) > 0 && (
                                <span>
                                  ★{" "}
                                  {Number(
                                    tour.rating
                                  ).toFixed(
                                    1
                                  )}
                                </span>
                              )}

                            </div>

                            {/* FOOTER */}

                            <div className="listing-tour-footer">

                              <div>

                                <small>
                                  From
                                </small>

                                <strong>
                                  $
                                  {Number(
                                    tour.price ||
                                      0
                                  ).toLocaleString()}
                                </strong>

                                <span>
                                  /
                                  {" "}
                                  {tour.priceLabel ||
                                    "person"}
                                </span>

                              </div>

                              <Link
                                to={tourUrl}
                                className="listing-tour-arrow"
                                aria-label={`View ${tour.title}`}
                              >
                                <FiArrowUpRight />
                              </Link>

                            </div>

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>

              ) : (

                /* =================================================
                   EMPTY STATE
                ================================================= */

                <div className="tours-empty">

                  <FiCompass />

                  <h3>
                    No journeys found
                  </h3>

                  <p>
                    Try adjusting your
                    filters or search for
                    another destination.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                  >
                    Reset filters
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}

export default Tours;