import { useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";
import AppRoutes from "./routes";

function App() {
  const location = useLocation();

  // Management pages have their own layout.
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />

      {!isAdminRoute && <Navbar />}

      <main>
        <AppRoutes />
      </main>

      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;