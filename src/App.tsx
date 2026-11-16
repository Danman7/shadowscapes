import { Link, NavLink, Route, Routes } from "react-router";
import { CardGallery } from "./screens/CardGallery";
import { Duel } from "./screens/Duel";

export function App() {
  return (
    <>
      <header>
        <Link className="home-link" to="/">
          Goldkeeper
        </Link>

        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Duel
          </NavLink>

          <NavLink to="/cards">Cards</NavLink>
        </nav>
      </header>

      <main id="main">
        <Routes>
          <Route path="/" element={<Duel />} />
          <Route path="/cards" element={<CardGallery />} />
          <Route
            path="*"
            element={
              <div className="page-placeholder">
                <p>Lost in the shadows</p>
                <h1>Page not found</h1>
                <Link to="/">Return to the duel</Link>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  );
}
