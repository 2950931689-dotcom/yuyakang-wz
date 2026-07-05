import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MobileNav, { MobileCta } from "../components/layout/MobileNav";
import PageTransition from "../components/ui/PageTransition";
import LoadingState from "../components/ui/LoadingState";
import { useContent } from "../context/ContentContext";

export default function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loading } = useContent();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="site-layout">
      <Header onMenuOpen={() => setMenuOpen(true)} />
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="site-main">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <MobileCta />
    </div>
  );
}
