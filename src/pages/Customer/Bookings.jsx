import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiCreditCard,
  FiMapPin,
  FiRefreshCw,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import { useBookings } from "../../context/BookingContext";

import "./Customer.css";

function Bookings() {
  const {
    bookings = [],
    loading,
    refreshBookings,
    deleteBooking,
  } = useBookings();

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "Not selected";
    }

    let parsedDate;

    if (
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      parsedDate = new Date(`${date}T00:00:00`);
    } else {
      parsedDate = new Date(date);
    }

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not selected";
    }

    return parsedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | GET TRAVELERS
  |--------------------------------------------------------------------------
  */

  const getTravelerCount = (booking) => {
    const savedTravelers = Number(booking.travelers);

    if (
      Number.isFinite(savedTravelers) &&
      savedTravelers > 0
    ) {
      return savedTravelers;
    }

    return (
      Number(booking.adults || 0) +
      Number(booking.children || 0)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT AMOUNT
  |--------------------------------------------------------------------------
  */

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

    return `${currency} ${amount.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  /*
  |--------------------------------------------------------------------------
  | PAYMENT STATUS
  |--------------------------------------------------------------------------
  */

  const getPaymentLabel = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "Paid";

      case "pending":
        return "Payment pending";

      case "failed":
        return "Payment failed";

      case "refunded":
        return "Refunded";

      case "unpaid":
      default:
        return "Unpaid";
    }
  };

  const getPaymentClass = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "paid";

      case "failed":
        return "failed";

      case "refunded":
        return "refunded";

      case "pending":
      case "unpaid":
      default:
        return "pending";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | BOOKING STATUS
  |--------------------------------------------------------------------------
  */

  const getBookingStatusLabel = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";

      case "cancelled":
        return "Cancelled";

      case "completed":
        return "Completed";

      case "pending":
      default:
        return "Pending";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SORT BOOKINGS
  |--------------------------------------------------------------------------
  */

  const sortedBookings = [...bookings].sort(
    (a, b) => {
      const dateA = new Date(
        a.createdAt || a.travelDate || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || b.travelDate || 0
      ).getTime();

      return dateB - dateA;
    }
  );

  /*
  |--------------------------------------------------------------------------
  | UPCOMING BOOKINGS
  |--------------------------------------------------------------------------
  */

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings =
    bookings.filter((booking) => {
      if (
        !booking.travelDate ||
        booking.status === "cancelled" ||
        booking.status === "completed"
      ) {
        return false;
      }

      const travelDate = new Date(
        `${booking.travelDate}T00:00:00`
      );

      return (
        !Number.isNaN(travelDate.getTime()) &&
        travelDate >= today
      );
    });

  /*
  |--------------------------------------------------------------------------
  | COMPLETED BOOKINGS
  |--------------------------------------------------------------------------
  */

  const completedBookings =
    bookings.filter(
      (booking) =>
        booking.status === "completed"
    );

  /*
  |--------------------------------------------------------------------------
  | PAID BOOKINGS
  |--------------------------------------------------------------------------
  */

  const paidBookings =
    bookings.filter(
      (booking) =>
        booking.paymentStatus === "paid"
    );

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const handleRefresh = async () => {
    if (refreshBookings) {
      await refreshBookings();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE BOOKING
  |--------------------------------------------------------------------------
  */

  const handleDeleteBooking = async (booking) => {
    const bookingReference =
      booking.bookingId || booking._id;

    if (!bookingReference) {
      window.alert(
        "Unable to delete this booking because its booking ID is missing."
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete booking ${bookingReference}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBooking(bookingReference);
    } catch (error) {
      console.error(
        "Delete booking error:",
        error
      );

      window.alert(
        error?.message ||
          "Failed to delete booking. Please try again."
      );
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
              Loading your trips...
            </h2>

            <p>
              We're retrieving your booking
              information.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
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
              Your journeys
            </span>

            <h1>
              My Trips
            </h1>

            <p>
              Keep track of your upcoming
              adventures and previous bookings.
            </p>
          </div>

          <div className="customer-header-actions">

            <button
              type="button"
              className="customer-secondary-action"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FiRefreshCw />
              Refresh
            </button>

            <Link
              to="/tours"
              className="customer-primary-action"
            >
              <FiCompass />
              Find a new adventure
              <FiArrowRight />
            </Link>

          </div>

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
                All trips
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
                Upcoming
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
                Completed
              </span>

              <strong>
                {completedBookings.length}
              </strong>
            </div>

          </article>

          <article className="customer-stat-card">

            <div className="customer-stat-icon">
              <FiCreditCard />
            </div>

            <div>
              <span>
                Paid
              </span>

              <strong>
                {paidBookings.length}
              </strong>
            </div>

          </article>

        </section>

        {/* =====================================================
            BOOKINGS
        ===================================================== */}

        <section className="customer-section">

          <div className="customer-section-heading">

            <div>
              <span>
                Booking history
              </span>

              <h2>
                Your trips
              </h2>
            </div>

            <span className="customer-results-count">
              {bookings.length}{" "}
              {bookings.length === 1
                ? "booking"
                : "bookings"}
            </span>

          </div>

          {/* ===================================================
              EMPTY STATE
          =================================================== */}

          {sortedBookings.length === 0 ? (

            <div className="customer-empty-state">

              <div className="customer-empty-icon">
                <FiCompass />
              </div>

              <h3>
                No trips yet
              </h3>

              <p>
                Your booked adventures will appear
                here once you make your first
                reservation.
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

            /* =================================================
               BOOKING LIST
            ================================================= */

            <div className="customer-bookings-list">

              {sortedBookings.map((booking) => {

                const bookingReference =
                  booking.bookingId ||
                  booking._id;

                const travelers =
                  getTravelerCount(booking);

                const paymentStatus =
                  booking.paymentStatus ||
                  "unpaid";

                const bookingStatus =
                  booking.status ||
                  "pending";

                const isPaid =
                  paymentStatus === "paid";

                const isCancelled =
                  bookingStatus === "cancelled";

                const canPay =
                  !isPaid &&
                  !isCancelled;

                return (
                  <article
                    className={`customer-booking-card ${
                      bookingStatus ===
                      "cancelled"
                        ? "is-cancelled"
                        : ""
                    }`}
                    key={
                      bookingReference ||
                      booking._id
                    }
                  >

                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <div className="customer-booking-image">

                      {booking.image ? (
                        <img
                          src={booking.image}
                          alt={
                            booking.tourTitle ||
                            "JNI Tours"
                          }
                        />
                      ) : (
                        <div className="customer-booking-image-placeholder">
                          <FiCompass />
                        </div>
                      )}

                    </div>

                    {/* =================================================
                        INFORMATION
                    ================================================= */}

                    <div className="customer-booking-info">

                      <div>

                        <div className="customer-booking-topline">

                          <span className="customer-booking-category">
                            {booking.category ||
                              "Tour"}
                          </span>

                          <span
                            className={`customer-payment-badge ${getPaymentClass(
                              paymentStatus
                            )}`}
                          >
                            {getPaymentLabel(
                              paymentStatus
                            )}
                          </span>

                        </div>

                        <h3>
                          {booking.tourTitle ||
                            "JNI Tours Adventure"}
                        </h3>

                        <p>
                          <FiMapPin />

                          {booking.destination ||
                            "Destination"}
                        </p>

                        {booking.bookingId && (
                          <small className="customer-booking-reference">
                            Booking reference:{" "}
                            <strong>
                              {booking.bookingId}
                            </strong>
                          </small>
                        )}

                      </div>

                      {/* =================================================
                          META
                      ================================================= */}

                      <div className="customer-booking-details">

                        <div>
                          <small>
                            Travel date
                          </small>

                          <strong>
                            <FiCalendar />

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
                            <FiUsers />

                            {travelers}
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

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="customer-booking-action">

                      <span
                        className={`customer-booking-status ${bookingStatus}`}
                      >
                        <FiClock />

                        {getBookingStatusLabel(
                          bookingStatus
                        )}
                      </span>

                      {canPay && (
                        <Link
                          to={`/payment/${bookingReference}`}
                        >
                          Complete payment
                          <FiArrowRight />
                        </Link>
                      )}

                      {isPaid && (
                        <Link
                          to={`/payment/${bookingReference}`}
                        >
                          View booking
                          <FiArrowRight />
                        </Link>
                      )}

                      {isCancelled && (
                        <span className="customer-booking-cancelled">
                          Booking cancelled
                        </span>
                      )}

                      {/* =================================================
                          DELETE
                      ================================================= */}

                      <button
                        type="button"
                        className="customer-delete-booking"
                        onClick={() =>
                          handleDeleteBooking(
                            booking
                          )
                        }
                        title="Delete booking"
                      >
                        <FiTrash2 />
                        Delete booking
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

export default Bookings;