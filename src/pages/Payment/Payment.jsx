import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiLock,
} from "react-icons/fi";
import {
  Link,
  useParams,
} from "react-router-dom";

import { useBookings } from "../../context/BookingContext";

import "./Payment.css";

const PAYMENTS_API_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/payments`
    : "http://localhost:5000/api/payments";

function Payment() {
  const { bookingId } = useParams();

  const {
    getBooking,
    updatePaymentStatus,
  } = useBookings();

  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] =
    useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD BOOKING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const loadBooking = async () => {
      if (!bookingId) {
        if (mounted) {
          setError(
            "No booking ID was provided."
          );
          setLoadingBooking(false);
        }

        return;
      }

      try {
        setLoadingBooking(true);
        setError("");

        const currentBooking =
          await getBooking(bookingId);

        if (!mounted) {
          return;
        }

        if (!currentBooking) {
          setError(
            "We couldn't find this booking."
          );
          setBooking(null);
          return;
        }

        setBooking(currentBooking);
      } catch (err) {
        console.error(
          "Load booking error:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Failed to load booking."
          );
          setBooking(null);
        }
      } finally {
        if (mounted) {
          setLoadingBooking(false);
        }
      }
    };

    loadBooking();

    return () => {
      mounted = false;
    };
  }, [bookingId, getBooking]);

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loadingBooking) {
    return (
      <main className="payment-page">
        <div className="container">

          <div className="payment-loading">
            <div className="payment-loading-spinner" />

            <h1>
              Loading your booking...
            </h1>

            <p>
              Please wait while we retrieve your
              booking details.
            </p>
          </div>

        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | BOOKING NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!booking) {
    return (
      <main className="payment-page">
        <div className="container">

          <div className="payment-not-found">

            <h1>
              Booking not found
            </h1>

            <p>
              {error ||
                "We couldn't find this booking."}
            </p>

            <Link to="/tours">
              Browse tours
            </Link>

          </div>

        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | BOOKING DATA
  |--------------------------------------------------------------------------
  */

  /*
   * IMPORTANT:
   *
   * The backend booking identifier is booking.bookingId.
   * MongoDB's _id is not the public booking reference.
   */
  const publicBookingId =
    booking.bookingId ||
    booking._id ||
    booking.id ||
    bookingId;

  const total = Number(
    booking.pricing?.total ??
      booking.total ??
      0
  );

  const currency =
    booking.pricing?.currency ||
    booking.currency ||
    "USD";

  const traveler =
    booking.traveler || {};

  const travelDate =
    booking.travelDate || "";

  const travelerName =
    [
      traveler.firstName,
      traveler.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  const travelerCount = Number(
    booking.travelers ??
      (
        Number(booking.adults || 0) +
        Number(booking.children || 0)
      )
  );

  const tourTitle =
    booking.tourTitle ||
    booking.tour?.title ||
    "JNI Tours Adventure";

  const destination =
    booking.destination ||
    booking.tour?.destination ||
    "Destination";

  const category =
    booking.category ||
    booking.tour?.category ||
    "Tour";

  const duration =
    booking.duration ||
    booking.tour?.duration ||
    "To be confirmed";

  const image =
    booking.image ||
    booking.tour?.image ||
    booking.tour?.images?.[0] ||
    "";

  /*
  |--------------------------------------------------------------------------
  | FORMATTED DATE
  |--------------------------------------------------------------------------
  */

  const formattedDate = travelDate
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
    : "Not selected";

  /*
  |--------------------------------------------------------------------------
  | PAYMENT
  |--------------------------------------------------------------------------
  */

  const handlePayment = async () => {
    if (!booking) {
      return;
    }

    /*
     * Validate the actual public booking ID.
     */
    if (!publicBookingId) {
      setError(
        "This booking does not have a valid booking ID."
      );

      return;
    }

    if (!traveler.email) {
      setError(
        "The booking does not contain a valid email address."
      );

      return;
    }

    if (total <= 0) {
      setError(
        "This booking has an invalid payment amount."
      );

      return;
    }

    /*
     * Prevent paying for an already-paid booking.
     */
    if (
      booking.paymentStatus === "paid"
    ) {
      setError(
        "This booking has already been paid."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${PAYMENTS_API_URL}/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: traveler.email,
            amount: total,
            currency,
            bookingId: publicBookingId,

            /*
             * Paystack returns the customer
             * here after payment.
             */
            callbackUrl:
              `${window.location.origin}/payment/success?bookingId=${encodeURIComponent(
                publicBookingId
              )}`,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to initialize payment."
        );
      }

      /*
       * Support common backend response formats.
       */
      const authorizationUrl =
        result.data?.authorization_url ||
        result.authorization_url;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack did not return a payment URL."
        );
      }

      /*
       * Mark payment as pending before
       * sending the customer to Paystack.
       */
      try {
        await updatePaymentStatus(
          publicBookingId,
          "pending"
        );
      } catch (statusError) {
        /*
         * Do not stop the Paystack payment just
         * because the status update failed.
         */
        console.warn(
          "Could not update payment status:",
          statusError
        );
      }

      /*
       * Redirect customer to Paystack.
       */
      window.location.href =
        authorizationUrl;
    } catch (err) {
      console.error(
        "Payment initialization error:",
        err
      );

      setError(
        err.message ||
          "Unable to start payment."
      );

      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PAYMENT STATUS DISPLAY
  |--------------------------------------------------------------------------
  */

  const paymentStatusLabel =
    booking.paymentStatus === "paid"
      ? "Paid"
      : booking.paymentStatus === "pending"
      ? "Payment processing"
      : booking.paymentStatus === "failed"
      ? "Payment failed"
      : booking.paymentStatus === "refunded"
      ? "Refunded"
      : "Pending payment";

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="payment-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="payment-header">
        <div className="container">

          <Link
            to={`/booking/${
              booking.tourSlug ||
              booking.tourId
            }`}
            className="payment-back"
          >
            <FiArrowLeft />
            Back to booking
          </Link>

          <span>
            Secure payment
          </span>

          <h1>
            Complete your
            <em> booking.</em>
          </h1>

          <p>
            Review your journey details before
            proceeding with payment.
          </p>

        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="payment-content">
        <div className="container">

          <div className="payment-layout">

            {/* =================================================
                MAIN
            ================================================= */}

            <div className="payment-main">

              {/* =================================================
                  BOOKING DETAILS
              ================================================= */}

              <div className="payment-card">

                <div className="payment-card-heading">

                  <div>

                    <span>
                      Booking
                    </span>

                    <h2>
                      {publicBookingId}
                    </h2>

                  </div>

                  <span className="payment-status">
                    {booking.status ||
                      "Pending"}
                  </span>

                </div>

                {/* TOUR */}

                <div className="payment-tour">

                  {image && (
                    <img
                      src={image}
                      alt={tourTitle}
                    />
                  )}

                  <div>

                    <small>
                      {category}
                    </small>

                    <h3>
                      {tourTitle}
                    </h3>

                    <p>
                      {destination}
                    </p>

                  </div>

                </div>

                {/* DETAILS */}

                <div className="payment-details">

                  <div>

                    <span>
                      Travel date
                    </span>

                    <strong>
                      {formattedDate}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Travelers
                    </span>

                    <strong>
                      {travelerCount}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Lead traveler
                    </span>

                    <strong>
                      {travelerName ||
                        "Not provided"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {traveler.email ||
                        "Not provided"}
                    </strong>

                  </div>

                </div>

              </div>

              {/* =================================================
                  PAYMENT METHOD
              ================================================= */}

              <div className="payment-card">

                <div className="payment-card-heading">

                  <div>

                    <span>
                      Payment method
                    </span>

                    <h2>
                      Pay securely
                    </h2>

                  </div>

                </div>

                <div className="payment-method">

                  <div className="payment-method-icon">
                    <FiLock />
                  </div>

                  <div>

                    <strong>
                      Paystack
                    </strong>

                    <p>
                      Secure online payment
                    </p>

                  </div>

                  <FiCheck />

                </div>

                {/* ERROR */}

                {error && (
                  <div
                    className="payment-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {/* PAYMENT BUTTON */}

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={
                    loading ||
                    total <= 0 ||
                    booking.paymentStatus ===
                      "paid"
                  }
                >

                  {loading
                    ? "Connecting to Paystack..."
                    : booking.paymentStatus ===
                      "paid"
                    ? "Payment completed"
                    : `Pay ${currency} ${total.toLocaleString()}`}

                </button>

                <p className="payment-secure-note">
                  <FiLock />
                  Your payment is securely
                  processed by Paystack.
                </p>

              </div>

            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <aside className="payment-summary">

              <div className="payment-summary-card">

                <span>
                  Total to pay
                </span>

                <strong>
                  {currency}{" "}
                  {total.toLocaleString()}
                </strong>

                <div className="payment-summary-line" />

                {/* TOUR */}

                <div>

                  <span>
                    Tour
                  </span>

                  <strong>
                    {tourTitle}
                  </strong>

                </div>

                {/* TRAVELERS */}

                <div>

                  <span>
                    Travelers
                  </span>

                  <strong>
                    {travelerCount}
                  </strong>

                </div>

                {/* DURATION */}

                <div>

                  <span>
                    Duration
                  </span>

                  <strong>
                    {duration}
                  </strong>

                </div>

                {/* STATUS */}

                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {paymentStatusLabel}
                  </strong>

                </div>

              </div>

            </aside>

          </div>

        </div>
      </section>

    </main>
  );
}

export default Payment;