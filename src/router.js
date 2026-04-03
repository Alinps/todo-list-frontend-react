import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import TasksPage from "./components/TasksPage";
import TaskListingPage from "./components/TaskListingPage";
import AboutUs from "./components/AboutUs";
import ProfilePage from "./components/ProfilePage";


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
            <TasksPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/about"
        element={
          <PrivateRoute>
            <AboutUs />
          </PrivateRoute>
        }
      />
      <Route
        path="/tasks/list"
        element={
          <PrivateRoute>
            <TaskListingPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
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
