import { Link } from "react-router-dom";
import Brand from "../components/Brand";
import Footer from "../components/Footer";
import UtilityMenu from "../components/UtilityMenu";
import { UTILITIES } from "../lib/utilities";

export default function MainSplash() {
  const tools = UTILITIES.filter((utility) => utility.path !== "/");

  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand />
        <div className="topbar-actions">
          <UtilityMenu />
        </div>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">MAHJONG · UTILITIES</p>
        <h1 id="page-title">麻将都Win</h1>
        <p>
          开局起风、开墩摸牌、
          <br />
          番数结算，一应俱全。
        </p>
      </section>

      <section className="splash-grid" aria-label="Utility tools">
        {tools.map((tool) =>
          tool.external ? (
            <a
              key={tool.path}
              className="splash-card"
              href={tool.path}
              target="_blank"
              rel="noreferrer"
            >
              <span className="splash-card-glyph" aria-hidden="true">{tool.glyph}</span>
              <strong>{tool.label}</strong>
              <small>{tool.description}</small>
            </a>
          ) : (
            <Link key={tool.path} className="splash-card" to={tool.path}>
              <span className="splash-card-glyph" aria-hidden="true">{tool.glyph}</span>
              <strong>{tool.label}</strong>
              <small>{tool.description}</small>
            </Link>
          ),
        )}
      </section>

      <Footer />
    </main>
  );
}
