import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiEye,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import { tours } from "../../data/tourDetails";

import "./AdminTours.css";

/*
|--------------------------------------------------------------------------
| JNI TOURS — ADMIN TOUR MANAGEMENT
|--------------------------------------------------------------------------
|
| Built-in tours:
|   ../../data/tourDetails
|
| Admin-created tours:
|   MongoDB
|   /api/admin/tours
|
| The two sources are combined on this page.
|
|--------------------------------------------------------------------------
*/

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| DEFAULT IMAGE
|--------------------------------------------------------------------------
*/

const DEFAULT_TOUR_IMAGE =
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85";

/*
|--------------------------------------------------------------------------
| INITIAL FORM
|--------------------------------------------------------------------------
*/

const getInitialForm = () => ({
  title: "",
  slug: "",
  destination: "",
  location: "",
  category: "Wildlife Safari",
  style: "Comfort",
  duration: "",
  price: "",
  rating: "5.0",
  reviews: "0",
  guests: "2–6 guests",
  bestTime: "",
  badge: "",
  image: "",
  overview: "",
  highlights: "",
  included: "",
  excluded: "",
  accommodation: "",
  notes: "",
  itinerary: [
    {
      day: "Day 1",
      title: "",
      description: "",
    },
  ],
});

/*
|--------------------------------------------------------------------------
| TOKEN
|--------------------------------------------------------------------------
|
| Supports the common localStorage names used by the JNI Tours
| authentication implementation.
|
|--------------------------------------------------------------------------
*/

function getAuthToken() {
  return (
    localStorage.getItem("jni_tours_token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| API REQUEST
|--------------------------------------------------------------------------
*/

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      const error = new Error(
        "Authentication is required. Please login as administrator."
      );

      error.status = 401;
      error.data = data;

      throw error;
    }

    const error = new Error(
      data?.message ||
        data?.error ||
        "Unable to complete the request."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| NORMALIZE TOUR
|--------------------------------------------------------------------------
|
| Ensures MongoDB tours have exactly the same shape expected by the
| existing user-facing TourDetails component.
|--------------------------------------------------------------------------
*/

function normalizeTour(tour) {
  return {
    ...tour,

    id:
      tour.id ||
      tour._id ||
      `admin-${Date.now()}`,

    _id:
      tour._id ||
      tour.id,

    slug:
      String(tour.slug || "")
        .trim()
        .toLowerCase(),

    title:
      tour.title || "",

    destination:
      tour.destination || "",

    location:
      tour.location || "",

    category:
      tour.category || "Wildlife Safari",

    style:
      tour.style || "Comfort",

    duration:
      tour.duration || "",

    price:
      Number(tour.price) || 0,

    rating:
      Number(tour.rating) || 5,

    reviews:
      Number(tour.reviews) || 0,

    guests:
      tour.guests || "2–6 guests",

    bestTime:
      tour.bestTime || "",

    badge:
      tour.badge || "",

    images:
      Array.isArray(tour.images) &&
      tour.images.length > 0
        ? tour.images
        : [DEFAULT_TOUR_IMAGE],

    overview:
      tour.overview || "",

    highlights:
      Array.isArray(tour.highlights)
        ? tour.highlights
        : [],

    included:
      Array.isArray(tour.included)
        ? tour.included
        : [],

    excluded:
      Array.isArray(tour.excluded)
        ? tour.excluded
        : [],

    itinerary:
      Array.isArray(tour.itinerary)
        ? tour.itinerary
        : [],

    accommodation:
      tour.accommodation || "",

    notes:
      tour.notes || "",

    source: "admin",

    status:
      tour.status || "published",
  };
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function AdminTours() {
  const [adminTours, setAdminTours] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [
    destinationFilter,
    setDestinationFilter,
  ] = useState("all");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [editingTour, setEditingTour] =
    useState(null);

  const [form, setForm] =
    useState(getInitialForm());

  /*
  |--------------------------------------------------------------------------
  | LOAD ADMIN TOURS
  |--------------------------------------------------------------------------
  */

  const loadAdminTours = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await apiRequest(
            "/api/admin/tours"
          );

        const receivedTours =
          response?.tours ||
          response?.data?.tours ||
          response?.data ||
          [];

        setAdminTours(
          Array.isArray(receivedTours)
            ? receivedTours.map(
                normalizeTour
              )
            : []
        );
      } catch (requestError) {
        console.error(
          "Load admin tours error:",
          requestError
        );

        setError(
          requestError?.data?.message ||
            requestError?.message ||
            "Unable to load admin tours."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadAdminTours();
  }, [loadAdminTours]);

  /*
  |--------------------------------------------------------------------------
  | CLEAR MESSAGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  /*
  |--------------------------------------------------------------------------
  | FORM HELPERS
  |--------------------------------------------------------------------------
  */

  const updateForm = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateItinerary = (
    index,
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,

      itinerary:
        current.itinerary.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  };

  const addItineraryDay = () => {
    setForm((current) => ({
      ...current,

      itinerary: [
        ...current.itinerary,

        {
          day: `Day ${
            current.itinerary.length + 1
          }`,
          title: "",
          description: "",
        },
      ],
    }));
  };

  const removeItineraryDay = (
    index
  ) => {
    setForm((current) => ({
      ...current,

      itinerary:
        current.itinerary.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    }));
  };

  const resetForm = () => {
    setForm(getInitialForm());
    setEditingTour(null);
  };

  const openAddForm = () => {
    setError("");
    setSuccess("");
    resetForm();
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.title.trim() ||
      !form.slug.trim() ||
      !form.destination.trim() ||
      !form.price
    ) {
      setError(
        "Please complete the tour title, slug, destination and price."
      );

      return;
    }

    const itinerary =
      form.itinerary
        .filter(
          (item) =>
            item.title.trim() ||
            item.description.trim()
        )
        .map((item, index) => ({
          day: `Day ${index + 1}`,
          title:
            item.title.trim(),
          description:
            item.description.trim(),
        }));

    const tourPayload = {
      title:
        form.title.trim(),

      slug:
        form.slug
          .trim()
          .toLowerCase(),

      destination:
        form.destination.trim(),

      location:
        form.location.trim(),

      category:
        form.category,

      style:
        form.style,

      duration:
        form.duration.trim(),

      price:
        Number(form.price),

      rating:
        Number(form.rating) || 5,

      reviews:
        Number(form.reviews) || 0,

      guests:
        form.guests.trim(),

      bestTime:
        form.bestTime.trim(),

      badge:
        form.badge.trim(),

      images:
        form.image.trim()
          ? [form.image.trim()]
          : [DEFAULT_TOUR_IMAGE],

      overview:
        form.overview.trim(),

      highlights:
        form.highlights
          .split("\n")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean),

      included:
        form.included
          .split("\n")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean),

      excluded:
        form.excluded
          .split("\n")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean),

      itinerary,

      accommodation:
        form.accommodation.trim(),

      notes:
        form.notes.trim(),

      status: "published",
    };

    setSaving(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      if (editingTour) {
        const id =
          editingTour._id ||
          editingTour.id;

        const response =
          await apiRequest(
            `/api/admin/tours/${id}`,
            {
              method: "PUT",
              body: JSON.stringify(
                tourPayload
              ),
            }
          );

        const updatedTour =
          response?.tour ||
          response?.data?.tour ||
          response?.data;

        if (updatedTour) {
          const normalized =
            normalizeTour(
              updatedTour
            );

          setAdminTours(
            (current) =>
              current.map(
                (tour) =>
                  String(
                    tour._id ||
                      tour.id
                  ) ===
                  String(id)
                    ? normalized
                    : tour
              )
          );
        } else {
          await loadAdminTours();
        }

        setSuccess(
          "Tour updated successfully."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------------
      */

      else {
        const response =
          await apiRequest(
            "/api/admin/tours",
            {
              method: "POST",
              body: JSON.stringify(
                tourPayload
              ),
            }
          );

        const createdTour =
          response?.tour ||
          response?.data?.tour ||
          response?.data;

        if (createdTour) {
          setAdminTours(
            (current) => [
              normalizeTour(
                createdTour
              ),
              ...current,
            ]
          );
        } else {
          await loadAdminTours();
        }

        setSuccess(
          "Tour created successfully."
        );
      }

      setShowForm(false);
      resetForm();
    } catch (requestError) {
      console.error(
        "Save tour error:",
        requestError
      );

      setError(
        requestError?.data?.message ||
          requestError?.message ||
          "Unable to save tour."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  const handleEdit = (tour) => {
    setError("");
    setSuccess("");

    setEditingTour(tour);

    setForm({
      title:
        tour.title || "",

      slug:
        tour.slug || "",

      destination:
        tour.destination || "",

      location:
        tour.location || "",

      category:
        tour.category ||
        "Wildlife Safari",

      style:
        tour.style ||
        "Comfort",

      duration:
        tour.duration || "",

      price:
        tour.price ?? "",

      rating:
        tour.rating ?? "5.0",

      reviews:
        tour.reviews ?? "0",

      guests:
        tour.guests ||
        "2–6 guests",

      bestTime:
        tour.bestTime || "",

      badge:
        tour.badge || "",

      image:
        tour.images?.[0] || "",

      overview:
        tour.overview || "",

      highlights:
        tour.highlights?.join(
          "\n"
        ) || "",

      included:
        tour.included?.join(
          "\n"
        ) || "",

      excluded:
        tour.excluded?.join(
          "\n"
        ) || "",

      accommodation:
        tour.accommodation || "",

      notes:
        tour.notes || "",

      itinerary:
        tour.itinerary?.length
          ? tour.itinerary.map(
              (item, index) => ({
                day:
                  item.day ||
                  `Day ${
                    index + 1
                  }`,
                title:
                  item.title || "",
                description:
                  item.description ||
                  "",
              })
            )
          : [
              {
                day: "Day 1",
                title: "",
                description: "",
              },
            ],
    });

    setShowForm(true);
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (
    tour
  ) => {
    const id =
      tour._id || tour.id;

    if (!id) {
      setError(
        "This tour does not have a valid database ID."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${tour.title}"? This cannot be undone.`
      );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      await apiRequest(
        `/api/admin/tours/${id}`,
        {
          method: "DELETE",
        }
      );

      setAdminTours(
        (current) =>
          current.filter(
            (item) =>
              String(
                item._id ||
                  item.id
              ) !== String(id)
          )
      );

      setSuccess(
        "Tour deleted successfully."
      );
    } catch (requestError) {
      console.error(
        "Delete tour error:",
        requestError
      );

      setError(
        requestError?.data?.message ||
          requestError?.message ||
          "Unable to delete tour."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | COMBINE BUILT-IN + DATABASE TOURS
  |--------------------------------------------------------------------------
  */

  const allTours = useMemo(() => {
    const builtInTours =
      tours.map((tour) => ({
        ...tour,
        source: "built-in",
        isBuiltIn: true,
      }));

    const databaseTours =
      adminTours.map(
        (tour) => ({
          ...normalizeTour(
            tour
          ),
          source: "admin",
          isBuiltIn: false,
        })
      );

    return [
      ...builtInTours,
      ...databaseTours,
    ];
  }, [adminTours]);

  /*
  |--------------------------------------------------------------------------
  | FILTER OPTIONS
  |--------------------------------------------------------------------------
  */

  const destinations =
    useMemo(() => {
      return [
        ...new Set(
          allTours
            .map(
              (tour) =>
                tour.destination
            )
            .filter(Boolean)
        ),
      ].sort();
    }, [allTours]);

  const categories =
    useMemo(() => {
      return [
        ...new Set(
          allTours
            .map(
              (tour) =>
                tour.category
            )
            .filter(Boolean)
        ),
      ].sort();
    }, [allTours]);

  /*
  |--------------------------------------------------------------------------
  | FILTERED TOURS
  |--------------------------------------------------------------------------
  */

  const filteredTours =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return allTours.filter(
        (tour) => {
          const title =
            String(
              tour.title || ""
            ).toLowerCase();

          const slug =
            String(
              tour.slug || ""
            ).toLowerCase();

          const destination =
            String(
              tour.destination ||
                ""
            ).toLowerCase();

          const matchesSearch =
            !query ||
            title.includes(query) ||
            slug.includes(query) ||
            destination.includes(
              query
            );

          const matchesDestination =
            destinationFilter ===
              "all" ||
            tour.destination ===
              destinationFilter;

          const matchesCategory =
            categoryFilter ===
              "all" ||
            tour.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesDestination &&
            matchesCategory
          );
        }
      );
    }, [
      allTours,
      search,
      destinationFilter,
      categoryFilter,
    ]);

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="admin-tours">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-page-heading">
        <div>
          <span>
            Tour management
          </span>

          <h1>
            Tour packages
          </h1>

          <p>
            Manage existing tours and
            create new experiences for
            your website.
          </p>
        </div>

        <div className="admin-page-heading-actions">

          <button
            type="button"
            className="admin-refresh-button"
            onClick={
              loadAdminTours
            }
            disabled={loading}
            title="Refresh tours"
          >
            <FiRefreshCw
              className={
                loading
                  ? "admin-refresh-spinning"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="admin-add-button"
            onClick={openAddForm}
          >
            <FiPlus />
            Add new tour
          </button>

        </div>
      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="admin-tour-alert error">
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Dismiss error"
          >
            <FiX />
          </button>
        </div>
      )}

      {success && (
        <div className="admin-tour-alert success">
          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            aria-label="Dismiss success message"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="admin-tour-summary">

        <div>
          <strong>
            {allTours.length}
          </strong>

          <span>
            Total tours
          </span>
        </div>

        <div>
          <strong>
            {tours.length}
          </strong>

          <span>
            Built-in tours
          </span>
        </div>

        <div>
          <strong>
            {adminTours.length}
          </strong>

          <span>
            Admin added
          </span>
        </div>

      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="admin-tours-toolbar">

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
            placeholder="Search tours..."
          />
        </div>

        <select
          value={destinationFilter}
          onChange={(event) =>
            setDestinationFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All destinations
          </option>

          {destinations.map(
            (destination) => (
              <option
                key={destination}
                value={destination}
              >
                {destination}
              </option>
            )
          )}
        </select>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            )
          )}
        </select>

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="admin-tours-table-wrapper">

        <table className="admin-tours-table">

          <thead>
            <tr>
              <th>Tour</th>
              <th>Destination</th>
              <th>Category</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Source</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  className="admin-tours-empty"
                >
                  <FiRefreshCw className="admin-refresh-spinning" />

                  <strong>
                    Loading tours...
                  </strong>

                  <span>
                    Fetching tours from the
                    database.
                  </span>
                </td>
              </tr>
            ) : (
              filteredTours.map(
                (tour) => {
                  const isBuiltIn =
                    tour.source ===
                    "built-in";

                  const tourId =
                    tour._id ||
                    tour.id;

                  const isDeleting =
                    deletingId &&
                    String(
                      deletingId
                    ) ===
                      String(
                        tourId
                      );

                  return (
                    <tr
                      key={`${tour.source}-${tourId}`}
                    >

                      <td>
                        <div className="admin-tour-name">

                          <img
                            src={
                              tour
                                .images?.[0] ||
                              DEFAULT_TOUR_IMAGE
                            }
                            alt={
                              tour.title
                            }
                          />

                          <div>
                            <strong>
                              {
                                tour.title
                              }
                            </strong>

                            <span>
                              {
                                tour.slug
                              }
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        {
                          tour.destination
                        }
                      </td>

                      <td>
                        <span className="admin-tour-category">
                          {
                            tour.category
                          }
                        </span>
                      </td>

                      <td>
                        {
                          tour.duration
                        }
                      </td>

                      <td>
                        <strong>
                          $
                          {Number(
                            tour.price
                          ).toLocaleString()}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`admin-tour-source ${
                            isBuiltIn
                              ? "built-in"
                              : "admin-added"
                          }`}
                        >
                          {isBuiltIn
                            ? "Built-in"
                            : "Admin added"}
                        </span>
                      </td>

                      <td>
                        <span className="admin-tour-status">
                          {tour.status ===
                          "draft"
                            ? "Draft"
                            : "Published"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-tour-actions">

                          <Link
                            to={`/tours/${tour.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View tour"
                          >
                            <FiEye />
                          </Link>

                          <button
                            type="button"
                            title={
                              isBuiltIn
                                ? "Built-in tour cannot be edited"
                                : "Edit tour"
                            }
                            disabled={
                              isBuiltIn ||
                              saving ||
                              isDeleting
                            }
                            className={
                              isBuiltIn
                                ? "disabled"
                                : ""
                            }
                            onClick={() =>
                              handleEdit(
                                tour
                              )
                            }
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            title={
                              isBuiltIn
                                ? "Built-in tour cannot be deleted"
                                : "Delete tour"
                            }
                            disabled={
                              isBuiltIn ||
                              saving ||
                              isDeleting
                            }
                            className={`delete ${
                              isBuiltIn
                                ? "disabled"
                                : ""
                            }`}
                            onClick={() =>
                              handleDelete(
                                tour
                              )
                            }
                          >
                            {isDeleting ? (
                              <FiRefreshCw className="admin-refresh-spinning" />
                            ) : (
                              <FiTrash2 />
                            )}
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                }
              )
            )}

            {!loading &&
              filteredTours.length ===
                0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="admin-tours-empty"
                  >
                    <FiSearch />

                    <strong>
                      No tours found
                    </strong>

                    <span>
                      Try changing your
                      search or filters.
                    </span>
                  </td>
                </tr>
              )}

          </tbody>

        </table>

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (
        <div
          className="admin-tour-modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >

          <div className="admin-tour-modal">

            {/* MODAL HEADER */}

            <div className="admin-tour-modal-header">

              <div>
                <span>
                  Tour management
                </span>

                <h2>
                  {editingTour
                    ? "Edit tour"
                    : "Add new tour"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                disabled={saving}
              >
                <FiX />
              </button>

            </div>

            {/* FORM */}

            <form
              className="admin-tour-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <div className="admin-form-section">

                <div className="admin-form-section-heading">
                  <h3>
                    Basic information
                  </h3>

                  <span>
                    Main details displayed
                    on the tour page.
                  </span>
                </div>

                <div className="admin-form-grid">

                  <label className="admin-form-field full">
                    <span>
                      Tour title *
                    </span>

                    <input
                      value={
                        form.title
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "title",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="e.g. Amboseli Wildlife Escape"
                      required
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>
                      Slug *
                    </span>

                    <input
                      value={
                        form.slug
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "slug",
                          event.target.value
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )
                            .replace(
                              /[^a-z0-9-]/g,
                              ""
                            )
                        )
                      }
                      placeholder="amboseli-wildlife-escape"
                      required
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>
                      Destination *
                    </span>

                    <input
                      value={
                        form.destination
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "destination",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Kenya"
                      required
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>
                      Location
                    </span>

                    <input
                      value={
                        form.location
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "location",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Amboseli National Park"
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>
                      Category
                    </span>

                    <select
                      value={
                        form.category
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "category",
                          event
                            .target
                            .value
                        )
                      }
                    >
                      <option>
                        Wildlife Safari
                      </option>

                      <option>
                        Beach Holiday
                      </option>

                      <option>
                        Mountain Adventure
                      </option>

                      <option>
                        Gorilla Trekking
                      </option>

                      <option>
                        Grand Safari
                      </option>
                    </select>
                  </label>

                  <label className="admin-form-field">
                    <span>
                      Style
                    </span>

                    <select
                      value={
                        form.style
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "style",
                          event
                            .target
                            .value
                        )
                      }
                    >
                      <option>
                        Comfort
                      </option>

                      <option>
                        Premium
                      </option>

                      <option>
                        Luxury
                      </option>

                      <option>
                        Adventure
                      </option>
                    </select>
                  </label>

                  <label className="admin-form-field">
                    <span>
                      Duration
                    </span>

                    <input
                      value={
                        form.duration
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "duration",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="4 Days / 3 Nights"
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>
                      Price (USD) *
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.price
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "price",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="1250"
                      required
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>
                      Guests
                    </span>

                    <input
                      value={
                        form.guests
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "guests",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="2–6 guests"
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>
                      Best time
                    </span>

                    <input
                      value={
                        form.bestTime
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "bestTime",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="July – October"
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>
                      Badge
                    </span>

                    <input
                      value={
                        form.badge
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "badge",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Best Seller"
                    />
                  </label>

                  <label className="admin-form-field full">
                    <span>
                      Cover image URL
                    </span>

                    <input
                      value={
                        form.image
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "image",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="https://..."
                    />
                  </label>

                </div>

              </div>

              {/* =================================================
                  OVERVIEW
              ================================================= */}

              <div className="admin-form-section">

                <div className="admin-form-section-heading">
                  <h3>
                    Tour description
                  </h3>
                </div>

                <label className="admin-form-field full">
                  <span>
                    Overview
                  </span>

                  <textarea
                    rows="5"
                    value={
                      form.overview
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "overview",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Describe the experience..."
                  />
                </label>

              </div>

              {/* =================================================
                  HIGHLIGHTS
              ================================================= */}

              <div className="admin-form-section">

                <div className="admin-form-section-heading">
                  <h3>
                    Highlights
                  </h3>

                  <span>
                    Enter one highlight
                    per line.
                  </span>
                </div>

                <label className="admin-form-field full">

                  <textarea
                    rows="6"
                    value={
                      form.highlights
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "highlights",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder={`Mount Kilimanjaro views
Large elephant herds
Professional safari guide
Comfortable accommodation`}
                  />

                </label>

              </div>

              {/* =================================================
                  ITINERARY
              ================================================= */}

              <div className="admin-form-section">

                <div className="admin-form-section-heading">

                  <div>
                    <h3>
                      Itinerary
                    </h3>

                    <span>
                      Build the
                      day-by-day journey.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="admin-inline-button"
                    onClick={
                      addItineraryDay
                    }
                    disabled={
                      saving
                    }
                  >
                    <FiPlus />
                    Add day
                  </button>

                </div>

                <div className="admin-itinerary-editor">

                  {form.itinerary.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="admin-itinerary-item"
                        key={index}
                      >

                        <div className="admin-itinerary-item-top">

                          <strong>
                            Day{" "}
                            {index +
                              1}
                          </strong>

                          {form
                            .itinerary
                            .length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeItineraryDay(
                                  index
                                )
                              }
                              title="Remove day"
                              disabled={
                                saving
                              }
                            >
                              <FiX />
                            </button>
                          )}

                        </div>

                        <input
                          value={
                            item.title
                          }
                          onChange={(
                            event
                          ) =>
                            updateItinerary(
                              index,
                              "title",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Day title"
                        />

                        <textarea
                          rows="3"
                          value={
                            item.description
                          }
                          onChange={(
                            event
                          ) =>
                            updateItinerary(
                              index,
                              "description",
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="Describe this day..."
                        />

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* =================================================
                  INCLUDED / EXCLUDED
              ================================================= */}

              <div className="admin-form-section">

                <div className="admin-form-section-heading">

                  <h3>
                    What's included
                  </h3>

                  <span>
                    One item per line.
                  </span>

                </div>

                <div className="admin-form-grid">

                  <label className="admin-form-field">

                    <span>
                      Included
                    </span>

                    <textarea
                      rows="7"
                      value={
                        form.included
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "included",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder={`Safari vehicle
Professional guide
Accommodation
Meals
Park fees`}
                    />

                  </label>

                  <label className="admin-form-field">

                    <span>
                      Not included
                    </span>

                    <textarea
                      rows="7"
                      value={
                        form.excluded
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "excluded",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder={`International flights
Travel insurance
Personal expenses
Tips`}
                    />

                  </label>

                </div>

              </div>

              {/* =================================================
                  ACCOMMODATION
              ================================================= */}

              <div className="admin-form-section">

                <label className="admin-form-field full">

                  <span>
                    Accommodation
                  </span>

                  <textarea
                    rows="3"
                    value={
                      form.accommodation
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "accommodation",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Describe where guests will stay..."
                  />

                </label>

                <label className="admin-form-field full">

                  <span>
                    Additional notes
                  </span>

                  <textarea
                    rows="3"
                    value={
                      form.notes
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "notes",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Customization information..."
                  />

                </label>

              </div>

              {/* =================================================
                  FORM ACTIONS
              ================================================= */}

              <div className="admin-tour-form-actions">

                <button
                  type="button"
                  className="admin-form-cancel"
                  onClick={
                    closeForm
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-form-submit"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingTour
                    ? "Save changes"
                    : "Create tour"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminTours;