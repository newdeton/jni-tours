import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

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
  | SUBMIT LOGIN
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    /*
    |--------------------------------------------------------------------------
    | BASIC VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!email || !password) {
      setError(
        "Please enter your email address and password."
      );

      return;
    }

    setLoading(true);

    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000";

      /*
      |--------------------------------------------------------------------------
      | LOGIN REQUEST
      |--------------------------------------------------------------------------
      */

      const response = await fetch(
        `${apiBaseUrl}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      /*
      |--------------------------------------------------------------------------
      | READ RESPONSE
      |--------------------------------------------------------------------------
      */

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        data = {
          success: false,
          message: text || "Unexpected server response.",
        };
      }

      /*
      |--------------------------------------------------------------------------
      | HANDLE BACKEND ERROR
      |--------------------------------------------------------------------------
      */

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to sign in. Please check your credentials."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | EXTRACT AUTHENTICATION DATA
      |--------------------------------------------------------------------------
      |
      | Supports:
      |
      | data.token
      |
      | and:
      |
      | data.data.token
      |
      */

      const token =
        data.token ||
        data.data?.token;

      const user =
        data.user ||
        data.data?.user;

      /*
      |--------------------------------------------------------------------------
      | TOKEN IS REQUIRED
      |--------------------------------------------------------------------------
      */

      if (!token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | STORE AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "jni_tours_token",
        token
      );

      /*
      |--------------------------------------------------------------------------
      | STORE USER
      |--------------------------------------------------------------------------
      */

      if (user) {
        localStorage.setItem(
          "jni_tours_user",
          JSON.stringify(user)
        );
      } else {
        localStorage.removeItem(
          "jni_tours_user"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      setSuccess(
        "Login successful. Welcome back!"
      );

      /*
      |--------------------------------------------------------------------------
      | RETURN TO HOME
      |--------------------------------------------------------------------------
      |
      | The user remains authenticated.
      |
      | Home is the normal landing page after login.
      | Protected actions such as:
      |
      | - Booking
      | - My Trips
      | - Account
      | - Payments
      |
      | can now be accessed.
      |
      */

      setTimeout(() => {
        navigate("/");
      }, 600);
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      {/* =========================================================
          LEFT / BRAND PANEL
      ========================================================= */}

      <section className="auth-brand-panel">

        <div className="auth-brand-content">

          <span className="auth-eyebrow">
            JNI Tours
          </span>

          <h1>
            Your next
            <em> adventure</em>
            starts here.
          </h1>

          <p>
            Sign in to manage your journeys,
            review bookings, complete payments,
            and keep all your travel details
            in one secure place.
          </p>

          <div className="auth-trust-items">

            <div className="auth-trust-item">

              <span>
                <FiShield />
              </span>

              <div>
                <strong>
                  Secure account
                </strong>

                <small>
                  Your personal information
                  stays protected.
                </small>
              </div>

            </div>

            <div className="auth-trust-item">

              <span>
                <FiLock />
              </span>

              <div>
                <strong>
                  Secure payments
                </strong>

                <small>
                  Payments are processed
                  through trusted gateways.
                </small>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================================
          LOGIN PANEL
      ========================================================= */}

      <section className="auth-form-panel">

        <div className="auth-form-wrapper">

          {/* =====================================================
              MOBILE BRAND
          ===================================================== */}

          <div className="auth-mobile-brand">

            <Link to="/">
              JNI <span>Tours</span>
            </Link>

          </div>

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="auth-form-header">

            <span className="auth-eyebrow">
              Welcome back
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Access your bookings and manage
              your upcoming adventures.
            </p>

          </div>

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div
              className="auth-alert auth-alert-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* =====================================================
              SUCCESS
          ===================================================== */}

          {success && (
            <div
              className="auth-alert auth-alert-success"
              role="status"
            >
              {success}
            </div>
          )}

          {/* =====================================================
              FORM
          ===================================================== */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* ===================================================
                EMAIL
            =================================================== */}

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

            {/* ===================================================
                PASSWORD
            =================================================== */}

            <div className="auth-field">

              <div className="auth-field-label">

                <label htmlFor="password">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>

              </div>

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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
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

            </div>

            {/* ===================================================
                SUBMIT
            =================================================== */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-button-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <FiArrowRight />
                </>
              )}

            </button>

          </form>

          {/* =====================================================
              REGISTER
          ===================================================== */}

          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
              <FiArrowRight />
            </Link>

          </div>

          {/* =====================================================
              SECURITY NOTE
          ===================================================== */}

          <div className="auth-security-note">

            <FiShield />

            <span>
              Your connection is protected
              and your account information is
              handled securely.
            </span>

          </div>

          {/* =====================================================
              BACK HOME
          ===================================================== */}

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

export default Login;