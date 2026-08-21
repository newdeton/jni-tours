import { useEffect, useMemo, useState } from "react";

import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./DestinationDetails.css";

/* =========================================================
   API
   ========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

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

/* =========================================================
   EXTRACT DESTINATIONS FROM API RESPONSE
   ========================================================= */

const extractDestinations = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.destinations)) {
    return data.destinations;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.destinations)) {
    return data.data.destinations;
  }

  if (data?.destination && typeof data.destination === "object") {
    return [data.destination];
  }

  if (
    data?.data?.destination &&
    typeof data.data.destination === "object"
  ) {
    return [data.data.destination];
  }

  return [];
};

/* =========================================================
   PERMANENT WEBSITE DESTINATIONS

   These guarantee that the public destination pages work
   even when the API/database is unavailable.

   IMPORTANT:
   The slug here MUST match the URL.
   ========================================================= */

const defaultDestinations = [
  {
    id: "masai-mara",
    slug: "masai-mara",
    name: "Masai Mara",
    country: "Kenya",
    location: "Kenya",
    description:
      "Witness incredible wildlife, sweeping savannahs, and unforgettable safari moments in one of Africa's most iconic reserves.",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=90",
    duration: "4–7 days",
    travelers: "Private & small groups",
    highlights: [
      "Big Five wildlife viewing",
      "Great Migration experiences",
      "Luxury safari camps",
      "Maasai cultural experiences",
    ],
  },

  {
    id: "amboseli",
    slug: "amboseli",
    name: "Amboseli",
    country: "Kenya",
    location: "Kenya",
    description:
      "Experience spectacular wildlife beneath the legendary backdrop of Mount Kilimanjaro.",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1800&q=90",
    duration: "3–5 days",
    travelers: "Private & small groups",
    highlights: [
      "Mount Kilimanjaro views",
      "Large elephant herds",
      "Sunrise safari drives",
      "Local cultural experiences",
    ],
  },

  {
    id: "serengeti",
    slug: "serengeti",
    name: "Serengeti",
    country: "Tanzania",
    location: "Tanzania",
    description:
      "Explore endless plains, remarkable wildlife, and the raw beauty of Tanzania's most famous safari destination.",
    image:
      "https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1800&q=90",
    duration: "4–8 days",
    travelers: "Private & small groups",
    highlights: [
      "The Great Migration",
      "Big Five safaris",
      "Endless savannah landscapes",
      "Luxury safari lodges",
    ],
  },

  {
    id: "zanzibar",
    slug: "zanzibar",
    name: "Zanzibar",
    country: "Tanzania",
    location: "Tanzania",
    description:
      "Slow down beside turquoise waters, white-sand beaches, and the rich culture of Tanzania's tropical island paradise.",
    image:
      "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=1800&q=90",
    duration: "4–10 days",
    travelers: "Couples, families & groups",
    highlights: [
      "White-sand beaches",
      "Stone Town heritage",
      "Snorkeling & diving",
      "Spice island experiences",
    ],
  },

  {
    id: "nairobi-national-park",
    slug: "nairobi-national-park",
    name: "Nairobi National Park",
    country: "Kenya",
    location: "Nairobi, Kenya",
    description:
      "Experience remarkable wildlife just outside Kenya's capital, where open savannahs meet the Nairobi skyline.",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=90",
    duration: "1–2 days",
    travelers: "Private, families & small groups",
    highlights: [
      "Lion and big game viewing",
      "Giraffes and zebras",
      "Easy access from Nairobi",
      "Perfect short safari escape",
    ],
  },
];

/* =========================================================
   NORMALIZE DESTINATION

   Converts different API formats into one consistent
   frontend structure.
   ========================================================= */

const normalizeDestination = (destination) => {
  if (!destination || typeof destination !== "object") {
    return null;
  }

  const name =
    destination.name ||
    destination.title ||
    "Destination";

  const slug =
    destination.slug ||
    destination.destinationSlug ||
    destination.destinationId ||
    destination.tourId ||
    createSlug(name);

  const image =
    destination.image ||
    destination.images?.[0] ||
    destination.coverImage ||
    destination.featuredImage ||
    "";

  const highlights = Array.isArray(destination.highlights)
    ? destination.highlights
    : Array.isArray(destination.features)
      ? destination.features
      : [];

  return {
    ...destination,

    id:
      destination._id ||
      destination.id ||
      slug,

    slug,

    name,

    country:
      destination.country ||
      destination.location ||
      "East Africa",

    location:
      destination.location ||
      destination.country ||
      "East Africa",

    description:
      destination.description ||
      "Discover this remarkable East African destination with JNI Tours.",

    image,

    duration:
      destination.duration ||
      destination.durationText ||
      "Flexible itinerary",

    travelers:
      destination.travelers ||
      destination.groupSize ||
      "Private & small groups",

    highlights,
  };
};

/* =========================================================
   COMPONENT
   ========================================================= */

function DestinationDetails() {
  const { destinationId } = useParams();

  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =======================================================
     FIND PERMANENT DESTINATION
     ======================================================= */

  const findLocalDestination = (value) => {
    const requestedSlug = createSlug(value);

    return defaultDestinations.find((item) => {
      return (
        createSlug(item.slug) === requestedSlug ||
        createSlug(item.id) === requestedSlug ||
        createSlug(item.name) === requestedSlug
      );
    });
  };

  /* =======================================================
     FIND DESTINATION INSIDE API COLLECTION
     ======================================================= */

  const findApiDestination = (destinations, requestedSlug) => {
    const normalized = destinations
      .map(normalizeDestination)
      .filter(Boolean);

    return normalized.find((item) => {
      return (
        createSlug(item.slug) === requestedSlug ||
        createSlug(item.id) === requestedSlug ||
        createSlug(item.name) === requestedSlug ||
        createSlug(item.destinationId) === requestedSlug ||
        createSlug(item.destinationSlug) === requestedSlug ||
        createSlug(item.tourId) === requestedSlug
      );
    });
  };

  /* =======================================================
     LOAD DESTINATION
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadDestination = async () => {
      if (!destinationId) {
        if (!cancelled) {
          setDestination(null);
          setError("No destination was specified.");
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError("");
      setDestination(null);

      const requestedSlug = createSlug(destinationId);

      /* ===================================================
         STEP 1
         Check permanent website destinations FIRST.
         =================================================== */

      const localDestination =
        findLocalDestination(requestedSlug);

      if (localDestination) {
        if (!cancelled) {
          setDestination(localDestination);
          setLoading(false);
        }

        return;
      }

      /* ===================================================
         STEP 2
         Try direct API lookup.
         =================================================== */

      try {
        const response = await fetch(
          `${API_URL}/api/destinations/${encodeURIComponent(
            requestedSlug
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          const apiDestination =
            data?.destination ||
            data?.data?.destination ||
            data?.data ||
            data;

          if (
            apiDestination &&
            typeof apiDestination === "object" &&
            !Array.isArray(apiDestination)
          ) {
            const normalized =
              normalizeDestination(apiDestination);

            if (
              normalized &&
              (
                createSlug(normalized.slug) ===
                  requestedSlug ||
                createSlug(normalized.id) ===
                  requestedSlug ||
                createSlug(normalized.name) ===
                  requestedSlug
              )
            ) {
              if (!cancelled) {
                setDestination(normalized);
                setLoading(false);
              }

              return;
            }
          }
        }
      } catch (apiError) {
        console.warn(
          "Direct destination lookup failed:",
          apiError
        );
      }

      /* ===================================================
         STEP 3
         Fetch entire destination collection.

         This supports APIs that only implement:

         GET /api/destinations
         =================================================== */

      try {
        const collectionResponse = await fetch(
          `${API_URL}/api/destinations`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (collectionResponse.ok) {
          const collectionData =
            await collectionResponse.json();

          const destinations =
            extractDestinations(collectionData);

          const matched = findApiDestination(
            destinations,
            requestedSlug
          );

          if (matched) {
            if (!cancelled) {
              setDestination(matched);
              setLoading(false);
            }

            return;
          }
        }
      } catch (apiError) {
        console.warn(
          "Destination collection lookup failed:",
          apiError
        );
      }

      /* ===================================================
         STEP 4
         Destination genuinely does not exist.
         =================================================== */

      if (!cancelled) {
        setDestination(null);

        setError(
          "The requested destination could not be found."
        );

        setLoading(false);
      }
    };

    loadDestination();

    return () => {
      cancelled = true;
    };
  }, [destinationId]);

  /* =======================================================
     DESTINATION SLUG
     ======================================================= */

  const destinationSlug = useMemo(() => {
    if (!destination) {
      return createSlug(destinationId);
    }

    return (
      destination.slug ||
      destination.id ||
      createSlug(destination.name)
    );
  }, [destination, destinationId]);

  /* =======================================================
     BOOKING URL
     ======================================================= */

  const bookingUrl =
    `/destination-booking/${destinationSlug}`;

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <main className="destination-details-page">
        <section className="destination-details-loading">
          <FiCompass />

          <h1>
            Discovering your destination...
          </h1>

          <p>
            Preparing the perfect East African
            experience for you.
          </p>
        </section>
      </main>
    );
  }

  /* =======================================================
     ERROR
     ======================================================= */

  if (error || !destination) {
    return (
      <main className="destination-details-page">
        <section className="destination-details-not-found">
          <FiMapPin />

          <span>
            Destination unavailable
          </span>

          <h1>
            Destination not found
          </h1>

          <p>
            {error ||
              "The requested destination could not be found."}
          </p>

          <Link
            to="/destinations"
            className="destination-back-button"
          >
            <FiArrowLeft />
            Browse destinations
          </Link>
        </section>
      </main>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="destination-details-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="destination-details-hero">

        <img
          src={destination.image}
          alt={`${destination.name}, ${
            destination.country ||
            destination.location
          }`}
          className="destination-details-hero-image"
          loading="eager"
          fetchPriority="high"
        />

        <div className="destination-details-hero-overlay" />

        <div className="container">

          <div className="destination-details-hero-content">

            <Link
              to="/destinations"
              className="destination-details-back"
            >
              <FiArrowLeft />
              All destinations
            </Link>

            <span className="destination-details-eyebrow">
              <FiCompass />
              Explore East Africa
            </span>

            <div className="destination-details-location">
              <FiMapPin />

              {destination.country ||
                destination.location}
            </div>

            <h1>
              {destination.name}
            </h1>

            <p>
              {destination.description}
            </p>

            <div className="destination-details-hero-actions">

              <Link
                to={bookingUrl}
                className="destination-details-book-button"
              >
                Book this destination
                <FiArrowUpRight />
              </Link>

              <Link
                to="/tours"
                className="destination-details-tours-button"
              >
                Explore tours
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          OVERVIEW
      ================================================= */}

      <section className="destination-details-overview">

        <div className="container">

          <div className="destination-details-grid">

            {/* =============================================
                MAIN CONTENT
            ============================================= */}

            <div className="destination-details-main">

              <span className="destination-section-eyebrow">
                Destination experience
              </span>

              <h2>
                Make this place part of
                <em> your story.</em>
              </h2>

              <p>
                {destination.description}
              </p>

              <p>
                Whether you're looking for
                wildlife, culture, adventure,
                relaxation, or a carefully
                designed private journey, JNI
                Tours can help you create an
                unforgettable experience in{" "}
                {destination.name}.
              </p>

              {/* =========================================
                  HIGHLIGHTS
              ========================================= */}

              {destination.highlights?.length > 0 && (
                <div className="destination-highlights">

                  <span>
                    Why visit
                  </span>

                  <div className="destination-highlights-grid">

                    {destination.highlights.map(
                      (highlight, index) => (
                        <div
                          className="destination-highlight"
                          key={`${highlight}-${index}`}
                        >
                          <FiCheckCircle />

                          <span>
                            {highlight}
                          </span>
                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* =============================================
                BOOKING CARD
            ============================================= */}

            <aside className="destination-booking-card">

              <span>
                Plan your journey
              </span>

              <h2>
                Visit{" "}
                <em>
                  {destination.name}
                </em>
              </h2>

              <div className="destination-booking-meta">

                <div>
                  <FiClock />

                  <span>
                    <small>
                      Typical duration
                    </small>

                    <strong>
                      {destination.duration}
                    </strong>
                  </span>
                </div>

                <div>
                  <FiUsers />

                  <span>
                    <small>
                      Travelers
                    </small>

                    <strong>
                      {destination.travelers}
                    </strong>
                  </span>
                </div>

                <div>
                  <FiMapPin />

                  <span>
                    <small>
                      Location
                    </small>

                    <strong>
                      {destination.country ||
                        destination.location}
                    </strong>
                  </span>
                </div>

              </div>

              <div className="destination-booking-card-divider" />

              <p>
                Tell us when you'd like to
                travel and we'll help design
                the right experience for you.
              </p>

              <Link
                to={bookingUrl}
                className="destination-booking-card-button"
              >
                <FiCalendar />
                Start booking
                <FiArrowUpRight />
              </Link>

            </aside>

          </div>

        </div>

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="destination-details-cta">

        <div className="container">

          <div className="destination-details-cta-inner">

            <div>

              <span>
                Ready when you are
              </span>

              <h2>
                Let's plan your{" "}
                <em>
                  {destination.name}
                </em>{" "}
                journey.
              </h2>

            </div>

            <button
              type="button"
              onClick={() => navigate(bookingUrl)}
              className="destination-details-cta-button"
            >
              Book destination
              <FiArrowUpRight />
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}

export default DestinationDetails;