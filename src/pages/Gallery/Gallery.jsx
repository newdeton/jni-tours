import { useEffect, useMemo, useState } from "react";
import {
  FiArrowUpRight,
  FiCamera,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

import "./Gallery.css";

const galleryImages = [
  {
    id: 1,
    category: "Safari",
    title: "Wild Africa",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 2,
    category: "Wildlife",
    title: "Into the Wild",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 3,
    category: "Safari",
    title: "Golden Savannah",
    image:
      "https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 4,
    category: "Beach",
    title: "Zanzibar Blue",
    image:
      "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 5,
    category: "Landscape",
    title: "African Horizons",
    image:
      "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 6,
    category: "Wildlife",
    title: "The Great Migration",
    image:
      "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 7,
    category: "Safari",
    title: "Safari Morning",
    image:
      "https://images.unsplash.com/photo-1534567110243-8875d64ca8ff?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 8,
    category: "Beach",
    title: "Island Escape",
    image:
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1400&q=85",
  },
  {
    id: 9,
    category: "Landscape",
    title: "Beyond the Plains",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=85",
  },
];

const categories = [
  "All",
  "Safari",
  "Wildlife",
  "Beach",
  "Landscape",
];

function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredImages = useMemo(() => {
    if (activeCategory === "All") {
      return galleryImages;
    }

    return galleryImages.filter(
      (image) => image.category === activeCategory
    );
  }, [activeCategory]);

  const selectedIndex = selectedImage
    ? filteredImages.findIndex(
        (image) => image.id === selectedImage.id
      )
    : -1;

  const showPrevious = () => {
    if (selectedIndex === -1) return;

    const previousIndex =
      selectedIndex === 0
        ? filteredImages.length - 1
        : selectedIndex - 1;

    setSelectedImage(filteredImages[previousIndex]);
  };

  const showNext = () => {
    if (selectedIndex === -1) return;

    const nextIndex =
      selectedIndex === filteredImages.length - 1
        ? 0
        : selectedIndex + 1;

    setSelectedImage(filteredImages[nextIndex]);
  };

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [selectedImage, selectedIndex]);

  return (
    <main className="gallery-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="gallery-hero">
        <div className="container">
          <div className="gallery-hero-content">

            <span>
              <FiCamera />
              The JNI collection
            </span>

            <h1>
              Moments worth
              <em> remembering.</em>
            </h1>

            <p>
              A glimpse into the landscapes, wildlife,
              people, and experiences that make every JNI
              journey unforgettable.
            </p>

          </div>
        </div>
      </section>


      {/* =====================================================
          GALLERY CONTENT
      ===================================================== */}

      <section className="gallery-content">
        <div className="container">

          <div className="gallery-heading">
            <div>
              <span>Travel stories</span>

              <h2>
                See the world
                <em> through our eyes.</em>
              </h2>
            </div>

            <p>
              Explore moments captured across Kenya,
              Tanzania, and the unforgettable places in
              between.
            </p>
          </div>


          {/* =================================================
              FILTERS
          ================================================= */}

          <div
            className="gallery-filters"
            role="tablist"
            aria-label="Gallery categories"
          >
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  activeCategory === category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveCategory(category)
                }
                aria-selected={
                  activeCategory === category
                }
                role="tab"
              >
                {category}
              </button>
            ))}
          </div>


          {/* =================================================
              GRID
          ================================================= */}

          {filteredImages.length > 0 ? (
            <div className="gallery-grid">
              {filteredImages.map((item, index) => (
                <button
                  type="button"
                  className={`gallery-item gallery-item-${
                    index % 5
                  }`}
                  key={item.id}
                  onClick={() =>
                    setSelectedImage(item)
                  }
                  aria-label={`Open ${item.title}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading={
                      index > 2 ? "lazy" : "eager"
                    }
                  />

                  <div className="gallery-item-overlay">
                    <span>{item.category}</span>

                    <h3>{item.title}</h3>

                    <FiArrowUpRight />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <FiCamera />

              <h3>No images found</h3>

              <p>
                There are no gallery moments in this
                category yet.
              </p>
            </div>
          )}

        </div>
      </section>


      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      {selectedImage && (
        <div
          className="gallery-lightbox"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
        >

          <button
            type="button"
            className="gallery-lightbox-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image"
          >
            <FiX />
          </button>


          <button
            type="button"
            className="gallery-lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Previous image"
          >
            <FiChevronLeft />
          </button>


          <div
            className="gallery-lightbox-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
            />

            <div className="gallery-lightbox-info">
              <span>
                {selectedImage.category}
              </span>

              <h2>{selectedImage.title}</h2>

              <small>
                {selectedIndex + 1} /{" "}
                {filteredImages.length}
              </small>
            </div>
          </div>


          <button
            type="button"
            className="gallery-lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Next image"
          >
            <FiChevronRight />
          </button>

        </div>
      )}

    </main>
  );
}

export default Gallery;