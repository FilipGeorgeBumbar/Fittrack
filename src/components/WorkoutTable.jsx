import { Link } from "react-router-dom";

export default function WorkoutTable({ workouts, onDelete, onEdit, lastWorkoutElementRef }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case "Cardio": return "🏃";
      case "Strength": return "💪";
      case "Flexibility": return "🧘";
      case "Full Body": return "🏋️";
      default: return "⚙️";
    }
  };

  return (
    <div style={{ overflowY: 'auto', maxHeight: '400px' }} className="workout-table-container">
      <table className="workout-table" style={{ width: '100%' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <tr>
            <th>Workout Name</th>
            <th>Date</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {workouts.map((workout, index) => {
            const isLast = index === workouts.length - 1;
            return (
              <tr key={workout.id} ref={isLast ? lastWorkoutElementRef : null}>
                <td>
                  <span className="status-badge-icon">{getTypeIcon(workout.type)}</span>
                  {workout.name}
                </td>
                <td>{workout.date}</td>
                <td>{workout.duration} min</td>
                <td>
                  <span
                    className={
                      workout.status === "Completed"
                        ? "status-badge completed"
                        : "status-badge planned"
                    }
                  >
                    {workout.status}
                  </span>
                </td>
                <td className="actions">
                  <Link className="icon-btn" to={`/workouts/${workout.id}`} title="View">
                    👁
                  </Link>
                  <button className="icon-btn" onClick={() => onEdit(workout.id)} title="Edit">
                    ✎
                  </button>
                  <button
                    className="icon-btn danger-text"
                    onClick={() => onDelete(workout.id)}
                    title="Delete"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}