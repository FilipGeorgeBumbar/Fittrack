import { useState } from "react";

export default function WorkoutForm({ onSubmit, initialData, buttonText, onCancel }) {
  const [form, setForm] = useState(
    initialData || {
      name: "",
      type: "Strength",
      date: "",
      duration: "",
      status: "Planned",
      exercises: "",
      notes: ""
    }
  );

  const [errors, setErrors] = useState({});

  function validate() {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Workout name is required";
    } else if (form.name.trim().length < 3) {
      newErrors.name = "Workout name must have at least 3 characters";
    }

    if (!form.date) {
      newErrors.date = "Date is required";
    }

    if (!form.duration || Number(form.duration) <= 0) {
      newErrors.duration = "Duration must be greater than 0";
    } else if (Number(form.duration) > 300) {
      newErrors.duration = "Duration must be at most 300 minutes";
    }

    if (
      typeof form.exercises === "string" &&
      form.exercises.length > 0 &&
      !form.exercises.trim()
    ) {
      newErrors.exercises = "Exercises field cannot contain only spaces";
    }

    if (form.notes && form.notes.length > 300) {
      newErrors.notes = "Notes must have at most 300 characters";
    }

    return newErrors;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const preparedData = {
      ...form,
      type: form.type || "Strength",
      duration: Number(form.duration),
      exercises:
        typeof form.exercises === "string"
          ? form.exercises.split(",").map((x) => x.trim()).filter(Boolean)
          : form.exercises
    };

    onSubmit(preparedData);
  }

  return (
    <form className="form-card centered-form" onSubmit={handleSubmit}>
      <h2>{buttonText === "Save Changes" ? "Edit Workout" : "Add New Workout"}</h2>

      <div className="form-grid">
        <div>
          <label htmlFor="name">Workout Name *</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
          {errors.date && <p className="error">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="duration">Duration (minutes) *</label>
          <input
            id="duration"
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
          />
          {errors.duration && <p className="error">{errors.duration}</p>}
        </div>

        <div>
          <label htmlFor="type">Type *</label>
          <select id="type" name="type" value={form.type} onChange={handleChange}>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
            <option value="Flexibility">Flexibility</option>
            <option value="Full Body">Full Body</option>
          </select>
        </div>

        <div>
          <label htmlFor="status">Status *</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Planned">Planned</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <label htmlFor="exercises">Exercises (comma separated)</label>
      <input
        id="exercises"
        name="exercises"
        value={Array.isArray(form.exercises) ? form.exercises.join(", ") : form.exercises}
        onChange={handleChange}
        placeholder="Bench Press, Pull-ups, Shoulder Press"
      />
      {errors.exercises && <p className="error">{errors.exercises}</p>}

      <label htmlFor="notes">Notes</label>
      <textarea
        id="notes"
        name="notes"
        value={form.notes}
        onChange={handleChange}
      />
      {errors.notes && <p className="error">{errors.notes}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {buttonText}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}