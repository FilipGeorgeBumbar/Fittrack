import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect } from "vitest";
import WorkoutTable from "./WorkoutTable";

const workouts = [
  { id: 1, name: "Push Day", date: "2026-03-10", duration: 60, status: "Completed" },
  { id: 2, name: "Leg Day", date: "2026-03-11", duration: 45, status: "Planned" }
];

describe("WorkoutTable", () => {
  test("renders table headers", () => {
    render(
      <MemoryRouter>
        <WorkoutTable workouts={workouts} onDelete={() => {}} onEdit={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText("Workout Name")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  test("renders workout rows", () => {
    render(
      <MemoryRouter>
        <WorkoutTable workouts={workouts} onDelete={() => {}} onEdit={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText("Push Day")).toBeInTheDocument();
    expect(screen.getByText("Leg Day")).toBeInTheDocument();
    expect(screen.getByText("60 min")).toBeInTheDocument();
    expect(screen.getByText("45 min")).toBeInTheDocument();
  });

  test("shows correct status badges", () => {
    render(
      <MemoryRouter>
        <WorkoutTable workouts={workouts} onDelete={() => {}} onEdit={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Planned")).toBeInTheDocument();
  });

  test("renders action buttons for each workout", () => {
    render(
      <MemoryRouter>
        <WorkoutTable workouts={workouts} onDelete={() => {}} onEdit={() => {}} />
      </MemoryRouter>
    );

    const viewButtons = screen.getAllByTitle("View");
    const editButtons = screen.getAllByTitle("Edit");
    const deleteButtons = screen.getAllByTitle("Delete");

    expect(viewButtons).toHaveLength(2);
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  test("renders empty table with no workouts", () => {
    render(
      <MemoryRouter>
        <WorkoutTable workouts={[]} onDelete={() => {}} onEdit={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText("Workout Name")).toBeInTheDocument();
    expect(screen.queryByRole("row")).not.toBeNull();
  });
});
