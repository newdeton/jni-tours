import { Routes, Route } from "react-router-dom";

// =========================================================
// PUBLIC PAGES
// =========================================================

import Home from "./pages/Home/Home";
import Tours from "./pages/Tours/Tours";
import TourDetails from "./pages/TourDetails/TourDetails";

import Destinations from "./pages/Destinations/Destinations";
import DestinationDetails from "./pages/DestinationDetails/DestinationDetails";
import DestinationBooking from "./pages/DestinationBooking/DestinationBooking";

import Booking from "./pages/Booking/Booking";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Gallery from "./pages/Gallery/Gallery";

// =========================================================
// BLOG
// =========================================================

import Blog from "./pages/Blog/Blog";
import BlogDetails from "./pages/BlogDetails/BlogDetails";
import AdminBlog from "./admin/pages/AdminBlog/AdminBlog";

// =========================================================
// CUSTOMER AUTHENTICATION
// =========================================================

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// =========================================================
// CUSTOMER
// =========================================================

import CustomerDashboard from "./pages/Customer/Dashboard";
import CustomerBookings from "./pages/Customer/Bookings";
import CustomerProfile from "./pages/Customer/Profile";

import AdminCustomers from "./admin/pages/AdminCustomers/AdminCustomers";
// =========================================================
// PAYMENTS
// =========================================================

import Payment from "./pages/Payment/Payment";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import PaymentFailed from "./pages/Payment/PaymentFailed";

// =========================================================
// ADMIN
// =========================================================

import AdminLogin from "./admin/AdminLogin";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";
import AdminLayout from "./admin/AdminLayout";

import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminTours from "./admin/pages/AdminTours";
import AdminDestinations from "./admin/pages/AdminDestinations";
import AdminBookings from "./admin/pages/AdminBookings";
import AdminMessages from "./admin/pages/AdminMessages/AdminMessages";
// =========================================================
// 404
// =========================================================

import NotFound from "./pages/NotFound";

function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC WEBSITE
      ===================================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      {/* =====================================================
          TOURS
      ===================================================== */}

      <Route
        path="/tours"
        element={<Tours />}
      />

      <Route
        path="/tours/:tourId"
        element={<TourDetails />}
      />

      <Route
        path="/booking/:tourId"
        element={<Booking />}
      />

      {/* =====================================================
          DESTINATIONS
          -----------------------------------------------------
          PUBLIC DESTINATION FLOW:

          /destinations
                ↓
          /destinations/:destinationId
                ↓
          /destination-booking/:destinationId
      ===================================================== */}

      <Route
        path="/destinations"
        element={<Destinations />}
      />

      <Route
        path="/destinations/:destinationId"
        element={<DestinationDetails />}
      />

      <Route
        path="/destination-booking/:destinationId"
        element={<DestinationBooking />}
      />

      {/* =====================================================
          GENERAL PUBLIC PAGES
      ===================================================== */}

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      <Route
        path="/gallery"
        element={<Gallery />}
      />

      {/* =====================================================
          BLOG
      ===================================================== */}

      <Route
        path="/blog"
        element={<Blog />}
      />

      <Route
        path="/blog/:slug"
        element={<BlogDetails />}
      />

      {/* =====================================================
          CUSTOMER AUTHENTICATION
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =====================================================
          CUSTOMER AREA
      ===================================================== */}

      <Route
        path="/customer"
        element={<CustomerDashboard />}
      />

      <Route
        path="/customer/bookings"
        element={<CustomerBookings />}
      />

      <Route
        path="/customer/profile"
        element={<CustomerProfile />}
      />

      {/* =====================================================
          PAYMENTS
      ===================================================== */}

      <Route
        path="/payment/:bookingId"
        element={<Payment />}
      />

      <Route
        path="/payment/success"
        element={<PaymentSuccess />}
      />

      <Route
        path="/payment/failed"
        element={<PaymentFailed />}
      />

      {/* =====================================================
          ADMIN LOGIN
          -----------------------------------------------------
          This MUST remain outside ProtectedAdminRoute.

          URL:
          /admin/login
      ===================================================== */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* =====================================================
          PROTECTED ADMINISTRATION
          -----------------------------------------------------
          Everything inside requires:

          1. Authentication
          2. Valid JWT
          3. Existing user
          4. Active account
          5. role === "admin"
      ===================================================== */}

      <Route element={<ProtectedAdminRoute />}>

        {/* ===================================================
            ADMIN LAYOUT

            Parent URL:
            /admin
        =================================================== */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          {/* =================================================
              ADMIN DASHBOARD

              URL:
              /admin
          ================================================= */}

          <Route
            index
            element={<AdminDashboard />}
          />

          {/* =================================================
              ADMIN TOURS

              URL:
              /admin/tours
          ================================================= */}

          <Route
            path="tours"
            element={<AdminTours />}
          />

          {/* =================================================
              ADMIN DESTINATIONS

              URL:
              /admin/destinations

              IMPORTANT:
              This MUST be "destinations", NOT
              "/destinations".
          ================================================= */}

          <Route
            path="destinations"
            element={<AdminDestinations />}
          />

          {/* =================================================
              ADMIN BOOKINGS

              URL:
              /admin/bookings
          ================================================= */}

          <Route
            path="bookings"
            element={<AdminBookings />}
          />

          {/* =================================================
              ADMIN CUSTOMERS

              URL:
              /admin/customers
          ================================================= */}

          <Route
  path="customers"
  element={<AdminCustomers />}
/>

          {/* =================================================
              ADMIN MESSAGES

              URL:
              /admin/messages
          ================================================= */}

          <Route
  path="messages"
  element={<AdminMessages />}
/>

          {/* =================================================
              ADMIN GALLERY

              URL:
              /admin/gallery
          ================================================= */}

          <Route
            path="gallery"
            element={
              <div>
                Gallery Management
              </div>
            }
          />

          {/* =================================================
              ADMIN BLOG

              URL:
              /admin/blog
          ================================================= */}

          <Route
  path="blog"
  element={<AdminBlog />}
/>

          {/* =================================================
              ADMIN SETTINGS

              URL:
              /admin/settings
          ================================================= */}

          <Route
            path="settings"
            element={
              <div>
                Settings
              </div>
            }
          />

        </Route>

      </Route>

      {/* =====================================================
          404
      ===================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}

export default AppRoutes;