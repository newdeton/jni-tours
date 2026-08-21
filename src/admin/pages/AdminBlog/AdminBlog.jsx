import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiEdit3,
  FiEye,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import "./AdminBlog.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

function AdminBlog() {
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    content: "",
    image: "",
    readTime: "",
    status: "draft",
    featured: false,
  });

  const token =
    localStorage.getItem("jni_tours_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jniToursToken");

  /*
  |--------------------------------------------------------------------------
  | LOAD POSTS
  |--------------------------------------------------------------------------
  */

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/blog`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load blog posts."
        );
      }

      setPosts(
        Array.isArray(data?.posts)
          ? data.posts
          : []
      );
    } catch (err) {
      console.error(
        "Load admin blog posts error:",
        err
      );

      setError(
        err.message ||
          "Unable to load blog posts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTER POSTS
  |--------------------------------------------------------------------------
  */

  const filteredPosts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return posts.filter((post) => {
      const matchesSearch =
        !query ||
        String(post.title || "")
          .toLowerCase()
          .includes(query) ||
        String(post.category || "")
          .toLowerCase()
          .includes(query) ||
        String(post.slug || "")
          .toLowerCase()
          .includes(query);

      const normalizedStatus =
        post.status ||
        (post.published
          ? "published"
          : "draft");

      const matchesStatus =
        statusFilter === "all" ||
        normalizedStatus === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    posts,
    search,
    statusFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | FORM HELPERS
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      category: "",
      excerpt: "",
      content: "",
      image: "",
      readTime: "",
      status: "draft",
      featured: false,
    });
  };

  const openCreateModal = () => {
    setEditingPost(null);
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);

    setForm({
      title: post.title || "",
      slug: post.slug || "",
      category: post.category || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      image: post.image || "",
      readTime: post.readTime || "",
      status:
        post.status ||
        (post.published
          ? "published"
          : "draft"),
      featured: Boolean(
        post.featured
      ),
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingPost(null);
    resetForm();
  };

  /*
  |--------------------------------------------------------------------------
  | INPUT CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | AUTO SLUG
  |--------------------------------------------------------------------------
  */

  const generateSlug = () => {
    const slug = form.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setForm((current) => ({
      ...current,
      slug,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE POST
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a blog title.");
      return;
    }

    if (!form.category.trim()) {
      setError("Please enter a category.");
      return;
    }

    if (!form.excerpt.trim()) {
      setError("Please enter an excerpt.");
      return;
    }

    if (!form.content.trim()) {
      setError("Please enter the article content.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isEditing =
        Boolean(editingPost);

      const endpoint = isEditing
        ? `${API_URL}/api/admin/blog/${editingPost._id}`
        : `${API_URL}/api/admin/blog`;

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
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: form.title.trim(),
            slug: form.slug.trim(),
            category:
              form.category.trim(),
            excerpt:
              form.excerpt.trim(),
            content:
              form.content.trim(),
            image: form.image.trim(),
            readTime:
              form.readTime.trim(),
            status: form.status,
            featured: form.featured,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to save blog post."
        );
      }

      const savedPost =
        data?.post ||
        data?.data;

      if (savedPost) {
        setPosts((current) => {
          if (isEditing) {
            return current.map((post) =>
              post._id === editingPost._id
                ? savedPost
                : post
            );
          }

          return [
            savedPost,
            ...current,
          ];
        });
      } else {
        await loadPosts();
      }

      setSuccess(
        isEditing
          ? "Blog post updated successfully."
          : "Blog post created successfully."
      );

      setTimeout(() => {
        setShowModal(false);
        setEditingPost(null);
        resetForm();
        setSuccess("");
      }, 900);
    } catch (err) {
      console.error(
        "Save blog post error:",
        err
      );

      setError(
        err.message ||
          "Unable to save blog post."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE POST
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (post) => {
    const confirmed =
      window.confirm(
        `Delete "${post.title}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/blog/${post._id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to delete blog post."
        );
      }

      setPosts((current) =>
        current.filter(
          (item) =>
            item._id !== post._id
        )
      );

      setSuccess(
        "Blog post deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "Delete blog post error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete blog post."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  const getStatus = (post) => {
    if (post.status) {
      return String(
        post.status
      ).toLowerCase();
    }

    return post.published
      ? "published"
      : "draft";
  };

  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <section className="admin-blog-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-blog-header">
        <div>
          <span className="admin-blog-eyebrow">
            <FiFileText />
            Content management
          </span>

          <h1>Blog & Journal</h1>

          <p>
            Create, edit, publish and manage
            travel stories for the JNI Tours
            journal.
          </p>
        </div>

        <button
          type="button"
          className="admin-blog-create"
          onClick={openCreateModal}
        >
          <FiPlus />
          New article
        </button>
      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="admin-blog-alert error">
          {error}

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <FiX />
          </button>
        </div>
      )}

      {success && (
        <div className="admin-blog-alert success">
          {success}
        </div>
      )}

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="admin-blog-toolbar">
        <div className="admin-blog-search">
          <FiSearch />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search articles..."
          />
        </div>

        <div className="admin-blog-toolbar-actions">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All articles
            </option>

            <option value="published">
              Published
            </option>

            <option value="draft">
              Drafts
            </option>
          </select>

          <button
            type="button"
            className="admin-blog-refresh"
            onClick={loadPosts}
            disabled={loading}
          >
            <FiRefreshCw
              className={
                loading
                  ? "is-spinning"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="admin-blog-stats">
        <div>
          <span>Total articles</span>
          <strong>{posts.length}</strong>
        </div>

        <div>
          <span>Published</span>

          <strong>
            {
              posts.filter(
                (post) =>
                  getStatus(post) ===
                  "published"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Drafts</span>

          <strong>
            {
              posts.filter(
                (post) =>
                  getStatus(post) ===
                  "draft"
              ).length
            }
          </strong>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="admin-blog-state">
          <div className="admin-blog-spinner" />

          <h2>
            Loading articles...
          </h2>

          <p>
            Please wait while we retrieve
            the blog content.
          </p>
        </div>
      ) : filteredPosts.length === 0 ? (
        /* ===================================================
            EMPTY
        =================================================== */

        <div className="admin-blog-state">
          <div className="admin-blog-state-icon">
            <FiFileText />
          </div>

          <h2>
            {search ||
            statusFilter !== "all"
              ? "No matching articles"
              : "No blog articles yet"}
          </h2>

          <p>
            {search ||
            statusFilter !== "all"
              ? "Try changing your search or filter."
              : "Create your first journal article to get started."}
          </p>

          {!search &&
            statusFilter === "all" && (
              <button
                type="button"
                onClick={openCreateModal}
                className="admin-blog-empty-button"
              >
                <FiPlus />
                Create article
              </button>
            )}
        </div>
      ) : (
        /* ===================================================
            TABLE
        =================================================== */

        <div className="admin-blog-table-card">
          <div className="admin-blog-table-wrapper">
            <table className="admin-blog-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPosts.map(
                  (post) => {
                    const status =
                      getStatus(post);

                    return (
                      <tr
                        key={
                          post._id ||
                          post.id ||
                          post.slug
                        }
                      >
                        {/* ARTICLE */}

                        <td>
                          <div className="admin-blog-post">
                            <div className="admin-blog-post-image">
                              {post.image ? (
                                <img
                                  src={
                                    post.image
                                  }
                                  alt={
                                    post.title
                                  }
                                />
                              ) : (
                                <FiFileText />
                              )}
                            </div>

                            <div className="admin-blog-post-info">
                              <strong>
                                {post.title}
                              </strong>

                              <span>
                                /blog/
                                {
                                  post.slug
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY */}

                        <td>
                          <span className="admin-blog-category">
                            {post.category ||
                              "Uncategorized"}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`admin-blog-status ${status}`}
                          >
                            <i />
                            {status ===
                            "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </td>

                        {/* DATE */}

                        <td>
                          <span className="admin-blog-date">
                            {formatDate(
                              post.publishedAt ||
                                post.createdAt
                            )}
                          </span>
                        </td>

                        {/* FEATURED */}

                        <td>
                          <span
                            className={`admin-blog-featured ${
                              post.featured
                                ? "yes"
                                : "no"
                            }`}
                          >
                            {post.featured
                              ? "Featured"
                              : "—"}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="admin-blog-actions">
                            {post.slug && (
                              <Link
                                to={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="admin-blog-action view"
                                title="View article"
                              >
                                <FiEye />
                              </Link>
                            )}

                            <button
                              type="button"
                              className="admin-blog-action edit"
                              onClick={() =>
                                openEditModal(
                                  post
                                )
                              }
                              title="Edit article"
                            >
                              <FiEdit3 />
                            </button>

                            <button
                              type="button"
                              className="admin-blog-action delete"
                              onClick={() =>
                                handleDelete(
                                  post
                                )
                              }
                              title="Delete article"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="admin-blog-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="admin-blog-modal">
            {/* MODAL HEADER */}

            <div className="admin-blog-modal-header">
              <div>
                <span>
                  {editingPost
                    ? "Edit article"
                    : "Create article"}
                </span>

                <h2>
                  {editingPost
                    ? "Update journal story"
                    : "New journal story"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="admin-blog-modal-close"
              >
                <FiX />
              </button>
            </div>

            {/* FORM */}

            <form
              className="admin-blog-form"
              onSubmit={handleSubmit}
            >
              <div className="admin-blog-form-grid">
                <label>
                  Title
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={
                      handleChange
                    }
                    placeholder="Article title"
                    maxLength={180}
                    required
                  />
                </label>

                <label>
                  Category
                  <input
                    type="text"
                    name="category"
                    value={
                      form.category
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Safari Guide"
                    maxLength={80}
                    required
                  />
                </label>
              </div>

              <label>
                Slug

                <div className="admin-blog-slug-field">
                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={
                      handleChange
                    }
                    placeholder="article-url-slug"
                  />

                  <button
                    type="button"
                    onClick={
                      generateSlug
                    }
                  >
                    Generate
                  </button>
                </div>
              </label>

              <label>
                Image URL
                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                />
              </label>

              <div className="admin-blog-form-grid">
                <label>
                  Read time
                  <input
                    type="text"
                    name="readTime"
                    value={
                      form.readTime
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="6 min read"
                    maxLength={40}
                  />
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={
                      handleChange
                    }
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>
                  </select>
                </label>
              </div>

              <label>
                Excerpt
                <textarea
                  name="excerpt"
                  value={
                    form.excerpt
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Short description of the article..."
                  rows={4}
                  maxLength={500}
                  required
                />
              </label>

              <label>
                Article content
                <textarea
                  name="content"
                  value={
                    form.content
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Write the full article..."
                  rows={12}
                  required
                />
              </label>

              <label className="admin-blog-featured-toggle">
                <input
                  type="checkbox"
                  name="featured"
                  checked={
                    form.featured
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  <strong>
                    Featured article
                  </strong>

                  <small>
                    Highlight this article
                    in the journal.
                  </small>
                </span>
              </label>

              {error && (
                <div className="admin-blog-form-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="admin-blog-form-success">
                  {success}
                </div>
              )}

              {/* FORM ACTIONS */}

              <div className="admin-blog-form-actions">
                <button
                  type="button"
                  className="admin-blog-cancel"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-blog-save"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="admin-blog-button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingPost
                        ? "Update article"
                        : "Create article"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminBlog;