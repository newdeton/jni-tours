import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiGlobe,
  FiMessageCircle,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import "./PlanJourney.css";

const benefits = [
  "Personalized itinerary",
  "Flexible travel dates",
  "Local expert guidance",
  "No obligation to book",
];

function PlanJourney() {
  return (
    <section className="plan-journey">
      <div className="container">
        <div className="plan-journey-card">
          <div className="plan-journey-content">
            <span className="plan-journey-eyebrow">
              <FiGlobe />
              Your journey starts here
            </span>

            <h2>
              Tell us where
              <br />
              you want to <em>go.</em>
            </h2>

            <p>
              Have a dream trip in mind but don't know where to
              start? Tell us what you're looking for and our travel
              specialists will help turn it into a journey designed
              around you.
            </p>

            <div className="plan-journey-benefits">
              {benefits.map((benefit) => (
                <span key={benefit}>
                  <FiCheck />
                  {benefit}
                </span>
              ))}
            </div>

            <div className="plan-journey-actions">
              <Link
                to="/plan-your-trip"
                className="plan-journey-primary"
              >
                Plan My Trip
                <FiArrowRight />
              </Link>

              <Link
                to="/contact"
                className="plan-journey-secondary"
              >
                <FiMessageCircle />
                Talk to an Expert
              </Link>
            </div>
          </div>

          <div className="plan-journey-visual">
            <img
              src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85"
              alt="African safari landscape"
            />

            <div className="plan-journey-visual-overlay" />

            <div className="plan-journey-floating">
              <FiCalendar />

              <div>
                <strong>Planning ahead?</strong>
                <span>
                  Start your journey whenever you're ready.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PlanJourney;