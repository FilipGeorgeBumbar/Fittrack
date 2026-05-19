import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import Navbar from "../components/Navbar.jsx";
import { GET_WORKOUT_BY_ID } from "../graphql/queries.js";
import { DELETE_WORKOUT } from "../graphql/mutations.js";

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_WORKOUT_BY_ID, {
    variables: { id },
  });

  const [deleteWorkout] = useMutation(DELETE_WORKOUT);

  const workout = data?.getWorkoutById;

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="page">
          <p>Loading workout...</p>
        </main>
      </>
    );
  }

  if (error || !workout) {
    return (
      <>
        <Navbar />
        <main className="page">
          <h2>Workout not found</h2>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </main>
      </>
    );
  }

  async function handleDelete() {
    if (!window.confirm("Delete this workout?")) return;
    try {
      await deleteWorkout({ variables: { id } });
      window.dispatchEvent(new CustomEvent("fittrack:workouts-changed"));
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Could not delete workout.");
    }
  }

  const exercises = workout.exercises || [];

  return (
    <>
      <Navbar />
      <main className="page detail-page-wrap">
        <div className="detail-card">
          <div className="header-row">
            <div>
              <h1>{workout.name}</h1>
              <p className="subtitle">
                {workout.type} • {workout.date} • {workout.duration} minutes
              </p>
            </div>

            <span
              className={
                workout.status === "Completed"
                  ? "status-badge completed"
                  : "status-badge planned"
              }
            >
              {workout.status}
            </span>
          </div>

          <div className="detail-actions">
            <Link to="/dashboard" className="btn">
              Back to Dashboard
            </Link>
            <Link to={`/workouts/${id}/edit`} className="btn btn-secondary">
              Edit
            </Link>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>

        <div className="detail-card">
          <h3>Exercises</h3>
          {exercises.length === 0 ? (
            <p style={{ color: "#888" }}>No exercises recorded.</p>
          ) : (
            <ul>
              {exercises.map((exercise) => (
                <li key={exercise.id}>
                  {exercise.name}
                  {(exercise.sets || exercise.reps) && (
                    <span style={{ color: "#888", marginLeft: "8px" }}>
                      — {exercise.sets ?? "-"} sets × {exercise.reps ?? "-"} reps
                      {exercise.weight ? ` @ ${exercise.weight}kg` : ""}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="detail-card">
          <h3>Notes</h3>
          <p>{workout.notes || "No notes."}</p>
        </div>
      </main>
    </>
  );
}
