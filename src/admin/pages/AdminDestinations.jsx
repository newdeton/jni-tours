import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiEdit2,
  FiEye,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./AdminDestinations.css";

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| HARDCODED WEBSITE DESTINATIONS
|--------------------------------------------------------------------------
|
| These destinations remain part of the website even if the database
| is empty or unavailable.
|
*/

const hardCodedDestinations = [
  {
    id: "kenya",
    name: "Kenya",
    location: "East Africa",
    description:
      "From the legendary Masai Mara to the beaches of the Kenyan coast, Kenya offers extraordinary wildlife and unforgettable landscapes.",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85",
  },

  {
    id: "tanzania",
    name: "Tanzania",
    location: "East Africa",
    description:
      "Discover the Serengeti, Ngorongoro and Mount Kilimanjaro alongside the tropical beauty of Zanzibar.",
    image:
      "https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1200&q=85",
  },

  {
    id: "uganda",
    name: "Uganda",
    location: "East Africa",
    description:
      "Explore Uganda's lush landscapes, remarkable wildlife and unforgettable gorilla trekking experiences.",
    image:
      "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1200&q=85",
  },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function normalizeDestination(destination) {
  if (!destination) {
    return null;
  }

  return {
    ...destination,

    id:
      destination._id ||
      destination.id ||
      destination.slug,

    name:
      destination.name ||
      destination.title ||
      "Unnamed destination",

    location:
      destination.location ||
      destination.country ||
      destination.region ||
      "East Africa",

    description:
      destination.description ||
      destination.summary ||
      "",

    image:
      destination.image ||
      destination.imageUrl ||
      destination.coverImage ||
      "",

    source: "admin",
  };
}

function getErrorMessage(data, fallback) {
  return (
    data?.message ||
    data?.error ||
    fallback
  );
}

/*
|--------------------------------------------------------------------------
| ADMIN DESTINATIONS
|--------------------------------------------------------------------------
*/

function AdminDestinations() {
  const { token } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [adminDestinations, setAdminDestinations] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [showForm, setShowForm] =
    useState(false);

  const [editingDestination, setEditingDestination] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    image: "",
  });

  /*
  |--------------------------------------------------------------------------
  | ALL DESTINATIONS
  |--------------------------------------------------------------------------
  */

  const allDestinations = useMemo(
    () => [
      ...hardCodedDestinations.map(
        (destination) => ({
          ...destination,
          source: "hardcoded",
        })
      ),

      ...adminDestinations.map(
        (destination) => ({
          ...destination,
          source: "admin",
        })
      ),
    ],
    [adminDestinations]
  );

  /*
  |--------------------------------------------------------------------------
  | FILTERED DESTINATIONS
  |--------------------------------------------------------------------------
  */

  const filteredDestinations = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return allDestinations.filter(
      (destination) => {
        const name =
          destination.name
            ?.toLowerCase() || "";

        const location =
          destination.location
            ?.toLowerCase() || "";

        const description =
          destination.description
            ?.toLowerCase() || "";

        const matchesSearch =
          !query ||
          name.includes(query) ||
          location.includes(query) ||
          description.includes(query);

        const matchesFilter =
          filter === "all" ||
          destination.source === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [
    allDestinations,
    search,
    filter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | FETCH DESTINATIONS
  |--------------------------------------------------------------------------
  */

  const fetchDestinations = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_BASE_URL}/destinations`
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        let data = {};

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          data = await response.json();
        } else {
          const text =
            await response.text();

          data = {
            message:
              text ||
              `Server returned HTTP ${response.status}`,
          };
        }

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              "Failed to load destinations."
            )
          );
        }

        /*
        |--------------------------------------------------------------------------
        | SUPPORT DIFFERENT API RESPONSE SHAPES
        |--------------------------------------------------------------------------
        */

        const destinations = Array.isArray(
          data
        )
          ? data
          : Array.isArray(
              data.destinations
            )
          ? data.destinations
          : Array.isArray(data.data)
          ? data.data
          : [];

        /*
        |--------------------------------------------------------------------------
        | ONLY STORE ADMIN / DATABASE DESTINATIONS
        |--------------------------------------------------------------------------
        |
        | The hardcoded destinations are added separately above.
        |
        */

        const normalized =
          destinations
            .map(
              normalizeDestination
            )
            .filter(Boolean);

        setAdminDestinations(
          normalized
        );
      } catch (err) {
        console.error(
          "Admin destinations error:",
          err
        );

        setError(
          err.message ||
            "Failed to load destinations."
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | We do not clear the hardcoded destinations.
        |
        */

        setAdminDestinations([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
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
    fetchDestinations();
  }, [fetchDestinations]);

  /*
  |--------------------------------------------------------------------------
  | FORM HELPERS
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {
    setForm({
      name: "",
      location: "",
      description: "",
      image: "",
    });

    setEditingDestination(null);
    setFormError("");
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (
    destination
  ) => {
    if (
      destination.source !== "admin"
    ) {
      return;
    }

    setEditingDestination(
      destination
    );

    setForm({
      name:
        destination.name || "",
      location:
        destination.location || "",
      description:
        destination.description || "",
      image:
        destination.image || "",
    });

    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
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

    if (formError) {
      setFormError("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATE FORM
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Destination name is required.";
    }

    if (!form.location.trim()) {
      return "Destination location is required.";
    }

    if (!form.description.trim()) {
      return "Destination description is required.";
    }

    if (!form.image.trim()) {
      return "Destination image URL is required.";
    }

    return "";
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE DESTINATION
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!token) {
      setFormError(
        "Your administrator session has expired. Please sign in again."
      );

      return;
    }

    const validationError =
      validateForm();

    if (validationError) {
      setFormError(
        validationError
      );

      return;
    }

    try {
      setSaving(true);
      setFormError("");
      setError("");

      const isEditing =
        Boolean(
          editingDestination
        );

      const destinationId =
        editingDestination?._id ||
        editingDestination?.id;

      const endpoint = isEditing
        ? `${API_BASE_URL}/admin/destinations/${destinationId}`
        : `${API_BASE_URL}/admin/destinations`;

      const method = isEditing
        ? "PUT"
        : "POST";

      const response = await fetch(
        endpoint,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: form.name.trim(),
            location:
              form.location.trim(),
            description:
              form.description.trim(),
            image: form.image.trim(),
          }),
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data = {};

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text =
          await response.text();

        data = {
          message:
            text ||
            `Server returned HTTP ${response.status}`,
        };
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          getErrorMessage(
            data,
            "Administrator access is required."
          )
        );
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            isEditing
              ? "Failed to update destination."
              : "Failed to create destination."
          )
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CLOSE FORM
      |--------------------------------------------------------------------------
      */

      setShowForm(false);
      resetForm();

      /*
      |--------------------------------------------------------------------------
      | RELOAD FROM DATABASE
      |--------------------------------------------------------------------------
      |
      | This ensures the admin UI reflects the actual database record.
      |
      */

      await fetchDestinations(true);
    } catch (err) {
      console.error(
        "Destination save error:",
        err
      );

      setFormError(
        err.message ||
          "Failed to save destination."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE DESTINATION
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (
    destination
  ) => {
    if (
      destination.source !== "admin"
    ) {
      return;
    }

    if (!token) {
      setError(
        "Your administrator session has expired. Please sign in again."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${destination.name}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    const destinationId =
      destination._id ||
      destination.id;

    try {
      setDeletingId(
        destinationId
      );

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/destinations/${destinationId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data = {};

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text =
          await response.text();

        data = {
          message:
            text ||
            `Server returned HTTP ${response.status}`,
        };
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          getErrorMessage(
            data,
            "Administrator access is required."
          )
        );
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Failed to delete destination."
          )
        );
      }

      /*
      |--------------------------------------------------------------------------
      | REMOVE LOCALLY FIRST
      |--------------------------------------------------------------------------
      */

      setAdminDestinations(
        (current) =>
          current.filter(
            (item) =>
              (item._id ||
                item.id) !==
              destinationId
          )
      );
    } catch (err) {
      console.error(
        "Destination delete error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete destination."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | VIEW DESTINATION
  |--------------------------------------------------------------------------
  */

  const handleView = (
    destination
  ) => {
    /*
    |----------------------------------------------------------------------
    | Admin destinations can have a slug generated by the backend.
    | Hardcoded destinations continue to use the public destinations page.
    |----------------------------------------------------------------------
    */

    if (
      destination.slug
    ) {
      window.open(
        `/destinations/${destination.slug}`,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    window.open(
      "/destinations",
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const destinationStats =
    useMemo(() => {
      const adminCount =
        adminDestinations.length;

      const websiteCount =
        hardCodedDestinations.length;

      return {
        total:
          websiteCount +
          adminCount,

        website:
          websiteCount,

        admin:
          adminCount,
      };
    }, [adminDestinations]);

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (
    loading &&
    !adminDestinations.length
  ) {
    return (
      <div className="admin-destinations">
        <div className="admin-destinations-loading">
          <FiRefreshCw className="admin-spin" />

          <strong>
            Loading destinations...
          </strong>

          <span>
            Fetching destinations from the
            website database.
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
    <div className="admin-destinations">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-page-heading">

        <div>
          <span>
            Destination management
          </span>

          <h1>
            Destinations
          </h1>

          <p>
            Manage the destinations displayed
            across JNI Tours.
          </p>
        </div>

        <div className="admin-page-heading-actions">

          <button
            type="button"
            className="admin-refresh-button"
            onClick={() =>
              fetchDestinations(true)
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

          <button
            type="button"
            className="admin-add-button"
            onClick={openAddForm}
          >
            <FiPlus />

            Add destination
          </button>

        </div>

      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="admin-destinations-summary">

        <div>
          <span>
            Total destinations
          </span>

          <strong>
            {destinationStats.total}
          </strong>
        </div>

        <div>
          <span>
            Website destinations
          </span>

          <strong>
            {destinationStats.website}
          </strong>
        </div>

        <div>
          <span>
            Admin added
          </span>

          <strong>
            {destinationStats.admin}
          </strong>
        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-destinations-error">

          <div>
            <strong>
              Destination management error
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchDestinations(true)
            }
          >
            Try again
          </button>

        </div>
      )}

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="admin-destinations-toolbar">

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
            placeholder="Search destinations..."
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() =>
                setSearch("")
              }
            >
              <FiX />
            </button>
          )}

        </div>

        <select
          value={filter}
          onChange={(event) =>
            setFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All destinations
          </option>

          <option value="hardcoded">
            Website destinations
          </option>

          <option value="admin">
            Admin added
          </option>
        </select>

      </div>

      {/* =====================================================
          DESTINATION GRID
      ===================================================== */}

      <div className="admin-destinations-grid">

        {filteredDestinations.map(
          (destination) => {
            const destinationId =
              destination._id ||
              destination.id;

            const isDeleting =
              deletingId ===
              destinationId;

            const isAdminDestination =
              destination.source ===
              "admin";

            return (
              <article
                className="admin-destination-card"
                key={
                  destinationId
                }
              >

                {/* IMAGE */}

                <div className="admin-destination-image">

                  <img
                    src={
                      destination.image
                    }
                    alt={
                      destination.name
                    }
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />

                  <span
                    className={
                      isAdminDestination
                        ? "admin-destination-badge admin-added"
                        : "admin-destination-badge"
                    }
                  >
                    {isAdminDestination
                      ? "Admin added"
                      : "Website"}
                  </span>

                </div>

                {/* CONTENT */}

                <div className="admin-destination-content">

                  <div className="admin-destination-location">
                    <FiMapPin />

                    {destination.location}
                  </div>

                  <h2>
                    {destination.name}
                  </h2>

                  <p>
                    {destination.description}
                  </p>

                  {/* ACTIONS */}

                  <div className="admin-destination-actions">

                    <button
                      type="button"
                      title="View destination"
                      onClick={() =>
                        handleView(
                          destination
                        )
                      }
                    >
                      <FiEye />

                      View
                    </button>

                    <button
                      type="button"
                      title={
                        isAdminDestination
                          ? "Edit destination"
                          : "Website destination cannot be edited"
                      }
                      disabled={
                        !isAdminDestination ||
                        isDeleting
                      }
                      onClick={() =>
                        openEditForm(
                          destination
                        )
                      }
                    >
                      <FiEdit2 />

                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete"
                      title={
                        isAdminDestination
                          ? "Delete destination"
                          : "Website destination cannot be deleted"
                      }
                      disabled={
                        !isAdminDestination ||
                        isDeleting
                      }
                      onClick={() =>
                        handleDelete(
                          destination
                        )
                      }
                    >
                      {isDeleting ? (
                        <FiRefreshCw className="admin-spin" />
                      ) : (
                        <FiTrash2 />
                      )}

                      {isDeleting
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

              </article>
            );
          }
        )}

      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {filteredDestinations.length ===
        0 && (
        <div className="admin-empty-state">

          <FiMapPin />

          <h3>
            No destinations found
          </h3>

          <p>
            {search
              ? "Try another search term."
              : "Add your first destination to get started."}
          </p>

          {!search && (
            <button
              type="button"
              className="admin-add-button"
              onClick={
                openAddForm
              }
            >
              <FiPlus />

              Add destination
            </button>
          )}

        </div>
      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (
        <div
          className="admin-destination-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >

          <div
            className="admin-destination-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="destination-modal-title"
          >

            {/* MODAL HEADER */}

            <div className="admin-modal-header">

              <div>
                <span>
                  Destination management
                </span>

                <h2 id="destination-modal-title">
                  {editingDestination
                    ? "Edit destination"
                    : "Add new destination"}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeForm
                }
                aria-label="Close"
                disabled={saving}
              >
                <FiX />
              </button>

            </div>

            {/* FORM ERROR */}

            {formError && (
              <div className="admin-modal-error">
                {formError}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="admin-form-grid">

                {/* NAME */}

                <div className="admin-form-group">

                  <label htmlFor="destination-name">
                    Destination name
                  </label>

                  <input
                    id="destination-name"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Zanzibar"
                    autoComplete="off"
                    required
                    disabled={
                      saving
                    }
                  />

                </div>

                {/* LOCATION */}

                <div className="admin-form-group">

                  <label htmlFor="destination-location">
                    Location
                  </label>

                  <input
                    id="destination-location"
                    name="location"
                    value={
                      form.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Tanzania, East Africa"
                    autoComplete="off"
                    required
                    disabled={
                      saving
                    }
                  />

                </div>

              </div>

              {/* IMAGE */}

              <div className="admin-form-group">

                <label htmlFor="destination-image">
                  Image URL
                </label>

                <input
                  id="destination-image"
                  name="image"
                  type="url"
                  value={
                    form.image
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                  required
                  disabled={
                    saving
                  }
                />

              </div>

              {/* IMAGE PREVIEW */}

              {form.image && (
                <div className="admin-destination-form-preview">

                  <img
                    src={
                      form.image
                    }
                    alt="Destination preview"
                    onError={(
                      event
                    ) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />

                </div>
              )}

              {/* DESCRIPTION */}

              <div className="admin-form-group">

                <label htmlFor="destination-description">
                  Description
                </label>

                <textarea
                  id="destination-description"
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe this destination..."
                  rows="5"
                  required
                  disabled={
                    saving
                  }
                />

              </div>

              {/* ACTIONS */}

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="admin-modal-cancel"
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
                  className="admin-modal-save"
                  disabled={
                    saving
                  }
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="admin-spin" />

                      {editingDestination
                        ? "Saving..."
                        : "Adding..."}
                    </>
                  ) : editingDestination ? (
                    "Save changes"
                  ) : (
                    "Add destination"
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminDestinations;