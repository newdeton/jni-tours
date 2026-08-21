import {
  FiChevronDown,
  FiFilter,
  FiRotateCcw,
  FiSearch,
  FiX,
} from "react-icons/fi";

import "./TourFilters.css";

function TourFilters({
  filters,
  setFilters,
  onClear,
  mobileOpen,
  setMobileOpen,
}) {
  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  return (
    <>
      <button
        className="mobile-filter-button"
        type="button"
        onClick={() => setMobileOpen(true)}
      >
        <FiFilter />
        Filters
      </button>

      <aside
        className={`tour-filters ${
          mobileOpen ? "tour-filters-open" : ""
        }`}
      >
        <div className="tour-filters-header">
          <div>
            <span>Refine</span>
            <h3>Find your journey</h3>
          </div>

          <button
            type="button"
            className="tour-filters-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close filters"
          >
            <FiX />
          </button>
        </div>

        <div className="tour-filter-search">
          <FiSearch />

          <input
            type="search"
            placeholder="Search tours..."
            value={filters.search}
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
          />
        </div>

        <div className="tour-filter-group">
          <label htmlFor="destination">
            Destination
          </label>

          <div className="tour-select">
            <select
              id="destination"
              value={filters.destination}
              onChange={(event) =>
                updateFilter(
                  "destination",
                  event.target.value
                )
              }
            >
              <option value="all">All destinations</option>
              <option value="Kenya">Kenya</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Zanzibar">Zanzibar</option>
              <option value="Uganda">Uganda</option>
              <option value="Rwanda">Rwanda</option>
            </select>

            <FiChevronDown />
          </div>
        </div>

        <div className="tour-filter-group">
          <label htmlFor="category">
            Tour type
          </label>

          <div className="tour-select">
            <select
              id="category"
              value={filters.category}
              onChange={(event) =>
                updateFilter(
                  "category",
                  event.target.value
                )
              }
            >
              <option value="all">All tour types</option>
              <option value="Wildlife Safari">
                Wildlife Safari
              </option>
              <option value="Luxury Safari">
                Luxury Safari
              </option>
              <option value="Beach Escape">
                Beach Escape
              </option>
              <option value="Adventure">
                Adventure
              </option>
              <option value="Cultural">
                Cultural
              </option>
            </select>

            <FiChevronDown />
          </div>
        </div>

        <div className="tour-filter-group">
          <label htmlFor="duration">
            Duration
          </label>

          <div className="tour-select">
            <select
              id="duration"
              value={filters.duration}
              onChange={(event) =>
                updateFilter(
                  "duration",
                  event.target.value
                )
              }
            >
              <option value="all">Any duration</option>
              <option value="short">
                1–3 days
              </option>
              <option value="medium">
                4–6 days
              </option>
              <option value="long">
                7+ days
              </option>
            </select>

            <FiChevronDown />
          </div>
        </div>

        <div className="tour-filter-group">
          <label htmlFor="style">
            Travel style
          </label>

          <div className="tour-select">
            <select
              id="style"
              value={filters.style}
              onChange={(event) =>
                updateFilter(
                  "style",
                  event.target.value
                )
              }
            >
              <option value="all">All styles</option>
              <option value="Budget">Budget</option>
              <option value="Comfort">Comfort</option>
              <option value="Luxury">Luxury</option>
              <option value="Private">Private</option>
              <option value="Group">Group</option>
            </select>

            <FiChevronDown />
          </div>
        </div>

        <div className="tour-filter-group">
          <div className="tour-filter-price-heading">
            <label htmlFor="maxPrice">
              Maximum price
            </label>

            <strong>
              ${filters.maxPrice.toLocaleString()}
            </strong>
          </div>

          <input
  id="maxPrice"
  className="tour-price-range"
  type="range"
  min="300"
  max="5000"
  step="100"
  value={filters.maxPrice}
  onChange={(event) =>
    updateFilter(
      "maxPrice",
      Number(event.target.value)
    )
  }
/>

          <div className="tour-price-labels">
            <span>$300</span>
            <span>$5,000+</span>
          </div>
        </div>

        <button
          type="button"
          className="tour-clear-filters"
          onClick={() => {
            onClear();
            setMobileOpen(false);
          }}
        >
          <FiRotateCcw />
          Clear all filters
        </button>
      </aside>

      {mobileOpen && (
        <button
          className="tour-filters-backdrop"
          type="button"
          aria-label="Close filters"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

export default TourFilters;