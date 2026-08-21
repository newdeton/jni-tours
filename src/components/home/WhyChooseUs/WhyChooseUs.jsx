import {
  FiAward,
  FiCheckCircle,
  FiCompass,
  FiCreditCard,
  FiHeadphones,
  FiMap,
  FiShield,
} from "react-icons/fi";

import "./WhyChooseUs.css";

const advantages = [
  {
    icon: FiCompass,
    number: "01",
    title: "Local Expertise",
    description:
      "Travel with people who understand East Africa beyond the guidebook, from hidden gems to the best wildlife locations.",
  },
  {
    icon: FiMap,
    number: "02",
    title: "Tailored Journeys",
    description:
      "Every journey can be shaped around your interests, schedule, comfort level and budget.",
  },
  {
    icon: FiShield,
    number: "03",
    title: "Travel With Confidence",
    description:
      "We prioritize reliable partners, experienced guides and carefully planned itineraries from start to finish.",
  },
  {
    icon: FiCreditCard,
    number: "04",
    title: "Secure Payments",
    description:
      "Book with confidence through secure payment options designed for international travelers.",
  },
  {
    icon: FiHeadphones,
    number: "05",
    title: "Personal Support",
    description:
      "Our team stays available before and during your journey whenever you need assistance.",
  },
  {
    icon: FiAward,
    number: "06",
    title: "Exceptional Experiences",
    description:
      "We focus on meaningful experiences rather than simply moving you from one destination to another.",
  },
];

function WhyChooseUs() {
  return (
    <section className="why-choose-us">
      <div className="container">
        <div className="why-choose-layout">
          <div className="why-choose-intro">
            <span className="why-choose-eyebrow">
              <FiCheckCircle />
              The JNI Difference
            </span>

            <h2>
              Africa should be
              <em> experienced.</em>
            </h2>

            <p>
              Your journey deserves more than a standard itinerary.
              We combine local knowledge, thoughtful planning and
              genuine hospitality to create experiences worth
              remembering.
            </p>

            <div className="why-choose-stat">
              <strong>01</strong>

              <div>
                <span>One continent.</span>
                <p>Endless ways to discover it.</p>
              </div>
            </div>
          </div>

          <div className="why-choose-features">
            {advantages.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="why-choose-feature"
                  key={item.number}
                >
                  <div className="why-choose-feature-top">
                    <span className="why-choose-number">
                      {item.number}
                    </span>

                    <div className="why-choose-icon">
                      <Icon />
                    </div>
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;