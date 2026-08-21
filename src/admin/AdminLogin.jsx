import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";

import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    loading: authLoading,
    user,
  } = useAuth();

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
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError(
        "Please enter your administrator email and password."
      );

      return;
    }

    setLoading(true);

    try {
      const authenticatedUser = await login({
        email,
        password,
      });

      /*
      |--------------------------------------------------------------------------
      | VERIFY ADMIN ROLE
      |--------------------------------------------------------------------------
      */

      const isAdmin =
        String(authenticatedUser?.role || "")
          .trim()
          .toLowerCase() === "admin";

      if (!isAdmin) {
        /*
        | A normal customer must never remain authenticated
        | inside the administrator login flow.
        */

        return;
      }

      if (authenticatedUser.isActive === false) {
        throw new Error(
          "This administrator account is currently inactive."
        );
      }

      setSuccess(
        "Administrator login successful. Redirecting..."
      );

      /*
      |--------------------------------------------------------------------------
      | RETURN TO ORIGINAL ADMIN PAGE
      |--------------------------------------------------------------------------
      */

      const requestedPath =
        location.state?.from;

      const destination =
        requestedPath &&
        typeof requestedPath === "string" &&
        requestedPath.startsWith("/admin") &&
        requestedPath !== "/admin/login"
          ? requestedPath
          : "/admin";

      setTimeout(() => {
        navigate(destination, {
          replace: true,
        });
      }, 500);

    } catch (error) {
      console.error(
        "Administrator login error:",
        error
      );

      /*
      |--------------------------------------------------------------------------
      | CUSTOMER ATTEMPT
      |--------------------------------------------------------------------------
      */

      const message =
        error?.message ||
        "Unable to sign in as administrator.";

      if (
        message.toLowerCase().includes("admin") &&
        message.toLowerCase().includes("role")
      ) {
        setError(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CURRENT AUTHENTICATED NON-ADMIN USER
  |--------------------------------------------------------------------------
  */

  const currentUserIsAdmin =
    String(user?.role || "")
      .trim()
      .toLowerCase() === "admin";

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <main className="admin-login-page">

      {/* =====================================================
          BRAND PANEL
      ===================================================== */}

      <section className="admin-login-brand">

        <div className="admin-login-brand-content">

          <Link
            to="/"
            className="admin-login-brand-logo"
          >
            <span>JNI</span>
            <small>TOURS</small>
          </Link>

          <span className="admin-login-eyebrow">
            Secure Management Portal
          </span>

          <h1>
            Manage every
            <em> journey.</em>
          </h1>

          <p>
            Access the JNI Tours management
            platform to manage tours, bookings,
            destinations, customers, and
            travel content.
          </p>

          <div className="admin-login-trust">

            <div className="admin-login-trust-item">

              <span>
                <FiShield />
              </span>

              <div>
                <strong>
                  Administrator access
                </strong>

                <small>
                  Restricted to authorized
                  management accounts.
                </small>
              </div>

            </div>

            <div className="admin-login-trust-item">

              <span>
                <FiLock />
              </span>

              <div>
                <strong>
                  Secure authentication
                </strong>

                <small>
                  Your management session is
                  protected by JWT authentication.
                </small>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          LOGIN PANEL
      ===================================================== */}

      <section className="admin-login-form-panel">

        <div className="admin-login-wrapper">

          {/* MOBILE BRAND */}

          <Link
            to="/"
            className="admin-login-mobile-brand"
          >
            JNI <span>Tours</span>
          </Link>


          {/* HEADER */}

          <div className="admin-login-header">

            <span className="admin-login-eyebrow">
              Management Portal
            </span>

            <h2>
              Administrator sign in
            </h2>

            <p>
              Sign in with your authorized
              administrator account to continue.
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div
              className="admin-login-alert admin-login-alert-error"
              role="alert"
            >
              {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div
              className="admin-login-alert admin-login-alert-success"
              role="status"
            >
              {success}
            </div>
          )}


          {/* FORM */}

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="admin-login-field">

              <label htmlFor="admin-email">
                Administrator email
              </label>

              <div className="admin-login-input-wrapper">

                <FiMail />

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Admin Email"
                  autoComplete="username"
                  required
                  disabled={
                    loading || authLoading
                  }
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="admin-login-field">

              <label htmlFor="admin-password">
                Password
              </label>

              <div className="admin-login-input-wrapper">

                <FiLock />

                <input
                  id="admin-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  required
                  disabled={
                    loading || authLoading
                  }
                />

                <button
                  type="button"
                  className="admin-login-password-toggle"
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
                  disabled={
                    loading || authLoading
                  }
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>

              </div>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="admin-login-submit"
              disabled={
                loading ||
                authLoading ||
                currentUserIsAdmin
              }
            >
              {loading || authLoading ? (
                <>
                  <span className="admin-login-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Access management
                  <FiArrowRight />
                </>
              )}
            </button>

          </form>


          {/* SECURITY NOTE */}

          <div className="admin-login-security">

            <FiShield />

            <span>
              Administrator access is restricted.
              Never share your management
              credentials with unauthorized users.
            </span>

          </div>


          {/* BACK TO WEBSITE */}

          <Link
            to="/"
            className="admin-login-back"
          >
            ← Back to JNI Tours
          </Link>

        </div>

      </section>

    </main>
  );
}

export default AdminLogin;