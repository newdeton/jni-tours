import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiMessageSquare,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./AdminDashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatCurrency(
  amount,
  currency = "USD"
) {
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

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCustomerName(booking) {
  if (booking.customer?.name) {
    return booking.customer.name;
  }

  if (
    booking.user?.firstName ||
    booking.user?.lastName
  ) {
    return [
      booking.user?.firstName,
      booking.user?.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (
    booking.traveler?.firstName ||
    booking.traveler?.lastName
  ) {
    return [
      booking.traveler?.firstName,
      booking.traveler?.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (
    booking.firstName ||
    booking.lastName
  ) {
    return [
      booking.firstName,
      booking.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    booking.customerName ||
    booking.name ||
    "Guest"
  );
}

function getCustomerEmail(booking) {
  return (
    booking.customer?.email ||
    booking.user?.email ||
    booking.traveler?.email ||
    booking.email ||
    ""
  );
}

function getTourName(booking) {
  return (
    booking.tour?.title ||
    booking.tour?.name ||
    booking.tourTitle ||
    booking.tourName ||
    booking.title ||
    "Tour booking"
  );
}

function getBookingAmount(booking) {
  if (
    booking.pricing &&
    typeof booking.pricing.total !==
      "undefined"
  ) {
    return booking.pricing.total;
  }

  return (
    booking.totalAmount ??
    booking.amount ??
    booking.price ??
    0
  );
}

function getCurrency(booking) {
  return (
    booking.pricing?.currency ||
    booking.currency ||
    "USD"
  );
}

function normalizeStatus(status) {
  return String(
    status || "pending"
  ).toLowerCase();
}

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

function AdminDashboard() {
  const { token, user } = useAuth();

  const [stats, setStats] = useState({
    bookings: {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    },

    payments: {
      paid: 0,
      revenue: 0,
      currency: "USD",
    },

    customers: {
      total: 0,
      active: 0,
    },
  });

  const [recentBookings, setRecentBookings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH DASHBOARD DATA
  |--------------------------------------------------------------------------
  */

  const fetchDashboard = useCallback(
    async (showRefresh = false) => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        /*
        |--------------------------------------------------------------------------
        | LOAD STATS + RECENT BOOKINGS
        |--------------------------------------------------------------------------
        */

        const [
          statsResponse,
          bookingsResponse,
        ] = await Promise.all([
          fetch(
            `${API_BASE_URL}/admin/stats`,
            {
              headers,
            }
          ),

          fetch(
            `${API_BASE_URL}/admin/bookings?page=1&limit=5`,
            {
              headers,
            }
          ),
        ]);

        /*
        |--------------------------------------------------------------------------
        | SAFE JSON PARSER
        |--------------------------------------------------------------------------
        */

        const parseResponse =
          async (response) => {
            const contentType =
              response.headers.get(
                "content-type"
              ) || "";

            if (
              contentType.includes(
                "application/json"
              )
            ) {
              return response.json();
            }

            const text =
              await response.text();

            return {
              success: false,
              message:
                text ||
                `Server returned HTTP ${response.status}`,
            };
          };

        const [
          statsData,
          bookingsData,
        ] = await Promise.all([
          parseResponse(statsResponse),
          parseResponse(bookingsResponse),
        ]);

        /*
        |--------------------------------------------------------------------------
        | AUTHORIZATION ERROR
        |--------------------------------------------------------------------------
        */

        if (
          statsResponse.status === 401 ||
          statsResponse.status === 403
        ) {
          throw new Error(
            statsData.message ||
              "Administrator access is required."
          );
        }

        if (
          bookingsResponse.status === 401 ||
          bookingsResponse.status === 403
        ) {
          throw new Error(
            bookingsData.message ||
              "Administrator access is required."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | STATS
        |--------------------------------------------------------------------------
        */

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message ||
              "Failed to load dashboard statistics."
          );
        }

        const dashboardStats =
          statsData.stats || {};

        setStats({
          bookings: {
            total:
              dashboardStats.bookings
                ?.total || 0,

            pending:
              dashboardStats.bookings
                ?.pending || 0,

            confirmed:
              dashboardStats.bookings
                ?.confirmed || 0,

            completed:
              dashboardStats.bookings
                ?.completed || 0,

            cancelled:
              dashboardStats.bookings
                ?.cancelled || 0,
          },

          payments: {
            paid:
              dashboardStats.payments
                ?.paid || 0,

            revenue:
              dashboardStats.payments
                ?.revenue || 0,

            currency:
              dashboardStats.payments
                ?.currency || "USD",
          },

          customers: {
            total:
              dashboardStats.customers
                ?.total || 0,

            active:
              dashboardStats.customers
                ?.active || 0,
          },
        });

        /*
        |--------------------------------------------------------------------------
        | RECENT BOOKINGS
        |--------------------------------------------------------------------------
        */

        if (!bookingsResponse.ok) {
          throw new Error(
            bookingsData.message ||
              "Failed to load recent bookings."
          );
        }

        setRecentBookings(
          Array.isArray(
            bookingsData.bookings
          )
            ? bookingsData.bookings
            : []
        );
      } catch (err) {
        console.error(
          "Admin dashboard error:",
          err
        );

        setError(
          err.message ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /*
  |--------------------------------------------------------------------------
  | GREETING
  |--------------------------------------------------------------------------
  */

  const adminName = useMemo(() => {
    if (user?.firstName) {
      return user.firstName;
    }

    if (user?.name) {
      return user.name;
    }

    return "Admin";
  }, [user]);

  /*
  |--------------------------------------------------------------------------
  | STAT CARDS
  |--------------------------------------------------------------------------
  */

  const statCards = [
    {
      label: "Total bookings",
      value:
        stats.bookings.total.toLocaleString(),
      icon: <FiCalendar />,
      className: "bookings",
      description:
        `${stats.bookings.pending} pending`,
    },

    {
      label: "Revenue",
      value: formatCurrency(
        stats.payments.revenue,
        stats.payments.currency
      ),
      icon: <FiDollarSign />,
      className: "revenue",
      description:
        `${stats.payments.paid} paid bookings`,
    },

    {
      label: "Customers",
      value:
        stats.customers.total.toLocaleString(),
      icon: <FiUsers />,
      className: "customers",
      description:
        `${stats.customers.active} active customers`,
    },

    {
      label: "Confirmed",
      value:
        stats.bookings.confirmed.toLocaleString(),
      icon: <FiCheckCircle />,
      className: "confirmed",
      description:
        `${stats.bookings.completed} completed`,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | BOOKING STATUS SUMMARY
  |--------------------------------------------------------------------------
  */

  const statusSummary = [
    {
      label: "Pending",
      value: stats.bookings.pending,
      icon: <FiClock />,
      className: "pending",
    },

    {
      label: "Confirmed",
      value: stats.bookings.confirmed,
      icon: <FiCheckCircle />,
      className: "confirmed",
    },

    {
      label: "Completed",
      value: stats.bookings.completed,
      icon: <FiCheckCircle />,
      className: "completed",
    },

    {
      label: "Cancelled",
      value: stats.bookings.cancelled,
      icon: <FiXCircle />,
      className: "cancelled",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (
    loading &&
    !recentBookings.length
  ) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-loading">
          <FiRefreshCw className="admin-dashboard-loading-icon" />

          <strong>
            Loading dashboard...
          </strong>

          <span>
            Fetching your latest business
            data.
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
    <div className="admin-dashboard">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="admin-dashboard-header">
        <div className="admin-dashboard-heading">
          <span>Administration</span>

          <h1>
            Welcome back,{" "}
            <em>
              {adminName}.
            </em>
          </h1>

          <p>
            Here's an overview of what's
            happening across JNI Tours.
          </p>
        </div>

        <div className="admin-dashboard-header-actions">
          <button
            type="button"
            className="admin-dashboard-refresh"
            onClick={() =>
              fetchDashboard(true)
            }
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

          <Link
            to="/admin/tours"
            className="admin-primary-button"
          >
            Manage tours
            <FiArrowUpRight />
          </Link>
        </div>
      </section>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="admin-dashboard-error">
          <div>
            <strong>
              Unable to refresh dashboard
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchDashboard(true)
            }
          >
            Try again
          </button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <section className="admin-stats-grid">
        {statCards.map((stat) => (
          <article
            className={`admin-stat-card ${stat.className}`}
            key={stat.label}
          >
            <div className="admin-stat-top">
              <span>
                {stat.label}
              </span>

              <div className="admin-stat-icon">
                {stat.icon}
              </div>
            </div>

            <strong>
              {stat.value}
            </strong>

            <small>
              {stat.description}
            </small>
          </article>
        ))}
      </section>

      {/* =====================================================
          MAIN GRID
          ===================================================== */}

      <section className="admin-dashboard-grid">

        {/* =================================================
            RECENT BOOKINGS
            ================================================= */}

        <div className="admin-panel admin-bookings-panel">

          <div className="admin-panel-header">
            <div>
              <span>
                Latest activity
              </span>

              <h2>
                Recent bookings
              </h2>
            </div>

            <Link to="/admin/bookings">
              View all
              <FiArrowUpRight />
            </Link>
          </div>

          <div className="admin-bookings-list">

            {recentBookings.length > 0 ? (
              recentBookings.map(
                (booking) => {
                  const bookingId =
                    booking.bookingId ||
                    booking.id ||
                    booking._id;

                  const customerName =
                    getCustomerName(
                      booking
                    );

                  const status =
                    normalizeStatus(
                      booking.status
                    );

                  return (
                    <div
                      className="admin-booking-row"
                      key={bookingId}
                    >
                      <div className="admin-booking-avatar">
                        {customerName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="admin-booking-info">
                        <strong>
                          {customerName}
                        </strong>

                        <span>
                          {getTourName(
                            booking
                          )}
                        </span>

                        <small>
                          {formatDate(
                            booking.travelDate ||
                              booking.createdAt
                          )}

                          {getCustomerEmail(
                            booking
                          ) && (
                            <>
                              {" · "}
                              {getCustomerEmail(
                                booking
                              )}
                            </>
                          )}
                        </small>
                      </div>

                      <div className="admin-booking-amount">
                        <strong>
                          {formatCurrency(
                            getBookingAmount(
                              booking
                            ),
                            getCurrency(
                              booking
                            )
                          )}
                        </strong>

                        <span
                          className={`booking-status ${status}`}
                        >
                          {status
                            .charAt(0)
                            .toUpperCase() +
                            status.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              <div className="admin-dashboard-empty">
                <FiCalendar />

                <strong>
                  No bookings yet
                </strong>

                <span>
                  Customer reservations will
                  appear here.
                </span>
              </div>
            )}

          </div>
        </div>

        {/* =================================================
            BOOKING STATUS
            ================================================= */}

        <div className="admin-panel">

          <div className="admin-panel-header">
            <div>
              <span>
                Booking overview
              </span>

              <h2>
                Booking status
              </h2>
            </div>

            <Link to="/admin/bookings">
              Manage
              <FiArrowUpRight />
            </Link>
          </div>

          <div className="admin-status-list">

            {statusSummary.map(
              (item) => (
                <div
                  className={`admin-status-row ${item.className}`}
                  key={item.label}
                >
                  <div className="admin-status-icon">
                    {item.icon}
                  </div>

                  <div>
                    <strong>
                      {item.value}
                    </strong>

                    <span>
                      {item.label}
                    </span>
                  </div>

                  <FiArrowUpRight />
                </div>
              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          BUSINESS OVERVIEW
          ===================================================== */}

      <section className="admin-business-overview">

        <div className="admin-business-overview-heading">
          <div>
            <span>
              Business performance
            </span>

            <h2>
              Your business at a glance
            </h2>
          </div>
        </div>

        <div className="admin-business-grid">

          <div className="admin-business-card">
            <div className="admin-business-card-icon">
              <FiTrendingUp />
            </div>

            <div>
              <span>
                Paid bookings
              </span>

              <strong>
                {stats.payments.paid}
              </strong>

              <small>
                Successfully paid
                reservations
              </small>
            </div>
          </div>

          <div className="admin-business-card">
            <div className="admin-business-card-icon">
              <FiUsers />
            </div>

            <div>
              <span>
                Active customers
              </span>

              <strong>
                {stats.customers.active}
              </strong>

              <small>
                Currently active accounts
              </small>
            </div>
          </div>

          <div className="admin-business-card">
            <div className="admin-business-card-icon">
              <FiDollarSign />
            </div>

            <div>
              <span>
                Total revenue
              </span>

              <strong>
                {formatCurrency(
                  stats.payments.revenue,
                  stats.payments.currency
                )}
              </strong>

              <small>
                From paid bookings
              </small>
            </div>
          </div>

        </div>

      </section>

      {/* =====================================================
          QUICK ACTIONS
          ===================================================== */}

      <section className="admin-quick-actions">

        <div className="admin-quick-heading">
          <span>
            Quick actions
          </span>

          <h2>
            Manage your website
          </h2>

          <p>
            Jump directly to the areas you
            manage most often.
          </p>
        </div>

        <div className="admin-action-grid">

          <Link to="/admin/tours">
            <FiMapPin />

            <div>
              <strong>
                Manage tours
              </strong>

              <span>
                Add, edit and organize
                your tours
              </span>
            </div>

            <FiArrowUpRight />
          </Link>

          <Link to="/admin/bookings">
            <FiCalendar />

            <div>
              <strong>
                Bookings
              </strong>

              <span>
                Review customer
                reservations
              </span>
            </div>

            <FiArrowUpRight />
          </Link>

          <Link to="/admin/customers">
            <FiUsers />

            <div>
              <strong>
                Customers
              </strong>

              <span>
                Manage traveler
                accounts
              </span>
            </div>

            <FiArrowUpRight />
          </Link>

          <Link to="/admin/messages">
            <FiMessageSquare />

            <div>
              <strong>
                Messages
              </strong>

              <span>
                Check customer
                enquiries
              </span>
            </div>

            <FiArrowUpRight />
          </Link>

        </div>

      </section>

    </div>
  );
}

export default AdminDashboard;