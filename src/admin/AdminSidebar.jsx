import {
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiGrid,
  FiImage,
  FiMap,
  FiMessageSquare,
  FiSettings,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

import "./AdminSidebar.css";

function AdminSidebar({ collapsed, mobileOpen, onClose, onToggle }) {
  const menuItems = [
    {
      label: "Dashboard",
      icon: FiGrid,
      path: "/admin",
      end: true,
    },
    {
      label: "Tours",
      icon: FiMap,
      path: "/admin/tours",
    },
    {
      label: "Destinations",
      icon: FiBookOpen,
      path: "/admin/destinations",
    },
    {
      label: "Bookings",
      icon: FiCalendar,
      path: "/admin/bookings",
    },
    {
      label: "Customers",
      icon: FiUsers,
      path: "/admin/customers",
    },
    {
      label: "Messages",
      icon: FiMessageSquare,
      path: "/admin/messages",
    },
    {
      label: "Gallery",
      icon: FiImage,
      path: "/admin/gallery",
    },
    {
      label: "Blog",
      icon: FiFileText,
      path: "/admin/blog",
    },
  ];

  return (
    <>
      {mobileOpen && (
        <button
          className="admin-sidebar-overlay"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`admin-sidebar ${
          collapsed ? "admin-sidebar-collapsed" : ""
        } ${mobileOpen ? "admin-sidebar-mobile-open" : ""}`}
      >
        {/* BRAND */}
        <div className="admin-sidebar-brand">
          <NavLink to="/admin" onClick={onClose}>
            <span>JNI</span>

            {!collapsed && (
              <small>TOURS MANAGEMENT</small>
            )}
          </NavLink>

          <button
            className="admin-sidebar-mobile-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FiX />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="admin-sidebar-nav">
          <span className="admin-sidebar-label">
            {collapsed ? "" : "MANAGEMENT"}
          </span>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `admin-sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
                title={collapsed ? item.label : ""}
              >
                <Icon />

                {!collapsed && (
                  <span>{item.label}</span>
                )}
              </NavLink>
            );
          })}

          <span className="admin-sidebar-label admin-sidebar-label-settings">
            {collapsed ? "" : "SYSTEM"}
          </span>

          <NavLink
            to="/admin/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `admin-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
            title={collapsed ? "Settings" : ""}
          >
            <FiSettings />

            {!collapsed && (
              <span>Settings</span>
            )}
          </NavLink>
        </nav>

        {/* BOTTOM */}
        <div className="admin-sidebar-bottom">
          <button
            type="button"
            className="admin-sidebar-collapse"
            onClick={onToggle}
          >
            {collapsed ? (
              <FiChevronRight />
            ) : (
              <FiChevronLeft />
            )}

            {!collapsed && (
              <span>Collapse menu</span>
            )}
          </button>

          {!collapsed && (
            <div className="admin-sidebar-version">
              <span>JNI TOURS</span>
              <small>Management Panel</small>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;