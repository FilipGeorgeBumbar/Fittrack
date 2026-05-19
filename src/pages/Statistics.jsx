import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import Navbar from "../components/Navbar.jsx";
import StatsCards from "../components/StatsCards.jsx";
import StatusBars from "../components/StatusBars.jsx";
import { setCookie } from "../utils/cookies.jsx";
import { GET_WORKOUTS } from "../graphql/queries.js";

export default function Statistics() {
  const { data, loading } = useQuery(GET_WORKOUTS, {
    variables: { offset: 0, limit: 500 },
    fetchPolicy: "cache-and-network",
  });

  const workouts = data?.getWorkouts?.results || [];
  const totalMinutes = workouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);
  const completed = workouts.filter((w) => w.status === "Completed").length;
  const completionRate =
    workouts.length > 0 ? Math.round((completed / workouts.length) * 100) : 0;

  useEffect(() => {
    setCookie("lastPage", "statistics");
    setCookie("preferredView", "statistics");
  }, []);

  if (loading && workouts.length === 0) {
    return (
      <>
        <Navbar />
        <main className="page">
          <p>Loading statistics...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="header-row">
          <div>
            <h1>Workout Statistics</h1>
            <p className="subtitle">Your fitness progress overview</p>
          </div>

          <div className="top-actions">
            <Link to="/dashboard" className="btn">
              Table View
            </Link>
            <button type="button" className="btn btn-primary">
              Statistics View
            </button>
          </div>
        </div>

        <StatsCards workouts={workouts} />
        <StatusBars workouts={workouts} />

        <div className="stats-grid bottom-stats">
          <div className="premium-card large-stat">
            <p>Total Workouts</p>
            <h2>{workouts.length}</h2>
          </div>
          <div className="premium-card large-stat">
            <p>Total Minutes</p>
            <h2>{totalMinutes}</h2>
          </div>
          <div className="premium-card large-stat">
            <p>Completion Rate</p>
            <h2>{completionRate}%</h2>
          </div>
        </div>
      </main>
    </>
  );
}
