import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import Navbar from "../components/Navbar.jsx";
import WorkoutForm from "../components/WorkoutForm.jsx";
import { GET_WORKOUT_BY_ID } from "../graphql/queries.js";
import { ADD_WORKOUT, UPDATE_WORKOUT, ADD_EXERCISE } from "../graphql/mutations.js";
import { fireConfetti } from "../utils/effects.js";

function workoutToFormData(workout) {
  if (!workout) return null;
  const exerciseNames = (workout.exercises || []).map((e) =>
    typeof e === "string" ? e : e.name
  );
  return {
    name: workout.name,
    type: workout.type || "Strength",
    date: workout.date,
    duration: workout.duration,
    status: workout.status,
    notes: workout.notes || "",
    exercises: exerciseNames.join(", "),
  };
}

async function syncExercises(addExercise, workoutId, exerciseNames) {
  for (const name of exerciseNames) {
    await addExercise({
      variables: { workoutId, exercise: { name, sets: 3, reps: 10 } },
    });
  }
}

export default function WorkoutFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const { data, loading, error } = useQuery(GET_WORKOUT_BY_ID, {
    skip: !isEdit || !id,
    variables: { id },
  });

  const [addWorkout] = useMutation(ADD_WORKOUT);
  const [updateWorkout] = useMutation(UPDATE_WORKOUT);
  const [addExercise] = useMutation(ADD_EXERCISE);

  const workout = data?.getWorkoutById;

  async function handleSubmit(formData) {
    const payload = {
      name: formData.name,
      type: formData.type || "Strength",
      date: formData.date || new Date().toISOString().split("T")[0],
      duration: Number(formData.duration) || 0,
      status: formData.status || "Planned",
      notes: formData.notes || "",
    };

    const exerciseNames = Array.isArray(formData.exercises)
      ? formData.exercises
      : [];

    try {
      if (isEdit && id) {
        await updateWorkout({ variables: { id, workout: payload } });
      } else {
        const { data: created } = await addWorkout({ variables: { workout: payload } });
        const workoutId = created?.addWorkout?.id;
        if (workoutId && exerciseNames.length > 0) {
          await syncExercises(addExercise, workoutId, exerciseNames);
        }
        fireConfetti();
      }
      window.dispatchEvent(new CustomEvent("fittrack:workouts-changed"));
      navigate("/dashboard");
    } catch (err) {
      console.error("Save workout failed:", err);
      alert("Could not save workout. Please try again.");
    }
  }

  if (isEdit && loading) {
    return (
      <>
        <Navbar />
        <main className="page">
          <p>Loading workout...</p>
        </main>
      </>
    );
  }

  if (isEdit && (error || !workout)) {
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

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="header-row" style={{ marginBottom: "24px" }}>
          <div>
            <h1>{isEdit ? "Edit Workout" : "Add Workout"}</h1>
            <p className="subtitle">
              {isEdit ? "Update your session details" : "Create a new training session"}
            </p>
          </div>
          <Link to="/dashboard" className="btn">
            ← Back to Dashboard
          </Link>
        </div>

        <WorkoutForm
          initialData={isEdit ? workoutToFormData(workout) : undefined}
          onSubmit={handleSubmit}
          buttonText={isEdit ? "Save Changes" : "Add Workout"}
          onCancel={() => navigate("/dashboard")}
        />
      </main>
    </>
  );
}
