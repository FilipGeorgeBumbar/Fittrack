import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrandIcon from "./BrandIcon";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/";
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    setMenuOpen(false);
    logout("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="brand-wrap" onClick={closeMenu}>
        <BrandIcon size={24} />
        <div className="logo">FitTrack</div>
      </Link>

      {/* Desktop nav links */}
      <div className="nav-links">
        {!isAuthenticated ? (
          <>
            {isLanding && (
              <>
                <Link to="/login" className="nav-link-simple">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary nav-cta">
                  Get Started Free
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            {user?.role?.name === "Admin" && (
              <Link
                to="/admin"
                className="btn btn-secondary nav-cta"
                style={{
                  marginLeft: "10px",
                  background: "rgba(255, 149, 0, 0.15)",
                  borderColor: "#ff9500",
                  color: "#ff9500",
                }}
              >
                🛡️ Admin Panel
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="btn btn-secondary nav-cta"
              style={{
                marginLeft: "10px",
                background: "#ff3b30",
                borderColor: "#ff3b30",
                color: "white",
              }}
            >
              Sign Out
            </button>
          </>
        )}
      </div>

      {/* Hamburger button (mobile only) */}
      <button
        className="hamburger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile overlay */}
      <div
        className={`mobile-menu-overlay ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
      />

      {/* Mobile drawer */}
      <div className={`mobile-nav-drawer ${menuOpen ? "open" : ""}`}>

        {!isAuthenticated ? (
          <>
            {isLanding && (
              <>
                <Link
                  to="/login"
                  className="btn"
                  style={{ background: "#222", color: "#fff" }}
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={closeMenu}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <Link to="/dashboard" className="btn" style={{ background: "#222", color: "#fff" }} onClick={closeMenu}>
              📊 Dashboard
            </Link>
            <Link to="/statistics" className="btn" style={{ background: "#222", color: "#fff" }} onClick={closeMenu}>
              📈 Statistics
            </Link>
            <Link to="/bazinga" className="btn" style={{ background: "#222", color: "#fff" }} onClick={closeMenu}>
              🎯 Get Recommendation
            </Link>
            <Link to="/workouts/new" className="btn btn-primary" onClick={closeMenu}>
              ➕ Add Workout
            </Link>
            {user?.role?.name === "Admin" && (
              <Link
                to="/admin"
                className="btn"
                style={{
                  background: "rgba(255, 149, 0, 0.15)",
                  borderColor: "#ff9500",
                  color: "#ff9500",
                  border: "1px solid #ff9500",
                }}
                onClick={closeMenu}
              >
                🛡️ Admin Panel
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="btn"
              style={{
                background: "#ff3b30",
                borderColor: "#ff3b30",
                color: "white",
                border: "1px solid #ff3b30",
                marginTop: "8px",
              }}
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
