import { BrowserRouter, Routes, Route } from "react-router-dom";
import SiteLayout from "./SiteLayout";
import AdminLayout from "../components/admin/AdminLayout";
import HomePage from "../pages/HomePage";
import CasesPage from "../pages/CasesPage";
import CaseDetailPage from "../pages/CaseDetailPage";
import AboutPage from "../pages/AboutPage";
import ServicesPage from "../pages/ServicesPage";
import BookingPage from "../pages/BookingPage";
import ContactPage from "../pages/ContactPage";
import NotFoundPage from "../pages/NotFoundPage";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminPlaceholder from "../pages/admin/AdminPlaceholder";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import AdminCasesPage from "../pages/admin/AdminCasesPage";

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

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="hero" element={<AdminPlaceholder title="首页视频" />} />
          <Route path="profile" element={<AdminPlaceholder title="个人资料" />} />
          <Route path="certificates" element={<AdminPlaceholder title="证书管理" />} />
          <Route path="services" element={<AdminPlaceholder title="服务管理" />} />
          <Route path="cases" element={<AdminCasesPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="social" element={<AdminPlaceholder title="社媒管理" />} />
          <Route path="seo" element={<AdminPlaceholder title="SEO 管理" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
