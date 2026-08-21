/*
|--------------------------------------------------------------------------
| JNI TOURS API SERVICE
|--------------------------------------------------------------------------
|
| Central API helper for the frontend.
|
| Handles:
| - API base URL
| - JWT authentication
| - JSON responses
| - Authentication errors
| - Admin requests
|
|--------------------------------------------------------------------------
*/

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const TOKEN_KEY = "jni_tours_token";

/*
|--------------------------------------------------------------------------
| GET TOKEN
|--------------------------------------------------------------------------
*/

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/*
|--------------------------------------------------------------------------
| PARSE RESPONSE
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
      `Server returned HTTP ${response.status}.`,
  };
};

/*
|--------------------------------------------------------------------------
| API REQUEST
|--------------------------------------------------------------------------
*/

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  /*
   * Only add JSON content type when
   * a body is being sent.
   */
  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  /*
   * Attach JWT automatically.
   */
  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const data =
    await parseResponse(response);

  /*
   * Authentication failure.
   */
  if (response.status === 401) {
    throw new Error(
      data.message ||
        "Authentication is required. Please login."
    );
  }

  /*
   * Permission failure.
   */
  if (response.status === 403) {
    throw new Error(
      data.message ||
        "You do not have permission to perform this action."
    );
  }

  /*
   * Other API errors.
   */
  if (!response.ok) {
    throw new Error(
      data.message ||
        `Request failed with status ${response.status}.`
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export const apiGet = (
  endpoint
) => {
  return apiRequest(endpoint, {
    method: "GET",
  });
};

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/

export const apiPost = (
  endpoint,
  body
) => {
  return apiRequest(endpoint, {
    method: "POST",
    body:
      body instanceof FormData
        ? body
        : JSON.stringify(body),
  });
};

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/

export const apiPut = (
  endpoint,
  body
) => {
  return apiRequest(endpoint, {
    method: "PUT",
    body:
      body instanceof FormData
        ? body
        : JSON.stringify(body),
  });
};

/*
|--------------------------------------------------------------------------
| PATCH
|--------------------------------------------------------------------------
*/

export const apiPatch = (
  endpoint,
  body
) => {
  return apiRequest(endpoint, {
    method: "PATCH",
    body:
      body instanceof FormData
        ? body
        : JSON.stringify(body),
  });
};

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export const apiDelete = (
  endpoint
) => {
  return apiRequest(endpoint, {
    method: "DELETE",
  });
};

/*
|--------------------------------------------------------------------------
| ADMIN API
|--------------------------------------------------------------------------
*/

export const adminApi = {
  /*
   * Dashboard
   */
  getStats: () =>
    apiGet("/api/admin/stats"),

  /*
   * Bookings
   */
  getBookings: (params = "") =>
    apiGet(
      `/api/admin/bookings${params}`
    ),

  getBooking: (bookingId) =>
    apiGet(
      `/api/admin/bookings/${bookingId}`
    ),

  updateBookingStatus: (
    bookingId,
    status
  ) =>
    apiPatch(
      `/api/admin/bookings/${bookingId}/status`,
      { status }
    ),

  updatePaymentStatus: (
    bookingId,
    paymentStatus,
    paymentReference = ""
  ) =>
    apiPatch(
      `/api/admin/bookings/${bookingId}/payment`,
      {
        paymentStatus,
        paymentReference,
      }
    ),

  /*
   * Customers
   */
  getCustomers: (params = "") =>
    apiGet(
      `/api/admin/customers${params}`
    ),

  getCustomer: (id) =>
    apiGet(
      `/api/admin/customers/${id}`
    ),

  updateCustomerStatus: (
    id,
    isActive
  ) =>
    apiPatch(
      `/api/admin/customers/${id}/status`,
      { isActive }
    ),
};

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,

  admin: adminApi,
};