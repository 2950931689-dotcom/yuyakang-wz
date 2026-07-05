import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MobileNav, { MobileCta } from "../components/layout/MobileNav";
import { useContent } from "../context/ContentContext";

export default function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loading } = useContent();

  if (loading) {
    return <div className="loading-screen">Loading…</div>;
  }

  return (
    <div className="site-layout">
      <Header onMenuOpen={() => setMenuOpen(true)} />
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
      <MobileCta />
    </div>
  );
}
