import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiGlobe,
  FiMapPin,
  FiMinus,
  FiPlus,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./DestinationBooking.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

/*
|--------------------------------------------------------------------------
| DEFAULT DESTINATIONS
|--------------------------------------------------------------------------
*/

const destinations = [
  {
    id: "masai-mara",
    name: "Masai Mara",
    country: "Kenya",
    location: "Kenya",
    description:
      "Witness incredible wildlife, sweeping savannahs, and unforgettable safari moments in one of Africa's most iconic reserves.",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=85",
    duration: "4 Days / 3 Nights",
    price: 850,
    currency: "USD",
    highlights: [
      "Big Five wildlife",
      "Game drives",
      "Luxury safari accommodation",
      "Professional safari guide",
    ],
  },

  {
    id: "amboseli",
    name: "Amboseli",
    country: "Kenya",
    location: "Kenya",
    description:
      "Experience spectacular wildlife beneath the legendary backdrop of Mount Kilimanjaro.",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=85",
    duration: "3 Days / 2 Nights",
    price: 650,
    currency: "USD",
    highlights: [
      "Mount Kilimanjaro views",
      "Elephant encounters",
      "Game drives",
      "Safari accommodation",
    ],
  },

  {
    id: "serengeti",
    name: "Serengeti",
    country: "Tanzania",
    location: "Tanzania",
    description:
      "Explore endless plains, remarkable wildlife, and the raw beauty of Tanzania's most famous safari destination.",
    image:
      "https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1600&q=85",
    duration: "5 Days / 4 Nights",
    price: 1200,
    currency: "USD",
    highlights: [
      "Serengeti National Park",
      "Wildlife game drives",
      "Great Migration region",
      "Professional guide",
    ],
  },

  {
    id: "zanzibar",
    name: "Zanzibar",
    country: "Tanzania",
    location: "Tanzania",
    description:
      "Slow down beside turquoise waters, white-sand beaches, and the rich culture of Tanzania's tropical island paradise.",
    image:
      "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=1600&q=85",
    duration: "5 Days / 4 Nights",
    price: 950,
    currency: "USD",
    highlights: [
      "White-sand beaches",
      "Stone Town",
      "Island excursions",
      "Beach accommodation",
    ],
  },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractDestinations(data) {
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

  return [];
}

function normalizeDestination(destination) {
  const name =
    destination?.name ||
    destination?.title ||
    "Destination";

  const slug =
    destination?.slug ||
    destination?.destinationId ||
    destination?.id ||
    createSlug(name);

  const image =
    destination?.image ||
    destination?.images?.[0] ||
    "";

  return {
    ...destination,

    id:
      destination?._id ||
      destination?.id ||
      slug,

    name,

    country:
      destination?.country ||
      destination?.location ||
      "East Africa",

    location:
      destination?.location ||
      destination?.country ||
      "East Africa",

    description:
      destination?.description ||
      "Discover this remarkable destination with JNI Tours.",

    image,

    slug,

    duration:
      destination?.duration ||
      destination?.durationText ||
      "Custom itinerary",

    price:
      Number(
        destination?.price ??
          destination?.startingPrice ??
          destination?.pricing?.amount ??
          0
      ) || 0,

    currency:
      destination?.currency ||
      destination?.pricing?.currency ||
      "USD",

    highlights:
      Array.isArray(destination?.highlights)
        ? destination.highlights
        : [],
  };
}

function formatCurrency(amount, currency = "USD") {
  const value = Number(amount) || 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function DestinationBooking() {
  const { destinationId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [adminDestinations, setAdminDestinations] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [destination, setDestination] =
    useState(null);

  const [submitLoading, setSubmitLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    travelDate: "",
    adults: 2,
    children: 0,
    notes: "",
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD DESTINATIONS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadDestinations = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/destinations`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load destinations (${response.status})`
          );
        }

        const data = await response.json();

        const normalized =
          extractDestinations(data)
            .map(normalizeDestination)
            .filter(
              (item) =>
                item.name &&
                item.image
            );

        if (!cancelled) {
          setAdminDestinations(normalized);
        }
      } catch (err) {
        console.error(
          "Destination booking load error:",
          err
        );

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

  /*
  |--------------------------------------------------------------------------
  | FIND DESTINATION
  |--------------------------------------------------------------------------
  */

  const allDestinations = useMemo(() => {
    const combined = [
      ...destinations,
      ...adminDestinations,
    ];

    const seen = new Set();

    return combined.filter((item) => {
      const key = createSlug(
        item.slug ||
          item.id ||
          item.name
      );

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  }, [adminDestinations]);

  useEffect(() => {
    if (loading) return;

    const requestedSlug = createSlug(
      destinationId
    );

    const found =
      allDestinations.find(
        (item) =>
          createSlug(item.slug) ===
            requestedSlug ||
          createSlug(item.id) ===
            requestedSlug ||
          createSlug(item.name) ===
            requestedSlug
      );

    setDestination(found || null);
  }, [
    destinationId,
    allDestinations,
    loading,
  ]);

  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateGuests = (
    field,
    amount
  ) => {
    setForm((current) => ({
      ...current,
      [field]: Math.max(
        field === "adults" ? 1 : 0,
        Number(current[field]) +
          amount
      ),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | TOTAL
  |--------------------------------------------------------------------------
  */

  const guests =
    Number(form.adults) +
    Number(form.children);

  const estimatedTotal =
    Number(destination?.price || 0) *
    Number(form.adults || 0);

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!destination) {
      setError(
        "The selected destination could not be found."
      );
      return;
    }

    if (!form.travelDate) {
      setError(
        "Please select your preferred travel date."
      );
      return;
    }

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim()
    ) {
      setError(
        "Please complete your contact details."
      );
      return;
    }

    try {
      setSubmitLoading(true);
      setError("");

      const payload = {
        destinationId:
          destination.id,

        destinationSlug:
          destination.slug,

        destination:
          destination.name,

        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        email:
          form.email.trim(),

        phone:
          form.phone.trim(),

        travelDate:
          form.travelDate,

        adults:
          Number(form.adults),

        children:
          Number(form.children),

        guests,

        notes:
          form.notes.trim(),

        amount:
          estimatedTotal,

        currency:
          destination.currency ||
          "USD",
      };

      /*
      |--------------------------------------------------------------------------
      | DESTINATION BOOKING ENDPOINT
      |--------------------------------------------------------------------------
      |
      | If the backend is already configured to accept destination bookings,
      | this creates the booking and moves the customer to payment.
      |
      */

      const response = await fetch(
        `${API_BASE_URL}/api/bookings`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const data =
        contentType.includes(
          "application/json"
        )
          ? await response.json()
          : {
              message:
                await response.text(),
            };

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to create your booking."
        );
      }

      const booking =
        data?.booking ||
        data?.data ||
        data;

      const bookingId =
        booking?.bookingId ||
        booking?._id ||
        booking?.id;

      if (!bookingId) {
        throw new Error(
          "Booking was created, but no booking reference was returned."
        );
      }

      navigate(
        `/payment/${bookingId}`
      );
    } catch (err) {
      console.error(
        "Destination booking error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while creating your booking."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="destination-booking-page">
        <div className="destination-booking-loading">
          <div className="destination-booking-spinner" />

          <h2>
            Preparing your journey...
          </h2>

          <p>
            Loading destination details.
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!destination) {
    return (
      <main className="destination-booking-page">
        <section className="destination-booking-not-found">
          <FiMapPin />

          <span>
            Destination unavailable
          </span>

          <h1>
            Destination not found
          </h1>

          <p>
            We couldn't find the destination
            you're trying to book.
          </p>

          <Link
            to="/destinations"
            className="destination-booking-primary"
          >
            <FiArrowLeft />
            Browse destinations
          </Link>
        </section>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="destination-booking-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="destination-booking-hero"
        style={{
          backgroundImage: `url("${destination.image}")`,
        }}
      >
        <div className="destination-booking-hero-overlay" />

        <div className="container destination-booking-hero-inner">

          <Link
            to="/destinations"
            className="destination-booking-back"
          >
            <FiArrowLeft />
            Back to destinations
          </Link>

          <div className="destination-booking-hero-content">

            <span>
              <FiMapPin />
              {destination.country}
            </span>

            <h1>
              Book your{" "}
              <em>
                {destination.name}
              </em>{" "}
              journey.
            </h1>

            <p>
              Create your perfect East
              African escape with JNI Tours.
            </p>

          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="destination-booking-content">
        <div className="container destination-booking-layout">

          {/* =================================================
              BOOKING FORM
          ================================================= */}

          <div className="destination-booking-form-card">

            <div className="destination-booking-section-heading">
              <span>
                Reserve your experience
              </span>

              <h2>
                Tell us about your journey
              </h2>

              <p>
                Complete the details below and
                our travel team will prepare
                your reservation.
              </p>
            </div>

            {error && (
              <div className="destination-booking-error">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="destination-booking-form"
            >

              {/* CONTACT */}

              <div className="destination-booking-form-section">

                <div className="destination-form-section-title">
                  <span>01</span>

                  <div>
                    <strong>
                      Contact details
                    </strong>

                    <small>
                      Who should we contact?
                    </small>
                  </div>
                </div>

                <div className="destination-form-grid">

                  <div className="destination-form-group">
                    <label htmlFor="firstName">
                      First name
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div className="destination-form-group">
                    <label htmlFor="lastName">
                      Last name
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      autoComplete="family-name"
                      required
                    />
                  </div>

                  <div className="destination-form-group">
                    <label htmlFor="email">
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="destination-form-group">
                    <label htmlFor="phone">
                      Phone number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+254..."
                      autoComplete="tel"
                    />
                  </div>

                </div>
              </div>

              {/* TRIP */}

              <div className="destination-booking-form-section">

                <div className="destination-form-section-title">
                  <span>02</span>

                  <div>
                    <strong>
                      Journey details
                    </strong>

                    <small>
                      When are you travelling?
                    </small>
                  </div>
                </div>

                <div className="destination-form-grid">

                  <div className="destination-form-group">
                    <label htmlFor="travelDate">
                      Preferred travel date
                    </label>

                    <div className="destination-input-icon">
                      <FiCalendar />

                      <input
                        id="travelDate"
                        name="travelDate"
                        type="date"
                        value={form.travelDate}
                        onChange={handleChange}
                        min={
                          new Date()
                            .toISOString()
                            .split("T")[0]
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="destination-form-group">
                    <label>
                      Travellers
                    </label>

                    <div className="destination-guests">

                      <div>
                        <span>
                          <FiUsers />
                          Adults
                        </span>

                        <div className="destination-stepper">
                          <button
                            type="button"
                            onClick={() =>
                              updateGuests(
                                "adults",
                                -1
                              )
                            }
                            disabled={
                              form.adults <= 1
                            }
                            aria-label="Decrease adults"
                          >
                            <FiMinus />
                          </button>

                          <strong>
                            {form.adults}
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              updateGuests(
                                "adults",
                                1
                              )
                            }
                            aria-label="Increase adults"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>

                      <div>
                        <span>
                          <FiUsers />
                          Children
                        </span>

                        <div className="destination-stepper">
                          <button
                            type="button"
                            onClick={() =>
                              updateGuests(
                                "children",
                                -1
                              )
                            }
                            disabled={
                              form.children <= 0
                            }
                            aria-label="Decrease children"
                          >
                            <FiMinus />
                          </button>

                          <strong>
                            {form.children}
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              updateGuests(
                                "children",
                                1
                              )
                            }
                            aria-label="Increase children"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              {/* NOTES */}

              <div className="destination-booking-form-section">

                <div className="destination-form-section-title">
                  <span>03</span>

                  <div>
                    <strong>
                      Special requests
                    </strong>

                    <small>
                      Anything we should know?
                    </small>
                  </div>
                </div>

                <div className="destination-form-group">
                  <label htmlFor="notes">
                    Additional information
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell us about dietary requirements, special occasions, preferred accommodation, activities, or anything else..."
                  />
                </div>

              </div>

              <button
                type="submit"
                className="destination-booking-submit"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <span className="destination-button-spinner" />
                    Creating booking...
                  </>
                ) : (
                  <>
                    Continue to payment
                    <FiArrowRight />
                  </>
                )}
              </button>

              <p className="destination-booking-secure-note">
                <FiShield />
                Your booking information is
                transmitted securely.
              </p>

            </form>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <aside className="destination-booking-summary">

            <div className="destination-summary-card">

              <div className="destination-summary-image">
                <img
                  src={destination.image}
                  alt={destination.name}
                />
              </div>

              <div className="destination-summary-content">

                <span className="destination-summary-eyebrow">
                  Your destination
                </span>

                <h2>
                  {destination.name}
                </h2>

                <div className="destination-summary-location">
                  <FiMapPin />
                  {destination.location}
                </div>

                <p>
                  {destination.description}
                </p>

                <div className="destination-summary-meta">

                  <div>
                    <FiClock />

                    <span>
                      <small>
                        Duration
                      </small>

                      <strong>
                        {destination.duration}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <FiGlobe />

                    <span>
                      <small>
                        Region
                      </small>

                      <strong>
                        East Africa
                      </strong>
                    </span>
                  </div>

                </div>

                {destination.highlights?.length >
                  0 && (
                  <div className="destination-highlights">

                    <span>
                      Experience includes
                    </span>

                    <ul>
                      {destination.highlights
                        .slice(0, 4)
                        .map((item) => (
                          <li key={item}>
                            <FiCheckCircle />
                            {item}
                          </li>
                        ))}
                    </ul>

                  </div>
                )}

                <div className="destination-price-box">

                  <span>
                    Estimated from
                  </span>

                  <strong>
                    {formatCurrency(
                      destination.price,
                      destination.currency
                    )}
                  </strong>

                  <small>
                    per adult
                  </small>

                </div>

              </div>

            </div>

            <div className="destination-booking-total">

              <div>
                <span>
                  Estimated total
                </span>

                <small>
                  {form.adults} adult
                  {form.adults !== 1
                    ? "s"
                    : ""}
                  {form.children > 0
                    ? ` + ${form.children} child${
                        form.children !== 1
                          ? "ren"
                          : ""
                      }`
                    : ""}
                </small>
              </div>

              <strong>
                {formatCurrency(
                  estimatedTotal,
                  destination.currency
                )}
              </strong>

            </div>

            <div className="destination-booking-note">
              <FiShield />

              <div>
                <strong>
                  Flexible booking
                </strong>

                <span>
                  Your reservation will be
                  reviewed by our travel team
                  before final confirmation.
                </span>
              </div>
            </div>

          </aside>

        </div>
      </section>
    </main>
  );
}

export default DestinationBooking;