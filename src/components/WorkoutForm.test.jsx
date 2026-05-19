import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import WorkoutForm from "./WorkoutForm";

describe("WorkoutForm", () => {
  test("shows validation errors when required fields are empty", () => {
    render(<WorkoutForm onSubmit={() => {}} buttonText="Add Workout" />);

    fireEvent.click(screen.getByRole("button", { name: /Add Workout/i }));

    expect(screen.getByText(/Workout name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration must be greater than 0/i)).toBeInTheDocument();
  });

  test("submits valid data", () => {
    const mockSubmit = vi.fn();

    render(<WorkoutForm onSubmit={mockSubmit} buttonText="Add Workout" />);

    fireEvent.change(screen.getByLabelText(/Workout Name/i), {
      target: { value: "Leg Day" }
    });

    fireEvent.change(screen.getByLabelText(/Date/i), {
      target: { value: "2026-03-20" }
    });

    fireEvent.change(screen.getByLabelText(/Duration/i), {
      target: { value: "50" }
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Workout/i }));

    expect(mockSubmit).toHaveBeenCalled();
  });

  test("shows error when workout name is too short", () => {
    render(<WorkoutForm onSubmit={() => {}} buttonText="Add Workout" />);

    fireEvent.change(screen.getByLabelText(/Workout Name/i), {
      target: { value: "Ab" }
    });

    fireEvent.change(screen.getByLabelText(/Date/i), {
      target: { value: "2026-03-20" }
    });

    fireEvent.change(screen.getByLabelText(/Duration/i), {
      target: { value: "30" }
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Workout/i }));

    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
  });

  test("shows error when duration exceeds 300 minutes", () => {
    render(<WorkoutForm onSubmit={() => {}} buttonText="Add Workout" />);

    fireEvent.change(screen.getByLabelText(/Workout Name/i), {
      target: { value: "Marathon Training" }
    });

    fireEvent.change(screen.getByLabelText(/Date/i), {
      target: { value: "2026-03-20" }
    });

    fireEvent.change(screen.getByLabelText(/Duration/i), {
      target: { value: "350" }
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Workout/i }));

    expect(screen.getByText(/at most 300 minutes/i)).toBeInTheDocument();
  });

  test("shows error when exercises field is only spaces", () => {
    render(<WorkoutForm onSubmit={() => {}} buttonText="Add Workout" />);

    fireEvent.change(screen.getByLabelText(/Workout Name/i), {
      target: { value: "Chest Day" }
    });

    fireEvent.change(screen.getByLabelText(/Date/i), {
      target: { value: "2026-03-20" }
    });

    fireEvent.change(screen.getByLabelText(/Duration/i), {
      target: { value: "45" }
    });

    fireEvent.change(screen.getByLabelText(/Exercises/i), {
      target: { value: "   " }
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Workout/i }));

    expect(screen.getByText(/cannot contain only spaces/i)).toBeInTheDocument();
  });

  test("shows error when notes exceed 300 characters", () => {
    render(<WorkoutForm onSubmit={() => {}} buttonText="Add Workout" />);

    fireEvent.change(screen.getByLabelText(/Workout Name/i), {
      target: { value: "Full Body" }
    });

    fireEvent.change(screen.getByLabelText(/Date/i), {
      target: { value: "2026-03-20" }
    });

    fireEvent.change(screen.getByLabelText(/Duration/i), {
      target: { value: "60" }
    });

    fireEvent.change(screen.getByLabelText(/Notes/i), {
      target: { value: "x".repeat(301) }
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Workout/i }));

    expect(screen.getByText(/at most 300 characters/i)).toBeInTheDocument();
  });

  test("renders Edit Workout title when buttonText is Save Changes", () => {
    const initialData = {
      name: "Push Day",
      date: "2026-03-15",
      duration: "60",
      status: "Completed",
      exercises: ["Bench Press", "Shoulder Press"],
      notes: "Good session"
    };

    render(
      <WorkoutForm
        onSubmit={() => {}}
        initialData={initialData}
        buttonText="Save Changes"
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("Edit Workout")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Push Day")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Bench Press, Shoulder Press")).toBeInTheDocument();
  });

  test("calls onCancel when cancel button is clicked", () => {
    const mockCancel = vi.fn();

    render(
      <WorkoutForm onSubmit={() => {}} buttonText="Add Workout" onCancel={mockCancel} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockCancel).toHaveBeenCalled();
  });

  test("does not show cancel button when onCancel is not provided", () => {
    render(<WorkoutForm onSubmit={() => {}} buttonText="Add Workout" />);

    expect(screen.queryByText(/Cancel/i)).not.toBeInTheDocument();
  });

  test("handles status change", () => {
    render(<WorkoutForm onSubmit={() => {}} buttonText="Add Workout" />);

    const statusSelect = screen.getByLabelText(/Status/i);
    fireEvent.change(statusSelect, { target: { value: "Completed" } });

    expect(statusSelect.value).toBe("Completed");
  });
});