import { useEffect, useState } from "react";

import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiInfo,
  FiMinus,
  FiPlus,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import featuredTours from "../../data/featuredTours";
import { getTour } from "../../data/tourDetails";
import bookingOptions from "../../data/bookingOptions";

import { useBookings } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";

import "./Booking.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

/*
 * Convert any MongoDB/admin tour into the structure
 * expected by the booking page.
 */
const normalizeTour = (tour) => {
  if (!tour) {
    return null;
  }

  const images = Array.isArray(tour.images)
    ? tour.images.filter(Boolean)
    : [];

  const image =
    tour.image ||
    images[0] ||
    FALLBACK_IMAGE;

  const title =
    tour.title ||
    "Untitled Tour";

  const slug =
    tour.slug ||
    String(title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return {
    ...tour,

    id:
      tour.id ||
      tour._id ||
      slug,

    _id:
      tour._id ||
      tour.id ||
      slug,

    title,
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

    guests:
      tour.guests ||
      tour.groupSize ||
      "Private / Small group",

    price:
      Number(tour.price) || 0,

    rating:
      Number(tour.rating) || 0,

    reviews:
      Number(tour.reviews) || 0,

    image,

    images:
      images.length > 0
        ? images
        : [image],

    overview:
      tour.overview ||
      tour.description ||
      "",

    highlights:
      Array.isArray(tour.highlights)
        ? tour.highlights
        : [],

    itinerary:
      Array.isArray(tour.itinerary)
        ? tour.itinerary
        : [],

    included:
      Array.isArray(tour.included)
        ? tour.included
        : [],

    excluded:
      Array.isArray(tour.excluded)
        ? tour.excluded
        : [],

    accommodation:
      tour.accommodation ||
      "",

    bestTime:
      tour.bestTime ||
      "Year-round",

    notes:
      tour.notes ||
      "",
  };
};

/*
 * Find a tour inside the built-in data.
 */
const findBuiltInTour = (tourId) => {
  if (!tourId) {
    return null;
  }

  /*
   * First try the existing tourDetails lookup.
   */
  const directTour = getTour(tourId);

  if (directTour) {
    return normalizeTour(directTour);
  }

  /*
   * Then try featuredTours as an additional fallback.
   */
  const found = featuredTours.find((item) => {
    const slug =
      item.slug ||
      String(item.title || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return (
      String(item.id || "") === String(tourId) ||
      String(item._id || "") === String(tourId) ||
      slug === String(tourId)
    );
  });

  return found
    ? normalizeTour(found)
    : null;
};

/*
 * Find a MongoDB tour from the public API response.
 */
const findDatabaseTour = (tours, tourId) => {
  if (!Array.isArray(tours) || !tourId) {
    return null;
  }

  const normalizedTourId =
    String(tourId)
      .trim()
      .toLowerCase();

  const found = tours.find((item) => {
    const id = String(
      item.id ||
        item._id ||
        ""
    )
      .trim()
      .toLowerCase();

    const slug = String(
      item.slug ||
        ""
    )
      .trim()
      .toLowerCase();

    const title = String(
      item.title ||
        ""
    )
      .trim()
      .toLowerCase();

    return (
      id === normalizedTourId ||
      slug === normalizedTourId ||
      title === normalizedTourId
    );
  });

  return found
    ? normalizeTour(found)
    : null;
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function Booking() {
  const { tourId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const { addBooking } = useBookings();

  const {
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | TOUR STATE
  |--------------------------------------------------------------------------
  */

  const [tour, setTour] = useState(() =>
    findBuiltInTour(tourId)
  );

  const [loadingTour, setLoadingTour] =
    useState(true);

  const [tourError, setTourError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | BOOKING STATE
  |--------------------------------------------------------------------------
  */

  const [travelDate, setTravelDate] =
    useState("");

  const [adults, setAdults] =
    useState(2);

  const [children, setChildren] =
    useState(0);

  const [accommodation, setAccommodation] =
    useState("standard");

  const [extras, setExtras] =
    useState([]);

  const [traveler, setTraveler] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      requests: "",
    });

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | AUTHENTICATION GUARD
  |--------------------------------------------------------------------------
  |
  | Booking is a protected customer action.
  |
  | If the visitor is not authenticated, redirect them to login.
  |
  | We preserve the current booking URL using:
  |
  | /login?redirect=/booking/tour-slug
  |
  | The login page can then redirect the customer back to
  | this booking page after successful authentication.
  |
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated) {
      return;
    }

    const currentPath =
      `${location.pathname}${location.search}${location.hash}`;

    const loginUrl =
      `/login?redirect=${encodeURIComponent(
        currentPath
      )}`;

    navigate(loginUrl, {
      replace: true,
    });
  }, [
    authLoading,
    isAuthenticated,
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LOAD TOUR
  |--------------------------------------------------------------------------
  |
  | The booking page supports:
  |
  | /booking/built-in-slug
  |
  | and
  |
  | /booking/admin-created-slug
  |
  | MongoDB tours are loaded through:
  |
  | GET /api/tours
  |
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    /*
     * Do not load protected booking data until
     * authentication has finished resolving.
     */
    if (authLoading || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    const loadTour = async () => {
      setLoadingTour(true);
      setTourError("");

      /*
       * Try built-in tour immediately.
       */
      const builtInTour =
        findBuiltInTour(tourId);

      if (builtInTour && isMounted) {
        setTour(builtInTour);
      }

      try {
        const response = await fetch(
          `${API_URL}/api/tours`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load tours (${response.status})`
          );
        }

        const data =
          await response.json();

        /*
         * Support:
         *
         * [...]
         *
         * and:
         *
         * { tours: [...] }
         */
        const databaseTours =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.tours)
            ? data.tours
            : [];

        const databaseTour =
          findDatabaseTour(
            databaseTours,
            tourId
          );

        if (isMounted) {
          /*
           * Database tour takes priority.
           */
          if (databaseTour) {
            setTour(databaseTour);
          } else if (builtInTour) {
            setTour(builtInTour);
          } else {
            setTour(null);

            setTourError(
              "We couldn't find the tour you're trying to book."
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load booking tour:",
          error
        );

        /*
         * If API fails but this is a built-in tour,
         * continue using the built-in version.
         */
        if (isMounted) {
          if (builtInTour) {
            setTour(builtInTour);
          } else {
            setTour(null);

            setTourError(
              "We couldn't load this tour. Please try again."
            );
          }
        }
      } finally {
        if (isMounted) {
          setLoadingTour(false);
        }
      }
    };

    loadTour();

    return () => {
      isMounted = false;
    };
  }, [
    tourId,
    authLoading,
    isAuthenticated,
  ]);

  /*
  |--------------------------------------------------------------------------
  | AUTH LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (authLoading) {
    return (
      <main className="booking-not-found">
        <FiShield />

        <h1>
          Checking your account...
        </h1>

        <p>
          Please wait while we prepare
          your booking.
        </p>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UNAUTHENTICATED STATE
  |--------------------------------------------------------------------------
  |
  | Normally the redirect effect above handles this.
  | This prevents the booking form from briefly appearing
  | before navigation happens.
  |
  |--------------------------------------------------------------------------
  */

  if (!isAuthenticated) {
    return (
      <main className="booking-not-found">
        <FiShield />

        <h1>
          Login required
        </h1>

        <p>
          Please login to continue
          with your booking.
        </p>

        <Link
          to={`/login?redirect=${encodeURIComponent(
            `${location.pathname}${location.search}${location.hash}`
          )}`}
        >
          Continue to login
        </Link>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | TOUR LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loadingTour && !tour) {
    return (
      <main className="booking-not-found">
        <FiInfo />

        <h1>
          Loading tour...
        </h1>

        <p>
          We're preparing your booking details.
        </p>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | TOUR NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!tour) {
    return (
      <main className="booking-not-found">
        <FiInfo />

        <h1>
          Tour not found
        </h1>

        <p>
          {tourError ||
            "We couldn't find the tour you're trying to book."}
        </p>

        <Link to="/tours">
          Browse all tours
        </Link>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | TOUR DATA
  |--------------------------------------------------------------------------
  */

  const tourPrice =
    Number(tour.price) || 0;

  const accommodationOption =
    bookingOptions.accommodation.find(
      (item) =>
        item.id === accommodation
    );

  const selectedExtras =
    bookingOptions.extras.filter(
      (item) =>
        extras.includes(item.id)
    );

  /*
  |--------------------------------------------------------------------------
  | PRICING
  |--------------------------------------------------------------------------
  */

  const accommodationPrice =
    Number(
      accommodationOption?.price
    ) || 0;

  const adultsCost =
    tourPrice * adults;

  const childPrice =
    Math.round(tourPrice * 0.5);

  const childrenCost =
    childPrice * children;

  const accommodationTotal =
    accommodationPrice *
    (adults + children);

  const extrasCost =
    selectedExtras.reduce(
      (total, item) =>
        total +
        (Number(item.price) || 0),
      0
    );

  const total =
    adultsCost +
    childrenCost +
    accommodationTotal +
    extrasCost;

  const travelerCount =
    adults + children;

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const updateTraveler = (
    field,
    value
  ) => {
    setTraveler((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleExtra = (id) => {
    setExtras((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  };

  const increaseAdults = () => {
    setAdults((current) =>
      current < 12
        ? current + 1
        : current
    );
  };

  const decreaseAdults = () => {
    setAdults((current) =>
      current > 1
        ? current - 1
        : current
    );
  };

  const increaseChildren = () => {
    setChildren((current) =>
      current < 8
        ? current + 1
        : current
    );
  };

  const decreaseChildren = () => {
    setChildren((current) =>
      current > 0
        ? current - 1
        : current
    );
  };

  /*
  |--------------------------------------------------------------------------
  | FORM VALIDATION
  |--------------------------------------------------------------------------
  */

  const emailIsValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      traveler.email.trim()
    );

  const isFormReady =
    Boolean(travelDate) &&
    Boolean(
      traveler.firstName.trim()
    ) &&
    Boolean(
      traveler.lastName.trim()
    ) &&
    Boolean(
      traveler.email.trim()
    ) &&
    emailIsValid &&
    Boolean(
      traveler.phone.trim()
    ) &&
    Boolean(
      traveler.country.trim()
    );

  /*
  |--------------------------------------------------------------------------
  | TOUR URL
  |--------------------------------------------------------------------------
  */

  const tourUrl = tour.slug
    ? `/tours/${tour.slug}`
    : `/tours/${tour.id}`;

  /*
  |--------------------------------------------------------------------------
  | CREATE BOOKING
  |--------------------------------------------------------------------------
  */

  const handleBooking = async () => {
    if (submitting) {
      return;
    }

    setSubmitError("");

    /*
     * Extra validation.
     */

    if (!travelDate) {
      setSubmitError(
        "Please select your preferred travel date."
      );
      return;
    }

    if (!traveler.firstName.trim()) {
      setSubmitError(
        "Please enter the lead traveler's first name."
      );
      return;
    }

    if (!traveler.lastName.trim()) {
      setSubmitError(
        "Please enter the lead traveler's last name."
      );
      return;
    }

    if (!traveler.email.trim()) {
      setSubmitError(
        "Please enter an email address."
      );
      return;
    }

    if (!emailIsValid) {
      setSubmitError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!traveler.phone.trim()) {
      setSubmitError(
        "Please enter a phone number."
      );
      return;
    }

    if (!traveler.country.trim()) {
      setSubmitError(
        "Please enter your country of residence."
      );
      return;
    }

    setSubmitting(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | COMPLETE BOOKING PAYLOAD
      |--------------------------------------------------------------------------
      */

      const bookingData = {
        /*
         * Tour information
         */

        tourId:
          tour.id ||
          tour._id ||
          "",

        tourSlug:
          tour.slug || "",

        tourTitle:
          tour.title || "",

        destination:
          tour.destination || "",

        category:
          tour.category || "",

        duration:
          tour.duration || "",

        image:
          tour.images?.[0] ||
          tour.image ||
          FALLBACK_IMAGE,

        /*
         * Travel information
         */

        travelDate,

        adults,

        children,

        travelers:
          travelerCount,

        /*
         * Lead traveler
         */

        traveler: {
          firstName:
            traveler.firstName.trim(),

          lastName:
            traveler.lastName.trim(),

          email:
            traveler.email
              .trim()
              .toLowerCase(),

          phone:
            traveler.phone.trim(),

          country:
            traveler.country.trim(),

          requests:
            traveler.requests.trim(),
        },

        /*
         * Accommodation
         */

        accommodation: {
          id:
            accommodationOption?.id ||
            accommodation,

          name:
            accommodationOption?.name ||
            "Standard",

          price:
            accommodationPrice,
        },

        /*
         * Extras
         */

        extras:
          selectedExtras.map(
            (extra) => ({
              id: extra.id,

              name: extra.name,

              description:
                extra.description || "",

              price:
                Number(extra.price) || 0,
            })
          ),

        /*
         * Pricing snapshot
         */

        pricing: {
          adultPrice:
            tourPrice,

          childPrice,

          adultsCost,

          childrenCost,

          accommodationCost:
            accommodationTotal,

          extrasCost,

          total,

          currency: "USD",
        },

        total,

        currency: "USD",
      };

      console.log(
        "Creating booking with payload:",
        bookingData
      );

      /*
      |--------------------------------------------------------------------------
      | SEND TO BACKEND
      |--------------------------------------------------------------------------
      */

      const response =
        await addBooking(
          bookingData
        );

      console.log(
        "Booking API response:",
        response
      );

      /*
      |--------------------------------------------------------------------------
      | NORMALIZE RESPONSE
      |--------------------------------------------------------------------------
      */

      const newBooking =
        response?.booking ||
        response?.data?.booking ||
        response?.data ||
        response;

      if (!newBooking) {
        throw new Error(
          "The booking server returned an empty response."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | GET OFFICIAL BOOKING ID
      |--------------------------------------------------------------------------
      */

      const bookingId =
        newBooking.bookingId ||
        newBooking.id ||
        newBooking._id;

      if (!bookingId) {
        console.error(
          "Booking created but no booking ID was returned:",
          newBooking
        );

        throw new Error(
          "Booking was created, but no booking ID was returned by the server."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PAYMENT PAGE
      |--------------------------------------------------------------------------
      */

      navigate(
        `/payment/${bookingId}`
      );
    } catch (error) {
      console.error(
        "Booking submission error:",
        error
      );

      setSubmitError(
        error?.response?.data
          ?.message ||
          error?.message ||
          "We couldn't create your booking. Please try again."
      );

      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORMATTED DATE
  |--------------------------------------------------------------------------
  */

  const formattedTravelDate =
    travelDate
      ? new Date(
          `${travelDate}T00:00:00`
        ).toLocaleDateString(
          "en-US",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )
      : "Select a date";

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="booking-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="booking-header">
        <div className="container">

          <Link
            to={tourUrl}
            className="booking-back"
          >
            <FiArrowLeft />
            Back to tour
          </Link>

          <div className="booking-header-content">

            <span>
              Secure your journey
            </span>

            <h1>
              Book your
              <em> adventure.</em>
            </h1>

            <p>
              Tell us when you'd like to travel
              and we'll prepare your journey.
            </p>

          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="booking-content">
        <div className="container">

          <div className="booking-layout">

            {/* =================================================
                FORM
            ================================================= */}

            <div className="booking-form">

              {/* =================================================
                  01 — TRAVEL DETAILS
              ================================================= */}

              <section className="booking-section">

                <div className="booking-section-heading">

                  <div className="booking-step">
                    01
                  </div>

                  <div>
                    <span>
                      Travel details
                    </span>

                    <h2>
                      When are you travelling?
                    </h2>
                  </div>

                </div>

                <div className="booking-date-field">

                  <label htmlFor="travelDate">
                    Preferred travel date
                  </label>

                  <div>
                    <FiCalendar />

                    <input
                      id="travelDate"
                      type="date"
                      value={travelDate}
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(event) =>
                        setTravelDate(
                          event.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <div className="booking-travelers">

                  {/* ADULTS */}

                  <div className="booking-traveler-row">

                    <div>
                      <strong>
                        Adults
                      </strong>

                      <small>
                        Ages 12 and above
                      </small>
                    </div>

                    <div className="booking-counter">

                      <button
                        type="button"
                        onClick={decreaseAdults}
                        disabled={adults <= 1}
                        aria-label="Decrease adults"
                      >
                        <FiMinus />
                      </button>

                      <strong>
                        {adults}
                      </strong>

                      <button
                        type="button"
                        onClick={increaseAdults}
                        disabled={adults >= 12}
                        aria-label="Increase adults"
                      >
                        <FiPlus />
                      </button>

                    </div>

                  </div>

                  {/* CHILDREN */}

                  <div className="booking-traveler-row">

                    <div>
                      <strong>
                        Children
                      </strong>

                      <small>
                        Ages 2–11
                      </small>
                    </div>

                    <div className="booking-counter">

                      <button
                        type="button"
                        onClick={
                          decreaseChildren
                        }
                        disabled={
                          children <= 0
                        }
                        aria-label="Decrease children"
                      >
                        <FiMinus />
                      </button>

                      <strong>
                        {children}
                      </strong>

                      <button
                        type="button"
                        onClick={
                          increaseChildren
                        }
                        disabled={
                          children >= 8
                        }
                        aria-label="Increase children"
                      >
                        <FiPlus />
                      </button>

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================================
                  02 — ACCOMMODATION
              ================================================= */}

              <section className="booking-section">

                <div className="booking-section-heading">

                  <div className="booking-step">
                    02
                  </div>

                  <div>
                    <span>
                      Accommodation
                    </span>

                    <h2>
                      Choose your comfort level
                    </h2>
                  </div>

                </div>

                <div className="booking-options">

                  {bookingOptions.accommodation.map(
                    (option) => (
                      <label
                        className={`booking-option ${
                          accommodation ===
                          option.id
                            ? "selected"
                            : ""
                        }`}
                        key={option.id}
                      >

                        <input
                          type="radio"
                          name="accommodation"
                          value={option.id}
                          checked={
                            accommodation ===
                            option.id
                          }
                          onChange={(event) =>
                            setAccommodation(
                              event.target.value
                            )
                          }
                        />

                        <span className="booking-radio" />

                        <span className="booking-option-content">

                          <strong>
                            {option.name}
                          </strong>

                          <small>
                            {option.description}
                          </small>

                        </span>

                        <span className="booking-option-price">

                          {Number(
                            option.price
                          ) === 0
                            ? "Included"
                            : `+$${Number(
                                option.price
                              ).toLocaleString()}`}

                        </span>

                      </label>
                    )
                  )}

                </div>

              </section>

              {/* =================================================
                  03 — EXTRAS
              ================================================= */}

              <section className="booking-section">

                <div className="booking-section-heading">

                  <div className="booking-step">
                    03
                  </div>

                  <div>
                    <span>
                      Optional experiences
                    </span>

                    <h2>
                      Make your trip special
                    </h2>
                  </div>

                </div>

                <div className="booking-options">

                  {bookingOptions.extras.map(
                    (extra) => {
                      const selected =
                        extras.includes(
                          extra.id
                        );

                      return (
                        <label
                          className={`booking-option ${
                            selected
                              ? "selected"
                              : ""
                          }`}
                          key={extra.id}
                        >

                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              toggleExtra(
                                extra.id
                              )
                            }
                          />

                          <span className="booking-checkbox">
                            {selected && (
                              <FiCheck />
                            )}
                          </span>

                          <span className="booking-option-content">

                            <strong>
                              {extra.name}
                            </strong>

                            <small>
                              {
                                extra.description
                              }
                            </small>

                          </span>

                          <span className="booking-option-price">
                            +$
                            {Number(
                              extra.price
                            ).toLocaleString()}
                          </span>

                        </label>
                      );
                    }
                  )}

                </div>

              </section>

              {/* =================================================
                  04 — TRAVELER INFORMATION
              ================================================= */}

              <section className="booking-section">

                <div className="booking-section-heading">

                  <div className="booking-step">
                    04
                  </div>

                  <div>
                    <span>
                      Lead traveler
                    </span>

                    <h2>
                      Tell us about yourself
                    </h2>
                  </div>

                </div>

                <div className="booking-form-grid">

                  {/* FIRST NAME */}

                  <div className="booking-field">

                    <label htmlFor="firstName">
                      First name
                    </label>

                    <input
                      id="firstName"
                      type="text"
                      value={
                        traveler.firstName
                      }
                      onChange={(event) =>
                        updateTraveler(
                          "firstName",
                          event.target.value
                        )
                      }
                      placeholder="Your first name"
                      autoComplete="given-name"
                    />

                  </div>

                  {/* LAST NAME */}

                  <div className="booking-field">

                    <label htmlFor="lastName">
                      Last name
                    </label>

                    <input
                      id="lastName"
                      type="text"
                      value={
                        traveler.lastName
                      }
                      onChange={(event) =>
                        updateTraveler(
                          "lastName",
                          event.target.value
                        )
                      }
                      placeholder="Your last name"
                      autoComplete="family-name"
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="booking-field">

                    <label htmlFor="email">
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={
                        traveler.email
                      }
                      onChange={(event) =>
                        updateTraveler(
                          "email",
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                    />

                  </div>

                  {/* PHONE */}

                  <div className="booking-field">

                    <label htmlFor="phone">
                      Phone number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      value={
                        traveler.phone
                      }
                      onChange={(event) =>
                        updateTraveler(
                          "phone",
                          event.target.value
                        )
                      }
                      placeholder="+254..."
                      autoComplete="tel"
                    />

                  </div>

                  {/* COUNTRY */}

                  <div className="booking-field booking-field-full">

                    <label htmlFor="country">
                      Country of residence
                    </label>

                    <input
                      id="country"
                      type="text"
                      value={
                        traveler.country
                      }
                      onChange={(event) =>
                        updateTraveler(
                          "country",
                          event.target.value
                        )
                      }
                      placeholder="Your country"
                      autoComplete="country-name"
                    />

                  </div>

                  {/* SPECIAL REQUESTS */}

                  <div className="booking-field booking-field-full">

                    <label htmlFor="requests">
                      Special requests
                    </label>

                    <textarea
                      id="requests"
                      rows="5"
                      value={
                        traveler.requests
                      }
                      onChange={(event) =>
                        updateTraveler(
                          "requests",
                          event.target.value
                        )
                      }
                      placeholder="Dietary requirements, accessibility needs, celebrations, preferred activities..."
                    />

                  </div>

                </div>

              </section>

              {/* =================================================
                  SECURITY
              ================================================= */}

              <div className="booking-security">

                <FiShield />

                <div>

                  <strong>
                    Your information is secure
                  </strong>

                  <p>
                    Your details are only used
                    to prepare and manage your
                    booking.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <aside className="booking-summary">

              <div className="booking-summary-card">

                {/* IMAGE */}

                <div className="booking-summary-image">

                  <img
                    src={
                      tour.images?.[0] ||
                      tour.image ||
                      FALLBACK_IMAGE
                    }
                    alt={tour.title}
                  />

                </div>

                {/* TOUR */}

                <div className="booking-summary-tour">

                  <small>
                    {tour.category ||
                      "Safari"}
                  </small>

                  <h2>
                    {tour.title}
                  </h2>

                  <span>
                    <FiUsers />

                    {tour.guests ||
                      "Private / Small group"}
                  </span>

                </div>

                <div className="booking-summary-divider" />

                {/* DETAILS */}

                <div className="booking-summary-details">

                  <div>

                    <span>
                      <FiCalendar />
                      Date
                    </span>

                    <strong>
                      {formattedTravelDate}
                    </strong>

                  </div>

                  <div>

                    <span>
                      <FiUsers />
                      Travelers
                    </span>

                    <strong>
                      {travelerCount}{" "}
                      {travelerCount === 1
                        ? "traveler"
                        : "travelers"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      <FiClock />
                      Duration
                    </span>

                    <strong>
                      {tour.duration ||
                        "To be confirmed"}
                    </strong>

                  </div>

                </div>

                <div className="booking-summary-divider" />

                {/* PRICE BREAKDOWN */}

                <div className="booking-price-breakdown">

                  <div>

                    <span>
                      Adults × {adults}
                    </span>

                    <strong>
                      $
                      {adultsCost.toLocaleString()}
                    </strong>

                  </div>

                  {children > 0 && (
                    <div>

                      <span>
                        Children × {children}
                      </span>

                      <strong>
                        $
                        {childrenCost.toLocaleString()}
                      </strong>

                    </div>
                  )}

                  {accommodationPrice >
                    0 && (
                    <div>

                      <span>
                        {
                          accommodationOption?.name
                        }
                      </span>

                      <strong>
                        $
                        {accommodationTotal.toLocaleString()}
                      </strong>

                    </div>
                  )}

                  {selectedExtras.map(
                    (extra) => (
                      <div
                        key={extra.id}
                      >

                        <span>
                          {extra.name}
                        </span>

                        <strong>
                          $
                          {Number(
                            extra.price
                          ).toLocaleString()}
                        </strong>

                      </div>
                    )
                  )}

                </div>

                {/* TOTAL */}

                <div className="booking-total">

                  <div>

                    <span>
                      Estimated total
                    </span>

                    <small>
                      USD • final availability
                      and pricing confirmed
                      before payment
                    </small>

                  </div>

                  <strong>
                    $
                    {total.toLocaleString()}
                  </strong>

                </div>

                {/* ERROR */}

                {submitError && (
                  <div
                    className="booking-submit-error"
                    role="alert"
                  >
                    {submitError}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="button"
                  className="booking-continue"
                  disabled={
                    !isFormReady ||
                    submitting
                  }
                  onClick={
                    handleBooking
                  }
                >

                  {submitting
                    ? "Creating booking..."
                    : "Continue to payment"}

                  {!submitting && (
                    <FiArrowRight />
                  )}

                </button>

                {!isFormReady &&
                  !submitting && (
                    <p className="booking-required">
                      Complete the required
                      details above to
                      continue.
                    </p>
                  )}

                <p className="booking-summary-note">
                  No payment has been taken yet.
                </p>

              </div>

            </aside>

          </div>

        </div>
      </section>

    </main>
  );
}

export default Booking;