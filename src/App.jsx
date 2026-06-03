import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { fireConfetti } from "./utils/effects.js";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WorkoutDetail from "./pages/WorkoutDetail.jsx";
import WorkoutFormPage from "./pages/WorkoutFormPage.jsx";
import Statistics from "./pages/Statistics.jsx";
import Bazinga from "./pages/Bazinga.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { getSocketUrl, getSocketOptions } from "./services/api.js";

export default function App() {
  useEffect(() => {
    const socket = io(getSocketUrl(), getSocketOptions());

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("new_workouts", () => {
      fireConfetti();
      window.dispatchEvent(new CustomEvent("fittrack:workouts-changed"));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workouts/new"
        element={
          <ProtectedRoute>
            <WorkoutFormPage mode="add" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workouts/:id/edit"
        element={
          <ProtectedRoute>
            <WorkoutFormPage mode="edit" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/workouts/:id"
        element={
          <ProtectedRoute>
            <WorkoutDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bazinga"
        element={
          <ProtectedRoute>
            <Bazinga />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
