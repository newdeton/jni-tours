import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiSearch,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./AdminHeader.css";

function AdminHeader({
  onMenuClick,
  title = "Dashboard",
  subtitle = "Welcome back to your JNI Tours management panel.",
}) {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", {
      replace: true,
    });
  };

  const adminName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "JNI Admin";

  return (
    <header className="admin-header">
      <div className="admin-header-left">

        <button
          type="button"
          className="admin-mobile-menu"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <FiMenu />
        </button>

        <div className="admin-header-title">
          <span>JNI TOURS MANAGEMENT</span>

          <h1>{title}</h1>

          <p>{subtitle}</p>
        </div>

      </div>

      <div className="admin-header-actions">

        {/* SEARCH */}
        <button
          type="button"
          className="admin-header-icon"
          aria-label="Search"
        >
          <FiSearch />
        </button>

        {/* NOTIFICATIONS */}
        <button
          type="button"
          className="admin-header-icon admin-notification"
          aria-label="Notifications"
        >
          <FiBell />

          <span className="admin-notification-dot" />
        </button>

        {/* PROFILE */}
        <div className="admin-profile-wrapper">

          <button
            type="button"
            className="admin-profile"
            aria-label="Admin profile"
          >
            <span className="admin-profile-avatar">
              {adminName.charAt(0).toUpperCase()}
            </span>

            <span className="admin-profile-info">
              <strong>{adminName}</strong>
              <small>Administrator</small>
            </span>

            <FiChevronDown className="admin-profile-arrow" />
          </button>

          {/* LOGOUT */}
          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>

        </div>

      </div>
    </header>
  );
}

export default AdminHeader;