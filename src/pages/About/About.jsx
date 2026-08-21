import {
  FiArrowRight,
  FiCompass,
  FiHeart,
  FiMapPin,
  FiShield,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import "./About.css";

function About() {
  return (
    <main className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <span>
              <FiCompass />
              The JNI Tours story
            </span>

            <h1>
              Travel deeper.
              <em> Experience more.</em>
            </h1>

            <p>
              We create unforgettable journeys across East Africa,
              connecting travelers with extraordinary wildlife,
              landscapes, cultures, and people.
            </p>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="about-story">
        <div className="container">
          <div className="about-story-grid">

            <div className="about-story-heading">
              <span>Who we are</span>

              <h2>
                More than a trip.
                <em> A story to tell.</em>
              </h2>
            </div>

            <div className="about-story-content">
              <p className="about-lead">
                JNI Tours was created for travelers who want to
                experience Africa beyond the ordinary.
              </p>

              <p>
                From the sweeping plains of the Masai Mara to
                the shores of Zanzibar, we design journeys that
                balance adventure, comfort, discovery, and
                authentic local experiences.
              </p>

              <p>
                Every itinerary is thoughtfully planned around
                the places, people, wildlife, and moments that
                make East Africa truly special.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="about-values">
        <div className="container">

          <div className="about-section-heading">
            <span>What guides us</span>

            <h2>
              Travel with
              <em> purpose.</em>
            </h2>

            <p>
              We believe the best journeys feel personal,
              meaningful, and effortless.
            </p>
          </div>

          <div className="about-values-grid">

            <article>
              <FiHeart />

              <h3>Authentic experiences</h3>

              <p>
                We go beyond sightseeing to create genuine
                connections with the destinations you visit.
              </p>
            </article>

            <article>
              <FiShield />

              <h3>Travel with confidence</h3>

              <p>
                Thoughtful planning, trusted partners, and
                dependable support from start to finish.
              </p>
            </article>

            <article>
              <FiUsers />

              <h3>People first</h3>

              <p>
                Our journeys are built around people, from
                local communities to the travelers we serve.
              </p>
            </article>

            <article>
              <FiStar />

              <h3>Exceptional standards</h3>

              <p>
                Every detail matters, from accommodation and
                guides to the moments you remember forever.
              </p>
            </article>

          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="about-destinations">
        <div className="container">
          <div className="about-destinations-grid">

            <div>
              <span>Our playground</span>

              <h2>
                Discover
                <em> East Africa.</em>
              </h2>

              <p>
                Wildlife, mountains, beaches, culture, and
                endless horizons — all waiting to be explored.
              </p>

              <Link to="/destinations">
                Explore destinations
                <FiArrowRight />
              </Link>
            </div>

            <div className="about-destination-list">

              <div>
                <FiMapPin />
                <strong>Kenya</strong>
                <span>Safari & wilderness</span>
              </div>

              <div>
                <FiMapPin />
                <strong>Tanzania</strong>
                <span>Safari & island escapes</span>
              </div>

              <div>
                <FiMapPin />
                <strong>Zanzibar</strong>
                <span>Coastal adventures</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* WHY JNI */}
      <section className="about-why">
        <div className="container">

          <div className="about-why-heading">
            <span>Why JNI Tours</span>

            <h2>
              Your journey.
              <em> Our commitment.</em>
            </h2>
          </div>

          <div className="about-why-grid">

            <article>
              <strong>01</strong>

              <h3>Thoughtfully designed</h3>

              <p>
                Every journey is carefully structured so you
                can spend less time planning and more time
                experiencing.
              </p>
            </article>

            <article>
              <strong>02</strong>

              <h3>Local knowledge</h3>

              <p>
                We understand the destinations we take you to
                and build experiences around what makes them
                remarkable.
              </p>
            </article>

            <article>
              <strong>03</strong>

              <h3>Made for memories</h3>

              <p>
                The goal isn't simply to visit somewhere.
                It's to return home with stories worth telling.
              </p>
            </article>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <div className="about-cta-content">

            <span>Your next chapter</span>

            <h2>
              Where will your
              <em> journey take you?</em>
            </h2>

            <p>
              Explore our carefully crafted tours and find
              the adventure that's right for you.
            </p>

            <Link to="/tours">
              Explore our tours
              <FiArrowRight />
            </Link>

          </div>
        </div>
      </section>

    </main>
  );
}

export default About;