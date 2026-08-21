import { FiArrowUpRight, FiCompass } from "react-icons/fi";
import { Link } from "react-router-dom";

import destinations from "../../../data/destinations";

import "./DestinationsPreview.css";

function DestinationsPreview() {
  const featured = destinations.filter(
    (destination) => destination.featured
  );

  const additional = destinations.filter(
    (destination) => !destination.featured
  );

  return (
    <section className="destinations-preview">
      <div className="container">
        <div className="section-heading destinations-heading">
          <div>
            <span>
              <FiCompass />
              Explore East Africa
            </span>

            <h2>
              Go beyond the
              <em> expected.</em>
            </h2>
          </div>

          <p>
            From iconic safari destinations to tropical coastlines,
            discover the places that make East Africa unforgettable.
          </p>
        </div>

        <div className="destinations-featured">
          {featured.map((destination, index) => (
            <Link
              key={destination.id}
              to={`/destinations/${destination.id}`}
              className={`destination-feature destination-feature-${index + 1}`}
            >
              <img
                src={destination.image}
                alt={destination.name}
              />

              <div className="destination-overlay" />

              <div className="destination-content">
                <span>{destination.region}</span>

                <h3>{destination.name}</h3>

                <p>{destination.description}</p>

                <div className="destination-bottom">
                  <strong>
                    {destination.tours} journeys
                  </strong>

                  <span className="destination-arrow">
                    <FiArrowUpRight />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="destinations-additional">
          {additional.map((destination) => (
            <Link
              key={destination.id}
              to={`/destinations/${destination.id}`}
              className="destination-small"
            >
              <img
                src={destination.image}
                alt={destination.name}
              />

              <div className="destination-small-overlay" />

              <div className="destination-small-content">
                <span>{destination.region}</span>
                <h3>{destination.name}</h3>

                <div>
                  <strong>
                    {destination.tours} journeys
                  </strong>

                  <FiArrowUpRight />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DestinationsPreview;