import { useState } from "react";
import {
  FiCalendar,
  FiMapPin,
  FiSearch,
  FiUsers,
} from "react-icons/fi";

import "./TourSearch.css";

function TourSearch() {
  const [destination, setDestination] = useState("");
  const [tourType, setTourType] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState(2);

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log({
      destination,
      tourType,
      date,
      travelers,
    });
  };

  return (
    <section className="tour-search">
      <div className="container">
        <div className="tour-search-card">
          <div className="tour-search-heading">
            <span>Plan Your Journey</span>
            <h2>Where will Africa take you?</h2>
          </div>

          <form
            className="tour-search-form"
            onSubmit={handleSubmit}
          >
            <div className="tour-search-field">
              <div className="tour-search-icon">
                <FiMapPin />
              </div>

              <div className="tour-search-input">
                <label htmlFor="destination">
                  Destination
                </label>

                <select
                  id="destination"
                  value={destination}
                  onChange={(event) =>
                    setDestination(event.target.value)
                  }
                >
                  <option value="">
                    Choose destination
                  </option>

                  <option value="kenya">Kenya</option>
                  <option value="tanzania">Tanzania</option>
                  <option value="uganda">Uganda</option>
                  <option value="rwanda">Rwanda</option>
                  <option value="zanzibar">Zanzibar</option>
                </select>
              </div>
            </div>

            <div className="tour-search-field">
              <div className="tour-search-icon">
                <FiCalendar />
              </div>

              <div className="tour-search-input">
                <label htmlFor="date">
                  Travel Date
                </label>

                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="tour-search-field">
              <div className="tour-search-icon">
                <FiMapPin />
              </div>

              <div className="tour-search-input">
                <label htmlFor="tour-type">
                  Experience
                </label>

                <select
                  id="tour-type"
                  value={tourType}
                  onChange={(event) =>
                    setTourType(event.target.value)
                  }
                >
                  <option value="">
                    Any experience
                  </option>

                  <option value="safari">
                    Wildlife Safari
                  </option>

                  <option value="beach">
                    Beach Escape
                  </option>

                  <option value="culture">
                    Culture & Heritage
                  </option>

                  <option value="adventure">
                    Adventure
                  </option>

                  <option value="gorilla">
                    Gorilla Trekking
                  </option>
                </select>
              </div>
            </div>

            <div className="tour-search-field">
              <div className="tour-search-icon">
                <FiUsers />
              </div>

              <div className="tour-search-input">
                <label htmlFor="travelers">
                  Travelers
                </label>

                <select
                  id="travelers"
                  value={travelers}
                  onChange={(event) =>
                    setTravelers(Number(event.target.value))
                  }
                >
                  {Array.from({ length: 12 }, (_, index) => {
                    const number = index + 1;

                    return (
                      <option key={number} value={number}>
                        {number}{" "}
                        {number === 1
                          ? "Traveler"
                          : "Travelers"}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="tour-search-button"
            >
              <FiSearch />
              <span>Search Tours</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default TourSearch;