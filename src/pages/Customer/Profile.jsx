import {
  FiArrowLeft,
  FiCheck,
  FiGlobe,
  FiMail,
  FiPhone,
  FiSave,
  FiUser,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useBookings } from "../../context/BookingContext";

import "./Customer.css";

function Profile() {
  const { bookings = [] } = useBookings();

  const firstBooking = bookings[0];
  const savedTraveler =
    firstBooking?.traveler || {};

  const [profile, setProfile] = useState({
    firstName:
      savedTraveler.firstName || "",
    lastName:
      savedTraveler.lastName || "",
    email:
      savedTraveler.email || "",
    phone:
      savedTraveler.phone || "",
    country:
      savedTraveler.country || "",
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD SAVED PROFILE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const storedProfile =
      localStorage.getItem(
        "jni_customer_profile"
      );

    if (storedProfile) {
      try {
        const parsed =
          JSON.parse(storedProfile);

        setProfile((current) => ({
          ...current,
          ...parsed,
        }));
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );
      }
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | UPDATE FIELD
  |--------------------------------------------------------------------------
  */

  const updateField = (
    field,
    value
  ) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE PROFILE
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (event) => {
    event.preventDefault();

    setSaving(true);
    setSaved(false);

    try {
      localStorage.setItem(
        "jni_customer_profile",
        JSON.stringify(profile)
      );

      setSaved(true);
    } catch (error) {
      console.error(
        "Profile save error:",
        error
      );
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    `${profile.firstName} ${profile.lastName}`.trim() ||
    "Traveler";

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="customer-page">

      <div className="container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="customer-header">

          <div>

            <span className="customer-eyebrow">
              Account settings
            </span>

            <h1>
              My Profile
            </h1>

            <p>
              Keep your personal and travel
              information up to date.
            </p>

          </div>

          <Link
            to="/customer"
            className="customer-secondary-action"
          >
            <FiArrowLeft />
            Dashboard
          </Link>

        </section>

        {/* =====================================================
            PROFILE LAYOUT
        ===================================================== */}

        <div className="customer-profile-layout">

          {/* ===================================================
              PROFILE SIDEBAR
          =================================================== */}

          <aside className="customer-profile-sidebar">

            <div className="customer-profile-avatar">
              {profile.firstName
                ? profile.firstName
                    .charAt(0)
                    .toUpperCase()
                : "J"}
            </div>

            <h2>
              {displayName}
            </h2>

            <p>
              {profile.email ||
                "Traveler account"}
            </p>

            <div className="customer-profile-divider" />

            <div className="customer-profile-info">

              <div>
                <FiMail />

                <span>
                  {profile.email ||
                    "No email added"}
                </span>
              </div>

              <div>
                <FiPhone />

                <span>
                  {profile.phone ||
                    "No phone added"}
                </span>
              </div>

              <div>
                <FiGlobe />

                <span>
                  {profile.country ||
                    "Country not added"}
                </span>
              </div>

            </div>

          </aside>

          {/* ===================================================
              PROFILE FORM
          =================================================== */}

          <section className="customer-profile-card">

            <div className="customer-profile-card-heading">

              <div className="customer-profile-heading-icon">
                <FiUser />
              </div>

              <div>

                <span>
                  Personal information
                </span>

                <h2>
                  Your details
                </h2>

                <p>
                  This information helps us
                  manage your bookings and
                  communicate with you.
                </p>

              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="customer-profile-form"
            >

              {/* =================================================
                  NAME
              ================================================= */}

              <div className="customer-profile-grid">

                <div className="customer-field">

                  <label htmlFor="firstName">
                    First name
                  </label>

                  <input
                    id="firstName"
                    type="text"
                    value={profile.firstName}
                    onChange={(event) =>
                      updateField(
                        "firstName",
                        event.target.value
                      )
                    }
                    placeholder="Your first name"
                    autoComplete="given-name"
                  />

                </div>

                <div className="customer-field">

                  <label htmlFor="lastName">
                    Last name
                  </label>

                  <input
                    id="lastName"
                    type="text"
                    value={profile.lastName}
                    onChange={(event) =>
                      updateField(
                        "lastName",
                        event.target.value
                      )
                    }
                    placeholder="Your last name"
                    autoComplete="family-name"
                  />

                </div>

              </div>

              {/* =================================================
                  EMAIL / PHONE
              ================================================= */}

              <div className="customer-profile-grid">

                <div className="customer-field">

                  <label htmlFor="email">
                    Email address
                  </label>

                  <div className="customer-input-with-icon">

                    <FiMail />

                    <input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(event) =>
                        updateField(
                          "email",
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                    />

                  </div>

                </div>

                <div className="customer-field">

                  <label htmlFor="phone">
                    Phone number
                  </label>

                  <div className="customer-input-with-icon">

                    <FiPhone />

                    <input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(event) =>
                        updateField(
                          "phone",
                          event.target.value
                        )
                      }
                      placeholder="+254..."
                      autoComplete="tel"
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  COUNTRY
              ================================================= */}

              <div className="customer-field">

                <label htmlFor="country">
                  Country of residence
                </label>

                <div className="customer-input-with-icon">

                  <FiGlobe />

                  <input
                    id="country"
                    type="text"
                    value={profile.country}
                    onChange={(event) =>
                      updateField(
                        "country",
                        event.target.value
                      )
                    }
                    placeholder="Your country"
                    autoComplete="country-name"
                  />

                </div>

              </div>

              {/* =================================================
                  NOTICE
              ================================================= */}

              <div className="customer-profile-notice">

                <FiCheck />

                <div>

                  <strong>
                    Your information stays private
                  </strong>

                  <p>
                    Your details are used only to
                    manage your JNI Tours bookings
                    and communicate important travel
                    information.
                  </p>

                </div>

              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="customer-profile-actions">

                {saved && (
                  <span className="customer-save-success">
                    <FiCheck />
                    Profile saved
                  </span>
                )}

                <button
                  type="submit"
                  className="customer-primary-action"
                  disabled={saving}
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <FiSave />
                      Save changes
                    </>
                  )}
                </button>

              </div>

            </form>

          </section>

        </div>

      </div>

    </main>
  );
}

export default Profile;