import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BrandIcon from "../components/BrandIcon";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState("Normal User");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const idleMessage =
    searchParams.get("reason") === "idle"
      ? "You were signed out due to inactivity."
      : searchParams.get("reason") === "expired"
        ? "Your session expired. Please sign in again."
        : "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login({ email, password, roleName });
      if (!result.ok) {
        setError(result.error);
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Network error. Server might be down.");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-right"></div>
      <div className="auth-glow auth-glow-left"></div>

      <div className="auth-card">
        <div className="auth-brand">
          <BrandIcon size={26} />
          <div className="logo">FitTrack</div>
        </div>

        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue your fitness journey</p>

        {idleMessage && (
          <p style={{ color: "#ff9500", textAlign: "center", fontSize: "14px" }}>{idleMessage}</p>
        )}
        {error && <p style={{ color: "#ff5e62", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-row">
            <label>Password</label>
          </div>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Login As</label>
          <select
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              background: "#222",
              border: "1px solid #333",
              color: "white",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            <option value="Normal User">Normal User</option>
            <option value="Admin">Admin</option>
          </select>

          <button type="submit" className="btn btn-primary auth-btn">
            Sign In
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one now</Link>
        </p>
      </div>
    </main>
  );
}
