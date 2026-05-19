import { Link, useLocation, useNavigate } from "react-router-dom";
import BrandIcon from "./BrandIcon";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === "/";
  const { isAuthenticated, user, logout } = useAuth();

  const handleSignOut = () => {
    logout("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand-wrap">
        <BrandIcon size={24} />
        <div className="logo">FitTrack</div>
      </Link>

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
    </nav>
  );
}
