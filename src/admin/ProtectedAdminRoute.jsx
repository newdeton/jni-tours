import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./ProtectedAdminRoute.css";

function ProtectedAdminRoute() {
  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  const location = useLocation();

  /*
  |--------------------------------------------------------------------------
  | WAIT FOR AUTHENTICATION INITIALIZATION
  |--------------------------------------------------------------------------
  |
  | AuthContext checks the stored JWT against:
  |
  | GET /api/auth/me
  |
  | We must wait for that check to finish before deciding whether
  | the visitor is allowed into the administration area.
  |
  */

  if (loading) {
    return (
      <div
        className="admin-auth-loading"
        role="status"
        aria-live="polite"
      >
        <div className="admin-auth-loading-card">

          <div className="admin-auth-spinner" />

          <div>
            <strong>
              Verifying access
            </strong>

            <p>
              Checking administrator credentials...
            </p>
          </div>

        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NOT AUTHENTICATED
  |--------------------------------------------------------------------------
  |
  | Anyone who is not logged in must use the dedicated administrator
  | login page.
  |
  | The complete requested location is preserved so that after a
  | successful admin login we can return the administrator to the
  | page they originally requested.
  |
  */

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ACCOUNT MUST BE ACTIVE
  |--------------------------------------------------------------------------
  |
  | An administrator account that has been deactivated must not be
  | allowed to continue using the management panel.
  |
  */

  if (user.isActive === false) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: "/admin",
          unauthorized: true,
          reason: "inactive",
        }}
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VERIFY ADMIN ROLE
  |--------------------------------------------------------------------------
  |
  | Role is the source of truth.
  |
  | Customer:
  |   role === "customer"
  |
  | Administrator:
  |   role === "admin"
  |
  | isAdmin is also supported because our User model exposes it as
  | a virtual/safe-user property.
  |
  */

  const normalizedRole = String(
    user.role || ""
  )
    .trim()
    .toLowerCase();

  const isAdmin =
    normalizedRole === "admin" ||
    user.isAdmin === true;

  /*
  |--------------------------------------------------------------------------
  | AUTHENTICATED BUT NOT ADMIN
  |--------------------------------------------------------------------------
  |
  | A normal customer must never be allowed to access the management
  | interface, even if they manually type /admin in the browser.
  |
  | Send them back to the public website rather than repeatedly
  | sending them to an administrator login page.
  |
  */

  if (!isAdmin) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          unauthorized: true,
        }}
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN VERIFIED
  |--------------------------------------------------------------------------
  |
  | The visitor:
  |
  | ✓ has completed authentication
  | ✓ has an active account
  | ✓ has role === "admin"
  |
  | Allow access to the nested administrator routes.
  |
  */

  return <Outlet />;
}

export default ProtectedAdminRoute;