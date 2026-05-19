import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, test, expect } from "vitest";
import Landing from "./Landing";

describe("Landing page", () => {
  test("renders main title", () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    expect(screen.getByText(/Track Your/i)).toBeInTheDocument();
    expect(screen.getByText(/Fitness Journey/i)).toBeInTheDocument();
  });

  test("renders main buttons", () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );

    expect(screen.getByText(/Start Tracking Now/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThan(0);
  });
});