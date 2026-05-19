export default function StatusBars({ workouts }) {
  const total = workouts.length || 1;
  const completed = workouts.filter((w) => w.status === "Completed").length;
  const planned = workouts.filter((w) => w.status === "Planned").length;

  const completedPercent = Math.round((completed / total) * 100);
  const plannedPercent = Math.round((planned / total) * 100);

  return (
    <div className="stats-sections">
      <div className="stats-box">
        <h3>Workouts by Status</h3>

        <div className="bar-group">
          <div className="bar-label-row">
            <span>Completed</span>
            <span>{completed}</span>
          </div>
          <div className="bar-bg">
            <div className="bar-fill completed-fill" style={{ width: `${completedPercent}%` }} />
          </div>
        </div>

        <div className="bar-group">
          <div className="bar-label-row">
            <span>Planned</span>
            <span>{planned}</span>
          </div>
          <div className="bar-bg">
            <div className="bar-fill planned-fill" style={{ width: `${plannedPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="stats-box">
        <h3>Status Distribution</h3>

        <div className="distribution-bar">
          <div
            className="distribution-completed"
            style={{ width: `${completedPercent}%` }}
          >
            {completedPercent}%
          </div>
          <div
            className="distribution-planned"
            style={{ width: `${plannedPercent}%` }}
          >
            {plannedPercent}%
          </div>
        </div>

        <div className="legend">
          <div className="legend-row">
            <span className="legend-dot completed-fill"></span>
            <span>Completed</span>
            <span>{completed}</span>
          </div>

          <div className="legend-row">
            <span className="legend-dot planned-fill"></span>
            <span>Planned</span>
            <span>{planned}</span>
          </div>
        </div>
      </div>
    </div>
  );
}