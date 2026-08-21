import { useEffect, useMemo, useState } from "react";

import {
  FiArrowUpRight,
  FiCompass,
  FiMapPin,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import "./Destinations.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

/* =========================================================
   HARDCODED DESTINATIONS

   These remain available even when the API is unavailable.
   ========================================================= */

const hardcodedDestinations = [
  {
    id: "masai-mara",
    name: "Masai Mara",
    country: "Kenya",
    location: "Kenya",
    description:
      "Witness incredible wildlife, sweeping savannahs, and unforgettable safari moments in one of Africa's most iconic reserves.",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=85",
    tourId: "masai-mara-safari",
    slug: "masai-mara",
    source: "hardcoded",
  },

  {
    id: "amboseli",
    name: "Amboseli",
    country: "Kenya",
    location: "Kenya",
    description:
      "Experience spectacular wildlife beneath the legendary backdrop of Mount Kilimanjaro.",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1400&q=85",
    tourId: "amboseli-kilimanjaro-safari",
    slug: "amboseli",
    source: "hardcoded",
  },

  {
    id: "serengeti",
    name: "Serengeti",
    country: "Tanzania",
    location: "Tanzania",
    description:
      "Explore endless plains, remarkable wildlife, and the raw beauty of Tanzania's most famous safari destination.",
    image:
      "https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1400&q=85",
    tourId: "tanzania-serengeti-safari",
    slug: "serengeti",
    source: "hardcoded",
  },

  {
    id: "zanzibar",
    name: "Zanzibar",
    country: "Tanzania",
    location: "Tanzania",
    description:
      "Slow down beside turquoise waters, white-sand beaches, and the rich culture of Tanzania's tropical island paradise.",
    image:
      "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=1400&q=85",
    tourId: "zanzibar-island-escape",
    slug: "zanzibar",
    source: "hardcoded",
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

const createSlug = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const extractDestinations = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data.destinations)
  ) {
    return data.destinations;
  }

  if (
    data &&
    Array.isArray(data.data)
  ) {
    return data.data;
  }

  if (
    data &&
    data.data &&
    Array.isArray(data.data.destinations)
  ) {
    return data.data.destinations;
  }

  return [];
};

/* =========================================================
   NORMALIZE ADMIN DESTINATION
   ========================================================= */

const normalizeAdminDestination = (
  destination
) => {
  const name =
    destination.name ||
    destination.title ||
    "Destination";

  const location =
    destination.location ||
    destination.country ||
    "East Africa";

  const slug =
    destination.slug ||
    destination.destinationId ||
    destination.tourId ||
    createSlug(name);

  return {
    ...destination,

    id:
      destination._id ||
      destination.id ||
      slug,

    name,

    country:
      destination.country ||
      destination.location ||
      "East Africa",

    location,

    description:
      destination.description ||
      "Discover this remarkable East African destination with JNI Tours.",

    image:
      destination.image ||
      destination.images?.[0] ||
      "",

    slug,

    source: "admin",
  };
};

/* =========================================================
   COMPONENT
   ========================================================= */

function Destinations() {
  const [adminDestinations, setAdminDestinations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     LOAD ADMIN DESTINATIONS
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadDestinations = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/destinations`,
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
            `Failed to load destinations (${response.status})`
          );
        }

        const data =
          await response.json();

        const destinations =
          extractDestinations(data);

        const normalized =
          destinations
            .map(
              normalizeAdminDestination
            )
            .filter(
              (destination) =>
                destination.name &&
                destination.image
            );

        if (!cancelled) {
          setAdminDestinations(
            normalized
          );
        }
      } catch (error) {
        console.error(
          "Failed to load admin destinations:",
          error
        );

        /*
         * Keep the public page functional
         * when the API is unavailable.
         */
        if (!cancelled) {
          setAdminDestinations([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDestinations();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     COMBINE DESTINATIONS
     ======================================================= */

  const destinations = useMemo(() => {
    const combined = [
      ...hardcodedDestinations,
      ...adminDestinations,
    ];

    const seen = new Set();

    return combined.filter(
      (destination) => {
        const key = `${String(
          destination.name || ""
        )
          .trim()
          .toLowerCase()}-${String(
          destination.country ||
            destination.location ||
            ""
        )
          .trim()
          .toLowerCase()}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;
      }
    );
  }, [adminDestinations]);

  return (
    <main className="destinations-page">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="destinations-hero">
        <div className="container">

          <div className="destinations-hero-content">

            <span className="destinations-eyebrow">
              <FiCompass />
              Explore East Africa
            </span>

            <h1>
              Places that stay
              <em> with you.</em>
            </h1>

            <p>
              From legendary safari landscapes
              to tropical coastlines, discover
              the destinations that make East
              Africa unforgettable.
            </p>

          </div>

        </div>
      </section>

      {/* ===================================================
          DESTINATIONS
      =================================================== */}

      <section className="destinations-list">
        <div className="container">

          <div className="destinations-heading">

            <div>
              <span>
                Our destinations
              </span>

              <h2>
                Where will your
                <em>
                  {" "}
                  journey begin?
                </em>
              </h2>
            </div>

            <p>
              Carefully selected destinations
              offering unforgettable wildlife,
              landscapes, culture, and coastal
              experiences.
            </p>

          </div>

          {/* =================================================
              DESTINATION GRID
          ================================================= */}

          <div className="destinations-grid">

            {destinations.map(
              (
                destination,
                index
              ) => {

                /*
                 * IMPORTANT:
                 *
                 * Destinations now have their own
                 * URL instead of being treated as tours.
                 */
                const destinationPath =
                  destination.slug ||
                  destination.id ||
                  createSlug(
                    destination.name
                  );

                const destinationUrl =
                  `/destinations/${destinationPath}`;

                return (
                  <article
                    className={`destination-card ${
                      index === 0
                        ? "destination-card-featured"
                        : ""
                    }`}
                    key={
                      destination.id ||
                      `${destination.name}-${index}`
                    }
                  >

                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <Link
                      to={destinationUrl}
                      className="destination-card-image"
                      aria-label={`Explore ${destination.name}`}
                    >

                      <img
                        src={
                          destination.image
                        }
                        alt={`${destination.name}, ${
                          destination.country ||
                          destination.location
                        }`}
                        loading={
                          index === 0
                            ? "eager"
                            : "lazy"
                        }
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                      <div className="destination-card-overlay" />

                      <span className="destination-card-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span
                        className="destination-card-arrow"
                        aria-hidden="true"
                      >
                        <FiArrowUpRight />
                      </span>

                    </Link>

                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <div className="destination-card-content">

                      <span className="destination-card-location">
                        <FiMapPin />

                        {destination.country ||
                          destination.location ||
                          "East Africa"}
                      </span>

                      <Link
                        to={destinationUrl}
                        className="destination-card-title"
                      >
                        {destination.name}
                      </Link>

                      <p>
                        {
                          destination.description
                        }
                      </p>

                      {/* =================================================
                          DESTINATION ACTIONS

                          View destination now goes to:
                          /destinations/:destinationId

                          Booking is handled from the
                          destination details page.
                      ================================================= */}

                      <div className="destination-card-actions">

                        <Link
                          to={destinationUrl}
                          className="destination-card-link"
                        >
                          Explore destination

                          <FiArrowUpRight />
                        </Link>

                        <Link
                          to={destinationUrl}
                          className="destination-card-book"
                        >
                          Book destination

                          <FiArrowUpRight />
                        </Link>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>

          {/* =================================================
              API STATUS
          ================================================= */}

          {loading &&
            adminDestinations.length ===
              0 && (
              <div
                className="destinations-loading"
                aria-live="polite"
              >
                Loading more destinations...
              </div>
            )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!loading &&
            destinations.length ===
              0 && (
              <div className="destinations-empty">
                <FiMapPin />

                <h3>
                  No destinations available
                </h3>

                <p>
                  Please check back shortly
                  for new destinations.
                </p>
              </div>
            )}

          {/* =================================================
              CTA
          ================================================= */}

          <div className="destinations-cta">

            <div className="destinations-cta-content">

              <span>
                Ready to explore?
              </span>

              <h2>
                Your next story starts
                here.
              </h2>

            </div>

            <Link
              to="/tours"
              className="destinations-cta-link"
            >
              Explore all tours

              <FiArrowUpRight />
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}

export default Destinations;