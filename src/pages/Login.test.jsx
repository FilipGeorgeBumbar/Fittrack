import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Login from "./Login";
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
    loginRequest: vi.fn(),
    persistSession: vi.fn(),
    clearSession: vi.fn(),
    getStoredToken: () => null,
    getStoredUser: () => null,
  };
});

import { loginRequest, persistSession } from "../services/auth.js";

function renderLogin(initialEntry = "/login") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders sign-in form", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  test("shows inactivity message when redirected with reason=idle", () => {
    renderLogin("/login?reason=idle");
    expect(screen.getByText(/signed out due to inactivity/i)).toBeInTheDocument();
  });

  test("shows error on failed login", async () => {
    loginRequest.mockResolvedValueOnce({
      ok: false,
      data: { error: "Invalid credentials." },
    });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "test@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test("stores session and navigates on successful login", async () => {
    loginRequest.mockResolvedValueOnce({
      ok: true,
      data: {
        token: "jwt-test-token",
        user: { id: "1", email: "test@email.com", role: { name: "Normal User" } },
      },
    });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "test@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(persistSession).toHaveBeenCalledWith({
        token: "jwt-test-token",
        user: expect.objectContaining({ email: "test@email.com" }),
      });
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});
