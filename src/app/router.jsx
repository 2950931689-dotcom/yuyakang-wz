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
import AdminHeroPage from "../pages/admin/AdminHeroPage";
import AdminLocationPage from "../pages/admin/AdminLocationPage";
import AdminMediaPage from "../pages/admin/AdminMediaPage";

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
          <Route path="hero" element={<AdminHeroPage />} />
          <Route path="location" element={<AdminLocationPage />} />
          <Route path="profile" element={<AdminPlaceholder title="个人资料" phase="3.2" />} />
          <Route path="services" element={<AdminPlaceholder title="服务管理" phase="3.2" />} />
          <Route path="cases" element={<AdminCasesPage />} />
          <Route path="certificates" element={<AdminPlaceholder title="证书管理" phase="3.3" />} />
          <Route path="work-photos" element={<AdminPlaceholder title="工作照管理" phase="3.3" />} />
          <Route path="tutorials" element={<AdminPlaceholder title="经验分享 / 教程" phase="3.2" />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="social" element={<AdminPlaceholder title="社媒 / 联系方式" phase="3.2" />} />
          <Route path="seo" element={<AdminPlaceholder title="SEO 设置" phase="3.2" />} />
          <Route path="media" element={<AdminMediaPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
