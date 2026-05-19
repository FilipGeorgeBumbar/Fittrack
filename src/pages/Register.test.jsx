import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Register from "./Register";
import { AuthProvider } from "../context/AuthContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../services/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    registerRequest: vi.fn(),
    persistSession: vi.fn(),
    clearSession: vi.fn(),
    getStoredToken: () => null,
    getStoredUser: () => null,
  };
});

import { registerRequest, persistSession } from "../services/auth.js";

function renderRegister() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Register page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders registration form", () => {
    renderRegister();
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  test("shows error when passwords do not match", async () => {
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("name@example.com"), {
      target: { value: "new@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "abc123" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm"), { target: { value: "different" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(registerRequest).not.toHaveBeenCalled();
  });

  test("registers and navigates on success", async () => {
    registerRequest.mockResolvedValueOnce({
      ok: true,
      data: {
        token: "jwt-new-user",
        user: { id: "2", email: "new@email.com", role: { name: "Normal User" } },
      },
    });

    renderRegister();
    fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "New User" } });
    fireEvent.change(screen.getByPlaceholderText("name@example.com"), {
      target: { value: "new@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "abc123" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm"), { target: { value: "abc123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(registerRequest).toHaveBeenCalledWith({
        name: "New User",
        email: "new@email.com",
        password: "abc123",
        roleName: "Normal User",
      });
      expect(persistSession).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});
