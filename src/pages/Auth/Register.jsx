import {
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Auth.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [agreeTerms, setAgreeTerms] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | HANDLE INPUT
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PASSWORD VALIDATION
  |--------------------------------------------------------------------------
  */

  const validatePassword = (password) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  });

  const passwordRules =
    validatePassword(formData.password);

  const passwordIsValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number;

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const firstName =
      formData.firstName.trim();

    const lastName =
      formData.lastName.trim();

    const email =
      formData.email.trim().toLowerCase();

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;

    /*
    |--------------------------------------------------------------------------
    | CLIENT VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please complete all required fields."
      );

      return;
    }

    if (firstName.length < 2) {
      setError(
        "First name must be at least 2 characters."
      );

      return;
    }

    if (lastName.length < 2) {
      setError(
        "Last name must be at least 2 characters."
      );

      return;
    }

    if (!passwordIsValid) {
      setError(
        "Password must contain at least 8 characters, including uppercase, lowercase, and a number."
      );

      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    if (!agreeTerms) {
      setError(
        "Please agree to the Terms & Conditions and Privacy Policy."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | SUBMIT TO REAL API
    |--------------------------------------------------------------------------
    */

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
          }),
        }
      );

      /*
      |--------------------------------------------------------------------------
      | PARSE RESPONSE
      |--------------------------------------------------------------------------
      */

      let data;

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text =
          await response.text();

        data = {
          success: false,
          message:
            text ||
            "The server returned an unexpected response.",
        };
      }

      /*
      |--------------------------------------------------------------------------
      | API ERROR
      |--------------------------------------------------------------------------
      */

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to create your account."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION RESPONSE
      |--------------------------------------------------------------------------
      */

      const token =
        data.token ||
        data.data?.token;

      const user =
        data.user ||
        data.data?.user;

      if (!token) {
        throw new Error(
          "Your account was created, but the authentication session could not be established."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | STORE AUTH SESSION
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "jni_tours_token",
        token
      );

      if (user) {
        localStorage.setItem(
          "jni_tours_user",
          JSON.stringify(user)
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      setSuccess(
        "Your account has been created successfully. Welcome to JNI Tours!"
      );

      /*
      |--------------------------------------------------------------------------
      | REDIRECT
      |--------------------------------------------------------------------------
      |
      | The customer is now authenticated.
      |
      */

      setTimeout(() => {
        navigate("/", {
          replace: true,
        });
      }, 700);
    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      /*
      |--------------------------------------------------------------------------
      | NETWORK ERROR
      |--------------------------------------------------------------------------
      */

      if (
        err instanceof TypeError &&
        err.message === "Failed to fetch"
      ) {
        setError(
          "Unable to connect to JNI Tours. Please make sure the API server is running on port 5000."
        );
      } else {
        setError(
          err.message ||
            "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      {/* =========================================================
          BRAND PANEL
      ========================================================= */}

      <section className="auth-brand-panel">

        <div className="auth-brand-content">

          <span className="auth-eyebrow">
            JNI Tours
          </span>

          <h1>
            Travel further.
            <em>
              {" "}
              Experience more.
            </em>
          </h1>

          <p>
            Create your JNI Tours account
            and keep your adventures,
            bookings, payments, and travel
            details together in one secure
            place.
          </p>

          <div className="auth-trust-items">

            <div className="auth-trust-item">

              <span>
                <FiUser />
              </span>

              <div>
                <strong>
                  Personal travel profile
                </strong>

                <small>
                  Keep your traveler
                  information ready for
                  future journeys.
                </small>
              </div>

            </div>

            <div className="auth-trust-item">

              <span>
                <FiShield />
              </span>

              <div>
                <strong>
                  Secure account
                </strong>

                <small>
                  Your account information
                  is protected.
                </small>
              </div>

            </div>

            <div className="auth-trust-item">

              <span>
                <FiCheck />
              </span>

              <div>
                <strong>
                  Manage your adventures
                </strong>

                <small>
                  View bookings and track
                  your travel arrangements.
                </small>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================
          FORM PANEL
      ========================================================= */}

      <section className="auth-form-panel">

        <div className="auth-form-wrapper">

          {/* MOBILE BRAND */}

          <div className="auth-mobile-brand">

            <Link to="/">
              JNI <span>Tours</span>
            </Link>

          </div>

          {/* HEADER */}

          <div className="auth-form-header">

            <span className="auth-eyebrow">
              Start your journey
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Join JNI Tours to manage your
              journeys and bookings.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div
              className="auth-alert auth-alert-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div
              className="auth-alert auth-alert-success"
              role="status"
            >
              {success}
            </div>
          )}

          {/* FORM */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* NAME */}

            <div className="auth-form-row">

              <div className="auth-field">

                <label htmlFor="firstName">
                  First name
                </label>

                <div className="auth-input-wrapper">

                  <FiUser />

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={
                      formData.firstName
                    }
                    onChange={handleChange}
                    placeholder="First name"
                    autoComplete="given-name"
                    minLength={2}
                    maxLength={50}
                    required
                    disabled={loading}
                  />

                </div>

              </div>

              <div className="auth-field">

                <label htmlFor="lastName">
                  Last name
                </label>

                <div className="auth-input-wrapper">

                  <FiUser />

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={
                      formData.lastName
                    }
                    onChange={handleChange}
                    placeholder="Last name"
                    autoComplete="family-name"
                    minLength={2}
                    maxLength={50}
                    required
                    disabled={loading}
                  />

                </div>

              </div>

            </div>

            {/* EMAIL */}

            <div className="auth-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <FiMail />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="auth-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <FiLock />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    formData.password
                  }
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>

              </div>

              {/* PASSWORD RULES */}

              {formData.password && (
                <div className="auth-password-rules">

                  <span
                    className={
                      passwordRules.length
                        ? "valid"
                        : ""
                    }
                  >
                    <FiCheck />
                    8+ characters
                  </span>

                  <span
                    className={
                      passwordRules.uppercase
                        ? "valid"
                        : ""
                    }
                  >
                    <FiCheck />
                    Uppercase
                  </span>

                  <span
                    className={
                      passwordRules.lowercase
                        ? "valid"
                        : ""
                    }
                  >
                    <FiCheck />
                    Lowercase
                  </span>

                  <span
                    className={
                      passwordRules.number
                        ? "valid"
                        : ""
                    }
                  >
                    <FiCheck />
                    Number
                  </span>

                </div>
              )}

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="auth-field">

              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="auth-input-wrapper">

                <FiLock />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>

              </div>

            </div>

            {/* TERMS */}

            <label className="auth-checkbox">

              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(event) =>
                  setAgreeTerms(
                    event.target.checked
                  )
                }
                disabled={loading}
              />

              <span className="auth-checkbox-box">
                <FiCheck />
              </span>

              <span>
                I agree to the{" "}

                <Link to="/terms">
                  Terms & Conditions
                </Link>

                {" "}and{" "}

                <Link to="/privacy">
                  Privacy Policy
                </Link>

                .
              </span>

            </label>

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-button-spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <FiArrowRight />
                </>
              )}
            </button>

          </form>

          {/* LOGIN */}

          <div className="auth-switch">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
              <FiArrowRight />
            </Link>

          </div>

          {/* SECURITY */}

          <div className="auth-security-note">

            <FiShield />

            <span>
              Your information is securely
              transmitted and handled
              according to our privacy policy.
            </span>

          </div>

          {/* HOME */}

          <Link
            to="/"
            className="auth-back-home"
          >
            ← Back to JNI Tours
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Register;