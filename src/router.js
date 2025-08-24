import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import PrivateRoute from "./utils/PrivateRoute";
import TasksPage from "./components/TasksPage"; // new: original App "dashboard" moved here

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <TasksPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '2rem' }}>404 - Page Not Found</h2>} />
    </Routes>
  );
}

export default Router;
