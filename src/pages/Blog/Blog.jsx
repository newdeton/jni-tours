import { useEffect, useMemo, useState } from "react";
import {
  FiArrowUpRight,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import blogPosts from "../../data/blogPosts";

import "./Blog.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function Blog() {
  const [databasePosts, setDatabasePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD PUBLISHED DATABASE POSTS
  |--------------------------------------------------------------------------
  */

  const loadDatabasePosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/blog`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Unable to load blog posts.`
        );
      }

      setDatabasePosts(
        Array.isArray(data.posts)
          ? data.posts
          : []
      );
    } catch (error) {
      console.error(
        "Load public blog posts error:",
        error
      );

      setError(
        error.message ||
          "Unable to load the latest journal stories."
      );

      setDatabasePosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabasePosts();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE STATIC POSTS
  |--------------------------------------------------------------------------
  |
  | Static posts may use:
  |   id
  |   date
  |
  | Database posts use:
  |   _id
  |   createdAt
  |   publishedAt
  |
  | Normalize both into one structure.
  |--------------------------------------------------------------------------
  */

  const staticPosts = useMemo(() => {
    if (!Array.isArray(blogPosts)) {
      return [];
    }

    return blogPosts.map((post, index) => ({
      ...post,

      id:
        post.id ||
        post._id ||
        `static-${index}`,

      slug: post.slug,

      title: post.title || "Untitled story",

      category:
        post.category ||
        "Travel",

      excerpt:
        post.excerpt ||
        "",

      content:
        post.content ||
        "",

      image:
        post.image ||
        "",

      readTime:
        post.readTime ||
        "5 min read",

      date:
        post.date ||
        post.publishedAt ||
        post.createdAt ||
        "",
    }));
  }, []);

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE DATABASE POSTS
  |--------------------------------------------------------------------------
  */

  const normalizedDatabasePosts = useMemo(() => {
    return databasePosts.map((post) => ({
      ...post,

      id:
        post._id ||
        post.id ||
        post.slug,

      slug: post.slug,

      title:
        post.title ||
        "Untitled story",

      category:
        post.category ||
        "Travel",

      excerpt:
        post.excerpt ||
        "",

      content:
        post.content ||
        "",

      image:
        post.image ||
        "",

      readTime:
        post.readTime ||
        "5 min read",

      date:
        post.publishedAt ||
        post.createdAt ||
        "",
    }));
  }, [databasePosts]);

  /*
  |--------------------------------------------------------------------------
  | COMBINE POSTS
  |--------------------------------------------------------------------------
  |
  | Database posts appear first.
  |
  | This means newly published admin articles immediately appear
  | at the top of the public journal.
  |--------------------------------------------------------------------------
  */

  const posts = useMemo(() => {
    const combined = [
      ...normalizedDatabasePosts,
      ...staticPosts,
    ];

    /*
    |----------------------------------------------------------------------
    | Remove duplicate slugs
    |----------------------------------------------------------------------
    */

    const seen = new Set();

    return combined.filter((post) => {
      if (!post.slug) {
        return true;
      }

      if (seen.has(post.slug)) {
        return false;
      }

      seen.add(post.slug);

      return true;
    });
  }, [
    normalizedDatabasePosts,
    staticPosts,
  ]);

  /*
  |--------------------------------------------------------------------------
  | FEATURED POST
  |--------------------------------------------------------------------------
  |
  | Prefer a database post explicitly marked featured.
  | Otherwise use the first available post.
  |--------------------------------------------------------------------------
  */

  const featuredPost =
    normalizedDatabasePosts.find(
      (post) => post.featured === true
    ) ||
    posts[0];

  /*
  |--------------------------------------------------------------------------
  | REMAINING POSTS
  |--------------------------------------------------------------------------
  */

  const remainingPosts = posts.filter(
    (post) =>
      post.id !== featuredPost?.id
  );

  /*
  |--------------------------------------------------------------------------
  | DATE FORMATTER
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    try {
      return new Intl.DateTimeFormat(
        "en-GB",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      ).format(new Date(date));
    } catch {
      return "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGE FALLBACK
  |--------------------------------------------------------------------------
  */

  const getImage = (post) => {
    if (
      typeof post.image === "string" &&
      post.image.trim()
    ) {
      return post.image;
    }

    return "/images/blog/default-blog.jpg";
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="blog-page">
        <section className="blog-hero">
          <div className="container">
            <div className="blog-hero-content">
              <span>JNI Tours Journal</span>

              <h1>
                Stories from
                <em> the wild.</em>
              </h1>

              <p>
                Travel inspiration, safari guides,
                destination stories, and practical tips
                for your next East African adventure.
              </p>
            </div>
          </div>
        </section>

        <section className="blog-list">
          <div className="container">
            <div className="blog-empty">
              <FiRefreshCw
                className="blog-loading-icon"
              />

              <h2>Loading stories...</h2>

              <p>
                Fetching the latest travel stories
                from JNI Tours.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="blog-page">
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="blog-hero">
        <div className="container">
          <div className="blog-hero-content">
            <span>JNI Tours Journal</span>

            <h1>
              Stories from
              <em> the wild.</em>
            </h1>

            <p>
              Travel inspiration, safari guides,
              destination stories, and practical tips
              for your next East African adventure.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          API ERROR
      ========================================================= */}

      {error && (
        <section className="blog-list">
          <div className="container">
            <div className="blog-empty">
              <h2>
                We couldn't load the latest stories.
              </h2>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={loadDatabasePosts}
                className="blog-retry-button"
              >
                <FiRefreshCw />
                Try again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          FEATURED STORY
      ========================================================= */}

      {featuredPost && !error && (
        <section className="blog-featured">
          <div className="container">
            <div className="blog-section-label">
              {featuredPost.featured
                ? "Featured story"
                : "Latest story"}
            </div>

            <article className="blog-featured-card">
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="blog-featured-image"
              >
                <img
                  src={getImage(featuredPost)}
                  alt={featuredPost.title}
                  loading="eager"
                  onError={(event) => {
                    event.currentTarget.src =
                      "/images/blog/default-blog.jpg";
                  }}
                />
              </Link>

              <div className="blog-featured-content">
                <span className="blog-category">
                  {featuredPost.category}
                </span>

                <h2>
                  {featuredPost.title}
                </h2>

                <p>
                  {featuredPost.excerpt}
                </p>

                <div className="blog-post-meta">
                  <span>
                    {formatDate(
                      featuredPost.date
                    )}
                  </span>

                  <span>
                    <FiClock />
                    {featuredPost.readTime}
                  </span>
                </div>

                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="blog-read-more"
                >
                  Read story
                  <FiArrowUpRight />
                </Link>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* =========================================================
          JOURNAL POSTS
      ========================================================= */}

      {remainingPosts.length > 0 &&
        !error && (
          <section className="blog-list">
            <div className="container">
              <div className="blog-list-heading">
                <div>
                  <span>
                    From the journal
                  </span>

                  <h2>
                    Travel inspiration
                  </h2>
                </div>
              </div>

              <div className="blog-grid">
                {remainingPosts.map(
                  (post) => (
                    <article
                      className="blog-card"
                      key={
                        post.id ||
                        post.slug
                      }
                    >
                      <Link
                        to={`/blog/${post.slug}`}
                        className="blog-card-image"
                      >
                        <img
                          src={getImage(post)}
                          alt={post.title}
                          loading="lazy"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              "/images/blog/default-blog.jpg";
                          }}
                        />

                        <span>
                          {post.category}
                        </span>
                      </Link>

                      <div className="blog-card-content">
                        <div className="blog-post-meta">
                          <span>
                            {formatDate(
                              post.date
                            )}
                          </span>

                          <span>
                            <FiClock />
                            {
                              post.readTime
                            }
                          </span>
                        </div>

                        <Link
                          to={`/blog/${post.slug}`}
                          className="blog-card-title"
                        >
                          {post.title}
                        </Link>

                        <p>
                          {post.excerpt}
                        </p>

                        <Link
                          to={`/blog/${post.slug}`}
                          className="blog-card-link"
                        >
                          Read article
                          <FiArrowUpRight />
                        </Link>
                      </div>
                    </article>
                  )
                )}
              </div>
            </div>
          </section>
        )}

      {/* =========================================================
          EMPTY STATE
      ========================================================= */}

      {!featuredPost &&
        !error && (
          <section className="blog-list">
            <div className="container">
              <div className="blog-empty">
                <h2>
                  No stories available yet.
                </h2>

                <p>
                  Check back soon for safari
                  guides, destination stories,
                  and travel inspiration from
                  JNI Tours.
                </p>
              </div>
            </div>
          </section>
        )}
    </main>
  );
}

export default Blog;