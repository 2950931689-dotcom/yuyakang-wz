import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SiteLayout from "./SiteLayout";
import AdminLayout from "../components/admin/AdminLayout";
import AdminProtectedRoute from "../components/admin/AdminProtectedRoute";
import { AdminAuthProvider } from "../context/AdminAuthContext";
import HomePage from "../pages/HomePage";
import CasesPage from "../pages/CasesPage";
import CaseDetailPage from "../pages/CaseDetailPage";
import AboutPage from "../pages/AboutPage";
import ServicesPage from "../pages/ServicesPage";
import BookingPage from "../pages/BookingPage";
import ContactPage from "../pages/ContactPage";
import NotFoundPage from "../pages/NotFoundPage";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import AdminCasesPage from "../pages/admin/AdminCasesPage";
import AdminHeroPage from "../pages/admin/AdminHeroPage";
import AdminLocationPage from "../pages/admin/AdminLocationPage";
import AdminMediaPage from "../pages/admin/AdminMediaPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import AdminServicesPage from "../pages/admin/AdminServicesPage";
import AdminCertificatesPage from "../pages/admin/AdminCertificatesPage";
import AdminWorkPhotosPage from "../pages/admin/AdminWorkPhotosPage";
import AdminTutorialPage from "../pages/admin/AdminTutorialPage";
import AdminSocialPage from "../pages/admin/AdminSocialPage";
import AdminSeoPage from "../pages/admin/AdminSeoPage";
import AdminSiteModulesPage from "../pages/admin/AdminSiteModulesPage";
import AdminCommonToolsPage from "../pages/admin/AdminCommonToolsPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:slug" element={<CaseDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        <Route path="/admin" element={<AdminAuthProvider />}>
          <Route path="login" element={<AdminLoginPage />} />
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="hero" element={<AdminHeroPage />} />
              <Route path="location" element={<AdminLocationPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="cases" element={<AdminCasesPage />} />
              <Route path="certificates" element={<AdminCertificatesPage />} />
              <Route path="work-photos" element={<AdminWorkPhotosPage />} />
              <Route path="tutorial" element={<AdminTutorialPage />} />
              <Route path="site-modules" element={<AdminSiteModulesPage />} />
              <Route path="common-tools" element={<AdminCommonToolsPage />} />
              <Route path="tutorials" element={<Navigate to="/admin/tutorial" replace />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="social" element={<AdminSocialPage />} />
              <Route path="seo" element={<AdminSeoPage />} />
              <Route path="media" element={<AdminMediaPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
