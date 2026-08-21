import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiClock,
  FiMapPin,
  FiRefreshCw,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

import blogPosts from "../../data/blogPosts";

import "./BlogDetails.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/*
|--------------------------------------------------------------------------
| STATIC ARTICLE DETAILS
|--------------------------------------------------------------------------
|
| These are kept for the original hardcoded JNI Tours articles.
| Admin-created MongoDB articles are loaded from the API.
|--------------------------------------------------------------------------
*/

const articles = [
  {
    slug: "best-time-to-visit-masai-mara",
    category: "Safari Guide",
    title: "The Best Time to Visit the Masai Mara",
    date: "August 10, 2026",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=85",
    intro:
      "The Masai Mara is one of Africa's most remarkable wildlife destinations. While wildlife can be seen throughout the year, each season offers a different experience.",
    sections: [
      {
        title:
          "July to October — The Great Migration",
        text:
          "This is one of the most popular periods to visit the Masai Mara. Millions of wildebeest, zebra and other grazing animals move through the ecosystem during the Great Migration. The dramatic river crossings can also occur during this period, although wildlife movements are naturally unpredictable.",
      },
      {
        title:
          "January to March — Green Season",
        text:
          "The beginning of the year can offer excellent game viewing with fewer visitors. The landscape is often beautifully green, and many animals remain active across the reserve.",
      },
      {
        title:
          "April to June — Quiet Adventures",
        text:
          "The wetter months bring fewer tourists and lush scenery. If you prefer a quieter safari and don't mind occasional rain, this can be an excellent time to experience the Mara at a slower pace.",
      },
      {
        title:
          "What should you choose?",
        text:
          "There is no single perfect month for everyone. If witnessing the migration is your priority, consider the peak migration season. If you prefer fewer crowds and potentially better value, the quieter seasons may suit you better.",
      },
    ],
  },

  {
    slug: "ultimate-east-africa-safari-guide",
    category: "Travel Guide",
    title:
      "The Ultimate East Africa Safari Guide",
    date: "August 5, 2026",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=85",
    intro:
      "Planning your first East African safari can feel overwhelming. With the right route and preparation, however, the experience can be remarkably simple.",
    sections: [
      {
        title: "Choose your destinations",
        text:
          "Kenya and Tanzania offer some of the most celebrated safari experiences in East Africa. Your choice should depend on the wildlife, landscapes and experiences you want to prioritize.",
      },
      {
        title:
          "Think about the length of your trip",
        text:
          "A few days can provide an excellent introduction, while longer journeys allow you to combine several parks and landscapes without rushing between destinations.",
      },
      {
        title: "Travel with flexibility",
        text:
          "Wildlife does not follow a timetable. Keeping some flexibility in your itinerary allows your guide to respond to wildlife movements and changing conditions.",
      },
    ],
  },

  {
    slug: "zanzibar-travel-guide",
    category: "Beach Escape",
    title:
      "A Complete Guide to Zanzibar",
    date: "July 28, 2026",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=1600&q=85",
    intro:
      "Zanzibar combines beautiful beaches, fascinating history, local culture and unforgettable island experiences.",
    sections: [
      {
        title: "Explore Stone Town",
        text:
          "Stone Town is the cultural heart of Zanzibar. Its narrow streets, historic buildings and lively markets make it worth exploring before heading to the coast.",
      },
      {
        title: "Relax on the beaches",
        text:
          "The island is famous for its white-sand beaches and clear turquoise waters. Different coastal areas offer different atmospheres, from lively resorts to quieter escapes.",
      },
      {
        title:
          "Combine safari and beach",
        text:
          "One of the best ways to experience Tanzania is to combine a wildlife safari with several relaxing days in Zanzibar.",
      },
    ],
  },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatDate(date) {
  if (!date) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(new Date(date));
  } catch {
    return "";
  }
}

function normalizeStaticPost(post, index) {
  return {
    ...post,

    id:
      post.id ||
      post._id ||
      `static-${index}`,

    slug: post.slug,

    title:
      post.title ||
      "Untitled story",

    category:
      post.category ||
      "Travel",

    date:
      post.date ||
      post.publishedAt ||
      post.createdAt ||
      "",

    readTime:
      post.readTime ||
      "5 min read",

    image:
      post.image ||
      "",

    intro:
      post.intro ||
      post.excerpt ||
      "",

    sections:
      Array.isArray(post.sections)
        ? post.sections
        : [],
  };
}

function normalizeDatabasePost(post) {
  return {
    ...post,

    id:
      post._id ||
      post.id ||
      post.slug,

    slug:
      post.slug,

    title:
      post.title ||
      "Untitled story",

    category:
      post.category ||
      "Travel",

    date:
      post.publishedAt ||
      post.createdAt ||
      "",

    readTime:
      post.readTime ||
      "5 min read",

    image:
      post.image ||
      "",

    intro:
      post.excerpt ||
      "",

    content:
      post.content ||
      "",

    sections: [],
  };
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function BlogDetails() {
  const { slug } = useParams();

  const [databaseArticle, setDatabaseArticle] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | STATIC ARTICLES FROM ORIGINAL BLOG DATA
  |--------------------------------------------------------------------------
  */

  const staticArticles = useMemo(() => {
    const permanentArticles = articles.map(
      (article) => ({
        ...article,
        source: "static",
      })
    );

    const blogDataArticles =
      Array.isArray(blogPosts)
        ? blogPosts.map(
            normalizeStaticPost
          )
        : [];

    return [
      ...permanentArticles,
      ...blogDataArticles,
    ];
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD DATABASE ARTICLE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadArticle = async () => {
      try {
        setLoading(true);
        setError("");
        setDatabaseArticle(null);

        const response = await fetch(
          `${API_URL}/api/blog/${encodeURIComponent(
            slug
          )}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          /*
          |------------------------------------------------------------------
          | 404 is not necessarily an error.
          | It may simply mean this is one of our original static articles.
          |------------------------------------------------------------------
          */

          if (response.status === 404) {
            if (!cancelled) {
              setDatabaseArticle(null);
            }

            return;
          }

          throw new Error(
            data.message ||
              "Unable to load this article."
          );
        }

        if (
          !data.success ||
          !data.post
        ) {
          throw new Error(
            data.message ||
              "Article not found."
          );
        }

        if (!cancelled) {
          setDatabaseArticle(
            normalizeDatabasePost(
              data.post
            )
          );
        }
      } catch (requestError) {
        console.error(
          "Load blog article error:",
          requestError
        );

        if (!cancelled) {
          setError(
            requestError.message ||
              "Unable to load this article."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      loadArticle();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /*
  |--------------------------------------------------------------------------
  | FIND STATIC ARTICLE
  |--------------------------------------------------------------------------
  */

  const staticArticle =
    staticArticles.find(
      (item) =>
        item.slug === slug
    );

  /*
  |--------------------------------------------------------------------------
  | DATABASE ARTICLE TAKES PRIORITY
  |--------------------------------------------------------------------------
  */

  const article =
    databaseArticle ||
    staticArticle;

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="blog-details-not-found">
        <FiRefreshCw
          className="blog-details-loading-icon"
        />

        <h1>
          Loading story...
        </h1>

        <p>
          We're fetching this travel story
          for you.
        </p>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | API ERROR
  |--------------------------------------------------------------------------
  |
  | If the API fails but a static article exists,
  | continue showing the static article.
  |--------------------------------------------------------------------------
  */

  if (error && !article) {
    return (
      <main className="blog-details-not-found">
        <FiMapPin />

        <h1>
          Unable to load article
        </h1>

        <p>
          {error}
        </p>

        <Link to="/blog">
          <FiArrowLeft />
          Back to journal
        </Link>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ARTICLE NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!article) {
    return (
      <main className="blog-details-not-found">
        <FiMapPin />

        <h1>
          Article not found
        </h1>

        <p>
          The story you're looking for
          doesn't exist or may have been
          removed.
        </p>

        <Link to="/blog">
          <FiArrowLeft />
          Back to journal
        </Link>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DATABASE CONTENT RENDERING
  |--------------------------------------------------------------------------
  */

  const isDatabaseArticle =
    Boolean(databaseArticle);

  const articleDate =
    isDatabaseArticle
      ? formatDate(article.date)
      : article.date;

  /*
  |--------------------------------------------------------------------------
  | DATABASE ARTICLE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="blog-details-page">
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="blog-details-hero">
        <div className="container">
          <Link
            to="/blog"
            className="blog-details-back"
          >
            <FiArrowLeft />
            Back to journal
          </Link>

          <div className="blog-details-heading">
            <span>
              {article.category}
            </span>

            <h1>
              {article.title}
            </h1>

            <div className="blog-details-meta">
              <span>
                {articleDate}
              </span>

              <span>
                <FiClock />
                {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          COVER IMAGE
      ========================================================= */}

      <section className="blog-details-cover">
        <div className="container">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <div
              className="blog-details-cover-placeholder"
              aria-label="No article image"
            />
          )}
        </div>
      </section>

      {/* =========================================================
          ARTICLE CONTENT
      ========================================================= */}

      <section className="blog-details-content">
        <div className="container">
          <article>
            {/* =====================================================
                INTRO / EXCERPT
            ===================================================== */}

            {article.intro && (
              <p className="blog-details-intro">
                {article.intro}
              </p>
            )}

            {/* =====================================================
                DATABASE CONTENT
            ===================================================== */}

            {isDatabaseArticle ? (
              <div className="blog-details-database-content">
                {article.content
                  ?.split(/\n+/)
                  .filter(
                    (paragraph) =>
                      paragraph.trim()
                  )
                  .map(
                    (
                      paragraph,
                      index
                    ) => (
                      <p
                        key={index}
                      >
                        {paragraph.trim()}
                      </p>
                    )
                  )}
              </div>
            ) : (
              /* ===================================================
                  STATIC ARTICLE SECTIONS
              =================================================== */

              Array.isArray(
                article.sections
              ) &&
              article.sections.map(
                (section) => (
                  <section
                    key={
                      section.title
                    }
                    className="blog-details-section"
                  >
                    <h2>
                      {
                        section.title
                      }
                    </h2>

                    <p>
                      {
                        section.text
                      }
                    </p>
                  </section>
                )
              )
            )}

            {/* =====================================================
                CTA
            ===================================================== */}

            <div className="blog-details-cta">
              <div>
                <span>
                  Ready to explore?
                </span>

                <h2>
                  Your next African
                  adventure starts here.
                </h2>

                <p>
                  Explore our carefully
                  designed journeys
                  across East Africa.
                </p>
              </div>

              <Link to="/tours">
                Explore our tours
                <FiArrowUpRight />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default BlogDetails;