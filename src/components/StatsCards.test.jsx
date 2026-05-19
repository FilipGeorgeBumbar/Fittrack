import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import StatsCards from "./StatsCards";

const workouts = [
  { id: 1, duration: 60, status: "Completed" },
  { id: 2, duration: 40, status: "Planned" },
  { id: 3, duration: 50, status: "Completed" }
];

describe("StatsCards", () => {
  test("shows correct statistics", () => {
    render(<StatsCards workouts={workouts} />);

    expect(screen.getByText(/Total Workouts/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    expect(screen.getByText(/Planned/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Duration/i)).toBeInTheDocument();
  });

  test("shows correct total count", () => {
    render(<StatsCards workouts={workouts} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("shows correct completed count", () => {
    render(<StatsCards workouts={workouts} />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("shows correct planned count", () => {
    render(<StatsCards workouts={workouts} />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("calculates correct average duration", () => {
    render(<StatsCards workouts={workouts} />);

    expect(screen.getByText("50")).toBeInTheDocument();
  });

  test("handles empty workouts with zero average", () => {
    render(<StatsCards workouts={[]} />);

    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });
});