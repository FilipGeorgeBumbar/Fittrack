import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Navbar from "./Navbar";

import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn()
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false, logout: vi.fn(), user: null });
  });

  test("shows Sign In and Get Started Free on landing page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getAllByText("Sign In")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Get Started Free")[0]).toBeInTheDocument();
  });

  test("shows Sign Out on non-landing pages when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true, logout: vi.fn(), user: { role: { name: 'Normal User' } } });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getAllByText("Sign Out")[0]).toBeInTheDocument();
  });

  test("renders FitTrack brand text", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText("FitTrack")).toBeInTheDocument();
  });
});
