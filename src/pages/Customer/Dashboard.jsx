import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import { useBookings } from "../../context/BookingContext";

import "./Customer.css";

function Dashboard() {
  const {
    bookings = [],
    loading,
  } = useBookings();

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER DATA
  |--------------------------------------------------------------------------
  */

  const paidBookings = bookings.filter(
    (booking) =>
      booking.paymentStatus === "paid"
  );

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.paymentStatus !== "paid"
  );

  const upcomingBookings = bookings
    .filter((booking) => {
      if (!booking.travelDate) {
        return false;
      }

      const date = new Date(
        `${booking.travelDate}T00:00:00`
      );

      return date >= new Date();
    })
    .sort(
      (a, b) =>
        new Date(
          `${a.travelDate}T00:00:00`
        ) -
        new Date(
          `${b.travelDate}T00:00:00`
        )
    );

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  /*
  |--------------------------------------------------------------------------
  | LEAD TRAVELER
  |--------------------------------------------------------------------------
  */

  const firstBooking = bookings[0];

  const firstName =
    firstBooking?.traveler?.firstName ||
    "Traveler";

  /*
  |--------------------------------------------------------------------------
  | FORMATTERS
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "Not selected";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (booking) => {
    const amount = Number(
      booking.pricing?.total ??
        booking.total ??
        0
    );

    const currency =
      booking.pricing?.currency ||
      booking.currency ||
      "USD";

    return `${currency} ${amount.toLocaleString()}`;
  };

  const getPaymentLabel = (booking) => {
    switch (booking.paymentStatus) {
      case "paid":
        return "Paid";

      case "pending":
        return "Payment pending";

      case "failed":
        return "Payment failed";

      case "refunded":
        return "Refunded";

      default:
        return "Unpaid";
    }
  };

  const getPaymentClass = (booking) => {
    switch (booking.paymentStatus) {
      case "paid":
        return "paid";

      case "failed":
        return "failed";

      case "refunded":
        return "refunded";

      default:
        return "pending";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="customer-page">

        <div className="container">

          <div className="customer-loading">

            <div className="customer-loading-spinner" />

            <h2>
              Loading your dashboard...
            </h2>

            <p>
              We're retrieving your journeys.
            </p>

          </div>

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD
  |--------------------------------------------------------------------------
  */

  return (
    <main className="customer-page">

      <div className="container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="customer-header">

          <div>

            <span className="customer-eyebrow">
              Welcome back
            </span>

            <h1>
              Hello, {firstName}.
            </h1>

            <p>
              Manage your bookings, upcoming
              adventures and travel details.
            </p>

          </div>

          <Link
            to="/tours"
            className="customer-primary-action"
          >
            <FiCompass />
            Explore tours
            <FiArrowRight />
          </Link>

        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="customer-stats">

          <article className="customer-stat-card">

            <div className="customer-stat-icon">
              <FiCompass />
            </div>

            <div>

              <span>
                Total bookings
              </span>

              <strong>
                {bookings.length}
              </strong>

            </div>

          </article>

          <article className="customer-stat-card">

            <div className="customer-stat-icon">
              <FiCalendar />
            </div>

            <div>

              <span>
                Upcoming trips
              </span>

              <strong>
                {upcomingBookings.length}
              </strong>

            </div>

          </article>

          <article className="customer-stat-card">

            <div className="customer-stat-icon">
              <FiCheckCircle />
            </div>

            <div>

              <span>
                Paid bookings
              </span>

              <strong>
                {paidBookings.length}
              </strong>

            </div>

          </article>

          <article className="customer-stat-card">

            <div className="customer-stat-icon">
              <FiCreditCard />
            </div>

            <div>

              <span>
                Awaiting payment
              </span>

              <strong>
                {pendingBookings.length}
              </strong>

            </div>

          </article>

        </section>

        {/* =====================================================
            UPCOMING TRIP
        ===================================================== */}

        {upcomingBookings.length > 0 && (
          <section className="customer-section">

            <div className="customer-section-heading">

              <div>

                <span>
                  Your next adventure
                </span>

                <h2>
                  Upcoming trip
                </h2>

              </div>

              <Link to="/customer/bookings">
                View all bookings
                <FiArrowRight />
              </Link>

            </div>

            <article className="customer-featured-booking">

              <div className="customer-featured-image">

                {upcomingBookings[0].image ? (
                  <img
                    src={upcomingBookings[0].image}
                    alt={
                      upcomingBookings[0]
                        .tourTitle ||
                      "Upcoming tour"
                    }
                  />
                ) : (
                  <div className="customer-image-placeholder">
                    <FiCompass />
                  </div>
                )}

              </div>

              <div className="customer-featured-content">

                <div className="customer-booking-topline">

                  <span>
                    {upcomingBookings[0]
                      .category ||
                      "Adventure"}
                  </span>

                  <span
                    className={`customer-payment-badge ${getPaymentClass(
                      upcomingBookings[0]
                    )}`}
                  >
                    {getPaymentLabel(
                      upcomingBookings[0]
                    )}
                  </span>

                </div>

                <h3>
                  {upcomingBookings[0]
                    .tourTitle ||
                    "Your upcoming adventure"}
                </h3>

                <div className="customer-booking-meta">

                  <span>
                    <FiMapPin />
                    {upcomingBookings[0]
                      .destination ||
                      "Destination"}
                  </span>

                  <span>
                    <FiCalendar />
                    {formatDate(
                      upcomingBookings[0]
                        .travelDate
                    )}
                  </span>

                  <span>
                    <FiUsers />
                    {upcomingBookings[0]
                      .travelers ||
                      0}{" "}
                    travelers
                  </span>

                </div>

                <div className="customer-featured-footer">

                  <div>

                    <small>
                      Booking reference
                    </small>

                    <strong>
                      {upcomingBookings[0]
                        .bookingId ||
                        "—"}
                    </strong>

                  </div>

                  <Link
                    to={`/payment/${
                      upcomingBookings[0]
                        .bookingId
                    }`}
                    className="customer-view-button"
                  >
                    View booking
                    <FiArrowRight />
                  </Link>

                </div>

              </div>

            </article>

          </section>
        )}

        {/* =====================================================
            RECENT BOOKINGS
        ===================================================== */}

        <section className="customer-section">

          <div className="customer-section-heading">

            <div>

              <span>
                Your journeys
              </span>

              <h2>
                Recent bookings
              </h2>

            </div>

            {bookings.length > 0 && (
              <Link to="/customer/bookings">
                View all
                <FiArrowRight />
              </Link>
            )}

          </div>

          {recentBookings.length === 0 ? (
            <div className="customer-empty-state">

              <div className="customer-empty-icon">
                <FiCompass />
              </div>

              <h3>
                Your adventures start here
              </h3>

              <p>
                You haven't made any bookings yet.
                Explore our tours and find your
                next unforgettable journey.
              </p>

              <Link
                to="/tours"
                className="customer-primary-action"
              >
                Explore tours
                <FiArrowRight />
              </Link>

            </div>
          ) : (
            <div className="customer-bookings-list">

              {recentBookings.map(
                (booking) => (
                  <article
                    className="customer-booking-card"
                    key={
                      booking.bookingId ||
                      booking._id
                    }
                  >

                    <div className="customer-booking-image">

                      {booking.image ? (
                        <img
                          src={booking.image}
                          alt={
                            booking.tourTitle ||
                            "Tour"
                          }
                        />
                      ) : (
                        <FiCompass />
                      )}

                    </div>

                    <div className="customer-booking-info">

                      <div>

                        <span className="customer-booking-category">
                          {booking.category ||
                            "Tour"}
                        </span>

                        <h3>
                          {booking.tourTitle ||
                            "JNI Tours Adventure"}
                        </h3>

                        <p>
                          <FiMapPin />
                          {booking.destination ||
                            "Destination"}
                        </p>

                      </div>

                      <div className="customer-booking-details">

                        <div>
                          <small>
                            Travel date
                          </small>

                          <strong>
                            {formatDate(
                              booking.travelDate
                            )}
                          </strong>
                        </div>

                        <div>
                          <small>
                            Travelers
                          </small>

                          <strong>
                            {booking.travelers ||
                              0}
                          </strong>
                        </div>

                        <div>
                          <small>
                            Total
                          </small>

                          <strong>
                            {formatAmount(
                              booking
                            )}
                          </strong>
                        </div>

                      </div>

                    </div>

                    <div className="customer-booking-action">

                      <span
                        className={`customer-payment-badge ${getPaymentClass(
                          booking
                        )}`}
                      >
                        {getPaymentLabel(
                          booking
                        )}
                      </span>

                      {booking.paymentStatus !==
                        "paid" && (
                        <Link
                          to={`/payment/${
                            booking.bookingId
                          }`}
                        >
                          Pay now
                          <FiArrowRight />
                        </Link>
                      )}

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section className="customer-quick-actions">

          <Link
            to="/tours"
            className="customer-quick-card"
          >

            <FiCompass />

            <div>

              <strong>
                Discover a new adventure
              </strong>

              <span>
                Browse our curated tours
              </span>

            </div>

            <FiArrowRight />

          </Link>

          <Link
            to="/customer/profile"
            className="customer-quick-card"
          >

            <FiUser />

            <div>

              <strong>
                Manage your profile
              </strong>

              <span>
                Update your personal details
              </span>

            </div>

            <FiArrowRight />

          </Link>

          <Link
            to="/contact"
            className="customer-quick-card"
          >

            <FiClock />

            <div>

              <strong>
                Need assistance?
              </strong>

              <span>
                Talk to our travel team
              </span>

            </div>

            <FiArrowRight />

          </Link>

        </section>

      </div>

    </main>
  );
}

export default Dashboard;