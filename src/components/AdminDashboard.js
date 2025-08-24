import React, { useState } from "react";
import AdminUsers from "./AdminUsers";
import AdminStats from "./AdminStats";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [tab, setTab] = useState("users");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("is_admin");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button onClick={logout} className="text-sm border px-3 py-1 rounded">
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab("users")}
              className={`px-4 py-2 rounded ${tab === "users" ? "bg-gray-900 text-white" : "border"}`}
            >
              User Report
            </button>
            <button
              onClick={() => setTab("stats")}
              className={`px-4 py-2 rounded ${tab === "stats" ? "bg-gray-900 text-white" : "border"}`}
            >
              Usage Statistics
            </button>
          </div>

          {tab === "users" ? <AdminUsers /> : <AdminStats />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
