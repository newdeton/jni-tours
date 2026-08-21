import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import featuredTours from "../../../data/featuredTours";

import TourCard from "./TourCard";

import "./FeaturedTours.css";

function FeaturedTours() {
  return (
    <section className="featured-tours">
      <div className="container">
        <div className="section-heading featured-tours-heading">
          <div>
            <span>Curated Journeys</span>

            <h2>
              Experiences worth
              <em> travelling for.</em>
            </h2>
          </div>

          <Link
            to="/tours"
            className="section-heading-link"
          >
            View All Tours
            <FiArrowRight />
          </Link>
        </div>

        <div className="featured-tours-grid">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedTours;