import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { useInView } from "react-intersection-observer";

import Navbar from "../components/Navbar.jsx";
import WorkoutTable from "../components/WorkoutTable.jsx";
import StatsCards from "../components/StatsCards.jsx";
import { setCookie } from "../utils/cookies.jsx";
import DashboardOverview from "../components/DashboardOverview.jsx";
import Chat from "../components/Chat.jsx";
import { GET_WORKOUTS } from "../graphql/queries.js";
import { DELETE_WORKOUT } from "../graphql/mutations.js";

const PAGE_SIZE = 50;

export default function Dashboard() {
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("All");
  const [sortBy, setSortBy] = useState({ field: "date", order: "desc" });
  const [appliedFilterType, setAppliedFilterType] = useState("All");
  const [appliedSortBy, setAppliedSortBy] = useState({ field: "date", order: "desc" });

  const { ref: lastElementRef, inView } = useInView({ rootMargin: "100px", threshold: 0.1 });

  const { data, loading, fetchMore, refetch } = useQuery(GET_WORKOUTS, {
    variables: {
      offset: 0,
      limit: PAGE_SIZE,
      filter: { type: appliedFilterType !== "All" ? appliedFilterType : null },
      sort: appliedSortBy,
    },
    fetchPolicy: "cache-and-network",
  });

  const [deleteWorkout] = useMutation(DELETE_WORKOUT);

  const paginatedWorkouts = data?.getWorkouts?.results || [];
  const totalItems = data?.getWorkouts?.total || 0;

  useEffect(() => {
    setCookie("lastPage", "dashboard");
  }, []);

  useEffect(() => {
    const onUpdate = () => refetch();
    window.addEventListener("fittrack:workouts-changed", onUpdate);
    return () => window.removeEventListener("fittrack:workouts-changed", onUpdate);
  }, [refetch]);

  useEffect(() => {
    if (inView && paginatedWorkouts.length < totalItems && !loading) {
      fetchMore({ variables: { offset: paginatedWorkouts.length, limit: PAGE_SIZE } });
    }
  }, [inView, fetchMore, paginatedWorkouts.length, totalItems, loading]);

  const stats = useMemo(() => {
    let totalMinutes = 0;
    let completed = 0;
    paginatedWorkouts.forEach((w) => {
      totalMinutes += Number(w.duration) || 0;
      if (w.status === "Completed") completed += 1;
    });
    return {
      totalMinutes,
      completionRate:
        paginatedWorkouts.length > 0
          ? Math.round((completed / paginatedWorkouts.length) * 100)
          : 0,
    };
  }, [paginatedWorkouts]);

  async function handleDeleteWorkout(id) {
    if (!window.confirm("Delete this workout?")) return;
    try {
      await deleteWorkout({ variables: { id } });
      window.dispatchEvent(new CustomEvent("fittrack:workouts-changed"));
      refetch();
    } catch (e) {
      console.error(e);
    }
  }

  function handleStartEdit(id) {
    navigate(`/workouts/${id}/edit`);
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="header-row">
          <div>
            <h1>Dashboard</h1>
            <p className="subtitle">Real-time stats and management</p>
          </div>

          <div className="top-actions">
            <Link to="/workouts/new" className="btn btn-primary">
              Add Workout
            </Link>
            <Link to="/bazinga" className="btn btn-secondary bazinga-dashboard-btn">
              Get Recommendation
            </Link>
            <Link to="/statistics" className="btn btn-secondary" style={{ marginLeft: "10px" }}>
              Statistics View
            </Link>
          </div>
        </div>

        <div className="dashboard-layout">
          <div className="dashboard-left">
            <StatsCards workouts={paginatedWorkouts} />

            <div className="premium-card">
              <div className="table-header">
                <h3>
                  Your Workouts ({paginatedWorkouts.length}
                  {totalItems > paginatedWorkouts.length ? ` / ${totalItems}` : ""})
                </h3>
                <div className="filter-sort-controls">
                  <div className="control-group">
                    <label>Filter by Type</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                      <option value="All">All Types</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Strength">Strength</option>
                      <option value="Flexibility">Flexibility</option>
                      <option value="Full Body">Full Body</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label>Sort Order</label>
                    <select
                      value={`${sortBy.field}-${sortBy.order}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split("-");
                        setSortBy({ field, order });
                      }}
                    >
                      <option value="date-desc">Newest first</option>
                      <option value="date-asc">Oldest first</option>
                      <option value="duration-desc">Longest duration</option>
                      <option value="duration-asc">Shortest duration</option>
                      <option value="name-asc">Name (A-Z)</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label>&nbsp;</label>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setAppliedFilterType(filterType);
                        setAppliedSortBy(sortBy);
                      }}
                      style={{ padding: "8px 16px", height: "38px" }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {loading && paginatedWorkouts.length === 0 ? (
                <p style={{ textAlign: "center", color: "#ff6a00" }}>Loading workouts...</p>
              ) : paginatedWorkouts.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888" }}>
                  No workouts yet. <Link to="/workouts/new">Add your first workout</Link>
                </p>
              ) : (
                <WorkoutTable
                  workouts={paginatedWorkouts}
                  onDelete={handleDeleteWorkout}
                  onEdit={handleStartEdit}
                  lastWorkoutElementRef={lastElementRef}
                />
              )}
              {loading && paginatedWorkouts.length > 0 && (
                <p style={{ textAlign: "center", marginTop: "10px", color: "#ff6a00" }}>
                  Loading more...
                </p>
              )}
            </div>
          </div>

          <div className="dashboard-right">
            <DashboardOverview workouts={paginatedWorkouts} />

            <div className="premium-card large-stat">
              <p>Total Time Invested</p>
              <h2>
                {stats.totalMinutes}
                <span className="small-unit"> minutes</span>
              </h2>
            </div>

            <div className="premium-card large-stat">
              <p>Completion Rate</p>
              <h2>
                {stats.completionRate}
                <span className="small-unit">%</span>
              </h2>
            </div>
          </div>
        </div>

        <Chat />
      </main>
    </>
  );
}
