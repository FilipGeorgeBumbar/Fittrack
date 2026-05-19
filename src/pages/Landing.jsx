import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { isAuthenticated: isLoggedIn } = useAuth();
  return (
    <>
      <Navbar />

      <main className="landing-page">
        <div className="landing-bg"></div>

        <section className="hero">
          <h1 className="hero-title">
            <span className="hero-line">Track Your</span>
            <span className="hero-line accent">Fitness Journey</span>
          </h1>

          <p className="hero-subtitle">
            FitTrack helps you monitor your gym workouts, track progress, and
            achieve your fitness goals with ease.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary hero-btn-primary">
              Start Tracking Now
            </Link>
            <Link to="/login" className="btn hero-btn-secondary">
              Sign In
            </Link>
          </div>

          <div className="landing-cards">
            <div className="landing-card">
              <div className="card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M15 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Schedule Workouts</h3>
              <p>
                Plan and organize your workout sessions with our intuitive
                interface.
              </p>
            </div>

            <div className="landing-card landing-card-featured">
              <div className="card-icon featured-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="14" width="4" height="6" rx="1" fill="white"/>
                  <rect x="10" y="10" width="4" height="10" rx="1" fill="white"/>
                  <rect x="16" y="6" width="4" height="14" rx="1" fill="white"/>
                </svg>
              </div>
              <h3>Track Progress</h3>
              <p>
                Monitor your performance and see your improvements over time
                with detailed analytics.
              </p>
            </div>

            <div className="landing-card">
              <div className="card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <h3>Achieve Goals</h3>
              <p>
                Set targets and stay motivated as you work towards your fitness
                objectives.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}