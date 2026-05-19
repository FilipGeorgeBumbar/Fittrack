import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import StatusBars from "./StatusBars";

const workouts = [
  { id: 1, duration: 60, status: "Completed" },
  { id: 2, duration: 40, status: "Planned" },
  { id: 3, duration: 50, status: "Completed" },
  { id: 4, duration: 30, status: "Planned" }
];

describe("StatusBars", () => {
  test("renders both status sections", () => {
    render(<StatusBars workouts={workouts} />);

    expect(screen.getByText("Workouts by Status")).toBeInTheDocument();
    expect(screen.getByText("Status Distribution")).toBeInTheDocument();
  });

  test("displays correct counts in legend", () => {
    render(<StatusBars workouts={workouts} />);

    const completedLabels = screen.getAllByText("Completed");
    const plannedLabels = screen.getAllByText("Planned");

    expect(completedLabels.length).toBeGreaterThanOrEqual(2);
    expect(plannedLabels.length).toBeGreaterThanOrEqual(2);
  });

  test("displays correct completed count", () => {
    render(<StatusBars workouts={workouts} />);

    const twos = screen.getAllByText("2");
    expect(twos.length).toBeGreaterThanOrEqual(2);
  });

  test("renders with empty workouts", () => {
    render(<StatusBars workouts={[]} />);

    expect(screen.getByText("Workouts by Status")).toBeInTheDocument();
    expect(screen.getByText("Status Distribution")).toBeInTheDocument();
  });
});
