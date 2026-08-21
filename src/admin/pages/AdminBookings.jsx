import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

import "./AdminBookings.css";

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/admin`
  : "http://localhost:5000/api/admin";

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "failed",
  "refunded",
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  /*
   * travelDate is currently stored as a String
   * in the Booking model.
   *
   * We first try to display it directly if it
   * isn't a valid JavaScript date.
   */

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCreatedAt(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount, currency = "USD") {
  const value = Number(amount) || 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
}

function getTravelerName(booking) {
  const firstName =
    booking.traveler?.firstName || "";

  const lastName =
    booking.traveler?.lastName || "";

  const name =
    `${firstName} ${lastName}`.trim();

  return name || "Unknown traveler";
}

function getTravelerEmail(booking) {
  return (
    booking.traveler?.email ||
    "No email"
  );
}

function getTravelerPhone(booking) {
  return (
    booking.traveler?.phone ||
    "No phone"
  );
}

function getBookingStatus(booking) {
  return booking.status || "pending";
}

function getPaymentStatus(booking) {
  return (
    booking.paymentStatus ||
    "unpaid"
  );
}

function getTravelerCount(booking) {
  if (booking.travelers) {
    return booking.travelers;
  }

  return (
    Number(booking.adults || 0) +
    Number(booking.children || 0)
  );
}

function getBookingId(booking) {
  return (
    booking.bookingId ||
    booking._id
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function AdminBookings() {
  const { token } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [bookings, setBookings] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState({
      total: 0,
      page: 1,
      limit: 20,
      pages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [
    updatingBookingId,
    setUpdatingBookingId,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH STATS
  |--------------------------------------------------------------------------
  */

  const fetchStats = useCallback(
    async () => {
      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/stats`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load booking statistics."
          );
        }

        const bookingStats =
          data.stats?.bookings || {};

        setStats({
          total:
            bookingStats.total || 0,

          pending:
            bookingStats.pending || 0,

          confirmed:
            bookingStats.confirmed || 0,

          completed:
            bookingStats.completed || 0,

          cancelled:
            bookingStats.cancelled || 0,
        });
      } catch (err) {
        console.error(
          "Admin booking stats error:",
          err
        );
      }
    },
    [token]
  );

  /*
  |--------------------------------------------------------------------------
  | FETCH BOOKINGS
  |--------------------------------------------------------------------------
  */

  const fetchBookings = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page)
        );

        params.set(
          "limit",
          "20"
        );

        if (
          statusFilter !== "all"
        ) {
          params.set(
            "status",
            statusFilter
          );
        }

        if (
          paymentFilter !== "all"
        ) {
          params.set(
            "paymentStatus",
            paymentFilter
          );
        }

        const response =
          await fetch(
            `${API_URL}/bookings?${params.toString()}`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load bookings."
          );
        }

        setBookings(
          Array.isArray(data.bookings)
            ? data.bookings
            : []
        );

        if (data.pagination) {
          setPagination(
            data.pagination
          );
        }
      } catch (err) {
        console.error(
          "Admin bookings error:",
          err
        );

        setError(
          err.message ||
            "Failed to load bookings."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      token,
      page,
      statusFilter,
      paymentFilter,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /*
  |--------------------------------------------------------------------------
  | RESET PAGE WHEN FILTERS CHANGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setPage(1);
  }, [
    statusFilter,
    paymentFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const visibleBookings =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return bookings;
      }

      return bookings.filter(
        (booking) => {
          const searchableText = [
            booking.bookingId,

            booking.tourTitle,

            booking.destination,

            booking.category,

            booking.tourId,

            booking.tourSlug,

            booking.traveler
              ?.firstName,

            booking.traveler
              ?.lastName,

            booking.traveler?.email,

            booking.traveler?.phone,

            booking.traveler
              ?.country,

            booking.status,

            booking.paymentStatus,

            booking.paymentReference,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query
          );
        }
      );
    }, [bookings, search]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE BOOKING STATUS
  |--------------------------------------------------------------------------
  */

  const updateBookingStatus =
    async (
      bookingId,
      newStatus
    ) => {
      if (
        !token ||
        !bookingId ||
        !BOOKING_STATUSES.includes(
          newStatus
        )
      ) {
        return;
      }

      try {
        setUpdatingBookingId(
          bookingId
        );

        setError("");

        const response =
          await fetch(
            `${API_URL}/bookings/${encodeURIComponent(
              bookingId
            )}/status`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                status:
                  newStatus,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update booking status."
          );
        }

        setBookings(
          (current) =>
            current.map(
              (booking) =>
                booking.bookingId ===
                bookingId
                  ? {
                      ...booking,
                      status:
                        newStatus,
                    }
                  : booking
            )
        );

        if (
          selectedBooking?.bookingId ===
          bookingId
        ) {
          setSelectedBooking(
            data.booking ||
              {
                ...selectedBooking,
                status:
                  newStatus,
              }
          );
        }

        await fetchStats();
      } catch (err) {
        console.error(
          "Update booking status error:",
          err
        );

        setError(
          err.message ||
            "Failed to update booking status."
        );
      } finally {
        setUpdatingBookingId("");
      }
    };

  /*
  |--------------------------------------------------------------------------
  | OPEN BOOKING DETAILS
  |--------------------------------------------------------------------------
  */

  const openBooking =
    async (booking) => {
      setSelectedBooking(
        booking
      );

      if (
        !token ||
        !booking.bookingId
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/bookings/${encodeURIComponent(
              booking.bookingId
            )}`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.booking
        ) {
          setSelectedBooking(
            data.booking
          );
        }
      } catch (err) {
        console.error(
          "Booking details error:",
          err
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const refreshAll =
    async () => {
      await Promise.all([
        fetchBookings(true),
        fetchStats(),
      ]);
    };

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (
    loading &&
    bookings.length === 0
  ) {
    return (
      <div className="admin-bookings">
        <div className="admin-page-heading">
          <div>
            <span>
              Booking management
            </span>

            <h1>
              Bookings
            </h1>

            <p>
              View and manage customer
              tour bookings from one
              place.
            </p>
          </div>
        </div>

        <div className="admin-bookings-loading">
          <FiRefreshCw className="admin-loading-icon" />

          <span>
            Loading bookings...
          </span>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="admin-bookings">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="admin-page-heading">
        <div>
          <span>
            Booking management
          </span>

          <h1>
            Bookings
          </h1>

          <p>
            View and manage customer
            tour bookings from one
            place.
          </p>
        </div>

        <button
          type="button"
          className="admin-bookings-refresh"
          onClick={refreshAll}
          disabled={refreshing}
        >
          <FiRefreshCw
            className={
              refreshing
                ? "admin-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="admin-bookings-error">
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Close error"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* =====================================================
          STATS
          ===================================================== */}

      <div className="admin-booking-stats">

        <div className="admin-booking-stat">
          <span>
            Total bookings
          </span>

          <strong>
            {stats.total}
          </strong>
        </div>

        <div className="admin-booking-stat">
          <span>
            Pending
          </span>

          <strong>
            {stats.pending}
          </strong>
        </div>

        <div className="admin-booking-stat">
          <span>
            Confirmed
          </span>

          <strong>
            {stats.confirmed}
          </strong>
        </div>

        <div className="admin-booking-stat">
          <span>
            Completed
          </span>

          <strong>
            {stats.completed}
          </strong>
        </div>

      </div>

      {/* =====================================================
          TOOLBAR
          ===================================================== */}

      <div className="admin-bookings-toolbar">

        <div className="admin-search">
          <FiSearch />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search booking, customer or tour..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All statuses
          </option>

          {BOOKING_STATUSES.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status
                  .charAt(0)
                  .toUpperCase() +
                  status.slice(1)}
              </option>
            )
          )}
        </select>

        <select
          value={paymentFilter}
          onChange={(event) =>
            setPaymentFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All payments
          </option>

          {PAYMENT_STATUSES.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status
                  .charAt(0)
                  .toUpperCase() +
                  status.slice(1)}
              </option>
            )
          )}
        </select>

      </div>

      {/* =====================================================
          TABLE
          ===================================================== */}

      <div className="admin-bookings-table-wrapper">

        <table className="admin-bookings-table">

          <thead>
            <tr>
              <th>
                Booking
              </th>

              <th>
                Customer
              </th>

              <th>
                Tour
              </th>

              <th>
                Date
              </th>

              <th>
                Travelers
              </th>

              <th>
                Amount
              </th>

              <th>
                Status
              </th>

              <th>
              </th>
            </tr>
          </thead>

          <tbody>

            {visibleBookings.length >
            0 ? (
              visibleBookings.map(
                (booking) => {
                  const bookingId =
                    getBookingId(
                      booking
                    );

                  const bookingStatus =
                    getBookingStatus(
                      booking
                    );

                  return (
                    <tr
                      key={
                        bookingId
                      }
                    >

                      {/* BOOKING */}

                      <td>
                        <strong className="booking-id">
                          {
                            booking.bookingId
                          }
                        </strong>

                        <span className="booking-created">
                          Created{" "}
                          {formatCreatedAt(
                            booking.createdAt
                          )}
                        </span>
                      </td>

                      {/* CUSTOMER */}

                      <td>
                        <div className="booking-customer">

                          <strong>
                            {getTravelerName(
                              booking
                            )}
                          </strong>

                          <span>
                            {getTravelerEmail(
                              booking
                            )}
                          </span>

                        </div>
                      </td>

                      {/* TOUR */}

                      <td>
                        <div className="booking-tour-cell">

                          <strong className="booking-tour">
                            {
                              booking.tourTitle
                            }
                          </strong>

                          {booking.destination && (
                            <span className="booking-destination">
                              <FiMapPin />

                              {
                                booking.destination
                              }
                            </span>
                          )}

                        </div>
                      </td>

                      {/* DATE */}

                      <td>
                        <span className="booking-date">
                          <FiCalendar />

                          {formatDate(
                            booking.travelDate
                          )}
                        </span>
                      </td>

                      {/* TRAVELERS */}

                      <td>
                        <span className="booking-guests">
                          <FiUsers />

                          {
                            getTravelerCount(
                              booking
                            )
                          }
                        </span>
                      </td>

                      {/* AMOUNT */}

                      <td>
                        <strong className="booking-amount">
                          {formatCurrency(
                            booking.pricing
                              ?.total,
                            booking.pricing
                              ?.currency
                          )}
                        </strong>
                      </td>

                      {/* STATUS */}

                      <td>
                        <select
                          className={`booking-status-select booking-status-${bookingStatus}`}
                          value={
                            bookingStatus
                          }
                          disabled={
                            updatingBookingId ===
                            bookingId
                          }
                          onChange={(
                            event
                          ) =>
                            updateBookingStatus(
                              bookingId,
                              event
                                .target
                                .value
                            )
                          }
                        >

                          {BOOKING_STATUSES.map(
                            (
                              status
                            ) => (
                              <option
                                key={
                                  status
                                }
                                value={
                                  status
                                }
                              >
                                {status
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase() +
                                  status.slice(
                                    1
                                  )}
                              </option>
                            )
                          )}

                        </select>
                      </td>

                      {/* VIEW */}

                      <td>
                        <button
                          type="button"
                          className="booking-view-button"
                          title="View booking"
                          onClick={() =>
                            openBooking(
                              booking
                            )
                          }
                        >
                          <FiEye />
                        </button>
                      </td>

                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="admin-bookings-empty-cell"
                >
                  <div className="admin-bookings-empty">

                    <FiCalendar />

                    <h3>
                      No bookings found
                    </h3>

                    <p>
                      {search
                        ? "Try a different search term."
                        : "Customer bookings will appear here once customers make reservations."}
                    </p>

                  </div>
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* =====================================================
          PAGINATION
          ===================================================== */}

      <div className="admin-bookings-pagination">

        <span>
          Showing{" "}
          <strong>
            {visibleBookings.length}
          </strong>{" "}
          of{" "}
          <strong>
            {pagination.total}
          </strong>{" "}
          bookings
        </span>

        <div>

          <button
            type="button"
            disabled={
              !pagination.hasPreviousPage
            }
            onClick={() =>
              setPage(
                (current) =>
                  Math.max(
                    current - 1,
                    1
                  )
              )
            }
          >
            <FiChevronLeft />

            Previous
          </button>

          <span className="admin-pagination-page">
            Page{" "}
            <strong>
              {pagination.page}
            </strong>{" "}
            of{" "}
            <strong>
              {pagination.pages ||
                1}
            </strong>
          </span>

          <button
            type="button"
            disabled={
              !pagination.hasNextPage
            }
            onClick={() =>
              setPage(
                (current) =>
                  current + 1
              )
            }
          >
            Next

            <FiChevronRight />
          </button>

        </div>

      </div>

      {/* =====================================================
          BOOKING DETAILS MODAL
          ===================================================== */}

      {selectedBooking && (
        <div
          className="admin-booking-modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedBooking(
                null
              );
            }
          }}
        >

          <div className="admin-booking-modal">

            {/* HEADER */}

            <div className="admin-booking-modal-header">

              <div>
                <span>
                  Booking details
                </span>

                <h2>
                  {
                    selectedBooking.bookingId
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBooking(
                    null
                  )
                }
                aria-label="Close booking details"
              >
                <FiX />
              </button>

            </div>

            {/* BODY */}

            <div className="admin-booking-modal-body">

              {/* TOUR */}

              <div className="admin-booking-modal-tour">

                {selectedBooking.image && (
                  <img
                    src={
                      selectedBooking.image
                    }
                    alt={
                      selectedBooking.tourTitle
                    }
                  />
                )}

                <div>
                  <span>
                    Tour
                  </span>

                  <h3>
                    {
                      selectedBooking.tourTitle
                    }
                  </h3>

                  {selectedBooking.destination && (
                    <p>
                      <FiMapPin />

                      {
                        selectedBooking.destination
                      }
                    </p>
                  )}
                </div>

              </div>

              {/* TRAVELER */}

              <div className="admin-booking-detail-section">

                <div className="admin-booking-section-title">
                  Traveler information
                </div>

                <div className="admin-booking-detail-grid">

                  <div className="admin-booking-detail">
                    <span>
                      Name
                    </span>

                    <strong>
                      {getTravelerName(
                        selectedBooking
                      )}
                    </strong>
                  </div>

                  <div className="admin-booking-detail">
                    <span>
                      Country
                    </span>

                    <strong>
                      {selectedBooking
                        .traveler
                        ?.country ||
                        "—"}
                    </strong>
                  </div>

                  <div className="admin-booking-detail">
                    <span>
                      Email
                    </span>

                    <strong>
                      <FiMail />

                      {getTravelerEmail(
                        selectedBooking
                      )}
                    </strong>
                  </div>

                  <div className="admin-booking-detail">
                    <span>
                      Phone
                    </span>

                    <strong>
                      <FiPhone />

                      {getTravelerPhone(
                        selectedBooking
                      )}
                    </strong>
                  </div>

                </div>

              </div>

              {/* TRAVEL */}

              <div className="admin-booking-detail-section">

                <div className="admin-booking-section-title">
                  Travel information
                </div>

                <div className="admin-booking-detail-grid">

                  <div className="admin-booking-detail">
                    <span>
                      Travel date
                    </span>

                    <strong>
                      <FiCalendar />

                      {formatDate(
                        selectedBooking.travelDate
                      )}
                    </strong>
                  </div>

                  <div className="admin-booking-detail">
                    <span>
                      Travelers
                    </span>

                    <strong>
                      <FiUsers />

                      {
                        getTravelerCount(
                          selectedBooking
                        )
                      }
                    </strong>
                  </div>

                  <div className="admin-booking-detail">
                    <span>
                      Adults
                    </span>

                    <strong>
                      {
                        selectedBooking.adults ||
                        0
                      }
                    </strong>
                  </div>

                  <div className="admin-booking-detail">
                    <span>
                      Children
                    </span>

                    <strong>
                      {
                        selectedBooking.children ||
                        0
                      }
                    </strong>
                  </div>

                </div>

              </div>

              {/* PRICING */}

              <div className="admin-booking-detail-section">

                <div className="admin-booking-section-title">
                  Pricing
                </div>

                <div className="admin-booking-pricing">

                  <div>
                    <span>
                      Adult price
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBooking
                          .pricing
                          ?.adultPrice,
                        selectedBooking
                          .pricing
                          ?.currency
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Adults
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBooking
                          .pricing
                          ?.adultsCost,
                        selectedBooking
                          .pricing
                          ?.currency
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Children
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBooking
                          .pricing
                          ?.childrenCost,
                        selectedBooking
                          .pricing
                          ?.currency
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Accommodation
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBooking
                          .pricing
                          ?.accommodationCost,
                        selectedBooking
                          .pricing
                          ?.currency
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Extras
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBooking
                          .pricing
                          ?.extrasCost,
                        selectedBooking
                          .pricing
                          ?.currency
                      )}
                    </strong>
                  </div>

                  <div className="admin-booking-total">
                    <span>
                      Total
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBooking
                          .pricing
                          ?.total,
                        selectedBooking
                          .pricing
                          ?.currency
                      )}
                    </strong>
                  </div>

                </div>

              </div>

              {/* ACCOMMODATION */}

              {selectedBooking
                .accommodation
                ?.name && (
                <div className="admin-booking-detail-section">

                  <div className="admin-booking-section-title">
                    Accommodation
                  </div>

                  <div className="admin-booking-detail-grid">

                    <div className="admin-booking-detail">
                      <span>
                        Property
                      </span>

                      <strong>
                        {
                          selectedBooking
                            .accommodation
                            .name
                        }
                      </strong>
                    </div>

                    <div className="admin-booking-detail">
                      <span>
                        Price
                      </span>

                      <strong>
                        {formatCurrency(
                          selectedBooking
                            .accommodation
                            .price,
                          selectedBooking
                            .pricing
                            ?.currency
                        )}
                      </strong>
                    </div>

                  </div>

                </div>
              )}

              {/* EXTRAS */}

              {selectedBooking
                .extras?.length > 0 && (
                <div className="admin-booking-detail-section">

                  <div className="admin-booking-section-title">
                    Extras
                  </div>

                  <div className="admin-booking-extras">

                    {selectedBooking.extras.map(
                      (
                        extra,
                        index
                      ) => (
                        <div
                          key={
                            extra.id ||
                            index
                          }
                        >
                          <div>
                            <strong>
                              {
                                extra.name
                              }
                            </strong>

                            {extra.description && (
                              <span>
                                {
                                  extra.description
                                }
                              </span>
                            )}
                          </div>

                          <strong>
                            {formatCurrency(
                              extra.price,
                              selectedBooking
                                .pricing
                                ?.currency
                            )}
                          </strong>
                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

              {/* REQUESTS */}

              {selectedBooking
                .traveler
                ?.requests && (
                <div className="admin-booking-detail-section">

                  <div className="admin-booking-section-title">
                    Special requests
                  </div>

                  <p className="admin-booking-requests">
                    {
                      selectedBooking
                        .traveler
                        .requests
                    }
                  </p>

                </div>
              )}

              {/* PAYMENT */}

              <div className="admin-booking-detail-section">

                <div className="admin-booking-section-title">
                  Payment
                </div>

                <div className="admin-booking-detail-grid">

                  <div className="admin-booking-detail">
                    <span>
                      Status
                    </span>

                    <strong
                      className={`payment-status payment-status-${getPaymentStatus(
                        selectedBooking
                      )}`}
                    >
                      {
                        getPaymentStatus(
                          selectedBooking
                        )
                      }
                    </strong>
                  </div>

                  <div className="admin-booking-detail">
                    <span>
                      Reference
                    </span>

                    <strong>
                      {
                        selectedBooking
                          .paymentReference ||
                        "No reference"
                      }
                    </strong>
                  </div>

                  <div className="admin-booking-detail">
                    <span>
                      Paid at
                    </span>

                    <strong>
                      {selectedBooking.paidAt
                        ? formatCreatedAt(
                            selectedBooking.paidAt
                          )
                        : "Not paid"}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="admin-booking-modal-actions">

              <button
                type="button"
                className="admin-modal-cancel"
                onClick={() =>
                  setSelectedBooking(
                    null
                  )
                }
              >
                Close
              </button>

              {selectedBooking.status ===
                "pending" && (
                <button
                  type="button"
                  className="admin-booking-confirm"
                  disabled={
                    updatingBookingId ===
                    selectedBooking.bookingId
                  }
                  onClick={() =>
                    updateBookingStatus(
                      selectedBooking.bookingId,
                      "confirmed"
                    )
                  }
                >
                  <FiCheck />

                  Confirm booking
                </button>
              )}

              {selectedBooking.status !==
                "cancelled" &&
                selectedBooking.status !==
                  "completed" && (
                  <button
                    type="button"
                    className="admin-booking-cancel"
                    disabled={
                      updatingBookingId ===
                      selectedBooking.bookingId
                    }
                    onClick={() =>
                      updateBookingStatus(
                        selectedBooking.bookingId,
                        "cancelled"
                      )
                    }
                  >
                    <FiX />

                    Cancel booking
                  </button>
                )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminBookings;