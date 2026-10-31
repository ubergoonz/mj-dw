import { Link } from "react-router-dom";
import Brand from "../components/Brand";
import Footer from "../components/Footer";
import UtilityMenu from "../components/UtilityMenu";
import VersionBadge from "../components/VersionBadge";

export default function NotFound() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <VersionBadge />
          <UtilityMenu />
        </div>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">404 · NOT FOUND</p>
        <h1 id="page-title">找不到這一頁</h1>
        <p>這個連結可能已經更改。請從主頁選擇工具。</p>
      </section>

      <div className="error-actions">
        <Link className="utility-action" to="/">
          回主頁 · Home
        </Link>
      </div>

      <Footer />
    </main>
  );
}
