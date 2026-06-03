import { useState } from "react";
import { Link } from "react-router-dom";
import BrandIcon from "../components/BrandIcon";
import { forgotPasswordRequest } from "../services/auth.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await forgotPasswordRequest({ email });
      if (res.ok) {
        setMessage(res.data.message);
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

        <h2>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to receive a reset token</p>

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

          <button type="submit" className="btn btn-primary auth-btn">
            Send Reset Link
          </button>
        </form>

        <p className="auth-footer" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span>Remembered your password? <Link to="/login">Sign In</Link></span>
          <span>Have a token? <Link to="/reset-password">Reset Password</Link></span>
        </p>
      </div>
    </main>
  );
}
