import { FiCheckCircle, FiStar } from "react-icons/fi";

import testimonials from "../../../data/testimonials";

import "./Testimonials.css";

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials-heading">
          <div>
            <span className="testimonials-eyebrow">
              Traveler Stories
            </span>

            <h2>
              Journeys remembered
              <em> for a lifetime.</em>
            </h2>
          </div>

          <div className="testimonials-rating">
            <div className="testimonials-rating-score">
              <strong>4.9</strong>

              <div>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar key={star} />
                  ))}
                </div>

                <span>Based on traveler experiences</span>
              </div>
            </div>
          </div>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <article
              className="testimonial-card"
              key={testimonial.id}
            >
              <div className="testimonial-top">
                <div className="testimonial-stars">
                  {Array.from(
                    { length: testimonial.rating },
                    (_, index) => (
                      <FiStar key={index} />
                    )
                  )}
                </div>

                <span className="testimonial-verified">
                  <FiCheckCircle />
                  Verified traveler
                </span>
              </div>

              <blockquote>
                “{testimonial.review}”
              </blockquote>

              <div className="testimonial-footer">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                />

                <div>
                  <strong>{testimonial.name}</strong>

                  <span>
                    {testimonial.country} · {testimonial.trip}
                  </span>

                  <small>{testimonial.date}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;