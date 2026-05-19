import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { fireConfetti } from "../utils/effects.js";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_WORKOUT } from "../graphql/mutations.js";
import { GET_WORKOUTS } from "../graphql/queries.js";

function getAllRecommendations(workouts) {
  const completedWorkouts = workouts.filter((w) => w.status === "Completed");
  const plannedWorkouts = workouts.filter((w) => w.status === "Planned");
  const suggestions = [];

  if (plannedWorkouts.length > 0) {
    suggestions.push({
      title: "Knock Out a Planned Session",
      duration: 40,
      intensity: "Medium",
      focus: "Consistency",
      reason: "You have planned workouts waiting. Consistency is the key to progress.",
      tips: ["Check your dashboard", "Commit to the next one", "Stay consistent"],
    });
  }

  if (completedWorkouts.length === 0) {
    suggestions.push({
      title: "Beginner Full Body Starter",
      duration: 45,
      intensity: "Medium",
      focus: "General Fitness",
      reason: "No completed workouts yet? A balanced full body session is the perfect starting point.",
      tips: ["Start with moderate intensity", "Focus on form", "Track your progress"],
    });
  }

  suggestions.push({
    title: "Recovery Swim or Walk",
    duration: 30,
    intensity: "Light",
    focus: "Recovery",
    reason: "Active recovery helps your muscles repair faster while keeping you moving.",
    tips: ["Relax and breathe", "Choose low impact", "Don't push hard"],
  });

  suggestions.push({
    title: "Lower Body Power",
    duration: 50,
    intensity: "High",
    focus: "Legs",
    reason: "Building strong legs increases overall metabolic rate and athletic power.",
    tips: ["Focus on squats and lunges", "Keep proper form", "Rest properly between sets"],
  });

  suggestions.push({
    title: "Cardio Endurance",
    duration: 35,
    intensity: "Medium",
    focus: "Endurance",
    reason: "A steady cardio session improves heart health and burns calories efficiently.",
    tips: ["Keep a steady pace", "Focus on breathing", "Stay hydrated"],
  });

  suggestions.push({
    title: "Upper Body Hypertrophy",
    duration: 45,
    intensity: "High",
    focus: "Upper Body",
    reason: "Time to build that upper body strength with a focused and intense routine.",
    tips: ["Control the eccentric", "Progressive overload", "Good protein intake"],
  });

  return suggestions.sort(() => Math.random() - 0.5);
}

export default function Bazinga() {
  const navigate = useNavigate();
  const [addWorkout] = useMutation(ADD_WORKOUT);

  const { data } = useQuery(GET_WORKOUTS, {
    variables: { offset: 0, limit: 500 },
    fetchPolicy: "cache-and-network",
  });

  const workouts = data?.getWorkouts?.results || [];
  const completed = workouts.filter((w) => w.status === "Completed").length;
  const planned = workouts.filter((w) => w.status === "Planned").length;

  const suggestionList = useMemo(() => getAllRecommendations(workouts), [workouts]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const recommendation = suggestionList[currentIndex];

  useEffect(() => {
    fireConfetti();
  }, [currentIndex]);

  function handleGenerate() {
    setCurrentIndex((prev) => (prev + 1) % suggestionList.length);
  }

  async function handleAddWorkout() {
    const focus = recommendation.focus;
    const type =
      focus === "Upper Body" || focus === "Legs"
        ? "Strength"
        : focus === "Endurance" || focus === "Recovery"
          ? "Cardio"
          : "Full Body";

    const newWorkout = {
      name: recommendation.title,
      date: new Date().toISOString().split("T")[0],
      duration: recommendation.duration,
      status: "Planned",
      notes: recommendation.reason,
      type,
    };

    try {
      await addWorkout({ variables: { workout: newWorkout } });
      window.dispatchEvent(new CustomEvent("fittrack:workouts-changed"));
      fireConfetti();
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to add recommendation", err);
      alert("Could not add workout.");
    }
  }

  return (
    <>
      <Navbar />

      <main className="page bazinga-page">
        <div className="bazinga-header">
          <span className="bazinga-badge">AI-POWERED BAZINGA FEATURE</span>
          <h1>Next Best Workout</h1>
          <p className="subtitle bazinga-subtitle">
            Recommendations based on your training history ({workouts.length} workouts)
          </p>
        </div>

        <div className="bazinga-summary-grid">
          <div className="bazinga-mini-card">
            <p>Completed</p>
            <h3>{completed}</h3>
          </div>
          <div className="bazinga-mini-card">
            <p>Planned</p>
            <h3>{planned}</h3>
          </div>
          <div className="bazinga-mini-card">
            <p>Total</p>
            <h3>{workouts.length}</h3>
          </div>
        </div>

        <div className="bazinga-actions">
          <button type="button" className="btn btn-primary bazinga-generate-btn" onClick={handleGenerate}>
            Generate Recommendation
          </button>
          <Link to="/dashboard" className="btn">
            Back to Dashboard
          </Link>
        </div>

        {recommendation && (
          <section className="bazinga-result-card" key={currentIndex}>
            <p className="bazinga-small-label">RECOMMENDED FOR YOU</p>
            <h2>{recommendation.title}</h2>
            <p className="bazinga-reason">{recommendation.reason}</p>

            <div className="bazinga-info-grid">
              <div className="bazinga-info-box">
                <span className="bazinga-info-title">Duration</span>
                <strong>{recommendation.duration} min</strong>
              </div>
              <div className="bazinga-info-box">
                <span className="bazinga-info-title">Intensity</span>
                <strong>{recommendation.intensity}</strong>
              </div>
              <div className="bazinga-info-box">
                <span className="bazinga-info-title">Focus</span>
                <strong>{recommendation.focus}</strong>
              </div>
            </div>

            <div className="bazinga-tips-box">
              <p className="bazinga-small-label">PRO TIPS</p>
              <ul>
                {recommendation.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="bazinga-card-actions">
              <button type="button" className="btn btn-primary bazinga-add-btn" onClick={handleAddWorkout}>
                Add This Workout
              </button>
              <button type="button" className="btn" onClick={handleGenerate}>
                New Suggestion
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
