import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import TaskList from "./components/TaskList";
import TasksPage from "./components/TasksPage";

import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

import PrivateRoute from "./utils/PrivateRoute";
import AdminRoute from "./utils/AdminRoute";

function Router() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* User auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User app */}
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <TaskList />
          </PrivateRoute>
        }
      />

      {/* Admin auth + app */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<h2 style={{padding: 24}}>404 - Page Not Found</h2>} />
    </Routes>
  );
}

export default Router;
