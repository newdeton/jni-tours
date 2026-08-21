import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

import "./AdminLayout.css";

function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  const pageInfo = {
    "/admin": {
      title: "Dashboard",
      subtitle: "Overview of your JNI Tours business.",
    },

    "/admin/tours": {
      title: "Tours",
      subtitle: "Create and manage your tour packages.",
    },

    "/admin/destinations": {
      title: "Destinations",
      subtitle: "Manage the destinations available on your website.",
    },

    "/admin/bookings": {
      title: "Bookings",
      subtitle: "View and manage customer tour bookings.",
    },

    "/admin/customers": {
      title: "Customers",
      subtitle: "Manage your travelers and customer information.",
    },

    "/admin/messages": {
      title: "Messages",
      subtitle: "View customer enquiries and communication.",
    },

    "/admin/gallery": {
      title: "Gallery",
      subtitle: "Manage images displayed across the website.",
    },

    "/admin/blog": {
      title: "Travel Guide",
      subtitle: "Create and manage travel articles.",
    },

    "/admin/settings": {
      title: "Settings",
      subtitle: "Manage your website and management preferences.",
    },
  };

  const currentPage =
    pageInfo[location.pathname] || pageInfo["/admin"];

  return (
    <div className="admin-layout">

      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onToggle={() =>
          setSidebarCollapsed((current) => !current)
        }
      />

      <div
        className={`admin-main ${
          sidebarCollapsed
            ? "admin-main-collapsed"
            : ""
        }`}
      >
        <AdminHeader
          title={currentPage.title}
          subtitle={currentPage.subtitle}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;