export default function StatsCards({ workouts }) {
  const total = workouts.length;
  const completed = workouts.filter((w) => w.status === "Completed").length;
  const planned = workouts.filter((w) => w.status === "Planned").length;
  const avgDuration =
    total > 0
      ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / total)
      : 0;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <p>Total Workouts</p>
        <h2>{total}</h2>
      </div>

      <div className="stat-card">
        <p>Completed</p>
        <h2>{completed}</h2>
      </div>

      <div className="stat-card">
        <p>Planned</p>
        <h2>{planned}</h2>
      </div>

      <div className="stat-card">
        <p>Avg Duration</p>
        <h2>
          {avgDuration}
          <span className="small-unit"> min</span>
        </h2>
      </div>
    </div>
  );
}