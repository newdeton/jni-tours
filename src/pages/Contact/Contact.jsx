import { useState } from "react";
import {
  FiArrowRight,
  FiClock,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSend,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

import "./Contact.css";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const whatsappMessage = encodeURIComponent(
      `Hello JNI Tours,

Name: ${form.name}
Email: ${form.email}
Phone: ${form.phone}
Subject: ${form.subject}

Message:
${form.message}`
    );

    window.open(
      `https://wa.me/254101820500?text=${whatsappMessage}`,
      "_blank"
    );

    setSubmitted(true);
  };

  return (
    <main className="contact-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">

            <span>
              <FiMessageCircle />
              Let's talk
            </span>

            <h1>
              Your journey
              <em> starts here.</em>
            </h1>

            <p>
              Have a question about a safari, destination,
              or custom journey? Our team is ready to help
              you plan something unforgettable.
            </p>

          </div>
        </div>
      </section>


      {/* =====================================================
          CONTACT CONTENT
      ===================================================== */}

      <section className="contact-content">
        <div className="container">

          <div className="contact-layout">

            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="contact-information">

              <span className="contact-section-label">
                Get in touch
              </span>

              <h2>
                Let's plan something
                <em> extraordinary.</em>
              </h2>

              <p className="contact-intro">
                Whether you're dreaming of the Masai Mara,
                the beaches of Zanzibar, or a completely
                personalized East African adventure, tell us
                what you have in mind.
              </p>


              {/* CONTACT DETAILS */}

              <div className="contact-details">

                <a
                  href="mailto:jni.tours.org@gmail.com"
                  className="contact-detail"
                >
                  <span className="contact-detail-icon">
                    <FiMail />
                  </span>

                  <div>
                    <small>Email us</small>
                    <strong>
                      jni.tours.org@gmail.com
                    </strong>
                  </div>
                </a>


                <a
                  href="tel:+254702551560"
                  className="contact-detail"
                >
                  <span className="contact-detail-icon">
                    <FiPhone />
                  </span>

                  <div>
                    <small>Call us</small>
                    <strong>
                      +254 702 551 560
                    </strong>
                  </div>
                </a>


                <div className="contact-detail">
                  <span className="contact-detail-icon">
                    <FiMapPin />
                  </span>

                  <div>
                    <small>Based in</small>
                    <strong>
                      Nairobi, Kenya
                    </strong>
                  </div>
                </div>


                <div className="contact-detail">
                  <span className="contact-detail-icon">
                    <FiClock />
                  </span>

                  <div>
                    <small>Office hours</small>
                    <strong>
                      Mon – Fri · 8:00 – 17:00
                    </strong>
                  </div>
                </div>

              </div>


              {/* WHATSAPP */}

              <a
  href="https://wa.me/254101820500"
  target="_blank"
  rel="noopener noreferrer"
  className="contact-whatsapp"
>
  <span className="contact-whatsapp-icon">
    <FaWhatsapp />
  </span>

  <div>
    <strong>Chat with us on WhatsApp</strong>

    <span>
      Usually replies within a few minutes
    </span>
  </div>

  <FiArrowRight />
</a>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <div className="contact-form-card">

              <div className="contact-form-heading">
                <span>
                  Send an enquiry
                </span>

                <h2>
                  Tell us about your
                  <em> adventure.</em>
                </h2>

                <p>
                  Fill in the details below and we'll get
                  back to you as soon as possible.
                </p>
              </div>


              {submitted ? (
                <div className="contact-success">

                  <div className="contact-success-icon">
                    <FiSend />
                  </div>

                  <h3>
                    Message ready to send
                  </h3>

                  <p>
                    We've opened WhatsApp with your enquiry.
                    Send the message there and our team will
                    take it from there.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "",
                        message: "",
                      });
                    }}
                  >
                    Send another enquiry
                  </button>

                </div>
              ) : (
                <form
                  className="contact-form"
                  onSubmit={handleSubmit}
                >

                  <div className="contact-form-grid">

                    <div className="contact-field">
                      <label htmlFor="contact-name">
                        Full name
                      </label>

                      <input
                        id="contact-name"
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                          updateField(
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Your full name"
                        required
                      />
                    </div>


                    <div className="contact-field">
                      <label htmlFor="contact-email">
                        Email address
                      </label>

                      <input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateField(
                            "email",
                            event.target.value
                          )
                        }
                        placeholder="you@example.com"
                        required
                      />
                    </div>


                    <div className="contact-field">
                      <label htmlFor="contact-phone">
                        Phone number
                      </label>

                      <input
                        id="contact-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          updateField(
                            "phone",
                            event.target.value
                          )
                        }
                        placeholder="+254..."
                      />
                    </div>


                    <div className="contact-field">
                      <label htmlFor="contact-subject">
                        What can we help with?
                      </label>

                      <select
                        id="contact-subject"
                        value={form.subject}
                        onChange={(event) =>
                          updateField(
                            "subject",
                            event.target.value
                          )
                        }
                        required
                      >
                        <option value="">
                          Select an option
                        </option>

                        <option value="Safari enquiry">
                          Safari enquiry
                        </option>

                        <option value="Beach holiday">
                          Beach holiday
                        </option>

                        <option value="Custom itinerary">
                          Custom itinerary
                        </option>

                        <option value="Group travel">
                          Group travel
                        </option>

                        <option value="General enquiry">
                          General enquiry
                        </option>
                      </select>
                    </div>


                    <div className="contact-field contact-field-full">
                      <label htmlFor="contact-message">
                        Your message
                      </label>

                      <textarea
                        id="contact-message"
                        rows="7"
                        value={form.message}
                        onChange={(event) =>
                          updateField(
                            "message",
                            event.target.value
                          )
                        }
                        placeholder="Tell us about your plans, preferred dates, destinations, group size, or anything else you'd like us to know..."
                        required
                      />
                    </div>

                  </div>


                  <button
                    type="submit"
                    className="contact-submit"
                  >
                    Send enquiry
                    <FiArrowRight />
                  </button>

                  <p className="contact-form-note">
                    Your enquiry will open directly in
                    WhatsApp so our team can respond quickly.
                  </p>

                </form>
              )}

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="contact-bottom">
        <div className="container">

          <div className="contact-bottom-inner">

            <div>
              <span>
                Not sure where to start?
              </span>

              <h2>
                Explore our journeys
                <em> first.</em>
              </h2>
            </div>

            <Link to="/tours">
              Browse all tours
              <FiArrowRight />
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}

export default Contact;