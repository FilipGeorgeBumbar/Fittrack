import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandIcon from "../components/BrandIcon";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [roleName, setRoleName] = useState("Normal User");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    try {
      const result = await register({ name, email, password, roleName });
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
      <div className="auth-glow auth-glow-center"></div>

      <div className="auth-card">
        <div className="auth-brand">
          <BrandIcon size={26} />
          <div className="logo">FitTrack</div>
        </div>

        <h2>Create Account</h2>
        <p className="auth-subtitle">Join thousands of fitness enthusiasts</p>

        {error && <p style={{ color: "#ff5e62", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="two-col">
            <div>
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Confirm</label>
              <input
                type="password"
                placeholder="Confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          </div>

          <label>Select Role</label>
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

          <p className="terms-text">
            By signing up, you agree to our Terms and Privacy Policy
          </p>

          <button type="submit" className="btn btn-primary auth-btn">
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
