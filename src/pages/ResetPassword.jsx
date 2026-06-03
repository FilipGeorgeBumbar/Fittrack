import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandIcon from "../components/BrandIcon";
import { resetPasswordRequest } from "../services/auth.js";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await resetPasswordRequest({ email, token, newPassword });
      if (res.ok) {
        setMessage(res.data.message);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(res.data.error || "An error occurred.");
      }
    } catch {
      setError("Network error.");
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

        <h2>Reset Password</h2>
        <p className="auth-subtitle">Enter your token and new password</p>

        {message && <p style={{ color: "#4caf50", textAlign: "center" }}>{message}</p>}
        {error && <p style={{ color: "#ff5e62", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Reset Token</label>
          <input
            type="text"
            placeholder="Enter the reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />

          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary auth-btn">
            Reset Password
          </button>
        </form>

        <p className="auth-footer">
          Back to <Link to="/login">Sign In</Link>
        </p>
      </div>
    </main>
  );
}
