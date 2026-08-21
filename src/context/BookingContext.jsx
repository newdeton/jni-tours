import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const BookingContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/bookings`
  : "http://localhost:5000/api/bookings";

/*
|--------------------------------------------------------------------------
| BOOKING PROVIDER
|--------------------------------------------------------------------------
*/

export function BookingProvider({ children }) {
  const { token, isAuthenticated, loading: authLoading } =
    useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | SAFE JSON RESPONSE
  |--------------------------------------------------------------------------
  */

  const parseResponse = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();

    return {
      success: false,
      message:
        text ||
        `Server returned HTTP ${response.status}`,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | AUTH HEADERS
  |--------------------------------------------------------------------------
  */

  const getHeaders = useCallback(
    (includeJson = false) => {
      const headers = {};

      if (includeJson) {
        headers["Content-Type"] =
          "application/json";
      }

      if (token) {
        headers.Authorization =
          `Bearer ${token}`;
      }

      return headers;
    },
    [token]
  );

  /*
  |--------------------------------------------------------------------------
  | GET ALL CUSTOMER BOOKINGS
  |--------------------------------------------------------------------------
  */

  const fetchBookings = useCallback(async () => {
    /*
     * Do not call the protected endpoint
     * while authentication is still loading.
     */
    if (authLoading) {
      return [];
    }

    /*
     * A customer booking endpoint requires
     * authentication.
     */
    if (!isAuthenticated || !token) {
      setBookings([]);
      setLoading(false);
      setError("");
      return [];
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        API_URL,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data =
        await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch bookings."
        );
      }

      const fetchedBookings =
        Array.isArray(data.bookings)
          ? data.bookings
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(
              data.data?.bookings
            )
          ? data.data.bookings
          : [];

      setBookings(
        fetchedBookings
      );

      return fetchedBookings;
    } catch (error) {
      console.error(
        "Fetch bookings error:",
        error
      );

      setError(
        error.message ||
          "Failed to fetch bookings."
      );

      return [];
    } finally {
      setLoading(false);
    }
  }, [
    authLoading,
    isAuthenticated,
    token,
    getHeaders,
  ]);

  /*
  |--------------------------------------------------------------------------
  | INITIAL / AUTHENTICATION LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    fetchBookings();
  }, [
    authLoading,
    isAuthenticated,
    token,
    fetchBookings,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CREATE BOOKING
  |--------------------------------------------------------------------------
  */

  const addBooking = async (
    bookingData
  ) => {
    try {
      if (
        !bookingData ||
        typeof bookingData !==
          "object"
      ) {
        throw new Error(
          "Invalid booking information."
        );
      }

      if (!isAuthenticated || !token) {
  const error = new Error(
    "Authentication is required. Please login."
  );

  error.code = "AUTH_REQUIRED";

  throw error;
}

      setError("");

      const response =
        await fetch(API_URL, {
          method: "POST",

          headers:
            getHeaders(true),

          body: JSON.stringify(
            bookingData
          ),
        });

      const data =
        await parseResponse(
          response
        );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create booking."
        );
      }

      const newBooking =
        data.booking ||
        data.data?.booking ||
        data.data;

      if (!newBooking) {
        throw new Error(
          "The server created the booking but returned no booking data."
        );
      }

      setBookings(
        (current) => [
          newBooking,

          ...current.filter(
            (item) =>
              item.bookingId !==
              newBooking.bookingId
          ),
        ]
      );

      return newBooking;
    } catch (error) {
      console.error(
        "Create booking error:",
        error
      );

      setError(
        error.message ||
          "Failed to create booking."
      );

      throw error;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | GET SINGLE BOOKING
  |--------------------------------------------------------------------------
  */

  const getBooking =
    useCallback(
      async (bookingId) => {
        if (!bookingId) {
          console.warn(
            "getBooking called without bookingId."
          );

          return null;
        }

        if (
          !isAuthenticated ||
          !token
        ) {
          setError(
            "Authentication is required. Please login."
          );

          return null;
        }

        try {
          setError("");

          const response =
            await fetch(
              `${API_URL}/${encodeURIComponent(
                bookingId
              )}`,
              {
                method: "GET",
                headers:
                  getHeaders(),
              }
            );

          const data =
            await parseResponse(
              response
            );

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Booking not found."
            );
          }

          const booking =
            data.booking ||
            data.data?.booking ||
            data.data;

          if (!booking) {
            throw new Error(
              "The server returned no booking."
            );
          }

          setBookings(
            (current) => {
              const exists =
                current.some(
                  (item) =>
                    item.bookingId ===
                    booking.bookingId
                );

              if (exists) {
                return current.map(
                  (item) =>
                    item.bookingId ===
                    booking.bookingId
                      ? booking
                      : item
                );
              }

              return [
                booking,
                ...current,
              ];
            }
          );

          return booking;
        } catch (error) {
          console.error(
            "Get booking error:",
            error
          );

          setError(
            error.message ||
              "Failed to fetch booking."
          );

          return null;
        }
      },
      [
        isAuthenticated,
        token,
        getHeaders,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | UPDATE BOOKING STATUS
  |--------------------------------------------------------------------------
  */

  const updateBookingStatus =
    async (
      bookingId,
      status
    ) => {
      try {
        if (!bookingId) {
          throw new Error(
            "Booking ID is required."
          );
        }

        if (!status) {
          throw new Error(
            "Booking status is required."
          );
        }

        if (!isAuthenticated || !token) {
  const error = new Error(
    "Authentication is required. Please login."
  );

  error.code = "AUTH_REQUIRED";

  throw error;
}

        setError("");

        const response =
          await fetch(
            `${API_URL}/${encodeURIComponent(
              bookingId
            )}/status`,
            {
              method: "PATCH",

              headers:
                getHeaders(true),

              body: JSON.stringify({
                status,
              }),
            }
          );

        const data =
          await parseResponse(
            response
          );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update booking status."
          );
        }

        const updatedBooking =
          data.booking ||
          data.data?.booking ||
          data.data;

        if (!updatedBooking) {
          throw new Error(
            "The server returned no updated booking."
          );
        }

        setBookings(
          (current) =>
            current.map(
              (booking) =>
                booking.bookingId ===
                bookingId
                  ? updatedBooking
                  : booking
            )
        );

        return updatedBooking;
      } catch (error) {
        console.error(
          "Update booking status error:",
          error
        );

        setError(
          error.message ||
            "Failed to update booking status."
        );

        throw error;
      }
    };

  /*
  |--------------------------------------------------------------------------
  | UPDATE PAYMENT STATUS
  |--------------------------------------------------------------------------
  |
  | Backend endpoint:
  |
  | PATCH /api/admin/bookings/:bookingId/payment
  |
  | Customer booking context should not be
  | responsible for admin payment management.
  |
  | This method is retained for compatibility,
  | but uses the correct backend endpoint.
  |--------------------------------------------------------------------------
  */

  const updatePaymentStatus =
    async (
      bookingId,
      paymentStatus,
      paymentReference = ""
    ) => {
      try {
        if (!bookingId) {
          throw new Error(
            "Booking ID is required."
          );
        }

        if (!paymentStatus) {
          throw new Error(
            "Payment status is required."
          );
        }

        if (!isAuthenticated || !token) {
  const error = new Error(
    "Authentication is required. Please login."
  );

  error.code = "AUTH_REQUIRED";

  throw error;
}

        setError("");

        const response =
          await fetch(
            `http://localhost:5000/api/admin/bookings/${encodeURIComponent(
              bookingId
            )}/payment`,
            {
              method: "PATCH",

              headers:
                getHeaders(true),

              body: JSON.stringify({
                paymentStatus,
                ...(paymentReference
                  ? {
                      paymentReference,
                    }
                  : {}),
              }),
            }
          );

        const data =
          await parseResponse(
            response
          );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update payment status."
          );
        }

        const updatedBooking =
          data.booking ||
          data.data?.booking ||
          data.data;

        if (!updatedBooking) {
          throw new Error(
            "The server returned no updated booking."
          );
        }

        setBookings(
          (current) =>
            current.map(
              (booking) =>
                booking.bookingId ===
                bookingId
                  ? updatedBooking
                  : booking
            )
        );

        return updatedBooking;
      } catch (error) {
        console.error(
          "Update payment status error:",
          error
        );

        setError(
          error.message ||
            "Failed to update payment status."
        );

        throw error;
      }
    };

  /*
  |--------------------------------------------------------------------------
  | DELETE BOOKING
  |--------------------------------------------------------------------------
  */

  const deleteBooking =
    async (bookingId) => {
      try {
        if (!bookingId) {
          throw new Error(
            "Booking ID is required."
          );
        }

        if (!isAuthenticated || !token) {
  const error = new Error(
    "Authentication is required. Please login."
  );

  error.code = "AUTH_REQUIRED";

  throw error;
}

        setError("");

        const response =
          await fetch(
            `${API_URL}/${encodeURIComponent(
              bookingId
            )}`,
            {
              method: "DELETE",
              headers:
                getHeaders(),
            }
          );

        const data =
          await parseResponse(
            response
          );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to delete booking."
          );
        }

        setBookings(
          (current) =>
            current.filter(
              (booking) =>
                booking.bookingId !==
                bookingId
            )
        );

        return true;
      } catch (error) {
        console.error(
          "Delete booking error:",
          error
        );

        setError(
          error.message ||
            "Failed to delete booking."
        );

        throw error;
      }
    };

  /*
  |--------------------------------------------------------------------------
  | CANCEL BOOKING
  |--------------------------------------------------------------------------
  */

  const cancelBooking =
    async (bookingId) => {
      return updateBookingStatus(
        bookingId,
        "cancelled"
      );
    };

  /*
  |--------------------------------------------------------------------------
  | REFRESH BOOKINGS
  |--------------------------------------------------------------------------
  */

  const refreshBookings =
    async () => {
      return fetchBookings();
    };

  /*
  |--------------------------------------------------------------------------
  | CLEAR ERROR
  |--------------------------------------------------------------------------
  */

  const clearBookingError =
    () => {
      setError("");
    };

  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const value = {
    bookings,
    loading,
    error,

    addBooking,
    getBooking,

    updateBookingStatus,
    updatePaymentStatus,

    deleteBooking,
    cancelBooking,

    refreshBookings,
    clearBookingError,
  };

  return (
    <BookingContext.Provider
      value={value}
    >
      {children}
    </BookingContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| HOOK
|--------------------------------------------------------------------------
*/

export function useBookings() {
  const context =
    useContext(BookingContext);

  if (!context) {
    throw new Error(
      "useBookings must be used inside BookingProvider"
    );
  }

  return context;
}

export default BookingContext;